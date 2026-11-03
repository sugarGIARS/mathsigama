/* ============================================================
   app.js · 公共组件
   导航 / 页脚 / 提示 / 加载动画 / 公式渲染 / 音乐配乐 / 鉴权
   ============================================================ */

/* ---------------- 小工具 ---------------- */
const $ = (s, r) => (r || document).querySelector(s);
const $$ = (s, r) => Array.prototype.slice.call((r || document).querySelectorAll(s));
function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function fmtDur(sec) {
  sec = Math.max(0, Math.round(sec));
  const m = Math.floor(sec / 60), s = sec % 60;
  return m + ':' + String(s).padStart(2, '0');
}
function fmtDate(ts) { return new Date(ts).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }); }
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

/* ---------------- 图标 ---------------- */
const ICON = {
  book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>',
  pen: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>',
  robot: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="8" width="18" height="12" rx="3"/><path d="M12 8V4M8 4h8"/><circle cx="9" cy="14" r="1.2" fill="currentColor"/><circle cx="15" cy="14" r="1.2" fill="currentColor"/></svg>',
  chart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="M7 15l4-5 3 3 5-7"/></svg>',
  user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-6 8-6s8 2 8 6"/></svg>',
  music: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>',
  sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M19 5l-1.5 1.5M6.5 17.5L5 19"/></svg>',
  moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>',
  menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
  download: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12"/><path d="M7 11l5 5 5-5"/><path d="M4 20h16"/></svg>',
  logout: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M10 17H6a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h4"/><path d="M15 8l4 4-4 4M19 12H9"/></svg>',
  send: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4z"/></svg>',
  image: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9.5" r="1.5"/><path d="M21 16l-5-5-9 9"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>',
  warn: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 8v5M12 17h.01"/><circle cx="12" cy="12" r="9"/></svg>',
  info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 11v6M12 7h.01"/><circle cx="12" cy="12" r="9"/></svg>'
};

/* ---------------- 导航 & 页脚 ---------------- */
const NAV_LINKS = [
  { href: 'index.html', name: '首页', key: 'index' },
  { href: 'learn.html', name: '课程学习', key: 'learn' },
  { href: 'practice.html', name: '习题练习', key: 'practice' },
  { href: 'ai.html', name: 'AI 答疑', key: 'ai' },
  { href: 'profile.html', name: '个人中心', key: 'profile' }
];

function renderNav(active) {
  const root = $('#nav-root');
  if (!root) return;
  const u = Store.Account.current();
  root.innerHTML = `
  <header class="nav" id="nav">
    <div class="nav-inner">
      <a class="brand" href="index.html" data-link>
        <span class="brand-mark"><b>Σ</b></span>
        <span class="brand-text"><span class="brand-name">MathSigma</span><span class="brand-sub">数理 · 人文课堂</span></span>
      </a>
      <nav class="nav-links" id="nav-links">
        ${NAV_LINKS.map(l => `<a class="nav-link ${active === l.key ? 'active' : ''}" href="${l.href}" data-link>${l.name}</a>`).join('')}
        ${u ? '' : '<a class="nav-link nav-login" href="login.html" data-link>登录 / 注册</a>'}
      </nav>
      <div class="nav-tools">
        <button class="icon-btn" id="btn-theme" title="切换深色 / 浅色">${Store.Prefs.get('theme', 'light') === 'dark' ? ICON.moon : ICON.sun}</button>
        <button class="icon-btn" id="btn-music" title="配乐播放器">${ICON.music}</button>
        <button class="icon-btn nav-toggle" id="btn-menu" title="菜单">${ICON.menu}</button>
        ${u ? `<a class="nav-user" href="profile.html" data-link>
            <span class="avatar">${esc(u.avatarText || u.username.slice(0, 1).toUpperCase())}</span>
            <span class="nav-user-name">${esc(u.nickname || u.username)}</span>
          </a>
          <button class="icon-btn" id="btn-logout" title="退出登录">${ICON.logout}</button>`
        : `<a class="btn btn-primary btn-sm" href="login.html" data-link>登录 / 注册</a>`}
      </div>
    </div>
  </header>`;

  $('#btn-menu').addEventListener('click', () => $('#nav-links').classList.toggle('open'));
  $('#btn-theme').addEventListener('click', () => {
    const cur = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    const next = cur === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    Store.Prefs.set('theme', next);
    $('#btn-theme').innerHTML = next === 'dark' ? ICON.moon : ICON.sun;
    toast(next === 'dark' ? '已切换到夜间护眼模式' : '已切换到日间模式', 'info');
  });
  $('#btn-music').addEventListener('click', () => MusicDock.toggle());
  const lo = $('#btn-logout');
  if (lo) lo.addEventListener('click', () => {
    confirmBox('确认退出登录吗？', () => { Store.Account.logout(); location.href = 'index.html'; });
  });
  window.addEventListener('scroll', () => {
    const n = $('#nav'); if (n) n.classList.toggle('scrolled', window.scrollY > 8);
    updateScrollProgress();
  }, { passive: true });
  updateScrollProgress();
}

