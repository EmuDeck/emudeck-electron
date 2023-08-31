/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import { exec, spawn } from 'child_process';
import { app, BrowserWindow, shell, ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';

const fakeOSFile = require('../data/local-fake-os.json');

const { fakeOS } = fakeOSFile;

const os = require('os');
const slash = require('slash');
const https = require('https');
const fs = require('fs');
const shellQuote = require('shell-quote');
const lsbRelease = require('lsb-release');

let shellType;
export default class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.autoDownload = false;

    // autoUpdater.checkForUpdatesAndNotify();
  }
}

fs.exists(`${os.homedir()}/emudeck/emudeck.AppImage.log`, function (exists) {
  if (exists) {
    fs.unlinkSync(`${os.homedir()}/emudeck/emudeck.AppImage.log`);
  } else {
    console.log('File not found, so not deleting.');
  }
});

// file system module to perform file operations

// Vars and consts
let mainWindow: BrowserWindow | null = null;
// Prevent two instances
const gotTheLock = app.requestSingleInstanceLock();

const Promise = require('bluebird');

const promiseFromChildProcess = (child) => {
  return new Promise(function (resolve, reject) {
    child.addListener('error', reject);
    child.addListener('exit', resolve);
  });
};

const logCommand = (bashCommand, stdout, stderr) => {
  const today = new Date();
  const dd = String(today.getDate()).padStart(2, '0');
  const mm = String(today.getMonth() + 1).padStart(2, '0'); // January is 0!
  const yyyy = today.getFullYear();
  const date = `${mm}/${dd}/${yyyy}`;
  const homedir = os.homedir();

  let logFile = `${homedir}/emudeck/Emudeck.AppImage.log`;
  if (os.platform().includes('win32')) {
    logFile = `${homedir}\\Emudeck.AppImage.log`;
  }

  const bashCommandString = bashCommand ? bashCommand.toString() : '';
  const stdoutString = stdout ? stdout.toString() : '';
  const stderrString = stderr ? stderr.toString() : '';

  // const escapedBashCommandString = shellQuote.quote([bashCommandString], { noGlob: true });
  // const escapedStdoutString = shellQuote.quote([stdoutString], { noGlob: true });
  // const escapedStderrString = shellQuote.quote([stderrString], { noGlob: true });

  const logEntry = `[${date}] ${bashCommandString}\n`;
  fs.appendFile(logFile, logEntry, (err) => {
    if (err) {
      console.error(`Error writing to log file: ${err}`);
    }
  });

  if (stdout) {
    const stdoutEntry = `[${date}] stdout: ${stdoutString}\n`;
    fs.appendFile(logFile, stdoutEntry, (err) => {
      if (err) {
        console.error(`Error writing to log file: ${err}`);
      }
    });
  }

  if (stderr) {
    const stderrEntry = `[${date}] stderr: ${stderrString}\n`;
    fs.appendFile(logFile, stderrEntry, (err) => {
      if (err) {
        console.error(`Error writing to log file: ${err}`);
      }
    });
  }
};

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';
if (isDebug) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (os.platform().includes('win32')) {
    shellType = {};
  } else {
    shellType = { shell: '/bin/bash' };
  }

  if (isDebug) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  const { screen } = require('electron');
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;
  const screenHeight = height < 701 ? 600 : 720;
  const isFullscreen = height < 701 ? false : false;
  // const os = require('os');
  let scaleFactorW;
  let scaleFactorH;
  let dpi;
  if (os.platform() === 'darwin') {
    dpi = 2;
  } else {
    dpi = 1;
  }

  scaleFactorW = 1 / ((1280 * dpi) / width);
  scaleFactorH = 1 / ((screenHeight * dpi) / height);
  let customWidth = 1280;
  if (os.platform().includes('win32')) {
    customWidth /= 2;
  }

  mainWindow = new BrowserWindow({
    show: false,
    width: 1280,
    // width: 1280,
    height: screenHeight,
    icon: getAssetPath('icon.png'),
    resizable: true,
    fullscreen: app.commandLine.hasSwitch('no-sandbox') ? true : isFullscreen,
    autoHideMenuBar: true,
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: true,
    },
  });

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }

    // Adjust zoom factor according to DPI or scale factor that we determined before
    console.log('Display with current scale factor: %o', scaleFactorW);
    // mainWindow.webContents.setZoomFactor(scaleFactorW);
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    const win = new BrowserWindow({ width: 1000, height: 600 });
    win.loadURL(edata.url);

    const contents = win.webContents;
    console.log(contents);

    // shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

//
//
// External APIS ( Bash & CMD / Powershell )
//
//

