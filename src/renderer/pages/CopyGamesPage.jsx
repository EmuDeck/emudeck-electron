import { useTranslation } from 'react-i18next';
import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlobalContext } from 'context/globalContext';
import Video from 'components/atoms/Video/Video';
import Wrapper from 'components/molecules/Wrapper/Wrapper';
import Main from 'components/organisms/Main/Main';
import EmuModal from 'components/molecules/EmuModal/EmuModal';
import ProgressBar from 'components/atoms/ProgressBar/ProgressBar';
import Header from 'components/organisms/Header/Header';
import { BtnSimple, Img, Iframe } from 'getbasecore/Atoms';
import CopyGamesAuto from 'components/organisms/Wrappers/CopyGamesAuto';
import SelectorMenu from 'components/molecules/SelectorMenu/SelectorMenu';
import ImportExport from 'components/organisms/Wrappers/ImportExport';
import { Alert } from 'getbasecore/Molecules';
import { imgSTEAM } from 'components/utils/images/images';
import { iconSuccess, iconDanger } from 'components/utils/images/icons';

function CopyGamesPage() {
  const { t, i18n } = useTranslation();
  const ipcChannel = window.electron.ipcRenderer;
  const navigate = useNavigate();
  const { state, setState } = useContext(GlobalContext);
  const { storagePath, second, system, installFrontends } = state;
  const [statePage, setStatePage] = useState({
    disabledNext: true,
    disabledBack: false,
    statusCopyGames: null,
    statusCreateStructure: null,
    status: undefined,
    storageUSB: undefined,
    storageUSBPath: undefined,
    modal: undefined,
    mode: undefined,
    frontend: undefined,
  });
  const {
    statusCopyGames,
    statusCreateStructure,
    status,
    storageUSBPath,
    storageUSB,
    modal,
    mode,
    frontend,
  } = statePage;
  const [stateBios, setStateBios] = useState({
    PlayStation1: undefined,
    PlayStation2: undefined,
    SegaCD: undefined,
    Saturn: undefined,
    NintendoDS: undefined,
    Switch: undefined,
    Dreamcast: undefined,
  });

  const updateBiosState = (prevState, key) => {
    return { ...prevState, key };
  };

  const checkBios = (bios) => {
    let biosToCheck;
    switch (bios) {
      case 'PlayStation1':
        biosToCheck = 'checkPS1BIOS';
        break;
      case 'PlayStation2':
        biosToCheck = 'checkPS2BIOS';
        break;
      case 'Switch':
        biosToCheck = 'checkYuzuBios';
        break;
      case 'SegaCD':
        biosToCheck = 'checkSegaCDBios';
        break;
      case 'Saturn':
        biosToCheck = 'checkSaturnBios';
        break;
      case 'Dreamcast':
        biosToCheck = 'checkDreamcastBios';
        break;
      case 'NintendoDS':
        biosToCheck = 'checkDSBios';
        break;
      default:
        break;
    }

    ipcChannel.sendMessage('emudeck', [`checkBios|||${biosToCheck}`]);

    ipcChannel.once('checkBios', (message) => {
      const { stdout } = message;
      let status;
      stdout.includes('false') ? (status = false) : (status = true);
      updateBiosState((prevState) => ({ ...prevState, [bios]: status }));

      setStateBios((prevState) =>
        updateBiosState({ ...prevState, [bios]: status })
      );
    });
  };

  useEffect(() => {
    if (statusCopyGames === true) {
      checkBios('PlayStation1');
      checkBios('PlayStation2');
      checkBios('Switch');
      checkBios('SegaCD');
      checkBios('Saturn');
      checkBios('Dreamcast');
      checkBios('NintendoDS');
    }
  }, [statusCopyGames]);

  const storageSet = (storageName) => {
    // We prevent the function to continue if the custom location testing is still in progress
    if (status === 'testing') {
      return;
    }

    if (storageName === 'Custom') {
      ipcChannel.sendMessage('emudeck', ['customLocation|||customLocation']);

      ipcChannel.once('customLocation', (message) => {
        const pathUSB = message.stdout.replace('\n', '');
        setStatePage({
          ...statePage,
          disabledNext: true,
          status: 'testing',
          storageUSB: storageName,
          storageUSBPath: pathUSB,
        });
        // is it valid?

        ipcChannel.sendMessage('emudeck', [
          `testLocation|||sleep 1 && testLocationValidRelaxed "custom" "${pathUSB}"`,
        ]);

        ipcChannel.once('testLocation', (message) => {
          const stdout = message.stdout.replace('\n', '');

          let status;
          stdout.includes('Valid') ? (status = true) : (status = false);

          if (status === true) {
            setStatePage({
              ...statePage,
              disabledNext: false,
              status: undefined,
              storageUSB: storageName,
              storageUSBPath: pathUSB,
            });
          } else {
            const modalData = {
              active: true,
              header: <span className="h4">{t('general.ooops')}</span>,
              body: <p>{t('RomStoragePage.modalErrorWritable')}</p>,
              css: 'emumodal--xs',
            };
            setStatePage({
              ...statePage,
              disabledNext: true,
              status: undefined,
              storageUSB: undefined,
              storageUSBPath: undefined,
              statusCreateStructure: null,
              modal: modalData,
            });
          }
        });
      });
    }
  };

  const startCopyGames = () => {
    ipcChannel.sendMessage('emudeck', [
      `CopyGames|||CopyGames '${storageUSBPath}'`,
    ]);

    ipcChannel.once('CopyGames', (message) => {
      const stdout = message.stdout.replace('\n', '');
      setStatePage({
        ...statePage,
        statusCopyGames: true,
      });
    });
  };

  const startCreateStructureOnUSB = () => {
    setStatePage({
      ...statePage,
      statusCreateStructure: 'waiting',
    });
    ipcChannel.sendMessage('emudeck', [
      `CreateStructureUSB|||CreateStructureUSB '${storageUSBPath}'`,
    ]);

    ipcChannel.once('CreateStructureUSB', (message) => {
      const stdout = message.stdout.replace('\n', '');
      console.log({ stdout });
      let status;
      stdout.includes('true') ? (status = true) : (status = false);
      let modalData;
      if (stdout.includes('true')) {
        status = true;
        modalData = {
          active: true,
          header: (
            <span className="h4">{t('CopyGamesPage.foldersCreated')}</span>
          ),
          body: (
            <>
              <p>{t('CopyGamesPage.foldersCreatedBody')}</p>
              <ul className="list">
                <li>{storageUSBPath}/EmuDeck/roms</li>
                <li>{storageUSBPath}/EmuDeck/bios</li>
              </ul>
              <span className="h4">{t('importExport.items.roms')}</span>
              <p>{t('CopyGamesPage.romsHelp', { path: storageUSBPath })}</p>
              <span className="h4">{t('importExport.items.bios')}</span>
              <p>{t('CopyGamesPage.biosHelp')}</p>
            </>
          ),
          css: 'emumodal--xl',
        };
        setStatePage({
          ...statePage,
          modal: modalData,
          statusCreateStructure: status,
        });
      } else if (stdout.includes('false')) {
        status = false;
        modalData = {
          active: true,
          header: <span className="h4">{t('general.error')}</span>,
          body: <p>{t('CopyGamesPage.foldersError')}</p>,
          css: 'emumodal--xs',
        };
        setStatePage({
          ...statePage,
          modal: modalData,
          statusCreateStructure: status,
        });
      } else {
        // Already created folders? let's copy
        startCopyGames();
      }
    });
  };

  const openSRM = () => {
    let modalData = {
      active: true,
      header: (
        <span className="h4">{t('general.launching')} Steam Rom Manager</span>
      ),
      body: <p>{t('aside.srm.body')}</p>,
      footer: <ProgressBar css="progress--success" infinite max="100" />,
      css: 'emumodal--xs',
    };

    if (system === 'win32') {
      setStatePage({ ...statePage, modal: modalData });
      ipcChannel.sendMessage(
        'emudeck',
        'powershell -ExecutionPolicy Bypass -NoProfile -File "$toolsPath/launchers/srm/steamrommanager.ps1"'
      );
    } else if (system !== 'darwin') {
      setStatePage({ ...statePage, modal: modalData });
      ipcChannel.sendMessage(
        'emudeck',
        '"$toolsPath/launchers/srm/steamrommanager.sh"'
      );
    } else {
      modalData = {
        active: true,
        header: (
          <span className="h4">{t('general.launching')} Steam Rom Manager</span>
        ),
        body: (
          <>
            <p>{t('aside.srm.body')}</p>
            <strong>{t('aside.srm.desktopControls')}</strong>
          </>
        ),
        footer: <ProgressBar css="progress--success" infinite max="100" />,
        css: 'emumodal--sm',
      };
      setStatePage({ ...statePage, modal: modalData });
      ipcChannel.sendMessage(
        'emudeck',
        '"$toolsPath/launchers/srm/steamrommanager.sh"'
      );
    }
    let timer;

    if (system === 'win32') {
      timer = 10;
    } else {
      timer = 10;
    }
    const timerId = setTimeout(() => {
      setStatePage({
        ...statePage,
        modal: {
          active: false,
        },
      });
      navigate('/hotkeys');
      clearTimeout(timerId);
    }, timer);
  };

  const skipAddingGames = () => {
    setStatePage({
      ...statePage,
      statusCopyGames: 'final',
    });
  };

  const finishAddingGames = () => {
    setStatePage({
      ...statePage,
      statusCopyGames: 'final',
    });
  };

  const selectMode = (item) => {
    setStatePage({
      ...statePage,
      mode: item,
    });
  };

  const selectFrontend = (item) => {
    setStatePage({
      ...statePage,
      frontend: item,
    });
  };

  const openEmulationFolder = () => {
    ipcChannel.sendMessage('open-folder', `${storagePath}/Emulation`);

    const modalData = {
      active: true,
      header: <span className="h4">{t('CopyGamesPage.whereToCopy')}</span>,
      body: (
        <>
          <p
            dangerouslySetInnerHTML={{
              __html: t('CopyGamesPage.whereToCopyBody'),
            }}
          />
          <p>{t('CopyGamesPage.whereToCopyReady')}</p>
        </>
      ),
      css: 'emumodal--sm',
    };
    setStatePage({
      ...statePage,
      modal: modalData,
      statusCopyGames: 'manual',
    });
  };

  return (
    <Wrapper aside={second === true}>
      {mode === 'auto' && statusCopyGames === null && (
        <>
          <Header title={t('CopyGamesPage.usbTitle')} />

          <CopyGamesAuto
            onClick={storageSet}
            onClickStart={startCreateStructureOnUSB}
            onClickCopyGames={startCopyGames}
            storagUSB={storageUSB}
            storageUSBPath={storageUSBPath}
            statusCopyGames={system === 'win32' ? true : statusCopyGames}
            statusCreateStructure={statusCreateStructure}
            installFrontends={installFrontends}
          />
        </>
      )}

      {mode === 'manual' && statusCopyGames === null && (
        <>
          <Header title={t('CopyGamesPage.manualTitle')} />
          <p className="lead">{t('CopyGamesPage.manualDescription')}</p>
          <div>
            <BtnSimple
              css="btn-simple--1"
              type="button"
              aria={t('aria.goNext')}
              onClick={() => openEmulationFolder()}
            >
              {t('CopyGamesPage.openEmulationFolder')}
            </BtnSimple>
          </div>
        </>
      )}

      {mode === 'manual' && statusCopyGames === 'manual' && (
        <>
          <Header title={t('CopyGamesPage.waitingTitle')} />
          <p className="lead">{t('CopyGamesPage.waitingDescription')}</p>
        </>
      )}

      {mode === 'backup' && statusCopyGames === null && (
        <>
          <Header title={t('CopyGamesPage.backupTitle')} />
          <ImportExport exportEnable={false} />
        </>
      )}

      {mode === undefined && (
        <>
          <Header title={t('CopyGamesPage.chooseTitle')} />
          <p className="lead">{t('CopyGamesPage.chooseDescription')}</p>
          {system !== 'win32' && (
            <SelectorMenu
              imgs={[[imgSTEAM, mode === undefined ? '' : 'is-hidden']]}
              options={[
                [
                  () => selectMode('manual'),
                  mode === 'manual' ? 'is-selected' : '',
                  t('CopyGamesPage.modeManual'),
                  t('CopyGamesPage.modeManualDesc'),
                  true,
                ],
                [
                  () => selectMode('auto'),
                  mode === 'auto' ? 'is-selected' : '',
                  t('CopyGamesPage.modeAuto'),
                  t('CopyGamesPage.modeAutoDesc'),
                  true,
                ],
                [
                  () => selectMode('backup'),
                  mode === 'backup' ? 'is-selected' : '',
                  t('CopyGamesPage.modeBackup'),
                  t('CopyGamesPage.modeBackupDesc'),
                  true,
                ],
              ]}
            />
          )}
          {system === 'win32' && (
            <SelectorMenu
              imgs={[[imgSTEAM, mode === undefined ? '' : 'is-hidden']]}
              options={[
                [
                  () => selectMode('manual'),
                  mode === 'manual' ? 'is-selected' : '',
                  t('CopyGamesPage.modeManual'),
                  t('CopyGamesPage.modeManualDesc'),
                  true,
                ],
              ]}
            />
          )}
        </>
      )}

      {statusCopyGames === true && (
        <>
          <Header title={t('CopyGamesPage.biosTitle')} />
          <p className="lead">{t('CheckBiosPage.description')}</p>
          <Main>
            <div className="container--grid">
              <div data-col-sm="6">
                {Object.entries(stateBios).map((item, index) => {
                  if (item[0] === 'key') {
                    return;
                  }
                  return (
                    <Alert
                      key={item[0]}
                      css={`alert--mini ${
                        item[1] === true ? 'alert--success' : 'alert--danger'
                      }`}
                    >
                      {item[1] === true && (
                        <Img src={iconSuccess} css="icon icon--xs" alt="OK" />
                      )}
                      {item[1] === false && (
                        <Img src={iconDanger} css="icon icon--xs" alt="OK" />
                      )}
                      {item[0]} BIOS
                    </Alert>
                  );
                })}
              </div>
              <div data-col-sm="6">
                <Alert css="alert--info">
                  <ul className="list">
                    <li>{t('CheckBios.tip1')}</li>
                    <li>{t('CheckBios.tip2')}</li>
                    <li>{t('CheckBios.tip3')}</li>
                    <li>{t('CheckBios.tip4')}</li>
                  </ul>
                </Alert>
              </div>
            </div>
          </Main>
        </>
      )}

      {statusCopyGames === 'final' && (
        <>
          <Header title={t('CopyGamesPage.launchTitle')} />

          {system != 'win32' && (
            <Main>
              {installFrontends.steam.status && (
                <>
                  <p className="lead">{t('CopyGamesPage.srmInfo')}</p>

                  <Video src="https://f005.backblazeb2.com/file/emudeck-assets/videos/BsqWFHPp5UU-SRM.mp4" />
                </>
              )}
              {installFrontends.esde.status && (
                <>
                  <p className="lead">{t('CopyGamesPage.esdeInfo')}</p>
                  <Video src="https://f005.backblazeb2.com/file/emudeck-assets/videos/twNE8i3aI0g-ESDE.mp4" />
                </>
              )}
            </Main>
          )}

          {system == 'win32' && mode == 'easy' && (
            <Main>
              {installFrontends.esde.status && (
                <>
                  <p className="lead">{t('CopyGamesPage.esdeInfo')}</p>
                  <Video src="https://f005.backblazeb2.com/file/emudeck-assets/videos/twNE8i3aI0g-ESDE.mp4" />
                </>
              )}
            </Main>
          )}
          {system == 'win32' && mode != 'easy' && (
            <Main>
              {installFrontends.steam.status && (
                <>
                  <p className="lead">{t('CopyGamesPage.srmInfo')}</p>

                  <Video src="https://f005.backblazeb2.com/file/emudeck-assets/videos/BsqWFHPp5UU-SRM.mp4" />
                </>
              )}
              {installFrontends.esde.status && (
                <>
                  <p className="lead">{t('CopyGamesPage.esdeInfo')}</p>
                  <Video src="https://f005.backblazeb2.com/file/emudeck-assets/videos/twNE8i3aI0g-ESDE.mp4" />
                </>
              )}
            </Main>
          )}
        </>
      )}
      <footer className="footer">
        {statusCopyGames === true ||
          (statusCopyGames === 'final' && second && (
            <BtnSimple
              css="btn-simple--2"
              type="button"
              aria={t('aria.goNext')}
              onClick={() => navigate('/hotkeys')}
            >
              {t('general.skip')}
            </BtnSimple>
          ))}
        {statusCopyGames === 'final' && installFrontends.steam.status && (
          <BtnSimple
            css="btn-simple--1"
            type="button"
            aria={t('aria.goNext')}
            onClick={() => openSRM()}
          >
            {t('CopyGamesPage.launchSRM')}
          </BtnSimple>
        )}
        {statusCopyGames === 'final' && installFrontends.esde.status && (
          <BtnSimple
            css="btn-simple--2"
            type="button"
            aria={t('aria.goNext')}
            onClick={() => navigate('/hotkeys')}
          >
            {t('general.next')}
          </BtnSimple>
        )}
        {statusCopyGames === true && (
          <BtnSimple
            css="btn-simple--1"
            type="button"
            aria={t('aria.goNext')}
            onClick={() => finishAddingGames()}
          >
            {t('general.next')}
          </BtnSimple>
        )}
        {statusCopyGames === 'manual' && (
          <BtnSimple
            css="btn-simple--1"
            type="button"
            aria={t('aria.goNext')}
            onClick={() => skipAddingGames()}
          >
            {t('general.next')}
          </BtnSimple>
        )}
        {mode === 'backup' && statusCopyGames === null && (
          <BtnSimple
            css="btn-simple--2"
            type="button"
            aria={t('aria.goBack')}
            onClick={() => navigate('/hotkeys')}
          >
            {t('general.next')}
          </BtnSimple>
        )}
        {second && statusCopyGames === null && (
          <BtnSimple
            css="btn-simple--2"
            type="button"
            aria={t('aria.goBack')}
            onClick={() => navigate('/emulators')}
          >
            {t('CopyGamesPage.skipForNow')}
          </BtnSimple>
        )}
      </footer>
      <EmuModal modal={modal} />
    </Wrapper>
  );
}

export default CopyGamesPage;