/* 页面阅读进度（朱砂细线） */
function updateScrollProgress() {
  let bar = $('#scroll-progress');
  if (!bar) {
    bar = document.createElement('div');
    bar.id = 'scroll-progress';
    document.body.appendChild(bar);
  }
  const h = document.documentElement;
  const max = h.scrollHeight - h.clientHeight;
  bar.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + '%';
}

function renderFooter() {
  const root = $('#footer-root');
  if (!root) return;
  root.innerHTML = `
  <footer class="footer">
    <div class="container">
      <div class="footer-grid">
        <div>
          <div class="brand" style="margin-bottom:14px">
            <span class="brand-mark"><b>Σ</b></span>
            <span class="brand-text"><span class="brand-name">MathSigma · 数理人文课堂</span><span class="brand-sub">学 · 练 · 问 · 评</span></span>
          </div>
          <p style="font-size:13.5px;max-width:340px">面向中学数学的人文学习平台：电子课本、分层题库、AI 引导式答疑与个性化学习反馈。万物皆数，弦图可证；学而时习，温故知新。</p>
        </div>
        <div>
          <h4>学习中心</h4>
          <ul>
            <li><a href="learn.html" data-link>课程学习</a></li>
            <li><a href="practice.html" data-link>习题练习</a></li>
            <li><a href="ai.html" data-link>AI 答疑</a></li>
            <li><a href="profile.html" data-link>学习报告</a></li>
          </ul>
        </div>
        <div>
          <h4>账号</h4>
          <ul>
            <li><a href="register.html" data-link>注册新账号</a></li>
            <li><a href="login.html" data-link>登录</a></li>
            <li><a href="profile.html" data-link>个人中心</a></li>
            <li><a href="profile.html#mistakes" data-link>我的错题本</a></li>
            <li><a href="admin.html" data-link>管理端</a></li>
          </ul>
        </div>
        <div>
          <h4>扩展资源（站外）</h4>
          <ul>
            <li><a href="https://www.khanacademy.org/math" target="_blank" rel="noopener">可汗学院数学</a></li>
            <li><a href="https://www.wolframalpha.com/" target="_blank" rel="noopener">Wolfram Alpha</a></li>
            <li><a href="https://www.desmos.com/calculator" target="_blank" rel="noopener">Desmos 图形计算器</a></li>
            <li><a href="https://jc.pep.com.cn/" target="_blank" rel="noopener">人教版教材</a></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <span>© ${new Date().getFullYear()} MathSigma 数理人文课堂 · 仅供教学演示使用</span>
        <span>题库与记录由服务端 SQLite 数据库承载，学习数据同时缓存在本机浏览器</span>
      </div>
    </div>
  </footer>`;
}

/* ---------------- 提示 & 加载 ---------------- */
function toast(msg, type, ms) {
  let wrap = $('.toast-wrap');
  if (!wrap) { wrap = document.createElement('div'); wrap.className = 'toast-wrap'; document.body.appendChild(wrap); }
  const t = document.createElement('div');
  t.className = 'toast ' + (type || 'info');
  const ic = type === 'success' ? ICON.check : (type === 'error' ? ICON.warn : ICON.info);
  t.innerHTML = `<span class="ti">${ic}</span><div>${msg}</div>`;
  wrap.appendChild(t);
  setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 320); }, ms || 2600);
}

