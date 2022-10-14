import React, { useEffect, useState, useContext } from 'react';
import { GlobalContext } from 'context/globalContext';

import CloudSync from 'components/organisms/Wrappers/CloudSync.js';

const CloudSyncPage = () => {
  const { state, setState } = useContext(GlobalContext);
  let json = JSON.stringify(state);
  const { cloudSync } = state;
  const [statePage, setStatePage] = useState({
    disabledNext: false,
    disabledBack: false,
    data: '',
  });
  const { disabledNext, disabledBack, data } = statePage;

  const ipcChannel = window.electron.ipcRenderer;

  const cloudSyncSet = (item) => {
    setState({
      ...state,
      cloudSync: item,
    });
  };

  // const createDesktopIcon = () => {
  //   ipcChannel.sendMessage('emudeck', [`save-setting|||rclone_setup`]);
  // };

  const createDesktopIcon = () => {
    ipcChannel.sendMessage('emudeck', [
      `createDesktop|||createDesktopShortcut "$HOME/Desktop/SaveBackup.desktop" "EmuDeck SaveBackup" "source $HOME/.config/EmuDeck/backend/functions/all.sh && rclone_setup" true`,
    ]);

    ipcChannel.sendMessage('bash', [
      `zenity --info --width=400 --text="Go to your Desktop and open the new EmuDeck SaveBackup icon.`,
    ]);
  };

  useEffect(() => {
    ipcChannel.sendMessage('emudeck', [
      `save-setting|||setSetting rclone_provider ${cloudSync}`,
    ]);
    localStorage.setItem('settings_emudeck', json);
  }, [cloudSync]);

  return (
    <CloudSync
      data={data}
      onClick={cloudSyncSet}
      onClickInstall={createDesktopIcon}
      disabledNext={disabledNext}
      disabledBack={disabledBack}
    />
  );
};

export default CloudSyncPage;
