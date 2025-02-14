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
      header: <span className="h4">Checking for updates...</span>,
      body: (
        <p>
          Please stand by while we check if there is a new version available...
        </p>
      ),
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
    android,
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
        `start powershell -NoExit -ExecutionPolicy Bypass -command "& { Get-Content $env:APPDATA/emudeck/logs/git.log -Tail 100 -Wait }"`,
      ]);
    } else if (system === 'darwin') {
      ipcChannel.sendMessage('bash-nolog', [
        `osascript -e 'tell app "Terminal" to do script "clear && tail -f $HOME/.config/EmuDeck/logs/git.log"'`,
      ]);
    } else {
      ipcChannel.sendMessage('bash-nolog', [
        `konsole -e tail -f "$HOME/.config/EmuDeck/logs/git.log"`,
      ]);
    }
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
      delete settingsStorage.installEmus.esde;
      delete settingsStorage.installEmus.pegasus;
      delete settingsStorage.installEmus.primehacks;
      delete settingsStorage.installEmus.melonDS;
      delete settingsStorage.installEmus.cemunative;
      delete settingsStorage.overwriteConfigEmus.primehacks;
      delete settingsStorage.installEmus.ares;
      delete settingsStorage.overwriteConfigEmus.ares;
      delete settingsStorage.android.installEmus.citrammj;
      delete settingsStorage.android.overwriteConfigEmus.citra;
      delete settingsStorage.android.overwriteConfigEmus.citrammj;
      delete settingsStorage.installFrontends;
      const installEmusStored = settingsStorage.installEmus;
      // const installFrontendsStored = settingsStorage.installFrontends;

      if (system === 'darwin') {
        delete settingsStorage.installEmus.ares;
        delete settingsStorage.installEmus.cemu;
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
        delete settingsStorage.installEmus.citron;

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
        delete settingsStorage.overwriteConfigEmus.citron;
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
            android: { ...android },
            installEmus: { ...installEmus, ...installEmusStored },
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

        let modalData;
        if (message[0] === 'updating') {
          modalData = {
            active: true,
            header: <span className="h4">🎉 Updating! 🎉</span>,
            body: (
              <p className="h5">
                EmuDeck will restart as soon as it finishes the update. Hold on
                tight.
              </p>
            ),
            footer: <ProgressBar css="progress--success" infinite max="100" />,
            css: 'emumodal--xs emumodal--loading',
          };
        }

        if (message[0] === 'update-available') {
          modalData = {
            active: true,
            header: <span className="h4">🎉 Update found! 🎉</span>,
            body: (
              <p className="lead">
                Do you want to update? <br />
                <strong>This update won't modify your games or settings</strong>
                <br />
                Please go to Manage Emulators to apply all the new
                configurations.
              </p>
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
                  Yes
                </BtnSimple>
                <BtnSimple
                  css="btn-simple--2"
                  type="link"
                  aria="See Changelog"
                  target="_blank"
                  href="https://emudeck.github.io/blog/"
                >
                  See Changelog
                </BtnSimple>
                <BtnSimple
                  css="btn-simple--3"
                  type="button"
                  aria="No"
                  style={{ marginBottom: 0 }}
                  onClick={() => cancelUpdate()}
                >
                  No
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
      updateFiles();
      clearTimeout(updateTimeOut);
      setStatePage({
        ...statePage,
        update: 'up-to-date',
      });
    }

    const doUpdate = () => {
      ipcChannel.sendMessage('update-start');

      ipcChannel.once('update-check-out', (message) => {
        if (message[0] === 'updating') {
          const modalData = {
            active: true,
            header: <span className="h4">🎉 Updating! 🎉</span>,
            body: (
              <p className="h5">
                EmuDeck will restart as soon as it finishes the update. Hold on
                tight.
              </p>
            ),
            footer: <ProgressBar css="progress--success" infinite max="100" />,
            css: 'emumodal--xs emumodal--loading',
          };
          setStatePage({
            ...statePage,
            modal: modalData,
          });
        }
      });
    };

    const cancelUpdate = () => {
      updateFiles();
      setStatePage({
        ...statePage,
        update: 'up-to-date',
      });
    };

    // ipcChannel.sendMessage('clean-log');

    //  setTimeout(() => {

    // ipcChannel.sendMessage('update-check');

    // ipcChannel.once('update-check-out', (message) => {
    //
    //
    //   setStatePage({
    //     ...statePage,
    //     update: message[0],
    //     data: message[1],
    //   });
    // });

    //  }, 500);
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
        header: (
          <span className="h4">
            Building EmuDeck backend and running autodiagnostics in the
            background...
          </span>
        ),
        body: <ProgressBar css="progress--success" infinite max="100" />,
        footer: (
          <BtnSimple
            css="btn-simple--1"
            type="button"
            aria="Show log"
            disabled={false}
            style={{ marginBottom: 0 }}
            onClick={() => showLog(system)}
          >
            See more details
          </BtnSimple>
        ),
        css: 'emumodal--xs emumodal--loading',
      };

      // setStatePage({
      //   ...statePage,
      //   modal: modalDataGit,
      // });

      ipcChannel.sendMessage('check-git');
      ipcChannel.once('check-git', (error, stdout, stderr) => {
        // alert('checking git');
        const cloneStatusCheck = stdout.replace('\n', '');
        let cloneStatusCheckValue;

        if (cloneStatusCheck.includes('true')) {
          cloneStatusCheckValue = true;
        } else {
          cloneStatusCheckValue = false;
        }

        setStatePage({
          ...statePage,
          cloned: cloneStatusCheckValue,
          modal: modalDataGit,
        });
      });
    }
  }, [update, system]);

  useEffect(() => {
    // settings here
    if (cloned === false) {
      // alert('cloneFalse');
      if (navigator.onLine) {
        ipcChannel.sendMessage(`clone`, branch);
        cloneTimeOut = setTimeout(() => {
          ipcChannel.sendMessage('check-git-status', branch);
          ipcChannel.once('check-git-status', (error) => {
            if (error.includes('not a git directory')) {
              // alert('There seems to be an issue, please restart EmuDeck');
              const modalData = {
                active: true,
                header: <span className="h4">Ooops 😞</span>,
                body: (
                  <p>
                    There seems to be an issue building the backend. Please
                    restart EmuDeck if this screen doesn't dissapear in about 5
                    seconds
                  </p>
                ),
                css: 'emumodal--xs',
              };
              setStatePage({ ...statePageRef.current, modal: modalData });
            } else {
              setStatePage({ ...statePageRef.current, downloadComplete: true });
            }
          });
        }, 60000);
        ipcChannel.once('clone', (error, cloneStatusClone) => {
          if (cloneStatusClone.includes('true')) {
            clearTimeout(cloneTimeOut);
            setStatePage({ ...statePage, downloadComplete: true });
            console.log({ downloadComplete });
          }
        });
      } else {
        const modalData = {
          active: true,
          header: <span className="h4">Ooops 😞</span>,
          body: <p>You need to be connected to the internet.</p>,
          css: 'emumodal--xs emumodal--loading',
        };
        setStatePage({
          ...statePage,
          modal: modalData,
        });
      }
    } else if (cloned === true) {
      // alert('cloned true');
      if (navigator.onLine) {
        // alert(branch);

        console.log(`GIT PULL ${branch}`);
        ipcChannel.sendMessage('pull', branch);
        pullTimeOut = setTimeout(() => {
          ipcChannel.sendMessage('check-git-status', branch);
          ipcChannel.once('check-git-status', (error) => {
            console.log({ error });
            if (error.includes('Your branch is up to date')) {
              setStatePage({ ...statePageRef.current, downloadComplete: true });
            } else {
              const modalData = {
                active: true,
                header: <span className="h4">Ooops 😞</span>,
                body: (
                  <p>
                    There's been an issue building the backend, please restart
                    EmuDeck if this screen doesn't dissapear in about 5 seconds.
                  </p>
                ),
                footer: '',
                css: 'emumodal--xs',
              };
              setStatePage({
                ...statePageRef.current,
                modal: modalData,
              });
            }
          });
        }, 20000);
        ipcChannel.once('pull', (error, stdout, stderr) => {
          console.log('GIT PULL response');
          console.log({ error, stdout, stderr });

          updateTimeOut = setTimeout(() => {
            clearTimeout(pullTimeOut);
            setStatePage({ ...statePageRef.current, downloadComplete: true });
          }, 1000);
        });
      } else {
        setStatePage({ ...statePage, downloadComplete: true });
      }
    }
  }, [cloned]);

  useEffect(() => {
    console.log({ downloadComplete });
    if (downloadComplete === true) {
      if (navigator.onLine) {
        navigate('/welcome');
      } else {
        navigate('/settings');
      }
    }
  }, [downloadComplete]);

  return (
    <Wrapper css="wrapper__full" aside={false}>
      <Kamek />
      <Header title="EmuDeck is loading..." />
      <EmuModal modal={modal} />
    </Wrapper>
  );
}

export default CheckUpdatePage;
