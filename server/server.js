const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const DB_PATH = path.join(__dirname, 'db.json');
const CLIENT_PATH = path.join(__dirname, '..', 'client');

function readDB() {
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
}

function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

function calculateLevel(xp) {
  return Math.floor(xp / 100);
}

function nextId(items) {
  if (!items.length) return 1;
  return Math.max(...items.map((item) => item.id)) + 1;
}

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
  console.log(`PokerTrainer server running on http://localhost:${PORT}`);
});