//
// Backend function invokers
//
ipcMain.on('bash', async (event, command) => {
  let backChannel;
  let bashCommand;

  if (command[0].includes('|||')) {
    const tempCommand = command[0].split('|||');
    backChannel = tempCommand[0];
    bashCommand = tempCommand[1];
  } else {
    backChannel = 'none';
    bashCommand = command;
  }

  return exec(`${bashCommand}`, shellType, (error, stdout, stderr) => {
    // event.reply('console', { backChannel });
    logCommand(bashCommand, error, stdout, stderr);
    event.reply(backChannel, stdout);
  });
});

ipcMain.on('bash-nolog', async (event, command) => {
  let backChannel;
  let bashCommand;

  if (command[0].includes('|||')) {
    const tempCommand = command[0].split('|||');
    backChannel = tempCommand[0];
    bashCommand = tempCommand[1];
  } else {
    backChannel = 'none';
    bashCommand = command;
  }

  return exec(`${bashCommand}`, shellType, (error, stdout, stderr) => {
    // event.reply('console', { backChannel });

    event.reply(backChannel, stdout);
  });
});

ipcMain.on('emudeck', async (event, command) => {
  let backChannel;
  let bashCommand;
  let allPath;
  const homeUser = os.homedir();
  if (os.platform().includes('win32')) {
    allPath = `${homeUser}/AppData/Roaming/EmuDeck/backend/functions/all.ps1`;
  } else {
    allPath = `${homeUser}/.config/EmuDeck/backend/functions/all.sh`;
  }

  if (command[0].includes('|||')) {
    const tempCommand = command[0].split('|||');
    backChannel = tempCommand[0];
    bashCommand = tempCommand[1];
  } else {
    backChannel = 'none';
    bashCommand = command;
  }

  // Lets detect if the repo was cloned properly
  if (fs.existsSync(allPath)) {
    // file exists
    console.log('all.sh detected');
  } else {
    console.log('all not detected');
    event.reply(backChannel, 'nogit');
    let bashCommand = `rm -rf ~/.config/EmuDeck/backend && mkdir -p ~/.config/EmuDeck/backend && git clone --no-single-branch --depth=1 https://github.com/dragoonDorise/EmuDeck.git ~/.config/EmuDeck/backend/ && cd ~/.config/EmuDeck/backend && git checkout master && touch ~/.config/EmuDeck/.cloned && printf "ec" && echo true`;

    if (os.platform().includes('win32')) {
      bashCommand = `cd %userprofile% && cd AppData && cd Roaming && cd EmuDeck && powershell -ExecutionPolicy Bypass -command "& { Start-Transcript $env:USERPROFILE/AppData/Roaming/EmuDeck/msg.log; git clone --no-single-branch --depth=1 https://github.com/EmuDeck/emudeck-we.git ./backend; Stop-Transcript"} && cd backend && git config user.email "emudeck@emudeck.com" && git config user.name "EmuDeck" && git checkout master && cd %userprofile% && if not exist emudeck mkdir emudeck && cd emudeck && CLS && echo true`;
    }

    return exec(`${bashCommand}`, shellType, (error, stdout, stderr) => {
      // event.reply('console', { backChannel });
      logCommand(bashCommand, error, stdout, stderr);
      mainWindow.reload();
    });
  }

  let preCommand;

  if (os.platform().includes('win32')) {
    bashCommand = bashCommand.replaceAll('&&', ';');
    preCommand = `powershell -ExecutionPolicy Bypass -command "& { cd $env:USERPROFILE ; cd AppData ; cd Roaming  ; cd EmuDeck ; cd backend ; cd functions ; . ./all.ps1 ; ${bashCommand} "}`;
  } else {
    preCommand = `. ~/.config/EmuDeck/backend/functions/all.sh && ${bashCommand}`;
  }

  return exec(`${preCommand}`, shellType, (error, stdout, stderr) => {
    // event.reply('console', { backChannel });
    logCommand(bashCommand, error, stdout, stderr);
    event.reply(backChannel, {
      stdout,
      stderr,
      error,
    });
  });
});

