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
  const {
    disabledNext,
    disabledBack,
    downloadComplete,
    data,
    cloned,
    update,
    modal,
    dom,
  } = statePage;
  const navigate = useNavigate();

  const {
    device,
    system,
    mode,
    command,
    second,
    installEmus,
    overwriteConfigEmus,
    shaders,
    achievements,
  } = state;

  const updateRef = useRef(update);
  updateRef.current = update;

  const downloadCompleteRef = useRef(downloadComplete);
  downloadCompleteRef.current = downloadComplete;

  const closeModal = () => {
    setStatePage({
      ...statePage,
      modal: false,
    });
  };
  // Darwin terminal permissions
  useEffect(() => {
    if (system === 'darwin') {
      ipcChannel.sendMessage('bash-nolog', [
        `osascript -e 'tell app "Terminal" to do script "pwd && exit"'`,
      ]);
    }
  }, [system]);

  let updateTimeOut;

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
        body: (
          <p>
            Please wait a few seconds,{' '}
            <strong>if this takes too long restart EmuDeck.</strong>
          </p>
        ),
        footer: <ProgressBar css="progress--success" infinite max="100" />,
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
        // alert('cloned desconocido');
        setStatePage({ ...statePage, downloadComplete: true });
      }
    }
  }, [cloned]);

  useEffect(() => {
    if (downloadComplete === true) {
      navigate('/welcome');
    }
  }, [downloadComplete]);

  let pollingTime = 500;
  if (system === 'win32') {
    pollingTime = 2000;
  }

  const [msg, setMsg] = useState({
    messageLog: '',
    percentage: 0,
  });

  const { messageLog } = msg;
  const messageLogRef = useRef(messageLog);
  messageLogRef.current = messageLog;

  const readMSG = () => {
    ipcChannel.sendMessage('getMSG', []);
    ipcChannel.on('getMSG', (messageInput) => {
      const messageText = messageInput.stdout;
      setMsg({ messageLog: messageText });
      // scrollToBottom();
    });
  };

  // Reading messages from backend
  useEffect(() => {
    const interval = setInterval(() => {
      readMSG();
      const messageLogCurrent = messageLogRef.current;
      if (messageLogCurrent.includes('done')) {
        clearInterval(interval);
      } else {
      }
    }, pollingTime);

    return () => clearInterval(interval);
  }, []);

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
      <Wrapper>
        <Kamek />
        <Header title="EmuDeck is loading..." />
        {update === 'up-to-date' && (
          <Main>
            <>
              <p className="lead">
                If you can't get past this screen send us the log down bellow{' '}
                {system === 'win32' && (
                  <a
                    target="_blank"
                    className="https://emudeck.github.io/common-issues/windows/#emudeck-is-stuck-on-the-checking-for-updates-message"
                  >
                    Wiki FAQ
                  </a>
                )}
                {system !== 'win32' && (
                  <a
                    target="_blank"
                    className="link-simple link-simple--1"
                    href="https://emudeck.github.io/frequently-asked-questions/steamos/#why-is-emudeck-not-downloading"
                    rel="noreferrer"
                  >
                    Wiki FAQ
                  </a>
                )}
              </p>

              <ProgressBar css="progress--success" infinite max="100" />
            </>

            <code
              style={{
                fontSize: '14px',
                Height: '100%',
                overflow: 'auto',
                whiteSpace: 'pre-line',
              }}
            >
              {messageLog}
            </code>
          </Main>
        )}
        <EmuModal modal={modal} />
      </Wrapper>
    </div>
  );
}

export default CheckUpdatePage;
