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
        className={`px-4 py-2 rounded-xl font-bold ${
          locked
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
