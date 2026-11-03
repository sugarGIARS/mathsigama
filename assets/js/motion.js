/* ============================================================
   motion.js · 轻动效层
   ------------------------------------------------------------
   1) 网格/列表子项逐级浮现（含异步渲染的卡片）
   2) 按钮与选项的涟漪反馈
   3) 首屏视差（跟随指针，幅度很小）
   4) 顶部导航兼作阅读进度条
   5) 数字滚动（供统计数字调用）
   全部尊重 prefers-reduced-motion，触屏设备自动降级
   ============================================================ */
(function () {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------- 1. 逐级浮现 ---------- */
  const CARD_SEL = '.kp-card, .q-card, .feature-card, .reco-card, .path-card, .kp-item, .plan-row, .flow-step, .stat-box, .mini-stat';
  const STEP = 35;          // 每项延迟
  const MAX_STEP = 14;      // 最多累积 14 级

  function stagger() {
    if (reduced) return;
    const buckets = new Map();
    document.querySelectorAll(CARD_SEL).forEach(el => {
      if (el.dataset.mv === '1') return;
      const p = el.parentElement;
      if (!p) return;
      const i = buckets.get(p) || 0;
      buckets.set(p, i + 1);
      el.dataset.mv = '1';
      el.style.setProperty('--d', (Math.min(i, MAX_STEP) * STEP) + 'ms');
      el.classList.add('mv-in');
    });
  }

  /* ---------- 2. 涟漪 ---------- */
  function initRipple() {
    if (reduced) return;
    document.addEventListener('pointerdown', e => {
      const t = e.target.closest('.btn, .icon-btn, .chip, .grade-tab, .ver-chip, .q-opt, .nav-link, .kp-item');
      if (!t || t.disabled) return;
      const r = t.getBoundingClientRect();
      const size = Math.max(r.width, r.height) * 1.1;
      const sp = document.createElement('span');
      sp.className = 'ripple';
      sp.style.width = sp.style.height = size + 'px';
      sp.style.left = (e.clientX - r.left - size / 2) + 'px';
      sp.style.top = (e.clientY - r.top - size / 2) + 'px';
      t.appendChild(sp);
      setTimeout(() => sp.remove(), 640);
    }, { passive: true });
  }

  /* ---------- 3. 首屏视差 ---------- */
  function initParallax() {
    if (reduced || !fine || window.innerWidth < 900) return;
    const hero = document.querySelector('.home-hero, .m-hero');
    if (!hero) return;
    const right = document.querySelector('.hh-right');
    const ring = document.querySelector('.m-ring');
    if (!right && !ring) return;
    let tx = 0, ty = 0, raf = 0;
    function apply() {
      raf = 0;
      if (right) {
        right.style.setProperty('--px', (tx * 8).toFixed(2) + 'px');
        right.style.setProperty('--py', (ty * 6).toFixed(2) + 'px');
      }
      if (ring && ring.closest('.home-hero')) {
        ring.style.setProperty('--px', (tx * 16).toFixed(2) + 'px');
        ring.style.setProperty('--py', (ty * 12).toFixed(2) + 'px');
      }
    }
    hero.addEventListener('pointermove', e => {
      const r = hero.getBoundingClientRect();
      tx = (e.clientX - r.left) / r.width * 2 - 1;
      ty = (e.clientY - r.top) / r.height * 2 - 1;
      if (!raf) raf = requestAnimationFrame(apply);
    }, { passive: true });
    hero.addEventListener('pointerleave', () => {
      tx = ty = 0;
      if (!raf) raf = requestAnimationFrame(apply);
    }, { passive: true });
  }

  /* ---------- 6. 背景舞台 ---------- */
  function initBackdrop() {
    if (document.querySelector('.bg-stage')) return;
    const stage = document.createElement('div');
    stage.className = 'bg-stage';
    stage.setAttribute('aria-hidden', 'true');
    const mobile = window.innerWidth < 900;
    const GLYPHS = ['π', '√', '∑', '∫', '∞', 'θ', 'Δ', '≈', 'φ', '∂', 'λ'];
    /* 贴着版面四周放，尽量避开标题与卡片 */
    const POS = [[3, 9], [88, 5], [93, 33], [95, 62], [5, 31], [2, 64],
    [52, 91], [70, 64], [24, 88], [44, 4], [84, 86]];
    /* 窄屏只在四个角上留符号，别贴着正文 */
    const pos = mobile ? [POS[0], POS[1], POS[6], POS[9]] : POS;
    let glyphs = '';
    for (let i = 0; i < pos.length; i++) {
      const fs = (mobile ? 32 : 40) + (i % 4) * 14;
      const r = (i % 2 ? 1 : -1) * (5 + (i % 3) * 4);
      glyphs += '<span style="--t:' + pos[i][1] + '%;--l:' + pos[i][0] + '%;--fs:' + fs +
        'px;--r:' + r + 'deg;--dx:' + ((i % 3) * 14 - 14) + 'px;--dur:' + (16 + i * 1.8).toFixed(1) +
        's;--dly:' + (i * .35).toFixed(2) + 's;--op:' + (mobile ? .11 : .16) + '">' + GLYPHS[i] + '</span>';
    }
    /* 底部一条流动的正弦线，作为整站的水印式记号 */
    let wave = '';
    for (let x = 0; x <= 1440; x += 10) {
      const y = (62 + 30 * Math.sin((x / 1440) * Math.PI * 4)).toFixed(1);
      wave += (x === 0 ? 'M' : 'L') + x + ' ' + y;
    }
    stage.innerHTML =
      '<span class="bg-blob b1"><i></i></span>' +
      '<span class="bg-blob b2"><i></i></span>' +
      '<span class="bg-blob b3"><i></i></span>' +
      '<span class="bg-blob b4"><i></i></span>' +
      '<span class="bg-blob b5"><i></i></span>' +
      '<span class="bg-rules"></span>' +
      '<span class="bg-grid"></span>' +
      '<span class="bg-glyphs">' + glyphs + '</span>' +
      '<span class="bg-sweep"></span>' +
      '<svg class="bg-wave" viewBox="0 0 1440 124" preserveAspectRatio="none" aria-hidden="true">' +
      '<path class="base" d="' + wave + '"></path>' +
      '<path class="flow" d="' + wave + '"></path>' +
      '</svg>' +
      '<span class="bg-noise"></span>' +
      '<span class="bg-vignette"></span>';
    document.body.appendChild(stage);
  }

  /* ---------- 6b. 背景跟随鼠标的轻微视差 ---------- */
  function initBgPointer() {
    if (reduced || !window.matchMedia('(hover: hover)').matches) return;
    const root = document.documentElement;
    let tx = 0, ty = 0, cx = 0, cy = 0, raf = 0;
    function step() {
      cx += (tx - cx) * .08;
      cy += (ty - cy) * .08;
      root.style.setProperty('--mx', cx.toFixed(4));
      root.style.setProperty('--my', cy.toFixed(4));
      raf = (Math.abs(tx - cx) > .0008 || Math.abs(ty - cy) > .0008) ? requestAnimationFrame(step) : 0;
    }
    window.addEventListener('pointermove', e => {
      tx = (e.clientX / window.innerWidth - .5) * 2;
      ty = (e.clientY / window.innerHeight - .5) * 2;
      if (!raf) raf = requestAnimationFrame(step);
    }, { passive: true });
  }

  /* ---------- 7. 首屏光尘 ---------- */
  function initDust() {
    if (reduced || window.innerWidth < 900) return;
    document.querySelectorAll('.home-hero, .m-hero').forEach(hero => {
      if (hero.querySelector('.bg-dust')) return;
      const box = document.createElement('span');
      box.className = 'bg-dust';
      box.setAttribute('aria-hidden', 'true');
      const n = 9;
      let html = '';
      for (let i = 0; i < n; i++) {
        const left = (5 + (i * 37) % 90).toFixed(1);
        const dur = 15 + (i % 5) * 3;
        const dly = ((i * 2.6) % 17).toFixed(1);
        const dx = (i % 2 ? -1 : 1) * (16 + (i % 4) * 12);
        const size = 3 + (i % 3);
        html += '<i style="left:' + left + '%;width:' + size + 'px;height:' + size + 'px;' +
          '--dur:' + dur + 's;--dly:' + dly + 's;--dx:' + dx + 'px"></i>';
      }
      box.innerHTML = html;
      hero.appendChild(box);
    });
  }

  /* ---------- 4. 阅读进度 ---------- */
  function initProgress() {
    let raf = 0;
    function upd() {
      raf = 0;
      const h = document.documentElement.scrollHeight - window.innerHeight;
      const p = h > 0 ? Math.min(1, window.scrollY / h) : 0;
      /* 写在根元素上，导航由 JS 渲染也能继承到 */
      document.documentElement.style.setProperty('--sp', (p * 100).toFixed(2) + '%');
      /* 背景层做轻微视差，滚动时产生纵深 */
      document.documentElement.style.setProperty('--sy', String(Math.round(window.scrollY)));
    }
    window.addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(upd); }, { passive: true });
    window.addEventListener('resize', upd, { passive: true });
    upd();
  }

  /* ---------- 5. 数字滚动 ---------- */
  function count(el, to, ms, suffix) {
    if (!el) return;
    const dur = ms || 700;
    const tail = suffix === undefined ? '' : suffix;
    if (reduced) { el.textContent = to + tail; return; }
    const from = parseFloat(String(el.textContent).replace(/[^\d.-]/g, '')) || 0;
    if (from === to) { el.textContent = to + tail; return; }
    const t0 = performance.now();
    if (el.__mvTimer) cancelAnimationFrame(el.__mvTimer);
    function step(t) {
      const k = Math.min(1, (t - t0) / dur);
      const e = 1 - Math.pow(1 - k, 3);
      el.textContent = Math.round(from + (to - from) * e) + tail;
      if (k < 1) el.__mvTimer = requestAnimationFrame(step);
      else el.__mvTimer = 0;
    }
    el.__mvTimer = requestAnimationFrame(step);
  }

  /* ---------- 启动 ---------- */
  function boot() {
    initBackdrop();
    initBgPointer();
    stagger();
    initRipple();
    initParallax();
    initProgress();
    initDust();
    /* 异步渲染的卡片（练习/推荐等）补上入场动效 */
    let timer = 0;
    new MutationObserver(() => {
      if (timer) return;
      timer = setTimeout(() => { timer = 0; stagger(); }, 140);
    }).observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  window.Motion = { count, stagger, reduced };
})();
