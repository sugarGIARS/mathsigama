/* ============================================================
   tools/db-init.cjs · 初始化 MySQL 库
   1) 用 server/config.json 的 mysql 配置尝试建库
   2) 执行 lib/schema.sql 建表
   3) 同步知识点（assets/js/data-kp*.js）
   用法：npm run db:init
   ============================================================ */
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const store = require(path.join(__dirname, '..', 'server', 'lib', 'store.cjs'));

const ROOT = store.ROOT;
const cfg = JSON.parse(fs.readFileSync(path.join(ROOT, 'server', 'config.json'), 'utf8')).mysql || {};

(async () => {
  const base = {
    host: cfg.host || '127.0.0.1',
    port: cfg.port || 3306,
    user: cfg.user || 'root',
    password: cfg.password || '',
    multipleStatements: false
  };
  const name = cfg.database || 'mathsigma';

  /* 库没起就先拉起来，和 npm start 一样的行为 */
  const boot = await require(path.join(ROOT, 'server', 'lib', 'mysql-boot.cjs')).ensure(cfg);
  if (boot.started) console.log('[ok] MySQL 已自动启动（' + boot.via + '）');

  const conn = await mysql.createConnection(base);
  try {
    await conn.query('CREATE DATABASE IF NOT EXISTS `' + name + '` CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci');
    console.log('[ok] 数据库就绪：' + name);
  } catch (e) {
    console.log('[!] 无法自动建库（' + e.code + '）：' + e.message);
    console.log('    请用有权限的账号执行：');
    console.log('    CREATE DATABASE IF NOT EXISTS `' + name + '` CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;');
    console.log('    GRANT ALL PRIVILEGES ON `' + name + '`.* TO \'' + base.user + '\'@\'localhost\';');
    process.exitCode = 1;
  } finally {
    await conn.end();
  }

  const db = await store.openDb(cfg);
  const seeded = await store.seedKP(db);
  const s = await store.stats(db);
  console.log('[ok] 表结构已建立');
  console.log('[ok] 知识点同步：' + seeded + ' 个');
  console.log('[ok] 当前题库：' + s.total + ' 道，答题记录 ' + s.attempts + ' 条，账号 ' + s.users + ' 个');
  await db.end();
})().catch(e => {
  console.error('[x] ' + (e && e.stack || e));
  process.exit(1);
});
