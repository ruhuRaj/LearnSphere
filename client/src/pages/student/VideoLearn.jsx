import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlinePlay, HiOutlineBookOpen, HiOutlineChatAlt2, HiOutlineDocumentText, HiOutlineCheckCircle, HiOutlineChevronDown, HiOutlineChevronRight } from 'react-icons/hi';

const chapters = [
  { title: 'Mechanics', lessons: [
    { id: 1, title: 'Introduction to Mechanics', duration: '18:30', completed: true },
    { id: 2, title: 'Newton\'s Laws of Motion', duration: '24:15', completed: true },
    { id: 3, title: 'Work, Energy & Power', duration: '22:00', completed: true },
    { id: 4, title: 'Rotational Dynamics', duration: '28:45', completed: false },
    { id: 5, title: 'Gravitation', duration: '20:10', completed: false },
  ]},
  { title: 'Thermodynamics', lessons: [
    { id: 6, title: 'Laws of Thermodynamics', duration: '25:00', completed: false },
    { id: 7, title: 'Kinetic Theory of Gases', duration: '22:30', completed: false },
    { id: 8, title: 'Heat Transfer', duration: '19:45', completed: false },
  ]},
  { title: 'Waves & Optics', lessons: [
    { id: 9, title: 'Wave Motion', duration: '21:00', completed: false },
    { id: 10, title: 'Sound Waves', duration: '18:45', completed: false },
    { id: 11, title: 'Ray Optics', duration: '26:30', completed: false },
  ]},
];

const comments = [
  { user: 'Rahul K.', text: 'Great explanation of the concept!', time: '2h ago', avatar: '👨‍🎓' },
  { user: 'Priya S.', text: 'Can you explain the derivation in more detail?', time: '5h ago', avatar: '👩‍🎓' },
];

