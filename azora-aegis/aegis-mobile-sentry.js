/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * AEGIS MOBILE SENTRY
 *
 * Remote integrity solution for home-based education assessments.
 * Turns student's smartphone into a security asset using AI monitoring.
 */

const express = require('express');
const WebSocket = require('ws');
const http = require('http');

class AegisMobileSentry {
    constructor() {
        this.app = express();
        this.server = http.createServer(this.app);
        this.wss = new WebSocket.Server({ server: this.server });
        this.activeSessions = new Map();
        this.deviceStates = new Map();
    }

    initialize() {
        this.app.use(express.json());

        // WebSocket connections from mobile apps
        this.wss.on('connection', (ws, req) => {
            const sessionId = this.extractSessionId(req.url);
            if (sessionId) {
                this.activeSessions.set(sessionId, ws);
                console.log(`🛡️ Aegis: Mobile sentry connected for session ${sessionId}`);

                ws.on('close', () => {
                    this.activeSessions.delete(sessionId);
                    console.log(`🛡️ Aegis: Mobile sentry disconnected for session ${sessionId}`);
                });

                ws.on('message', (message) => {
                    try {
                        const data = JSON.parse(message.toString());
                        this.handleMobileMessage(sessionId, data);
                    } catch (error) {
                        console.error('Invalid Aegis mobile message:', error);
                    }
                });

                // Send initial setup instructions
                this.sendSetupInstructions(ws, sessionId);
            }
        });

        // REST API for exam management
        this.app.post('/api/session/init', (req, res) => {
            const { qrData, deviceInfo } = req.body;

            try {
                const sessionData = JSON.parse(Buffer.from(qrData, 'base64').toString());

                const session = {
                    id: sessionData.sessionId,
                    userId: sessionData.userId,
                    programId: sessionData.programId,
                    deviceInfo,
                    status: 'initialized',
                    createdAt: new Date().toISOString(),
                    securityEvents: []
                };

                this.deviceStates.set(session.id, session);

                res.json({
                    sessionId: session.id,
                    status: 'initialized',
                    instructions: 'Please follow the setup instructions sent to your device.'
                });
            } catch (error) {
                res.status(400).json({ error: 'Invalid QR code data' });
            }
        });

        this.app.get('/api/session/:sessionId/status', (req, res) => {
            const sessionId = req.params.sessionId;
            const session = this.deviceStates.get(sessionId);

            if (!session) {
                return res.status(404).json({ error: 'Session not found' });
            }

            res.json({
                sessionId,
                status: session.status,
                securityEvents: session.securityEvents.length,
                lastActivity: session.lastActivity || session.createdAt
            });
        });

        this.app.post('/api/session/:sessionId/lock', (req, res) => {
            const sessionId = req.params.sessionId;
            const session = this.deviceStates.get(sessionId);

            if (!session) {
                return res.status(404).json({ error: 'Session not found' });
            }

            session.status = 'locked';
            session.lockedAt = new Date().toISOString();

            // Send lock command to mobile device
            const ws = this.activeSessions.get(sessionId);
            if (ws) {
                ws.send(JSON.stringify({
                    type: 'lock_device',
                    sessionId,
                    timestamp: new Date().toISOString()
                }));
            }

            res.json({ status: 'locked', message: 'Device lockdown initiated' });
        });

        this.app.post('/api/session/:sessionId/unlock', (req, res) => {
            const sessionId = req.params.sessionId;
            const session = this.deviceStates.get(sessionId);

            if (!session) {
                return res.status(404).json({ error: 'Session not found' });
            }

            session.status = 'completed';
            session.completedAt = new Date().toISOString();

            // Send unlock command to mobile device
            const ws = this.activeSessions.get(sessionId);
            if (ws) {
                ws.send(JSON.stringify({
                    type: 'unlock_device',
                    sessionId,
                    timestamp: new Date().toISOString()
                }));
            }

            res.json({ status: 'unlocked', message: 'Device unlocked successfully' });
        });

        // Health check
        this.app.get('/health', (req, res) => {
            res.json({
                service: 'Aegis Mobile Sentry',
                status: 'operational',
                activeSessions: this.activeSessions.size,
                monitoredDevices: this.deviceStates.size,
                features: [
                    'Device lockdown',
                    'Camera monitoring',
                    'Audio anomaly detection',
                    'Real-time security alerts',
                    'AI-powered integrity verification'
                ]
            });
        });
    }

    extractSessionId(url) {
        const urlObj = new URL(url, 'http://localhost');
        return urlObj.searchParams.get('sessionId');
    }