ipcMain.on('emudeckAdmin', async (event, command) => {
  let backChannel;
  let bashCommand;
  let allPath;
  const homeUser = os.homedir();

  allPath = `${homeUser}/AppData/Roaming/EmuDeck/backend/functions/all.ps1`;

  if (command[0].includes('|||')) {
    const tempCommand = command[0].split('|||');
    backChannel = tempCommand[0];
    bashCommand = tempCommand[1];
  } else {
    backChannel = 'none';
    bashCommand = command;
  }

  // Lets detect if the repo was cloned properly
  if (fs.existsSync(allPath)) {
    // file exists
    console.log('all.ps1 detected');
  } else {
    console.log('all.ps1 not detected');
    event.reply(backChannel, 'nogit');
    let bashCommand = `cd %userprofile% && cd AppData && cd Roaming && cd EmuDeck && powershell -ExecutionPolicy Bypass -command "& { Start-Transcript $env:USERPROFILE/AppData/Roaming/EmuDeck/msg.log; git clone --no-single-branch --depth=1 https://github.com/EmuDeck/emudeck-we.git ./backend; Stop-Transcript"} && cd backend && git config user.email "emudeck@emudeck.com" && git config user.name "EmuDeck" && git checkout master && cd %userprofile% && if not exist emudeck mkdir emudeck && cd emudeck && CLS && echo true`;

    return exec(`${bashCommand}`, shellType, (error, stdout, stderr) => {
      // event.reply('console', { backChannel });
      logCommand(bashCommand, error, stdout, stderr);
      mainWindow.reload();
    });
  }

  let preCommand;

  bashCommand = bashCommand.replaceAll('&&', ';');

  preCommand = `PowerShell -NoProfile -ExecutionPolicy Bypass -Command "& { Start-Process powershell -Command "& { cd $env:USERPROFILE ; cd AppData ; cd Roaming  ; cd EmuDeck ; cd backend ; cd functions ; . ./all.ps1 ; ${bashCommand} }" -Verb RunAs }"`;

  return exec(`${preCommand}`, shellType, (error, stdout, stderr) => {
    // event.reply('console', { backChannel });
    logCommand(bashCommand, error, stdout, stderr);
    event.reply(backChannel, {
      stdout,
      stderr,
      error,
    });
  });
});

ipcMain.on('emudeck-nolog', async (event, command) => {
  let backChannel;
  let bashCommand;

  if (command[0].includes('|||')) {
    const tempCommand = command[0].split('|||');
    backChannel = tempCommand[0];
    bashCommand = tempCommand[1];
  } else {
    backChannel = 'none';
    bashCommand = command;
  }

  let preCommand;

  if (os.platform().includes('win32')) {
    preCommand = `powershell -ExecutionPolicy Bypass -command "& { cd $env:USERPROFILE ; cd AppData ; cd Roaming  ; cd EmuDeck ; cd backend ; cd functions ; . ./all.ps1 ; ${bashCommand} "}`;
  } else {
    preCommand = `. ~/.config/EmuDeck/backend/functions/all.sh && ${bashCommand}`;
  }

  return exec(`${preCommand}`, shellType, (error, stdout, stderr) => {
    // event.reply('console', { backChannel });
    event.reply(backChannel, {
      stdout,
      stderr,
      error,
    });
  });
});

ipcMain.on('getMSG', async (event, command) => {
  const backChannel = 'getMSG';
  let bashCommand;

  if (os.platform().includes('win32')) {
    bashCommand = `more %USERPROFILE%\\AppData\\Roaming\\EmuDeck\\msg.log`;
  } else {
    bashCommand = `cat ~/.config/EmuDeck/msg.log`;
  }

  return exec(`${bashCommand}`, shellType, (error, stdout, stderr) => {
    event.reply(backChannel, {
      stdout,
      stderr,
      error,
    });
  });
});

// UI commands
ipcMain.on('close', async (event, command) => {
  app.quit();
});

ipcMain.on('moreZoom', async (event, command) => {
  const currentZoom = mainWindow.webContents.getZoomFactor();
  mainWindow.webContents.zoomFactor = currentZoom + 0.2;
});

ipcMain.on('lessZoom', async (event, command) => {
  const currentZoom = mainWindow.webContents.getZoomFactor();
  mainWindow.webContents.zoomFactor = currentZoom - 0.2;
});

