import { useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loadUser } from './features/authSlice';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import FloatingAI from './components/layout/FloatingAI';
import ProtectedRoute, { PageLoader } from './routes/ProtectedRoute';

/* ── Lazy-loaded Pages ────────────────────── */
const Home = lazy(() => import('./pages/public/Home'));
const About = lazy(() => import('./pages/public/About'));
const CoursesPage = lazy(() => import('./pages/public/Courses'));
const CourseDetail = lazy(() => import('./pages/public/CourseDetail'));
const Contact = lazy(() => import('./pages/public/Contact'));
const Scholarship = lazy(() => import('./pages/public/Scholarship'));
const Login = lazy(() => import('./pages/public/Login'));
const Signup = lazy(() => import('./pages/public/Signup'));
const ForgotPassword = lazy(() => import('./pages/public/ForgotPassword'));
const Forum = lazy(() => import('./pages/public/Forum'));
const Checkout = lazy(() => import('./pages/public/Checkout'));

const StudentDashboard = lazy(() => import('./pages/student/Dashboard'));
const MyCourses = lazy(() => import('./pages/student/MyCourses'));
const VideoLearn = lazy(() => import('./pages/student/VideoLearn'));
const MockTests = lazy(() => import('./pages/student/MockTests'));
const AIChat = lazy(() => import('./pages/student/AIChat'));
const StudentProfile = lazy(() => import('./pages/student/Profile'));
const LiveClasses = lazy(() => import('./pages/student/LiveClasses'));
const StudentAssignments = lazy(() => import('./pages/student/Assignments'));
const Leaderboard = lazy(() => import('./pages/student/Leaderboard'));
const PYQ = lazy(() => import('./pages/student/PYQ'));
const Certificates = lazy(() => import('./pages/student/Certificates'));

const TeacherDashboard = lazy(() => import('./pages/teacher/Dashboard'));
const TeacherProfile = lazy(() => import('./pages/teacher/Profile'));
import CreateCourse from './pages/teacher/CreateCourse';
const TeacherStudents = lazy(() => import('./pages/teacher/Students'));
const TeacherAssignments = lazy(() => import('./pages/teacher/Assignments'));

const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const UserManagement = lazy(() => import('./pages/admin/UserManagement'));
const CourseApproval = lazy(() => import('./pages/admin/CourseApproval'));
const PlatformSettings = lazy(() => import('./pages/admin/PlatformSettings'));
const TeacherApproval = lazy(() => import('./pages/admin/TeacherApproval'));
const FlaggedComments = lazy(() => import('./pages/admin/FlaggedComments'));

const ParentDashboard = lazy(() => import('./pages/parent/Dashboard'));

