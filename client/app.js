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
const { useEffect, useMemo, useState } = React;

function ProgressBar({ current, total }) {
  const percent = total === 0 ? 0 : Math.round((current / total) * 100);

  return (
    <div>
      <div className="flex justify-between text-sm text-emerald-700 font-bold mb-1">
        <span>Lesson Progress</span>
        <span>{percent}%</span>
      </div>
      <div className="w-full h-4 rounded-full bg-emerald-100 overflow-hidden">
        <div
          className="h-full bg-emerald-500 transition-all duration-300"
          style={{ width: `${percent}%` }}
        ></div>
      </div>
    </div>
  );
}

function XPBar({ xp }) {
  const currentChunk = xp % 100;
  const percent = currentChunk;

  return (
    <div>
      <div className="flex justify-between text-sm text-indigo-700 font-bold mb-1">
        <span>XP to next level</span>
        <span>{currentChunk}/100</span>
      </div>
      <div className="w-full h-4 rounded-full bg-indigo-100 overflow-hidden">
        <div
          className="h-full bg-indigo-500 transition-all duration-300"
          style={{ width: `${percent}%` }}
        ></div>
      </div>
    </div>
  );
}

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    if (!username.trim()) {
      setError('Please enter a username.');
      return;
    }

    try {
      const usersRes = await fetch('/api/users');
      const users = await usersRes.json();
      const existingUser = users.find(
        (user) => user.username.toLowerCase() === username.trim().toLowerCase()
      );

      if (existingUser) {
        onLogin(existingUser);
        return;
      }

      const createRes = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
      });

      if (!createRes.ok) {
        const data = await createRes.json();
        throw new Error(data.error || 'Could not create user.');
      }

      const newUser = await createRes.json();
      onLogin(newUser);
    } catch (submitError) {
      setError(submitError.message);
    }
  }

  return (
    <section className="max-w-md mx-auto bg-white rounded-3xl p-8 duo-shadow border-2 border-emerald-200">
      <h1 className="text-3xl font-black text-emerald-600 mb-2 text-center">PokerTrainer</h1>
      <p className="text-center text-slate-600 mb-6">Train poker skills like a game.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          placeholder="Enter username"
          className="w-full p-3 rounded-2xl border-2 border-slate-200 focus:border-emerald-400 outline-none"
        />
        {error ? <p className="text-red-500 text-sm">{error}</p> : null}
        <button
          type="submit"
          className="w-full bg-emerald-500 text-white font-bold py-3 rounded-2xl hover:bg-emerald-600 transition"
        >
          Start Training
        </button>
      </form>
    </section>
  );
}

function LessonCard({ lesson, userLevel, completed, onSelect }) {
  const locked = userLevel < lesson.levelRequired;

  return (
    <article className="bg-white border-2 border-slate-200 rounded-2xl p-5 flex justify-between items-center">
      <div>
        <h3 className="font-extrabold text-lg text-slate-800">{lesson.title}</h3>
        <p className="text-sm text-slate-600">{lesson.description}</p>
        <p className="text-xs mt-2 text-slate-500">Requires level {lesson.levelRequired}</p>
      </div>
      <button
        onClick={() => onSelect(lesson)}
        disabled={locked}
        className={`px-4 py-2 rounded-xl font-bold ${locked
            ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
            : completed
              ? 'bg-amber-400 text-amber-900'
              : 'bg-emerald-500 text-white hover:bg-emerald-600'
          }`}
      >
        {locked ? 'Locked' : completed ? 'Replay' : 'Play'}
      </button>
    </article>
  );
}

function Dashboard({ user, lessons, onSelectLesson, onLogout }) {
  return (
    <section className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-3xl p-6 border-2 border-emerald-200 duo-shadow">
        <div className="flex flex-wrap gap-4 justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-black text-emerald-700">Hi, {user.username} 👋</h2>
            <p className="text-slate-600">Keep your poker streak alive.</p>
          </div>
          <button className="text-sm text-slate-500 underline" onClick={onLogout}>
            Switch user
          </button>
        </div>
        <div className="grid md:grid-cols-3 gap-4 mb-4">
          <div className="bg-emerald-50 rounded-2xl p-4">
            <p className="text-xs text-emerald-700">XP</p>
            <p className="text-2xl font-black text-emerald-700">{user.xp}</p>
          </div>
          <div className="bg-indigo-50 rounded-2xl p-4">
            <p className="text-xs text-indigo-700">Level</p>
            <p className="text-2xl font-black text-indigo-700">{user.level}</p>
          </div>
          <div className="bg-amber-50 rounded-2xl p-4">
            <p className="text-xs text-amber-700">Streak</p>
            <p className="text-2xl font-black text-amber-700">{user.streak}</p>
          </div>
        </div>
        <XPBar xp={user.xp} />
      </div>

      <div className="space-y-3">
        <h3 className="text-xl font-black text-slate-800">Lessons</h3>
        {lessons.map((lesson) => (
          <LessonCard
            key={lesson.id}
            lesson={lesson}
            userLevel={user.level}
            completed={user.completedLessons.includes(lesson.id)}
            onSelect={onSelectLesson}
          />
        ))}
      </div>
    </section>
  );
}

