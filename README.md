# PokerTrainer

PokerTrainer é um app web de treino de poker no estilo gamificado, funcionando localmente com persistência em JSON.

## Funcionalidades

- Login/criação de usuário por username.
- XP, nível e streak salvos em arquivo.
- 3 lições com perguntas e feedback imediato.
- +10 XP por resposta correta, +0 por errada.
- Lição bloqueada por nível mínimo.
- Progresso persistido em `server/db.json`.

## Stack

- Frontend: HTML + CSS + JavaScript (vanilla) + Tailwind via CDN
- Backend: Node.js (HTTP server nativo)
- Banco: JSON local (`server/db.json`) via filesystem

## Estrutura

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

```bash
npm install
```

## Execução

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

- `GET /api/users`
- `POST /api/users`
- `GET /api/users/:id`
- `PUT /api/users/:id`
- `GET /api/lessons`
- `GET /api/lessons/:id`
- `POST /api/progress`

## Regra de nível

`level = Math.floor(xp / 100)`
