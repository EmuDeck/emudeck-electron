import { useTranslation } from 'react-i18next';
import React, { useEffect, useState, useContext, useRef } from 'react';
import { GlobalContext } from 'context/globalContext';
import Wrapper from 'components/molecules/Wrapper/Wrapper';

import EmuModal from 'components/molecules/EmuModal/EmuModal';
import Header from 'components/organisms/Header/Header';
import Footer from 'components/organisms/Footer/Footer';

import Migration from 'components/organisms/Wrappers/Migration';

function MigrationPage() {
  const { t, i18n } = useTranslation();
  const ipcChannel = window.electron.ipcRenderer;
  const { state, setState } = useContext(GlobalContext);
  const { storage, storagePath } = state;
  const [statePage, setStatePage] = useState({
    disabledNext: storage === null,
    disabledBack: false,
    statusMigration: null,
    sdCardValid: null,
    sdCardName: undefined,
    status: undefined,
    storageDestination: undefined,
    storagePathDestination: undefined,
    modal: undefined,
    dom: undefined,
  });
  const {
    disabledNext,
    disabledBack,
    statusMigration,
    sdCardValid,
    sdCardName,
    status,
    storagePathDestination,
    storageDestination,
    modal,
    dom,
  } = statePage;

  const storageSet = (storageName) => {
    // We prevent the function to continue if the custom location testing is still in progress
    if (status === 'testing') {
      return;
    }

    if (storageName === 'Custom') {
      ipcChannel.sendMessage('emudeck', ['customLocation|||customLocation']);

      ipcChannel.once('customLocation', (message) => {
        const stdout = message.stdout.replace('\n', '');

        // is it valid?

        ipcChannel.sendMessage('emudeck', [
          `testLocation|||testLocationValid "custom" "${stdout}"`,
        ]);

        ipcChannel.once('testLocation', (messageLocation) => {
          const stdoutLocation = messageLocation.stdout.replace('\n', '');

          let statusLocation;
          stdoutLocation.includes('Valid')
            ? (statusLocation = true)
            : (statusLocation = false);

          if (statusLocation === true) {
            setStatePage({
              ...statePage,
              disabledNext: false,
              storageDestination: storageName,
              storagePathDestination: stdout,
            });
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
              storageDestination: null,
              storagePathDestination: null,
              modal: modalData,
            });
          }
        });
      });
    } else if (storageName === 'SD-Card') {
      const sdCardPath = sdCardName;

      setStatePage({
        ...statePage,
        disabledNext: false,
        storageDestination: storageName,
        storagePathDestination: sdCardPath,
      });
    } else {
      setStatePage({
        ...statePage,
        disabledNext: false,
        storageDestination: storageName,
        storagePathDestination: '$HOME',
      });
    }
  };

  const checkSDValid = () => {
    ipcChannel.sendMessage('emudeck', [
      'SDCardValid|||testLocationValid "SD" "$(getSDPath)"',
    ]);

    ipcChannel.once('SDCardValid', (message) => {
      const stdout = message.stdout.replace('\n', '');
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

  // Do we have a valid SD Card?
  useEffect(() => {
    checkSDValid();
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

  const startMigration = () => {
    setStatePage({
      ...statePage,
      statusMigration: true,
    });

    ipcChannel.sendMessage('emudeck', [
      `Migration_init|||Migration_init ${storagePathDestination}`,
    ]);

    ipcChannel.once('Migration_init', (message) => {
      const stdout = message.stdout.replace('\n', '');
      if (stdout.includes('Valid')) {
        setStatePage({
          ...statePage,
          statusMigration: null,
        });
        setState({
          ...state,
          storage: storageDestination,
          storagePath: storagePathDestination,
        });
      }
    });
  };

  // We store the changes on localhost in case people want to migrate over and over
  useEffect(() => {
    const json = JSON.stringify(state);
    localStorage.setItem('settings_emudeck', json);
  }, [state]);

  return (
    <Wrapper>
      <Header title={t('MigrationPage.title')} />
      <p className="lead">{t('MigrationPage.description')}</p>
      <Migration
        sdCardValid={sdCardValid}
        reloadSDcard={checkSDValid}
        sdCardName={sdCardName}
        onClick={storageSet}
        onClickStart={startMigration}
        storage={storage}
        storageDestination={storageDestination}
        storagePath={storagePath}
        storagePathDestination={storagePathDestination}
        statusMigration={statusMigration}
      />
      <Footer
        next={false}
        disabledNext={disabledNext}
        disabledBack={disabledBack}
      />
      <EmuModal modal={modal} />
    </Wrapper>
  );
}

export default MigrationPage;
