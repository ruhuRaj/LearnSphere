import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiSend, FiMessageCircle, FiCpu } from 'react-icons/fi';
import { useSelector } from 'react-redux';
import api from '../../services/api';
import MessageRenderer from '../common/MessageRenderer';

export default function FloatingAI() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, role: 'ai', text: 'Hi! 👋 I\'m your AI study assistant. Ask me any doubt regarding your subjects !!' },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);
  const { isAuthenticated } = useSelector((s) => s.auth);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg = { id: Date.now(), role: 'user', text: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const { data } = await api.post('/ai/solve-doubt', {
        question: userMsg.text,
        subject: 'General',
      });
      setMessages((prev) => [
        ...prev,
        { id: Date.now(), role: 'ai', text: data.response || 'I\'m thinking... Try again in a moment!' },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: Date.now(), role: 'ai', text: 'Sorry, I\'m having trouble connecting. Please try again!' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <>
      {/* Floating Button */}
      <motion.button
        className="floating-ai-btn"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        style={{
          position: 'fixed', bottom: '24px', right: '24px', zIndex: 1000,
          width: '45px', height: '45px', borderRadius: '50%',
          background: 'linear-gradient(135deg, #6366f1, #a855f7)',
          color: '#fff', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(99, 102, 241, 0.4)',
        }}
        aria-label={isOpen ? 'Close AI chat' : 'Open AI chat'}
      >
        {isOpen ? <FiX size={24} /> : <FiMessageCircle size={24} />}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'fixed', bottom: '90px', right: '24px', zIndex: 1001,
              width: '380px', maxWidth: 'calc(100vw - 48px)', height: '500px',
              borderRadius: '16px', overflow: 'hidden',
              display: 'flex', flexDirection: 'column',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              boxShadow: '0 12px 40px rgba(0,0,0,0.3)',
            }}
          >
            {/* Header */}
            <div style={{
              padding: '16px', display: 'flex', alignItems: 'center', gap: '12px',
              background: 'linear-gradient(135deg, #6366f1, #a855f7)',
              color: '#fff',
            }}>
              <FiCpu size={20} />
              <div>
                <div style={{ fontWeight: 700, fontSize: '14px' }}>LearnSphere AI</div>
                <div style={{ fontSize: '11px', opacity: 0.8 }}>Your Study Assistant</div>
              </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  style={{
                    alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '85%',
                    padding: '10px 14px',
                    borderRadius: msg.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                    background: msg.role === 'user'
                      ? 'linear-gradient(135deg, #6366f1, #a855f7)'
                      : 'var(--bg-tertiary)',
                    color: msg.role === 'user' ? '#fff' : 'var(--text-primary)',
                    fontSize: '13px',
                    lineHeight: 1.5,
                  }}
                >
                  {msg.role === 'user' ? (
                    <div style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</div>
                  ) : (
                    <MessageRenderer content={msg.text} />
                  )}
                </div>
              ))}
              {isLoading && (
                <div style={{
                  alignSelf: 'flex-start', padding: '10px 14px',
                  borderRadius: '14px 14px 14px 4px',
                  background: 'var(--bg-tertiary)',
                  color: 'var(--text-tertiary)', fontSize: '13px',
                }}>
                  <span className="animate-pulse">Thinking...</span>
                </div>
              )}
            </div>

            {/* Input */}
            <div style={{
              padding: '12px 16px', display: 'flex', gap: '8px',
              borderTop: '1px solid var(--border-color)',
            }}>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Ask any doubt..."
                style={{
                  flex: 1, padding: '10px 14px', borderRadius: '10px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-primary)', color: 'var(--text-primary)',
                  fontSize: '13px', outline: 'none',
                }}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                style={{
                  width: '40px', height: '40px', borderRadius: '10px',
                  background: input.trim() ? 'linear-gradient(135deg, #6366f1, #a855f7)' : 'var(--bg-tertiary)',
                  color: '#fff', border: 'none', cursor: input.trim() ? 'pointer' : 'default',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <FiSend size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
