import { Link } from 'react-router-dom';
import {
  HiOutlineAcademicCap,
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineLocationMarker,
} from 'react-icons/hi';
import {
  FaTwitter,
  FaInstagram,
  FaYoutube,
  FaLinkedinIn,
} from 'react-icons/fa';

const footerSections = [
  {
    title: 'Platform',
    links: [
      { name: 'Courses', path: '/courses' },
      { name: 'Scholarship Test', path: '/scholarship' },
      { name: 'Community', path: '/community' },
      { name: 'About Us', path: '/about' },
    ],
  },
  {
    title: 'Categories',
    links: [
      { name: 'JEE Preparation', path: '/courses?category=JEE' },
      { name: 'NEET Preparation', path: '/courses?category=NEET' },
      { name: 'CBSE Class 11', path: '/courses?category=CBSE11' },
      { name: 'CBSE Class 12', path: '/courses?category=CBSE12' },
      { name: 'State Boards', path: '/courses?category=StateBoard' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { name: 'Previous Year Papers', path: '/pyq' },
      { name: 'Mock Tests', path: '/tests' },
      { name: 'AI Doubt Solver', path: '/doubts' },
      { name: 'Study Planner', path: '/planner' },
    ],
  },
  {
    title: 'Support',
    links: [
      { name: 'Help Center', path: '/help' },
      { name: 'Contact Us', path: '/contact' },
      { name: 'Privacy Policy', path: '/privacy' },
      { name: 'Terms of Service', path: '/terms' },
    ],
  },
];

const socialLinks = [
  { icon: FaTwitter, href: '#', label: 'Twitter' },
  { icon: FaInstagram, href: '#', label: 'Instagram' },
  { icon: FaYoutube, href: '#', label: 'YouTube' },
  { icon: FaLinkedinIn, href: '#', label: 'LinkedIn' },
];

export default function Footer() {
  return (
    <footer
      className="relative"
      style={{
        background: 'var(--bg-secondary)',
        borderTop: '1px solid var(--border-color)',
      }}
    >
      {/* CTA Band */}
      <div
        className="gradient-primary py-12 relative overflow-hidden"
      >
        <div className="absolute inset-0 dot-pattern opacity-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center relative z-10">
          <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3 font-[Outfit]">
            Ready to Transform Your Learning?
          </h3>
          <p className="text-indigo-100 mb-6 max-w-xl mx-auto">
            Join thousands of students who are already excelling with AI-powered education.
          </p>
          <Link
            to="/signup"
            className="btn btn-lg inline-flex"
            style={{
              background: 'white',
              color: 'var(--primary-dark)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            }}
          >
            Start Learning — It's Free
          </Link>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {/* Brand */}
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <div
                className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center"
              >
                <HiOutlineAcademicCap className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold font-[Outfit]">
                <span className="gradient-text">Learn</span>
                <span style={{ color: 'var(--text-primary)' }}>Sphere</span>
              </span>
            </Link>
            <p className="text-sm mb-6 max-w-xs" style={{ color: 'var(--text-secondary)' }}>
              AI-powered learning platform for JEE, NEET, CBSE, and State Board students.
              Learn smarter, not harder.
            </p>
            <div className="space-y-2">
              <a
                href="mailto:hello@learnsphere.com"
                className="flex items-center gap-2 text-sm transition-colors"
                style={{ color: 'var(--text-tertiary)' }}
              >
                <HiOutlineMail className="w-4 h-4" /> hello@learnsphere.com
              </a>
              <a
                href="tel:+911234567890"
                className="flex items-center gap-2 text-sm transition-colors"
                style={{ color: 'var(--text-tertiary)' }}
              >
                <HiOutlinePhone className="w-4 h-4" /> +91 123 456 7890
              </a>
              <span
                className="flex items-center gap-2 text-sm"
                style={{ color: 'var(--text-tertiary)' }}
              >
                <HiOutlineLocationMarker className="w-4 h-4" /> India
              </span>
            </div>
          </div>

          {/* Link Sections */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h4
                className="text-sm font-semibold mb-4"
                style={{ color: 'var(--text-primary)' }}
              >
                {section.title}
              </h4>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.path}
                      className="text-sm transition-colors"
                      style={{ color: 'var(--text-tertiary)' }}
                      onMouseEnter={(e) => (e.target.style.color = 'var(--primary)')}
                      onMouseLeave={(e) => (e.target.style.color = 'var(--text-tertiary)')}
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div
        className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4"
        style={{ borderTop: '1px solid var(--border-color)' }}
      >
        <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
          © {new Date().getFullYear()} LearnSphere. All rights reserved.
        </p>
        <div className="flex items-center gap-3">
          {socialLinks.map(({ icon: Icon, href, label }) => (
            <a
              key={label}
              href={href}
              aria-label={label}
              className="w-9 h-9 rounded-lg flex items-center justify-center transition-all"
              style={{
                color: 'var(--text-tertiary)',
                background: 'var(--bg-tertiary)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'white';
                e.currentTarget.style.background = 'var(--primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--text-tertiary)';
                e.currentTarget.style.background = 'var(--bg-tertiary)';
              }}
            >
              <Icon className="w-4 h-4" />
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