export default function VideoLearn() {
  const { courseId } = useParams();
  const [activeLesson, setActiveLesson] = useState(chapters[0].lessons[3]); // Resume from last unwatched
  const [expandedChapter, setExpandedChapter] = useState(0);
  const [tab, setTab] = useState('lessons');
  const [notes, setNotes] = useState('');
  const [comment, setComment] = useState('');
  const [speed, setSpeed] = useState(1);

  return (
    <div className="page-container" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row">
          {/* Video Player */}
          <div className="flex-1 lg:pr-0">
            {/* Video Container */}
            <div className="relative w-full" style={{ aspectRatio: '16/9', background: '#000', borderRadius: '0 0 0 0' }}>
              <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #1e1b4b, #312e81)' }}>
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 cursor-pointer transition-transform hover:scale-110" style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)' }}>
                    <HiOutlinePlay className="w-8 h-8 text-white ml-1" />
                  </div>
                  <p className="text-white font-semibold">{activeLesson.title}</p>
                  <p className="text-indigo-200 text-sm mt-1">{activeLesson.duration}</p>
                </div>
              </div>
              {/* Speed Control */}
              <div className="absolute bottom-4 right-4 flex items-center gap-2">
                <select value={speed} onChange={(e) => setSpeed(Number(e.target.value))} className="px-2 py-1 rounded-lg text-xs font-medium text-white" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', border: 'none' }}>
                  {[0.5, 0.75, 1, 1.25, 1.5, 2].map((s) => <option key={s} value={s}>{s}x</option>)}
                </select>
              </div>
            </div>

            {/* Below Video */}
            <div className="px-4 sm:px-6 py-4">
              <h2 className="text-xl font-bold font-[Outfit] mb-1" style={{ color: 'var(--text-primary)' }}>{activeLesson.title}</h2>
              <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Complete JEE Physics • {activeLesson.duration}</p>

              {/* Tabs */}
              <div className="flex gap-1 mt-4 p-1 rounded-xl" style={{ background: 'var(--bg-tertiary)' }}>
                {[
                  { key: 'lessons', icon: HiOutlineBookOpen, label: 'Lessons' },
                  { key: 'notes', icon: HiOutlineDocumentText, label: 'Notes' },
                  { key: 'comments', icon: HiOutlineChatAlt2, label: 'Comments' },
                ].map((t) => (
                  <button key={t.key} onClick={() => setTab(t.key)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-all" style={{ background: tab === t.key ? 'var(--bg-card)' : 'transparent', color: tab === t.key ? 'var(--text-primary)' : 'var(--text-tertiary)' }}>
                    <t.icon className="w-4 h-4" /> {t.label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="mt-4 lg:hidden">
                {tab === 'lessons' && (
                  <div className="space-y-2">
                    {chapters.map((ch, ci) => (
                      <div key={ci} className="glass-card overflow-hidden">
                        <button onClick={() => setExpandedChapter(expandedChapter === ci ? -1 : ci)} className="w-full flex items-center justify-between p-3 text-left">
                          <span className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{ch.title}</span>
                          {expandedChapter === ci ? <HiOutlineChevronDown className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} /> : <HiOutlineChevronRight className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />}
                        </button>
                        {expandedChapter === ci && (
                          <div className="px-3 pb-3 space-y-1">
                            {ch.lessons.map((lesson) => (
                              <button key={lesson.id} onClick={() => setActiveLesson(lesson)} className="w-full flex items-center gap-3 p-2 rounded-lg text-left transition-colors" style={{ background: activeLesson.id === lesson.id ? 'rgba(99,102,241,0.1)' : 'transparent' }}>
                                {lesson.completed ? <HiOutlineCheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--success)' }} /> : <HiOutlinePlay className="w-4 h-4 flex-shrink-0" style={{ color: activeLesson.id === lesson.id ? 'var(--primary)' : 'var(--text-tertiary)' }} />}
                                <span className="text-xs flex-1" style={{ color: activeLesson.id === lesson.id ? 'var(--primary)' : 'var(--text-secondary)' }}>{lesson.title}</span>
                                <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{lesson.duration}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {tab === 'notes' && (
                  <div>
                    <textarea className="input" rows={8} placeholder="Take notes while watching..." value={notes} onChange={(e) => setNotes(e.target.value)} style={{ resize: 'vertical', fontFamily: 'Inter, sans-serif', fontSize: '0.875rem' }} />
                    <button className="btn btn-primary btn-sm mt-3">Save Notes</button>
                  </div>
                )}
                {tab === 'comments' && (
                  <div>
                    <div className="flex gap-2 mb-4">
                      <input className="input flex-1" placeholder="Add a comment..." value={comment} onChange={(e) => setComment(e.target.value)} />
                      <button className="btn btn-primary btn-sm">Post</button>
                    </div>
                    <div className="space-y-3">
                      {comments.map((c, i) => (
                        <div key={i} className="flex gap-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm" style={{ background: 'var(--bg-tertiary)' }}>{c.avatar}</div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{c.user}</span>
                              <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{c.time}</span>
                            </div>
                            <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>{c.text}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar - Lesson List (Desktop) */}
          <div className="hidden lg:block w-80 flex-shrink-0 overflow-y-auto" style={{ maxHeight: 'calc(100vh - var(--nav-height))', borderLeft: '1px solid var(--border-color)' }}>
            <div className="p-4">
              <h3 className="font-semibold font-[Outfit] mb-3" style={{ color: 'var(--text-primary)' }}>Course Content</h3>
              <div className="space-y-2">
                {chapters.map((ch, ci) => (
                  <div key={ci}>
                    <button onClick={() => setExpandedChapter(expandedChapter === ci ? -1 : ci)} className="w-full flex items-center justify-between p-2 rounded-lg text-left transition-colors" style={{ background: expandedChapter === ci ? 'var(--bg-tertiary)' : 'transparent' }}>
                      <span className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{ch.title}</span>
                      <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{ch.lessons.length} lessons</span>
                    </button>
                    {expandedChapter === ci && (
                      <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} className="overflow-hidden pl-2 space-y-0.5 mt-1">
                        {ch.lessons.map((lesson) => (
                          <button key={lesson.id} onClick={() => setActiveLesson(lesson)} className="w-full flex items-center gap-2.5 p-2 rounded-lg text-left transition-colors" style={{ background: activeLesson.id === lesson.id ? 'rgba(99,102,241,0.1)' : 'transparent' }}>
                            {lesson.completed ? <HiOutlineCheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--success)' }} /> : <HiOutlinePlay className="w-4 h-4 flex-shrink-0" style={{ color: activeLesson.id === lesson.id ? 'var(--primary)' : 'var(--text-tertiary)' }} />}
                            <div className="flex-1 min-w-0">
                              <p className="text-xs truncate" style={{ color: activeLesson.id === lesson.id ? 'var(--primary)' : 'var(--text-secondary)' }}>{lesson.title}</p>
                              <p className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>{lesson.duration}</p>
                            </div>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </div>
                ))}
              </div>

              {/* Notes Section - Desktop */}
              <div className="mt-6 pt-4" style={{ borderTop: '1px solid var(--border-color)' }}>
                <h4 className="font-medium text-sm mb-2" style={{ color: 'var(--text-primary)' }}>📝 My Notes</h4>
                <textarea className="input text-xs" rows={5} placeholder="Take notes..." value={notes} onChange={(e) => setNotes(e.target.value)} style={{ resize: 'vertical' }} />
                <button className="btn btn-primary btn-sm w-full mt-2">Save</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
