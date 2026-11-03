@echo off
chcp 65001 >nul
rem ============================================================
rem  双击即可：自动请求管理员权限，把 MySQL 8.4 注册成 Windows 服务
rem  卸载：
rem    net stop MySQL84
rem    "C:\Program Files\MySQL\MySQL Server 8.4\bin\mysqld.exe" --remove MySQL84
rem ============================================================
set PS1=%~dp0install-mysql-service.ps1

net session >nul 2>nul
if errorlevel 1 (
  echo [..] 正在请求管理员权限，请在弹窗中点是 ...
  powershell -NoProfile -Command "Start-Process -FilePath 'powershell.exe' -ArgumentList '-NoProfile','-ExecutionPolicy','Bypass','-NoExit','-File','\"%PS1%\"' -Verb RunAs"
  exit /b 0
)

powershell -NoProfile -ExecutionPolicy Bypass -NoExit -File "%PS1%"
