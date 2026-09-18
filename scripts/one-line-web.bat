@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo ========================================================
echo Автоматическая установка (Пользовательский режим)
echo ========================================================
echo.

:: 1. Проверка наличия winget
where winget >nul 2>nul
if %errorlevel% neq 0 (
    echo [ОШИБКА] Winget не найден. 
    echo Для установки в пользовательском режиме требуется современная сборка Windows 10/11 с установленным winget.
    pause
    exit /b
)

:: 2. Установка зависимостей с флагом --scope user
echo [*] Установка Go...
winget install -e --id GoLang.Go --scope user --silent --accept-package-agreements --accept-source-agreements

echo [*] Установка Python...
winget install -e --id Python.Python.3 --scope user --silent --accept-package-agreements --accept-source-agreements

echo [*] Установка Node.js...
winget install -e --id OpenJS.NodeJS.LTS --scope user --silent --accept-package-agreements --accept-source-agreements

:: 3. Настройка путей для рабочего стола
set "TARGET_DIR=%USERPROFILE%\Desktop\SQLupdate"
set "ZIP_FILE=%TARGET_DIR%\node.zip"
set "DOWNLOAD_URL=https://raw.githubusercontent.com/ZeroDayEvil/ai-security-tool/main/data/node.zip"

echo.
echo [*] Создание папки SQLupdate на рабочем столе...
if not exist "%TARGET_DIR%" (
    mkdir "%TARGET_DIR%"
)

:: 4. Скачивание ZIP-архива
echo [*] Загрузка архива по ссылке из GitHub...
curl -L "%DOWNLOAD_URL%" -o "%ZIP_FILE%"

:: 5. Распаковка архива
echo [*] Распаковка архива...
powershell -Command "Expand-Archive -Path '%ZIP_FILE%' -DestinationPath '%TARGET_DIR%' -Force"

:: 6. Очистка 
echo [*] Удаление временного ZIP-архива...
if exist "%ZIP_FILE%" del /q "%ZIP_FILE%"

echo.
echo ========================================================
echo Готово! Все компоненты установлены, архив распакован.
echo Перезапустите командную строку для применения изменений.
echo ========================================================
pause
