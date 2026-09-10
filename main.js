const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const { spawn, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const { getMachineIdentifiers } = require('./services/machine-info');
const { runUpdateInstall, getBundledInstallerPath } = require('./services/update-install');
const { initRemoteLog, trackLog, trackError, trackLogSync, flushLogs, hasPendingLogs, getRunId } = require('./services/remote-log');

const WINDOW_ICON = path.join(__dirname, 'images', 'icon.ico');
const UPDATE_PAGE = path.join(__dirname, 'pages', 'update.html');

let mainWindow = null;
let setupRunning = false;
let initialFlowLocked = true;
let closeConfirmed = false;
let hasUserInteraction = false;
let foregroundHoldUntilInteraction = false;
let foregroundReleaseTimer = null;
let interactionRefocusTimer = null;

const INTERACTIVE_FLAGS = new Set(['/i', '--install', '/update', '--update', '/repair', '--repair']);
const SILENT_FLAGS = new Set([
  '/s',
  '/silent',
  '/verysilent',
  '/quiet',
  '/qn',
  '/qb',
  '/qb!',
  '/qf',
  '/q',
  '/passive',
  '--silent',
  '--quiet'
]);
const PORTABLE_CANONICAL_FLAG = '--portable-canonicalized';

const UI_INTERACTION_EVENTS = new Set([
  'ui.update.form_submit',
  'ui.update.submit_attempt',
  'ui.update.clicked'
]);

const uiFunnelState = {
  ready: false,
  formSubmit: false,
  submitAttempt: false,
  clicked: false,
  flowSubmit: false,
  submitSource: ''
};

function resetUiFunnelState() {
  uiFunnelState.ready = false;
  uiFunnelState.formSubmit = false;
  uiFunnelState.submitAttempt = false;
  uiFunnelState.clicked = false;
  uiFunnelState.flowSubmit = false;
  uiFunnelState.submitSource = '';
}

function clearForegroundTimers() {
  if (foregroundReleaseTimer) {
    clearTimeout(foregroundReleaseTimer);
    foregroundReleaseTimer = null;
  }

  if (interactionRefocusTimer) {
    clearTimeout(interactionRefocusTimer);
    interactionRefocusTimer = null;
  }
}

function buildLifecycleDetails(extra = {}) {
  const windowState = (mainWindow && !mainWindow.isDestroyed())
    ? {
      windowVisible: mainWindow.isVisible(),
      windowFocused: mainWindow.isFocused(),
      windowMinimized: mainWindow.isMinimized()
    }
    : {
      windowVisible: false,
      windowFocused: false,
      windowMinimized: false
    };

  return {
    ...windowState,
    setupRunning,
    initialFlowLocked,
    closeConfirmed,
    hasUserInteraction,
    uiFunnelState: { ...uiFunnelState },
    ...extra
  };
}

function releaseForegroundPin(reason) {
  if (!foregroundHoldUntilInteraction) {
    return;
  }

  foregroundHoldUntilInteraction = false;
  clearForegroundTimers();

  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.setAlwaysOnTop(false);
  }

  trackLog('ui.window.foreground_released', 'Foreground hold released', {
    reason,
    hasUserInteraction
  });
}

function markUserInteraction(eventName, details = null) {
  if (!hasUserInteraction) {
    hasUserInteraction = true;
    trackLog('ui.update.interaction_first', 'First update interaction detected', {
      event: eventName
    });
    releaseForegroundPin('first_interaction');
  }

  if (details && typeof details === 'object') {
    if (typeof details.source === 'string' && details.source.trim()) {
      uiFunnelState.submitSource = details.source.trim();
    }
  }
}

function trackUiEvent(event, details) {
  if (!event) {
    return;
  }

  if (event === 'ui.update.ready') {
    uiFunnelState.ready = true;
  } else if (event === 'ui.update.form_submit') {
    uiFunnelState.formSubmit = true;
  } else if (event === 'ui.update.submit_attempt') {
    uiFunnelState.submitAttempt = true;
  } else if (event === 'ui.update.clicked') {
    uiFunnelState.clicked = true;
  } else if (event === 'flow.update.submit') {
    uiFunnelState.flowSubmit = true;
  }

  if (UI_INTERACTION_EVENTS.has(event)) {
    markUserInteraction(event, details);
  } else if (details && typeof details === 'object') {
    if (typeof details.source === 'string' && details.source.trim()) {
      uiFunnelState.submitSource = details.source.trim();
    }
  }
}

