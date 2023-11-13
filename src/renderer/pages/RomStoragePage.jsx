import React, { useEffect, useState, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlobalContext } from 'context/globalContext';
import Wrapper from 'components/molecules/Wrapper/Wrapper';
import GamePad from 'components/organisms/GamePad/GamePad';
import EmuModal from 'components/molecules/EmuModal/EmuModal';
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
    modal: undefined,
    dom: undefined,
    hddrives: [],
  });

  const {
    disabledNext,
    disabledBack,
    sdCardValid,
    sdCardName,
    status,
    modal,
    dom,
    hddrives,
  } = statePage;
  const { system, storagePath } = state;

  console.log(hddrives);

  const storageSet = (storageName) => {
    // We prevent the function to continue if the custom location testing is still in progress
    if (status === 'testing') {
      return;
    }

    if (storageName === 'Custom') {
      ipcChannel.sendMessage('emudeck', ['customLocation|||customLocation']);

      ipcChannel.once('customLocation', (message) => {
        const stdout = message.stdout.replace('\n', '');

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

        ipcChannel.sendMessage('emudeck', [
          `testLocation|||testLocationValid "custom" "${stdout}"`,
        ]);

        ipcChannel.once('testLocation', (messageLocation) => {
          if (messageLocation) {
            const stdoutLocation = messageLocation.stdout.replace('\n', '');

            let statusLocation;
            stdoutLocation.includes('Valid')
              ? (statusLocation = true)
              : (statusLocation = false);

            if (statusLocation === true) {
              setStatePage({
                ...statePage,
                disabledNext: false,
                status: undefined,
              });
            } else {
              const modalData = {
                active: true,
                header: <span className="h4">Ooops 😞</span>,
                body: <p>There was an error detecting your storage...</p>,
                css: 'emumodal--xs',
              };
              setStatePage({ ...statePage, modal: modalData });
            }
          } else {
            const modalData = {
              active: true,
              header: <span className="h4">Ooops 😞</span>,
              body: (
                <p>Non writable directory selected, please choose another.</p>
              ),
              css: 'emumodal--xs',
            };
            setStatePage({
              ...statePage,
              disabledNext: true,
              status: undefined,
              modal: modalData,
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
    } else if (storageName === 'Internal Storage') {
      setState({
        ...state,
        storage: storageName,
        storagePath: '$HOME',
      });
      setStatePage({
        ...statePage,
        disabledNext: false,
      });
    } else {
      setState({
        ...state,
        storage: `${storageName}\\`,
        storagePath: `${storageName}\\`,
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
      if (message === 'nogit') {
        const modalData = {
          active: true,
          header: <span className="h4">Ooops 😞</span>,
          body: <p>There was an error, please restart EmuDeck...</p>,
          css: 'emumodal--xs',
        };
        setStatePage({
          ...statePage,
          modal: modalData,
        });
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

  const getHDdrives = () => {
    ipcChannel.sendMessage('emudeck', ['getLocations|||getLocations']);

    ipcChannel.once('getLocations', (message) => {
      const hdrives = message.stdout;

      const hdrivesCleanup = hdrives.replace(/(\r\n|\r|\n)/g, '');
      const jsonDrives = JSON.parse(hdrivesCleanup);

      setStatePage({
        ...statePage,
        modal: false,
        hddrives: jsonDrives,
      });
      console.log({ statePage });
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
    } else if (system === 'win32') {
      const modalData = {
        active: true,
        header: <span className="h4">Collecting Drives Names</span>,
        body: <p>This will take a few seconds. Please wait...</p>,
        css: 'emumodal--xs',
      };
      setStatePage({ ...statePage, modal: modalData });
      // We get the drives
      getHDdrives();
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

  // GamePad
  const domElementsRef = useRef(null);
  const domElementsCur = domElementsRef.current;
  let domElements;
  useEffect(() => {
    if (domElementsCur && dom === undefined) {
      domElements = domElementsCur.querySelectorAll('button');
      setStatePage({ ...statePage, dom: domElements });
    }
  }, [statePage]);

  return (
    <div style={{ height: '100vh' }} ref={domElementsRef}>
      {dom !== undefined && <GamePad elements={dom} />}
      <Wrapper>
        <Header title="Select your ROM Directory " />
        <RomStorage
          status={status}
          sdCardValid={sdCardValid}
          showSDCard={system !== 'win32'}
          showInternal={system !== 'win32'}
          hddrives={system === 'win32' ? hddrives : false}
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
        <EmuModal modal={modal} />
      </Wrapper>
    </div>
  );
}

export default RomStoragePage;
