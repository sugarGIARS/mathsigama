/* ============================================================
   server/lib/store.cjs · MySQL 存储层（mysql2/promise）
   表：kp / question / attempt / user / setting
   结构见同目录 schema.sql，启动时自动执行
   ============================================================ */
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const crypto = require('crypto');
const mysql = require('mysql2/promise');

const ROOT = path.resolve(__dirname, '..', '..');
const SCHEMA_FILE = path.join(__dirname, 'schema.sql');

const DEFAULTS = {
  host: '127.0.0.1',
  port: 3306,
  user: 'root',
  password: '',
  database: 'mathsigma',
  waitForConnections: true,
  connectionLimit: 8,
  queueLimit: 0,
  charset: 'utf8mb4',
  dateStrings: true,
  timezone: 'Z'
};

/* 只把连接池认识的键传下去：配置里还有 autoStart / serviceName 等启动参数 */
const POOL_KEYS = [
  'host', 'port', 'user', 'password', 'database', 'socketPath', 'ssl',
  'waitForConnections', 'connectionLimit', 'queueLimit', 'charset',
  'dateStrings', 'timezone', 'connectTimeout', 'multipleStatements',
  'namedPlaceholders', 'supportBigNumbers', 'bigNumberStrings',
  'enableKeepAlive', 'keepAliveInitialDelay'
];

/* ---------- 连接与建表 ---------- */
async function openDb(cfg) {
  const src = cfg || {};
  const opt = Object.assign({}, DEFAULTS);
  POOL_KEYS.forEach(k => {
    if (src[k] !== undefined && src[k] !== null && src[k] !== '') opt[k] = src[k];
  });
  ['user', 'password'].forEach(k => { if (src[k] !== undefined && src[k] !== null) opt[k] = src[k]; });
  if (!opt.connectTimeout) opt.connectTimeout = 10000;
  opt.port = parseInt(opt.port, 10) || 3306;
  const pool = mysql.createPool(opt);
  await pool.query('SELECT 1');
  await ensureSchema(pool);
  return pool;
}

/* 读取 server/config.json 里的 mysql 配置（命令行工具复用） */
function configOf() {
  try {
    return JSON.parse(fs.readFileSync(path.join(ROOT, 'server', 'config.json'), 'utf8')).mysql || {};
  } catch (e) { return {}; }
}

/* 按项目配置连接，工具脚本用这个 */
async function openFromConfig() {
  return openDb(configOf());
}

