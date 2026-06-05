# 🔥 PrepForge — Complete Project Documentation

> **Written for everyone:** Whether you're a developer, designer, business partner, or investor — this document explains every piece of PrepForge, what it does, and how it works in plain language.

---

## 📌 What is PrepForge?

**PrepForge** is an AI-powered interview preparation platform. Think of it like a smart coaching app that:

- Lets you **practice job interviews with an AI** that behaves like a real interviewer
- **Analyzes your resume** and tells you how likely you are to pass an automated company screening system (ATS)
- **Grades your performance** after every interview and gives you specific feedback on how to improve
- Works **at lightning speed** — utilizing the powerful Groq Cloud AI engine for instant responses

---

## 🧱 The Tech Stack — What Tools Were Used to Build This

Think of the tech stack like the materials used to build a house. Here's what each one does:

| Tool / Technology | Plain English Explanation |
|---|---|
| **MongoDB** | The database — stores all user accounts, interview session records, and scores permanently |
| **Express.js** | The server framework — manages all the rules about what the server can and cannot do |
| **React.js** | The user interface builder — everything you see on screen is built with this |
| **Node.js** | The engine that runs the backend server on your computer |
| **Vite** | The development tool that runs the frontend instantly during development |
| **Socket.IO** | Enables real-time live chat between user and the AI interviewer (like WhatsApp — instant, no page reload) |
| **Tailwind CSS** | A styling system that controls all the colors, sizes, spacing, and visual design |
| **Framer Motion** | Adds the smooth animations, transitions, and moving effects throughout the UI |
| **Groq Cloud API** | A lightning-fast cloud AI engine that powers the AI interviewer and resume analysis |
| **llama-3.1** | The specific AI model used via Groq — similar to how ChatGPT uses GPT-4, we use Llama 3.1 |
| **JWT (JSON Web Tokens)** | A digital security key system that keeps user sessions secure and authenticated |
| **Multer** | A backend file handler — intercepts uploaded PDF resumes safely before processing |
| **pdf-parse** | Extracts readable text from your uploaded PDF file so the AI can analyze it |
| **bcrypt** | A password security tool — scrambles passwords before storing them so they can never be read if stolen |
| **Lucide React** | A beautiful icon library used throughout the UI (all those small symbols and icons) |

---

## 🗂️ Project Folder Structure — What Each Folder Does

```
PrepForge/
├── backend/        ← The SERVER (the brain behind the scenes)
└── frontend/       ← The WEBSITE (everything you see and click)
```

---

## ⚙️ BACKEND — The Server (The Brain)

The backend is the invisible engine. It handles all the logic, security, database communication, and AI interactions. Users never see this directly.

---

### 📄 `backend/server.js`
**The main entry point of the entire server.**

When you start the backend, this file is what actually runs. It:
- Starts the web server on port 5000
- Connects to the MongoDB database
- Loads all security protections (CORS, Helmet)
- Registers all the API routes: auth, interview, and resume
- Initializes the live WebSocket connection for real-time chat

---

### 📁 `backend/config/`

#### `db.js`
**Connects the application to the MongoDB database.**

Think of this like dialing a phone number to connect to the storage warehouse. It uses the database URL stored in the `.env` file to establish a live connection. If the connection fails, the server logs an error and exits safely.

---

### 📁 `backend/models/`

These files define the **shape of the data** stored in the database — like designing the columns in a spreadsheet.

#### `User.js`
**The blueprint for every user account.**

Defines what information is stored for each registered user:
- `name` — Full name
- `email` — Email address (must be unique)
- `password` — Stored in a scrambled (hashed) format for security — never stored as plain text
- `createdAt` — When the account was created

#### `Interview.js`
**The blueprint for every interview session saved.**

Stores a complete record of each mock interview:
- `userId` — Which user conducted this interview
- `role` — The job title they were practicing for
- `transcript` — The full conversation (every message, from both sides)
- `feedback` — The AI's written evaluation at the end
- `score` — A numeric score out of 100
- `createdAt` — When the session took place

---

### 📁 `backend/middlewares/`

Middleware is like a **checkpoint** that all requests must pass through before reaching their destination.

#### `authMiddleware.js`
**Security guard for protected routes.**

Before any sensitive operation (viewing history, starting interviews, saving settings), this middleware checks that the user is logged in by verifying their JWT security token. If the token is invalid or missing, it blocks them with a 401 Unauthorized error.

---

### 📁 `backend/controllers/`

Controllers are the **actual logic handlers** — they receive a request, do the work, and send back a response.

#### `authController.js`
**Handles all user account operations.**

