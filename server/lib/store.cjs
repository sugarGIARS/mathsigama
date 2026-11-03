/* ============================================================
   server/lib/store.cjs · SQLite 存储层（node:sqlite，零依赖）
   表：kp / question / attempt / user / setting
   ============================================================ */
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const crypto = require('crypto');
const { DatabaseSync } = require('node:sqlite');

const ROOT = path.resolve(__dirname, '..', '..');
const DEFAULT_DB = path.join(ROOT, 'server', 'data', 'math.db');

const SCHEMA = `
CREATE TABLE IF NOT EXISTS kp (
  id TEXT PRIMARY KEY, grade TEXT, title TEXT, versions TEXT, tags TEXT, summary TEXT
);
CREATE TABLE IF NOT EXISTS question (
  id TEXT PRIMARY KEY,
  kp TEXT NOT NULL,
  level TEXT NOT NULL DEFAULT 'basic',
  type TEXT NOT NULL DEFAULT 'choice',
  stem TEXT NOT NULL,
  options TEXT DEFAULT '[]',
  answer TEXT DEFAULT '',
  accept TEXT DEFAULT '[]',
  keywords TEXT DEFAULT '[]',
  analysis TEXT DEFAULT '',
  tags TEXT DEFAULT '[]',
  source TEXT DEFAULT 'builtin',
  hash TEXT NOT NULL,
  created_at TEXT, updated_at TEXT
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_question_hash ON question(hash);
CREATE INDEX IF NOT EXISTS idx_question_kp ON question(kp);
CREATE INDEX IF NOT EXISTS idx_question_level ON question(level);
CREATE TABLE IF NOT EXISTS attempt (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  uid TEXT, qid TEXT, kp TEXT, level TEXT, correct INTEGER, sec INTEGER, ts INTEGER
);
CREATE TABLE IF NOT EXISTS user (
  id TEXT PRIMARY KEY, username TEXT, pwd TEXT, grade TEXT, version TEXT,
  nickname TEXT, school TEXT, created_at TEXT
);
CREATE TABLE IF NOT EXISTS setting (key TEXT PRIMARY KEY, value TEXT);
`;

function openDb(file) {
  const f = file || process.env.MS_DB || DEFAULT_DB;
  fs.mkdirSync(path.dirname(f), { recursive: true });
  const db = new DatabaseSync(f);
  db.exec(SCHEMA);
  return db;
}

/* ---------- 去重哈希 ---------- */
function normText(s) {
  return String(s || '')
    .replace(/\\\(|\\\)|\\\[|\\\]|\$/g, '')
    .replace(/\\[a-zA-Z]+/g, '')
    .replace(/[{}]/g, '')
    .replace(/\s+/g, '')
    .replace(/[（）()]/g, '')
    .replace(/[，,、]/g, ',')
    .replace(/[。．.]/g, '')
    .replace(/[＋+]/g, '+')
    .replace(/[－—–\-]/g, '-')
    .replace(/[×＊*]/g, '*')
    .replace(/[／÷]/g, '/')
    .replace(/[：:]/g, ':')
    .toLowerCase();
}
function hashQ(q) {
  const key = normText(q.stem) + '|' + normText(q.answer || (q.accept || []).join(','));
  return crypto.createHash('sha1').update(key).digest('hex').slice(0, 16);
}

/* ---------- 知识点：从前端数据文件读取 ---------- */
function loadKP() {
  const files = [
    ['assets/js/data-kp1.js', 'KP_PART1'],
    ['assets/js/data-kp2.js', 'KP_PART2'],
    ['assets/js/data-kp3.js', 'KP_PART3']
  ];
  const out = [];
  for (const [f, v] of files) {
    const fp = path.join(ROOT, f);
    if (!fs.existsSync(fp)) continue;
    const ctx = { window: {}, document: {} };
    vm.createContext(ctx);
    vm.runInContext(fs.readFileSync(fp, 'utf8') + '\n;__v = (typeof ' + v + ' !== "undefined") ? ' + v + ' : [];', ctx);
    out.push(...(ctx.__v || []));
  }
  return out;
}
function seedKP(db) {
  const rows = loadKP();
  const st = db.prepare('INSERT OR REPLACE INTO kp (id, grade, title, versions, tags, summary) VALUES (?,?,?,?,?,?)');
  for (const k of rows) {
    st.run(k.id, k.grade || '', k.title || '', JSON.stringify(k.versions || []), JSON.stringify(k.tags || []), k.summary || '');
  }
  return rows.length;
}

