@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

:: 1. На всякий случай восстанавливаем стандартные пути Windows, если они были затерты
set "PATH=%SystemRoot%\system32;%SystemRoot%;%SystemRoot%\System32\Wbem;%SYSTEMROOT%\System32\WindowsPowerShell\v1.0\;%PATH%"

echo ========================================================
echo Автоматическая установка (Режим Администратора)
echo ========================================================
echo.

:: ========================================================
:: БЛОК УСТАНОВКИ WINGET (ЕСЛИ ОН ОТСУТСТВУЕТ)
:: ========================================================
where winget >nul 2>nul
if %errorlevel% equ 0 (
    echo [*] WinGet уже установлен в системе.
) else (
    echo [!] WinGet не найден. Начинаем установку WinGet и зависимостей...
    
    :: Скачиваем UI Xaml (используем %TEMP% из BAT, чтобы избежать конфликта кавычек в PowerShell)
    powershell -NoProfile -ExecutionPolicy Bypass -Command "Invoke-WebRequest -Uri 'https://github.com' -OutFile '%TEMP%\Microsoft.UI.Xaml.appx'"
    powershell -NoProfile -ExecutionPolicy Bypass -Command "Add-AppxPackage -Path '%TEMP%\Microsoft.UI.Xaml.appx'" 2>nul
    
    :: Скачиваем и устанавливаем сам WinGet
    powershell -NoProfile -ExecutionPolicy Bypass -Command "Invoke-WebRequest -Uri 'https://aka.ms' -OutFile '%TEMP%\winget.msixbundle'"
    powershell -NoProfile -ExecutionPolicy Bypass -Command "Add-AppxPackage -Path '%TEMP%\winget.msixbundle'"
    
    :: Очистка временных файлов установки
    del /q "%TEMP%\Microsoft.UI.Xaml.appx" 2>nul
    del /q "%TEMP%\winget.msixbundle" 2>nul
    
    echo [*] Установка WinGet завершена. Обновляем переменные окружения...
    
    :: Динамическое обновление PATH для текущей сессии
    for /f "tokens=2*" %%A in ('reg query "HKLM\System\CurrentControlSet\Control\Session Manager\Environment" /v Path') do set "Path=%%B"
    for /f "tokens=2*" %%A in ('reg query "HKCU\Environment" /v Path') do set "Path=!Path!;%%B"
)
echo.
:: ========================================================

echo [*] Установка Go...
winget install -e --id GoLang.Go --silent --accept-package-agreements --accept-source-agreements

echo [*] Установка Python...
winget install -e --id Python.Python.3.12 --silent --accept-package-agreements --accept-source-agreements

echo [*] Установка Node.js...
winget install -e --id OpenJS.NodeJS.LTS --silent --accept-package-agreements --accept-source-agreements

set "TARGET_DIR=%USERPROFILE%\Desktop\SQLupdate"
set "ZIP_FILE=%TARGET_DIR%\node.zip"
set "DOWNLOAD_URL=https://githubusercontent.com"

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
echo Базовая установка завершена! 
echo Переход к выполнению дополнительных скриптов...
echo ========================================================
