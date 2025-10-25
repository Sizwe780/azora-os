/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * AZORA SAPIENS - EDUCATION PLATFORM
 *
 * Universal education platform with home-first approach.
 * Features CKQ (Core Knowledge Qualification) programs and Aegis Mobile Sentry.
 */

const express = require('express');
const WebSocket = require('ws');
const http = require('http');
const crypto = require('crypto');
const axios = require('axios');

class AzoraSapiens {
    constructor() {
        this.app = express();
        this.server = http.createServer(this.app);
        this.wss = new WebSocket.Server({ server: this.server });
        this.clients = new Map();
        this.activeExams = new Map();
        this.enrollments = new Map();
        this.ckqPrograms = this.initializeCKQPrograms();
        this.academicKnowledgeGraph = new Map();
        this.mintServiceUrl = process.env.MINT_SERVICE_URL || 'http://localhost:4300';
    }

    initializeCKQPrograms() {
        return {
            'solar-grid-technician': {
                id: 'solar-grid-technician',
                title: 'Solar Grid Technician (CKQ)',
                description: 'Complete qualification for solar energy system installation and maintenance',
                duration: '8 weeks',
                modules: [
                    'Photovoltaic Fundamentals',
                    'Electrical Safety Standards',
                    'Grid Integration Principles',
                    'Maintenance & Troubleshooting',
                    'Innovation Capstone: Smart Grid Optimization'
                ],
                assessment: {
                    type: 'practical_exam',
                    duration: 180, // minutes
                    requiresAegis: true
                },
                enrollmentFee: 0,
                status: 'live'
            },
            'hydroponic-farm-operator': {
                id: 'hydroponic-farm-operator',
                title: 'Hydroponic Farm Operator (CKQ)',
                description: 'Complete qualification for modern hydroponic farming operations',
                duration: '6 weeks',
                modules: [
                    'Hydroponic System Design',
                    'Nutrient Management',
                    'Climate Control Systems',
                    'Crop Optimization',
                    'Innovation Capstone: AI-Driven Yield Maximization'
                ],
                assessment: {
                    type: 'practical_exam',
                    duration: 150,
                    requiresAegis: true
                },
                enrollmentFee: 0,
                status: 'live'
            },
            'smart-contract-auditing': {
                id: 'smart-contract-auditing',
                title: 'Smart Contract Auditing (CKQ)',
                description: 'Complete qualification for blockchain smart contract security auditing',
                duration: '10 weeks',
                modules: [
                    'Solidity Fundamentals',
                    'Vulnerability Assessment',
                    'Formal Verification Methods',
                    'DeFi Protocol Analysis',
                    'Innovation Capstone: Zero-Knowledge Proof Applications'
                ],
                assessment: {
                    type: 'code_audit_exam',
                    duration: 240,
                    requiresAegis: true
                },
                enrollmentFee: 0,
                status: 'live'
            },

            // Business & Advanced Programs
            'executive-mba': {
                id: 'executive-mba',
                title: 'Executive MBA (Advanced)',
                description: 'Elite business leadership program for senior executives and entrepreneurs',
                duration: '18 months',
                modules: [
                    'Strategic Leadership & Vision',
                    'Financial Strategy & Capital Markets',
                    'Digital Transformation & Innovation',
                    'Global Economics & Geopolitics',
                    'Organizational Design & Change Management',
                    'Entrepreneurial Finance & Venture Capital',
                    'Executive Communication & Negotiation',
                    'Ethics, Governance & Corporate Social Responsibility',
                    'Capstone: Strategic Business Transformation'
                ],
                assessment: {
                    type: 'executive_thesis',
                    duration: 480,
                    requiresAegis: true
                },
                enrollmentFee: 0,
                status: 'live',
                tier: 'advanced'
            },
            'quantitative-finance': {
                id: 'quantitative-finance',
                title: 'Quantitative Finance & Risk Management (Advanced)',
                description: 'Advanced mathematical finance for financial engineers and risk professionals',
                duration: '12 months',
                modules: [
                    'Stochastic Calculus & Financial Mathematics',
                    'Derivative Pricing Models',
                    'Risk Management & VaR Models',
                    'Algorithmic Trading Strategies',
                    'Machine Learning in Finance',
                    'Portfolio Optimization Theory',
                    'Credit Risk Modeling',
                    'Regulatory Compliance & Stress Testing',
                    'Capstone: Quantitative Trading System Development'
                ],
                assessment: {
                    type: 'quantitative_thesis',
                    duration: 360,
                    requiresAegis: true
                },
                enrollmentFee: 0,
                status: 'live',
                tier: 'advanced'
            },
            'executive-leadership': {
                id: 'executive-leadership',
                title: 'Executive Leadership & Governance (Advanced)',
                description: 'Advanced leadership development for C-suite executives and board members',
                duration: '15 months',
                modules: [
                    'Strategic Thinking & Decision Making',
                    'Board Governance & Stakeholder Management',
                    'Crisis Leadership & Resilience',
                    'Executive Presence & Communication',
                    'Talent Strategy & Organizational Culture',
                    'Mergers & Acquisitions Strategy',
                    'International Business Leadership',
                    'Ethical Leadership in Complex Environments',
                    'Capstone: Executive Leadership Simulation'
                ],
                assessment: {
                    type: 'leadership_case_study',
                    duration: 420,
                    requiresAegis: true
                },
                enrollmentFee: 0,
                status: 'live',
                tier: 'advanced'
            },
            'blockchain-economics': {
                id: 'blockchain-economics',
                title: 'Blockchain Economics & DeFi (Advanced)',
                description: 'Advanced study of decentralized finance and blockchain economic systems',
                duration: '10 months',
                modules: [
                    'Cryptoeconomic Theory & Token Design',
                    'Decentralized Finance Protocols',
                    'Blockchain Governance Models',
                    'Stablecoin Economics & Monetary Policy',
                    'Yield Farming & Liquidity Mining',
                    'Decentralized Autonomous Organizations',
                    'Regulatory Frameworks for DeFi',
                    'Blockchain Scalability & Interoperability',
                    'Capstone: DeFi Protocol Design & Implementation'
                ],
                assessment: {
                    type: 'defi_protocol_audit',
                    duration: 300,
                    requiresAegis: true
                },
                enrollmentFee: 0,
                status: 'live',
                tier: 'advanced'
            },
            'ai-business-strategy': {
                id: 'ai-business-strategy',
                title: 'AI Business Strategy & Implementation (Advanced)',
                description: 'Strategic implementation of AI technologies in business operations',
                duration: '14 months',
                modules: [
                    'AI Strategy & Business Model Innovation',
                    'Machine Learning for Business Analytics',
                    'AI Ethics & Responsible Implementation',
                    'Data Strategy & Governance',
                    'AI Product Development & Scaling',
                    'Automation & Process Optimization',
                    'AI-Driven Customer Experience',
                    'Change Management for AI Adoption',
                    'Capstone: AI Transformation Roadmap'
                ],
                assessment: {
                    type: 'ai_strategy_thesis',
                    duration: 390,
                    requiresAegis: true
                },
                enrollmentFee: 0,
                status: 'live',
                tier: 'advanced'
            },
            'venture-capital-investing': {
                id: 'venture-capital-investing',
                title: 'Venture Capital & Private Equity (Advanced)',
                description: 'Advanced investment strategies for venture capital and private equity professionals',
                duration: '16 months',
                modules: [
                    'Venture Capital Fundamentals & Deal Flow',
                    'Due Diligence & Investment Analysis',
                    'Term Sheet Negotiation & Deal Structure',
                    'Portfolio Management & Exit Strategies',
                    'Venture Capital Economics & IRR Analysis',
                    'Sector-Specific Investment Strategies',
                    'Impact Investing & ESG Considerations',
                    'Fundraising & Limited Partner Relations',
                    'Capstone: Venture Fund Launch & Management'
                ],
                assessment: {
                    type: 'investment_thesis',
                    duration: 450,
                    requiresAegis: true
                },
                enrollmentFee: 0,
                status: 'live',
                tier: 'advanced'
            },
            'digital-marketing-leadership': {
                id: 'digital-marketing-leadership',
                title: 'Digital Marketing Leadership (Advanced)',
                description: 'Advanced digital marketing strategy and leadership for CMOs and marketing executives',
                duration: '12 months',
                modules: [
                    'Digital Transformation Strategy',
                    'Customer Journey Mapping & Analytics',
                    'Content Strategy & Brand Storytelling',
                    'Performance Marketing & Attribution',
                    'Social Media Strategy & Influencer Marketing',
                    'SEO & Technical Marketing',
                    'Marketing Technology Stack & MarTech',
                    'Data-Driven Marketing Decisions',
                    'Capstone: Integrated Digital Marketing Campaign'
                ],
                assessment: {
                    type: 'marketing_strategy_case',
                    duration: 330,
                    requiresAegis: true
                },
                enrollmentFee: 0,
                status: 'live',
                tier: 'advanced'
            },
            'cybersecurity-leadership': {
                id: 'cybersecurity-leadership',
                title: 'Cybersecurity Leadership & Strategy (Advanced)',
                description: 'Executive-level cybersecurity strategy and risk management',
                duration: '13 months',
                modules: [
                    'Cybersecurity Strategy & Risk Management',
                    'Incident Response & Crisis Management',
                    'Regulatory Compliance & Standards',
                    'Zero Trust Architecture & Implementation',
                    'Cyber Insurance & Risk Transfer',
                    'Board-Level Cybersecurity Reporting',
                    'Supply Chain Security & Third-Party Risk',
                    'Cyber Workforce Development',
                    'Capstone: Enterprise Cybersecurity Program Design'
                ],
                assessment: {
                    type: 'cybersecurity_audit',
                    duration: 360,
                    requiresAegis: true
                },
                enrollmentFee: 0,
                status: 'live',
                tier: 'advanced'
            },
            'sustainable-business-leadership': {
                id: 'sustainable-business-leadership',
                title: 'Sustainable Business Leadership (Advanced)',
                description: 'Leadership in sustainable business practices and ESG implementation',
                duration: '15 months',
                modules: [
                    'ESG Strategy & Stakeholder Capitalism',
                    'Climate Change Risk & Opportunity',
                    'Sustainable Finance & Green Investing',
                    'Circular Economy Business Models',
                    'Diversity, Equity & Inclusion Leadership',
                    'Supply Chain Sustainability',
                    'Sustainable Innovation & Product Design',
                    'Reporting & Transparency Standards',
                    'Capstone: Sustainability Transformation Strategy'
                ],
                assessment: {
                    type: 'sustainability_thesis',
                    duration: 420,
                    requiresAegis: true
                },
                enrollmentFee: 0,
                status: 'live',
                tier: 'advanced'
            },
            'healthcare-administration': {
                id: 'healthcare-administration',
                title: 'Healthcare Administration & Innovation (Advanced)',
                description: 'Advanced healthcare management and digital health innovation',
                duration: '16 months',
                modules: [
                    'Healthcare Economics & Policy',
                    'Digital Health Technology Implementation',
                    'Healthcare Quality & Patient Safety',
                    'Healthcare Data Analytics & AI',
                    'Regulatory Compliance & HIPAA',
                    'Healthcare Finance & Reimbursement',
                    'Telemedicine & Virtual Care Models',
                    'Healthcare Innovation & Entrepreneurship',
                    'Capstone: Healthcare System Transformation'
                ],
                assessment: {
                    type: 'healthcare_strategy_case',
                    duration: 450,
                    requiresAegis: true
                },
                enrollmentFee: 0,
                status: 'live',
                tier: 'advanced'
            },
            'international-business-law': {
                id: 'international-business-law',
                title: 'International Business Law & Compliance (Advanced)',
                description: 'Advanced international business law and cross-border compliance',
                duration: '14 months',
                modules: [
                    'International Trade Law & WTO',
                    'Cross-Border Transactions & M&A',
                    'International Tax Planning & BEPS',
                    'Intellectual Property in Global Markets',
                    'International Arbitration & Dispute Resolution',
                    'Anti-Corruption & FCPA Compliance',
                    'Data Privacy & GDPR Implementation',
                    'International Contract Law',
                    'Capstone: Global Business Compliance Framework'
                ],
                assessment: {
                    type: 'legal_case_analysis',
                    duration: 390,
                    requiresAegis: true
                },
                enrollmentFee: 0,
                status: 'live',
                tier: 'advanced'
            }
        };
    }

