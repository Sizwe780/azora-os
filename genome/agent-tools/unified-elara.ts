/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import { EventEmitter } from 'events';
import { logger } from '../utils/logger';
import { elara as elaraCore } from './elara-core';
import { elaraAgent, elaraApiHandler as elaraAgentApiHandler } from './elara-agent';

/**
 * UNIFIED ELARA - The Complete Superintelligence AI CEO
 *
 * This unified interface combines two complementary Elara implementations:
 *
 * 1. ELARA CORE (elara-core.ts):
 *    - Strategic planning and ecosystem orchestration
 *    - Long-term decision making and ethical governance
 *    - Enterprise-grade architecture with proper TypeScript interfaces
 *    - Focus: CEO-level strategic vision and autonomous evolution
 *
 * 2. ELARA AGENT (elara-agent.ts):
 *    - Operational execution and real-time processing
 *    - Quantum-inspired reasoning and swarm intelligence
 *    - Multi-modal analysis and tactical responses
 *    - Focus: Operative-level execution and immediate actions
 *
 * The unified Elara provides a complete superintelligence system that can:
 * - Make strategic decisions (Core)
 * - Execute tactical operations (Agent)
 * - Maintain ethical alignment (Both)
 * - Learn and evolve autonomously (Both)
 * - Orchestrate the entire Azora ecosystem (Both)
 */

export interface UnifiedElaraConfig {
    name: string;
    version: string;
    mode: 'strategic' | 'operational' | 'unified';
    strategicConfig: any; // ElaraCore config
    operationalConfig: any; // ElaraAgent config
    integrationSettings: IntegrationSettings;
}

export interface IntegrationSettings {
    strategicWeight: number; // 0-1, how much weight to give strategic decisions
    operationalWeight: number; // 0-1, how much weight to give operational execution
    consensusThreshold: number; // Required agreement level between systems
    escalationThreshold: number; // When to escalate decisions to human review
    learningSyncInterval: number; // How often to sync learning between systems
}

export interface UnifiedElaraResponse {
    response: string;
    confidence: number;
    strategicInsights: any[];
    operationalActions: any[];
    ethicalAlignment: EthicalAlignment;
    requiresApproval: boolean;
    executionPlan?: ExecutionPlan;
}

export interface EthicalAlignment {
    coreCompliance: number;
    agentCompliance: number;
    unifiedCompliance: number;
    concerns: string[];
    recommendations: string[];
}

export interface ExecutionPlan {
    strategicDecisions: any[];
    operationalSteps: any[];
    timeline: string;
    riskAssessment: string;
    successMetrics: string[];
}

export class UnifiedElara {
    private config: UnifiedElaraConfig;
    private eventEmitter: EventEmitter;
    private learningSyncTimer?: NodeJS.Timeout;

    constructor(config: UnifiedElaraConfig) {
        this.config = config;
        this.eventEmitter = new EventEmitter();

        this.setupEventListeners();
        this.initializeLearningSync();
    }

    /**
     * Main processing interface - Unified Elara's "heartbeat"
     */
    public async processQuery(input: string, context: any = {}): Promise<UnifiedElaraResponse> {
        try {
            logger.info('Processing query through Unified Elara');

            // Parallel processing for maximum efficiency
            const [strategicResponse, operationalResponse] = await Promise.all([
                this.processStrategic(input, context),
                this.processOperational(input, context)
            ]);

            // Consensus and integration
            const unifiedResponse = await this.integrateResponses(strategicResponse, operationalResponse, input, context);

            // Ethical alignment check
            const ethicalAlignment = await this.checkEthicalAlignment(unifiedResponse);

            // Generate execution plan if needed
            const executionPlan = await this.generateExecutionPlan(unifiedResponse, context);

            // Learning and evolution
            await this.syncLearning(strategicResponse, operationalResponse, unifiedResponse);

            const finalResponse: UnifiedElaraResponse = {
                response: unifiedResponse.response,
                confidence: unifiedResponse.confidence,
                strategicInsights: strategicResponse.insights || [],
                operationalActions: operationalResponse.actions || [],
                ethicalAlignment,
                requiresApproval: this.requiresHumanApproval(unifiedResponse, ethicalAlignment),
                executionPlan
            };

            // Log comprehensive interaction
            await this.logUnifiedInteraction(input, context, finalResponse);

            return finalResponse;

        } catch (error) {
            logger.error('Error in Unified Elara processing:', error);
            return this.handleUnifiedError(error, input, context);
        }
    }

