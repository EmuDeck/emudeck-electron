import React, { useEffect, useState, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlobalContext } from 'context/globalContext';

//
// Components
//

import { Iframe } from 'getbasecore/Atoms';
import EmuModal from 'components/molecules/EmuModal/EmuModal';
import Wrapper from 'components/molecules/Wrapper/Wrapper';
import Header from 'components/organisms/Header/Header';
import Main from 'components/organisms/Main/Main';
import Footer from 'components/organisms/Footer/Footer';
import RomStorage from 'components/organisms/Wrappers/RomStorage';
import PatreonLogin from 'components/organisms/PatreonLogin/PatreonLogin';
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
  const { android } = state;
  const { storage } = android;
  const [statePage, setStatePage] = useState({
    disabledNext: storage === null,
    disabledBack: false,
    data: '',
    sdCardValid: false,
    sdCardName: undefined,
    status: undefined,
    modal: undefined,
    isConnected: false,
    hddrives: [],
  });

  const {
    disabledNext,
    disabledBack,
    sdCardValid,
    sdCardName,
    status,
    modal,
    isConnected,
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
          storagePath: `/storage/${sdCardPath}`,
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

      const hdrivesJson = JSON.parse(hdrivesCleanup);
      let modalData;
      if (!hdrivesJson.isConnected) {
        modalData = {
          active: true,
          header: <span className="h4">Android Device not detected</span>,
          body: (
            <p>
              Make sure your device is connected to this PC using an USB cable
              and that you have enabled both <strong>Developer mode</strong> and{' '}
              <strong>USB Debug mode</strong>
            </p>
          ),
          css: 'emumodal--sm',
        };
      }

      setStatePage({
        ...statePage,
        modal: hdrivesJson.isConnected ? false : modalData,
        sdCardName: hdrivesJson.SDCardName,
        isConnected: hdrivesJson.isConnected,
        sdCardValid: hdrivesJson.SDCardName !== 'false',
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
      body: (
        <p>
          If this is your first install, please restart EmuDeck. Please wait
          otherwise...
        </p>
      ),
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
        android: {
          ...state.android,
          storagePath: '',
          storage: '',
        },
      });
    }
  }, []);

  //
  // Logic
  //

  //
  // Render
  //
  return (
    <Wrapper>
      <PatreonLogin>
        <Header title="Select the ROM Storage for your Android Device" />
        <p className="lead">
          Your ROM directory will be squared away within an Emulation folder in
          your selected directory.
        </p>

        {isConnected === 'false' && (
          <Main>
            <div className="container container--grid">
              <div data-col-sm="5">
                <p className="h5">Make sure your Android device is:</p>
                <ul className="list">
                  <li>
                    - Connected using a USB with data transfer capabilities
                  </li>
                  <li>- Developer & USB Debugging is enabled</li>
                  <li>- You've accepted all the prompts in your device</li>
                  <li>
                    - You've selected <strong>File Transfer</strong> when asked
                    by the device
                  </li>
                </ul>
              </div>
              <div data-col-sm="4">
                <div style={{ height: 'calc(100vh - 190px)' }}>
                  <span className="h5">How to enable Developer mode</span>
                  <Iframe src="https://www.youtube-nocookie.com/embed/p7DDuq56suU?autoplay=1&playlist=p7DDuq56suU&loop=1&controls=0&mute=1&rel=0&modestbranding=1" />
                </div>
              </div>
            </div>
          </Main>
        )}
        {isConnected !== 'false' && (
          <RomStorage
            status={status}
            sdCardValid={sdCardValid}
            showSDCard={isConnected !== 'false' && sdCardValid}
            showInternal={isConnected !== 'false'}
            showCustom={false}
            hddrives={false}
            reloadSDcard={() => getAndroidDrives()}
            sdCardName={sdCardName}
            customPath={storagePath}
            onClick={storageSet}
            storage={storage}
          />
        )}
        {storage !== '' && (
          <Footer
            next="android-end"
            nextText="Next"
            disabledNext={disabledNext}
            disabledBack
          />
        )}
        <EmuModal modal={modal} />
      </PatreonLogin>
    </Wrapper>
  );
}

export default AndroidRomStoragePage;
