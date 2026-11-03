/* ============================================================
   data-kp3.js · 知识点资料（扩充）
   每个年级补齐到 4-5 节，覆盖初中代数/几何与高中主干模块
   ============================================================ */

const KP_PART3 = [
  /* ================= 初一 ================= */
  {
    id: 'c1-poly',
    grade: 'c1',
    title: '整式与因式分解',
    versions: ['人教版', '北师大版', '苏教版', '沪教版'],
    tags: ['整式', '乘法公式', '因式分解'],
    summary: '整式的加减乘除与因式分解，是初中代数运算的基本功，也是后续分式、二次方程的地基。',
    concept: String.raw`
<p>由数与字母的积组成的式子叫<b>单项式</b>，几个单项式的和叫<b>多项式</b>，两者统称<b>整式</b>。单项式中所有字母的指数和叫做它的<b>次数</b>；多项式里次数最高的项的次数，就是多项式的次数。</p>
<h4>一、加减：合并同类项</h4>
<p>所含字母相同、相同字母的指数也相同的项叫同类项。合并时只把<b>系数相加</b>，字母与指数不变。去括号时注意符号：括号前是"−"，去括号后括号内<b>每一项都要变号</b>。</p>
<h4>二、乘法：三个公式要正反都熟</h4>
<p>平方差、完全平方是整式乘法的核心。它们的逆用就是因式分解，所以"正着算"与"倒着写"必须同样熟练。</p>
<h4>三、因式分解的四步法</h4>
<ul class="ticks">
  <li><b>一提</b>：先看有没有公因式，有就先提（提尽，包括数字与字母）。</li>
  <li><b>二套</b>：两项看平方差，三项看完全平方或十字相乘。</li>
  <li><b>三查</b>：每个括号能不能继续分解（分解要彻底）。</li>
  <li><b>四验</b>：把结果乘开，看是否还原成原式。</li>
</ul>
<div class="note-box gold"><b class="h">一句话方法</b>因式分解的本质是"把和变成积"。判断是否分解彻底，就看每个因式还能不能再分。</div>`,
    examples: [
      {
        title: '例题 1 · 化简求值',
        body: String.raw`先化简，再求值：\((2x+3)(2x-3)-4x(x-1)\)，其中 \(x=-\dfrac12\)。`,
        steps: [
          String.raw`用平方差展开：\((2x+3)(2x-3)=4x^2-9\)。`,
          String.raw`用分配律展开：\(-4x(x-1)=-4x^2+4x\)。`,
          String.raw`合并：\(4x^2-9-4x^2+4x=4x-9\)（二次项恰好抵消）。`,
          String.raw`代入 \(x=-\dfrac12\)：\(4\times\left(-\dfrac12\right)-9=-2-9=-11\)。`
        ]
      },
      {
        title: '例题 2 · 因式分解',
        body: String.raw`把 \(2a^3-8a\) 与 \(x^2-5x+6\) 分解因式。`,
        steps: [
          String.raw`\(2a^3-8a=2a(a^2-4)\)，先提公因式 \(2a\)。`,
          String.raw`括号内再用平方差：\(a^2-4=(a+2)(a-2)\)，故结果为 \(2a(a+2)(a-2)\)。`,
          String.raw`三项式 \(x^2-5x+6\) 找两数：积为 \(6\)、和为 \(-5\)，即 \(-2\) 与 \(-3\)。`,
          String.raw`故 \(x^2-5x+6=(x-2)(x-3)\)。可乘开验证。`
        ]
      }
    ],
    formulas: [
      { f: String.raw`\((a\pm b)^2=a^2\pm 2ab+b^2\)`, d: '完全平方公式，中间项符号与括号内一致' },
      { f: String.raw`\((a+b)(a-b)=a^2-b^2\)`, d: '平方差公式，正反两用' },
      { f: String.raw`\(a^2-b^2=(a+b)(a-b)\)`, d: '两项且都是平方 → 用平方差分解' },
      { f: String.raw`\(x^2+(p+q)x+pq=(x+p)(x+q)\)`, d: '十字相乘：找和为一次项系数、积为常数项的两个数' },
      { f: String.raw`\(a^2+b^2=(a+b)^2-2ab\)`, d: '常用变形，求值题的高频桥梁' }
    ],
    pitfalls: [
      String.raw`去括号时只变第一项的符号，例如 \(-(a-b+c)=-a-b+c\)（错），正确是 \(-a+b-c\)。`,
      String.raw`\(a^2-b^2\) 与 \((a-b)^2\) 混淆：后者展开是 \(a^2-2ab+b^2\)，不是 \(a^2-b^2\)。`,
      String.raw`分解不彻底，如 \(x^4-1=(x^2+1)(x^2-1)\) 还应收成 \((x^2+1)(x+1)(x-1)\)。`,
      String.raw`提公因式只提数字不提字母，或提完后括号内项数变少——提公因式不改变项数。`
    ],
    links: []
  },
  {
    id: 'c1-system',
    grade: 'c1',
    title: '二元一次方程组',
    versions: ['人教版', '北师大版', '苏教版', '沪教版'],
    tags: ['消元', '方程组', '实际应用'],
    summary: '用"消元"把两个未知数变成一个，是初中建模思想的第一课，行程、工程、配套问题都靠它。',
    concept: String.raw`
<p>含有两个未知数、且含未知数的项的次数都是 \(1\) 的方程叫<b>二元一次方程</b>；两个这样的方程合起来就是<b>二元一次方程组</b>。</p>
<h4>一、代入消元</h4>
<p>把一个方程变形为"\(y=\cdots\)"（或 \(x=\cdots\)），代入另一个方程，消去一个未知数。适合某个未知数系数为 \(\pm 1\) 的方程组。</p>
<h4>二、加减消元</h4>
<p>把两个方程相加或相减，直接消去一个未知数。适合某个未知数系数相同或互为相反数；若系数成倍数关系，先把方程整体乘一个数。</p>
<h4>三、解完必须检验</h4>
<p>把求得的解代回<b>原方程组</b>的每一个方程，两个都成立才算解对。选择题、填空题都可用检验代替求解。</p>
<h4>四、应用题三步</h4>
<ul class="ticks">
  <li>设未知数：问什么设什么，必要时设"中间量"更简单。</li>
  <li>找两个等量关系：常见为"总量关系"和"倍数（差）关系"。</li>
  <li>解完回到实际情境，检查是否符合"人数为正整数""时间不为负"等隐含条件。</li>
</ul>`,
    examples: [
      {
        title: '例题 1 · 加减消元',
        body: String.raw`解方程组 \(\begin{cases}3x+2y=12\\ 2x-2y=8\end{cases}\)`,
        steps: [
          String.raw`两个方程中 \(y\) 的系数互为相反数，直接相加消元。`,
          String.raw`相加得 \(5x=20\)，故 \(x=4\)。`,
          String.raw`代回第一个方程：\(12+2y=12\)，得 \(y=0\)。`,
          String.raw`检验：\(2\times4-2\times0=8\) 成立，故解为 \(\begin{cases}x=4\\ y=0\end{cases}\)。`
        ]
      },
      {
        title: '例题 2 · 配套问题',
        body: String.raw`某车间 28 名工人生产螺钉与螺母，每人每天平均生产螺钉 12 个或螺母 18 个。为使每天的产品恰好配套（1 个螺钉配 2 个螺母），应安排多少人生产螺钉？`,
        steps: [
          String.raw`设 \(x\) 人生产螺钉，\(y\) 人生产螺母，则 \(x+y=28\)。`,
          String.raw`配套条件是"螺母数是螺钉数的 2 倍"：\(18y=2\times12x\)。`,
          String.raw`化简第二个方程：\(18y=24x\)，即 \(3y=4x\)。`,
          String.raw`由 \(y=28-x\) 代入：\(3(28-x)=4x\)，得 \(84=7x\)，\(x=12\)。`,
          String.raw`故安排 12 人生产螺钉、16 人生产螺母，此时螺钉 144 个、螺母 288 个，正好配套。`
        ]
      }
    ],
    formulas: [
      { f: String.raw`\(\begin{cases}a_1x+b_1y=c_1\\ a_2x+b_2y=c_2\end{cases}\)`, d: '一般形式，解的唯一性看系数比' },
      { f: String.raw`\(x+y=s,\ x-y=d\Rightarrow x=\dfrac{s+d}{2},\ y=\dfrac{s-d}{2}\)`, d: '和差问题直接套用' },
      { f: String.raw`\text{工作总量}=(\text{甲效率}+\text{乙效率})\times\text{合作时间}`, d: '工程问题常设工作总量为 1' },
      { f: String.raw`\text{路程}=\text{速度}\times\text{时间}`, d: '相遇相加、追及相减，注意单位统一' }
    ],
    pitfalls: [
      String.raw`加减消元时只乘了含未知数的项，常数项忘乘，导致方程不等价。`,
      String.raw`代入时符号出错，例如由 \(2x-y=3\) 得 \(y=2x-3\)（对），写成 \(y=3-2x\)（错）。`,
      String.raw`求出一个未知数就停笔，忘了回代求另一个。`,
      String.raw`应用题解出分数人数也照抄，没检验实际意义。`
    ],
    links: []
  },

  /* ================= 初二 ================= */
  {
    id: 'c2-radical',
    grade: 'c2',
    title: '二次根式',
    versions: ['人教版', '北师大版', '苏教版', '沪教版'],
    tags: ['根式', '化简', '分母有理化'],
    summary: '二次根式的意义、化简与四则运算，是勾股定理、一元二次方程求根公式的计算底座。',
    concept: String.raw`
<p>形如 \(\sqrt{a}\ (a\ge 0)\) 的式子叫<b>二次根式</b>。被开方数必须非负，这是所有化简与取值题的第一道门槛。</p>
<h4>一、两条基本性质</h4>
<p>\(\left(\sqrt{a}\right)^2=a\ (a\ge0)\)；\(\sqrt{a^2}=|a|\)，注意结果一定非负，所以 \(\sqrt{(-3)^2}=3\) 而不是 \(-3\)。</p>
<h4>二、乘除与化简</h4>
<p>\(\sqrt{a}\cdot\sqrt{b}=\sqrt{ab}\)、\(\dfrac{\sqrt{a}}{\sqrt{b}}=\sqrt{\dfrac{a}{b}}\)（\(b>0\)）。化简的目标是<b>最简二次根式</b>：被开方数不含分母、不含能开得尽方的因数。例如 \(\sqrt{48}=\sqrt{16\times3}=4\sqrt3\)。</p>
<h4>三、分母有理化</h4>
<p>分母含根号时，分子分母同乘适当的式子：单项根式乘它本身，\(\dfrac{1}{\sqrt2}=\dfrac{\sqrt2}{2}\)；两项式用平方差，\(\dfrac{1}{\sqrt3-1}=\dfrac{\sqrt3+1}{2}\)。</p>
<h4>四、加减</h4>
<p>先把每项化成最简二次根式，再合并<b>被开方数相同</b>的项，这与合并同类项完全一致。</p>`,
    examples: [
      {
        title: '例题 1 · 化简与合并',
        body: String.raw`计算 \(\sqrt{48}-\sqrt{27}+\sqrt{\dfrac13}\)。`,
        steps: [
          String.raw`\(\sqrt{48}=\sqrt{16\times3}=4\sqrt3\)，\(\sqrt{27}=3\sqrt3\)。`,
          String.raw`\(\sqrt{\dfrac13}=\dfrac{\sqrt3}{3}\)（分母有理化）。`,
          String.raw`合并同类二次根式：\(\left(4-3+\dfrac13\right)\sqrt3=\dfrac43\sqrt3\)。`
        ]
      },
      {
        title: '例题 2 · 分母有理化与求值',
        body: String.raw`已知 \(x=\sqrt5+2\)，求 \(x^2-4x+1\) 的值。`,
        steps: [
          String.raw`由 \(x=\sqrt5+2\) 得 \(x-2=\sqrt5\)。`,
          String.raw`把原式配方：\(x^2-4x+1=(x-2)^2-3\)。`,
          String.raw`代入：\((\sqrt5)^2-3=5-3=2\)。`,
          String.raw`也可直接代入展开，但配方后计算量更小——"凑完全平方"是根式求值的常用技巧。`
        ]
      }
    ],
    formulas: [
      { f: String.raw`\(\sqrt{a^2}=|a|=\begin{cases}a,&a\ge0\\-a,&a<0\end{cases}\)`, d: '开方结果必非负' },
      { f: String.raw`\(\sqrt{ab}=\sqrt a\cdot\sqrt b\ (a,b\ge0)\)`, d: '积的算术平方根，可正反用' },
      { f: String.raw`\(\sqrt{\dfrac ab}=\dfrac{\sqrt a}{\sqrt b}\ (a\ge0,b>0)\)`, d: '商的算术平方根' },
      { f: String.raw`\(\dfrac{1}{\sqrt a}=\dfrac{\sqrt a}{a}\)`, d: '单项分母有理化' },
      { f: String.raw`\(\dfrac{1}{\sqrt a-\sqrt b}=\dfrac{\sqrt a+\sqrt b}{a-b}\)`, d: '两项分母用平方差有理化' }
    ],
    pitfalls: [
      String.raw`认为 \(\sqrt{a^2}=a\)，忽略 \(a<0\) 时要取相反数。`,
      String.raw`\(\sqrt{a}+\sqrt{b}\ne\sqrt{a+b}\)，例如 \(\sqrt9+\sqrt{16}=7\)，而 \(\sqrt{25}=5\)。`,
      String.raw`化简结果被开方数仍含分母，如 \(\sqrt{\dfrac12}\) 应写成 \(\dfrac{\sqrt2}{2}\)。`,
      String.raw`忽视取值范围：\(\sqrt{x-2}\) 有意义要求 \(x\ge2\)，不是 \(x>2\)。`
    ],
    links: []
  },
  {
    id: 'c2-triangle',
    grade: 'c2',
    title: '平行线与三角形',
    versions: ['人教版', '北师大版', '苏教版', '沪教版'],
    tags: ['平行线', '内角和', '中位线'],
    summary: '平行线的判定与性质、三角形内角和与外角、中位线，是初中几何推理的第一套完整工具。',
    concept: String.raw`
<p>平面几何的推理从"两条直线被第三条直线所截"开始。同位角、内错角、同旁内角的关系，决定了直线是否平行。</p>
<h4>一、判定与性质不能混</h4>
<p><b>判定</b>是由"角的关系"推"平行"：同位角相等、内错角相等、同旁内角互补，都能判定两直线平行。<b>性质</b>是由"平行"推"角的关系"。做题时先看题目给了平行，还是要你证平行。</p>
<h4>二、三角形内角和与外角</h4>
<p>三角形三个内角和为 \(180^\circ\)；三角形的一个外角等于与它<b>不相邻</b>的两个内角之和，且大于其中任何一个。</p>
<h4>三、三边关系与中位线</h4>
<p>任意两边之和大于第三边，两边之差小于第三边。三角形两边中点的连线叫<b>中位线</b>，它平行于第三边且等于第三边的一半。</p>
<h4>四、辅助线的两个常见动作</h4>
<ul class="ticks">
  <li>过拐点作平行线：把分散的角集中到一处，形成内错角或同旁内角。</li>
  <li>延长线段构造外角：求角度时把结论转化到一个三角形内。</li>
</ul>`,
    examples: [
      {
        title: '例题 1 · 由角推平行',
        body: String.raw`如图，直线 \(AB,CD\) 被 \(EF\) 所截，\(\angle1=65^\circ\)，\(\angle2=115^\circ\)。判断 \(AB\) 与 \(CD\) 是否平行。`,
        steps: [
          String.raw`观察位置：\(\angle1\) 与 \(\angle2\) 是同旁内角。`,
          String.raw`计算：\(65^\circ+115^\circ=180^\circ\)，同旁内角互补。`,
          String.raw`由"同旁内角互补，两直线平行"，得 \(AB\parallel CD\)。`,
          String.raw`若题目只给 \(\angle1=\angle\)某内错角，则应改用内错角相等来判定。`
        ]
      },
      {
        title: '例题 2 · 中位线求长度',
        body: String.raw`在 \(\triangle ABC\) 中，\(D,E\) 分别是 \(AB,AC\) 的中点，\(BC=10\)，求 \(DE\)，并说明 \(DE\) 与 \(BC\) 的位置关系。`,
        steps: [
          String.raw`\(D,E\) 为两边中点，故 \(DE\) 是中位线。`,
          String.raw`由中位线定理：\(DE\parallel BC\) 且 \(DE=\dfrac12BC\)。`,
          String.raw`代入 \(BC=10\)：\(DE=5\)。`,
          String.raw`若已知 \(DE\) 求 \(BC\)，则用 \(BC=2DE\)。`
        ]
      }
    ],
    formulas: [
      { f: String.raw`\(\angle A+\angle B+\angle C=180^\circ\)`, d: '三角形内角和' },
      { f: String.raw`\angle ACD=\angle A+\angle B`, d: '外角等于不相邻两内角之和' },
      { f: String.raw`|b-c|<a<b+c`, d: '三边关系，判断能否构成三角形' },
      { f: String.raw`DE=\dfrac12BC,\ DE\parallel BC`, d: '中位线定理' },
      { f: String.raw`n\ \text{边形内角和}=(n-2)\times180^\circ`, d: '多边形内角和' }
    ],
    pitfalls: [
      String.raw`把判定当性质用：已知平行时不能再用"内错角相等"去证平行。`,
      String.raw`用三边关系时忘记"差的绝对值"，只用两边之和判别。`,
      String.raw`外角找错：必须找与内角<b>不相邻</b>的两个内角。`,
      String.raw`中位线与中线混淆：中位线连两边中点，长度是第三边一半；中线连顶点与对边中点。`
    ],
    links: []
  },

  /* ================= 初三 ================= */
  {
    id: 'c3-eq2',
    grade: 'c3',
    title: '一元二次方程',
    versions: ['人教版', '北师大版', '苏教版', '沪教版'],
    tags: ['求根公式', '判别式', '根与系数'],
    summary: '四种解法、判别式与韦达定理，是中考压轴题与高中二次问题的共同入口。',
    concept: String.raw`
<p>只含一个未知数、未知数最高次数为 \(2\) 的整式方程叫<b>一元二次方程</b>，一般形式 \(ax^2+bx+c=0\ (a\ne0)\)。注意 \(a\ne0\) 是前提，也是考题最爱设的陷阱。</p>
<h4>一、四种解法怎么选</h4>
<ul class="ticks">
  <li><b>直接开平方</b>：形如 \((x+m)^2=n\ (n\ge0)\)。</li>
  <li><b>因式分解</b>：能十字相乘时最快，得到"两个因式之积为 0"。</li>
  <li><b>配方</b>：二次项系数为 1 且一次项系数为偶数时顺手，也是推导求根公式的方法。</li>
  <li><b>公式法</b>：万能否，先算 \(\Delta=b^2-4ac\)。</li>
</ul>
<h4>二、判别式决定根的情况</h4>
<p>\(\Delta>0\) 两个不相等实根；\(\Delta=0\) 两个相等实根；\(\Delta<0\) 无实根。含参问题里，"有两个实根"往往同时要求 \(a\ne0\) 与 \(\Delta\ge0\)。</p>
<h4>三、根与系数的关系（韦达定理）</h4>
<p>若 \(x_1,x_2\) 是方程的两根，则 \(x_1+x_2=-\dfrac ba\)，\(x_1x_2=\dfrac ca\)。求 \(\dfrac{1}{x_1}+\dfrac{1}{x_2}\)、\(x_1^2+x_2^2\) 一类式子的值，先把它们变形成和与积的组合。</p>
<h4>四、应用题</h4>
<p>增长率、面积、销售利润是三大高频模型。列完方程后<b>必须检验根的合理性</b>（长度为正、降价不为负），不合理的根要舍去。</p>`,
    examples: [
      {
        title: '例题 1 · 因式分解法',
        body: String.raw`解方程 \(2x^2-5x+2=0\)。`,
        steps: [
          String.raw`尝试十字相乘：\(2x^2\) 拆成 \(2x\cdot x\)，\(2\) 拆成 \((-1)\times(-2)\)。`,
          String.raw`交叉相乘检验：\(2x\cdot(-2)+x\cdot(-1)=-5x\)，符合一次项。`,
          String.raw`故 \((2x-1)(x-2)=0\)。`,
          String.raw`得 \(x_1=\dfrac12,\ x_2=2\)。用韦达验证：和为 \(\dfrac52\)，积为 \(1\)，均符合。`
        ]
      },
      {
        title: '例题 2 · 判别式讨论',
        body: String.raw`关于 \(x\) 的方程 \(x^2-2x+m=0\) 有两个不相等的实数根，求 \(m\) 的取值范围。`,
        steps: [
          String.raw`二次项系数为 \(1\ne0\)，满足一元二次方程要求。`,
          String.raw`\(\Delta=(-2)^2-4\times1\times m=4-4m\)。`,
          String.raw`两个不相等实根要求 \(\Delta>0\)：\(4-4m>0\)。`,
          String.raw`解得 \(m<1\)。若题目改为"有实数根"，则取 \(\Delta\ge0\)，即 \(m\le1\)。`
        ]
      }
    ],
    formulas: [
      { f: String.raw`\(x=\dfrac{-b\pm\sqrt{b^2-4ac}}{2a}\)`, d: '求根公式，使用前先保证 \(\Delta\ge0\)' },
      { f: String.raw`\(\Delta=b^2-4ac\)`, d: '判别式，判定实根个数' },
      { f: String.raw`\(x_1+x_2=-\dfrac ba,\ x_1x_2=\dfrac ca\)`, d: '韦达定理（先确认 \(\Delta\ge0\)）' },
      { f: String.raw`\(x_1^2+x_2^2=(x_1+x_2)^2-2x_1x_2\)`, d: '对称式求值的常用变形' },
      { f: String.raw`\(a(1\pm x)^2=b\)`, d: '增长率 / 降价率模型' }
    ],
    pitfalls: [
      String.raw`忘记 \(a\ne0\)：题目说"方程有两个实根"时，若二次项系数含参，必须先排除为 0 的情况。`,
      String.raw`用韦达定理前不验证 \(\Delta\ge0\)，得到"两根之和"却根本不存在实根。`,
      String.raw`因式分解时漏掉负号，如 \(x^2-3x-4=(x-4)(x+1)\) 写成 \((x+4)(x-1)\)。`,
      String.raw`应用题求出两个根都保留，实际情境中不合理的根未舍去。`
    ],
    links: []
  },
  {
    id: 'c3-trig',
    grade: 'c3',
    title: '锐角三角函数',
    versions: ['人教版', '北师大版', '苏教版', '沪教版'],
    tags: ['正弦余弦正切', '解直角三角形', '测量'],
    summary: '把角与边长联系起来的第一套工具，测高、测距、坡度问题都靠它。',
    concept: String.raw`
<p>在直角三角形中，锐角 \(A\) 的对边与斜边之比叫 \(\sin A\)，邻边与斜边之比叫 \(\cos A\)，对边与邻边之比叫 \(\tan A\)。三者都只与<b>角的大小</b>有关，与三角形大小无关。</p>
<h4>一、三个特殊角必须背熟</h4>
<p>\(30^\circ,45^\circ,60^\circ\) 的三角函数值要能脱口而出。记忆方法：\(\sin\) 从 \(\dfrac12,\dfrac{\sqrt2}{2},\dfrac{\sqrt3}{2}\) 递增，\(\cos\) 正好反过来，\(\tan\) 依次是 \(\dfrac{\sqrt3}{3},1,\sqrt3\)。</p>
<h4>二、解直角三角形</h4>
<p>已知一边一角（或两边），求其余元素。原则是"<b>有斜用弦，无斜用切</b>"：涉及斜边用 \(\sin\) 或 \(\cos\)，只涉及两条直角边用 \(\tan\)。</p>
<h4>三、实际问题的三个名词</h4>
<ul class="ticks">
  <li><b>仰角 / 俯角</b>：视线与水平线的夹角，一定从水平线量起。</li>
  <li><b>坡度</b>：坡面的铅直高度与水平宽度之比，等于坡角的正切值。</li>
  <li><b>方位角</b>：从正北或正南方向顺时针（逆时针）量出的角度。</li>
</ul>
<div class="note-box gold"><b class="h">解题套路</b>先把实际图形抽象成直角三角形，标出已知的边与角，再选公式；没有直角三角形时，作高把它"造"出来。</div>`,
    examples: [
      {
        title: '例题 1 · 测高',
        body: String.raw`在距塔底 \(30\sqrt3\) 米的 \(A\) 处，测得塔顶的仰角为 \(30^\circ\)，求塔高 \(h\)（测角仪高度忽略）。`,
        steps: [
          String.raw`抽象图形：塔垂直于地面，\(\triangle\) 中水平边 \(30\sqrt3\)，竖直边 \(h\)，仰角在 \(A\) 处。`,
          String.raw`\(\tan30^\circ=\dfrac{h}{30\sqrt3}\)，即 \(\dfrac{\sqrt3}{3}=\dfrac{h}{30\sqrt3}\)。`,
          String.raw`解得 \(h=\dfrac{\sqrt3}{3}\times30\sqrt3=30\)。`,
          String.raw`答：塔高 30 米。若改为已知塔高求距离，则用 \(d=\dfrac{h}{\tan30^\circ}\)。`
        ]
      },
      {
        title: '例题 2 · 同角关系求值',
        body: String.raw`已知 \(\sin\alpha=\dfrac{3}{5}\)，\(\alpha\) 为锐角，求 \(\cos\alpha\) 与 \(\tan\alpha\)。`,
        steps: [
          String.raw`用平方关系：\(\sin^2\alpha+\cos^2\alpha=1\)。`,
          String.raw`\(\cos^2\alpha=1-\dfrac{9}{25}=\dfrac{16}{25}\)，\(\alpha\) 为锐角，故 \(\cos\alpha=\dfrac45\)。`,
          String.raw`\(\tan\alpha=\dfrac{\sin\alpha}{\cos\alpha}=\dfrac{3/5}{4/5}=\dfrac34\)。`,
          String.raw`也可构造 3-4-5 直角三角形直接读出三边之比。`
        ]
      }
    ],
    formulas: [
      { f: String.raw`\(\sin A=\dfrac{\text{对边}}{\text{斜边}},\ \cos A=\dfrac{\text{邻边}}{\text{斜边}},\ \tan A=\dfrac{\text{对边}}{\text{邻边}}\)`, d: '定义，先确认是直角三角形' },
      { f: String.raw`\(\sin^2A+\cos^2A=1,\ \tan A=\dfrac{\sin A}{\cos A}\)`, d: '同角三角函数关系' },
      { f: String.raw`\(\sin30^\circ=\dfrac12,\ \sin45^\circ=\dfrac{\sqrt2}{2},\ \sin60^\circ=\dfrac{\sqrt3}{2}\)`, d: '特殊角（余弦相反顺序）' },
      { f: String.raw`\(\tan30^\circ=\dfrac{\sqrt3}{3},\ \tan45^\circ=1,\ \tan60^\circ=\sqrt3\)`, d: '特殊角正切值' },
      { f: String.raw`\(i=\dfrac{h}{l}=\tan\alpha\)`, d: '坡度等于坡角的正切' }
    ],
    pitfalls: [
      String.raw`对边与邻边认错：一定相对于所研究的锐角来判断，不能看图形左右。`,
      String.raw`特殊角函数值记混，把 \(\cos30^\circ\) 写成 \(\dfrac12\)（那是 \(\sin30^\circ\)）。`,
      String.raw`仰角从竖直线量起，或忘记加上测角仪的高度。`,
      String.raw`坡度写成"角度"：坡度是比值，通常写成 \(1:m\) 或百分数。`
    ],
    links: []
  },

  /* ================= 高一 ================= */
  {
    id: 'g1-vector',
    grade: 'g1',
    title: '平面向量',
    versions: ['人教版', '北师大版', '苏教版', '沪教版'],
    tags: ['线性运算', '数量积', '坐标法'],
    summary: '既有大小又有方向的量，用代数方法处理几何问题的第一件利器，也是解三角形与立体几何的基础。',
    concept: String.raw`
<p>向量是<b>既有大小又有方向</b>的量，记作 \(\vec a\) 或 \(\overrightarrow{AB}\)。它只由大小和方向决定，与起点位置无关（平移不变）。</p>
<h4>一、线性运算</h4>
<p>加法用三角形法则或平行四边形法则，减法"指向被减向量"。数乘 \(\lambda\vec a\) 只改变长度（\(|\lambda|\) 倍），\(\lambda<0\) 时反向。</p>
<h4>二、共线（平行）的判定</h4>
<p>\(\vec a\parallel\vec b\ (b\ne\vec 0)\iff\) 存在唯一实数 \(\lambda\) 使 \(\vec a=\lambda\vec b\)。坐标形式：\(x_1y_2-x_2y_1=0\)。</p>
<h4>三、数量积</h4>
<p>\(\vec a\cdot\vec b=|\vec a||\vec b|\cos\theta\)，结果是<b>数量</b>而不是向量。它同时承载了长度与角度信息：\(|\vec a|^2=\vec a\cdot\vec a\)，\(\cos\theta=\dfrac{\vec a\cdot\vec b}{|\vec a||\vec b|}\)。</p>
<h4>四、垂直与夹角</h4>
<p>\(\vec a\perp\vec b\iff\vec a\cdot\vec b=0\iff x_1x_2+y_1y_2=0\)。夹角范围是 \([0,\pi]\)，不是 \((0,\pi)\)。</p>`,
    examples: [
      {
        title: '例题 1 · 坐标数量积',
        body: String.raw`已知 \(\vec a=(1,2)\)，\(\vec b=(3,-1)\)，求 \(\vec a\cdot\vec b\)、\(|\vec a|\) 及两向量夹角的余弦值。`,
        steps: [
          String.raw`数量积：\(\vec a\cdot\vec b=1\times3+2\times(-1)=1\)。`,
          String.raw`模长：\(|\vec a|=\sqrt{1^2+2^2}=\sqrt5\)，\(|\vec b|=\sqrt{9+1}=\sqrt{10}\)。`,
          String.raw`\(\cos\theta=\dfrac{1}{\sqrt5\cdot\sqrt{10}}=\dfrac{1}{5\sqrt2}=\dfrac{\sqrt2}{10}\)。`,
          String.raw`因为 \(\cos\theta>0\)，所以夹角为锐角——这也说明两向量不垂直、不反向。`
        ]
      },
      {
        title: '例题 2 · 垂直求参数',
        body: String.raw`已知 \(\vec a=(2,k)\)，\(\vec b=(k,8)\)，若 \(\vec a\perp\vec b\)，求 \(k\)。`,
        steps: [
          String.raw`垂直的坐标条件：\(x_1x_2+y_1y_2=0\)。`,
          String.raw`代入：\(2k+8k=0\)，即 \(10k=0\)。`,
          String.raw`得 \(k=0\)。此时 \(\vec a=(2,0)\)，\(\vec b=(0,8)\)，确实垂直。`,
          String.raw`若条件改为"平行"，则用 \(2\times8-k\times k=0\)，解出 \(k=\pm4\)，两者不要混。`
        ]
      }
    ],
    formulas: [
      { f: String.raw`\(\vec a\pm\vec b=(x_1\pm x_2,\ y_1\pm y_2)\)`, d: '坐标线性运算' },
      { f: String.raw`\(\vec a\cdot\vec b=x_1x_2+y_1y_2=|\vec a||\vec b|\cos\theta\)`, d: '数量积两种算法，结果为数' },
      { f: String.raw`\(\vec a\parallel\vec b\iff x_1y_2-x_2y_1=0\)`, d: '平行（共线）条件，别写成数量积为 0' },
      { f: String.raw`\(\vec a\perp\vec b\iff x_1x_2+y_1y_2=0\)`, d: '垂直条件' },
      { f: String.raw`\(\cos\theta=\dfrac{\vec a\cdot\vec b}{|\vec a||\vec b|}\)`, d: '夹角公式，注意范围 \([0,\pi]\)' }
    ],
    pitfalls: [
      String.raw`把数量积当成向量：\(\vec a\cdot\vec b\) 是一个实数，不能继续加向量。`,
      String.raw`平行与垂直条件写反：平行用"交叉相乘相减"，垂直用"对应相乘相加"。`,
      String.raw`求夹角时忘记 \(\theta\in[0,\pi]\)，出现负角或超过 \(180^\circ\) 的结果。`,
      String.raw`用坐标求模时漏平方根，直接写 \(x^2+y^2\)。`
    ],
    links: []
  },
  {
    id: 'g1-solid',
    grade: 'g1',
    title: '立体几何初步',
    versions: ['人教版', '北师大版', '苏教版', '沪教版'],
    tags: ['三视图', '表面积体积', '平行与垂直'],
    summary: '从空间几何体的度量到点线面位置关系，训练"把三维问题降到二维"的想象力与证明规范。',
    concept: String.raw`
<p>空间几何体分两类：多面体（棱柱、棱锥、棱台）与旋转体（圆柱、圆锥、圆台、球）。研究它们要同时掌握<b>画法</b>（三视图、直观图）与<b>度量</b>（表面积、体积）。</p>
<h4>一、三视图</h4>
<p>正视图看"长与高"，侧视图看"宽与高"，俯视图看"长与宽"。口诀：<b>长对正、高平齐、宽相等</b>。由三视图还原几何体时，先定底面形状，再定高。</p>
<h4>二、体积与表面积</h4>
<p>柱体 \(V=Sh\)，锥体 \(V=\dfrac13Sh\)（这个 \(\dfrac13\) 是最容易丢的分），台体介于两者之间，球 \(V=\dfrac43\pi R^3\)、\(S=4\pi R^2\)。</p>
<h4>三、点线面位置关系</h4>
<p>线面平行的判定：平面外一条直线与平面内一条直线平行，则线面平行。线面垂直的判定：一条直线与平面内<b>两条相交</b>直线都垂直。</p>
<h4>四、证明的书写规范</h4>
<ul class="ticks">
  <li>每一步都要写依据（判定定理、性质定理），不能只写结论。</li>
  <li>"两条相交直线"缺一不可，写成"两条直线"会被扣分。</li>
  <li>辅助线要在图上画出并说明作法。</li>
</ul>`,
    examples: [
      {
        title: '例题 1 · 锥体体积',
        body: String.raw`已知正四棱锥底面边长为 \(4\)，高为 \(3\)，求它的体积与侧面面积。`,
        steps: [
          String.raw`底面积 \(S=4\times4=16\)。`,
          String.raw`体积 \(V=\dfrac13Sh=\dfrac13\times16\times3=16\)。`,
          String.raw`侧面是等腰三角形，底边 \(4\)，斜高用勾股定理：\(\sqrt{3^2+2^2}=\sqrt{13}\)。`,
          String.raw`侧面积 \(=\dfrac12\times4\times4\times\sqrt{13}=8\sqrt{13}\)（四个侧面）。`
        ]
      },
      {
        title: '例题 2 · 线面平行证明',
        body: String.raw`在正方体 \(ABCD-A_1B_1C_1D_1\) 中，求证 \(BD\parallel\) 平面 \(B_1D_1C\)。`,
        steps: [
          String.raw`连接 \(B_1D_1\)。正方体中 \(BD\parallel B_1D_1\)（对应棱平行）。`,
          String.raw`\(B_1D_1\subset\) 平面 \(B_1D_1C\)，而 \(BD\not\subset\) 该平面。`,
          String.raw`由线面平行判定定理：平面外一条直线与平面内一条直线平行，则线面平行。`,
          String.raw`故 \(BD\parallel\) 平面 \(B_1D_1C\)。书写时必须写全"平面外"与"平面内"两个条件。`
        ]
      }
    ],
    formulas: [
      { f: String.raw`\(V_{\text{柱}}=Sh\)`, d: '棱柱、圆柱通用' },
      { f: String.raw`\(V_{\text{锥}}=\dfrac13Sh\)`, d: '棱锥、圆锥通用，别丢 \(\dfrac13\)' },
      { f: String.raw`\(V_{\text{球}}=\dfrac43\pi R^3,\ S_{\text{球}}=4\pi R^2\)`, d: '球的体积与表面积' },
      { f: String.raw`\(S_{\text{圆柱侧}}=2\pi rl,\ S_{\text{圆锥侧}}=\pi rl\)`, d: '旋转体侧面积（\(l\) 为母线）' },
      { f: String.raw`\(V_{\text{台}}=\dfrac13h\left(S_1+\sqrt{S_1S_2}+S_2\right)\)`, d: '台体体积，退化为柱或锥时可直接代入' }
    ],
    pitfalls: [
      String.raw`锥体体积漏乘 \(\dfrac13\)，这是立体几何最典型的失分点。`,
      String.raw`线面垂直判定只找了一条直线，忽略"两条相交直线"。`,
      String.raw`三视图还原时把宽与高对应错，导致底面尺寸错误。`,
      String.raw`求侧面积时忘记"侧面个数"，把单个三角形面积当成总侧面积。`
    ],
    links: []
  },

  /* ================= 高二 ================= */
  {
    id: 'g2-line',
    grade: 'g2',
    title: '直线与圆的方程',
    versions: ['人教版', '北师大版', '苏教版', '沪教版'],
    tags: ['斜率', '点到直线距离', '圆的方程'],
    summary: '解析几何的起点：用方程研究图形，把"位置关系"翻译成"代数运算"。',
    concept: String.raw`
<p>解析几何的核心思想是<b>用代数刻画几何</b>：直线、圆都能写成方程，位置关系就转化成了方程组的解或距离的比较。</p>
<h4>一、斜率与倾斜角</h4>
<p>斜率 \(k=\tan\alpha\)（\(\alpha\ne90^\circ\)），过两点 \(k=\dfrac{y_2-y_1}{x_2-x_1}\)。倾斜角为 \(90^\circ\) 时斜率<b>不存在</b>，此时直线形如 \(x=x_0\)，不能用点斜式。</p>
<h4>二、直线方程的五种形式</h4>
<p>点斜式、斜截式、两点式、截距式、一般式。截距式 \(\dfrac xa+\dfrac yb=1\) 要求 \(a,b\ne0\)，过原点或与坐标轴平行的直线不能用。</p>
<h4>三、距离公式</h4>
<p>点到直线 \(Ax+By+C=0\) 的距离 \(d=\dfrac{|Ax_0+By_0+C|}{\sqrt{A^2+B^2}}\)，公式里必须先把直线化成一般式。</p>
<h4>四、直线与圆</h4>
<p>判断位置关系有两条路：<b>几何法</b>比较圆心到直线的距离 \(d\) 与半径 \(r\)；<b>代数法</b>联立后看判别式。求弦长优先用几何法：\(|AB|=2\sqrt{r^2-d^2}\)，比解方程组快得多。</p>`,
    examples: [
      {
        title: '例题 1 · 求直线方程',
        body: String.raw`求过点 \(P(1,2)\) 且与直线 \(3x-4y+5=0\) 平行的直线方程。`,
        steps: [
          String.raw`平行直线斜率相同：原直线斜率 \(k=\dfrac34\)。`,
          String.raw`用点斜式：\(y-2=\dfrac34(x-1)\)。`,
          String.raw`整理成一般式：\(3x-4y+5=0\) 的平行系可写成 \(3x-4y+m=0\)。`,
          String.raw`代入 \(P(1,2)\)：\(3-8+m=0\Rightarrow m=5\)。故方程为 \(3x-4y+5=0\)——恰好与原直线重合，说明 \(P\) 在该直线上；若点不在直线上会得到不同的 \(m\)。`
        ]
      },
      {
        title: '例题 2 · 弦长',
        body: String.raw`直线 \(x-y+1=0\) 与圆 \(x^2+y^2=8\) 相交于 \(A,B\) 两点，求弦长 \(|AB|\)。`,
        steps: [
          String.raw`圆心 \((0,0)\)，半径 \(r=2\sqrt2\)。`,
          String.raw`圆心到直线距离 \(d=\dfrac{|0-0+1|}{\sqrt{1+1}}=\dfrac{\sqrt2}{2}\)。`,
          String.raw`弦长 \(|AB|=2\sqrt{r^2-d^2}=2\sqrt{8-\dfrac12}=2\sqrt{\dfrac{15}{2}}=\sqrt{30}\)。`,
          String.raw`若用代数法联立求交点再算距离，计算量明显更大。`
        ]
      }
    ],
    formulas: [
      { f: String.raw`\(k=\tan\alpha=\dfrac{y_2-y_1}{x_2-x_1}\)`, d: '斜率，注意 \(\alpha=90^\circ\) 时不存在' },
      { f: String.raw`\(y-y_0=k(x-x_0)\)`, d: '点斜式，最常用' },
      { f: String.raw`\(d=\dfrac{|Ax_0+By_0+C|}{\sqrt{A^2+B^2}}\)`, d: '点到直线距离，先化一般式' },
      { f: String.raw`\((x-a)^2+(y-b)^2=r^2\)`, d: '圆的标准方程，圆心 \((a,b)\)' },
      { f: String.raw`\(|AB|=2\sqrt{r^2-d^2}\)`, d: '弦长公式（几何法）' },
      { f: String.raw`\(k_1k_2=-1\)`, d: '两直线垂直（斜率都存在时）' }
    ],
    pitfalls: [
      String.raw`忽略斜率不存在的情况，设了 \(y=kx+b\) 却漏掉竖直线 \(x=x_0\)。`,
      String.raw`用截距式时没检查是否过原点或与坐标轴平行。`,
      String.raw`点到直线距离公式直接代入斜截式，没有先化成一般式。`,
      String.raw`判断直线与圆相交后求弦长，硬解方程组导致计算冗长易错。`
    ],
    links: []
  },
  {
    id: 'g2-count',
    grade: 'g2',
    title: '排列组合与二项式',
    versions: ['人教版', '北师大版', '苏教版', '沪教版'],
    tags: ['计数原理', '排列组合', '二项式定理'],
    summary: '分类加法、分步乘法是计数的两条基本法则，二项式定理则是它的代数延伸。',
    concept: String.raw`
<p>计数的两条基本法则：<b>分类</b>用加法（每类方法互不重叠、合起来覆盖全部），<b>分步</b>用乘法（每步缺一不可）。判断标准是"完成一件事"是否一步到位。</p>
<h4>一、排列与组合</h4>
<p>有顺序要求用排列 \(A_n^m\)，无顺序用组合 \(C_n^m\)。同一道题换个问法就从排列变成组合，例如"选 3 人"是组合，"选 3 人分别担任三个职务"是排列。</p>
<h4>二、三个高频模型</h4>
<ul class="ticks">
  <li><b>相邻问题</b>：捆绑法——把相邻元素看成一个整体，再考虑内部排列。</li>
  <li><b>不相邻问题</b>：插空法——先排其余元素，再把不相邻的元素插入空隙。</li>
  <li><b>至少 / 至多</b>：优先用"总数减去反面"，通常更快。</li>
</ul>
<h4>三、二项式定理</h4>
<p>\((a+b)^n\) 展开式的通项 \(T_{r+1}=C_n^r a^{n-r}b^r\)。注意区分<b>二项式系数</b> \(C_n^r\) 与<b>项的系数</b>（含 \(a,b\) 自带系数）；求常数项就是令 \(r\) 的指数为 0 解出 \(r\)。</p>`,
    examples: [
      {
        title: '例题 1 · 捆绑与插空',
        body: String.raw`4 名男生、3 名女生排成一排，要求女生互不相邻，共有多少种排法？`,
        steps: [
          String.raw`先排 4 名男生：\(A_4^4=24\) 种。`,
          String.raw`4 名男生形成 5 个空隙（含两端）。`,
          String.raw`从 5 个空隙中选 3 个安排女生，并考虑女生内部顺序：\(A_5^3=60\)。`,
          String.raw`总数 \(=24\times60=1440\) 种。若要求女生相邻，则用捆绑法：\(A_5^5\times A_3^3=720\)。`
        ]
      },
      {
        title: '例题 2 · 二项式常数项',
        body: String.raw`求 \(\left(2x-\dfrac{1}{x}\right)^6\) 展开式中的常数项。`,
        steps: [
          String.raw`通项 \(T_{r+1}=C_6^r(2x)^{6-r}\left(-\dfrac1x\right)^r\)。`,
          String.raw`整理 \(x\) 的指数：\((6-r)-r=6-2r\)。`,
          String.raw`常数项要求 \(6-2r=0\)，得 \(r=3\)。`,
          String.raw`代入：\(C_6^3\cdot2^3\cdot(-1)^3=20\times8\times(-1)=-160\)。注意符号与 \(2^3\) 不能漏。`
        ]
      }
    ],
    formulas: [
      { f: String.raw`\(A_n^m=\dfrac{n!}{(n-m)!}\)`, d: '排列数，有顺序' },
      { f: String.raw`\(C_n^m=\dfrac{n!}{m!(n-m)!}\)`, d: '组合数，无顺序' },
      { f: String.raw`\(C_n^m=C_n^{\,n-m}\)`, d: '对称性，可简化计算' },
      { f: String.raw`\(T_{r+1}=C_n^r a^{n-r}b^r\)`, d: '二项展开通项，\(r\) 从 0 开始' },
      { f: String.raw`\(C_n^0+C_n^1+\cdots+C_n^n=2^n\)`, d: '二项式系数之和' }
    ],
    pitfalls: [
      String.raw`有顺序却用了组合，导致答案少了阶乘倍数。`,
      String.raw`分类时各类之间重叠，或漏掉某一类，加法原理失效。`,
      String.raw`插空法忘记两端也算空隙，或漏乘内部排列。`,
      String.raw`把二项式系数 \(C_n^r\) 当成项的系数，忽略 \(a,b\) 自带的系数与符号。`
    ],
    links: []
  },

  /* ================= 高三 ================= */
  {
    id: 'g3-random',
    grade: 'g3',
    title: '随机变量及其分布',
    versions: ['人教版', '北师大版', '苏教版', '沪教版'],
    tags: ['分布列', '期望方差', '二项分布'],
    summary: '把随机试验的结果数量化，用分布列、期望与方差刻画随机现象，是概率大题的主干。',
    concept: String.raw`
<p>随机变量是把随机试验的每个结果对应到一个实数。若取值可以一一列出，就叫<b>离散型随机变量</b>。</p>
<h4>一、分布列的两条硬约束</h4>
<p>每个概率非负，且所有概率之和为 1。求完分布列一定要回头验算这一步，它是发现错误最快的方法。</p>
<h4>二、期望与方差</h4>
<p>期望 \(E(X)=\sum x_ip_i\) 反映平均水平，方差 \(D(X)=\sum (x_i-E(X))^2p_i\) 反映波动大小。它们都满足线性变换公式：\(E(aX+b)=aE(X)+b\)，\(D(aX+b)=a^2D(X)\)——注意方差是 \(a^2\) 倍，加常数不改变方差。</p>
<h4>三、三个重要分布</h4>
<ul class="ticks">
  <li><b>两点分布</b>：只有成功/失败两种结果，\(E(X)=p\)。</li>
  <li><b>二项分布</b> \(X\sim B(n,p)\)：\(n\) 次独立重复试验中成功的次数，\(P(X=k)=C_n^kp^k(1-p)^{n-k}\)，\(E(X)=np\)，\(D(X)=np(1-p)\)。</li>
  <li><b>正态分布</b> \(N(\mu,\sigma^2)\)：图象关于 \(x=\mu\) 对称，\(\sigma\) 越大越"矮胖"。</li>
</ul>
<h4>四、建模的关键：先判断分布类型</h4>
<p>看到"每次试验相互独立、成功概率相同"就要想到二项分布；看到"从有限个产品中不放回抽取"则用超几何分布，不要硬套二项分布。</p>`,
    examples: [
      {
        title: '例题 1 · 分布列与期望',
        body: String.raw`袋中有 3 个红球、2 个白球，任取 2 个，求取到红球个数 \(X\) 的分布列与期望。`,
        steps: [
          String.raw`\(X\) 的可能取值为 \(0,1,2\)，总取法 \(C_5^2=10\)。`,
          String.raw`\(P(X=0)=\dfrac{C_2^2}{10}=\dfrac1{10}\)，\(P(X=2)=\dfrac{C_3^2}{10}=\dfrac3{10}\)。`,
          String.raw`\(P(X=1)=1-\dfrac1{10}-\dfrac3{10}=\dfrac6{10}=\dfrac35\)。`,
          String.raw`\(E(X)=0\times\dfrac1{10}+1\times\dfrac35+2\times\dfrac3{10}=\dfrac35+\dfrac35=\dfrac65\)。`,
          String.raw`验算：概率和 \(\dfrac1{10}+\dfrac6{10}+\dfrac3{10}=1\)，符合要求。`
        ]
      },
      {
        title: '例题 2 · 二项分布',
        body: String.raw`某射手每次命中概率为 \(0.8\)，独立射击 5 次，求命中次数 \(X\) 的期望、方差，以及至少命中 4 次的概率。`,
        steps: [
          String.raw`每次独立、概率相同，故 \(X\sim B(5,0.8)\)。`,
          String.raw`\(E(X)=np=5\times0.8=4\)，\(D(X)=np(1-p)=5\times0.8\times0.2=0.8\)。`,
          String.raw`\(P(X=5)=0.8^5=0.32768\)。`,
          String.raw`\(P(X=4)=C_5^4\times0.8^4\times0.2=5\times0.4096\times0.2=0.4096\)。`,
          String.raw`故 \(P(X\ge4)=0.32768+0.4096=0.73728\)。`
        ]
      }
    ],
    formulas: [
      { f: String.raw`\(\sum p_i=1,\ p_i\ge0\)`, d: '分布列的基本约束，必验算' },
      { f: String.raw`\(E(X)=\sum x_ip_i\)`, d: '期望（均值）' },
      { f: String.raw`\(D(X)=E(X^2)-[E(X)]^2\)`, d: '方差的计算式，通常比定义式快' },
      { f: String.raw`\(E(aX+b)=aE(X)+b,\ D(aX+b)=a^2D(X)\)`, d: '线性变换性质' },
      { f: String.raw`\(X\sim B(n,p):\ E(X)=np,\ D(X)=np(1-p)\)`, d: '二项分布的期望与方差' }
    ],
    pitfalls: [
      String.raw`分布列概率之和不为 1，通常是漏了某个取值。`,
      String.raw`方差线性变换写成 \(D(aX+b)=aD(X)+b\)，正确是 \(a^2D(X)\)。`,
      String.raw`不放回抽取仍套二项分布，应使用超几何分布。`,
      String.raw`"至少"类问题逐个相加时漏项，或用 \(1-P\) 时补集判断错误。`
    ],
    links: []
  },
  {
    id: 'g3-complex',
    grade: 'g3',
    title: '复数',
    versions: ['人教版', '北师大版', '苏教版', '沪教版'],
    tags: ['四则运算', '共轭', '模'],
    summary: '把实数系扩充到复数系，运算规则清晰、结论固定，是高考必拿分的小题模块。',
    concept: String.raw`
<p>形如 \(z=a+bi\ (a,b\in\mathbb R)\) 的数叫复数，其中 \(i^2=-1\)。\(a\) 叫实部，\(b\) 叫虚部（注意虚部是 \(b\)，不是 \(bi\)）。</p>
<h4>一、分类</h4>
<p>\(b=0\) 时为实数；\(b\ne0\) 时为虚数；\(a=0\) 且 \(b\ne0\) 时为纯虚数。判断"纯虚数"必须同时检查实部为 0 与虚部不为 0。</p>
<h4>二、四则运算</h4>
<p>加减乘按多项式法则进行，遇到 \(i^2\) 就换成 \(-1\)。除法要乘分母的<b>共轭复数</b>，把分母实数化：\(\dfrac{a+bi}{c+di}=\dfrac{(a+bi)(c-di)}{c^2+d^2}\)。</p>
<h4>三、共轭与模</h4>
<p>共轭复数 \(\bar z=a-bi\)，满足 \(z\bar z=|z|^2=a^2+b^2\)。模 \(|z|=\sqrt{a^2+b^2}\) 是复平面内对应点到原点的距离。</p>
<h4>四、几何意义</h4>
<p>复数 \(z=a+bi\) 对应复平面内的点 \((a,b)\)。\(|z-z_0|=r\) 表示以 \(z_0\) 为圆心、\(r\) 为半径的圆，这是复数与解析几何的结合点。</p>`,
    examples: [
      {
        title: '例题 1 · 除法化简',
        body: String.raw`化简 \(\dfrac{1+i}{1-i}\)。`,
        steps: [
          String.raw`分子分母同乘分母的共轭 \(1+i\)。`,
          String.raw`分母：\((1-i)(1+i)=1^2-i^2=1+1=2\)。`,
          String.raw`分子：\((1+i)^2=1+2i+i^2=2i\)。`,
          String.raw`故原式 \(=\dfrac{2i}{2}=i\)。它的实部为 0、虚部为 1，是纯虚数。`
        ]
      },
      {
        title: '例题 2 · 模与共轭',
        body: String.raw`已知 \(z=3-4i\)，求 \(|z|\)、\(\bar z\) 及 \(z\bar z\)。`,
        steps: [
          String.raw`模：\(|z|=\sqrt{3^2+(-4)^2}=\sqrt{25}=5\)。`,
          String.raw`共轭：\(\bar z=3+4i\)（虚部变号）。`,
          String.raw`\(z\bar z=3^2+4^2=25\)，正好等于 \(|z|^2\)。`,
          String.raw`这条恒等式 \(z\bar z=|z|^2\) 在求模与化简中反复使用。`
        ]
      }
    ],
    formulas: [
      { f: String.raw`\(i^2=-1,\ i^4=1\)`, d: '周期性：\(i^{4k}=1,\ i^{4k+1}=i,\ i^{4k+2}=-1,\ i^{4k+3}=-i\)' },
      { f: String.raw`\((a+bi)\pm(c+di)=(a\pm c)+(b\pm d)i\)`, d: '加减：实部虚部分别运算' },
      { f: String.raw`\((a+bi)(c+di)=(ac-bd)+(ad+bc)i\)`, d: '乘法按多项式展开后合并' },
      { f: String.raw`\(\bar z=a-bi,\ z\bar z=|z|^2\)`, d: '共轭与模的关系' },
      { f: String.raw`\(|z|=\sqrt{a^2+b^2}\)`, d: '模长（复平面内到原点的距离）' }
    ],
    pitfalls: [
      String.raw`把虚部写成 \(bi\)（带 i），导致纯虚数判断出错。`,
      String.raw`除法只乘分子不乘分母，或乘错共轭（应乘 \(c-di\)）。`,
      String.raw`\(i^2\) 忘记换成 \(-1\)，最后结果里残留 \(i^2\)。`,
      String.raw`判断纯虚数只检查实部为 0，忘记虚部不能为 0。`
    ],
    links: []
  }
];
