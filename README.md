# PokerTrainer v1.0

App local de treino de poker com fundamentos GTO, progresso persistente e drills de decisao.

## O que esta incluido

- Login/criacao de usuario local por nome.
- Dashboard com XP, nivel, streak, precisao e dominio por conceito.
- 4 licoes guiadas sobre GTO, ranges, posicao, pot odds, MDF, blockers e blefes.
- Drill GTO com spots preflop, flop, turn e river.
- Feedback por frequencia: acao principal, acao mista e acao fora da estrategia base.
- Matriz de ranges preflop por posicao.
- Glossario de conceitos essenciais.
- Persistencia em `server/db.json`.
- Sem dependencias externas: roda com Node.js puro.

## Como rodar

```bash
npm start
```

Acesse:

```text
http://localhost:3000
```

## Build/check

```bash
npm run build
```

Esse comando valida a estrutura basica do app, os arquivos do cliente e o banco JSON.

## Estrutura

```text
pokertrainer-main/
  client/
    index.html
    styles.css
    app.js
  server/
    server.js
    db.json
  server.js
  package.json
```

## API

- `GET /api/health`
- `GET /api/bootstrap`
- `GET /api/users`
- `POST /api/users`
- `GET /api/users/:id`
- `GET /api/lessons`
- `GET /api/scenarios`
- `GET /api/ranges`
- `POST /api/lesson-result`
- `POST /api/scenario-result`

## Regra de nivel

```text
level = Math.floor(xp / 250)
```

Este v1.0 e um treinador educacional. As frequencias e ranges sao simplificados para estudo e podem variar conforme rake, stack, formato, tamanho de aposta e populacao.
