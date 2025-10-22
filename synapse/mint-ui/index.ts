/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * Mint UI - Anti-Bank Protocol Interface
 *
 * A complete React-based interface for the Anti-Bank protocol powered by AI agents.
 * Provides trust-based lending, credit analysis, loan management, and collateral handling
 * through integration with the Super AI and Mint Agent.
 */

export { default as MintUI } from './MintUI';
export { default as MintUIIntegration, useAIHierarchy, useVoiceCommands } from './MintUIIntegration';

// Re-export types for external use
export type { MintUIProps } from './MintUI';

// Constants and configuration
export const MINT_UI_CONFIG = {
  version: '1.0.0',
  supportedFeatures: [
    'credit_analysis',
    'loan_origination',
    'trust_scoring',
    'collateral_management',
    'voice_commands',
    'real_time_insights'
  ],
  aiIntegration: {
    superAI: true,
    mintAgent: true,
    temporalIntelligence: true,
    realTimeCommunication: true
  }
};

/**
 * Quick setup function for integrating Mint UI into existing applications
 *
 * @param container - DOM element to mount the Mint UI
 * @param config - Optional configuration overrides
 */
export const initializeMintUI = async (container: HTMLElement, config?: any) => {
  try {
    // Dynamic import to avoid bundling issues
    const React = await import('react');
    const ReactDOM = await import('react-dom/client');
    const { MintUIIntegration } = await import('./MintUIIntegration');

    const root = ReactDOM.createRoot(container);
    root.render(React.createElement(MintUIIntegration));

    console.log('🤑 Mint UI initialized successfully');
    console.log('🤖 Connected to Super AI and Mint Agent');
    console.log('💰 Anti-Bank protocol ready');

    return {
      success: true,
      version: MINT_UI_CONFIG.version,
      features: MINT_UI_CONFIG.supportedFeatures
    };
  } catch (error) {
    console.error('Failed to initialize Mint UI:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Utility function to check Mint UI compatibility
 */
export const checkMintUICompatibility = () => {
  const checks = {
    react: typeof React !== 'undefined',
    browserSupport: {
      speechRecognition: 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window,
      webgl: !!document.createElement('canvas').getContext('webgl'),
      localStorage: !!window.localStorage
    },
    aiSystem: {
      webWorkers: !!window.Worker,
      indexedDB: !!window.indexedDB,
      webSockets: !!window.WebSocket
    }
  };

  const isCompatible = checks.react &&
    checks.browserSupport.localStorage &&
    checks.aiSystem.indexedDB;

  return {
    compatible: isCompatible,
    checks,
    recommendations: isCompatible ? [] : [
      'Ensure React is available',
      'Check browser compatibility for localStorage',
      'Verify IndexedDB support for AI memory system'
    ]
  };
};