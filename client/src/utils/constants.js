// ── Constants ────────────────────────────
export const CATEGORIES = [
  { value: 'JEE', label: 'JEE', icon: '⚡' },
  { value: 'NEET', label: 'NEET', icon: '🧬' },
  { value: 'CBSE11', label: 'CBSE 11', icon: '📘' },
  { value: 'CBSE12', label: 'CBSE 12', icon: '📗' },
  { value: 'Bihar', label: 'Bihar Board', icon: '🏛️' },
  { value: 'Jharkhand', label: 'Jharkhand Board', icon: '🌿' },
  { value: 'Bengal', label: 'Bengal Board', icon: '🌊' },
];

export const SUBJECTS = ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'English', 'Hindi'];

export const DIFFICULTIES = [
  { value: 'Beginner', label: 'Beginner', color: '#10b981' },
  { value: 'Intermediate', label: 'Intermediate', color: '#f59e0b' },
  { value: 'Advanced', label: 'Advanced', color: '#ef4444' },
];

export const RANK_TIERS = [
  { minXP: 0, name: 'Beginner', icon: '🌱', color: '#94a3b8' },
  { minXP: 500, name: 'Learner', icon: '📖', color: '#10b981' },
  { minXP: 1500, name: 'Scholar', icon: '🎓', color: '#3b82f6' },
  { minXP: 3000, name: 'Expert', icon: '⭐', color: '#f59e0b' },
  { minXP: 5000, name: 'Genius', icon: '🧠', color: '#a855f7' },
  { minXP: 10000, name: 'Legend', icon: '🏆', color: '#ef4444' },
];

// ── Helper Functions ────────────────────
export function getRank(xp) {
  for (let i = RANK_TIERS.length - 1; i >= 0; i--) {
    if (xp >= RANK_TIERS[i].minXP) return RANK_TIERS[i];
  }
  return RANK_TIERS[0];
}

export function formatDuration(seconds) {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  const remainMins = mins % 60;
  return `${hours}h ${remainMins}m`;
}

export function formatDate(date) {
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

export function formatNumber(num) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num?.toString() || '0';
}

export function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

export function truncateText(text, maxLength = 100) {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}
