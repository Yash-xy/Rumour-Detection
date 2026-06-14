$ErrorActionPreference = 'Stop'

# Determine script root (works when executed as a script)
$scriptRoot = if ($PSScriptRoot) { $PSScriptRoot } else { Split-Path -Parent $MyInvocation.MyCommand.Definition }

# We must use system Python because local Application Control policies block .venv execution
$venvPython = 'python'

# Backend: run uvicorn from backend folder (new modular entry point)
$backendCmd = "Set-Location -Path '$scriptRoot\backend'; & '$venvPython' -m uvicorn app.main:app --reload --port 8000 --host 0.0.0.0"
Start-Process -FilePath 'powershell.exe' -ArgumentList '-NoExit','-Command',$backendCmd

# Frontend: run npm dev from frontend folder
$frontendCmd = "Set-Location -Path '$scriptRoot\frontend'; if (Test-Path 'package.json') { npm run dev } else { Write-Host 'Frontend folder not found: $scriptRoot\frontend' -ForegroundColor Yellow }"
Start-Process -FilePath 'powershell.exe' -ArgumentList '-NoExit','-Command',$frontendCmd

# Frontend 2: run npm dev from frontend 2nd folder
$frontend2Cmd = "Set-Location -Path '$scriptRoot\frontend-2nd\frontend 2nd'; if (Test-Path 'package.json') { npm run dev } else { Write-Host 'Frontend 2 folder not found: $scriptRoot\frontend-2nd\frontend 2nd' -ForegroundColor Yellow }"
Start-Process -FilePath 'powershell.exe' -ArgumentList '-NoExit','-Command',$frontend2Cmd

Write-Host 'Started backend, Frontend 1, and Frontend 2 in new PowerShell windows.' -ForegroundColor Green
