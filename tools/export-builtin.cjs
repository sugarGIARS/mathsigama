/* ============================================================
   export-builtin.cjs · 把前端内置题库导出为可导入的 JSON
   用法：node tools/export-builtin.cjs [输出路径]
   ============================================================ */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const files = ['data-core.js', 'data-kp1.js', 'data-kp2.js', 'data-kp3.js',
  'data-q1.js', 'data-q2.js', 'data-q3.js', 'data-q4.js', 'data-q5.js', 'data.js'];

const ctx = { console, String, Math, JSON, Number, Array, Object, Date };
vm.createContext(ctx);
for (const f of files) {
  const fp = path.join(ROOT, 'assets', 'js', f);
  if (fs.existsSync(fp)) vm.runInContext(fs.readFileSync(fp, 'utf8'), ctx);
}
const items = vm.runInContext('QUESTIONS', ctx) || [];
const out = items.map(q => ({
  id: q.id, kp: q.kp, level: q.level, type: q.type, stem: q.stem,
  options: q.options || [], answer: q.answer || '', accept: q.accept || [],
  keywords: q.keywords || [], analysis: q.analysis || '', tags: q.tags || []
}));

/* 默认导出到临时目录：内置题以 assets/js/data-*.js 为准，导出件只做临时交换用 */
const target = process.argv[2] || path.join(require('os').tmpdir(), 'builtin-questions.json');
fs.mkdirSync(path.dirname(target), { recursive: true });
fs.writeFileSync(target, JSON.stringify(out, null, 1), 'utf8');
console.log('导出内置题 ' + out.length + ' 道 → ' + path.relative(ROOT, target));
