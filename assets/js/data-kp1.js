/* ============================================================
   data-kp1.js · 知识点资料（初中：初一 / 初二 / 初三）
   ============================================================ */

const KP_PART1 = [
  /* ===== 初一 ===== */
  {
    id: 'c1-rational',
    grade: 'c1',
    title: '有理数的运算',
    versions: ['人教版', '北师大版', '苏教版', '沪教版'],
    tags: ['数与式', '运算律'],
    summary: '把"负数"纳入运算体系，掌握加减乘除与乘方的统一规则。',
    concept: String.raw`
<p>有理数指可以写成 \(\dfrac{p}{q}\)（\(p,q\) 为整数，\(q\neq 0\)）的数，包括<b>整数</b>与<b>分数</b>。引入负数后，"减法"不再是"越减越少"，而变成了"加上一个相反数"。</p>
<h4>一、加法法则</h4>
<ul class="ticks">
  <li>同号两数相加：取相同符号，并把绝对值相加。</li>
  <li>异号两数相加：取绝对值较大的符号，并用较大的绝对值减去较小的绝对值。</li>
  <li>互为相反数的两个数相加得 \(0\)。</li>
</ul>
<div class="note-box gold"><b class="h">统一口诀</b>减法变加法：\(a-b=a+(-b)\)。整个初中有理数运算，本质只有"加法"和"乘法"两种操作。</div>
<h4>二、乘法与除法</h4>
<ul class="ticks">
  <li>同号得正，异号得负，并把绝对值相乘（除）。</li>
  <li>多个非零因数相乘，积的符号由<b>负因数个数</b>决定：奇数个为负，偶数个为正。</li>
  <li>除以一个数等于乘以它的倒数：\(a\div b=a\times \dfrac{1}{b}\ (b\neq 0)\)。</li>
</ul>
<h4>三、运算律（简算的武器）</h4>
<ul class="ticks">
  <li>加法交换律、结合律。</li>
  <li>乘法交换律、结合律，以及乘法对加法的<b>分配律</b> \(a(b+c)=ab+ac\)。</li>
</ul>
`,
    examples: [
      {
        title: '例题 1 · 混合运算',
        body: String.raw`计算：\(-3^2+(-2)^3\times \dfrac{1}{4}-|-5|\div \left(-\dfrac{1}{5}\right)\)`,
        steps: [
          String.raw`先算乘方：\(-3^2=-9\)，\((-2)^3=-8\)。注意 \(-3^2\) 的负号<b>不在</b>平方内。`,
          String.raw`再算乘除：\((-8)\times\dfrac14=-2\)；\(|-5|\div\left(-\dfrac15\right)=5\times(-5)=-25\)。`,
          String.raw`最后加减：\(-9+(-2)-(-25)=-9-2+25=14\)。`
        ]
      },
      {
        title: '例题 2 · 巧用分配律',
        body: String.raw`计算：\(\left(\dfrac{2}{3}-\dfrac{5}{6}+\dfrac{1}{2}\right)\times(-24)\)`,
        steps: [
          String.raw`直接通分也可以，但用分配律更快：原式 \(=\dfrac23\times(-24)-\dfrac56\times(-24)+\dfrac12\times(-24)\)。`,
          String.raw`逐项计算：\(-16+20-12=-8\)。`
        ]
      }
    ],
    formulas: [
      { f: String.raw`a-b=a+(-b)`, d: '减法转加法' },
      { f: String.raw`a\div b=a\times\dfrac{1}{b}`, d: '除法转乘法（b≠0）' },
      { f: String.raw`a(b+c)=ab+ac`, d: '乘法分配律（简算核心）' },
      { f: String.raw`|a|=\begin{cases}a,&a\ge0\\-a,&a<0\end{cases}`, d: '绝对值化简' },
      { f: String.raw`(-a)^{2n}=a^{2n},\quad (-a)^{2n+1}=-a^{2n+1}`, d: '负数的奇偶次幂' }
    ],
    pitfalls: [
      String.raw`\(-3^2\) 与 \((-3)^2\) 完全不同：前者是 \(-9\)，后者是 \(9\)。`,
      '运算顺序记牢：先乘方，再乘除，最后加减；有括号先算括号。',
      '去括号时若括号前是负号，括号内每一项都要变号，别只改第一项。',
      '分配律用于除法时只有"除以一个数"可以分配，如 (a+b)÷c 可以，但 a÷(b+c) 不可以。'
    ],
    links: []
  },
  {
    id: 'c1-equation1',
    grade: 'c1',
    title: '一元一次方程',
    versions: ['人教版', '北师大版', '苏教版', '沪教版'],
    tags: ['方程', '应用题'],
    summary: '用等式性质把未知数"剥离"出来，并把文字语言翻译成代数式。',
    concept: String.raw`
<p>只含一个未知数、未知数次数为 1 且等号两边都是整式的方程叫<b>一元一次方程</b>，标准形为 \(ax+b=0\ (a\neq 0)\)。</p>
<h4>一、解方程五步法</h4>
<ul class="ticks">
  <li><b>去分母</b>：两边同乘各分母的最小公倍数（注意每一项都要乘）。</li>
  <li><b>去括号</b>：注意符号与分配律。</li>
  <li><b>移项</b>：把含未知数的项移到一边，常数项移到另一边，移项要变号。</li>
  <li><b>合并同类项</b>：化为 \(ax=b\) 的形式。</li>
  <li><b>系数化为 1</b>：两边同除以 \(a\)，得 \(x=\dfrac{b}{a}\)。</li>
</ul>
<h4>二、列方程解应用题</h4>
<p>关键是把"句子"翻译成"等式"。常用等量关系：路程 \(=\) 速度 \(\times\) 时间；工作量 \(=\) 效率 \(\times\) 时间；利润 \(=\) 售价 \(-\) 进价。</p>
<div class="note-box jade"><b class="h">Σ 老师的小技巧</b>先设未知数 \(x\)，再用一句话把题意写成"……等于……"，这句话就是方程。</div>
`,
    examples: [
      {
        title: '例题 1 · 含分母的方程',
        body: String.raw`解方程：\(\dfrac{2x-1}{3}-\dfrac{x+2}{2}=1\)`,
        steps: [
          String.raw`去分母：两边同乘 6，得 \(2(2x-1)-3(x+2)=6\)。`,
          String.raw`去括号：\(4x-2-3x-6=6\)。`,
          String.raw`移项合并：\(x-8=6\)，故 \(x=14\)。`
        ]
      },
      {
        title: '例题 2 · 相遇问题',
        body: 'A、B 两地相距 240 km，甲从 A 地每小时行 60 km，乙从 B 地每小时行 40 km，两人同时出发相向而行，几小时后相遇？',
        steps: [
          '设 \(t\) 小时后相遇。等量关系：甲走的路程 + 乙走的路程 = 总路程。',
          String.raw`列方程：\(60t+40t=240\)，即 \(100t=240\)。`,
          '解得 \(t=2.4\)，即 2 小时 24 分钟后相遇。'
        ]
      }
    ],
    formulas: [
      { f: String.raw`ax+b=0\ (a\ne0)\ \Rightarrow\ x=-\dfrac{b}{a}`, d: '标准形的解' },
      { f: String.raw`s=vt`, d: '路程 = 速度 × 时间' },
      { f: String.raw`\text{利润}=\text{售价}-\text{进价}`, d: '利润率 = 利润 ÷ 进价' },
      { f: String.raw`\text{工作总量}=\text{效率}\times\text{时间}`, d: '工程问题基本关系' }
    ],
    pitfalls: [
      '去分母时，不含分母的常数项也要乘最小公倍数，这是最高频失分点。',
      '移项一定要变号；只有不等式两边同除以负数时才需要变号方向，别混淆。',
      '应用题要检验：解是否符合题意（如人数、时间不能为负）。'
    ],
    links: []
  },

  /* ===== 初二 ===== */
  {
    id: 'c2-linear',
    grade: 'c2',
    title: '一次函数',
    versions: ['人教版', '北师大版', '苏教版', '沪教版'],
    tags: ['函数', '图象', '方程'],
    summary: '函数思想的起点：把"变化的量"画成一条直线，并读懂 k、b 的几何含义。',
    concept: String.raw`
<p>一般地，形如 <b>\(y=kx+b\)</b>（\(k,b\) 为常数，\(k\neq 0\)）的函数叫做<b>一次函数</b>；当 \(b=0\) 时，\(y=kx\) 是<b>正比例函数</b>。</p>
<h4>一、图象与性质</h4>
<ul class="ticks">
  <li>一次函数的图象是一条<b>直线</b>，画图的实用方法是取两点：\((0,b)\) 与 \(\left(-\dfrac{b}{k},0\right)\)。</li>
  <li>\(k\gt 0\) 时 \(y\) 随 \(x\) 增大而增大，直线"上坡"；\(k\lt 0\) 时 \(y\) 随 \(x\) 增大而减小，直线"下坡"。</li>
  <li>\(b\) 是直线与 \(y\) 轴交点的<b>纵坐标</b>；\(k\) 是斜率，\(k=\dfrac{y_2-y_1}{x_2-x_1}\)。</li>
</ul>
<figure class="figure-box">
  <svg viewBox="0 0 420 250" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="lg1" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#1e3ac6"/><stop offset="100%" stop-color="#3355e6"/>
      </linearGradient>
    </defs>
    <g stroke="#d5d5cf" stroke-width="1">
      <line x1="20" y1="130" x2="400" y2="130"/><line x1="210" y1="15" x2="210" y2="240"/>
    </g>
    <g stroke="#e9e9e3" stroke-width="1" stroke-dasharray="3 3">
      <line x1="60" y1="15" x2="60" y2="240"/><line x1="100" y1="15" x2="100" y2="240"/>
      <line x1="140" y1="15" x2="140" y2="240"/><line x1="260" y1="15" x2="260" y2="240"/>
      <line x1="300" y1="15" x2="300" y2="240"/><line x1="340" y1="15" x2="340" y2="240"/>
      <line x1="20" y1="50" x2="400" y2="50"/><line x1="20" y1="90" x2="400" y2="90"/>
      <line x1="20" y1="170" x2="400" y2="170"/><line x1="20" y1="210" x2="400" y2="210"/>
    </g>
    <line x1="30" y1="70" x2="390" y2="210" stroke="url(#lg1)" stroke-width="3" stroke-linecap="round"/>
    <line x1="30" y1="210" x2="390" y2="70" stroke="#0f6b52" stroke-width="3" stroke-linecap="round" stroke-dasharray="7 5"/>
    <circle cx="210" cy="130" r="4" fill="#e04a12"/>
    <text x="404" y="134" font-size="13" fill="#8b8b93">x</text>
    <text x="214" y="26" font-size="13" fill="#8b8b93">y</text>
    <text x="296" y="96" font-size="13" fill="#3355e6">y=2x+1 (k&gt;0)</text>
    <text x="252" y="192" font-size="13" fill="#0f6b52">y=-x+3 (k&lt;0)</text>
  </svg>
  <figcaption>图 1 · \(k\) 决定倾斜方向，\(b\) 决定与 \(y\) 轴的交点</figcaption>
</figure>
<h4>二、与方程（组）、不等式的关系</h4>
<ul class="ticks">
  <li>直线 \(y=kx+b\) 与 \(x\) 轴交点的横坐标，就是方程 \(kx+b=0\) 的解。</li>
  <li>两条直线的<b>交点坐标</b>，就是对应二元一次方程组的解。</li>
  <li>不等式 \(kx+b\gt 0\) 的解集，对应直线在 \(x\) 轴<b>上方</b>部分所对应的 \(x\) 范围。</li>
</ul>
<div class="note-box gold"><b class="h">数形结合</b>"看到式子想到图，看到图想到式子"，这是一次函数全部考题的通用钥匙。</div>
`,
    examples: [
      {
        title: '例题 1 · 求解析式',
        body: String.raw`已知一次函数图象过点 \((1,3)\) 与 \((-2,-3)\)，求解析式。`,
        steps: [
          String.raw`设 \(y=kx+b\)，代入两点得 \(\begin{cases}k+b=3\\-2k+b=-3\end{cases}\)。`,
          String.raw`两式相减：\(3k=6\)，得 \(k=2\)；代入得 \(b=1\)。`,
          String.raw`所以解析式为 \(y=2x+1\)。`
        ]
      },
      {
        title: '例题 2 · 面积与交点',
        body: String.raw`直线 \(y=2x+4\) 与 \(x\) 轴、\(y\) 轴分别交于 \(A,B\)，求 \(\triangle AOB\) 的面积。`,
        steps: [
          String.raw`与 \(y\) 轴交点：令 \(x=0\)，得 \(B(0,4)\)，故 \(OB=4\)。`,
          String.raw`与 \(x\) 轴交点：令 \(y=0\)，得 \(2x+4=0\)，\(x=-2\)，故 \(A(-2,0)\)，\(OA=2\)。`,
          String.raw`\(S_{\triangle AOB}=\dfrac12\times OA\times OB=\dfrac12\times2\times4=4\)。`
        ]
      },
      {
        title: '例题 3 · 用图象解不等式',
        body: String.raw`借助图象直接写出 \(2x+4\gt 0\) 的解集。`,
        steps: [
          String.raw`先求零点：\(2x+4=0\Rightarrow x=-2\)。`,
          String.raw`因为 \(k=2\gt 0\)，直线在零点右侧位于 \(x\) 轴上方，故解集为 \(x\gt -2\)。`
        ]
      }
    ],
    formulas: [
      { f: String.raw`y=kx+b\ (k\ne 0)`, d: '一次函数一般式（b=0 时为正比例函数）' },
      { f: String.raw`k=\dfrac{y_2-y_1}{x_2-x_1}`, d: '由两点求斜率' },
      { f: String.raw`A(0,\ b),\quad B\left(-\dfrac{b}{k},\ 0\right)`, d: '与两坐标轴的交点' },
      { f: String.raw`S=\dfrac12\left|-\dfrac{b}{k}\right|\cdot|b|`, d: '与两轴围成的三角形面积' },
      { f: String.raw`kx+b>0\ \Leftrightarrow\ \text{图象在 }x\text{ 轴上方}`, d: '函数视角看不等式' }
    ],
    pitfalls: [
      String.raw`忽略 \(k\neq0\)：题目说"一次函数"而解析式含参数时，必须讨论 \(k=0\) 的情形。`,
      String.raw`把 \(b\) 当成"交点"：\(b\) 是纵坐标，交点要写成 \((0,b)\)。`,
      String.raw`求与坐标轴围成面积时忘记加绝对值，导致面积出现负数。`,
      String.raw`两条直线平行 \(\Leftrightarrow k_1=k_2\) 且 \(b_1\neq b_2\)；垂直 \(\Leftrightarrow k_1k_2=-1\)。`
    ],
    links: [{ name: '可汗学院 · 线性函数（站外资源）', url: 'https://www.khanacademy.org/math/algebra/x2f8bb11595b61c86:linear-equations-graphs' }]
  },
  {
    id: 'c2-congruence',
    grade: 'c2',
    title: '全等三角形',
    versions: ['人教版', '北师大版', '苏教版'],
    tags: ['几何', '证明'],
    summary: '初中几何推理的第一块基石：掌握五种判定，学会写规范的证明过程。',
    concept: String.raw`
<p>能够<b>完全重合</b>的两个三角形叫做全等三角形，记作 \(\triangle ABC\cong\triangle A'B'C'\)。对应边相等、对应角相等。</p>
<h4>一、五种判定方法</h4>
<ul class="ticks">
  <li><b>SSS</b>：三边分别相等。</li>
  <li><b>SAS</b>：两边及其<b>夹角</b>分别相等（角必须夹在两边之间）。</li>
  <li><b>ASA</b>：两角及其<b>夹边</b>分别相等。</li>
  <li><b>AAS</b>：两角及其中一角的对边相等。</li>
  <li><b>HL</b>：仅用于直角三角形——斜边和一条直角边分别相等。</li>
</ul>
<div class="note-box red"><b class="h">特别提醒</b>"SSA"（边边角）与"AAA"（角角角）<b>不能</b>判定全等，这是选择题最爱考的陷阱。</div>
<h4>二、证明书写规范</h4>
<ul class="ticks">
  <li>先写"在 \(\triangle ABC\) 与 \(\triangle DEF\) 中"，再列出三组条件（用大括号对齐）。</li>
  <li>最后写"\(\therefore \triangle ABC\cong\triangle DEF\)（判定依据）"。</li>
  <li>由全等得到边角相等时，要写成"由全等得 \(AB=DE\)（全等三角形对应边相等）"。</li>
</ul>
<h4>三、常见辅助线</h4>
<ul class="ticks">
  <li>倍长中线：把中线延长一倍，构造全等。</li>
  <li>截长补短：证明一条线段等于两条线段之和时常用。</li>
  <li>作平行线 / 垂线：把分散的条件集中到一个三角形中。</li>
</ul>
`,
    examples: [
      {
        title: '例题 1 · 基本证明',
        body: String.raw`已知 \(AB=DE\)，\(\angle B=\angle E\)，\(BC=EF\)，求证 \(\triangle ABC\cong\triangle DEF\)。`,
        steps: [
          String.raw`观察条件：两组边相等，且已知角 \(\angle B\) 是 \(AB\) 与 \(BC\) 的夹角。`,
          String.raw`符合"边角边"，故 \(\triangle ABC\cong\triangle DEF\)（SAS）。`,
          String.raw`进一步可得 \(AC=DF\)，\(\angle A=\angle D\)，\(\angle C=\angle F\)。`
        ]
      },
      {
        title: '例题 2 · 寻找隐藏条件',
        body: String.raw`已知 \(AB\parallel CD\)，\(AB=CD\)，\(O\) 为 \(AD\) 与 \(BC\) 的交点，求证 \(\triangle ABO\cong\triangle CDO\)。`,
        steps: [
          String.raw`由 \(AB\parallel CD\) 得内错角相等：\(\angle A=\angle D\)，\(\angle B=\angle C\)。`,
          String.raw`又已知 \(AB=CD\)，构成"角角边"，故全等（AAS）。`
        ]
      }
    ],
    formulas: [
      { f: String.raw`\triangle ABC\cong\triangle DEF`, d: '全等符号，字母顺序必须对应' },
      { f: String.raw`\text{SSS / SAS / ASA / AAS / HL}`, d: '五种判定（HL 仅用于直角三角形）' },
      { f: String.raw`\text{SSA}\ \text{与}\ \text{AAA}\ \text{不成立}`, d: '两个不能用的"伪判定"' },
      { f: String.raw`\angle A+\angle B+\angle C=180^\circ`, d: '三角形内角和（常用来找等角）' }
    ],
    pitfalls: [
      '写全等时字母顺序必须对应，否则后面写"对应边相等"会张冠李戴。',
      'SAS 中的角必须是夹角，"边边角"不成立。',
      '公共边、公共角、对顶角是最常用的隐藏条件，不要漏掉。',
      '证明线段相等时，先看它们是否是两个三角形的对应边，若是，则优先考虑证全等。'
    ],
    links: []
  },
  {
    id: 'c2-pythagorean',
    grade: 'c2',
    title: '勾股定理',
    versions: ['人教版', '北师大版', '苏教版', '沪教版'],
    tags: ['几何', '计算'],
    summary: '把几何长度问题转化为代数方程，是数形结合的典范。',
    concept: String.raw`
<p>直角三角形两直角边 \(a,b\) 与斜边 \(c\) 满足 <b>\(a^2+b^2=c^2\)</b>。反过来，若三角形三边满足该关系，则它是直角三角形（<b>逆定理</b>，可用于判定直角）。</p>
<h4>一、常用勾股数</h4>
<ul class="ticks">
  <li>基础组：\(3,4,5\)；\(5,12,13\)；\(8,15,17\)；\(7,24,25\)。</li>
  <li>它们的整数倍依然是勾股数，如 \(6,8,10\)。</li>
  <li>把它们记熟，选择与填空能直接秒杀。</li>
</ul>
<h4>二、典型题型</h4>
<ul class="ticks">
  <li><b>直接求解</b>：已知两边求第三边，注意分清斜边。</li>
  <li><b>折叠问题</b>：折叠产生全等，设未知数后用勾股列方程。</li>
  <li><b>最短路径</b>：把立体图形（长方体、圆柱）展开成平面，再用勾股求最短路程。</li>
</ul>
<div class="note-box jade"><b class="h">方程思想</b>凡是"不知道一条边"的几何题，都可设这条边为 \(x\)，用勾股定理列方程求解。</div>
`,
    examples: [
      {
        title: '例题 1 · 折叠问题',
        body: String.raw`长方形纸片 \(ABCD\) 中 \(AB=8,\ BC=10\)，沿 \(AE\) 折叠使点 \(D\) 落在 \(BC\) 上的点 \(F\)，求 \(BF\)。`,
        steps: [
          String.raw`由折叠知 \(AF=AD=BC=10\)，且 \(EF=ED\)。`,
          String.raw`在 \(\text{Rt}\triangle ABF\) 中：\(BF=\sqrt{AF^2-AB^2}=\sqrt{100-64}=6\)。`,
          String.raw`于是 \(CF=BC-BF=10-6=4\)，可继续设 \(CE=x\) 求 \(DE=EF=x,\ CE=10-x\)，解得 \(DE=\dfrac{29}{5}\)。`
        ]
      },
      {
        title: '例题 2 · 立体最短路径',
        body: '长方体长 4、宽 3、高 12，一只蚂蚁从一个顶点爬到相对顶点，最短路程是多少？',
        steps: [
          '最短路程要展开成平面，三种展开方式分别计算：',
          String.raw`\(\sqrt{(4+3)^2+12^2}=\sqrt{193}\)，\(\sqrt{(4+12)^2+3^2}=\sqrt{265}\)，\(\sqrt{(3+12)^2+4^2}=\sqrt{241}\)。`,
          String.raw`取最小值 \(\sqrt{193}\)。`
        ]
      }
    ],
    formulas: [
      { f: String.raw`a^2+b^2=c^2`, d: '勾股定理（c 为斜边）' },
      { f: String.raw`c=\sqrt{a^2+b^2}`, d: '已知两直角边求斜边' },
      { f: String.raw`a=\sqrt{c^2-b^2}`, d: '已知斜边与一直角边' },
      { f: String.raw`(3,4,5),(5,12,13),(8,15,17)`, d: '必记勾股数' },
      { f: String.raw`d=\sqrt{(\Delta x)^2+(\Delta y)^2}`, d: '平面两点间距离公式' }
    ],
    pitfalls: [
      '一定要先判断谁是斜边，盲目套公式是最大错误来源。',
      '折叠题中"折叠前后重叠的部分全等"，别忘了对应边相等。',
      '立体图形最短路要比较多种展开方式，不能只算一种。'
    ],
    links: []
  },

  /* ===== 初三 ===== */
  {
    id: 'c3-quadratic',
    grade: 'c3',
    title: '二次函数',
    versions: ['人教版', '北师大版', '苏教版', '沪教版'],
    tags: ['函数', '图象', '压轴'],
    summary: '中考压轴的主角：顶点、对称轴、开口方向与"动点最值"问题。',
    concept: String.raw`
<p>形如 <b>\(y=ax^2+bx+c\)</b>（\(a\neq0\)）的函数叫二次函数，图象是一条<b>抛物线</b>。</p>
<h4>一、三种形式</h4>
<ul class="ticks">
  <li>一般式 \(y=ax^2+bx+c\)：直接读出 \(c\)（与 \(y\) 轴交点纵坐标）。</li>
  <li>顶点式 \(y=a(x-h)^2+k\)：直接读出顶点 \((h,k)\) 与对称轴 \(x=h\)。</li>
  <li>交点式 \(y=a(x-x_1)(x-x_2)\)：直接读出与 \(x\) 轴的两个交点。</li>
</ul>
<figure class="figure-box">
  <svg viewBox="0 0 420 250" xmlns="http://www.w3.org/2000/svg">
    <g stroke="#d5d5cf"><line x1="20" y1="170" x2="400" y2="170"/><line x1="210" y1="20" x2="210" y2="230"/></g>
    <g stroke="#e9e9e3" stroke-dasharray="3 3">
      <line x1="90" y1="20" x2="90" y2="230"/><line x1="150" y1="20" x2="150" y2="230"/>
      <line x1="270" y1="20" x2="270" y2="230"/><line x1="330" y1="20" x2="330" y2="230"/>
      <line x1="20" y1="80" x2="400" y2="80"/><line x1="20" y1="125" x2="400" y2="125"/>
    </g>
    <path d="M 40 55 Q 210 245 380 55" fill="none" stroke="#1e3ac6" stroke-width="3"/>
    <line x1="210" y1="25" x2="210" y2="230" stroke="#e04a12" stroke-width="1.5" stroke-dasharray="6 4"/>
    <circle cx="210" cy="150" r="4.5" fill="#3355e6"/>
    <text x="214" y="42" font-size="12" fill="#e04a12">对称轴 x=-b/2a</text>
    <text x="218" y="166" font-size="12" fill="#3355e6">顶点</text>
    <text x="404" y="174" font-size="13" fill="#8b8b93">x</text>
  </svg>
  <figcaption>图 2 · \(a\gt 0\) 开口向上，顶点是最低点（最小值点）</figcaption>
</figure>
<h4>二、系数与图象的关系</h4>
<ul class="ticks">
  <li>\(a\) 定开口：\(a\gt 0\) 向上，\(a\lt 0\) 向下；\(|a|\) 越大开口越窄。</li>
  <li>\(b\) 与 \(a\) 共同定对称轴："左同右异"——对称轴在 \(y\) 轴左侧时 \(ab\gt 0\)，右侧时 \(ab\lt 0\)。</li>
  <li>\(c\) 是与 \(y\) 轴交点纵坐标；\(\Delta=b^2-4ac\) 定与 \(x\) 轴交点个数。</li>
</ul>
<div class="note-box gold"><b class="h">口诀</b>开口看 \(a\)，对称看 \(-\dfrac{b}{2a}\)，交 \(y\) 轴看 \(c\)，交点个数看 \(\Delta\)。</div>
`,
    examples: [
      {
        title: '例题 1 · 化为顶点式',
        body: String.raw`把 \(y=2x^2-8x+5\) 化为顶点式，并写出顶点与最值。`,
        steps: [
          String.raw`提 \(a\)：\(y=2(x^2-4x)+5\)。`,
          String.raw`配方：\(y=2(x-2)^2-8+5=2(x-2)^2-3\)。`,
          String.raw`顶点 \((2,-3)\)，对称轴 \(x=2\)，因 \(a=2\gt 0\)，函数有最小值 \(-3\)。`
        ]
      },
      {
        title: '例题 2 · 最值应用',
        body: String.raw`用长 40 m 的围栏靠墙围一个矩形菜园（墙长 25 m），怎样围面积最大？`,
        steps: [
          String.raw`设垂直墙的边长为 \(x\)，则平行墙的边长为 \(40-2x\)，需 \(40-2x\le25\Rightarrow x\ge7.5\)。`,
          String.raw`面积 \(S=x(40-2x)=-2x^2+40x=-2(x-10)^2+200\)。`,
          String.raw`当 \(x=10\) 时 \(S_{\max}=200\ \text{m}^2\)，此时垂直墙的边为 10 m，平行墙的边为 20 m。`
        ]
      }
    ],
    formulas: [
      { f: String.raw`y=ax^2+bx+c\ (a\ne0)`, d: '一般式' },
      { f: String.raw`y=a(x-h)^2+k`, d: '顶点式，顶点 (h,k)' },
      { f: String.raw`x=-\dfrac{b}{2a},\quad y_v=\dfrac{4ac-b^2}{4a}`, d: '对称轴与顶点纵坐标' },
      { f: String.raw`\Delta=b^2-4ac`, d: 'Δ>0 两交点，=0 一个，<0 无交点' },
      { f: String.raw`x=\dfrac{-b\pm\sqrt{\Delta}}{2a}`, d: '求根公式（与 x 轴交点）' }
    ],
    pitfalls: [
      String.raw`配方时括号内加减的是 \(\left(\dfrac{b}{2a}\right)^2\)，括号外要乘 \(a\) 补偿，最易错。`,
      String.raw`实际问题中 \(x\) 有取值范围，顶点不在范围内时，最值在端点取得。`,
      String.raw`题目说"二次函数"却含参数时，务必保证 \(a\neq0\)。`,
      String.raw`\(\Delta\) 只决定与 \(x\) 轴交点个数，与 \(y\) 轴交点由 \(c\) 单独决定。`
    ],
    links: []
  },
  {
    id: 'c3-circle',
    grade: 'c3',
    title: '圆的基本性质',
    versions: ['人教版', '北师大版', '苏教版'],
    tags: ['几何', '证明'],
    summary: '垂径定理与圆周角定理是圆中证明与计算的两把钥匙。',
    concept: String.raw`
<h4>一、垂径定理</h4>
<p>垂直于弦的直径<b>平分这条弦</b>，并且平分弦所对的两条弧。常与勾股定理配合：构造由半径 \(r\)、弦心距 \(d\)、半弦长 \(\dfrac{l}{2}\) 组成的直角三角形。</p>
<h4>二、圆周角定理</h4>
<ul class="ticks">
  <li>同弧或等弧所对的圆周角相等，且等于它所对<b>圆心角的一半</b>。</li>
  <li>直径所对的圆周角是直角；\(90^\circ\) 的圆周角所对的弦是直径。</li>
  <li>圆内接四边形<b>对角互补</b>，且一个外角等于它的内对角。</li>
</ul>
<h4>三、切线</h4>
<ul class="ticks">
  <li>判定：过半径<b>外端</b>且<b>垂直于</b>这条半径的直线是切线（两个条件缺一不可）。</li>
  <li>性质：切线垂直于过切点的半径。</li>
  <li>切线长定理：从圆外一点引两条切线，切线长相等。</li>
</ul>
<div class="note-box gold"><b class="h">黄金组合</b>"见直径 → 想直角（连弦）"，"见切线 → 连半径得垂直"，"见弦 → 作垂径"。</div>
`,
    examples: [
      {
        title: '例题 1 · 垂径定理计算',
        body: String.raw`半径为 5 的圆中，弦 \(AB=8\)，求弦心距。`,
        steps: [
          String.raw`作 \(OC\perp AB\) 于 \(C\)，则由垂径定理 \(AC=\dfrac{AB}{2}=4\)。`,
          String.raw`在 \(\text{Rt}\triangle OCA\) 中：\(OC=\sqrt{OA^2-AC^2}=\sqrt{25-16}=3\)。`
        ]
      },
      {
        title: '例题 2 · 切线的证明',
        body: String.raw`已知 \(C\) 在 \(\odot O\) 上，直线 \(CD\) 满足 \(OC\perp CD\)，求证 \(CD\) 是 \(\odot O\) 的切线。`,
        steps: [
          '点 \(C\) 在圆上（半径 \(OC\) 的外端）。',
          String.raw`又 \(OC\perp CD\)，满足"过半径外端且垂直于半径"，故 \(CD\) 为切线。`
        ]
      }
    ],
    formulas: [
      { f: String.raw`r^2=d^2+\left(\dfrac{l}{2}\right)^2`, d: '半径、弦心距、半弦的勾股关系' },
      { f: String.raw`\angle \text{圆周角}=\dfrac12\angle \text{圆心角}`, d: '圆周角定理（同弧）' },
      { f: String.raw`\angle A+\angle C=180^\circ`, d: '圆内接四边形对角互补' },
      { f: String.raw`C=2\pi r,\quad S=\pi r^2`, d: '周长与面积' },
      { f: String.raw`l=\dfrac{n\pi r}{180}`, d: '弧长公式（n 为圆心角度数）' }
    ],
    pitfalls: [
      '证明切线时，"点在圆上"与"垂直"两个条件必须都写，只写垂直通常不得分。',
      '圆周角定理必须强调"同弧或等弧"，不同弧的圆周角不能随便相等。',
      '弦所对的圆周角有两个互补的值（在弦的两侧），分类讨论别丢解。'
    ],
    links: []
  },
  {
    id: 'c3-similar',
    grade: 'c3',
    title: '相似三角形',
    versions: ['人教版', '北师大版', '苏教版', '沪教版'],
    tags: ['几何', '比例'],
    summary: '从"相等"升级到"成比例"，掌握 A 字型、8 字型等基本模型。',
    concept: String.raw`
<p>三个角分别相等、三条边成比例的两个三角形叫<b>相似三角形</b>。相似比为 \(k\) 时：对应边之比 \(=k\)，周长比 \(=k\)，面积比 \(=k^2\)。</p>
<h4>一、判定方法</h4>
<ul class="ticks">
  <li>平行于三角形一边的直线，截得的三角形与原三角形相似（<b>A 字型 / 8 字型</b>）。</li>
  <li>两角分别相等（AA）——最常用的判定。</li>
  <li>两边成比例且夹角相等（SAS）。</li>
  <li>三边成比例（SSS）。</li>
</ul>
<h4>二、常见模型</h4>
<ul class="ticks">
  <li><b>A 字型</b>：平行线截三角形，如 \(DE\parallel BC\Rightarrow \triangle ADE\sim\triangle ABC\)。</li>
  <li><b>8 字型</b>：两条相交线段被一组平行线所截。</li>
  <li><b>母子型（射影定理）</b>：直角三角形斜边上的高分出的两个小三角形与原三角形相似。</li>
  <li><b>三垂直（K 字）型</b>：一线三等角，常见于坐标系中的压轴题。</li>
</ul>
<div class="note-box jade"><b class="h">面积比</b>相似比是 \(k\) 时，面积比是 \(k^2\)。反过来，"面积比开平方 = 相似比"，常用来反求线段。</div>
`,
    examples: [
      {
        title: '例题 1 · A 字型',
        body: String.raw`\(\triangle ABC\) 中，\(DE\parallel BC\)，\(AD:DB=2:3\)，若 \(BC=15\)，求 \(DE\)。`,
        steps: [
          String.raw`由 \(AD:DB=2:3\) 得 \(AD:AB=2:5\)，相似比 \(k=\dfrac25\)。`,
          String.raw`\(\triangle ADE\sim\triangle ABC\Rightarrow \dfrac{DE}{BC}=\dfrac25\Rightarrow DE=15\times\dfrac25=6\)。`
        ]
      },
      {
        title: '例题 2 · 面积比反求',
        body: String.raw`\(\triangle ADE\sim\triangle ABC\)，且 \(S_{\triangle ADE}:S_{\triangle ABC}=4:9\)，若 \(AB=12\)，求 \(AD\)。`,
        steps: [
          String.raw`面积比为 \(k^2=\dfrac49\Rightarrow k=\dfrac23\)。`,
          String.raw`\(AD=AB\times k=12\times\dfrac23=8\)。`
        ]
      }
    ],
    formulas: [
      { f: String.raw`\dfrac{a}{a'}=\dfrac{b}{b'}=\dfrac{c}{c'}=k`, d: '对应边成比例（相似比 k）' },
      { f: String.raw`\dfrac{S}{S'}=k^2`, d: '面积比等于相似比的平方' },
      { f: String.raw`\dfrac{C}{C'}=k`, d: '周长比等于相似比' },
      { f: String.raw`h^2=pq,\quad a^2=pc`, d: '射影定理（母子型）' }
    ],
    pitfalls: [
      '对应边一定要找准，相似三角形的字母顺序同样必须对应。',
      '面积比是相似比的平方，不是相似比本身。',
      '用平行得相似时，注意是"平行于一边的直线"，与两边相交才构成 A 字或 8 字型。'
    ],
    links: []
  }
];
