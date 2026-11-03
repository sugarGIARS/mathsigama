/* ============================================================
   server/server.cjs · MathSigma 服务端
   · 静态托管（默认端口 8080，--host 0.0.0.0 可局域网访问）
   · REST API：知识点 / 题库 / 答题记录 / 用户 / 导入导出
   · AI 代理：/api/ai/chat 转发 DeepSeek（密钥只在服务端，不下发前端）
   · 数据库：MySQL 8.0+（mysql2 连接池，表结构见 lib/schema.sql）
   启动：node server/server.cjs --port 8080 [--host 0.0.0.0] [--no-api]
   ============================================================ */
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const store = require(path.join(__dirname, 'lib', 'store.cjs'));

const ROOT = store.ROOT;
const CONFIG_FILE = path.join(__dirname, 'config.json');

/* ---------- 参数与配置 ---------- */
function argvOf(k, d) { const i = process.argv.indexOf('--' + k); return i >= 0 ? (process.argv[i + 1] || true) : d; }
function loadConfig() {
  let cfg = {};
  try { cfg = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8')); } catch (e) { cfg = {}; }
  cfg.port = parseInt(process.env.PORT || argvOf('port', cfg.port || 8080), 10);
  cfg.host = process.env.HOST || (argvOf('host', false) === true ? cfg.host || '127.0.0.1' : argvOf('host', cfg.host || '127.0.0.1'));
  cfg.adminToken = process.env.ADMIN_TOKEN || cfg.adminToken || '';
  cfg.deepseek = cfg.deepseek || {};
  cfg.deepseek.apiKey = process.env.DEEPSEEK_API_KEY || cfg.deepseek.apiKey || '';
  cfg.deepseek.model = process.env.DEEPSEEK_MODEL || cfg.deepseek.model || 'deepseek-chat';
  cfg.deepseek.baseURL = process.env.DEEPSEEK_BASE_URL || cfg.deepseek.baseURL || 'https://api.deepseek.com';
  cfg.deepseek.timeout = parseInt(cfg.deepseek.timeout || 45000, 10);

  /* ---------- MySQL 连接（环境变量优先，便于部署时覆盖） ---------- */
  cfg.mysql = cfg.mysql || {};
  cfg.mysql.host = process.env.MS_MYSQL_HOST || process.env.MYSQL_HOST || cfg.mysql.host || '127.0.0.1';
  cfg.mysql.port = parseInt(process.env.MS_MYSQL_PORT || process.env.MYSQL_PORT || cfg.mysql.port || 3306, 10);
  cfg.mysql.user = process.env.MS_MYSQL_USER || process.env.MYSQL_USER || cfg.mysql.user || 'root';
  cfg.mysql.password = process.env.MS_MYSQL_PASSWORD !== undefined ? process.env.MS_MYSQL_PASSWORD
    : (process.env.MYSQL_PASSWORD !== undefined ? process.env.MYSQL_PASSWORD : (cfg.mysql.password || ''));
  cfg.mysql.database = process.env.MS_MYSQL_DB || process.env.MYSQL_DATABASE || cfg.mysql.database || 'mathsigma';
  return cfg;
}
let CONFIG = loadConfig();
const noApi = argvOf('no-api', false) !== false;
let db = null;

/* ---------- 体验账号：每天自动清空学习数据 ---------- */
function dayKey(d) {
  const t = d || new Date();
  return t.getFullYear() + '-' + String(t.getMonth() + 1).padStart(2, '0') + '-' + String(t.getDate()).padStart(2, '0');
}
async function autoPurgeDemo() {
  const today = dayKey();
  if (await store.getSetting(db, 'demoPurgeDay', '') === today) return { skipped: true };
  const r = await store.purgeDemo(db);
  await store.setSetting(db, 'demoPurgeDay', today);
  if (r.attempts || r.users) console.log('[demo] 体验账号数据已清理：答题 ' + r.attempts + ' 条 / 账号 ' + r.users + ' 个');
  return r;
}

function saveConfig() {
  /* 注意：必须把 mysql 段一起写回，否则管理端保存 AI 密钥会把数据库配置冲掉 */
  const out = {
    port: CONFIG.port, host: CONFIG.host, adminToken: CONFIG.adminToken,
    mysql: {
      host: CONFIG.mysql.host, port: CONFIG.mysql.port,
      user: CONFIG.mysql.user, password: CONFIG.mysql.password,
      database: CONFIG.mysql.database
    },
    deepseek: { apiKey: CONFIG.deepseek.apiKey, model: CONFIG.deepseek.model, baseURL: CONFIG.deepseek.baseURL, timeout: CONFIG.deepseek.timeout }
  };
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(out, null, 2), 'utf8');
}

