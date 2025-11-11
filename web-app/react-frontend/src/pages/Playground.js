import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Bot,
  User,
  Loader2,
  Star,
  Brain,
  Settings,
  RotateCcw,
  Download,
  Copy,
  Check,
  AlertCircle,
  Target,
  BookOpen
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useChat } from '../hooks/useAPI';
import './Playground.css';

const Playground = () => {
  const [input, setInput] = useState('');
  const [settings] = useState({
    temperature: 0.7,
    maxTokens: 512,
    model: 'exoplanet-reasoning-llm'
  });
  const [copiedMessage, setCopiedMessage] = useState(null);
  const messagesContainerRef = useRef(null);

  const scrollToBottom = useCallback((behavior = 'smooth') => {
    if (!messagesContainerRef.current) return;

    const container = messagesContainerRef.current;
    requestAnimationFrame(() => {
      const nextScrollTop = container.scrollHeight - container.clientHeight;

      if ('scrollTo' in container) {
        container.scrollTo({
          top: Math.max(nextScrollTop, 0),
          behavior
        });
      } else {
        container.scrollTop = Math.max(nextScrollTop, 0);
      }
    });
  }, []);
  
  // Use custom hooks for API integration
  const {
    messages,
    isConnected,
    isLoading,
    sendChatMessage,
    clearMessages
  } = useChat();

  const suggestions = [
    "What is the transit method for detecting exoplanets?",
    "How do we determine if an exoplanet is in the habitable zone?",
    "Compare radial velocity and direct imaging methods",
    "What are the main challenges in exoplanet detection?",
    "How can we study exoplanet atmospheres?",
    "Explain the Goldilocks zone concept",
    "What is gravitational microlensing?",
    "How do we calculate exoplanet mass and radius?"
  ];

  const capabilities = [
    {
      icon: Target,
      title: "Detection Methods",
      description: "Transit, radial velocity, direct imaging, and more"
    },
    {
      icon: Star,
      title: "Habitable Zones",
      description: "Calculations and analysis of life-supporting regions"
    },
    {
      icon: Brain,
      title: "Scientific Reasoning",
      description: "Advanced logical analysis and problem solving"
    },
    {
      icon: BookOpen,
      title: "Research Papers",
      description: "Summarization and analysis of scientific literature"
    }
  ];

  useEffect(() => {
    if (!messages.length) return;

    const behavior = messages.length === 1 ? 'auto' : 'smooth';
    const timeoutId = setTimeout(() => scrollToBottom(behavior), 100);

    return () => clearTimeout(timeoutId);
  }, [messages, scrollToBottom]);

  useEffect(() => {
    scrollToBottom('auto');
  }, [scrollToBottom]);

  const sendMessage = async (messageText = input) => {
    if (!messageText.trim() || isLoading) return;

    setInput('');
    
    try {
      await sendChatMessage(messageText, {
        temperature: settings.temperature,
        maxTokens: settings.maxTokens
      });
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const copyToClipboard = async (text, messageId) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedMessage(messageId);
      setTimeout(() => setCopiedMessage(null), 2000);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  const clearConversation = () => {
    clearMessages();
  };

  const downloadConversation = () => {
    const conversationData = {
      timestamp: new Date().toISOString(),
      messages: messages,
      settings: settings
    };
    
    const blob = new Blob([JSON.stringify(conversationData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `exoplanet-ai-conversation-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="playground">
      <div className="playground-container">
        {/* Header */}
        <div className="playground-header">
          <div className="header-content">
            <div className="header-title">
              <div className="title-icon">
                <Star className="star-icon" />
                <Brain className="brain-icon" />
              </div>
              <div className="title-text">
                <h1>ExpoAI</h1>
                <p>Interactive AI for astronomical discovery and analysis</p>
              </div>
            </div>
            
            <div className="header-actions">
              <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
                <div className="status-dot"></div>
                <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
              </div>
              
              <div className="header-buttons">
                <button
                  onClick={clearConversation}
                  className="btn btn-secondary btn-sm"
                  title="Clear conversation"
                >
                  <RotateCcw size={16} />
                </button>
                <button
                  onClick={downloadConversation}
                  className="btn btn-secondary btn-sm"
                  title="Download conversation"
                >
                  <Download size={16} />
                </button>
                <button
                  className="btn btn-outline btn-sm"
                  title="Settings"
                >
                  <Settings size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="playground-content">
          {/* Sidebar */}
          <div className="playground-sidebar">
            <div className="sidebar-section">
              <h3>Capabilities</h3>
              <div className="capabilities-list">
                {capabilities.map((capability, index) => {
                  const Icon = capability.icon;
                  return (
                    <div key={index} className="capability-item">
                      <Icon size={20} />
                      <div>
                        <div className="capability-title">{capability.title}</div>
                        <div className="capability-desc">{capability.description}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="sidebar-section">
              <h3>Quick Suggestions</h3>
              <div className="suggestions-list">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => sendMessage(suggestion)}
                    className="suggestion-item"
                    disabled={isLoading}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Chat Area */}
          <div className="playground-chat">
            <div className="chat-messages" ref={messagesContainerRef}>
              {messages.length === 0 && !isLoading && (
                <div className="chat-empty-state">
                  <div className="empty-state-icon">
                    <Star size={36} className="icon-star" />
                    <Brain size={36} className="icon-brain" />
                  </div>
                  <h2>Welcome to ExpoAI</h2>
                  <p>
                    Your specialized copilot for exoplanet science. Ask anything about detection methods, habitable zones, or space missions.
                  </p>
                  <div className="empty-state-prompts">
                    {suggestions.slice(0, 3).map((suggestion, index) => (
                      <button
                        key={suggestion}
                        onClick={() => sendMessage(suggestion)}
                        className="empty-state-chip"
                        disabled={isLoading}
                      >
                        <span className="chip-index">{index + 1}</span>
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    className={`message ${message.type} ${message.isError ? 'error' : ''}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="message-avatar">
                      {message.type === 'user' ? (
                        <User size={20} />
                      ) : (
                        <Bot size={20} />
                      )}
                    </div>
                    
                    <div className="message-content">
                      <div className="message-header">
                        <span className="message-role">
                          {message.type === 'user' ? 'You' : 'Exoplanet AI'}
                        </span>
                        <span className="message-time">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </span>
                        <button
                          onClick={() => copyToClipboard(message.content, message.id)}
                          className="copy-button"
                          title="Copy message"
                        >
                          {copiedMessage === message.id ? (
                            <Check size={14} />
                          ) : (
                            <Copy size={14} />
                          )}
                        </button>
                      </div>
                      
                      <div className="message-text">
                        <ReactMarkdown
                          components={{
                            code({ node, inline, className, children, ...props }) {
                              const match = /language-(\w+)/.exec(className || '');
                              return !inline && match ? (
                                <SyntaxHighlighter
                                  style={tomorrow}
                                  language={match[1]}
                                  PreTag="div"
                                  {...props}
                                >
                                  {String(children).replace(/\n$/, '')}
                                </SyntaxHighlighter>
                              ) : (
                                <code className={className} {...props}>
                                  {children}
                                </code>
                              );
                            }
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {isLoading && (
                <motion.div
                  className="message assistant loading"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="message-avatar">
                    <Bot size={20} />
                  </div>
                  <div className="message-content">
                    <div className="loading-indicator">
                      <Loader2 size={20} className="spinning" />
                      <span>Thinking about the universe...</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            <div className="chat-input">
              <div className="input-container">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about exoplanets, detection methods, habitable zones..."
                  className="message-input"
                  rows={1}
                  disabled={isLoading}
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || isLoading}
                  className="send-button"
                >
                  {isLoading ? (
                    <Loader2 size={20} className="spinning" />
                  ) : (
                    <Send size={20} />
                  )}
                </button>
              </div>
              
              {!isConnected && (
                <div className="connection-warning">
                  <AlertCircle size={16} />
                  <span>API server not connected. Please start the backend server.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Playground;
