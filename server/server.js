build - pokertrainer - gamified - poker - learning - app - vxy6dv
const http = require('http');
const fs = require('fs');
const path = require('path');


const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = path.join(__dirname, 'db.json');
const CLIENT_PATH = path.join(__dirname, '..', 'client');

build - pokertrainer - gamified - poker - learning - app - vxy6dv
function readDB() {
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));

  app.use(express.json());
  app.use(express.static(CLIENT_PATH));

  function readDB() {
    const raw = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(raw);
  }

  function writeDB(data) {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
  }

  build - pokertrainer - gamified - poker - learning - app - vxy6dv
  function calculateLevel(xp) {
    return Math.floor(xp / 100);
  }

  function nextId(items) {

    function getNextId(items) {
      if (!items.length) return 1;
      return Math.max(...items.map((item) => item.id)) + 1;
    }

    build - pokertrainer - gamified - poker - learning - app - vxy6dv
    function sendJSON(res, statusCode, payload) {
      res.writeHead(statusCode, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(payload));
    }

    function sendFile(res, filePath, contentType) {
      fs.readFile(filePath, (err, data) => {
        if (err) {
          sendJSON(res, 404, { error: 'Resource not found.' });
          return;
        }

        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
      });
    }

    function readRequestBody(req) {
      return new Promise((resolve, reject) => {
        let body = '';

        req.on('data', (chunk) => {
          body += chunk;
        });

        req.on('end', () => {
          if (!body) {
            resolve({});
            return;
          }

          try {
            resolve(JSON.parse(body));
          } catch (err) {
            reject(new Error('Invalid JSON body.'));
          }
        });

        req.on('error', reject);
      });
    }

    async function handleApi(req, res, url) {
      const method = req.method;
      const parts = url.pathname.split('/').filter(Boolean);

      if (method === 'GET' && url.pathname === '/api/users') {
        const db = readDB();
        sendJSON(res, 200, db.users);
        return true;
      }

      if (method === 'POST' && url.pathname === '/api/users') {
        const body = await readRequestBody(req);
        const username = (body.username || '').trim();

        if (!username) {
          sendJSON(res, 400, { error: 'Username is required.' });
          return true;
        }

        const db = readDB();
        const exists = db.users.find((user) => user.username.toLowerCase() === username.toLowerCase());
        if (exists) {
          sendJSON(res, 409, { error: 'Username already exists.' });
          return true;
        }

        const user = {
          id: nextId(db.users),
          username,
          xp: 0,
          level: 0,
          streak: 0,
          completedLessons: []
        };

        db.users.push(user);
        writeDB(db);
        sendJSON(res, 201, user);
        return true;
      }

      if (parts[0] === 'api' && parts[1] === 'users' && parts[2]) {
        const userId = Number(parts[2]);
        const db = readDB();
        const userIndex = db.users.findIndex((user) => user.id === userId);

        if (userIndex === -1) {
          sendJSON(res, 404, { error: 'User not found.' });
          return true;
        }

        if (method === 'GET') {
          sendJSON(res, 200, db.users[userIndex]);
          return true;
        }

        if (method === 'PUT') {
          const updates = await readRequestBody(req);
          const updated = { ...db.users[userIndex], ...updates };
          updated.level = calculateLevel(updated.xp || 0);
          db.users[userIndex] = updated;
          writeDB(db);
          sendJSON(res, 200, updated);
          return true;
        }
      }

      if (method === 'GET' && url.pathname === '/api/lessons') {
        const db = readDB();
        sendJSON(res, 200, db.lessons);
        return true;
      }

      if (parts[0] === 'api' && parts[1] === 'lessons' && parts[2] && method === 'GET') {
        const lessonId = Number(parts[2]);
        const db = readDB();
        const lesson = db.lessons.find((item) => item.id === lessonId);

        if (!lesson) {
          sendJSON(res, 404, { error: 'Lesson not found.' });
          return true;
        }

        sendJSON(res, 200, lesson);
        return true;
      }

      if (method === 'POST' && url.pathname === '/api/progress') {
        const body = await readRequestBody(req);
        const db = readDB();

        const user = db.users.find((item) => item.id === Number(body.userId));
        const lesson = db.lessons.find((item) => item.id === Number(body.lessonId));

        if (!user) {
          sendJSON(res, 404, { error: 'User not found.' });
          return true;
        }

        if (!lesson) {
          sendJSON(res, 404, { error: 'Lesson not found.' });
          return true;
        }

        user.xp += Number(body.xpEarned) || 0;
        user.level = calculateLevel(user.xp);

        if (!user.completedLessons.includes(lesson.id)) {
          user.completedLessons.push(lesson.id);
          user.streak += 1;
        }

        writeDB(db);
        sendJSON(res, 200, { message: 'Progress saved successfully.', user });
        return true;
      }

      return false;
    }

    const server = http.createServer(async (req, res) => {
      const url = new URL(req.url, `http://${req.headers.host}`);

      try {
        const handledApi = await handleApi(req, res, url);
        if (handledApi) return;
      } catch (err) {
        sendJSON(res, 400, { error: err.message || 'Request error.' });
        return;
      }

      if (url.pathname === '/styles.css') {
        sendFile(res, path.join(CLIENT_PATH, 'styles.css'), 'text/css');
        return;
      }

      if (url.pathname === '/app.js') {
        sendFile(res, path.join(CLIENT_PATH, 'app.js'), 'text/javascript');
        return;
      }

      sendFile(res, path.join(CLIENT_PATH, 'index.html'), 'text/html');
    });

    server.listen(PORT, () => {

      function calculateLevel(xp) {
        return Math.floor(xp / 100);
      }

      app.get('/api/users', (req, res) => {
        const db = readDB();
        res.json(db.users);
      });

      app.post('/api/users', (req, res) => {
        const { username } = req.body;

        if (!username || !username.trim()) {
          return res.status(400).json({ error: 'Username is required.' });
        }

        const db = readDB();
        const existingUser = db.users.find(
          (user) => user.username.toLowerCase() === username.trim().toLowerCase()
        );

        if (existingUser) {
          return res.status(409).json({ error: 'Username already exists.' });
        }

        const newUser = {
          id: getNextId(db.users),
          username: username.trim(),
          xp: 0,
          level: 0,
          streak: 0,
          completedLessons: []
        };

        db.users.push(newUser);
        writeDB(db);
        res.status(201).json(newUser);
      });

      app.get('/api/users/:id', (req, res) => {
        const userId = Number(req.params.id);
        const db = readDB();
        const user = db.users.find((item) => item.id === userId);

        if (!user) {
          return res.status(404).json({ error: 'User not found.' });
        }

        res.json(user);
      });

      app.put('/api/users/:id', (req, res) => {
        const userId = Number(req.params.id);
        const updates = req.body;
        const db = readDB();
        const userIndex = db.users.findIndex((item) => item.id === userId);

        if (userIndex === -1) {
          return res.status(404).json({ error: 'User not found.' });
        }

        const user = db.users[userIndex];
        const updatedUser = {
          ...user,
          ...updates
        };

        updatedUser.level = calculateLevel(updatedUser.xp || 0);

        db.users[userIndex] = updatedUser;
        writeDB(db);

        res.json(updatedUser);
      });

      app.get('/api/lessons', (req, res) => {
        const db = readDB();
        res.json(db.lessons);
      });

      app.get('/api/lessons/:id', (req, res) => {
        const lessonId = Number(req.params.id);
        const db = readDB();
        const lesson = db.lessons.find((item) => item.id === lessonId);

        if (!lesson) {
          return res.status(404).json({ error: 'Lesson not found.' });
        }

        res.json(lesson);
      });

      app.post('/api/progress', (req, res) => {
        const { userId, lessonId, xpEarned = 0 } = req.body;
        const db = readDB();

        const user = db.users.find((item) => item.id === Number(userId));
        const lesson = db.lessons.find((item) => item.id === Number(lessonId));

        if (!user) {
          return res.status(404).json({ error: 'User not found.' });
        }

        if (!lesson) {
          return res.status(404).json({ error: 'Lesson not found.' });
        }

        user.xp += Number(xpEarned) || 0;
        user.level = calculateLevel(user.xp);

        if (!user.completedLessons.includes(lesson.id)) {
          user.completedLessons.push(lesson.id);
          user.streak += 1;
        }

        writeDB(db);

        res.json({
          message: 'Progress saved successfully.',
          user
        });
      });

      app.get('*', (req, res) => {
        res.sendFile(path.join(CLIENT_PATH, 'index.html'));
      });

      app.listen(PORT, () => {
        console.log(`PokerTrainer server running on http://localhost:${PORT}`);
      });