/* ---------- 工具 ---------- */
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.ico': 'image/x-icon', '.txt': 'text/plain; charset=utf-8', '.mp3': 'audio/mpeg', '.woff2': 'font/woff2', '.pdf': 'application/pdf' };
function send(res, code, data, type) {
  res.writeHead(code, { 'Content-Type': type || 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type,x-admin-token', 'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS' });
  res.end(typeof data === 'string' || Buffer.isBuffer(data) ? data : JSON.stringify(data));
}
function body(req) {
  return new Promise(resolve => { let b = ''; req.on('data', c => { b += c; if (b.length > 4e6) req.destroy(); }); req.on('end', () => { try { resolve(b ? JSON.parse(b) : {}); } catch (e) { resolve({}); } }); });
}
function isAdmin(req) {
  if (!CONFIG.adminToken) return true; // 未配置 token 时为本地开发模式
  return (req.headers['x-admin-token'] || '') === CONFIG.adminToken;
}
function uid() { return crypto.randomBytes(8).toString('hex'); }

/* ---------- DeepSeek 代理 ---------- */
const SYS_PROMPT = `你是“Σ 老师”，一位严谨、温和的中学数学辅导老师，服务于 MathSigma 学习平台。
要求：
1. 用中文回答，面向初中/高中学生，语言简洁、步骤清晰。
2. 数学公式使用 LaTeX，行内用 \\( ... \\)，独立公式用 \\[ ... \\]。
3. 先给思路提示，再给关键步骤；不要一上来就给完整答案，结尾可给出最终结论。
4. 若学生给出了解法，请判断对错并指出具体错因。
5. 不确定的地方要说明，并建议回归对应知识点。`;

async function callDeepSeek(messages, timeout) {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), timeout || CONFIG.deepseek.timeout);
  try {
    const resp = await fetch(CONFIG.deepseek.baseURL.replace(/\/$/, '') + '/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + CONFIG.deepseek.apiKey },
      body: JSON.stringify({ model: CONFIG.deepseek.model, messages, temperature: 0.3, max_tokens: 1600, stream: false }),
      signal: ctl.signal
    });
    const data = await resp.json();
    if (!resp.ok) return { ok: false, error: (data && data.error && data.error.message) || ('HTTP ' + resp.status) };
    const content = data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
    return { ok: true, content: content || '', usage: data.usage || null };
  } catch (e) {
    return { ok: false, error: String(e && e.message || e) };
  } finally { clearTimeout(timer); }
}

/* 无密钥时的本地兜底：给出思路提示而不是假装 AI */
function localReply(text, kp) {
  const t = String(text || '').slice(0, 200);
  return {
    mode: 'local',
    content: `【本地兜底模式 · 未配置 DeepSeek 密钥】\n\n你问的是：${t}\n\n我可以先给你一条通用思路：\n1. 先把题目中的已知量、未知量列出来；\n2. 回忆本节对应的定义与公式（${kp ? '知识点：' + kp : '可在讲义页查看本节公式总结'}）；\n3. 代入后检查量纲与范围是否符合题意。\n\n在管理端填入 DeepSeek API Key 后，这里会切换为真实的 AI 讲解。`,
    suggestions: ['查看本节讲义的概念与例题', '换一道同类题再练一次', '把你的解法发给我，我帮你找错因']
  };
}

