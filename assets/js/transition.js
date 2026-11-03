/* ============================================================
   transition.js · 页面过渡与预取
   1) 支持 View Transitions 的浏览器：走 CSS 跨文档过渡（零延迟）
   2) 其余浏览器：离场遮罩淡出 + 入场淡入 + 顶部进度条
   3) 悬停/聚焦预取目标页与资源，让跳转几乎瞬时
   4) 同页锚点平滑滚动；标签页不可见时暂停装饰动画
   ============================================================ */
(function () {
  const KEY = 'ms_navigating';
  const root = document.documentElement;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  /* 跨文档视图过渡：Chromium 126+ 起支持，且 CSS.supports 无法探测 at-rule，故按内核版本判定 */
  const chromeVer = (function () { const m = /Chrome\/(\d+)/.exec(navigator.userAgent); return m ? parseInt(m[1], 10) : 0; })();
  const crossVT = typeof document.startViewTransition === 'function' && chromeVer >= 126;
  const cached = new Set();

  /* ---------- 预取 ---------- */
  function prefetch(url, high) {
    if (!url || cached.has(url)) return;
    cached.add(url);
    try {
      fetch(url, { credentials: 'same-origin', priority: high ? 'high' : 'low' }).catch(() => { });
    } catch (e) { }
  }
  function linkOf(e) {
    const el = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    if (!el) return null;
    if (el.target && el.target !== '_self') return null;
    const href = el.getAttribute('href') || '';
    if (/^(https?:)?\/\//i.test(href) && el.host && el.host !== location.host) return null;
    if (/^(mailto:|tel:|javascript:)/i.test(href)) return null;
    if (/\.(pdf|zip|png|jpg|svg|wav|mp3)$/i.test(href)) return null;
    if (!/\.html($|\?|#)/.test(href.split('/').pop() || '') && href.indexOf('.html') < 0) return null;
    return el;
  }
  ['mouseover', 'focusin', 'touchstart', 'pointerdown'].forEach(ev => {
    document.addEventListener(ev, e => { const a = linkOf(e); if (a) prefetch(a.href); }, { passive: true, capture: true });
  });
  /* 空闲时预取主导航目标 */
  const idle = window.requestIdleCallback || (fn => setTimeout(fn, 1200));
  idle(() => ['learn.html', 'practice.html', 'ai.html', 'profile.html'].forEach(u => prefetch(new URL(u, location.href).href)));

  /* ---------- 遮罩与进度条 ---------- */
  function veil() {
    let el = document.getElementById('page-veil');
    if (!el) { el = document.createElement('div'); el.id = 'page-veil'; document.body.appendChild(el); }
    return el;
  }
  function bar() {
    let el = document.getElementById('page-bar');
    if (!el) { el = document.createElement('div'); el.id = 'page-bar'; document.body.appendChild(el); }
    return el;
  }

  /* ---------- 离场 ---------- */
  function leave(href) {
    sessionStorage.setItem(KEY, '1');
    prefetch(href, true);
    if (crossVT || reduced) { location.href = href; return; } // 由 CSS 跨文档过渡接管
    const v = veil(), b = bar();
    b.style.width = '0%'; b.classList.remove('done');
    requestAnimationFrame(() => { b.style.width = '62%'; });
    v.classList.add('on');
    setTimeout(() => { location.href = href; }, 190);
  }

  /* ---------- 入场 ---------- */
  function arrive() {
    const came = sessionStorage.getItem(KEY) === '1';
    if (came) sessionStorage.removeItem(KEY);
    if (!came || reduced || crossVT) return; // 跨文档过渡自带入场，无需再淡入
    root.classList.add('page-enter');
    const b = bar();
    b.style.width = '0%'; b.classList.remove('done');
    requestAnimationFrame(() => { b.style.width = '100%'; });
    setTimeout(() => { b.classList.add('done'); }, 260);
    setTimeout(() => root.classList.remove('page-enter'), 420);
    setTimeout(() => { const el = document.getElementById('page-bar'); if (el) el.remove(); }, 700);
  }

  /* ---------- 点击拦截 ---------- */
  document.addEventListener('click', e => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = linkOf(e);
    if (!a) return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin) return;
    if (url.pathname === location.pathname) {
      if (url.hash) {                       // 同页锚点：平滑滚动 + 记录历史
        e.preventDefault();
        const t = document.querySelector(url.hash);
        if (t) t.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
        history.pushState(null, '', url.hash);
        const links = document.getElementById('nav-links');
        if (links) links.classList.remove('open');
      }
      return;
    }
    /* 支持跨文档过渡时不做拦截：原生导航自带平滑交叉淡化，且零额外延迟 */
    if (crossVT || reduced) { prefetch(url.href, true); return; }
    e.preventDefault();
    leave(url.href);
  });

  /* ---------- 前进/后退（bfcache）不重放入场动画 ---------- */
  window.addEventListener('pageshow', e => {
    if (e.persisted) { root.classList.remove('page-enter'); const v = document.getElementById('page-veil'); if (v) v.classList.remove('on'); }
  });

  /* ---------- 标签页不可见时暂停装饰动画 ---------- */
  document.addEventListener('visibilitychange', () => {
    root.classList.toggle('anim-paused', document.hidden);
  });
  if (document.hidden) root.classList.add('anim-paused');

  /* ---------- 启动 ---------- */
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arrive, { once: true });
  else arrive();
})();
