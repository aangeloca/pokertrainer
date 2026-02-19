const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = path.join(__dirname, 'db.json');
const CLIENT_PATH = path.join(__dirname, '..', 'client');

app.use(express.json());
app.use(express.static(CLIENT_PATH));

function readDB() {
  const raw = fs.readFileSync(DB_PATH, 'utf8');
  return JSON.parse(raw);
}

function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

function getNextId(items) {
  if (!items.length) return 1;
  return Math.max(...items.map((item) => item.id)) + 1;
}

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