- `registerUser` — Creates a new account. Validates name/email/password, checks the email isn't already taken, and stores the user with a hashed (encrypted) password.
- `loginUser` — Checks credentials and returns a secure JWT token that keeps the user logged in for 30 days.
- `getMe` — Returns the currently logged-in user's profile.
- `updateSettings` — Saves the user's AI calibration preferences (chaos mode, strictness, persona) to the database.

#### `interviewController.js`
**Handles all interview session operations.**

- `uploadResume` — Receives the PDF file uploaded before an interview. It uses `pdf-parse` to extract all the text from the resume, then feeds it to Ollama to generate a customized system context (a set of hidden instructions telling the AI what to ask about). This context is sent back to the frontend and injected into the live session.
- `finishInterview` — Called when the user ends an interview. Sends the full conversation transcript to Ollama and asks it to generate a written performance review and a numeric score out of 100. That result is saved to the database.
- `getHistory` — Returns a list of all past interview sessions for the logged-in user.

#### `resumeController.js`
**Powers the Resume Intel ATS scanning engine.**

Receives an uploaded PDF resume and a target job role. It:
1. Extracts text from the PDF
2. Sends it to Ollama with a strict prompt demanding a structured JSON response
3. Ollama returns: an ATS score (1–100), a list of missing keywords, and specific improvement suggestions
4. If Ollama is offline, it gracefully falls back to mock data so the feature still works for demos

---

### 📁 `backend/routes/`

Routes are like **signposts** — they direct incoming requests to the right controller.

#### `authRoutes.js`
Handles all authentication endpoints:
- `POST /api/auth/register` → Create account
- `POST /api/auth/login` → Log in
- `GET /api/auth/me` → Get my profile (protected)
- `PUT /api/auth/settings` → Update AI settings (protected)

#### `interviewRoutes.js`
Handles all interview session endpoints:
- `POST /api/interview/upload-resume` → Upload PDF resume
- `POST /api/interview/finish` → End interview and get graded
- `GET /api/interview/history` → Get past interviews

#### `resumeRoutes.js`
Handles the Resume Intel endpoint:
- `POST /api/resume/intel` → Analyze resume against target role

---

### 📁 `backend/services/`

#### `socketService.js`
**The real-time live chat engine — the heart of the mock interview.**

This is one of the most complex and important files. It uses WebSockets (via Socket.IO) to enable instant, bi-directional communication between the user and the AI during a live interview session.

Key behaviors:
- When a user **joins an interview room**, their resume context and personal AI settings are stored in memory for that session
- When the user **sends a message**, the service:
  1. Increments a message counter
  2. Retrieves the stored resume context and LLM settings
  3. Dynamically modifies the AI's instructions based on persona, strictness, and chaos mode
  4. Calls the Local Ollama AI with a carefully crafted prompt
  5. Streams the AI's response back to the user instantly
- If Ollama is offline, it falls back to a mock response and warns the user (only once, not on every message)

---

## 🖥️ FRONTEND — The Website (What You See)

The frontend is everything visible in the browser. Built with React, it is a single-page application — meaning the page never fully reloads, making everything feel fast and smooth.

---

### 📄 `frontend/src/main.jsx`
**The very first file that runs in the browser.**

Attaches the React application to the HTML page. Wraps the app in the `AuthProvider` and `ThemeProvider` so every page has access to user login state and the light/dark theme setting.

### 📄 `frontend/src/App.jsx`
**The traffic controller — manages navigation and routing.**

Defines which URL path shows which page:
- `/` → Landing page (public)
- `/login` → Login page (public)
- `/register` → Register page (public)
- `/dashboard` → Main dashboard (requires login)
- `/mock-interviews` → Mock interviews page (requires login)
- `/resume-intel` → Resume ATS page (requires login)
- `/interview/:id` → Live interview room (requires login)

Also wraps the entire app in socket, auth, and theme context providers.

### 📄 `frontend/src/index.css`
**The global visual style sheet.**

Controls the overall look and feel:
- Color palette (dark background, cyan accents, purple gradients)
- Font families (Inter for body text, Outfit for headings)
- Glass card visual effects (frosted glass appearance)
- Light mode overrides — when toggled, specific CSS rules flip colors site-wide without touching individual component code
- Smooth scroll behavior for in-page anchor navigation

---

### 📁 `frontend/src/context/`

Contexts are **global state containers** — they let any component anywhere in the app access shared data without passing it down manually.

#### `AuthContext.jsx`
**Manages all user login state.**

Stores the logged-in user's data, JWT token, and exposes functions:
- `register()` — Register a new account
- `login()` — Log in with email/password
- `logout()` — Clear the session
- `updateUserSettings()` — Save AI configuration to the backend and update local state

Any component can access `user`, `token`, and `loading` from this context.

#### `SocketContext.jsx`
**Manages the live WebSocket connection.**

