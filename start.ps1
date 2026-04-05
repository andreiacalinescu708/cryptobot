Write-Host '==========================================' -ForegroundColor Cyan
Write-Host '  Crypto Trading Bot - Start Servere' -ForegroundColor Cyan
Write-Host '==========================================' -ForegroundColor Cyan
Write-Host ''

# Porneste Backend in job separat
$backendJob = Start-Job -ScriptBlock {
    Set-Location 'backend'
    python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
} -Name 'Backend'

Write-Host 'Backend pornit...' -ForegroundColor Green
Start-Sleep -Seconds 3

# Porneste Frontend
$frontendJob = Start-Job -ScriptBlock {
    Set-Location 'frontend'
    npm run dev -- --port 3002
} -Name 'Frontend'

Write-Host 'Frontend pornit...' -ForegroundColor Green
Write-Host ''
Write-Host 'Backend:  http://127.0.0.1:8000' -ForegroundColor Yellow
Write-Host 'Frontend: http://localhost:3002' -ForegroundColor Yellow
Write-Host ''
Write-Host 'Apasa CTRL+C pentru a opri serverele' -ForegroundColor Red

# Asteapta joburile
Wait-Job $backendJob, $frontendJob
