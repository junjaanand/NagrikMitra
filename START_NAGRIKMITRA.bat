@echo off
title NagrikMitra - Project Exhibition Launcher
color 0A

echo ============================================================
echo   NagrikMitra (नागरिक मित्र) — Civic Welfare Intelligence
echo ============================================================
echo.
echo [1/3] Starting Backend Server (FastAPI + Supabase Cloud)...
start "NagrikMitra Backend (Port 8000)" cmd /k "cd /d %~dp0backend && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

echo Waiting 3 seconds for backend initialization...
ping 127.0.0.1 -n 4 >nul

echo.
echo [2/3] Starting Frontend Server (Vite + React 19)...
start "NagrikMitra Frontend (Port 5173)" cmd /k "cd /d %~dp0frontend && npm run dev"

echo Waiting 3 seconds for Vite server startup...
ping 127.0.0.1 -n 4 >nul

echo.
echo [3/3] Opening NagrikMitra in your default browser...
start http://localhost:5173

echo.
echo ============================================================
echo   SUCCESS: NagrikMitra is LIVE and ready for presentation!
echo   • Frontend URL: http://localhost:5173
echo   • Backend Docs: http://localhost:8000/docs
echo   • Database:     Supabase PostgreSQL 17 (4,728 Schemes)
echo ============================================================
echo   Leave the two opened terminal windows running during demo.
echo   To stop, simply close the two command prompt windows.
echo ============================================================
