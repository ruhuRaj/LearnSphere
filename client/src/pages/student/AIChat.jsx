import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { HiOutlineSparkles, HiOutlinePaperAirplane, HiOutlineBookOpen, HiOutlineAcademicCap } from 'react-icons/hi2';
import api from '../../services/api';
import MessageRenderer from '../../components/common/MessageRenderer';

const suggestedPrompts = [
  'Explain Newton\'s Third Law with examples',
  'Solve: ∫(x² + 2x)dx from 0 to 3',
  'What is the difference between mitosis and meiosis?',
  'Derive the lens maker\'s equation',
  'Explain Le Chatelier\'s Principle',
];

const initialMessages = [
  { role: 'ai', content: 'Hello! 👋 I\'m your AI Study Assistant powered by LearnSphere. I can help you with:\n\n• **Doubt solving** — Ask any academic question\n• **Step-by-step solutions** — For Physics, Chemistry, Maths, Biology\n• **Concept explanations** — Get clear, detailed explanations\n• **Practice problems** — I\'ll generate questions for you\n\nWhat would you like to learn today?', time: 'Now' },
];

export default function AIChat() {
  const { user } = useSelector((state) => state.auth);
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState('All');
  const chatEndRef = useRef(null);

  const subjects = ['All', 'Physics', 'Chemistry', 'Mathematics', 'Biology'];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendMessage = async (text) => {
    const trimmedText = text.trim();
    if (!trimmedText) return;
    const userMsg = { role: 'user', content: trimmedText, time: 'Now' };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const subject = selectedSubject === 'All' ? 'General' : selectedSubject;
      const { data } = await api.post('/ai/solve-doubt', {
        question: trimmedText,
        subject,
        context: '',
      });
      const aiMsg = { role: 'ai', content: data?.response || 'Sorry, I could not generate an answer right now.', time: 'Now' };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (error) {
      const message = error?.response?.data?.detail || error?.response?.data?.message || 'The AI service is temporarily unavailable.';
      const aiMsg = { role: 'ai', content: `Sorry — ${message}`, time: 'Now' };
      setMessages((prev) => [...prev, aiMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="page-container" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-4xl mx-auto h-[calc(100vh-var(--nav-height))] flex flex-col">
        {/* Header */}
        <div className="px-4 sm:px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border-color)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <HiOutlineSparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-semibold font-[Outfit]" style={{ color: 'var(--text-primary)' }}>AI Doubt Solver</h2>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ background: 'var(--success)' }} />
                <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Online • Powered by AI</span>
              </div>
            </div>
          </div>
          {/* Subject Filter */}
          <div className="hidden sm:flex gap-1">
            {subjects.map((s) => (
              <button key={s} onClick={() => setSelectedSubject(s)} className="px-3 py-1 rounded-full text-xs font-medium transition-all" style={{
                background: selectedSubject === s ? 'var(--primary)' : 'var(--bg-tertiary)',
                color: selectedSubject === s ? 'white' : 'var(--text-tertiary)'
              }}>{s}</button>
            ))}
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4">
          {messages.map((msg, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] ${msg.role === 'user' ? '' : 'flex gap-3'}`}>
                {msg.role === 'ai' && (
                  <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center shrink-0 mt-1">
                    <HiOutlineSparkles className="w-4 h-4 text-white" />
                  </div>
                )}
                <div className="p-4 rounded-2xl text-sm leading-relaxed" style={{
                  background: msg.role === 'user' ? 'var(--primary)' : 'var(--bg-tertiary)',
                  color: msg.role === 'user' ? 'white' : 'var(--text-primary)',
                  borderBottomRightRadius: msg.role === 'user' ? '4px' : '16px',
                  borderBottomLeftRadius: msg.role === 'ai' ? '4px' : '16px',
                  whiteSpace: msg.role === 'user' ? 'pre-line' : 'normal',
                }}>
                  {msg.role === 'user' ? (
                    msg.content
                  ) : (
                    <MessageRenderer content={msg.content} />
                  )}
                </div>
              </div>
            </motion.div>
          ))}

          {isTyping && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center shrink-0">
                <HiOutlineSparkles className="w-4 h-4 text-white" />
              </div>
              <div className="p-4 rounded-2xl" style={{ background: 'var(--bg-tertiary)', borderBottomLeftRadius: '4px' }}>
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: 'var(--text-tertiary)', animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: 'var(--text-tertiary)', animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: 'var(--text-tertiary)', animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Suggested Prompts */}
        {messages.length <= 1 && (
          <div className="px-4 sm:px-6 pb-2">
            <p className="text-xs mb-2" style={{ color: 'var(--text-tertiary)' }}>Try asking:</p>
            <div className="flex flex-wrap gap-2">
              {suggestedPrompts.map((p) => (
                <button key={p} onClick={() => sendMessage(p)} className="px-3 py-1.5 rounded-full text-xs transition-all" style={{
                  background: 'var(--bg-tertiary)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)'
                }}>{p}</button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <form onSubmit={handleSubmit} className="px-4 sm:px-6 py-4" style={{ borderTop: '1px solid var(--border-color)' }}>
          <div className="flex gap-2">
            <input className="input flex-1" placeholder="Ask any doubt — Physics, Chemistry, Maths, Biology..." value={input} onChange={(e) => setInput(e.target.value)} disabled={isTyping} />
            <button type="submit" className="btn btn-primary btn-icon" disabled={!input.trim() || isTyping} style={{ width: '2.75rem', height: '2.75rem' }}>
              <HiOutlinePaperAirplane className="w-5 h-5 rotate-90" />
            </button>
          </div>
          <p className="text-[10px] text-center mt-2" style={{ color: 'var(--text-tertiary)' }}>AI responses are for learning purposes. Always verify with your teachers.</p>
        </form>
      </div>
    </div>
  );
}
