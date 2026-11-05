/* terminal.js · 战术主界面：时钟 / 理智（脑力）值 / 平台资源 / 情报掌握度 */
(function () {
  'use strict';

  const p2 = n => String(n).padStart(2, '0');

  /* ---------- 舞台等比缩放：1600×900 设计稿适配任意窗口 ---------- */
  const stage = document.querySelector('.ak-stage');
  function fit() {
    if (!stage) return;
    const s = Math.min(window.innerWidth / 1600, window.innerHeight / 900);
    stage.style.setProperty('--s', s);
  }
  fit();
  window.addEventListener('resize', fit);


  /* ---------- 时钟与日期（理智面板右侧） ---------- */
  const timeEl = document.getElementById('ak-time');
  const dateEl = document.getElementById('ak-date');
  function tick() {
    const d = new Date();
    if (timeEl) timeEl.textContent = p2(d.getHours()) + ':' + p2(d.getMinutes());
    if (dateEl) dateEl.textContent = d.getFullYear() + '/' + p2(d.getMonth() + 1) + '/' + p2(d.getDate());
  }
  tick();
  setInterval(tick, 20000);

  /* ---------- 本地账号（与主站 store.js 的 wangzan_math_v1 兼容） ---------- */
  let db = null;
  try { db = JSON.parse(localStorage.getItem('wangzan_math_v1') || 'null'); } catch (e) { db = null; }
  const user = () => (db && db.current) ? db.users[db.current] : null;

  async function getJSON(url) {
    try {
      const ctl = new AbortController();
      const timer = setTimeout(() => ctl.abort(), 3000);
      const res = await fetch(url, { signal: ctl.signal });
      clearTimeout(timer);
      return res.ok ? res.json() : null;
    } catch (e) { return null; }
  }
  const fmt = n => (n == null || isNaN(n)) ? '—' : String(n);

  /* ---------- 理智值：120 - 今日答题数 × 4 ---------- */
  const u = user();
  let used = 0;
  if (u && db.data && db.data[u.username] && Array.isArray(db.data[u.username].answers)) {
    const t0 = new Date(); t0.setHours(0, 0, 0, 0);
    used = db.data[u.username].answers.filter(a => (a.ts || 0) >= t0.getTime()).length;
  }
  const sanity = Math.max(0, 120 - used * 4);
  const sanEl = document.getElementById('ak-sanity');
  if (sanEl) sanEl.textContent = sanity;

  /* ---------- 右上资源：知识点 / 题库 / 累计作答 ---------- */
  (async () => {
    const s = await getJSON('/api/stats');
    if (!s) return;
    const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
    set('c-kp', fmt(Array.isArray(s.byKp) ? s.byKp.length : null));
    set('c-q', fmt(s.total));
    set('c-a', fmt(s.attempts));
  })();

  /* ---------- 情报面板（掌握度） ---------- */
  const wrap = document.querySelector('.ak-bottom-left');
  const tabIntel = document.getElementById('t-tab-intel');
  const barsEl = document.getElementById('t-mastery');
  let filled = false;

  if (tabIntel && wrap) {
    tabIntel.addEventListener('click', async () => {
      const opening = !wrap.classList.contains('open');
      wrap.classList.toggle('open');
      if (opening) {
        if (!window.__m || !window.__m.length) await refresh();
        render();
      }
    });
  }

  async function refresh() {
    if (!barsEl || !user()) return false;
    const uid = user().username || user().id;
    const res = await getJSON('/api/mastery?uid=' + encodeURIComponent(uid));
    const items = (res && Array.isArray(res.items)) ? res.items : [];
    if (!items.length) {
      barsEl.innerHTML = '<div class="ak-empty">暂无作战记录：去「作战」完成一轮练习，情报即刻点亮。</div>';
      return false;
    }
    window.__m = items;
    if (!window.__n) {
      const kp = await getJSON('/api/kp');
      const names = {};
      if (kp && Array.isArray(kp.items)) {
        kp.items.forEach(k => { names[k.id || k.kp] = k.title || k.name || (k.id || k.kp); });
      }
      window.__n = names;
    }
    return true;
  }

  function render() {
    filled = true;
    const items = window.__m || [];
    if (!items.length || !barsEl) return;
    const list = items.slice().sort((a, b) => a.mastery - b.mastery).slice(0, 5);
    barsEl.innerHTML = list.map(m => {
      const pct = Math.round((m.mastery || 0) * 100);
      const cls = pct < 60 ? 'low' : (pct >= 85 ? 'high' : '');
      const name = (window.__n || {})[m.kp] || m.kp;
      return '<div class="ak-bar">' +
        '<div class="ak-bar-meta"><b>' + name + '</b><span class="' + cls + '">' + pct + '%</span></div>' +
        '<div class="ak-bar-track"><div class="ak-bar-fill" data-w="' + pct + '"></div></div>' +
        '</div>';
    }).join('');
    requestAnimationFrame(() => requestAnimationFrame(() => {
      barsEl.querySelectorAll('.ak-bar-fill').forEach(el => { el.style.width = el.dataset.w + '%'; });
    }));
  }

  (async () => { await refresh(); if (filled) render(); })();

  /* ---------- 立绘互动：点击空白处给出随机回应 ---------- */
  const hint = document.querySelector('.ak-art-hint');
  const lines = [
    'Σ：今天的薄弱点已经标出来了，先打那几个。',
    'Σ：太难就先降一档，别硬扛。',
    'Σ：错题不是敌人，是地图。',
    'Σ：连续答对 3 题，我会给你加难度。'
  ];
  let li = 0;
  if (hint) {
    hint.style.cursor = 'pointer';
    hint.addEventListener('click', () => {
      hint.textContent = lines[li++ % lines.length];
      hint.style.color = 'rgba(210, 232, 255, .75)';
    });
  }
})();