/* ---------- 题目写入（自带去重） ---------- */
function upsert(db, q, opt) {
  const o = opt || {};
  const hash = q.hash || hashQ(q);
  const now = new Date().toISOString();
  const exist = db.prepare('SELECT id FROM question WHERE hash = ?').get(hash);
  if (exist) {
    if (o.onDup === 'replace') {
      db.prepare('DELETE FROM question WHERE hash = ?').run(hash);
    } else {
      return { action: 'duplicate', id: exist.id, hash };
    }
  }
  const id = q.id || ('q-' + hash);
  const dupId = db.prepare('SELECT id FROM question WHERE id = ?').get(id);
  const finalId = dupId && dupId.id !== (exist && exist.id) ? id + '-' + hash.slice(0, 6) : id;
  db.prepare(`INSERT INTO question
    (id, kp, level, type, stem, options, answer, accept, keywords, analysis, tags, source, hash, created_at, updated_at)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(
    finalId, q.kp, q.level || 'basic', q.type || 'choice', q.stem || '',
    JSON.stringify(q.options || []), q.answer || '', JSON.stringify(q.accept || []),
    JSON.stringify(q.keywords || []), q.analysis || '', JSON.stringify(q.tags || []),
    q.source || 'import', hash, now, now
  );
  return { action: 'inserted', id: finalId, hash };
}

function toObj(r) {
  if (!r) return null;
  const j = s => { try { return JSON.parse(s || '[]'); } catch (e) { return []; } };
  return {
    id: r.id, kp: r.kp, level: r.level, type: r.type, stem: r.stem,
    options: j(r.options), answer: r.answer, accept: j(r.accept), keywords: j(r.keywords),
    analysis: r.analysis, tags: j(r.tags), source: r.source, hash: r.hash, updated_at: r.updated_at
  };
}

function query(db, opt) {
  const o = opt || {};
  const where = [], args = [];
  if (o.kp) { where.push('kp = ?'); args.push(o.kp); }
  if (o.level) { where.push('level = ?'); args.push(o.level); }
  if (o.type) { where.push('type = ?'); args.push(o.type); }
  if (o.source) { where.push('source = ?'); args.push(o.source); }
  if (o.q) { where.push('(stem LIKE ? OR analysis LIKE ? OR id LIKE ?)'); args.push('%' + o.q + '%', '%' + o.q + '%', '%' + o.q + '%'); }
  const w = where.length ? ' WHERE ' + where.join(' AND ') : '';
  const lim = Math.min(parseInt(o.limit, 10) || 50, 500);
  const off = parseInt(o.offset, 10) || 0;
  const rows = db.prepare('SELECT * FROM question' + w + ' ORDER BY kp, level, id LIMIT ? OFFSET ?').all(...args, lim, off);
  const total = db.prepare('SELECT COUNT(*) AS n FROM question' + w).get(...args).n;
  return { total, items: rows.map(toObj) };
}

function stats(db) {
  const total = db.prepare('SELECT COUNT(*) AS n FROM question').get().n;
  const byKp = db.prepare('SELECT kp, COUNT(*) AS n FROM question GROUP BY kp ORDER BY n DESC').all();
  const byLevel = db.prepare('SELECT level, COUNT(*) AS n FROM question GROUP BY level').all();
  const bySource = db.prepare('SELECT source, COUNT(*) AS n FROM question GROUP BY source').all();
  const dupGroups = db.prepare('SELECT COUNT(*) AS n FROM (SELECT hash FROM question GROUP BY hash HAVING COUNT(*) > 1)').get().n;
  const attempts = db.prepare('SELECT COUNT(*) AS n FROM attempt').get().n;
  const users = db.prepare('SELECT COUNT(*) AS n FROM user').get().n;
  return { total, byKp, byLevel, bySource, duplicateHashes: dupGroups, attempts, users };
}

/* ---------- 用户与答题 ---------- */
function saveAttempt(db, a) {
  db.prepare('INSERT INTO attempt (uid, qid, kp, level, correct, sec, ts) VALUES (?,?,?,?,?,?,?)')
    .run(a.uid || '', a.qid || '', a.kp || '', a.level || '', a.correct ? 1 : 0, a.sec || 0, a.ts || Date.now());
  return true;
}
function saveUser(db, u) {
  db.prepare('INSERT OR REPLACE INTO user (id, username, pwd, grade, version, nickname, school, created_at) VALUES (?,?,?,?,?,?,?,?)')
    .run(u.id || u.username, u.username, u.pwd || '', u.grade || '', u.version || '', u.nickname || '', u.school || '', u.created_at || new Date().toISOString());
  return true;
}

/* ---------- 体验账号每日清理 ---------- */
function purgeDemo(db) {
  const a = db.prepare("DELETE FROM attempt WHERE lower(COALESCE(uid,'')) = 'demo'").run();
  const u = db.prepare("DELETE FROM user WHERE lower(COALESCE(username,'')) = 'demo'").run();
  return { attempts: Number(a.changes || 0), users: Number(u.changes || 0) };
}

/* ---------- 设置 ---------- */
function getSetting(db, k, d) {
  const r = db.prepare('SELECT value FROM setting WHERE key = ?').get(k);
  return r ? r.value : (d === undefined ? null : d);
}
function setSetting(db, k, v) {
  db.prepare('INSERT OR REPLACE INTO setting (key, value) VALUES (?,?)').run(k, String(v));
  return true;
}

module.exports = { ROOT, DEFAULT_DB, openDb, hashQ, normText, loadKP, seedKP, upsert, query, stats, toObj, saveAttempt, saveUser, getSetting, setSetting, purgeDemo };
