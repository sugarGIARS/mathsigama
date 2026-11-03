/* ============================================================
   server/lib/mysql-boot.cjs · 让 MySQL 跟着 Node 服务一起起来
   顺序：
     1) 先探活（能连上就什么都不做）
     2) Windows 服务：sc start <serviceName>（需权限，失败不报错）
     3) 兜底：直接拉起 mysqld 进程（--defaults-file）
     4) 轮询等待端口可连，超时报错
   配置见 server/config.json 的 mysql 段：
     autoStart / serviceName / mysqldPath / defaultsFile / startTimeout
   ============================================================ */
const fs = require('fs');
const path = require('path');
const { execFile, spawn } = require('child_process');
const mysql = require('mysql2/promise');

const sleep = ms => new Promise(r => setTimeout(r, ms));

/* 只探“服务器是否活着”，不依赖目标库是否存在 */
async function probe(cfg, timeout) {
  try {
    const c = await mysql.createConnection({
      host: cfg.host, port: cfg.port, user: cfg.user, password: cfg.password,
      connectTimeout: timeout || 2000
    });
    await c.query('SELECT 1');
    await c.end();
    return { up: true };
  } catch (e) {
    return { up: false, code: e.code || '', message: e.message };
  }
}

function run(cmd, args) {
  return new Promise(resolve => {
    execFile(cmd, args, { windowsHide: true, timeout: 25000 }, (err, stdout, stderr) => {
      resolve({ ok: !err, out: String(stdout || '') + String(stderr || ''), err });
    });
  });
}

async function waitUp(cfg, ms) {
  const deadline = Date.now() + ms;
  while (Date.now() < deadline) {
    if ((await probe(cfg, 1500)).up) return true;
    await sleep(700);
  }
  return false;
}

async function startService(cfg) {
  const svc = cfg.serviceName;
  if (!svc) return null;
  console.log('[mysql] 数据库未运行，尝试启动' + (process.platform === 'win32' ? '服务 ' : ' ' + svc + ' …'));
  let r;
  if (process.platform === 'win32') {
    r = await run('sc', ['start', svc]);
  } else {
    r = await run('systemctl', ['start', svc]);
    if (!r.ok) r = await run('service', [svc, 'start']);
  }
  const out = r.out.replace(/\s+/g, ' ').trim();
  if (r.ok) console.log('[mysql] ' + out);
  else console.log('[mysql] 直接启动服务未成功（' + out.slice(0, 100) + '）');
  return r.ok ? 'service' : null;
}

/* 服务是否已注册 */
async function serviceExists(svc) {
  if (!svc) return false;
  const r = process.platform === 'win32'
    ? await run('sc', ['query', svc])
    : await run('systemctl', ['status', svc]);
  return r.ok;
}

/* 非管理员时用 UAC 提权启动服务（会弹一次授权框） */
function elevateStartWindows(svc) {
  return new Promise(resolve => {
    const inner = "Start-Process -FilePath 'sc.exe' -ArgumentList 'start','" + svc +
      "' -Verb RunAs -WindowStyle Hidden -Wait";
    execFile('powershell', ['-NoProfile', '-Command', inner], { windowsHide: true, timeout: 40000 },
      err => resolve(!err));
  });
}

async function startProcess(cfg) {
  const bin = cfg.mysqldPath;
  if (!bin || !fs.existsSync(bin)) return false;
  const args = [];
  if (cfg.defaultsFile && fs.existsSync(cfg.defaultsFile)) args.push('--defaults-file=' + cfg.defaultsFile);
  console.log('[mysql] 直接拉起 mysqld：' + bin);
  const child = spawn(bin, args, { detached: true, stdio: 'ignore', windowsHide: true, cwd: path.dirname(cfg.defaultsFile || bin) });
  child.unref();
  return true;
}

/**
 * 确保 MySQL 可用；必要时自动启动
 * @returns {{started:boolean, via:'already'|'service'|'process'}}
 */
async function ensure(cfg) {
  const c = Object.assign({}, cfg);
  const first = await probe(c);
  if (first.up) return { started: false, via: 'already' };

  if (first.code === 'ER_ACCESS_DENIED_ERROR') {
    throw new Error('MySQL 已在运行，但账号 ' + c.user + ' 被拒绝（检查 server/config.json 的 mysql.password）');
  }
  if (c.autoStart === false) {
    throw new Error('MySQL 未运行，且 mysql.autoStart 为 false，请手动启动数据库');
  }

  const total = parseInt(c.startTimeout || 45000, 10);
  const startedAt = Date.now();
  const hasSvc = await serviceExists(c.serviceName);

  if (hasSvc) {
    if (await startService(c) && await waitUp(c, 20000)) return { started: true, via: 'service' };
    if (c.elevate !== false && process.platform === 'win32') {
      console.log('[mysql] 当前进程没有服务控制权限，弹出 UAC 授权（只这一次）…');
      if (await elevateStartWindows(c.serviceName) && await waitUp(c, 30000)) {
        return { started: true, via: 'service' };
      }
      console.log('[mysql] 授权未通过或被取消，尝试以当前用户直接启动 mysqld');
    }
  }

  await startProcess(c);
  const left = Math.max(6000, total - (Date.now() - startedAt));
  if (await waitUp(c, left)) return { started: true, via: 'process' };

  const last = await probe(c);
  throw new Error('尝试自动启动 MySQL 失败：' + (last.message || '连接超时') +
    '（' + (hasSvc
      ? '服务 ' + c.serviceName + ' 已注册但没有权限启动，请用管理员身份运行 start.bat，或先执行 net start ' + c.serviceName
      : '可检查 ' + (c.defaultsFile || 'my.ini') + ' 与同目录 error.log') + '）');
}

module.exports = { ensure, probe };
