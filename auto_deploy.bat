@echo off
setlocal

:: --- WILI AUTO-DEPLOY SCRIPT ---
:: Otomatis update GitHub & Trigger Vercel

echo ========================================================
echo  WILI AUTO-DEPLOY SYSTEM
echo ========================================================

:: 1. Cek Branch Saat Ini
for /f "tokens=*" %%a in ('git rev-parse --abbrev-ref HEAD') do set current_branch=%%a
echo  Active Branch: %current_branch%
echo ========================================================

echo.
echo [1/4] Memeriksa perubahan...
git status --short

echo.
echo [2/4] Menyimpan perubahan (Staging)...
git add .

echo.
echo [3/4] Membuat Commit...
set /p commit_msg="> Masukkan pesan update (Enter untuk default 'Auto-update'): "
if "%commit_msg%"=="" set commit_msg=Auto-update fixes %date% %time%
git commit -m "%commit_msg%"

echo.
echo [4/4] Upload ke GitHub (%current_branch%)...
git push origin %current_branch%

echo.
echo --------------------------------------------------------
echo  ✅ GITHUB UPDATED!
echo  ⏳ Vercel akan otomatis mendeteksi update ini.
echo --------------------------------------------------------

:: Logika Khusus: Jika bukan main, tawarkan deploy produksi
if "%current_branch%"=="main" goto :end

echo.
echo  [!] Anda sedang di branch '%current_branch%'.
echo      Vercel saat ini hanya memproses 'Preview Deployment'.
echo.
set /p merge_main="> GABUNG ke MAIN untuk DEPLOY LIVE PRODUKSI? (y/n): "
if /i "%merge_main%"=="y" (
    echo.
    echo  [PRODUKSI] Pindah ke main...
    git checkout main
    
    echo  [PRODUKSI] Menggabungkan perubahan...
    git merge %current_branch%
    
    echo  [PRODUKSI] Push ke GitHub Main (Trigger Vercel Prod)...
    git push origin main
    
    echo  [PRODUKSI] Kembali ke %current_branch%...
    git checkout %current_branch%
    
    echo.
    echo  🚀 PRODUCTION DEPLOY TRIGGERED!
    echo     Cek dashboard Vercel Anda dalam 1-2 menit.
)

:end
echo.
echo  Selesai. Tekan tombol apa saja untuk keluar.
pause >nul
