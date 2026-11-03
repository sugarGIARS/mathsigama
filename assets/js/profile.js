/* profile.js · 个人中心 */
(function () {
  document.addEventListener('DOMContentLoaded', () => {
    initPage('profile');
    const u = requireLogin();
    if (!u) return;

    /* 资料卡 */
    $('#p-avatar').textContent = u.avatarText || (u.nickname || u.username).slice(0, 1);
    $('#p-name').textContent = (u.nickname || u.username) + ' 同学';
    $('#p-grade').textContent = gradeName(u.grade);
    $('#p-version').textContent = u.version || '人教版';
    const since = u.createdAt ? new Date(u.createdAt) : null;
    $('#p-since').textContent = (since && !isNaN(since.getTime()))
      ? '注册于 ' + since.toLocaleDateString('zh-CN')
      : '本地账号';

    /* 设置表单 */
    $('#set-nick').value = u.nickname || u.username;
    $('#set-school').value = u.school || '';
    $('#set-grade').innerHTML = GRADES.map(g => `<option value="${g.id}" ${g.id === u.grade ? 'selected' : ''}>${g.name}</option>`).join('');
    $('#set-version').innerHTML = VERSIONS.map(v => `<option value="${v}" ${v === (u.version || '人教版') ? 'selected' : ''}>${v}</option>`).join('');

    $('#btn-save').onclick = () => {
      const nick = $('#set-nick').value.trim();
      if (nick.length < 1) { toast('昵称不能为空', 'error'); return; }
      Store.Account.update({ nickname: nick, school: $('#set-school').value.trim(), grade: $('#set-grade').value, version: $('#set-version').value });
      toast('资料已保存', 'success');
      setTimeout(() => location.reload(), 700);
    };
    $('#btn-pwd').onclick = () => {
      const o = $('#set-old').value, n = $('#set-new').value;
      if (n.length < 6) { toast('新密码至少 6 位', 'error'); return; }
      const r = Store.Account.setPassword(o, n);
      toast(r.msg, r.ok ? 'success' : 'error');
      if (r.ok) { $('#set-old').value = ''; $('#set-new').value = ''; }
    };

    renderKpi();
    renderBars();
    renderReport();
    renderMistakes();
    renderReco();

    $('#btn-report').onclick = () => {
      showLoader('正在分析你的答题记录…');
      setTimeout(() => {
        Store.Stats.report();
        hideLoader();
        renderReport();
        toast('学习报告已生成', 'success');
      }, 900);
    };
    $('#btn-redo-all').onclick = () => { location.href = 'practice.html?mistakes=1'; };

    /* 锚点定位 */
    if (location.hash === '#mistakes') $('#mistakes').scrollIntoView({ behavior: 'smooth' });
    if (location.hash === '#report') $('#report').scrollIntoView({ behavior: 'smooth' });
  });

  function renderKpi() {
    const o = Store.Stats.overview();
    $('#k-total').textContent = o.total;
    $('#k-rate').textContent = Math.round(o.rate * 100) + '%';
    $('#k-wrong').textContent = o.mistakes;
    $('#k-learned').textContent = o.learned;
  }

  function renderBars() {
    const u = Store.Account.current();
    const stats = Store.Stats.kpStats();
    const list = KNOWLEDGE.filter(k => k.grade === (u.grade || 'g1'));
    const pool = list.length ? list : KNOWLEDGE;
    $('#kp-bars').innerHTML = pool.map(k => {
      const s = stats[k.id];
      const rate = s ? s.rate : null;
      const cls = rate === null ? '' : (rate >= .8 ? '' : rate >= .6 ? 'mid' : 'low');
      const weak = rate !== null && rate < .6;
      return `<div class="bar-row ${weak ? 'weak' : ''}" title="${s ? s.correct + '/' + s.total : '未练习'}">
        <span class="kp-name">${esc(k.title)}</span>
        <span class="bar"><i class="${cls}" style="width:${rate === null ? 0 : Math.round(rate * 100)}%"></i></span>
        <span class="bar-val">${rate === null ? '—' : Math.round(rate * 100) + '%'}</span>
      </div>`;
    }).join('');
  }

  function renderReport() {
    const reports = Store.Stats.reports();
    const box = $('#report-box');
    if (!reports.length) {
      box.innerHTML = `<div class="empty"><span class="ico">◎</span>还没有学习报告，先去做几道题，再点"生成最新报告"。</div>`;
    } else {
      const r = reports[reports.length - 1];
      const w = r.summary.weak, st = r.summary.strong, un = r.summary.untouched;
      box.innerHTML = `
        <div class="report-summary">
          <div class="note-box jade" style="margin:0"><b class="h">掌握（${st.length}）</b>${st.length ? st.map(x => esc(x.title)).join('、') : '暂无'}</div>
          <div class="note-box red" style="margin:0"><b class="h">薄弱（${w.length}）</b>${w.length ? w.map(x => esc(x.title)).join('、') : '暂无'}</div>
          <div class="note-box" style="margin:0"><b class="h">未开始（${un.length}）</b>${un.length ? un.map(x => esc(x.title)).join('、') : '全部已接触'}</div>
        </div>
        <div style="font-size:13px;color:var(--text-2);margin-bottom:10px">报告日期：${r.date} · 覆盖 ${r.items.length} 个知识点</div>
        ${w.length ? `<div class="smart-tip">
          <span class="ico">!</span>
          <div><b>系统建议</b><p>优先复习「${esc(w[0].title)}」，已为你准备好资料与 ${questionsOf(w[0].kp, 'basic').length} 道基础题，建议先回看资料再做练习。</p>
          <div style="margin-top:8px;display:flex;gap:8px;flex-wrap:wrap">
            <a class="btn btn-gold btn-sm" href="learn.html?kp=${w[0].kp}" data-link>看资料</a>
            <a class="btn btn-ghost btn-sm" href="practice.html?kp=${w[0].kp}&level=basic" data-link>做基础题</a>
          </div></div>` : ''}
        <div class="divider"></div>
        <div style="font-size:13.5px">${r.items.map(i => {
          const color = i.status === '薄弱' ? 'var(--cinnabar)' : i.status === '掌握' ? 'var(--jade-500)' : i.status === '一般' ? 'var(--gold-500)' : 'var(--text-3)';
          return `<div class="list-item"><span class="lt"><b>${esc(i.title)}</b><small>做 ${i.total} 题 · 对 ${i.correct} 题</small></span>
            <span class="tag" style="color:${color}">${i.status}</span></div>`;
        }).join('')}</div>`;
    }
    $('#report-history').innerHTML = reports.length > 1
      ? `<div style="font-size:12.5px;color:var(--text-3)">历史报告：${reports.slice(-5).reverse().map(r => r.date).join(' · ')}</div>`
      : '';
  }

  function renderMistakes() {
    const ms = Store.Record.mistakes();
    const box = $('#mistake-box');
    if (!ms.length) {
      box.innerHTML = `<div class="empty"><span class="ico">✓</span>错题本是空的，说明你最近状态很好！</div>`;
      return;
    }
    box.innerHTML = ms.map(m => {
      const q = getQuestion(m.qid); const kp = getKp(m.kp);
      if (!q) return '';
      return `<div class="list-item">
        <span class="lt">
          <b>${kp ? esc(kp.title) : ''} · ${LEVEL_NAME[q.level]} · ${TYPE_NAME[q.type]}</b>
          <small>${esc(strip(q.stem).slice(0, 46))}… · 错 ${m.wrong} 次 · ${fmtDate(m.lastTs)}</small>
        </span>
        <div style="display:flex;gap:6px;flex-wrap:wrap">
          <a class="btn btn-ghost btn-sm" href="practice.html?kp=${m.kp}" data-link>重做</a>
          <a class="btn btn-ghost btn-sm" href="ai.html?q=${m.qid}" data-link>问AI</a>
          <button class="btn btn-ghost btn-sm" data-resolve="${m.qid}">标记已攻克</button>
        </div></div>`;
    }).join('');
    $$('#mistake-box [data-resolve]').forEach(b => b.onclick = () => {
      Store.Record.resolve(b.dataset.resolve);
      toast('已标记为攻克，错题已移出', 'success');
      renderMistakes(); renderKpi();
    });
  }

  function renderReco() {
    const u = Store.Account.current();
    const plan = Store.Recommend.plan(u.grade);
    $('#reco-box').innerHTML = `
      ${plan.tips.map(t => `<div class="smart-tip"><span class="ico">${t.icon}</span><div><b>系统观察</b><p>${esc(t.text)}</p></div></div>`).join('')}
      <div class="divider"></div>
      <div style="font-size:13px;color:var(--text-2);margin-bottom:10px">推荐练习顺序（按优先级）</div>
      ${plan.kps.map((p, i) => `
        <div class="list-item">
          <span class="lt"><b>${i + 1}. ${esc(p.kp.title)}</b><small>${esc(p.reason)}</small></span>
          <div style="display:flex;gap:6px">
            <a class="btn btn-ghost btn-sm" href="learn.html?kp=${p.kp.id}" data-link>资料</a>
            <a class="btn btn-ghost btn-sm" href="practice.html?kp=${p.kp.id}" data-link>练习</a>
          </div>
        </div>`).join('')}`;
  }

  function strip(s) { return String(s).replace(/\$[^$]*\$/g, '公式').replace(/\\\(|\\\)/g, ''); }
})();
