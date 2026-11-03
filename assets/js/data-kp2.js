/* ============================================================
   data-kp2.js · 知识点资料（高中：高一 / 高二 / 高三）
   ============================================================ */

const KP_PART2 = [
  /* ===== 高一 ===== */
  {
    id: 'g1-set',
    grade: 'g1',
    title: '集合与函数概念',
    versions: ['人教版', '北师大版', '苏教版', '沪教版'],
    tags: ['集合', '函数', '入门'],
    summary: '高中数学的第一课：用集合的语言描述世界，用映射的观点定义函数。',
    concept: String.raw`
<h4>一、集合</h4>
<p>集合是"一些确定对象的总体"。元素与集合的关系用 \(\in\) 或 \(\notin\) 表示；集合之间用 \(\subseteq,\ \subsetneq,\ \cup,\ \cap,\ \complement\) 连接。</p>
<ul class="ticks">
  <li>三大特性：<b>确定性、互异性、无序性</b>。其中"互异性"最常被考：集合中元素不能重复。</li>
  <li>\(A\cap B\)：既在 \(A\) 又在 \(B\) 的元素；\(A\cup B\)：在 \(A\) 或在 \(B\) 的元素。</li>
  <li>补集 \(\complement_U A\)：在全集 \(U\) 中但不在 \(A\) 中的元素。</li>
  <li>若 \(A\subseteq B\)，则 \(A\cap B=A\)，\(A\cup B=B\)。</li>
</ul>
<div class="note-box red"><b class="h">空集陷阱</b>讨论含参数的子集问题时（尤其 \(A\subseteq B\)），必须单独考虑 \(A=\varnothing\) 的情形。</div>
<h4>二、函数概念</h4>
<p>设 \(A,B\) 是非空数集，若对 \(A\) 中<b>任意一个</b> \(x\)，按某种对应关系 \(f\)，在 \(B\) 中都有<b>唯一确定</b>的 \(y\) 与之对应，则称 \(f:A\to B\) 为函数，记作 \(y=f(x)\)。</p>
<ul class="ticks">
  <li>定义域：自变量 \(x\) 的取值范围；值域：函数值的集合。</li>
  <li>同一函数的判定：<b>定义域相同</b>且<b>对应关系相同</b>（与用什么字母无关）。</li>
  <li>常见定义域限制：分母不为 0；偶次根号下非负；对数真数大于 0。</li>
</ul>
<h4>三、单调性与奇偶性</h4>
<ul class="ticks">
  <li>\(f\) 在区间 \(D\) 上单调递增 \(\Leftrightarrow x_1\lt x_2\Rightarrow f(x_1)\lt f(x_2)\)。</li>
  <li>奇函数 \(f(-x)=-f(x)\)（图象关于原点对称）；偶函数 \(f(-x)=f(x)\)（关于 \(y\) 轴对称）。</li>
  <li>判断奇偶性的第一步永远是：<b>先看定义域是否关于原点对称</b>。</li>
</ul>
`,
    examples: [
      {
        title: '例题 1 · 含参数的集合',
        body: String.raw`已知 \(A=\{x\mid x^2-3x+2=0\}\)，\(B=\{x\mid ax-1=0\}\)，且 \(B\subseteq A\)，求 \(a\)。`,
        steps: [
          String.raw`\(A=\{1,2\}\)。当 \(a=0\) 时，方程无解，\(B=\varnothing\)，满足 \(\varnothing\subseteq A\)。`,
          String.raw`当 \(a\neq0\) 时，\(B=\left\{\dfrac1a\right\}\)，需 \(\dfrac1a=1\) 或 \(2\)，得 \(a=1\) 或 \(a=\dfrac12\)。`,
          String.raw`综上：\(a=0,\ 1,\ \dfrac12\)。`
        ]
      },
      {
        title: '例题 2 · 定义域',
        body: String.raw`求 \(f(x)=\dfrac{\sqrt{x+2}}{\ln(3-x)}\) 的定义域。`,
        steps: [
          String.raw`根号要求 \(x+2\ge0\Rightarrow x\ge -2\)。`,
          String.raw`对数要求 \(3-x\gt 0\Rightarrow x\lt 3\)；对数作分母还要求 \(\ln(3-x)\ne0\Rightarrow x\ne2\)。`,
          String.raw`取交集：\([-2,2)\cup(2,3)\)。`
        ]
      },
      {
        title: '例题 3 · 判断奇偶性',
        body: String.raw`判断 \(f(x)=\dfrac{x}{1+x^2}\) 的奇偶性。`,
        steps: [
          String.raw`定义域为 \(\mathbb{R}\)，关于原点对称。`,
          String.raw`\(f(-x)=\dfrac{-x}{1+(-x)^2}=-\dfrac{x}{1+x^2}=-f(x)\)，故为奇函数。`
        ]
      }
    ],
    formulas: [
      { f: String.raw`A\cap B=\{x\mid x\in A\ \text{且}\ x\in B\}`, d: '交集' },
      { f: String.raw`A\cup B=\{x\mid x\in A\ \text{或}\ x\in B\}`, d: '并集' },
      { f: String.raw`\complement_U A=\{x\in U\mid x\notin A\}`, d: '补集' },
      { f: String.raw`\mathrm{card}(A\cup B)=\mathrm{card}A+\mathrm{card}B-\mathrm{card}(A\cap B)`, d: '容斥原理' },
      { f: String.raw`f(-x)=-f(x)\ (\text{奇}),\quad f(-x)=f(x)\ (\text{偶})`, d: '奇偶性定义式' },
      { f: String.raw`\dfrac{f(x_1)-f(x_2)}{x_1-x_2}>0\ \Rightarrow\ \text{单调递增}`, d: '单调性的代数表达' }
    ],
    pitfalls: [
      '子集问题忘记讨论空集，是本章第一大坑。',
      '集合中元素要满足互异性，求出参数后必须代回检验是否有重复元素。',
      '判断奇偶性前不看定义域是否关于原点对称，会直接判错。',
      String.raw`\(f(x)\) 与 \(f(x+1)\) 中的 \(x\) 不是同一个量；\(f(x+1)\) 的自变量仍是 \(x\)。`
    ],
    links: [{ name: '人教版教材电子版目录（站外）', url: 'https://jc.pep.com.cn/' }]
  },
  {
    id: 'g1-trig',
    grade: 'g1',
    title: '三角函数',
    versions: ['人教版', '北师大版', '苏教版'],
    tags: ['三角', '图象'],
    summary: '单位圆视角下的周期函数：诱导公式、图象变换与正余弦定理。',
    concept: String.raw`
<h4>一、任意角与弧度制</h4>
<ul class="ticks">
  <li>\(1\ \text{rad}=\dfrac{180^\circ}{\pi}\)，\(180^\circ=\pi\ \text{rad}\)；弧长 \(l=|\alpha|r\)，扇形面积 \(S=\dfrac12 lr=\dfrac12|\alpha|r^2\)。</li>
  <li>三角函数定义（单位圆）：角 \(\alpha\) 终边上一点 \(P(x,y)\)，\(r=\sqrt{x^2+y^2}\)，则 \(\sin\alpha=\dfrac yr,\ \cos\alpha=\dfrac xr,\ \tan\alpha=\dfrac yx\)。</li>
</ul>
<h4>二、同角关系与诱导公式</h4>
<ul class="ticks">
  <li>平方关系：\(\sin^2\alpha+\cos^2\alpha=1\)；商数关系：\(\tan\alpha=\dfrac{\sin\alpha}{\cos\alpha}\)。</li>
  <li>诱导公式口诀：<b>"奇变偶不变，符号看象限"</b>（针对 \(\dfrac{\pi}{2}\) 的奇数倍 / 偶数倍）。</li>
</ul>
<figure class="figure-box">
  <svg viewBox="0 0 320 250" xmlns="http://www.w3.org/2000/svg">
    <circle cx="150" cy="130" r="90" fill="none" stroke="#1e3ac6" stroke-width="2"/>
    <line x1="45" y1="130" x2="255" y2="130" stroke="#d5d5cf"/>
    <line x1="150" y1="25" x2="150" y2="235" stroke="#d5d5cf"/>
    <line x1="150" y1="130" x2="214" y2="74" stroke="#3355e6" stroke-width="2.5"/>
    <line x1="214" y1="130" x2="214" y2="74" stroke="#e04a12" stroke-width="1.5" stroke-dasharray="4 3"/>
    <circle cx="214" cy="74" r="4" fill="#e04a12"/>
    <path d="M 184 130 A 34 34 0 0 0 214 104" fill="none" stroke="#0f6b52" stroke-width="2"/>
    <text x="222" y="68" font-size="13" fill="#e04a12">P(cosα, sinα)</text>
    <text x="196" y="122" font-size="12" fill="#0f6b52">α</text>
    <text x="152" y="20" font-size="12" fill="#8b8b93">sin α</text>
    <text x="258" y="134" font-size="12" fill="#8b8b93">cos α</text>
  </svg>
  <figcaption>图 3 · 单位圆：三角函数值的几何直观</figcaption>
</figure>
<h4>三、图象与性质</h4>
<ul class="ticks">
  <li>\(y=A\sin(\omega x+\varphi)\)：振幅 \(A\)，周期 \(T=\dfrac{2\pi}{|\omega|}\)，相位 \(\omega x+\varphi\)，初相 \(\varphi\)。</li>
  <li>变换顺序：先平移（左加右减）再伸缩，或先伸缩再平移，两种方式的平移量不同。</li>
  <li>正弦定理 \(\dfrac{a}{\sin A}=\dfrac{b}{\sin B}=\dfrac{c}{\sin C}=2R\)；余弦定理 \(a^2=b^2+c^2-2bc\cos A\)。</li>
</ul>
`,
    examples: [
      {
        title: '例题 1 · 化简求值',
        body: String.raw`已知 \(\tan\alpha=2\)，求 \(\dfrac{\sin\alpha+2\cos\alpha}{3\sin\alpha-\cos\alpha}\)。`,
        steps: [
          String.raw`分子分母同除以 \(\cos\alpha\)：原式 \(=\dfrac{\tan\alpha+2}{3\tan\alpha-1}\)。`,
          String.raw`代入 \(\tan\alpha=2\)：\(\dfrac{2+2}{6-1}=\dfrac45\)。`
        ]
      },
      {
        title: '例题 2 · 图象变换',
        body: String.raw`由 \(y=\sin x\) 如何得到 \(y=2\sin\left(2x+\dfrac{\pi}{3}\right)\)？`,
        steps: [
          String.raw`法一：\(y=\sin x\xrightarrow{\text{左移}\frac{\pi}{3}}y=\sin\left(x+\dfrac{\pi}{3}\right)\xrightarrow{\text{横坐标缩为}\frac12}y=\sin\left(2x+\dfrac{\pi}{3}\right)\xrightarrow{\text{纵坐标伸为2倍}}y=2\sin\left(2x+\dfrac{\pi}{3}\right)\)。`,
          String.raw`法二：\(y=\sin x\xrightarrow{\text{横坐标缩为}\frac12}y=\sin 2x\xrightarrow{\text{左移}\frac{\pi}{6}}y=\sin\left(2x+\dfrac{\pi}{3}\right)\xrightarrow{\text{纵坐标伸为2倍}}y=2\sin\left(2x+\dfrac{\pi}{3}\right)\)。`
        ]
      }
    ],
    formulas: [
      { f: String.raw`\sin^2\alpha+\cos^2\alpha=1`, d: '同角基本关系（最常用）' },
      { f: String.raw`\sin(\alpha\pm\beta)=\sin\alpha\cos\beta\pm\cos\alpha\sin\beta`, d: '和差角公式' },
      { f: String.raw`\cos(\alpha\pm\beta)=\cos\alpha\cos\beta\mp\sin\alpha\sin\beta`, d: '和差余弦' },
      { f: String.raw`\sin2\alpha=2\sin\alpha\cos\alpha`, d: '二倍角正弦' },
      { f: String.raw`\cos2\alpha=\cos^2\alpha-\sin^2\alpha=2\cos^2\alpha-1`, d: '二倍角余弦（三种形式）' },
      { f: String.raw`T=\dfrac{2\pi}{|\omega|}`, d: '正弦型函数周期' },
      { f: String.raw`a^2=b^2+c^2-2bc\cos A`, d: '余弦定理' }
    ],
    pitfalls: [
      '诱导公式的符号判断必须"把 α 看成锐角"，否则符号极易出错。',
      String.raw`\(y=\sin\left(2x+\dfrac{\pi}{3}\right)\) 的初相是 \(\dfrac{\pi}{3}\)，但相对 \(y=\sin 2x\) 的平移量是 \(\dfrac{\pi}{6}\)，别混。`,
      '解三角形时注意"SSA 可能有两解"，要用大边对大角检验。',
      String.raw`\(\sin^2\alpha\) 要理解成 \((\sin\alpha)^2\)，不能当成 \(\sin(\alpha^2)\)。`
    ],
    links: []
  },
  {
    id: 'g1-explog',
    grade: 'g1',
    title: '指数函数与对数函数',
    versions: ['人教版', '北师大版', '苏教版'],
    tags: ['函数', '运算'],
    summary: '互为反函数的两个基本初等函数，是刻画增长与衰减的工具。',
    concept: String.raw`
<h4>一、指数运算</h4>
<ul class="ticks">
  <li>\(a^m\cdot a^n=a^{m+n}\)，\(\dfrac{a^m}{a^n}=a^{m-n}\)，\((a^m)^n=a^{mn}\)，\((ab)^n=a^nb^n\)。</li>
  <li>分数指数幂：\(a^{\frac mn}=\sqrt[n]{a^m}\)；\(a^{-n}=\dfrac{1}{a^n}\)。</li>
</ul>
<h4>二、指数函数 \(y=a^x\ (a\gt 0,\ a\ne1)\)</h4>
<ul class="ticks">
  <li>\(a\gt 1\) 时单调递增；\(0\lt a\lt 1\) 时单调递减。</li>
  <li>恒过定点 \((0,1)\)；值域为 \((0,+\infty)\)，图象在 \(x\) 轴上方。</li>
</ul>
<h4>三、对数运算与对数函数</h4>
<ul class="ticks">
  <li>运算律：\(\log_a(MN)=\log_aM+\log_aN\)；\(\log_a\dfrac MN=\log_aM-\log_aN\)；\(\log_aM^n=n\log_aM\)。</li>
  <li>换底公式：\(\log_ab=\dfrac{\log_cb}{\log_ca}\)；推论 \(\log_ab\cdot\log_ba=1\)。</li>
  <li>\(y=\log_ax\) 与 \(y=a^x\) 互为反函数，图象关于直线 \(y=x\) 对称，恒过点 \((1,0)\)。</li>
</ul>
<div class="note-box gold"><b class="h">比较大小的通用法</b>先看能否化为同底或同指数；不行就引入中间量（常用 0 或 1）搭桥。</div>
`,
    examples: [
      {
        title: '例题 1 · 对数运算',
        body: String.raw`计算：\(\log_2 8+\lg 25+\lg 4-\ln e^3\)。`,
        steps: [
          String.raw`\(\log_2 8=\log_2 2^3=3\)。`,
          String.raw`\(\lg25+\lg4=\lg(25\times4)=\lg100=2\)。`,
          String.raw`\(\ln e^3=3\)。故原式 \(=3+2-3=2\)。`
        ]
      },
      {
        title: '例题 2 · 比较大小',
        body: String.raw`比较 \(a=0.8^{0.7}\)，\(b=0.8^{0.9}\)，\(c=1.2^{0.8}\) 的大小。`,
        steps: [
          String.raw`\(y=0.8^x\) 单调递减，且 \(0.7\lt 0.9\)，故 \(a\gt b\)。`,
          String.raw`\(a=0.8^{0.7}\lt 0.8^0=1\)，而 \(c=1.2^{0.8}\gt 1.2^0=1\)。`,
          String.raw`所以 \(c\gt a\gt b\)。`
        ]
      }
    ],
    formulas: [
      { f: String.raw`a^{\frac mn}=\sqrt[n]{a^m}`, d: '分数指数幂' },
      { f: String.raw`\log_a(MN)=\log_aM+\log_aN`, d: '对数乘法法则（M,N>0）' },
      { f: String.raw`\log_ab=\dfrac{\log_cb}{\log_ca}`, d: '换底公式' },
      { f: String.raw`a^{\log_a N}=N`, d: '对数恒等式' },
      { f: String.raw`\log_{a^m}b^n=\dfrac{n}{m}\log_ab`, d: '常用推论' }
    ],
    pitfalls: [
      '对数运算必须保证真数大于 0，化简前先确定定义域。',
      String.raw`\(\log_a(M+N)\) 没有运算公式，千万别写成 \(\log_aM+\log_aN\)。`,
      String.raw`\(a\gt 1\) 时 \(a^x\) 与 \(\log_ax\) 都是增函数；\(0\lt a\lt 1\) 时都递减，方向一致。`
    ],
    links: []
  },

  /* ===== 高二 ===== */
  {
    id: 'g2-derivative',
    grade: 'g2',
    title: '导数及其应用',
    versions: ['人教版', '北师大版', '苏教版', '沪教版'],
    tags: ['导数', '压轴', '微积分'],
    summary: '用导数研究单调性、极值与最值，是高中数学最有力的通用工具。',
    concept: String.raw`
<h4>一、导数的定义与几何意义</h4>
<p>\(f'(x_0)=\lim\limits_{\Delta x\to0}\dfrac{f(x_0+\Delta x)-f(x_0)}{\Delta x}\)，几何上是曲线在点 \((x_0,f(x_0))\) 处<b>切线的斜率</b>。</p>
<h4>二、基本公式与运算法则</h4>
<ul class="ticks">
  <li>\((c)'=0\)，\((x^n)'=nx^{n-1}\)，\((\sin x)'=\cos x\)，\((\cos x)'=-\sin x\)。</li>
  <li>\((e^x)'=e^x\)，\((a^x)'=a^x\ln a\)，\((\ln x)'=\dfrac1x\)，\((\log_ax)'=\dfrac{1}{x\ln a}\)。</li>
  <li>四则运算：\((u\pm v)'=u'\pm v'\)，\((uv)'=u'v+uv'\)，\(\left(\dfrac uv\right)'=\dfrac{u'v-uv'}{v^2}\)。</li>
  <li>复合函数：\(y=f(g(x))\)，则 \(y'=f'(g(x))\cdot g'(x)\)（链式法则）。</li>
</ul>
<h4>三、用导数研究函数</h4>
<ul class="ticks">
  <li>\(f'(x)\gt 0\Rightarrow f\) 单调递增；\(f'(x)\lt 0\Rightarrow f\) 单调递减。</li>
  <li>\(f'(x_0)=0\) 只是极值的<b>必要</b>条件，还需判断两侧导数是否异号。</li>
  <li>求闭区间 \([a,b]\) 上最值：比较端点值与区间内所有极值。</li>
</ul>
<div class="note-box gold"><b class="h">标准解题流程</b>① 求定义域 → ② 求导并化简（尽量因式分解）→ ③ 解 \(f'(x)=0\) → ④ 列表分析符号 → ⑤ 下结论。</div>
`,
    examples: [
      {
        title: '例题 1 · 单调区间',
        body: String.raw`求 \(f(x)=x^3-3x^2-9x+5\) 的单调区间与极值。`,
        steps: [
          String.raw`\(f'(x)=3x^2-6x-9=3(x-3)(x+1)\)。`,
          String.raw`令 \(f'(x)=0\) 得 \(x=-1\) 或 \(x=3\)。`,
          String.raw`当 \(x\lt -1\) 或 \(x\gt 3\) 时 \(f'(x)\gt 0\)，递增；当 \(-1\lt x\lt 3\) 时 \(f'(x)\lt 0\)，递减。`,
          String.raw`极大值 \(f(-1)=10\)，极小值 \(f(3)=-22\)。`
        ]
      },
      {
        title: '例题 2 · 切线方程',
        body: String.raw`求曲线 \(y=x^3\) 在点 \((1,1)\) 处的切线方程。`,
        steps: [
          String.raw`\(y'=3x^2\)，在 \(x=1\) 处斜率为 \(3\)。`,
          String.raw`切线：\(y-1=3(x-1)\)，即 \(y=3x-2\)。`
        ]
      },
      {
        title: '例题 3 · 恒成立问题',
        body: String.raw`若 \(f(x)=x^2+a\ln x\) 在 \([1,e]\) 上单调递增，求 \(a\) 的取值范围。`,
        steps: [
          String.raw`\(f'(x)=2x+\dfrac ax=\dfrac{2x^2+a}{x}\)，在 \([1,e]\) 上 \(x\gt 0\)。`,
          String.raw`需 \(2x^2+a\ge0\) 恒成立，即 \(a\ge -2x^2\) 对所有 \(x\in[1,e]\) 成立。`,
          String.raw`\(-2x^2\) 在 \([1,e]\) 上的最大值为 \(-2\)，故 \(a\ge-2\)。`
        ]
      }
    ],
    formulas: [
      { f: String.raw`f'(x_0)=\lim_{\Delta x\to0}\dfrac{f(x_0+\Delta x)-f(x_0)}{\Delta x}`, d: '导数定义' },
      { f: String.raw`(x^n)'=nx^{n-1},\quad (e^x)'=e^x,\quad (\ln x)'=\dfrac1x`, d: '三个核心公式' },
      { f: String.raw`(uv)'=u'v+uv',\quad \left(\dfrac{u}{v}\right)'=\dfrac{u'v-uv'}{v^2}`, d: '乘除法则' },
      { f: String.raw`[f(g(x))]'=f'(g(x))g'(x)`, d: '链式法则' },
      { f: String.raw`k_{\text{切}}=f'(x_0)`, d: '切线斜率' },
      { f: String.raw`f'(x)\ge0\ \text{恒成立}\ \Leftrightarrow\ \text{单调递增}`, d: '恒成立与单调性的转化' }
    ],
    pitfalls: [
      '求导后忘记写定义域，尤其含对数、分母时。',
      String.raw`\(f'(x_0)=0\) 不等于有极值（如 \(y=x^3\) 在 \(x=0\) 处），必须检验两侧变号。`,
      '复合函数求导漏乘内层导数，是最常见计算失误。',
      '恒成立问题要分清"对任意 x"还是"存在 x"，前者取最值上界，后者取下界。'
    ],
    links: []
  },
  {
    id: 'g2-sequence',
    grade: 'g2',
    title: '数列',
    versions: ['人教版', '北师大版', '苏教版', '沪教版'],
    tags: ['数列', '求和'],
    summary: '等差与等比两大模型，配上错位相减、裂项等求和技巧。',
    concept: String.raw`
<h4>一、等差数列</h4>
<ul class="ticks">
  <li>通项 \(a_n=a_1+(n-1)d\)；前 \(n\) 项和 \(S_n=\dfrac{n(a_1+a_n)}{2}=na_1+\dfrac{n(n-1)}{2}d\)。</li>
  <li>性质：若 \(m+n=p+q\)，则 \(a_m+a_n=a_p+a_q\)。</li>
</ul>
<h4>二、等比数列</h4>
<ul class="ticks">
  <li>通项 \(a_n=a_1q^{n-1}\)；前 \(n\) 项和 \(S_n=\begin{cases}na_1,&q=1\\ \dfrac{a_1(1-q^n)}{1-q},&q\ne1\end{cases}\)。</li>
  <li>\(S_n\) 关于 \(n\) 的图象：等差是抛物线型（二次、无常数项），等比是指数型。</li>
</ul>
<h4>三、求通项的常用方法</h4>
<ul class="ticks">
  <li>公式法、累加法（\(a_{n+1}-a_n=f(n)\)）、累乘法（\(\dfrac{a_{n+1}}{a_n}=f(n)\)）。</li>
  <li>构造法：\(a_{n+1}=pa_n+q\Rightarrow\) 化为等比数列。</li>
  <li>利用 \(a_n=\begin{cases}S_1,&n=1\\S_n-S_{n-1},&n\ge2\end{cases}\)。</li>
</ul>
<h4>四、求和技巧</h4>
<ul class="ticks">
  <li><b>错位相减</b>：等差 × 等比型。</li>
  <li><b>裂项相消</b>：\(\dfrac{1}{n(n+1)}=\dfrac1n-\dfrac{1}{n+1}\)。</li>
  <li><b>分组求和、倒序相加</b>。</li>
</ul>
`,
    examples: [
      {
        title: '例题 1 · 错位相减',
        body: String.raw`求和：\(S_n=1\cdot2+2\cdot2^2+3\cdot2^3+\cdots+n\cdot2^n\)。`,
        steps: [
          String.raw`\(S_n=1\cdot2+2\cdot2^2+\cdots+n\cdot2^n\)。`,
          String.raw`两边乘公比 2：\(2S_n=1\cdot2^2+2\cdot2^3+\cdots+n\cdot2^{n+1}\)。`,
          String.raw`相减：\(-S_n=2+2^2+\cdots+2^n-n\cdot2^{n+1}=\dfrac{2(2^n-1)}{2-1}-n\cdot2^{n+1}\)。`,
          String.raw`故 \(S_n=(n-1)2^{n+1}+2\)。`
        ]
      },
      {
        title: '例题 2 · 由 Sn 求 an',
        body: String.raw`已知 \(S_n=2n^2+3n\)，求 \(a_n\)。`,
        steps: [
          String.raw`\(n=1\) 时，\(a_1=S_1=5\)。`,
          String.raw`\(n\ge2\) 时，\(a_n=S_n-S_{n-1}=2n^2+3n-[2(n-1)^2+3(n-1)]=4n+1\)。`,
          String.raw`\(n=1\) 代入 \(4n+1\) 得 5，与 \(a_1\) 一致，故 \(a_n=4n+1\)。`
        ]
      }
    ],
    formulas: [
      { f: String.raw`a_n=a_1+(n-1)d`, d: '等差通项' },
      { f: String.raw`S_n=\dfrac{n(a_1+a_n)}{2}`, d: '等差前 n 项和' },
      { f: String.raw`a_n=a_1q^{n-1}`, d: '等比通项' },
      { f: String.raw`S_n=\dfrac{a_1(1-q^n)}{1-q}\ (q\ne1)`, d: '等比前 n 项和' },
      { f: String.raw`\dfrac{1}{n(n+1)}=\dfrac1n-\dfrac{1}{n+1}`, d: '裂项基本型' },
      { f: String.raw`a_n=\begin{cases}S_1,&n=1\\S_n-S_{n-1},&n\ge2\end{cases}`, d: '由前 n 项和求通项' }
    ],
    pitfalls: [
      String.raw`由 \(S_n\) 求 \(a_n\) 时，\(n=1\) 必须单独验证，这是最高频失分点。`,
      String.raw`等比数列求和必须讨论 \(q=1\) 与 \(q\ne1\)。`,
      String.raw`错位相减最后一步的系数容易算错，务必用 \(n=1,2\) 代回检验。`,
      String.raw`等差数列前 \(n\) 项和形如 \(S_n=An^2+Bn\)（无常数项），据此可快速反推 \(a_1,d\)。`
    ],
    links: []
  },
  {
    id: 'g2-conic',
    grade: 'g2',
    title: '圆锥曲线',
    versions: ['人教版', '北师大版', '苏教版'],
    tags: ['解析几何', '压轴'],
    summary: '用代数方程研究几何图形，核心方法是"联立 + 韦达定理"。',
    concept: String.raw`
<h4>一、三种曲线的标准方程</h4>
<ul class="ticks">
  <li>椭圆：\(\dfrac{x^2}{a^2}+\dfrac{y^2}{b^2}=1\ (a\gt b\gt 0)\)，\(c^2=a^2-b^2\)，离心率 \(e=\dfrac ca\in(0,1)\)。</li>
  <li>双曲线：\(\dfrac{x^2}{a^2}-\dfrac{y^2}{b^2}=1\)，\(c^2=a^2+b^2\)，\(e=\dfrac ca\gt 1\)，渐近线 \(y=\pm\dfrac bax\)。</li>
  <li>抛物线：\(y^2=2px\ (p\gt 0)\)，焦点 \(\left(\dfrac p2,0\right)\)，准线 \(x=-\dfrac p2\)。</li>
</ul>
<h4>二、通用解法：设而不求</h4>
<ul class="ticks">
  <li>设直线 \(y=kx+m\)，与曲线联立消元，得到一元二次方程。</li>
  <li>用<b>韦达定理</b>表示 \(x_1+x_2\)、\(x_1x_2\)，再代入所求式子——这就是"设而不求"。</li>
  <li>不要忘记 \(\Delta\gt 0\) 的检验与 \(k\) 不存在（直线垂直于 \(x\) 轴）的分类讨论。</li>
</ul>
<div class="note-box jade"><b class="h">弦长公式</b>\(|AB|=\sqrt{1+k^2}\,|x_1-x_2|=\sqrt{1+k^2}\sqrt{(x_1+x_2)^2-4x_1x_2}\)。</div>
`,
    examples: [
      {
        title: '例题 1 · 求离心率',
        body: String.raw`椭圆 \(\dfrac{x^2}{a^2}+\dfrac{y^2}{b^2}=1\) 中，若短轴长与焦距相等，求离心率。`,
        steps: [
          String.raw`短轴长 \(2b\)，焦距 \(2c\)，由题意 \(2b=2c\Rightarrow b=c\)。`,
          String.raw`又 \(a^2=b^2+c^2=2c^2\)，故 \(e=\dfrac ca=\dfrac{c}{\sqrt2c}=\dfrac{\sqrt2}{2}\)。`
        ]
      },
      {
        title: '例题 2 · 弦长计算',
        body: String.raw`直线 \(y=x-1\) 与抛物线 \(y^2=4x\) 交于 \(A,B\)，求 \(|AB|\)。`,
        steps: [
          String.raw`联立：\((x-1)^2=4x\Rightarrow x^2-6x+1=0\)，故 \(x_1+x_2=6,\ x_1x_2=1\)。`,
          String.raw`\(|x_1-x_2|=\sqrt{36-4}=\sqrt{32}=4\sqrt2\)。`,
          String.raw`\(|AB|=\sqrt{1+1^2}\cdot4\sqrt2=8\)。`
        ]
      }
    ],
    formulas: [
      { f: String.raw`\dfrac{x^2}{a^2}+\dfrac{y^2}{b^2}=1,\quad c^2=a^2-b^2`, d: '椭圆' },
      { f: String.raw`\dfrac{x^2}{a^2}-\dfrac{y^2}{b^2}=1,\quad c^2=a^2+b^2`, d: '双曲线' },
      { f: String.raw`y^2=2px,\quad F\left(\dfrac p2,0\right),\quad x=-\dfrac p2`, d: '抛物线（p>0）' },
      { f: String.raw`e=\dfrac ca`, d: '离心率：椭圆 <1，双曲线 >1，抛物线 =1' },
      { f: String.raw`|AB|=\sqrt{1+k^2}\,|x_1-x_2|`, d: '弦长公式' }
    ],
    pitfalls: [
      '联立后必须检验 Δ>0，尤其在求参数范围的问题中。',
      '设直线为 y=kx+m 时，要单独讨论斜率不存在的情形。',
      String.raw`椭圆中 \(a\) 最大且 \(a^2=b^2+c^2\)；双曲线中 \(c\) 最大且 \(c^2=a^2+b^2\)，别记反。`,
      '焦点在 x 轴还是 y 轴，要看分母的大小，而不是看 a、b 的字母。'
    ],
    links: []
  },

  /* ===== 高三 ===== */
  {
    id: 'g3-probability',
    grade: 'g3',
    title: '概率与统计',
    versions: ['人教版', '北师大版', '苏教版', '沪教版'],
    tags: ['概率', '统计', '分布'],
    summary: '从古典概型到分布列与期望，把随机现象用数学语言量化。',
    concept: String.raw`
<h4>一、概率基础</h4>
<ul class="ticks">
  <li>古典概型：\(P(A)=\dfrac{\text{事件}A\text{包含的基本事件数}}{\text{基本事件总数}}\)。</li>
  <li>互斥事件加法：\(P(A\cup B)=P(A)+P(B)\)；对立事件：\(P(\bar A)=1-P(A)\)。</li>
  <li>独立事件乘法：\(P(AB)=P(A)P(B)\)；条件概率 \(P(B\mid A)=\dfrac{P(AB)}{P(A)}\)。</li>
</ul>
<h4>二、随机变量与分布</h4>
<ul class="ticks">
  <li>二项分布 \(X\sim B(n,p)\)：\(P(X=k)=C_n^kp^k(1-p)^{n-k}\)，\(E(X)=np\)，\(D(X)=np(1-p)\)。</li>
  <li>超几何分布（不放回抽样）：\(P(X=k)=\dfrac{C_M^kC_{N-M}^{n-k}}{C_N^n}\)。</li>
  <li>正态分布 \(N(\mu,\sigma^2)\)：图象关于 \(x=\mu\) 对称，\(P(\mu-\sigma\lt X\lt \mu+\sigma)\approx0.6827\)。</li>
</ul>
<h4>三、统计</h4>
<ul class="ticks">
  <li>分层抽样按比例分配；频率分布直方图中所有小矩形面积之和为 1。</li>
  <li>线性回归：\(\hat b=\dfrac{\sum(x_i-\bar x)(y_i-\bar y)}{\sum(x_i-\bar x)^2}\)，\(\hat a=\bar y-\hat b\bar x\)。</li>
</ul>
<div class="note-box gold"><b class="h">判定口诀</b>有放回 / 独立重复 → 二项分布；不放回 / 抽次品 → 超几何分布。</div>
`,
    examples: [
      {
        title: '例题 1 · 分布列与期望',
        body: String.raw`某人投篮命中率为 0.6，独立投篮 3 次，求命中次数 \(X\) 的分布列与期望。`,
        steps: [
          String.raw`\(X\sim B(3,0.6)\)。`,
          String.raw`\(P(X=k)=C_3^k0.6^k0.4^{3-k}\)：\(P(0)=0.064,\ P(1)=0.288,\ P(2)=0.432,\ P(3)=0.216\)。`,
          String.raw`\(E(X)=np=3\times0.6=1.8\)。`
        ]
      },
      {
        title: '例题 2 · 对立事件',
        body: String.raw`三人独立破译同一密码，各自成功率为 \(\dfrac13,\dfrac14,\dfrac15\)，求密码被破译的概率。`,
        steps: [
          String.raw`用对立事件：\(P=1-P(\text{三人都不成功})\)。`,
          String.raw`\(P=1-\dfrac23\cdot\dfrac34\cdot\dfrac45=1-\dfrac{2}{5}=\dfrac35\)。`
        ]
      }
    ],
    formulas: [
      { f: String.raw`P(A)=\dfrac{m}{n}`, d: '古典概型' },
      { f: String.raw`P(B\mid A)=\dfrac{P(AB)}{P(A)}`, d: '条件概率' },
      { f: String.raw`P(X=k)=C_n^kp^k(1-p)^{n-k}`, d: '二项分布' },
      { f: String.raw`E(X)=np,\quad D(X)=np(1-p)`, d: '二项分布的期望与方差' },
      { f: String.raw`E(aX+b)=aE(X)+b,\quad D(aX+b)=a^2D(X)`, d: '线性变换性质' }
    ],
    pitfalls: [
      '"至少有一个"类问题优先用对立事件，能大幅简化计算。',
      '二项分布与超几何分布混淆：关键看"有放回还是不放回"。',
      '分布列最后必须检验所有概率之和是否为 1。',
      '独立性检验题目中比较的是 K² 与临界值，不是直接比概率。'
    ],
    links: []
  },
  {
    id: 'g3-inequality',
    grade: 'g3',
    title: '不等式与恒成立问题',
    versions: ['人教版', '北师大版', '苏教版'],
    tags: ['不等式', '最值', '压轴'],
    summary: '均值不等式与导数结合，解决"恒成立 / 存在性"这一高考压轴题型。',
    concept: String.raw`
<h4>一、基本不等式</h4>
<ul class="ticks">
  <li>\(a+b\ge2\sqrt{ab}\ (a,b\gt 0)\)，当且仅当 \(a=b\) 时取等号。</li>
  <li>变形：\(ab\le\left(\dfrac{a+b}{2}\right)^2\)；\(\dfrac{a^2+b^2}{2}\ge\left(\dfrac{a+b}{2}\right)^2\)。</li>
  <li>三个正数的均值不等式：\(a+b+c\ge3\sqrt[3]{abc}\)。</li>
</ul>
<div class="note-box red"><b class="h">"一正二定三相等"</b>用基本不等式求最值必须检验：各项为正、和或积为定值、等号能取到。</div>
<h4>二、恒成立与存在性</h4>
<ul class="ticks">
  <li>\(\forall x\in D,\ f(x)\ge a\ \Leftrightarrow\ f(x)_{\min}\ge a\)。</li>
  <li>\(\exists x\in D,\ f(x)\ge a\ \Leftrightarrow\ f(x)_{\max}\ge a\)。</li>
  <li>\(f(x)\ge g(x)\) 恒成立 \(\Leftrightarrow [f(x)-g(x)]_{\min}\ge0\)。</li>
  <li>分离参数法：把参数单独移到一边，转化为求另一边函数的最值。</li>
</ul>
<h4>三、一元二次不等式</h4>
<ul class="ticks">
  <li>"大于取两边，小于取中间"（前提：\(a\gt 0\) 且 \(\Delta\gt 0\)）。</li>
  <li>含参不等式先讨论二次项系数为 0 的情形，再讨论 \(\Delta\)，最后比较两根大小。</li>
</ul>
`,
    examples: [
      {
        title: '例题 1 · 基本不等式求最值',
        body: String.raw`已知 \(x\gt 0\)，求 \(y=x+\dfrac{4}{x}\) 的最小值。`,
        steps: [
          String.raw`\(x\gt 0,\ \dfrac4x\gt 0\)，满足"一正"。`,
          String.raw`\(y\ge2\sqrt{x\cdot\dfrac4x}=2\sqrt4=4\)，"二定"满足。`,
          String.raw`等号条件 \(x=\dfrac4x\Rightarrow x=2\)，可取到，故最小值为 4。`
        ]
      },
      {
        title: '例题 2 · 分离参数',
        body: String.raw`若 \(x^2-2x+a\ge0\) 对 \(x\in[1,3]\) 恒成立，求 \(a\) 的取值范围。`,
        steps: [
          String.raw`分离：\(a\ge -x^2+2x\) 恒成立。`,
          String.raw`令 \(g(x)=-x^2+2x=-(x-1)^2+1\)，在 \([1,3]\) 上最大值为 \(g(1)=1\)。`,
          String.raw`故 \(a\ge1\)。`
        ]
      }
    ],
    formulas: [
      { f: String.raw`a+b\ge2\sqrt{ab}\ (a,b>0)`, d: '基本不等式' },
      { f: String.raw`\dfrac{a+b+c}{3}\ge\sqrt[3]{abc}`, d: '三元均值不等式' },
      { f: String.raw`\forall x,\ f(x)\ge a\ \Leftrightarrow\ f_{\min}\ge a`, d: '恒成立（任意型）' },
      { f: String.raw`\exists x,\ f(x)\ge a\ \Leftrightarrow\ f_{\max}\ge a`, d: '存在型' },
      { f: String.raw`|x-a|+|x-b|\ge|a-b|`, d: '绝对值三角不等式' }
    ],
    pitfalls: [
      '用基本不等式时忽略等号能否取到，导致"最小值"其实只是下确界。',
      '"恒成立"与"存在性"的最值方向正好相反，务必分清。',
      '含参二次不等式忘记讨论二次项系数为 0。',
      '分离参数时注意不等号方向，若除以负数要变向。'
    ],
    links: []
  }
];