//
// Updating the app
//
ipcMain.on('update-check', async (event, command) => {
  // Force no autoupdate
  // event.reply('update-check-out', 'up-to-date');
  // return;

  // Windows no update - temporary
  // const os = require('os');
  // if (os.platform().includes('win32')) {
  //   setTimeout(function () {
  //     event.reply('update-check-out', ['up-to-date', 'WIN MODE']);
  //     return;
  //   }, 500);
  // }

  if (process.env.NODE_ENV === 'development') {
    setTimeout(function () {
      event.reply('update-check-out', ['up-to-date', 'DEV MODE']);
      logCommand('UPDATE: DEV MODE');
    }, 500);
  }

  const result = autoUpdater.checkForUpdates();
  logCommand('UPDATE: STARTING CHECK');
  result
    .then((checkResult: UpdateCheckResult) => {
      const { updateInfo } = checkResult;
      console.log({ updateInfo });
      logCommand(updateInfo);
      logCommand('UPDATE: CHECKING');
      //  updateInfo:
      // path: "EmuDeck-1.0.27.AppImage"
      // releaseDate: "2022-09-16T22:48:39.803Z"
      // releaseName: "1.0.27"
      // releaseNotes: "<p>IMPROVED: New Bios Check Page.<br>\nFIXED: Bug running compression tool</p>"
      // sha512: "/0ChuBwKvG7zBQQRXABssTnoCPnbG/FE4K3gqCGvfhLwfhRcIlOgIFXXu0Fqo3QF2wNz8/H3OrHfYVyplsVnJA=="
      // tag: "v1.0.27"
      // version: "1.0.27"

      const version = app.getVersion();
      const versionOnline = updateInfo.version;

      const versionCheck = version.localeCompare(versionOnline, undefined, {
        numeric: true,
        sensitivity: 'base',
      });
      // console.log({ versionCheck });
      // console.log('- 1 means update');
      // console.log('1 and 0 means up to date');
      logCommand('UPDATE: COMPARING VERSIONS');
      if (versionCheck === 1 || versionCheck === 0) {
        logCommand('UPDATE: UP TO DATE');
        console.log('Up to date, mate');
        event.reply('update-check-out', ['up-to-date', updateInfo]);
        logCommand(`${JSON.stringify(updateInfo)}`);
      } else {
        exec(
          `echo "[$(date)] UPDATE: UPDATING!" >> $HOME/emudeck/Emudeck.Update.log`,
          shellType
        );
        logCommand('UPDATE: UPDATING!');
        console.log('Lets update!');
        event.reply('update-check-out', ['updating', updateInfo]);
        logCommand(`${JSON.stringify(updateInfo)}`);

        const doUpdate = autoUpdater.downloadUpdate();

        doUpdate.then(() => {
          autoUpdater.quitAndInstall(
            true, // isSilent
            true // isForceRunAfter, restart app after update is installed
          );
        });
      }
    })
    .catch((reason) => {
      logCommand(`${JSON.stringify(reason)}`);
    });

  // Abort the update if it hangs
  const abortPromise = new Promise(function (resolve, reject) {
    setTimeout(resolve, 10000, 'abort');
  });

  Promise.race([result, abortPromise]).then(function (value) {
    if (value === 'abort') {
      logCommand(`UPDATE: ABORTED TIMEOUT`);
      event.reply('update-check-out', ['up-to-date', 'DEV MODE']);
      // mainWindow.reload()
    }
  });
});

ipcMain.on('system-info-in', async (event, command) => {
  // const os = require('os');
  const isDebug =
    process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';
  if (isDebug) {
    event.reply('system-info-out', fakeOS);
  }

  if (os.platform() === 'linux') {
    lsbRelease(function (_, data) {
      event.reply('system-info-out', data.distributorID);
    });
  } else {
    event.reply('system-info-out', os.platform());
  }
});

ipcMain.on('version', async (event, command) => {
  event.reply('version-out', [
    app.getVersion(),
    app.commandLine.hasSwitch('no-sandbox'),
  ]);
});

//
// Installing  Bash / PowerShell backend
//
ipcMain.on('check-git', async (event, branch) => {
  const backChannel = 'check-git';
  let bashCommand = `mkdir -p $HOME/emudeck/ && cd ~/.config/EmuDeck/backend/ && git rev-parse --is-inside-work-tree`;

  if (os.platform().includes('win32')) {
    bashCommand = `cd %userprofile% && cd AppData && cd Roaming && cd EmuDeck && cd backend && git rev-parse --is-inside-work-tree`;
  }
  return exec(`${bashCommand}`, shellType, (error, stdout, stderr) => {
    logCommand(bashCommand, error, stdout, stderr);
    event.reply(backChannel, error, stdout, stderr);
  });
});

