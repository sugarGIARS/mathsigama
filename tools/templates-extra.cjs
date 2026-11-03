/* ============================================================
   templates-extra.cjs · 新增 12 个知识点的题目生成模板
   导出工厂函数，复用 gen-bank.cjs 的随机与选项工具
   约定：所有答案都由参数现场算出，避免手工推导出错
   ============================================================ */
module.exports = function (H) {
  const { ri, pick, opts4, frac } = H;

  /* 多项式拼装：a x^2 + b x + c */
  function poly(a, b, c) {
    const s = [];
    if (a) s.push((a === 1 ? '' : a === -1 ? '-' : a) + 'x^2');
    if (b) s.push((s.length ? (b > 0 ? '+' : '-') : (b < 0 ? '-' : '')) + (Math.abs(b) === 1 ? '' : Math.abs(b)) + 'x');
    if (c) s.push((s.length ? (c > 0 ? '+' : '-') : (c < 0 ? '-' : '')) + Math.abs(c));
    return s.join('') || '0';
  }
  const sq = n => '\\sqrt{' + n + '}';
  const dfrac = (a, b) => '\\dfrac{' + a + '}{' + b + '}';

  return {
    /* ---------------- 整式与因式分解 ---------------- */
    'c1-poly': [
      { level: 'basic', type: 'choice', make(r) {
        const a1 = ri(r, 3, 7), a2 = ri(r, 1, a1 - 1);
        const b1 = ri(r, 2, 8) * (r() < .5 ? 1 : -1), b2 = ri(r, 2, 8);
        const c1 = ri(r, 2, 9), c2 = ri(r, 1, 6);
        const a = a1 - a2, b = b1 - b2, c = c1 - c2;
        const ans = poly(a, b, c);
        const o = opts4(r, ans, [poly(a, -b, c), poly(a, b, -c), poly(-a, b, c)]);
        return {
          stem: String.raw`化简 \(${poly(a1, b1, c1)}-(${poly(a2, b2, c2)})\) 的结果是（　　）`,
          options: o.options, answer: o.answer,
          analysis: String.raw`去括号后合并同类项：二次项 \(${a1}-${a2}=${a}\)，一次项 \(${b1}-${b2}=${b}\)，常数项 \(${c1}-${c2}=${c}\)，结果为 \(${ans}\)。`
        };
      } },
      { level: 'basic', type: 'fill', make(r) {
        let p = ri(r, 1, 6) * (r() < .5 ? 1 : -1), q = ri(r, 1, 6) * (r() < .5 ? 1 : -1);
        if (p + q === 0) q = q + (q > 0 ? 1 : -1);   // 避免出现 0x 项
        const sp = p >= 0 ? '+' + p : String(p), sQ = q >= 0 ? '+' + q : String(q);
        return {
          stem: String.raw`分解因式：\(x^2${p + q >= 0 ? '+' : ''}${p + q}x${p * q >= 0 ? '+' : ''}${p * q}=\) ______。`,
          accept: [`(x${sp})(x${sQ})`, `(x${sQ})(x${sp})`],
          analysis: String.raw`找两数使其和为 \(${p + q}\)、积为 \(${p * q}\)，即 ${p} 与 ${q}，故原式 \(=(x${sp})(x${sQ})\)。`
        };
      } },
      { level: 'advance', type: 'fill', make(r) {
        const s = ri(r, 3, 12), t = ri(r, 1, 9);
        return {
          stem: String.raw`已知 \(a+b=${s}\)，\(ab=${t}\)，则 \(a^2+b^2=\) ______。`,
          accept: [String(s * s - 2 * t)],
          analysis: String.raw`\(a^2+b^2=(a+b)^2-2ab=${s}^2-2\times${t}=${s * s}-${2 * t}=${s * s - 2 * t}\)。`
        };
      } }
    ],

    /* ---------------- 二元一次方程组 ---------------- */
    'c1-system': [
      { level: 'basic', type: 'choice', make(r) {
        const x = ri(r, 2, 9), y = ri(r, 1, 8);
        const o = opts4(r, String(x), [String(y), String(x + 1), String(x - 1)]);
        return {
          stem: String.raw`方程组 \(\begin{cases}x+y=${x + y}\\ x-y=${x - y}\end{cases}\) 的解中 \(x=\) （　　）`,
          options: o.options, answer: o.answer,
          analysis: String.raw`两式相加得 \(2x=${2 * x}\)，故 \(x=${x}\)，回代得 \(y=${y}\)。`
        };
      } },
      { level: 'basic', type: 'fill', make(r) {
        const k = ri(r, 2, 4), x = ri(r, 1, 6), y = ri(r, 1, 9);
        return {
          stem: String.raw`解方程组 \(\begin{cases}${k}x+y=${k * x + y}\\ x-y=${x - y}\end{cases}\)，则 \(x=\) ______。`,
          accept: [String(x)],
          analysis: String.raw`由第二式 \(y=x-(${x - y})\)，代入第一式得 \(${k + 1}x=${(k + 1) * x}\)，故 \(x=${x}\)，\(y=${y}\)。`
        };
      } },
      { level: 'advance', type: 'fill', make(r) {
        const m = ri(r, 2, 7), n = ri(r, 2, 8), k = ri(r, 2, 5), a = ri(r, 2, 5);
        return {
          stem: String.raw`已知 \(\begin{cases}x=${m}\\ y=${n}\end{cases}\) 是方程 \(${k}x+ay=${k * m + a * n}\) 的解，则 \(a=\) ______。`,
          accept: [String(a)],
          analysis: String.raw`代入得 \(${k * m}+${n}a=${k * m + a * n}\)，即 ${n}a=${n * a}，故 \(a=${a}\)。`
        };
      } }
    ],

    /* ---------------- 二次根式 ---------------- */
    'c2-radical': [
      { level: 'basic', type: 'choice', make(r) {
        const k = ri(r, 2, 6), b = pick(r, [2, 3, 5, 6, 7]);
        const o = opts4(r, `${k}√${b}`, [`√${k * k * b}`, `${k * k}√${b}`, `√${b}`]);
        return {
          stem: String.raw`化简 \(\sqrt{${k * k * b}}\) 的结果是（　　）`,
          options: o.options, answer: o.answer,
          analysis: String.raw`\(\sqrt{${k * k * b}}=\sqrt{${k}^2\times${b}}=${k}\sqrt{${b}}\)。`
        };
      } },
      { level: 'basic', type: 'fill', make(r) {
        const a = pick(r, [3, 5, 7, 10, 11]), b = pick(r, [1, 2, 3, 5]);
        const sb = b === 1 ? '1' : sq(b);
        return {
          stem: String.raw`计算 \((\sqrt{${a}}+${sb})(\sqrt{${a}}-${sb})=\) ______。`,
          accept: [String(a - b)],
          analysis: String.raw`平方差公式：\((\sqrt{${a}})^2-(\sqrt{${b}})^2=${a}-${b}=${a - b}\)。`
        };
      } },
      { level: 'advance', type: 'fill', make(r) {
        const n = ri(r, 2, 9) * (r() < .5 ? 1 : -1);
        return {
          stem: String.raw`化简 \(\sqrt{(${n})^2}=\) ______。`,
          accept: [String(Math.abs(n))],
          analysis: String.raw`\(\sqrt{a^2}=|a|\)，故 \(\sqrt{(${n})^2}=|${n}|=${Math.abs(n)}\)。开方结果一定非负。`
        };
      } }
    ],

    /* ---------------- 平行线与三角形 ---------------- */
    'c2-triangle': [
      { level: 'basic', type: 'fill', make(r) {
        const a = ri(r, 30, 80), b = ri(r, 30, 80), c = 180 - a - b;
        return {
          stem: String.raw`三角形两个内角分别为 ${a}° 和 ${b}°，则第三个内角为 ______°。`,
          accept: [String(c)],
          analysis: String.raw`内角和 \(180°\)：\(180°-${a}°-${b}°=${c}°\)。`
        };
      } },
      { level: 'basic', type: 'choice', make(r) {
        const n = ri(r, 5, 10), sum = (n - 2) * 180;
        const o = opts4(r, String(sum) + '°', [String(n * 180) + '°', String((n - 1) * 180) + '°', String(sum - 180) + '°']);
        return {
          stem: String.raw`${n} 边形的内角和是（　　）`,
          options: o.options, answer: o.answer,
          analysis: String.raw`\((n-2)\times180°=(${n}-2)\times180°=${sum}°\)。`
        };
      } },
      { level: 'advance', type: 'fill', make(r) {
        const bc = ri(r, 4, 20) * 2;
        return {
          stem: String.raw`在 \(\triangle ABC\) 中，\(D,E\) 分别是 \(AB,AC\) 的中点，若 \(BC=${bc}\)，则 \(DE=\) ______。`,
          accept: [String(bc / 2)],
          analysis: String.raw`\(DE\) 为中位线，\(DE=\dfrac12BC=${bc / 2}\)，且 \(DE\parallel BC\)。`
        };
      } }
    ],

    /* ---------------- 一元二次方程 ---------------- */
    'c3-eq2': [
      { level: 'basic', type: 'choice', make(r) {
        const u = ri(r, 1, 7), v = ri(r, 2, 9);
        const o = opts4(r, String(Math.max(u, v)), [String(Math.min(u, v)), String(-u), String(u + v)]);
        return {
          stem: String.raw`方程 \(x^2-${u + v}x+${u * v}=0\) 的较大根是（　　）`,
          options: o.options, answer: o.answer,
          analysis: String.raw`因式分解：\((x-${u})(x-${v})=0\)，两根为 ${u} 与 ${v}，较大者为 ${Math.max(u, v)}。`
        };
      } },
      { level: 'basic', type: 'fill', make(r) {
        const a = ri(r, 2, 3), b = a * ri(r, 2, 4), c = ri(r, 1, 3);
        return {
          stem: String.raw`方程 \(${a === 1 ? '' : a}x^2-${b}x+${c}=0\) 的两根之和为 ______。`,
          accept: [dfrac(b, a), String(b / a)],
          analysis: String.raw`由韦达定理 \(x_1+x_2=-\dfrac ba=\dfrac{${b}}{${a}}\)；此处 \(\Delta=${b}^2-4\times${a}\times${c}>0\)，两根确实存在。`
        };
      } },
      { level: 'advance', type: 'fill', make(r) {
        const b = ri(r, 2, 9), a = ri(r, 1, 3), c = ri(r, 1, 6);
        return {
          stem: String.raw`方程 \(${a === 1 ? '' : a}x^2-${b}x+${c}=0\) 的判别式 \(\Delta=\) ______。`,
          accept: [String(b * b - 4 * a * c)],
          analysis: String.raw`\(\Delta=b^2-4ac=${b}^2-4\times${a}\times${c}=${b * b}-${4 * a * c}=${b * b - 4 * a * c}\)。`
        };
      } }
    ],

    /* ---------------- 锐角三角函数 ---------------- */
    'c3-trig': [
      { level: 'basic', type: 'choice', make(r) {
        const t = pick(r, [
          ['30', 'sin', '\\dfrac12'], ['45', 'sin', '\\dfrac{\\sqrt2}{2}'], ['60', 'sin', '\\dfrac{\\sqrt3}{2}'],
          ['30', 'cos', '\\dfrac{\\sqrt3}{2}'], ['45', 'cos', '\\dfrac{\\sqrt2}{2}'], ['60', 'cos', '\\dfrac12'],
          ['30', 'tan', '\\dfrac{\\sqrt3}{3}'], ['45', 'tan', '1'], ['60', 'tan', '\\sqrt3']
        ]);
        const cmd = '\\' + t[1];
        const o = opts4(r, t[2], ['\\dfrac12', '\\dfrac{\\sqrt2}{2}', '\\dfrac{\\sqrt3}{2}', '1', '\\sqrt3']);
        return {
          stem: String.raw`\(${cmd}${t[0]}^\circ\) 的值是（　　）`,
          options: o.options, answer: o.answer,
          analysis: String.raw`特殊角三角函数值：\(${cmd}${t[0]}^\circ=${t[2]}\)。`
        };
      } },
      { level: 'basic', type: 'fill', make(r) {
        const tri = pick(r, [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25]]);
        return {
          stem: String.raw`在 \(\text{Rt}\triangle ABC\) 中，\(\angle C=90^\circ\)，\(AB=${tri[2]}\)，\(BC=${tri[0]}\)，则 \(\sin A=\) ______。`,
          accept: [dfrac(tri[0], tri[2]), String(Math.round(tri[0] / tri[2] * 100) / 100)],
          analysis: String.raw`\(\sin A=\dfrac{BC}{AB}=\dfrac{${tri[0]}}{${tri[2]}}\)；由勾股定理 \(AC=\sqrt{${tri[2]}^2-${tri[0]}^2}=${tri[1]}\)。`
        };
      } },
      { level: 'advance', type: 'fill', make(r) {
        const tri = pick(r, [[3, 4, 5], [5, 12, 13], [8, 15, 17]]);
        return {
          stem: String.raw`在 \(\text{Rt}\triangle ABC\) 中，\(\angle C=90^\circ\)，\(AC=${tri[1]}\)，\(BC=${tri[0]}\)，则 \(\tan A=\) ______。`,
          accept: [dfrac(tri[0], tri[1])],
          analysis: String.raw`\(\tan A=\dfrac{\text{对边}}{\text{邻边}}=\dfrac{BC}{AC}=\dfrac{${tri[0]}}{${tri[1]}}\)。`
        };
      } },
      { level: 'advance', type: 'fill', make(r) {
        const tri = pick(r, [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25]]);
        return {
          stem: String.raw`已知锐角 \(\alpha\) 满足 \(\sin\alpha=\dfrac{${tri[0]}}{${tri[2]}}\)，则 \(\tan\alpha=\) ______。`,
          accept: [dfrac(tri[0], tri[1])],
          analysis: String.raw`由 \(\sin\alpha=\dfrac{${tri[0]}}{${tri[2]}}\) 可构造三边为 ${tri[0]},${tri[1]},${tri[2]} 的直角三角形，邻边为 \(\sqrt{${tri[2]}^2-${tri[0]}^2}=${tri[1]}\)，故 \(\tan\alpha=\dfrac{${tri[0]}}{${tri[1]}}\)。`
        };
      } },
      { level: 'basic', type: 'fill', make(r) {
        const c = ri(r, 4, 20) * 2;
        return {
          stem: String.raw`在 \(\text{Rt}\triangle ABC\) 中，\(\angle C=90^\circ\)，\(\angle A=30^\circ\)，斜边 \(AB=${c}\)，则 \(BC=\) ______。`,
          accept: [String(c / 2)],
          analysis: String.raw`\(30^\circ\) 角所对的直角边等于斜边的一半：\(BC=\dfrac12AB=${c / 2}\)。`
        };
      } },
      { level: 'advance', type: 'fill', make(r) {
        const tri = pick(r, [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25]]);
        return {
          stem: String.raw`已知锐角 \(\alpha\) 满足 \(\cos\alpha=\dfrac{${tri[1]}}{${tri[2]}}\)，则 \(\sin\alpha=\) ______。`,
          accept: [dfrac(tri[0], tri[2])],
          analysis: String.raw`\(\sin^2\alpha=1-\cos^2\alpha=1-\dfrac{${tri[1] * tri[1]}}{${tri[2] * tri[2]}}=\dfrac{${tri[0] * tri[0]}}{${tri[2] * tri[2]}}\)，锐角取正值得 \(\sin\alpha=\dfrac{${tri[0]}}{${tri[2]}}\)。`
        };
      } }
    ],

    /* ---------------- 平面向量 ---------------- */
    'g1-vector': [
      { level: 'basic', type: 'fill', make(r) {
        const x1 = ri(r, 1, 6) * (r() < .5 ? 1 : -1), y1 = ri(r, 1, 6);
        const x2 = ri(r, 1, 5), y2 = ri(r, 1, 6) * (r() < .5 ? 1 : -1);
        return {
          stem: String.raw`已知 \(\vec a=(${x1},${y1})\)，\(\vec b=(${x2},${y2})\)，则 \(\vec a\cdot\vec b=\) ______。`,
          accept: [String(x1 * x2 + y1 * y2)],
          analysis: String.raw`\(\vec a\cdot\vec b=x_1x_2+y_1y_2=${x1}\times${x2}+${y1}\times${y2}=${x1 * x2 + y1 * y2}\)。`
        };
      } },
      { level: 'basic', type: 'choice', make(r) {
        const m = pick(r, [2, 4, 5]), k2 = m * ri(r, 1, 4), k = -k2 / m;
        const o = opts4(r, String(k), [String(-k), String(m / k2), String(k2 / m)]);
        return {
          stem: String.raw`若 \(\vec a=(1,k)\) 与 \(\vec b=(${k2},${m})\) 垂直，则实数 \(k\) 的值为（　　）`,
          options: o.options, answer: o.answer,
          analysis: String.raw`垂直条件 \(x_1x_2+y_1y_2=0\)：${k2}+${m}k=0，解得 \(k=${k}\)。`
        };
      } },
      { level: 'advance', type: 'fill', make(r) {
        const tri = pick(r, [[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17]]);
        return {
          stem: String.raw`已知 \(\vec a=(${tri[0]},${tri[1]})\)，则 \(|\vec a|=\) ______。`,
          accept: [String(tri[2])],
          analysis: String.raw`\(|\vec a|=\sqrt{${tri[0]}^2+${tri[1]}^2}=\sqrt{${tri[2] * tri[2]}}=${tri[2]}\)。`
        };
      } }
    ],

    /* ---------------- 立体几何初步 ---------------- */
    'g1-solid': [
      { level: 'basic', type: 'fill', make(r) {
        const a = pick(r, [3, 6]), h = ri(r, 2, 9);
        return {
          stem: String.raw`正四棱锥底面边长为 ${a}，高为 ${h}，其体积为 ______。`,
          accept: [String(a * a * h / 3)],
          analysis: String.raw`\(V=\dfrac13Sh=\dfrac13\times${a}^2\times${h}=${a * a * h / 3}\)，注意别漏 \(\dfrac13\)。`
        };
      } },
      { level: 'basic', type: 'choice', make(r) {
        const R = pick(r, [3, 6]), get = 4 / 3 * R * R * R;
        const o = opts4(r, `${get}π`, [`${4 * R * R}π`, `${R * R * R}π`, `${get / 2}π`]);
        return {
          stem: String.raw`半径为 ${R} 的球的体积是（　　）`,
          options: o.options, answer: o.answer,
          analysis: String.raw`\(V=\dfrac43\pi R^3=\dfrac43\pi\times${R}^3=${get}\pi\)。`
        };
      } },
      { level: 'advance', type: 'fill', make(r) {
        const a = ri(r, 2, 8);
        return {
          stem: String.raw`棱长为 ${a} 的正方体的体对角线长为 ______（用根号表示）。`,
          accept: [`${a}√3`, `${a}\\sqrt{3}`],
          analysis: String.raw`体对角线 \(=\sqrt{a^2+a^2+a^2}=a\sqrt3=${a}\sqrt3\)。`
        };
      } },
      { level: 'basic', type: 'fill', make(r) {
        const rr = pick(r, [3, 6]), h = ri(r, 2, 9), v = rr * rr * h / 3;
        return {
          stem: String.raw`底面半径为 ${rr}、高为 ${h} 的圆锥，体积为 ______（保留 \(\pi\)）。`,
          accept: [`${v}π`, `${v}π`],
          analysis: String.raw`\(V=\dfrac13\pi r^2h=\dfrac13\pi\times${rr * rr}\times${h}=${v}\pi\)。`
        };
      } },
      { level: 'basic', type: 'fill', make(r) {
        const a = ri(r, 2, 6), b = ri(r, 2, 6), c = ri(r, 2, 6);
        return {
          stem: String.raw`长、宽、高分别为 ${a}、${b}、${c} 的长方体，体积为 ______。`,
          accept: [String(a * b * c)],
          analysis: String.raw`\(V=abc=${a}\times${b}\times${c}=${a * b * c}\)。`
        };
      } }
    ],

    /* ---------------- 直线与圆的方程 ---------------- */
    'g2-line': [
      { level: 'basic', type: 'fill', make(r) {
        const x1 = ri(r, 1, 4), y1 = ri(r, 1, 4), dx = ri(r, 1, 3), dy = dx * ri(r, 1, 3);
        return {
          stem: String.raw`过点 \(A(${x1},${y1})\)、\(B(${x1 + dx},${y1 + dy})\) 的直线斜率为 ______。`,
          accept: [String(dy / dx)],
          analysis: String.raw`\(k=\dfrac{y_2-y_1}{x_2-x_1}=\dfrac{${dy}}{${dx}}=${dy / dx}\)。`
        };
      } },
      { level: 'basic', type: 'choice', make(r) {
        const d = ri(r, 2, 9), c = d * 5;
        const o = opts4(r, String(d), [String(d * 5), String(d + 1), String(d / 5)]);
        return {
          stem: String.raw`原点 \((0,0)\) 到直线 \(3x+4y-${c}=0\) 的距离是（　　）`,
          options: o.options, answer: o.answer,
          analysis: String.raw`\(d=\dfrac{|3\times0+4\times0-${c}|}{\sqrt{3^2+4^2}}=\dfrac{${c}}{5}=${d}\)。`
        };
      } },
      { level: 'advance', type: 'fill', make(r) {
        const t = pick(r, [[5, 3, 4], [5, 4, 3], [13, 5, 12], [10, 6, 8]]);
        const r0 = t[0], d = t[1], half = t[2];
        return {
          stem: String.raw`圆 \(x^2+y^2=${r0 * r0}\) 的圆心到某直线距离为 ${d}，则直线被圆截得的弦长为 ______。`,
          accept: [String(2 * half)],
          analysis: String.raw`\(|AB|=2\sqrt{r^2-d^2}=2\sqrt{${r0 * r0}-${d * d}}=2\times${half}=${2 * half}\)。`
        };
      } }
    ],

    /* ---------------- 排列组合与二项式 ---------------- */
    'g2-count': [
      { level: 'basic', type: 'fill', make(r) {
        const n = ri(r, 4, 9);
        return {
          stem: String.raw`\(C_${n}^2=\) ______。`,
          accept: [String(n * (n - 1) / 2)],
          analysis: String.raw`\(C_${n}^2=\dfrac{${n}\times${n - 1}}{2}=${n * (n - 1) / 2}\)。`
        };
      } },
      { level: 'basic', type: 'choice', make(r) {
        const n = ri(r, 4, 7), v = n * (n - 1);
        const o = opts4(r, String(v), [String(v / 2), String(v * 2), String(v + n)]);
        return {
          stem: String.raw`\(A_${n}^2\) 的值是（　　）`,
          options: o.options, answer: o.answer,
          analysis: String.raw`\(A_${n}^2=${n}\times${n - 1}=${v}\)（排列有顺序，不除以 2）。`
        };
      } },
      { level: 'advance', type: 'fill', make(r) {
        const n = ri(r, 3, 6);
        let f = 1; for (let i = 2; i <= n - 1; i++) f *= i;
        return {
          stem: String.raw`${n} 人排成一排，其中甲、乙必须相邻，共有 ______ 种排法。`,
          accept: [String(f * 2)],
          analysis: String.raw`捆绑法：甲乙整体与其余 ${n - 2} 人共 ${n - 1} 个元素排列 \(A_${n - 1}^{${n - 1}}=${f}\)，甲乙内部 \(A_2^2=2\)，故共 ${f * 2} 种。`
        };
      } },
      { level: 'basic', type: 'fill', make(r) {
        const m = ri(r, 2, 6), n = ri(r, 2, 5);
        return {
          stem: String.raw`从甲地到乙地有 ${m} 条路，从乙地到丙地有 ${n} 条路，则从甲地经乙地到丙地共有 ______ 种走法。`,
          accept: [String(m * n)],
          analysis: String.raw`分步乘法计数原理：\(${m}\times${n}=${m * n}\) 种。`
        };
      } },
      { level: 'advance', type: 'fill', make(r) {
        const n = ri(r, 3, 8);
        return {
          stem: String.raw`\((x+1)^{${n}}\) 展开式中 \(x^2\) 的系数是 ______。`,
          accept: [String(n * (n - 1) / 2)],
          analysis: String.raw`由通项 \(T_{r+1}=C_${n}^r x^{${n}-r}\)，令 ${n}-r=2 得 \(r=${n - 2}\)，系数为 \(C_${n}^{${n - 2}}=${n * (n - 1) / 2}\)。`
        };
      } },
      { level: 'advance', type: 'fill', make(r) {
        const n = ri(r, 5, 10), v = n * (n - 1) * (n - 2) / 6;
        return {
          stem: String.raw`从 ${n} 名同学中任选 3 名参加活动，共有 ______ 种不同的选法。`,
          accept: [String(v)],
          analysis: String.raw`选人不讲顺序，用组合数：\(C_${n}^3=\dfrac{${n}\times${n - 1}\times${n - 2}}{6}=${v}\)。`
        };
      } },
      { level: 'advance', type: 'fill', make(r) {
        const n = ri(r, 4, 8), v = n * (n - 1) * (n - 2);
        return {
          stem: String.raw`从 ${n} 名同学中选 3 名分别担任班长、学习委员、体育委员，共有 ______ 种不同安排。`,
          accept: [String(v)],
          analysis: String.raw`担任不同职务有顺序，用排列数：\(A_${n}^3=${n}\times${n - 1}\times${n - 2}=${v}\)。`
        };
      } }
    ],

    /* ---------------- 随机变量及其分布 ---------------- */
    'g3-random': [
      { level: 'basic', type: 'fill', make(r) {
        const n = ri(r, 3, 10), p = pick(r, ['0.2', '0.4', '0.5', '0.6']); 
        return {
          stem: String.raw`若 \(X\sim B(${n},${p})\)，则 \(E(X)=\) ______。`,
          accept: [String(Math.round(n * parseFloat(p) * 100) / 100)],
          analysis: String.raw`二项分布期望 \(E(X)=np=${n}\times${p}=${Math.round(n * parseFloat(p) * 100) / 100}\)。`
        };
      } },
      { level: 'basic', type: 'choice', make(r) {
        const a = ri(r, 2, 4), d = ri(r, 1, 6);
        const o = opts4(r, String(a * a * d), [String(a * d + 1), String(a * d), String(d)]);
        return {
          stem: String.raw`已知 \(D(X)=${d}\)，则 \(D(${a}X+1)\) 等于（　　）`,
          options: o.options, answer: o.answer,
          analysis: String.raw`\(D(aX+b)=a^2D(X)=${a}^2\times${d}=${a * a * d}\)，加常数不改变方差。`
        };
      } },
      { level: 'advance', type: 'fill', make(r) {
        const p = pick(r, ['0.2', '0.3', '0.4', '0.5']);
        const v = Math.round(parseFloat(p) * (1 - parseFloat(p)) * 100) / 100;
        return {
          stem: String.raw`若 \(X\) 服从两点分布且 \(P(X=1)=${p}\)，则 \(D(X)=\) ______。`,
          accept: [String(v)],
          analysis: String.raw`两点分布 \(D(X)=p(1-p)=${p}\times${Math.round((1 - parseFloat(p)) * 10) / 10}=${v}\)。`
        };
      } }
    ],

    /* ---------------- 复数 ---------------- */
    'g3-complex': [
      { level: 'basic', type: 'fill', make(r) {
        const tri = pick(r, [[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17]]);
        const b = r() < .5 ? tri[1] : -tri[1];
        return {
          stem: String.raw`复数 \(z=${tri[0]}${b > 0 ? '+' : '-'}${Math.abs(b)}i\) 的模 \(|z|=\) ______。`,
          accept: [String(tri[2])],
          analysis: String.raw`\(|z|=\sqrt{${tri[0]}^2+(${b})^2}=${tri[2]}\)。`
        };
      } },
      { level: 'basic', type: 'choice', make(r) {
        const n = ri(r, 5, 30), m = n % 4, val = ['1', 'i', '-1', '-i'][m];
        const o = opts4(r, val, ['1', 'i', '-1', '-i']);
        return {
          stem: String.raw`\(i^{${n}}=\) （　　）`,
          options: o.options, answer: o.answer,
          analysis: String.raw`${n}=4\times${Math.floor(n / 4)}+${m}，由 \(i\) 的周期性得 \(i^{${n}}=i^{${m}}=${val}\)。`
        };
      } },
      { level: 'advance', type: 'fill', make(r) {
        const a = ri(r, 1, 6), b = ri(r, 1, 6);
        return {
          stem: String.raw`计算 \((${a}+${b}i)(${a}-${b}i)=\) ______。`,
          accept: [String(a * a + b * b)],
          analysis: String.raw`\(z\bar z=|z|^2=${a}^2+${b}^2=${a * a + b * b}\)，结果为实数。`
        };
      } }
    ]
  };
};
