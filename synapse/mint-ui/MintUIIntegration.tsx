import React, { useEffect, useState } from 'react';
import { SuperAI, initializeAIHierarchy, getAIHierarchyStatus } from '../../genome/ai-hierarchy';
import { MintAgent } from '../../genome/ai-hierarchy/specialized-agents/mint-agent';
import { AgentCommunicationSystem, AgentMessenger } from '../../genome/ai-hierarchy/communication/agent-communication';
import { MemorySystem } from '../../genome/agent-tools/memory-system';
import MintUI from './MintUI';

/**
 * MintUI Integration - Connects the Mint UI with the Super AI system
 * This provides a complete Anti-Bank protocol interface powered by AI agents
 */
export const MintUIIntegration: React.FC = () => {
  const [superAI, setSuperAI] = useState<SuperAI | null>(null);
  const [mintAgent, setMintAgent] = useState<MintAgent | null>(null);
  const [messenger, setMessenger] = useState<AgentMessenger | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializeAIHierarchySystem();
  }, []);

  const initializeAIHierarchySystem = async () => {
    try {
      setIsInitializing(true);
      setError(null);

      // Initialize memory system (would be injected in real implementation)
      const memorySystem = new MemorySystem();

      // Initialize AI Hierarchy System
      const aiSystem = await initializeAIHierarchy(memorySystem);

      // Get the Mint Agent from the system
      // Note: In a real implementation, this would be accessed through the SuperAI
      const mintAgentInstance = new MintAgent(memorySystem);

      // Set up communication messenger
      const commSystem = new AgentCommunicationSystem(aiSystem);
      commSystem.registerAgent('mint', mintAgentInstance);
      const messengerInstance = new AgentMessenger(commSystem, 'mint');

      setSuperAI(aiSystem);
      setMintAgent(mintAgentInstance);
      setMessenger(messengerInstance);

    } catch (err) {
      console.error('Failed to initialize AI Hierarchy System:', err);
      setError(err instanceof Error ? err.message : 'Unknown initialization error');
    } finally {
      setIsInitializing(false);
    }
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Initializing AI Hierarchy System
          </h2>
          <p className="text-gray-600">
            Connecting to Super AI and specialized agents...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-red-900 mb-2">
            Initialization Failed
          </h2>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={initializeAIHierarchySystem}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Retry Initialization
          </button>
        </div>
      </div>
    );
  }

  if (!superAI || !mintAgent || !messenger) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🤖</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            AI System Not Ready
          </h2>
          <p className="text-gray-600">
            The AI Hierarchy System components are not properly initialized.
          </p>
        </div>
      </div>
    );
  }

  return (
    <MintUI
      superAI={superAI}
      mintAgent={mintAgent}
      messenger={messenger}
    />
  );
};

/**
 * Hook for using the AI Hierarchy System in React components
 */
export const useAIHierarchy = () => {
  const [systemStatus, setSystemStatus] = useState<any>(null);
  const [superAI, setSuperAI] = useState<SuperAI | null>(null);

  useEffect(() => {
    // This would be replaced with actual system initialization
    const checkStatus = () => {
      if (superAI) {
        const status = getAIHierarchyStatus(superAI);
        setSystemStatus(status);
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [superAI]);

  const processQuery = async (query: string, context?: any) => {
    if (!superAI) return null;

    try {
      return await superAI.processUserQuery(query, context);
    } catch (error) {
      console.error('Query processing failed:', error);
      return null;
    }
  };

  return {
    superAI,
    systemStatus,
    processQuery,
    isReady: !!superAI
  };
};

/**
 * Voice Command Interface for Mint UI
 */
export const useVoiceCommands = (superAI: SuperAI | null) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice recognition not supported in this browser');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setTranscript('');
    };

    recognition.onresult = async (event: any) => {
      const speechResult = event.results[0][0].transcript;
      setTranscript(speechResult);

      // Process voice command through Super AI
      if (superAI) {
        try {
          const response = await superAI.processUserQuery(speechResult, {
            input: 'voice',
            timestamp: new Date()
          });
          // Handle response (could trigger UI updates, etc.)
          console.log('Voice command processed:', response);
        } catch (error) {
          console.error('Voice command processing failed:', error);
        }
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.start();
  };

  const stopListening = () => {
    setIsListening(false);
    // Note: In a real implementation, you'd need to stop the recognition instance
  };

  return {
    isListening,
    transcript,
    startListening,
    stopListening
  };
};

export default MintUIIntegration;