import React, { useEffect, useState, useContext, useRef } from 'react';
import { GlobalContext } from 'context/globalContext';
import { useNavigate } from 'react-router-dom';
import Welcome from 'components/organisms/Wrappers/Welcome.js';
import Footer from 'components/organisms/Footer/Footer.js';
import Header from 'components/organisms/Header/Header.js';
import Aside from 'components/organisms/Aside/Aside.js';
import Main from 'components/organisms/Main/Main.js';
import { BtnSimple, ProgressBar } from 'getbasecore/Atoms';
import { Alert } from 'getbasecore/Molecules';

import {
  BtnSimple,
  ProgressBar,
  FormInputSimple,
  LinkSimple,
} from 'getbasecore/Atoms';
import { Form } from 'getbasecore/Molecules';

import Card from 'components/molecules/Card/Card.js';
const CheckUpdatePage = () => {
  const ipcChannel = window.electron.ipcRenderer;
  const { state, setState } = useContext(GlobalContext);
  const [statePage, setStatePage] = useState({
    disabledNext: true,
    disabledBack: true,
    downloadComplete: !navigator.onLine ? true : null,
    update: null,
    cloned: null,
    data: '',
  });
  const { disabledNext, disabledBack, downloadComplete, data, cloned, update } =
    statePage;
  const navigate = useNavigate();

  const {
    device,
    system,
    mode,
    command,
    second,
    branch,
    installEmus,
    overwriteConfigEmus,
    shaders,
    achievements,
  } = state;

  const updateRef = useRef(update);
  updateRef.current = update;

  const downloadCompleteRef = useRef(downloadComplete);
  downloadCompleteRef.current = downloadComplete;

  //Download files
  const [counter, setCounter] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setCounter((prevCounter) => {
        if (prevCounter === 110) {
          prevCounter = -10;
        }
        return prevCounter + 1;
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    //Update timeout + Force clone check
    console.log('UPDATE - SETTING TIMER FOR TIMEOUT');
    const myTimeout = setTimeout(() => {
      console.log('UPDATE - TIMEOUT REACHED!');
      setStatePage({
        ...statePage,
        update: 'up-to-date',
      });
      updateFiles();
    }, 10000);

    console.log('UPDATE - CHECKING');
    ipcChannel.sendMessage('update-check');
    console.log('UPDATE - WAITING');
    ipcChannel.once('update-check-out', (message) => {
      console.log('UPDATE - GETTING INFO:');
      console.log({ message });
      setStatePage({
        ...statePage,
        update: message[0],
        data: message[1],
      });
      if (message[0] == 'up-to-date') {
        updateFiles();
      }
    });

    const updateFiles = () => {
      //Ask for branch
      const branch = require('data/branch.json');

      const settingsStorage = JSON.parse(
        localStorage.getItem('settings_emudeck')
      );
      //console.log({ settingsStorage });
      if (!!settingsStorage) {
        const shadersStored = settingsStorage.shaders;
        const overwriteConfigEmusStored = settingsStorage.overwriteConfigEmus;
        const achievementsStored = settingsStorage.achievements;

        console.log({ overwriteConfigEmusStored });
        console.log({ overwriteConfigEmus });
        const installEmusStored = settingsStorage.installEmus;
        //Theres probably a better way to do this...
        console.log('2 - VERSION - CHECKING');
        ipcChannel.sendMessage('version');

        ipcChannel.once('version-out', (version) => {
          console.log('2 - VERSION - GETTING');
          console.log({ version });
          ipcChannel.sendMessage('system-info-in');
          ipcChannel.once('system-info-out', (platform) => {
            console.log('2 - VERSION - GETTING SYSTEM TOO');
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
              branch: branch.branch,
            });
          });
        });
      } else {
        console.log('1 - VERSION - CHECKING');
        ipcChannel.sendMessage('version');
        ipcChannel.once('version-out', (version) => {
          console.log('1 - VERSION - GETTING');
          ipcChannel.sendMessage('system-info-in');
          ipcChannel.once('system-info-out', (platform) => {
            console.log('1 - VERSION - GETTING SYSTEM TOO');
            console.log({
              system: platform,
              version: version[0],
              gamemode: version[1],
              branch: branch.branch,
            });
            setState({
              ...state,
              system: platform,
              version: version[0],
              gamemode: version[1],
              branch: branch.branch,
            });
          });
        });
      }
    };

    //ipcChannel.sendMessage('clean-log');

    //  setTimeout(() => {
    // console.log('UPDATE - CHECKING');
    // ipcChannel.sendMessage('update-check');
    // console.log('UPDATE - WAITING');
    // ipcChannel.once('update-check-out', (message) => {
    //   console.log('UPDATE - GETTING INFO:');
    //   console.log({ message });
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
    //Cloning project
    //

    //Force changelog after update
    if (update == 'updating') {
      localStorage.setItem('show_changelog', true);
      localStorage.setItem('pending_update', true);
    }
    if (update == 'up-to-date') {
      localStorage.setItem('pending_update', false);
      //is the git repo cloned?
      console.log('check-git');
      ipcChannel.sendMessage('check-git');
      ipcChannel.once('check-git', (error, cloneStatusCheck, stderr) => {
        console.log({ error });
        console.log({ cloneStatusCheck });
        console.log({ stderr });
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
    //settings here

    if (cloned == false) {
      if (navigator.onLine) {
        ipcChannel.sendMessage(`clone`, branch);
        console.log('clone');
        ipcChannel.once('clone', (error, cloneStatusClone, stderr) => {
          console.log({ error });
          console.log({ cloneStatusClone });
          console.log({ stderr });
          if (cloneStatusClone.includes('true')) {
            setStatePage({ ...statePage, downloadComplete: true });
          }
        });
      } else {
        alert('You need to be connected to the internet');
      }
    } else if (cloned == true) {
      if (navigator.onLine) {
        ipcChannel.sendMessage('pull', branch);
        console.log('pull');
        ipcChannel.once('pull', (error, pullStatus, stderr) => {
          console.log({ error });
          console.log({ pullStatus });
          console.log({ stderr });
          setStatePage({ ...statePage, downloadComplete: true });
          //Update timeout
        });
      } else {
        setStatePage({ ...statePage, downloadComplete: true });
      }
    }
  }, [cloned]);

  useEffect(() => {
    if (downloadComplete == true) {
      navigate('/welcome');
    }
  }, [downloadComplete]);

  return (
    <>
      {update == null && (
        <div className="app">
          <Aside />
          <div className="wrapper">
            <Header title="Checking for updates..." />
            <p className="h5">
              Please stand by while we check if there is a new version
              available.
              <br />
              If this message does not disappear in about 20 seconds, please
              restart the application.
            </p>
            <ProgressBar css="progress--success" value={counter} max="100" />
          </div>
        </div>
      )}

      {update == 'updating' && (
        <div className="app">
          <Aside />
          <div className="wrapper">
            <Header title="🎉 Update found! 🎉" />
            <p className="h5">
              We found an update! EmuDeck will restart as soon as it finishes
              installing the latest update. Hold on tight.
            </p>
            <ProgressBar css="progress--success" value={counter} max="100" />
          </div>
        </div>
      )}
      {update == 'up-to-date' && (
        <div className="app">
          <Aside />
          <div className="wrapper">
            {second === true && <Header title="Checking for updates" />}
            {second === false && <Header title="Welcome to" bold={`EmuDeck`} />}
            <Main>
              {downloadComplete === null && (
                <>
                  <p className="h5">
                    Downloading Files. If this progress bar does not disappear
                    shortly, please restart the application and check if you can
                    reach GitHub Servers and check our{' '}
                    <a
                      className="link-simple link-simple--1"
                      href="https://github.com/dragoonDorise/EmuDeck/wiki/Frequently-Asked-Questions#why-wont-emudeck-download"
                    >
                      Wiki FAQ
                    </a>{' '}
                    for possible solutions.
                  </p>
                  <ProgressBar
                    css="progress--success"
                    value={counter}
                    max="100"
                  />
                </>
              )}
            </Main>
            <Footer
              next="welcome"
              disabledNext={disabledNext}
              disabledBack={disabledBack}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default CheckUpdatePage;