/* ---------- 路由 ---------- */
async function handleApi(req, res, url, parsed) {
  const p = parsed.pathname.replace(/^\/api/, '') || '/';
  const q = parsed.searchParams;

  if (p === '/health') {
    const s = await store.stats(db);
    return send(res, 200, {
      ok: true, service: 'MathSigma', version: '1.1',
      db: {
        driver: 'mysql', name: CONFIG.mysql.database,
        host: CONFIG.mysql.host + ':' + CONFIG.mysql.port,
        questions: s.total, users: s.users, attempts: s.attempts
      },
      ai: { configured: !!CONFIG.deepseek.apiKey, model: CONFIG.deepseek.model, baseURL: CONFIG.deepseek.baseURL, proxy: true },
      admin: { tokenRequired: !!CONFIG.adminToken }
    });
  }

  if (p === '/kp') {
    return send(res, 200, { items: await store.listKP(db) });
  }

  if (p === '/questions' && req.method === 'GET') {
    const r = await store.query(db, { kp: q.get('kp'), level: q.get('level'), type: q.get('type'), source: q.get('source'), q: q.get('q'), limit: q.get('limit'), offset: q.get('offset') });
    return send(res, 200, r);
  }
  if (p === '/questions' && req.method === 'POST') {
    if (!isAdmin(req)) return send(res, 401, { error: '需要管理令牌' });
    const b = await body(req);
    const list = Array.isArray(b) ? b : [b];
    const out = [];
    for (const x of list) out.push(await store.upsert(db, x, { onDup: b.replace ? 'replace' : 'skip' }));
    return send(res, 200, { results: out });
  }
  if (p.startsWith('/questions/') && (req.method === 'PUT' || req.method === 'DELETE')) {
    if (!isAdmin(req)) return send(res, 401, { error: '需要管理令牌' });
    const id = decodeURIComponent(p.slice('/questions/'.length));
    if (req.method === 'DELETE') {
      await store.deleteQuestion(db, id);
      return send(res, 200, { ok: true, id });
    }
    const b = await body(req);
    const cur = await store.getQuestion(db, id);
    if (!cur) return send(res, 404, { error: '题目不存在' });
    const merged = Object.assign(store.toObj(cur), b);
    await store.updateQuestion(db, id, merged);
    return send(res, 200, { ok: true, id });
  }

  if (p === '/stats') return send(res, 200, await store.stats(db));

  if (p === '/attempts' && req.method === 'POST') {
    const b = await body(req);
    const list = Array.isArray(b) ? b : [b];
    for (const a of list) await store.saveAttempt(db, a);
    return send(res, 200, { ok: true, n: list.length });
  }
  if (p === '/attempts' && req.method === 'GET') {
    return send(res, 200, { items: await store.listAttempts(db, q.get('limit') || 50) });
  }

  if (p === '/demo/reset' && req.method === 'POST') {
    const r = await store.purgeDemo(db);
    await store.setSetting(db, 'demoPurgeDay', dayKey());
    return send(res, 200, { ok: true, day: dayKey(), attempts: r.attempts, users: r.users });
  }
  if (p === '/demo/status') {
    return send(res, 200, { day: dayKey(), lastPurge: await store.getSetting(db, 'demoPurgeDay', ''), rule: '体验账号（demo）学习数据每天 00:00 自动清空' });
  }

  if (p === '/users' && req.method === 'POST') {
    const b = await body(req);
    await store.saveUser(db, b);
    return send(res, 200, { ok: true, id: b.id || b.username });
  }
  if (p === '/users' && req.method === 'GET') {
    if (!isAdmin(req)) return send(res, 401, { error: '需要管理令牌' });
    return send(res, 200, { items: await store.listUsers(db) });
  }

  if (p === '/import' && req.method === 'POST') {
    if (!isAdmin(req)) return send(res, 401, { error: '需要管理令牌' });
    const b = await body(req);
    const list = Array.isArray(b) ? b : (b.questions || []);
    let ins = 0, dup = 0;
    for (const x of list) {
      if (x && x.stem && x.kp) {
        const r = await store.upsert(db, Object.assign({ source: b.source || 'import' }, x), { onDup: 'replace' });
        r.action === 'inserted' ? ins++ : dup++;
      }
    }
    return send(res, 200, { inserted: ins, duplicate: dup });
  }
  if (p === '/export') {
    const r = await store.query(db, { kp: q.get('kp'), limit: 100000 });
    if (q.get('format') === 'csv') {
      const esc = s => '"' + String(s == null ? '' : s).replace(/"/g, '""') + '"';
      const head = 'id,kp,level,type,stem,options,answer,accept,keywords,analysis,tags,source\n';
      const lines = r.items.map(x => [x.id, x.kp, x.level, x.type, x.stem, (x.options || []).join('|'), x.answer, (x.accept || []).join('|'), (x.keywords || []).join('|'), x.analysis, (x.tags || []).join('|'), x.source].map(esc).join(','));
      return send(res, 200, head + lines.join('\n'), 'text/csv; charset=utf-8');
    }
    return send(res, 200, { total: r.total, questions: r.items });
  }

  if (p === '/ai/status') {
    return send(res, 200, { configured: !!CONFIG.deepseek.apiKey, model: CONFIG.deepseek.model, baseURL: CONFIG.deepseek.baseURL, timeout: CONFIG.deepseek.timeout, proxy: true });
  }
  if (p === '/ai/key' && req.method === 'POST') {
    if (!isAdmin(req)) return send(res, 401, { error: '需要管理令牌' });
    const b = await body(req);
    CONFIG.deepseek.apiKey = (b.apiKey || '').trim();
    if (b.model) CONFIG.deepseek.model = b.model;
    if (b.baseURL) CONFIG.deepseek.baseURL = b.baseURL;
    saveConfig();
    return send(res, 200, { ok: true, configured: !!CONFIG.deepseek.apiKey, masked: CONFIG.deepseek.apiKey ? CONFIG.deepseek.apiKey.slice(0, 3) + '***' + CONFIG.deepseek.apiKey.slice(-4) : '' });
  }
  if (p === '/ai/chat' && req.method === 'POST') {
    const b = await body(req);
    const text = String(b.message || b.text || '').trim();
    if (!text) return send(res, 400, { error: '缺少提问内容' });
    const hist = Array.isArray(b.history) ? b.history.slice(-8).map(h => ({ role: h.role === 'assistant' ? 'assistant' : 'user', content: String(h.content || '') })) : [];
    if (!CONFIG.deepseek.apiKey) return send(res, 200, localReply(text, b.kp));
    const messages = [{ role: 'system', content: SYS_PROMPT + (b.kp ? '\n当前知识点：' + b.kp : '') }]
      .concat(hist).concat([{ role: 'user', content: text }]);
    const r = await callDeepSeek(messages, b.timeout);
    if (!r.ok) return send(res, 200, Object.assign({ mode: 'error', error: r.error }, localReply(text, b.kp)));
    return send(res, 200, { mode: 'deepseek', content: r.content, usage: r.usage, model: CONFIG.deepseek.model });
  }

  if (p === '/config' && req.method === 'GET') {
    return send(res, 200, { port: CONFIG.port, host: CONFIG.host, adminTokenRequired: !!CONFIG.adminToken, ai: { configured: !!CONFIG.deepseek.apiKey, model: CONFIG.deepseek.model } });
  }

  return send(res, 404, { error: '未知接口 ' + p });
}

/* ---------- 静态文件 ---------- */
function serveStatic(req, res, pathname) {
  let rel = decodeURIComponent(pathname);
  if (rel === '/' || rel === '') rel = '/index.html';
  const fp = path.join(ROOT, rel);
  if (!fp.startsWith(ROOT)) return send(res, 403, 'forbidden', 'text/plain; charset=utf-8');
  fs.readFile(fp, (err, data) => {
    if (err) {
      fs.readFile(path.join(ROOT, '404.html'), (e2, d2) => {
        if (d2) return send(res, 404, d2, MIME['.html']);
        send(res, 404, 'Not Found: ' + rel, 'text/plain; charset=utf-8');
      });
      return;
    }
    /* ETag + 协商缓存：页面跳转时静态资源走 304，减少传输与等待 */
    const type = MIME[path.extname(fp).toLowerCase()] || 'application/octet-stream';
    const etag = 'W/"' + data.length.toString(16) + '-' + Date.parse((fs.statSync(fp, { throwIfNoEntry: false }) || { mtimeMs: 0 }).mtimeMs || 0).toString(16) + '"';
    if (req.headers['if-none-match'] === etag) {
      res.writeHead(304, { 'ETag': etag, 'Cache-Control': 'no-cache' });
      return res.end();
    }
    res.writeHead(200, {
      'Content-Type': type, 'ETag': etag,
      'Cache-Control': /\.(woff2?|js|css|png|svg|ico)$/i.test(fp) ? 'public, max-age=600' : 'no-cache',
      'Access-Control-Allow-Origin': '*'
    });
    res.end(data);
  });
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') return send(res, 204, '');
  const parsed = new URL(req.url, 'http://' + (req.headers.host || 'localhost'));
  if (parsed.pathname.startsWith('/api/')) {
    if (noApi) return send(res, 404, { error: '接口已关闭（--no-api），前端将使用内置题库' });
    try { await handleApi(req, res, req.url, parsed); }
    catch (e) { send(res, 500, { error: String(e && e.message || e) }); }
    return;
  }
  serveStatic(req, res, parsed.pathname);
});

