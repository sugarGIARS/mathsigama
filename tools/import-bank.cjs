/* ============================================================
   tools/import-bank.cjs · 题库导入（JSON / CSV）
   用法：node tools/import-bank.cjs <file.json|file.csv> [--source web] [--replace]
   去重：按 stem+answer 规范化哈希，默认跳过重复题；--replace 则用新题替换旧题
   ============================================================ */
const fs = require('fs');
const path = require('path');
const store = require(path.join(__dirname, '..', 'server', 'lib', 'store.cjs'));

function parseJSON(text) {
  const data = JSON.parse(text);
  return Array.isArray(data) ? data : (data.questions || []);
}
function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter(l => l.trim() && !l.startsWith('#'));
  const head = lines.shift().split(',').map(s => s.trim().replace(/^"|"$/g, ''));
  return lines.map(line => {
    const cells = line.match(/("([^"]|"")*"|[^,]*)(,|$)/g) || [];
    const vals = cells.map(c => c.replace(/,$/, '').replace(/^"|"$/g, '').replace(/""/g, '"'));
    const o = {};
    head.forEach((h, i) => { o[h] = vals[i] || ''; });
    return {
      kp: o.kp || o.knowledge || '', level: o.level || 'basic', type: o.type || 'choice',
      stem: o.stem || o.question || '', options: (o.options || '').split('|').filter(Boolean),
      answer: o.answer || '', accept: (o.accept || '').split('|').filter(Boolean),
      keywords: (o.keywords || '').split('|').filter(Boolean), analysis: o.analysis || o.solution || '',
      tags: (o.tags || '').split('|').filter(Boolean)
    };
  });
}

async function main() {
  const argv = process.argv.slice(2);
  const file = argv.find(a => !a.startsWith('--'));
  if (!file) { console.log('用法：node tools/import-bank.cjs <file.json|file.csv> [--source web] [--replace]'); process.exit(1); }
  const source = (argv.includes('--source') ? argv[argv.indexOf('--source') + 1] : null);
  const onDup = argv.includes('--replace') ? 'replace' : 'skip';

  const text = fs.readFileSync(file, 'utf8');
  const list = file.toLowerCase().endsWith('.csv') ? parseCSV(text) : parseJSON(text);
  const db = await store.openFromConfig();
  await store.seedKP(db);

  let ins = 0, dup = 0, bad = 0;
  for (const q of list) {
    if (!q.stem || !q.kp) { bad++; continue; }
    const res = await store.upsert(db, {
      id: q.id || null, kp: q.kp, level: q.level || 'basic', type: q.type || 'choice',
      stem: q.stem, options: q.options || [], answer: q.answer || '', accept: q.accept || [],
      keywords: q.keywords || [], analysis: q.analysis || '', tags: q.tags || [],
      source: source || q.source || 'import'
    }, { onDup });
    if (res.action === 'inserted') ins++; else dup++;
  }
  console.log(`导入完成：新增 ${ins}，重复 ${dup}，无效 ${bad}`);
  const s = await store.stats(db);
  console.log('题库总量：' + s.total + '（' + s.bySource.map(x => x.source + ' ' + x.n).join('，') + '）');
  await db.end();
}

if (require.main === module) main().catch(e => { console.error('[x] ' + (e && e.stack || e)); process.exit(1); });
