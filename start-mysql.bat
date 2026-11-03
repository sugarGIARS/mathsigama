@echo off
chcp 65001 >nul
rem ============================================================
rem  本机 MySQL 8.4 启动器
rem  · 已注册为 Windows 服务 MySQL84（自动启动）：开机即起，本脚本只做检查
rem  · 未注册服务时：以进程方式临时拉起 mysqld
rem  注册服务：右键 tools\windows\install-mysql-service.bat → 以管理员身份运行
rem ============================================================
set BASE=C:\Program Files\MySQL\MySQL Server 8.4
set DATA=C:\ProgramData\MySQL\mysql84

sc query MySQL84 >nul 2>nul
if not errorlevel 1 (
  sc query MySQL84 | find /i "RUNNING" >nul
  if not errorlevel 1 (
    echo [i] MySQL84 服务正在运行，无需操作
  ) else (
    echo [!] MySQL84 服务已停止。请用管理员身份执行： net start MySQL84
  )
  exit /b 0
)

tasklist /fi "imagename eq mysqld.exe" 2>nul | find /i "mysqld.exe" >nul
if not errorlevel 1 (
  echo [i] MySQL 已在运行（进程方式），无需重复启动
  exit /b 0
)

echo [..] 未注册服务，以进程方式启动 MySQL ...
start "" /min "%BASE%\bin\mysqld.exe" --defaults-file="%DATA%\my.ini"
timeout /t 5 >nul

"%BASE%\bin\mysqladmin.exe" -u mathsigma -p ping 2>nul | find /i "alive" >nul
if errorlevel 1 (
  echo [x] 启动失败，日志：%DATA%\error.log
  exit /b 1
)
echo [ok] MySQL 已就绪：127.0.0.1:3306
