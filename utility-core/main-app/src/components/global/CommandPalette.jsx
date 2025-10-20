/**
 * @file CommandPalette.jsx
 * @author Sizwe Ngwenya
 * @description The primary user interface to the Azora AI. It enforces constitutional principles, starting with informed consent, before any action is taken.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCommandPalette } from '../../context/CommandPaletteContext';

// Custom hook for debouncing user input
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
};

const AI_SERVICE_URL = 'http://localhost:4001';
const COMPLIANCE_SERVICE_URL = 'http://localhost:4090';
const CONTRACTS_SERVICE_URL = 'http://localhost:4400';
const WITHDRAWAL_SERVICE_URL = 'http://localhost:4310';

const CommandPalette = () => {
  const { isOpen, closePalette } = useCommandPalette();
  const [searchTerm, setSearchTerm] = useState('');
  const [commands, setCommands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [consentRequest, setConsentRequest] = useState(null);
  const [contractRequest, setContractRequest] = useState(null);
  const [otpRequest, setOtpRequest] = useState(null);
  const [otpInput, setOtpInput] = useState('');
  const [systemMessage, setSystemMessage] = useState(null);
  const navigate = useNavigate();
  const debouncedSearchTerm = useDebounce(searchTerm, 250);

  const fetchCommands = useCallback(async () => {
    setLoading(true);
    setActiveIndex(0);
    try {
      const response = await fetch(`${AI_SERVICE_URL}/api/command?query=${debouncedSearchTerm}`);
      const data = await response.json();
      
      if (data.length > 0) {
        if (data[0].action?.type === 'request_consent') {
          setConsentRequest(data[0].action.payload);
          setCommands([]);
        } else if (data[0].action?.type === 'request_contract_signature') {
          setContractRequest(data[0].action.payload);
          setCommands([]);
        } else if (data[0].action?.type === 'request_otp') {
          setOtpRequest(data[0].action.payload);
          setCommands([]);
        } else {
          setCommands(data);
          setConsentRequest(null);
          setContractRequest(null);
          setOtpRequest(null);
        }
      } else {
        setCommands([]);
      }
    } catch (error) {
      console.error("Could not connect to Azora AI:", error);
      setCommands([{ id: 'error', title: 'Error: Could not connect to Azora AI', action: { type: 'none' } }]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchTerm]);

  useEffect(() => {
    if (isOpen) {
      fetchCommands();
    }
  }, [isOpen, fetchCommands]);

  const handleConsent = async (granted) => {
    if (!consentRequest) return;
    try {
      await fetch(`${COMPLIANCE_SERVICE_URL}/popia/consent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...consentRequest, granted, performedBy: 'user_self_service' })
      });
      if (granted) {
        setConsentRequest(null);
        fetchCommands(); // Re-fetch commands now that consent is granted
      } else {
        closePalette();
      }
    } catch (error) {
      console.error("Could not submit consent:", error);
    }
  };

  const handleSignContract = async () => {
    if (!contractRequest) return;
    try {
      await fetch(`${CONTRACTS_SERVICE_URL}/api/sign/${contractRequest.founderId}`, { method: 'POST' });
      setContractRequest(null);
      fetchCommands(); // Re-fetch commands now that contract is signed
    } catch (error) {
      console.error("Could not sign contract:", error);
    }
  };

  const handleExecuteWithdrawal = async (payload) => {
    setLoading(true);
    try {
      const res = await fetch(`${WITHDRAWAL_SERVICE_URL}/api/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Withdrawal failed');
      setSystemMessage(`Success! TxID: ${result.transactionId}`);
    } catch (error) {
      setSystemMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
      setTimeout(() => setSystemMessage(null), 5000);
      closePalette();
    }
  };

  const handleOtpSubmit = () => {
    if (!otpRequest || !otpInput) return;
    const { action, ...rest } = otpRequest.context;
    const payload = { ...rest, otp: otpInput };
    
    if (action === 'execute_withdrawal') {
      handleExecuteWithdrawal(payload);
    }
    setOtpRequest(null);
    setOtpInput('');
  };

  const handleCommand = (command) => {
    if (!command || !command.action) return;
    switch (command.action.type) {
      case 'navigate':
        navigate(command.action.payload);
        break;
      case 'request_otp':
        setOtpRequest(command.action.payload);
        return; // Keep palette open for OTP
      case 'execute_withdrawal':
        handleExecuteWithdrawal(command.action.payload);
        return; // Keep palette open to show message
      case 'dispatch':
        console.log(`Dispatching action: ${command.action.payload}`);
        break;
      case 'prompt_ai':
        setSearchTerm(command.action.payload);
        return; // Do not close palette
      case 'inform':
        setSystemMessage(command.action.payload);
        setTimeout(() => setSystemMessage(null), 10000); // Show for 10s
        closePalette();
        return;
      default:
        console.log(`Unknown action type: ${command.action.type}`);
    }
    closePalette();
    setSearchTerm('');
  };

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      closePalette();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(prev => (prev + 1) % (commands.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => (prev - 1 + (commands.length || 1)) % (commands.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (commands[activeIndex]) {
        handleCommand(commands[activeIndex]);
      }
    }
  }, [closePalette, commands, activeIndex]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-start pt-20">
      <div className="w-full max-w-2xl bg-gray-800 rounded-lg shadow-lg text-white" role="dialog">
        {systemMessage ? (
          <div className="p-6">
            <h2 className="text-xl font-bold mb-2 text-green-400">AI Notification</h2>
            <pre className="text-sm text-gray-300 whitespace-pre-wrap bg-gray-900 p-4 rounded-md">{systemMessage}</pre>
          </div>
        ) : otpRequest ? (
          <div className="p-6">
            <h2 className="text-xl font-bold mb-2 text-yellow-400">Two-Factor Authentication</h2>
            <p className="text-sm text-gray-300 mb-4">{otpRequest.prompt}</p>
            <input
              type="text"
              autoFocus
              value={otpInput}
              onChange={(e) => setOtpInput(e.target.value)}
              placeholder="6-digit code"
              className="w-full p-3 bg-gray-900 text-white rounded-md focus:outline-none text-center tracking-[.5em]"
              maxLength="6"
            />
            <div className="flex justify-end mt-4">
              <button onClick={handleOtpSubmit} className="px-4 py-2 rounded bg-green-600 hover:bg-green-500">Verify and Withdraw</button>
            </div>
          </div>
        ) : contractRequest ? (
          <div className="p-6">
            <h2 className="text-xl font-bold mb-2 text-yellow-400">{contractRequest.title}</h2>
            <p className="text-sm text-gray-300 mb-4 whitespace-pre-wrap">{contractRequest.explanation}</p>
            <p className="text-sm text-gray-400 mb-4">Document ID: {contractRequest.documentId}</p>
            <div className="flex justify-end">
              <button onClick={handleSignContract} className="px-4 py-2 rounded bg-green-600 hover:bg-green-500">Sign Agreement</button>
            </div>
          </div>
        ) : consentRequest ? (
          <div className="p-6">
            <h2 className="text-xl font-bold mb-2 text-yellow-400">{consentRequest.title}</h2>
            <p className="text-sm text-gray-300 mb-4 whitespace-pre-wrap">{consentRequest.explanation}</p>
            <div className="flex justify-end space-x-4">
              <button onClick={() => handleConsent(false)} className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-500">Decline</button>
              <button onClick={() => handleConsent(true)} className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-500">Agree and Become a Citizen</button>
            </div>
          </div>
        ) : (
          <>
            <input
              type="text"
              autoFocus
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Ask Azora AI..."
              className="w-full p-4 bg-gray-900 text-white rounded-t-lg focus:outline-none"
            />
            <ul className="p-2 max-h-80 overflow-y-auto">
              {loading && <li className="p-3 text-gray-400">Azora is thinking...</li>}
              {!loading && commands.map((cmd, index) => (
                <li
                  key={cmd.id}
                  onClick={() => handleCommand(cmd)}
                  className={`p-3 rounded-md cursor-pointer ${index === activeIndex ? 'bg-blue-600' : 'hover:bg-gray-700'}`}
                >
                  <div>{cmd.title}</div>
                  {cmd.justification && (
                    <div className="text-xs text-blue-300 mt-1 opacity-80">
                      {cmd.justification}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
};

export default CommandPalette;