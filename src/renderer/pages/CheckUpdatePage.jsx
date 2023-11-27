import React, { useEffect, useState, useContext, useRef } from 'react';
import { GlobalContext } from 'context/globalContext';
import Wrapper from 'components/molecules/Wrapper/Wrapper';
import GamePad from 'components/organisms/GamePad/GamePad';
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
  const { downloadComplete, cloned, update, modal, dom } = statePage;
  const navigate = useNavigate();
  const updateRef = useRef(update);
  updateRef.current = update;

  const downloadCompleteRef = useRef(downloadComplete);
  downloadCompleteRef.current = downloadComplete;

  const {
    system,
    second,
    installEmus,
    overwriteConfigEmus,
    shaders,
    achievements,
  } = state;

  let updateTimeOut;
  // Darwin terminal permissions
  useEffect(() => {
    if (system === 'darwin' && second === false) {
      ipcChannel.sendMessage('bash-nolog', [
        `osascript -e 'tell app "Terminal" to do script "pwd && exit"'`,
      ]);
    }
  }, [system]);

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
        if (message[0] == 'updating') {
          modalData = {
            active: true,
            header: <span className="h4">🎉 Update found! 🎉</span>,
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

    const updateFiles = () => {
      const currentVersions = JSON.parse(
        localStorage.getItem('current_versions_beta')
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
        delete settingsStorage.installEmus.primehacks;
        delete settingsStorage.installEmus.melonDS;
        delete settingsStorage.installEmus.cemunative;
        delete settingsStorage.overwriteConfigEmus.primehacks;
        const installEmusStored = settingsStorage.installEmus;

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

        if (settingsStorage.emulatorAlternative.nds === 'melonDS') {
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

        console.log(settingsStorage.emulatorAlternative.nds);

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
            onClick={() => showLog()}
          >
            Open detailed log
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
        console.log({ error, stdout, stderr });
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
  }, [update]);

  useEffect(() => {
    // settings here
    if (cloned === false) {
      // alert('cloneFalse');
      if (navigator.onLine) {
        ipcChannel.sendMessage(`clone`, branch);

        ipcChannel.once('clone', (error, cloneStatusClone, stderr) => {
          if (cloneStatusClone.includes('true')) {
            setStatePage({ ...statePage, downloadComplete: true });
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
        ipcChannel.sendMessage('pull', branch);

        ipcChannel.once('pull', (error, stdout, stderr) => {
          // alert(error, stdout, stderr);
          console.log({ error, stdout, stderr });
          setStatePage({ ...statePage, downloadComplete: true });
          // Update timeout
        });
      } else {
        alert("There's been an issue. Please restart EmuDeck and try again");
        setStatePage({ ...statePage, downloadComplete: true });
      }
    }
  }, [cloned]);

  useEffect(() => {
    if (downloadComplete === true) {
      if (second) {
        navigate('/emulators');
      } else {
        navigate('/welcome');
      }
    }
  }, [downloadComplete]);

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
      <Wrapper css="wrapper__full" aside={false}>
        <Kamek />
        <Header title="EmuDeck is loading..." />
        <EmuModal modal={modal} />
      </Wrapper>
    </div>
  );
}

export default CheckUpdatePage;