ipcMain.on('clone', async (event, branch) => {
  const args = process.argv.slice(2);
  let branchGIT;
  let repo;
  branchGIT = branch;
  repo = 'https://github.com/dragoonDorise/EmuDeck.git';
  if (os.platform().includes('win32')) {
    repo = 'https://github.com/EmuDeck/emudeck-we.git';
  }

  if (args) {
    const options = {};
    args.forEach((arg) => {
      if (arg.startsWith('--')) {
        // Separar el nombre de la opción y el valor
        const [name, value] = arg.slice(2).split('=');
        // Almacenar la opción en el objeto de opciones
        options[name] = value;
      }
    });
    if (options.branch) {
      branchGIT = options.branch;
    }
    if (options.repo) {
      repo = options.repo;
    }
  }
  const backChannel = 'clone';
  let bashCommand = `rm -rf ~/.config/EmuDeck/backend && mkdir -p ~/.config/EmuDeck/backend && script ~/.config/EmuDeck/msg.log -c 'git clone --no-single-branch --depth=1 ${repo} ~/.config/EmuDeck/backend/' && cd ~/.config/EmuDeck/backend && script ~/.config/EmuDeck/msg.log -c 'git checkout ${branchGIT}' && touch ~/.config/EmuDeck/.cloned && printf "ec" && echo true`;

  if (os.platform().includes('win32')) {
    bashCommand = `cd %userprofile% && cd AppData && cd Roaming && cd EmuDeck && powershell -ExecutionPolicy Bypass -command "& { Start-Transcript $env:USERPROFILE/AppData/Roaming/EmuDeck/msg.log; git clone --no-single-branch --depth=1 ${repo} ./backend; Stop-Transcript"} && cd backend && git config user.email "emudeck@emudeck.com" && git config user.name "EmuDeck" && git checkout ${branchGIT} && cd %userprofile% && if not exist emudeck mkdir emudeck && cd emudeck && CLS && echo true`;
  }
  return exec(`${bashCommand}`, shellType, (error, stdout, stderr) => {
    logCommand(bashCommand, error, stdout, stderr);
    event.reply(backChannel, error, stdout, stderr);
  });
});

ipcMain.on('pull', async (event, branch) => {
  const args = process.argv.slice(2);
  let branchGIT;
  branchGIT = branch;

  if (args) {
    const options = {};
    args.forEach((arg) => {
      if (arg.startsWith('--')) {
        // Separar el nombre de la opción y el valor
        const [name, value] = arg.slice(2).split('=');
        // Almacenar la opción en el objeto de opciones
        options[name] = value;
      }
    });
    if (options.branch) {
      branchGIT = options.branch;
    }
  }
  const backChannel = 'pull';
  let bashCommand = `cd ~/.config/EmuDeck/backend && script ~/.config/EmuDeck/msg.log -c 'git reset --hard && git clean -fd && git checkout ${branchGIT} && git pull' && . ~/.config/EmuDeck/backend/functions/all.sh && appImageInit`;

  if (os.platform().includes('win32')) {
    bashCommand = `cd %userprofile% && cd AppData && cd Roaming && cd EmuDeck && cd backend && powershell -ExecutionPolicy Bypass -command "& { Start-Transcript $env:USERPROFILE/AppData/Roaming/EmuDeck/msg.log; git reset --hard ; git clean -fd ; git checkout ${branchGIT} ; git pull --allow-unrelated-histories -X theirs; Stop-Transcript; cd $env:USERPROFILE ; cd AppData ; cd Roaming  ; cd EmuDeck ; cd backend ; cd functions ; . ./all.ps1 ; appImageInit "}`;
  }
  return exec(`${bashCommand}`, shellType, (error, stdout, stderr) => {
    logCommand(bashCommand, error, stdout, stderr);
    event.reply(backChannel, stdout);
  });
});

ipcMain.on('branch', async (event) => {
  event.reply('branch-out', process.env.BRANCH);
});

// GameMode setter
ipcMain.on('isGameMode', async (event, command) => {
  const os = app.commandLine.hasSwitch('GameMode');
  event.reply('isGameMode-out', os);
});

// Other
ipcMain.on('clean-log', async (event, command) => {
  exec(`echo "[$(date)] App Installed" > $HOME/emudeck/Emudeck.AppImage.log`, {
    shell: '/bin/bash',
  });
});

ipcMain.on('debug', async (event, command) => {
  mainWindow.webContents.openDevTools();
});

// RetroAchievements
ipcMain.on('getToken', async (event, command) => {
  const backChannel = 'getToken';
  const escapedUserName = `${command.user.replace(/'/g, "'\\''")}`;
  // str.replace(/[\\$'"]/g, "\\$&")
  const escapedPass = `${command.pass.replace(/'/g, "'\\''")}`;
  let bashCommand = `curl --location --data-urlencode u='${escapedUserName}' --data-urlencode p='${escapedPass}' --request POST 'https://retroachievements.org/dorequest.php?r=login'`;
  if (os.platform().includes('win32')) {
    bashCommand = `curl "https://retroachievements.org/dorequest.php?r=login&u=${command.user}&p=${command.pass}"`;
  }

  return exec(`${bashCommand}`, shellType, (error, stdout, stderr) => {
    logCommand(bashCommand, error, stdout, stderr);
    event.reply(backChannel, error, stdout, stderr);
  });
});

