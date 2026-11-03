/* ============================================================
   tools/check-bank.cjs · 题库体检
   检查：字段完整性、选项与答案一致、知识点有效、哈希唯一、解析存在
   ============================================================ */
const path = require('path');
const store = require(path.join(__dirname, '..', 'server', 'lib', 'store.cjs'));

const db = store.openDb();
const rows = db.prepare('SELECT * FROM question').all();
const kps = new Set(db.prepare('SELECT id FROM kp').all().map(r => r.id));

const problems = [];
const seen = new Map();
for (const r of rows) {
  const q = store.toObj(r);
  const bad = [];
  if (!q.stem || q.stem.length < 4) bad.push('题干过短');
  if (!kps.has(q.kp)) bad.push('知识点无效:' + q.kp);
  if (!['basic', 'advance', 'challenge'].includes(q.level)) bad.push('难度无效:' + q.level);
  if (!['choice', 'fill', 'solve'].includes(q.type)) bad.push('题型无效:' + q.type);
  if (!q.analysis || q.analysis.length < 4) bad.push('缺解析');
  if (q.type === 'choice') {
    if (!q.options || q.options.length !== 4) bad.push('选项数≠4');
    if (!/^[A-D]$/.test(q.answer || '')) bad.push('答案非A-D:' + q.answer);
    const uniq = new Set(q.options || []);
    if (uniq.size !== (q.options || []).length) bad.push('选项重复');
  } else {
    if (!(q.accept || []).length && !(q.keywords || []).length) bad.push('无可判分答案');
  }
  if (seen.has(q.hash)) bad.push('哈希重复:' + seen.get(q.hash));
  else seen.set(q.hash, q.id);
  if (bad.length) problems.push({ id: q.id, kp: q.kp, bad: bad.join('，'), stem: q.stem.slice(0, 60) });
}

const s = store.stats(db);
console.log('题库总量：' + s.total);
console.log('按来源：' + s.bySource.map(x => `${x.source} ${x.n}`).join('  '));
console.log('按难度：' + s.byLevel.map(x => `${x.level} ${x.n}`).join('  '));
console.log('按知识点：' + s.byKp.map(x => `${x.kp}:${x.n}`).join('  '));
console.log('哈希重复组：' + s.duplicateHashes);
console.log('异常题目：' + problems.length);
problems.slice(0, 12).forEach(p => console.log('  -', p.id, '|', p.bad, '|', p.stem.replace(/\n/g, ' ')));
