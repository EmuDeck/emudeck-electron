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
    sdCardValid: null,
    sdCardName: undefined,
  });
  const { disabledNext, disabledBack, data, sdCardValid, sdCardName } =
    statePage;
  const { mode, system } = state;

  const storageSet = (storageName) => {
    if (storageName === 'Custom') {
      ipcChannel.sendMessage('emudeck', ['customLocation|||customLocation']);

      ipcChannel.once('customLocation', (message) => {
        console.log(message);
        let stdout = message.stdout.replace('\n', '');
        stdout = `${stdout}/`;
        setState({
          ...state,
          storage: storageName,
          storagePath: stdout,
          debugText: message,
        });
      });
    } else if (storageName === 'SD-Card') {
      let sdCardPath = sdCardName;
      setState({
        ...state,
        storage: storageName,
        storagePath: sdCardPath,
      });
    } else {
      setState({
        ...state,
        storage: storageName,
        storagePath: '$HOME',
      });
    }
  };
  //Enabling button when changing the global state only if we have a device selected
  useEffect(() => {
    console.log({ storage });
    if (storage != null) {
      console.log('Storage found, enable button');
      setStatePage({ ...statePage, disabledNext: false });
    }
  }, [state]); // <-- here put the parameter to listen

  //Do we have a valid SD Card?
  useEffect(() => {
    checkSDValid();
  }, []);

  //Let's get the SD Card name
  // useEffect(() => {
  //   getSDName();
  // }, [sdCardValid]);

  const checkSDValid = () => {
    ipcChannel.sendMessage('emudeck', [
      'SDCardValid|||testLocationValid "SD" "$(getSDPath)"',
    ]);

    ipcChannel.once('SDCardValid', (message) => {
      console.log(message);
      let stdout = message.stdout.replace('\n', '');
      let status;
      stdout.includes('Valid') ? (status = true) : (status = false);
      if (status === true) {
        getSDName();
      } else {
        setStatePage({
          ...statePage,
          sdCardName: null,
          sdCardValid: null,
        });
      }
    });
  };

  const getSDName = () => {
    ipcChannel.sendMessage('emudeck', ['SDCardName|||getSDPath']);
    ipcChannel.once('SDCardName', (message) => {
      console.log(message);
      let stdout = message.stdout.replace('\n', '');
      if (stdout == '') {
        stdout = null;
      }
      setStatePage({
        ...statePage,
        sdCardName: stdout,
        sdCardValid: stdout == null ? false : true,
      });
      setState({
        ...state,
      });
    });
  };

  const onClickGetCustom = () => {};

  return (
    <RomStorage
      data={data}
      sdCardValid={sdCardValid}
      reloadSDcard={checkSDValid}
      sdCardName={sdCardName}
      onClick={storageSet}
      onClickGetCustom={onClickGetCustom}
      disabledNext={disabledNext}
      disabledBack={disabledBack}
      next={mode === 'easy' ? 'end' : 'device-selector'}
    />
  );
};

export default RomStoragePage;
