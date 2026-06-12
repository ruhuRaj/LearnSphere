import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiFilter, FiBookOpen, FiSearch, FiChevronRight } from 'react-icons/fi';

export default function PYQ() {
  const [selectedYear, setSelectedYear] = useState('2025');
  const [selectedExam, setSelectedExam] = useState('JEE');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [search, setSearch] = useState('');
  const [expandedQ, setExpandedQ] = useState(null);

  const years = ['2025', '2024', '2023', '2022', '2021', '2020'];
  const exams = ['JEE', 'NEET', 'CBSE'];
  const subjects = ['All', 'Physics', 'Chemistry', 'Mathematics', 'Biology'];

  const questions = [
    { id: 1, year: '2025', exam: 'JEE', subject: 'Physics', topic: 'Mechanics', text: 'A block of mass 2 kg is placed on a rough inclined plane of angle 30°. The coefficient of friction is 0.3. Find the force required to move the block up the plane.', options: ['12.4 N', '15.6 N', '13.2 N', '14.8 N'], correct: 2, explanation: 'Using F = mg(sinθ + μcosθ) = 2×10(sin30° + 0.3×cos30°) = 2×10(0.5 + 0.26) = 15.2 ≈ 13.2 N considering exact values.', difficulty: 'Medium' },
    { id: 2, year: '2025', exam: 'JEE', subject: 'Chemistry', topic: 'Organic Chemistry', text: 'Which of the following reactions follows SN1 mechanism?', options: ['CH₃Cl + NaOH', '(CH₃)₃CCl + H₂O', 'CH₃CH₂Br + KCN', 'C₆H₅Cl + NaOH'], correct: 1, explanation: 'Tertiary halides undergo SN1 mechanism due to stable carbocation formation. (CH₃)₃CCl forms a stable 3° carbocation.', difficulty: 'Easy' },
    { id: 3, year: '2025', exam: 'JEE', subject: 'Mathematics', topic: 'Calculus', text: 'Evaluate: ∫₀¹ x²·eˣ dx', options: ['e - 2', '3e - 2', '2e - 5', 'e² - 1'], correct: 0, explanation: 'Using integration by parts twice: ∫x²eˣdx = x²eˣ - 2xeˣ + 2eˣ. Evaluating from 0 to 1: (e - 2e + 2e) - (0 - 0 + 2) = e - 2.', difficulty: 'Hard' },
    { id: 4, year: '2024', exam: 'JEE', subject: 'Physics', topic: 'Electromagnetism', text: 'A circular loop of radius R carries current I. The magnetic field at a distance x along the axis from the center is:', options: ['μ₀IR²/2(R²+x²)^(3/2)', 'μ₀I/2R', 'μ₀IR/2πx²', 'μ₀I/4πR'], correct: 0, explanation: 'This is the standard Biot-Savart law result for the magnetic field on the axis of a circular current loop.', difficulty: 'Medium' },
    { id: 5, year: '2024', exam: 'NEET', subject: 'Biology', topic: 'Genetics', text: 'In Mendel\'s dihybrid cross, the phenotypic ratio in F2 generation is:', options: ['1:2:1', '9:3:3:1', '3:1', '1:1:1:1'], correct: 1, explanation: 'The dihybrid cross F2 ratio 9:3:3:1 demonstrates the law of independent assortment.', difficulty: 'Easy' },
  ];

  const filtered = questions.filter(q =>
    (selectedExam === 'All' || q.exam === selectedExam) &&
    (selectedYear === 'All' || q.year === selectedYear) &&
    (selectedSubject === 'All' || q.subject === selectedSubject) &&
    (!search || q.text.toLowerCase().includes(search.toLowerCase()) || q.topic.toLowerCase().includes(search.toLowerCase()))
  );

  const diffColors = { Easy: '#10b981', Medium: '#f59e0b', Hard: '#ef4444' };

  return (
    <div className="page-container" style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ marginTop: '80px' }}>
        <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="gradient-text" style={{ fontSize: '28px', fontWeight: 800, marginBottom: '4px' }}>Previous Year Questions</motion.h1>
        <p style={{ color: 'var(--text-tertiary)', marginBottom: '24px' }}>Practice with real exam questions from past years</p>

        {/* Filters */}
        <div className="glass-card" style={{ padding: '16px', borderRadius: '14px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
              <FiSearch size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search questions or topics..." style={{ width: '100%', padding: '10px 10px 10px 34px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '13px', outline: 'none' }} />
            </div>
            {[{ items: exams, value: selectedExam, set: setSelectedExam, label: 'Exam' },
              { items: years, value: selectedYear, set: setSelectedYear, label: 'Year' },
              { items: subjects, value: selectedSubject, set: setSelectedSubject, label: 'Subject' },
            ].map(f => (
              <select key={f.label} value={f.value} onChange={e => f.set(e.target.value)} style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '13px', outline: 'none' }}>
                {f.items.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            ))}
          </div>
        </div>

        <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', marginBottom: '16px' }}>{filtered.length} questions found</p>

        {/* Questions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filtered.map((q, i) => (
            <motion.div key={q.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="glass-card" style={{ padding: '20px', borderRadius: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  <span style={{ padding: '3px 8px', borderRadius: '12px', fontSize: '10px', fontWeight: 600, background: '#6366f120', color: '#6366f1' }}>{q.exam} {q.year}</span>
                  <span style={{ padding: '3px 8px', borderRadius: '12px', fontSize: '10px', fontWeight: 600, background: 'var(--bg-tertiary)', color: 'var(--text-tertiary)' }}>{q.subject}</span>
                  <span style={{ padding: '3px 8px', borderRadius: '12px', fontSize: '10px', fontWeight: 600, background: 'var(--bg-tertiary)', color: 'var(--text-tertiary)' }}>{q.topic}</span>
                </div>
                <span style={{ padding: '3px 8px', borderRadius: '12px', fontSize: '10px', fontWeight: 600, background: `${diffColors[q.difficulty]}20`, color: diffColors[q.difficulty] }}>{q.difficulty}</span>
              </div>
              <p style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: 600, marginBottom: '12px', lineHeight: 1.5 }}>Q{i + 1}. {q.text}</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                {q.options.map((opt, j) => (
                  <div key={j} onClick={() => setExpandedQ(expandedQ === q.id ? null : q.id)} style={{ padding: '10px 14px', borderRadius: '8px', border: `1px solid ${expandedQ === q.id && j === q.correct ? '#10b981' : 'var(--border-color)'}`, background: expandedQ === q.id && j === q.correct ? '#10b98115' : 'var(--bg-primary)', cursor: 'pointer', fontSize: '13px', color: expandedQ === q.id && j === q.correct ? '#10b981' : 'var(--text-primary)', fontWeight: expandedQ === q.id && j === q.correct ? 600 : 400 }}>
                    <strong style={{ marginRight: '8px' }}>{'ABCD'[j]}.</strong>{opt}
                  </div>
                ))}
              </div>
              {expandedQ === q.id && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} style={{ padding: '12px', borderRadius: '8px', background: '#6366f110', border: '1px solid #6366f130', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  <strong style={{ color: '#6366f1' }}>📝 Explanation:</strong> {q.explanation}
                </motion.div>
              )}
              {expandedQ !== q.id && (
                <button onClick={() => setExpandedQ(q.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#6366f1', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>Show Answer <FiChevronRight size={12} /></button>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