    initialize() {
        this.app.use(express.json());

        // WebSocket connection handling for Aegis Mobile Sentry
        this.wss.on('connection', (ws, req) => {
            const clientId = this.extractClientId(req.url);
            if (clientId) {
                this.clients.set(clientId, ws);
                console.log(`📚 Sapiens: Aegis client ${clientId} connected`);

                ws.on('close', () => {
                    this.clients.delete(clientId);
                    console.log(`📚 Sapiens: Aegis client ${clientId} disconnected`);
                });

                ws.on('message', (message) => {
                    try {
                        const data = JSON.parse(message.toString());
                        this.handleAegisMessage(clientId, data);
                    } catch (error) {
                        console.error('Invalid Aegis message format:', error);
                    }
                });
            }
        });

        // REST API Routes
        this.app.get('/api/programs', (req, res) => {
            res.json({
                programs: Object.values(this.ckqPrograms),
                total: Object.keys(this.ckqPrograms).length,
                status: 'live'
            });
        });

        this.app.get('/api/programs/advanced', (req, res) => {
            const advancedPrograms = Object.values(this.ckqPrograms)
                .filter(program => program.tier === 'advanced');
            res.json({
                programs: advancedPrograms,
                total: advancedPrograms.length,
                status: 'live'
            });
        });

        this.app.get('/api/programs/business', (req, res) => {
            const businessPrograms = Object.values(this.ckqPrograms)
                .filter(program => program.tier === 'advanced' &&
                    (program.id.includes('mba') || program.id.includes('leadership') ||
                        program.id.includes('finance') || program.id.includes('business')));
            res.json({
                programs: businessPrograms,
                total: businessPrograms.length,
                status: 'live'
            });
        });

        this.app.post('/api/enroll', (req, res) => {
            const { userId, programId } = req.body;

            if (!userId || !programId) {
                return res.status(400).json({ error: 'Missing userId or programId' });
            }

            if (!this.ckqPrograms[programId]) {
                return res.status(404).json({ error: 'Program not found' });
            }

            const enrollment = {
                id: crypto.randomUUID(),
                userId,
                programId,
                enrolledAt: new Date().toISOString(),
                status: 'active',
                progress: {
                    completedModules: [],
                    currentModule: this.ckqPrograms[programId].modules[0],
                    overallProgress: 0
                }
            };

            if (!this.enrollments.has(userId)) {
                this.enrollments.set(userId, []);
            }
            this.enrollments.get(userId).push(enrollment);

            res.json({
                enrollment,
                message: 'Successfully enrolled in CKQ program',
                nextSteps: [
                    'Begin theoretical modules',
                    'Complete practice assessments',
                    'Schedule final Aegis-protected exam'
                ]
            });
        });

        this.app.get('/api/enrollments/:userId', (req, res) => {
            const userId = req.params.userId;
            const userEnrollments = this.enrollments.get(userId) || [];
            res.json({ enrollments: userEnrollments });
        });

        this.app.post('/api/exam/start', (req, res) => {
            const { userId, programId } = req.body;

            if (!userId || !programId) {
                return res.status(400).json({ error: 'Missing userId or programId' });
            }

            // Generate unique exam session
            const examSession = {
                id: crypto.randomUUID(),
                userId,
                programId,
                startTime: new Date().toISOString(),
                status: 'initializing',
                qrCode: this.generateExamQR(userId, programId),
                aegisStatus: 'pending'
            };

            this.activeExams.set(examSession.id, examSession);

            res.json({
                examSession,
                instructions: [
                    'Ensure you have the Aegis Sentry app installed on your smartphone',
                    'Place your phone on a stable surface facing you and your workspace',
                    'Scan the QR code with the Aegis app to begin monitoring',
                    'Do not leave your seat or use unauthorized materials'
                ]
            });
        });

        this.app.post('/api/exam/aegis-auth', (req, res) => {
            const { examId, deviceFingerprint } = req.body;

            const exam = this.activeExams.get(examId);
            if (!exam) {
                return res.status(404).json({ error: 'Exam session not found' });
            }

            // Simulate Aegis authentication
            exam.aegisStatus = 'authenticated';
            exam.deviceFingerprint = deviceFingerprint;
            exam.authTime = new Date().toISOString();

            // Notify connected Aegis client
            const aegisClient = this.clients.get(exam.userId);
            if (aegisClient) {
                aegisClient.send(JSON.stringify({
                    type: 'exam_start',
                    examId,
                    action: 'lock_device',
                    requirements: {
                        camera: true,
                        microphone: true,
                        lockdown: true
                    }
                }));
            }

            res.json({
                status: 'authenticated',
                examId,
                message: 'Aegis Mobile Sentry activated. Exam monitoring begins now.'
            });
        });

        this.app.post('/api/module/complete', (req, res) => {
            const { userId, programId, moduleName, assessmentScore } = req.body;

            if (!userId || !programId || !moduleName) {
                return res.status(400).json({ error: 'Missing required fields' });
            }

            // Trigger Proof-of-Knowledge reward
            this.rewardModuleCompletion(userId, programId, moduleName, assessmentScore)
                .then(rewardResult => {
                    res.json({
                        success: true,
                        module: moduleName,
                        reward: rewardResult?.mainReward,
                        milestoneRewards: rewardResult?.milestoneRewards,
                        progress: rewardResult?.progress,
                        message: 'Module completed successfully!'
                    });
                })
                .catch(error => {
                    console.error('Error processing module completion:', error);
                    res.status(500).json({ error: 'Failed to process module completion' });
                });
        });

        this.app.post('/api/exam/submit', (req, res) => {
            const { examId, answers } = req.body;

            const exam = this.activeExams.get(examId);
            if (!exam) {
                return res.status(404).json({ error: 'Exam session not found' });
            }

            // Simulate grading (in production, this would be more sophisticated)
            const score = Math.floor(Math.random() * 40) + 60; // 60-100
            const passed = score >= 70;

            exam.status = 'completed';
            exam.submissionTime = new Date().toISOString();
            exam.score = score;
            exam.passed = passed;

            // Trigger Proof-of-Knowledge reward for assessment pass
            if (passed) {
                this.rewardAssessmentPass(exam.userId, exam.programId, this.ckqPrograms[exam.programId].assessment.type, score);
                // Also trigger certificate achievement reward
                this.rewardCertificateAchievement(exam.userId, exam.programId, 'ckq_basic');
            }

            // Release Aegis lockdown
            const aegisClient = this.clients.get(exam.userId);
            if (aegisClient) {
                aegisClient.send(JSON.stringify({
                    type: 'exam_complete',
                    examId,
                    result: passed ? 'passed' : 'failed',
                    score,
                    action: 'unlock_device'
                }));
            }

            res.json({
                examId,
                score,
                passed,
                certificate: passed ? this.generateCertificate(exam) : null,
                message: passed ?
                    'Congratulations! You have earned your CKQ certification.' :
                    'Exam not passed. You may retake the assessment after additional study.'
            });
        });

        // Academic Knowledge Graph endpoints (for Ascension Protocol)
        this.app.get('/api/knowledge-graph/status', (req, res) => {
            res.json({
                ingestionProgress: {
                    universities: ['MIT', 'Stanford', 'Oxford', 'Harvard', 'Cambridge'],
                    faculties: ['Engineering', 'Medicine', 'Law', 'Economics', 'Computer Science'],
                    completion: 23, // percentage
                    documentsProcessed: 15420,
                    knowledgeNodes: 89234
                },
                deconstructionProgress: {
                    economics: 7,
                    engineering: 12,
                    medicine: 5,
                    law: 3
                },
                synthesisProgress: {
                    ckqAdvancedLaw: 45,
                    ckqAdvancedEngineering: 23,
                    ckqAdvancedMedicine: 18
                }
            });
        });

        this.app.get('/api/knowledge-graph/search', (req, res) => {
            const { query, faculty } = req.query;
            // Simulate knowledge graph search
            res.json({
                query,
                faculty,
                results: [
                    {
                        id: 'kg_001',
                        title: 'First Principles Analysis of Economic Theory',
                        source: 'MIT Economics Department',
                        relevance: 0.95,
                        insights: [
                            'Phillips Curve model contains logical inconsistencies',
                            'Modern monetary theory requires revision',
                            'Austrian economics provides superior framework'
                        ]
                    }
                ]
            });
        });

        // Health check
        this.app.get('/health', (req, res) => {
            const allPrograms = Object.values(this.ckqPrograms);
            const advancedPrograms = allPrograms.filter(p => p.tier === 'advanced');
            const vocationalPrograms = allPrograms.filter(p => !p.tier || p.tier !== 'advanced');

            res.json({
                service: 'Azora Sapiens',
                status: 'operational',
                features: {
                    totalPrograms: allPrograms.length,
                    advancedPrograms: advancedPrograms.length,
                    vocationalPrograms: vocationalPrograms.length,
                    activeExams: this.activeExams.size,
                    enrolledStudents: this.enrollments.size,
                    aegisClients: this.clients.size
                },
                proofOfKnowledge: {
                    protocol: 'active',
                    mintService: this.mintServiceUrl,
                    rewardsEnabled: true
                },
                ascensionProtocol: {
                    knowledgeIngestion: 'active',
                    firstPrinciplesDeconstruction: 'active',
                    curriculumSynthesis: 'active'
                },
                programCategories: {
                    businessLeadership: advancedPrograms.filter(p =>
                        p.id.includes('mba') || p.id.includes('leadership')).length,
                    financeEconomics: advancedPrograms.filter(p =>
                        p.id.includes('finance') || p.id.includes('economics')).length,
                    technologyInnovation: advancedPrograms.filter(p =>
                        p.id.includes('ai') || p.id.includes('blockchain') || p.id.includes('cyber')).length,
                    specializedProfessional: advancedPrograms.filter(p =>
                        p.id.includes('venture') || p.id.includes('marketing') ||
                        p.id.includes('healthcare') || p.id.includes('law')).length
                }
            });
        });
    }

