/* ============================================================
   tools/migrate-sqlite-to-mysql.cjs
   把旧的 server/data/math.db（SQLite）整体搬到 MySQL
   · 幂等：重复执行不会产生重复数据
   · 分批写入，每批 200 行
   用法：npm run db:migrate
   ============================================================ */
const fs = require('fs');
const path = require('path');
const store = require(path.join(__dirname, '..', 'server', 'lib', 'store.cjs'));

const ROOT = store.ROOT;
const SRC = process.env.MS_SQLITE || path.join(ROOT, 'server', 'data', 'math.db');
const CHUNK = 200;

function rowsOf(db, sql) { return db.prepare(sql).all(); }

async function insertChunks(mysqlDb, head, cols, rows, tail) {
  let n = 0;
  for (let i = 0; i < rows.length; i += CHUNK) {
    const part = rows.slice(i, i + CHUNK);
    await mysqlDb.query(head + ' VALUES ? ' + (tail || ''), [part]);
    n += part.length;
  }
  return n;
}

(async () => {
  if (!fs.existsSync(SRC)) {
    console.log('[!] 未找到 ' + SRC + '，无需迁移');
    return;
  }
  const { DatabaseSync } = require('node:sqlite');
  const src = new DatabaseSync(SRC, { readOnly: true });
  const cfg = JSON.parse(fs.readFileSync(path.join(ROOT, 'server', 'config.json'), 'utf8')).mysql || {};
  const db = await store.openDb(cfg);
  console.log('[..] 源库：' + path.relative(ROOT, SRC));

  /* 知识点 */
  const kp = rowsOf(src, 'SELECT id, grade, title, versions, tags, summary FROM kp');
  const kpN = await insertChunks(db,
    'INSERT INTO kp (id, grade, title, versions, tags, summary)',
    null,
    kp.map(r => [r.id, r.grade || '', r.title || '', r.versions || '[]', r.tags || '[]', r.summary || '']),
    'ON DUPLICATE KEY UPDATE grade=VALUES(grade), title=VALUES(title), versions=VALUES(versions), tags=VALUES(tags), summary=VALUES(summary)');
  console.log('[ok] 知识点 ' + kpN + ' 个');

  /* 题目 */
  const qs = rowsOf(src, `SELECT id, kp, level, type, stem, options, answer, accept, keywords, analysis, tags, source, hash, created_at, updated_at FROM question`);
  const qN = await insertChunks(db,
    'INSERT INTO question (id, kp, level, type, stem, options, answer, accept, keywords, analysis, tags, source, hash, created_at, updated_at)',
    null,
    qs.map(r => [r.id, r.kp, r.level, r.type, r.stem, r.options || '[]', r.answer || '', r.accept || '[]',
      r.keywords || '[]', r.analysis || '', r.tags || '[]', r.source || 'builtin', r.hash,
      r.created_at || null, r.updated_at || null]),
    'ON DUPLICATE KEY UPDATE kp=VALUES(kp), level=VALUES(level), type=VALUES(type), stem=VALUES(stem), ' +
    'options=VALUES(options), answer=VALUES(answer), accept=VALUES(accept), keywords=VALUES(keywords), ' +
    'analysis=VALUES(analysis), tags=VALUES(tags), source=VALUES(source), updated_at=VALUES(updated_at)');
  console.log('[ok] 题目 ' + qN + ' 道');

  /* 答题记录 */
  const as = rowsOf(src, 'SELECT uid, qid, kp, level, correct, sec, ts FROM attempt');
  const aN = await insertChunks(db, 'INSERT INTO attempt (uid, qid, kp, level, correct, sec, ts)', null,
    as.map(r => [r.uid || '', r.qid || '', r.kp || '', r.level || '', r.correct ? 1 : 0, r.sec || 0, r.ts || 0]));
  console.log('[ok] 答题记录 ' + aN + ' 条');

  /* 账号 */
  const us = rowsOf(src, 'SELECT id, username, pwd, grade, version, nickname, school, created_at FROM user');
  const uN = await insertChunks(db,
    'INSERT INTO user (id, username, pwd, grade, version, nickname, school, created_at)', null,
    us.map(r => [r.id, r.username || '', r.pwd || '', r.grade || '', r.version || '', r.nickname || '', r.school || '', r.created_at || null]),
    'ON DUPLICATE KEY UPDATE username=VALUES(username), pwd=VALUES(pwd), grade=VALUES(grade), ' +
    'version=VALUES(version), nickname=VALUES(nickname), school=VALUES(school)');
  console.log('[ok] 账号 ' + uN + ' 个');

  /* 设置 */
  const ss = rowsOf(src, 'SELECT key AS k, value AS v FROM setting');
  const sN = await insertChunks(db,
    'INSERT INTO setting (skey, value)', null,
    ss.map(r => [r.k, r.v === null || r.v === undefined ? '' : String(r.v)]),
    'ON DUPLICATE KEY UPDATE value=VALUES(value)');
  console.log('[ok] 设置项 ' + sN + ' 条');

  src.close();
  const st = await store.stats(db);
  console.log('────────────────────────────');
  console.log('迁移完成：题目 ' + st.total + ' 道 / 知识点 ' + st.byKp.length + ' 组 / 答题 ' + st.attempts + ' 条 / 账号 ' + st.users + ' 个');
  await db.end();
})().catch(e => {
  console.error('[x] 迁移失败：' + (e && e.stack || e));
  process.exit(1);
});
