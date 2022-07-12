import React, { useEffect, useState, useContext } from 'react';
import { GlobalContext } from 'context/globalContext';

import RomStorage from 'components/organisms/Wrappers/RomStorage.js';

const RomStoragePage = () => {
  const ipcChannel = window.electron.ipcRenderer;
  const { state, setState } = useContext(GlobalContext);
  const { storage, SDID } = state;
  const [statePage, setStatePage] = useState({
    disabledNext: true,
    disabledBack: false,
    data: '',
    sdCardValid: false,
    sdCardName: '',
  });
  const { disabledNext, disabledBack, data, sdCardValid, sdCardName } =
    statePage;
  const { mode } = state;
  const storageSet = (storageName) => {
    setState({
      ...state,
      storage: storageName,
    });
  };
  //Enabling button when changing the global state only if we have a device selected
  useEffect(() => {
    if (storage != '') {
      setStatePage({ ...statePage, disabledNext: false });
    }
  }, [state]); // <-- here put the parameter to listen

  //Do we have a valid SD Card?
  useEffect(() => {
    ipcChannel.sendMessage('bash', ['source ~/emudeck/functions/all.sh']);

    ipcChannel.sendMessage('bash', [
      'SDCardValid|||testLocationValid "SD" $(getSDPath)',
    ]);

    ipcChannel.on('SDCardValid', (stdout) => {
      stdout = stdout.replace('\n', '');
      stdout.includes('Valid') ? (stdout = true) : (stdout = false);
      setStatePage({
        ...statePage,
        sdCardValid: stdout,
      });
    });

    ipcChannel.sendMessage('bash', ['SDCardName|||getSDPath']);

    ipcChannel.on('SDCardName', (stdout) => {
      stdout = stdout.replace('\n', '');
      setStatePage({
        ...statePage,
        sdCardName: stdout,
      });
    });
  }, []);

  const getSDCardName = async () => {
    return 'deck';
  };
  return (
    <RomStorage
      data={data}
      sdCardValid={sdCardValid}
      sdCardName="/run/media/mmcblk0p1"
      onClick={storageSet}
      disabledNext={disabledNext}
      disabledBack={disabledBack}
      next={mode === 'easy' ? 'end' : 'device-selector'}
    />
  );
};

export default RomStoragePage;
