import React, { useEffect, useState, useContext } from 'react';
import { GlobalContext } from 'context/globalContext';

import RomStorage from 'components/organisms/Wrappers/RomStorage.js';

const RomStoragePage = () => {
  const ipcChannel = window.electron.ipcRenderer;
  const { state, setState } = useContext(GlobalContext);
  const { storage, SDID } = state;
  const [statePage, setStatePage] = useState({
    disabledNext: storage == null ? true : false,
    disabledBack: false,
    data: '',
    sdCardValid: null,
    sdCardName: undefined,
    status: undefined,
  });
  const { disabledNext, disabledBack, data, sdCardValid, sdCardName, status } =
    statePage;
  const { mode, system, storagePath } = state;

  const storageSet = (storageName) => {
    //We prevent the function to continue if the custom location testing is still in progress
    if (status == 'testing') {
      return;
    }

    if (storageName === 'Custom') {
      ipcChannel.sendMessage('emudeck', ['customLocation|||customLocation']);

      ipcChannel.once('customLocation', (message) => {
        let stdout = message.stdout.replace('\n', '');

        setStatePage({
          ...statePage,
          disabledNext: true,
          status: 'testing',
        });
        setState({
          ...state,
          storage: storageName,
          storagePath: stdout,
        });
        //is it valid?

        ipcChannel.sendMessage('emudeck', [
          `testLocation|||sleep 1 && testLocationValid "custom" "${stdout}"`,
        ]);

        ipcChannel.once('testLocation', (message) => {
          let stdout = message.stdout.replace('\n', '');
          console.log({ stdout });
          let status;
          stdout.includes('Valid') ? (status = true) : (status = false);
          console.log({ status });
          if (status == true) {
            setStatePage({
              ...statePage,
              disabledNext: false,
              status: undefined,
            });
          } else {
            alert('Non writable directory selected, please choose another.');
            setStatePage({
              ...statePage,
              disabledNext: true,
              status: undefined,
            });
            setState({
              ...state,
              storage: null,
              storagePath: null,
            });
          }
        });
      });
    } else if (storageName === 'SD-Card') {
      let sdCardPath = sdCardName;
      setState({
        ...state,
        storage: storageName,
        storagePath: sdCardPath,
      });
      setStatePage({
        ...statePage,
        disabledNext: false,
      });
    } else {
      setState({
        ...state,
        storage: storageName,
        storagePath: '$HOME',
      });
      setStatePage({
        ...statePage,
        disabledNext: false,
      });
    }
  };

  //Do we have a valid SD Card?
  useEffect(() => {
    checkSDValid();
  }, []);

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
          sdCardName: false,
          sdCardValid: false,
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

  return (
    <RomStorage
      status={status}
      sdCardValid={sdCardValid}
      reloadSDcard={checkSDValid}
      sdCardName={sdCardName}
      customPath={storagePath}
      onClick={storageSet}
      disabledNext={disabledNext}
      disabledBack={disabledBack}
      next={mode === 'easy' ? 'homebrew-games' : 'device-selector'}
    />
  );
};

export default RomStoragePage;
