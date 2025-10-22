/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * @file Open Source Advancement Service
 * @description Facilitates and rewards open source code contributions in line with the Open Source Code Advancement Act.
 */

const express = require('express');
const cors = require('cors');
const redis = require('redis');
const bodyParser = require('body-parser');
const axios = require('axios');
const { initializeDatabase, pool } = require('./database');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 4500;
const REDIS_URL = process.env.REDIS_URL || 'redis://redis:6379';
const DATABASE_URL = process.env.DATABASE_URL || 'postgres://azora:password@postgres:5432/azora_db';
const EVENT_CHANNEL = 'azora:events';
const MINTER_URL = process.env.MINTER_URL || 'http://sovereign-minter:4000';
const logger = {
    info: (message, context = {}) => console.log(JSON.stringify({ level: 'info', service: 'open-source-advancement', message, ...context })),
    error: (message, context = {}) => console.error(JSON.stringify({ level: 'error', service: 'open-source-advancement', message, ...context })),
    warn: (message, context = {}) => console.warn(JSON.stringify({ level: 'warn', service: 'open-source-advancement', message, ...context })),
};

let redisPublisher;

/**
 * Submits a contribution and rewards if approved.
 */
app.post('/api/contribute', async (req, res) => {
    const { contributorId, repoUrl, description } = req.body;
    if (!contributorId || !repoUrl || !description) {
        return res.status(400).json({ error: 'Missing fields.' });
    }

    try {
        // Simplified audit: Check if repo is public (placeholder)
        const auditPassed = true; // In reality, integrate with GitHub API or similar

        if (auditPassed) {
            // Reward with AZR minting
            await axios.post(`${MINTER_URL}/mint`, {
                to: contributorId,
                amount: 10, // Reward 10 AZR for contribution
                reason: 'Open source contribution reward'
            });

            // Log to DB
            await pool.query(
                'INSERT INTO open_source_contributions(contributor_id, repo_url, description, rewarded_at) VALUES($1, $2, $3, NOW())',
                [contributorId, repoUrl, description]
            );

            logger.info('Contribution rewarded', { contributorId, repoUrl });
            res.status(200).json({ message: 'Contribution accepted and rewarded.' });
        } else {
            res.status(400).json({ error: 'Contribution failed audit.' });
        }
    } catch (err) {
        logger.error('Contribution processing failed', { error: err.message });
        res.status(500).json({ error: 'Internal error.' });
    }
});

app.get('/api/health', (req, res) => res.status(200).json({ status: 'online' }));

const startServer = async () => {
    try {
        // Initialize Redis (optional)
        try {
            redisPublisher = redis.createClient({ url: REDIS_URL });
            await redisPublisher.connect();
            redisPublisher.on('error', (err) => logger.error('Redis Publisher Error', { error: err }));
            logger.info('Redis connected successfully');
        } catch (redisErr) {
            logger.warn('Redis connection failed, continuing without Redis', { error: redisErr.message });
            redisPublisher = null;
        }

        // Initialize database tables
        await initializeDatabase();

        // Learning Platform APIs
        app.get('/api/courses', async (req, res) => {
            try {
                const result = await pool.query('SELECT * FROM courses ORDER BY created_at DESC');
                res.json(result);
            } catch (err) {
                logger.error('Failed to fetch courses', { error: err.message });
                res.status(500).json({ error: 'Failed to fetch courses' });
            }
        });

        app.get('/api/courses/:id', async (req, res) => {
            try {
                const { id } = req.params;
                const result = await pool.query('SELECT * FROM courses WHERE id = ?', [id]);
                if (result.length === 0) return res.status(404).json({ error: 'Course not found' });
                res.json(result[0]);
            } catch (err) {
                logger.error('Failed to fetch course', { error: err.message });
                res.status(500).json({ error: 'Failed to fetch course' });
            }
        });

        app.get('/api/courses/:courseId/modules', async (req, res) => {
            try {
                const { courseId } = req.params;
                const result = await pool.query('SELECT * FROM modules WHERE course_id = ? ORDER BY order_index', [courseId]);
                res.json(result);
            } catch (err) {
                logger.error('Failed to fetch modules', { error: err.message });
                res.status(500).json({ error: 'Failed to fetch modules' });
            }
        });

        app.get('/api/modules/:moduleId/lessons', async (req, res) => {
            try {
                const { moduleId } = req.params;
                const result = await pool.query('SELECT * FROM lessons WHERE module_id = ? ORDER BY order_index', [moduleId]);
                res.json(result);
            } catch (err) {
                logger.error('Failed to fetch lessons', { error: err.message });
                res.status(500).json({ error: 'Failed to fetch lessons' });
            }
        });

        app.get('/api/lessons/:lessonId/quizzes', async (req, res) => {
            try {
                const { lessonId } = req.params;
                const result = await pool.query('SELECT * FROM quizzes WHERE lesson_id = ?', [lessonId]);
                res.json(result);
            } catch (err) {
                logger.error('Failed to fetch quizzes', { error: err.message });
                res.status(500).json({ error: 'Failed to fetch quizzes' });
            }
        });

        app.post('/api/enroll', async (req, res) => {
            const { userId, courseId } = req.body;
            try {
                await pool.query('INSERT OR IGNORE INTO enrollments (user_id, course_id) VALUES (?, ?)', [userId, courseId]);
                res.json({ message: 'Enrolled successfully' });
            } catch (err) {
                logger.error('Failed to enroll', { error: err.message });
                res.status(500).json({ error: 'Failed to enroll' });
            }
        });

        app.post('/api/progress', async (req, res) => {
            const { userId, lessonId, completed, quizScore } = req.body;
            try {
                await pool.query(`
                    INSERT OR REPLACE INTO lesson_progress (user_id, lesson_id, completed, quiz_score, completed_at)
                    VALUES (?, ?, ?, ?, datetime('now'))
                `, [userId, lessonId, completed, quizScore]);

                // AZR minting logic
                if (completed) {
                    await axios.post(`${MINTER_URL}/mint`, {
                        to: userId,
                        amount: 0.1,
                        reason: 'Lesson completion'
                    });
                }
                if (quizScore && quizScore >= 80) {
                    await axios.post(`${MINTER_URL}/mint`, {
                        to: userId,
                        amount: 0.5,
                        reason: 'Quiz success'
                    });
                }

                res.json({ message: 'Progress updated' });
            } catch (err) {
                logger.error('Failed to update progress', { error: err.message });
                res.status(500).json({ error: 'Failed to update progress' });
            }
        });

        // AI Teacher Q&A
        app.post('/api/ai-teacher', async (req, res) => {
            const { question, lessonContent } = req.body;
            try {
                const response = await axios.post('http://azora-nexus:3000/api/ai-teacher', {
                    question,
                    lessonContent
                });
                res.json(response.data);
            } catch (err) {
                logger.error('AI Teacher failed', { error: err.message });
                res.status(500).json({ error: 'AI Teacher unavailable' });
            }
        });

        app.listen(PORT, () => {
            logger.info(`Azora Scriptorium Service running on port ${PORT}`);
        });
    } catch (err) {
        logger.error('Failed to start service', { error: err.message });
        // Don't exit in development, just log the error
        console.error('Service failed to start:', err);
    }
};

startServer();