@echo off
chcp 65001 >nul

cd /d "%~dp0backend"

if not exist ".env" (
    copy ".env.example" ".env" >nul
)

if not exist "node_modules" (
    echo 正在安装后端依赖，请稍等...
    npm install
)

start "" "http://localhost:3000"

npm start

pause