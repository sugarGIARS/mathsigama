/* ============================================================
   admin.js · 管理端
   依赖：data.js / store.js / db.js / app.js
   ============================================================ */
(function () {
  const $ = s => document.querySelector(s);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const LEVEL = { basic: '基础', advance: '进阶', challenge: '挑战' };
  const TYPE = { choice: '选择', fill: '填空', solve: '解答' };

  const state = { offset: 0, limit: 30, total: 0, editing: null, kps: [] };

  /* ---------- 面板切换 ---------- */
  document.querySelectorAll('.adm-nav button').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.adm-nav button').forEach(b => b.classList.remove('on'));
      btn.classList.add('on');
      const name = btn.dataset.pane;
      document.querySelectorAll('.adm-pane').forEach(p => p.classList.remove('on'));
      $('#pane-' + name).classList.add('on');
      if (name === 'users') loadUsers();
      if (name === 'kp') loadKpTable();
      if (name === 'bank' && !state.kps.length) loadKpOptions();
    });
  });

  /* ---------- 状态 ---------- */
  async function refreshStatus() {
    const ok = await DB.refresh();
    const tag = $('#adm-backend');
    if (ok) {
      const s = await DB.stats().catch(() => null);
      tag.className = 'tag tag-jade';
      tag.textContent = '后端已连接 · 题库 ' + (s ? s.total : '—') + ' 道';
    } else {
      tag.className = 'tag tag-red';
      tag.textContent = '后端未启动（静态模式）· 请用 start.bat 启动服务端以管理题库';
    }
    const ai = await DB.aiStatus().catch(() => ({ configured: false }));
    const at = $('#adm-ai');
    at.className = 'tag ' + (ai.configured ? 'tag-gold' : 'tag-blue');
    at.textContent = ai.configured ? ('AI 已配置 · ' + (ai.model || 'deepseek-chat')) : 'AI 未配置密钥 · 走本地兜底';
    return ok;
  }
  $('#adm-reload').addEventListener('click', async () => {
    DB.setToken($('#adm-token').value.trim());
    const ok = await refreshStatus();
    toast(ok ? '已连接到后端数据库' : '后端未启动，仅能查看内置数据', ok ? 'ok' : 'warn');
    loadOverview(); loadBank(0);
  });

  /* ---------- 概览 ---------- */
  async function loadOverview() {
    const s = await DB.stats().catch(() => ({ total: 0, byKp: [], byLevel: [], bySource: [] }));
    const box = $('#ov-stats');
    const src = (s.bySource || []).map(x => x.source + ' ' + x.n).join(' · ') || '—';
    box.innerHTML = [
      ['题库总量', s.total || 0], ['知识点', (s.byKp || []).length], ['答题记录', s.attempts || 0], ['用户', s.users || 0]
    ].map(([k, v]) => `<div class="stat-box"><b>${v}</b><span>${k}</span></div>`).join('')
      + `<div class="stat-box"><b style="font-size:15px;font-weight:600;line-height:1.5">${esc(src)}</b><span>题目来源分布</span></div>`;

    const max = Math.max(1, ...(s.byKp || []).map(x => x.n));
    $('#ov-bars').innerHTML = (s.byKp || []).map(x => {
      const t = (state.kps.find(k => k.id === x.kp) || {}).title || x.kp;
      return `<div class="bar-row"><span style="color:var(--text-2)">${esc(t)}</span>
        <span class="bar-track"><span class="bar-fill" style="width:${Math.round(x.n / max * 100)}%"></span></span>
        <span style="text-align:right">${x.n}</span></div>`;
    }).join('') || '<div class="adm-empty">暂无数据</div>';
  }

  /* ---------- 知识点下拉 ---------- */
  async function loadKpOptions() {
    state.kps = await DB.kp().catch(() => []);
    const opts = state.kps.map(k => `<option value="${k.id}">${esc(k.title)}</option>`).join('');
    $('#f-kp').innerHTML = '<option value="">全部</option>' + opts;
    $('#e-kp').innerHTML = opts;
  }

  /* ---------- 题库表格 ---------- */
  async function loadBank(offset) {
    state.offset = offset || 0;
    const opt = {
      kp: $('#f-kp').value, level: $('#f-level').value, source: $('#f-source').value,
      q: $('#f-q').value.trim(), limit: state.limit, offset: state.offset
    };
    let items = [], total = 0;
    try {
      const r = await fetch('/api/questions?' + new URLSearchParams(
        Object.keys(opt).filter(k => opt[k]).reduce((o, k) => (o[k] = opt[k], o), {})).toString()).then(r => r.json());
      items = r.items || []; total = r.total || 0;
    } catch (e) {
      items = await DB.questions(opt).catch(() => []); total = items.length;
    }
    state.total = total;
    $('#bank-count').textContent = `共 ${total} 道 · 第 ${Math.floor(state.offset / state.limit) + 1} 页`;
    const el = $('#bank-table');
    if (!items.length) { el.innerHTML = '<div class="adm-empty">没有符合条件的题目</div>'; return; }
    el.innerHTML = `<table class="adm"><thead><tr>
      <th style="width:96px">知识点</th><th>题干</th><th style="width:70px">难度</th>
      <th style="width:64px">题型</th><th style="width:74px">来源</th><th style="width:130px">操作</th>
      </tr></thead><tbody>${items.map(q => `<tr>
        <td>${esc(q.kp)}</td>
        <td class="stem-cell"><div class="txt">${esc(q.stem)}</div></td>
        <td>${LEVEL[q.level] || q.level}</td><td>${TYPE[q.type] || q.type}</td>
        <td>${esc(q.source || '')}</td>
        <td><div class="adm-actions">
          <button class="btn btn-ghost btn-sm" data-edit="${esc(q.id)}">编辑</button>
          <button class="btn btn-ghost btn-sm" data-del="${esc(q.id)}">删除</button>
        </div></td></tr>`).join('')}</tbody></table>`;
    if (window.renderMathInElement) renderMathInElement(el);
    el.querySelectorAll('[data-edit]').forEach(b => b.addEventListener('click', () => openEdit(items.find(x => x.id === b.dataset.edit))));
    el.querySelectorAll('[data-del]').forEach(b => b.addEventListener('click', async () => {
      if (!confirm('确认删除这道题？')) return;
      await DB.remove(b.dataset.del).catch(() => { });
      toast('已删除', 'ok'); loadBank(state.offset); loadOverview();
    }));
  }
  $('#f-search').addEventListener('click', () => loadBank(0));
  $('#bank-prev').addEventListener('click', () => loadBank(Math.max(0, state.offset - state.limit)));
  $('#bank-next').addEventListener('click', () => loadBank(state.offset + state.limit < state.total ? state.offset + state.limit : state.offset));

  /* ---------- 编辑 / 新增 ---------- */
  function openEdit(q) {
    state.editing = q || null;
    $('#edit-title').textContent = q ? '编辑题目' : '新增题目';
    $('#e-kp').value = q ? q.kp : (state.kps[0] ? state.kps[0].id : '');
    $('#e-level').value = q ? q.level : 'basic';
    $('#e-type').value = q ? q.type : 'choice';
    $('#e-answer').value = q ? (q.answer || '') : '';
    $('#e-stem').value = q ? q.stem : '';
    $('#e-options').value = q ? ((q.options && q.options.length ? q.options : (q.accept || [])).join('\n')) : '';
    $('#e-analysis').value = q ? (q.analysis || '') : '';
    $('#edit-modal').style.display = 'block';
  }
  $('#f-add').addEventListener('click', () => { if (!state.kps.length) loadKpOptions().then(() => openEdit(null)); else openEdit(null); });
  $('#e-cancel').addEventListener('click', () => { $('#edit-modal').style.display = 'none'; });
  $('#e-save').addEventListener('click', async () => {
    const q = {
      kp: $('#e-kp').value, level: $('#e-level').value, type: $('#e-type').value,
      stem: $('#e-stem').value.trim(), answer: $('#e-answer').value.trim(),
      analysis: $('#e-analysis').value.trim(), source: 'edited'
    };
    const lines = $('#e-options').value.split('\n').map(s => s.trim()).filter(Boolean);
    if (q.type === 'choice') { q.options = lines; q.accept = []; } else { q.options = []; q.accept = lines; }
    if (!q.stem) { toast('题干不能为空', 'warn'); return; }
    try {
      if (state.editing) await DB.update(state.editing.id, q); else await DB.save(q);
      toast('已保存', 'ok');
      $('#edit-modal').style.display = 'none';
      loadBank(state.offset); loadOverview();
    } catch (e) { toast('保存失败：后端未启动或无权限', 'warn'); }
  });

  /* ---------- 导入导出 ---------- */
  $('#io-file').addEventListener('change', e => {
    const f = e.target.files[0]; if (!f) return;
    const rd = new FileReader();
    rd.onload = () => { $('#io-text').value = String(rd.result || ''); };
    rd.readAsText(f, 'utf-8');
  });
  $('#io-import').addEventListener('click', async () => {
    const txt = $('#io-text').value.trim();
    if (!txt) { toast('请先选择文件或粘贴内容', 'warn'); return; }
    let list = [];
    try { const d = JSON.parse(txt); list = Array.isArray(d) ? d : (d.questions || []); }
    catch (e) { toast('JSON 解析失败：' + e.message.slice(0, 60), 'warn'); return; }
    if (!list.length) { toast('没有可导入的题目', 'warn'); return; }
    try {
      const r = await DB.importQuestions(list, $('#io-source').value);
      $('#io-msg').textContent = `新增 ${r.inserted} 道，重复 ${r.duplicate} 道`;
      toast('导入完成', 'ok'); loadOverview();
    } catch (e) { $('#io-msg').textContent = '导入失败：后端未启动或无权限'; }
  });

  /* ---------- AI ---------- */
  $('#ai-save').addEventListener('click', async () => {
    const body = {};
    if ($('#ai-key').value.trim()) body.apiKey = $('#ai-key').value.trim();
    if ($('#ai-model').value.trim()) body.model = $('#ai-model').value.trim();
    if ($('#ai-base').value.trim()) body.baseURL = $('#ai-base').value.trim();
    try {
      const r = await DB.setAiKey(body);
      $('#ai-msg').textContent = r.configured ? ('已保存：' + r.masked) : '已保存（当前无密钥）';
      toast('配置已保存到服务端', 'ok'); refreshStatus();
    } catch (e) { $('#ai-msg').textContent = '保存失败：请检查管理令牌或后端是否启动'; }
  });
  $('#ai-send').addEventListener('click', async () => {
    const t = $('#ai-test').value.trim();
    if (!t) return;
    $('#ai-out').textContent = '请求中…';
    const r = await DB.chat({ message: t }).catch(() => null);
    $('#ai-out').textContent = r ? ('[' + (r.mode || '?') + '] ' + r.content) : '请求失败：后端未启动';
  });

  /* ---------- 用户与记录 ---------- */
  async function loadUsers() {
    try {
      const us = await DB.users();
      $('#user-table').innerHTML = us.length
        ? `<table class="adm"><thead><tr><th>用户名</th><th>昵称</th><th>年级</th><th>版本</th><th>手机号</th><th>注册时间</th><th style="width:130px">操作</th></tr></thead><tbody>
           ${us.map(u => `<tr data-uid="${esc(u.id)}">
             <td>${esc(u.username)}</td><td>${esc(u.nickname || '')}</td>
             <td>${esc(gradeLabel(u.grade))}</td><td>${esc(u.version || '')}</td>
             <td>${esc(u.phone || '')}</td><td>${esc(String(u.created_at || '').slice(0, 10))}</td>
             <td><div class="adm-actions">
               <button class="btn btn-ghost btn-sm" data-u-edit="${esc(u.id)}">编辑</button>
               <button class="btn btn-ghost btn-sm" data-u-del="${esc(u.id)}">删除</button>
             </div></td></tr>`).join('')}</tbody></table>`
        : '<div class="adm-empty">暂无用户，可点击"新增用户"创建</div>';
      $('#user-table').querySelectorAll('[data-u-edit]').forEach(b => b.addEventListener('click', () => openUserModal(us.find(x => x.id === b.dataset.uEdit))));
      $('#user-table').querySelectorAll('[data-u-del]').forEach(b => b.addEventListener('click', async () => {
        const u = us.find(x => x.id === b.dataset.uDel);
        if (!confirm(`确认删除用户「${u.username}」？\n该操作会同时删除其全部答题记录与掌握度数据，不可恢复。`)) return;
        try {
          const r = await DB.deleteUser(u.id);
          if (r && r.ok) { toast(`已删除 ${u.username}（清理答题 ${r.attempts || 0} 条）`, 'ok'); loadUsers(); loadOverview(); }
          else toast('删除失败', 'warn');
        } catch (e) { toast('删除失败：后端未启动或无权限', 'warn'); }
      }));
    } catch (e) { $('#user-table').innerHTML = '<div class="adm-empty">无法读取：后端未启动或无权限</div>'; }
    try {
      const as = await DB.attempts(50);
      $('#attempt-table').innerHTML = as.length
        ? `<table class="adm"><thead><tr><th>题目</th><th>知识点</th><th>难度</th><th>结果</th><th>用时</th><th>时间</th></tr></thead><tbody>
           ${as.map(a => `<tr><td>${esc(a.qid)}</td><td>${esc(a.kp || '')}</td><td>${LEVEL[a.level] || a.level || ''}</td>
             <td>${a.correct ? '<span class="tag tag-jade">正确</span>' : '<span class="tag tag-red">错误</span>'}</td>
             <td>${a.sec || 0}s</td><td>${new Date(a.ts || Date.now()).toLocaleString('zh-CN')}</td></tr>`).join('')}</tbody></table>`
        : '<div class="adm-empty">暂无答题记录</div>';
    } catch (e) { $('#attempt-table').innerHTML = '<div class="adm-empty">无法读取：后端未启动或无权限</div>'; }
  }

  /* ---------- 体验数据手动清理 ---------- */
  const demoBtn = $('#demo-reset');
  if (demoBtn) demoBtn.addEventListener('click', async () => {
    const msg = $('#demo-msg');
    msg.textContent = '正在清理…';
    try {
      const r = await fetch('/api/demo/reset', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' }).then(x => x.json());
      msg.textContent = '已清空：答题记录 ' + (r.attempts || 0) + ' 条、账号 ' + (r.users || 0) + ' 个（' + (r.day || '') + '）';
      loadUsers();
    } catch (e) {
      msg.textContent = '清理失败：后端未启动';
    }
  });

  /* ---------- 年级/版本辅助 ---------- */
  function gradeLabel(id) { const g = (typeof GRADES !== 'undefined' ? GRADES : []).find(x => x.id === id); return g ? g.name : (id || ''); }
  function fillGradeSelect(sel, withAll) {
    const gs = typeof GRADES !== 'undefined' ? GRADES : [];
    sel.innerHTML = (withAll ? '<option value="">全部</option>' : '') +
      gs.map(g => `<option value="${g.id}">${g.name}</option>`).join('');
  }
  function fillVersionSelect(sel) {
    sel.innerHTML = (typeof VERSIONS !== 'undefined' ? VERSIONS : []).map(v => `<option value="${v}">${v}</option>`).join('');
  }

  /* ---------- 用户新增 / 编辑弹窗 ---------- */
  let userEditing = null;
  function openUserModal(u) {
    userEditing = u || null;
    fillGradeSelect($('#u-grade')); fillVersionSelect($('#u-version'));
    $('#user-modal-title').textContent = u ? '编辑用户 · ' + u.username : '新增用户';
    $('#u-username').value = u ? u.username : '';
    $('#u-username').disabled = !!u;
    $('#u-nickname').value = u ? (u.nickname || '') : '';
    $('#u-grade').value = u ? (u.grade || '') : 'g7';
    $('#u-version').value = u ? (u.version || '人教版') : '人教版';
    $('#u-phone').value = u ? (u.phone || '') : '';
    $('#u-school').value = u ? (u.school || '') : '';
    $('#u-pwd').value = '';
    $('#user-modal').style.display = 'block';
  }
  $('#u-add').addEventListener('click', () => openUserModal(null));
  $('#u-cancel').addEventListener('click', () => { $('#user-modal').style.display = 'none'; });
  $('#u-save').addEventListener('click', async () => {
    const body = {
      nickname: $('#u-nickname').value.trim(),
      grade: $('#u-grade').value, version: $('#u-version').value,
      phone: $('#u-phone').value.trim(), school: $('#u-school').value.trim()
    };
    if ($('#u-pwd').value) body.pwd = $('#u-pwd').value;
    try {
      if (userEditing) {
        await DB.updateUser(userEditing.id, body);
      } else {
        body.username = $('#u-username').value.trim();
        body.pwd = body.pwd || '123456';
        if (!body.username || body.username.length < 2) { toast('用户名至少 2 个字符', 'warn'); return; }
        await DB.saveUser(body);
      }
      toast('用户已保存', 'ok');
      $('#user-modal').style.display = 'none';
      loadUsers(); loadOverview();
    } catch (e) { toast('保存失败：后端未启动或无权限（用户名可能已存在）', 'warn'); }
  });

  /* ---------- 分类（知识点）管理 ---------- */
  async function loadKpTable() {
    const kps = await DB.kp();
    state.kps = kps;
    const f = $('#k-grade-filter');
    if (f.options.length <= 1) {
      fillGradeSelect(f, true);
      f.addEventListener('change', () => renderKpTable());
    }
    renderKpTable();
  }
  function renderKpTable() {
    const g = $('#k-grade-filter').value;
    const list = state.kps.filter(k => !g || k.grade === g);
    $('#kp-table').innerHTML = list.length
      ? `<table class="adm"><thead><tr><th style="width:110px">ID</th><th style="width:110px">年级</th><th>分类名称</th>
         <th style="width:200px">适用版本</th><th>简介</th><th style="width:130px">操作</th></tr></thead><tbody>
         ${list.map(k => `<tr>
           <td>${esc(k.id)}</td><td>${esc(gradeLabel(k.grade))}</td><td>${esc(k.title)}</td>
           <td>${esc((k.versions || []).join('、'))}</td>
           <td class="stem-cell"><div class="txt">${esc(k.summary || '')}</div></td>
           <td><div class="adm-actions">
             <button class="btn btn-ghost btn-sm" data-k-edit="${esc(k.id)}">编辑</button>
             <button class="btn btn-ghost btn-sm" data-k-del="${esc(k.id)}">删除</button>
           </div></td></tr>`).join('')}</tbody></table>`
      : '<div class="adm-empty">该年级下暂无分类</div>';
    $('#kp-table').querySelectorAll('[data-k-edit]').forEach(b => b.addEventListener('click', () => openKpModal(state.kps.find(x => x.id === b.dataset.kEdit))));
    $('#kp-table').querySelectorAll('[data-k-del]').forEach(b => b.addEventListener('click', async () => {
      const k = state.kps.find(x => x.id === b.dataset.kDel);
      try {
        const r = await DB.deleteKp(k.id);
        if (r && r.ok) { toast('已删除分类 ' + k.id, 'ok'); await loadKpTable(); loadKpOptions(); loadOverview(); return; }
        if (r && r.questions > 0 && confirm(`「${k.title}」下还有 ${r.questions} 道题目。\n强制删除会连同这些题目一起删除，确定继续？`)) {
          const r2 = await DB.deleteKp(k.id, true);
          if (r2 && r2.ok) { toast(`已删除分类及 ${r2.removedQuestions} 道题目`, 'ok'); await loadKpTable(); loadKpOptions(); loadOverview(); return; }
        }
        if (r) toast(r.error || '删除失败', 'warn');
      } catch (e) { toast('删除失败：后端未启动或无权限', 'warn'); }
    }));
  }
  let kpEditing = null;
  function openKpModal(k) {
    kpEditing = k || null;
    fillGradeSelect($('#k-grade'));
    $('#kp-modal-title').textContent = k ? '编辑分类 · ' + k.id : '新增分类';
    $('#k-id').value = k ? k.id : '';
    $('#k-id').disabled = !!k;
    $('#k-grade').value = k ? (k.grade || 'g7') : 'g7';
    $('#k-title').value = k ? (k.title || '') : '';
    $('#k-versions').value = k ? (k.versions || []).join(',') : '人教版';
    $('#k-summary').value = k ? (k.summary || '') : '';
    $('#kp-modal').style.display = 'block';
  }
  $('#k-add').addEventListener('click', () => openKpModal(null));
  $('#k-cancel').addEventListener('click', () => { $('#kp-modal').style.display = 'none'; });
  $('#k-save').addEventListener('click', async () => {
    const body = {
      grade: $('#k-grade').value,
      title: $('#k-title').value.trim(),
      versions: $('#k-versions').value.split(/[,，、]/).map(s => s.trim()).filter(Boolean),
      summary: $('#k-summary').value.trim()
    };
    if (!body.title) { toast('分类名称不能为空', 'warn'); return; }
    try {
      if (kpEditing) await DB.saveKp(Object.assign({ id: kpEditing.id }, body));
      else {
        const id = $('#k-id').value.trim();
        if (!id) { toast('请填写分类 ID', 'warn'); return; }
        await DB.saveKp(Object.assign({ id }, body));
      }
      toast('分类已保存', 'ok');
      $('#kp-modal').style.display = 'none';
      await loadKpTable(); loadKpOptions(); loadOverview();
    } catch (e) { toast('保存失败：后端未启动或无权限', 'warn'); }
  });

  /* ---------- 初始化 ---------- */
  (async function init() {
    DB.setToken(localStorage.getItem('ms_admin_token') || '');
    $('#adm-token').value = DB.getToken();
    $('#adm-token').addEventListener('change', e => DB.setToken(e.target.value.trim()));
    await loadKpOptions();
    await refreshStatus();
    loadOverview();
    loadBank(0);
  })();
})();
