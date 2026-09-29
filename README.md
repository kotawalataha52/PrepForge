<div align="center">
  <br />
  <img src="./frontend/public/favicon.svg" alt="PrepForge Logo" width="80" height="80" />
  <h1>PrepForge</h1>
  <p><strong>Next-Generation AI Technical Interview Platform & ATS Resume Studio</strong></p>
  
  <p>
    <img src="https://img.shields.io/badge/React-18-blue?logo=react" alt="React" />
    <img src="https://img.shields.io/badge/Vite-8-purple?logo=vite" alt="Vite" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?logo=tailwind-css" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/Node.js-Express-green?logo=node.js" alt="Node.js" />
    <img src="https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb" alt="MongoDB" />
    <img src="https://img.shields.io/badge/AI-Google_Gemini_2.0-orange?logo=google" alt="Google Gemini" />
  </p>
</div>

---

## 📌 Overview

**PrepForge** is a full-stack, AI-powered career acceleration and technical interview preparation platform. It combines real-time multi-modal AI interview simulations (voice dialogue + interactive live coding) with an intelligent ATS Resume Optimization Studio that tailors resumes against target job descriptions and exports print-ready PDFs.

Built with modern MERN architecture, PrepForge helps software engineers sharpen their Data Structures & Algorithms, System Design, and behavioral communication skills with instant, quantified AI feedback.

---

## ✨ Key Features

### 🎙️ 1. Interactive AI Mock Interviews
- **Voice-Enabled Simulation:** Conduct live spoken dialogue using integrated Web Speech Recognition and Text-to-Speech (TTS).
- **Embedded Monaco Code Editor:** Write, test, and debug code in real time with syntax highlighting and multi-language support (JavaScript, Python, C++, Java, Go).
- **Adaptive DSA & System Design Questions:** Dynamic question bank with intelligent deduplication to prevent repetitive problems.
- **Granular Post-Interview Scorecards:** Instant AI feedback breaking down code correctness, time complexity, algorithmic efficiency, and communication clarity.

### 📄 2. Smart Resume Tailor & Live Document Studio
- **ATS Resume Intelligence:** Upload your PDF or paste resume text to analyze keyword alignment, impact metrics, and missing requirements against any target Job Description.
- **Section-by-Section AI Rewriter:** Automatically re-engineers achievements into quantified bullet points with action verbs.
- **Dual-Pane Live Editor:** Real-time in-place editing with full **Add**, **Remove**, and **Edit** controls for Contact Info, Executive Summary, Work Experience, Skills (categorized into Languages, Frameworks, Tools, Practices), Projects, and Education.
- **Template Switcher:** Switch between **Clean Tech** (modern sans-serif) and **Ivy Minimal** (academic serif) styles.
- **Instant Client-Side PDF Export:** Download high-resolution vector/canvas PDFs via `html2canvas` and `jsPDF` or print directly via browser print sheet styling (`@media print`).
- **Live ATS Re-Scorer:** Re-audits your ATS match score instantly as you make manual edits in the Live Editor.

### 📊 3. Analytics & Candidate Dashboard
- **Performance History:** Track mock interview scores, readiness trends, and interview breakdown history.
- **Radar & Skill Metrics:** Identify strengths and knowledge gaps across various engineering competencies.
- **Curated Action Items:** Personalized AI recommendations based on recent interview sessions.

### 🔐 4. Authentication & Security
- Secure JWT-based authentication with bcrypt password encryption.
- Protected API routes, Multer file upload validation, and custom error boundaries.

---

## 🛠️ Tech Stack

| Domain | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS v4, Framer Motion, Monaco Editor (`@monaco-editor/react`), Lucide React |
| **Backend** | Node.js, Express.js, Socket.io, Multer, `pdf-parse`, `bcrypt`, `jsonwebtoken`, `helmet`, `cors` |
| **Database** | MongoDB & Mongoose ODM |
| **AI Engine** | Google Gemini 2.0 API (`@google/genai` / `@google/generative-ai`), OpenAI API integration support |
| **PDF Generation** | `jsPDF`, `html2canvas` |

