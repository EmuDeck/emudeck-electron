import React, { useEffect, useState, useContext } from 'react';
import { GlobalContext } from 'context/globalContext';

import End from 'components/organisms/Wrappers/End.js';

const EndPage = () => {
  const { state, setState } = useContext(GlobalContext);
  const [statePage, setStatePage] = useState({
    disabledNext: true,
    disabledBack: true,
    data: '',
    isGameMode: false,
  });
  const { disabledNext, disabledBack, data, isGameMode } = statePage;
  const { second, debug, branch, storagePath } = state;
  const ipcChannel = window.electron.ipcRenderer;
  //Saving the config
  useEffect(() => {
    setState({ ...state, second: true });
  }, []);

  useEffect(() => {
    ipcChannel.sendMessage('isGameMode');
    ipcChannel.once('isGameMode-out', (isGameMode) => {
      setStatePage({ ...statePage, isGameMode: isGameMode });
    });

    let json = JSON.stringify(state);
    localStorage.setItem('settings_emudeck', json);

    ipcChannel.sendMessage('bash', [`mkdir -p ~/.config/EmuDeck/`]);

    ipcChannel.sendMessage('bash', [
      `echo expert=${
        state.mode === 'expert' ? true : false
      } > ~/emudeck/settings.sh`,
    ]);

    //Setup Emus
    ipcChannel.sendMessage('bash', [
      `echo doSetupRA=${
        state.overwriteConfigEmus.ra.status ? true : false
      } >> ~/emudeck/settings.sh`,
    ]);
    ipcChannel.sendMessage('bash', [
      `echo doSetupDolphin=${
        state.overwriteConfigEmus.dolphin.status ? true : false
      } >> ~/emudeck/settings.sh`,
    ]);

    ipcChannel.sendMessage('bash', [
      `echo doSetupPCSX2QT=${
        state.overwriteConfigEmus.pcsx2.status ? true : false
      } >> ~/emudeck/settings.sh`,
    ]);
    ipcChannel.sendMessage('bash', [
      `echo doSetupRPCS3=${
        state.overwriteConfigEmus.rpcs3.status ? true : false
      } >> ~/emudeck/settings.sh`,
    ]);
    ipcChannel.sendMessage('bash', [
      `echo doSetupYuzu=${
        state.overwriteConfigEmus.yuzu.status ? true : false
      } >> ~/emudeck/settings.sh`,
    ]);
    ipcChannel.sendMessage('bash', [
      `echo doSetupRyujinx=${
        state.overwriteConfigEmus.ryujinx.status ? true : false
      } >> ~/emudeck/settings.sh`,
    ]);
    ipcChannel.sendMessage('bash', [
      `echo doSetupCitra=${
        state.overwriteConfigEmus.citra.status ? true : false
      } >> ~/emudeck/settings.sh`,
    ]);
    ipcChannel.sendMessage('bash', [
      `echo doSetupDuck=${
        state.overwriteConfigEmus.duckstation.status ? true : false
      } >> ~/emudeck/settings.sh`,
    ]);
    ipcChannel.sendMessage('bash', [
      `echo doSetupCemu=${
        state.overwriteConfigEmus.cemu.status ? true : false
      } >> ~/emudeck/settings.sh`,
    ]);
    ipcChannel.sendMessage('bash', [
      `echo doSetupXenia=false >> ~/emudeck/settings.sh`,
    ]);
    ipcChannel.sendMessage('bash', [
      `echo doSetupRyujinx=false >> ~/emudeck/settings.sh`,
    ]);

    ipcChannel.sendMessage('bash', [
      `echo doSetupPrimeHacks=${
        state.overwriteConfigEmus.primehacks.status ? true : false
      } >> ~/emudeck/settings.sh`,
    ]);
    ipcChannel.sendMessage('bash', [
      `echo doSetupXemu=${
        state.overwriteConfigEmus.xemu.status ? true : false
      } >> ~/emudeck/settings.sh`,
    ]);
    ipcChannel.sendMessage('bash', [
      `echo doSetupPPSSPP=${
        state.overwriteConfigEmus.ppsspp.status ? true : false
      } >> ~/emudeck/settings.sh`,
    ]);
    ipcChannel.sendMessage('bash', [
      `echo doSetupMAME=${
        state.overwriteConfigEmus.mame.status ? true : false
      } >> ~/emudeck/settings.sh`,
    ]);
    ipcChannel.sendMessage('bash', [
      `echo doSetupVita3K=${
        state.overwriteConfigEmus.vita3k.status ? true : false
      } >> ~/emudeck/settings.sh`,
    ]);
    ipcChannel.sendMessage('bash', [
      `echo doSetupScummVM=${
        state.overwriteConfigEmus.scummvm.status ? true : false
      } >> ~/emudeck/settings.sh`,
    ]);

    ipcChannel.sendMessage('bash', [
      `echo doSetupESDE=true >> ~/emudeck/settings.sh`,
    ]);
    ipcChannel.sendMessage('bash', [
      `echo doSetupSRM=${
        state.overwriteConfigEmus.srm.status ? true : false
      } >> ~/emudeck/settings.sh`,
    ]);

    //Install Emus
    ipcChannel.sendMessage('bash', [
      `echo doInstallRA=${
        state.installEmus.ra.status ? true : false
      } >> ~/emudeck/settings.sh`,
    ]);
    ipcChannel.sendMessage('bash', [
      `echo doInstallDolphin=${
        state.installEmus.dolphin.status ? true : false
      } >> ~/emudeck/settings.sh`,
    ]);
    ipcChannel.sendMessage('bash', [
      `echo doInstallPCSX2QT=${
        state.installEmus.pcsx2.status ? true : false
      } >> ~/emudeck/settings.sh`,
    ]);
    ipcChannel.sendMessage('bash', [
      `echo doInstallRPCS3=${
        state.installEmus.rpcs3.status ? true : false
      } >> ~/emudeck/settings.sh`,
    ]);
    ipcChannel.sendMessage('bash', [
      `echo doInstallYuzu=${
        state.installEmus.yuzu.status ? true : false
      } >> ~/emudeck/settings.sh`,
    ]);
    ipcChannel.sendMessage('bash', [
      `echo doInstallRyujinx=${
        state.installEmus.ryujinx.status ? true : false
      } >> ~/emudeck/settings.sh`,
    ]);
    ipcChannel.sendMessage('bash', [
      `echo doInstallCitra=${
        state.installEmus.citra.status ? true : false
      } >> ~/emudeck/settings.sh`,
    ]);
    ipcChannel.sendMessage('bash', [
      `echo doInstallDuck=${
        state.installEmus.duckstation.status ? true : false
      } >> ~/emudeck/settings.sh`,
    ]);
    ipcChannel.sendMessage('bash', [
      `echo doInstallCemu=${
        state.installEmus.cemu.status ? true : false
      } >> ~/emudeck/settings.sh`,
    ]);
    ipcChannel.sendMessage('bash', [
      `echo doInstallXenia=false >> ~/emudeck/settings.sh`,
    ]);

    ipcChannel.sendMessage('bash', [
      `echo doInstallPrimeHacks=${
        state.installEmus.primehacks.status ? true : false
      } >> ~/emudeck/settings.sh`,
    ]);
    ipcChannel.sendMessage('bash', [
      `echo doInstallPPSSPP=${
        state.installEmus.ppsspp.status ? true : false
      } >> ~/emudeck/settings.sh`,
    ]);
    ipcChannel.sendMessage('bash', [
      `echo doInstallXemu=${
        state.installEmus.xemu.status ? true : false
      } >> ~/emudeck/settings.sh`,
    ]);
    ipcChannel.sendMessage('bash', [
      `echo doInstallMAME=${
        state.installEmus.mame.status ? true : false
      } >> ~/emudeck/settings.sh`,
    ]);
    ipcChannel.sendMessage('bash', [
      `echo doInstallScummVM=${
        state.installEmus.scummvm.status ? true : false
      } >> ~/emudeck/settings.sh`,
    ]);
    ipcChannel.sendMessage('bash', [
      `echo doInstallVita3K=${
        state.installEmus.vita3k.status ? true : false
      } >> ~/emudeck/settings.sh`,
    ]);

    ipcChannel.sendMessage('bash', [
      `echo doInstallSRM=${
        state.installEmus.srm.status ? true : false
      } >> ~/emudeck/settings.sh`,
    ]);
    ipcChannel.sendMessage('bash', [
      `echo doInstallESDE=true >> ~/emudeck/settings.sh`,
    ]);
    ipcChannel.sendMessage('bash', [
      `echo doInstallCHD=true >> ~/emudeck/settings.sh`,
    ]);
    ipcChannel.sendMessage('bash', [
      `echo doInstallPowertools=${
        state.powerTools ? true : false
      } >> ~/emudeck/settings.sh`,
    ]);
    ipcChannel.sendMessage('bash', [
      `echo doInstallGyro=${
        state.GyroDSU ? true : false
      } >> ~/emudeck/settings.sh`,
    ]);

    //Aspect Ratios
    ipcChannel.sendMessage('bash', [
      `echo arSega=${state.ar.sega} >> ~/emudeck/settings.sh`,
    ]);
    ipcChannel.sendMessage('bash', [
      `echo arSnes=${state.ar.snes} >> ~/emudeck/settings.sh`,
    ]);
    ipcChannel.sendMessage('bash', [
      `echo arClassic3D=${state.ar.classic3d} >> ~/emudeck/settings.sh`,
    ]);
    ipcChannel.sendMessage('bash', [
      `echo arDolphin=${state.ar.dolphin} >> ~/emudeck/settings.sh`,
    ]);

    //Bezels
    ipcChannel.sendMessage('bash', [
      `echo RABezels=${state.bezels ? true : false} >> ~/emudeck/settings.sh`,
    ]);

    //AutoSave
    ipcChannel.sendMessage('bash', [
      `echo RAautoSave=false >> ~/emudeck/settings.sh`,
    ]);

    //old ar
    ipcChannel.sendMessage('bash', [
      `echo duckWide=false >> ~/emudeck/settings.sh`,
    ]);
    ipcChannel.sendMessage('bash', [
      `echo DolphinWide=false >> ~/emudeck/settings.sh`,
    ]);
    ipcChannel.sendMessage('bash', [
      `echo DreamcastWide=false >> ~/emudeck/settings.sh`,
    ]);
    ipcChannel.sendMessage('bash', [
      `echo BeetleWide=false >> ~/emudeck/settings.sh`,
    ]);
    ipcChannel.sendMessage('bash', [
      `echo pcsx2QTWide=false >> ~/emudeck/settings.sh`,
    ]);

    //Paths
    ipcChannel.sendMessage('bash', [
      `echo emulationPath=${storagePath}/Emulation >> ~/emudeck/settings.sh`,
    ]);
    //
    ipcChannel.sendMessage('bash', [
      `echo romsPath=${storagePath}/Emulation/roms >> ~/emudeck/settings.sh`,
    ]);
    ipcChannel.sendMessage('bash', [
      `echo toolsPath=${storagePath}/Emulation/tools >> ~/emudeck/settings.sh`,
    ]);
    ipcChannel.sendMessage('bash', [
      `echo biosPath=${storagePath}/Emulation/bios >> ~/emudeck/settings.sh`,
    ]);
    ipcChannel.sendMessage('bash', [
      `echo savesPath=${storagePath}/Emulation/saves >> ~/emudeck/settings.sh`,
    ]);
    ipcChannel.sendMessage('bash', [
      `echo storagePath=${storagePath}/Emulation/storage >> ~/emudeck/settings.sh`,
    ]);
    ipcChannel.sendMessage('bash', [
      `echo ESDEscrapData=${storagePath}/Emulation/tools/downloaded_media >> ~/emudeck/settings.sh`,
    ]);

    //Shaders
    ipcChannel.sendMessage('bash', [
      `echo RAHandHeldShader=${
        state.shaders.handhelds ? true : false
      } >> ~/emudeck/settings.sh`,
    ]);

    ipcChannel.sendMessage('bash', [
      `echo RAHandClassic2D=${
        state.shaders.classic ? true : false
      } >> ~/emudeck/settings.sh`,
    ]);

    //theme
    ipcChannel.sendMessage('bash', [
      `echo esdeTheme=\""${state.theme}\"" >> ~/emudeck/settings.sh`,
    ]);

    //AdvancedSettings
    ipcChannel.sendMessage('bash', [
      `echo doSelectWideScreen=false >> ~/emudeck/settings.sh`,
    ]);

    ipcChannel.sendMessage('bash', [
      `echo doRASignIn=false >> ~/emudeck/settings.sh`,
    ]);
    ipcChannel.sendMessage('bash', [
      `echo doRAEnable=false >> ~/emudeck/settings.sh`,
    ]);
    ipcChannel.sendMessage('bash', [
      `echo doESDEThemePicker=false >> ~/emudeck/settings.sh`,
    ]);
    ipcChannel.sendMessage('bash', [
      `echo doSelectEmulators=false >> ~/emudeck/settings.sh`,
    ]);
    ipcChannel.sendMessage('bash', [
      `echo doResetEmulators=false >> ~/emudeck/settings.sh`,
    ]);
    ipcChannel.sendMessage('bash', [
      `echo XemuWide=false >> ~/emudeck/settings.sh`,
    ]);

    //Achievements
    ipcChannel.sendMessage('bash', [
      `echo achievementsUser=${state.achievements.user} >> ~/emudeck/settings.sh`,
    ]);

    ipcChannel.sendMessage('bash', [
      `echo achievementsPass=${state.achievements.pass} >> ~/emudeck/settings.sh`,
    ]);
    ipcChannel.sendMessage('bash', [
      `echo achievementsHardcore=${state.achievements.hardcore} >> ~/emudeck/settings.sh`,
    ]);

    //CloudSync
    ipcChannel.sendMessage('bash', [
      `echo doSetupSaveSync=${
        state.cloudSync ? true : false
      } >> ~/emudeck/settings.sh`,
    ]);

    //Installation
    ipcChannel.sendMessage('bash', [
      `bash ~/.config/EmuDeck/backend/setup.sh ${branch} false`,
    ]);

    ipcChannel.sendMessage('emudeck', [
      `finish|||checkForFile ~/.config/EmuDeck/.ui-finished delete && echo 'Starting...' > ~/.config/EmuDeck/msg.log && printf "\ec" && echo true`,
    ]);

    ipcChannel.once('finish', (message) => {
      console.log({ message });
      let stdout = message.stdout;
      if (stdout.includes('true')) {
        setStatePage({ ...statePage, disabledNext: false });
      }
    });
  }, [second]);

  const openSRM = () => {
    ipcChannel.sendMessage('bash', [
      `zenity --question --width 450 --title "Close Steam/Steam Input?" --text "$(printf "<b>Exit Steam to launch Steam Rom Manager? </b>\n\n To add your Emulators and EmulationStation-DE to steam hit Preview, then Generate App List, then wait for the images to download\n\nWhen you are happy with your image choices hit Save App List and wait for it to say it's completed.\n\nDesktop controls will temporarily revert to touch/trackpad/L2/R2")" && (kill -15 $(pidof steam) & ${storagePath}/Emulation/tools/srm/Steam-ROM-Manager.AppImage)`,
    ]);

    setTimeout(() => {
      window.close();
    }, 5000);
  };

  const close = () => {
    window.close();
  };

  return (
    <End
      isGameMode={isGameMode}
      onClick={openSRM}
      onClose={close}
      data={data}
      disabledNext={disabledNext}
      disabledBack={disabledBack}
    />
  );
};

export default EndPage;
