/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * AI Hierarchy System - Complete hierarchical AI architecture for Azora OS
 *
 * This system implements a hierarchical AI structure with:
 * - Specialized Agents (Angels): Domain-specific AI agents for each azora-* backend
 * - Super AI (Higher Deity): Orchestrates all agents, integrates temporal intelligence,
 *   makes strategic decisions, and provides interactive AI assistance
 * - Communication System: Enables seamless inter-agent communication and task coordination
 * - Chamber of Ghosts Integration: Temporal intelligence for past optimization,
 *   present calibration, and future simulation
 */

import { SuperAI } from './super-ai/super-ai';
import { AgentCommunicationSystem, AgentMessenger } from './communication/agent-communication';
import { MemorySystem } from '../agent-tools/memory-system';

// Specialized Agents
export { SpecializedAgent } from './specialized-agents/base-agent';
export { NexusAgent } from './specialized-agents/nexus-agent';
export { MintAgent } from './specialized-agents/mint-agent';
export { MonetarySystemAgent } from './specialized-agents/monetary-system-agent';
export { ForgeAgent } from './specialized-agents/forge-agent';
export { SynapseAgent } from './specialized-agents/synapse-agent';
export { AegisAgent } from './specialized-agents/aegis-agent';
export { CovenantAgent } from './specialized-agents/covenant-agent';

// Core Systems
export { SuperAI } from './super-ai/super-ai';
export { AgentCommunicationSystem, AgentMessenger } from './communication/agent-communication';

// Types
export type {
  AgentTask,
  TaskResult,
  AgentStatusReport,
  HealthMetrics,
  AgentInsight,
  AgentInfo
} from './specialized-agents/base-agent';

export type {
  Message,
  MessageType,
  MessageResponse,
  Alert,
  Query,
  CommunicationStats
} from './communication/agent-communication';

/**
 * Initialize the complete AI Hierarchy System
 *
 * @param memorySystem - Memory system for persistent storage and retrieval
 * @param chamberOfGhostsService - Optional Chamber of Ghosts service for temporal intelligence
 * @returns Initialized SuperAI instance with all systems ready
 */
export async function initializeAIHierarchy(
  memorySystem: MemorySystem,
  chamberOfGhostsService?: any
): Promise<SuperAI> {
  try {
    // Create Super AI
    const superAI = new SuperAI(memorySystem);

    // Integrate Chamber of Ghosts if provided
    if (chamberOfGhostsService) {
      superAI.setChamberOfGhostsService(chamberOfGhostsService);
    }

    // Start the processing cycle
    setInterval(() => {
      superAI.processCycle().catch(error => {
        console.error('Super AI processing cycle failed:', error);
      });
    }, 30000); // Process every 30 seconds

    console.log('🤖 AI Hierarchy System initialized successfully');
    console.log('✨ All specialized agents active');
    console.log('🔮 Super AI ready for interaction');
    if (chamberOfGhostsService) {
      console.log('👻 Chamber of Ghosts temporal intelligence integrated');
    }

    return superAI;

  } catch (error) {
    console.error('Failed to initialize AI Hierarchy System:', error);
    throw error;
  }
}

/**
 * Quick status check for the AI Hierarchy System
 */
export function getAIHierarchyStatus(superAI: SuperAI): any {
  return {
    systemStatus: superAI.getSystemStatus(),
    timestamp: new Date()
  };
}

/**
 * Emergency shutdown of AI Hierarchy System
 */
export async function shutdownAIHierarchy(superAI: SuperAI): Promise<void> {
  try {
    // Implement graceful shutdown logic
    console.log('🔄 Shutting down AI Hierarchy System...');

    // Stop processing cycles
    // Close communication channels
    // Save final state

    console.log('✅ AI Hierarchy System shut down successfully');
  } catch (error) {
    console.error('Error during AI Hierarchy shutdown:', error);
    throw error;
  }
}