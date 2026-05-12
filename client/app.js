const state = {
  user: null,
  lessons: [],
  scenarios: [],
  ranges: null,
  glossary: [],
  view: 'dashboard',
  activeLesson: null,
  lessonIndex: 0,
  lessonAnswers: [],
  selectedAnswer: null,
  activeScenario: null,
  scenarioResult: null,
  rangePosition: 'BTN'
};

const ui = {
  loginView: document.getElementById('login-view'),
  appView: document.getElementById('app-view'),
  loginForm: document.getElementById('login-form'),
  usernameInput: document.getElementById('username-input'),
  loginError: document.getElementById('login-error'),
  globalError: document.getElementById('global-error'),
  profileName: document.getElementById('profile-name'),
  logoutBtn: document.getElementById('logout-btn'),
  quickDrillBtn: document.getElementById('quick-drill-btn'),
  viewKicker: document.getElementById('view-kicker'),
  viewTitle: document.getElementById('view-title'),
  navItems: Array.from(document.querySelectorAll('.nav-item')),
  panels: {
    dashboard: document.getElementById('dashboard-view'),
    lessons: document.getElementById('lessons-view'),
    lessonPlayer: document.getElementById('lesson-player-view'),
    trainer: document.getElementById('trainer-view'),
    ranges: document.getElementById('ranges-view'),
    glossary: document.getElementById('glossary-view')
  }
};

const titles = {
  dashboard: ['Dashboard', 'Plano de treino'],
  lessons: ['Licoes', 'Fundamentos GTO'],
  lessonPlayer: ['Licao ativa', 'Mesa de estudo'],
  trainer: ['Drill GTO', 'Spot de decisao'],
  ranges: ['Ranges', 'Matriz preflop'],
  glossary: ['Glossario', 'Conceitos essenciais']
};

const actionLabels = {
  fold: 'Fold',
  call: 'Call',
  raise: 'Raise',
  check: 'Check',
  bet_small: 'Bet pequeno',
  bet_big: 'Bet grande',
  fold_all_bluffcatchers: 'Foldar bluff-catchers',
  defend_top_half: 'Defender topo do range',
  raise_any_pair: 'Raise com qualquer par',
  call_all_pairs: 'Pagar todos os pares',
  fold_more: 'Foldar mais',
  raise_bluff: 'Raise blefe'
};

