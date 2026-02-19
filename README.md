# PokerTrainer

PokerTrainer é um app web de treino de poker no estilo gamificado, funcionando localmente com persistência em JSON.
PokerTrainer is a Duolingo-inspired poker learning web app that runs fully offline.

## Funcionalidades

- Login/criação de usuário por username.
- XP, nível e streak salvos em arquivo.
- 3 lições com perguntas e feedback imediato.
- +10 XP por resposta correta, +0 por errada.
- Lição bloqueada por nível mínimo.
- Progresso persistido em `server/db.json`.

- Create or reuse a local username profile.
- Track XP, level, streak, and completed lessons.
- Play 3 lessons with instant answer feedback.
- Earn **+10 XP** for each correct answer.
- Unlock lessons based on your level.
- Persist all user progress in `server/db.json`.

## Stack

- Frontend: HTML + CSS + JavaScript (vanilla) + Tailwind via CDN
- Backend: Node.js (HTTP server nativo)
- Banco: JSON local (`server/db.json`) via filesystem

## Estrutura

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

## Instalação

## Install

```bash
npm install
```

## Execução
## Run

```bash
node server.js
```

Acesse: `http://localhost:3000`

## Como testar rápido

1. Abra o site, crie um usuário e entre.
2. Jogue a primeira lição e finalize.
3. Clique em **Salvar progresso**.
4. Volte ao dashboard e confirme XP/Nível/Streak atualizados.
5. Reinicie o servidor e confira que os dados continuam (persistência no `db.json`).

## Endpoints

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

## Regra de nível

`level = Math.floor(xp / 100)`
## Notes

- Level formula: `Math.floor(xp / 100)`
- Offline-first: no external backend services are used.