Creates and maintains the real-time Socket.IO connection to the backend server. Exposes the `socket` object so the interview room can send and receive messages instantly.

#### `ThemeContext.jsx`
**Manages the light/dark mode toggle.**

Stores a boolean `isLightMode`. When toggled, it adds or removes a `light` CSS class from the document's `<html>` element. All the theming happens through CSS rules, so no components need individual changes.

---

### 📁 `frontend/src/hooks/`

Hooks are **reusable pieces of logic** that can be plugged into any component.

#### `useSpeech.js`
**Powers voice input and text-to-speech output in the interview room.**

- Uses the browser's built-in Speech Recognition API to convert spoken words into text
- Uses the browser's Speech Synthesis API to read the AI's responses aloud
- Exposes `isListening`, `toggleListening()`, `speakText()`, and `stopSpeaking()` functions

---

### 📁 `frontend/src/utils/`

#### `api.js`
**A pre-configured HTTP client.**

A single Axios instance with the backend server URL and JWT token automatically injected into every request header. All API calls across the entire frontend go through this file.

---

### 📁 `frontend/src/pages/`

Pages are the **full-screen views** rendered based on the URL.

#### `Landing.jsx`
**The public-facing homepage (what visitors see first).**

Sections:
- **Hero Section** — Bold headline, main call-to-action button ("Start Practicing Free")
- **Dashboard Preview** — A visual teaser of the platform
- **How PrepForge Works** — 3-step explainer: Upload Resume → Face the AI → Review Analytics
- **Features Section** — 6 feature cards highlighting what the platform offers
- **Philosophy Section** — "Why We Built PrepForge" — an honest founder statement replacing fake testimonials
- **CTA Section** — Final push to get users to register
- **Footer** — Copyright

#### `Login.jsx`
**The login form.**

A premium-styled form with email and password fields. On success, stores the JWT token and redirects to the dashboard.

#### `Register.jsx`
**The account creation form.**

Collects name, email, and password. Creates the account and auto-logs in on success.

#### `Dashboard.jsx`
**The main hub after logging in.**

Displays:
- Welcome message with the user's name
- 4 statistics cards: Total Interviews, Average Score, Questions Answered, Hours Practiced
- Recent Mock Sessions — a list of the last 5 interviews with score badges
- Focus Areas panel — shows the feedback summary from the most recent session

All data is fetched live from the database on page load.

#### `InterviewRoom.jsx`
**The live AI mock interview experience.**

This is the most complex page. It contains:
- **Left Panel** — An animated Bot avatar. When the AI is "thinking", it pulses with a cyan glow. A Microphone button enables or disables voice input. The Red End button terminates the session.
- **Right Panel** — A real-time chat interface. Messages appear with smooth animations. The AI has a distinct visual style from the user's messages.
- **TTS Integration** — The AI's messages are spoken aloud automatically via the browser's Speech Synthesis API  
- **Session Logic** — On room join, the user's resume context and LLM settings are transmitted to the backend via WebSockets so the AI is fully personalized before the first message
- **Interview Ending** — When the session is ended, the full transcript is sent to the backend for grading and a detailed Feedback Modal appears

#### `ResumeIntel.jsx`
**The ATS Resume Score Analysis Engine.**

A 3-state UI:
1. **Upload State** — A Target Role text input + a PDF drag & drop zone. When both are filled, the "Launch Intel Analysis" button activates.
2. **Scanning State** — A futuristic scan animation with a moving gradient overlay while the AI processes.
3. **Results Dashboard** — Shows:
   - An animated circular SVG progress ring showing the ATS Score (green/amber/red based on strength)
   - A grid of "Missing Keyword" chips
   - A numbered list of strategic improvement recommendations

#### `MockInterviews.jsx`
**Placeholder page for the upcoming Mock Interview scheduler.**

Currently contains an informational stub. Future feature will include a full interview booking system.

---

### 📁 `frontend/src/components/`

Reusable building blocks used across multiple pages.

#### 📁 `layout/AppLayout.jsx`
**The wrapper around every protected (logged-in) page.**

Holds the `Sidebar` and `Topbar` together and renders the page content in between. Manages the collapsed/expanded state of the sidebar.

#### 📁 `layout/Sidebar.jsx`
**The left-side navigation panel inside the app.**

Contains:
- PrepForge brand logo and name
- Navigation links to Dashboard, Mock Interviews, and Resume Intel
- Active page highlighting with cyan glow
- A collapse/expand toggle button
- Light/Dark mode toggle button at the bottom

#### 📁 `layout/Topbar.jsx`
**The top header bar inside the app.**

Contains:
- A search bar (UI ready, functionality to be connected)
- Current user's name and "Pro Forager" badge
- User avatar with initials
- Logout button