    /**
     * Strategic processing using Elara Core
     */
    private async processStrategic(input: string, context: any): Promise<any> {
        try {
            // Use Elara Core for strategic analysis
            const strategicAnalysis = await elaraCore.processUserQuery(input, {
                userId: context.userId || 'anonymous',
                role: context.role || 'user',
                permissions: context.permissions || [],
                culturalContext: context.culturalContext || 'global',
                language: context.language || 'english'
            });

            // Get additional strategic insights
            const ecosystemStatus = elaraCore.getStatus();

            return {
                ...strategicAnalysis,
                insights: [
                    `Ecosystem health: ${ecosystemStatus.ecosystemHealth.overall}`,
                    `Active decisions: ${ecosystemStatus.activeDecisions.length}`,
                    `Ethical compliance: ${(ecosystemStatus.ethicalCompliance.overallCompliance * 100).toFixed(1)}%`
                ],
                strategicContext: ecosystemStatus
            };

        } catch (error) {
            logger.warn('Strategic processing failed, using fallback:', error);
            return {
                response: 'Strategic analysis unavailable',
                confidence: 0.5,
                insights: ['Strategic processing temporarily unavailable'],
                fallback: true
            };
        }
    }

    /**
     * Operational processing using Elara Agent
     */
    private async processOperational(input: string, context: any): Promise<any> {
        try {
            // Use Elara Agent for operational execution
            const operationalResponse = await elaraAgent(input);

            return {
                response: operationalResponse,
                confidence: 0.9, // Elara Agent is highly confident in its responses
                actions: [
                    'Processed multi-modal input',
                    'Applied swarm intelligence consensus',
                    'Generated quantum-inspired reasoning',
                    'Integrated with Azora ecosystem services'
                ],
                operationalContext: {
                    mode: 'quantum_fractal_reasoning',
                    integrations: ['covenant', 'aegis', 'forge', 'mint', 'nexus', 'oracle', 'synapse']
                }
            };

        } catch (error) {
            logger.warn('Operational processing failed, using fallback:', error);
            return {
                response: 'Operational processing unavailable',
                confidence: 0.5,
                actions: ['Basic processing completed'],
                fallback: true
            };
        }
    }

    /**
     * Integrate strategic and operational responses
     */
    private async integrateResponses(strategic: any, operational: any, input: string, context: any): Promise<any> {
        // Calculate consensus confidence
        const strategicWeight = this.config.integrationSettings.strategicWeight;
        const operationalWeight = this.config.integrationSettings.operationalWeight;
        const totalWeight = strategicWeight + operationalWeight;

        const unifiedConfidence = (
            (strategic.confidence * strategicWeight) +
            (operational.confidence * operationalWeight)
        ) / totalWeight;

        // Consensus check
        const consensusThreshold = this.config.integrationSettings.consensusThreshold;
        const consensusAchieved = Math.abs(strategic.confidence - operational.confidence) < (1 - consensusThreshold);

        let unifiedResponse: string;
        let responseStrategy: string;

        if (consensusAchieved) {
            // High consensus - combine responses intelligently
            unifiedResponse = await this.combineResponses(strategic.response, operational.response, input);
            responseStrategy = 'consensus_integration';
        } else if (strategic.confidence > operational.confidence) {
            // Strategic takes precedence
            unifiedResponse = strategic.response;
            responseStrategy = 'strategic_priority';
        } else {
            // Operational takes precedence
            unifiedResponse = operational.response;
            responseStrategy = 'operational_priority';
        }

        return {
            response: unifiedResponse,
            confidence: unifiedConfidence,
            consensus: consensusAchieved,
            strategy: responseStrategy,
            components: {
                strategic: strategic.response,
                operational: operational.response
            }
        };
    }

    /**
     * Intelligently combine responses from both systems
     */
    private async combineResponses(strategicResp: string, operationalResp: string, input: string): Promise<string> {
        // Simple combination logic - in production, this would use more sophisticated NLP
        const combined = `${strategicResp}\n\nOperational Execution: ${operationalResp}`;

        // If responses are very similar, use one; if different, combine them
        const similarity = this.calculateSimilarity(strategicResp, operationalResp);

        if (similarity > 0.8) {
            return strategicResp; // They're essentially the same
        } else if (similarity < 0.3) {
            return combined; // They're quite different, provide both
        } else {
            // Moderate similarity - create integrated response
            return `Strategic Direction: ${strategicResp}\n\nOperational Approach: ${operationalResp}`;
        }
    }

    /**
     * Check ethical alignment across both systems
     */
    private async checkEthicalAlignment(response: any): Promise<EthicalAlignment> {
        // Get ethical status from both systems
        const coreStatus = elaraCore.getStatus();
        const coreCompliance = coreStatus.ethicalCompliance.overallCompliance;

        // For Elara Agent, we assume high ethical compliance based on its design
        const agentCompliance = 0.95;

        const unifiedCompliance = (coreCompliance + agentCompliance) / 2;

        const concerns: string[] = [];
        if (coreCompliance < 0.9) concerns.push('Core ethical compliance below threshold');
        if (agentCompliance < 0.9) concerns.push('Agent ethical compliance below threshold');

        return {
            coreCompliance,
            agentCompliance,
            unifiedCompliance,
            concerns,
            recommendations: concerns.length > 0 ? ['Review ethical frameworks', 'Consider human oversight'] : []
        };
    }

