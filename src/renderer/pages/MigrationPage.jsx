import React, { useEffect, useState, useContext } from 'react';
import { GlobalContext } from 'context/globalContext';
import Wrapper from 'components/molecules/Wrapper/Wrapper';
import Header from 'components/organisms/Header/Header';
import Footer from 'components/organisms/Footer/Footer';

import Migration from 'components/organisms/Wrappers/Migration';

const MigrationPage = () => {
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
    storage: undefined,
    storagePath: undefined,
  });
  const {
    disabledNext,
    disabledBack,
    data,
    sdCardValid,
    sdCardName,
    status,
    storagePath,
  } = statePage;
  const { mode, system } = state;

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
              storage: null,
              storagePath: null,
            });
          }
        });
      });
    } else if (storageName === 'SD-Card') {
      let sdCardPath = sdCardName;

      setStatePage({
        ...statePage,
        disabledNext: false,
        storage: storageName,
        storagePath: sdCardPath,
      });
    } else {
      setStatePage({
        ...statePage,
        disabledNext: false,
        storage: storageName,
        storagePath: '$HOME',
      });
    }
  };

  //Do we have a valid SD Card?
  useEffect(() => {
    checkSDValid();
  }, []);

  //We make sure we get the new SD Card name on State when we populate it if the user selected the SD Card in the previous installation
  useEffect(() => {
    if (storage == 'SD-Card') {
      setState({
        ...state,
        storagePath: sdCardName,
      });
    }
  }, [sdCardName]);

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

  const startMigration = () => {
    alert("I don't do anything at the moment...");
  };

  return (
    <Wrapper>
      <Header title="Migrate your installation" />
      <Migration
        sdCardValid={sdCardValid}
        reloadSDcard={checkSDValid}
        sdCardName={sdCardName}
        customPath={storagePath}
        onClick={storageSet}
        onClickStart={startMigration}
        storage={storage}
        storagePath={storagePath}
      />
      <Footer
        next={false}
        disabledNext={disabledNext}
        disabledBack={disabledBack}
      />
    </Wrapper>
  );
};

export default MigrationPage;
