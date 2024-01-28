import React, { useEffect, useState, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlobalContext } from 'context/globalContext';

//
// Components
//

import EmuModal from 'components/molecules/EmuModal/EmuModal';
import Wrapper from 'components/molecules/Wrapper/Wrapper';
import Header from 'components/organisms/Header/Header';
import Footer from 'components/organisms/Footer/Footer';
import RomStorage from 'components/organisms/Wrappers/RomStorage';

//
// Hooks
//

//
// Imports & Requires
//

function AndroidRomStoragePage() {
  //
  // i18
  //

  //
  // Web services
  //

  //
  // Const & Vars
  //
  const ipcChannel = window.electron.ipcRenderer;
  const navigate = useNavigate();

  //
  // States
  //
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
    hddrives,
  } = statePage;
  const { system, storagePath } = state;

  //
  // Functions
  //
  // We set the selected storage
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
          android: {
            ...state.android,
            storage: storageName,
            storagePath,
          },
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
              android: {
                ...state.android,
                storage: null,
                storagePath: null,
              },
            });
          }
        });
      });
    } else if (storageName === 'SD-Card') {
      const sdCardPath = sdCardName;
      setState({
        ...state,
        android: {
          ...state.android,
          storage: storageName,
          storagePath: asCardPath,
        },
      });
      setStatePage({
        ...statePage,
        disabledNext: false,
      });
    } else if (storageName === 'Internal Storage') {
      setState({
        ...state,
        android: {
          ...state.android,
          storage: storageName,
          storagePath: '/storage/emulated/0',
        },
      });
      setStatePage({
        ...statePage,
        disabledNext: false,
      });
    } else {
      setState({
        ...state,
        android: {
          ...state.android,
          storage: storageName,
          storagePath: storageName,
        },
      });
      setStatePage({
        ...statePage,
        disabledNext: false,
      });
    }
  };

  // We heck if it's formated in a valid file system. Only Linux
  const getAndroidDrives = () => {
    ipcChannel.sendMessage('emudeck', ['Android_ADB_init|||Android_ADB_init']);

    ipcChannel.once('Android_ADB_init', (message) => {
      console.log({ message });
      const hdrives = message.stdout;
      const hdrivesCleanup = hdrives.replace(/(\r\n|\r|\n)/g, '');

      console.log({ hdrivesCleanup });

      const hdrivesJson = JSON.parse(hdrivesCleanup);

      setStatePage({
        ...statePage,
        modal: false,
        sdCardName: hdrivesJson.SDCardName,
        sdCardValid: true,
      });
    });
  };

  //
  // UseEffects
  //
  // Do we have a valid SD Card?
  useEffect(() => {
    const modalData = {
      active: true,
      header: <span className="h4">Collecting Android drives</span>,
      body: <p>This will take a few seconds. Please wait...</p>,
      css: 'emumodal--xs',
    };
    setStatePage({ ...statePage, modal: modalData });
    getAndroidDrives();
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

  //
  // Logic
  //

  //
  // Render
  //
  return (
    <Wrapper>
      <Header title="Select your ROM Directory for your Android Device" />
      <p className="lead">
        Your ROM directory will be squared away within an Emulation folder in
        your selected directory.
      </p>
      <RomStorage
        status={status}
        sdCardValid={sdCardValid}
        showSDCard={sdCardName !== ''}
        showInternal
        showCustom={false}
        hddrives={false}
        reloadSDcard={() => getAndroidDrives()}
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
  );
}

export default AndroidRomStoragePage;
