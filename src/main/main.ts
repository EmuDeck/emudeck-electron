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
const os = require('os');
var slash = require('slash');
const https = require('https');
export default class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.autoDownload = false;
    //autoUpdater.checkForUpdatesAndNotify();
  }
}

// file system module to perform file operations
const fs = require('fs');

// Vars and consts
let mainWindow: BrowserWindow | null = null;
//Prevent two instances
const gotTheLock = app.requestSingleInstanceLock();

const Promise = require('bluebird');

const promiseFromChildProcess = (child) => {
  return new Promise(function (resolve, reject) {
    child.addListener('error', reject);
    child.addListener('exit', resolve);
  });
};

const logCommand = (bashCommand, stdout, stderr) => {
  let logFile = '$HOME/emudeck/Emudeck.AppImage.log';
  if (os.platform().includes('win32')) {
    logFile = '%userprofile%\\Emudeck.AppImage.log';
  }
  const today = new Date();
  const dd = String(today.getDate()).padStart(2, '0');
  const mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
  const yyyy = today.getFullYear();
  const date = mm + '/' + dd + '/' + yyyy;

  exec(`echo "[${date}] ${bashCommand}" >> ${logFile}`);
  if (stdout) {
    exec(`echo "[${date}] stdout: ${stdout}" >> ${logFile}`);
  }
  if (stderr) {
    exec(`echo "[${date}] stderr: ${stderr}" >> ${logFile}`);
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
  //const os = require('os');
  let scaleFactorW;
  let scaleFactorH;
  let dpi;
  if (os.platform() == 'darwin') {
    dpi = 2;
  } else {
    dpi = 1;
  }

  scaleFactorW = 1 / ((1280 * dpi) / width);
  scaleFactorH = 1 / ((screenHeight * dpi) / height);
  let customWidth = 1280;
  if (os.platform().includes('win32')) {
    customWidth = customWidth / 2;
  }

  mainWindow = new BrowserWindow({
    show: false,
    width: 1280,
    //width: 1280,
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

    //Adjust zoom factor according to DPI or scale factor that we determined before
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

    //shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

//
//
//External APIS ( Bash & CMD / Powershell )
//
//

//
//Backend function invokers
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

  return exec(`${bashCommand}`, (error, stdout, stderr) => {
    //event.reply('console', { backChannel });
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

  return exec(`${bashCommand}`, (error, stdout, stderr) => {
    //event.reply('console', { backChannel });

    event.reply(backChannel, stdout);
  });
});

ipcMain.on('emudeck', async (event, command) => {
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
    bashCommand = bashCommand.replaceAll('&&', ';');
    preCommand = `powershell -ExecutionPolicy Bypass -command "& { cd $env:USERPROFILE ; cd AppData ; cd Roaming  ; cd EmuDeck ; cd backend ; cd functions ; . ./all.ps1 ; ${bashCommand} "}`;
  } else {
    preCommand = `source ~/.config/EmuDeck/backend/functions/all.sh && ${bashCommand}`;
  }

  return exec(`${preCommand}`, (error, stdout, stderr) => {
    //event.reply('console', { backChannel });
    logCommand(bashCommand, error, stdout, stderr);
    event.reply(backChannel, {
      stdout: stdout,
      stderr: stderr,
      error: error,
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
    preCommand = `source ~/.config/EmuDeck/backend/functions/all.sh && ${bashCommand}`;
  }

  return exec(`${preCommand}`, (error, stdout, stderr) => {
    //event.reply('console', { backChannel });
    event.reply(backChannel, {
      stdout: stdout,
      stderr: stderr,
      error: error,
    });
  });
});

//UI commands
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
//Updating the app
//
ipcMain.on('update-check', async (event, command) => {
  // Force no autoupdate
  // event.reply('update-check-out', 'up-to-date');
  // return;

  //Windows no update - temporary
  //const os = require('os');
  if (os.platform().includes('win32')) {
    setTimeout(function () {
      event.reply('update-check-out', ['up-to-date', 'WIN MODE']);
      return;
    }, 500);
  }

  if (process.env.NODE_ENV === 'development') {
    setTimeout(function () {
      event.reply('update-check-out', ['up-to-date', 'DEV MODE']);
      logCommand('UPDATE: DEV MODE');
      return;
    }, 500);
  }

  const result = autoUpdater.checkForUpdates();
  logCommand('UPDATE: STARTING CHECK');
  result
    .then((checkResult: UpdateCheckResult) => {
      const { updateInfo } = checkResult;
      console.log({ updateInfo });
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
      //console.log({ versionCheck });
      //console.log('- 1 means update');
      //console.log('1 and 0 means up to date');
      logCommand('UPDATE: COMPARING VERSIONS');
      if (versionCheck == 1 || versionCheck == 0) {
        logCommand('UPDATE: UP TO DATE');
        console.log('Up to date, mate');
        event.reply('update-check-out', ['up-to-date', updateInfo]);
        logCommand(`${JSON.stringify(updateInfo)}`);
      } else {
        exec(
          `echo "[$(date)] UPDATE: UPDATING!" >> $HOME/emudeck/Emudeck.Update.log`
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

  //Abort the update if it hangs
  var abortPromise = new Promise(function (resolve, reject) {
    setTimeout(resolve, 10000, 'abort');
  });

  Promise.race([result, abortPromise]).then(function (value) {
    if (value == 'abort') {
      logCommand(`UPDATE: ABORTED TIMEOUT`);
      event.reply('update-check-out', ['up-to-date', 'DEV MODE']);
      //mainWindow.reload()
    }
  });
});

ipcMain.on('system-info-in', async (event, command) => {
  //const os = require('os');
  event.reply('system-info-out', os.platform());
});

ipcMain.on('version', async (event, command) => {
  event.reply('version-out', [
    app.getVersion(),
    app.commandLine.hasSwitch('no-sandbox'),
  ]);
});

//
//Installing  Bash / PowerShell backend
//
ipcMain.on('check-git', async (event, branch) => {
  let backChannel = 'check-git';
  let bashCommand = `mkdir -p $HOME/emudeck/ && cd ~/.config/EmuDeck/backend/ && git rev-parse --is-inside-work-tree`;

  if (os.platform().includes('win32')) {
    bashCommand = `cd %userprofile% && cd AppData && cd Roaming && cd EmuDeck && cd backend && git rev-parse --is-inside-work-tree`;
  }
  return exec(`${bashCommand}`, (error, stdout, stderr) => {
    logCommand(bashCommand, error, stdout, stderr);
    event.reply(backChannel, error, stdout, stderr);
  });
});

ipcMain.on('clone', async (event, branch) => {
  let backChannel = 'clone';
  let bashCommand = `rm -rf ~/.config/EmuDeck/backend && mkdir -p ~/.config/EmuDeck/backend && git clone --no-single-branch --depth=1 https://github.com/dragoonDorise/EmuDeck.git ~/.config/EmuDeck/backend/ && cd ~/.config/EmuDeck/backend && git checkout ${branch} && touch ~/.config/EmuDeck/.cloned && printf "ec" && echo true`;

  if (os.platform().includes('win32')) {
    bashCommand = `cd %userprofile% && cd AppData && cd Roaming && cd EmuDeck && git clone --no-single-branch --depth=1 https://github.com/EmuDeck/emudeck-we.git ./backend && cd backend && git checkout ${branch} && cd %userprofile% && if not exist emudeck mkdir emudeck && cd emudeck && CLS && echo true`;

    //First we install git
    var child = exec(
      `powershell -ExecutionPolicy Bypass . winget install --id Git.Git -e --source winget`,
      (error, stdout, stderr) => {
        logCommand('GIT winget', error, stdout, stderr);
      }
    );
    //Then we clone the project
    promiseFromChildProcess(child).then(
      function (result) {
        return exec(`${bashCommand}`, (error, stdout, stderr) => {
          console.log('OK Promise', error, stdout, stderr);
          logCommand(bashCommand, error, stdout, stderr);
          event.reply(backChannel, error, stdout, stderr);
        });
      },
      function (err) {
        return exec(`${bashCommand}`, (error, stdout, stderr) => {
          console.log('KO Promise', error, stdout, stderr);
          logCommand(bashCommand, error, stdout, stderr);
          event.reply(backChannel, error, stdout, stderr);
        });
      }
    );
  } else {
    return exec(`${bashCommand}`, (error, stdout, stderr) => {
      logCommand(bashCommand, error, stdout, stderr);
      event.reply(backChannel, error, stdout, stderr);
    });
  }
});

ipcMain.on('pull', async (event, branch) => {
  let backChannel = 'pull';
  let bashCommand = `cd ~/.config/EmuDeck/backend && git reset --hard && git clean -fd && git checkout ${branch} && git pull`;

  if (os.platform().includes('win32')) {
    bashCommand = `cd %userprofile% && cd AppData && cd Roaming && cd EmuDeck && cd backend && git reset --hard && git clean -fd && git checkout ${branch} && git pull`;
  }
  return exec(`${bashCommand}`, (error, stdout, stderr) => {
    logCommand(bashCommand, error, stdout, stderr);
    event.reply(backChannel, stdout);
  });
});

ipcMain.on('branch', async (event, command) => {
  console.log(process.env);
  event.reply('branch-out', process.env.BRANCH);
});

//Patroen login
ipcMain.on('patreon-check', async (event, token) => {
  let backChannel = 'patreon-check';
  let bashCommand = `curl --location --request GET 'https://www.patreon.com/api/oauth2/v2/identity?include=memberships' \
    --header 'Authorization: Bearer ${token}' \
    --header 'Cookie: __cf_bm=2bjlb3sF5x6e6umsiGrAaKkkeJ9miDa5GSpQqRV3YmY-1675162554-0-AT0d1IsJKCOwvHovs618hMKLw58PB1yUyoubg68jaGCEkIN9T9lOfQBxhmZmHdit2sYwodQIGM5lW9QdcRv2NEqAWSD0AejfwlZiFxWOxR7s; datadome=6v3zK2FFn0aZXwk5HsJCicEsB0Wmr_oWsfcCaCaedNqDL4Q8rjIg175dQItas8576PEnBFfns~O35iioJuPyjPM-nTNEVj1Xl2bdX~JmXJjmUNqJZ2~JLyUViBMzbSp6; patreon_device_id=91dbfd4b-607b-4755-bd7c-0783b042056a; patreon_locale_code=undefined; patreon_location_country_code=ES'`;
  if (os.platform().includes('win32')) {
    bashCommand = `curl https://www.patreon.com/api/oauth2/v2/identity?include=memberships -H "Authorization: Bearer ${token}" -H "Cookie: __cf_bm=2bjlb3sF5x6e6umsiGrAaKkkeJ9miDa5GSpQqRV3YmY-1675162554-0-AT0d1IsJKCOwvHovs618hMKLw58PB1yUyoubg68jaGCEkIN9T9lOfQBxhmZmHdit2sYwodQIGM5lW9QdcRv2NEqAWSD0AejfwlZiFxWOxR7s; datadome=6v3zK2FFn0aZXwk5HsJCicEsB0Wmr_oWsfcCaCaedNqDL4Q8rjIg175dQItas8576PEnBFfns~O35iioJuPyjPM-nTNEVj1Xl2bdX~JmXJjmUNqJZ2~JLyUViBMzbSp6; patreon_device_id=91dbfd4b-607b-4755-bd7c-0783b042056a; patreon_locale_code=undefined; patreon_location_country_code=ES"`;
  }
  exec(`${bashCommand}`, (error, stdout, stderr) => {
    //console.log(stdout);
    logCommand(bashCommand, error, stdout, stderr);
    const stdoutJSON = JSON.parse(stdout);

    //If error user
    if (stdoutJSON.errors) {
      event.reply(backChannel, error, stdout, stderr);
      return;
    }

    const userID = stdoutJSON.data.relationships.memberships.data[0].id;
    let patreonDataCommand = `curl --location --request GET 'https://www.patreon.com/api/oauth2/v2/members/${userID}?fields%5Bmember%5D=will_pay_amount_cents,patron_status,currently_entitled_amount_cents' \
    --header 'Authorization: Bearer ${token}' \
    --header 'Cookie: __cf_bm=2bjlb3sF5x6e6umsiGrAaKkkeJ9miDa5GSpQqRV3YmY-1675162554-0-AT0d1IsJKCOwvHovs618hMKLw58PB1yUyoubg68jaGCEkIN9T9lOfQBxhmZmHdit2sYwodQIGM5lW9QdcRv2NEqAWSD0AejfwlZiFxWOxR7s; datadome=6v3zK2FFn0aZXwk5HsJCicEsB0Wmr_oWsfcCaCaedNqDL4Q8rjIg175dQItas8576PEnBFfns~O35iioJuPyjPM-nTNEVj1Xl2bdX~JmXJjmUNqJZ2~JLyUViBMzbSp6; patreon_device_id=91dbfd4b-607b-4755-bd7c-0783b042056a; patreon_locale_code=undefined; patreon_location_country_code=ES'`;
    if (os.platform().includes('win32')) {
      patreonDataCommand = `curl https://www.patreon.com/api/oauth2/v2/members/${userID}?fields%5Bmember%5D=will_pay_amount_cents,patron_status,currently_entitled_amount_cents -H "Authorization: Bearer ${token}" -H "Cookie: __cf_bm=2bjlb3sF5x6e6umsiGrAaKkkeJ9miDa5GSpQqRV3YmY-1675162554-0-AT0d1IsJKCOwvHovs618hMKLw58PB1yUyoubg68jaGCEkIN9T9lOfQBxhmZmHdit2sYwodQIGM5lW9QdcRv2NEqAWSD0AejfwlZiFxWOxR7s; datadome=6v3zK2FFn0aZXwk5HsJCicEsB0Wmr_oWsfcCaCaedNqDL4Q8rjIg175dQItas8576PEnBFfns~O35iioJuPyjPM-nTNEVj1Xl2bdX~JmXJjmUNqJZ2~JLyUViBMzbSp6; patreon_device_id=91dbfd4b-607b-4755-bd7c-0783b042056a; patreon_locale_code=undefined; patreon_location_country_code=ES"`;
    }
    return exec(`${patreonDataCommand}`, (error, stdout, stderr) => {
      logCommand(patreonDataCommand, error, stdout, stderr);
      event.reply(backChannel, error, stdout, stderr);
    });
  });

  //patreonJson = JSON.parse(patreonStatus);

  return;

  return exec(`${bashCommand}`, (error, stdout, stderr) => {
    logCommand(bashCommand, error, stdout, stderr);
    event.reply(backChannel, error, stdout, stderr);
  });
  //
  //   if (os.platform().includes('win32')) {
  //     bashCommand = `curl https://www.patreon.com/api/oauth2/api/current_user -H "Authorization: Bearer ${token}" -H "Cookie: __cf_bm=2bjlb3sF5x6e6umsiGrAaKkkeJ9miDa5GSpQqRV3YmY-1675162554-0-AT0d1IsJKCOwvHovs618hMKLw58PB1yUyoubg68jaGCEkIN9T9lOfQBxhmZmHdit2sYwodQIGM5lW9QdcRv2NEqAWSD0AejfwlZiFxWOxR7s; datadome=6v3zK2FFn0aZXwk5HsJCicEsB0Wmr_oWsfcCaCaedNqDL4Q8rjIg175dQItas8576PEnBFfns~O35iioJuPyjPM-nTNEVj1Xl2bdX~JmXJjmUNqJZ2~JLyUViBMzbSp6; patreon_device_id=91dbfd4b-607b-4755-bd7c-0783b042056a; patreon_locale_code=undefined; patreon_location_country_code=ES"`;
  //   }
});

//GameMode setter
ipcMain.on('isGameMode', async (event, command) => {
  const os = app.commandLine.hasSwitch('GameMode');
  event.reply('isGameMode-out', os);
});

//Other
ipcMain.on('clean-log', async (event, command) => {
  exec(`echo "[$(date)] App Installed" > $HOME/emudeck/Emudeck.AppImage.log`);
});

ipcMain.on('debug', async (event, command) => {
  mainWindow.webContents.openDevTools();
});

//RetroAchievements
ipcMain.on('getToken', async (event, command) => {
  let backChannel = 'getToken';
  let bashCommand = `curl --location --request POST 'https://retroachievements.org/dorequest.php?r=login&u=${command.user}&p=${command.pass}'`;

  if (os.platform().includes('win32')) {
    bashCommand = `curl "https://retroachievements.org/dorequest.php?r=login&u=${command.user}&p=${command.pass}"`;
  }

  return exec(`${bashCommand}`, (error, stdout, stderr) => {
    logCommand(bashCommand, error, stdout, stderr);
    event.reply(backChannel, error, stdout, stderr);
  });
});

ipcMain.on('setToken', async (event, command) => {
  let backChannel = 'getToken';
  let bashCommand = `echo ${command} > "$HOME/.config/EmuDeck/.rat" && RetroArch_retroAchievementsSetLogin && DuckStation_retroAchievementsSetLogin && PCSX2_retroAchievementsSetLogin && echo true`;

  if (os.platform().includes('win32')) {
    bashCommand = `cd $env:USERPROFILE ; cd AppData ; cd Roaming  ; cd EmuDeck ; cd backend ; cd functions ; . ./all.ps1 ; echo ${command} > %userprofile%/AppData/Roaming/EmuDeck/.rat ; RetroArch_retroAchievementsSetLogin ; DuckStation_retroAchievementsSetLogin ; PCSX2_retroAchievementsSetLogin ; echo true`;
  }

  return exec(`${bashCommand}`, (error, stdout, stderr) => {
    logCommand(bashCommand, error, stdout, stderr);
    event.reply(backChannel, error, stdout, stderr);
  });
});

ipcMain.on('saveSettings', async (event, command) => {
  let backChannel = 'saveSettings';

  // json data
  var jsonData = command;

  // parse json
  var jsonObj = JSON.parse(jsonData);

  // stringify JSON Object
  var jsonContent = JSON.stringify(jsonObj);

  const homedir = require('os').homedir();
  let settingsFile = `${homedir}/AppData/Roaming/EmuDeck/settings.json`;

  fs.writeFile(settingsFile, jsonContent, 'utf8', function (err) {
    if (err) {
      console.log('An error occured while writing JSON Object to File.');
      event.reply(backChannel, err);
    }
    event.reply(backChannel, 'true');
    console.log('JSON file has been saved.');
  });
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

let myWindow = null;
//no second instances
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