/* ---------- 启动：先连 MySQL，再监听端口 ---------- */
async function main() {
  try {
    db = await store.openDb(CONFIG.mysql);
  } catch (e) {
    console.error('────────────────────────────────────────');
    console.error('  [x] 无法连接 MySQL：' + String(e && e.message || e));
    console.error('      目标：' + CONFIG.mysql.user + '@' + CONFIG.mysql.host + ':' + CONFIG.mysql.port + '/' + CONFIG.mysql.database);
    console.error('      检查：MySQL 是否启动、server/config.json 里的 mysql 配置是否正确');
    console.error('      建库：npm run db:init');
    console.error('────────────────────────────────────────');
    process.exit(1);
  }

  const seeded = await store.seedKP(db);
  if (seeded) console.log('[seed] 知识点已同步：' + seeded + ' 个');
  await autoPurgeDemo();
  setInterval(() => { autoPurgeDemo().catch(e => console.error('[demo] 清理失败：' + e.message)); }, 5 * 60 * 1000);

  server.listen(CONFIG.port, CONFIG.host, async () => {
    const s = await store.stats(db);
    const kpCount = await store.countKP(db);
    console.log('────────────────────────────────────────');
    console.log('  MathSigma 服务已启动');
    console.log('  地址：http://' + (CONFIG.host === '0.0.0.0' ? 'localhost' : CONFIG.host) + ':' + CONFIG.port);
    console.log('  数据库：MySQL ' + CONFIG.mysql.user + '@' + CONFIG.mysql.host + ':' + CONFIG.mysql.port + '/' + CONFIG.mysql.database);
    console.log('  题库：' + s.total + ' 道  知识点：' + kpCount + ' 个');
    console.log('  AI  ：' + (CONFIG.deepseek.apiKey ? 'DeepSeek 已接入（' + CONFIG.deepseek.model + '）' : '未配置密钥，走本地兜底'));
    console.log('  管理端：/admin.html' + (CONFIG.adminToken ? '（需管理令牌）' : '（本地开发模式，无需令牌）'));
    console.log('────────────────────────────────────────');
  });
}

main().catch(e => {
  console.error('[fatal] ' + String(e && e.stack || e));
  process.exit(1);
});

module.exports = { server, CONFIG };
