/* index.js · 首页：字符环 / 今日计划 / 课程目录 / 推荐 / 搜索 */
(function () {
  const state = { grade: 'c1', version: VERSIONS[0] };

  /* ---------- 装饰：极坐标刻度盘 + 正弦曲线 ---------- */
  function buildDial() {
    const svg = $('#m-ring-svg');
    if (!svg) return;
    const NS = 'http://www.w3.org/2000/svg';
    const C = 400;
    const el = (name, attrs, parent, text) => {
      const n = document.createElementNS(NS, name);
      for (const k in attrs) n.setAttribute(k, attrs[k]);
      if (text !== undefined) n.textContent = text;
      (parent || svg).appendChild(n);
      return n;
    };
    const ink = 'currentColor';
    const blue = '#5a72ee';

    /* 同心圆：外圈虚线，读起来像刻度盘而不是杂线 */
    el('circle', { cx: C, cy: C, r: 382, fill: 'none', stroke: ink, 'stroke-opacity': .26, 'stroke-width': 1, 'stroke-dasharray': '1 7' });
    el('circle', { cx: C, cy: C, r: 292, fill: 'none', stroke: ink, 'stroke-opacity': .08, 'stroke-width': 1 });

    /* 缓慢自转的刻度组（每 10° 一格，整 90° 加长） */
    const ticks = el('g', { class: 'dial-ticks' });
    for (let a = 0; a < 360; a += 10) {
      const rad = a * Math.PI / 180, long = (a % 90 === 0);
      const r1 = 374, r2 = long ? 346 : 362;
      el('line', {
        x1: (C + r1 * Math.cos(rad)).toFixed(1), y1: (C + r1 * Math.sin(rad)).toFixed(1),
        x2: (C + r2 * Math.cos(rad)).toFixed(1), y2: (C + r2 * Math.sin(rad)).toFixed(1),
        stroke: ink, 'stroke-opacity': long ? .38 : .18, 'stroke-width': 1
      }, ticks);
    }

    /* 反向自转的虚线圈 */
    const rev = el('g', { class: 'dial-rev' });
    el('circle', {
      cx: C, cy: C, r: 326, fill: 'none', stroke: blue,
      'stroke-opacity': .3, 'stroke-width': 1.2, 'stroke-dasharray': '2 15'
    }, rev);

    /* 轨道上的小圆点 */
    const orbit = el('g', { class: 'dial-orbit' });
    el('circle', { cx: C + 382, cy: C, r: 4.5, fill: blue, 'fill-opacity': .75 }, orbit);
    el('circle', { cx: C - 292, cy: C, r: 3, fill: blue, 'fill-opacity': .35 }, orbit);

    /* 缓慢扫过的指针 */
    const hand = el('g', { class: 'dial-hand' });
    el('line', { x1: C, y1: C, x2: C, y2: C - 300, stroke: blue, 'stroke-opacity': .4, 'stroke-width': 1 }, hand);
    el('circle', { cx: C, cy: C - 300, r: 3.5, fill: blue, 'fill-opacity': .85 }, hand);
  }

  /* ---------- 今日学习计划 ---------- */
  function renderPlan() {
    const box = $('#plan-body');
    const u = Store.Account.current();
    const d = new Date();
    $('#plan-date').textContent = `${d.getMonth() + 1}/${d.getDate()} 周${'日一二三四五六'[d.getDay()]}`;

    if (!u) {
      box.innerHTML = `
        <p style="font-size:13.5px;color:var(--text-2);margin:0 0 16px">登录后，这里会显示你上次学到哪、今天的推荐题和正确率变化。</p>
        <div class="plan-actions">
          <a class="btn btn-primary btn-sm" href="register.html" data-link>免费注册</a>
          <a class="btn btn-ghost btn-sm" href="login.html" data-link>登录</a>
        </div>
        <div style="margin-top:18px;padding-top:16px;border-top:1px solid var(--line)">
          <span class="label">没有账号也可以先看讲义</span>
          <div style="margin-top:8px"><a href="learn.html" data-link style="font-size:13.5px;font-weight:600;color:var(--gold-500)">直接进入课程目录 →</a></div>
        </div>`;
      return;
    }

    const ov = Store.Stats.overview();
    const pool = kpOfGrade(u.grade);
    const learned = Store.data().learned;
    let lastKp = null, lastTs = 0;
    Object.keys(learned).forEach(id => {
      if (learned[id].ts > lastTs && getKp(id)) { lastTs = learned[id].ts; lastKp = getKp(id); }
    });
    const plan = Store.Recommend.plan(u.grade);
    const first = plan.questions[0];
    const kp = lastKp || (first && first.kp) || pool[0];
    const rate = Math.round(ov.rate * 100);
    const learnedCount = pool.filter(k => learned[k.id] && learned[k.id].finished).length;
    const progress = pool.length ? Math.round((learnedCount / pool.length) * 100) : 0;

    box.innerHTML = `
      <div class="plan-kp">
        <span class="seal-badge">学</span>
        <div>
          <div class="pk-name">${kp ? esc(kp.title) : '暂无内容'}</div>
          <div class="pk-sub">${gradeName(u.grade)} · ${u.version || VERSIONS[0]}</div>
        </div>
      </div>
      <div class="progress-line" title="讲义完成度"><i style="width:${progress}%"></i></div>
      <div style="display:flex;justify-content:space-between;font-family:var(--font-sans);font-size:11.5px;color:var(--text-3)">
        <span>讲义完成 ${learnedCount}/${pool.length}</span><span>${progress}%</span>
      </div>
      <div style="margin-top:12px">
        <div class="plan-row"><span>累计作答</span><b>${ov.total} 题</b></div>
        <div class="plan-row"><span>正确率</span><b>${ov.total ? rate + '%' : '—'}</b></div>
        <div class="plan-row"><span>待复习错题</span><b${ov.mistakes ? ' style="color:var(--cinnabar)"' : ''}>${ov.mistakes} 道</b></div>
      </div>
      <div class="plan-actions">
        <a class="btn btn-primary btn-sm" href="${learnUrl(kp)}" data-link>继续学习</a>
        <a class="btn btn-ghost btn-sm" href="${first ? 'practice.html?kp=' + first.q.kp + '&level=' + first.q.level : 'practice.html'}" data-link>做 3 道推荐题</a>
      </div>`;
  }

  function learnUrl(kp) {
    if (!kp) return 'learn.html';
    const ver = (Store.Account.current() || {}).version;
    const v = (kp.versions || []).indexOf(ver) >= 0 ? ver : kp.versions[0];
    return `learn.html?grade=${kp.grade}&version=${encodeURIComponent(v)}&kp=${kp.id}`;
  }

  /* ---------- 课程目录 ---------- */
  function renderCatalog() {
    const tabs = $('#catalog-tabs');
    tabs.innerHTML = GRADES.map(g =>
      `<button class="grade-tab${g.id === state.grade ? ' on' : ''}" data-grade="${g.id}">${g.name}</button>`
    ).join('');

    tabs.querySelectorAll('.grade-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        state.grade = btn.dataset.grade;
        renderCatalog();
      });
    });

    const vers = $('#catalog-vers');
    vers.innerHTML = VERSIONS.map(v =>
      `<button class="ver-chip${v === state.version ? ' on' : ''}" data-ver="${v}">${v}</button>`
    ).join('');
    vers.querySelectorAll('.ver-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        state.version = btn.dataset.ver;
        renderCatalog();
      });
    });

    const list = kpOfGrade(state.grade, state.version);
    const box = $('#catalog-grid');
    if (!list.length) {
      box.className = 'catalog-list';
      box.innerHTML = `<div class="empty"><span class="ico">○</span>该版本下暂无内容，换个教材版本试试</div>`;
      return;
    }

    const stats = Store.Stats.kpStats();
    const learned = Store.data().learned;
    box.className = 'catalog-list';
    const head = `<div class="kp-head">
      <span>No.</span><span>知识点</span><span>内容提要</span><span class="kp-head-r">正确率 / 题量</span><span></span>
    </div>`;
    box.innerHTML = head + list.map((k, i) => {
      const s = stats[k.id];
      const qn = questionsOf(k.id).length;
      const done = learned[k.id] && learned[k.id].finished;
      const rate = s && s.total ? Math.round(s.rate * 100) : null;
      const tone = rate === null ? ' is-none' : rate >= 80 ? ' is-good' : rate < 60 ? ' is-weak' : '';
      const mark = done ? '<span class="kr-tick">已学</span>' : '';
      return `<a class="kp-row reveal" style="--d:${Math.min(i * 40, 240)}ms" href="${learnUrl(k)}" data-link>
        <span class="kr-no">${String(i + 1).padStart(2, '0')}</span>
        <span class="kr-main">
          <b>${esc(k.title)}${mark}</b>
          <small>${esc((k.tags || []).join(' · '))}</small>
        </span>
        <span class="kr-sum">${esc(plain(k.summary || ''))}</span>
        <span class="kr-ans${tone}"><b>${rate === null ? '—' : rate + '%'}</b><small>${qn} 题</small></span>
        <span class="kr-go">→</span>
      </a>`;
    }).join('');

    initReveal();
    renderMath();
  }

  /* ---------- 推荐题目 ---------- */
  function renderReco() {
    const box = $('#reco-grid');
    const u = Store.Account.current();
    let items = [];
    try {
      items = Store.Recommend.plan(u && u.grade).questions.slice(0, 3);
    } catch (e) { items = []; }

    if (!items.length) {
      box.innerHTML = QUESTIONS.slice(0, 3).map(q => recoCard({ q, kp: getKp(q.kp), reason: '先从基础题开始' })).join('');
      return;
    }
    box.innerHTML = items.map(recoCard).join('');
    renderMath();
  }

  function recoCard(item) {
    const q = item.q, kp = item.kp;
    return `<div class="reco-card">
      <div class="rc-why">${esc(item.reason || '为你推荐')}</div>
      <div style="font-family:var(--font-sans);font-size:11.5px;color:var(--text-3);letter-spacing:.06em">
        ${esc(kp ? kp.title : '')} · ${LEVEL_NAME[q.level]} · ${TYPE_NAME[q.type]}
      </div>
      <div class="rc-stem">${esc(plain(q.stem || '').slice(0, 78))}…</div>
      <div class="rc-foot">
        <span class="label">${q.type === 'choice' ? '选择题' : q.type === 'fill' ? '填空题' : '解答题'}</span>
        <a class="btn btn-ghost btn-sm" href="practice.html?kp=${q.kp}&level=${q.level}" data-link>去练习</a>
      </div>
    </div>`;
  }

  /* ---------- 搜索 ---------- */
  function renderSearch() {
    const input = $('#search-input');
    const drop = $('#search-drop');
    if (!input) return;

    const open = list => {
      if (!list.length) {
        drop.innerHTML = `<div class="search-empty">没有找到相关知识点，试试「函数」「三角」或「概率」</div>`;
      } else {
        drop.innerHTML = list.map(k => `
          <a class="search-item" href="${learnUrl(k)}" data-link>
            ${esc(k.title)}
            <small>${gradeName(k.grade)} · ${esc((k.tags || []).join(' / '))}</small>
          </a>`).join('');
      }
      drop.classList.add('open');
    };

    input.addEventListener('input', () => {
      const q = input.value.trim();
      if (!q) { drop.classList.remove('open'); return; }
      const list = KNOWLEDGE.filter(k =>
        (k.title + ' ' + (k.summary || '') + ' ' + (k.tags || []).join(' ')).toLowerCase().includes(q.toLowerCase())
      ).slice(0, 8);
      open(list);
    });

    input.addEventListener('focus', () => { if (input.value.trim()) open([]); });
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        const first = drop.querySelector('.search-item');
        if (first) location.href = first.getAttribute('href');
      } else if (e.key === 'Escape') drop.classList.remove('open');
    });
    document.addEventListener('click', e => {
      if (!e.target.closest('.search-box')) drop.classList.remove('open');
    });
  }

  const stripMath = s => String(s).replace(/\$[^$]*\$/g, '…').replace(/\\\(|\\\)/g, '');
  const plain = s => stripMath(s).replace(/\\[a-zA-Z]+/g, ' ').replace(/[{}]/g, '').replace(/\s+/g, ' ').trim();

  /* 数字滚动 */
  function countUp(el, to, dur) {
    if (!el) return;
    const start = performance.now();
    const step = now => {
      const p = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(to * eased);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  document.addEventListener('DOMContentLoaded', () => {
    initPage('index');
    buildDial();

    countUp($('#stat-kp'), KNOWLEDGE.length, 900);
    countUp($('#stat-q'), QUESTIONS.length, 1200);
    /* 后端在线时改用题库真实总量，标题数字更贴合实际 */
    (async () => {
      try {
        if (!(await DB.ready())) return;
        const s = await DB.stats();
        if (s && s.total && s.total !== QUESTIONS.length) countUp($('#stat-q'), s.total, 1200);
      } catch (e) { }
    })();

    const u = Store.Account.current();
    state.grade = (u && u.grade) || 'c1';
    state.version = (u && VERSIONS.indexOf(u.version) >= 0) ? u.version : VERSIONS[0];

    renderPlan();
    renderCatalog();
    renderReco();
    renderSearch();
    renderMath();
  });

  window.addEventListener('storage', () => {
    if (document.visibilityState === 'visible') { renderPlan(); renderReco(); renderCatalog(); }
  });
})();
