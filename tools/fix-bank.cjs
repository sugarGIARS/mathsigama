/* ============================================================
   fix-bank.cjs · 清理早期生成题中的瑕疵数据（仅动 source='gen'）
   用法：node tools/fix-bank.cjs
   ============================================================ */
const path = require('path');
const store = require(path.join(__dirname, '..', 'server', 'lib', 'store.cjs'));
const db = store.openDb();

const rules = [
  ['二次项系数写成 0x 的畸形题', "source='gen' AND (stem LIKE '%+0x%' OR stem LIKE '%-0x%')"],
  ['二次项系数显示为 1x^2 的题', "source='gen' AND stem LIKE '%1x^2%'"],
  ['解析里出现两个连续减号的题', "source='gen' AND analysis LIKE '%--%'"],
  ['球体积取整导致答案不精确的题', "source='gen' AND kp='g1-solid' AND stem LIKE '%球的体积%'"]
];

let total = 0;
for (const [name, where] of rules) {
  const r = db.prepare('DELETE FROM question WHERE ' + where).run();
  const n = Number(r.changes || 0);
  total += n;
  console.log((name + '：').padEnd(26), n);
}
console.log('共清理', total, '道；剩余', db.prepare('SELECT COUNT(*) AS n FROM question').get().n, '道');