function showLoader(text) {
  let m = $('.loader-mask');
  if (!m) {
    m = document.createElement('div');
    m.className = 'loader-mask';
    m.innerHTML = `<div class="loader"><div class="ring"></div><p>${esc(text || '正在加载…')}</p></div>`;
    document.body.appendChild(m);
  }
  return m;
}
function hideLoader() { const m = $('.loader-mask'); if (m) m.remove(); }

function confirmBox(msg, onOk) {
  const m = document.createElement('div');
  m.className = 'loader-mask';
  m.innerHTML = `<div class="card" style="max-width:360px;padding:26px;text-align:center">
      <p style="font-size:15px;margin-bottom:20px">${esc(msg)}</p>
      <div style="display:flex;gap:10px;justify-content:center">
        <button class="btn btn-ghost" id="cf-no">取消</button>
        <button class="btn btn-primary" id="cf-yes">确定</button>
      </div></div>`;
  document.body.appendChild(m);
  m.querySelector('#cf-no').onclick = () => m.remove();
  m.querySelector('#cf-yes').onclick = () => { m.remove(); onOk && onOk(); };
}

/* ---------------- 公式渲染（KaTeX） ---------------- */
function renderMath(root) {
  root = root || document;
  if (window.renderMathInElement) {
    try {
      window.renderMathInElement(root, {
        delimiters: [
          { left: '$$', right: '$$', display: true },
          { left: '\\[', right: '\\]', display: true },
          { left: '\\(', right: '\\)', display: false },
          { left: '$', right: '$', display: false }
        ],
        throwOnError: false,
        strict: false
      });
      return;
    } catch (e) { /* 忽略，走降级方案 */ }
  }
  // 降级：无 KaTeX 时用等宽字体展示原始公式
  $$('.katex-fallback', root);
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const list = [];
  while (walker.nextNode()) {
    const n = walker.currentNode;
    if (n.nodeValue && /\\[()[\]]|\$[^$]+\$/.test(n.nodeValue)) list.push(n);
  }
  list.forEach(n => {
    const span = document.createElement('span');
    span.className = 'katex-fallback';
    span.style.cssText = 'font-family:var(--font-mono);background:var(--card-2);padding:1px 5px;border-radius:5px;font-size:.95em';
    span.textContent = n.nodeValue.replace(/\\\(|\\\)|\\\[|\\\]|\$/g, '');
    n.parentNode.replaceChild(span, n);
  });
}

/* ---------------- 滚动揭示 ---------------- */
function initReveal() {
  const io = new IntersectionObserver(es => {
    es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: .12 });
  $$('.reveal').forEach(el => io.observe(el));
}

/* ---------------- 站外链接新标签打开 ---------------- */
function initExternalLinks() {
  $$('a').forEach(a => {
    const href = a.getAttribute('href') || '';
    if (/^https?:\/\//i.test(href) && a.host && location.host && a.host !== location.host) {
      a.setAttribute('target', '_blank'); a.setAttribute('rel', 'noopener');
    }
  });
}

/* ---------------- 鉴权 ---------------- */
function requireLogin() {
  const u = Store.Account.current();
  if (!u) {
    toast('请先登录，再使用该功能', 'warn');
    setTimeout(() => { location.href = 'login.html?redirect=' + encodeURIComponent(location.pathname.split('/').pop()); }, 700);
    return null;
  }
  return u;
}

/* ============================================================
   音乐配乐引擎（Web Audio 实时合成 + 可下载 WAV）
   ============================================================ */