function escapeHTML(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function pct(value, total) {
  if (!total) return 0;
  return Math.round((value / total) * 100);
}

function showError(message = '') {
  ui.globalError.textContent = message;
  ui.globalError.classList.toggle('hidden', !message);
}

async function api(path, options) {
  const res = await fetch(path, options);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Falha na requisicao.');
  return data;
}

function setAuthenticated(user) {
  state.user = user;
  ui.loginView.classList.add('hidden');
  ui.appView.classList.remove('hidden');
  ui.profileName.textContent = user.username;
  setView('dashboard');
}

function setView(view) {
  state.view = view;
  state.activeLesson = view === 'lessonPlayer' ? state.activeLesson : null;

  Object.values(ui.panels).forEach((panel) => panel.classList.add('hidden'));
  const panelKey = view === 'lessonPlayer' ? 'lessonPlayer' : view;
  ui.panels[panelKey].classList.remove('hidden');

  ui.navItems.forEach((item) => {
    item.classList.toggle('active', item.dataset.view === view);
  });

  const [kicker, title] = titles[view] || titles.dashboard;
  ui.viewKicker.textContent = kicker;
  ui.viewTitle.textContent = title;
  showError('');

  if (view === 'dashboard') renderDashboard();
  if (view === 'lessons') renderLessons();
  if (view === 'trainer') renderTrainer();
  if (view === 'ranges') renderRanges();
  if (view === 'glossary') renderGlossary();
}

function accuracyLabel(value, total) {
  if (!total) return '0%';
  return `${pct(value, total)}%`;
}

function renderDashboard() {
  const user = state.user;
  const nextLevelXp = 250;
  const levelProgress = user.xp % nextLevelXp;
  const lessonAccuracy = accuracyLabel(user.stats.correctAnswers, user.stats.totalAnswers);
  const actionAccuracy = accuracyLabel(user.stats.optimalActions, user.stats.totalActions);
  const unlocked = state.lessons.filter((lesson) => user.level >= lesson.levelRequired).length;

  ui.panels.dashboard.innerHTML = `
    <div class="grid-3">
      <article class="stat-card"><span>XP total</span><strong>${user.xp}</strong></article>
      <article class="stat-card"><span>Nivel GTO</span><strong>${user.level}</strong></article>
      <article class="stat-card"><span>Streak de treino</span><strong>${user.streak}</strong></article>
    </div>

    <article class="card">
      <div class="lesson-card">
        <div>
          <h3>Progresso para o proximo nivel</h3>
          <p class="card-subtitle">${levelProgress}/${nextLevelXp} XP no nivel atual</p>
        </div>
        <button id="dashboard-lesson-btn" class="primary-button" type="button">Continuar licoes</button>
      </div>
      <div class="progress-track" aria-label="Progresso de XP">
        <div class="progress-fill" style="width: ${pct(levelProgress, nextLevelXp)}%"></div>
      </div>
    </article>

    <div class="grid-2">
      <article class="card">
        <h3>Precisao de licoes</h3>
        <p class="card-subtitle">${lessonAccuracy} em ${user.stats.totalAnswers} perguntas respondidas.</p>
        <div class="pill-row">
          <span class="pill gold">${user.completedLessons.length}/${state.lessons.length} licoes concluidas</span>
          <span class="pill blue">${unlocked} desbloqueadas</span>
        </div>
      </article>
      <article class="card">
        <h3>Decisoes GTO</h3>
        <p class="card-subtitle">${actionAccuracy} de acoes principais nos drills.</p>
        <div class="pill-row">
          <span class="pill gold">${user.completedScenarios.length}/${state.scenarios.length} spots pontuados</span>
          <span class="pill blue">${user.stats.scenariosPlayed} tentativas</span>
        </div>
      </article>
    </div>

    <article class="card">
      <div class="lesson-card">
        <div>
          <h3>Dominio por conceito</h3>
          <p class="card-subtitle">Pontuacao acumulada quando voce acerta questoes e toma decisoes boas.</p>
        </div>
        <button id="dashboard-drill-btn" class="secondary-button" type="button">Treinar spot</button>
      </div>
      <div class="mastery-list">${renderMasteryRows(user.stats.concepts)}</div>
    </article>
  `;

  document.getElementById('dashboard-lesson-btn').addEventListener('click', () => setView('lessons'));
  document.getElementById('dashboard-drill-btn').addEventListener('click', () => {
    pickNextScenario();
    setView('trainer');
  });
}

function renderMasteryRows(concepts) {
  const labels = {
    preflop: 'Preflop',
    ranges: 'Ranges',
    equity: 'Equidade',
    potOdds: 'Pot odds',
    blockers: 'Blockers',
    mdf: 'MDF'
  };

  return Object.entries(labels)
    .map(([key, label]) => {
      const value = concepts[key] || 0;
      return `
        <div class="mastery-row">
          <strong>${label}</strong>
          <div class="progress-track"><div class="progress-fill" style="width: ${Math.min(value * 10, 100)}%"></div></div>
          <span>${value}</span>
        </div>
      `;
    })
    .join('');
}

function renderLessons() {
  ui.panels.lessons.innerHTML = `
    <div class="lesson-list">
      ${state.lessons.map(renderLessonCard).join('')}
    </div>
  `;

  ui.panels.lessons.querySelectorAll('[data-lesson-id]').forEach((button) => {
    button.addEventListener('click', () => startLesson(Number(button.dataset.lessonId)));
  });
}

function renderLessonCard(lesson) {
  const locked = state.user.level < lesson.levelRequired;
  const completed = state.user.completedLessons.includes(lesson.id);
  const concepts = lesson.concepts.map((concept) => `<span class="pill">${concept}</span>`).join('');

  return `
    <article class="card lesson-card">
      <div>
        <span class="eyebrow">Nivel ${lesson.levelRequired}</span>
        <h3>${escapeHTML(lesson.title)}</h3>
        <p class="card-subtitle">${escapeHTML(lesson.description)}</p>
        <div class="pill-row">
          ${concepts}
          ${completed ? '<span class="pill gold">Concluida</span>' : ''}
          ${locked ? '<span class="pill">Bloqueada</span>' : ''}
        </div>
      </div>
      <button class="${locked ? 'ghost-button' : 'primary-button'}" data-lesson-id="${lesson.id}" ${locked ? 'disabled' : ''} type="button">
        ${completed ? 'Refazer' : locked ? 'Bloqueada' : 'Iniciar'}
      </button>
    </article>
  `;
}

function startLesson(lessonId) {
  state.activeLesson = state.lessons.find((lesson) => lesson.id === lessonId);
  state.lessonIndex = 0;
  state.lessonAnswers = [];
  state.selectedAnswer = null;
  setView('lessonPlayer');
  renderLessonPlayer();
}

function renderLessonPlayer(finalResult = null) {
  const lesson = state.activeLesson;
  if (!lesson) {
    setView('lessons');
    return;
  }

  if (finalResult) {
    ui.panels.lessonPlayer.innerHTML = `
      <article class="lesson-player">
        <span class="eyebrow">Resultado</span>
        <h3>${escapeHTML(lesson.title)}</h3>
        <p>Voce acertou <strong>${finalResult.correct}/${finalResult.total}</strong> e ganhou <strong>${finalResult.xpEarned} XP</strong>.</p>
        <div class="player-footer">
          <button id="back-lessons-btn" class="ghost-button" type="button">Voltar para licoes</button>
          <button id="go-drill-btn" class="primary-button" type="button">Aplicar em drill</button>
        </div>
      </article>
    `;
    document.getElementById('back-lessons-btn').addEventListener('click', () => setView('lessons'));
    document.getElementById('go-drill-btn').addEventListener('click', () => {
      pickNextScenario();
      setView('trainer');
    });
    return;
  }

  const question = lesson.questions[state.lessonIndex];
  const total = lesson.questions.length;
  const progress = pct(state.lessonIndex, total);
  const answerButtons = question.answers
    .map((answer, index) => {
      const selected = state.selectedAnswer?.index === index;
      const locked = state.selectedAnswer !== null;
      const className = locked && answer.correct ? 'correct' : locked && selected ? 'wrong' : '';
      return `
        <button class="answer-button ${className}" data-answer-index="${index}" ${locked ? 'disabled' : ''} type="button">
          ${escapeHTML(answer.text)}
        </button>
      `;
    })
    .join('');

  ui.panels.lessonPlayer.innerHTML = `
    <article class="lesson-player">
      <div class="lesson-card">
        <div>
          <span class="eyebrow">Pergunta ${state.lessonIndex + 1}/${total}</span>
          <h3>${escapeHTML(lesson.title)}</h3>
        </div>
        <button id="exit-lesson-btn" class="ghost-button" type="button">Sair</button>
      </div>
      <div class="progress-track"><div class="progress-fill" style="width: ${progress}%"></div></div>
      <div class="theory-box">
        <ul>${lesson.theory.map((item) => `<li>${escapeHTML(item)}</li>`).join('')}</ul>
      </div>
      <h3 class="question-title">${escapeHTML(question.question)}</h3>
      <div class="answer-grid">${answerButtons}</div>
      ${state.selectedAnswer ? renderLessonFeedback(question) : ''}
      <div class="player-footer">
        <button id="prev-question-btn" class="ghost-button" type="button" ${state.lessonIndex === 0 ? 'disabled' : ''}>Anterior</button>
        <button id="next-question-btn" class="primary-button" type="button" ${state.selectedAnswer ? '' : 'disabled'}>
          ${state.lessonIndex + 1 === total ? 'Finalizar licao' : 'Proxima'}
        </button>
      </div>
    </article>
  `;

  document.getElementById('exit-lesson-btn').addEventListener('click', () => setView('lessons'));
  document.getElementById('prev-question-btn').addEventListener('click', previousQuestion);
  document.getElementById('next-question-btn').addEventListener('click', nextQuestion);
  ui.panels.lessonPlayer.querySelectorAll('[data-answer-index]').forEach((button) => {
    button.addEventListener('click', () => selectAnswer(Number(button.dataset.answerIndex)));
  });
}

function renderLessonFeedback(question) {
  const selected = question.answers[state.selectedAnswer.index];
  return `
    <div class="feedback">
      <strong>${selected.correct ? 'Correto: +25 XP potencial' : 'Ainda nao: revise a logica'}</strong>
      <span>${escapeHTML(question.explanation)}</span>
    </div>
  `;
}

function selectAnswer(index) {
  const question = state.activeLesson.questions[state.lessonIndex];
  state.selectedAnswer = { index, correct: Boolean(question.answers[index]?.correct) };
  state.lessonAnswers = state.lessonAnswers.filter((item) => item.questionId !== question.id);
  state.lessonAnswers.push({ questionId: question.id, answerIndex: index });
  renderLessonPlayer();
}

function previousQuestion() {
  if (state.lessonIndex === 0) return;
  state.lessonIndex -= 1;
  const question = state.activeLesson.questions[state.lessonIndex];
  const previous = state.lessonAnswers.find((item) => item.questionId === question.id);
  state.selectedAnswer = previous ? { index: previous.answerIndex, correct: Boolean(question.answers[previous.answerIndex]?.correct) } : null;
  renderLessonPlayer();
}

async function nextQuestion() {
  if (!state.selectedAnswer) return;
  if (state.lessonIndex + 1 < state.activeLesson.questions.length) {
    state.lessonIndex += 1;
    const question = state.activeLesson.questions[state.lessonIndex];
    const previous = state.lessonAnswers.find((item) => item.questionId === question.id);
    state.selectedAnswer = previous ? { index: previous.answerIndex, correct: Boolean(question.answers[previous.answerIndex]?.correct) } : null;
    renderLessonPlayer();
    return;
  }

  try {
    const data = await api('/api/lesson-result', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: state.user.id,
        lessonId: state.activeLesson.id,
        answers: state.lessonAnswers
      })
    });
    state.user = data.user;
    ui.profileName.textContent = data.user.username;
    renderLessonPlayer(data.result);
  } catch (err) {
    showError(err.message);
  }
}

