import { useTranslation } from 'react-i18next';
import React, { useEffect, useState, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlobalContext } from 'context/globalContext';
import { invokeIpc } from 'common';
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

function RomStoragePage() {
  const { t, i18n } = useTranslation();
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
      ipcChannel.sendMessage('emudeck', ['custom_location|||custom_location']);

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
          `test_location_valid|||test_location_valid custom ${stdout}`,
        ]);

        ipcChannel.once('test_location_valid', (messageLocation) => {
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
                body: <p>{t('RomStoragePage.modalErrorDetecting')}</p>,
                css: 'emumodal--xs',
              };
              setStatePage({ ...statePage, modal: modalData });
            }
          } else {
            const modalData = {
              active: true,
              header: <span className="h4">Ooops 😞</span>,
              body: <p>{t('RomStoragePage.modalErrorWritable')}</p>,
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
  // We get the SD Card name. Only Linux
  const getSDName = () => {
    ipcChannel.sendMessage('emudeck', ['get_sd_path|||get_sd_path']);
    ipcChannel.once('get_sd_path', (message) => {
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
  // We heck if it's formated in a valid file system. Only Linux
  const checkSDValid = () => {
    ipcChannel.sendMessage('emudeck', [
      `SDCardValid|||test_location_valid SD getSDPath`,
    ]);

    ipcChannel.once('SDCardValid', (message) => {
      if (message === 'nogit') {
        const modalData = {
          active: true,
          header: <span className="h4">Ooops 😞</span>,
          body: <p>{t('RomStoragePage.modalError')}</p>,
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
  // In windows we search for all drives
  const getHDdrives = () => {
    invokeIpc(`get_locations`).then((message) => {
      console.log({ message });
      const hdrives = message;

      const hdrivesCleanup = hdrives.replace(/(\r\n|\r|\n)/g, '');
      const jsonDrives = JSON.parse(hdrivesCleanup);

      setStatePage({
        ...statePage,
        modal: false,
        hddrives: jsonDrives.result,
      });
      console.log({ statePage });
    });
  };

  //
  // UseEffects
  //

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

  //
  // Logic
  //

  //
  // Render
  //
  return (
    <Wrapper>
      <Header title={t('RomStoragePage.title')} />
      <p className="lead">{t('RomStoragePage.description')}</p>
      <RomStorage
        status={status}
        sdCardValid={sdCardValid}
        showSDCard={system !== 'win32'}
        showInternal={system !== 'win32'}
        showCustom={!!(system !== 'win32' && system !== 'darwin')}
        hddrives={system === 'win32' ? hddrives : false}
        reloadSDcard={checkSDValid}
        sdCardName={sdCardName}
        customPath={storagePath}
        onClick={storageSet}
        storage={storage}
      />
      <Footer
        next="device-selector"
        nextText={t('general.next')}
        disabledNext={disabledNext}
        disabledBack={disabledBack}
        comments="If you need to change your ROM directory later, you can use the exclusive <strong>EmuDeck Migration Tool.</strong>"
      />
      <EmuModal modal={modal} />
    </Wrapper>
  );
}

export default RomStoragePage;
