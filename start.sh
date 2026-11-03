#!/usr/bin/env bash
# ============================================================
#  MathSigma 启动脚本（macOS / Linux）
#  用法：
#    ./start.sh                本机 8080 端口
#    ./start.sh 9000           指定端口
#    ./start.sh 8080 --lan     开放局域网（0.0.0.0）
# ============================================================
set -e
PORT="${1:-8080}"
HOST="127.0.0.1"
if [ "$1" = "--lan" ] || [ "$2" = "--lan" ]; then HOST="0.0.0.0"; fi
if [ "$1" = "--lan" ]; then PORT="8080"; fi

if ! command -v node >/dev/null 2>&1; then
  echo "[x] 未检测到 Node.js，请先安装 https://nodejs.org （需要 18+）"
  exit 1
fi

if [ ! -d node_modules/mysql2 ]; then
  echo "[!] 依赖未安装，正在执行 npm install ..."
  npm install --omit=dev
fi

echo ""
echo "  MathSigma"
echo "  站点    : http://$HOST:$PORT/"
echo "  管理端  : http://$HOST:$PORT/admin.html"
echo "  接口    : http://$HOST:$PORT/api/health"
echo "  数据库  : MySQL（连接信息见 server/config.json 的 mysql 段）"
echo "  停止    : Ctrl+C"
echo ""

exec node server/server.cjs --port "$PORT" --host "$HOST"
