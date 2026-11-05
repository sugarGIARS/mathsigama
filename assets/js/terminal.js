/* terminal.js · 学习作战终端 v2：时钟 / 脑力值 / 平台统计 / 信赖度监测 */
(function () {
  'use strict';

  /* ---------- 时钟与日期 ---------- */
  const timeEl = document.getElementById('t-time');
  const dateEl = document.getElementById('t-date');
  const p2 = n => String(n).padStart(2, '0');
  function tick() {
    const d = new Date();
    if (timeEl) timeEl.textContent = p2(d.getHours()) + ':' + p2(d.getMinutes()) + ':' + p2(d.getSeconds());
    if (dateEl) dateEl.textContent = d.getFullYear() + '/' + p2(d.getMonth() + 1) + '/' + p2(d.getDate());
  }
  tick();
  setInterval(tick, 1000);

  /* ---------- 本地账号（与主站 store.js 的 wangzan_math_v1 兼容） ---------- */
  let localDB = null;
  try { localDB = JSON.parse(localStorage.getItem('wangzan_math_v1') || 'null'); } catch (e) { localDB = null; }
  const currentUser = () => (localDB && localDB.current) ? localDB.users[localDB.current] : null;

  async function getJSON(url) {
    try {
      const ctl = new AbortController();
      const timer = setTimeout(() => ctl.abort(), 3000);
      const res = await fetch(url, { signal: ctl.signal });
      clearTimeout(timer);
      return res.ok ? res.json() : null;
    } catch (e) { return null; }
  }

  const fmt = n => (n == null) ? '—' : (n >= 10000 ? (n / 1000).toFixed(1) + 'k' : String(n));

  /* ---------- 脑力值：120 - 今日已答题数（每题消耗 4 点） ---------- */
  const u0 = currentUser();
  let used = 0;
  if (u0 && localDB.data && localDB.data[u0.username] && Array.isArray(localDB.data[u0.username].answers)) {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    used = localDB.data[u0.username].answers.filter(a => (a.ts || 0) >= today.getTime()).length;
  }
  const brainEl = document.getElementById('t-brain');
  if (brainEl) brainEl.textContent = Math.max(0, 120 - used * 4);

  /* ---------- 平台统计（顶部资源条） ---------- */
  (async () => {
    const s = await getJSON('/api/stats');
    if (!s) return;
    const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
    set('c-kp', fmt(Array.isArray(s.byKp) ? s.byKp.length : null));
    set('c-q', fmt(s.total));
    set('c-a', fmt(s.attempts));
  })();

  /* ---------- 信赖度监测（情报标签页） ---------- */
  const intel = document.getElementById('t-intel-panel') ? document.querySelector('.t-intel') : null;
  const tabIntel = document.getElementById('t-tab-intel');
  const tabLog = document.getElementById('t-tab-log');
  const barsEl = document.getElementById('t-mastery');
  let barsFilled = false;

  if (tabIntel && intel) {
    tabIntel.addEventListener('click', async () => {
      const opening = !intel.classList.contains('open');
      intel.classList.toggle('open');
      tabIntel.classList.toggle('on');
      /* 展开时若无数据（或页面加载后才有新答题），重新拉取 */
      if (opening && (!window.__tMastery || !window.__tMastery.length)) await refreshMastery();
      if (opening) fillBars();
    });
  }
  if (tabLog) {
    tabLog.addEventListener('click', () => { location.href = 'profile.html'; });
  }

  function fillBars() {
    barsFilled = true;
    const items = window.__tMastery || [];
    if (!items.length || !barsEl) return;
    const list = items.slice().sort((a, b) => a.mastery - b.mastery).slice(0, 5);
    barsEl.innerHTML = list.map(m => {
      const pct = Math.round((m.mastery || 0) * 100);
      const cls = pct < 60 ? 'low' : (pct >= 85 ? 'high' : '');
      return '<div class="t-bar">' +
        '<div class="t-bar-meta"><b>' + (nameOf(m.kp)) + '</b><span class="' + cls + '">' + pct + '%</span></div>' +
        '<div class="t-bar-track"><div class="t-bar-fill" data-w="' + pct + '"></div></div>' +
        '</div>';
    }).join('');
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        barsEl.querySelectorAll('.t-bar-fill').forEach(el => { el.style.width = el.dataset.w + '%'; });
      });
    });
  }

  function nameOf(kp) { return (window.__tKpNames || {})[kp] || kp; }

  /* ---------- 拉取掌握度与知识点名称 ---------- */
  async function refreshMastery() {
    const u = currentUser();
    if (!barsEl || !u) return false;
    const uid = u.username || u.id;
    const mastery = await getJSON('/api/mastery?uid=' + encodeURIComponent(uid));
    const items = (mastery && Array.isArray(mastery.items)) ? mastery.items : [];
    if (!items.length) {
      barsEl.innerHTML = '<div class="t-empty">暂无作战记录：去"作战"刷完一轮，信赖度监测即刻点亮。</div>';
      return false;
    }
    window.__tMastery = items;
    if (!window.__tKpNames) {
      const kpJson = await getJSON('/api/kp');
      const names = {};
      if (kpJson && Array.isArray(kpJson.items)) {
        kpJson.items.forEach(k => { names[k.id || k.kp] = k.title || k.name || (k.id || k.kp); });
      }
      window.__tKpNames = names;
    }
    return true;
  }
  window.__refreshMastery = refreshMastery;
  (async () => { await refreshMastery(); })();
})();
