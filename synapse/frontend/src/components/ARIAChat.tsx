import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

interface Message {
  role: 'user' | 'aria';
  content: string;
  timestamp: number;
  actions?: any[];
}

const ARIAChat: React.FC<{ userId: string }> = ({ userId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load proactive suggestions
    loadSuggestions();
    
    // Initial greeting
    sendAutoMessage('Hello ARIA!');
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadSuggestions = async () => {
    try {
      const { data } = await axios.get(`/api/aria/suggestions/${userId}`);
      if (data.success) {
        setSuggestions(data.suggestions.map((s: any) => s.message));
      }
    } catch (error) {
      console.error('Failed to load suggestions:', error);
    }
  };

  const sendAutoMessage = async (message: string) => {
    const userMessage: Message = {
      role: 'user',
      content: message,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setLoading(true);
    setIsTyping(true);

    try {
      const { data } = await axios.post('/api/aria/chat', {
        userId,
        message,
      });

      if (data.success) {
        setTimeout(() => {
          const ariaMessage: Message = {
            role: 'aria',
            content: data.response.message,
            timestamp: Date.now(),
            actions: data.response.actions,
          };

          setMessages(prev => [...prev, ariaMessage]);
          
          if (data.response.suggestions) {
            setSuggestions(data.response.suggestions);
          }

          setIsTyping(false);
        }, 1500); // Simulate thinking time
      }
    } catch (error) {
      console.error('ARIA error:', error);
      setIsTyping(false);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const message = input;
    setInput('');
    await sendAutoMessage(message);
  };

  const handleSuggestion = (suggestion: string) => {
    setInput(suggestion);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="aria-chat-container">
      {/* Holographic background */}
      <div className="holographic-bg">
        <div className="grid-lines"></div>
        <div className="particles"></div>
      </div>

      {/* Chat messages */}
      <div className="messages-container">
        <AnimatePresence>
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className={`message ${msg.role}`}
            >
              {msg.role === 'aria' && (
                <div className="avatar">
                  <div className="aria-avatar">
                    <div className="pulse-ring"></div>
                    <div className="avatar-core"></div>
                  </div>
                </div>
              )}

              <div className="message-content">
                <div className="message-text">
                  {msg.content.split('\n').map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>

                {msg.actions && msg.actions.length > 0 && (
                  <div className="message-actions">
                    {msg.actions.map((action, i) => (
                      <button
                        key={i}
                        className="action-button"
                        onClick={() => handleAction(action)}
                      >
                        {action.text || action.type}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {msg.role === 'user' && (
                <div className="avatar user-avatar">
                  <div className="avatar-initials">
                    {userId.substring(0, 2).toUpperCase()}
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="typing-indicator"
          >
            <div className="aria-avatar-small">
              <div className="avatar-core"></div>
            </div>
            <div className="typing-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="suggestions">
          {suggestions.map((suggestion, idx) => (
            <motion.button
              key={idx}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="suggestion-chip"
              onClick={() => handleSuggestion(suggestion)}
            >
              {suggestion}
            </motion.button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="input-container">
        <div className="input-wrapper">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ask ARIA anything..."
            className="message-input"
            disabled={loading}
          />
          
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="send-button"
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>

          <button className="voice-button" title="Voice input">
            🎤
          </button>
        </div>
      </div>

      <style jsx>{`
        .aria-chat-container {
          position: relative;
          height: 100vh;
          background: #0a0e27;
          overflow: hidden;
        }

        .holographic-bg {
          position: absolute;
          inset: 0;
          opacity: 0.3;
        }

        .grid-lines {
          position: absolute;
          inset: 0;
          background-image: 
            linear-gradient(0deg, transparent 24%, rgba(0, 242, 255, .05) 25%, rgba(0, 242, 255, .05) 26%, transparent 27%, transparent 74%, rgba(0, 242, 255, .05) 75%, rgba(0, 242, 255, .05) 76%, transparent 77%, transparent),
            linear-gradient(90deg, transparent 24%, rgba(0, 242, 255, .05) 25%, rgba(0, 242, 255, .05) 26%, transparent 27%, transparent 74%, rgba(0, 242, 255, .05) 75%, rgba(0, 242, 255, .05) 76%, transparent 77%, transparent);
          background-size: 50px 50px;
          animation: gridMove 20s linear infinite;
        }

        @keyframes gridMove {
          0% { transform: translate(0, 0); }
          100% { transform: translate(50px, 50px); }
        }

        .messages-container {
          position: relative;
          height: calc(100vh - 200px);
          overflow-y: auto;
          padding: 2rem;
          z-index: 1;
        }

        .message {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
          align-items: flex-start;
        }

        .message.user {
          flex-direction: row-reverse;
        }

        .aria-avatar {
          position: relative;
          width: 50px;
          height: 50px;
        }

        .pulse-ring {
          position: absolute;
          inset: -5px;
          border: 2px solid #00f2ff;
          border-radius: 50%;
          animation: pulse 2s ease-out infinite;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.5; }
        }

        .avatar-core {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: linear-gradient(135deg, #00f2ff, #0066ff);
          box-shadow: 0 0 30px rgba(0, 242, 255, 0.5);
          animation: glow 3s ease-in-out infinite;
        }

        @keyframes glow {
          0%, 100% { box-shadow: 0 0 30px rgba(0, 242, 255, 0.5); }
          50% { box-shadow: 0 0 50px rgba(0, 242, 255, 0.8); }
        }

        .message-content {
          max-width: 70%;
          padding: 1.5rem;
          border-radius: 20px;
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(0, 242, 255, 0.2);
        }

        .message.aria .message-content {
          background: linear-gradient(135deg, rgba(0, 242, 255, 0.1), rgba(0, 102, 255, 0.1));
        }

        .message.user .message-content {
          background: rgba(255, 255, 255, 0.1);
        }

        .message-text {
          color: #fff;
          line-height: 1.6;
        }

        .suggestions {
          position: relative;
          display: flex;
          gap: 0.5rem;
          padding: 1rem 2rem;
          overflow-x: auto;
          z-index: 1;
        }

        .suggestion-chip {
          padding: 0.5rem 1rem;
          border-radius: 20px;
          border: 1px solid rgba(0, 242, 255, 0.3);
          background: rgba(0, 242, 255, 0.1);
          color: #00f2ff;
          font-size: 0.9rem;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.3s;
        }

        .suggestion-chip:hover {
          background: rgba(0, 242, 255, 0.2);
          border-color: rgba(0, 242, 255, 0.6);
        }

        .input-container {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 2rem;
          background: linear-gradient(to top, #0a0e27, transparent);
          z-index: 2;
        }

        .input-wrapper {
          display: flex;
          gap: 0.5rem;
          padding: 1rem;
          border-radius: 25px;
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(0, 242, 255, 0.3);
        }

        .message-input {
          flex: 1;
          background: transparent;
          border: none;
          color: #fff;
          font-size: 1rem;
          outline: none;
        }

        .message-input::placeholder {
          color: rgba(255, 255, 255, 0.5);
        }

        .send-button, .voice-button {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: none;
          background: linear-gradient(135deg, #00f2ff, #0066ff);
          color: #fff;
          cursor: pointer;
          transition: all 0.3s;
        }

        .send-button:hover, .voice-button:hover {
          transform: scale(1.1);
          box-shadow: 0 0 20px rgba(0, 242, 255, 0.5);
        }

        .send-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .send-button svg {
          width: 20px;
          height: 20px;
        }

        .typing-indicator {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
        }

        .aria-avatar-small .avatar-core {
          width: 30px;
          height: 30px;
        }

        .typing-dots {
          display: flex;
          gap: 0.3rem;
        }

        .typing-dots span {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #00f2ff;
          animation: bounce 1.4s infinite;
        }

        .typing-dots span:nth-child(2) {
          animation-delay: 0.2s;
        }

        .typing-dots span:nth-child(3) {
          animation-delay: 0.4s;
        }

        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
};

export default ARIAChat;
