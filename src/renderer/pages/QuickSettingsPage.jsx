import { useTranslation } from 'react-i18next';
import React, { useEffect, useState, useContext, useRef } from 'react';
import { GlobalContext } from 'context/globalContext';
import Wrapper from 'components/molecules/Wrapper/Wrapper';

import Header from 'components/organisms/Header/Header';
import Footer from 'components/organisms/Footer/Footer';

import Settings from 'components/organisms/Wrappers/Settings';

function QuickSettingsPage() {
  const { t, i18n } = useTranslation();
  const ipcChannel = window.electron.ipcRenderer;
  const { state, setState } = useContext(GlobalContext);
  const { ar, shaders, bezels } = state;
  const json = JSON.stringify(state);
  const [statePage, setStatePage] = useState({
    disabledNext: false,
    disabledBack: false,
    notificationText: '',
    showNotification: false,
    dom: undefined,
  });
  const { disabledBack, notificationText, showNotification, dom } = statePage;

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

  const onClickBezel = (arStatus) => {
    setState({
      ...state,
      bezels: arStatus,
    });

    let functionBezel;

    arStatus
      ? (functionBezel = 'RetroArch_bezelOnAll')
      : (functionBezel = 'RetroArch_bezelOffAll');

    ipcChannel.sendMessage('emudeck', [`bezels|||${functionBezel}`]);
    ipcChannel.once('bezels', () => {
      notificationShow(`🎉 ${t('QuickSettingsPage.notifBezels')}`);
    });
  };
  const onClickCloudSync = (cloudStatus) => {
    setState({
      ...state,
      cloudSyncStatus: cloudStatus,
    });

    ipcChannel.sendMessage('emudeck', [
      `cloudSync|||cloud_sync_toggle ${cloudStatus}`,
    ]);
    ipcChannel.once('cloudSync', () => {
      notificationShow(`🎉 ${t('QuickSettingsPage.notifCloudSync')}`);
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
      case 32:
        ipcChannel.sendMessage('emudeck', [
          'sega32|||RetroArch_mastersystem_ar32 && RetroArch_genesis_ar32  && RetroArch_segacd_ar32 && RetroArch_sega32x_ar32',
        ]);
        ipcChannel.once('sega32', () => {
          notificationShow(`🎉 ${t('QuickSettingsPage.nofisSegaAR')}`);
        });
        break;
      default: // 43
        ipcChannel.sendMessage('emudeck', [
          'sega43|||RetroArch_mastersystem_ar43 && RetroArch_genesis_ar43  && RetroArch_segacd_ar43 && RetroArch_sega32x_ar43',
        ]);
        ipcChannel.once('sega43', () => {
          notificationShow(`🎉 ${t('QuickSettingsPage.nofisSegaAR')}`);
        });
        if (bezels === true) {
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
      case 87:
        ipcChannel.sendMessage('emudeck', [
          'snes87|||RetroArch_snes_ar87 && RetroArch_nes_ar87',
        ]);
        ipcChannel.once('snes87', () => {
          notificationShow(`🎉 ${t('QuickSettingsPage.notifSNESRatio')}`);
        });
        if (bezels === true) {
          ipcChannel.sendMessage('emudeck', [
            'snes87Bezels|||RetroArch_snes_bezelOn && RetroArch_snes_ar87 && RetroArch_nes_ar87',
          ]);
        }
        break;
      case 32:
        ipcChannel.sendMessage('emudeck', [
          'snes32|||RetroArch_snes_ar32 && RetroArch_nes_ar32',
        ]);
        ipcChannel.once('snes32', () => {
          notificationShow(`🎉 ${t('QuickSettingsPage.notifSNESRatio')}`);
        });
        break;
      default: // 43
        ipcChannel.sendMessage('emudeck', [
          'snes43|||RetroArch_snes_ar43 && RetroArch_nes_ar43',
        ]);
        ipcChannel.once('snes43', () => {
          notificationShow(`🎉 ${t('QuickSettingsPage.notifSNESRatio')}`);
        });
        if (bezels === true) {
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
      case 169:
        ipcChannel.sendMessage('emudeck', [
          '3d169|||RetroArch_Beetle_PSX_HW_wideScreenOn && DuckStation_wideScreenOn && RetroArch_Flycast_wideScreenOn && Xemu_wideScreenOn && RetroArch_dreamcast_bezelOff && RetroArch_psx_bezelOff',
        ]);
        ipcChannel.once('3d169', () => {
          notificationShow(`🎉 ${t('QuickSettingsPage.nofif3DAR')}`);
        });
        break;
      default: // 43
        ipcChannel.sendMessage('emudeck', [
          '3d43|||RetroArch_Flycast_wideScreenOff && RetroArch_Beetle_PSX_HW_wideScreenOff && DuckStation_wideScreenOff && Xemu_wideScreenOff',
        ]);
        ipcChannel.once('3d43', () => {
          notificationShow(`🎉 ${t('QuickSettingsPage.nofif3DAR')}`);
        });
        if (bezels === true) {
          ipcChannel.sendMessage('emudeck', [
            '3d43Bezels|||RetroArch_dreamcast_bezelOn && RetroArch_psx_bezelOn',
          ]);
          ipcChannel.once('3d43Bezels', () => {
            notificationShow(`🎉 ${t('QuickSettingsPage.nofif3DAR')}`);
          });
        }
        break;
    }
  };
  const onClickGC = (arStatus) => {
    setState({
      ...state,
      ar: {
        ...ar,
        dolphin: arStatus,
      },
    });
    if (arStatus === '169') {
      ipcChannel.sendMessage('emudeck', ['dolphin|||Dolphin_wideScreenOn']);
      ipcChannel.once('dolphin', () => {
        notificationShow(`🎉 ${t('QuickSettingsPage.nofifDolphinAR')}`);
      });
    } else {
      ipcChannel.sendMessage('emudeck', ['dolphin|||Dolphin_wideScreenOff']);
      ipcChannel.once('dolphin', () => {
        notificationShow(`🎉 ${t('QuickSettingsPage.nofifDolphinAR')}`);
      });
    }
  };
  const onClickCRT = (arStatus) => {
    setState({
      ...state,
      shaders: {
        ...shaders,
        classic: arStatus,
      },
    });

    let functionCRT;

    arStatus
      ? (functionCRT = 'RetroArch_CRTshaderOnAll')
      : (functionCRT = 'RetroArch_CRTshaderOffAll');

    ipcChannel.sendMessage('emudeck', [`CRT|||${functionCRT}`]);
    ipcChannel.once('CRT', () => {
      notificationShow(`🎉 ${t('QuickSettingsPage.nofifCRTShader')}`);
    });
  };
  const onClickCRT3D = (arStatus) => {
    setState({
      ...state,
      shaders: {
        ...shaders,
        classic3d: arStatus,
      },
    });

    let functionCRT3D;

    arStatus
      ? (functionCRT3D = 'RetroArch_3DCRTshaderOnAll')
      : (functionCRT3D = 'RetroArch_3DCRTshaderOffAll');

    ipcChannel.sendMessage('emudeck', [`CRT3D|||${functionCRT3D}`]);
    ipcChannel.once('CRT3D', () => {
      notificationShow(`🎉 ${t('QuickSettingsPage.nofif3DCRTShader')}`);
    });
  };
  const onClickLCD = (arStatus) => {
    setState({
      ...state,
      shaders: {
        ...shaders,
        handhelds: arStatus,
      },
    });
    let functionLCD;

    arStatus
      ? (functionLCD = 'RetroArch_MATshadersOnAll')
      : (functionLCD = 'RetroArch_MATshadersOffAll');

    ipcChannel.sendMessage('emudeck', [`LCD|||${functionLCD}`]);
    ipcChannel.once('LCD', () => {
      notificationShow(`🎉 ${t('QuickSettingsPage.nofifLCDShader')}`);
    });
  };

  const autoSaveSet = (status) => {
    setState({
      ...state,
      autosave: status,
    });

    let functionAutoSave;
    status
      ? (functionAutoSave = 'RetroArch_autoSaveOn')
      : (functionAutoSave = 'RetroArch_autoSaveOff');

    ipcChannel.sendMessage('emudeck', [`autoSave|||${functionAutoSave}`]);
    ipcChannel.once('autoSave', () => {
      notificationShow(`🎉 ${t('QuickSettingsPage.nofifAutosave')}`);
    });
  };

  const controllerLayoutSet = (value) => {
    setState({
      ...state,
      controllerLayout: value,
    });

    let functionAutoSave;
    value === 'abxy'
      ? (functionAutoSave = 'controllerLayout_ABXY')
      : (functionAutoSave = 'controllerLayout_BAYX');

    ipcChannel.sendMessage('emudeck', [
      `controllerLayout|||${functionAutoSave}`,
    ]);
    ipcChannel.once('controllerLayout', () => {
      notificationShow(`🎉 ${t('QuickSettingsPage.nofifController')}`);
    });
  };

  useEffect(() => {
    localStorage.setItem('settings_emudeck', json);
  }, [state]);

  const onClickBoot = (status) => {
    setState({
      ...state,
      gamemode: status,
    });

    let functionBootMode;
    status === true
      ? (functionBootMode = 'game_mode_enable')
      : (functionBootMode = 'game_mode_disable');

    ipcChannel.sendMessage('emudeck', [`bootMode|||${functionBootMode}`]);
    ipcChannel.once('bootMode', () => {
      notificationShow(`🎉 ${t('QuickSettingsPage.nofifBoot')}`);
    });
  };

  return (
    <Wrapper>
      <Header title={t('QuickSettingsPage.title')} />
      <p className="lead">{t('QuickSettingsPage.description')}</p>
      <Settings
        showNotification={showNotification}
        notificationText={notificationText}
        onClickCloudSync={onClickCloudSync}
        onClickBezel={onClickBezel}
        onClickSega={onClickSega}
        onClickSNES={onClickSNES}
        onClick3D={onClick3D}
        onClickGC={onClickGC}
        onClickCRT={onClickCRT}
        onClickCRT3D={onClickCRT3D}
        onClickLCD={onClickLCD}
        onClickAutoSave={autoSaveSet}
        onClickControllerLayoutSet={controllerLayoutSet}
        onClickBoot={onClickBoot}
      />
      <Footer disabledNext disabledBack={disabledBack} />
    </Wrapper>
  );
}

export default QuickSettingsPage;
