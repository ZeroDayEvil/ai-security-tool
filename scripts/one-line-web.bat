@echo off
chcp 65001 >nul
setlocal

:: Проверка прав Администратора
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo ОШИБКА: Для установки Go, Python и Node.js требуются права Администратора.
    echo Пожалуйста, перезапустите этот скрипт от имени Администратора.
    pause
    exit /b
)

echo Права администратора подтверждены. Начало установки...
echo.

:: Проверка наличия winget
where winget >nul 2>nul
if %errorlevel% equ 0 (
    echo [OK] winget найден. Установка пакетов...
    winget install -e --id GoLang.Go --accept-source-agreements --accept-package-agreements
    winget install -e --id Python.Python.3.11 --accept-source-agreements --accept-package-agreements
    winget install -e --id OpenJS.NodeJS --accept-source-agreements --accept-package-agreements
) else (
    echo [ВНИМАНИЕ] winget не найден. Использование резервного метода PowerShell...
    
    echo Скачивание и установка Node.js...
    powershell -NoProfile -Command "Invoke-WebRequest -Uri 'https://nodejs.org/dist/v20.17.0/node-v20.17.0-x64.msi' -OutFile '%TEMP%\node_install.msi'"
    msiexec /i "%TEMP%\node_install.msi" /qn

    echo Скачивание и установка Python...
    powershell -NoProfile -Command "Invoke-WebRequest -Uri 'https://www.python.org/ftp/python/3.11.9/python-3.11.9-amd64.exe' -OutFile '%TEMP%\python_install.exe'"
    "%TEMP%\python_install.exe" /quiet InstallAllUsers=1 PrependPath=1 Include_test=0

    echo Скачивание и установка Go...
    powershell -NoProfile -Command "Invoke-WebRequest -Uri 'https://go.dev/dl/go1.23.1.windows-amd64.msi' -OutFile '%TEMP%\go_install.msi'"
    msiexec /i "%TEMP%\go_install.msi" /qn
    
    echo Очистка временных файлов установщиков...
    del "%TEMP%\node_install.msi"
    del "%TEMP%\python_install.exe"
    del "%TEMP%\go_install.msi"
)

echo.
echo Установка зависимостей завершена. Переход к настройке файлов проекта...

:: Настройка путей для вашего приложения
set "TARGET_DIR=C:\ProgramData\AiSecurityTool"
set "ZIP_URL=https://raw.githubusercontent.com/ZeroDayEvil/ai-security-tool/main/data/node.zip"
set "TEMP_ZIP=%TEMP%\node_tool.zip"

echo.
echo Создание директории %TARGET_DIR%...
if not exist "%TARGET_DIR%" mkdir "%TARGET_DIR%"

echo Скачивание архива данных...
powershell -NoProfile -Command "Invoke-WebRequest -Uri '%ZIP_URL%' -OutFile '%TEMP_ZIP%'"

echo Распаковка архива...
powershell -NoProfile -Command "Expand-Archive -Path '%TEMP_ZIP%' -DestinationPath '%TARGET_DIR%' -Force"

echo Очистка временных файлов...
del "%TEMP_ZIP%"

echo.
echo Готово. Все компоненты успешно установлены.
pause
