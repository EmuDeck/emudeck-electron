import React, { useEffect, useState, useContext } from 'react';
import { GlobalContext } from 'context/globalContext';
import { useNavigate } from 'react-router-dom';
import Wrapper from 'components/molecules/Wrapper/Wrapper';
import Header from 'components/organisms/Header/Header';

import { BtnSimple } from 'getbasecore/Atoms';

import End from 'components/organisms/Wrappers/End';

function EndPage() {
  const navigate = useNavigate();
  const { state, setState } = useContext(GlobalContext);
  const [statePage, setStatePage] = useState({
    disabledNext: true,
    disabledBack: true,
    data: '',
    step: undefined,
  });

  const { disabledNext, data, step } = statePage;
  const {
    second,
    branch,
    storagePath,
    gamemode,
    system,
    installEmus,
    overwriteConfigEmus,
  } = state;
  const ipcChannel = window.electron.ipcRenderer;

  const [msg, setMsg] = useState({
    message: '',
    percentage: 0,
  });

  const { message, percentage } = msg;

  const settingsFile = '~/emudeck/settings.sh';
  const readMSG = () => {
    ipcChannel.sendMessage('getMSG', []);
    ipcChannel.on('getMSG', (messageInput) => {
      // // console.log({ message });
      const messageArray = messageInput.stdout.split('#');
      const messageText = messageArray[1];
      let messagePercent = messageArray[0];
      messagePercent = messagePercent.replaceAll(' ', '');
      messagePercent = messagePercent.replaceAll('\n', '');
      messagePercent = messagePercent.replaceAll('\n\r', '');
      messagePercent = messagePercent.replaceAll('\r', '');
      setMsg({ message: messageText, percentage: messagePercent });
    });
  };

  const configureControllers = () => {
    if (installEmus.yuzu) {
      setStatePage({ ...statePage, step: 'yuzu' });
      return;
    }
    if (installEmus.citra) {
      setStatePage({ ...statePage, step: 'citra' });
      return;
    }
    if (installEmus.ryujinx) {
      setStatePage({ ...statePage, step: 'ryujinx' });
    }
    if (!installEmus.yuzu && !installEmus.citra && !installEmus.ryujinx) {
      setStatePage({ ...statePage, step: 'steam' });
    }
  };

  const openSRM = () => {
    if (system === 'win32') {
      ipcChannel.sendMessage('bash', [`taskkill /IM steam.exe /F`]);
      ipcChannel.sendMessage(
        'run-app',
        `${storagePath}\Emulation\\tools\\srm.exe`
      );
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

  // Launching emus on win32
  useEffect(() => {
    if (step === 'yuzu') {
      ipcChannel.sendMessage(
        'run-app',
        `USERPATH\\emudeck\\EmulationStation-DE\\Emulators\\yuzu\\yuzu-windows-msvc\\yuzu.exe`
      );
      ipcChannel.once('run-app', (message) => {
        if (installEmus.citra) {
          setStatePage({ ...statePage, step: 'citra' });
        } else if (installEmus.ryujinx) {
          setStatePage({ ...statePage, step: 'ryujinx' });
        } else {
          setStatePage({ ...statePage, step: 'steam' });
        }
      });
    }
    if (step === 'citra') {
      ipcChannel.sendMessage(
        'run-app',
        `USERPATH\\emudeck\\EmulationStation-DE\\Emulators\\citra\\citra-qt.exe`
      );
      ipcChannel.once('run-app', (message) => {
        if (installEmus.ryujinx) {
          setStatePage({ ...statePage, step: 'ryujinx' });
        } else {
          setStatePage({ ...statePage, step: 'steam' });
        }
      });
    }
    if (step === 'ryujinx') {
      ipcChannel.sendMessage(
        'run-app',
        `USERPATH\\emudeck\\EmulationStation-DE\\Emulators\\Ryujinx\\Ryujinx.exe`
      );
      ipcChannel.once('run-app', (message) => {
        setStatePage({ ...statePage, step: 'steam' });
      });
    }
  }, [step]);

  // Reading messages from backend
  useEffect(() => {
    const interval = setInterval(() => {
      if (system === 'win32') {
        readMSG();
      } else {
        readMSG();
      }

      if (message.includes('100')) {
        clearInterval(interval);
      }
    }, pollingTime);

    return () => clearInterval(interval);
  }, []);

  // Marking as first run completed
  useEffect(() => {
    setState({ ...state, second: true });
  }, []);

  // Running the installer
  useEffect(() => {
    if (second === true) {
      const json = JSON.stringify(state);

      localStorage.setItem('settings_emudeck', json);
      let preVar = '';
      if (system === 'win32') {
        preVar = '$';
      }

      if (system === 'win32') {
        // console.log('saving settings');

        ipcChannel.sendMessage('bash-nolog', [
          `echo ${state.achievements.token} > "%userprofile%/AppData/Roaming/EmuDeck/.rat"`,
        ]);
        ipcChannel.sendMessage('bash-nolog', [
          `echo ${state.achievements.user} > "%userprofile%/AppData/Roaming/EmuDeck/.rau"`,
        ]);
        // console.log({ state });
        ipcChannel.sendMessage('saveSettings', [JSON.stringify(state)]);
        ipcChannel.once('saveSettings', () => {
          // console.log({ saveSettings });
          ipcChannel.sendMessage('bash-nolog', [
            `finish|||powershell -ExecutionPolicy Bypass . $env:USERPROFILE/AppData/Roaming/EmuDeck/backend/setup.ps1`,
          ]);
          ipcChannel.once('finish', () => {
            setStatePage({ ...statePage, disabledNext: false });
          });
        });
      } else {
        ipcChannel.sendMessage('bash', [
          `startSettings|||echo ${preVar}expert="${
            state.mode === 'expert'
          }" > ${settingsFile}`,
        ]);

        // Wait for settings.sh creation.
        ipcChannel.once('startSettings', () => {
          // console.log('startSettings');

          // Setup Emus
          ipcChannel.sendMessage('bash', [
            `echo ${preVar}doSetupRA="${!!overwriteConfigEmus.ra
              .status}" >> ${settingsFile}`,
          ]);
          ipcChannel.sendMessage('bash', [
            `echo ${preVar}doSetupDolphin="${!!overwriteConfigEmus.dolphin
              .status}" >> ${settingsFile}`,
          ]);

          ipcChannel.sendMessage('bash', [
            `echo ${preVar}doSetupPCSX2QT="${!!overwriteConfigEmus.pcsx2
              .status}" >> ${settingsFile}`,
          ]);
          ipcChannel.sendMessage('bash', [
            `echo ${preVar}doSetupRPCS3="${!!overwriteConfigEmus.rpcs3
              .status}" >> ${settingsFile}`,
          ]);
          ipcChannel.sendMessage('bash', [
            `echo ${preVar}doSetupYuzu="${!!overwriteConfigEmus.yuzu
              .status}" >> ${settingsFile}`,
          ]);
          ipcChannel.sendMessage('bash', [
            `echo ${preVar}doSetupRyujinx="${!!overwriteConfigEmus.ryujinx
              .status}" >> ${settingsFile}`,
          ]);
          ipcChannel.sendMessage('bash', [
            `echo ${preVar}doSetupCitra="${!!overwriteConfigEmus.citra
              .status}" >> ${settingsFile}`,
          ]);
          ipcChannel.sendMessage('bash', [
            `echo ${preVar}doSetupDuck="${!!overwriteConfigEmus.duckstation
              .status}" >> ${settingsFile}`,
          ]);
          ipcChannel.sendMessage('bash', [
            `echo ${preVar}doSetupmelonDS="${!!overwriteConfigEmus.melonds
              .status}" >> ${settingsFile}`,
          ]);
          ipcChannel.sendMessage('bash', [
            `echo ${preVar}doSetupCemu="${!!overwriteConfigEmus.cemu
              .status}" >> ${settingsFile}`,
          ]);
          ipcChannel.sendMessage('bash', [
            `echo ${preVar}doSetupXenia="false" >> ${settingsFile}`,
          ]);

          ipcChannel.sendMessage('bash', [
            `echo ${preVar}doSetupPrimehack="${!!overwriteConfigEmus.primehack
              .status}" >> ${settingsFile}`,
          ]);
          ipcChannel.sendMessage('bash', [
            `echo ${preVar}doSetupXemu="${!!overwriteConfigEmus.xemu
              .status}" >> ${settingsFile}`,
          ]);
          ipcChannel.sendMessage('bash', [
            `echo ${preVar}doSetupPPSSPP="${!!overwriteConfigEmus.ppsspp
              .status}" >> ${settingsFile}`,
          ]);
          ipcChannel.sendMessage('bash', [
            `echo ${preVar}doSetupMAME="${!!overwriteConfigEmus.mame
              .status}" >> ${settingsFile}`,
          ]);
          ipcChannel.sendMessage('bash', [
            `echo ${preVar}doSetupRMG="${!!overwriteConfigEmus.rmg
              .status}" >> ${settingsFile}`,
          ]);
          ipcChannel.sendMessage('bash', [
            `echo ${preVar}doSetupVita3K="${!!overwriteConfigEmus.vita3k
              .status}" >> ${settingsFile}`,
          ]);
          ipcChannel.sendMessage('bash', [
            `echo ${preVar}doSetupScummVM="${!!overwriteConfigEmus.scummvm
              .status}" >> ${settingsFile}`,
          ]);
          ipcChannel.sendMessage('bash', [
            `echo ${preVar}doSetupMGBA="${!!overwriteConfigEmus.mgba
              .status}" >> ${settingsFile}`,
          ]);

          ipcChannel.sendMessage('bash', [
            `echo ${preVar}doSetupESDE="${!!overwriteConfigEmus.esde
              .status}" >> ${settingsFile}`,
          ]);
          ipcChannel.sendMessage('bash', [
            `echo ${preVar}doSetupSRM="${!!overwriteConfigEmus.srm
              .status}" >> ${settingsFile}`,
          ]);

          // Install Emus
          ipcChannel.sendMessage('bash', [
            `echo ${preVar}doInstallRA="${!!installEmus.ra
              .status}" >> ${settingsFile}`,
          ]);
          ipcChannel.sendMessage('bash', [
            `echo ${preVar}doInstallDolphin="${!!installEmus.dolphin
              .status}" >> ${settingsFile}`,
          ]);
          ipcChannel.sendMessage('bash', [
            `echo ${preVar}doInstallPCSX2QT="${!!installEmus.pcsx2
              .status}" >> ${settingsFile}`,
          ]);
          ipcChannel.sendMessage('bash', [
            `echo ${preVar}doInstallRPCS3="${!!installEmus.rpcs3
              .status}" >> ${settingsFile}`,
          ]);
          ipcChannel.sendMessage('bash', [
            `echo ${preVar}doInstallYuzu="${!!installEmus.yuzu
              .status}" >> ${settingsFile}`,
          ]);
          ipcChannel.sendMessage('bash', [
            `echo ${preVar}doInstallRyujinx="${!!installEmus.ryujinx
              .status}" >> ${settingsFile}`,
          ]);
          ipcChannel.sendMessage('bash', [
            `echo ${preVar}doInstallCitra="${!!installEmus.citra
              .status}" >> ${settingsFile}`,
          ]);
          ipcChannel.sendMessage('bash', [
            `echo ${preVar}doInstallDuck="${!!installEmus.duckstation
              .status}" >> ${settingsFile}`,
          ]);
          ipcChannel.sendMessage('bash', [
            `echo ${preVar}doInstallmelonDS="${!!installEmus.melonds
              .status}" >> ${settingsFile}`,
          ]);
          ipcChannel.sendMessage('bash', [
            `echo ${preVar}doInstallCemu="${!!installEmus.cemu
              .status}" >> ${settingsFile}`,
          ]);
          ipcChannel.sendMessage('bash', [
            `echo ${preVar}doInstallRMG="${!!installEmus.rmg
              .status}" >> ${settingsFile}`,
          ]);
          ipcChannel.sendMessage('bash', [
            `echo ${preVar}doInstallXenia="false" >> ${settingsFile}`,
          ]);

          ipcChannel.sendMessage('bash', [
            `echo ${preVar}doInstallPrimeHack="${!!installEmus.primehack
              .status}" >> ${settingsFile}`,
          ]);
          ipcChannel.sendMessage('bash', [
            `echo ${preVar}doInstallPPSSPP="${!!installEmus.ppsspp
              .status}" >> ${settingsFile}`,
          ]);
          ipcChannel.sendMessage('bash', [
            `echo ${preVar}doInstallXemu="${!!installEmus.xemu
              .status}" >> ${settingsFile}`,
          ]);
          ipcChannel.sendMessage('bash', [
            `echo ${preVar}doInstallMAME="${!!installEmus.mame
              .status}" >> ${settingsFile}`,
          ]);
          ipcChannel.sendMessage('bash', [
            `echo ${preVar}doInstallScummVM="${!!installEmus.scummvm
              .status}" >> ${settingsFile}`,
          ]);
          ipcChannel.sendMessage('bash', [
            `echo ${preVar}doInstallVita3K="${!!installEmus.vita3k
              .status}" >> ${settingsFile}`,
          ]);

          ipcChannel.sendMessage('bash', [
            `echo ${preVar}doInstallMGBA="${!!installEmus.mgba
              .status}" >> ${settingsFile}`,
          ]);

          ipcChannel.sendMessage('bash', [
            `echo ${preVar}doInstallSRM="${!!installEmus.srm
              .status}" >> ${settingsFile}`,
          ]);
          ipcChannel.sendMessage('bash', [
            `echo ${preVar}doInstallESDE="${!!installEmus.esde
              .status}" >> ${settingsFile}`,
          ]);
          ipcChannel.sendMessage('bash', [
            `echo ${preVar}doInstallCHD="true" >> ${settingsFile}`,
          ]);
          ipcChannel.sendMessage('bash', [
            `echo ${preVar}doInstallPowertools="${!!state.powerTools}" >> ${settingsFile}`,
          ]);
          ipcChannel.sendMessage('bash', [
            `echo ${preVar}doInstallGyro="${!!state.GyroDSU}" >> ${settingsFile}`,
          ]);
          ipcChannel.sendMessage('bash', [
            `echo ${preVar}doInstallHomeBrewGames="${!!state.homebrewGames}" >> ${settingsFile}`,
          ]);

          // Aspect Ratios
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

          // Bezels
          ipcChannel.sendMessage('bash', [
            `echo ${preVar}RABezels="${!!state.bezels}" >> ${settingsFile}`,
          ]);

          // AutoSave
          ipcChannel.sendMessage('bash', [
            `echo ${preVar}RAautoSave="${!!state.autosave}" >> ${settingsFile}`,
          ]);

          // old ar
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

          // Paths
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

          // Shaders
          ipcChannel.sendMessage('bash', [
            `echo ${preVar}RAHandHeldShader="${!!state.shaders
              .handhelds}" >> ${settingsFile}`,
          ]);

          ipcChannel.sendMessage('bash', [
            `echo ${preVar}RAHandClassic2D="${!!state.shaders
              .classic}" >> ${settingsFile}`,
          ]);

          ipcChannel.sendMessage('bash', [
            `echo ${preVar}RAHandClassic3D="${!!state.shaders
              .classic3d}" >> ${settingsFile}`,
          ]);

          // theme
          ipcChannel.sendMessage('bash', [
            `echo ${preVar}esdeTheme="${state.theme}" >> ${settingsFile}`,
          ]);

          // AdvancedSettings
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

          // Achievements
          ipcChannel.sendMessage('bash-nolog', [
            `echo '${state.achievements.token}' > $HOME/.config/EmuDeck/.rat`,
          ]);
          ipcChannel.sendMessage('bash-nolog', [
            `echo '${state.achievements.user}' > $HOME/.config/EmuDeck/.rau`,
          ]);

          ipcChannel.sendMessage('bash', [
            `echo ${preVar}achievementsHardcore="${state.achievements.hardcore}" >> ${settingsFile}`,
          ]);

          // CloudSync
          ipcChannel.sendMessage('bash', [
            `echo ${preVar}cloud_sync_provider="${state.cloudSync}" >> ${settingsFile} && echo true`,
          ]);
          ipcChannel.sendMessage('bash', [
            `echo ${preVar}rclone_provider="${state.cloudSync}" >> ${settingsFile} && echo true`,
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

          // Closing
          // console.log('finalSetting');
          ipcChannel.sendMessage('bash-nolog', [
            `finalSetting|||echo ${preVar}finishedUI="done" >> ${settingsFile} && echo true`,
          ]);
        });

        ipcChannel.once('finalSetting', (messageFinalSetting) => {
          // console.log('Running installer');
          const { stdout } = messageFinalSetting;
          // Installation

          ipcChannel.sendMessage('bash-nolog', [
            `bash ~/.config/EmuDeck/backend/setup.sh ${branch} false`,
          ]);

          ipcChannel.sendMessage('emudeck', [
            `finish|||checkForFile ~/.config/EmuDeck/.ui-finished delete && echo 'Starting...' > ~/.config/EmuDeck/msg.log && printf "\ec" && echo true`,
          ]);
        });
        ipcChannel.once('finish', (messageFinish) => {
          // console.log('finish');
          const { stdout } = messageFinish;
          if (stdout.includes('true')) {
            setStatePage({ ...statePage, disabledNext: false });
          }
        });
      }
    }
  }, [second]);

  return (
    <Wrapper>
      {disabledNext === true && (
        <Header title="We are completing your" bold="installation..." />
      )}
      {disabledNext === false && step === undefined && (
        <Header title="Installation" bold="complete!" />
      )}
      <End
        onClick={openSRM}
        onClickWin32Config={configureControllers}
        data={data}
        step={step}
        message={message}
        percentage={percentage}
        disabledNext={disabledNext}
      />
      <footer className="footer">
        <BtnSimple
          css="btn-simple--1"
          type="button"
          aria="Go Back"
          disabled={false}
          onClick={showLog}
        >
          Watch Log
        </BtnSimple>

        <BtnSimple
          css="btn-simple--1"
          type="button"
          aria="Go Next"
          disabled={disabledNext && 'true'}
          onClick={() => navigate('/cloud-sync')}
        >
          Next
          <svg
            className="rightarrow"
            width="32"
            height="32"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill="currentColor"
              d="M16.4091 8.48003L21.5024 13.5734L1.98242 13.5734L1.98242 18.0178H21.5024L16.4091 23.1111L19.5558 26.2578L30.018 15.7956L19.5558 5.33337L16.4091 8.48003Z"
            />
          </svg>
        </BtnSimple>
      </footer>
    </Wrapper>
  );
}

export default EndPage;
