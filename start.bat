@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

rem ============================================================
rem  MathSigma 启动脚本（Windows）
rem  用法：
rem    start.bat                 本机 8080 端口
rem    start.bat 9000           指定端口
rem    start.bat 8080 --lan      开放局域网（0.0.0.0），同网段设备可访问
rem ============================================================

set PORT=8080
set HOST=127.0.0.1

if not "%~1"=="" if not "%~1"=="--lan" set PORT=%~1
if /i "%~1"=="--lan" set HOST=0.0.0.0
if /i "%~2"=="--lan" set HOST=0.0.0.0

where node >nul 2>nul
if errorlevel 1 (
  echo [x] 未检测到 Node.js，请先安装 https://nodejs.org  （需要 18+）
  pause
  exit /b 1
)

if not exist node_modules\mysql2 (
  echo [!] 依赖未安装，正在执行 npm install ...
  call npm install --omit=dev
)

echo.
echo   MathSigma
echo   站点    : http://%HOST%:%PORT%/
echo   管理端  : http://%HOST%:%PORT%/admin.html
echo   接口    : http://%HOST%:%PORT%/api/health
echo   数据库  : MySQL（连接信息见 server\config.json 的 mysql 段）
echo   停止    : 在本窗口按 Ctrl+C
echo.
if "%HOST%"=="0.0.0.0" echo   [!] 已开放局域网访问，请确保防火墙允许该端口
echo.

node server\server.cjs --port %PORT% --host %HOST%
endlocal
