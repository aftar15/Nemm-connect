# Run All Load Tests - NeMM Convention Connect
# This script runs all load tests in sequence

param(
    [string]$BaseUrl = "http://localhost:3000"
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  NeMM Convention Connect - Load Tests  " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if k6 is installed
if (-not (Get-Command k6 -ErrorAction SilentlyContinue)) {
    Write-Host "✗ k6 not found!" -ForegroundColor Red
    Write-Host "Please install k6 first by running: .\install-k6.ps1" -ForegroundColor Yellow
    exit 1
}

Write-Host "Testing URL: $BaseUrl" -ForegroundColor Green
Write-Host ""

# Test 1: Critical Flows (500 users, 15 minutes)
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "Test 1: Critical Flows Test (500 Users)" -ForegroundColor Yellow
Write-Host "Duration: ~15 minutes" -ForegroundColor Gray
Write-Host "========================================" -ForegroundColor Yellow
Write-Host ""

k6 run critical-flows.js -e BASE_URL=$BaseUrl

Write-Host ""
Write-Host "Test 1 Complete! Press any key to continue to Test 2..." -ForegroundColor Cyan
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Test 2: Spike Test (800 users, 1 minute)
Write-Host ""
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "Test 2: Spike Test (800 Users)" -ForegroundColor Yellow
Write-Host "Duration: ~1 minute" -ForegroundColor Gray
Write-Host "========================================" -ForegroundColor Yellow
Write-Host ""

k6 run spike-test.js -e BASE_URL=$BaseUrl

Write-Host ""
Write-Host "Test 2 Complete! Press any key to continue to Test 3..." -ForegroundColor Cyan
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Test 3: Database Stress (500 users, 10 minutes)
Write-Host ""
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "Test 3: Database Stress Test (500 Users)" -ForegroundColor Yellow
Write-Host "Duration: ~10 minutes" -ForegroundColor Gray
Write-Host "========================================" -ForegroundColor Yellow
Write-Host ""

k6 run database-stress.js -e BASE_URL=$BaseUrl

# Summary
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  All Tests Complete!  " -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Results saved to: load-test-summary.json" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Review the results above" -ForegroundColor White
Write-Host "2. Check for any failed thresholds (marked with ✗)" -ForegroundColor White
Write-Host "3. If errors found, check the optimization guide in README.md" -ForegroundColor White
Write-Host "4. Re-run tests after optimizations" -ForegroundColor White
Write-Host ""

