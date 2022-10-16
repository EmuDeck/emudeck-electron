import React, { useEffect, useState, useContext } from 'react';
import { GlobalContext } from 'context/globalContext';

import Uninstall from 'components/organisms/Wrappers/Uninstall.js';

const UninstallPage = () => {
  const { state, setState } = useContext(GlobalContext);

  const [statePage, setStatePage] = useState({
    disabledNext: false,
    disabledBack: false,
  });
  const { disabledNext, disabledBack } = statePage;

  const ipcChannel = window.electron.ipcRenderer;

  const uninstall = (data) => {
    alert(
      'Open Konsole and paste this code: bash ~/.config/EmuDeck/backend/uninstall.sh'
    );
    // ipcChannel.sendMessage('bash', [
    //   'bash ~/.config/EmuDeck/backend/uninstall.sh',
    // ]);
    window.close();
  };

  return (
    <Uninstall
      disabledNext={disabledNext}
      disabledBack={disabledBack}
      onClick={uninstall}
    />
  );
};

export default UninstallPage;