const TRACKS = [
  { id: 'morning', name: '晨读 · 清心', desc: '五声音阶 · 舒缓明亮', bpm: 64, wave: 'sine', base: 261.63, scale: [0, 2, 4, 7, 9], pad: true },
  { id: 'focus', name: '演算 · 专注', desc: '稳定律动 · 沉静思考', bpm: 76, wave: 'triangle', base: 220.00, scale: [0, 3, 5, 7, 10], pad: true },
  { id: 'night', name: '夜读 · 静思', desc: '低频暖声 · 极慢', bpm: 52, wave: 'sine', base: 196.00, scale: [0, 2, 3, 7, 8], pad: true }
];

const Music = {
  ctx: null, master: null, timer: null, playing: false,
  trackIndex: Store.Prefs.get('track', 0), volume: Store.Prefs.get('volume', 0.45),
  nextTime: 0, step: 0, fileUrl: null, audioEl: null,

  ensure() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.volume;
      this.master.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
    return true;
  },
  freq(base, semi) { return base * Math.pow(2, semi / 12); },
  note(ctx, dest, freq, t, dur, wave, amp) {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    const f = ctx.createBiquadFilter();
    f.type = 'lowpass'; f.frequency.value = 3200;
    o.type = wave; o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(amp, t + 0.04);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(f); f.connect(g); g.connect(dest);
    o.start(t); o.stop(t + dur + 0.1);
    // 泛音层，增加"钢琴感"
    const o2 = ctx.createOscillator(), g2 = ctx.createGain();
    o2.type = 'sine'; o2.frequency.value = freq * 2;
    g2.gain.setValueAtTime(0.0001, t);
    g2.gain.linearRampToValueAtTime(amp * 0.28, t + 0.05);
    g2.gain.exponentialRampToValueAtTime(0.0001, t + dur * 0.7);
    o2.connect(g2); g2.connect(dest);
    o2.start(t); o2.stop(t + dur + 0.1);
  },
  /* 把一段音乐排进任意 AudioContext（实时播放 / 离线渲染共用） */
  schedule(ctx, dest, track, from, duration) {
    const beat = 60 / track.bpm;
    const total = Math.ceil(duration / beat) + 1;
    for (let i = 0; i < total; i++) {
      const t = from + i * beat;
      const idx = (this.step + i) % track.scale.length;
      const oct = ((this.step + i) % 10 < 5) ? 0 : 12;
      const f = this.freq(track.base, track.scale[idx] + oct);
      // 主旋律
      this.note(ctx, dest, f, t, beat * 1.9, track.wave, 0.16);
      // 低音（每 2 拍）
      if (i % 2 === 0) this.note(ctx, dest, this.freq(track.base, track.scale[0] - 24), t, beat * 2.4, 'sine', 0.12);
      // 铺底和声（每 8 拍）
      if (track.pad && i % 8 === 0) {
        [0, 4, 7].forEach(s => this.note(ctx, dest, this.freq(track.base, s - 12), t, beat * 8, 'sine', 0.05));
      }
    }
  },
  play() {
    if (this.fileUrl) {
      if (!this.audioEl) { this.audioEl = new Audio(this.fileUrl); this.audioEl.loop = true; }
      this.audioEl.volume = this.volume;
      this.audioEl.play().catch(() => toast('浏览器阻止了自动播放，请再点一次', 'warn'));
      this.playing = true; MusicDock.sync(); return;
    }
    if (!this.ensure()) { toast('当前浏览器不支持音频合成', 'error'); return; }
    this.playing = true;
    this.nextTime = this.ctx.currentTime + 0.08;
    this.step = 0;
    const tick = () => {
      if (!this.playing) return;
      const track = TRACKS[this.trackIndex];
      const ahead = this.ctx.currentTime + 2.0;
      while (this.nextTime < ahead) {
        this.schedule(this.ctx, this.master, track, this.nextTime, 60 / track.bpm);
        this.step += 1;
        this.nextTime += 60 / track.bpm;
      }
    };
    tick();
    this.timer = setInterval(tick, 400);
    MusicDock.sync();
  },
  stop() {
    this.playing = false;
    if (this.timer) { clearInterval(this.timer); this.timer = null; }
    if (this.audioEl) { this.audioEl.pause(); }
    MusicDock.sync();
  },
  toggle() { this.playing ? this.stop() : this.play(); },
  setTrack(i) {
    this.trackIndex = i; Store.Prefs.set('track', i);
    const wasPlaying = this.playing;
    if (wasPlaying && !this.fileUrl) { this.stop(); this.play(); }
    MusicDock.sync();
  },
  setVolume(v) {
    this.volume = v; Store.Prefs.set('volume', v);
    if (this.master) this.master.gain.value = v;
    if (this.audioEl) this.audioEl.volume = v;
  },
  useLocalFile(file) {
    if (this.fileUrl) URL.revokeObjectURL(this.fileUrl);
    this.stop();
    this.fileUrl = URL.createObjectURL(file);
    this.audioEl = new Audio(this.fileUrl);
    this.audioEl.loop = true;
    this.play();
    toast('已切换到本地音乐：' + file.name, 'success');
  },
  stopLocal() {
    if (this.audioEl) { this.audioEl.pause(); this.audioEl = null; }
    if (this.fileUrl) { URL.revokeObjectURL(this.fileUrl); this.fileUrl = null; }
    MusicDock.sync();
  },
  /* 离线渲染并下载当前曲目（WAV） */
  async download(seconds) {
    seconds = seconds || 30;
    const track = TRACKS[this.trackIndex];
    const OAC = window.OfflineAudioContext || window.webkitOfflineAudioContext;
    if (!OAC) { toast('当前浏览器不支持离线音频渲染', 'error'); return; }
    toast('正在生成《' + track.name + '》配乐，请稍候…', 'info');
    const sr = 44100;
    const ctx = new OAC(2, sr * seconds, sr);
    const g = ctx.createGain();
    g.gain.value = 0.9;
    g.connect(ctx.destination);
    for (let i = 0; i * (60 / track.bpm) < seconds; i++) {
      this.schedule(ctx, g, track, i * (60 / track.bpm), 60 / track.bpm);
    }
    const buf = await ctx.startRendering();
    const wav = encodeWav(buf);
    const url = URL.createObjectURL(wav);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'MathSigma-配乐-' + track.name.replace(/[·\s]/g, '') + '-' + seconds + 's.wav';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
    toast('配乐已下载，可用于课堂视频剪辑', 'success');
  }
};

