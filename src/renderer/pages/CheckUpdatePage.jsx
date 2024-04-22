import { useTranslation } from 'react-i18next';
import React, { useEffect, useState, useContext, useRef } from 'react';
import { GlobalContext } from 'context/globalContext';
import Wrapper from 'components/molecules/Wrapper/Wrapper';

import EmuModal from 'components/molecules/EmuModal/EmuModal';
import Header from 'components/organisms/Header/Header';
import ProgressBar from 'components/atoms/ProgressBar/ProgressBar';
import Kamek from 'components/organisms/Kamek/Kamek';

import { useNavigate } from 'react-router-dom';
import Main from 'components/organisms/Main/Main';

import { BtnSimple } from 'getbasecore/Atoms';

// Ask for branch
const branchFile = require('data/branch.json');

const { branch } = branchFile;

function CheckUpdatePage() {
  const { t, i18n } = useTranslation();
  const ipcChannel = window.electron.ipcRenderer;
  const { state, setState, setStateCurrentConfigs } = useContext(GlobalContext);
  const [statePage, setStatePage] = useState({
    disabledNext: true,
    disabledBack: true,
    downloadComplete: !navigator.onLine ? true : null,
    update: null,
    cloned: null,
    data: '',
    dom: undefined,
    modal: {
      active: true,
      header: <span className="h4">{t('CheckUpdatePage.checking.title')}</span>,
      body: <p>{t('CheckUpdatePage.checking.description')}</p>,
      footer: <ProgressBar css="progress--success" infinite max="100" />,
      css: 'emumodal--xs emumodal--loading',
    },
  });

  const statePageRef = useRef(statePage);
  statePageRef.current = statePage;
  const { downloadComplete, cloned, update, modal } = statePageRef.current;
  const navigate = useNavigate();
  const updateRef = useRef(update);
  updateRef.current = update;

  const downloadCompleteRef = useRef(downloadComplete);
  downloadCompleteRef.current = downloadComplete;

  const {
    system,
    second,
    installEmus,
    installFrontends,
    overwriteConfigEmus,
    shaders,
    achievements,
  } = state;

  let updateTimeOut;
  let pullTimeOut;
  let cloneTimeOut;
  // Darwin terminal permissions
  useEffect(() => {
    if (system === 'darwin' && second === false) {
      ipcChannel.sendMessage('bash-nolog', [
        `osascript -e 'tell app "Terminal" to do script "pwd && exit"'`,
      ]);
    }
  }, [system]);

  const showLog = (system) => {
    if (system === 'win32') {
      ipcChannel.sendMessage('bash-nolog', [
        `start powershell -NoExit -ExecutionPolicy Bypass -command "& { Get-Content $env:USERPROFILE/emudeck/logs/git.log -Tail 100 -Wait }"`,
      ]);
    } else if (system === 'darwin') {
      ipcChannel.sendMessage('bash-nolog', [
        `osascript -e 'tell app "Terminal" to do script "clear && tail -f $HOME/emudeck/logs/git.log"'`,
      ]);
    } else {
      ipcChannel.sendMessage('bash-nolog', [
        `konsole -e tail -f "$HOME/emudeck/logs/git.log"`,
      ]);
    }
  };

  useEffect(() => {
    // Update timeout + Force clone check

    updateTimeOut = setTimeout(() => {
      setStatePage({
        ...statePage,
        update: 'up-to-date',
      });
      updateFiles();
    }, 10000);

    if (navigator.onLine) {
      ipcChannel.sendMessage('update-check');

      ipcChannel.once('update-check-out', (message) => {
        // We clear the timeout
        clearTimeout(updateTimeOut);

        const doUpdate = () => {
          ipcChannel.sendMessage('update-start');

          ipcChannel.once('update-check-out', (message) => {
            if (message[0] === 'updating') {
              const modalData = {
                active: true,
                header: (
                  <span className="h4">
                    🎉 {t('CheckUpdatePage.updating.title')} 🎉
                  </span>
                ),
                body: (
                  <p className="h5">
                    {t('CheckUpdatePage.updating.description')}
                  </p>
                ),
                footer: (
                  <ProgressBar css="progress--success" infinite max="100" />
                ),
                css: 'emumodal--xs emumodal--loading',
              };
              setStatePage({
                ...statePage,
                modal: modalData,
              });
            }
          });
        };

        let modalData;
        if (message[0] === 'updating') {
          modalData = {
            active: true,
            header: (
              <span className="h4">
                🎉 {t('CheckUpdatePage.updating.title')} 🎉
              </span>
            ),
            body: <p className="h5">{t('CheckUpdatePage.updating.title')}</p>,
            footer: <ProgressBar css="progress--success" infinite max="100" />,
            css: 'emumodal--xs emumodal--loading',
          };
        }

        if (message[0] === 'update-available') {
          modalData = {
            active: true,
            header: (
              <span className="h4">
                🎉{t('CheckUpdatePage.found.title')} 🎉
              </span>
            ),
            body: (
              <p
                className="lead"
                dangerouslySetInnerHTML={{
                  __html: t('CheckUpdatePage.found.description'),
                }}
              />
            ),
            footer: (
              <div>
                <BtnSimple
                  css="btn-simple--1"
                  type="button"
                  aria="Yes"
                  style={{ marginBottom: 0 }}
                  onClick={() => doUpdate()}
                >
                  {t('general.yes')}
                </BtnSimple>
                <BtnSimple
                  css="btn-simple--2"
                  type="link"
                  aria={t('CheckUpdatePage.found.changelog')}
                  target="_blank"
                  href="https://emudeck.github.io/blog/"
                >
                  {t('CheckUpdatePage.found.changelog')}
                </BtnSimple>
                <BtnSimple
                  css="btn-simple--3"
                  type="button"
                  aria="No"
                  style={{ marginBottom: 0 }}
                  onClick={() => cancelUpdate()}
                >
                  {t('general.no')}
                </BtnSimple>
              </div>
            ),
            css: 'emumodal--sm',
          };
        }

        setStatePage({
          ...statePage,
          update: message[0],
          data: message[1],
          modal: modalData,
        });
        if (message[0] === 'up-to-date') {
          updateFiles();
        } else {
        }
      });
    } else {
      clearTimeout(updateTimeOut);
      setStatePage({
        ...statePage,
        update: 'up-to-date',
      });
    }

    const cancelUpdate = () => {
      updateFiles();
      setStatePage({
        ...statePage,
        update: 'up-to-date',
      });
    };

    const updateFiles = () => {
      // Get latest settings versions in storage
      const currentVersions = JSON.parse(
        localStorage.getItem('current_versions')
      );
      if (currentVersions) {
        setStateCurrentConfigs({ ...currentVersions });
      }

      const settingsStorage = JSON.parse(
        localStorage.getItem('settings_emudeck')
      );

      if (settingsStorage) {
        const shadersStored = settingsStorage.shaders;
        const overwriteConfigEmusStored = settingsStorage.overwriteConfigEmus;
        const achievementsStored = settingsStorage.achievements;
        delete settingsStorage.patreonToken; // We  prevent the token to be overwritten;
        delete settingsStorage.installEmus.esde;
        delete settingsStorage.installEmus.pegasus;
        delete settingsStorage.installEmus.primehacks;
        delete settingsStorage.installEmus.melonDS;
        delete settingsStorage.installEmus.cemunative;
        delete settingsStorage.overwriteConfigEmus.primehacks;
        delete settingsStorage.installEmus.ares;
        delete settingsStorage.overwriteConfigEmus.ares;
        delete settingsStorage.android;
        const installEmusStored = settingsStorage.installEmus;
        const installFrontendsStored = settingsStorage.installFrontends;

        if (system === 'darwin') {
          delete settingsStorage.installEmus.ares;
          delete settingsStorage.installEmus.cemu;
          delete settingsStorage.installEmus.citra;
          delete settingsStorage.installEmus.dolphin;
          delete settingsStorage.installEmus.duckstation;
          delete settingsStorage.installEmus.flycast;
          delete settingsStorage.installEmus.mame;
          delete settingsStorage.installEmus.melonds;
          delete settingsStorage.installEmus.mgba;
          delete settingsStorage.installEmus.pcsx2;
          delete settingsStorage.installEmus.ppsspp;
          delete settingsStorage.installEmus.primehack;
          delete settingsStorage.installEmus.rmg;
          delete settingsStorage.installEmus.rpcs3;
          delete settingsStorage.installEmus.ryujinx;
          delete settingsStorage.installEmus.scummvm;
          delete settingsStorage.installEmus.vita3k;
          delete settingsStorage.installEmus.xemu;
          delete settingsStorage.installEmus.xenia;
          delete settingsStorage.installEmus.yuzu;

          delete settingsStorage.overwriteConfigEmus.ares;
          delete settingsStorage.overwriteConfigEmus.cemu;
          delete settingsStorage.overwriteConfigEmus.citra;
          delete settingsStorage.overwriteConfigEmus.dolphin;
          delete settingsStorage.overwriteConfigEmus.duckstation;
          delete settingsStorage.overwriteConfigEmus.flycast;
          delete settingsStorage.overwriteConfigEmus.mame;
          delete settingsStorage.overwriteConfigEmus.melonds;
          delete settingsStorage.overwriteConfigEmus.mgba;
          delete settingsStorage.overwriteConfigEmus.pcsx2;
          delete settingsStorage.overwriteConfigEmus.ppsspp;
          delete settingsStorage.overwriteConfigEmus.primehack;
          delete settingsStorage.overwriteConfigEmus.rmg;
          delete settingsStorage.overwriteConfigEmus.rpcs3;
          delete settingsStorage.overwriteConfigEmus.ryujinx;
          delete settingsStorage.overwriteConfigEmus.scummvm;
          delete settingsStorage.overwriteConfigEmus.vita3k;
          delete settingsStorage.overwriteConfigEmus.xemu;
          delete settingsStorage.overwriteConfigEmus.xenia;
          delete settingsStorage.overwriteConfigEmus.yuzu;
        }

        if (!settingsStorage.overwriteConfigEmus.esde) {
          settingsStorage.overwriteConfigEmus.esde = {
            esde: { id: 'esde', status: true, name: 'EmulationStation DE' },
          };
        }

        if (
          settingsStorage.emulatorAlternative &&
          settingsStorage.emulatorAlternative.nds === 'melonDS'
        ) {
          delete settingsStorage.emulatorAlternative.nds;
          settingsStorage.emulatorAlternative.nds = 'melonds';
        }

        if (settingsStorage.themeESDE === 'EPICNOIR') {
          delete settingsStorage.themeESDE;
          settingsStorage.themeESDE = [
            'https://github.com/anthonycaccese/epic-noir-revisited-es-de.git',
            'epic-noir-revisited-es-de',
          ];
        }

        if (settingsStorage.themePegasus === 'gameOS') {
          delete settingsStorage.themePegasus;
          settingsStorage.themePegasus = [
            'https://github.com/PlayingKarrde/gameOS.git',
            'gameOS',
          ];
        }
        // Theres probably a better way to do this...

        ipcChannel.sendMessage('version');

        ipcChannel.once('version-out', (version) => {
          ipcChannel.sendMessage('system-info-in');
          ipcChannel.once('system-info-out', (platform) => {
            console.log({
              system: platform,
              version: version[0],
              gamemode: version[1],
            });
            let systemNameValue;
            switch (platform) {
              case 'darwin':
                systemNameValue = '\uF8FF';
                break;
              case 'win32':
                systemNameValue = 'Windows';
                break;
              case 'SteamOS':
                systemNameValue = 'SteamOS';
                break;
              case 'ChimeraOS':
                systemNameValue = 'ChimeraOS';
                break;
              case 'chimeraOS':
                systemNameValue = 'ChimeraOS';
                break;
              case '':
                systemNameValue = 'ERROR';
                break;
              case null:
                systemNameValue = 'ERROR';
                break;
              case undefined:
                systemNameValue = 'ERROR';
                break;
              default:
                systemNameValue = 'Linux';
                break;
            }

            setState({
              ...state,
              ...settingsStorage,
              installEmus: { ...installEmus, ...installEmusStored },
              installFrontends: {
                ...installFrontends,
                ...installFrontendsStored,
              },
              overwriteConfigEmus: {
                ...overwriteConfigEmus,
                ...overwriteConfigEmusStored,
              },
              achievements: {
                ...achievements,
                ...achievementsStored,
              },
              shaders: { ...shaders, ...shadersStored },
              system: platform,
              systemName: systemNameValue,
              version: version[0],
              gamemode: version[1],
              branch,
            });
          });
        });
      } else {
        ipcChannel.sendMessage('version');
        ipcChannel.once('version-out', (version) => {
          ipcChannel.sendMessage('system-info-in');
          ipcChannel.once('system-info-out', (platform) => {
            console.log({
              system: platform,
              version: version[0],
              gamemode: version[1],
              branch,
            });
            let systemNameValue;
            switch (platform) {
              case 'darwin':
                systemNameValue = '\uF8FF';
                break;
              case 'win32':
                systemNameValue = 'Windows';
                break;
              case 'SteamOS':
                systemNameValue = 'SteamOS';
                break;
              case 'ChimeraOS':
                systemNameValue = 'ChimeraOS';
                break;
              case 'chimeraOS':
                systemNameValue = 'ChimeraOS';
                break;
              case '':
                systemNameValue = 'ERROR';
                break;
              case null:
                systemNameValue = 'ERROR';
                break;
              case undefined:
                systemNameValue = 'ERROR';
                break;
              default:
                systemNameValue = 'Linux';
                break;
            }
            setState({
              ...state,
              system: platform,
              systemName: systemNameValue,
              version: version[0],
              gamemode: version[1],
              branch,
            });
          });
        });
      }
    };
  }, []);

  useEffect(() => {
    //
    // Cloning project
    //

    // Force changelog after update
    if (update === 'updating') {
      localStorage.setItem('show_changelog', true);
    }
    if (update === 'up-to-date') {
      // is the git repo cloned?

      const modalDataGit = {
        active: true,
        header: <span className="h4">{t('CheckUpdatePage.backend')}</span>,
        body: '',
        footer: <ProgressBar css="progress--success" infinite max="100" />,
        css: 'emumodal--xs emumodal--loading',
      };

      setStatePage({
        ...statePage,
        modal: modalDataGit,
      });
    }
  }, [update, system]);

  // We clone / pull
  useEffect(() => {
    if (navigator.onLine) {
      ipcChannel.sendMessage('git-magic', branch);
      ipcChannel.once('git-magic', (status) => {
        if (status === 'success') {
          setStatePage({
            ...statePage,
            downloadComplete: true,
            modal: false,
          });
        } else {
          const modalData = {
            active: true,
            header: (
              <span className="h4">{t('CheckUpdatePage.error.title')} 😞</span>
            ),
            body: <p>{t('CheckUpdatePage.error.description')}</p>,
            footer: <span></span>,
            css: 'emumodal--xs',
          };

          setStatePage({
            ...statePage,
            modal: modalData,
          });
        }
      });
    } else {
      alert(
        "Internet not detected. EmuDeck will run in Offline Mode, you can upload your settings but you can't use Steam Rom Manager"
      );
      setStatePage({
        ...statePage,
        downloadComplete: true,
        modal: false,
      });
    }
  }, []);

  useEffect(() => {
    if (downloadComplete === true) {
      navigate('/welcome');
    }
  }, [downloadComplete]);

  return (
    <div style={{ height: '100vh' }}>
      <Wrapper css="wrapper__full" aside={false}>
        <Kamek />
        <Header title={t('CheckUpdatePage.title')} />
        <EmuModal modal={modal} />
      </Wrapper>
    </div>
  );
}

export default CheckUpdatePage;