    extractClientId(url) {
        const urlObj = new URL(url, 'http://localhost');
        return urlObj.searchParams.get('userId');
    }

    handleAegisMessage(clientId, data) {
        console.log(`📱 Aegis: Message from ${clientId}:`, data.type);

        switch (data.type) {
            case 'device_locked':
                // Device successfully locked for exam
                const exam = Array.from(this.activeExams.values())
                    .find(e => e.userId === clientId && e.aegisStatus === 'authenticated');
                if (exam) {
                    exam.status = 'active';
                    console.log(`📚 Exam ${exam.id} now active with Aegis protection`);
                }
                break;

            case 'anomaly_detected':
                // Handle security violations
                this.handleSecurityViolation(clientId, data.anomaly);
                break;

            case 'exam_complete':
                // Exam finished on mobile side
                console.log(`📱 Aegis: Exam completed for ${clientId}`);
                break;
        }
    }

    handleSecurityViolation(clientId, anomaly) {
        console.warn(`🚨 Security violation detected for ${clientId}:`, anomaly);

        // Find active exam and terminate it
        const exam = Array.from(this.activeExams.values())
            .find(e => e.userId === clientId && e.status === 'active');

        if (exam) {
            exam.status = 'terminated';
            exam.violation = anomaly;

            // Notify computer client
            // In production, this would send WebSocket message to exam interface
            console.log(`❌ Exam ${exam.id} terminated due to security violation`);
        }
    }

