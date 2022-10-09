import React, { useEffect, useState, useContext } from 'react';
import { GlobalContext } from 'context/globalContext';

import Settings from 'components/organisms/Wrappers/Settings.js';

const SettingsPage = () => {
  const ipcChannel = window.electron.ipcRenderer;
  const { state, setState } = useContext(GlobalContext);
  const { ar, shaders, bezels } = state;
  const [statePage, setStatePage] = useState({
    disabledNext: false,
    disabledBack: false,
    notificationText: '',
    showNotification: false,
  });
  const {
    disabledNext,
    disabledBack,
    data,
    notificationText,
    showNotification,
  } = statePage;
  const onClickBezel = (arStatus) => {
    setState({
      ...state,
      bezels: arStatus,
    });
    ipcChannel.sendMessage('emudeck', ['bezels|||RetroArch_setBezels']);
    ipcChannel.once('bezels', (message) => {
      console.log(message);
      notificationShow('🎉 Bezels updated!');
    });
  };
  const onClickSega = (arStatus) => {
    setState({
      ...state,
      ar: {
        ...ar,
        sega: arStatus,
      },
    });

    switch (arStatus) {
      case '32':
        ipcChannel.sendMessage('emudeck', [
          'sega32|||RetroArch_mastersystem_ar32 && RetroArch_genesis_ar32  && RetroArch_segacd_ar32 && RetroArch_sega32x_ar32',
        ]);
        ipcChannel.once('sega32', (message) => {
          console.log(message);
          notificationShow('🎉 Sega Aspect Ratio updated!');
        });
        break;
      case '43':
        ipcChannel.sendMessage('emudeck', [
          'sega43|||RetroArch_mastersystem_ar43 && RetroArch_genesis_ar43  && RetroArch_segacd_ar43 && RetroArch_sega32x_ar43',
        ]);
        ipcChannel.once('sega43', (message) => {
          console.log(message);
          notificationShow('🎉 Sega Aspect Ratio updated!');
        });
        if (bezels == true) {
          ipcChannel.sendMessage('emudeck', [
            'sega43Bezels|||RetroArch_mastersystem_bezelOn && RetroArch_genesis_bezelOn && RetroArch_segacd_bezelOn && RetroArch_sega32x_bezelOn',
          ]);
        }
        break;
    }
  };
  const onClickSNES = (arStatus) => {
    setState({
      ...state,
      ar: {
        ...ar,
        snes: arStatus,
      },
    });
    switch (arStatus) {
      case '87':
        ipcChannel.sendMessage('emudeck', [
          'snes87|||RetroArch_snes_ar87 && RetroArch_nes_ar87',
        ]);
        ipcChannel.once('snes87', (message) => {
          console.log(message);
          notificationShow('🎉 SNES Aspect Ratio updated!');
        });
        if (bezels == true) {
          ipcChannel.sendMessage('emudeck', [
            'snes87Bezels|||RetroArch_snes_bezelOn',
          ]);
        }
        break;
      case '32':
        ipcChannel.sendMessage('emudeck', [
          'snes32|||RetroArch_snes_ar32 && RetroArch_nes_ar32',
        ]);
        ipcChannel.once('snes32', (message) => {
          console.log(message);
          notificationShow('🎉 SNES Aspect Ratio updated!');
        });
        break;
      case '43':
        ipcChannel.sendMessage('emudeck', [
          'snes43|||RetroArch_snes_ar43 && RetroArch_nes_ar43',
        ]);
        ipcChannel.once('snes43', (message) => {
          console.log(message);
          notificationShow('🎉 SNES Aspect Ratio updated!');
        });
        if (bezels == true) {
          ipcChannel.sendMessage('emudeck', [
            'snes43Bezels|||RetroArch_snes_bezelOn',
          ]);
        }
        break;
    }
  };
  const onClick3D = (arStatus) => {
    setState({
      ...state,
      ar: {
        ...ar,
        classic3d: arStatus,
      },
    });
    switch (arStatus) {
      case '169':
        ipcChannel.sendMessage('emudeck', [
          '3d169|||RetroArch_Beetle_PSX_HW_wideScreenOn && DuckStation_wideScreenOn && RetroArch_Flycast_wideScreenOn && Xemu_wideScreenOn && RetroArch_Flycast_bezelOff && RetroArch_Beetle_PSX_HW_bezelOff',
        ]);
        break;
      case '43':
        ipcChannel.sendMessage('emudeck', [
          '3d43|||RetroArch_Flycast_wideScreenOff && RetroArch_Beetle_PSX_HW_wideScreenOff && DuckStation_wideScreenOff && Xemu_wideScreenOff',
        ]);
        if (bezels == true) {
          ipcChannel.sendMessage('emudeck', [
            '3d43Bezels|||RetroArch_Flycast_bezelOn && RetroArch_Beetle_PSX_HW_bezelOn',
          ]);
        }
        break;
    }
    notificationShow('🎉 3D Aspect Ratio updated!');
  };
  const onClickGC = (arStatus) => {
    setState({
      ...state,
      ar: {
        ...ar,
        dolphin: arStatus,
      },
    });
    if (arStatus == '169') {
      ipcChannel.sendMessage('emudeck', ['dolphin|||Dolphin_wideScreenOn']);
    } else {
      ipcChannel.sendMessage('emudeck', ['dolphin|||Dolphin_wideScreenOff']);
    }
    notificationShow('🎉 Dolphin Aspect Ratio updated!');
  };
  const onClickCRT = (arStatus) => {
    setState({
      ...state,
      shaders: {
        ...shaders,
        classic: arStatus,
      },
    });
    ipcChannel.sendMessage('emudeck', ['CRT|||RetroArch_setShadersCRT']);
    notificationShow('🎉 CRT Shader updated!');
  };
  const onClickLCD = (arStatus) => {
    setState({
      ...state,
      shaders: {
        ...shaders,
        handhelds: arStatus,
      },
    });
    ipcChannel.sendMessage('emudeck', ['LCD|||RetroArch_setShadersMAT']);
    notificationShow('🎉 LCD Shader updated!');
  };

  const notificationShow = (text) => {
    setStatePage({
      ...statePage,
      notificationText: text,
      showNotification: true,
    });

    if (showNotification === true) {
      setTimeout(() => {
        setStatePage({
          ...statePage,
          showNotification: false,
        });
      }, 2000);
    }
  };

  return (
    <Settings
      showNotification={showNotification}
      notificationText={notificationText}
      onClickBezel={onClickBezel}
      onClickSega={onClickSega}
      onClickSNES={onClickSNES}
      onClick3D={onClick3D}
      onClickGC={onClickGC}
      onClickCRT={onClickCRT}
      onClickLCD={onClickLCD}
      disabledNext={true}
      disabledBack={disabledBack}
    />
  );
};

export default SettingsPage;
