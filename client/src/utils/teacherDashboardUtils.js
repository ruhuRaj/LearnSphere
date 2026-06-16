export const formatCurrency = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);

export const buildTeacherDashboardData = (courses = [], doubts = []) => {
  const totalStudents = courses.reduce((sum, course) => sum + (Number(course.totalStudents) || 0), 0);
  const totalLectures = courses.reduce((sum, course) => sum + (Number(course.totalLessons) || 0), 0);
  const revenue = courses.reduce((sum, course) => sum + (Number(course.discountPrice) || 0) * (Number(course.totalStudents) || 0), 0);

  const courseDistribution = courses.map((course) => ({
    name: course.title,
    value: Math.max(5, Math.round(((Number(course.totalStudents) || 0) / Math.max(totalStudents, 1)) * 100)),
    totalStudents: Number(course.totalStudents) || 0,
    color: ['#6366f1', '#06b6d4', '#f59e0b', '#10b981', '#f472b6'][
      (courses.indexOf(course) + 1) % 5
    ],
  }));

  const recentDoubts = doubts.slice(0, 5).map((doubt) => ({
    id: doubt._id,
    studentName: doubt.student?.name || 'Student',
    question: doubt.question || 'No question provided',
    courseTitle: doubt.course?.title || 'General',
    createdAt: doubt.createdAt,
    avatar: doubt.student?.avatar || '🧑‍🎓',
  }));

  return {
    stats: {
      totalStudents,
      activeCourses: courses.length,
      totalLectures,
      revenue,
    },
    courseDistribution,
    recentDoubts,
    myCourses: courses.map((course) => ({
      id: course._id,
      title: course.title,
      students: Number(course.totalStudents) || 0,
      rating: Number(course.rating) || 0,
      lessons: Number(course.totalLessons) || 0,
      revenue: (Number(course.discountPrice) || 0) * (Number(course.totalStudents) || 0),
      category: course.category || 'General',
      gradient: ['linear-gradient(135deg, #6366f1, #8b5cf6)', 'linear-gradient(135deg, #06b6d4, #10b981)', 'linear-gradient(135deg, #f59e0b, #ef4444)'][courses.indexOf(course) % 3],
      emoji: ['⚛️', '🔬', '📘', '📚', '🧠'][courses.indexOf(course) % 5],
    })),
  };
};