function pickNextScenario() {
  const incomplete = state.scenarios.find((scenario) => !state.user.completedScenarios.includes(scenario.id));
  state.activeScenario = incomplete || state.scenarios[(state.user.stats.scenariosPlayed || 0) % state.scenarios.length];
  state.scenarioResult = null;
}

function renderTrainer() {
  if (!state.activeScenario) pickNextScenario();
  const scenario = state.activeScenario;
  const actionButtons = scenario.actions
    .map((action) => {
      let className = '';
      if (state.scenarioResult) {
        if (action === state.scenarioResult.bestAction) className = 'correct';
        if (action === state.scenarioResult.action && action !== state.scenarioResult.bestAction) className = 'wrong';
      }

      return `
        <button class="action-button ${className}" data-action="${action}" ${state.scenarioResult ? 'disabled' : ''} type="button">
          ${escapeHTML(actionLabels[action] || action)}
        </button>
      `;
    })
    .join('');

  ui.panels.trainer.innerHTML = `
    <article class="scenario-card">
      <div class="lesson-card">
        <div>
          <span class="eyebrow">${escapeHTML(scenario.street)}</span>
          <h3>${escapeHTML(scenario.title)}</h3>
          <p class="card-subtitle">${escapeHTML(scenario.facing)}</p>
        </div>
        <button id="new-scenario-btn" class="ghost-button" type="button">Novo spot</button>
      </div>
      <div class="scenario-meta">
        <div class="meta-box"><span>Hero</span><strong>${escapeHTML(scenario.hero)}</strong></div>
        <div class="meta-box"><span>Vilao</span><strong>${escapeHTML(scenario.villain)}</strong></div>
        <div class="meta-box"><span>Mao</span><strong>${escapeHTML(scenario.hand)}</strong></div>
        <div class="meta-box"><span>Pote</span><strong>${escapeHTML(scenario.pot)}bb</strong></div>
      </div>
      ${scenario.board ? `<div class="card-subtitle"><strong>Board:</strong> ${escapeHTML(scenario.board)}</div>` : ''}
      <h3 class="question-title">${escapeHTML(scenario.question)}</h3>
      <div class="action-grid">${actionButtons}</div>
      ${state.scenarioResult ? renderScenarioFeedback(scenario, state.scenarioResult) : ''}
    </article>
  `;

  document.getElementById('new-scenario-btn').addEventListener('click', () => {
    const currentIndex = state.scenarios.findIndex((item) => item.id === state.activeScenario.id);
    state.activeScenario = state.scenarios[(currentIndex + 1) % state.scenarios.length];
    state.scenarioResult = null;
    renderTrainer();
  });

  ui.panels.trainer.querySelectorAll('[data-action]').forEach((button) => {
    button.addEventListener('click', () => submitScenario(button.dataset.action));
  });
}

