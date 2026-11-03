/* ============================================================
   tools/gen-bank.cjs · 题库生成器
   用法：node tools/gen-bank.cjs [--target 40] [--seed 2026] [--db path]
   说明：按知识点参数化生成题目，写入 SQLite 前用 store.hashQ 去重；
        已抓取的真实题（source=web）不会被覆盖。
   ============================================================ */
const path = require('path');
const store = require(path.join(__dirname, '..', 'server', 'lib', 'store.cjs'));

/* ---------- 可重现随机 ---------- */
function rngFrom(seed) { let s = (seed >>> 0) || 1; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
const ri = (r, a, b) => a + Math.floor(r() * (b - a + 1));
const pick = (r, arr) => arr[Math.floor(r() * arr.length)];
const shuffled = (r, arr) => arr.map(v => [r(), v]).sort((a, b) => a[0] - b[0]).map(x => x[1]);
const frac = (a, b) => '\\dfrac{' + a + '}{' + b + '}';

/* 字符串微调：改动最后一个数字，用于生成新的干扰项 */
function tweak(s, delta) {
  const m = String(s).match(/(\d+)(?!.*\d)/);
  if (!m) return String(s) + '°';
  const v = Math.max(0, parseInt(m[1], 10) + delta);
  return String(s).slice(0, m.index) + v + String(s).slice(m.index + m[1].length);
}
/* 四选一：把正确答案随机打乱后返回 {options, answer}（自动去撞车） */
function opts4(r, correct, others) {
  const cs = String(correct);
  const uniq = [];
  for (const o of others) { const s = String(o); if (s !== cs && !uniq.includes(s)) uniq.push(s); }
  let k = 1;
  while (uniq.length < 3 && k < 40) {
    const delta = (k % 2 ? 1 : -1) * Math.ceil(k / 2);
    const cand = tweak(cs, delta);
    if (cand !== cs && !uniq.includes(cand)) uniq.push(cand);
    k++;
  }
  const all = shuffled(r, [cs].concat(uniq.slice(0, 3)));
  return { options: all, answer: 'ABCD'[all.indexOf(cs)] };
}

/* ============================================================
   各知识点生成器：make(r) -> {stem, options?, answer?/accept?, analysis, type, level}
   ============================================================ */
const M = {
  /* ---------- 初一 ---------- */
  'c1-rational': [
    { level: 'basic', type: 'choice', make(r) {
      const a = ri(r, 2, 6) * (r() < .5 ? -1 : 1), b = ri(r, 2, 5) * (r() < .5 ? -1 : 1);
      const val = a * a + b * b;
      const o = opts4(r, val, [val + 2, val - 3, -val]);
      const sa = a < 0 ? '(' + a + ')' : String(a), sb = b < 0 ? '(' + b + ')' : String(b);
      return { stem: String.raw`计算 \(${sa}^2+${sb}^2\) 的值（　　）`, options: o.options, answer: o.answer,
        analysis: String.raw`\(${sa}^2=${a * a}\)，\(${sb}^2=${b * b}\)，故 \(${sa}^2+${sb}^2=${val}\)。注意 \(-3^2=-9\) 而 \((-3)^2=9\)。` };
    } },
    { level: 'basic', type: 'fill', make(r) {
      const m = ri(r, 2, 9), n = ri(r, 2, 9);
      return { stem: String.raw`计算：\((-${m})+(-${n})+${m + n}=\) ______。`,
        accept: ['0'], analysis: String.raw`\(-${m}-${n}+${m + n}=0\)，互为相反数的两数之和为 \(0\)。` };
    } },
    { level: 'advance', type: 'fill', make(r) {
      const p = pick(r, [12, 16, 18, 24, 36]), q = ri(r, 2, 5), s = ri(r, 2, 5);
      const val = Math.round((q - s) * p / (q * 1) * 100) / 100;
      const v = (q - s) * p;
      return { stem: String.raw`用乘法分配律计算：\(\left(${frac(q, p.toString())}-${frac(s, p.toString())}\right)\times ${p}=\) ______。`,
        accept: [String(v)], analysis: String.raw`\(${frac(q, p)}\times ${p}-${frac(s, p)}\times ${p}=${q}-${s}=${v}\)。` };
    } },
    { level: 'advance', type: 'choice', make(r) {
      const a = ri(r, 1, 9), b = ri(r, 1, 9);
      const o = opts4(r, '\\(' + (a - b) + '\\)', ['\\(' + (a + b) + '\\)', '\\(' + (b - a) + '\\)', '\\(-' + (a + b) + '\\)']);
      return { stem: String.raw`若 \(|x|=${a}\)，\(|y|=${b}\)，且 \(x>0,\ y<0\)，则 \(x+y=\)（　　）`,
        options: o.options, answer: o.answer,
        analysis: String.raw`\(x>0\Rightarrow x=${a}\)；\(y<0\Rightarrow y=-${b}\)。故 \(x+y=${a}+(-${b})=${a - b}\)。` };
    } },
    { level: 'challenge', type: 'solve', make(r) {
      const a = ri(r, 2, 5);
      return { stem: String.raw`计算：\(-${a}^2\div(-${a})^2+\left|-${4 * a}\right|\times\left(-\dfrac12\right)^3\)（写出主要过程）`,
        keywords: [String(-1 - a / 2), (-1 - a / 2).toFixed(1)],
        analysis: String.raw`\(-${a}^2\div(-${a})^2=-${a * a}\div ${a * a}=-1\)；\(\left|-${4 * a}\right|\times\left(-\dfrac18\right)=-\dfrac{${4 * a}}{8}=-${(4 * a) / 8}\)。原式 \(=-1-${(4 * a) / 8}=${-1 - (4 * a) / 8}\)。` };
    } }
  ],

  'c1-equation1': [
    { level: 'basic', type: 'fill', make(r) {
      const a = ri(r, 2, 9), b = ri(r, 1, 20), x = ri(r, 2, 9);
      const c = a * x + b;
      return { stem: String.raw`解方程 \(${a}x+${b}=${c}\)，则 \(x=\) ______。`,
        accept: [String(x)], analysis: String.raw`移项得 \(${a}x=${c}-${b}=${a * x}\)，故 \(x=${x}\)。` };
    } },
    { level: 'basic', type: 'choice', make(r) {
      const a = ri(r, 2, 5), b = ri(r, 1, 9), x = ri(r, 2, 7);
      const c = a * x - b;
      const o = opts4(r, x, [x + 1, -x, 2 * x]);
      return { stem: String.raw`方程 \(${a}x-${b}=${c}\) 的解是（　　）`, options: o.options.map(v => '\\(x=' + v + '\\)'), answer: o.answer,
        analysis: String.raw`移项 \(${a}x=${c}+${b}=${a * x}\)，故 \(x=${x}\)。` };
    } },
    { level: 'advance', type: 'choice', make(r) {
      const a = ri(r, 2, 4), b = ri(r, 1, 5), c = ri(r, 2, 6);
      const o = opts4(r, String.raw`${a}(${b}x+1)-${c}(x-1)=${a * c}`,
        [String.raw`${a}(${b}x+1)-${c}(x-1)=1`, String.raw`${a}(${b}x+1)-${c}(x-1)=${a + c}`, String.raw`(${b}x+1)-(x-1)=${a * c}`]);
      return { stem: String.raw`解方程 \(\dfrac{${b}x+1}{${c}}-\dfrac{x-1}{${a}}=1\) 时，去分母后正确的是（　　）`,
        options: o.options, answer: o.answer,
        analysis: String.raw`两边同乘 \(${a * c}\)（各分母的最小公倍数），注意等号右边的 1 也要乘，得 \(${a}(${b}x+1)-${c}(x-1)=${a * c}\)。` };
    } },
    { level: 'advance', type: 'fill', make(r) {
      const cost = ri(r, 5, 20) * 10, rate = pick(r, [10, 20, 25, 30]);
      const price = Math.round(cost * (100 + rate) / 100);
      return { stem: String.raw`某商品进价 ${cost} 元，标价后利润率为 ${rate}%，则售价为 ______ 元。`,
        accept: [String(price)], analysis: String.raw`售价 \(=${cost}\times(1+${rate}\%)=${price}\) 元。` };
    } },
    { level: 'challenge', type: 'solve', make(r) {
      const total = ri(r, 6, 20) * 10, per = ri(r, 2, 6);
      const days = total / per;
      return { stem: String.raw`一项工程总量为 ${total} 个工作量，甲每天完成 ${per} 个，乙每天完成 ${per + 2} 个。两人合作需要多少天完成？`,
        keywords: [(total / (2 * per + 2)).toFixed(1), String(Math.round(total / (2 * per + 2)))],
        analysis: String.raw`合作效率 \(=${per}+${per + 2}=${2 * per + 2}\)，天数 \(=\dfrac{${total}}{${2 * per + 2}}=${(total / (2 * per + 2)).toFixed(1)}\) 天。` };
    } }
  ],

  /* ---------- 初二 ---------- */
  'c2-linear': [
    { level: 'basic', type: 'fill', make(r) {
      const k = ri(r, 2, 6) * (r() < .5 ? 1 : -1), x = ri(r, 2, 6);
      return { stem: String.raw`正比例函数 \(y=kx\) 的图象经过点 \((${x},${k * x})\)，则 \(k=\) ______。`,
        accept: [String(k)], analysis: String.raw`代入得 \(${k * x}=${x}k\)，故 \(k=${k}\)。` };
    } },
    { level: 'basic', type: 'choice', make(r) {
      const k = ri(r, 1, 5), b = ri(r, 1, 9);
      const o = opts4(r, '一、二、四象限', ['一、二、三象限', '二、三、四象限', '一、三、四象限']);
      return { stem: String.raw`一次函数 \(y=-${k}x+${b}\) 的图象经过（　　）`, options: o.options, answer: o.answer,
        analysis: String.raw`\(k=-${k}<0\) 图象从左到右下降，\(b=${b}>0\) 与 \(y\) 轴交于正半轴，故经过第一、二、四象限。` };
    } },
    { level: 'advance', type: 'fill', make(r) {
      const x1 = ri(r, 1, 4), y1 = ri(r, 1, 6), k = ri(r, 1, 4), x2 = x1 + ri(r, 1, 3);
      const y2 = y1 + k * (x2 - x1), b = y1 - k * x1;
      return { stem: String.raw`一次函数图象经过点 \((${x1},${y1})\) 与 \((${x2},${y2})\)，则该函数解析式中 \(b=\) ______。`,
        accept: [String(b)], analysis: String.raw`斜率 \(k=\dfrac{${y2}-${y1}}{${x2}-${x1}}=${k}\)，\(b=${y1}-${k}\times${x1}=${b}\)。` };
    } },
    { level: 'advance', type: 'choice', make(r) {
      const k = ri(r, 1, 4), b = ri(r, 1, 6);
      const xs = -b / k;
      const o = opts4(r, '\\(x>-' + b + '/' + k + '\\)', ['\\(x>0\\)', '\\(x<' + b + '/' + k + '\\)', '\\(x>-' + b + '\\)']);
      return { stem: String.raw`若一次函数 \(y=${k}x+${b}\) 的函数值大于 0，则 \(x\) 的取值范围是（　　）`,
        options: o.options, answer: o.answer,
        analysis: String.raw`\(${k}x+${b}>0\Rightarrow x>-\dfrac{${b}}{${k}}\)。` };
    } },
    { level: 'challenge', type: 'solve', make(r) {
      const k1 = ri(r, 1, 4), b1 = ri(r, 1, 5), k2 = -ri(r, 1, 4), b2 = ri(r, 6, 12);
      const x = (b2 - b1) / (k1 - k2), y = k1 * x + b1;
      return { stem: String.raw`求直线 \(y=${k1}x+${b1}\) 与 \(y=${k2}x+${b2}\) 的交点坐标。`,
        keywords: [String(Math.round(x * 10) / 10), String(Math.round(y * 10) / 10)],
        analysis: String.raw`联立 \(${k1}x+${b1}=${k2}x+${b2}\)，得 \(${k1 - k2}x=${b2 - b1}\)，\(x=\dfrac{${b2 - b1}}{${k1 - k2}}\approx ${x.toFixed(2)}\)，\(y\approx ${y.toFixed(2)}\)。` };
    } }
  ],

  'c2-congruence': [
    { level: 'basic', type: 'choice', make(r) {
      const t = pick(r, [
        ['三边分别相等', 'SSS', 'SAS', 'ASA', 'AAS'],
        ['两边及其夹角分别相等', 'SAS', 'SSS', 'ASA', 'HL'],
        ['两角及其夹边分别相等', 'ASA', 'AAS', 'SAS', 'SSS'],
        ['两角及其中一角的对边相等', 'AAS', 'ASA', 'SAS', 'HL'],
        ['斜边和一条直角边分别相等（直角三角形）', 'HL', 'SAS', 'SSS', 'AAS']
      ]);
      const o = opts4(r, t[1], [t[2], t[3], t[4]]);
      return { stem: String.raw`判定两个三角形全等的依据“${t[0]}”简写为（　　）`, options: o.options, answer: o.answer,
        analysis: String.raw`“${t[0]}”对应的判定定理简写为 ${t[1]}。` };
    } },
    { level: 'basic', type: 'fill', make(r) {
      const a = ri(r, 3, 12);
      return { stem: String.raw`若 \(\triangle ABC\cong\triangle DEF\)，且 \(AB=${a}\ \text{cm}\)，则 \(DE=\) ______ cm。`,
        accept: [String(a)], analysis: String.raw`全等三角形对应边相等，\(AB\) 与 \(DE\) 是对应边，故 \(DE=${a}\)。` };
    } },
    { level: 'advance', type: 'choice', make(r) {
      const o = opts4(r, '不一定全等', ['一定全等', '一定相似', '一定全等且相似']);
      return { stem: String.raw`两个三角形的两边及其中一边的对角对应相等（SSA），则这两个三角形（　　）`,
        options: o.options, answer: o.answer,
        analysis: String.raw`“边边角”（SSA）不能判定全等：给定两边及其中一边的对角，可能作出两个不同形状的三角形，故不一定全等（直角三角形情形可用 HL 判定）。` };
    } },
    { level: 'challenge', type: 'solve', make(r) {
      const a = ri(r, 3, 9);
      return { stem: String.raw`如图，\(AB=AC=${a}\)，\(D\) 为 \(BC\) 中点。求证 \(\triangle ABD\cong\triangle ACD\)。`,
        keywords: ['SSS', 'AB=AC', 'BD=CD', 'AD=AD'],
        analysis: String.raw`\(AB=AC=${a}\)，\(D\) 为中点故 \(BD=CD\)，\(AD\) 为公共边，三边对应相等，由 SSS 得 \(\triangle ABD\cong\triangle ACD\)。` };
    } },
    { level: 'basic', type: 'fill', make(r) {
      const a = ri(r, 30, 90), b = ri(r, 20, 60);
      const c = 180 - a - b;
      return { stem: String.raw`若 \(\triangle ABC\cong\triangle A'B'C'\)，且 \(\angle A=${a}^\circ\)，\(\angle B=${b}^\circ\)，则 \(\angle C'=\) ______°。`,
        accept: [String(c)], analysis: String.raw`全等三角形对应角相等。\(\angle C=180^\circ-${a}^\circ-${b}^\circ=${c}^\circ\)，故 \(\angle C'=${c}^\circ\)。` };
    } },
    { level: 'advance', type: 'choice', make(r) {
      const o = opts4(r, '到角两边距离相等', ['在角的内部', '到顶点距离相等', '与两边成 45°']);
      return { stem: String.raw`角平分线上的点（　　）`, options: o.options, answer: o.answer,
        analysis: String.raw`角平分线的性质：角平分线上的点到角两边的距离相等。` };
    } },
    { level: 'advance', type: 'choice', make(r) {
      const a = ri(r, 3, 9);
      const o = opts4(r, String(a), [String(2 * a), String(3 * a), String(a + ri(r, 1, 5))]);
      return { stem: String.raw`若 \(\triangle ABC\cong\triangle DEF\) 且 \(\triangle ABC\) 的周长为 ${a}，则 \(\triangle DEF\) 的周长为（　　）`,
        options: o.options, answer: o.answer,
        analysis: String.raw`全等三角形的对应边相等，故周长也相等，\(\triangle DEF\) 的周长同样为 ${a}。` };
    } }
  ],

  'c2-pythagorean': [
    { level: 'basic', type: 'fill', make(r) {
      const t = pick(r, [[3, 4, 5], [5, 12, 13], [6, 8, 10], [8, 15, 17], [9, 12, 15], [7, 24, 25]]);
      return { stem: String.raw`直角三角形两直角边分别为 ${t[0]} 和 ${t[1]}，则斜边长为 ______。`,
        accept: [String(t[2])], analysis: String.raw`由勾股定理：\(c=\sqrt{${t[0]}^2+${t[1]}^2}=\sqrt{${t[0] * t[0] + t[1] * t[1]}}=${t[2]}\)。` };
    } },
    { level: 'basic', type: 'choice', make(r) {
      const t = pick(r, [[3, 4, 5], [5, 12, 13], [6, 8, 10], [9, 12, 15]]);
      const bad = [t[0], t[1], t[2] + 1].join('，');
      const o = opts4(r, t.join('，'), [bad, [t[0] + 1, t[1], t[2]].join('，'), [t[0], t[1] + 1, t[2]].join('，')]);
      return { stem: String.raw`下列各组数中，能作为直角三角形三边长度的是（　　）`, options: o.options, answer: o.answer,
        analysis: String.raw`\(${t[0]}^2+${t[1]}^2=${t[0] * t[0] + t[1] * t[1]}=${t[2]}^2\)，满足勾股定理。` };
    } },
    { level: 'advance', type: 'fill', make(r) {
      const h = ri(r, 5, 15), foot = ri(r, 3, 9);
      const l = Math.sqrt(h * h + foot * foot);
      return { stem: String.raw`一个梯子靠在墙上，梯脚离墙 ${foot} m，梯子顶端距地面 ${h} m，则梯长为 ______ m（保留根号或一位小数）。`,
        accept: [String(Math.round(l * 10) / 10)], analysis: String.raw`\(l=\sqrt{${h}^2+${foot}^2}=\sqrt{${h * h + foot * foot}}\approx ${l.toFixed(1)}\) m。` };
    } },
    { level: 'challenge', type: 'solve', make(r) {
      const a = ri(r, 3, 8), b = ri(r, 3, 8);
      return { stem: String.raw`长方形纸片长 ${a + b}、宽 ${a}，折叠使一角落在对边上，求折痕长度（写出主要过程）。`,
        keywords: ['勾股定理', String(Math.round(Math.sqrt(a * a + b * b) * 10) / 10)],
        analysis: String.raw`折痕为直角三角形的斜边，两直角边分别为 ${a} 与 ${b}，故折痕长 \(=\sqrt{${a}^2+${b}^2}=\sqrt{${a * a + b * b}}\approx ${Math.sqrt(a * a + b * b).toFixed(1)}\)。` };
    } }
  ],

  /* ---------- 初三 ---------- */
  'c3-quadratic': [
    { level: 'basic', type: 'fill', make(r) {
      const h = ri(r, 1, 5), k = ri(r, -5, 6), a = pick(r, [1, 2, -1]);
      return { stem: String.raw`二次函数 \(y=${a === 1 ? '' : a === -1 ? '-' : a}(x${h > 0 ? '-' + h : '+' + Math.abs(h)})^2${k >= 0 ? '+' + k : k}\) 的顶点坐标为 ______。`,
        accept: [String.raw`(${h},${k})`, `${h},${k}`],
        analysis: String.raw`顶点式 \(y=a(x-h)^2+k\) 的顶点为 \((h,k)=(${h},${k})\)。` };
    } },
    { level: 'basic', type: 'choice', make(r) {
      const h = ri(r, 1, 5);
      const o = opts4(r, '\\(x=' + h + '\\)', ['\\(x=0\\)', '\\(x=-' + h + '\\)', '\\(y=' + h + '\\)']);
      return { stem: String.raw`二次函数 \(y=(x-${h})^2+3\) 图象的对称轴是（　　）`, options: o.options, answer: o.answer,
        analysis: String.raw`顶点式 \(y=a(x-h)^2+k\) 的对称轴为直线 \(x=h=${h}\)。` };
    } },
    { level: 'advance', type: 'choice', make(r) {
      const a = ri(r, 1, 3), b = ri(r, 2, 9);
      const disc = b * b + 4 * a * ri(r, 1, 5);
      const o = opts4(r, '两个不相等的实数根', ['两个相等的实数根', '无实数根', '一个实数根']);
      return { stem: String.raw`二次函数 \(y=${a}x^2+${b}x-${ri(r, 1, 5)}\) 的图象与 \(x\) 轴有 ${disc > 0 ? '两个' : '两个'}交点，对应方程根的情况是（　　）`,
        options: o.options, answer: o.answer,
        analysis: String.raw`\(\Delta=b^2-4ac>0\) 时，抛物线与 \(x\) 轴有两个交点，对应方程有两个不相等的实数根。` };
    } },
    { level: 'advance', type: 'fill', make(r) {
      const a = ri(r, 1, 3), h = ri(r, 1, 4), k = -ri(r, 1, 6);
      return { stem: String.raw`二次函数 \(y=${a}(x-${h})^2${k}\) 的最小值为 ______。`,
        accept: [String(k)], analysis: String.raw`\(a=${a}>0\) 开口向上，函数在顶点处取最小值 \(y=${k}\)。` };
    } },
    { level: 'challenge', type: 'solve', make(r) {
      const x1 = ri(r, 1, 4), x2 = x1 + ri(r, 1, 4);
      return { stem: String.raw`已知二次函数的图象与 \(x\) 轴交于 \((${x1},0)\) 与 \((${x2},0)\)，且过点 \((0,${x1 * x2})\)，求其解析式。`,
        keywords: ['y=x^2', String(-(x1 + x2)), String(x1 * x2)],
        analysis: String.raw`设 \(y=a(x-${x1})(x-${x2})\)，代入 \((0,${x1 * x2})\)：\(${x1 * x2}=a\cdot ${-x1}\cdot${-x2}=${x1 * x2}a\)，得 \(a=1\)，故 \(y=(x-${x1})(x-${x2})=x^2-${x1 + x2}x+${x1 * x2}\)。` };
    } }
  ],

  'c3-circle': [
    { level: 'basic', type: 'fill', make(r) {
      const c = pick(r, [40, 60, 80, 100, 120]);
      return { stem: String.raw`在同圆中，同弧所对的圆心角为 ${c}°，则它所对的圆周角为 ______°。`,
        accept: [String(c / 2)], analysis: String.raw`圆周角等于同弧所对圆心角的一半：\(${c}°\div2=${c / 2}°\)。` };
    } },
    { level: 'basic', type: 'choice', make(r) {
      const o = opts4(r, '垂直于弦且平分弦所对的两条弧', ['平行于弦', '平分弦但不过圆心', '与弦成 45°']);
      return { stem: String.raw`垂径定理：垂直于弦的直径（　　）`, options: o.options, answer: o.answer,
        analysis: String.raw`垂径定理：垂直于弦的直径平分这条弦，并且平分弦所对的两条弧。` };
    } },
    { level: 'advance', type: 'fill', make(r) {
      const R = ri(r, 3, 10), n = pick(r, [60, 90, 120]);
      return { stem: String.raw`半径为 ${R} 的圆中，${n}° 的圆心角所对的弧长为 ______（保留 \(\pi\)）。`,
        accept: [String.raw`${Math.round(R * n / 180 * 100) / 100}\pi`, String.raw`\dfrac{${R * n / 180}\pi}`, String.raw`${R * n / 180}π`],
        analysis: String.raw`弧长 \(l=\dfrac{n\pi R}{180}=\dfrac{${n}\pi\times${R}}{180}=${Math.round(R * n / 180 * 100) / 100}\pi\)。` };
    } },
    { level: 'challenge', type: 'solve', make(r) {
      const R = ri(r, 4, 9);
      return { stem: String.raw`如图，\(AB\) 为 \(\odot O\) 的直径，点 \(C\) 在圆上。求证 \(\angle ACB=90^\circ\)。`,
        keywords: ['直径', '圆周角', '90', '直角'],
        analysis: String.raw`直径所对的圆心角为 \(180^\circ\)，同弧所对的圆周角等于圆心角的一半，故 \(\angle ACB=90^\circ\)。` };
    } },
    { level: 'basic', type: 'fill', make(r) {
      const c = pick(r, [30, 45, 50, 70]);
      return { stem: String.raw`圆内接四边形的一个内角为 ${c}°，则它的对角为 ______°。`,
        accept: [String(180 - c)], analysis: String.raw`圆内接四边形对角互补：\(180^\circ-${c}^\circ=${180 - c}^\circ\)。` };
    } },
    { level: 'basic', type: 'choice', make(r) {
      const o = opts4(r, '垂直于过切点的半径', ['平行于半径', '与半径成 45°', '过圆心']);
      return { stem: String.raw`圆的切线（　　）`, options: o.options, answer: o.answer,
        analysis: String.raw`切线的性质：圆的切线垂直于过切点的半径。` };
    } },
    { level: 'advance', type: 'fill', make(r) {
      const R = ri(r, 3, 9), n = pick(r, [60, 90, 120, 180]);
      return { stem: String.raw`半径为 ${R} 的圆中，${n}° 圆心角对应的扇形面积为 ______（保留 \(\pi\)）。`,
        accept: [String.raw`${Math.round(R * R * n / 360 * 100) / 100}\pi`, String.raw`${R * R * n / 360}π`],
        analysis: String.raw`扇形面积 \(S=\dfrac{n\pi R^2}{360}=\dfrac{${n}\pi\times${R}^2}{360}=${Math.round(R * R * n / 360 * 100) / 100}\pi\)。` };
    } },
    { level: 'advance', type: 'choice', make(r) {
      const d = ri(r, 4, 12);
      const o = opts4(r, String.raw`\dfrac{${d}}{2}`, [String(d), String(2 * d), String.raw`\dfrac{${d}}{4}`]);
      return { stem: String.raw`直径为 ${d} 的圆，其半径为（　　）`, options: o.options, answer: o.answer,
        analysis: String.raw`半径 \(=\dfrac{直径}{2}=\dfrac{${d}}{2}\)。` };
    } }
  ],

  'c3-similar': [
    { level: 'basic', type: 'choice', make(r) {
      const o = opts4(r, '两角对应相等', ['两边对应成比例', '两边及一角对应相等', '一条边相等']);
      return { stem: String.raw`下列条件中，一定能判定两个三角形相似的是（　　）`, options: o.options, answer: o.answer,
        analysis: String.raw`两角对应相等的两个三角形相似（AA），这是最常用的相似判定。` };
    } },
    { level: 'basic', type: 'fill', make(r) {
      const k = pick(r, [2, 3, 4]);
      return { stem: String.raw`两个相似三角形的相似比为 ${k}，则它们的面积比为 ______。`,
        accept: [String(k * k) + ':1', String(k * k)], analysis: String.raw`相似三角形的面积比等于相似比的平方：\(${k}^2=${k * k}\)。` };
    } },
    { level: 'advance', type: 'fill', make(r) {
      const h = ri(r, 3, 12), s = ri(r, 1, 4), sh = ri(r, 2, 6);
      const H = h * sh / s;
      return { stem: String.raw`同一时刻，${h} m 高的标杆影长 ${s} m，某建筑物影长 ${sh} m，则建筑物高 ______ m。`,
        accept: [String(Math.round(H * 10) / 10)], analysis: String.raw`由相似：\(\dfrac{H}{${sh}}=\dfrac{${h}}{${s}}\)，得 \(H=${h}\times\dfrac{${sh}}{${s}}=${H.toFixed(1)}\) m。` };
    } },
    { level: 'challenge', type: 'solve', make(r) {
      const a = ri(r, 3, 8);
      return { stem: String.raw`在 \(\triangle ABC\) 中，\(D,E\) 分别在 \(AB,AC\) 上且 \(DE\parallel BC\)，\(AD=${a}\)，\(DB=${a * 2}\)，求 \(\triangle ADE\) 与 \(\triangle ABC\) 的面积比。`,
        keywords: ['1:9', String.raw`\dfrac{1}{9}`],
        analysis: String.raw`相似比 \(=\dfrac{AD}{AB}=\dfrac{${a}}{${a * 3}}=\dfrac13\)，面积比 \(=\left(\dfrac13\right)^2=\dfrac19\)。` };
    } }
  ],

  /* ---------- 高一 ---------- */
  'g1-set': [
    { level: 'basic', type: 'choice', make(r) {
      const n = ri(r, 2, 5);
      const o = opts4(r, String(2 ** n), [String(2 ** n - 1), String(2 * n), String(n * n)]);
      return { stem: String.raw`含有 ${n} 个元素的集合，其子集个数为（　　）`, options: o.options, answer: o.answer,
        analysis: String.raw`每个元素都有“取”与“不取”两种选择，子集个数为 \(2^{${n}}=${2 ** n}\)。` };
    } },
    { level: 'basic', type: 'fill', make(r) {
      const a = ri(r, 1, 8), b = a + ri(r, 1, 5);
      return { stem: String.raw`集合 \(A=\{x\mid ${a}\leq x<${b}\}\) 用区间表示为 ______。`,
        accept: [String.raw`[${a},${b})`], analysis: String.raw`左端点取到用中括号，右端点取不到用小括号：\([${a},${b})\)。` };
    } },
    { level: 'advance', type: 'choice', make(r) {
      const a = ri(r, 1, 4);
      const o = opts4(r, '\\(x\\geq ' + a + '\\)', ['\\(x>' + a + '\\)', '\\(x\\leq' + a + '\\)', '全体实数']);
      return { stem: String.raw`函数 \(y=\sqrt{x-${a}}\) 的定义域是（　　）`, options: o.options, answer: o.answer,
        analysis: String.raw`偶次根式的被开方数非负：\(x-${a}\geq0\Rightarrow x\geq${a}\)。` };
    } },
    { level: 'challenge', type: 'solve', make(r) {
      const a = ri(r, 1, 4);
      return { stem: String.raw`设全集 \(U=\mathbb{R}\)，\(A=\{x\mid x<${a}\}\)，求 \(\complement_U A\)。`,
        keywords: [String.raw`x\geq${a}`, '[' + a + ',+∞)'],
        analysis: String.raw`补集为 \(\{x\mid x\geq${a}\}=[${a},+\infty)\)，注意端点 ${a} 属于补集。` };
    } }
  ],

  'g1-trig': [
    { level: 'basic', type: 'fill', make(r) {
      const t = pick(r, [
        ['30', '\\dfrac{1}{2}', 'sin', ['1/2', '0.5']],
        ['45', '\\dfrac{\\sqrt{2}}{2}', 'sin', ['√2/2', 'sqrt2/2', '0.707']],
        ['60', '\\dfrac{\\sqrt{3}}{2}', 'sin', ['√3/2', 'sqrt3/2', '0.866']],
        ['30', '\\dfrac{\\sqrt{3}}{2}', 'cos', ['√3/2', 'sqrt3/2', '0.866']],
        ['60', '\\dfrac{1}{2}', 'cos', ['1/2', '0.5']],
        ['45', '1', 'tan', ['1']]
      ]);
      return { stem: String.raw`\(${t[2]}${t[0]}^\circ=\) ______。`,
        accept: [t[1]].concat(t[3]),
        analysis: String.raw`特殊角三角函数值：\(${t[2]}${t[0]}^\circ=${t[1]}\)。` };
    } },
    { level: 'basic', type: 'choice', make(r) {
      const o = opts4(r, '周期性', ['单调性', '奇偶性', '有界性']);
      return { stem: String.raw`\(\sin(x+2\pi)=\sin x\) 体现了正弦函数的（　　）`, options: o.options, answer: o.answer,
        analysis: String.raw`自变量增加 \(2\pi\) 函数值不变，\(2\pi\) 是正弦函数的最小正周期。` };
    } },
    { level: 'advance', type: 'fill', make(r) {
      const a = ri(r, 2, 6), b = ri(r, 2, 6), C = 60;
      const c2 = a * a + b * b - a * b;
      return { stem: String.raw`在 \(\triangle ABC\) 中，\(a=${a},\ b=${b},\ C=60^\circ\)，则 \(c^2=\) ______。`,
        accept: [String(c2)], analysis: String.raw`余弦定理：\(c^2=a^2+b^2-2ab\cos C=${a}^2+${b}^2-2\times${a}\times${b}\times\dfrac12=${c2}\)。` };
    } },
    { level: 'challenge', type: 'solve', make(r) {
      const A = pick(r, [30, 45, 60]), B = 90 - A;
      return { stem: String.raw`已知 \(\sin ${A}^\circ\) 与 \(\cos ${B}^\circ\) 的关系，并计算 \(\sin^2 ${A}^\circ+\cos^2 ${A}^\circ\)。`,
        keywords: ['1', '相等', '互余'],
        analysis: String.raw`互余两角：\(\sin ${A}^\circ=\cos ${B}^\circ\)；同角平方关系 \(\sin^2\alpha+\cos^2\alpha=1\)。` };
    } },
    { level: 'advance', type: 'fill', make(r) {
      const A = pick(r, [30, 45, 60]), a = ri(r, 2, 8);
      const t = A === 30 ? '\\dfrac12' : (A === 45 ? '\\dfrac{\\sqrt2}{2}' : '\\dfrac{\\sqrt3}{2}');
      return { stem: String.raw`在 \(\triangle ABC\) 中，\(\angle A=${A}^\circ\)，\(a=${a}\)，则外接圆直径 \(2R=\) ______（用含根号的式子表示）。`,
        accept: [String.raw`\dfrac{${a}}{${t}}`, String.raw`${a}\div ${t}`, (a / (A === 30 ? 0.5 : A === 45 ? 0.7071 : 0.866)).toFixed(2)],
        analysis: String.raw`正弦定理 \(\dfrac{a}{\sin A}=2R\)，\(\sin ${A}^\circ=${t}\)，故 \(2R=\dfrac{${a}}{${t}}\)。` };
    } },
    { level: 'advance', type: 'choice', make(r) {
      const o = opts4(r, '\\(\\sin\\alpha\\)', ['\\(-\\sin\\alpha\\)', '\\(\\cos\\alpha\\)', '\\(-\\cos\\alpha\\)']);
      return { stem: String.raw`\(\sin(\pi-\alpha)=\)（　　）`, options: o.options, answer: o.answer,
        analysis: String.raw`诱导公式：\(\sin(\pi-\alpha)=\sin\alpha\)（奇变偶不变，符号看象限）。` };
    } },
    { level: 'challenge', type: 'choice', make(r) {
      const A = ri(r, 2, 5), w = ri(r, 2, 4);
      const o = opts4(r, String.raw`\dfrac{2\pi}{${w}}`, [String.raw`\dfrac{\pi}{${w}}`, String(2 * Math.PI).slice(0, 4), String(w)]);
      return { stem: String.raw`函数 \(y=${A}\sin(${w}x)\) 的最小正周期为（　　）`, options: o.options, answer: o.answer,
        analysis: String.raw`\(y=A\sin(\omega x+\varphi)\) 的最小正周期 \(T=\dfrac{2\pi}{\omega}=\dfrac{2\pi}{${w}}\)。` };
    } }
  ],

  'g1-explog': [
    { level: 'basic', type: 'fill', make(r) {
      const b = pick(r, [2, 3, 5]), n = ri(r, 2, 5);
      return { stem: String.raw`\(\log_{${b}} ${b ** n}=\) ______。`, accept: [String(n)],
        analysis: String.raw`\(${b ** n}=${b}^{${n}}\)，故 \(\log_{${b}}${b ** n}=${n}\)。` };
    } },
    { level: 'basic', type: 'choice', make(r) {
      const o = opts4(r, '\\((0,+\\infty)\\)', ['\\(\\mathbb{R}\\)', '\\([0,+\\infty)\\)', '\\((-\\infty,0)\\)']);
      return { stem: String.raw`函数 \(y=\log_2 x\) 的定义域是（　　）`, options: o.options, answer: o.answer,
        analysis: String.raw`对数的真数必须大于 0，故定义域为 \((0,+\infty)\)。` };
    } },
    { level: 'advance', type: 'fill', make(r) {
      const a = ri(r, 2, 5), b = ri(r, 2, 5);
      return { stem: String.raw`\(\log_2 ${a}+\log_2 ${b}=\log_2\) ______。`, accept: [String(a * b)],
        analysis: String.raw`同底对数相加等于真数相乘的对数：\(\log_2 ${a}+\log_2 ${b}=\log_2 ${a * b}\)。` };
    } },
    { level: 'challenge', type: 'solve', make(r) {
      const n = ri(r, 2, 4);
      return { stem: String.raw`解方程 \(2^x=${2 ** n}\)，并说明指数函数的单调性。`,
        keywords: [String(n), '单调递增'],
        analysis: String.raw`\(${2 ** n}=2^{${n}}\)，故 \(x=${n}\)。底数 \(2>1\)，\(y=2^x\) 在 \(\mathbb{R}\) 上单调递增。` };
    } },
    { level: 'advance', type: 'fill', make(r) {
      const b = pick(r, [2, 3, 4, 5]), n = ri(r, 2, 4);
      return { stem: String.raw`\(\log_{${b * b}} ${b ** n}=\) ______（用分数表示）。`,
        accept: [String.raw`\dfrac{${n}}{2}`, String(n / 2)],
        analysis: String.raw`\(${b}^{${n}}=(${b * b})^{${n}/2}\)，故 \(\log_{${b * b}}${b ** n}=\dfrac{${n}}{2}\)。` };
    } },
    { level: 'advance', type: 'choice', make(r) {
      const a = pick(r, ['0.3', '0.5', '2', '3']);
      const bigger = parseFloat(a) > 1;
      const o = opts4(r, bigger ? '单调递增' : '单调递减', [bigger ? '单调递减' : '单调递增', '先增后减', '无单调性']);
      return { stem: String.raw`函数 \(y=${a}^x\) 的单调性是（　　）`, options: o.options, answer: o.answer,
        analysis: String.raw`底数 \(${a}${bigger ? '>1' : '<1'}\)，故 \(y=${a}^x\) 在 \(\mathbb{R}\) 上${bigger ? '单调递增' : '单调递减'}。` };
    } },
    { level: 'basic', type: 'fill', make(r) {
      const a = pick(r, [2, 3, 5]);
      return { stem: String.raw`函数 \(y=${a}^x\) 的图象恒过定点 ______。`,
        accept: [String.raw`(0,1)`, '0,1'],
        analysis: String.raw`\(x=0\) 时 \(y=${a}^0=1\)，与底数无关，故恒过点 \((0,1)\)。` };
    } },
    { level: 'advance', type: 'choice', make(r) {
      const n = ri(r, 2, 5);
      const o = opts4(r, '\\(x<' + n + '\\)', ['\\(x>' + n + '\\)', '\\(x>0\\)', '\\(x<0\\)']);
      return { stem: String.raw`若 \(\left(\dfrac12\right)^x>\left(\dfrac12\right)^{${n}}\)，则 \(x\) 的取值范围是（　　）`,
        options: o.options, answer: o.answer,
        analysis: String.raw`底数 \(\dfrac12\in(0,1)\)，函数单调递减，故 \(x<${n}\)。` };
    } }
  ],

  /* ---------- 高二 ---------- */
  'g2-derivative': [
    { level: 'basic', type: 'choice', make(r) {
      const a = ri(r, 2, 6), n = pick(r, [2, 3, 4]);
      const o = opts4(r, '\\(' + (a * n) + 'x^{' + (n - 1) + '}\\)', ['\\(' + a + 'x^{' + n + '}\\)', '\\(' + (a * n) + 'x^{' + n + '}\\)', '\\(' + a + 'x^{' + (n - 1) + '}\\)']);
      return { stem: String.raw`函数 \(f(x)=${a}x^{${n}}\) 的导数是（　　）`, options: o.options, answer: o.answer,
        analysis: String.raw`\(f'(x)=${a}\cdot${n}x^{${n - 1}}=${a * n}x^{${n - 1}}\)。` };
    } },
    { level: 'basic', type: 'fill', make(r) {
      const a = ri(r, 1, 5), b = ri(r, 1, 6), x0 = ri(r, 1, 3);
      return { stem: String.raw`函数 \(f(x)=x^2+${a}x+${b}\) 在 \(x=${x0}\) 处的导数值为 ______。`,
        accept: [String(2 * x0 + a)], analysis: String.raw`\(f'(x)=2x+${a}\)，\(f'(${x0})=${2 * x0}+${a}=${2 * x0 + a}\)。` };
    } },
    { level: 'advance', type: 'fill', make(r) {
      const a = ri(r, 1, 4);
      return { stem: String.raw`曲线 \(y=x^2\) 在点 \((${a},${a * a})\) 处的切线斜率为 ______。`,
        accept: [String(2 * a)], analysis: String.raw`\(y'=2x\)，在 \(x=${a}\) 处斜率为 \(${2 * a}\)。` };
    } },
    { level: 'challenge', type: 'solve', make(r) {
      const a = ri(r, 1, 3);
      return { stem: String.raw`求函数 \(f(x)=x^3-${3 * a}x\) 的单调区间与极小值。`,
        keywords: ['减区间', '增区间', String(-2 * a * Math.sqrt(a * 1))],
        analysis: String.raw`\(f'(x)=3x^2-${3 * a}=3(x^2-${a})\)，令 \(f'(x)=0\) 得 \(x=\pm\sqrt{${a}}\)。\(x<-\sqrt{${a}}\) 或 \(x>\sqrt{${a}}\) 时递增，\(-\sqrt{${a}}<x<\sqrt{${a}}\) 时递减，极小值 \(f(\sqrt{${a}})=${a}\sqrt{${a}}-${3 * a}\sqrt{${a}}=-${2 * a}\sqrt{${a}}\)。` };
    } }
  ],

  'g2-sequence': [
    { level: 'basic', type: 'fill', make(r) {
      const a1 = ri(r, 1, 5), d = ri(r, 2, 6), n = ri(r, 5, 12);
      return { stem: String.raw`等差数列 \(\{a_n\}\) 中 \(a_1=${a1},\ d=${d}\)，则 \(a_{${n}}=\) ______。`,
        accept: [String(a1 + (n - 1) * d)], analysis: String.raw`\(a_{${n}}=${a1}+(${n}-1)\times${d}=${a1 + (n - 1) * d}\)。` };
    } },
    { level: 'basic', type: 'fill', make(r) {
      const a1 = ri(r, 1, 4), d = ri(r, 1, 4), n = ri(r, 4, 10);
      const S = n * (2 * a1 + (n - 1) * d) / 2;
      return { stem: String.raw`等差数列 \(a_1=${a1},\ d=${d}\) 的前 ${n} 项和 \(S_{${n}}=\) ______。`,
        accept: [String(S)], analysis: String.raw`\(S_n=\dfrac{n[2a_1+(n-1)d]}{2}=\dfrac{${n}[${2 * a1}+${(n - 1) * d}]}{2}=${S}\)。` };
    } },
    { level: 'advance', type: 'choice', make(r) {
      const q = pick(r, [2, 3, '\\dfrac12']), a1 = ri(r, 1, 4);
      const o = opts4(r, '\\(a_n=a_1q^{n-1}\\)', ['\\(a_n=a_1+(n-1)q\\)', '\\(a_n=a_1q^{n}\\)', '\\(a_n=q^{n-1}\\)']);
      return { stem: String.raw`等比数列 \(\{a_n\}\) 首项为 \(a_1\)、公比为 \(q\)，其通项公式为（　　）`, options: o.options, answer: o.answer,
        analysis: String.raw`由 \(\dfrac{a_{n+1}}{a_n}=q\) 递推得 \(a_n=a_1q^{n-1}\)。` };
    } },
    { level: 'challenge', type: 'solve', make(r) {
      const a1 = ri(r, 1, 3), q = pick(r, [2, 3]), n = ri(r, 3, 5);
      const S = a1 * (q ** n - 1) / (q - 1);
      return { stem: String.raw`等比数列 \(a_1=${a1},\ q=${q}\)，求前 ${n} 项和 \(S_{${n}}\)。`,
        keywords: [String(S)], analysis: String.raw`\(S_n=\dfrac{a_1(1-q^n)}{1-q}=\dfrac{${a1}(1-${q}^{${n}})}{1-${q}}=${S}\)。` };
    } }
  ],

  'g2-conic': [
    { level: 'basic', type: 'fill', make(r) {
      const p = pick(r, [2, 4, 6]);
      return { stem: String.raw`抛物线 \(y^2=${2 * p}x\) 的焦点坐标为 ______。`,
        accept: [String.raw`(\dfrac{${p}}{2},0)`, String.raw`(${p / 2},0)`],
        analysis: String.raw`标准式 \(y^2=2px\) 的焦点为 \(\left(\dfrac p2,0\right)=(${p / 2},0)\)。` };
    } },
    { level: 'basic', type: 'choice', make(r) {
      const a = ri(r, 3, 8), b = ri(r, 2, Math.max(3, a - 1));
      const o = opts4(r, '\\(\\dfrac{x^2}{' + a * a + '}+\\dfrac{y^2}{' + b * b + '}=1\\)',
        ['\\(\\dfrac{x^2}{' + b * b + '}+\\dfrac{y^2}{' + a * a + '}=1\\)', '\\(x^2+y^2=' + a * a + '\\)', '\\(\\dfrac{x^2}{' + a * a + '}-\\dfrac{y^2}{' + b * b + '}=1\\)']);
      return { stem: String.raw`焦点在 \(x\) 轴上、长半轴为 ${a}、短半轴为 ${b} 的椭圆标准方程是（　　）`, options: o.options, answer: o.answer,
        analysis: String.raw`焦点在 \(x\) 轴时 \(a>b>0\)，方程为 \(\dfrac{x^2}{a^2}+\dfrac{y^2}{b^2}=1\)。` };
    } },
    { level: 'advance', type: 'fill', make(r) {
      const a = ri(r, 3, 8), c = ri(r, 1, Math.max(2, a - 1));
      return { stem: String.raw`椭圆 \(\dfrac{x^2}{${a * a}}+\dfrac{y^2}{${a * a - c * c}}=1\) 的离心率 \(e=\) ______。`,
        accept: [String.raw`\dfrac{${c}}{${a}}`, (c / a).toFixed(2)],
        analysis: String.raw`\(b^2=a^2-c^2\)，故 \(c=${c}\)，\(e=\dfrac ca=\dfrac{${c}}{${a}}\approx ${(c / a).toFixed(2)}\)。` };
    } },
    { level: 'challenge', type: 'solve', make(r) {
      const a = ri(r, 2, 5), b = ri(r, 1, 4);
      return { stem: String.raw`求双曲线 \(\dfrac{x^2}{${a * a}}-\dfrac{y^2}{${b * b}}=1\) 的实轴长、焦距与渐近线方程。`,
        keywords: [String(2 * a), '渐近线', String.raw`y=\pm\dfrac{${b}}{${a}}x`],
        analysis: String.raw`\(a=${a},b=${b},c=\sqrt{a^2+b^2}=\sqrt{${a * a + b * b}}\)，实轴长 \(2a=${2 * a}\)，焦距 \(2c=${(2 * Math.sqrt(a * a + b * b)).toFixed(2)}\)，渐近线 \(y=\pm\dfrac{${b}}{${a}}x\)。` };
    } }
  ],

  /* ---------- 高三 ---------- */
  'g3-probability': [
    { level: 'basic', type: 'choice', make(r) {
      const n = ri(r, 4, 7), k = ri(r, 1, 3);
      const o = opts4(r, String.raw`\dfrac{${k}}{${n}}`, [String.raw`\dfrac{${n}}{${k}}`, String.raw`\dfrac{1}{${n}}`, String.raw`\dfrac{${k}}{${n + 1}}`]);
      return { stem: String.raw`袋中有 ${n} 个球，其中红球 ${k} 个，随机取 1 个，取到红球的概率为（　　）`,
        options: o.options, answer: o.answer,
        analysis: String.raw`古典概型：\(P=\dfrac{${k}}{${n}}\)。` };
    } },
    { level: 'basic', type: 'fill', make(r) {
      const n = pick(r, [4, 5, 6]), k = ri(r, 2, 3);
      const c = (n * (n - 1)) / 2, ck = (k * (k - 1)) / 2;
      return { stem: String.raw`从 ${n} 件产品（其中 ${k} 件正品）中任取 2 件，两件都是正品的概率为 ______。`,
        accept: [String.raw`\dfrac{${ck}}{${c}}`, (ck / c).toFixed(2)],
        analysis: String.raw`\(P=\dfrac{\mathrm{C}_{${k}}^2}{\mathrm{C}_{${n}}^2}=\dfrac{${ck}}{${c}}\)。` };
    } },
    { level: 'advance', type: 'fill', make(r) {
      const n = pick(r, [4, 6, 8]), p = pick(r, ['\\dfrac12', '\\dfrac13', '\\dfrac14']);
      const pv = p === '\\dfrac12' ? 0.5 : (p === '\\dfrac13' ? 1 / 3 : 0.25);
      return { stem: String.raw`随机变量 \(X\sim B(${n},${p})\)，则 \(E(X)=\) ______。`,
        accept: [String(n * pv), String.raw`${n}\times${p}`],
        analysis: String.raw`二项分布的期望 \(E(X)=np=${n}\times${p}=${n * pv}\)。` };
    } },
    { level: 'challenge', type: 'solve', make(r) {
      const n = ri(r, 4, 8);
      return { stem: String.raw`甲、乙两人独立解同一道题，甲解出的概率为 \(\dfrac12\)，乙为 \(\dfrac13\)。求此题被解出的概率。`,
        keywords: [String.raw`\dfrac{2}{3}`, '对立事件'],
        analysis: String.raw`用对立事件：两人都解不出的概率 \(=\dfrac12\times\dfrac23=\dfrac13\)，故被解出的概率 \(=1-\dfrac13=\dfrac23\)。` };
    } }
  ],

  'g3-inequality': [
    { level: 'basic', type: 'choice', make(r) {
      const a = ri(r, 1, 4), b = a + ri(r, 1, 4);
      const o = opts4(r, '\\(' + a + '<x<' + b + '\\)', ['\\(x<' + a + '\\) 或 \\(x>' + b + '\\)', '\\(x>' + a + '\\)', '\\(' + b + '<x<' + a + '\\)']);
      return { stem: String.raw`不等式 \((x-${a})(x-${b})<0\) 的解集是（　　）`, options: o.options, answer: o.answer,
        analysis: String.raw`开口向上，小于 0 取两根之间：\(${a}<x<${b}\)。` };
    } },
    { level: 'basic', type: 'fill', make(r) {
      const a = ri(r, 2, 6);
      return { stem: String.raw`当 \(x>0\) 时，\(x+\dfrac{${a * a}}{x}\) 的最小值为 ______。`,
        accept: [String(2 * a)], analysis: String.raw`由基本不等式 \(x+\dfrac{${a * a}}{x}\geq 2\sqrt{${a * a}}=${2 * a}\)，当 \(x=${a}\) 时取等号。` };
    } },
    { level: 'advance', type: 'choice', make(r) {
      const a = ri(r, 1, 5);
      const o = opts4(r, '\\(-' + a + '<x<' + a + '\\)', ['\\(x>' + a + '\\)', '\\(x<-' + a + '\\) 或 \\(x>' + a + '\\)', '无解']);
      return { stem: String.raw`不等式 \(|x|<${a}\) 的解集是（　　）`, options: o.options, answer: o.answer,
        analysis: String.raw`\(|x|<a\ (a>0)\Leftrightarrow -a<x<a\)，即 \(-${a}<x<${a}\)。` };
    } },
    { level: 'challenge', type: 'solve', make(r) {
      const a = ri(r, 1, 4);
      return { stem: String.raw`若不等式 \(x^2-${2 * a}x+${a * a + 1}>0\) 对一切实数 \(x\) 恒成立，说明理由并求 \(a\) 的范围。`,
        keywords: ['判别式', 'Δ<0', '恒成立'],
        analysis: String.raw`配方得 \((x-${a})^2+1>0\)。由于平方项非负，加 1 后恒大于 0，故对任意实数 \(a\) 都恒成立。` };
    } }
  ]
};

/* 新增知识点的生成模板（可独立维护） */
try {
  Object.assign(M, require(path.join(__dirname, 'templates-extra.cjs'))({ ri, pick, shuffled, opts4, frac }));
} catch (e) {
  console.log('额外模板加载失败：' + e.message);
}

/* ============================================================
   主流程
   ============================================================ */
async function main() {
  const argv = process.argv.slice(2);
  const get = (k, d) => { const i = argv.indexOf('--' + k); return i >= 0 ? argv[i + 1] : d; };
  const target = parseInt(get('target', '40'), 10);
  const seed = parseInt(get('seed', '20261022'), 10);

  const db = await store.openFromConfig();
  const kpCount = await store.seedKP(db);
  const r = rngFrom(seed);

  let inserted = 0, dup = 0;
  const perKp = [];
  for (const [kp, makers] of Object.entries(M)) {
    const [[cnt]] = await db.query('SELECT COUNT(*) AS n FROM question WHERE kp = ?', [kp]);
    const have = Number(cnt.n);
    const need = Math.max(0, target - have);
    let added = 0, attempts = 0;
    while (added < need && attempts < need * 20 + 60) {
      attempts++;
      const mk = makers[attempts % makers.length];
      let q;
      try { q = mk.make(r); } catch (e) { continue; }
      if (!q || !q.stem) continue;
      const res = await store.upsert(db, {
        id: kp + '-gen-' + store.hashQ(q),
        kp, level: q.level || mk.level, type: q.type || mk.type,
        stem: q.stem, options: q.options || [], answer: q.answer || '',
        accept: q.accept || [], keywords: q.keywords || [], analysis: q.analysis || '',
        tags: ['生成'], source: 'gen'
      });
      if (res.action === 'inserted') { added++; inserted++; } else dup++;
    }
    perKp.push({ kp, have, added, total: have + added });
  }
  console.log('知识点入库：' + kpCount + ' 个；目标每题 ' + target + ' 道');
  console.log(perKp.map(x => `${x.kp.padEnd(16)} 原有 ${String(x.have).padStart(2)} + 新增 ${String(x.added).padStart(2)} = ${x.total}`).join('\n'));
  console.log(`\n写入 ${inserted} 道，去重拦截 ${dup} 道。`);
  const s = await store.stats(db);
  console.log('题库总量：' + s.total + ' 道（按来源：' + s.bySource.map(x => x.source + ' ' + x.n).join('，') + '）');
  await db.end();
}

if (require.main === module) main().catch(e => { console.error('[x] ' + (e && e.stack || e)); process.exit(1); });
module.exports = { M };
