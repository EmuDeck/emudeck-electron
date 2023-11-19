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
import { app, BrowserWindow, ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
// eslint-disable-next-line
import MenuBuilder from './menu';
// eslint-disable-next-line
import { resolveHtmlPath } from './util';
import fakeOSFile from '../data/local-fake-os.json';

const { fakeOS } = fakeOSFile;

const os = require('os');
const fs = require('fs');
const lsbRelease = require('lsb-release');

let shellType: any;
export default class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.autoDownload = false;
  }
}

fs.exists(`${os.homedir()}/emudeck/logs/emudeckApp.log`, (exists: any) => {
  if (exists) {
    fs.unlinkSync(`${os.homedir()}/emudeck/logs/emudeckApp.log`);
  }
});

// file system module to perform file operations

// Vars and consts
let mainWindow: BrowserWindow | null = null;
// Prevent two instances
const gotTheLock = app.requestSingleInstanceLock();

const Promise = require('bluebird');

const logCommand = (
  bashCommand: any,
  error: any = '',
  stdout: any = '',
  stderr: any = ''
) => {
  const today = new Date();
  const dd = String(today.getDate()).padStart(2, '0');
  const mm = String(today.getMonth() + 1).padStart(2, '0'); // January is 0!
  const yyyy = today.getFullYear();
  const date = `${mm}/${dd}/${yyyy}`;
  const homedir = os.homedir();

  let logFile = `${homedir}/emudeck/logs/emudeckApp.log`;
  if (os.platform().includes('win32')) {
    logFile = `${homedir}\\emudeck\\logs\\emudeckApp.log`;
  }

  const bashCommandString = bashCommand ? bashCommand.toString() : '';
  const stdoutString = stdout ? stdout.toString() : '';
  const stderrString = stderr ? stderr.toString() : '';
  const errorString = error ? error.toString() : '';

  // const escapedBashCommandString = shellQuote.quote([bashCommandString], { noGlob: true });
  // const escapedStdoutString = shellQuote.quote([stdoutString], { noGlob: true });
  // const escapedStderrString = shellQuote.quote([stderrString], { noGlob: true });

  const logEntry = `[${date}] ${bashCommandString}\n`;
  fs.appendFile(logFile, logEntry, (errlogEntry: any) => {
    if (errlogEntry) {
      console.error(`Error writing to log file: ${errlogEntry}`);
    }
  });

  if (stdout) {
    const stdoutEntry = `[${date}] stdout: ${stdoutString}\n`;
    fs.appendFile(logFile, stdoutEntry, (errstdout: any) => {
      if (errstdout) {
        console.error(`Error writing to log file: ${errstdout}`);
      }
    });
  }

  if (error) {
    const stdoutEntry = `[${date}] error: ${errorString}\n`;
    fs.appendFile(logFile, stdoutEntry, (errerror: any) => {
      if (errerror) {
        console.error(`Error writing to log file: ${errerror}`);
      }
    });
  }

  if (stderr) {
    const stderrEntry = `[${date}] stderr: ${stderrString}\n`;
    fs.appendFile(logFile, stderrEntry, (errstderrEntry: any) => {
      if (errstderrEntry) {
        console.error(`Error writing to log file: ${errstderrEntry}`);
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
  const { height } = primaryDisplay.workAreaSize;
  const screenHeight = height < 701 ? 600 : 720;
  const isFullscreen = false;
  // const os = require('os');

  // let dpi;
  // if (os.platform() === 'darwin') {
  //   dpi = 2;
  // } else {
  //   dpi = 1;
  // }

  //  const scaleFactorW = 1 / ((1280 * dpi) / width);
  //  const scaleFactorH = 1 / ((screenHeight * dpi) / height);

  // if (os.platform().includes('win32')) {
  //   let customWidth = 1280;
  //   customWidth /= 2;
  // }

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
  let backChannel: any;
  let bashCommand: any;

  if (command[0].includes('|||')) {
    const tempCommand = command[0].split('|||');
    // eslint-disable-next-line
    backChannel = tempCommand[0];
    // eslint-disable-next-line
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
  let backChannel: any;
  let bashCommand: any;

  if (command[0].includes('|||')) {
    const tempCommand = command[0].split('|||');
    // eslint-disable-next-line
    backChannel = tempCommand[0];
    // eslint-disable-next-line
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
  let backChannel: any;
  let bashCommand: any;
  let allPath;
  const homeUser = os.homedir();
  if (os.platform().includes('win32')) {
    allPath = `${homeUser}/AppData/Roaming/EmuDeck/backend/functions/all.ps1`;
  } else {
    allPath = `${homeUser}/.config/EmuDeck/backend/functions/all.sh`;
  }

  if (command[0].includes('|||')) {
    const tempCommand = command[0].split('|||');
    // eslint-disable-next-line
    backChannel = tempCommand[0];
    // eslint-disable-next-line
    bashCommand = tempCommand[1];
  } else {
    backChannel = 'none';
    bashCommand = command;
  }

  // Lets detect if the repo was cloned properly
  if (fs.existsSync(allPath)) {
    // file exists
  } else {
    event.reply(backChannel, 'nogit');
    let bashCommand = `rm -rf ~/.config/EmuDeck/backend && mkdir -p ~/.config/EmuDeck/backend && git clone --no-single-branch --depth=1 https://github.com/dragoonDorise/EmuDeck.git ~/.config/EmuDeck/backend/ && cd ~/.config/EmuDeck/backend && git checkout master && touch ~/.config/EmuDeck/.cloned && printf "ec" && echo true`;

    if (os.platform().includes('win32')) {
      bashCommand = `cd %userprofile% && cd AppData && cd Roaming && cd EmuDeck && powershell -ExecutionPolicy Bypass -command "& { Start-Transcript $env:USERPROFILE/AppData/Roaming/EmuDeck/msg.log; git clone --no-single-branch --depth=1 https://github.com/EmuDeck/emudeck-we.git ./backend; Stop-Transcript"} && cd backend && git config user.email "emudeck@emudeck.com" && git config user.name "EmuDeck" && git checkout master && cd %userprofile% && if not exist emudeck mkdir emudeck && cd emudeck && CLS && echo true`;
    }

    return exec(`${bashCommand}`, shellType, (error, stdout, stderr) => {
      // event.reply('console', { backChannel });
      logCommand(bashCommand, error, stdout, stderr);
      // mainWindow.reload();
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

// ipcMain.on('emudeckAdmin', async (event, command) => {
//   let backChannel:any;
//   let bashCommand:any;
//   let allPath;
//   const homeUser = os.homedir();
//
//   allPath = `${homeUser}/AppData/Roaming/EmuDeck/backend/functions/all.ps1`;
//
//   if (command[0].includes('|||')) {
//     const tempCommand = command[0].split('|||');
//     backChannel = tempCommand[0];
//     bashCommand = tempCommand[1];
//   } else {
//     backChannel = 'none';
//     bashCommand = command;
//   }
//
//   // Lets detect if the repo was cloned properly
//   if (fs.existsSync(allPath)) {
//     // file exists
//   } else {
//     event.reply(backChannel, 'nogit');
//     const bashCommand = `cd %userprofile% && cd AppData && cd Roaming && cd EmuDeck && powershell -ExecutionPolicy Bypass -command "& { Start-Transcript $env:USERPROFILE/AppData/Roaming/EmuDeck/msg.log; git clone --no-single-branch --depth=1 https://github.com/EmuDeck/emudeck-we.git ./backend; Stop-Transcript"} && cd backend && git config user.email "emudeck@emudeck.com" && git config user.name "EmuDeck" && git checkout master && cd %userprofile% && if not exist emudeck mkdir emudeck && cd emudeck && CLS && echo true`;
//
//     return exec(`${bashCommand}`, shellType, (error, stdout, stderr) => {
//       // event.reply('console', { backChannel });
//       logCommand(bashCommand, error, stdout, stderr);
//       mainWindow.reload();
//     });
//   }
//
//   let preCommand;
//
//   bashCommand = bashCommand.replaceAll('&&', ';');
//
//   preCommand = `PowerShell -NoProfile -ExecutionPolicy Bypass -Command "& { Start-Process powershell -Command "& { cd $env:USERPROFILE ; cd AppData ; cd Roaming  ; cd EmuDeck ; cd backend ; cd functions ; . ./all.ps1 ; ${bashCommand} }" -Verb RunAs }"`;
//
//   return exec(`${preCommand}`, shellType, (error, stdout, stderr) => {
//     // event.reply('console', { backChannel });
//     logCommand(bashCommand, error, stdout, stderr);
//     event.reply(backChannel, {
//       stdout,
//       stderr,
//       error,
//     });
//   });
// });

ipcMain.on('emudeck-nolog', async (event, command) => {
  let backChannel: any;
  let bashCommand: any;

  if (command[0].includes('|||')) {
    const tempCommand = command[0].split('|||');
    // eslint-disable-next-line
    backChannel = tempCommand[0];
    // eslint-disable-next-line
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

ipcMain.on('getMSG', async (event) => {
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
ipcMain.on('close', async () => {
  app.quit();
});

ipcMain.on('moreZoom', async () => {
  const currentZoom = mainWindow.webContents.getZoomFactor();
  mainWindow.webContents.zoomFactor = currentZoom + 0.2;
});

ipcMain.on('lessZoom', async () => {
  const currentZoom = mainWindow.webContents.getZoomFactor();
  mainWindow.webContents.zoomFactor = currentZoom - 0.2;
});

//
// Updating the app
//
ipcMain.on('update-check', async (event) => {
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
    setTimeout(() => {
      event.reply('update-check-out', ['up-to-date', 'DEV MODE']);
      logCommand('UPDATE: DEV MODE');
    }, 500);
  }

  const result = autoUpdater.checkForUpdates();
  logCommand('UPDATE: STARTING CHECK');
  result
    .then((checkResult: UpdateCheckResult) => {
      const { updateInfo } = checkResult;

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

      logCommand('UPDATE: COMPARING VERSIONS');
      if (versionCheck === 1 || versionCheck === 0) {
        logCommand('UPDATE: UP TO DATE');

        event.reply('update-check-out', ['up-to-date', updateInfo]);
        logCommand(`${JSON.stringify(updateInfo)}`);
      } else {
        exec(
          `echo "[$(date)] UPDATE: UPDATING!" >> $HOME/emudeck/logs/EmudeckUpdate.log`,
          shellType
        );
        logCommand('UPDATE: UPDATING!');

        event.reply('update-check-out', ['updating', updateInfo]);
        logCommand(`${JSON.stringify(updateInfo)}`);

        const doUpdate = autoUpdater.downloadUpdate();

        doUpdate
          .then(() => {
            autoUpdater.quitAndInstall(
              true, // isSilent
              true // isForceRunAfter, restart app after update is installed
            );
          })
          .catch((error) => {
            // Manejar cualquier error que pueda ocurrir en doUpdate o autoUpdater
            console.error('Error:', error);
          });
      }
    })
    .catch((reason) => {
      logCommand(`${JSON.stringify(reason)}`);
    });

  // Abort the update if it hangs
  const abortPromise = new Promise(function (resolve: any) {
    setTimeout(resolve, 10000, 'abort');
  });

  Promise.race([result, abortPromise])
    .then((value: any) => {
      if (value === 'abort') {
        logCommand(`UPDATE: ABORTED TIMEOUT`);
        event.reply('update-check-out', ['up-to-date', 'DEV MODE']);

        // mainWindow.reload()
      }
    })
    .catch((error: any) => {
      // Manejar cualquier error que pueda ocurrir
      console.error('Error:', error);
    });
});

ipcMain.on('system-info-in', async (event) => {
  // const os = require('os');
  const isDebug =
    process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';
  if (isDebug) {
    event.reply('system-info-out', fakeOS);
  }

  if (os.platform() === 'linux') {
    lsbRelease((_: any, data: any) => {
      event.reply('system-info-out', data.distributorID);
    });
  } else {
    event.reply('system-info-out', os.platform());
  }
});

ipcMain.on('version', async (event: any) => {
  event.reply('version-out', [
    app.getVersion(),
    app.commandLine.hasSwitch('no-sandbox'),
  ]);
});

//
// Installing  Bash / PowerShell backend
//
ipcMain.on('check-git', async (event) => {
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
  const branchGIT = branch;
  let repo = 'https://github.com/dragoonDorise/EmuDeck.git';
  if (os.platform().includes('win32')) {
    repo = 'https://github.com/EmuDeck/emudeck-we.git';
  }

  const backChannel = 'clone';
  let bashCommand = `rm -rf ~/.config/EmuDeck/backend && mkdir -p ~/.config/EmuDeck/backend && script ~/.config/EmuDeck/msg.log -c 'git clone --no-single-branch --depth=1 ${repo} ~/.config/EmuDeck/backend/' && cd ~/.config/EmuDeck/backend && script ~/.config/EmuDeck/msg.log -c 'git checkout ${branchGIT}' && touch ~/.config/EmuDeck/.cloned && printf "ec" && echo true`;
  if (os.platform().includes('darwin')) {
    bashCommand = `rm -rf ~/.config/EmuDeck/backend && mkdir -p ~/.config/EmuDeck/backend && git clone --no-single-branch --depth=1 ${repo} ~/.config/EmuDeck/backend/ && cd ~/.config/EmuDeck/backend && git checkout ${branchGIT} && touch ~/.config/EmuDeck/.cloned && printf "ec" && echo true`;
  }
  if (os.platform().includes('win32')) {
    bashCommand = `cd %userprofile% && cd AppData && cd Roaming && cd EmuDeck && powershell -ExecutionPolicy Bypass -command "& { Start-Transcript $env:USERPROFILE/AppData/Roaming/EmuDeck/msg.log; git clone --no-single-branch --depth=1 ${repo} ./backend; Stop-Transcript"} && cd backend && git config user.email "emudeck@emudeck.com" && git config user.name "EmuDeck" && git checkout ${branchGIT} && cd %userprofile% && if not exist emudeck mkdir emudeck && cd emudeck && CLS && echo true`;
  }
  return exec(`${bashCommand}`, shellType, (error, stdout, stderr) => {
    logCommand(bashCommand, error, stdout, stderr);
    event.reply(backChannel, error, stdout, stderr);
  });
});

ipcMain.on('pull', async (event, branch) => {
  const branchGIT = branch;
  const backChannel = 'pull';
  let bashCommand = `cd ~/.config/EmuDeck/backend && script ~/.config/EmuDeck/msg.log -c 'git reset --hard && git clean -fd && git checkout ${branchGIT} && git pull' && . ~/.config/EmuDeck/backend/functions/all.sh && appImageInit`;

  if (os.platform().includes('darwin')) {
    bashCommand = `cd ~/.config/EmuDeck/backend && git reset --hard && git clean -fd && git checkout ${branchGIT} && git pull && . ~/.config/EmuDeck/backend/functions/all.sh && appImageInit`;
  }
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
ipcMain.on('isGameMode', async (event) => {
  const os = app.commandLine.hasSwitch('GameMode');
  event.reply('isGameMode-out', os);
});

// Other
ipcMain.on('clean-log', async () => {
  exec(`echo "[$(date)] App Installed" > $HOME/emudeck/logs/EmudeckApp.log`, {
    shell: '/bin/bash',
  });
});

ipcMain.on('debug', async () => {
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

  fs.writeFile(settingsFile, jsonContent, 'utf8', function (err: any) {
    if (err) {
      event.reply(backChannel, err);
    }
    event.reply(backChannel, 'true');
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
    let jsonArray: any = [];

    await new Promise((resolve: any, reject: any) => {
      fs.readdir(dir, (err: any, files: any) => {
        if (err) reject(err);
        files.forEach((file: any) => {
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
        const storeJson = {
          data: jsonArray,
        };
        resolve(storeJson);
      });
    }).then(async (storeJson: any) => {
      const dir = `${os.homedir()}/emudeck/feeds/`;
      let jsonArray: any = [];

      await new Promise((resolve: any, reject: any) => {
        fs.readdir(dir, (err: any, files: any) => {
          if (err) reject(err);
          files.forEach((file: any) => {
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
          const feedsJson = {
            data: jsonArray,
          };

          // console.log({ storeJson });
          // console.log({ jsonArray });
          const fullJson = {
            store: storeJson,
            feeds: feedsJson,
          };

          console.log({ fullJson });

          resolve(fullJson);
        });
      }).then((fullJson: any) => {
        fs.writeFileSync(
          `${os.homedir()}/emudeck/store/store.json`,
          JSON.stringify(fullJson)
        );
      });
    });
  };

  buildJsonStore()
    .then(() => {
      const jsonPath = `${userHomeDir}/emudeck/store/store.json`;
      const data = fs.readFileSync(jsonPath);
      const json = JSON.parse(data);
      event.reply(backChannel, json);
    })
    .catch((error) => {
      // Manejar cualquier error que pueda ocurrir en doUpdate o autoUpdater
      console.error('Error:', error);
    });
});

ipcMain.on('build-store', async (event) => {
  const buildJson = (system: any, name: any) => {
    // GB HomebrewGames
    let dir: any;
    if (os.platform().includes('win32')) {
      dir = `${os.homedir()}/AppData/Roaming/EmuDeck/backend/store/${system}/`;
    } else {
      dir = `${os.homedir()}/.config/EmuDeck/backend/store/${system}/`;
    }
    const dirStore = `${os.homedir()}/emudeck/store`;

    if (!fs.existsSync(dirStore)) {
      fs.mkdirSync(dirStore);
    }

    let jsonArray: any = [];
    fs.readdir(dir, (err: any, files: any) => {
      return new Promise((resolve: any, reject: any) => {
        if (err) reject(err);
        files.forEach((file: any) => {
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
        const storeJson = {
          system: `${system}`,
          status: 'true',
          name: `${name}`,
          games: jsonArray,
        };
        resolve(storeJson);
      }).then((storeJson: any) => {
        fs.writeFileSync(
          `${os.homedir()}/emudeck/store/${system}.json`,
          JSON.stringify(storeJson)
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
  // eslint-disable-next-line
  const regex = /([^\/]+?)(?=\.\w+$)|([^\/]+?)(?=$)/;

  // Alternative syntax using RegExp constructor
  // const regex = new RegExp('([^\\/]+?)(?=\\.\\w+$)|([^\\/]+?)(?=$)', '')

  let gameName = game.match(regex);
  // eslint-disable-next-line
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

  const game = command[0];
  const system = command[2];
  // eslint-disable-next-line
  const regex = /([^\/]+?)(?=\.\w+$)|([^\/]+?)(?=$)/;

  // Alternative syntax using RegExp constructor
  // const regex = new RegExp('([^\\/]+?)(?=\\.\\w+$)|([^\\/]+?)(?=$)', '')

  let gameName = game.match(regex);
  // eslint-disable-next-line
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
  // eslint-disable-next-line
  return exec(`${bashCommand}`, (error: any, stdout: any, stderr: any) => {
    logCommand(bashCommand, error, stdout, stderr);

    let status;
    if (stdout.includes('git version')) {
      status = true;
    } else {
      status = false;
    }

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
  const programFilesPath = process.env.ProgramFiles;
  const homeUser = os.homedir();
  const path1 = `${programFilesPath}/7-zip`;
  const path2 = `${programFilesPath} (x86)/7-zip`;
  const path3 = `${homeUser}/AppData/Roaming/EmuDeck/backend/wintools/7z.exe`;
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
  if (fs.existsSync(path3)) {
    event.reply(backChannel, {
      stdout: true,
    });
    return;
  }

  const bashCommand =
    'start powershell -ExecutionPolicy Bypass -command "& { winget install -e --id 7zip.7zip --accept-package-agreements --accept-source-agreements }';
  // eslint-disable-next-line
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
  const programFilesPath = process.env.ProgramFiles;
  const path1 = `${programFilesPath}/Steam`;
  const path2 = `${programFilesPath} (x86)/Steam`;
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

ipcMain.on('reload', async () => {
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

app.on('session-created', (session: any) => {
  console.log({ session });
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
    if (!appPathFixed.includes('"')) {
      appPathFixed = `"${appPathFixed}"`;
    }
    return exec(`${appPathFixed}`, shellType, (error, stdout, stderr) => {
      // event.reply('console', { backChannel });
      logCommand(appPathFixed, error, stdout, stderr);
      event.reply('run-app', 'launched');
    });
    // externalApp = spawn('xdg-open', [appPathFixed]);
  }

  fs.writeFileSync(`${os.homedir()}/emudeck/logs/run-app.log`, appPathFixed);

  externalApp.on('error', (err: any) => {
    event.reply('run-app', err);
  });
  externalApp.on('close', (code: any) => {
    event.reply('run-app', code);
  });
  externalApp.on('spawn', () => {
    event.reply('run-app', 'launched');
  });
  externalApp.on('exit', (code: any) => {
    event.reply('run-app', code);
  });
});

const myWindow: any = null;
// no second instances
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    // Print out data received from the second instance.

    // Someone tried to run a second instance, we should focus our window.
    if (myWindow) {
      if (myWindow.isMinimized()) myWindow.restore();
      myWindow.focus();
    }
  });

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