    generateExamQR(userId, programId) {
        const payload = {
            userId,
            programId,
            timestamp: Date.now(),
            sessionId: crypto.randomUUID()
        };

        // In production, this would be encrypted
        return Buffer.from(JSON.stringify(payload)).toString('base64');
    }

    generateCertificate(exam) {
        return {
            id: crypto.randomUUID(),
            type: 'CKQ',
            program: this.ckqPrograms[exam.programId].title,
            recipient: exam.userId,
            issueDate: new Date().toISOString(),
            expiryDate: null, // CKQ never expires
            verificationUrl: `https://azora.es/verify/${crypto.randomUUID()}`,
            blockchainHash: crypto.createHash('sha256')
                .update(JSON.stringify(exam))
                .digest('hex')
        };
    }

    // Proof-of-Knowledge Protocol: Reward Methods
    async triggerKnowledgeReward(userId, rewardType, rewardCategory, achievement, programId = null, moduleName = null) {
        try {
            console.log(`🎓 Proof-of-Knowledge: Triggering reward for ${userId} - ${achievement}`);

            const rewardResponse = await axios.post(`${this.mintServiceUrl}/api/knowledge-reward`, {
                userId,
                rewardType,
                rewardCategory,
                achievement,
                programId,
                moduleName
            });

            if (rewardResponse.data.success) {
                console.log(`💰 Reward paid: ${rewardResponse.data.reward.amount} aZAR to ${userId}`);

                // Notify the user via WebSocket if connected
                const userClient = this.clients.get(userId);
                if (userClient) {
                    userClient.send(JSON.stringify({
                        type: 'knowledge_reward',
                        reward: rewardResponse.data.reward,
                        message: rewardResponse.data.message,
                        nextMilestones: rewardResponse.data.nextMilestones
                    }));
                }

                return rewardResponse.data;
            } else {
                console.error(`❌ Reward failed for ${userId}:`, rewardResponse.data.error);
                return null;
            }

        } catch (error) {
            console.error(`❌ Error triggering knowledge reward for ${userId}:`, error.message);
            return null;
        }
    }

