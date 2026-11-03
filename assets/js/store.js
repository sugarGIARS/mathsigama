/* ============================================================
   store.js · 本地数据存储
   账号系统 / 学习记录 / 错题本 / 行为追踪 / 学习报告 / 智能推荐
   全部存放于 localStorage（无需后端即可完整体验）
   ============================================================ */

const Store = (() => {
  const KEY = 'wangzan_math_v1';

  const emptyData = () => ({
    answers: [],        // { qid, kp, level, type, correct, sec, ts }
    mistakes: [],       // { qid, kp, wrong, resolved, lastTs }
    behavior: {         // 行为追踪
      kp: {},           // kpId: { views, sec, lastTs }
      q: {}             // qid: { opens, sec, lastTs }
    },
    learned: {},        // kpId: { sec, tabs:[], ts, finished }
    reports: [],        // 学习报告
    ai: [],             // AI 答疑历史
    profile: {}
  });

  function read() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return { users: {}, current: null, data: {}, prefs: {} };
      return JSON.parse(raw);
    } catch (e) {
      return { users: {}, current: null, data: {}, prefs: {} };
    }
  }
  function write(db) {
    try {
      localStorage.setItem(KEY, JSON.stringify(db));
    } catch (e) {
      // 容量超限：先清理对话中的图片与历史记录再试
      try {
        const cur = db.current;
        if (cur && db.data[cur]) {
          db.data[cur].ai = (db.data[cur].ai || []).map(m => ({ ...m, imgs: [] }));
          db.data[cur].answers = (db.data[cur].answers || []).slice(-200);
        }
        localStorage.setItem(KEY, JSON.stringify(db));
      } catch (e2) { /* 忽略 */ }
    }
  }

  let db = read();

  /* ---------------- 体验账号每日清零 ---------------- */
  const DEMO_NAME = 'demo';
  let demoPurged = false;

  function dayKey(d) {
    const t = d || new Date();
    return t.getFullYear() + '-' + String(t.getMonth() + 1).padStart(2, '0') + '-' + String(t.getDate()).padStart(2, '0');
  }
  function isDemo(u) {
    const name = String((u && u.username) || (typeof u === 'string' ? u : '')).toLowerCase();
    return name === DEMO_NAME;
  }
  /* 每天首次访问时清空体验账号的学习数据（账号本身保留，可直接继续体验） */
  function maintain() {
    db.meta = db.meta || {};
    const today = dayKey();
    if (db.meta.demoDay === today) return false;
    let wiped = false;
    Object.keys(db.users || {}).forEach(key => {
      if (isDemo(db.users[key])) {
        db.data = db.data || {};
        db.data[db.users[key].username] = emptyData();
        wiped = true;
      }
    });
    db.meta.demoDay = today;
    write(db);
    demoPurged = wiped;
    if (wiped) {
      /* 同步清空服务端的体验账号答题记录 */
      try { fetch('/api/demo/reset', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' }).catch(() => { }); } catch (e) { }
    }
    return wiped;
  }
  maintain();

  /* ---------------- 账号系统 ---------------- */
  const Account = {
    all() { return db.users; },
    find(name) {
      const key = String(name || '').trim().toLowerCase();
      return Object.values(db.users).find(u => u.username.toLowerCase() === key || (u.phone && u.phone === key)) || null;
    },
    exists(name) { return !!this.find(name); },
    register(opt) {
      const user = {
        username: opt.username.trim(),
        phone: (opt.phone || '').trim(),
        pwd: opt.pwd,
        grade: opt.grade || 'g1',
        version: opt.version || '人教版',
        nickname: opt.nickname || opt.username,
        school: opt.school || '',
        avatarText: (opt.nickname || opt.username).slice(0, 1).toUpperCase(),
        createdAt: Date.now()
      };
      db.users[user.username] = user;
      db.data[user.username] = emptyData();
      db.current = user.username;
      write(db);
      return user;
    },
    login(name, pwd) {
      const u = this.find(name);
      if (!u) return { ok: false, msg: '账号不存在，请先注册' };
      if (u.pwd !== pwd) return { ok: false, msg: '密码不正确，请重新输入' };
      if (!db.data[u.username]) db.data[u.username] = emptyData();
      db.current = u.username;
      write(db);
      return { ok: true, user: u };
    },
    logout() { db.current = null; write(db); },
    current() { return db.current ? db.users[db.current] : null; },
    update(patch) {
      const u = this.current();
      if (!u) return null;
      Object.assign(u, patch);
      if (patch.nickname) u.avatarText = patch.nickname.slice(0, 1).toUpperCase();
      write(db);
      return u;
    },
    setPassword(oldPwd, newPwd) {
      const u = this.current();
      if (!u) return { ok: false, msg: '尚未登录' };
      if (u.pwd !== oldPwd) return { ok: false, msg: '原密码不正确' };
      u.pwd = newPwd; write(db);
      return { ok: true, msg: '密码修改成功' };
    }
  };

  /* ---------------- 学习数据 ---------------- */
  function data() {
    const u = Account.current();
    if (!u) return emptyData();
    if (!db.data[u.username]) db.data[u.username] = emptyData();
    return db.data[u.username];
  }
  function save() { write(db); }

  const Record = {
    addAnswer(q, correct, sec) {
      const d = data();
      d.answers.push({
        qid: q.id, kp: q.kp, level: q.level, type: q.type,
        correct: !!correct, sec: Math.round(sec || 0), ts: Date.now()
      });
      if (!correct) {
        const m = d.mistakes.find(x => x.qid === q.id);
        if (m) { m.wrong += 1; m.resolved = false; m.lastTs = Date.now(); }
        else d.mistakes.push({ qid: q.id, kp: q.kp, wrong: 1, resolved: false, lastTs: Date.now() });
      } else {
        const m = d.mistakes.find(x => x.qid === q.id);
        if (m) { m.resolved = true; }
      }
      save();
    },
    mistakes() { return data().mistakes.filter(m => !m.resolved); },
    allMistakes() { return data().mistakes; },
    resolve(qid) {
      const d = data();
      const m = d.mistakes.find(x => x.qid === qid);
      if (m) { m.resolved = true; save(); }
    },
    removeMistake(qid) {
      const d = data();
      const i = d.mistakes.findIndex(x => x.qid === qid);
      if (i >= 0) { d.mistakes.splice(i, 1); save(); }
    },
    answers() { return data().answers; },

    /* 行为追踪：资料停留时长 */
    trackKp(kpId, sec) {
      if (!kpId) return;
      const d = data();
      const b = d.behavior.kp[kpId] || (d.behavior.kp[kpId] = { views: 0, sec: 0, lastTs: 0 });
      b.sec += sec; b.lastTs = Date.now(); save();
    },
    markKpView(kpId) {
      if (!kpId) return;
      const d = data();
      const b = d.behavior.kp[kpId] || (d.behavior.kp[kpId] = { views: 0, sec: 0, lastTs: 0 });
      b.views += 1; save();
    },
    /* 行为追踪：题目被点开次数与停留时长 */
    trackQuestion(qid, sec, opened) {
      if (!qid) return;
      const d = data();
      const b = d.behavior.q[qid] || (d.behavior.q[qid] = { opens: 0, sec: 0, lastTs: 0 });
      b.sec += sec || 0;
      if (opened) b.opens += 1;
      b.lastTs = Date.now(); save();
    },
    behavior() { return data().behavior; },

    markLearned(kpId, tab, sec) {
      const d = data();
      const l = d.learned[kpId] || (d.learned[kpId] = { sec: 0, tabs: [], ts: Date.now(), finished: false });
      l.sec += sec || 0;
      if (tab && l.tabs.indexOf(tab) < 0) l.tabs.push(tab);
      l.ts = Date.now();
      if (l.tabs.length >= 3) l.finished = true;
      save();
    },
    learned() { return data().learned; },

    pushChat(msg) { const d = data(); d.ai.push(msg); if (d.ai.length > 200) d.ai = d.ai.slice(-200); save(); },
    chat() { return data().ai; },
    clearChat() { data().ai = []; save(); },

    setProfile(patch) { Object.assign(data().profile, patch); save(); }
  };

  /* ---------------- 统计与反馈 ---------------- */
  const Stats = {
    /* 每个知识点的正确率 */
    kpStats(kpId) {
      const d = data();
      const list = kpId ? d.answers.filter(a => a.kp === kpId) : d.answers;
      const map = {};
      list.forEach(a => {
        const m = map[a.kp] || (map[a.kp] = { total: 0, correct: 0, sec: 0, levels: {} });
        m.total += 1;
        if (a.correct) m.correct += 1;
        m.sec += a.sec;
        m.levels[a.level] = (m.levels[a.level] || 0) + 1;
      });
      Object.keys(map).forEach(k => { map[k].rate = map[k].total ? map[k].correct / map[k].total : 0; });
      return map;
    },
    kpRate(kpId) {
      const s = this.kpStats(kpId)[kpId];
      return s ? s.rate : null;
    },
    /* 薄弱知识点：正确率 < 60% 且至少做过 2 题 */
    weakPoints(minCount = 2) {
      const stats = this.kpStats();
      return Object.keys(stats)
        .map(k => ({ kp: k, ...stats[k] }))
        .filter(x => x.total >= minCount && x.rate < 0.6)
        .sort((a, b) => a.rate - b.rate);
    },
    strongPoints(minCount = 2) {
      const stats = this.kpStats();
      return Object.keys(stats)
        .map(k => ({ kp: k, ...stats[k] }))
        .filter(x => x.total >= minCount && x.rate >= 0.8)
        .sort((a, b) => b.rate - a.rate);
    },
    overview() {
      const d = data();
      const total = d.answers.length;
      const correct = d.answers.filter(a => a.correct).length;
      return {
        total,
        correct,
        rate: total ? correct / total : 0,
        mistakes: d.mistakes.filter(m => !m.resolved).length,
        learned: Object.keys(d.learned).filter(k => d.learned[k].finished).length,
        days: distinctDays(d.answers)
      };
    },
    /* 生成学习报告 */
    report(gradeId) {
      const stats = this.kpStats();
      const grade = gradeId || (Account.current() || {}).grade;
      const pool = KNOWLEDGE.filter(k => !grade || k.grade === grade);
      const items = pool.map(k => {
        const s = stats[k.id] || { total: 0, correct: 0, rate: 0, sec: 0 };
        return {
          kp: k.id, title: k.title, total: s.total, correct: s.correct,
          rate: s.total ? s.rate : null,
          status: s.total === 0 ? '未开始' : (s.rate >= 0.8 ? '掌握' : (s.rate >= 0.6 ? '一般' : '薄弱'))
        };
      });
      const rep = {
        ts: Date.now(),
        date: new Date().toLocaleDateString('zh-CN'),
        grade,
        items,
        summary: {
          done: items.filter(i => i.total > 0).length,
          weak: items.filter(i => i.status === '薄弱'),
          strong: items.filter(i => i.status === '掌握'),
          untouched: items.filter(i => i.status === '未开始')
        }
      };
      data().reports.push(rep);
      if (data().reports.length > 30) data().reports = data().reports.slice(-30);
      save();
      return rep;
    },
    reports() { return data().reports; }
  };

  function distinctDays(answers) {
    const set = {};
    answers.forEach(a => { set[new Date(a.ts).toDateString()] = 1; });
    return Object.keys(set).length;
  }

  /* ---------------- 智能推荐引擎 ----------------
     规则（对应需求 6.1）：
     1. 某题被反复点开 / 停留很久 → 判定为难点 → 推送同类题
     2. 某段资料停留时间很长   → 判定为没看懂 → 推送更基础的讲解
     3. 某知识点正确率低       → 判定为薄弱   → 多推送该知识点题目
     4. 某知识点正确率高       → 判定为已掌握 → 减少推送，推更高难度
  ------------------------------------------------ */
  const Recommend = {
    /* 计算每道题的"难度信号"：点开次数 + 停留时长 */
    questionHeat() {
      const b = data().behavior.q;
      const out = {};
      Object.keys(b).forEach(qid => {
        const x = b[qid];
        const heat = x.opens * 2 + Math.min(x.sec, 300) / 30; // 0~10+
        out[qid] = { ...x, heat };
      });
      return out;
    },
    /* 综合推荐：返回 { questions: [...], kps: [...], tips: [...] } */
    plan(gradeId) {
      const grade = gradeId || (Account.current() || {}).grade;
      const stats = Stats.kpStats();
      const heat = this.questionHeat();
      const learned = data().learned;
      const mistakes = data().mistakes.filter(m => !m.resolved);

      const scored = [];
      KNOWLEDGE.filter(k => !grade || k.grade === grade).forEach(k => {
        const s = stats[k.id];
        const l = learned[k.id];
        let score = 0;
        let reason = '';
        if (!s) {
          score = 40; reason = '尚未练习，建议先做几道基础题摸底';
        } else if (s.rate < 0.6) {
          score = 100 - s.rate * 100 + 30; reason = '正确率仅 ' + pct(s.rate) + '，属于薄弱点，需要加强';
        } else if (s.rate >= 0.85) {
          score = 15; reason = '正确率 ' + pct(s.rate) + '，已基本掌握，可挑战更高难度';
        } else {
          score = 45; reason = '正确率 ' + pct(s.rate) + '，继续保持即可稳步提升';
        }
        if (l && l.sec > 240) { score += 25; reason = '资料停留 ' + Math.round(l.sec / 60) + ' 分钟，可能存在没看懂的地方'; }
        if (l && l.sec > 480) { score += 10; }
        const hotQs = QUESTIONS.filter(q => q.kp === k.id && heat[q.id] && heat[q.id].heat >= 4);
        if (hotQs.length) { score += hotQs.length * 6; reason = '有 ' + hotQs.length + ' 道题被反复查看，是本节难点'; }
        const missCount = mistakes.filter(m => m.kp === k.id).length;
        if (missCount) { score += missCount * 8; }
        scored.push({ kp: k, score, reason, rate: s ? s.rate : null, total: s ? s.total : 0, hotQs });
      });
      scored.sort((a, b) => b.score - a.score);

      /* 题目推荐：薄弱知识点优先，已掌握则提高难度 */
      const picked = [];
      scored.forEach(item => {
        const mastered = item.rate !== null && item.rate >= 0.85;
        let pool = QUESTIONS.filter(q => q.kp === item.kp.id);
        if (mastered) pool = pool.filter(q => q.level !== 'basic');
        else if (item.rate !== null && item.rate < 0.6) pool = pool.filter(q => q.level !== 'challenge');
        const hot = pool.filter(q => heat[q.id] && heat[q.id].heat >= 4);
        const ordered = hot.concat(pool.filter(q => hot.indexOf(q) < 0 && q.level === 'basic'))
          .concat(pool.filter(q => q.level === 'advance'))
          .concat(pool.filter(q => q.level === 'challenge'));
        const uniq = [];
        ordered.forEach(q => { if (!uniq.find(x => x.id === q.id)) uniq.push(q); });
        uniq.slice(0, 3).forEach(q => picked.push({ q, kp: item.kp, reason: item.reason }));
      });

      const tips = [];
      const hotList = Object.keys(heat).filter(id => heat[id].heat >= 4)
        .sort((a, b) => heat[b].heat - heat[a].heat).slice(0, 3);
      if (hotList.length) {
        const names = hotList.map(id => { const q = getQuestion(id); return q ? (getKp(q.kp) || {}).title + ' · ' + (TYPE_NAME[q.type] || '') : ''; });
        tips.push({ icon: '◷', text: '系统发现你在「' + names.filter(Boolean).join('、') + '」上停留较久，已为你多准备了几道同类题。' });
      }
      const weak = Stats.weakPoints(1);
      if (weak.length) {
        tips.push({ icon: '!', text: '薄弱知识点：' + weak.slice(0, 3).map(w => (getKp(w.kp) || {}).title).filter(Boolean).join('、') + '，建议先回看资料再做练习。' });
      }
      Object.keys(learned).forEach(kpId => {
        if (learned[kpId].sec > 480) {
          tips.push({ icon: '◈', text: '「' + ((getKp(kpId) || {}).title || '该知识点') + '」的资料你已阅读 ' + Math.round(learned[kpId].sec / 60) + ' 分钟，推荐先看基础讲解再练习。' });
        }
      });

      return { kps: scored.slice(0, 4), questions: picked.slice(0, 8), tips };
    }
  };

  function pct(v) { return Math.round(v * 100) + '%'; }

  /* 偏好（主题、音乐） */
  const Prefs = {
    get(k, def) { return db.prefs && db.prefs[k] !== undefined ? db.prefs[k] : def; },
    set(k, v) { db.prefs = db.prefs || {}; db.prefs[k] = v; write(db); }
  };

  return { Account, Record, Stats, Recommend, Prefs, data, save, maintain, isDemo, demoInfo: () => ({ day: dayKey(), purged: demoPurged }) };
})();