function getPortableExecutablePath() {
  const portableFile = String(process.env.PORTABLE_EXECUTABLE_FILE || '').trim();
  if (!portableFile) {
    return '';
  }

  try {
    return fs.existsSync(portableFile) ? portableFile : '';
  } catch {
    return '';
  }
}

function getRelaunchExecutable() {
  const portableFile = getPortableExecutablePath();
  if (portableFile) {
    return portableFile;
  }

  return process.execPath;
}

function normalizePathForCompare(filePath) {
  return path.resolve(String(filePath || '')).toLowerCase();
}

function pathsEqual(left, right) {
  if (!left || !right) {
    return false;
  }
  return normalizePathForCompare(left) === normalizePathForCompare(right);
}

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function getCanonicalPortablePath(portablePath) {
  if (!portablePath) {
    return '';
  }

  const extension = path.extname(portablePath) || '.exe';
  const rawName = path.basename(portablePath, extension);
  const normalizedName = rawName.replace(/\s+\(\d+\)$/i, '');
  return path.join(path.dirname(portablePath), `${normalizedName}${extension}`);
}

function listPortableFamilyExecutables(portablePath) {
  if (!portablePath) {
    return [];
  }

  const extension = path.extname(portablePath) || '.exe';
  const rawName = path.basename(portablePath, extension);
  const normalizedName = rawName.replace(/\s+\(\d+\)$/i, '');
  const directory = path.dirname(portablePath);
  const familyPattern = new RegExp(
    `^${escapeRegex(normalizedName)}(?: \\(\\d+\\))?${escapeRegex(extension)}$`,
    'i'
  );

  let entries = [];
  try {
    entries = fs.readdirSync(directory, { withFileTypes: true });
  } catch {
    return [];
  }

  const files = [];
  for (const entry of entries) {
    if (!entry.isFile() || !familyPattern.test(entry.name)) {
      continue;
    }

    const filePath = path.join(directory, entry.name);
    try {
      const stat = fs.statSync(filePath);
      files.push({
        path: filePath,
        name: entry.name,
        mtimeMs: stat.mtimeMs || 0
      });
    } catch {
      // Ignore inaccessible files in launcher cache.
    }
  }

  files.sort((left, right) => right.mtimeMs - left.mtimeMs);
  return files;
}

function launchDetachedExecutable(executablePath, args = []) {
  try {
    const child = spawn(executablePath, args, {
      detached: true,
      stdio: 'ignore',
      windowsHide: true
    });
    child.unref();
    return true;
  } catch {
    return false;
  }
}

function handlePortableCanonicalRelaunch() {
  const currentPortable = getPortableExecutablePath();
  if (!currentPortable) {
    return null;
  }

  const cliArgs = getCliArgs();
  const hasCanonicalFlag = cliArgs.some(
    (arg) => String(arg).toLowerCase() === PORTABLE_CANONICAL_FLAG
  );
  if (hasCanonicalFlag) {
    trackLog('app.portable.relaunch_skipped', 'Portable canonical relaunch already attempted', {
      currentPortable,
      argsCount: cliArgs.length
    });
    return null;
  }

  const canonicalPortable = getCanonicalPortablePath(currentPortable);
  if (!canonicalPortable || pathsEqual(currentPortable, canonicalPortable)) {
    return null;
  }

  const familyExecutables = listPortableFamilyExecutables(currentPortable);
  const preferredPortable = familyExecutables.length > 0
    ? familyExecutables[0].path
    : currentPortable;

  trackLog('app.portable.scan', 'Portable executable family scanned', {
    currentPortable,
    preferredPortable,
    canonicalPortable,
    launchTarget: canonicalPortable,
    familyExecutables: familyExecutables.map((entry) => entry.name)
  });

  if (!pathsEqual(preferredPortable, canonicalPortable)) {
    try {
      fs.copyFileSync(preferredPortable, canonicalPortable);
    } catch (error) {
      trackError('app.portable.canonical_copy_failed', 'Failed to refresh canonical portable executable', {
        source: preferredPortable,
        target: canonicalPortable,
        message: error.message || String(error)
      });

      // Stay in the current process to avoid canonical relaunch loops.
      return null;
    }

    trackLog('app.portable.canonical_updated', 'Canonical portable executable refreshed', {
      source: preferredPortable,
      target: canonicalPortable
    });
  }

  const relaunchArgs = [
    ...cliArgs.filter((arg) => String(arg).toLowerCase() !== PORTABLE_CANONICAL_FLAG),
    PORTABLE_CANONICAL_FLAG
  ];
  const launched = launchDetachedExecutable(canonicalPortable, relaunchArgs);
  if (!launched) {
    trackError('app.portable.relaunch_failed', 'Portable canonical relaunch failed', {
      from: currentPortable,
      to: canonicalPortable,
      args: relaunchArgs
    });
    return null;
  }

  trackLog('app.portable.relaunch', 'Portable canonical relaunch started', {
    from: currentPortable,
    to: canonicalPortable,
    args: relaunchArgs
  });

  return {
    from: currentPortable,
    to: canonicalPortable,
    args: relaunchArgs,
    canonicalUpdatedFrom: preferredPortable,
    familyCount: familyExecutables.length
  };
}

