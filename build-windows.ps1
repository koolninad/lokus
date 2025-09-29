# PowerShell build script for Lokus on Windows

Write-Host "Building Lokus for Windows..." -ForegroundColor Green
Write-Host ""

# Set environment variables for Gmail integration (if provided)
$clientId = $env:GOOGLE_CLIENT_ID
$clientSecret = $env:GOOGLE_CLIENT_SECRET

if ($clientId -and $clientSecret) {
    Write-Host "Setting Gmail OAuth credentials..." -ForegroundColor Yellow
    $env:GOOGLE_CLIENT_ID = $clientId
    $env:GOOGLE_CLIENT_SECRET = $clientSecret
}

# Clean previous builds
Write-Host "Cleaning previous builds..." -ForegroundColor Yellow
if (Test-Path "src-tauri\target\release") {
    Remove-Item -Recurse -Force "src-tauri\target\release"
}

# Build the frontend
Write-Host "Building frontend..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Frontend build failed!" -ForegroundColor Red
    exit 1
}

# Build the Tauri application
Write-Host "Building Tauri application..." -ForegroundColor Yellow
npm run tauri build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Tauri build failed!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Build completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "The installer can be found at:" -ForegroundColor Cyan
Write-Host "src-tauri\target\release\bundle\nsis\Lokus_1.0.3_x64-setup.exe" -ForegroundColor White
Write-Host ""
Write-Host "The MSI installer can be found at:" -ForegroundColor Cyan
Write-Host "src-tauri\target\release\bundle\msi\Lokus_1.0.3_x64_en-US.msi" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")