/* practice.js · 习题练习页 */
(function () {
  let state = { kp: null, level: 'all', mistakeMode: false };
  let answers = {};        // qid -> 用户答案
  let results = {};        // qid -> { correct }
  let t0 = Date.now();
  const timers = {};       // qid -> 停留秒数累计
  const visAt = {};        // qid -> 进入视口时间

  document.addEventListener('DOMContentLoaded', () => {
    initPage('practice');
    const u = requireLogin();
    if (!u) return;

    const p = new URLSearchParams(location.search);
    const pool = KNOWLEDGE.filter(k => k.grade === (u.grade || 'g1'));
    const list = pool.length ? pool : KNOWLEDGE;

    $('#sel-kp').innerHTML = list.map(k =>
      `<option value="${k.id}">${gradeName(k.grade)} · ${k.title}（${questionsOf(k.id).length} 题）</option>`).join('');
    /* 后端在线时把下拉里的题量换成数据库中的真实总量 */
    (async () => {
      if (!(await DB.ready())) return;
      const s = await DB.stats().catch(() => null);
      if (!s || !s.byKp) return;
      const map = {};
      s.byKp.forEach(x => { map[x.kp] = x.n; });
      Array.from($('#sel-kp').options).forEach(op => {
        if (map[op.value] != null) {
          const t = op.textContent.replace(/（\d+ 题）/, '');
          op.textContent = `${t}（${map[op.value]} 题）`;
        }
      });
    })();
    state.kp = (p.get('kp') && getKp(p.get('kp'))) ? p.get('kp') : list[0].id;
    state.level = p.get('level') || 'all';
    state.mistakeMode = p.get('mistakes') === '1';
    $('#sel-kp').value = state.kp;
    if (state.mistakeMode) {
      const btn = $('#btn-mistake-mode');
      btn.classList.remove('btn-ghost'); btn.classList.add('btn-primary');
    }

    $('#sel-kp').onchange = e => { state.kp = e.target.value; loadQuestions(); };
    $$('#level-tabs .level-tab').forEach(b => b.onclick = () => {
      $$('#level-tabs .level-tab').forEach(x => x.classList.remove('on'));
      b.classList.add('on'); state.level = b.dataset.level; loadQuestions();
    });
    $('#btn-mistake-mode').onclick = () => {
      state.mistakeMode = !state.mistakeMode;
      $('#btn-mistake-mode').classList.toggle('btn-primary', state.mistakeMode);
      $('#btn-mistake-mode').classList.toggle('btn-ghost', !state.mistakeMode);
      loadQuestions();
      toast(state.mistakeMode ? '已切换到错题重做模式' : '已回到常规练习模式', 'info');
    };
    $('#btn-submit-all').onclick = submitAll;

    loadQuestions();
    renderMiniMistakes();

    setInterval(() => {
      const s = Math.round((Date.now() - t0) / 1000);
      $('#timer').textContent = fmtDur(s);
      $('#s-time').textContent = fmtDur(s);
    }, 1000);

    window.addEventListener('beforeunload', flushVisibilityAll);
  });

  async function currentQuestions() {
    if (state.mistakeMode) {
      const ids = Store.Record.mistakes().map(m => m.qid);
      return ids.map(getQuestion).filter(Boolean);
    }
    /* 优先取服务端题库（MySQL，2800+ 道），失败则回退内置题库 */
    const remote = await DB.questions({ kp: state.kp, level: state.level === 'all' ? null : state.level, limit: 40 });
    if (remote && remote.length) return remote;
    return questionsOf(state.kp, state.level === 'all' ? null : state.level);
  }

  async function loadQuestions() {
    answers = {}; results = {}; t0 = Date.now();
    const qs = await currentQuestions();
    state.qs = qs;                       // 供计分等同步逻辑读取
    const kp = getKp(qs.length ? qs[0].kp : state.kp);
    $('#crumb-kp').textContent = state.mistakeMode ? '错题重做' : (kp ? kp.title : '分层题库');

    if (!qs.length) {
      $('#q-list').innerHTML = `<div class="card doc"><div class="empty"><span class="ico">◎</span>
        没有可练习的题目${state.mistakeMode ? '（错题本是空的，先去做几道题吧）' : '，换个知识点或难度试试'}。</div></div>`;
      updateScore(); return;
    }

    $('#q-list').innerHTML = qs.map((q, i) => cardHtml(q, i)).join('');
    bindCards(qs);
    observeHeat(qs);
    renderMath($('#q-list'));
    updateScore();
  }

  function cardHtml(q, i) {
    const kp = getKp(q.kp);
    const lv = q.level;
    const lvTag = lv === 'basic' ? 'tag-jade' : lv === 'advance' ? 'tag-gold' : 'tag-red';
    let input = '';
    if (q.type === 'choice') {
      input = `<div class="q-options">${q.options.map((o, j) => `
        <div class="q-opt" data-key="${'ABCD'[j]}"><span class="key">${'ABCD'[j]}</span><span>${o}</span></div>`).join('')}</div>`;
    } else if (q.type === 'fill') {
      input = `<input class="input q-input" placeholder="请输入结果，如 3 或 4/5" data-qid="${q.id}">`;
    } else {
      input = `<textarea class="textarea q-solve" placeholder="写出你的解答过程与最终答案（最终答案请写清楚，如 x=3 或 S=450）" data-qid="${q.id}"></textarea>`;
    }
    return `<div class="card q-card" data-qid="${q.id}" data-kp="${q.kp}">
      <div class="q-head">
        <span class="q-index">第 ${i + 1} 题</span>
        <span class="tag ${lvTag}">${LEVEL_NAME[lv]}</span>
        <span class="tag">${TYPE_NAME[q.type]}</span>
        <span class="tag tag-blue">${kp ? esc(kp.title) : ''}</span>
      </div>
      <div class="q-stem">${q.stem}</div>
      ${input}
      <div class="q-actions">
        <button class="btn btn-primary btn-sm btn-submit">提交本题</button>
        <button class="btn btn-ghost btn-sm btn-hint">给点提示</button>
        <a class="btn btn-ghost btn-sm" href="ai.html?q=${q.id}" data-link>问 AI 老师</a>
      </div>
      <div class="q-result-wrap"></div>
    </div>`;
  }

  function bindCards(qs) {
    qs.forEach(q => {
      const card = $(`.q-card[data-qid="${q.id}"]`);
      if (!card) return;

      /* 选择题：点击选项 */
      $$('.q-opt', card).forEach(opt => opt.onclick = () => {
        $$('.q-opt', card).forEach(x => x.classList.remove('on'));
        opt.classList.add('on');
        answers[q.id] = opt.dataset.key;
      });
      const input = $('input.q-input, textarea.q-solve', card);
      if (input) input.addEventListener('input', () => { answers[q.id] = input.value; });

      $('.btn-submit', card).onclick = () => submitOne(q, card);
      $('.btn-hint', card).onclick = () => {
        const kp = getKp(q.kp);
        const hint = (kp && kp.pitfalls && kp.pitfalls.length)
          ? kp.pitfalls[Math.min(q.id.length % kp.pitfalls.length, kp.pitfalls.length - 1)]
          : '先看清题目问的是什么，再选择对应的方法。';
        toast('提示：' + hint.replace(/<[^>]+>/g, ''), 'info', 4200);
      };
    });
  }

  /* 行为追踪：题目在视口内的停留时长与被查看次数 */
  function observeHeat(qs) {
    if (window.__heatIO) window.__heatIO.disconnect();
    const io = new IntersectionObserver(es => {
      es.forEach(e => {
        const qid = e.target.dataset.qid;
        if (e.isIntersecting) {
          if (!visAt[qid]) visAt[qid] = Date.now();
        } else if (visAt[qid]) {
          const sec = (Date.now() - visAt[qid]) / 1000;
          timers[qid] = (timers[qid] || 0) + sec;
          if (sec > 3) Store.Record.trackQuestion(qid, sec, true); // 视为"被点开并停留"
          visAt[qid] = null;
        }
      });
    }, { threshold: .05 });
    qs.forEach(q => { const c = $(`.q-card[data-qid="${q.id}"]`); if (c) io.observe(c); });
    window.__heatIO = io;
  }

  function flushVisibilityAll() {
    Object.keys(visAt).forEach(qid => {
      if (visAt[qid]) {
        const sec = (Date.now() - visAt[qid]) / 1000;
        Store.Record.trackQuestion(qid, sec, sec > 3);
        visAt[qid] = null;
      }
    });
  }

  function submitOne(q, card, silent) {
    const ua = answers[q.id];
    if (q.type !== 'choice' && (!ua || !String(ua).trim())) {
      if (!silent) toast('请先填写你的答案', 'warn');
      return false;                        // 未作答，交由调用方统计
    }
    const started = visAt[q.id] || t0;
    const sec = timers[q.id] || Math.max(2, (Date.now() - started) / 1000);
    const r = judge(q, ua);
    results[q.id] = r.correct;

    Store.Record.addAnswer(q, r.correct, sec);
    /* 同步到服务端答题记录（失败不影响本地体验） */
    try {
      DB.attempt({ qid: q.id, kp: q.kp, level: q.level, correct: !!r.correct, sec: Math.round(sec), ts: Date.now() });
    } catch (e) { }

    /* 选项着色 */
    if (q.type === 'choice') {
      $$('.q-opt', card).forEach(opt => {
        opt.classList.remove('on');
        if (opt.dataset.key === q.answer) opt.classList.add('correct');
        else if (opt.dataset.key === ua) opt.classList.add('wrong');
      });
    }
    const wrap = $('.q-result-wrap', card);
    wrap.innerHTML = `
      <div class="q-result ${r.correct ? 'ok' : 'no'}">
        <div class="rh">${r.correct ? '✓ 回答正确' : '✕ 回答有误'}　<span style="font-weight:400;font-size:12.5px">用时约 ${Math.round(sec)} 秒</span></div>
        <div class="rb">
          <div class="ans-line"><b>你的答案：</b>${q.type === 'choice' ? (ua || '未作答') : esc(ua)}</div>
          <div class="ans-line"><b>正确答案：</b>${q.type === 'choice' ? q.answer : r.standard}</div>
          <div class="divider" style="margin:10px 0"></div>
          <div><b>解析：</b>${q.analysis}</div>
          ${r.correct ? '' : `<div class="note-box red" style="margin-top:12px"><b class="h">已自动收入错题本</b>可在个人中心反复重做，做对后自动移出。</div>`}
          <div style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap">
            <a class="btn btn-ghost btn-sm" href="ai.html?q=${q.id}" data-link>还是不懂，问 AI 老师</a>
            ${r.correct ? '' : '<button class="btn btn-ghost btn-sm btn-retry">再做一次</button>'}
          </div>
        </div>
      </div>`;
    const rt = $('.btn-retry', wrap);
    if (rt) rt.onclick = () => {
      results[q.id] = undefined;
      wrap.innerHTML = '';
      answers[q.id] = '';
      $$('.q-opt', card).forEach(o => o.classList.remove('correct', 'wrong', 'on'));
      const inp = $('input.q-input, textarea.q-solve', card); if (inp) inp.value = '';
      card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };
    renderMath(wrap);
    updateScore();
    renderMiniMistakes();
    if (!silent) {
      if (!r.correct) toast('这道题已收进错题本，记得回头重做', 'warn');
      else toast('答对了！', 'success');
    }
  }

  function submitAll() {
    const qs = state.qs || [];
    let pending = qs.filter(q => results[q.id] === undefined);
    if (!pending.length) { toast('所有题目都已提交过了', 'info'); return; }
    showLoader('正在判分…');
    setTimeout(() => {
      let skipped = 0;
      pending.forEach(q => {
        const card = $(`.q-card[data-qid="${q.id}"]`);
        if (card && submitOne(q, card, true) === false) skipped++;
      });
      hideLoader();
      const done = Object.keys(results).filter(k => results[k] !== undefined).length;
      const right = Object.keys(results).filter(k => results[k] === true).length;
      toast(`已提交 ${done} 题，答对 ${right} 题` + (skipped ? `，另有 ${skipped} 题未作答` : ''), right === done && !skipped ? 'success' : 'info', 3200);
      if (done >= 3) {
        const rep = Store.Stats.report();
        const weakCount = rep.summary.weak.length;
        setTimeout(() => {
          toast(weakCount ? `本次分析：发现 ${weakCount} 个薄弱知识点，已为你调整推荐` : '本次分析：暂未发现明显薄弱点，继续保持', weakCount ? 'warn' : 'success', 3600);
        }, 1200);
      }
    }, 500);
  }

  function updateScore() {
    const qs = state.qs || [];
    const done = Object.keys(results).filter(k => results[k] !== undefined).length;
    const right = Object.keys(results).filter(k => results[k] === true).length;
    const rate = done ? right / done : 0;
    $('#s-done').textContent = done + ' / ' + qs.length;
    if (window.Motion && window.Motion.count) {
      Motion.count($('#s-right'), right);
      Motion.count($('#s-wrong'), done - right);
      Motion.count($('#ring-val'), Math.round(rate * 100), 700, '%');
    } else {
      $('#s-right').textContent = right;
      $('#s-wrong').textContent = done - right;
      $('#ring-val').textContent = Math.round(rate * 100) + '%';
    }
    const C = 2 * Math.PI * 72;
    const path = $('#ring-path');
    if (path) {
      path.setAttribute('stroke-dasharray', C.toFixed(1));
      path.setAttribute('stroke-dashoffset', (C * (1 - rate)).toFixed(1));
    }
  }

  function renderMiniMistakes() {
    const ms = Store.Record.mistakes().slice(0, 5);
    const box = $('#mini-mistakes');
    if (!box) return;
    box.innerHTML = ms.length ? ms.map(m => {
      const q = getQuestion(m.qid); const kp = getKp(m.kp);
      if (!q) return '';
      return `<div class="mistake-item">
        <span style="flex:1;min-width:0"><b>${kp ? esc(kp.title) : ''}</b><small>${esc(strip(q.stem).slice(0, 22))}… · 错 ${m.wrong} 次</small></span>
        <a class="btn btn-ghost btn-sm" href="practice.html?kp=${m.kp}" data-link>重做</a>
      </div>`;
    }).join('') : '<div style="font-size:13px;color:var(--text-3);padding:6px 0">暂无错题，保持得不错 👍</div>';
  }

  function strip(s) { return String(s).replace(/\$[^$]*\$/g, '公式').replace(/\\\(|\\\)/g, ''); }
})();