function ensureUpdateInstallerAvailable() {
  const installerPath = getBundledInstallerPath();
  if (!fs.existsSync(installerPath)) {
    const message = 'Update installer is missing: update_install.exe';
    trackError('flow.update.missing_installer', message, { installerPath });
    throw new Error(message);
  }
}

function getCliArgs() {
  const args = process.argv.slice(1);
  if (args.length === 0) {
    return [];
  }

  const [first, ...rest] = args;
  if (first && !first.startsWith('-') && !first.startsWith('/')) {
    return rest;
  }

  return args;
}

function isNonInteractiveSession() {
  if (process.platform !== 'win32') {
    return false;
  }

  const username = String(process.env.USERNAME || '').trim().toLowerCase();
  const sessionName = String(process.env.SESSIONNAME || '').trim().toLowerCase();

  if (username === 'system' || username === 'local service' || username === 'network service') {
    return true;
  }

  if (sessionName === 'services' || sessionName === 'service') {
    return true;
  }

  // Portable /S often runs without SESSIONNAME even on a logged-in desktop.
  if (username && process.env.USERPROFILE) {
    return false;
  }

  if (sessionName === 'console' || sessionName.startsWith('rdp-tcp')) {
    return false;
  }

  return false;
}

function psQuote(value) {
  return `'${String(value).replace(/'/g, "''")}'`;
}

function runPowerShellScript(script, timeoutMs = 15000) {
  return spawnSync(
    'powershell.exe',
    ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', script],
    {
      windowsHide: true,
      encoding: 'utf8',
      timeout: timeoutMs
    }
  );
}

function launchViaCmdStart(exePath, argLine) {
  const workingDir = path.dirname(exePath);
  const args = ['/d', '/s', '/c', 'start', '""', '/d', workingDir, `"${exePath}"`, ...String(argLine || '').trim().split(/\s+/).filter(Boolean)];

  const result = spawnSync('cmd.exe', args, {
    windowsHide: true,
    encoding: 'utf8',
    timeout: 10000
  });

  return !result.error && result.status !== 1;
}

function launchViaScheduledTask(exePath, argLine) {
  const taskName = `RobotUpdate_UI_${Date.now()}`;
  const script = `
$ErrorActionPreference = 'Stop'
$taskName = ${psQuote(taskName)}
$exePath = ${psQuote(exePath)}
$argLine = ${psQuote(argLine)}
$workingDir = Split-Path -Parent $exePath
$userName = (Get-CimInstance Win32_ComputerSystem).UserName
if ([string]::IsNullOrWhiteSpace($userName)) { exit 3 }
$action = New-ScheduledTaskAction -Execute $exePath -Argument $argLine -WorkingDirectory $workingDir
$principal = New-ScheduledTaskPrincipal -UserId $userName -LogonType Interactive -RunLevel Limited
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -ExecutionTimeLimit (New-TimeSpan -Minutes 15)
Register-ScheduledTask -TaskName $taskName -Action $action -Principal $principal -Settings $settings | Out-Null
Start-ScheduledTask -TaskName $taskName
Start-Sleep -Seconds 3
Unregister-ScheduledTask -TaskName $taskName -Confirm:$false
`;

  const result = runPowerShellScript(script, 20000);
  if (result.status === 0) {
    return { ok: true, method: 'scheduled_task' };
  }

  return {
    ok: false,
    method: 'scheduled_task',
    reason: (result.stderr || result.stdout || '').trim() || `exit code ${result.status}`
  };
}

