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

    ipcChannel.sendMessage('bash', [
      `create-icon|||echo "#!/usr/bin/env xdg-open
       [Desktop Entry]
       Name=EmuDeck SaveSync
       Exec=chmod +x $HOME/emudeck/backend/tools/savesync.sh && $HOME/emudeck/backend/tools/savesync.sh
       Icon=steamdeck-gaming-return
       Terminal=true
       Type=Application
       StartupNotify=false" > $HOME/Desktop/EmuDeckSaveSync.desktop && chmod +x $HOME/Desktop/EmuDeckSaveSync.desktop`,
    ]);
  };

  useEffect(() => {
    ipcChannel.sendMessage('bash', [
      `save-setting|||echo ${cloudSync} > $HOME/emudeck/.cloudprovider`,
    ]);
  }, [cloudSync]);

  return (
    <CloudSync
      data={data}
      onClick={cloudSyncSet}
      disabledNext={disabledNext}
      disabledBack={disabledBack}
    />
  );
};

export default CloudSyncPage;
