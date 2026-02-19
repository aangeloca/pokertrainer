# PokerTrainer

PokerTrainer is a Duolingo-inspired poker learning web app that runs fully offline.

## Features

- Create or reuse a local username profile.
- Track XP, level, streak, and completed lessons.
- Play 3 lessons with instant answer feedback.
- Earn **+10 XP** for each correct answer.
- Unlock lessons based on your level.
- Persist all user progress in `server/db.json`.

## Tech Stack

- Frontend: HTML, CSS, JavaScript (ES6), React via CDN, TailwindCSS via CDN
- Backend: Node.js + Express
- Database: JSON file (`server/db.json`) using filesystem persistence

## Project Structure

```
/pokertrainer
  /server
    server.js
    db.json
  /client
    index.html
    app.js
    styles.css
  server.js
  package.json
  README.md
```

## Install

```bash
npm install
```

## Run

```bash
node server.js
```

The app will be available at:

- `http://localhost:3000`

## How to Use

1. Open the app in your browser.
2. Enter a username. If the username exists, it logs you in.
3. Pick an unlocked lesson from the dashboard.
4. Answer each question and read immediate feedback.
5. Save progress at the result screen to update XP, level, streak, and completed lessons.
6. Continue unlocking higher-level lessons.

## API Endpoints

- `GET /api/users`
- `POST /api/users`
- `GET /api/users/:id`
- `PUT /api/users/:id`
- `GET /api/lessons`
- `GET /api/lessons/:id`
- `POST /api/progress`

## Notes

- Level formula: `Math.floor(xp / 100)`
- Offline-first: no external backend services are used.
