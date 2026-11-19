# Windows Development Setup Script for AI Receptionist Enterprise
Write-Host "Setting up AI Receptionist Enterprise local environment..." -ForegroundColor Cyan

# 1. Create .env from .env.example if missing
if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host "Created .env configuration from .env.example" -ForegroundColor Green
}

# 2. Setup Python virtual environment
cd backend
if (-not (Test-Path ".venv")) {
    Write-Host "Creating Python virtual environment in backend/.venv..." -ForegroundColor Yellow
    python -m venv .venv
}

Write-Host "Activating virtual environment and installing dependencies..." -ForegroundColor Yellow
& .venv\Scripts\Activate.ps1
pip install --upgrade pip
pip install -r requirements.txt
pip install -r requirements-dev.txt

Write-Host "Backend environment ready!" -ForegroundColor Green
cd ..
