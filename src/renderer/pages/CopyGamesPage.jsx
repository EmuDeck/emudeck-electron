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
import RomsCheatSheet from 'components/molecules/RomsCheatSheet/RomsCheatSheet';
import CheckBios from 'components/organisms/Wrappers/CheckBios';
import SelectorMenu from 'components/molecules/SelectorMenu/SelectorMenu';
import ImportExport, {
  useImportExport,
} from 'components/organisms/Wrappers/ImportExport';
import { Alert } from 'getbasecore/Molecules';
import { imgSTEAM } from 'components/utils/images/images';
import { iconSuccess, iconDanger } from 'components/utils/images/icons';

function CopyGamesPage() {
  const { t, i18n } = useTranslation();
  const ipcChannel = window.electron.ipcRenderer;
  const navigate = useNavigate();
  const { state, setState } = useContext(GlobalContext);
  const { storagePath, second, system, installFrontends, device } = state;
  const [statePage, setStatePage] = useState({
    disabledNext: true,
    disabledBack: false,
    statusCopyGames: null,
    statusCreateStructure: null,
    status: undefined,
    storageUSB: undefined,
    storageUSBPath: undefined,
    usbReady: undefined,
    modal: undefined,
    mode: undefined,
    frontend: undefined,
  });
  const {
    modal: importModal,
    pickDrive,
    closeModal: closeImportModal,
  } = useImportExport({
    selection: {
      roms: true,
      bios: true,
      storage: false,
      saves: false,
      esdeArtwork: false,
    },
    onFinish: (json) => {
      if ((json.key || '').startsWith('importExport.importFinished')) {
        setStatePage((prev) => ({ ...prev, statusCopyGames: true }));
      }
    },
  });
  const {
    statusCopyGames,
    statusCreateStructure,
    status,
    storageUSBPath,
    storageUSB,
    usbReady,
    modal,
    mode,
    frontend,
  } = statePage;
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

  // Copies the quickstart folders into the selected drive and reports the result
  const createUSB = (drive) => {
    setStatePage((prev) => ({
      ...prev,
      modal: {
        active: true,
        header: (
          <span className="h4">{t('CopyGamesPage.usb.creatingFolders')}</span>
        ),
        body: <p>{drive}</p>,
        footer: <ProgressBar css="progress--success" infinite max="100" />,
        css: 'emumodal--xs',
      },
    }));
    ipcChannel.sendMessage('emudeck', [
      `CreateStructureUSB|||CreateStructureUSB '${drive}'`,
    ]);

    ipcChannel.once('CreateStructureUSB', (message) => {
      let modalData = {
        active: true,
        header: <span className="h4">{t('general.error')}</span>,
        body: <p>{t('CopyGamesPage.foldersError')}</p>,
        css: 'emumodal--xs',
      };
      if (message.stdout.includes('true')) {
        modalData = {
          active: true,
          header: <span className="h4">{t('CopyGamesPage.usb.created')}</span>,
          body: (
            <>
              <ul className="list">
                <li>{drive}/EmuDeckBackup/roms</li>
                <li>{drive}/EmuDeckBackup/bios</li>
              </ul>
              <p>{t('CopyGamesPage.usb.comeBack')}</p>
              <p>{t('CopyGamesPage.usb.finishHint')}</p>
            </>
          ),
          footer: (
            <BtnSimple
              css="btn-simple--1"
              type="button"
              aria={t('CopyGamesPage.usb.readyImport')}
              onClick={() =>
                setStatePage((prev) => ({
                  ...prev,
                  usbReady: undefined,
                  modal: { active: false },
                }))
              }
            >
              {t('CopyGamesPage.usb.readyImport')}
            </BtnSimple>
          ),
          css: 'emumodal--sm',
        };
      }
      setStatePage((prev) => ({ ...prev, modal: modalData }));
    });
  };

  const openSRM = () => {
    // On Steam Frame SRM has to be opened from the SteamOS + menu
    if (device === 'Steam Frame') {
      setStatePage({
        ...statePage,
        modal: {
          active: true,
          header: <span className="h4">{t('aside.srm.titleFrame')}</span>,
          body: <p>{t('aside.srm.bodyFrame')}</p>,
          css: 'emumodal--xs',
        },
      });
      return;
    }

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
        'powershell -ExecutionPolicy Bypass -NoProfile -File "$toolsPath/launchers/srm/steamrommanager.ps1"',
      );
    } else if (system !== 'darwin') {
      setStatePage({ ...statePage, modal: modalData });
      ipcChannel.sendMessage(
        'emudeck',
        '"$toolsPath/launchers/srm/steamrommanager.sh"',
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
        '"$toolsPath/launchers/srm/steamrommanager.sh"',
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
      statusCopyGames: true,
    });
  };

  // Goes back to the import mode selector to add missing files
  const retryImport = () => {
    setStatePage((prev) => ({
      ...prev,
      mode: undefined,
      usbReady: undefined,
      statusCopyGames: null,
    }));
  };

  // Opens the import drive picker with options to refresh or continue without a backup
  const openImportPicker = () => {
    pickDrive('import', {
      footer: (refresh) => (
        <>
          <BtnSimple
            css="btn-simple--1"
            type="button"
            aria={t('CopyGamesPage.usb.noBackup')}
            onClick={() => {
              closeImportModal();
              setStatePage((prev) => ({ ...prev, usbReady: false }));
            }}
          >
            {t('CopyGamesPage.usb.noBackup')}
          </BtnSimple>
          <BtnSimple
            css="btn-simple--2"
            type="button"
            aria={t('CopyGamesPage.usb.refresh')}
            onClick={() => refresh()}
          >
            {t('CopyGamesPage.usb.refresh')}
          </BtnSimple>
        </>
      ),
    });
  };

  useEffect(() => {
    if (mode === 'auto' && usbReady === undefined && statusCopyGames === null) {
      openImportPicker();
    }
  }, [mode, usbReady]);

  // Goes back to the manual / automatic selector
  const backAuto = () => {
    setStatePage((prev) => ({ ...prev, mode: undefined, usbReady: undefined }));
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

  // Opens the Emulation folder and asks the user to confirm when the copy is done
  const openEmulationFolder = () => {
    ipcChannel.sendMessage('open-folder', `${storagePath}/Emulation`);

    const modalData = {
      active: true,
      header: <span className="h4">{t('CopyGamesPage.manualDone')}</span>,
      footer: (
        <>
          <BtnSimple
            css="btn-simple--2"
            type="button"
            aria={t('general.cancel')}
            onClick={() =>
              setStatePage((prev) => ({
                ...prev,
                modal: { active: false },
                mode: undefined,
              }))
            }
          >
            {t('general.cancel')}
          </BtnSimple>
          <BtnSimple
            css="btn-simple--1"
            type="button"
            aria={t('general.next')}
            onClick={() =>
              setStatePage((prev) => ({
                ...prev,
                modal: { active: false },
                statusCopyGames: true,
              }))
            }
          >
            {t('general.next')}
          </BtnSimple>
        </>
      ),
      css: 'emumodal--xs',
    };
    setStatePage({ ...statePage, modal: modalData });
  };

  return (
    <Wrapper aside={second === true}>
      {mode === 'auto' && statusCopyGames === null && (
        <>
          <Header />

          {usbReady === false && (
            <CopyGamesAuto
              onClickCreate={() =>
                pickDrive('export', {
                  title: t('CopyGamesPage.usb.select'),
                  onSelect: createUSB,
                })
              }
            />
          )}
        </>
      )}

      {mode === 'manual' && statusCopyGames === null && (
        <>
          <Header />
          <Main>
            <div className="container--grid">
              <div
                data-col-sm="6"
                style={{ position: 'sticky', top: 0, alignSelf: 'start' }}
              >
                <span className="h4">{t('CopyGamesPage.whereToCopy')}</span>
                <p
                  className="lead"
                  dangerouslySetInnerHTML={{
                    __html: t('CopyGamesPage.whereToCopyBody'),
                  }}
                />
                <p className="lead">{t('CopyGamesPage.whereToCopyReady')}</p>
                <BtnSimple
                  css="btn-simple--1"
                  type="button"
                  aria={t('aria.goNext')}
                  onClick={() => openEmulationFolder()}
                >
                  {t('CopyGamesPage.openEmulationFolder')}
                </BtnSimple>
              </div>
              <div data-col-sm="6">
                <RomsCheatSheet />
              </div>
            </div>
          </Main>
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

      {mode === undefined && statusCopyGames === null && (
        <>
          <Header title={t('CopyGamesPage.chooseTitle')} />
          <p className="lead">{t('CopyGamesPage.chooseDescription')}</p>

          <Main>
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
              ]}
            />
          </Main>
        </>
      )}

      {statusCopyGames === true && (
        <>
          <Header title={t('CopyGamesPage.biosTitle')} />
          <p className="lead">{t('CheckBiosPage.description')}</p>
          <CheckBios />
        </>
      )}

      {statusCopyGames === 'final' && (
        <>
          <Header />
          <Main>
            <div className="container--grid">
              <div data-col-md="3">
                <h1 className="h2">{t('CopyGamesPage.launchTitle')}</h1>
                {installFrontends.steam.status && (
                  <p className="lead">{t('CopyGamesPage.srmInfo')}</p>
                )}
                {installFrontends.esde.status && (
                  <p className="lead">{t('CopyGamesPage.esdeInfo')}</p>
                )}
              </div>
              <div data-col-md="9">
                {installFrontends.steam.status && (
                  <Video src="https://f005.backblazeb2.com/file/emudeck-assets/videos/BsqWFHPp5UU-SRM.mp4" />
                )}
                {installFrontends.esde.status && (
                  <Video src="https://f005.backblazeb2.com/file/emudeck-assets/videos/twNE8i3aI0g-ESDE.mp4" />
                )}
              </div>
            </div>
          </Main>
        </>
      )}
      <footer className="footer">
        {(mode === 'auto' || mode === 'manual') && statusCopyGames === null && (
          <BtnSimple
            css="btn-simple--2"
            type="button"
            aria={t('aria.goBack')}
            onClick={() => backAuto()}
          >
            {t('general.back')}
          </BtnSimple>
        )}
        {mode === 'auto' && statusCopyGames === null && usbReady === false && (
          <BtnSimple
            css="btn-simple--2"
            type="button"
            aria={t('aria.goNext')}
            onClick={() => finishAddingGames()}
          >
            {t('general.skip')}
          </BtnSimple>
        )}
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
        {statusCopyGames === 'final' &&
          !second &&
          installFrontends.steam.status &&
          !installFrontends.esde.status && (
            <BtnSimple
              css="btn-simple--2"
              type="button"
              aria={t('aria.goNext')}
              onClick={() => navigate('/hotkeys')}
            >
              {t('general.skip')}
            </BtnSimple>
          )}
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
            css="btn-simple--2"
            type="button"
            aria={t('CopyGamesPage.retryImport')}
            onClick={() => retryImport()}
          >
            {t('CopyGamesPage.retryImport')}
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
        {mode === undefined && statusCopyGames === null && !second && (
          <BtnSimple
            css="btn-simple--2"
            type="button"
            aria={t('aria.goNext')}
            onClick={() => finishAddingGames()}
          >
            {t('general.skip')}
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
      <EmuModal modal={importModal} />
    </Wrapper>
  );
}

export default CopyGamesPage;
