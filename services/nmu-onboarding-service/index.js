/**
 * @file NMU Onboarding Service
 * @description A dedicated gateway for registering NMU students, validating their status,
 * and integrating them into the Azora OS ecosystem.
 */

const express = require('express');
const cors = require('cors');
const redis = require('redis');
const bodyParser = require('body-parser');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 4400;
const REDIS_URL = process.env.REDIS_URL || 'redis://redis:6379';
const DATABASE_URL = process.env.DATABASE_URL || 'postgres://azora:password@postgres:5432/azora_db';
const EVENT_CHANNEL = 'azora:events';

const pool = new Pool({ connectionString: DATABASE_URL });
const logger = {
    info: (message, context = {}) => console.log(JSON.stringify({ level: 'info', service: 'nmu-onboarding', message, ...context })),
    error: (message, context = {}) => console.error(JSON.stringify({ level: 'error', service: 'nmu-onboarding', message, ...context })),
};

let redisPublisher;

/**
 * Validates a student number.
 * In a real scenario, this would check against a university database.
 * Here, we use a simple format check (e.g., starts with 's' and is 10 chars long).
 * @param {string} studentNumber
 * @returns {boolean}
 */
function isValidStudentNumber(studentNumber) {
    return typeof studentNumber === 'string' && studentNumber.toLowerCase().startsWith('s') && studentNumber.length === 10;
}

/**
 * Validates NMU student email format.
 * @param {string} email 
 * @returns {boolean}
 */
const isValidNMUEmail = (email) => {
    const emailRegex = /^s\d{9}@mandela\.ac\.za$/;
    return emailRegex.test(email);
};

// API Endpoint for student registration
app.post('/api/register', async (req, res) => {
    const { name, studentNumber, email, consentGiven } = req.body;

    if (!name || !studentNumber || !email || consentGiven !== true) {
        return res.status(400).json({ error: 'Missing required fields or consent not given.' });
    }

    if (!isValidStudentNumber(studentNumber)) {
        return res.status(400).json({ error: 'Invalid student number format.' });
    }

    if (!isValidNMUEmail(email, studentNumber)) {
        return res.status(400).json({ error: 'Invalid NMU student email. Must start with "s" and end with "@mandela.ac.za".' });
    }

    try {
        // Check if student is already registered
        const existingStudent = await pool.query('SELECT id FROM nmu_students WHERE student_number = $1 OR email = $2', [studentNumber, email]);
        if (existingStudent.rows.length > 0) {
            return res.status(409).json({ error: 'Student already registered.' });
        }

        // Add student to our database
        const result = await pool.query(
            'INSERT INTO nmu_students(name, student_number, email, consent_given, registered_at) VALUES($1, $2, $3, $4, NOW()) RETURNING id, student_number',
            [name, studentNumber, email, consentGiven]
        );
        const newStudent = result.rows[0];
        logger.info('New NMU student registered', { studentId: newStudent.id });

        // Publish an event to notify the entire Azora OS
        const event = {
            type: 'NMU_STUDENT_REGISTERED',
            payload: {
                id: newStudent.id,
                studentNumber: newStudent.student_number,
                email,
                consentGiven,
                timestamp: new Date().toISOString(),
            },
            metadata: {
                source: 'nmu-onboarding-service',
            }
        };
        await redisPublisher.publish(EVENT_CHANNEL, JSON.stringify(event));
        logger.info('Published NMU_STUDENT_REGISTERED event', { studentId: newStudent.id });

        // Trigger AZR minting for the new student (welcome bonus)
        try {
            const axios = require('axios'); // Assuming axios is added to package.json
            await axios.post('http://sovereign-minter:4000/mint', {
                to: newStudent.student_number, // Use student number as wallet ID
                amount: 100, // Mint 100 AZR as starting balance
                reason: 'NMU student onboarding bonus'
            });
            logger.info('AZR minted for new student', { studentId: newStudent.id, amount: 100 });
        } catch (mintErr) {
            logger.error('Failed to mint AZR for student', { error: mintErr.message });
        }

        res.status(201).json({
            message: 'Registration successful. Welcome to Azora. You have earned 100 AZR!',
            studentId: newStudent.id,
        });

    } catch (err) {
        logger.error('Registration failed', { error: err.message });
        res.status(500).json({ error: 'Internal server error during registration.' });
    }
});

app.get('/api/health', (req, res) => res.status(200).json({ status: 'online' }));

const startServer = async () => {
    try {
        // Connect to Redis as a publisher
        redisPublisher = redis.createClient({ url: REDIS_URL });
        redisPublisher.on('error', (err) => logger.error('Redis Publisher Error', { error: err }));
        await redisPublisher.connect();

        // Ensure DB table exists
        await pool.query(`
            CREATE TABLE IF NOT EXISTS nmu_students (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                student_number VARCHAR(20) UNIQUE NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                consent_given BOOLEAN NOT NULL,
                registered_at TIMESTAMPTZ DEFAULT NOW()
            );
        `);
        logger.info('Database table for NMU students is ready.');

        app.listen(PORT, () => {
            logger.info(`NMU Onboarding Service running on port ${PORT}`);
        });
    } catch (err) {
        logger.error('Failed to start service', { error: err.message });
        process.exit(1);
    }
};

startServer();