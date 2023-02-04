import React, { useEffect, useState, useContext } from 'react';
import { GlobalContext } from 'context/globalContext';

import End from 'components/organisms/Wrappers/End';

const EndPage = () => {
  const { state, setState } = useContext(GlobalContext);
  const [statePage, setStatePage] = useState({
    disabledNext: true,
    disabledBack: true,
    data: '',
  });
  const { disabledNext, disabledBack, data } = statePage;
  let { second, debug, branch, storagePath, gamemode, system } = state;
  const ipcChannel = window.electron.ipcRenderer;

  const [msg, setMsg] = useState({
    message: '',
    percentage: 0,
  });

  const { message, percentage } = msg;

  const [counter, setCounter] = useState(0);
  let settingsFile = '~/emudeck/settings.sh';
  const readMSG = (command) => {
    const idMessage = Math.random();
    ipcChannel.sendMessage('emudeck-nolog', [`${idMessage}|||${command}`]);
    ipcChannel.once(idMessage, (message) => {
      let messageArray = message.stdout.split('#');
      let messageText = messageArray[1];
      let messagePercent = messageArray[0];

      messagePercent = messagePercent.replaceAll(' ', '');
      messagePercent = messagePercent.replaceAll('\n', '');
      messagePercent = messagePercent.replaceAll('\n\r', '');

      setMsg({ message: messageText, percentage: messagePercent });
    });
  };

  const openSRM = () => {
    if (system === 'win32') {
      ipcChannel.sendMessage('bash', [
        `cd ${storagePath} && cd Emulation && cd tools && start srm.exe`,
      ]);
    } else {
      ipcChannel.sendMessage('bash', [
        `zenity --question --width 450 --title "Close Steam/Steam Input?" --text "$(printf "<b>Exit Steam to launch Steam Rom Manager? </b>\n\n To add your Emulators and EmulationStation-DE to steam hit Preview, then Generate App List, then wait for the images to download\n\nWhen you are happy with your image choices hit Save App List and wait for it to say it's completed.\n\nDesktop controls will temporarily revert to touch/trackpad/L2/R2")" && (kill -15 $(pidof steam) & ${storagePath}/Emulation/tools/srm/Steam-ROM-Manager.AppImage)`,
      ]);
    }

    setTimeout(() => {
      window.close();
    }, 5000);
  };

  const close = () => {
    window.close();
  };

  const showLog = () => {
    if (system === 'win32') {
      ipcChannel.sendMessage('bash-nolog', [
        `start powershell -NoExit -ExecutionPolicy Bypass -command "& { Get-Content $env:USERPROFILE/emudeck/emudeck.log -Tail 100 -Wait }"`,
      ]);
    } else {
      ipcChannel.sendMessage('bash-nolog', [
        `konsole -e tail -f "$HOME/emudeck/emudeck.log"`,
      ]);
    }
  };
  let pollingTime = 500;
  if (system === 'win32') {
    pollingTime = 2000;
  }

  //Reading messages from backend
  useEffect(() => {
    const interval = setInterval(() => {
      if (system === 'win32') {
        let msg = readMSG(
          'more %userprofile%\\AppData\\Roaming\\EmuDeck\\msg.log'
        );
      } else {
        let msg = readMSG('cat ~/.config/EmuDeck/msg.log');
      }

      if (message.includes('100')) {
        clearInterval(interval);
      }
    }, pollingTime);

    return () => clearInterval(interval);
  }, []);

  //Marking as first run completed
  useEffect(() => {
    setState({ ...state, second: true });
  }, []);

  //Running the installer
  useEffect(() => {
    let json = JSON.stringify(state);

    localStorage.setItem('settings_emudeck', json);
    let preVar = '';
    if (system === 'win32') {
      preVar = '$';
    }

    if (system === 'win32') {
      console.log('saving settings');
      ipcChannel.sendMessage('saveSettings', [JSON.stringify(state)]);
      ipcChannel.once('saveSettings', (saveSettings) => {
        console.log({ saveSettings });
        ipcChannel.sendMessage('bash-nolog', [
          `finish|||powershell -ExecutionPolicy Bypass . $env:USERPROFILE/AppData/Roaming/EmuDeck/backend/setup.ps1`,
        ]);
        ipcChannel.once('finish', (message) => {
          setStatePage({ ...statePage, disabledNext: false });
          localStorage.setItem('pending_update', false);
        });
      });
    } else {
      ipcChannel.sendMessage('bash', [
        `startSettings|||echo ${preVar}expert="${
          state.mode === 'expert' ? true : false
        }" > ${settingsFile}`,
      ]);

      //Wait for settings.sh creation.
      ipcChannel.once('startSettings', (message) => {
        console.log('startSettings');
        //Setup Emus
        ipcChannel.sendMessage('bash', [
          `echo ${preVar}doSetupRA="${
            state.overwriteConfigEmus.ra.status ? true : false
          }" >> ${settingsFile}`,
        ]);
        ipcChannel.sendMessage('bash', [
          `echo ${preVar}doSetupDolphin="${
            state.overwriteConfigEmus.dolphin.status ? true : false
          }" >> ${settingsFile}`,
        ]);

        ipcChannel.sendMessage('bash', [
          `echo ${preVar}doSetupPCSX2QT="${
            state.overwriteConfigEmus.pcsx2.status ? true : false
          }" >> ${settingsFile}`,
        ]);
        ipcChannel.sendMessage('bash', [
          `echo ${preVar}doSetupRPCS3="${
            state.overwriteConfigEmus.rpcs3.status ? true : false
          }" >> ${settingsFile}`,
        ]);
        ipcChannel.sendMessage('bash', [
          `echo ${preVar}doSetupYuzu="${
            state.overwriteConfigEmus.yuzu.status ? true : false
          }" >> ${settingsFile}`,
        ]);
        ipcChannel.sendMessage('bash', [
          `echo ${preVar}doSetupRyujinx="${
            state.overwriteConfigEmus.ryujinx.status ? true : false
          }" >> ${settingsFile}`,
        ]);
        ipcChannel.sendMessage('bash', [
          `echo ${preVar}doSetupCitra="${
            state.overwriteConfigEmus.citra.status ? true : false
          }" >> ${settingsFile}`,
        ]);
        ipcChannel.sendMessage('bash', [
          `echo ${preVar}doSetupDuck="${
            state.overwriteConfigEmus.duckstation.status ? true : false
          }" >> ${settingsFile}`,
        ]);
        ipcChannel.sendMessage('bash', [
          `echo ${preVar}doSetupmelonDS="${
            state.overwriteConfigEmus.melonds.status ? true : false
          }" >> ${settingsFile}`,
        ]);
        ipcChannel.sendMessage('bash', [
          `echo ${preVar}doSetupCemu="${
            state.overwriteConfigEmus.cemu.status ? true : false
          }" >> ${settingsFile}`,
        ]);
        ipcChannel.sendMessage('bash', [
          `echo ${preVar}doSetupXenia="false" >> ${settingsFile}`,
        ]);

        ipcChannel.sendMessage('bash', [
          `echo ${preVar}doSetupPrimeHacks="${
            state.overwriteConfigEmus.primehacks.status ? true : false
          }" >> ${settingsFile}`,
        ]);
        ipcChannel.sendMessage('bash', [
          `echo ${preVar}doSetupXemu="${
            state.overwriteConfigEmus.xemu.status ? true : false
          }" >> ${settingsFile}`,
        ]);
        ipcChannel.sendMessage('bash', [
          `echo ${preVar}doSetupPPSSPP="${
            state.overwriteConfigEmus.ppsspp.status ? true : false
          }" >> ${settingsFile}`,
        ]);
        ipcChannel.sendMessage('bash', [
          `echo ${preVar}doSetupMAME="${
            state.overwriteConfigEmus.mame.status ? true : false
          }" >> ${settingsFile}`,
        ]);
        ipcChannel.sendMessage('bash', [
          `echo ${preVar}doSetupVita3K="${
            state.overwriteConfigEmus.vita3k.status ? true : false
          }" >> ${settingsFile}`,
        ]);
        ipcChannel.sendMessage('bash', [
          `echo ${preVar}doSetupScummVM="${
            state.overwriteConfigEmus.scummvm.status ? true : false
          }" >> ${settingsFile}`,
        ]);
        ipcChannel.sendMessage('bash', [
          `echo ${preVar}doSetupMGBA="${
            state.overwriteConfigEmus.mgba.status ? true : false
          }" >> ${settingsFile}`,
        ]);

        ipcChannel.sendMessage('bash', [
          `echo ${preVar}doSetupESDE="${
            state.overwriteConfigEmus.esde.status ? true : false
          }" >> ${settingsFile}`,
        ]);
        ipcChannel.sendMessage('bash', [
          `echo ${preVar}doSetupSRM="${
            state.overwriteConfigEmus.srm.status ? true : false
          }" >> ${settingsFile}`,
        ]);

        //Install Emus
        ipcChannel.sendMessage('bash', [
          `echo ${preVar}doInstallRA="${
            state.installEmus.ra.status ? true : false
          }" >> ${settingsFile}`,
        ]);
        ipcChannel.sendMessage('bash', [
          `echo ${preVar}doInstallDolphin="${
            state.installEmus.dolphin.status ? true : false
          }" >> ${settingsFile}`,
        ]);
        ipcChannel.sendMessage('bash', [
          `echo ${preVar}doInstallPCSX2QT="${
            state.installEmus.pcsx2.status ? true : false
          }" >> ${settingsFile}`,
        ]);
        ipcChannel.sendMessage('bash', [
          `echo ${preVar}doInstallRPCS3="${
            state.installEmus.rpcs3.status ? true : false
          }" >> ${settingsFile}`,
        ]);
        ipcChannel.sendMessage('bash', [
          `echo ${preVar}doInstallYuzu="${
            state.installEmus.yuzu.status ? true : false
          }" >> ${settingsFile}`,
        ]);
        ipcChannel.sendMessage('bash', [
          `echo ${preVar}doInstallRyujinx="${
            state.installEmus.ryujinx.status ? true : false
          }" >> ${settingsFile}`,
        ]);
        ipcChannel.sendMessage('bash', [
          `echo ${preVar}doInstallCitra="${
            state.installEmus.citra.status ? true : false
          }" >> ${settingsFile}`,
        ]);
        ipcChannel.sendMessage('bash', [
          `echo ${preVar}doInstallDuck="${
            state.installEmus.duckstation.status ? true : false
          }" >> ${settingsFile}`,
        ]);
        ipcChannel.sendMessage('bash', [
          `echo ${preVar}doInstallmelonDS="${
            state.installEmus.melonds.status ? true : false
          }" >> ${settingsFile}`,
        ]);
        ipcChannel.sendMessage('bash', [
          `echo ${preVar}doInstallCemu="${
            state.installEmus.cemu.status ? true : false
          }" >> ${settingsFile}`,
        ]);
        ipcChannel.sendMessage('bash', [
          `echo ${preVar}doInstallXenia="false" >> ${settingsFile}`,
        ]);

        ipcChannel.sendMessage('bash', [
          `echo ${preVar}doInstallPrimeHacks="${
            state.installEmus.primehacks.status ? true : false
          }" >> ${settingsFile}`,
        ]);
        ipcChannel.sendMessage('bash', [
          `echo ${preVar}doInstallPPSSPP="${
            state.installEmus.ppsspp.status ? true : false
          }" >> ${settingsFile}`,
        ]);
        ipcChannel.sendMessage('bash', [
          `echo ${preVar}doInstallXemu="${
            state.installEmus.xemu.status ? true : false
          }" >> ${settingsFile}`,
        ]);
        ipcChannel.sendMessage('bash', [
          `echo ${preVar}doInstallMAME="${
            state.installEmus.mame.status ? true : false
          }" >> ${settingsFile}`,
        ]);
        ipcChannel.sendMessage('bash', [
          `echo ${preVar}doInstallScummVM="${
            state.installEmus.scummvm.status ? true : false
          }" >> ${settingsFile}`,
        ]);
        ipcChannel.sendMessage('bash', [
          `echo ${preVar}doInstallVita3K="${
            state.installEmus.vita3k.status ? true : false
          }" >> ${settingsFile}`,
        ]);

        ipcChannel.sendMessage('bash', [
          `echo ${preVar}doInstallMGBA="${
            state.installEmus.mgba.status ? true : false
          }" >> ${settingsFile}`,
        ]);

        ipcChannel.sendMessage('bash', [
          `echo ${preVar}doInstallSRM="${
            state.installEmus.srm.status ? true : false
          }" >> ${settingsFile}`,
        ]);
        ipcChannel.sendMessage('bash', [
          `echo ${preVar}doInstallESDE="${
            state.installEmus.esde.status ? true : false
          }" >> ${settingsFile}`,
        ]);
        ipcChannel.sendMessage('bash', [
          `echo ${preVar}doInstallCHD="true" >> ${settingsFile}`,
        ]);
        ipcChannel.sendMessage('bash', [
          `echo ${preVar}doInstallPowertools="${
            state.powerTools ? true : false
          }" >> ${settingsFile}`,
        ]);
        ipcChannel.sendMessage('bash', [
          `echo ${preVar}doInstallGyro="${
            state.GyroDSU ? true : false
          }" >> ${settingsFile}`,
        ]);
        ipcChannel.sendMessage('bash', [
          `echo ${preVar}doInstallHomeBrewGames="${
            state.homebrewGames ? true : false
          }" >> ${settingsFile}`,
        ]);

        //Aspect Ratios
        ipcChannel.sendMessage('bash', [
          `echo ${preVar}arSega="${state.ar.sega}" >> ${settingsFile}`,
        ]);
        ipcChannel.sendMessage('bash', [
          `echo ${preVar}arSnes="${state.ar.snes}" >> ${settingsFile}`,
        ]);
        ipcChannel.sendMessage('bash', [
          `echo ${preVar}arClassic3D="${state.ar.classic3d}" >> ${settingsFile}`,
        ]);
        ipcChannel.sendMessage('bash', [
          `echo ${preVar}arDolphin="${state.ar.dolphin}" >> ${settingsFile}`,
        ]);

        //Bezels
        ipcChannel.sendMessage('bash', [
          `echo ${preVar}RABezels="${
            state.bezels ? true : false
          }" >> ${settingsFile}`,
        ]);

        //AutoSave
        ipcChannel.sendMessage('bash', [
          `echo ${preVar}RAautoSave="${
            state.autosave ? true : false
          }" >> ${settingsFile}`,
        ]);

        //old ar
        ipcChannel.sendMessage('bash', [
          `echo ${preVar}duckWide="false" >> ${settingsFile}`,
        ]);
        ipcChannel.sendMessage('bash', [
          `echo ${preVar}DolphinWide="false" >> ${settingsFile}`,
        ]);
        ipcChannel.sendMessage('bash', [
          `echo ${preVar}DreamcastWide="false" >> ${settingsFile}`,
        ]);
        ipcChannel.sendMessage('bash', [
          `echo ${preVar}BeetleWide="false" >> ${settingsFile}`,
        ]);
        ipcChannel.sendMessage('bash', [
          `echo ${preVar}pcsx2QTWide="false ">> ${settingsFile}`,
        ]);

        //Paths
        ipcChannel.sendMessage('bash', [
          `echo ${preVar}emulationPath="${storagePath}/Emulation" >> ${settingsFile}`,
        ]);
        //
        ipcChannel.sendMessage('bash', [
          `echo ${preVar}romsPath="${storagePath}/Emulation/roms" >> ${settingsFile}`,
        ]);
        ipcChannel.sendMessage('bash', [
          `echo ${preVar}toolsPath="${storagePath}/Emulation/tools" >> ${settingsFile}`,
        ]);
        ipcChannel.sendMessage('bash', [
          `echo ${preVar}biosPath="${storagePath}/Emulation/bios" >> ${settingsFile}`,
        ]);
        ipcChannel.sendMessage('bash', [
          `echo ${preVar}savesPath="${storagePath}/Emulation/saves" >> ${settingsFile}`,
        ]);
        ipcChannel.sendMessage('bash', [
          `echo ${preVar}storagePath="${storagePath}/Emulation/storage" >> ${settingsFile}`,
        ]);
        ipcChannel.sendMessage('bash', [
          `echo ${preVar}ESDEscrapData="${storagePath}/Emulation/tools/downloaded_media" >> ${settingsFile}`,
        ]);

        //Shaders
        ipcChannel.sendMessage('bash', [
          `echo ${preVar}RAHandHeldShader="${
            state.shaders.handhelds ? true : false
          }" >> ${settingsFile}`,
        ]);

        ipcChannel.sendMessage('bash', [
          `echo ${preVar}RAHandClassic2D="${
            state.shaders.classic ? true : false
          }" >> ${settingsFile}`,
        ]);

        ipcChannel.sendMessage('bash', [
          `echo ${preVar}RAHandClassic3D="${
            state.shaders.classic3d ? true : false
          }" >> ${settingsFile}`,
        ]);

        //theme
        ipcChannel.sendMessage('bash', [
          `echo ${preVar}esdeTheme="${state.theme}" >> ${settingsFile}`,
        ]);

        //AdvancedSettings
        ipcChannel.sendMessage('bash', [
          `echo ${preVar}doSelectWideScreen="false" >> ${settingsFile}`,
        ]);

        ipcChannel.sendMessage('bash', [
          `echo ${preVar}doRASignIn="false" >> ${settingsFile}`,
        ]);
        ipcChannel.sendMessage('bash', [
          `echo ${preVar}doRAEnable="false" >> ${settingsFile}`,
        ]);
        ipcChannel.sendMessage('bash', [
          `echo ${preVar}doESDEThemePicker="false" >> ${settingsFile}`,
        ]);
        ipcChannel.sendMessage('bash', [
          `echo ${preVar}doSelectEmulators="false" >> ${settingsFile}`,
        ]);
        ipcChannel.sendMessage('bash', [
          `echo ${preVar}doResetEmulators="false" >> ${settingsFile}`,
        ]);
        ipcChannel.sendMessage('bash', [
          `echo ${preVar}XemuWide="false" >> ${settingsFile}`,
        ]);

        //Achievements
        ipcChannel.sendMessage('bash-nolog', [
          `echo ${preVar}'${state.achievements.token}' > $HOME/.config/EmuDeck/.rat`,
        ]);
        ipcChannel.sendMessage('bash-nolog', [
          `echo '${state.achievements.user}' > $HOME/.config/EmuDeck/.rau`,
        ]);

        ipcChannel.sendMessage('bash', [
          `echo ${preVar}achievementsHardcore="${state.achievements.hardcore}" >> ${settingsFile}`,
        ]);

        //CloudSync
        ipcChannel.sendMessage('bash', [
          `echo ${preVar}doSetupSaveSync="${state.cloudSync}" >> ${settingsFile} && echo true`,
        ]);

        // Emulator resolutions
        ipcChannel.sendMessage('bash', [
          `echo ${preVar}dolphinResolution="${state.resolutions.dolphin}" >> ${settingsFile}`,
        ]);
        ipcChannel.sendMessage('bash', [
          `echo ${preVar}duckstationResolution="${state.resolutions.duckstation}" >> ${settingsFile}`,
        ]);
        ipcChannel.sendMessage('bash', [
          `echo ${preVar}pcsx2Resolution="${state.resolutions.pcsx2}" >> ${settingsFile}`,
        ]);
        ipcChannel.sendMessage('bash', [
          `echo ${preVar}yuzuResolution="${state.resolutions.yuzu}" >> ${settingsFile}`,
        ]);
        ipcChannel.sendMessage('bash', [
          `echo ${preVar}ppssppResolution="${state.resolutions.ppsspp}" >> ${settingsFile}`,
        ]);
        ipcChannel.sendMessage('bash', [
          `echo ${preVar}rpcs3Resolution="${state.resolutions.rpcs3}" >> ${settingsFile}`,
        ]);
        ipcChannel.sendMessage('bash', [
          `echo ${preVar}ryujinxResolution="${state.resolutions.ryujinx}" >> ${settingsFile}`,
        ]);
        ipcChannel.sendMessage('bash', [
          `echo ${preVar}xemuResolution="${state.resolutions.xemu}" >> ${settingsFile}`,
        ]);
        ipcChannel.sendMessage('bash', [
          `echo ${preVar}xeniaResolution="${state.resolutions.xenia}" >> ${settingsFile}`,
        ]);

        //Closing
        console.log('finalSetting');
        ipcChannel.sendMessage('bash-nolog', [
          `finalSetting|||echo ${preVar}finishedUI="done" >> ${settingsFile} && echo true`,
        ]);
      });

      ipcChannel.once('finalSetting', (message) => {
        console.log('Running installer');
        let stdout = message.stdout;

        //Installation

        ipcChannel.sendMessage('bash-nolog', [
          `bash ~/.config/EmuDeck/backend/setup.sh ${branch} false`,
        ]);

        ipcChannel.sendMessage('emudeck', [
          `finish|||checkForFile ~/.config/EmuDeck/.ui-finished delete && echo 'Starting...' > ~/.config/EmuDeck/msg.log && printf "\ec" && echo true`,
        ]);
      });
      ipcChannel.once('finish', (message) => {
        console.log('finish');
        let stdout = message.stdout;
        if (stdout.includes('true')) {
          setStatePage({ ...statePage, disabledNext: false });
          localStorage.setItem('pending_update', false);
        }
      });
    }
  }, [second]);

  return (
    <End
      isGameMode={gamemode}
      onClick={openSRM}
      onClickLog={showLog}
      onClose={close}
      data={data}
      disabledNext={disabledNext}
      disabledBack={disabledBack}
      message={message}
      percentage={percentage}
    />
  );
};

export default EndPage;
