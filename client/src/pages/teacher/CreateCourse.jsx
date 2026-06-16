import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlinePhotograph, HiOutlineBookOpen, HiOutlineCurrencyRupee, HiOutlineTag, HiOutlineSparkles, HiArrowRight, HiArrowLeft, HiOutlineCheckCircle } from 'react-icons/hi';
import api from '../../services/api';
import toast from 'react-hot-toast';

// Must match Course model enum values exactly
const categories = [
  { label: 'JEE', value: 'JEE' },
  { label: 'NEET', value: 'NEET' },
  { label: 'CBSE 11', value: 'CBSE11' },
  { label: 'CBSE 12', value: 'CBSE12' },
  { label: 'Bihar Board', value: 'Bihar' },
  { label: 'Jharkhand Board', value: 'Jharkhand' },
  { label: 'Bengal Board', value: 'Bengal' },
];
const difficulties = ['Beginner', 'Intermediate', 'Advanced'];

export default function CreateCourse() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', category: 'JEE', difficulty: 'Intermediate',
    price: '', discountPrice: '', language: 'English', tags: '',
    chapters: [{ title: '', topics: '' }],
  });

  const addChapter = () => setForm({ ...form, chapters: [...form.chapters, { title: '', topics: '' }] });
  const updateChapter = (i, field, val) => {
    const ch = [...form.chapters]; ch[i][field] = val;
    setForm({ ...form, chapters: ch });
  };
  const removeChapter = (i) => setForm({ ...form, chapters: form.chapters.filter((_, idx) => idx !== i) });

  const handleSubmit = async () => {
    // Validation
    if (!form.title.trim()) { toast.error('Course title is required'); return; }
    if (!form.description.trim()) { toast.error('Description is required'); return; }
    if (!form.price || Number(form.price) <= 0) { toast.error('Price is required'); return; }

    try {
      setSubmitting(true);

      // Prepare data for API
      const courseData = {
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        difficulty: form.difficulty,
        price: Number(form.price),
        discountPrice: form.discountPrice ? Number(form.discountPrice) : undefined,
        language: form.language,
        tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
        chapters: form.chapters
          .filter((ch) => ch.title.trim())
          .map((ch, i) => ({
            title: ch.title.trim(),
            order: i + 1,
            topics: ch.topics ? ch.topics.split(',').map((t) => t.trim()).filter(Boolean) : [],
          })),
      };

      await api.post('/courses', courseData);
      toast.success('Course created successfully! Pending admin approval.');
      navigate('/teacher');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create course');
    } finally {
      setSubmitting(false);
    }
  };

  const totalSteps = 3;

  return (
    <div className="page-container" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold font-[Outfit] mb-1" style={{ color: 'var(--text-primary)' }}>Create New Course</h1>
          <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>Fill in the details to create your course</p>

          {/* Progress Steps */}
          <div className="flex items-center gap-2 mb-8">
            {['Basic Info', 'Curriculum', 'Pricing'].map((label, i) => (
              <div key={i} className="flex items-center gap-2 flex-1">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all" style={{
                    background: step > i + 1 ? 'var(--success)' : step === i + 1 ? 'var(--primary)' : 'var(--bg-tertiary)',
                    color: step >= i + 1 ? 'white' : 'var(--text-tertiary)'
                  }}>
                    {step > i + 1 ? <HiOutlineCheckCircle className="w-5 h-5" /> : i + 1}
                  </div>
                  <span className="text-xs font-medium hidden sm:block" style={{ color: step === i + 1 ? 'var(--text-primary)' : 'var(--text-tertiary)' }}>{label}</span>
                </div>
                {i < totalSteps - 1 && <div className="flex-1 h-0.5 rounded-full" style={{ background: step > i + 1 ? 'var(--success)' : 'var(--bg-tertiary)' }} />}
              </div>
            ))}
          </div>

          {/* Step 1 - Basic Info */}
          {step === 1 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass-card p-8 space-y-5">
              <div>
                <label className="label">Course Title</label>
                <input className="input" placeholder="e.g. Complete JEE Physics" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>
              <div>
                <label className="label">Description</label>
                <textarea className="input" rows={4} placeholder="Describe what students will learn..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} style={{ resize: 'vertical' }} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Category</label>
                  <select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} style={{ appearance: 'auto' }}>
                    {categories.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Difficulty</label>
                  <select className="input" value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })} style={{ appearance: 'auto' }}>
                    {difficulties.map((d) => <option key={d}>{d}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Language</label>
                  <select className="input" value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })} style={{ appearance: 'auto' }}>
                    <option>English</option><option>Hindi</option><option>Both</option>
                  </select>
                </div>
                <div>
                  <label className="label">Tags (comma-separated)</label>
                  <input className="input" placeholder="Physics, Mechanics" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
                </div>
              </div>
              <div className="p-4 rounded-xl flex items-center gap-3 cursor-pointer" style={{ background: 'var(--bg-tertiary)', border: '2px dashed var(--border-color)' }}>
                <HiOutlinePhotograph className="w-8 h-8" style={{ color: 'var(--text-tertiary)' }} />
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Upload Thumbnail</p>
                  <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Recommended: 1280x720px, Max 5MB</p>
                </div>
              </div>
              {/* AI Content Generation */}
              <div className="p-4 rounded-xl" style={{ background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.2)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <HiOutlineSparkles className="w-5 h-5" style={{ color: 'var(--primary)' }} />
                  <span className="text-sm font-semibold" style={{ color: 'var(--primary)' }}>AI Content Assistant</span>
                </div>
                <p className="text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>Let AI generate notes, quiz questions, assignments, and summaries for your course.</p>
                <button className="btn btn-primary btn-sm"><HiOutlineSparkles className="w-4 h-4" /> Generate with AI</button>
              </div>
            </motion.div>
          )}

          {/* Step 2 - Curriculum */}
          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass-card p-8">
              <h3 className="font-semibold font-[Outfit] mb-4" style={{ color: 'var(--text-primary)' }}>Course Curriculum</h3>
              <div className="space-y-4">
                {form.chapters.map((ch, i) => (
                  <div key={i} className="p-4 rounded-xl" style={{ background: 'var(--bg-tertiary)' }}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Chapter {i + 1}</span>
                      {form.chapters.length > 1 && <button onClick={() => removeChapter(i)} className="text-xs" style={{ color: 'var(--error)' }}>Remove</button>}
                    </div>
                    <input className="input mb-3" placeholder="Chapter title" value={ch.title} onChange={(e) => updateChapter(i, 'title', e.target.value)} />
                    <input className="input" placeholder="Topics (comma-separated)" value={ch.topics} onChange={(e) => updateChapter(i, 'topics', e.target.value)} />
                  </div>
                ))}
              </div>
              <button onClick={addChapter} className="btn btn-secondary w-full mt-4">+ Add Chapter</button>
            </motion.div>
          )}

          {/* Step 3 - Pricing */}
          {step === 3 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass-card p-8 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Price (₹)</label>
                  <div className="relative">
                    <HiOutlineCurrencyRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--text-tertiary)' }} />
                    <input className="input pl-10" type="number" placeholder="2999" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label className="label">Discount Price (₹)</label>
                  <div className="relative">
                    <HiOutlineTag className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--text-tertiary)' }} />
                    <input className="input pl-10" type="number" placeholder="999" value={form.discountPrice} onChange={(e) => setForm({ ...form, discountPrice: e.target.value })} />
                  </div>
                </div>
              </div>
              {form.price && form.discountPrice && (
                <div className="p-4 rounded-xl text-center" style={{ background: 'rgba(16,185,129,0.1)' }}>
                  <p className="text-sm" style={{ color: 'var(--success)' }}>Students save <strong>{Math.round((1 - form.discountPrice / form.price) * 100)}%</strong></p>
                </div>
              )}
              <div className="p-4 rounded-xl" style={{ background: 'var(--bg-tertiary)' }}>
                <h4 className="text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Course Summary</h4>
                <div className="grid grid-cols-2 gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                  <span>Title: {form.title || '—'}</span>
                  <span>Category: {categories.find((c) => c.value === form.category)?.label || form.category}</span>
                  <span>Chapters: {form.chapters.filter((c) => c.title.trim()).length}</span>
                  <span>Difficulty: {form.difficulty}</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-6">
            <button onClick={() => setStep(Math.max(1, step - 1))} className="btn btn-secondary" disabled={step === 1}>
              <HiArrowLeft className="w-4 h-4" /> Back
            </button>
            {step < totalSteps ? (
              <button onClick={() => setStep(step + 1)} className="btn btn-primary">
                Continue <HiArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button onClick={handleSubmit} className="btn btn-primary" disabled={submitting}>
                <HiOutlineCheckCircle className="w-4 h-4" /> {submitting ? 'Creating...' : 'Publish Course'}
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
