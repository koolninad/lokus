@echo off
echo Building Lokus for Windows...
echo.

REM Set environment variables for Gmail integration (optional)
REM Replace with your actual credentials if you want Gmail features
REM set GOOGLE_CLIENT_ID=your_client_id_here
REM set GOOGLE_CLIENT_SECRET=your_client_secret_here

REM Clean previous builds
echo Cleaning previous builds...
if exist src-tauri\target\release rmdir /s /q src-tauri\target\release

REM Build the frontend first
echo Building frontend...
call npm run build
if errorlevel 1 (
    echo Frontend build failed!
    exit /b 1
)

REM Build the Tauri application
echo Building Tauri application...
cd src-tauri
cargo build --release
if errorlevel 1 (
    echo Rust build failed!
    cd ..
    exit /b 1
)

REM Bundle the application
echo Bundling application...
cargo tauri build
if errorlevel 1 (
    echo Tauri build failed!
    cd ..
    exit /b 1
)

cd ..
echo.
echo Build completed successfully!
echo.
echo The installer can be found at:
echo src-tauri\target\release\bundle\nsis\Lokus_1.0.3_x64-setup.exe
echo.
echo The portable exe can be found at:
echo src-tauri\target\release\lokus.exe
echo.
pause