#### 📁 `layout/Navbar.jsx`
**The top navigation bar on the public (non-logged-in) pages.**

Contains:
- PrepForge logo and brand name
- Navigation links: Features, How it Works, Philosophy — all smooth-scroll to their respective landing page sections
- Login and Register buttons for visitors
- Dashboard + Logout for logged-in users

#### 📁 `modals/ConfigureInterviewModal.jsx`
**The setup dialog shown before starting an interview.**

Allows the user to:
- Select a Target Role with smart autocomplete dropdown (trending engineering roles)
- Upload a PDF Resume via a drag-and-drop zone
- Submit to prepare the AI and enter the interview room

Sending the form uploads the resume to the backend, which processes it through Ollama to generate a personalized interview context.

#### 📁 `modals/InterviewFeedbackModal.jsx`
**The post-interview report card.**

Appears automatically when an interview session is ended. Displays:
- Numerical score out of 100 with a colored badge
- Full AI-written feedback and performance evaluation
- Navigation back to the dashboard

#### 📁 `routing/ProtectedRoute.jsx`
**A route security wrapper.**

If a user tries to directly visit `/dashboard` or any protected URL without being logged in, this component redirects them to the login page automatically.

---

## 🔒 Security & Privacy

| What | How It's Protected |
|---|---|
| Passwords | Never stored as plain text. Scrambled with bcrypt (one-way encryption) before saving |
| Sessions | JWT tokens valid for 30 days. Stored in browser localStorage |
| File Uploads | Resume PDFs are held only in server memory (RAM), never written to disk |
| AI Processing | 100% local via Ollama — your resume text never leaves your machine to a third-party AI |
| API Routes | All sensitive endpoints protected by `authMiddleware` JWT verification |

---

## 🌐 How a Typical User Journey Works

```
1. User visits / (Landing Page)
2. Clicks "Start Practicing Free" → goes to /register
3. Registers an account → JWT token issued → redirected to /dashboard
4. Clicks "Start New Interview" → ConfigureInterviewModal opens
5. Types target role, uploads PDF resume
6. Backend parses PDF text → Ollama generates custom interview context
7. User enters /interview/:id room
8. Socket.IO connects user to backend in real-time
9. User types or speaks → message sent to server via WebSocket
10. Server builds AI prompt using resume context
11. Ollama processes and responds → response emitted back to client
12. Response appears in chat AND is spoken aloud (TTS)
13. User clicks "End Interview" → transcript sent for grading
14. Ollama scores performance → result saved to MongoDB
15. InterviewFeedbackModal displays score and written feedback
16. User can navigate to /resume-intel to get ATS analysis of their resume at any time
```

---

## 🚀 How to Run the Project

### Prerequisites
- Node.js installed on your computer
- MongoDB Atlas account (or local MongoDB)
- Ollama installed locally with the `llama3` model pulled

### Backend
```bash
cd backend
npm install
# Configure .env with MONGO_URI and JWT_SECRET
npm run dev     # Starts on port 5000
```

### Frontend
```bash
cd frontend
npm install
npm run dev     # Starts on port 5173
```

### Ollama (for live AI)
```bash
ollama pull llama3
ollama serve     # Must be running for real AI responses
```

> **Note:** If Ollama is not running, the platform automatically falls back to "Mock Mode" — pre-written responses still let you test all UI features without needing the AI active.

---

## 📊 Quick Feature Summary Table

| Feature | Where | Status |
|---|---|---|
| User Registration & Login | `/register`, `/login` | ✅ Live |
| JWT Authentication | All protected routes | ✅ Live |
| Dashboard with Real Stats | `/dashboard` | ✅ Live |
| Resume PDF Upload & Parsing | Pre-interview modal | ✅ Live |
| Live AI Mock Interview (Chat) | `/interview/:id` | ✅ Live |
| Voice Input (Microphone) | Interview Room | ✅ Live |
| AI Text-to-Speech | Interview Room | ✅ Live |
| Interview Grading & Feedback | Post-interview modal | ✅ Live |
| Interview History | Dashboard | ✅ Live |
| Resume ATS Scoring Engine | `/resume-intel` | ✅ Live |
| Light / Dark Mode | Sidebar toggle | ✅ Live |
| Smart Role Autocomplete | Pre-interview modal | ✅ Live |
| Smooth Page Scroll Navigation | Navbar links | ✅ Live |
| Mock Mode (Ollama offline) | Interview + Resume Intel | ✅ Live |
| Mock Interview Scheduler | `/mock-interviews` | 🔜 Planned |

---

*PrepForge — Democratizing the Technical Interview. Built with ❤️ and futurism.*