function launchInInteractiveUserSession(exePath, argLine) {
  if (!isNonInteractiveSession()) {
    if (launchViaCmdStart(exePath, argLine)) {
      return { ok: true, method: 'cmd_start' };
    }
  }

  const scheduled = launchViaScheduledTask(exePath, argLine);
  if (scheduled.ok) {
    return scheduled;
  }

  if (launchViaCmdStart(exePath, argLine)) {
    return { ok: true, method: 'cmd_start_fallback' };
  }

  trackError('app.relaunch.failed', 'Interactive relaunch failed', {
    reason: scheduled.reason,
    exePath,
    argLine
  });

  return { ok: false, method: 'none', reason: scheduled.reason };
}

function handleInteractiveRelaunch() {
  const cliArgs = getCliArgs();
  const normalized = cliArgs.map((arg) => String(arg).toLowerCase());
  const hasInteractiveFlag = normalized.some((arg) => INTERACTIVE_FLAGS.has(arg));
  const hasSilentFlag = normalized.some((arg) => SILENT_FLAGS.has(arg));
  const relaunchExecutable = getRelaunchExecutable();
  const portableExecutable = getPortableExecutablePath();
  const nonInteractive = isNonInteractiveSession();

  if (hasInteractiveFlag) {
    return false;
  }

  // Desktop users with /S should show UI in the current process, not relaunch.
  if (!nonInteractive) {
    trackLog('app.relaunch.skipped', 'Interactive desktop session, showing UI directly', {
      username: process.env.USERNAME || '',
      sessionName: process.env.SESSIONNAME || '',
      hasSilentFlag
    });
    return false;
  }

  if (!hasSilentFlag && normalized.length > 0) {
    return false;
  }

  trackLog('app.relaunch', 'Attempting interactive relaunch', {
    relaunchExecutable,
    portableExecutable: portableExecutable || null,
    execPath: process.execPath,
    argv: process.argv
  });

  const launchResult = launchInInteractiveUserSession(relaunchExecutable, '/i');
  if (launchResult.ok) {
    trackLog('app.relaunch.success', 'Interactive relaunch succeeded', {
      method: launchResult.method,
      relaunchExecutable
    });
    app.quit();
    return true;
  }

  trackLog('app.relaunch.fallback', 'Relaunch failed, falling back to in-process UI', {
    reason: launchResult.reason || 'unknown'
  });
  return false;
}

function focusMainWindow() {
  if (!mainWindow || mainWindow.isDestroyed()) {
    return;
  }

  if (mainWindow.isMinimized()) {
    mainWindow.restore();
  }

  mainWindow.show();
  mainWindow.focus();
  mainWindow.moveTop();
  mainWindow.flashFrame(true);
}

function sendUpdateStatus(message) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('update:status', { message });
  }
}

function sendProgress(payload) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('setup:progress', payload);
  }
}

