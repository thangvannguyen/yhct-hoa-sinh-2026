(function () {
  'use strict';

  var CHAPTERS = (window.QUIZ_DATA && window.QUIZ_DATA.chapters) || [];
  var QUESTION_INDEX = {}; // id -> { question, chapterId, chapterTitle }
  var CHAPTER_QUESTIONS = {}; // chapterId -> array of ids (in source order)
  var ALL_IDS = [];

  CHAPTERS.forEach(function (ch) {
    CHAPTER_QUESTIONS[ch.id] = [];
    ch.questions.forEach(function (q) {
      QUESTION_INDEX[q.id] = { question: q, chapterId: ch.id, chapterTitle: ch.title };
      CHAPTER_QUESTIONS[ch.id].push(q.id);
      ALL_IDS.push(q.id);
    });
  });

  var CHAPTER_ICONS = {
    'hoa-hoc-glucid': '🍬',
    'hoa-hoc-lipid': '🧈',
    'hoa-hoc-protid': '🥩',
    'hoa-hoc-nucleic': '🧬',
    'chuyen-hoa-glucid': '🍚',
    'chuyen-hoa-lipid': '🥑',
    'chuyen-hoa-protid': '🍗',
    'enzym': '⚗️',
    'nang-luong-sinh-hoc': '⚡',
    'hormon': '💊',
    'can-bang-chuyen-hoa-muoi-nuoc': '💧',
    'can-bang-acid-base': '⚖️',
    'hemoglobin': '🩸'
  };
  function chapterIcon(id) { return CHAPTER_ICONS[id] || '📘'; }

  var PROGRESS_KEY = 'hs_progress_v1';
  var HISTORY_KEY = 'hs_quiz_history_v1';
  var THEME_KEY = 'hs_theme_v1';
  var MODE_KEY = 'hs_view_mode_v1';

  function getMode() { return localStorage.getItem(MODE_KEY) || 'simple'; }
  function setMode(m) { localStorage.setItem(MODE_KEY, m); }

  function getProgress() {
    try { return JSON.parse(localStorage.getItem(PROGRESS_KEY)) || {}; }
    catch (e) { return {}; }
  }
  function saveProgress(p) { localStorage.setItem(PROGRESS_KEY, JSON.stringify(p)); }
  function recordAnswer(qid, isCorrect) {
    var p = getProgress();
    var entry = p[qid] || { correct: 0, wrong: 0 };
    if (isCorrect) entry.correct++; else entry.wrong++;
    entry.lastResult = isCorrect ? 'correct' : 'wrong';
    p[qid] = entry;
    saveProgress(p);
  }

  function getHistory() {
    try { return JSON.parse(localStorage.getItem(HISTORY_KEY)) || []; }
    catch (e) { return []; }
  }
  function pushHistory(entry) {
    var h = getHistory();
    h.unshift(entry);
    if (h.length > 30) h = h.slice(0, 30);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(h));
  }

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function letterFor(i) { return String.fromCharCode(65 + i); }

  // ---------------- theme ----------------
  function initTheme() {
    var saved = localStorage.getItem(THEME_KEY);
    if (saved) document.documentElement.setAttribute('data-theme', saved);
    updateThemeIcon();
  }
  function updateThemeIcon() {
    var saved = localStorage.getItem(THEME_KEY);
    var isDark = saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.getElementById('theme-toggle').textContent = isDark ? '☀️' : '🌙';
  }
  document.getElementById('theme-toggle').addEventListener('click', function () {
    var current = document.documentElement.getAttribute('data-theme');
    var isDark = current ? current === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
    var next = isDark ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem(THEME_KEY, next);
    updateThemeIcon();
  });

  // ---------------- mode toggle ----------------
  function updateModeButtons() {
    var mode = getMode();
    document.querySelectorAll('.mode-btn').forEach(function (btn) {
      btn.classList.toggle('active', btn.getAttribute('data-mode') === mode);
    });
  }
  document.querySelectorAll('.mode-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      setMode(btn.getAttribute('data-mode'));
      updateModeButtons();
      render();
    });
  });

  // ---------------- routing ----------------
  var app = document.getElementById('app');
  var quizSession = null; // transient, not persisted across reload

  function navigate(hash) { location.hash = hash; }

  window.addEventListener('hashchange', render);
  window.addEventListener('DOMContentLoaded', function () {
    initTheme();
    updateModeButtons();
    render();
  });

  function render() {
    var hash = location.hash.replace(/^#\/?/, '');
    var parts = hash.split('/').filter(Boolean);
    var route = parts[0] || 'home';

    app.classList.remove('quiz-wide');

    if (route === 'home') return renderHome();
    if (route === 'study') return renderStudyRoute(parts[1], parts[2]);
    if (route === 'review-wrong') return renderReviewWrongRoute(parts[1]);
    if (route === 'quiz-setup') return renderQuizSetup();
    if (route === 'quiz') return renderQuizPlay();
    if (route === 'quiz-result') return renderQuizResult();
    renderHome();
  }

  // ---------------- home ----------------
  function renderHome() {
    var progress = getProgress();
    var answeredIds = Object.keys(progress);
    var totalQ = ALL_IDS.length;
    var answeredCount = answeredIds.length;
    var totalCorrect = 0, totalAttempts = 0;
    answeredIds.forEach(function (id) {
      totalCorrect += progress[id].correct;
      totalAttempts += progress[id].correct + progress[id].wrong;
    });
    var accuracy = totalAttempts ? Math.round((totalCorrect / totalAttempts) * 100) : 0;
    var wrongCount = answeredIds.filter(function (id) { return progress[id].lastResult === 'wrong'; }).length;

    var history = getHistory();
    var lastQuiz = history[0];

    var html = '';
    html += '<div class="hero"><div class="hero-badge"></div><h1>Ôn tập Hóa Sinh</h1><p>' + ALL_IDS.length + ' câu hỏi trắc nghiệm · ' + CHAPTERS.length + ' chương</p></div>';
    html += '<div class="stat-row">' +
      statBox(answeredCount + '/' + totalQ, 'Đã học') +
      statBox(accuracy + '%', 'Độ chính xác') +
      statBox(String(wrongCount), 'Câu cần ôn') +
      '</div>';

    html += '<div class="section-title">Chế độ</div>';
    html += '<div class="mode-grid">';
    html += modeCard('quiz-setup', '📝', 'Kiểm tra thử', 'Làm bài trắc nghiệm có chấm điểm, chọn số câu và chương');
    html += modeCard('study/all/0', '📖', 'Học tuần tự', 'Học lần lượt toàn bộ 332 câu theo đúng thứ tự chương');
    html += modeCard('review-wrong/0', '🔁', 'Ôn tập câu sai', wrongCount ? ('Xem lại ' + wrongCount + ' câu bạn đã từng trả lời sai') : 'Chưa có câu nào sai — cứ học rồi quay lại đây');
    html += '</div>';

    if (lastQuiz) {
      html += '<div class="section-title">Lần kiểm tra gần nhất</div>';
      html += '<div class="card">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;">' +
        '<div><strong>' + lastQuiz.correct + '/' + lastQuiz.total + '</strong> câu đúng <span class="pill">' + lastQuiz.percent + '%</span></div>' +
        '<div style="color:var(--text-muted);font-size:0.82rem;">' + escapeHtml(lastQuiz.scope) + '</div>' +
        '</div></div>';
    }

    html += '<div class="section-title">Học theo chương</div>';
    html += '<div class="chapter-list">';
    CHAPTERS.forEach(function (ch) {
      var ids = CHAPTER_QUESTIONS[ch.id];
      var done = ids.filter(function (id) { return progress[id]; }).length;
      var pct = ids.length ? Math.round((done / ids.length) * 100) : 0;
      html += '<div class="chapter-row" data-nav="study/' + ch.id + '/0">' +
        '<div class="chapter-icon">' + chapterIcon(ch.id) + '</div>' +
        '<div class="info">' +
        '<div class="title">' + escapeHtml(titleCase(ch.title)) + '</div>' +
        '<div class="progress-track"><div class="progress-fill" style="width:' + pct + '%"></div></div>' +
        '</div>' +
        '<div class="meta">' + done + '/' + ids.length + '</div>' +
        '</div>';
    });
    html += '</div>';

    app.innerHTML = html;
    bindNavClicks();
  }

  function statBox(num, label) {
    return '<div class="stat-box"><span class="num">' + num + '</span><span class="label">' + label + '</span></div>';
  }
  function modeCard(hash, emoji, title, desc) {
    return '<div class="card mode-card" data-nav="' + hash + '">' +
      '<div class="emoji">' + emoji + '</div>' +
      '<div><h3>' + title + '</h3><p>' + escapeHtml(desc) + '</p></div>' +
      '<div class="arrow">›</div></div>';
  }
  function titleCase(s) {
    return s.charAt(0) + s.slice(1).toLowerCase();
  }
  function bindNavClicks() {
    app.querySelectorAll('[data-nav]').forEach(function (el) {
      el.addEventListener('click', function () { navigate('/' + el.getAttribute('data-nav')); });
    });
  }

  // ---------------- study & review-wrong (shared renderer) ----------------
  function renderStudyRoute(chapterId, indexStr) {
    if (getMode() === 'full') {
      if (chapterId === 'all') return navigate('/study/' + CHAPTERS[0].id + '/0');
      return renderStudyFull(chapterId);
    }
    var index = parseInt(indexStr, 10) || 0;
    var ids = chapterId === 'all' ? ALL_IDS : (CHAPTER_QUESTIONS[chapterId] || []);
    var backHash = '/home';
    var titleLabel = chapterId === 'all' ? 'Học tuần tự' : titleCase((CHAPTERS.filter(function (c) { return c.id === chapterId; })[0] || {}).title || '');
    renderBrowsable(ids, index, {
      backHash: backHash,
      title: titleLabel,
      graded: true,
      onIndexChange: function (i) { navigate('/study/' + chapterId + '/' + i); }
    });
  }

  function renderReviewWrongRoute(indexStr) {
    var progress = getProgress();
    var ids = ALL_IDS.filter(function (id) { return progress[id] && progress[id].lastResult === 'wrong'; });
    if (!ids.length) {
      app.innerHTML = backLink('/home') +
        '<div class="empty-state"><div class="emoji">🎉</div><p>Chưa có câu nào bạn trả lời sai.<br>Hãy học hoặc làm bài kiểm tra thử trước đã!</p>' +
        '<button class="btn btn-primary" data-nav="quiz-setup">Làm bài kiểm tra thử</button></div>';
      bindNavClicks();
      return;
    }
    if (getMode() === 'full') return renderDocList(ids, { backHash: '/home', pageTitle: 'Ôn tập câu sai (' + ids.length + ' câu)', showChapterLabels: true });
    var index = parseInt(indexStr, 10) || 0;
    renderBrowsable(ids, index, {
      backHash: '/home',
      title: 'Ôn tập câu sai (' + ids.length + ' câu)',
      graded: true,
      onIndexChange: function (i) { navigate('/review-wrong/' + i); }
    });
  }

  // ---------------- full mode: chapter tabs + document-style list ----------------
  function renderChapterTabs(activeChapterId) {
    var html = '<div class="chapter-tabs">';
    CHAPTERS.forEach(function (ch) {
      html += '<button class="chapter-tab ' + (ch.id === activeChapterId ? 'active' : '') + '" data-tab="' + ch.id + '"><span class="tab-icon">' + chapterIcon(ch.id) + '</span>' + escapeHtml(titleCase(ch.title)) + '</button>';
    });
    html += '</div>';
    return html;
  }

  function renderStudyFull(chapterId, orderIds) {
    var chapter = CHAPTERS.filter(function (c) { return c.id === chapterId; })[0];
    if (!chapter) return navigate('/study/' + CHAPTERS[0].id + '/0');
    var ids = orderIds || CHAPTER_QUESTIONS[chapterId];
    var shuffled = !!orderIds;
    renderDocList(ids, {
      backHash: '/home',
      pageTitle: chapter.title,
      pageIcon: chapterIcon(chapterId),
      showChapterLabels: false,
      tabsHtml: renderChapterTabs(chapterId),
      onTabClick: function (cid) { navigate('/study/' + cid + '/0'); },
      shuffled: shuffled,
      onShuffle: function () {
        renderStudyFull(chapterId, shuffle(CHAPTER_QUESTIONS[chapterId]));
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  function renderDocList(ids, opts) {
    app.classList.add('quiz-wide');
    var html = backLink(opts.backHash);
    if (opts.tabsHtml) html += opts.tabsHtml;

    html += '<div class="quiz-layout">';
    html += '<div class="quiz-nav-box">';
    html += '<div class="quiz-nav-strip"><div class="quiz-nav-title">Danh sách câu hỏi</div><div class="quiz-nav-grid">';
    ids.forEach(function (qid, i) {
      html += '<button class="quiz-nav-item" data-jump="' + i + '">' + (i + 1) + '</button>';
    });
    html += '</div></div>';
    if (opts.onShuffle) {
      html += '<button class="quiz-shuffle-btn" id="shuffle-btn">🔀 Trộn câu hỏi</button>';
      html += '<div class="quiz-nav-stats" id="nav-stats"><span class="stat-ok">✔ Đúng 0</span><span class="stat-no">✘ Sai 0</span></div>';
    }
    html += '</div>';

    html += '<div class="quiz-nav-main"><div class="doc-page">';
    if (opts.pageTitle) html += '<div class="doc-page-title">' + (opts.pageIcon ? opts.pageIcon + ' ' : '') + escapeHtml(opts.pageTitle) + '</div>';

    ids.forEach(function (qid, i) {
      var entry = QUESTION_INDEX[qid];
      var q = entry.question;
      var ungraded = (q.correctIndex === null || q.correctIndex === undefined);
      html += '<div class="doc-question-block" id="doclist-block-' + i + '" data-qid="' + qid + '">';
      if (opts.showChapterLabels) html += '<div class="doc-chapter-label">' + escapeHtml(titleCase(entry.chapterTitle)) + '</div>';
      html += '<div class="doc-question-text">Câu ' + (i + 1) + ': ' + escapeHtml(q.text) + '</div>';
      if (q.image) html += '<img class="doc-question-image" src="' + q.image.replace('images/', 'data/images/') + '" alt="hình minh họa">';
      html += '<div class="doc-options">';
      q.options.forEach(function (opt, oi) {
        html += '<button class="doc-option" data-oi="' + oi + '" ' + (ungraded ? 'disabled' : '') + '>' +
          '<span class="letter">' + letterFor(oi) + '.</span><span>' + escapeHtml(opt) + '</span></button>';
      });
      html += '</div>';
      if (ungraded) html += '<div class="doc-note">⚠️ Đáp án của câu này chưa được xác nhận trong tài liệu gốc — xem <code>data/review_needed.md</code>.</div>';
      html += '</div>';
    });

    html += '</div></div>'; // doc-page, quiz-nav-main
    html += '</div>'; // quiz-layout
    app.innerHTML = html;
    bindNavClicks();

    if (opts.tabsHtml) {
      app.querySelectorAll('.chapter-tab').forEach(function (tab) {
        tab.addEventListener('click', function () { opts.onTabClick(tab.getAttribute('data-tab')); });
      });
    }

    var shuffleBtn = document.getElementById('shuffle-btn');
    if (shuffleBtn && opts.onShuffle) shuffleBtn.addEventListener('click', opts.onShuffle);

    app.querySelector('.quiz-nav-grid').addEventListener('click', function (e) {
      var btn = e.target.closest('.quiz-nav-item');
      if (!btn) return;
      var target = document.getElementById('doclist-block-' + btn.getAttribute('data-jump'));
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    var answered = {};
    var correctCount = 0, wrongCount = 0;
    var statsEl = document.getElementById('nav-stats');
    app.querySelector('.doc-page').addEventListener('click', function (e) {
      var btn = e.target.closest('.doc-option');
      if (!btn || btn.disabled) return;
      var block = btn.closest('.doc-question-block');
      var qid = block.getAttribute('data-qid');
      if (answered[qid]) return;
      answered[qid] = true;
      var q = QUESTION_INDEX[qid].question;
      var picked = parseInt(btn.getAttribute('data-oi'), 10);
      var isCorrect = picked === q.correctIndex;
      recordAnswer(qid, isCorrect);
      block.querySelectorAll('.doc-option').forEach(function (b, i) {
        b.disabled = true;
        if (i === q.correctIndex) b.classList.add('correct');
        else if (i === picked) b.classList.add('incorrect');
      });
      var index = block.id.replace('doclist-block-', '');
      var navItem = app.querySelector('.quiz-nav-item[data-jump="' + index + '"]');
      if (navItem) navItem.classList.add(isCorrect ? 'correct' : 'incorrect');
      if (isCorrect) correctCount++; else wrongCount++;
      if (statsEl) {
        statsEl.querySelector('.stat-ok').textContent = '✔ Đúng ' + correctCount;
        statsEl.querySelector('.stat-no').textContent = '✘ Sai ' + wrongCount;
      }
    });
  }

  function renderBrowsable(ids, index, opts) {
    if (index < 0) index = 0;
    if (index >= ids.length) index = ids.length - 1;
    var qid = ids[index];
    var entry = QUESTION_INDEX[qid];
    var q = entry.question;

    var html = backLink(opts.backHash);
    html += '<div class="progress-header">' +
      '<div class="progress-track"><div class="progress-fill" style="width:' + Math.round(((index + 1) / ids.length) * 100) + '%"></div></div>' +
      '<div class="count">' + (index + 1) + '/' + ids.length + '</div>' +
      '</div>';

    html += '<div class="card question-card">';
    html += '<div class="question-chapter">' + escapeHtml(titleCase(entry.chapterTitle)) + '</div>';
    html += '<div class="question-text">' + escapeHtml(q.text) + '</div>';
    if (q.image) html += '<img class="question-image" src="' + q.image.replace('images/', 'data/images/') + '" alt="hình minh họa">';

    if (q.correctIndex === null || q.correctIndex === undefined) {
      html += '<div class="note-box">⚠️ Đáp án của câu này chưa được xác nhận trong tài liệu gốc — xem <code>data/review_needed.md</code>.</div>';
    }

    html += '<div class="options" id="options-zone">';
    q.options.forEach(function (opt, i) {
      html += '<button class="option" data-i="' + i + '" ' + (q.correctIndex === null || q.correctIndex === undefined ? 'disabled' : '') + '>' +
        '<span class="letter">' + letterFor(i) + '</span><span>' + escapeHtml(opt) + '</span></button>';
    });
    html += '</div>';
    html += '</div>';

    html += '<div class="nav-row">' +
      '<button class="btn" id="prev-btn" ' + (index === 0 ? 'disabled' : '') + '>← Câu trước</button>' +
      '<button class="btn btn-primary" id="next-btn">' + (index === ids.length - 1 ? 'Hoàn thành' : 'Câu sau →') + '</button>' +
      '</div>';

    app.innerHTML = html;
    bindNavClicks();

    document.getElementById('prev-btn').addEventListener('click', function () { opts.onIndexChange(index - 1); });
    document.getElementById('next-btn').addEventListener('click', function () {
      if (index === ids.length - 1) navigate(opts.backHash);
      else opts.onIndexChange(index + 1);
    });

    var answered = false;
    app.querySelectorAll('#options-zone .option').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (answered) return;
        answered = true;
        var picked = parseInt(btn.getAttribute('data-i'), 10);
        var isCorrect = picked === q.correctIndex;
        recordAnswer(qid, isCorrect);
        app.querySelectorAll('#options-zone .option').forEach(function (b, i) {
          b.disabled = true;
          if (i === q.correctIndex) b.classList.add('correct');
          else if (i === picked) b.classList.add('incorrect');
        });
      });
    });
  }

  function backLink(hash) {
    return '<button class="back-link" data-nav="' + hash.replace(/^\//, '') + '">← Quay lại</button>';
  }

  // ---------------- quiz setup ----------------
  var quizSetupState = { chapters: null, count: 20 };

  function renderQuizSetup() {
    if (!quizSetupState.chapters) quizSetupState.chapters = CHAPTERS.map(function (c) { return c.id; });

    var eligibleCount = getEligibleIds(quizSetupState.chapters).length;
    if (quizSetupState.count > eligibleCount) quizSetupState.count = Math.max(1, eligibleCount);

    var html = backLink('/home');
    html += '<div class="hero" style="text-align:left;padding:0 0 8px;"><h1 style="font-size:1.25rem;">Thiết lập bài kiểm tra</h1></div>';

    html += '<div class="field-group"><span class="field-label">Chương</span><div class="chip-grid" id="chapter-chips">';
    html += '<span class="chip ' + (quizSetupState.chapters.length === CHAPTERS.length ? 'active' : '') + '" data-all="1">Tất cả</span>';
    CHAPTERS.forEach(function (ch) {
      var active = quizSetupState.chapters.indexOf(ch.id) !== -1;
      html += '<span class="chip ' + (active ? 'active' : '') + '" data-chapter="' + ch.id + '"><span class="chip-icon">' + chapterIcon(ch.id) + '</span>' + escapeHtml(titleCase(ch.title)) + '</span>';
    });
    html += '</div></div>';

    html += '<div class="field-group"><span class="field-label">Số câu hỏi (tối đa ' + eligibleCount + ')</span>' +
      '<div class="range-row"><input type="range" id="count-range" min="1" max="' + Math.max(1, eligibleCount) + '" value="' + quizSetupState.count + '">' +
      '<span class="val" id="count-val">' + quizSetupState.count + '</span></div></div>';

    html += '<button class="btn btn-primary btn-block" id="start-quiz-btn" ' + (eligibleCount === 0 ? 'disabled' : '') + '>Bắt đầu làm bài</button>';

    app.innerHTML = html;
    bindNavClicks();

    document.getElementById('chapter-chips').addEventListener('click', function (e) {
      var chip = e.target.closest('.chip');
      if (!chip) return;
      if (chip.getAttribute('data-all')) {
        quizSetupState.chapters = CHAPTERS.map(function (c) { return c.id; });
      } else {
        var cid = chip.getAttribute('data-chapter');
        var idx = quizSetupState.chapters.indexOf(cid);
        if (idx === -1) quizSetupState.chapters.push(cid);
        else if (quizSetupState.chapters.length > 1) quizSetupState.chapters.splice(idx, 1);
      }
      renderQuizSetup();
    });

    var range = document.getElementById('count-range');
    range.addEventListener('input', function () {
      quizSetupState.count = parseInt(range.value, 10);
      document.getElementById('count-val').textContent = quizSetupState.count;
    });

    document.getElementById('start-quiz-btn').addEventListener('click', startQuiz);
  }

  function getEligibleIds(chapterIds) {
    var ids = [];
    chapterIds.forEach(function (cid) {
      (CHAPTER_QUESTIONS[cid] || []).forEach(function (id) {
        var q = QUESTION_INDEX[id].question;
        if (q.correctIndex !== null && q.correctIndex !== undefined) ids.push(id);
      });
    });
    return ids;
  }

  function startQuiz() {
    var pool = getEligibleIds(quizSetupState.chapters);
    var picked = shuffle(pool).slice(0, quizSetupState.count);
    var scopeLabel = quizSetupState.chapters.length === CHAPTERS.length ? 'Tất cả chương' :
      quizSetupState.chapters.map(function (cid) { return titleCase((CHAPTERS.filter(function (c) { return c.id === cid; })[0] || {}).title || ''); }).join(', ');

    quizSession = {
      scope: scopeLabel,
      items: picked.map(function (qid) {
        var q = QUESTION_INDEX[qid].question;
        var order = shuffle(q.options.map(function (_, i) { return i; }));
        return {
          qid: qid,
          displayOptions: order.map(function (origI) { return q.options[origI]; }),
          correctDisplayIndex: order.indexOf(q.correctIndex),
          picked: null
        };
      }),
      currentIndex: 0
    };
    navigate('/quiz');
  }

  // ---------------- quiz play ----------------
  function renderQuizPlay() {
    if (!quizSession) return navigate('/quiz-setup');
    if (getMode() === 'full') return renderQuizPlayFull();
    return renderQuizPlaySingle();
  }

  function renderQuizNavGrid(items, currentIndex) {
    var html = '<div class="quiz-nav-box"><div class="quiz-nav-strip"><div class="quiz-nav-title">Danh sách câu hỏi</div><div class="quiz-nav-grid">';
    items.forEach(function (item, i) {
      var cls = [];
      if (item.picked !== null) cls.push('answered');
      if (i === currentIndex) cls.push('current');
      html += '<button class="quiz-nav-item ' + cls.join(' ') + '" data-jump="' + i + '">' + (i + 1) + '</button>';
    });
    html += '</div></div></div>';
    return html;
  }

  function renderQuizPlaySingle() {
    app.classList.add('quiz-wide');
    var i = quizSession.currentIndex;
    var item = quizSession.items[i];
    var entry = QUESTION_INDEX[item.qid];
    var q = entry.question;
    var total = quizSession.items.length;

    var html = '<button class="back-link" id="exit-quiz">← Thoát bài (không lưu)</button>';
    html += '<div class="progress-header">' +
      '<div class="progress-track"><div class="progress-fill" style="width:' + Math.round(((i + 1) / total) * 100) + '%"></div></div>' +
      '<div class="count">' + (i + 1) + '/' + total + '</div></div>';

    html += '<div class="quiz-layout">';
    html += renderQuizNavGrid(quizSession.items, i);
    html += '<div class="quiz-nav-main">';

    html += '<div class="card question-card">';
    html += '<div class="question-chapter">' + escapeHtml(titleCase(entry.chapterTitle)) + '</div>';
    html += '<div class="question-text">' + escapeHtml(q.text) + '</div>';
    if (q.image) html += '<img class="question-image" src="' + q.image.replace('images/', 'data/images/') + '" alt="hình minh họa">';
    html += '<div class="options" id="options-zone">';
    item.displayOptions.forEach(function (opt, oi) {
      var sel = item.picked === oi ? 'selected' : '';
      html += '<button class="option ' + sel + '" data-i="' + oi + '"><span class="letter">' + letterFor(oi) + '</span><span>' + escapeHtml(opt) + '</span></button>';
    });
    html += '</div></div>';

    html += '<div class="nav-row">' +
      '<button class="btn" id="prev-btn" ' + (i === 0 ? 'disabled' : '') + '>← Câu trước</button>' +
      (i === total - 1
        ? '<button class="btn btn-primary" id="submit-btn">Nộp bài</button>'
        : '<button class="btn btn-primary" id="next-btn">Câu sau →</button>') +
      '</div>';
    if (i !== total - 1) html += '<div style="text-align:center;margin-top:12px;"><button class="btn btn-ghost" id="submit-early-btn" style="font-size:0.85rem;">Nộp bài sớm</button></div>';
    html += '</div>'; // quiz-nav-main
    html += '</div>'; // quiz-layout

    app.innerHTML = html;

    document.getElementById('exit-quiz').addEventListener('click', function () {
      if (confirm('Thoát bài kiểm tra hiện tại? Kết quả sẽ không được lưu.')) { quizSession = null; navigate('/home'); }
    });
    var prevBtn = document.getElementById('prev-btn');
    if (prevBtn) prevBtn.addEventListener('click', function () { quizSession.currentIndex--; render(); });
    var nextBtn = document.getElementById('next-btn');
    if (nextBtn) nextBtn.addEventListener('click', function () { quizSession.currentIndex++; render(); });
    var submitBtn = document.getElementById('submit-btn');
    if (submitBtn) submitBtn.addEventListener('click', finishQuiz);
    var submitEarlyBtn = document.getElementById('submit-early-btn');
    if (submitEarlyBtn) submitEarlyBtn.addEventListener('click', function () {
      if (confirm('Nộp bài với ' + quizSession.items.filter(function (it) { return it.picked !== null; }).length + '/' + total + ' câu đã trả lời?')) finishQuiz();
    });

    app.querySelector('.quiz-nav-grid').addEventListener('click', function (e) {
      var btn = e.target.closest('.quiz-nav-item');
      if (!btn) return;
      quizSession.currentIndex = parseInt(btn.getAttribute('data-jump'), 10);
      render();
    });

    app.querySelectorAll('#options-zone > button').forEach(function (btn) {
      btn.addEventListener('click', function () {
        item.picked = parseInt(btn.getAttribute('data-i'), 10);
        app.querySelectorAll('#options-zone > button').forEach(function (b) { b.classList.remove('selected'); });
        btn.classList.add('selected');
      });
    });
  }

  function renderQuizPlayFull() {
    app.classList.add('quiz-wide');
    var total = quizSession.items.length;
    var answeredCount = quizSession.items.filter(function (it) { return it.picked !== null; }).length;

    var html = '<button class="back-link" id="exit-quiz">← Thoát bài (không lưu)</button>';
    html += '<div class="progress-header">' +
      '<div class="progress-track"><div class="progress-fill" style="width:' + Math.round((answeredCount / total) * 100) + '%"></div></div>' +
      '<div class="count">' + answeredCount + '/' + total + '</div></div>';

    html += '<div class="quiz-layout">';
    html += renderQuizNavGrid(quizSession.items, -1);

    html += '<div class="quiz-nav-main">';
    html += '<div class="doc-page">';
    quizSession.items.forEach(function (item, i) {
      var entry = QUESTION_INDEX[item.qid];
      var q = entry.question;
      html += '<div class="doc-question-block" id="quiz-block-' + i + '" data-index="' + i + '">';
      html += '<div class="doc-chapter-label">' + escapeHtml(titleCase(entry.chapterTitle)) + '</div>';
      html += '<div class="doc-question-text">Câu ' + (i + 1) + ': ' + escapeHtml(q.text) + '</div>';
      if (q.image) html += '<img class="doc-question-image" src="' + q.image.replace('images/', 'data/images/') + '" alt="hình minh họa">';
      html += '<div class="doc-options">';
      item.displayOptions.forEach(function (opt, oi) {
        var sel = item.picked === oi ? 'selected' : '';
        html += '<button class="doc-option ' + sel + '" data-oi="' + oi + '"><span class="letter">' + letterFor(oi) + '.</span><span>' + escapeHtml(opt) + '</span></button>';
      });
      html += '</div></div>';
    });
    html += '</div>';

    html += '<button class="btn btn-primary btn-block" id="submit-btn" style="margin-top:18px;">Nộp bài (' + answeredCount + '/' + total + ' câu đã trả lời)</button>';
    html += '</div>'; // quiz-nav-main
    html += '</div>'; // quiz-layout

    app.innerHTML = html;

    document.getElementById('exit-quiz').addEventListener('click', function () {
      if (confirm('Thoát bài kiểm tra hiện tại? Kết quả sẽ không được lưu.')) { quizSession = null; navigate('/home'); }
    });
    document.getElementById('submit-btn').addEventListener('click', function () {
      var unanswered = total - quizSession.items.filter(function (it) { return it.picked !== null; }).length;
      if (unanswered > 0 && !confirm('Bạn còn ' + unanswered + ' câu chưa trả lời. Vẫn nộp bài?')) return;
      finishQuiz();
    });

    app.querySelector('.quiz-nav-grid').addEventListener('click', function (e) {
      var btn = e.target.closest('.quiz-nav-item');
      if (!btn) return;
      var target = document.getElementById('quiz-block-' + btn.getAttribute('data-jump'));
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    app.querySelector('.doc-page').addEventListener('click', function (e) {
      var btn = e.target.closest('.doc-option');
      if (!btn) return;
      var block = btn.closest('.doc-question-block');
      var index = parseInt(block.getAttribute('data-index'), 10);
      var picked = parseInt(btn.getAttribute('data-oi'), 10);
      quizSession.items[index].picked = picked;
      block.querySelectorAll('.doc-option').forEach(function (b) { b.classList.remove('selected'); });
      btn.classList.add('selected');

      var navItem = app.querySelector('.quiz-nav-item[data-jump="' + index + '"]');
      if (navItem) navItem.classList.add('answered');

      var answered = quizSession.items.filter(function (it) { return it.picked !== null; }).length;
      document.querySelector('.progress-fill').style.width = Math.round((answered / total) * 100) + '%';
      document.querySelector('.progress-header .count').textContent = answered + '/' + total;
      document.getElementById('submit-btn').textContent = 'Nộp bài (' + answered + '/' + total + ' câu đã trả lời)';
    });
  }

  function finishQuiz() {
    var correct = 0;
    quizSession.items.forEach(function (item) {
      var isCorrect = item.picked !== null && item.picked === item.correctDisplayIndex;
      if (isCorrect) correct++;
      recordAnswer(item.qid, isCorrect);
    });
    var total = quizSession.items.length;
    var percent = Math.round((correct / total) * 100);
    quizSession.result = { correct: correct, total: total, percent: percent };
    pushHistory({ date: new Date().toISOString(), scope: quizSession.scope, total: total, correct: correct, percent: percent });
    navigate('/quiz-result');
  }

  // ---------------- quiz result ----------------
  function renderQuizResult() {
    if (!quizSession || !quizSession.result) return navigate('/home');
    var r = quizSession.result;

    var html = '<div class="card result-score">' +
      '<div class="big">' + r.correct + '/' + r.total + '</div>' +
      '<div class="sub">' + r.percent + '% chính xác · ' + escapeHtml(quizSession.scope) + '</div>' +
      '</div>';

    html += '<div class="nav-row" style="margin:16px 0;">' +
      '<button class="btn" data-nav="home">Về trang chủ</button>' +
      '<button class="btn btn-primary" data-nav="quiz-setup">Làm bài mới</button>' +
      '</div>';

    html += '<div class="section-title">Chi tiết</div>';
    var full = getMode() === 'full';

    if (full) html += '<div class="doc-page">';
    quizSession.items.forEach(function (item, i) {
      var entry = QUESTION_INDEX[item.qid];
      var q = entry.question;
      var isCorrect = item.picked !== null && item.picked === item.correctDisplayIndex;

      if (full) {
        html += '<div class="doc-question-block">';
        html += '<div class="doc-chapter-label">' + escapeHtml(titleCase(entry.chapterTitle)) + '</div>';
        html += '<div class="doc-question-text">Câu ' + (i + 1) + ': ' + escapeHtml(q.text) + '</div>';
        if (q.image) html += '<img class="doc-question-image" src="' + q.image.replace('images/', 'data/images/') + '" alt="hình minh họa">';
        html += '<div class="doc-options">';
        item.displayOptions.forEach(function (opt, oi) {
          var cls = oi === item.correctDisplayIndex ? 'correct' : (oi === item.picked ? 'incorrect' : '');
          html += '<button class="doc-option ' + cls + '" disabled><span class="letter">' + letterFor(oi) + '.</span><span>' + escapeHtml(opt) + '</span></button>';
        });
        html += '</div>';
        if (item.picked === null) html += '<div class="doc-note">Bạn chưa trả lời câu này.</div>';
        html += '</div>';
      } else {
        html += '<div class="review-item">' +
          '<div class="q">' + (i + 1) + '. ' + escapeHtml(q.text) + '</div>' +
          (item.picked !== null
            ? '<div class="a ' + (isCorrect ? 'right' : 'wrong') + '">Bạn chọn: ' + letterFor(item.picked) + '. ' + escapeHtml(item.displayOptions[item.picked]) + '</div>'
            : '<div class="a wrong">Bạn chưa trả lời</div>') +
          (!isCorrect ? '<div class="a right">Đáp án đúng: ' + letterFor(item.correctDisplayIndex) + '. ' + escapeHtml(item.displayOptions[item.correctDisplayIndex]) + '</div>' : '') +
          '</div>';
      }
    });
    if (full) html += '</div>';

    app.innerHTML = html;
    bindNavClicks();
  }
})();