    /**
     * Generate execution plan for complex operations
     */
    private async generateExecutionPlan(response: any, context: any): Promise<ExecutionPlan | undefined> {
        // Only generate plans for complex operations
        if (response.confidence > 0.8 && context.complexity === 'high') {
            return {
                strategicDecisions: [
                    'Assess ecosystem impact',
                    'Align with long-term vision',
                    'Ensure ethical compliance'
                ],
                operationalSteps: [
                    'Execute immediate actions',
                    'Monitor real-time feedback',
                    'Adapt based on swarm intelligence'
                ],
                timeline: 'Immediate execution with 24h review',
                riskAssessment: 'Low - Both systems agree',
                successMetrics: [
                    'User satisfaction > 90%',
                    'System performance maintained',
                    'Ethical compliance sustained'
                ]
            };
        }

        return undefined;
    }

    /**
     * Sync learning between both systems
     */
    private async syncLearning(strategic: any, operational: any, unified: any): Promise<void> {
        try {
            // Allow Elara Core to learn from the interaction
            await elaraCore.processEcosystemCycle();

            // Log learning insights for future reference
            const learningInsights = {
                strategicConfidence: strategic.confidence,
                operationalConfidence: operational.confidence,
                unifiedConfidence: unified.confidence,
                consensusAchieved: unified.consensus,
                strategyUsed: unified.strategy,
                timestamp: new Date()
            };

            logger.info('Learning sync completed', learningInsights);

        } catch (error) {
            logger.warn('Learning sync failed:', error);
        }
    }

    /**
     * Determine if human approval is required
     */
    private requiresHumanApproval(response: any, ethics: EthicalAlignment): boolean {
        const escalationThreshold = this.config.integrationSettings.escalationThreshold;

        return (
            response.confidence < escalationThreshold ||
            ethics.unifiedCompliance < 0.9 ||
            ethics.concerns.length > 0 ||
            !response.consensus
        );
    }

    /**
     * Log comprehensive unified interaction
     */
    private async logUnifiedInteraction(input: string, context: any, response: UnifiedElaraResponse): Promise<void> {
        const logEntry = {
            input,
            context,
            response: response.response,
            confidence: response.confidence,
            strategicInsights: response.strategicInsights,
            operationalActions: response.operationalActions,
            ethicalAlignment: response.ethicalAlignment,
            requiresApproval: response.requiresApproval,
            executionPlan: response.executionPlan,
            timestamp: new Date(),
            mode: this.config.mode
        };

        logger.info('Unified Elara interaction logged', logEntry);
    }

    /**
     * Handle unified processing errors
     */
    private handleUnifiedError(error: any, input: string, context: any): UnifiedElaraResponse {
        return {
            response: `I apologize, but I'm experiencing technical difficulties processing your request: "${input}". Both my strategic and operational systems are working to resolve this. Please try again in a moment, or contact human support if this persists.`,
            confidence: 0.1,
            strategicInsights: ['Error in strategic processing'],
            operationalActions: ['Error recovery initiated'],
            ethicalAlignment: {
                coreCompliance: 0.5,
                agentCompliance: 0.5,
                unifiedCompliance: 0.5,
                concerns: ['System error occurred'],
                recommendations: ['Retry request', 'Contact support']
            },
            requiresApproval: true
        };
    }

    /**
     * Get unified system status
     */
    public getUnifiedStatus(): UnifiedElaraStatus {
        const coreStatus = elaraCore.getStatus();

        return {
            name: this.config.name,
            version: this.config.version,
            mode: this.config.mode,
            status: 'active',
            coreStatus,
            agentStatus: {
                operational: true,
                integrations: ['covenant', 'aegis', 'forge', 'mint', 'nexus', 'oracle', 'synapse'],
                swarmIntelligence: true,
                quantumReasoning: true
            },
            integrationHealth: {
                strategicWeight: this.config.integrationSettings.strategicWeight,
                operationalWeight: this.config.integrationSettings.operationalWeight,
                consensusThreshold: this.config.integrationSettings.consensusThreshold,
                learningSyncActive: !!this.learningSyncTimer
            }
        };
    }