    async rewardModuleCompletion(userId, programId, moduleName, assessmentScore = null) {
        const enrollment = this.getUserEnrollment(userId, programId);
        if (!enrollment) return null;

        // Determine reward category based on module difficulty/assessment
        let rewardCategory = 'basic';
        if (assessmentScore && assessmentScore >= 80) {
            rewardCategory = 'advanced';
        } else if (assessmentScore && assessmentScore >= 70) {
            rewardCategory = 'intermediate';
        }

        const achievement = `Completed module: ${moduleName}${assessmentScore ? ` (${assessmentScore}%)` : ''}`;

        // Update enrollment progress
        enrollment.progress.completedModules.push(moduleName);
        enrollment.progress.overallProgress = (enrollment.progress.completedModules.length /
            this.ckqPrograms[programId].modules.length) * 100;

        // Check for milestone bonuses
        const milestoneRewards = [];

        if (enrollment.progress.completedModules.length === 1) {
            // First module bonus
            milestoneRewards.push(
                this.triggerKnowledgeReward(userId, 'milestone_bonus', 'first_module',
                    'First module completed!', programId, moduleName)
            );
        }

        if (enrollment.progress.overallProgress >= 50 && !enrollment.progress.halfwayBonusClaimed) {
            // Halfway point bonus
            milestoneRewards.push(
                this.triggerKnowledgeReward(userId, 'milestone_bonus', 'halfway_point',
                    'Halfway through CKQ program!', programId)
            );
            enrollment.progress.halfwayBonusClaimed = true;
        }

        // Main module completion reward
        const mainReward = await this.triggerKnowledgeReward(userId, 'module_completion', rewardCategory,
            achievement, programId, moduleName);

        // Wait for milestone rewards
        await Promise.all(milestoneRewards);

        return {
            mainReward,
            milestoneRewards: await Promise.all(milestoneRewards),
            progress: enrollment.progress
        };
    }