function QuestionCard({ question, onAnswer, answerState }) {
  return (
    <div className="bg-white rounded-3xl border-2 border-slate-200 p-6 space-y-4">
      <h3 className="text-xl font-black text-slate-800">{question.question}</h3>
      <div className="grid gap-3">
        {question.answers.map((answer, index) => {
          const selected = answerState && answerState.selectedIndex === index;
          const isCorrectChoice = answer.correct;
          let style = 'bg-white border-2 border-slate-200 hover:border-emerald-300';

          if (answerState && selected) {
            style = answerState.correct
              ? 'bg-emerald-100 border-emerald-500'
              : 'bg-red-100 border-red-400';
          } else if (answerState && isCorrectChoice) {
            style = 'bg-emerald-50 border-emerald-300';
          }

          return (
            <button
              key={index}
              className={`answer-button text-left p-3 rounded-2xl font-semibold ${style}`}
              onClick={() => onAnswer(answer, index)}
              disabled={Boolean(answerState)}
            >
              {answer.text}
            </button>
          );
        })}
      </div>
      {answerState ? (
        <div className="rounded-2xl p-4 bg-slate-50 border border-slate-200">
          <p className={`font-black ${answerState.correct ? 'text-emerald-700' : 'text-red-600'}`}>
            {answerState.correct ? 'Correct! +10 XP' : 'Not quite. +0 XP'}
          </p>
          <p className="text-sm text-slate-600 mt-1">{question.explanation}</p>
        </div>
      ) : null}
    </div>
  );
}

function LessonPlayer({ lesson, onExit, onComplete }) {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answerState, setAnswerState] = useState(null);
  const [results, setResults] = useState([]);
  const [finished, setFinished] = useState(false);

  const question = lesson.questions[questionIndex];

  function handleAnswer(answer, selectedIndex) {
    const correct = Boolean(answer.correct);
    const earned = correct ? 10 : 0;

    setAnswerState({ correct, selectedIndex });
    setResults((prev) => [...prev, { questionId: question.id, correct }]);

    if (correct) {
      setScore((prev) => prev + earned);
    }
  }

  function handleNext() {
    if (questionIndex + 1 >= lesson.questions.length) {
      setFinished(true);
      return;
    }

    setQuestionIndex((prev) => prev + 1);
    setAnswerState(null);
  }

  function handleFinish() {
    onComplete({ lessonId: lesson.id, xpEarned: score, results });
  }

  if (finished) {
    return (
      <section className="max-w-2xl mx-auto bg-white rounded-3xl border-2 border-emerald-200 p-8 text-center space-y-4 duo-shadow">
        <h2 className="text-3xl font-black text-emerald-700">Lesson Complete! 🎉</h2>
        <p className="text-slate-600">You earned {score} XP from this session.</p>
        <p className="text-slate-600">
          Correct answers: {results.filter((result) => result.correct).length} / {lesson.questions.length}
        </p>
        <div className="flex justify-center gap-3">
          <button className="px-5 py-3 rounded-2xl bg-slate-200 font-bold" onClick={onExit}>
            Back to Dashboard
          </button>
          <button className="px-5 py-3 rounded-2xl bg-emerald-500 text-white font-bold" onClick={handleFinish}>
            Save Progress
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-2xl mx-auto space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black text-slate-800">{lesson.title}</h2>
        <button className="text-sm text-slate-500 underline" onClick={onExit}>
          Exit lesson
        </button>
      </div>

      <ProgressBar current={questionIndex} total={lesson.questions.length} />
      <QuestionCard question={question} onAnswer={handleAnswer} answerState={answerState} />

      <button
        className="w-full bg-indigo-500 text-white rounded-2xl py-3 font-black disabled:bg-slate-300"
        disabled={!answerState}
        onClick={handleNext}
      >
        {questionIndex + 1 >= lesson.questions.length ? 'View Results' : 'Next Question'}
      </button>
    </section>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [activeLesson, setActiveLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadLessons() {
      try {
        const res = await fetch('/api/lessons');
        const data = await res.json();
        setLessons(data);
      } catch (loadError) {
        setError('Could not load lessons. Please refresh.');
      } finally {
        setLoading(false);
      }
    }

    loadLessons();
  }, []);

  async function handleLessonComplete(payload) {
    try {
      const res = await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, ...payload })
      });

      if (!res.ok) {
        throw new Error('Could not save progress.');
      }

      const data = await res.json();
      setUser(data.user);
      setActiveLesson(null);
    } catch (completeError) {
      setError(completeError.message);
    }
  }

  const sortedLessons = useMemo(() => [...lessons].sort((a, b) => a.id - b.id), [lessons]);

  return (
    <main className="min-h-screen p-4 md:p-8">
      {error ? (
        <p className="max-w-4xl mx-auto mb-4 bg-red-100 border border-red-200 text-red-700 p-3 rounded-2xl">
          {error}
        </p>
      ) : null}

      {loading ? (
        <p className="text-center font-bold text-slate-600">Loading PokerTrainer...</p>
      ) : !user ? (
        <Login onLogin={setUser} />
      ) : activeLesson ? (
        <LessonPlayer
          lesson={activeLesson}
          onExit={() => setActiveLesson(null)}
          onComplete={handleLessonComplete}
        />
      ) : (
        <Dashboard
          user={user}
          lessons={sortedLessons}
          onSelectLesson={setActiveLesson}
          onLogout={() => setUser(null)}
        />
      )}
    </main>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
