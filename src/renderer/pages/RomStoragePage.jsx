import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlobalContext } from 'context/globalContext';
import Wrapper from 'components/molecules/Wrapper/Wrapper';
import Header from 'components/organisms/Header/Header';
import Footer from 'components/organisms/Footer/Footer';

import RomStorage from 'components/organisms/Wrappers/RomStorage';

function RomStoragePage() {
  const ipcChannel = window.electron.ipcRenderer;
  const navigate = useNavigate();
  const { state, setState } = useContext(GlobalContext);
  const { storage } = state;
  const [statePage, setStatePage] = useState({
    disabledNext: storage === null,
    disabledBack: false,
    data: '',
    sdCardValid: null,
    sdCardName: undefined,
    status: undefined,
  });
  const { disabledNext, disabledBack, sdCardValid, sdCardName, status } =
    statePage;
  const { system, storagePath } = state;

  const storageSet = (storageName) => {
    // We prevent the function to continue if the custom location testing is still in progress
    if (status === 'testing') {
      return;
    }

    if (storageName === 'Custom') {
      if (system === 'win32') {
        alert('This will take a few seconds. Please wait after clicking OK');
      }

      ipcChannel.sendMessage('emudeck', ['customLocation|||customLocation']);

      ipcChannel.once('customLocation', (message) => {
        const stdout = message.stdout.replace('\n', '');
        console.log({ message });
        const storagePath = stdout;

        setStatePage({
          ...statePage,
          disabledNext: true,
          status: 'testing',
        });
        setState({
          ...state,
          storage: storageName,
          storagePath,
        });
        // is it valid?

        if (system === 'win32') {
          ipcChannel.sendMessage('emudeck', [
            `testLocation|||testLocationValid 'custom' '${stdout}'`,
          ]);
        } else {
          ipcChannel.sendMessage('emudeck', [
            `testLocation|||testLocationValid "custom" "${stdout}"`,
          ]);
        }

        ipcChannel.once('testLocation', (messageLocation) => {
          const stdoutLocation = messageLocation.stdout.replace('\n', '');
          // console.log({ message });
          let statusLocation;
          stdoutLocation.includes('Valid')
            ? (statusLocation = true)
            : (statusLocation = false);
          // console.log({ status });
          if (statusLocation === true) {
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
      const sdCardPath = sdCardName;
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

  const getSDName = () => {
    ipcChannel.sendMessage('emudeck', ['SDCardName|||getSDPath']);
    ipcChannel.once('SDCardName', (message) => {
      // console.log(message);
      let stdout = message.stdout.replace('\n', '');
      if (stdout === '') {
        stdout = null;
      }
      setStatePage({
        ...statePage,
        sdCardName: stdout,
        sdCardValid: stdout != null,
      });
      setState({
        ...state,
      });
    });
  };
  const checkSDValid = () => {
    ipcChannel.sendMessage('emudeck', [
      'SDCardValid|||testLocationValid "SD" "$(getSDPath)"',
    ]);

    ipcChannel.once('SDCardValid', (message) => {
      // console.log(message);

      if (message === 'nogit') {
        alert(
          'Backend not found, EmuDeck will try to download the missing component and then it will restart itself'
        );
      }

      const stdout = message.stdout.replace('\n', '');
      let statusSD;
      stdout.includes('Valid') ? (statusSD = true) : (statusSD = false);
      if (statusSD === true) {
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

  // Do we have a valid SD Card?
  useEffect(() => {
    if (navigator.onLine === false) {
      navigate('/error');
      return;
    }

    if (system !== 'win32') {
      checkSDValid();
    }
  }, []);

  // We make sure we get the new SD Card name on State when we populate it if the user selected the SD Card in the previous installation
  useEffect(() => {
    if (storage === 'SD-Card') {
      setState({
        ...state,
        storagePath: sdCardName,
      });
    }
  }, [sdCardName]);

  return (
    <Wrapper>
      <Header title="Select your ROM Directory " />
      <RomStorage
        status={status}
        sdCardValid={sdCardValid}
        showSDCard={system !== 'win32'}
        showInternal={system !== 'win32'}
        reloadSDcard={checkSDValid}
        sdCardName={sdCardName}
        customPath={storagePath}
        onClick={storageSet}
      />
      <Footer
        next="device-selector"
        nextText="Next"
        disabledNext={disabledNext}
        disabledBack={disabledBack}
      />
    </Wrapper>
  );
}

export default RomStoragePage;
