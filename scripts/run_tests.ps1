# Test runner script for Windows
Write-Host "Executing AI Receptionist test suite..." -ForegroundColor Cyan

cd backend
if (Test-Path ".venv\Scripts\pytest.exe") {
    & .venv\Scripts\pytest.exe -v
} else {
    python -m pytest -v
}
cd ..
