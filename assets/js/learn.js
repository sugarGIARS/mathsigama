/* learn.js · 课程学习页 */
(function () {
  const TABS = [
    { id: 'concept', name: '概念讲解' },
    { id: 'examples', name: '例题示范' },
    { id: 'formulas', name: '公式总结' },
    { id: 'pitfalls', name: '易错点提醒' },
    { id: 'extra', name: '推荐练习' }
  ];

  let state = { grade: null, version: null, kp: null, tab: 'concept' };
  let tStart = Date.now();
  let kpCounts = {};                       // 服务端题库的真实题量
  const qCount = id => kpCounts[id] || questionsOf(id).length;

  document.addEventListener('DOMContentLoaded', () => {
    initPage('learn');
    const u = requireLogin();
    if (!u) return;

    const p = new URLSearchParams(location.search);
    state.grade = p.get('grade') || u.grade || 'g1';
    state.version = p.get('version') || u.version || '人教版';
    state.kp = p.get('kp') || null;

    renderChips();
    renderList();
    const first = kpOfGrade(state.grade, state.version)[0];
    selectKp(state.kp && getKp(state.kp) ? state.kp : (first ? first.id : null));

    /* 后端在线时把题量更新为数据库总量 */
    (async () => {
      try {
        if (!(await DB.ready())) return;
        const s = await DB.stats();
        if (!s || !s.byKp) return;
        s.byKp.forEach(x => { kpCounts[x.kp] = x.n; });
        renderList();
        renderDoc();
      } catch (e) { }
    })();

    /* 离开页面时结算停留时长 */
    window.addEventListener('beforeunload', flushTime);
    document.addEventListener('visibilitychange', () => { if (document.hidden) flushTime(); });
  });

  function flushTime() {
    if (!state.kp) return;
    const sec = (Date.now() - tStart) / 1000;
    if (sec > 2) Store.Record.trackKp(state.kp, sec);
    tStart = Date.now();
  }

  /* ---------------- 侧栏 ---------------- */
  function renderChips() {
    $('#grade-chips').innerHTML = GRADES.map(g =>
      `<button class="chip ${g.id === state.grade ? 'on' : ''}" data-g="${g.id}">${g.name}</button>`).join('');
    $$('#grade-chips .chip').forEach(b => b.onclick = () => {
      state.grade = b.dataset.g; renderChips(); renderList();
      const f = kpOfGrade(state.grade, state.version)[0];
      if (f) selectKp(f.id);
      const u = Store.Account.current(); if (u) { u.grade = state.grade; Store.save(); }
    });

    $('#version-chips').innerHTML = VERSIONS.map(v =>
      `<button class="chip ${v === state.version ? 'on' : ''}" data-v="${v}">${v}</button>`).join('');
    $$('#version-chips .chip').forEach(b => b.onclick = () => {
      state.version = b.dataset.v; renderChips(); renderList();
      const u = Store.Account.current(); if (u) { u.version = state.version; Store.save(); }
    });
  }

  function renderList() {
    const list = kpOfGrade(state.grade, state.version);
    const weak = Store.Stats.weakPoints(1).map(w => w.kp);
    const learned = Store.Record.learned();
    $('#kp-count').textContent = list.length + ' 个知识点';
    $('#kp-list').innerHTML = list.map(k => {
      const isWeak = weak.indexOf(k.id) >= 0;
      const done = learned[k.id] && learned[k.id].finished;
      return `<div class="kp-item ${k.id === state.kp ? 'on' : ''} ${isWeak ? 'weak' : ''}" data-kp="${k.id}">
        <span class="dot"></span>
        <span style="flex:1;min-width:0">
          <b>${esc(k.title)}</b>
          <small>${esc(k.tags.join(' · '))} · ${qCount(k.id)} 题</small>
        </span>
        ${done ? '<span class="tag tag-jade">已学</span>' : ''}
      </div>`;
    }).join('');
    $$('#kp-list .kp-item').forEach(el => el.onclick = () => selectKp(el.dataset.kp));

    const total = list.length;
    const done = list.filter(k => learned[k.id] && learned[k.id].finished).length;
    $('#learn-progress').textContent = done + ' / ' + total;
  }

  /* ---------------- 选中知识点 ---------------- */
  function selectKp(id) {
    if (!id) { $('#doc-area').innerHTML = emptyDoc(); return; }
    flushTime();
    state.kp = id; state.tab = 'concept';
    Store.Record.markKpView(id);
    tStart = Date.now();
    renderList();
    renderDoc();
    $('#crumb-kp').textContent = getKp(id).title;
    const url = new URL(location.href);
    url.searchParams.set('grade', state.grade);
    url.searchParams.set('kp', id);
    history.replaceState(null, '', url);
  }

  function emptyDoc() {
    return `<div class="card doc"><div class="empty"><span class="ico">◎</span>当前筛选条件下暂无知识点，请切换年级或教材版本</div></div>`;
  }

  /* ---------------- 正文 ---------------- */
  function renderDoc() {
    const k = getKp(state.kp);
    if (!k) { $('#doc-area').innerHTML = emptyDoc(); return; }
    const stats = Store.Stats.kpStats(k.id)[k.id];
    const rate = stats ? stats.rate : null;

    $('#doc-area').innerHTML = `
      <div class="card doc">
        <div class="doc-meta">
          <span class="tag tag-blue">${gradeName(k.grade)}</span>
          ${k.versions.map(v => `<span class="tag">${v}</span>`).join('')}
          ${k.tags.map(t => `<span class="tag tag-gold">${t}</span>`).join('')}
        </div>
        <div class="doc-head">
          <div>
            <h2>${esc(k.title)}</h2>
            <p style="color:var(--text-2);margin:6px 0 0">${esc(k.summary)}</p>
          </div>
          <div style="text-align:right">
            <div style="font-size:12px;color:var(--text-3)">当前正确率</div>
            <div style="font-family:var(--font-latin);font-weight:300;font-size:28px;color:${rate === null ? 'var(--text-3)' : (rate >= .8 ? 'var(--jade-500)' : rate >= .6 ? 'var(--gold-500)' : 'var(--cinnabar)')}">
              ${rate === null ? '未练习' : Math.round(rate * 100) + '%'}
            </div>
          </div>
        </div>

        <div id="smart-tips"></div>

        <div class="doc-tabs" id="doc-tabs">
          ${TABS.map(t => `<button class="doc-tab ${t.id === state.tab ? 'on' : ''}" data-tab="${t.id}">${t.name}</button>`).join('')}
        </div>

        <div class="doc-body" id="doc-body"></div>

        <div class="doc-foot">
          <div style="display:flex;gap:10px;flex-wrap:wrap">
            <a class="btn btn-primary" href="practice.html?kp=${k.id}" data-link>去练习（${qCount(k.id)} 题）</a>
            <a class="btn btn-ghost" href="ai.html?kp=${k.id}" data-link>不懂就问 AI 老师</a>
            <button class="btn btn-ghost" id="btn-finish">标记为本节已学完</button>
          </div>
          <div style="font-size:12.5px;color:var(--text-3)">已在本页停留 <b id="stay">0</b> 秒，系统会据此调整推荐</div>
        </div>
      </div>`;

    $$('#doc-tabs .doc-tab').forEach(b => b.onclick = () => {
      flushTime();
      state.tab = b.dataset.tab;
      Store.Record.markLearned(k.id, b.dataset.tab, 0);
      $$('#doc-tabs .doc-tab').forEach(x => x.classList.toggle('on', x.dataset.tab === state.tab));
      renderBody();
      renderList();
    });

    $('#btn-finish').onclick = () => {
      Store.Record.markLearned(k.id, 'finish', 0);
      const l = Store.Record.learned()[k.id];
      if (l) l.finished = true;
      Store.save();
      toast('已标记为学完，继续加油！', 'success');
      renderList();
    };

    renderTips();
    renderBody();

    clearInterval(window.__stayTimer);
    window.__stayTimer = setInterval(() => {
      const el = $('#stay');
      if (el) el.textContent = Math.round((Date.now() - tStart) / 1000);
    }, 1000);
  }

  /* 智能提示（行为 → 判断 → 调整） */
  function renderTips() {
    const k = getKp(state.kp);
    const b = Store.Record.behavior().kp[k.id] || { views: 0, sec: 0 };
    const learned = Store.Record.learned()[k.id] || { sec: 0 };
    const stats = Store.Stats.kpStats(k.id)[k.id];
    const heat = Store.Recommend.questionHeat();
    const hot = QUESTIONS.filter(q => q.kp === k.id && heat[q.id] && heat[q.id].heat >= 4);
    const tips = [];

    if (learned.sec > 240 || b.sec > 240) {
      tips.push({ ico: '◷', t: '本节资料停留较久', p: '系统判断你在这里可能没完全看明白，已为你准备更基础的分步讲解与基础题，建议先看"概念讲解"再做基础练习。' });
    }
    if (stats && stats.total >= 2 && stats.rate < 0.6) {
      tips.push({ ico: '!', t: '本节被标记为薄弱点', p: '正确率仅 ' + Math.round(stats.rate * 100) + '%，系统会多推送本节题目，并在个人中心标红提醒。' });
    }
    if (hot.length) {
      tips.push({ ico: '◎', t: '有 ' + hot.length + ' 道题被反复查看', p: '这些题属于本节难点，练习页会优先安排同类题帮你啃下来。' });
    }
    if (stats && stats.rate >= 0.85) {
      tips.push({ ico: '✓', t: '本节已基本掌握', p: '正确率 ' + Math.round(stats.rate * 100) + '%，系统已减少本节推送，并为你准备了提高 / 挑战题。' });
    }
    $('#smart-tips').innerHTML = tips.map(t => `
      <div class="smart-tip">
        <span class="ico">${t.ico}</span>
        <div><b>${t.t}</b><p>${t.p}</p></div>
      </div>`).join('');
  }

  /* 各标签页内容 */
  function renderBody() {
    const k = getKp(state.kp);
    const box = $('#doc-body');
    if (state.tab === 'concept') {
      box.innerHTML = `<div class="prose">${k.concept}</div>`;
    } else if (state.tab === 'examples') {
      box.innerHTML = k.examples.map((ex, i) => `
        <div class="example-card">
          <div class="eh"><span>例题 ${i + 1}</span><span class="tag tag-gold">${esc(ex.title)}</span></div>
          <div class="eb">
            <div style="margin-bottom:12px">${ex.body}</div>
            ${ex.steps ? ex.steps.map((s, j) => `<div class="step"><i>${j + 1}</i><div>${s}</div></div>`).join('') : ''}
          </div>
        </div>`).join('');
    } else if (state.tab === 'formulas') {
      box.innerHTML = `<div class="formula-grid">
        ${k.formulas.map(f => `<div class="formula-card"><div class="fm">${f.f}</div><div class="fd">${esc(f.d)}</div></div>`).join('')}
      </div>
      <div class="note-box gold" style="margin-top:16px"><b class="h">记忆建议</b>公式不要死记，先理解它的来由（多数可由定义推导），再用 3 道题巩固。</div>`;
    } else if (state.tab === 'pitfalls') {
      box.innerHTML = `<div class="prose">
        <div class="note-box red" style="margin-top:0"><b class="h">易错点提醒</b>以下都是本节最高频的失分点，做题前先扫一遍。</div>
        <ul class="ticks">${k.pitfalls.map(p => `<li><span>${p}</span></li>`).join('')}</ul>
      </div>`;
    } else {
      /* 推荐练习：结合正确率与停留行为动态推荐 */
      const plan = Store.Recommend.plan(k.grade);
      const mine = plan.questions.filter(x => x.q.kp === k.id);
      const basics = questionsOf(k.id, 'basic');
      const list = (mine.length ? mine.map(x => x.q) : basics).slice(0, 4);
      box.innerHTML = `
        <div class="note-box jade"><b class="h">系统为你推荐的练习</b>
          ${plan.kps.find(x => x.kp.id === k.id) ? esc(plan.kps.find(x => x.kp.id === k.id).reason) : '先做基础题摸底，再逐步提升难度。'}
        </div>
        <div class="mistake-list">
          ${list.map(q => `<div class="mistake-item">
            <span class="tag ${q.level === 'basic' ? 'tag-jade' : q.level === 'advance' ? 'tag-gold' : 'tag-red'}">${LEVEL_NAME[q.level]}</span>
            <span style="flex:1"><b>${esc(stripMath(q.stem).slice(0, 40))}…</b><small>${TYPE_NAME[q.type]}</small></span>
            <a class="btn btn-ghost btn-sm" href="practice.html?kp=${k.id}&level=${q.level}" data-link>去做</a>
          </div>`).join('')}
        </div>
        ${k.links && k.links.length ? `<div class="divider"></div>
          <div style="font-size:13.5px;color:var(--text-2)">拓展资源（站外链接将在新标签页打开）：
          ${k.links.map(l => `<a href="${l.url}" target="_blank" rel="noopener" style="color:var(--gold-500)">${esc(l.name)}</a>`).join(' · ')}</div>` : ''}
        <div class="divider"></div>
        <button class="btn btn-primary btn-sm" onclick="location.href='practice.html?kp=${k.id}'">做完整套练习（${qCount(k.id)} 题）</button>`;
    }
    renderMath(box);
  }

  function stripMath(s) { return String(s).replace(/\$[^$]*\$/g, '公式').replace(/\\\(|\\\)/g, ''); }
})();
