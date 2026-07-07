@echo off
chcp 65001 >nul
title GMarket Stock Simulator
where python >nul 2>nul
if %errorlevel% neq 0 (
  echo 未检测到 Python。你仍然可以直接双击 index.html 运行。
  pause
  exit /b
)
echo 正在启动本地服务器：http://localhost:8080
echo 关闭窗口即可停止服务器。
start http://localhost:8080
python -m http.server 8080
pause