export default function App() {
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);
  const showNavbar = !token;
  const showFooter = !token;

  useEffect(() => {
    if (token) {
      dispatch(loadUser());
    }
  }, [dispatch, token]);

  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [location.pathname]);

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      {showNavbar && <Navbar />}
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/courses/:id" element={<CourseDetail />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/scholarship" element={<Scholarship />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forum" element={<Forum />} />
          <Route path="/checkout" element={<ProtectedRoute allowedRoles={['student']}><Checkout /></ProtectedRoute>} />
          <Route path="/checkout/:courseId" element={<ProtectedRoute allowedRoles={['student']}><Checkout /></ProtectedRoute>} />

          {/* Student Routes */}
          <Route path="/student" element={<Navigate to="/student/dashboard" replace />} />
          <Route path="/student/dashboard" element={<ProtectedRoute allowedRoles={['student']}><StudentDashboard /></ProtectedRoute>} />
          <Route path="/student/courses" element={<ProtectedRoute allowedRoles={['student']}><StudentDashboard /></ProtectedRoute>} />
          <Route path="/student/notes" element={<ProtectedRoute allowedRoles={['student']}><StudentDashboard /></ProtectedRoute>} />
          <Route path="/student/lectures" element={<ProtectedRoute allowedRoles={['student']}><StudentDashboard /></ProtectedRoute>} />
          <Route path="/student/doubts" element={<ProtectedRoute allowedRoles={['student']}><StudentDashboard /></ProtectedRoute>} />
          <Route path="/student/ai" element={<ProtectedRoute allowedRoles={['student']}><StudentDashboard /></ProtectedRoute>} />
          <Route path="/student/buy-courses" element={<ProtectedRoute allowedRoles={['student']}><StudentDashboard /></ProtectedRoute>} />
          <Route path="/student/live-classes" element={<ProtectedRoute allowedRoles={['student']}><StudentDashboard /></ProtectedRoute>} />
          <Route path="/student/mock-tests" element={<ProtectedRoute allowedRoles={['student']}><StudentDashboard /></ProtectedRoute>} />
          <Route path="/student/teacher-tests" element={<ProtectedRoute allowedRoles={['student']}><StudentDashboard /></ProtectedRoute>} />
          <Route path="/student/learn/:courseId" element={<ProtectedRoute allowedRoles={['student']}><VideoLearn /></ProtectedRoute>} />
          <Route path="/student/tests" element={<Navigate to="/student/mock-tests" replace />} />
          <Route path="/student/ai-chat" element={<Navigate to="/student/ai" replace />} />
          <Route path="/student/profile" element={<ProtectedRoute allowedRoles={['student']}><StudentProfile /></ProtectedRoute>} />
          <Route path="/student/assignments" element={<ProtectedRoute allowedRoles={['student']}><StudentAssignments /></ProtectedRoute>} />
          <Route path="/student/leaderboard" element={<ProtectedRoute allowedRoles={['student']}><Leaderboard /></ProtectedRoute>} />
          <Route path="/student/pyq" element={<ProtectedRoute allowedRoles={['student']}><PYQ /></ProtectedRoute>} />
          <Route path="/student/certificates" element={<ProtectedRoute allowedRoles={['student']}><Certificates /></ProtectedRoute>} />

          {/* Teacher Routes */}
          <Route path="/teacher" element={<Navigate to="/teacher/dashboard" replace />} />
          <Route path="/teacher/dashboard" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherDashboard /></ProtectedRoute>} />
          <Route path="/teacher/notes" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherDashboard /></ProtectedRoute>} />
          <Route path="/teacher/videos" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherDashboard /></ProtectedRoute>} />
          <Route path="/teacher/doubts" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherDashboard /></ProtectedRoute>} />
          <Route path="/teacher/create-course" element={<ProtectedRoute allowedRoles={['teacher']}><CreateCourse /></ProtectedRoute>} />
          <Route path="/teacher/tests" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherDashboard /></ProtectedRoute>} />
          <Route path="/teacher/courses" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherDashboard /></ProtectedRoute>} />
          <Route path="/teacher/live" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherDashboard /></ProtectedRoute>} />
          <Route path="/teacher/profile" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherProfile /></ProtectedRoute>} />
          <Route path="/teacher/students" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherStudents /></ProtectedRoute>} />
          <Route path="/teacher/assignments" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherAssignments /></ProtectedRoute>} />

          {/* Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><UserManagement /></ProtectedRoute>} />
          <Route path="/admin/courses" element={<ProtectedRoute allowedRoles={['admin']}><CourseApproval /></ProtectedRoute>} />
          <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={['admin']}><PlatformSettings /></ProtectedRoute>} />
          <Route path="/admin/teachers" element={<ProtectedRoute allowedRoles={['admin']}><TeacherApproval /></ProtectedRoute>} />
          <Route path="/admin/flagged-comments" element={<ProtectedRoute allowedRoles={['admin']}><FlaggedComments /></ProtectedRoute>} />

          {/* Parent Routes */}
          <Route path="/parent" element={<ProtectedRoute allowedRoles={['parent']}><ParentDashboard /></ProtectedRoute>} />

          {/* 404 */}
          <Route path="*" element={
            <div className="page-container flex items-center justify-center" style={{ minHeight: '60vh' }}>
              <div className="text-center">
                <h1 className="text-6xl font-extrabold gradient-text font-[Outfit] mb-4">404</h1>
                <p className="text-lg mb-6" style={{ color: 'var(--text-secondary)' }}>Page not found</p>
                <a href="/" className="btn btn-primary">Go Home</a>
              </div>
            </div>
          } />
        </Routes>
      </Suspense>
      <FloatingAI />
      {showFooter && <Footer />}
    </div>
  );
}