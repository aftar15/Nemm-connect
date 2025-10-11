# Install k6 Load Testing Tool on Windows
# Run this script in PowerShell as Administrator

Write-Host "Installing k6 Load Testing Tool..." -ForegroundColor Cyan

# Check if winget is available
if (Get-Command winget -ErrorAction SilentlyContinue) {
    Write-Host "Installing k6 via winget..." -ForegroundColor Green
    winget install k6 --source winget
} else {
    Write-Host "winget not found. Downloading k6 manually..." -ForegroundColor Yellow
    
    # Download k6
    $k6Url = "https://github.com/grafana/k6/releases/download/v0.48.0/k6-v0.48.0-windows-amd64.zip"
    $k6Zip = "$env:TEMP\k6.zip"
    $k6Dir = "C:\k6"
    
    Write-Host "Downloading k6..." -ForegroundColor Cyan
    Invoke-WebRequest -Uri $k6Url -OutFile $k6Zip
    
    Write-Host "Extracting k6..." -ForegroundColor Cyan
    Expand-Archive -Path $k6Zip -DestinationPath $k6Dir -Force
    
    # Add to PATH
    $envPath = [Environment]::GetEnvironmentVariable("Path", "Machine")
    if ($envPath -notlike "*$k6Dir*") {
        [Environment]::SetEnvironmentVariable("Path", "$envPath;$k6Dir", "Machine")
        Write-Host "Added k6 to PATH" -ForegroundColor Green
    }
    
    # Clean up
    Remove-Item $k6Zip -Force
}

# Verify installation
Write-Host "`nVerifying k6 installation..." -ForegroundColor Cyan
$k6Version = & k6 version 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ k6 installed successfully!" -ForegroundColor Green
    Write-Host $k6Version -ForegroundColor Gray
    Write-Host "`nYou can now run load tests with:" -ForegroundColor Cyan
    Write-Host "  cd load-tests" -ForegroundColor White
    Write-Host "  k6 run critical-flows.js" -ForegroundColor White
} else {
    Write-Host "✗ k6 installation failed. Please install manually from https://k6.io" -ForegroundColor Red
}