function encodeWav(buffer) {
  const nCh = buffer.numberOfChannels, len = buffer.length, sr = buffer.sampleRate;
  const bytes = 44 + len * nCh * 2;
  const ab = new ArrayBuffer(bytes);
  const v = new DataView(ab);
  const str = (o, s) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
  str(0, 'RIFF'); v.setUint32(4, bytes - 8, true); str(8, 'WAVE');
  str(12, 'fmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true);
  v.setUint16(22, nCh, true); v.setUint32(24, sr, true);
  v.setUint32(28, sr * nCh * 2, true); v.setUint16(32, nCh * 2, true); v.setUint16(34, 16, true);
  str(36, 'data'); v.setUint32(40, len * nCh * 2, true);
  const chans = [];
  for (let c = 0; c < nCh; c++) chans.push(buffer.getChannelData(c));
  let off = 44;
  for (let i = 0; i < len; i++) {
    for (let c = 0; c < nCh; c++) {
      let s = Math.max(-1, Math.min(1, chans[c][i]));
      v.setInt16(off, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
      off += 2;
    }
  }
  return new Blob([ab], { type: 'audio/wav' });
}

/* ---------------- 音乐面板 ---------------- */
const MusicDock = {
  open: false,
  init() {
    if ($('#music-dock')) return;
    const d = document.createElement('div');
    d.className = 'music-dock';
    d.id = 'music-dock';
    d.innerHTML = `
      <div class="md-head">
        <span style="font-family:var(--font-latin);font-size:17px;line-height:1">♪</span>
        <b>课堂配乐</b>
        <span class="eq"><i></i><i></i><i></i><i></i></span>
        <button class="icon-btn" style="width:28px;height:28px;margin-left:4px" id="md-close">✕</button>
      </div>
      <div class="track-list" id="md-tracks"></div>
      <div class="vol-row">
        <span style="font-size:12px;color:var(--text-3)">音量</span>
        <input type="range" id="md-vol" min="0" max="1" step="0.01" value="${Music.volume}">
        <span style="font-size:12px;color:var(--text-3);width:34px;text-align:right" id="md-vol-val">${Math.round(Music.volume * 100)}</span>
      </div>
      <div class="md-foot">
        <button class="btn btn-ghost btn-sm" id="md-toggle">${ICON.music} 播放 / 暂停</button>
        <button class="btn btn-gold btn-sm" id="md-download">${ICON.download} 下载配乐</button>
        <label class="btn btn-ghost btn-sm" style="cursor:pointer">
          ${ICON.image} 用本地音乐
          <input type="file" accept="audio/*" id="md-file" style="display:none">
        </label>
      </div>
      <div style="font-size:11.5px;color:var(--text-3);margin-top:8px">提示：配乐由浏览器实时合成，可下载 WAV 用于课件剪辑。</div>`;
    document.body.appendChild(d);
    this.renderTracks();
    $('#md-close').onclick = () => this.toggle(false);
    $('#md-toggle').onclick = () => Music.toggle();
    $('#md-download').onclick = () => Music.download(30);
    $('#md-file').onchange = e => { const f = e.target.files[0]; if (f) Music.useLocalFile(f); };
    $('#md-vol').oninput = e => {
      const v = parseFloat(e.target.value);
      Music.setVolume(v); $('#md-vol-val').textContent = Math.round(v * 100);
    };
    if (Store.Prefs.get('autoplay', false)) setTimeout(() => Music.play(), 600);
  },
  renderTracks() {
    const box = $('#md-tracks'); if (!box) return;
    box.innerHTML = TRACKS.map((t, i) => `
      <div class="track ${i === Music.trackIndex ? 'on' : ''}" data-i="${i}">
        <span style="font-family:var(--font-latin);font-size:13px;color:var(--text-3);min-width:16px">${['I', 'II', 'III'][i]}</span>
        <span style="flex:1"><b>${t.name}</b><small>${t.desc}</small></span>
        <span style="font-size:11px;color:var(--text-3)">${t.bpm} BPM</span>
      </div>`).join('');
    $$('.track', box).forEach(el => el.onclick = () => { Music.setTrack(parseInt(el.dataset.i, 10)); this.renderTracks(); });
  },
  toggle(force) {
    this.open = force === undefined ? !this.open : force;
    const d = $('#music-dock'); if (d) d.classList.toggle('open', this.open);
    Store.Prefs.set('musicOpen', this.open);
  },
  sync() {
    const d = $('#music-dock');
    if (d) d.classList.toggle('playing', Music.playing);
    const btn = $('#btn-music');
    if (btn) btn.classList.toggle('playing', Music.playing);
  }
};

/* ---------------- 页面初始化 ---------------- */
function initPage(active) {
  const theme = Store.Prefs.get('theme', 'light');
  document.documentElement.setAttribute('data-theme', theme);
  renderNav(active);
  renderFooter();
  MusicDock.init();
  renderMath();
  initReveal();
  initExternalLinks();
  if (Store.Prefs.get('musicOpen', false)) MusicDock.toggle(true);
  /* 体验账号：数据每天自动清零，首次进入给一句说明 */
  const demo = Store.demoInfo && Store.demoInfo();
  if (demo && demo.purged) setTimeout(() => toast('体验账号已按日重置，今天的记录从现在开始统计', 'info'), 700);
}

/* 行为追踪：页面停留时长统计（供智能推荐用） */
const PageTimer = {
  start(kpId) {
    this.kpId = kpId; this.t0 = Date.now();
    window.addEventListener('beforeunload', () => this.flush());
    document.addEventListener('visibilitychange', () => { if (document.hidden) this.flush(); });
  },
  flush() {
    if (!this.kpId || !this.t0) return;
    const sec = (Date.now() - this.t0) / 1000;
    if (sec > 2) Store.Record.trackKp(this.kpId, sec);
    this.t0 = Date.now();
  }
};