ipcMain.on('setToken', async (event, command) => {
  const backChannel = 'getToken';
  const token = command[0];
  const user = command[1];
  let bashCommand = `. ~/.config/EmuDeck/backend/functions/all.sh && echo ${token} > "$HOME/.config/EmuDeck/.rat" && echo ${user} > "$HOME/.config/EmuDeck/.rau" && RetroArch_retroAchievementsSetLogin && DuckStation_retroAchievementsSetLogin && PCSX2QT_retroAchievementsSetLogin && echo true`;

  if (os.platform().includes('win32')) {
    bashCommand = `cd $env:USERPROFILE ; cd AppData ; cd Roaming  ; cd EmuDeck ; cd backend ; cd functions ; . ./all.ps1 ; echo ${token} > "%userprofile%/AppData/Roaming/EmuDeck/.rat"; ; echo ${user} > "%userprofile%/AppData/Roaming/EmuDeck/.rau"; RetroArch_retroAchievementsSetLogin ; DuckStation_retroAchievementsSetLogin ; PCSX2_retroAchievementsSetLogin ; echo true`;
  }

  return exec(`${bashCommand}`, shellType, (error, stdout, stderr) => {
    logCommand(bashCommand, error, stdout, stderr);
    event.reply(backChannel, error, stdout, stderr);
  });
});

ipcMain.on('saveSettings', async (event, command) => {
  const backChannel = 'saveSettings';

  // json data
  const jsonData = command;

  // parse json
  const jsonObj = JSON.parse(jsonData);

  // stringify JSON Object
  const jsonContent = JSON.stringify(jsonObj);

  const homedir = require('os').homedir();
  const settingsFile = `${homedir}/AppData/Roaming/EmuDeck/settings.json`;

  fs.writeFile(settingsFile, jsonContent, 'utf8', function (err) {
    if (err) {
      console.log('An error occured while writing JSON Object to File.');
      event.reply(backChannel, err);
    }
    event.reply(backChannel, 'true');
    console.log('JSON file has been saved.');
  });
});

ipcMain.on('check-versions', async (event) => {
  const userHomeDir = os.homedir();
  const backChannel = 'check-versions';
  let jsonPath = `${userHomeDir}/.config/EmuDeck/backend/versions.json`;
  if (os.platform().includes('win32')) {
    jsonPath = `${userHomeDir}/AppData/Roaming/EmuDeck/backend/versions.json`;
  }
  try {
    const data = fs.readFileSync(jsonPath);
    const json = JSON.parse(data);
    event.reply(backChannel, json);
  } catch (err) {
    console.error(err);
  }
  // });
});

// ipcMain.on('check-installed', async (event, command) => {
//   let backChannel = 'check-installed';
//   let bashCommand = 'getEmuInstallStatus';
//
//   let preCommand;
//
//   if (os.platform().includes('win32')) {
//     bashCommand = bashCommand.replaceAll('&&', ';');
//     preCommand = `powershell -ExecutionPolicy Bypass -command "& { cd $env:USERPROFILE ; cd AppData ; cd Roaming  ; cd EmuDeck ; cd backend ; cd functions ; . ./all.ps1 ; ${bashCommand} "}`;
//   } else {
//     preCommand = `. ~/.config/EmuDeck/backend/functions/all.sh && ${bashCommand}`;
//   }
//
//   return exec(`${preCommand}`, (error, stdout, stderr) => {
//     //event.reply('console', { backChannel });
//     logCommand(bashCommand, error, stdout, stderr);
//     event.reply(backChannel, {
//       stdout: JSON.parse(stdout),
//       stderr: stderr,
//       error: error,
//     });
//   });
// });

// Store functions

ipcMain.on('get-store-featured', async (event) => {
  const userHomeDir = os.homedir();
  const backChannel = 'get-store-featured';
  let jsonPath;

  if (os.platform().includes('win32')) {
    jsonPath = `${userHomeDir}/AppData/Roaming/EmuDeck/backend/store/featured.json`;
  } else {
    jsonPath = `${userHomeDir}/.config/EmuDeck/backend/store/featured.json`;
  }

  try {
    const data = fs.readFileSync(jsonPath);
    const json = JSON.parse(data);
    event.reply(backChannel, json);
  } catch (err) {
    console.error(err);
  }
  // });
});