function renderScenarioFeedback(scenario, result) {
  const bars = Object.entries(scenario.gto.frequencies)
    .map(([action, frequency]) => `
      <div class="frequency-row">
        <span>${escapeHTML(actionLabels[action] || action)}</span>
        <div class="bar"><span style="width: ${frequency}%"></span></div>
        <span>${frequency}%</span>
      </div>
    `)
    .join('');

  return `
    <div class="feedback">
      <strong>${result.isOptimal ? 'Acao principal: +' + result.xpEarned + ' XP' : result.isInMix ? 'Acao mista: +' + result.xpEarned + ' XP' : 'Fora da estrategia base'}</strong>
      <span>${escapeHTML(scenario.explanation)}</span>
      <div class="frequency-bars">${bars}</div>
      <div class="pill-row">
        <span class="pill gold">Melhor acao: ${escapeHTML(actionLabels[result.bestAction] || result.bestAction)}</span>
        <span class="pill blue">Tamanho: ${escapeHTML(scenario.gto.size)}</span>
      </div>
    </div>
  `;
}

async function submitScenario(action) {
  try {
    const data = await api('/api/scenario-result', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: state.user.id,
        scenarioId: state.activeScenario.id,
        action
      })
    });
    state.user = data.user;
    state.scenarioResult = data.result;
    ui.profileName.textContent = data.user.username;
    renderTrainer();
  } catch (err) {
    showError(err.message);
  }
}