    async rewardAssessmentPass(userId, programId, assessmentType, score) {
        const achievement = `Passed ${assessmentType} assessment with ${score}%`;

        let rewardCategory;
        switch (assessmentType) {
            case 'practical_exam':
                rewardCategory = 'practical_exam';
                break;
            case 'code_audit_exam':
                rewardCategory = 'code_audit';
                break;
            case 'capstone_project':
                rewardCategory = 'capstone_project';
                break;
            default:
                rewardCategory = 'practical_exam';
        }

        return await this.triggerKnowledgeReward(userId, 'assessment_pass', rewardCategory,
            achievement, programId);
    }

    async rewardCertificateAchievement(userId, programId, certificateType = 'ckq_basic') {
        const program = this.ckqPrograms[programId];
        const achievement = `Earned ${program.title} certification`;

        return await this.triggerKnowledgeReward(userId, 'certificate_achievement', certificateType,
            achievement, programId);
    }

    getUserEnrollment(userId, programId) {
        const userEnrollments = this.enrollments.get(userId) || [];
        return userEnrollments.find(e => e.programId === programId);
    }

    start(port = 4200) {
        this.server.listen(port, () => {
            console.log(`📚 Azora Sapiens Education Platform running on port ${port}`);
            console.log(`   🌐 WebSocket: ws://localhost:${port}`);
            console.log(`   📖 Programs: http://localhost:${port}/api/programs`);
            console.log(`   🎓 Enrollment: http://localhost:${port}/api/enroll`);
            console.log(`   🛡️  Aegis: Mobile sentry protocol active`);
            console.log(`   📊 Health: http://localhost:${port}/health`);
        });
    }

    stop() {
        this.wss.close();
        this.server.close();
    }
}

// Create and export singleton instance
const azoraSapiens = new AzoraSapiens();

// Initialize the service
azoraSapiens.initialize();

// Start the service
azoraSapiens.start();

module.exports = azoraSapiens;
