#  LearnSphere — AI-Powered EdTech Platform

> A comprehensive, full-stack educational platform with AI-driven features for JEE/NEET/Board exam preparation.

![Node.js](https://img.shields.io/badge/Node.js-20+-339933?logo=node.js)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![MongoDB](https://img.shields.io/badge/MongoDB-7-47A248?logo=mongodb)
![FastAPI](https://img.shields.io/badge/FastAPI-Python-009688?logo=fastapi)

## ✨ Features

### 🎓 For Students
- **Video Lectures** — HD video learning with progress tracking
- **AI Doubt Solver** — Instant step-by-step explanations powered by AI
- **Mock Tests** — Timed tests with AI-generated questions
- **Live Classes** — Real-time video classes with chat and hand-raising
- **Assignments** — Submit assignments with automated grading
- **PYQ Practice** — Previous year questions with explanations
- **Certificates** — Downloadable certificates on course completion
- **Gamification** — XP, streaks, badges, levels, and leaderboard

### 👨‍🏫 For Teachers
- **Course Management** — Create courses with chapters, videos, and notes
- **Assignment Management** — Create, review, and grade assignments
- **Student Analytics** — Track student performance and engagement
- **Live Class Hosting** — Schedule and conduct live classes

### 🛡️ For Admins
- **User Management** — Manage students, teachers, and parents
- **Course Approval** — Review and approve/reject courses
- **Teacher Approval** — Review teacher registration requests
- **Platform Settings** — Configure features, payments, and SMTP
- **Analytics Dashboard** — Revenue, enrollment, and growth metrics

### 👨‍👩‍👧 For Parents
- **Progress Monitoring** — Track child's scores, attendance, and activity
- **Course Overview** — See enrolled courses and progress

### 🤖 AI Features (Microservice)
- **Test Generation** — AI-generated topic-specific test questions
- **Doubt Solving** — Step-by-step explanations for any question
- **Content Generation** — Notes, summaries, flashcards, and quizzes
- **Comment Moderation** — Toxicity and spam detection
- **Study Planner** — Personalized weekly study schedules
- **Recommendations** — AI-driven course and topic recommendations

---

## 🏗️ Architecture

```
learn-sphere/
├── client/              # React 19 + Vite frontend
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Route pages (student/teacher/admin/parent)
│   │   ├── features/    # Redux slices
│   │   ├── hooks/       # Custom React hooks
│   │   ├── i18n/        # Internationalization (EN/HI)
│   │   ├── services/    # API client (Axios)
│   │   ├── context/     # Theme context
│   │   └── utils/       # Constants and helpers
│   └── Dockerfile
│
├── server/              # Node.js + Express 5 backend
│   ├── src/
│   │   ├── controllers/ # Route handlers
│   │   ├── models/      # Mongoose schemas
│   │   ├── routes/      # API routes
│   │   ├── middleware/   # Auth, validation, rate-limiting
│   │   ├── sockets/     # Socket.io event handlers
│   │   ├── services/    # Email service
│   │   ├── utils/       # Error handlers
│   │   └── config/      # Database config
│   └── Dockerfile
│
├── ai-service/          # Python FastAPI AI microservice
│   ├── routers/         # API endpoints
│   ├── services/        # AI service implementations
│   ├── models/          # Pydantic schemas
│   ├── utils/           # Prompt templates
│   └── Dockerfile
│
└── docker-compose.yml   # Full-stack orchestration
```

---

##  Quick Start

### Prerequisites
- **Node.js** 20+
- **Python** 3.11+
- **MongoDB** 7+ (local or Atlas)

### 1. Clone & Install

```bash
git clone <repo-url>
cd learn-sphere

# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install

# Install AI service dependencies
cd ../ai-service && pip install -r requirements.txt
```

### 2. Configure Environment

```bash
# Copy the example env file
cp server/.env.example server/.env

# Edit with your values
# Required: MONGO_URI, JWT_SECRET
# Optional: GOOGLE_CLIENT_ID, RAZORPAY_KEY, OPENAI_API_KEY
```

### 3. Start Development

```bash
# Terminal 1 — Backend
cd server && npm run dev

# Terminal 2 — Frontend
cd client && npm run dev

# Terminal 3 — AI Service
cd ai-service && uvicorn main:app --reload --port 8000
```

### 4. Using Docker (Alternative)

```bash
docker-compose up --build
```

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/forgot-password` | Send reset email |
| GET | `/api/auth/google` | Google OAuth |

### Courses
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/courses` | List courses |
| GET | `/api/courses/:id` | Course detail |
| POST | `/api/courses` | Create course (teacher) |
| PUT | `/api/courses/:id` | Update course |
| POST | `/api/courses/:id/enroll` | Enroll student |

### Tests, Doubts, Assignments, Videos, Live Classes, Payments, Notifications
> See route files in `server/src/routes/` for full API documentation.

### AI Service
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/ai/generate-test` | Generate test questions |
| POST | `/ai/solve-doubt` | AI doubt solving |
| POST | `/ai/generate-content` | Generate notes/quizzes |
| POST | `/ai/moderate-comment` | Content moderation |
| POST | `/ai/study-plan` | Generate study plan |
| GET | `/ai/recommend/:userId` | Get recommendations |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, Redux Toolkit, Framer Motion, Recharts, Vite 8 |
| **Backend** | Node.js 20, Express 5, Mongoose 9, Socket.io 4 |
| **AI Service** | Python 3.11, FastAPI, Pydantic |
| **Database** | MongoDB 7 |
| **Auth** | JWT, Google OAuth 2.0, bcrypt |
| **Payments** | Razorpay, Stripe |
| **Real-time** | Socket.io (live classes, notifications) |
| **Email** | Nodemailer |
| **Styling** | TailwindCSS 4, Custom CSS Design System |
| **i18n** | English + Hindi |
| **Deployment** | Docker, Docker Compose |

---

## 📱 Pages & Routes

| Route | Page | Role |
|-------|------|------|
| `/` | Home (Landing) | Public |
| `/courses` | Course Catalog | Public |
| `/courses/:id` | Course Detail | Public |
| `/forum` | Community Forum | Public |
| `/scholarship` | Scholarship Info | Public |
| `/student` | Student Dashboard | Student |
| `/student/tests` | Mock Tests | Student |
| `/student/live-classes` | Live Classes | Student |
| `/student/assignments` | Assignments | Student |
| `/student/pyq` | Previous Year Questions | Student |
| `/student/leaderboard` | Leaderboard | Student |
| `/student/certificates` | Certificates | Student |
| `/student/ai-chat` | AI Chat Assistant | Student |
| `/teacher` | Teacher Dashboard | Teacher |
| `/teacher/create-course` | Create Course | Teacher |
| `/teacher/assignments` | Manage Assignments | Teacher |
| `/admin` | Admin Dashboard | Admin |
| `/admin/users` | User Management | Admin |
| `/admin/courses` | Course Approval | Admin |
| `/admin/teachers` | Teacher Approval | Admin |
| `/admin/settings` | Platform Settings | Admin |
| `/parent` | Parent Dashboard | Parent |
| `/checkout` | Payment Checkout | Student |

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

Built with ❤️ for learners everywhere.
