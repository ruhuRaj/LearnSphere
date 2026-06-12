// ── Language Strings ────────────────────────
const translations = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.courses': 'Courses',
    'nav.about': 'About',
    'nav.contact': 'Contact',
    'nav.forum': 'Forum',
    'nav.scholarship': 'Scholarship',
    'nav.login': 'Sign In',
    'nav.signup': 'Get Started',
    'nav.dashboard': 'Dashboard',
    'nav.settings': 'Settings',
    'nav.logout': 'Logout',

    // Common
    'common.loading': 'Loading...',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.submit': 'Submit',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.noResults': 'No results found',
    'common.viewAll': 'View All',
    'common.learnMore': 'Learn More',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.previous': 'Previous',

    // Auth
    'auth.login': 'Login',
    'auth.signup': 'Create Account',
    'auth.email': 'Email Address',
    'auth.password': 'Password',
    'auth.confirmPassword': 'Confirm Password',
    'auth.name': 'Full Name',
    'auth.forgotPassword': 'Forgot Password?',
    'auth.noAccount': "Don't have an account?",
    'auth.hasAccount': 'Already have an account?',
    'auth.googleLogin': 'Continue with Google',

    // Dashboard
    'dashboard.welcome': 'Welcome back',
    'dashboard.streak': 'Day Streak',
    'dashboard.xp': 'Total XP',
    'dashboard.rank': 'Current Rank',
    'dashboard.courses': 'My Courses',
    'dashboard.tests': 'Mock Tests',
    'dashboard.assignments': 'Assignments',
    'dashboard.liveClasses': 'Live Classes',
    'dashboard.certificates': 'Certificates',
    'dashboard.leaderboard': 'Leaderboard',
    'dashboard.pyq': 'Previous Year Questions',

    // Courses
    'courses.title': 'Explore Courses',
    'courses.subtitle': 'Find the perfect course for your preparation',
    'courses.enrolled': 'Enrolled',
    'courses.lessons': 'lessons',
    'courses.students': 'students',
    'courses.rating': 'Rating',
    'courses.free': 'Free',
    'courses.enroll': 'Enroll Now',
    'courses.continue': 'Continue Learning',
    'courses.progress': 'Progress',

    // Tests
    'tests.title': 'Mock Tests',
    'tests.start': 'Start Test',
    'tests.timeLeft': 'Time Left',
    'tests.submit': 'Submit Test',
    'tests.score': 'Your Score',
    'tests.questions': 'Questions',
    'tests.duration': 'Duration',
    'tests.difficulty': 'Difficulty',

    // AI
    'ai.title': 'AI Assistant',
    'ai.placeholder': 'Ask any doubt...',
    'ai.generating': 'AI is thinking...',
    'ai.generateTest': 'Generate Test',
    'ai.solveDoubt': 'Solve Doubt',
    'ai.studyPlan': 'Study Plan',

    // Gamification
    'gamification.xpEarned': 'XP Earned',
    'gamification.level': 'Level',
    'gamification.streak': 'Streak',
    'gamification.badge': 'Badge',
    'gamification.leaderboard': 'Leaderboard',
    'gamification.rank': 'Rank',
  },

  hi: {
    // Navigation
    'nav.home': 'होम',
    'nav.courses': 'कोर्स',
    'nav.about': 'हमारे बारे में',
    'nav.contact': 'संपर्क',
    'nav.forum': 'फोरम',
    'nav.scholarship': 'छात्रवृत्ति',
    'nav.login': 'लॉग इन',
    'nav.signup': 'शुरू करें',
    'nav.dashboard': 'डैशबोर्ड',
    'nav.settings': 'सेटिंग्स',
    'nav.logout': 'लॉग आउट',

    // Common
    'common.loading': 'लोड हो रहा है...',
    'common.save': 'सहेजें',
    'common.cancel': 'रद्द करें',
    'common.delete': 'हटाएं',
    'common.edit': 'संपादित करें',
    'common.submit': 'जमा करें',
    'common.search': 'खोजें',
    'common.filter': 'फिल्टर',
    'common.noResults': 'कोई परिणाम नहीं मिला',
    'common.viewAll': 'सभी देखें',
    'common.learnMore': 'और जानें',
    'common.back': 'पीछे',
    'common.next': 'अगला',
    'common.previous': 'पिछला',

    // Auth
    'auth.login': 'लॉग इन',
    'auth.signup': 'खाता बनाएं',
    'auth.email': 'ईमेल पता',
    'auth.password': 'पासवर्ड',
    'auth.confirmPassword': 'पासवर्ड की पुष्टि करें',
    'auth.name': 'पूरा नाम',
    'auth.forgotPassword': 'पासवर्ड भूल गए?',
    'auth.noAccount': 'खाता नहीं है?',
    'auth.hasAccount': 'पहले से खाता है?',
    'auth.googleLogin': 'Google से जारी रखें',

    // Dashboard
    'dashboard.welcome': 'वापसी पर स्वागत',
    'dashboard.streak': 'दिन की स्ट्रीक',
    'dashboard.xp': 'कुल XP',
    'dashboard.rank': 'वर्तमान रैंक',
    'dashboard.courses': 'मेरे कोर्स',
    'dashboard.tests': 'मॉक टेस्ट',
    'dashboard.assignments': 'असाइनमेंट',
    'dashboard.liveClasses': 'लाइव क्लास',
    'dashboard.certificates': 'प्रमाणपत्र',
    'dashboard.leaderboard': 'लीडरबोर्ड',
    'dashboard.pyq': 'पिछले वर्ष के प्रश्न',

    // Courses
    'courses.title': 'कोर्स देखें',
    'courses.subtitle': 'अपनी तैयारी के लिए सही कोर्स खोजें',
    'courses.enrolled': 'नामांकित',
    'courses.lessons': 'पाठ',
    'courses.students': 'छात्र',
    'courses.rating': 'रेटिंग',
    'courses.free': 'मुफ्त',
    'courses.enroll': 'अभी नामांकित हों',
    'courses.continue': 'सीखना जारी रखें',
    'courses.progress': 'प्रगति',

    // Tests
    'tests.title': 'मॉक टेस्ट',
    'tests.start': 'टेस्ट शुरू करें',
    'tests.timeLeft': 'शेष समय',
    'tests.submit': 'टेस्ट जमा करें',
    'tests.score': 'आपका स्कोर',
    'tests.questions': 'प्रश्न',
    'tests.duration': 'अवधि',
    'tests.difficulty': 'कठिनाई',

    // AI
    'ai.title': 'AI सहायक',
    'ai.placeholder': 'कोई भी सवाल पूछें...',
    'ai.generating': 'AI सोच रहा है...',
    'ai.generateTest': 'टेस्ट बनाएं',
    'ai.solveDoubt': 'संदेह हल करें',
    'ai.studyPlan': 'अध्ययन योजना',

    // Gamification
    'gamification.xpEarned': 'XP अर्जित',
    'gamification.level': 'स्तर',
    'gamification.streak': 'स्ट्रीक',
    'gamification.badge': 'बैज',
    'gamification.leaderboard': 'लीडरबोर्ड',
    'gamification.rank': 'रैंक',
  },
};

export default translations;
