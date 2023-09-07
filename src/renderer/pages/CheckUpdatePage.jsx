import React, { useEffect, useState, useContext, useRef } from 'react';
import { GlobalContext } from 'context/globalContext';
import Wrapper from 'components/molecules/Wrapper/Wrapper';
import EmuModal from 'components/molecules/EmuModal/EmuModal';
import Header from 'components/organisms/Header/Header';
import Footer from 'components/organisms/Footer/Footer';
import ProgressBar from 'components/atoms/ProgressBar/ProgressBar';

import { useNavigate } from 'react-router-dom';
import { Alert, Form } from 'getbasecore/Molecules';
import Main from 'components/organisms/Main/Main';
import Card from 'components/molecules/Card/Card';

import { BtnSimple, FormInputSimple, LinkSimple } from 'getbasecore/Atoms';
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
    modal: {
      active: true,
      header: <span className="h4">Checking for updates...</span>,
      body: (
        <p>
          Please stand by while we check if there is a new version available...
        </p>
      ),
      footer: <ProgressBar css="progress--success" infinite={true} max="100" />,
      css: 'emumodal--xs',
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
            footer: (
              <ProgressBar css="progress--success" infinite={true} max="100" />
            ),
            css: 'emumodal--xs',
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

        
        

        delete settingsStorage.installEmus.primehacks;
        delete settingsStorage.installEmus.cemunative;
        delete settingsStorage.overwriteConfigEmus.primehacks;
        const installEmusStored = settingsStorage.installEmus;

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
            setState({
              ...state,
              system: platform,
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

      const modalData = {
        active: true,
        header: <span className="h4">Building EmuDeck backend...</span>,
        body: (
          <>
            <p>
              Please wait a few seconds
              <br />
              <br />
            </p>
            <BtnSimple
              css="btn-simple--3"
              type="link"
              target="_blank"
              aria="Next"
              href={
                system === 'win32'
                  ? 'https://emudeck.github.io/common-issues/windows/#emudeck-is-stuck-on-the-checking-for-updates-message'
                  : 'https://emudeck.github.io/frequently-asked-questions/steamos/#why-is-emudeck-not-downloading'
              }
              onClick={() => closeModal()}
            >
              Help!, I'm stuck
            </BtnSimple>
          </>
        ),
        footer: (
          <ProgressBar css="progress--success" infinite={true} max="100" />
        ),
        css: 'emumodal--xs',
      };

      setStatePage({
        ...statePage,
        modal: modalData,
      });

      
      ipcChannel.sendMessage('check-git');
      ipcChannel.once('check-git', (error, cloneStatusCheck, stderr) => {
        
        
        
        cloneStatusCheck = cloneStatusCheck.replace('\n', '');
        cloneStatusCheck.includes('true')
          ? (cloneStatusCheck = true)
          : (cloneStatusCheck = false);
        setStatePage({
          ...statePage,
          cloned: cloneStatusCheck,
        });
      });
    }
  }, [update]);

  useEffect(() => {
    // settings here

    if (cloned === false) {
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
          css: 'emumodal--xs',
        };
        setStatePage({
          ...statePage,
          modal: modalData,
        });
      }
    } else if (cloned === true) {
      if (navigator.onLine) {
        ipcChannel.sendMessage('pull', branch);
        
        ipcChannel.once('pull', (error, pullStatus, stderr) => {
          
          
          
          setStatePage({ ...statePage, downloadComplete: true });
          // Update timeout
        });
      } else {
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
      //scrollToBottom();
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

  return (
    <Wrapper>
      {update === 'up-to-date' && (
        <>
          <Header title="EmuDeck Git cloning log" />
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
                  >
                    Wiki FAQ
                  </a>
                )}
              </p>

              <ProgressBar css="progress--success" infinite={true} max="100" />
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
        </>
      )}
      <EmuModal modal={modal} />
    </Wrapper>
  );
}

export default CheckUpdatePage;
