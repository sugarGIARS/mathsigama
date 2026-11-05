/* terminal.js · 学习作战终端页逻辑：时钟 / 平台统计 / 掌握度信赖度 */
(function () {
  'use strict';

  /* ---------- 时钟 ---------- */
  const clockEl = document.getElementById('t-clock');
  function tick() {
    if (!clockEl) return;
    const d = new Date();
    const p = n => String(n).padStart(2, '0');
    clockEl.textContent = p(d.getHours()) + ':' + p(d.getMinutes()) + ':' + p(d.getSeconds());
  }
  tick();
  setInterval(tick, 1000);

  /* ---------- 读取本地账号（与主站 store.js 的 wangzan_math_v1 保持兼容） ---------- */
  function currentUser() {
    try {
      const raw = localStorage.getItem('wangzan_math_v1');
      if (!raw) return null;
      const db = JSON.parse(raw);
      return (db && db.current) ? db.users[db.current] : null;
    } catch (e) { return null; }
  }

  async function getJSON(url) {
    try {
      const ctl = new AbortController();
      const timer = setTimeout(() => ctl.abort(), 3000);
      const res = await fetch(url, { signal: ctl.signal });
      clearTimeout(timer);
      return res.ok ? res.json() : null;
    } catch (e) { return null; }
  }

  const fmt = n => {
    if (n == null) return '—';
    return n >= 10000 ? (n / 1000).toFixed(1) + 'k' : String(n);
  };

  /* ---------- 平台统计（题库弹药 / 知识点储备） ---------- */
  (async () => {
    const s = await getJSON('/api/stats');
    if (!s) return;
    const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
    set('c-kp', fmt(Array.isArray(s.byKp) ? s.byKp.length : s.kpCount));
    set('c-q', fmt(s.total ?? s.questionCount));
    set('c-a', fmt(s.attempts ?? s.attemptCount));
  })();

  /* ---------- 用户档案 + 信赖度（掌握度） ---------- */
  (async () => {
    const u = currentUser();
    const nameEl = document.getElementById('u-name');
    const tagEl = document.getElementById('u-tag');
    const btnEl = document.getElementById('u-btn');
    const barsEl = document.getElementById('t-mastery');

    if (u) {
      if (nameEl) nameEl.textContent = u.nickname || u.username || '博士';
      if (tagEl) tagEl.textContent = '档案已接入 · 自适应引擎同步中';
      if (btnEl) { btnEl.textContent = '档案'; btnEl.href = 'profile.html'; }
    }

    /* 拉取掌握度（需要 uid）；未登录或后端不可达则给占位提示 */
    const uid = u ? (u.username || u.id) : null;
    const mastery = uid ? await getJSON('/api/mastery?uid=' + encodeURIComponent(uid)) : null;

    if (!barsEl) return;
    const items = (mastery && Array.isArray(mastery.items)) ? mastery.items : [];
    if (!items.length) {
      barsEl.innerHTML = '<div class="t-empty">' + (u
        ? '暂无作战记录：去习题练习刷完一轮，信赖度监测即刻点亮。'
        : '接入档案后，这里显示各知识点的掌握度。') + '</div>';
      return;
    }

    /* 知识点名称映射 */
    const kpJson = await getJSON('/api/kp');
    const nameOf = {};
    if (kpJson && Array.isArray(kpJson.items)) {
      kpJson.items.forEach(k => { nameOf[k.id || k.kp] = k.name || k.title || (k.id || k.kp); });
    }

    /* 按掌握度升序取 5 个：最需要补强的排最前 */
    const list = items.slice().sort((a, b) => a.mastery - b.mastery).slice(0, 5);
    barsEl.innerHTML = list.map(m => {
      const pct = Math.round((m.mastery || 0) * 100);
      const cls = pct < 60 ? 'low' : (pct >= 85 ? 'high' : '');
      const label = nameOf[m.kp] || m.kp;
      return '<div class="t-bar">' +
        '<div class="t-bar-meta"><b>' + label + '</b><span class="' + cls + '">' + pct + '%</span></div>' +
        '<div class="t-bar-track"><div class="t-bar-fill" data-w="' + pct + '"></div></div>' +
        '</div>';
    }).join('');

    /* 入场动画：下一帧再撑开，触发过渡 */
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        barsEl.querySelectorAll('.t-bar-fill').forEach(el => { el.style.width = el.dataset.w + '%'; });
      });
    });
  })();
})();
