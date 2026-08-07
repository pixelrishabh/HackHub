# HackHub AI

🔗 **Live Demo:** [effulgent-marigold-e6a92d.netlify.app](https://effulgent-marigold-e6a92d.netlify.app/)
Frontend deployed on **Netlify**, backend API deployed on **Render**, database on **MongoDB Atlas**.

An AI-powered hackathon operating system that reimagines the hackathon experience for organizers, mentors, judges, sponsors, and participants — AI team formation, a grounded AI mentor assistant, AI project evaluation, idea validation, plagiarism detection, live engagement tracking, a certificate system, and a hackathon marketplace, all in one place.

## Features

- **AI Team Matching** — automatically groups solo participants into balanced teams based on skills, experience, and interests, with an AI-generated rationale for each match and a deterministic scoring pass on top of the LLM's proposal
- **Team Management** — create teams, browse open teams with filters, send/accept/reject join requests, capacity enforced server-side
- **AI Mentor Assistant** — persistent per-team chat with 4 specialized modes (Developer, Designer, Judge, Startup Advisor), grounded in the event's actual rules/schedule/tracks, can review a linked GitHub repo and generate a 9-metric AI scorecard
- **AI Project Evaluation** — structured AI scorecard (originality, technical depth, completeness, clarity) shown alongside a judge's manual score — AI assists, a human always decides
- **AI Idea Validation** — pre-submission feasibility, originality, and scope check with a suggested MVP cut given hours remaining
- **AI Plagiarism / Similarity Detection** — embedding-based similarity scan across submissions (Gemini `text-embedding-004` + cosine similarity, TF-IDF fallback), flags high-overlap pairs for organizer review — never auto-rejected
- **Live Engagement Dashboard** — weighted leaderboard from check-ins, chat activity, and submission updates
- **Certificates** — organizers issue/upload certificates per participant per hackathon; participants download their own from a dedicated certificates view, with hash-based public verification
- **Hackathon Marketplace** — browse live, upcoming, and past hackathons with filters by track/status, view details and results
- **Check-in & Streaks** — daily check-in with streak tracking and badges
- **Role-based Access** — participant, mentor, judge, organizer, sponsor roles with strict server-side enforcement; staff roles require an invite code and are never client-selectable at signup

## Tech Stack

**Backend:** Node.js, Express, MongoDB with Mongoose, JWT auth, bcryptjs, Helmet, express-rate-limit
**Frontend:** React 18, React Router, Tailwind CSS, Vite, Framer Motion, React Three Fiber, Lucide icons
**AI:** Google Gemini (`@google/generative-ai`, `text-embedding-004`) with Groq as a faster first-attempt provider and automatic fallback between them

## Project Structure

```
BUILDATHON/
├── backend/
│   ├── src/
│   │   ├── config/             # DB connection, hackathon rules/FAQ config
│   │   ├── models/              # Mongoose schemas (User, Profile, Team, Submission,
│   │   │                        #   MentorMessage, ChatMessage, EngagementEvent,
│   │   │                        #   Certificate, Hackathon, SponsorBookmark)
│   │   ├── controllers/        # Route handlers
│   │   ├── middleware/         # JWT auth + role-based access control
│   │   ├── routes/             # Express route definitions (auth, team, mentor, submission,
│   │   │                        #   idea, profile, chat, certificate, hackathon, sponsor, analytics)
│   │   ├── services/            # AI service (Groq + Gemini fallback), GitHub service
│   │   ├── scripts/             # seed.js + test_all_endpoints.js
│   │   └── server.js            # App entry point
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/                # Route-level pages (Dashboard, Profile, Teams, Mentor,
│   │   │                          #   Marketplace, Certificates, etc.)
│   │   ├── components/          # Reusable UI components
│   │   ├── context/               # AuthContext, LanguageContext
│   │   ├── hooks/                 # useAuth, useFetch
│   │   └── api/                    # API call wrappers, one file per resource
│   ├── vite.config.js
│   └── package.json
└── README.md
```

## Prerequisites

- Node.js 18+ and npm
- A [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) connection string (free tier available), or a local MongoDB instance
- A [Google Gemini API key](https://aistudio.google.com/app/apikey) (free tier available)
- Optionally a [Groq API key](https://console.groq.com/keys) — used as a faster first-attempt AI provider before falling back to Gemini

## Local Setup

### 1. Clone and install dependencies

```bash
git clone <your-repo-url>
cd BUILDATHON

# Backend
cd backend
npm install

# Frontend (in a new terminal)
cd ../frontend
npm install
```

### 2. Configure environment variables

In `backend/`, copy the example env file and fill in your own values:

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:

```
PORT=5000
NODE_ENV=development
JWT_SECRET=replace_with_a_long_random_string
MONGODB_URI=your_mongodb_connection_string_here
GEMINI_API_KEY=your_gemini_api_key_here
GROQ_API_KEY=your_groq_api_key_here
STAFF_INVITE_CODES=code1,code2,code3
ALLOWED_ORIGIN=http://localhost:5173
```

> ⚠️ `JWT_SECRET` has no default fallback — the server refuses to start without it. Generate one with:
> ```bash
> node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
> ```

> ⚠️ `STAFF_INVITE_CODES` gates registration for mentor/judge/organizer/sponsor roles — participant registration never requires one. Generate your own codes rather than reusing any example values, and treat them as secrets.

### 3. Seed the database (optional but recommended)

```bash
cd backend
npm run seed
```

This creates one demo account per role (participant, mentor, judge, organizer, sponsor), a couple of sample teams, and some mentor chat history so the app isn't empty on first run. Credentials print to the console — do not reuse these in production.

### 4. Run locally

```bash
# Terminal 1 — backend
cd backend
npm run dev

# Terminal 2 — frontend
cd frontend
npm run dev
```

Frontend runs on `http://localhost:5173`, backend API on `http://localhost:5000`.

### 5. Run the API test script (optional)

```bash
cd backend
npm run test:api
```

## Deployment

- **Frontend** → Netlify. Build command: `npm run build`, publish directory: `dist`. Set `VITE_API_URL` to your deployed backend's `/api` URL.
- **Backend** → Render. Build command: `npm install`, start command: `npm start`. Set all variables from `.env` above in Render's Environment dashboard — never commit real values to `.env.example`.
- **Database** → MongoDB Atlas. Whitelist Render's outbound IPs (or `0.0.0.0/0` for simplicity during development only) in Atlas Network Access.
- After any change to `JWT_SECRET` or `STAFF_INVITE_CODES` in production, redeploy the backend — this will invalidate all existing user sessions, which is expected.

## Security Notes

- Roles are always enforced server-side; the client never determines what a user is authorized to do.
- Passwords are hashed with bcryptjs; the app re-fetches the user from the database on every authenticated request rather than trusting a JWT payload blindly.
- CORS is restricted to an explicit origin allow-list plus `*.vercel.app` and `*.netlify.app` — no wildcard, no unconditional fallback.
- AI-generated plagiarism flags and evaluation scores are always surfaced for human review, never used to auto-reject or auto-score a submission.

## License

Specify your license here (MIT recommended for a portfolio project).