async function ensureSchema(db) {
  const sql = fs.readFileSync(SCHEMA_FILE, 'utf8')
    .split('\n')
    .filter(l => !/^\s*--/.test(l))
    .join('\n');
  const stmts = sql.split(';').map(s => s.trim()).filter(Boolean);
  for (const s of stmts) await db.query(s);
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

async function seedKP(db) {
  const rows = loadKP();
  if (!rows.length) return 0;
  const values = rows.map(k => [
    String(k.id), k.grade || '', k.title || '',
    JSON.stringify(k.versions || []), JSON.stringify(k.tags || []), k.summary || ''
  ]);
  await db.query(
    'INSERT INTO kp (id, grade, title, versions, tags, summary) VALUES ? ' +
    'ON DUPLICATE KEY UPDATE grade=VALUES(grade), title=VALUES(title), ' +
    'versions=VALUES(versions), tags=VALUES(tags), summary=VALUES(summary)',
    [values]
  );
  return rows.length;
}

/* ---------- 题目写入（自带去重） ---------- */
async function upsert(db, q, opt) {
  const o = opt || {};
  const hash = q.hash || hashQ(q);
  const now = new Date().toISOString();
  const [existRows] = await db.query('SELECT id FROM question WHERE hash = ? LIMIT 1', [hash]);
  const exist = existRows[0];
  if (exist) {
    if (o.onDup === 'replace') {
      await db.query('DELETE FROM question WHERE hash = ?', [hash]);
    } else {
      return { action: 'duplicate', id: exist.id, hash };
    }
  }
  const id = q.id || ('q-' + hash);
  const [dupRows] = await db.query('SELECT id FROM question WHERE id = ? LIMIT 1', [id]);
  const dupId = dupRows[0];
  const finalId = dupId && dupId.id !== (exist && exist.id) ? id + '-' + hash.slice(0, 6) : id;
  await db.query(
    'INSERT INTO question ' +
    '(id, kp, level, type, stem, options, answer, accept, keywords, analysis, tags, source, hash, created_at, updated_at) ' +
    'VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
    [
      finalId, q.kp, q.level || 'basic', q.type || 'choice', q.stem || '',
      JSON.stringify(q.options || []), q.answer || '', JSON.stringify(q.accept || []),
      JSON.stringify(q.keywords || []), q.analysis || '', JSON.stringify(q.tags || []),
      q.source || 'import', hash, now, now
    ]
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

async function query(db, opt) {
  const o = opt || {};
  const where = [], args = [];
  if (o.kp) { where.push('kp = ?'); args.push(o.kp); }
  if (o.level) { where.push('level = ?'); args.push(o.level); }
  if (o.type) { where.push('type = ?'); args.push(o.type); }
  if (o.source) { where.push('source = ?'); args.push(o.source); }
  if (o.q) { where.push('(stem LIKE ? OR analysis LIKE ? OR id LIKE ?)'); args.push('%' + o.q + '%', '%' + o.q + '%', '%' + o.q + '%'); }
  const w = where.length ? ' WHERE ' + where.join(' AND ') : '';
  const lim = Math.min(Math.max(parseInt(o.limit, 10) || 50, 1), 100000);
  const off = Math.max(parseInt(o.offset, 10) || 0, 0);
  const [rows] = await db.query('SELECT * FROM question' + w + ' ORDER BY kp, level, id LIMIT ' + lim + ' OFFSET ' + off, args);
  const [cnt] = await db.query('SELECT COUNT(*) AS n FROM question' + w, args);
  return { total: Number(cnt[0].n), items: rows.map(toObj) };
}

async function stats(db) {
  const [[total]] = await db.query('SELECT COUNT(*) AS n FROM question');
  const [byKp] = await db.query('SELECT kp, COUNT(*) AS n FROM question GROUP BY kp ORDER BY n DESC');
  const [byLevel] = await db.query('SELECT level, COUNT(*) AS n FROM question GROUP BY level');
  const [bySource] = await db.query('SELECT source, COUNT(*) AS n FROM question GROUP BY source');
  const [[dups]] = await db.query('SELECT COUNT(*) AS n FROM (SELECT hash FROM question GROUP BY hash HAVING COUNT(*) > 1) t');
  const [[attempts]] = await db.query('SELECT COUNT(*) AS n FROM attempt');
  const [[users]] = await db.query('SELECT COUNT(*) AS n FROM user');
  return {
    total: Number(total.n),
    byKp: byKp.map(r => ({ kp: r.kp, n: Number(r.n) })),
    byLevel: byLevel.map(r => ({ level: r.level, n: Number(r.n) })),
    bySource: bySource.map(r => ({ source: r.source, n: Number(r.n) })),
    duplicateHashes: Number(dups.n),
    attempts: Number(attempts.n),
    users: Number(users.n)
  };
}

/* ---------- 用户与答题 ---------- */
async function saveAttempt(db, a) {
  await db.query('INSERT INTO attempt (uid, qid, kp, level, correct, sec, ts) VALUES (?,?,?,?,?,?,?)',
    [a.uid || '', a.qid || '', a.kp || '', a.level || '', a.correct ? 1 : 0, a.sec || 0, a.ts || Date.now()]);
  return true;
}
async function listAttempts(db, limit) {
  const n = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 5000);
  const [rows] = await db.query('SELECT * FROM attempt ORDER BY ts DESC LIMIT ' + n);
  return rows;
}

async function saveUser(db, u) {
  await db.query(
    'INSERT INTO user (id, username, pwd, grade, version, nickname, school, created_at) VALUES (?,?,?,?,?,?,?,?) ' +
    'ON DUPLICATE KEY UPDATE username=VALUES(username), pwd=VALUES(pwd), grade=VALUES(grade), ' +
    'version=VALUES(version), nickname=VALUES(nickname), school=VALUES(school)',
    [u.id || u.username, u.username, u.pwd || '', u.grade || '', u.version || '', u.nickname || '', u.school || '', u.created_at || new Date().toISOString()]
  );
  return true;
}
async function listUsers(db) {
  const [rows] = await db.query('SELECT id, username, grade, version, nickname, school, created_at FROM user ORDER BY created_at');
  return rows;
}

/* ---------- 题目增删改（管理端） ---------- */
async function deleteQuestion(db, id) {
  const [r] = await db.query('DELETE FROM question WHERE id = ?', [id]);
  return r.affectedRows > 0;
}
async function getQuestion(db, id) {
  const [rows] = await db.query('SELECT * FROM question WHERE id = ? LIMIT 1', [id]);
  return rows[0] || null;
}
async function updateQuestion(db, id, m) {
  const [r] = await db.query(
    'UPDATE question SET kp=?, level=?, type=?, stem=?, options=?, answer=?, accept=?, keywords=?, analysis=?, tags=?, source=?, hash=?, updated_at=? WHERE id=?',
    [m.kp, m.level, m.type, m.stem, JSON.stringify(m.options || []), m.answer || '',
      JSON.stringify(m.accept || []), JSON.stringify(m.keywords || []), m.analysis || '',
      JSON.stringify(m.tags || []), m.source || 'edited', hashQ(m), new Date().toISOString(), id]
  );
  return r.affectedRows > 0;
}

/* ---------- 知识点列表 ---------- */
async function listKP(db) {
  const [rows] = await db.query('SELECT * FROM kp ORDER BY grade, id');
  return rows.map(r => {
    const j = s => { try { return JSON.parse(s || '[]'); } catch (e) { return []; } };
    return { id: r.id, grade: r.grade, title: r.title, versions: j(r.versions), tags: j(r.tags), summary: r.summary };
  });
}
async function countKP(db) {
  const [[r]] = await db.query('SELECT COUNT(*) AS n FROM kp');
  return Number(r.n);
}

/* ---------- 体验账号每日清理 ---------- */
async function purgeDemo(db) {
  const [a] = await db.query("DELETE FROM attempt WHERE lower(COALESCE(uid,'')) = 'demo'");
  const [u] = await db.query("DELETE FROM user WHERE lower(COALESCE(username,'')) = 'demo'");
  return { attempts: Number(a.affectedRows || 0), users: Number(u.affectedRows || 0) };
}

/* ---------- 设置 ---------- */
async function getSetting(db, k, d) {
  const [rows] = await db.query('SELECT value FROM setting WHERE skey = ? LIMIT 1', [k]);
  return rows[0] ? rows[0].value : (d === undefined ? null : d);
}
async function setSetting(db, k, v) {
  await db.query('INSERT INTO setting (skey, value) VALUES (?,?) ON DUPLICATE KEY UPDATE value=VALUES(value)', [k, String(v)]);
  return true;
}

module.exports = {
  ROOT, SCHEMA_FILE, openDb, openFromConfig, configOf, ensureSchema,
  hashQ, normText, loadKP,
  seedKP, upsert, query, stats, toObj,
  saveAttempt, listAttempts, saveUser, listUsers,
  deleteQuestion, getQuestion, updateQuestion,
  listKP, countKP, getSetting, setSetting, purgeDemo
};