---

## 📁 Project Structure

```text
PrepForge/
├── backend/
│   ├── config/             # Database connection (MongoDB)
│   ├── controllers/        # Route controllers (Auth, Interview, Resume)
│   ├── middleware/         # Auth verification & file upload handlers
│   ├── models/             # Mongoose schemas (User, Interview, Resume)
│   ├── routes/             # Express API routes (/api/auth, /api/interview, /api/resume)
│   ├── services/           # Gemini AI service, Socket.io handlers, ATS parser
│   ├── uploads/            # Temporary storage for uploaded resumes
│   ├── package.json
│   └── server.js           # Express app & HTTP server entry point
│
├── frontend/
│   ├── public/             # Favicons, logo assets, static manifests
│   ├── src/
│   │   ├── assets/         # Images, illustrations, and SVG graphics
│   │   ├── components/     # UI components (Logo, Navbar, Sidebar, Monaco Editor)
│   │   ├── context/        # Auth & Application State Contexts
│   │   ├── pages/          # Dashboard, Interview, ResumeTailor, Login, Register
│   │   ├── utils/          # Axios API client, helpers, storage utilities
│   │   ├── App.jsx         # App routing & protected route layouts
│   │   ├── main.jsx        # Root entry point
│   │   └── index.css       # Tailwind CSS v4 styles & custom scrollbars
│   ├── package.json
│   └── vite.config.js
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [MongoDB](https://www.mongodb.com/) (Local instance or MongoDB Atlas cluster URI)
- [Google Gemini API Key](https://aistudio.google.com/)

---

### Installation & Setup

#### 1. Clone the repository
```bash
git clone https://github.com/kotawalataha52/PrepForge.git
cd PrepForge
```

#### 2. Backend Configuration
Navigate to the `backend` folder and install dependencies:
```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/prepforge
# Or your MongoDB Atlas connection string:
# MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/prepforge?retryWrites=true&w=majority

JWT_SECRET=your_super_secret_jwt_key_here
GEMINI_API_KEY=your_google_gemini_api_key_here
```

Start the backend server:
```bash
# Development mode with nodemon
npm run dev

# Or production mode
npm start
```
*Backend runs on `http://localhost:5000`.*

---

#### 3. Frontend Configuration
In a new terminal window, navigate to the `frontend` folder:
```bash
cd frontend
npm install
```

Start the Vite development server:
```bash
npm run dev
```
*Frontend runs on `http://localhost:5173`.*

---

## 🔌 API Reference Overview

### Auth Endpoints (`/api/auth`)
- `POST /api/auth/register` — Register a new candidate account.
- `POST /api/auth/login` — Authenticate and receive JWT token.
- `GET /api/auth/user` — Fetch authenticated user profile.

### Interview Endpoints (`/api/interview`)
- `POST /api/interview/start` — Initialize a new AI mock interview session.
- `POST /api/interview/message` — Submit candidate response / code submission and receive AI feedback.
- `POST /api/interview/finish` — Complete session and generate detailed scorecard report.
- `GET /api/interview/history` — Retrieve past interview sessions and performance analytics.

### Resume Intelligence Endpoints (`/api/resume`)
- `POST /api/resume/analyze` — Parse uploaded PDF and perform ATS gap analysis against Job Description.
- `POST /api/resume/rewrite` — Full section-by-section AI resume tailoring.
- `POST /api/resume/rescore` — Instant live ATS re-score computation for modified resume data.

---

<div align="center">
  <br />
  <p>⚡ <strong>Built with passion & precision by <a href="https://github.com/kotawalataha52" target="_blank">Taha Kotawala</a></strong> ⚡</p>
  <p><sub>Empowering software engineers to ace interviews and forge high-impact careers.</sub></p>
</div>
