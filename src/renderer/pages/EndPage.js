import React, { useEffect, useState, useContext } from 'react';
import { GlobalContext } from 'context/globalContext';

import End from 'components/organisms/Wrappers/End.js';

const EndPage = () => {
  const { state, setState } = useContext(GlobalContext);
  const [statePage, setStatePage] = useState({
    disabledNext: true,
    disabledBack: true,
    data: '',
  });
  const { disabledNext, disabledBack, data } = statePage;
  const { second } = state;
  const ipcChannel = window.electron.ipcRenderer;
  //Saving the config
  useEffect(() => {
    setState({ ...state, second: true });
  }, []);

  useEffect(() => {
    //localStorage.setItem('settings_emudeck', JSON.stringify(state));
    let json = JSON.stringify(state);

    ipcChannel.sendMessage('bash', [
      `echo expert=${
        state.mode === 'expert' ? true : false
      } > ~/emudeck/settings.sh`,
    ]);

    //Setup Emus
    ipcChannel.sendMessage('bash', [
      `echo doSetupRA=${
        state.keepConfigEmus.ra.status ? false : true
      } >> ~/emudeck/settings.sh`,
    ]);
    ipcChannel.sendMessage('bash', [
      `echo doSetupDolphin=${
        state.keepConfigEmus.dolphin.status ? false : true
      } >> ~/emudeck/settings.sh`,
    ]);
    ipcChannel.sendMessage('bash', [
      `echo doSetupPCSX2=${
        state.keepConfigEmus.pcsx2.status ? false : true
      } >> ~/emudeck/settings.sh`,
    ]);
    ipcChannel.sendMessage('bash', [
      `echo doSetupRPCS3=${
        state.keepConfigEmus.rpcs3.status ? false : true
      } >> ~/emudeck/settings.sh`,
    ]);
    ipcChannel.sendMessage('bash', [
      `echo doSetupYuzu=${
        state.keepConfigEmus.yuzu.status ? false : true
      } >> ~/emudeck/settings.sh`,
    ]);
    ipcChannel.sendMessage('bash', [
      `echo doSetupCitra=${
        state.keepConfigEmus.citra.status ? false : true
      } >> ~/emudeck/settings.sh`,
    ]);
    ipcChannel.sendMessage('bash', [
      `echo doSetupDuck=${
        state.keepConfigEmus.duckstation.status ? false : true
      } >> ~/emudeck/settings.sh`,
    ]);
    ipcChannel.sendMessage('bash', [
      `echo doSetupCemu=${
        state.keepConfigEmus.cemu.status ? false : true
      } >> ~/emudeck/settings.sh`,
    ]);
    ipcChannel.sendMessage('bash', [
      `echo doSetupPrimeHacks=${
        state.keepConfigEmus.primehacks.status ? false : true
      } >> ~/emudeck/settings.sh`,
    ]);
    ipcChannel.sendMessage('bash', [
      `echo doSetupPPSSPP=${
        state.keepConfigEmus.ppsspp.status ? false : true
      } >> ~/emudeck/settings.sh`,
    ]);
    ipcChannel.sendMessage('bash', [
      `echo doSetupSRM=${
        state.keepConfigEmus.srm.status ? false : true
      } >> ~/emudeck/settings.sh`,
    ]);

    //Install Emus
    ipcChannel.sendMessage('bash', [
      `echo doInstallRA=${
        state.installEmus.ra.status ? false : true
      } >> ~/emudeck/settings.sh`,
    ]);
    ipcChannel.sendMessage('bash', [
      `echo doInstallDolphin=${
        state.installEmus.dolphin.status ? false : true
      } >> ~/emudeck/settings.sh`,
    ]);
    ipcChannel.sendMessage('bash', [
      `echo doInstallPCSX2=${
        state.installEmus.pcsx2.status ? false : true
      } >> ~/emudeck/settings.sh`,
    ]);
    ipcChannel.sendMessage('bash', [
      `echo doInstallRPCS3=${
        state.installEmus.rpcs3.status ? false : true
      } >> ~/emudeck/settings.sh`,
    ]);
    ipcChannel.sendMessage('bash', [
      `echo doInstallYuzu=${
        state.installEmus.yuzu.status ? false : true
      } >> ~/emudeck/settings.sh`,
    ]);
    ipcChannel.sendMessage('bash', [
      `echo doInstallCitra=${
        state.installEmus.citra.status ? false : true
      } >> ~/emudeck/settings.sh`,
    ]);
    ipcChannel.sendMessage('bash', [
      `echo doInstallDuck=${
        state.installEmus.duckstation.status ? false : true
      } >> ~/emudeck/settings.sh`,
    ]);
    ipcChannel.sendMessage('bash', [
      `echo doInstallCemu=${
        state.installEmus.cemu.status ? false : true
      } >> ~/emudeck/settings.sh`,
    ]);
    ipcChannel.sendMessage('bash', [
      `echo doInstallPrimeHacks=${
        state.installEmus.primehacks.status ? false : true
      } >> ~/emudeck/settings.sh`,
    ]);
    ipcChannel.sendMessage('bash', [
      `echo doInstallPPSSPP=${
        state.installEmus.ppsspp.status ? false : true
      } >> ~/emudeck/settings.sh`,
    ]);
    ipcChannel.sendMessage('bash', [
      `echo doInstallSRM=${
        state.installEmus.srm.status ? false : true
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

    //Paths
    ipcChannel.sendMessage('bash', [
      `echo emulationPath=${
        state.storage == 'SD-Card'
          ? '/run/media/mmcblk0p1/Emulation/'
          : '~/Emulation/'
      } >> ~/emudeck/settings.sh`,
    ]);
    ipcChannel.sendMessage('bash', [
      `echo toolsPath=${
        state.storage == 'SD-Card'
          ? '/run/media/mmcblk0p1/Emulation/tools/'
          : '~/Emulation/tools/'
      } >> ~/emudeck/settings.sh`,
    ]);
    ipcChannel.sendMessage('bash', [
      `echo biosPath=${
        state.storage == 'SD-Card'
          ? '/run/media/mmcblk0p1/Emulation/bios/'
          : '~/Emulation/bios/'
      } >> ~/emudeck/settings.sh`,
    ]);
    ipcChannel.sendMessage('bash', [
      `echo savesPath=${
        state.storage == 'SD-Card'
          ? '/run/media/mmcblk0p1/Emulation/saves/'
          : '~/Emulation/saves/'
      } >> ~/emudeck/settings.sh`,
    ]);
    ipcChannel.sendMessage('bash', [
      `echo storagePath=${
        state.storage == 'SD-Card'
          ? '/run/media/mmcblk0p1/Emulation/storage/'
          : '~/Emulation/storage/'
      } >> ~/emudeck/settings.sh`,
    ]);

    ipcChannel.sendMessage('bash', [
      `echo ESDEscrapData=${
        state.storage == 'SD-Card'
          ? '/run/media/mmcblk0p1/Emulation/tools/downloaded_media'
          : '~/Emulation/tools/downloaded_media'
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
      `echo doSelectWideScreen=false >> ~/emudeck/settings.sh`,
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
  }, [second]);

  return (
    <End data={data} disabledNext={disabledNext} disabledBack={disabledBack} />
  );
};

export default EndPage;
