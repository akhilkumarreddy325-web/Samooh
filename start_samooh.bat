@echo off
echo ========================================================
echo Starting Samooh AI Group Procurement Platform...
echo ========================================================

:: Start FastAPI Backend in new window
start "Samooh Backend API (Port 8000)" cmd /k "cd /d %~dp0 && python -m uvicorn backend.main:app --reload"

:: Start React Frontend in new window
start "Samooh React Frontend (Port 3000)" cmd /k "cd /d %~dp0 && "C:\Program Files\nodejs\npm.cmd" run dev"

echo.
echo Both servers launching!
echo Backend: http://127.0.0.1:8000/docs
echo Frontend: http://localhost:3000
echo ========================================================