function renderRanges() {
  const positions = state.ranges.positions
    .map((position) => `
      <button class="segment-button ${position === state.rangePosition ? 'active' : ''}" data-position="${position}" type="button">
        ${position}
      </button>
    `)
    .join('');

  ui.panels.ranges.innerHTML = `
    <article class="card">
      <div class="lesson-card">
        <div>
          <h3>Range de open/defesa por posicao</h3>
          <p class="card-subtitle">Use como mapa de estudo, nao como ordem rigida. Stack, rake e mesa alteram frequencias.</p>
        </div>
      </div>
      <div class="range-toolbar">
        <div class="segmented">${positions}</div>
      </div>
      <div class="range-legend">
        <span><i class="legend-swatch" style="background:#167456"></i>Raise</span>
        <span><i class="legend-swatch" style="background:#3f6fb5"></i>Call</span>
        <span><i class="legend-swatch" style="background:#f0c14b"></i>Mix</span>
        <span><i class="legend-swatch" style="background:#f8faf9;border:1px solid #d8e0dd"></i>Fold</span>
      </div>
    </article>
    <div class="matrix-wrap">
      <div class="range-matrix">${renderRangeCells()}</div>
    </div>
  `;

  ui.panels.ranges.querySelectorAll('[data-position]').forEach((button) => {
    button.addEventListener('click', () => {
      state.rangePosition = button.dataset.position;
      renderRanges();
    });
  });
}

function getHandClass(hand) {
  const chart = state.ranges.charts[state.rangePosition] || {};
  if ((chart.raise || []).includes(hand)) return 'raise';
  if ((chart.call || []).includes(hand)) return 'call';
  if ((chart.mix || []).includes(hand)) return 'mix';
  return 'fold';
}

function renderRangeCells() {
  return state.ranges.hands
    .flat()
    .map((hand) => `<div class="hand-cell ${getHandClass(hand)}">${hand}</div>`)
    .join('');
}

function renderGlossary() {
  ui.panels.glossary.innerHTML = `
    <div class="glossary-list">
      ${state.glossary.map((item) => `
        <article class="card">
          <h3>${escapeHTML(item.term)}</h3>
          <p class="card-subtitle">${escapeHTML(item.definition)}</p>
        </article>
      `).join('')}
    </div>
  `;
}

async function init() {
  try {
    const data = await api('/api/bootstrap');
    state.lessons = data.lessons;
    state.scenarios = data.scenarios;
    state.ranges = data.ranges;
    state.glossary = data.glossary;
  } catch (err) {
    ui.loginError.textContent = 'Nao foi possivel carregar o app. Inicie o servidor novamente.';
  }
}

ui.loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  ui.loginError.textContent = '';

  const username = ui.usernameInput.value.trim();
  if (!username) {
    ui.loginError.textContent = 'Digite um usuario para continuar.';
    return;
  }

  try {
    const user = await api('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username })
    });
    ui.usernameInput.value = '';
    setAuthenticated(user);
  } catch (err) {
    ui.loginError.textContent = err.message;
  }
});

ui.logoutBtn.addEventListener('click', () => {
  state.user = null;
  ui.appView.classList.add('hidden');
  ui.loginView.classList.remove('hidden');
  ui.profileName.textContent = 'Sem usuario';
});

ui.navItems.forEach((item) => {
  item.addEventListener('click', () => {
    if (!state.user) return;
    setView(item.dataset.view);
  });
});

ui.quickDrillBtn.addEventListener('click', () => {
  pickNextScenario();
  setView('trainer');
});

init();
