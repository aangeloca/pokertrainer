# PokerTrainer

PokerTrainer is a Duolingo-inspired poker training web app built with **Next.js**, **React**, **Supabase**, and **TailwindCSS**.

## Features

- Authentication (signup/login)
- User XP, level, and streak tracking
- Lessons organized by level
- Multiple-choice questions with single-answer selection
- Gamified XP progression (level up every 100 XP)
- Completed lesson tracking + optional review mode
- Modern UI with progress bar, XP counter, and level indicator

## Tech Stack

- Next.js (App Router)
- React
- Supabase (Postgres)
- TailwindCSS

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_project_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

3. Run database migration + seed in Supabase SQL editor:

- `supabase/migrations/001_init.sql`
- `supabase/seed.sql`

4. Start development server:

```bash
npm run dev
```

Open `http://localhost:3000`.

## API Routes

- `POST /api/auth/signup` - Create account
- `POST /api/auth/login` - Authenticate user
- `GET /api/lessons?userId=<id>&review=true|false` - List lessons
- `GET /api/lessons/:id` - Get lesson questions + answers
- `POST /api/answer` - Submit selected answer, award XP
- `GET /api/progress` - Fetch profile + completed lessons
- `POST /api/progress` - Mark lesson completed

## Database Schema

Tables:

- `users`
- `lessons`
- `questions`
- `answers`
- `progress`

See SQL files in `supabase/` for full schema and sample data.
