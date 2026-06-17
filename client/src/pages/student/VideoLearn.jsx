import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlinePlay, HiOutlineBookOpen, HiOutlineChatAlt2, HiOutlineDocumentText, HiOutlineCheckCircle, HiOutlineChevronDown, HiOutlineChevronRight } from 'react-icons/hi';
import api from '../../services/api';

const formatDuration = (seconds) => {
  const safeSeconds = Number(seconds) || 0;
  const mins = Math.floor(safeSeconds / 60);
  const secs = safeSeconds % 60;
  return `${mins}:${String(secs).padStart(2, '0')}`;
};

const comments = [
  { user: 'Rahul K.', text: 'Great explanation of the concept!', time: '2h ago', avatar: '👨‍🎓' },
  { user: 'Priya S.', text: 'Can you explain the derivation in more detail?', time: '5h ago', avatar: '👩‍🎓' },
];

export default function VideoLearn() {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [videos, setVideos] = useState([]);
  const [activeLesson, setActiveLesson] = useState(null);
  const [expandedChapter, setExpandedChapter] = useState(0);
  const [tab, setTab] = useState('lessons');
  const [notes, setNotes] = useState('');
  const [comment, setComment] = useState('');
  const [speed, setSpeed] = useState(1);
  const [loading, setLoading] = useState(true);
  const videoRef = useRef(null);

  useEffect(() => {
    let mounted = true;

    const loadCourseData = async () => {
      try {
        setLoading(true);
        const [courseResponse, videosResponse] = await Promise.all([
          api.get(`/courses/${courseId}`),
          api.get(`/videos/course/${courseId}`),
        ]);

        if (!mounted) return;

        const nextCourse = courseResponse?.data?.course || null;
        const nextVideos = Array.isArray(videosResponse?.data?.videos) ? videosResponse.data.videos : [];

        setCourse(nextCourse);
        setVideos(nextVideos);
        setActiveLesson(nextVideos[0] || null);
      } catch (error) {
        console.error('Failed to load course learning data:', error);
        if (mounted) {
          setCourse(null);
          setVideos([]);
          setActiveLesson(null);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    if (courseId) {
      loadCourseData();
    }

    return () => {
      mounted = false;
    };
  }, [courseId]);

  const lessonGroups = useMemo(() => {
    if (!videos.length) return [];

    return videos.reduce((groups, video) => {
      const key = video.chapter || 'Course Lessons';
      if (!groups[key]) groups[key] = [];
      groups[key].push({
        ...video,
        id: video._id,
        durationLabel: formatDuration(video.duration),
        completed: false,
      });
      return groups;
    }, {});
  }, [videos]);

  const currentLesson = activeLesson || videos[0] || null;
  const currentUrl = currentLesson?.url || '';

  const getVideoType = (url) => {
    if (!url) return null;
    if (url.includes('.mp4')) return 'video/mp4';
    if (url.includes('.webm')) return 'video/webm';
    if (url.includes('.ogg') || url.includes('.ogv')) return 'video/ogg';
    return null;
  };

  const currentVideoType = getVideoType(currentUrl);
  const isYoutubeUrl = /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/.test(currentUrl);
  const youtubeIdMatch = currentUrl.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  const youtubeEmbedUrl = youtubeIdMatch ? `https://www.youtube.com/embed/${youtubeIdMatch[1]}` : '';

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.playbackRate = speed;
    }
  }, [speed, currentUrl]);

  return (
    <div className="page-container" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row">
          {/* Video Player */}
          <div className="flex-1 lg:pr-0">
            {/* Video Container */}
            <div className="relative w-full" style={{ aspectRatio: '16/9', background: '#000', borderRadius: '0 0 0 0' }}>
              {currentLesson ? (
                isYoutubeUrl ? (
                  <iframe
                    title={currentLesson.title || 'Video lesson'}
                    src={youtubeEmbedUrl}
                    className="w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video
                    key={currentUrl}
                    ref={videoRef}
                    src={currentUrl}
                    controls
                    playsInline
                    preload="metadata"
                    className="w-full h-full"
                    poster={currentLesson.thumbnail || ''}
                    crossOrigin="anonymous"
                  >
                    Your browser does not support the video tag.
                  </video>
                )
              ) : (
                <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #1e1b4b, #312e81)' }}>
                  <div className="text-center px-4">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)' }}>
                      <HiOutlinePlay className="w-8 h-8 text-white ml-1" />
                    </div>
                    <p className="text-white font-semibold">No lesson selected yet</p>
                    <p className="text-indigo-200 text-sm mt-1">Choose a lesson from the list to start watching.</p>
                  </div>
                </div>
              )}
              {/* Speed Control */}
              <div className="absolute bottom-4 right-4 flex items-center gap-2">
                <select value={speed} onChange={(e) => setSpeed(Number(e.target.value))} className="px-2 py-1 rounded-lg text-xs font-medium text-white" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', border: 'none' }}>
                  {[0.5, 0.75, 1, 1.25, 1.5, 2].map((s) => <option key={s} value={s}>{s}x</option>)}
                </select>
              </div>
            </div>

            {/* Below Video */}
            <div className="px-4 sm:px-6 py-4">
              <h2 className="text-xl font-bold font-[Outfit] mb-1" style={{ color: 'var(--text-primary)' }}>{currentLesson?.title || 'Course Lesson'}</h2>
              <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>{course?.title || 'Your course'} • {currentLesson ? `${formatDuration(currentLesson.duration)} total` : 'Loading lesson data…'}</p>

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
                    {loading ? (
                      <div className="glass-card p-3 text-sm" style={{ color: 'var(--text-secondary)' }}>Loading lesson content…</div>
                    ) : Object.keys(lessonGroups).length ? (
                      Object.entries(lessonGroups).map(([title, lessons], ci) => (
                        <div key={title} className="glass-card overflow-hidden">
                          <button onClick={() => setExpandedChapter(expandedChapter === ci ? -1 : ci)} className="w-full flex items-center justify-between p-3 text-left">
                            <span className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{title}</span>
                            {expandedChapter === ci ? <HiOutlineChevronDown className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} /> : <HiOutlineChevronRight className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />}
                          </button>
                          {expandedChapter === ci && (
                            <div className="px-3 pb-3 space-y-1">
                              {lessons.map((lesson) => (
                                <button key={lesson.id} onClick={() => setActiveLesson(lesson)} className="w-full flex items-center gap-3 p-2 rounded-lg text-left transition-colors" style={{ background: currentLesson?._id === lesson.id ? 'rgba(99,102,241,0.1)' : 'transparent' }}>
                                  {lesson.completed ? <HiOutlineCheckCircle className="w-4 h-4 shrink-0" style={{ color: 'var(--success)' }} /> : <HiOutlinePlay className="w-4 h-4 shrink-0" style={{ color: currentLesson?._id === lesson.id ? 'var(--primary)' : 'var(--text-tertiary)' }} />}
                                  <span className="text-xs flex-1" style={{ color: currentLesson?._id === lesson.id ? 'var(--primary)' : 'var(--text-secondary)' }}>{lesson.title}</span>
                                  <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{lesson.durationLabel}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="glass-card p-3 text-sm" style={{ color: 'var(--text-secondary)' }}>No lessons are available for this course yet.</div>
                    )}
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
          <div className="hidden lg:block w-80 shrink-0 overflow-y-auto" style={{ maxHeight: 'calc(100vh - var(--nav-height))', borderLeft: '1px solid var(--border-color)' }}>
            <div className="p-4">
              <h3 className="font-semibold font-[Outfit] mb-3" style={{ color: 'var(--text-primary)' }}>Course Content</h3>
              <div className="space-y-2">
                {loading ? (
                  <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Loading lesson content…</div>
                ) : Object.keys(lessonGroups).length ? (
                  Object.entries(lessonGroups).map(([title, lessons], ci) => (
                    <div key={title}>
                      <button onClick={() => setExpandedChapter(expandedChapter === ci ? -1 : ci)} className="w-full flex items-center justify-between p-2 rounded-lg text-left transition-colors" style={{ background: expandedChapter === ci ? 'var(--bg-tertiary)' : 'transparent' }}>
                        <span className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{title}</span>
                        <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{lessons.length} lessons</span>
                      </button>
                      {expandedChapter === ci && (
                        <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} className="overflow-hidden pl-2 space-y-0.5 mt-1">
                          {lessons.map((lesson) => (
                            <button key={lesson.id} onClick={() => setActiveLesson(lesson)} className="w-full flex items-center gap-2.5 p-2 rounded-lg text-left transition-colors" style={{ background: currentLesson?._id === lesson.id ? 'rgba(99,102,241,0.1)' : 'transparent' }}>
                              {lesson.completed ? <HiOutlineCheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--success)' }} /> : <HiOutlinePlay className="w-4 h-4 flex-shrink-0" style={{ color: currentLesson?._id === lesson.id ? 'var(--primary)' : 'var(--text-tertiary)' }} />}
                              <div className="flex-1 min-w-0">
                                <p className="text-xs truncate" style={{ color: currentLesson?._id === lesson.id ? 'var(--primary)' : 'var(--text-secondary)' }}>{lesson.title}</p>
                                <p className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>{lesson.durationLabel}</p>
                              </div>
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>No lesson data available yet.</div>
                )}
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
