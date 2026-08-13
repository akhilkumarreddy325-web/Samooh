@echo off
echo ========================================================
echo Deploying Samooh Frontend to Firebase Hosting (samooh1)...
echo ========================================================

:: Step 1: Build production bundle
echo 1/3: Building production React bundle (dist)...
call "C:\Program Files\nodejs\npm.cmd" run build

if %ERRORLEVEL% NEQ 0 (
    echo Build failed! Please check errors above.
    pause
    exit /b %ERRORLEVEL%
)

:: Step 2: Ensure Firebase CLI is available
echo.
echo 2/3: Checking Firebase CLI...
call npx -y firebase-tools --version

:: Step 3: Deploy to Firebase Hosting project samooh1
echo.
echo 3/3: Deploying to Firebase Hosting project samooh1...
call npx -y firebase-tools deploy --only hosting --project samooh1

echo.
echo ========================================================
echo Deployment finished!
echo Web App URL: https://samooh1.web.app / https://samooh1.firebaseapp.com
echo ========================================================
pause
