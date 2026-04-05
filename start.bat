@echo off
echo ==========================================
echo   Crypto Trading Bot - Start Servere
echo ==========================================
echo.

:: Porneste Backend in fereastra noua
start "Backend API" cmd /k "cd backend && python -m uvicorn app.main:app --host 127.0.0.1 --port 8000"

timeout /t 3 /nobreak >nul

:: Porneste Frontend in fereastra noua  
start "Frontend React" cmd /k "cd frontend && npm run dev -- --port 3002"

echo.
echo Servere pornite!
echo.
echo Backend:  http://127.0.0.1:8000
echo Frontend: http://localhost:3002
echo.
echo Apasa orice tasta pentru a inchide acest mesaj...
pause >nul
