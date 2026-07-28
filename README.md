# HackOps AI

An AI-powered hackathon management platform that reimagines the hackathon experience for organizers, mentors, judges, and participants — AI team formation, an AI mentor assistant, AI project evaluation, idea validation, plagiarism detection, and live engagement tracking, all in one place.

## Features

- **AI Team Matching** — automatically groups solo participants into balanced teams based on skills and interests, with an AI-generated rationale for each match
- **Team Management** — create teams, browse open teams with filters, send/accept/reject join requests, leader can add members directly, capacity enforced server-side
- **AI Mentor Assistant** — persistent per-team chat, aware of hackathon rules/schedule/tracks, can review a linked GitHub repo for unstuck-suggestions
- **AI Project Evaluation** — structured AI scorecard (originality, technical depth, completeness, clarity) shown alongside a judge's manual score
- **AI Idea Validation** — pre-submission feasibility, originality, and scope check with a suggested MVP cut
- **AI Plagiarism / Similarity Detection** — embedding-based similarity scan across submissions, flags high-overlap pairs for organizer review
- **Live Engagement Dashboard** — weighted leaderboard from check-ins, chat activity, and submission updates
- **Check-in & Streaks** — daily check-in with streak tracking and badges (Profile page only)
- **Role-based Access** — participant, mentor, judge, organizer, sponsor roles with strict server-side enforcement (no client-side role selection at signup)

## Tech Stack

**Backend:** Node.js, Express, Prisma ORM, SQLite (dev) / PostgreSQL-ready, JWT auth, bcrypt, Helmet, express-rate-limit
**Frontend:** React 18, React Router, Tailwind CSS, Vite, Lucide icons
**AI:** Google Gemini (`@google/generative-ai`)

## Project Structure

```
BUILDATHON/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # Database models
│   │   └── dev.db              # SQLite database (dev only, gitignored)
│   ├── src/
│   │   ├── config/             # DB client, hackathon rules/FAQ config
│   │   ├── controllers/        # Route handlers (auth, team, mentor, submission, idea, engagement)
│   │   ├── middleware/         # JWT auth + role-based access control
│   │   ├── routes/             # Express route definitions
│   │   ├── services/           # AI service, GitHub service, similarity service
│   │   ├── scripts/            # seed.js + test scripts
│   │   └── server.js           # App entry point
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/               # Route-level pages (Dashboard, Profile, Teams, Mentor, etc.)
│   │   ├── components/          # Reusable UI components
│   │   ├── context/              # AuthContext
│   │   └── api/                  # API call wrappers
│   ├── vite.config.js
│   └── package.json
└── README.md
```

## Prerequisites

- Node.js 18+ and npm
- A [Google Gemini API key](https://aistudio.google.com/app/apikey) (free tier available)
- Optionally an [Anthropic API key](https://console.anthropic.com/) if you're using Claude for any AI features

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
DATABASE_URL="file:./dev.db"
GEMINI_API_KEY=your_gemini_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
ALLOWED_ORIGIN=http://localhost:5173
```

> ⚠️ `JWT_SECRET` has no default fallback — the server will refuse to start without it. Generate one with:
> ```bash
> node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
> ```

> `ALLOWED_ORIGIN` must match wherever your frontend actually runs (Vite's default dev server is `http://localhost:5173` — adjust if yours differs).

### 3. Set up the database

```bash
cd backend
npx prisma generate
npx prisma db push
```

This creates `prisma/dev.db` (SQLite) with all tables from `schema.prisma`.

### 4. (Optional) Seed demo data

```bash
npm run seed
```

Populates the database with sample participants, teams, and submissions for testing — uses clearly fake demo accounts, does not run automatically on server start.

### 5. Run the backend

```bash
cd backend
npm run dev
```

API server starts at `http://localhost:5000`.

### 6. Run the frontend

In a separate terminal:

```bash
cd frontend
npm run dev
```

Frontend runs at `http://localhost:5173` (Vite default).

### 7. Open the app

Visit `http://localhost:5173` in your browser. Register a new account (defaults to `participant` role) or use seeded demo accounts if you ran the seed script.

## Available Scripts

**Backend** (`cd backend`)
| Command | Description |
|---|---|
| `npm start` | Run server (production mode) |
| `npm run dev` | Run server with auto-restart on file changes |
| `npm run prisma:generate` | Regenerate Prisma client after schema changes |
| `npm run prisma:push` | Push schema changes to the database |
| `npm run seed` | Populate database with demo data |
| `npm test` | Run `test_all_features.js` |

Additional test scripts (run directly with `node`):
```bash
node src/scripts/test_security_features.js
node src/scripts/test_team_management.js
node src/scripts/test_add_member.js
```

**Frontend** (`cd frontend`)
| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview the production build locally |

## API Overview

Full endpoint reference: [`backend/docs/HackOps_AI_Postman_Collection.json`](backend/docs/HackOps_AI_Postman_Collection.json) — import into Postman for a complete, testable list of every route.

Route groups:
- `/api/auth` — register, login, staff creation, check-in
- `/api/teams` — create, browse, join requests, add member, matching, compatibility
- `/api/mentor` — chat + history
- `/api/submissions` — create, evaluate, similarity check
- `/api/ideas` — idea validation
- `/api/engagement` — dashboard, per-team stats
- `/api/notifications` — user notifications

## Security Notes

- Registration is server-locked to the `participant` role — staff accounts (organizer/mentor/judge/sponsor) can only be created by an existing organizer via a protected endpoint
- All team/submission/mentor-history routes verify the requester is either a team member or has an appropriate staff role before returning data
- Rate limiting is applied to `/login` and `/register`
- CORS is restricted to an explicit origin allow-list (`ALLOWED_ORIGIN` in `.env`), not `*`

## Switching to PostgreSQL / Supabase

The schema is Postgres-compatible. To switch:
1. Update `provider` in `backend/prisma/schema.prisma` from `sqlite` to `postgresql`
2. Set `DATABASE_URL` (and `DIRECT_URL` if using Supabase's connection pooler) in `.env`
3. Run `npx prisma migrate dev --name init_postgres`

## License

ISC
