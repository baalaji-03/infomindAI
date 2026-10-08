@echo off
echo ========================================================
echo   InfoMind AI - Intelligent Information Understanding
echo ========================================================
echo Starting FastAPI Backend in separate window...
start "InfoMind AI - Backend (:8000)" cmd /c "python -m uvicorn backend.app:app --host 127.0.0.1 --port 8000 --reload"

echo Starting Vite Frontend Dashboard in separate window...
start "InfoMind AI - Frontend (:5177)" cmd /c "npm run dev -- --port 5177 --host"

echo.
echo Both servers initiated!
echo Frontend: http://localhost:5177/
echo Backend:  http://127.0.0.1:8000/
echo ========================================================
pause
