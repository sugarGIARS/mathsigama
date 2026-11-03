/* ai.js · AI 引导式答疑页
   本地引导式讲解引擎：提示 → 步骤 → 完整答案，支持追问 */
(function () {
  let pendingImages = [];
  let lastContext = { kp: null, qid: null };

  document.addEventListener('DOMContentLoaded', () => {
    initPage('ai');
    const u = requireLogin();
    if (!u) return;

    $('#btn-send').innerHTML = ICON.send + ' 发送';
    $('#btn-send').onclick = send;
    $('#clear-chat').onclick = () => {
      confirmBox('清空全部对话记录？', () => { Store.Record.clearChat(); renderLog(); toast('对话已清空', 'info'); });
    };
    $('#file-img').onchange = e => {
      const f = e.target.files[0]; if (!f) return;
      const reader = new FileReader();
      reader.onload = ev => {
        pendingImages.push({ name: f.name, url: ev.target.result });
        renderPreview();
      };
      reader.readAsDataURL(f);
      e.target.value = '';
    };
    $('#chat-text').addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
    });

    /* 从练习页 / 学习页跳过来时自动填题 */
    const p = new URLSearchParams(location.search);
    const qid = p.get('q');
    if (qid && getQuestion(qid)) {
      const q = getQuestion(qid);
      $('#chat-text').value = stripMath(q.stem);
      lastContext.qid = qid;
    }

    renderQuick();
    renderLog();
    if (!Store.Record.chat().length) greet(u);
  });

  function greet(u) {
    push({ role: 'ai', kp: null, qid: null, stage: 1, text: `你好，${esc(u.nickname || u.username)}。我是 MathSigma 的 AI 助教「Σ 老师」。把不会的题发给我吧 —— 打字或上传图片都可以。不愤不启，不悱不发：我会先给你一点提示，让你自己想一想，再一步步带你做出来。` });
    renderLog();
  }

  function renderPreview() {
    $('#img-preview').innerHTML = pendingImages.map((im, i) => `
      <div class="img-thumb"><img src="${im.url}" alt="题目图片"><button data-i="${i}">✕</button></div>`).join('');
    $$('#img-preview button').forEach(b => b.onclick = () => {
      pendingImages.splice(parseInt(b.dataset.i, 10), 1); renderPreview();
    });
  }

  /* ---------------- 发送 ---------------- */
  async function send() {
    const text = $('#chat-text').value.trim();
    if (!text && !pendingImages.length) { toast('请输入题目或上传图片', 'warn'); return; }
    $('#chat-text').value = '';

    const userMsg = { role: 'user', text: text || '（上传了题目图片）', imgs: pendingImages.slice(), ts: Date.now() };
    push(userMsg);
    pendingImages = []; renderPreview();
    renderLog();

    const typing = showTyping();
    let reply = null;
    try {
      /* 后端代理 DeepSeek；未配置密钥时服务端返回本地兜底内容 */
      const hist = (Store.Record.chatLog ? Store.Record.chatLog() : []).slice(-8)
        .map(m => ({ role: m.role === 'ai' ? 'assistant' : 'user', content: m.text || '' }));
      const res = await DB.chat({ message: text || '（题目图片）', kp: (lastContext.qid ? (getQuestion(lastContext.qid) || {}).kp : ''), history: hist });
      if (res && res.content) {
        reply = {
          role: 'ai', text: res.content, ts: Date.now(),
          mode: res.mode === 'deepseek' ? 'deepseek' : (res.mode || 'local')
        };
      }
    } catch (e) { /* 后端不可用：走本地规则引擎 */ }

    typing.remove();
    if (!reply) reply = buildReply(text, userMsg.imgs);
    push(reply);
    renderLog();
  }

  function push(msg) { Store.Record.pushChat(msg); }

  function showTyping() {
    const d = document.createElement('div');
    d.className = 'msg ai';
    d.innerHTML = `<span class="who">AI</span><div class="bubble"><span class="typing"><span></span><span></span><span></span></span> 正在思考…</div>`;
    $('#chat-log').appendChild(d);
    $('#chat-log').scrollTop = $('#chat-log').scrollHeight;
    return d;
  }

  /* ---------------- 引导式回答生成 ---------------- */
  function buildReply(text, imgs) {
    const matchedQ = lastContext.qid ? getQuestion(lastContext.qid) : matchQuestion(text);
    const kp = matchedQ ? getKp(matchedQ.kp) : matchKp(text);
    lastContext.qid = matchedQ ? matchedQ.id : null;

    const stages = [];

    if (imgs && imgs.length && !text) {
      stages.push({
        title: '我收到你的题目图片了',
        html: `<p>图片我已收到（${esc(imgs[0].name)}）。为了让讲解更准确，建议你再把题目中的<b>关键条件</b>打字补充一下，比如已知什么、求什么。</p>
               <p>如果暂时不方便打字也没关系，我先按最常见的考法给你一个思路：</p>
               <ul><li>先判断这道题属于哪个知识点（函数 / 几何 / 概率 / 数列…）</li><li>把已知条件列出来，想一想它能对应到哪个公式</li></ul>`
      });
    }

    if (matchedQ) {
      const kpName = kp ? kp.title : '本节知识';
      stages.push({
        title: '第 1 步 · 先给你一点提示（先别急着看答案）',
        html: `<p>这道题考的是 <b>${esc(kpName)}</b>（${TYPE_NAME[matchedQ.type]} · ${LEVEL_NAME[matchedQ.level]}）。</p>
          <p>先想一想下面两个问题：</p>
          <ol><li>题目要求的量是什么？已知的量有哪些？</li><li>这些已知量能对应到本节的哪个公式或性质？</li></ol>
          ${kp && kp.pitfalls && kp.pitfalls.length ? `<div class="step-block"><b>提醒：</b>${kp.pitfalls[0]}</div>` : ''}
          <p style="color:var(--text-2)">先自己动笔试 1 分钟，实在没思路再点"下一步提示"。</p>`
      });
      stages.push({
        title: '第 2 步 · 关键步骤（跟着搭梯子）',
        html: `<p>把解答拆成几步来看：</p>
          <div class="step-block">${splitSteps(matchedQ.analysis, kp)}</div>
          <p>做到这里，你应该已经能写出大部分过程了。卡在哪一步都可以直接问我。</p>`
      });
      stages.push({
        title: '第 3 步 · 完整答案与解析',
        html: `<p><b>答案：</b>${matchedQ.type === 'choice' ? matchedQ.answer + '（' + esc(matchedQ.options['ABCD'.indexOf(matchedQ.answer)]) + '）' : (matchedQ.accept ? matchedQ.accept[0] : (matchedQ.keywords ? matchedQ.keywords.join(' 或 ') : ''))}</p>
          <p><b>完整解析：</b>${matchedQ.analysis}</p>
          ${kp && kp.pitfalls.length ? `<div class="note-box red" style="margin-top:10px"><b class="h">本节易错点</b><ul class="ticks">${kp.pitfalls.slice(0, 3).map(p => `<li>${p}</li>`).join('')}</ul></div>` : ''}
          <p style="margin-top:10px">要不要我再出一道<b>同类题</b>给你巩固一下？点下面的按钮即可。</p>`
      });
    } else {
      const kpName = kp ? kp.title : '这个知识点';
      stages.push({
        title: '第 1 步 · 我先帮你定位考点',
        html: `<p>从你的描述看，这道题大概率属于 <b>${esc(kpName)}</b>。如果判断不准，你可以把题目中的数字和条件再补充一下。</p>
          ${kp ? `<p><b>本节的核心思路：</b>${esc(kp.summary)}</p>` : ''}
          <p>先问自己：题目要我求什么？为了求它，我需要先知道什么？</p>`
      });
      stages.push({
        title: '第 2 步 · 通用解题路径',
        html: `<ol>
          <li><b>翻译题目</b>：把文字语言写成数学式子，设出未知数。</li>
          <li><b>找关系</b>：列出等量关系（公式、定理、图形性质）。</li>
          <li><b>求解</b>：代入计算，注意分类讨论。</li>
          <li><b>检验</b>：结果是否符合实际意义，是否漏解。</li>
        </ol>
          ${kp && kp.formulas && kp.formulas.length ? `<div class="step-block"><b>本节常用公式：</b><br>${kp.formulas.slice(0, 3).map(f => f.f).join('　　')}</div>` : ''}`
      });
      stages.push({
        title: '第 3 步 · 给我更多信息，我给你完整解答',
        html: `<p>目前信息还不够给出唯一答案。你可以：</p>
          <ul><li>把题目完整抄一遍（含所有数字和条件）</li><li>上传清晰的题目图片</li><li>或者直接告诉我"我要看【${esc(kpName)}】的例题"</li></ul>
          ${kp ? `<div class="note-box jade" style="margin-top:10px"><b class="h">也可以先看资料</b><a href="learn.html?kp=${kp.id}" data-link style="color:var(--gold-500)">打开《${esc(kpName)}》电子课本 →</a></div>` : ''}`
      });
    }

    return { role: 'ai', stage: 1, kp: kp ? kp.id : null, qid: matchedQ ? matchedQ.id : null, stages, ts: Date.now() };
  }

  function splitSteps(analysis, kp) {
    const raw = String(analysis).split(/([。；;])/);
    const parts = [];
    for (let i = 0; i < raw.length; i += 2) {
      const seg = (raw[i] || '') + (raw[i + 1] || '');
      if (seg.trim()) parts.push(seg);
    }
    if (parts.length >= 2) {
      return parts.slice(0, 5).map((s, i) => `<div class="step"><i>${i + 1}</i><div>${s}</div></div>`).join('');
    }
    return `<div class="step"><i>1</i><div>${analysis}</div></div>`;
  }

  /* ---------------- 匹配题目 / 知识点 ---------------- */
  function matchQuestion(text) {
    if (!text) return null;
    const t = stripMath(text);
    let best = null, bestScore = 0;
    QUESTIONS.forEach(q => {
      const s = similarity(t, stripMath(q.stem));
      if (s > bestScore) { bestScore = s; best = q; }
    });
    return bestScore >= 0.22 ? best : null;
  }
  function matchKp(text) {
    if (!text) return null;
    const t = stripMath(text);
    let best = null, bestScore = 0;
    KNOWLEDGE.forEach(k => {
      let s = similarity(t, k.title) * 2;
      k.tags.forEach(tag => { if (t.indexOf(tag) >= 0) s += 0.6; });
      if (s > bestScore) { bestScore = s; best = k; }
    });
    return bestScore > 0.2 ? best : null;
  }
  function similarity(a, b) {
    const setA = new Set(grams(a)), setB = new Set(grams(b));
    if (!setA.size || !setB.size) return 0;
    let inter = 0;
    setA.forEach(g => { if (setB.has(g)) inter++; });
    return inter / Math.min(setA.size, setB.size);
  }
  function grams(s) {
    s = String(s).replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, '');
    const out = [];
    for (let i = 0; i < s.length - 1; i++) out.push(s.slice(i, i + 2));
    return out.length ? out : [s];
  }

  /* ---------------- 渲染对话 ---------------- */
  function renderLog() {
    const log = $('#chat-log');
    if (!log) return;
    const msgs = Store.Record.chat();
    log.innerHTML = msgs.map((m, idx) => renderMsg(m, idx)).join('');
    bindMsgActions(log, msgs);
    renderMath(log);
    log.scrollTop = log.scrollHeight;
  }

  function renderMsg(m, idx) {
    if (m.role === 'user') {
      return `<div class="msg user">
        <span class="who">我</span>
        <div class="bubble">
          ${m.imgs && m.imgs.length ? m.imgs.map(im => `<img src="${im.url}" style="max-width:180px;border-radius:2px;border:1px solid var(--line);margin-bottom:8px;display:block">`).join('') : ''}
          ${esc(m.text)}
        </div></div>`;
    }
    const stages = m.stages || [{ title: '', html: esc(m.text || '') }];
    const shown = Math.min(m.stage || 1, stages.length);
    let html = '';
    for (let i = 0; i < shown; i++) {
      html += `<h5>${stages[i].title}</h5>${stages[i].html}`;
    }
    let actions = '';
    if (shown < stages.length) {
      actions += `<button class="btn btn-gold btn-sm reveal-btn" data-act="next" data-idx="${idx}">没思路，给下一步提示 →</button> `;
    }
    if (shown < stages.length - 1) {
      actions += `<button class="btn btn-ghost btn-sm reveal-btn" data-act="all" data-idx="${idx}">直接看完整答案</button> `;
    }
    if (shown >= stages.length && m.qid) {
      actions += `<a class="btn btn-ghost btn-sm reveal-btn" href="practice.html?kp=${getQuestion(m.qid) ? getQuestion(m.qid).kp : ''}" data-link>做一道同类题</a> `;
      actions += `<button class="btn btn-ghost btn-sm reveal-btn" data-act="similar" data-idx="${idx}">再来一道类似的</button>`;
    }
    return `<div class="msg ai">
      <span class="who">AI</span>
      <div class="bubble">${html}${actions ? `<div style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap">${actions}</div>` : ''}
        <div style="margin-top:10px;font-size:12px;color:var(--text-3)">还可以继续追问，比如"这一步为什么这样做""换个方法讲讲"</div>
      </div></div>`;
  }

  function bindMsgActions(log, msgs) {
    $$('[data-act]', log).forEach(b => {
      b.onclick = () => {
        const i = parseInt(b.dataset.idx, 10);
        const m = msgs[i];
        const total = (m.stages || []).length;
        if (b.dataset.act === 'next') m.stage = Math.min((m.stage || 1) + 1, total);
        if (b.dataset.act === 'all') m.stage = total;
        if (b.dataset.act === 'similar') { sendSimilar(m); return; }
        Store.save();
        renderLog();
      };
    });
  }

  function sendSimilar(m) {
    const q = m.qid ? getQuestion(m.qid) : null;
    if (!q) return;
    const same = QUESTIONS.filter(x => x.kp === q.kp && x.id !== q.id);
    const pick = same[Math.floor(Math.random() * same.length)];
    if (!pick) { toast('本知识点暂时没有更多同类题', 'info'); return; }
    const userMsg = { role: 'user', text: '再来一道类似的题', ts: Date.now() };
    push(userMsg);
    const reply = buildReply(stripMath(pick.stem), null);
    reply.qid = pick.id;
    push(reply);
    renderLog();
  }

  /* ---------------- 侧栏 ---------------- */
  function renderQuick() {
    const ms = Store.Record.mistakes().slice(0, 3);
    const items = ms.map(m => {
      const q = getQuestion(m.qid);
      return q ? { label: '错题：' + plain(q.stem).slice(0, 20) + '…', text: stripMath(q.stem) } : null;
    }).filter(Boolean);
    const base = [
      { label: '一次函数怎么求解析式？', text: '已知一次函数图象过点 (1,3) 与 (-2,-3)，求解析式' },
      { label: '二次函数顶点式怎么配方？', text: '把 y=2x^2-8x+5 化为顶点式' },
      { label: '导数求单调区间的步骤？', text: '求 f(x)=x^3-3x^2-9x+5 的单调区间' },
      { label: '二项分布期望怎么算？', text: '投篮命中率 0.6，投 3 次，求命中次数的分布列与期望' }
    ];
    $('#quick-list').innerHTML = items.concat(base).map(it =>
      `<div class="quick-item" data-text="${esc(it.text)}">${esc(it.label)}</div>`).join('');
    $$('#quick-list .quick-item').forEach(el => el.onclick = () => {
      $('#chat-text').value = el.dataset.text; send();
    });

    const plan = Store.Recommend.plan((Store.Account.current() || {}).grade);
    $('#reco-list').innerHTML = (plan.questions.slice(0, 4).map(p =>
      `<div class="quick-item" data-text="${esc(stripMath(p.q.stem))}" title="${esc(p.reason)}">
        <b>${esc(p.kp.title)} · ${LEVEL_NAME[p.q.level]}</b><br><span style="color:var(--text-3)">${esc(plain(p.q.stem).slice(0, 22))}…</span>
      </div>`).join('') || '<div style="font-size:13px;color:var(--text-3)">暂无推荐</div>');
    $$('#reco-list .quick-item').forEach(el => el.onclick = () => {
      $('#chat-text').value = el.dataset.text; send();
    });
  }

  function stripMath(s) { return String(s).replace(/\$[^$]*\$/g, '').replace(/\\\(|\\\)/g, ''); }

/* 用于列表预览：去掉 LaTeX 命令与花括号，避免出现 \sqrt、\{ 等源码 */
function plain(s) {
  return stripMath(s)
    .replace(/\\[a-zA-Z]+/g, ' ')
    .replace(/[{}]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}
})();
