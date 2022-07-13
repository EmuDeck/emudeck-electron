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
  const { mode, system } = state;
  const storageSet = (storageName) => {
    if (system !== 'darwin') {
      // Mac testing
      if (storageName === 'Custom') {
        ipcChannel.sendMessage('emudeck', ['customLocation|||customLocation']);

        ipcChannel.on('customLocation', (message) => {
          console.log(message);
          stdout = message.stdout.replace('\n', '');
          setState({
            ...state,
            storage: storageName,
            storagePath: stdout,
            debugText: message,
          });
        });
      } else if (storageName === 'SD-Card') {
        setState({
          ...state,
          storage: storageName,
          storagePath: sdCardName,
        });
      } else {
        setState({
          ...state,
          storage: storageName,
          storagePath: '~/',
        });
      }
    } else {
      setState({
        ...state,
        storage: storageName,
        storagePath: '~/',
      });
    }
  };
  //Enabling button when changing the global state only if we have a device selected
  useEffect(() => {
    if (storage != '') {
      setStatePage({ ...statePage, disabledNext: false });
    }
  }, [state]); // <-- here put the parameter to listen

  //Do we have a valid SD Card?
  useEffect(() => {
    if (system !== 'darwin') {
      ipcChannel.sendMessage('emudeck', [
        'SDCardValid|||testLocationValid "SD" "/run/media/mmcblk0p1"',
      ]);

      ipcChannel.on('SDCardValid', (message) => {
        console.log(message);
        stdout = message.stdout.replace('\n', '');
        stdout.includes('Valid') ? (stdout = true) : (stdout = false);
        setStatePage({
          ...statePage,
          sdCardValid: stdout,
        });
        setState({
          debugText: message,
        });
      });
    } else {
      setStatePage({
        ...statePage,
        sdCardValid: true,
        sdCardName: 'Fake SD Card',
      });
    }
  }, []);

  //Let's get the SD Card name
  useEffect(() => {
    if (sdCardValid === true) {
      ipcChannel.sendMessage('emudeck', ['SDCardName|||getSDPath']);

      ipcChannel.on('SDCardName', (message) => {
        console.log(message);
        stdout = message.stdout.replace('\n', '');
        if (system === 'darwin') {
          stdout = 'Test Mac';
        }
        setStatePage({
          ...statePage,
          sdCardName: stdout,
        });
        setState({
          debugText: message,
        });
      });
    }
  }, [sdCardValid]);

  const onClickGetCustom = () => {};

  return (
    <RomStorage
      data={data}
      sdCardValid={sdCardValid}
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
