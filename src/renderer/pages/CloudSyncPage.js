import React, { useEffect, useState, useContext } from 'react';
import { GlobalContext } from 'context/globalContext';

import CloudSync from 'components/organisms/Wrappers/CloudSync.js';

const CloudSyncPage = () => {
  const { state, setState } = useContext(GlobalContext);
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
    ipcChannel.sendMessage('bash', [
      `create-icon|||echo "#!/usr/bin/env xdg-open
       [Desktop Entry]
       Name=EmuDeck SaveBackup
       Exec=source $HOME/.config/EmuDeck/backend/functions/all.sh && rclone_setup
       Icon=steamdeck-gaming-return
       Terminal=true
       Type=Application
       StartupNotify=false" > $HOME/Desktop/EmuDeckSaveBackup.desktop && chmod +x $HOME/Desktop/EmuDeckSaveBackup.desktop"`,
    ]);
    ipcChannel.sendMessage('bash', [
      `zenity --info --width=400 --text="Go to your Desktop and open the new EmuDeck SaveBackup icon.`,
    ]);
  };

  useEffect(() => {
    ipcChannel.sendMessage('emudeck', [
      `save-setting|||setSetting rclone_provider ${cloudSync}`,
    ]);
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
