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
      ipcChannel.sendMessage('emudeck', ['custom_location|||custom_location']);

      ipcChannel.once('custom_location', (message) => {
        let stdout = message.stdout.replace('\n', '');
        stdout = JSON.parse(stdout);
        const storagePath = stdout.result;

        // is it valid?

        ipcChannel.sendMessage('emudeck', [
          `test_location_valid|||test_location_valid custom ${storagePath}`,
        ]);

        ipcChannel.once('test_location_valid', (message) => {
          let stdout = message.stdout.replace('\n', '');
          stdout = JSON.parse(stdout);
          const stdoutLocation = stdout.result;
          let statusLocation;

          /Valid/.test(stdoutLocation)
            ? (statusLocation = true)
            : (statusLocation = false);

          if (statusLocation === true) {
            setStatePage({
              ...statePage,
              disabledNext: false,
              storageDestination: storageName,
              storagePathDestination: storagePath,
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
    ipcChannel.sendMessage('emudeck', [`SDCardValid|||test_location_valid SD`]);

    ipcChannel.once('SDCardValid', (message) => {
      let stdout = message.stdout.replace('\n', '');
      stdout = JSON.parse(stdout);
      const result = stdout.result;

      let statusSD;
      /Valid/.test(result) ? (statusSD = true) : (statusSD = false);
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
    ipcChannel.sendMessage('emudeck', ['get_sd_path|||get_sd_path']);
    ipcChannel.once('get_sd_path', (message) => {
      let stdout = message.stdout.replace('\n', '');
      stdout = JSON.parse(stdout);
      const response = stdout.result;
      if (response === '') {
        response = null;
      }
      setStatePage({
        ...statePage,
        sdCardName: response,
        sdCardValid: response != null,
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
      `migration_init|||migration_init ${storagePathDestination}`,
    ]);

    ipcChannel.once('migration_init', (message) => {
      console.log({ message });
      let stdout = message.stdout.replace('\n', '');
      stdout = JSON.parse(stdout);
      const response = stdout.result;
      if (/Valid/.test(response)) {
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
