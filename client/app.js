const state = {
  user: null,
  lessons: [],
  activeLesson: null,
  questionIndex: 0,
  score: 0,
  answers: [],
  selectedAnswer: null
};

const ui = {
  error: document.getElementById('global-error'),
  loginSection: document.getElementById('login-section'),
  dashboardSection: document.getElementById('dashboard-section'),
  lessonSection: document.getElementById('lesson-section'),
  resultSection: document.getElementById('result-section'),
  loginForm: document.getElementById('login-form'),
  usernameInput: document.getElementById('username-input'),
  welcomeText: document.getElementById('welcome-text'),
  xpValue: document.getElementById('xp-value'),
  levelValue: document.getElementById('level-value'),
  streakValue: document.getElementById('streak-value'),
  xpProgressText: document.getElementById('xp-progress-text'),
  xpProgressFill: document.getElementById('xp-progress-fill'),
  lessonList: document.getElementById('lesson-list'),
  lessonTitle: document.getElementById('lesson-title'),
  lessonProgressText: document.getElementById('lesson-progress-text'),
  lessonProgressFill: document.getElementById('lesson-progress-fill'),
  questionCard: document.getElementById('question-card'),
  nextBtn: document.getElementById('next-btn'),
  resultXp: document.getElementById('result-xp'),
  resultScore: document.getElementById('result-score'),
  logoutBtn: document.getElementById('logout-btn'),
  exitLessonBtn: document.getElementById('exit-lesson-btn'),
  resultBackBtn: document.getElementById('result-back-btn'),
  resultSaveBtn: document.getElementById('result-save-btn')
};

function showError(message = '') {
  if (!message) {
    ui.error.classList.add('hidden');
    ui.error.textContent = '';
    return;
  }

  ui.error.textContent = message;
  ui.error.classList.remove('hidden');
}

async function api(path, options) {
  const res = await fetch(path, options);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Erro na API.');
  }

  return data;
}

function showSection(name) {
  ui.loginSection.classList.add('hidden');
  ui.dashboardSection.classList.add('hidden');
  ui.lessonSection.classList.add('hidden');
  ui.resultSection.classList.add('hidden');

  if (name === 'login') ui.loginSection.classList.remove('hidden');
  if (name === 'dashboard') ui.dashboardSection.classList.remove('hidden');
  if (name === 'lesson') ui.lessonSection.classList.remove('hidden');
  if (name === 'result') ui.resultSection.classList.remove('hidden');
}

function renderDashboard() {
  const user = state.user;
  ui.welcomeText.textContent = `Olá, ${user.username} 👋`;
  ui.xpValue.textContent = user.xp;
  ui.levelValue.textContent = user.level;
  ui.streakValue.textContent = user.streak;

  const currentChunk = user.xp % 100;
  ui.xpProgressText.textContent = `${currentChunk}/100`;
  ui.xpProgressFill.style.width = `${currentChunk}%`;

  ui.lessonList.innerHTML = '';

  state.lessons
    .sort((a, b) => a.id - b.id)
    .forEach((lesson) => {
      const locked = user.level < lesson.levelRequired;
      const completed = user.completedLessons.includes(lesson.id);

      const card = document.createElement('article');
      card.className = 'bg-white border-2 border-slate-200 rounded-2xl p-4 flex justify-between items-center gap-3';

      const info = document.createElement('div');
      info.innerHTML = `
        <h3 class="font-extrabold text-lg text-slate-800">${lesson.title}</h3>
        <p class="text-sm text-slate-600">${lesson.description}</p>
        <p class="text-xs mt-2 text-slate-500">Requer nível ${lesson.levelRequired}</p>
      `;

      const btn = document.createElement('button');
      btn.className = 'px-4 py-2 rounded-xl font-bold';
      btn.textContent = locked ? 'Bloqueada' : completed ? 'Refazer' : 'Jogar';
      btn.disabled = locked;

      if (locked) btn.classList.add('bg-slate-200', 'text-slate-500', 'cursor-not-allowed');
      if (!locked && completed) btn.classList.add('bg-amber-400', 'text-amber-900');
      if (!locked && !completed) btn.classList.add('bg-emerald-500', 'text-white');

      btn.addEventListener('click', () => startLesson(lesson.id));

      card.appendChild(info);
      card.appendChild(btn);
      ui.lessonList.appendChild(card);
    });
}

function updateLessonProgress() {
  const total = state.activeLesson.questions.length;
  const percent = Math.round((state.questionIndex / total) * 100);
  ui.lessonProgressText.textContent = `${percent}%`;
  ui.lessonProgressFill.style.width = `${percent}%`;
}

