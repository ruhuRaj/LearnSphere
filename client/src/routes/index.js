/**
 * LearnSphere — Route Configuration
 * Centralized route definitions for all user roles.
 * Used by App.jsx and Navbar for consistent navigation.
 */

// ── Public Routes (no auth required) ────────
export const publicRoutes = [
  { path: '/', label: 'Home', page: 'public/Home' },
  { path: '/about', label: 'About', page: 'public/About' },
  { path: '/courses', label: 'Courses', page: 'public/Courses' },
  { path: '/courses/:id', label: 'Course Detail', page: 'public/CourseDetail' },
  { path: '/contact', label: 'Contact', page: 'public/Contact' },
  { path: '/scholarship', label: 'Scholarship', page: 'public/Scholarship' },
  { path: '/login', label: 'Sign In', page: 'public/Login' },
  { path: '/signup', label: 'Get Started', page: 'public/Signup' },
  { path: '/forum', label: 'Forum', page: 'public/Forum' },
];

// ── Student Routes ──────────────────────────
export const studentRoutes = [
  { path: '/student', label: 'Dashboard', page: 'student/Dashboard', icon: '📊' },
  { path: '/student/courses', label: 'My Courses', page: 'student/MyCourses', icon: '📚' },
  { path: '/student/learn/:courseId', label: 'Learn', page: 'student/VideoLearn', hidden: true },
  { path: '/student/tests', label: 'Mock Tests', page: 'student/MockTests', icon: '📝' },
  { path: '/student/ai-chat', label: 'AI Chat', page: 'student/AIChat', icon: '🤖' },
  { path: '/student/profile', label: 'Profile', page: 'student/Profile', icon: '👤' },
  { path: '/student/live-classes', label: 'Live Classes', page: 'student/LiveClasses', icon: '🔴' },
  { path: '/student/assignments', label: 'Assignments', page: 'student/Assignments', icon: '📋' },
  { path: '/student/leaderboard', label: 'Leaderboard', page: 'student/Leaderboard', icon: '🏆' },
  { path: '/student/pyq', label: 'PYQ', page: 'student/PYQ', icon: '📄' },
  { path: '/student/certificates', label: 'Certificates', page: 'student/Certificates', icon: '🎓' },
];

// ── Teacher Routes ──────────────────────────
export const teacherRoutes = [
  { path: '/teacher', label: 'Dashboard', page: 'teacher/Dashboard', icon: '📊' },
  { path: '/teacher/create-course', label: 'Create Course', page: 'teacher/CreateCourse', icon: '➕' },
  { path: '/teacher/students', label: 'Students', page: 'teacher/Students', icon: '👥' },
  { path: '/teacher/assignments', label: 'Assignments', page: 'teacher/Assignments', icon: '📋' },
];

// ── Admin Routes ────────────────────────────
export const adminRoutes = [
  { path: '/admin', label: 'Dashboard', page: 'admin/Dashboard', icon: '📊' },
  { path: '/admin/users', label: 'Users', page: 'admin/UserManagement', icon: '👥' },
  { path: '/admin/courses', label: 'Courses', page: 'admin/CourseApproval', icon: '📚' },
  { path: '/admin/teachers', label: 'Teacher Approvals', page: 'admin/TeacherApproval', icon: '👨‍🏫' },
  { path: '/admin/settings', label: 'Settings', page: 'admin/PlatformSettings', icon: '⚙️' },
];

// ── Parent Routes ───────────────────────────
export const parentRoutes = [
  { path: '/parent', label: 'Dashboard', page: 'parent/Dashboard', icon: '📊' },
];

// ── Protected Routes (require auth + checkout) ─
export const protectedPublicRoutes = [
  { path: '/checkout', label: 'Checkout', page: 'public/Checkout', roles: ['student'] },
  { path: '/checkout/:courseId', label: 'Checkout', page: 'public/Checkout', roles: ['student'] },
];

// ── Helper: Get routes by role ──────────────
export function getRoutesByRole(role) {
  switch (role) {
    case 'student': return studentRoutes;
    case 'teacher': return teacherRoutes;
    case 'admin': return adminRoutes;
    case 'parent': return parentRoutes;
    default: return [];
  }
}

// ── Helper: Get sidebar links (exclude hidden) ─
export function getSidebarLinks(role) {
  return getRoutesByRole(role).filter(r => !r.hidden);
}

// ── Helper: Get dashboard path by role ──────
export function getDashboardPath(role) {
  switch (role) {
    case 'admin': return '/admin';
    case 'teacher': return '/teacher';
    case 'parent': return '/parent';
    default: return '/student';
  }
}

// ── Navbar public links ─────────────────────
export const navLinks = [
  { name: 'Home', path: '/' },
  { name: 'Courses', path: '/courses' },
  { name: 'Scholarship', path: '/scholarship' },
  { name: 'Forum', path: '/forum' },
  { name: 'About', path: '/about' },
  { name: 'Contact', path: '/contact' },
];