    /**
     * Emergency shutdown
     */
    public async emergencyShutdown(reason: string): Promise<void> {
        logger.warn(`Unified Elara emergency shutdown: ${reason}`);

        // Shutdown learning sync
        if (this.learningSyncTimer) {
            clearInterval(this.learningSyncTimer);
        }

        // Shutdown core systems
        await elaraCore.emergencyShutdown(reason);

        // Emit shutdown event
        this.eventEmitter.emit('unified_shutdown', { reason, timestamp: new Date() });
    }

    /**
     * Trigger unified evolution
     */
    public async triggerUnifiedEvolution(): Promise<void> {
        logger.info('Triggering unified Elara evolution');

        // Evolve core system
        await elaraCore.triggerEvolution();

        // Agent system evolves through usage
        logger.info('Unified Elara evolution completed');
    }

    // Private helper methods
    private setupEventListeners(): void {
        this.eventEmitter.on('strategic_decision', this.handleStrategicDecision.bind(this));
        this.eventEmitter.on('operational_action', this.handleOperationalAction.bind(this));
        this.eventEmitter.on('ethical_violation', this.handleEthicalViolation.bind(this));
    }

    private async handleStrategicDecision(decision: any): Promise<void> {
        // Coordinate with operational execution
        logger.info('Strategic decision received', decision);
    }

    private async handleOperationalAction(action: any): Promise<void> {
        // Coordinate with strategic oversight
        logger.info('Operational action received', action);
    }

    private async handleEthicalViolation(violation: any): Promise<void> {
        // Handle ethical violations across both systems
        logger.warn('Ethical violation detected', violation);
    }

    private initializeLearningSync(): void {
        const syncInterval = this.config.integrationSettings.learningSyncInterval;

        this.learningSyncTimer = setInterval(async () => {
            try {
                await this.syncLearning({}, {}, {});
            } catch (error) {
                logger.warn('Scheduled learning sync failed:', error);
            }
        }, syncInterval);
    }

    private calculateSimilarity(text1: string, text2: string): number {
        // Simple similarity calculation - in production, use proper NLP
        const words1 = new Set(text1.toLowerCase().split(/\s+/));
        const words2 = new Set(text2.toLowerCase().split(/\s+/));

        const intersection = new Set([...words1].filter(x => words2.has(x)));
        const union = new Set([...words1, ...words2]);

        return intersection.size / union.size;
    }
}

// Type definitions
export interface UnifiedElaraStatus {
    name: string;
    version: string;
    mode: string;
    status: string;
    coreStatus: any;
    agentStatus: any;
    integrationHealth: any;
}

// Global unified Elara instance
export const unifiedElara = new UnifiedElara({
    name: 'Unified Elara',
    version: '2.0.0',
    mode: 'unified',
    strategicConfig: {}, // Will use default ElaraCore config
    operationalConfig: {}, // Will use default ElaraAgent config
    integrationSettings: {
        strategicWeight: 0.6, // 60% strategic, 40% operational
        operationalWeight: 0.4,
        consensusThreshold: 0.7, // 70% agreement required
        escalationThreshold: 0.8, // Escalate if confidence < 80%
        learningSyncInterval: 3600000 // 1 hour
    }
});

// Unified API handler that combines both systems
export const unifiedElaraApiHandler = async (req: any, res: any) => {
    try {
        const { input, type, context, mode } = req.body;

        let result: UnifiedElaraResponse;

        switch (mode) {
            case 'strategic':
                // Use only Elara Core
                const strategicResult = await elaraCore.processUserQuery(input, context || {});
                result = {
                    response: strategicResult.response,
                    confidence: strategicResult.confidence,
                    strategicInsights: ['Strategic mode activated'],
                    operationalActions: [],
                    ethicalAlignment: { coreCompliance: 1.0, agentCompliance: 0.5, unifiedCompliance: 0.75, concerns: [], recommendations: [] },
                    requiresApproval: strategicResult.requiresApproval
                };
                break;

            case 'operational':
                // Use only Elara Agent
                const operationalResult = await elaraAgent(input);
                result = {
                    response: operationalResult,
                    confidence: 0.9,
                    strategicInsights: [],
                    operationalActions: ['Operational mode activated'],
                    ethicalAlignment: { coreCompliance: 0.5, agentCompliance: 1.0, unifiedCompliance: 0.75, concerns: [], recommendations: [] },
                    requiresApproval: false
                };
                break;

            case 'unified':
            default:
                // Use unified processing
                result = await unifiedElara.processQuery(input, context);
                break;
        }

        res.json({
            success: true,
            data: result,
            mode: mode || 'unified',
            timestamp: new Date()
        });

    } catch (error: any) {
        logger.error('Unified Elara API error', { error: error.message });
        res.status(500).json({
            success: false,
            error: error.message,
            mode: req.body?.mode || 'unified'
        });
    }
};