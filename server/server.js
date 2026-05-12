const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = Number(process.env.PORT) || 3000;
const ROOT_PATH = path.join(__dirname, '..');
const CLIENT_PATH = path.join(ROOT_PATH, 'client');
const DB_PATH = path.join(__dirname, 'db.json');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon'
};

function readDB() {
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
}

function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

function sendJSON(res, statusCode, payload) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(payload));
}

function sendError(res, statusCode, message) {
  sendJSON(res, statusCode, { error: message });
}

function getNextId(items) {
  if (!items.length) return 1;
  return Math.max(...items.map((item) => Number(item.id) || 0)) + 1;
}

function calculateLevel(xp) {
  return Math.floor((Number(xp) || 0) / 250);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function normalizeUser(user) {
  return {
    id: user.id,
    username: user.username,
    xp: Number(user.xp) || 0,
    level: calculateLevel(user.xp),
    streak: Number(user.streak) || 0,
    completedLessons: Array.isArray(user.completedLessons) ? user.completedLessons : [],
    completedScenarios: Array.isArray(user.completedScenarios) ? user.completedScenarios : [],
    stats: {
      lessonsPlayed: Number(user.stats?.lessonsPlayed) || 0,
      scenariosPlayed: Number(user.stats?.scenariosPlayed) || 0,
      correctAnswers: Number(user.stats?.correctAnswers) || 0,
      totalAnswers: Number(user.stats?.totalAnswers) || 0,
      optimalActions: Number(user.stats?.optimalActions) || 0,
      totalActions: Number(user.stats?.totalActions) || 0,
      concepts: {
        preflop: Number(user.stats?.concepts?.preflop) || 0,
        ranges: Number(user.stats?.concepts?.ranges) || 0,
        equity: Number(user.stats?.concepts?.equity) || 0,
        potOdds: Number(user.stats?.concepts?.potOdds) || 0,
        blockers: Number(user.stats?.concepts?.blockers) || 0,
        mdf: Number(user.stats?.concepts?.mdf) || 0
      }
    }
  };
}

function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';

    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) {
        req.destroy();
        reject(new Error('Request body too large.'));
      }
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

function publicUser(user) {
  return normalizeUser(user);
}

function createUser(username) {
  return normalizeUser({
    id: 0,
    username,
    xp: 0,
    streak: 0,
    completedLessons: [],
    completedScenarios: [],
    stats: {}
  });
}

function scoreLesson(lesson, answers) {
  const answerMap = new Map((answers || []).map((item) => [String(item.questionId), item.answerIndex]));
  let correct = 0;
  const details = lesson.questions.map((question) => {
    const selectedIndex = Number(answerMap.get(String(question.id)));
    const selected = question.answers[selectedIndex];
    const isCorrect = Boolean(selected?.correct);
    if (isCorrect) correct += 1;
    return {
      questionId: question.id,
      selectedIndex: Number.isInteger(selectedIndex) ? selectedIndex : null,
      correct: isCorrect
    };
  });

  return {
    correct,
    total: lesson.questions.length,
    xpEarned: correct * 25,
    details
  };
}

function scoreScenario(scenario, action) {
  const picked = String(action || '').toLowerCase();
  const frequencies = scenario.gto?.frequencies || {};
  const bestAction = Object.entries(frequencies).sort((a, b) => b[1] - a[1])[0]?.[0] || scenario.bestAction;
  const frequency = Number(frequencies[picked]) || 0;
  const isOptimal = picked === bestAction;
  const isInMix = frequency > 0;
  const xpEarned = isOptimal ? 40 : isInMix ? 20 : 0;

  return {
    action: picked,
    bestAction,
    frequency,
    isOptimal,
    isInMix,
    xpEarned
  };
}

function updateConceptStats(user, concepts, amount) {
  for (const concept of concepts || []) {
    if (Object.prototype.hasOwnProperty.call(user.stats.concepts, concept)) {
      user.stats.concepts[concept] += amount;
    }
  }
}