ipcMain.on('get-store', async (event) => {
  const userHomeDir = os.homedir();
  const backChannel = 'get-store';

  const buildJsonStore = async () => {
    // GB HomebrewGames
    const dir = `${os.homedir()}/emudeck/store/`;
    let jsonArray = [];
    fs.readdir(dir, (err, files) => {
      return new Promise((resolve, reject) => {
        if (err) reject(err);
        files.forEach((file) => {
          if (file.includes('.json') && !file.includes('store')) {
            const jsonPath = `${dir}${file}`;
            try {
              const data = fs.readFileSync(jsonPath);
              const json = JSON.parse(data);
              jsonArray = jsonArray.concat(json);
            } catch (err) {
              console.error(err);
            }
          }
        });
        const masterJson = {
          store: jsonArray,
        };
        resolve(masterJson);
      }).then((masterJson) => {
        // console.log(masterJson);
        fs.writeFileSync(
          `${os.homedir()}/emudeck/store/store.json`,
          JSON.stringify(masterJson)
        );
      });
    });
  };

  buildJsonStore().then(() => {
    const jsonPath = `${userHomeDir}/emudeck/store/store.json`;
    try {
      const data = fs.readFileSync(jsonPath);
      const json = JSON.parse(data);
      event.reply(backChannel, json);
    } catch (err) {
      console.error(err);
    }
  });

  // });
});

ipcMain.on('build-store', async (event) => {
  console.log('build');

  const buildJson = (system, name) => {
    // GB HomebrewGames
    let dir;
    if (os.platform().includes('win32')) {
      dir = `${os.homedir()}/AppData/Roaming/EmuDeck/backend/store/${system}/`;
    } else {
      dir = `${os.homedir()}/.config/EmuDeck/backend/store/${system}/`;
    }
    const dirStore = `${os.homedir()}/emudeck/store`;

    if (!fs.existsSync(dirStore)) {
      fs.mkdirSync(dirStore);
    }

    let jsonArray = [];
    fs.readdir(dir, (err, files) => {
      return new Promise((resolve, reject) => {
        if (err) reject(err);
        files.forEach((file) => {
          if (file.includes('.json')) {
            const jsonPath = `${dir}${file}`;
            try {
              const data = fs.readFileSync(jsonPath);
              const json = JSON.parse(data);
              jsonArray = jsonArray.concat(json);
            } catch (err) {
              console.error(err);
            }
          }
        });
        const masterJson = {
          system: `${system}`,
          status: 'true',
          name: `${name}`,
          games: jsonArray,
        };
        resolve(masterJson);
      }).then((masterJson) => {
        // console.log(masterJson);
        fs.writeFileSync(
          `${os.homedir()}/emudeck/store/${system}.json`,
          JSON.stringify(masterJson)
        );
      });
    });
    // buildJsonStore();
  };

  buildJson('gb', 'GameBoy');
  buildJson('gbc', 'GameBoy Color');
  buildJson('gba', 'GameBoy Advanced');
  buildJson('genesis', 'Genesis');
  buildJson('mastersystem', 'Master System');
  buildJson('nes', 'NES');
  buildJson('snes', 'Super Nintendo');
  buildJson('gamegear', 'GameGear');
  event.reply('build-store', true);
  // });
});

ipcMain.on('installGame', async (event, command) => {
  const backChannel = 'installGame';

  const game = command[0];
  const system = command[2];

  const regex = /([^\/]+?)(?=\.\w+$)|([^\/]+?)(?=$)/;
  console.log(command);
  // Alternative syntax using RegExp constructor
  // const regex = new RegExp('([^\\/]+?)(?=\\.\\w+$)|([^\\/]+?)(?=$)', '')

  let gameName = game.match(regex);
  gameName = gameName[0];

  let bashCommand = `emuDeckInstallHomebrewGame '${system}' '${gameName}' '${game}'`;
  let preCommand;
  if (os.platform().includes('win32')) {
    bashCommand = bashCommand.replaceAll('&&', ';');
    preCommand = `powershell -ExecutionPolicy Bypass -command "& { cd $env:USERPROFILE ; cd AppData ; cd Roaming  ; cd EmuDeck ; cd backend ; cd functions ; . ./all.ps1 ; ${bashCommand} "}`;
  } else {
    preCommand = `. ~/.config/EmuDeck/backend/functions/all.sh && ${bashCommand}`;
  }

  return exec(`${preCommand}`, shellType, (error, stdout, stderr) => {
    logCommand(bashCommand, error, stdout, stderr);
    event.reply(backChannel, error, stdout, stderr);
  });
});

ipcMain.on('unInstallGame', async (event, command) => {
  const backChannel = 'unInstallGame';
  console.log(command);
  const game = command[0];
  const system = command[2];

  const regex = /([^\/]+?)(?=\.\w+$)|([^\/]+?)(?=$)/;

  // Alternative syntax using RegExp constructor
  // const regex = new RegExp('([^\\/]+?)(?=\\.\\w+$)|([^\\/]+?)(?=$)', '')

  let gameName = game.match(regex);
  gameName = gameName[0];

  let bashCommand = `emuDeckUnInstallHomebrewGame '${system}' '${gameName}' '${game}'`;
  let preCommand;
  if (os.platform().includes('win32')) {
    bashCommand = bashCommand.replaceAll('&&', ';');
    preCommand = `powershell -ExecutionPolicy Bypass -command "& { cd $env:USERPROFILE ; cd AppData ; cd Roaming  ; cd EmuDeck ; cd backend ; cd functions ; . ./all.ps1 ; ${bashCommand} "}`;
  } else {
    preCommand = `. ~/.config/EmuDeck/backend/functions/all.sh && ${bashCommand}`;
  }

  return exec(`${preCommand}`, shellType, (error, stdout, stderr) => {
    logCommand(bashCommand, error, stdout, stderr);
    event.reply(backChannel, error, stdout, stderr);
  });
});

