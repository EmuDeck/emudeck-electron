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
    if (system != 'darwin') {
      // Mac testing
      if (storageName === 'Custom') {
        ipcChannel.sendMessage('bash', [
          'customLocation|||customLocation >> ~/emudeck/electron.log',
        ]);

        ipcChannel.on('customLocation', (stdout) => {
          stdout = stdout.replace('\n', '');
          setState({
            ...state,
            storage: storageName,
            storagePath: stdout,
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
    if (system != 'darwin') {
      // Mac testing
      ipcChannel.sendMessage('bash', [
        'source ~/emudeck/functions/all.sh >> ~/emudeck/electron.log',
      ]);

      ipcChannel.sendMessage('bash', [
        'SDCardValid|||testLocationValid "SD" $(getSDPath) >> ~/emudeck/electron.log',
      ]);

      ipcChannel.on('SDCardValid', (stdout) => {
        stdout = stdout.replace('\n', '');
        stdout.includes('Valid') ? (stdout = true) : (stdout = false);
        setStatePage({
          ...statePage,
          sdCardValid: stdout,
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
      ipcChannel.sendMessage('bash', [
        'SDCardName|||getSDPath >> ~/emudeck/electron.log',
      ]);

      ipcChannel.on('SDCardName', (stdout) => {
        stdout = stdout.replace('\n', '');
        if (system === 'darwin') {
          stdout = 'Test Mac';
        }
        setStatePage({
          ...statePage,
          sdCardName: stdout,
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
