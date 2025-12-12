import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

const API_BASE_URL = import.meta.env.VITE_SERVER_API_URL || 'http://localhost:3100';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatWidgetProps {
  isOpen?: boolean;
  onToggle?: () => void;
  hideFloatingButton?: boolean;
}

export default function ChatWidget({ 
  isOpen: controlledIsOpen, 
  onToggle, 
  hideFloatingButton = false 
}: ChatWidgetProps = {}) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  
  // Use controlled state if provided, otherwise use internal state
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hello! I'm your AI medical assistant. I can help you with patient information and biomarker analysis. What would you like to know?",
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from AI');
      }

      const data = await response.json();
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: "I'm sorry, I encountered an error processing your request. Please try again.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const exampleQuestions = [
    "Show me all patients",
    "Search for patients named Smith",
    "Analyze patient 1's trends",
  ];

  const toggleChat = () => {
    if (onToggle) {
      onToggle();
    } else {
      setInternalIsOpen(!internalIsOpen);
    }
  };

  return (
    <>
      {/* Floating Chat Button - Hidden if controlled by parent */}
      {!hideFloatingButton && (
        <button
          onClick={toggleChat}
          className={`btn btn-primary rounded-circle shadow-lg position-fixed ${
            isOpen ? 'd-none' : ''
          }`}
          style={{
            bottom: '24px',
            right: '24px',
            width: '60px',
            height: '60px',
            zIndex: 1040,
            transition: 'all 0.3s ease',
          }}
          title="Open AI Chat"
        >
          <i className="bi bi-chat-dots fs-4"></i>
        </button>
      )}

      {/* Chat Widget Popup */}
      {isOpen && (
        <div
          className="position-fixed shadow-lg bg-white rounded"
          style={{
            bottom: '24px',
            right: '24px',
            width: '400px',
            height: '600px',
            zIndex: 1050,
            display: 'flex',
            flexDirection: 'column',
            border: '1px solid #dee2e6',
          }}
        >
          {/* Header */}
          <div className="bg-primary text-white p-3 rounded-top d-flex justify-content-between align-items-center">
            <div>
              <h5 className="mb-0">
                <i className="bi bi-chat-dots me-2"></i>
                AI Assistant
              </h5>
              <small style={{ fontSize: '0.75rem' }}>Ask about patients & biomarkers</small>
            </div>
            <div className="d-flex gap-2">
              <button
                onClick={() => setMessages([messages[0]])}
                className="btn btn-sm btn-light"
                title="Clear chat"
                style={{ padding: '0.25rem 0.5rem' }}
              >
                <i className="bi bi-arrow-clockwise"></i>
              </button>
              <button
                onClick={toggleChat}
                className="btn btn-sm btn-light"
                title="Close chat"
                style={{ padding: '0.25rem 0.5rem' }}
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div
            className="flex-grow-1 overflow-auto p-3"
            style={{
              maxHeight: '100%',
              backgroundColor: '#f8f9fa',
            }}
          >
            {messages.map((message, index) => (
              <div
                key={index}
                className={`mb-3 d-flex ${
                  message.role === 'user' ? 'justify-content-end' : 'justify-content-start'
                }`}
              >
                <div
                  className={`p-2 rounded ${
                    message.role === 'user'
                      ? 'bg-primary text-white'
                      : 'bg-white border'
                  }`}
                  style={{
                    maxWidth: '85%',
                    fontSize: '0.9rem',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                  }}
                >
                  {message.role === 'assistant' ? (
                    <div className="markdown-content">
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="mb-0">{message.content}</p>
                  )}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="mb-3 d-flex justify-content-start">
                <div className="p-2 rounded bg-white border" style={{ fontSize: '0.9rem' }}>
                  <div className="spinner-border spinner-border-sm me-2" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  Thinking...
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Example Questions */}
          {messages.length === 1 && (
            <div className="px-3 py-2 border-top bg-light">
              <small className="text-muted d-block mb-2" style={{ fontSize: '0.75rem' }}>
                Try asking:
              </small>
              <div className="d-flex flex-column gap-1">
                {exampleQuestions.map((question, index) => (
                  <button
                    key={index}
                    className="btn btn-sm btn-outline-primary text-start"
                    onClick={() => setInput(question)}
                    style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="p-2 border-top bg-white rounded-bottom">
            <form onSubmit={handleSubmit}>
              <div className="input-group input-group-sm">
                <textarea
                  className="form-control"
                  placeholder="Ask me anything..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={2}
                  disabled={isLoading}
                  style={{
                    resize: 'none',
                    fontSize: '0.875rem',
                    border: '1px solid #dee2e6',
                  }}
                />
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={!input.trim() || isLoading}
                  style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
                >
                  <i className="bi bi-send"></i>
                </button>
              </div>
              <small className="text-muted" style={{ fontSize: '0.7rem' }}>
                Press Enter to send
              </small>
            </form>
          </div>
        </div>
      )}

      {/* Styles */}
      <style>{`
        .markdown-content h1,
        .markdown-content h2,
        .markdown-content h3,
        .markdown-content h4 {
          font-size: 1em;
          font-weight: 600;
          margin-top: 0.5em;
          margin-bottom: 0.3em;
        }
        
        .markdown-content p {
          margin-bottom: 0.4em;
          line-height: 1.4;
        }
        
        .markdown-content ul,
        .markdown-content ol {
          margin-bottom: 0.4em;
          padding-left: 1.2em;
        }
        
        .markdown-content li {
          margin-bottom: 0.2em;
          line-height: 1.4;
        }
        
        .markdown-content code {
          background-color: #f5f5f5;
          padding: 0.1em 0.3em;
          border-radius: 3px;
          font-size: 0.85em;
        }
        
        .markdown-content strong {
          font-weight: 600;
        }

        /* Animation for chat opening */
        @keyframes slideIn {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        /* Responsive styles */
        @media (max-width: 576px) {
          .position-fixed[style*="width: 400px"] {
            width: calc(100vw - 32px) !important;
            height: calc(100vh - 32px) !important;
            bottom: 16px !important;
            right: 16px !important;
          }
        }
      `}</style>
    </>
  );
}

