@echo off
echo Initializing Git Repository...
git init
echo.
echo Adding files (this may take a moment)...
git add .
echo.
echo Committing files...
git commit -m "First commit: WILI Bot (Gemini 2025)"
echo.
echo Setting branch to main...
git branch -M main
echo.
echo Adding remote origin...
git remote remove origin
git remote add origin https://github.com/wiliam95/bismillah.git
echo.
echo ===================================================
echo SETUP COMPLETE!
echo.
echo Please run this command manually to upload:
echo    git push -u origin main
echo ===================================================
