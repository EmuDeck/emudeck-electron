import React, { useEffect, useState, useContext, useRef } from 'react';
import { GlobalContext } from 'context/globalContext';
import { useNavigate } from 'react-router-dom';
import Wrapper from 'components/molecules/Wrapper/Wrapper';
import GamePad from 'components/organisms/GamePad/GamePad';
import Header from 'components/organisms/Header/Header';
import ProgressBar from 'components/atoms/ProgressBar/ProgressBar';
import { BtnSimple } from 'getbasecore/Atoms';
import Sonic from 'components/organisms/Sonic/Sonic';
import End from 'components/organisms/Wrappers/End';

function EndPage() {
  const navigate = useNavigate();
  const { state, setState } = useContext(GlobalContext);
  const [statePage, setStatePage] = useState({
    disabledNext: true,
    disabledBack: true,
    data: '',
    step: undefined,
    dom: undefined,
  });

  const { disabledNext, data, step, dom } = statePage;
  const {
    second,
    branch,
    storagePath,
    gamemode,
    device,
    system,
    installEmus,
    installFrontends,
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
      //
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
    // if (installEmus.yuzu) {
    //   setStatePage({ ...statePage, step: 'yuzu' });
    //   return;
    // }
    // if (installEmus.citra) {
    //   setStatePage({ ...statePage, step: 'citra' });
    //   return;
    // }
    // if (installEmus.ryujinx) {
    //   setStatePage({ ...statePage, step: 'ryujinx' });
    // }
    // if (!installEmus.yuzu && !installEmus.citra && !installEmus.ryujinx) {
    setStatePage({ ...statePage, step: 'steam' });
    // }
  };
  const openSRM = () => {
    let modalData = {
      active: true,
      header: <span className="h4">Launching Steam Rom Manager</span>,
      body: (
        <p>
          We will close Steam if its running and then Steam Rom Manager will
          open, this could take a few seconds, please wait.
        </p>
      ),
      footer: <ProgressBar css="progress--success" infinite max="100" />,
      css: 'emumodal--xs',
    };

    if (system === 'win32') {
      setStatePage({ ...statePage, modal: modalData });
      ipcChannel.sendMessage(
        'emudeck',
        'powershell -ExecutionPolicy Bypass -NoProfile -File "$toolsPath/launchers/srm/steamrommanager.ps1"'
      );
    } else if (system !== 'darwin') {
      setStatePage({ ...statePage, modal: modalData });
      ipcChannel.sendMessage(
        'emudeck',
        '"$toolsPath/launchers/srm/steamrommanager.sh"'
      );
    } else {
      modalData = {
        active: true,
        header: <span className="h4">Launching Steam Rom Manager</span>,
        body: (
          <>
            <p>
              We will close Steam if its running and then Steam Rom Manager will
              open, this could take a few seconds, please wait.
            </p>
            <strong>
              Desktop controls will temporarily revert to touch/trackpad/L2/R2.
            </strong>
          </>
        ),
        footer: <ProgressBar css="progress--success" infinite max="100" />,
        css: 'emumodal--sm',
      };
      setStatePage({ ...statePage, modal: modalData });
      ipcChannel.sendMessage(
        'emudeck',
        '"$toolsPath/launchers/srm/steamrommanager.sh"'
      );
    }
    const timerId = setTimeout(() => {
      setStatePage({
        ...statePage,
        modal: {
          active: false,
        },
      });
      clearTimeout(timerId);
    }, 30000);
  };

  const showLog = () => {
    if (system === 'win32') {
      ipcChannel.sendMessage('bash-nolog', [
        `start powershell -NoExit -ExecutionPolicy Bypass -command "& { Get-Content $env:USERPROFILE/emudeck/logs/emudeckSetup.log -Tail 100 -Wait }"`,
      ]);
    } else if (system === 'darwin') {
      ipcChannel.sendMessage('bash-nolog', [
        `osascript -e 'tell app "Terminal" to do script "clear && tail -f $HOME/emudeck/logs/emudeckSetup.log"'`,
      ]);
    } else {
      ipcChannel.sendMessage('bash-nolog', [
        `konsole -e tail -f "$HOME/emudeck/logs/emudeckSetup.log"`,
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

      if (system === 'win32') {
        ipcChannel.sendMessage('bash-nolog', [
          `echo ${state.achievements.token} > "%userprofile%/AppData/Roaming/EmuDeck/.rat"`,
        ]);
        ipcChannel.sendMessage('bash-nolog', [
          `echo ${state.achievements.user} > "%userprofile%/AppData/Roaming/EmuDeck/.rau"`,
        ]);

        ipcChannel.sendMessage('saveSettings', [JSON.stringify(state)]);
        ipcChannel.once('saveSettings', () => {
          ipcChannel.sendMessage('bash-nolog', [
            `finish|||powershell -ExecutionPolicy Bypass . $env:USERPROFILE/AppData/Roaming/EmuDeck/backend/setup.ps1`,
          ]);
          ipcChannel.once('finish', () => {
            setStatePage({ ...statePage, disabledNext: false });
          });
        });
      } else {
        ipcChannel.sendMessage('bash', [
          `startSettings|||echo expert="${
            state.mode === 'expert'
          }" > ${settingsFile}`,
        ]);

        // Wait for settings.sh creation.
        ipcChannel.once('startSettings', () => {
          // System
          ipcChannel.sendMessage('bash', [
            `echo system="${system}" >> ${settingsFile}`,
          ]);
          // Setup Emus
          ipcChannel.sendMessage('bash', [
            `echo doSetupRA="${!!overwriteConfigEmus.ra
              .status}" >> ${settingsFile}`,
          ]);
          ipcChannel.sendMessage('bash', [
            `echo doSetupDolphin="${!!overwriteConfigEmus.dolphin
              .status}" >> ${settingsFile}`,
          ]);

          ipcChannel.sendMessage('bash', [
            `echo doSetupPCSX2QT="${!!overwriteConfigEmus.pcsx2
              .status}" >> ${settingsFile}`,
          ]);
          ipcChannel.sendMessage('bash', [
            `echo doSetupRPCS3="${!!overwriteConfigEmus.rpcs3
              .status}" >> ${settingsFile}`,
          ]);
          ipcChannel.sendMessage('bash', [
            `echo doSetupYuzu="${!!overwriteConfigEmus.yuzu
              .status}" >> ${settingsFile}`,
          ]);
          ipcChannel.sendMessage('bash', [
            `echo doSetupRyujinx="${!!overwriteConfigEmus.ryujinx
              .status}" >> ${settingsFile}`,
          ]);
          ipcChannel.sendMessage('bash', [
            `echo doSetupCitra="${!!overwriteConfigEmus.citra
              .status}" >> ${settingsFile}`,
          ]);
          ipcChannel.sendMessage('bash', [
            `echo doSetupDuck="${!!overwriteConfigEmus.duckstation
              .status}" >> ${settingsFile}`,
          ]);
          ipcChannel.sendMessage('bash', [
            `echo doSetupmelonDS="${!!overwriteConfigEmus.melonds
              .status}" >> ${settingsFile}`,
          ]);
          ipcChannel.sendMessage('bash', [
            `echo doSetupCemu="${!!overwriteConfigEmus.cemu
              .status}" >> ${settingsFile}`,
          ]);
          ipcChannel.sendMessage('bash', [
            `echo doSetupXenia="false" >> ${settingsFile}`,
          ]);

          ipcChannel.sendMessage('bash', [
            `echo doSetupPrimehack="${!!overwriteConfigEmus.primehack
              .status}" >> ${settingsFile}`,
          ]);
          ipcChannel.sendMessage('bash', [
            `echo doSetupXemu="${!!overwriteConfigEmus.xemu
              .status}" >> ${settingsFile}`,
          ]);
          ipcChannel.sendMessage('bash', [
            `echo doSetupPPSSPP="${!!overwriteConfigEmus.ppsspp
              .status}" >> ${settingsFile}`,
          ]);
          ipcChannel.sendMessage('bash', [
            `echo doSetupMAME="${!!overwriteConfigEmus.mame
              .status}" >> ${settingsFile}`,
          ]);
          ipcChannel.sendMessage('bash', [
            `echo doSetupRMG="${!!overwriteConfigEmus.rmg
              .status}" >> ${settingsFile}`,
          ]);
          ipcChannel.sendMessage('bash', [
            `echo doSetupVita3K="${!!overwriteConfigEmus.vita3k
              .status}" >> ${settingsFile}`,
          ]);
          ipcChannel.sendMessage('bash', [
            `echo doSetupFlycast="${!!overwriteConfigEmus.flycast
              .status}" >> ${settingsFile}`,
          ]);
          ipcChannel.sendMessage('bash', [
            `echo doSetupScummVM="${!!overwriteConfigEmus.scummvm
              .status}" >> ${settingsFile}`,
          ]);
          ipcChannel.sendMessage('bash', [
            `echo doSetupMGBA="${!!overwriteConfigEmus.mgba
              .status}" >> ${settingsFile}`,
          ]);
          ipcChannel.sendMessage('bash', [
            `echo doSetupESDE="${!!overwriteConfigEmus.esde
              .status}" >> ${settingsFile}`,
          ]);
          ipcChannel.sendMessage('bash', [
            `echo doSetupSRM="${!!overwriteConfigEmus.srm
              .status}" >> ${settingsFile}`,
          ]);

          // Install Emus
          ipcChannel.sendMessage('bash', [
            `echo doInstallRA="${!!installEmus.ra.status}" >> ${settingsFile}`,
          ]);
          ipcChannel.sendMessage('bash', [
            `echo doInstallDolphin="${!!installEmus.dolphin
              .status}" >> ${settingsFile}`,
          ]);
          ipcChannel.sendMessage('bash', [
            `echo doInstallPCSX2QT="${!!installEmus.pcsx2
              .status}" >> ${settingsFile}`,
          ]);
          ipcChannel.sendMessage('bash', [
            `echo doInstallRPCS3="${!!installEmus.rpcs3
              .status}" >> ${settingsFile}`,
          ]);
          ipcChannel.sendMessage('bash', [
            `echo doInstallYuzu="${!!installEmus.yuzu
              .status}" >> ${settingsFile}`,
          ]);
          ipcChannel.sendMessage('bash', [
            `echo doInstallRyujinx="${!!installEmus.ryujinx
              .status}" >> ${settingsFile}`,
          ]);
          ipcChannel.sendMessage('bash', [
            `echo doInstallCitra="${!!installEmus.citra
              .status}" >> ${settingsFile}`,
          ]);
          ipcChannel.sendMessage('bash', [
            `echo doInstallDuck="${!!installEmus.duckstation
              .status}" >> ${settingsFile}`,
          ]);
          ipcChannel.sendMessage('bash', [
            `echo doInstallmelonDS="${!!installEmus.melonds
              .status}" >> ${settingsFile}`,
          ]);
          ipcChannel.sendMessage('bash', [
            `echo doInstallCemu="${!!installEmus.cemu
              .status}" >> ${settingsFile}`,
          ]);
          ipcChannel.sendMessage('bash', [
            `echo doInstallRMG="${!!installEmus.rmg
              .status}" >> ${settingsFile}`,
          ]);
          ipcChannel.sendMessage('bash', [
            `echo doInstallXenia="false" >> ${settingsFile}`,
          ]);

          ipcChannel.sendMessage('bash', [
            `echo doInstallPrimeHack="${!!installEmus.primehack
              .status}" >> ${settingsFile}`,
          ]);
          ipcChannel.sendMessage('bash', [
            `echo doInstallPPSSPP="${!!installEmus.ppsspp
              .status}" >> ${settingsFile}`,
          ]);
          ipcChannel.sendMessage('bash', [
            `echo doInstallXemu="${!!installEmus.xemu
              .status}" >> ${settingsFile}`,
          ]);
          ipcChannel.sendMessage('bash', [
            `echo doInstallMAME="${!!installEmus.mame
              .status}" >> ${settingsFile}`,
          ]);
          ipcChannel.sendMessage('bash', [
            `echo doInstallScummVM="${!!installEmus.scummvm
              .status}" >> ${settingsFile}`,
          ]);
          ipcChannel.sendMessage('bash', [
            `echo doInstallVita3K="${!!installEmus.vita3k
              .status}" >> ${settingsFile}`,
          ]);
          ipcChannel.sendMessage('bash', [
            `echo doInstallFlycast="${!!installEmus.flycast
              .status}" >> ${settingsFile}`,
          ]);

          ipcChannel.sendMessage('bash', [
            `echo doInstallMGBA="${!!installEmus.mgba
              .status}" >> ${settingsFile}`,
          ]);

          ipcChannel.sendMessage('bash', [
            `echo doInstallSRM="${!!installEmus.srm
              .status}" >> ${settingsFile}`,
          ]);
          ipcChannel.sendMessage('bash', [
            `echo doInstallESDE="${installFrontends.esde.status}" >> ${settingsFile}`,
          ]);
          ipcChannel.sendMessage('bash', [
            `echo doInstallPegasus="${installFrontends.pegasus.status}" >> ${settingsFile}`,
          ]);
          ipcChannel.sendMessage('bash', [
            `echo steamAsFrontend="${installFrontends.steam.status}" >> ${settingsFile}`,
          ]);
          ipcChannel.sendMessage('bash', [
            `echo doInstallCHD="true" >> ${settingsFile}`,
          ]);
          ipcChannel.sendMessage('bash', [
            `echo doInstallPowertools="${!!state.powerTools}" >> ${settingsFile}`,
          ]);
          ipcChannel.sendMessage('bash', [
            `echo doInstallGyro="${!!state.GyroDSU}" >> ${settingsFile}`,
          ]);
          ipcChannel.sendMessage('bash', [
            `echo doInstallHomeBrewGames="${!!state.homebrewGames}" >> ${settingsFile}`,
          ]);

          // Aspect Ratios
          ipcChannel.sendMessage('bash', [
            `echo arSega="${state.ar.sega}" >> ${settingsFile}`,
          ]);
          ipcChannel.sendMessage('bash', [
            `echo arSnes="${state.ar.snes}" >> ${settingsFile}`,
          ]);
          ipcChannel.sendMessage('bash', [
            `echo arClassic3D="${state.ar.classic3d}" >> ${settingsFile}`,
          ]);
          ipcChannel.sendMessage('bash', [
            `echo arDolphin="${state.ar.dolphin}" >> ${settingsFile}`,
          ]);

          // Bezels
          ipcChannel.sendMessage('bash', [
            `echo RABezels="${!!state.bezels}" >> ${settingsFile}`,
          ]);

          // AutoSave
          ipcChannel.sendMessage('bash', [
            `echo RAautoSave="${!!state.autosave}" >> ${settingsFile}`,
          ]);

          // old ar
          ipcChannel.sendMessage('bash', [
            `echo duckWide="false" >> ${settingsFile}`,
          ]);
          ipcChannel.sendMessage('bash', [
            `echo DolphinWide="false" >> ${settingsFile}`,
          ]);
          ipcChannel.sendMessage('bash', [
            `echo DreamcastWide="false" >> ${settingsFile}`,
          ]);
          ipcChannel.sendMessage('bash', [
            `echo BeetleWide="false" >> ${settingsFile}`,
          ]);
          ipcChannel.sendMessage('bash', [
            `echo pcsx2QTWide="false ">> ${settingsFile}`,
          ]);

          // Paths
          ipcChannel.sendMessage('bash', [
            `echo emulationPath="${storagePath}/Emulation" >> ${settingsFile}`,
          ]);
          //
          ipcChannel.sendMessage('bash', [
            `echo romsPath="${storagePath}/Emulation/roms" >> ${settingsFile}`,
          ]);
          ipcChannel.sendMessage('bash', [
            `echo toolsPath="${storagePath}/Emulation/tools" >> ${settingsFile}`,
          ]);
          ipcChannel.sendMessage('bash', [
            `echo biosPath="${storagePath}/Emulation/bios" >> ${settingsFile}`,
          ]);
          ipcChannel.sendMessage('bash', [
            `echo savesPath="${storagePath}/Emulation/saves" >> ${settingsFile}`,
          ]);
          ipcChannel.sendMessage('bash', [
            `echo storagePath="${storagePath}/Emulation/storage" >> ${settingsFile}`,
          ]);
          ipcChannel.sendMessage('bash', [
            `echo ESDEscrapData="${storagePath}/Emulation/tools/downloaded_media" >> ${settingsFile}`,
          ]);

          // Shaders
          ipcChannel.sendMessage('bash', [
            `echo RAHandHeldShader="${!!state.shaders
              .handhelds}" >> ${settingsFile}`,
          ]);

          ipcChannel.sendMessage('bash', [
            `echo RAHandClassic2D="${!!state.shaders
              .classic}" >> ${settingsFile}`,
          ]);

          ipcChannel.sendMessage('bash', [
            `echo RAHandClassic3D="${!!state.shaders
              .classic3d}" >> ${settingsFile}`,
          ]);

          // theme
          ipcChannel.sendMessage('bash', [
            `echo esdeThemeUrl="${state.themeESDE[0]}" >> ${settingsFile}`,
          ]);
          ipcChannel.sendMessage('bash', [
            `echo esdeThemeName="${state.themeESDE[1]}" >> ${settingsFile}`,
          ]);
          ipcChannel.sendMessage('bash', [
            `echo pegasusThemeUrl="${state.themePegasus[0]}" >> ${settingsFile}`,
          ]);
          ipcChannel.sendMessage('bash', [
            `echo pegasusThemeName="${state.themePegasus[1]}" >> ${settingsFile}`,
          ]);

          // AdvancedSettings
          ipcChannel.sendMessage('bash', [
            `echo doSelectWideScreen="false" >> ${settingsFile}`,
          ]);

          ipcChannel.sendMessage('bash', [
            `echo doESDEThemePicker="false" >> ${settingsFile}`,
          ]);
          ipcChannel.sendMessage('bash', [
            `echo doSelectEmulators="false" >> ${settingsFile}`,
          ]);
          ipcChannel.sendMessage('bash', [
            `echo doResetEmulators="false" >> ${settingsFile}`,
          ]);
          ipcChannel.sendMessage('bash', [
            `echo XemuWide="false" >> ${settingsFile}`,
          ]);

          // Achievements
          ipcChannel.sendMessage('bash', [
            `echo achievementsUser="${state.achievements.user}" >> ${settingsFile}`,
          ]);
          ipcChannel.sendMessage('bash', [
            `echo achievementsUserToken="${state.achievements.token}" >> ${settingsFile}`,
          ]);

          ipcChannel.sendMessage('bash', [
            `echo achievementsHardcore="${state.achievements.hardcore}" >> ${settingsFile}`,
          ]);

          // CloudSync
          ipcChannel.sendMessage('bash', [
            `echo cloud_sync_provider="${state.cloudSync}" >> ${settingsFile} && echo true`,
          ]);
          ipcChannel.sendMessage('bash', [
            `echo rclone_provider="${state.cloudSync}" >> ${settingsFile} && echo true`,
          ]);

          // Emulator resolutions
          ipcChannel.sendMessage('bash', [
            `echo dolphinResolution="${state.resolutions.dolphin}" >> ${settingsFile}`,
          ]);
          ipcChannel.sendMessage('bash', [
            `echo duckstationResolution="${state.resolutions.duckstation}" >> ${settingsFile}`,
          ]);
          ipcChannel.sendMessage('bash', [
            `echo pcsx2Resolution="${state.resolutions.pcsx2}" >> ${settingsFile}`,
          ]);
          ipcChannel.sendMessage('bash', [
            `echo yuzuResolution="${state.resolutions.yuzu}" >> ${settingsFile}`,
          ]);
          ipcChannel.sendMessage('bash', [
            `echo ppssppResolution="${state.resolutions.ppsspp}" >> ${settingsFile}`,
          ]);
          ipcChannel.sendMessage('bash', [
            `echo rpcs3Resolution="${state.resolutions.rpcs3}" >> ${settingsFile}`,
          ]);
          ipcChannel.sendMessage('bash', [
            `echo ryujinxResolution="${state.resolutions.ryujinx}" >> ${settingsFile}`,
          ]);
          ipcChannel.sendMessage('bash', [
            `echo xemuResolution="${state.resolutions.xemu}" >> ${settingsFile}`,
          ]);
          ipcChannel.sendMessage('bash', [
            `echo xeniaResolution="${state.resolutions.xenia}" >> ${settingsFile}`,
          ]);
          ipcChannel.sendMessage('bash', [
            `echo citraResolution="${state.resolutions.citra}" >> ${settingsFile}`,
          ]);

          // ParserExclusion

          ipcChannel.sendMessage('bash', [
            `echo emuGBA="${state.emulatorAlternative.gba}" >> ${settingsFile}`,
          ]);
          ipcChannel.sendMessage('bash', [
            `echo emuMAME="${state.emulatorAlternative.mame}" >> ${settingsFile}`,
          ]);
          ipcChannel.sendMessage('bash', [
            `echo emuMULTI="${state.emulatorAlternative.multiemulator}" >> ${settingsFile}`,
          ]);
          ipcChannel.sendMessage('bash', [
            `echo emuN64="${state.emulatorAlternative.n64}" >> ${settingsFile}`,
          ]);
          ipcChannel.sendMessage('bash', [
            `echo emuNDS="${state.emulatorAlternative.nds}" >> ${settingsFile}`,
          ]);
          ipcChannel.sendMessage('bash', [
            `echo emuPSP="${state.emulatorAlternative.psp}" >> ${settingsFile}`,
          ]);
          ipcChannel.sendMessage('bash', [
            `echo emuPSX="${state.emulatorAlternative.psx}" >> ${settingsFile}`,
          ]);
          ipcChannel.sendMessage('bash', [
            `echo emuSCUMMVM="${state.emulatorAlternative.scummvm}" >> ${settingsFile}`,
          ]);
          ipcChannel.sendMessage('bash', [
            `echo emuDreamcast="${state.emulatorAlternative.dreamcast}" >> ${settingsFile}`,
          ]);

          // Closing

          ipcChannel.sendMessage('bash-nolog', [
            `finalSetting|||echo finishedUI="done" >> ${settingsFile} && echo true`,
          ]);
        });

        ipcChannel.once('finalSetting', (messageFinalSetting) => {
          const { stdout } = messageFinalSetting;
          // Installation

          if (system === 'darwin') {
            ipcChannel.sendMessage('bash-nolog', [
              `osascript -e 'tell app "Terminal" to do script "bash ~/.config/EmuDeck/backend/setup.sh"'`,
            ]);
          } else {
            ipcChannel.sendMessage('bash-nolog', [
              `bash ~/.config/EmuDeck/backend/setup.sh ${branch} false`,
            ]);
          }

          ipcChannel.sendMessage('emudeck', [
            `finish|||checkForFile ~/.config/EmuDeck/.ui-finished delete && echo 'Starting...' > ~/.config/EmuDeck/msg.log && printf "\ec" && echo true`,
          ]);
        });
        ipcChannel.once('finish', (messageFinish) => {
          const { stdout } = messageFinish;
          if (stdout.includes('true')) {
            setStatePage({ ...statePage, disabledNext: false });
          }
        });
      }
    }
  }, [second]);

  // GamePad
  const domElementsRef = useRef(null);
  const domElementsCur = domElementsRef.current;
  let domElements;
  useEffect(() => {
    if (domElementsCur && dom === undefined) {
      domElements = domElementsCur.querySelectorAll('button');
      setStatePage({ ...statePage, dom: domElements });
    }
  }, [statePage]);

  let nextPage = '/copy-games';

  if (branch.includes('early') || branch === 'dev') {
    nextPage = '/cloud-sync';
  }

  return (
    <div style={{ height: '100vh' }} ref={domElementsRef}>
      {dom !== undefined && <GamePad elements={dom} />}
      <Wrapper>
        {disabledNext === true && (
          <Header title="We are completing your installation..." />
        )}
        {disabledNext === false && step === undefined && system !== 'win32' && (
          <Header title="Installation complete!" />
        )}

        {disabledNext === false &&
          step === undefined &&
          device === 'Asus Rog Ally' && (
            <Header title="Asus Rog Ally Controller configuration" />
          )}

        {disabledNext === false &&
          step === undefined &&
          device !== 'Asus Rog Ally' &&
          system === 'win32' && <Header title="Controller configuration" />}

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
            aria="Go Next"
            disabled={disabledNext && 'true'}
            onClick={() => navigate(nextPage)}
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
    </div>
  );
}

export default EndPage;