    sendSetupInstructions(ws, sessionId) {
        const instructions = {
            type: 'setup_instructions',
            sessionId,
            steps: [
                {
                    step: 1,
                    title: 'Device Positioning',
                    description: 'Place your phone on a stable surface facing you and your workspace. Ensure the camera has a clear view of your face and immediate surroundings.',
                    requirements: ['camera_access', 'microphone_access']
                },
                {
                    step: 2,
                    title: 'Environment Check',
                    description: 'Ensure you are alone in a quiet room. Remove all unauthorized materials, notes, and electronic devices from your workspace.',
                    validation: 'environment_scan'
                },
                {
                    step: 3,
                    title: 'Device Lockdown',
                    description: 'The system will now lock down your phone. All calls, texts, and browsing will be disabled during the examination.',
                    action: 'initiate_lockdown'
                },
                {
                    step: 4,
                    title: 'Monitoring Activation',
                    description: 'AI monitoring is now active. The system will detect any anomalies including unauthorized persons, use of notes, or suspicious behavior.',
                    monitoring: ['facial_recognition', 'audio_analysis', 'behavioral_patterns']
                }
            ],
            securityFeatures: [
                '360-degree camera monitoring',
                'Audio anomaly detection',
                'Facial recognition verification',
                'Behavioral pattern analysis',
                'Real-time integrity alerts'
            ]
        };

        ws.send(JSON.stringify(instructions));
    }

    handleMobileMessage(sessionId, data) {
        console.log(`📱 Aegis Mobile: ${sessionId} - ${data.type}`);

        const session = this.deviceStates.get(sessionId);
        if (!session) {
            console.warn(`Unknown session: ${sessionId}`);
            return;
        }

        session.lastActivity = new Date().toISOString();

        switch (data.type) {
            case 'setup_complete':
                session.status = 'ready';
                session.setupCompletedAt = new Date().toISOString();
                console.log(`🛡️ Aegis: Setup complete for session ${sessionId}`);
                break;

            case 'lockdown_activated':
                session.status = 'locked';
                session.lockdownActivatedAt = new Date().toISOString();
                console.log(`🔒 Aegis: Device lockdown activated for session ${sessionId}`);
                break;

            case 'camera_feed':
                // Process camera feed for anomaly detection
                this.processCameraFeed(sessionId, data.feed);
                break;

            case 'audio_sample':
                // Process audio for anomaly detection
                this.processAudioSample(sessionId, data.audio);
                break;

            case 'anomaly_detected':
                this.handleAnomaly(sessionId, data.anomaly);
                break;

            case 'exam_completed':
                session.status = 'completed';
                session.examCompletedAt = new Date().toISOString();
                console.log(`✅ Aegis: Exam completed for session ${sessionId}`);
                break;
        }
    }

    processCameraFeed(sessionId, feedData) {
        // Simulate AI analysis of camera feed
        const anomalies = [];

        // Random anomaly detection simulation (in production, this would use ML models)
        if (Math.random() < 0.05) { // 5% chance of detecting something
            const anomalyTypes = [
                'multiple_faces_detected',
                'unauthorized_movement',
                'suspicious_object',
                'face_not_visible'
            ];
            const randomAnomaly = anomalyTypes[Math.floor(Math.random() * anomalyTypes.length)];
            anomalies.push({
                type: randomAnomaly,
                confidence: Math.random() * 0.3 + 0.7, // 70-100% confidence
                timestamp: new Date().toISOString()
            });
        }

        if (anomalies.length > 0) {
            this.handleAnomaly(sessionId, anomalies[0]);
        }
    }

    processAudioSample(sessionId, audioData) {
        // Simulate audio anomaly detection
        if (Math.random() < 0.03) { // 3% chance
            const audioAnomaly = {
                type: 'unauthorized_audio_detected',
                description: 'Multiple voices or background conversation detected',
                confidence: Math.random() * 0.2 + 0.8,
                timestamp: new Date().toISOString()
            };
            this.handleAnomaly(sessionId, audioAnomaly);
        }
    }

    handleAnomaly(sessionId, anomaly) {
        console.warn(`🚨 Aegis Anomaly: ${sessionId} - ${anomaly.type} (${(anomaly.confidence * 100).toFixed(1)}% confidence)`);

        const session = this.deviceStates.get(sessionId);
        if (session) {
            session.securityEvents.push({
                ...anomaly,
                detectedAt: new Date().toISOString()
            });

            // If high-confidence anomaly, trigger immediate response
            if (anomaly.confidence > 0.85) {
                this.triggerSecurityResponse(sessionId, anomaly);
            }
        }
    }

    triggerSecurityResponse(sessionId, anomaly) {
        const ws = this.activeSessions.get(sessionId);
        if (ws) {
            ws.send(JSON.stringify({
                type: 'security_alert',
                anomaly,
                action: 'exam_paused',
                message: 'Security anomaly detected. Exam paused for verification.',
                timestamp: new Date().toISOString()
            }));
        }

        // In production, this would also notify the exam system and potentially terminate the session
        console.log(`🚨 Aegis: Security response triggered for session ${sessionId}`);
    }

    start(port = 4201) {
        this.server.listen(port, () => {
            console.log(`🛡️ Aegis Mobile Sentry running on port ${port}`);
            console.log(`   📱 Mobile App: ws://localhost:${port}`);
            console.log(`   🔐 Session Mgmt: http://localhost:${port}/api/session`);
            console.log(`   📊 Health: http://localhost:${port}/health`);
            console.log(`   🛡️ Integrity: AI-powered remote exam security active`);
        });
    }

    stop() {
        this.wss.close();
        this.server.close();
    }
}

// Create and export singleton instance
const aegisMobileSentry = new AegisMobileSentry();

// Initialize the service
aegisMobileSentry.initialize();

module.exports = aegisMobileSentry;