async function handleApi(req, res, url) {
  const db = readDB();
  const parts = url.pathname.split('/').filter(Boolean);
  const method = req.method;

  if (method === 'GET' && url.pathname === '/api/health') {
    sendJSON(res, 200, { ok: true, app: 'PokerTrainer', version: '1.0.0' });
    return true;
  }

  if (method === 'GET' && url.pathname === '/api/bootstrap') {
    sendJSON(res, 200, {
      lessons: db.lessons,
      scenarios: db.scenarios,
      ranges: db.ranges,
      glossary: db.glossary
    });
    return true;
  }

  if (method === 'GET' && url.pathname === '/api/users') {
    sendJSON(res, 200, db.users.map(publicUser));
    return true;
  }

  if (method === 'POST' && url.pathname === '/api/users') {
    const body = await readRequestBody(req);
    const username = String(body.username || '').trim().slice(0, 24);

    if (!username) {
      sendError(res, 400, 'Username is required.');
      return true;
    }

    const existing = db.users.find((user) => user.username.toLowerCase() === username.toLowerCase());
    if (existing) {
      sendJSON(res, 200, publicUser(existing));
      return true;
    }

    const user = createUser(username);
    user.id = getNextId(db.users);
    db.users.push(user);
    writeDB(db);
    sendJSON(res, 201, publicUser(user));
    return true;
  }

  if (parts[0] === 'api' && parts[1] === 'users' && parts[2] && method === 'GET') {
    const user = db.users.find((item) => item.id === Number(parts[2]));
    if (!user) {
      sendError(res, 404, 'User not found.');
      return true;
    }

    sendJSON(res, 200, publicUser(user));
    return true;
  }

  if (method === 'GET' && url.pathname === '/api/lessons') {
    sendJSON(res, 200, db.lessons);
    return true;
  }

  if (method === 'GET' && url.pathname === '/api/scenarios') {
    sendJSON(res, 200, db.scenarios);
    return true;
  }

  if (method === 'GET' && url.pathname === '/api/ranges') {
    sendJSON(res, 200, db.ranges);
    return true;
  }

  if (method === 'POST' && url.pathname === '/api/lesson-result') {
    const body = await readRequestBody(req);
    const user = db.users.find((item) => item.id === Number(body.userId));
    const lesson = db.lessons.find((item) => item.id === Number(body.lessonId));

    if (!user) {
      sendError(res, 404, 'User not found.');
      return true;
    }

    if (!lesson) {
      sendError(res, 404, 'Lesson not found.');
      return true;
    }

    const normalized = normalizeUser(user);
    Object.assign(user, normalized);
    const result = scoreLesson(lesson, body.answers);

    user.xp += result.xpEarned;
    user.level = calculateLevel(user.xp);
    user.stats.lessonsPlayed += 1;
    user.stats.correctAnswers += result.correct;
    user.stats.totalAnswers += result.total;
    updateConceptStats(user, lesson.concepts, result.correct);

    if (!user.completedLessons.includes(lesson.id)) {
      user.completedLessons.push(lesson.id);
      user.streak += 1;
    }

    writeDB(db);
    sendJSON(res, 200, { result, user: publicUser(user) });
    return true;
  }

  if (method === 'POST' && url.pathname === '/api/scenario-result') {
    const body = await readRequestBody(req);
    const user = db.users.find((item) => item.id === Number(body.userId));
    const scenario = db.scenarios.find((item) => item.id === Number(body.scenarioId));

    if (!user) {
      sendError(res, 404, 'User not found.');
      return true;
    }

    if (!scenario) {
      sendError(res, 404, 'Scenario not found.');
      return true;
    }

    const normalized = normalizeUser(user);
    Object.assign(user, normalized);
    const result = scoreScenario(scenario, body.action);

    user.xp += result.xpEarned;
    user.level = calculateLevel(user.xp);
    user.stats.scenariosPlayed += 1;
    user.stats.totalActions += 1;
    user.stats.optimalActions += result.isOptimal ? 1 : 0;
    updateConceptStats(user, scenario.concepts, result.isOptimal ? 2 : result.isInMix ? 1 : 0);

    if (!user.completedScenarios.includes(scenario.id) && result.xpEarned > 0) {
      user.completedScenarios.push(scenario.id);
    }

    user.streak += result.xpEarned > 0 ? 1 : 0;
    user.streak = clamp(user.streak, 0, 999);

    writeDB(db);
    sendJSON(res, 200, { result, scenario, user: publicUser(user) });
    return true;
  }

  return false;
}

function sendStatic(req, res, url) {
  let requestedPath = decodeURIComponent(url.pathname);
  if (requestedPath === '/') requestedPath = '/index.html';

  const filePath = path.normalize(path.join(CLIENT_PATH, requestedPath));
  if (!filePath.startsWith(CLIENT_PATH)) {
    sendError(res, 403, 'Forbidden.');
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      fs.readFile(path.join(CLIENT_PATH, 'index.html'), (fallbackErr, fallbackData) => {
        if (fallbackErr) {
          sendError(res, 404, 'Resource not found.');
          return;
        }
        res.writeHead(200, { 'Content-Type': MIME_TYPES['.html'] });
        res.end(fallbackData);
      });
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
    res.end(data);
  });
}

function validateBuild() {
  const db = readDB();
  const required = ['users', 'lessons', 'scenarios', 'ranges', 'glossary'];
  for (const key of required) {
    if (!Object.prototype.hasOwnProperty.call(db, key)) {
      throw new Error(`Missing db key: ${key}`);
    }
  }

  if (!fs.existsSync(path.join(CLIENT_PATH, 'index.html'))) throw new Error('Missing client/index.html');
  if (!fs.existsSync(path.join(CLIENT_PATH, 'app.js'))) throw new Error('Missing client/app.js');
  if (!fs.existsSync(path.join(CLIENT_PATH, 'styles.css'))) throw new Error('Missing client/styles.css');
  console.log('PokerTrainer v1.0 build check passed.');
}

if (process.argv.includes('--check')) {
  validateBuild();
  process.exit(0);
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || `localhost:${PORT}`}`);

  try {
    if (url.pathname.startsWith('/api/')) {
      const handled = await handleApi(req, res, url);
      if (!handled) sendError(res, 404, 'API route not found.');
      return;
    }

    sendStatic(req, res, url);
  } catch (err) {
    sendError(res, 400, err.message || 'Request failed.');
  }
});

server.listen(PORT, () => {
  console.log(`PokerTrainer v1.0 running at http://localhost:${PORT}`);
});
