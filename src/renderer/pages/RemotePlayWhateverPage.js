import React, { useEffect, useState, useContext } from 'react';
import { GlobalContext } from 'context/globalContext';

import RemotePlayWhatever from 'components/organisms/Wrappers/RemotePlayWhatever.js';

const RemotePlayWhateverPage = () => {
  const { state, setState } = useContext(GlobalContext);

  const [statePage, setStatePage] = useState({
    disabledNext: false,
    disabledBack: false,
    showNotification: false,
    notificationText: '',
  });
  const { disabledNext, disabledBack, showNotification, notificationText } =
    statePage;

  const ipcChannel = window.electron.ipcRenderer;

  const installRPW = (data) => {
    ipcChannel.sendMessage('emudeck', [
      'RemotePlayWhatever|||RemotePlayWhatever_install',
    ]);

    notificationShow('🎉 RemotePlayWhatEver installed! Open SteamRomManager');
  };

  const openSRM = () => {
    ipcChannel.sendMessage('bash', [
      `zenity --question --width 450 --title \"Close Steam/Steam Input?\" --text \"Exit Steam to launch Steam Rom Manager? Desktop controls will temporarily revert to touch/trackpad/L2/R2\" && (kill -15 \$(pidof steam) && cp $HOME/emudeck/backend/configs/steam-rom-manager/userData/userConfigurationsRPW.json $HOME/.config/steam-rom-manager/userData/userConfigurations.json & ${storagePath}/Emulation/tools/srm/Steam-ROM-Manager.AppImage && cp $HOME/emudeck/backend/configs/steam-rom-manager/userData/userConfigurations.json $HOME/.config/steam-rom-manager/userData/userConfigurations.json)`,
    ]);
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
    <RemotePlayWhatever
      showNotification={showNotification}
      notificationText={notificationText}
      disabledNext={disabledNext}
      disabledBack={disabledBack}
      onClick={installRPW}
      onClickSRM={openSRM}
    />
  );
};

export default RemotePlayWhateverPage;