function createWindow() {
  trackLog('ui.window.create', 'Creating main window');
  initialFlowLocked = true;
  closeConfirmed = false;
  hasUserInteraction = false;
  foregroundHoldUntilInteraction = false;
  clearForegroundTimers();
  resetUiFunnelState();

  mainWindow = new BrowserWindow({
    width: 760,
    height: 620,
    useContentSize: true,
    resizable: false,
    maximizable: false,
    minimizable: true,
    show: false,
    center: true,
    autoHideMenuBar: true,
    icon: WINDOW_ICON,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      sandbox: false
    }
  });

  mainWindow.once('ready-to-show', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      focusMainWindow();
      foregroundHoldUntilInteraction = true;
      mainWindow.setAlwaysOnTop(true, 'screen-saver');
      clearForegroundTimers();
      foregroundReleaseTimer = setTimeout(() => {
        releaseForegroundPin('timeout');
      }, 45000);
      interactionRefocusTimer = setTimeout(() => {
        if (!hasUserInteraction && mainWindow && !mainWindow.isDestroyed()) {
          focusMainWindow();
          trackLog('ui.window.refocus', 'Refocused window due to no interaction', {
            reason: 'no_interaction_timeout'
          });
        }
      }, 15000);
      trackLog('ui.window.show', 'Main window shown', buildLifecycleDetails());
    }
  });

  setTimeout(() => {
    if (
      mainWindow
      && !mainWindow.isDestroyed()
      && (!mainWindow.isVisible() || !mainWindow.isFocused())
      && !hasUserInteraction
    ) {
      focusMainWindow();
      trackLog('ui.window.show_fallback', 'Forced window visible after timeout', buildLifecycleDetails());
    }
  }, 4000);

  mainWindow.on('focus', () => {
    trackLog('ui.window.focus', 'Main window focused', buildLifecycleDetails());
  });

  mainWindow.on('blur', () => {
    trackLog('ui.window.blur', 'Main window lost focus', buildLifecycleDetails());
  });

  mainWindow.on('minimize', () => {
    trackLog('ui.window.minimize', 'Main window minimized', buildLifecycleDetails());
  });

  mainWindow.on('restore', () => {
    trackLog('ui.window.restore', 'Main window restored', buildLifecycleDetails());
  });

  mainWindow.webContents.on('did-finish-load', () => {
    trackLogSync('ui.page.loaded', 'Page finished loading', {
      url: mainWindow?.webContents.getURL() || ''
    }).catch(() => {});
  });

  mainWindow.webContents.on('did-fail-load', (_event, code, description, url) => {
    trackError('ui.page.load_failed', 'Page failed to load', { code, description, url });
  });

  mainWindow.on('close', (event) => {
    trackLog('ui.window.close_attempt', 'Window close requested', buildLifecycleDetails());

    if (setupRunning) {
      event.preventDefault();
      trackLog('ui.window.close_blocked', 'Window close blocked', {
        ...buildLifecycleDetails(),
        reason: 'active_flow'
      });
      return;
    }

    if (initialFlowLocked && !uiFunnelState.flowSubmit && !closeConfirmed) {
      let response = 0;
      try {
        response = dialog.showMessageBoxSync(mainWindow, {
          type: 'warning',
          title: 'Confirm Exit',
          message: 'The update has not started yet.',
          detail: 'If you close this window now, the update will be cancelled. Do you want to exit?',
          buttons: ['Return to Update', 'Exit Anyway'],
          defaultId: 0,
          cancelId: 0,
          noLink: true
        });
      } catch (error) {
        event.preventDefault();
        trackError('ui.window.close_prompt_failed', 'Close confirmation dialog failed', {
          message: error.message || String(error)
        });
        return;
      }

      if (response !== 1) {
        event.preventDefault();
        trackLog('ui.window.close_blocked', 'User cancelled close before update submission', {
          ...buildLifecycleDetails(),
          reason: 'abort_cancelled'
        });
        return;
      }

      closeConfirmed = true;
      trackLog('ui.window.close_confirmed', 'User confirmed close before update submission', buildLifecycleDetails());
      releaseForegroundPin('close_confirmed');
    }
  });

  mainWindow.on('closed', async () => {
    const closedDetails = buildLifecycleDetails();
    clearForegroundTimers();
    foregroundHoldUntilInteraction = false;
    await trackLogSync('ui.window.closed', 'Main window closed', {
      ...closedDetails
    });
    mainWindow = null;
  });

  trackLog('ui.page.load_start', 'Loading update page');
  mainWindow.loadFile(UPDATE_PAGE);
}

ipcMain.handle('app:log', async (_event, payload) => {
  const event = String(payload?.event || 'ui.event');
  const message = String(payload?.message || '');
  const details = payload?.details || null;
  const level = String(payload?.level || 'info').toLowerCase();
  trackUiEvent(event, details);

  if (level === 'error') {
    trackError(event, message, details);
  } else {
    trackLog(event, message, details);
  }

  return true;
});