function renderQuestion() {
  const question = state.activeLesson.questions[state.questionIndex];
  const answerLocked = state.selectedAnswer !== null;

  ui.questionCard.innerHTML = '';

  const title = document.createElement('h3');
  title.className = 'text-xl font-black text-slate-800';
  title.textContent = question.question;
  ui.questionCard.appendChild(title);

  const answersWrap = document.createElement('div');
  answersWrap.className = 'grid gap-3';

  question.answers.forEach((answer, index) => {
    const btn = document.createElement('button');
    btn.className = 'text-left p-3 rounded-2xl font-semibold border-2 border-slate-200 hover:border-emerald-300';
    btn.textContent = answer.text;
    btn.disabled = answerLocked;

    btn.addEventListener('click', () => handleAnswer(index));
    answersWrap.appendChild(btn);
  });

  ui.questionCard.appendChild(answersWrap);

  if (answerLocked) {
    renderFeedback(question);
  }

  ui.nextBtn.disabled = !answerLocked;
  ui.nextBtn.textContent =
    state.questionIndex + 1 >= state.activeLesson.questions.length ? 'Ver resultado' : 'Próxima';
}

function renderFeedback(question) {
  const box = document.createElement('div');
  box.className = 'rounded-2xl p-4 bg-slate-50 border border-slate-200';

  const text = document.createElement('p');
  text.className = `font-black ${state.selectedAnswer.correct ? 'text-emerald-700' : 'text-red-600'}`;
  text.textContent = state.selectedAnswer.correct ? 'Correta! +10 XP' : 'Errada. +0 XP';

  const explanation = document.createElement('p');
  explanation.className = 'text-sm text-slate-600 mt-1';
  explanation.textContent = question.explanation;

  box.appendChild(text);
  box.appendChild(explanation);
  ui.questionCard.appendChild(box);
}

function handleAnswer(answerIndex) {
  const question = state.activeLesson.questions[state.questionIndex];
  const answer = question.answers[answerIndex];
  const correct = !!answer.correct;

  state.selectedAnswer = { answerIndex, correct };
  state.answers.push({ questionId: question.id, correct });

  if (correct) state.score += 10;

  renderQuestion();
}

function startLesson(lessonId) {
  state.activeLesson = state.lessons.find((lesson) => lesson.id === lessonId);
  state.questionIndex = 0;
  state.score = 0;
  state.answers = [];
  state.selectedAnswer = null;

  ui.lessonTitle.textContent = state.activeLesson.title;
  updateLessonProgress();
  renderQuestion();
  showSection('lesson');
}

function nextQuestion() {
  if (!state.selectedAnswer) return;

  const total = state.activeLesson.questions.length;

  if (state.questionIndex + 1 >= total) {
    ui.resultXp.textContent = `Você ganhou ${state.score} XP nesta lição.`;
    ui.resultScore.textContent = `Acertos: ${state.answers.filter((item) => item.correct).length}/${total}`;
    showSection('result');
    return;
  }

  state.questionIndex += 1;
  state.selectedAnswer = null;
  updateLessonProgress();
  renderQuestion();
}

async function saveProgress() {
  try {
    const data = await api('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: state.user.id,
        lessonId: state.activeLesson.id,
        xpEarned: state.score
      })
    });

    state.user = data.user;
    state.activeLesson = null;
    showError('');
    renderDashboard();
    showSection('dashboard');
  } catch (err) {
    showError(err.message);
  }
}

async function loginOrCreate(username) {
  const users = await api('/api/users');
  const found = users.find((item) => item.username.toLowerCase() === username.toLowerCase());
  if (found) return found;

  return api('/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username })
  });
}

async function init() {
  try {
    state.lessons = await api('/api/lessons');
    showSection('login');
    showError('');
  } catch (err) {
    showError('Não foi possível carregar as lições.');
  }
}

ui.loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const username = ui.usernameInput.value.trim();

  if (!username) {
    showError('Digite um nome de usuário.');
    return;
  }

  try {
    state.user = await loginOrCreate(username);
    ui.usernameInput.value = '';
    showError('');
    renderDashboard();
    showSection('dashboard');
  } catch (err) {
    showError(err.message);
  }
});

ui.logoutBtn.addEventListener('click', () => {
  state.user = null;
  state.activeLesson = null;
  showError('');
  showSection('login');
});

ui.exitLessonBtn.addEventListener('click', () => {
  state.activeLesson = null;
  renderDashboard();
  showSection('dashboard');
});

ui.nextBtn.addEventListener('click', nextQuestion);
ui.resultBackBtn.addEventListener('click', () => {
  state.activeLesson = null;
  renderDashboard();
  showSection('dashboard');
});
ui.resultSaveBtn.addEventListener('click', saveProgress);

init();
