import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { HiOutlineSparkles, HiOutlinePaperAirplane, HiOutlineBookOpen, HiOutlineAcademicCap } from 'react-icons/hi';

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

function formatAIResponse(topic) {
  const responses = {
    "newton": "**Newton's Third Law** states that for every action, there is an equal and opposite reaction.\n\n**Key Points:**\n1. Forces always occur in pairs\n2. Action and reaction forces act on *different* bodies\n3. They are equal in magnitude but opposite in direction\n\n**Examples:**\n- 🚀 A rocket pushes exhaust gases downward; gases push the rocket upward\n- 🏊 A swimmer pushes water backward; water pushes the swimmer forward\n- 📚 A book on a table: weight pushes down, normal force pushes up\n\n**Formula:** F₁₂ = -F₂₁\n\nWould you like me to solve a numerical problem on this topic?",
    "default": "Great question! Let me break this down for you.\n\n**Key Concepts:**\n1. This involves fundamental principles from your syllabus\n2. The solution approach requires understanding the underlying theory\n3. Let me walk you through step by step\n\n**Solution Approach:**\n- First, identify the given information\n- Apply the relevant formula or principle\n- Solve systematically\n\n**Pro Tip:** 💡 This type of question frequently appears in JEE/NEET exams. Practice similar problems from your PYQ bank.\n\nWant me to generate practice problems on this topic?"
  };
  const key = Object.keys(responses).find(k => topic.toLowerCase().includes(k));
  return responses[key] || responses.default;
}

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

  const sendMessage = (text) => {
    if (!text.trim()) return;
    const userMsg = { role: 'user', content: text, time: 'Now' };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiMsg = { role: 'ai', content: formatAIResponse(text), time: 'Now' };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1500 + Math.random() * 1000);
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
                  <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0 mt-1">
                    <HiOutlineSparkles className="w-4 h-4 text-white" />
                  </div>
                )}
                <div className="p-4 rounded-2xl text-sm leading-relaxed" style={{
                  background: msg.role === 'user' ? 'var(--primary)' : 'var(--bg-tertiary)',
                  color: msg.role === 'user' ? 'white' : 'var(--text-primary)',
                  borderBottomRightRadius: msg.role === 'user' ? '4px' : '16px',
                  borderBottomLeftRadius: msg.role === 'ai' ? '4px' : '16px',
                  whiteSpace: 'pre-line',
                }}>
                  {msg.content}
                </div>
              </div>
            </motion.div>
          ))}

          {isTyping && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0">
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
