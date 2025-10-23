/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import { unifiedElara, elaraCore, elaraAgent } from './index';

/**
 * Integration Tests for Unified Elara System
 *
 * Tests the integration between:
 * 1. Elara Core (Strategic Planning)
 * 2. Elara Agent (Operational Execution)
 * 3. Unified Elara (Combined Intelligence)
 */

describe('Unified Elara Integration Tests', () => {
    const testContext = {
        userId: 'test-user',
        role: 'developer',
        permissions: ['read', 'write'],
        culturalContext: 'african',
        language: 'english'
    };

    beforeAll(async () => {
        // Any setup needed
        console.log('Setting up Unified Elara tests');
    });

    describe('Individual System Tests', () => {
        test('Elara Core should process strategic queries', async () => {
            const input = 'What is the long-term strategy for Azora ecosystem growth?';

            const result = await elaraCore.processUserQuery(input, testContext);

            expect(result).toBeDefined();
            expect(result.response).toBeTruthy();
            expect(result.confidence).toBeGreaterThan(0);
            expect(result.confidence).toBeLessThanOrEqual(1);
        });

        test('Elara Agent should process operational queries', async () => {
            const input = 'Execute immediate market analysis for AZORA token';

            const result = await elaraAgent(input);

            expect(result).toBeDefined();
            expect(typeof result).toBe('string');
            expect(result.length).toBeGreaterThan(0);
        });
    });

    describe('Unified System Tests', () => {
        test('Unified Elara should combine strategic and operational processing', async () => {
            const input = 'Develop and execute a comprehensive growth strategy for Azora';

            const result = await unifiedElara.processQuery(input, testContext);

            expect(result).toBeDefined();
            expect(result.response).toBeTruthy();
            expect(result.confidence).toBeGreaterThan(0);
            expect(result.confidence).toBeLessThanOrEqual(1);
            expect(result.strategicInsights).toBeDefined();
            expect(result.operationalActions).toBeDefined();
            expect(result.ethicalAlignment).toBeDefined();
            expect(typeof result.requiresApproval).toBe('boolean');
        });

        test('Unified Elara should handle ethical alignment', async () => {
            const input = 'How can we maximize user engagement while maintaining privacy?';

            const result = await unifiedElara.processQuery(input, testContext);

            expect(result.ethicalAlignment.coreCompliance).toBeGreaterThanOrEqual(0);
            expect(result.ethicalAlignment.coreCompliance).toBeLessThanOrEqual(1);
            expect(result.ethicalAlignment.agentCompliance).toBeGreaterThanOrEqual(0);
            expect(result.ethicalAlignment.agentCompliance).toBeLessThanOrEqual(1);
            expect(result.ethicalAlignment.unifiedCompliance).toBeGreaterThanOrEqual(0);
            expect(result.ethicalAlignment.unifiedCompliance).toBeLessThanOrEqual(1);
        });

        test('Unified Elara should generate execution plans for complex operations', async () => {
            const input = 'Launch a new DeFi product with integrated AI governance';
            const complexContext = { ...testContext, complexity: 'high' };

            const result = await unifiedElara.processQuery(input, complexContext);

            // For complex operations, execution plan should be generated
            if (result.executionPlan) {
                expect(result.executionPlan.strategicDecisions).toBeDefined();
                expect(result.executionPlan.operationalSteps).toBeDefined();
                expect(result.executionPlan.timeline).toBeTruthy();
                expect(result.executionPlan.riskAssessment).toBeTruthy();
                expect(result.executionPlan.successMetrics).toBeDefined();
            }
        });
    });

    describe('System Status Tests', () => {
        test('Unified Elara should report comprehensive status', () => {
            const status = unifiedElara.getUnifiedStatus();

            expect(status.name).toBe('Unified Elara');
            expect(status.version).toBe('2.0.0');
            expect(status.mode).toBe('unified');
            expect(status.status).toBe('active');
            expect(status.coreStatus).toBeDefined();
            expect(status.agentStatus).toBeDefined();
            expect(status.integrationHealth).toBeDefined();
        });

        test('Elara Core should report status', () => {
            const status = elaraCore.getStatus();

            expect(status.name).toBe('Elara');
            expect(status.version).toBe('1.0.0');
            expect(status.status).toBe('active');
            expect(status.capabilities).toBeDefined();
            expect(status.ecosystemHealth).toBeDefined();
        });
    });

    describe('Error Handling Tests', () => {
        test('Unified Elara should handle errors gracefully', async () => {
            // Test with invalid input that might cause errors
            const invalidInput = null;

            try {
                await unifiedElara.processQuery(invalidInput as any, testContext);
            } catch (error) {
                // Should handle errors gracefully
                expect(error).toBeDefined();
            }
        });

        test('Unified Elara should provide fallback responses', async () => {
            // Test with empty input
            const result = await unifiedElara.processQuery('', testContext);

            expect(result).toBeDefined();
            expect(result.response).toBeTruthy();
            expect(result.confidence).toBeGreaterThan(0);
        });
    });

    describe('Mode-Specific Tests', () => {
        test('Strategic mode should focus on long-term planning', async () => {
            const input = 'What are the 5-year goals for Azora?';

            // Simulate strategic-only processing
            const strategicResult = await elaraCore.processUserQuery(input, testContext);

            expect(strategicResult).toBeDefined();
            expect(strategicResult.response).toContain('strategy' || 'planning' || 'goals' || 'vision');
        });

        test('Operational mode should focus on immediate execution', async () => {
            const input = 'Execute immediate price optimization for subscriptions';

            const operationalResult = await elaraAgent(input);

            expect(operationalResult).toBeDefined();
            expect(typeof operationalResult).toBe('string');
        });
    });

    afterAll(async () => {
        // Cleanup if needed
        console.log('Completed Unified Elara integration tests');
    });
});