// Dependencies checks

ipcMain.on('validate-git', async (event) => {
  // mainWindow.webContents.openDevTools();

  const backChannel = 'validate-git';
  const bashCommand = 'git -v';

  return exec(`${bashCommand}`, (error, stdout, stderr) => {
    logCommand(bashCommand, error, stdout, stderr);

    let status;
    stdout.includes('git version') ? (status = true) : (status = false);

    if (status === true) {
      event.reply(backChannel, {
        stdout: status,
        stderr,
        error,
      });
    } else {
      const bashCommand2 =
        'start powershell -ExecutionPolicy Bypass -command "& { winget install -e --id Git.Git --accept-package-agreements --accept-source-agreements }';
      return exec(`${bashCommand2}`, shellType, (error, stdout, stderr) => {
        logCommand(bashCommand2, error, stdout, stderr);

        event.reply(backChannel, {
          stdout: false,
          stderr,
          error,
        });
      });
    }
  });
});

ipcMain.on('validate-7Zip', async (event) => {
  const backChannel = 'validate-7Zip';
  const path1 = 'C:/Program Files/7-zip';
  const path2 = 'C:/Program Files (x86)/7-zip';
  if (fs.existsSync(path1)) {
    event.reply(backChannel, {
      stdout: true,
    });
    return;
  }
  if (fs.existsSync(path2)) {
    event.reply(backChannel, {
      stdout: true,
    });
    return;
  }

  const bashCommand =
    'start powershell -ExecutionPolicy Bypass -command "& { winget install -e --id 7zip.7zip --accept-package-agreements --accept-source-agreements }';
  return exec(`${bashCommand}`, shellType, (error, stdout, stderr) => {
    logCommand(bashCommand, error, stdout, stderr);

    if (fs.existsSync(path1)) {
      event.reply(backChannel, {
        stdout: true,
      });
      return;
    }
    if (fs.existsSync(path2)) {
      event.reply(backChannel, {
        stdout: true,
      });
      return;
    }

    event.reply(backChannel, {
      stdout: false,
      stderr,
      error,
    });
  });
});

ipcMain.on('validate-Steam', async (event) => {
  const backChannel = 'validate-Steam';
  const path1 = 'C:/Program Files/Steam';
  const path2 = 'C:/Program Files (x86)/Steam';
  if (fs.existsSync(path1)) {
    event.reply(backChannel, {
      stdout: true,
    });
    return;
  }

  if (fs.existsSync(path2)) {
    event.reply(backChannel, {
      stdout: true,
    });
    return;
  }

  event.reply(backChannel, {
    stdout: false,
  });
});

ipcMain.on('reload', async (event) => {
  mainWindow.reload();
});

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('session-created', (session) => {
  console.log(session);
});

ipcMain.on('run-app', async (event, appPath) => {
  let appPathFixed = appPath.replace(/[\r\n]+/g, '');
  const userFolder = os.homedir();

  if (appPathFixed.includes('USERPATH')) {
    appPathFixed = appPathFixed.replace('USERPATH', userFolder);
  }

  let externalApp;
  if (os.platform().includes('win32')) {
    externalApp = spawn(appPathFixed);
  } else if (os.platform().includes('darwin')) {
    externalApp = spawn('open', [appPathFixed]);
  } else {
    externalApp = spawn('xdg-open', [appPathFixed]);
  }
  externalApp.on('exit', (code) => {
    event.reply('run-app', code);
  });
});

const myWindow = null;
// no second instances
if (!gotTheLock) {
  app.quit();
} else {
  app.on(
    'second-instance',
    (event, commandLine, workingDirectory, additionalData) => {
      // Print out data received from the second instance.
      console.log(additionalData);

      // Someone tried to run a second instance, we should focus our window.
      if (myWindow) {
        if (myWindow.isMinimized()) myWindow.restore();
        myWindow.focus();
      }
    }
  );

  app
    .whenReady()
    .then(() => {
      createWindow();

      app.on('activate', () => {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (mainWindow === null) createWindow();
      });
    })
    .catch(console.log);
}