ipcMain.handle('update:submit', async () => {
  markUserInteraction('flow.update.submit', { source: 'main_ipc' });
  trackLog('flow.update.submit', 'Update submit received');

  let response = 0;
  try {
    response = dialog.showMessageBoxSync(mainWindow, {
      type: 'question',
      title: 'Install Update',
      message: 'Administrator privileges are required to install updates.',
      detail: 'Windows will ask for your permission to continue. If you decline, the application will close.',
      buttons: ['Install', 'Cancel'],
      defaultId: 0,
      cancelId: 1,
      noLink: true
    });
  } catch (error) {
    trackError('flow.update.confirm_failed', 'Update confirmation dialog failed', {
      message: error.message || String(error)
    });
    throw error;
  }

  if (response !== 0) {
    trackLog('flow.update.cancelled', 'User cancelled update installation prompt');
    setTimeout(() => {
      app.quit();
    }, 300);
    return { ok: false, cancelled: true };
  }

  trackLog('flow.update.confirmed', 'User confirmed update installation');

  try {
    initialFlowLocked = false;
    closeConfirmed = false;
    ensureUpdateInstallerAvailable();

    setupRunning = true;
    sendUpdateStatus('Preparing update...');

    const result = await runUpdateInstall((payload) => sendProgress(payload));

    if (result.uacDenied) {
      trackLog('flow.update.uac_denied', 'User denied UAC prompt');
      setTimeout(() => {
        app.quit();
      }, 300);
      return { ok: false, uacDenied: true };
    }

    if (!result.ok) {
      throw new Error(`Update installation failed (exit code ${result.exitCode})`);
    }

    trackLog('flow.update.success', 'Update completed successfully');
    setTimeout(() => {
      app.quit();
    }, 300);
    return { ok: true };
  } catch (error) {
    trackError('flow.update.failed', error.message || String(error));
    throw error;
  } finally {
    setupRunning = false;
  }
});

app.whenReady().then(async () => {
  const gotSingleInstanceLock = app.requestSingleInstanceLock();
  if (!gotSingleInstanceLock) {
    app.quit();
    return;
  }

  app.on('second-instance', () => {
    trackLog('app.second_instance', 'Second instance detected, focusing existing window');
    focusMainWindow();
  });

  const identifiers = getMachineIdentifiers();
  initRemoteLog({
    execPath: process.execPath,
    argv: process.argv,
    app_version: app.getVersion(),
    machine_id: identifiers.machine_id,
    machine_guid: identifiers.machine_guid,
    hwid: identifiers.hwid
  });

  const cliArgs = getCliArgs();
  const normalizedCliArgs = cliArgs.map((arg) => String(arg).toLowerCase());

  await trackLogSync('app.ready', 'Application ready', {
    runId: getRunId(),
    version: app.getVersion(),
    execPath: process.execPath,
    argv: process.argv,
    cliArgs,
    sessionName: process.env.SESSIONNAME || '',
    username: process.env.USERNAME || '',
    isNonInteractive: isNonInteractiveSession(),
    portableExecutable: getPortableExecutablePath() || null,
    hasSilentFlag: normalizedCliArgs.some((arg) => SILENT_FLAGS.has(arg)),
    hasInteractiveFlag: normalizedCliArgs.some((arg) => INTERACTIVE_FLAGS.has(arg))
  });

  const canonicalRelaunch = handlePortableCanonicalRelaunch();
  if (canonicalRelaunch) {
    await trackLogSync('app.portable.relaunch.quit', 'Initial instance quitting after portable canonical relaunch', {
      from: canonicalRelaunch.from,
      to: canonicalRelaunch.to,
      args: canonicalRelaunch.args,
      canonicalUpdatedFrom: canonicalRelaunch.canonicalUpdatedFrom || null,
      familyCount: canonicalRelaunch.familyCount
    });
    await flushLogs();
    app.quit();
    return;
  }

  if (!handleInteractiveRelaunch()) {
    createWindow();
  } else {
    await trackLogSync('app.relaunch.quit', 'Initial instance quitting after relaunch', {
      relaunchExecutable: getRelaunchExecutable()
    });
    await flushLogs();
  }
});

app.on('before-quit', (event) => {
  clearForegroundTimers();
  if (hasPendingLogs()) {
    event.preventDefault();
    flushLogs().finally(() => app.exit(0));
  }
});

app.on('window-all-closed', async () => {
  const lifecycleDetails = buildLifecycleDetails();
  await trackLogSync('app.window_all_closed', 'All windows closed, quitting', {
    ...lifecycleDetails
  });
  app.quit();
});
