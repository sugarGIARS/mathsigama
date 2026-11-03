@echo off
chcp 65001 >nul
rem ============================================================
rem  本机 MySQL 8.4 启动器（便携安装，未注册为 Windows 服务）
rem  路径如与本机不同，改下面两行即可
rem  想要开机自启：用管理员身份执行一次
rem    "C:\Program Files\MySQL\MySQL Server 8.4\bin\mysqld.exe" --install MySQL84 --defaults-file="C:\ProgramData\MySQL\mysql84\my.ini"
rem    net start MySQL84
rem ============================================================
set BASE=C:\Program Files\MySQL\MySQL Server 8.4
set DATA=C:\ProgramData\MySQL\mysql84

tasklist /fi "imagename eq mysqld.exe" 2>nul | find /i "mysqld.exe" >nul
if not errorlevel 1 (
  echo [i] MySQL 已在运行，无需重复启动
  exit /b 0
)

echo [..] 启动 MySQL ...
start "" /min "%BASE%\bin\mysqld.exe" --defaults-file="%DATA%\my.ini"
timeout /t 4 >nul

"%BASE%\bin\mysqladmin.exe" -u mathsigma -p ping 2>nul | find /i "alive" >nul
if errorlevel 1 (
  echo [x] 启动失败，日志：%DATA%\error.log
  exit /b 1
)
echo [ok] MySQL 已就绪：127.0.0.1:3306
