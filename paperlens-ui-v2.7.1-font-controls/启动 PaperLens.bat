@echo off
chcp 65001 >nul
cd /d "%~dp0"
start "PaperLens Server" cmd /k "node paperlens-server.mjs"
timeout /t 2 /nobreak >nul
start "" "http://127.0.0.1:5173"
exit
