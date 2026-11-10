/* ============================================================
   db.js · 统一数据访问层
   · 后端在线（/api）时走真实 MySQL 数据库
   · 后端不可用时自动回退到内置题库与 localStorage，纯静态也能用
   ============================================================ */
const DB = (function () {
  let online = null, health = null, token = localStorage.getItem('ms_admin_token') || '';

  function qs(obj) {
    const p = new URLSearchParams();
    Object.keys(obj || {}).forEach(k => { if (obj[k] !== null && obj[k] !== undefined && obj[k] !== '') p.set(k, obj[k]); });
    return p.toString();
  }
  async function req(path, opt) {
    const o = opt || {};
    const res = await fetch('/api' + path, {
      method: o.method || 'GET',
      headers: Object.assign({ 'Content-Type': 'application/json' }, token ? { 'x-admin-token': token } : {}, o.headers || {}),
      body: o.body ? JSON.stringify(o.body) : undefined
    });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return res.json();
  }

  async function ready() {
    if (online !== null) return online;
    try {
      const r = await fetch('/api/health', { cache: 'no-store' });
      if (!r.ok) throw new Error('bad');
      health = await r.json();
      online = true;
    } catch (e) { online = false; health = null; }
    return online;
  }
  async function refresh() { online = null; return ready(); }

  /* 本地回退：使用内置题库 */
  function fallbackQuestions(opt) {
    const o = opt || {};
    let list = [];
    try {
      list = o.kp ? questionsOf(o.kp, o.level || null) : QUESTIONS.slice();
      if (!o.kp && o.level) list = list.filter(q => q.level === o.level);
    } catch (e) { list = []; }
    return (o.limit ? list.slice(0, o.limit) : list).map(q => ({
      id: q.id, kp: q.kp, level: q.level, type: q.type, stem: q.stem,
      options: q.options || [], answer: q.answer || '', accept: q.accept || [],
      keywords: q.keywords || [], analysis: q.analysis || '', tags: [], source: 'builtin'
    }));
  }

  return {
    ready, refresh,
    status: () => ({ online: online === true, health }),
    setToken: t => { token = t || ''; localStorage.setItem('ms_admin_token', token); },
    getToken: () => token,

    async kp() {
      if (await ready()) { try { return (await req('/kp')).items; } catch (e) { } }
      try { return KNOWLEDGE.map(k => ({ id: k.id, grade: k.grade, title: k.title, versions: k.versions, tags: k.tags, summary: k.summary })); } catch (e) { return []; }
    },
    async questions(opt) {
      if (await ready()) {
        try { const r = await req('/questions?' + qs(opt)); return r.items || []; } catch (e) { }
      }
      return fallbackQuestions(opt);
    },
    async stats() {
      if (await ready()) { try { return await req('/stats'); } catch (e) { } }
      try {
        return { total: QUESTIONS.length, byKp: [], byLevel: [], bySource: [{ source: 'builtin', n: QUESTIONS.length }], offline: true };
      } catch (e) { return { total: 0, byKp: [], byLevel: [], bySource: [] }; }
    },
    async save(q) { return req('/questions', { method: 'POST', body: q }); },
    async update(id, q) { return req('/questions/' + encodeURIComponent(id), { method: 'PUT', body: q }); },
    async remove(id) { return req('/questions/' + encodeURIComponent(id), { method: 'DELETE' }); },
    async importQuestions(list, source) { return req('/import', { method: 'POST', body: { questions: list, source: source || 'import' } }); },
    exportUrl: (kp) => '/api/export' + (kp ? '?kp=' + encodeURIComponent(kp) : ''),
    exportCsvUrl: (kp) => '/api/export?format=csv' + (kp ? '&kp=' + encodeURIComponent(kp) : ''),

    async attempt(a) {
      /* 带上当前账号，服务端据此区分体验账号（demo）并每日清理 */
      let uid = 'guest';
      try { const u = Store.Account.current(); if (u) uid = u.username; } catch (e) { }
      const payload = Object.assign({ uid }, a || {});
      if (await ready()) { try { return await req('/attempts', { method: 'POST', body: payload }); } catch (e) { } }
      return null;
    },
    async attempts(limit) { return (await req('/attempts?limit=' + (limit || 50))).items || []; },
    async users() { return (await req('/users')).items || []; },
    async saveUser(u) { return req('/users', { method: 'POST', body: u }); },
    async updateUser(id, patch) { return req('/users/' + encodeURIComponent(id), { method: 'PUT', body: patch }); },
    async deleteUser(id) { return req('/users/' + encodeURIComponent(id), { method: 'DELETE' }); },

    async saveKp(k) { return req('/kp', { method: 'POST', body: k }); },
    async deleteKp(id, force) { return req('/kp/' + encodeURIComponent(id) + (force ? '?force=1' : ''), { method: 'DELETE' }); },
    async uploadAvatar(dataUrl, userToken) {
      if (!(await ready())) return null;
      return req('/me/avatar', { method: 'POST', body: { dataUrl, token: userToken } });
    },
    async removeAvatar(userToken) {
      if (!(await ready())) return null;
      return req('/me/avatar?token=' + encodeURIComponent(userToken || ''), { method: 'DELETE' });
    },

    async aiStatus() {
      if (await ready()) { try { return await req('/ai/status'); } catch (e) { } }
      return { configured: false, offline: true };
    },
    async setAiKey(cfg) { return req('/ai/key', { method: 'POST', body: cfg }); },
    async chat(payload) {
      if (await ready()) {
        try { return await req('/ai/chat', { method: 'POST', body: payload }); } catch (e) { }
      }
      return null; // 调用方回退到本地规则
    }
  };
})();
