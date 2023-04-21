import React, { useEffect, useState, useContext, useRef } from 'react';
import { GlobalContext } from 'context/globalContext';
import Wrapper from 'components/molecules/Wrapper/Wrapper';
import Header from 'components/organisms/Header/Header';
import Footer from 'components/organisms/Footer/Footer';
import { useNavigate } from 'react-router-dom';

import Main from 'components/organisms/Main/Main';
import { Alert } from 'getbasecore/Molecules';

import {
  BtnSimple,
  ProgressBar,
  FormInputSimple,
  LinkSimple,
} from 'getbasecore/Atoms';
import { Form } from 'getbasecore/Molecules';

import Card from 'components/molecules/Card/Card';
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
  let updateTimeOut;
  useEffect(() => {
    //Update timeout + Force clone check
    console.log('UPDATE - SETTING TIMER FOR TIMEOUT');
    updateTimeOut = setTimeout(() => {
      console.log('UPDATE - TIMEOUT REACHED!');
      setStatePage({
        ...statePage,
        update: 'up-to-date',
      });
      updateFiles();
    }, 10000);

    if (navigator.onLine) {
      console.log('UPDATE - CHECKING');
      ipcChannel.sendMessage('update-check');
      console.log('UPDATE - WAITING');
      ipcChannel.once('update-check-out', (message) => {
        //We clear the timeout
        clearTimeout(updateTimeOut);
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
    } else {
      clearTimeout(updateTimeOut);
      setStatePage({
        ...statePage,
        update: 'up-to-date',
      });
      console.log('No internet connection');
    }

    const updateFiles = () => {
      //Ask for branch
      const branch = require('data/branch.json');

      const currentVersions = JSON.parse(
        localStorage.getItem('current_versions_beta')
      );
      if (!!currentVersions) {
        setStateCurrentConfigs({ ...currentVersions });
      }

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

        delete settingsStorage.installEmus.primehacks;
        delete settingsStorage.overwriteConfigEmus.primehacks;
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
    }
    if (update == 'up-to-date') {
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
      if (system === 'win32' || branch == 'early') {
        navigate('/patreon-login');
        //navigate('/welcome');
      } else {
        navigate('/welcome');
      }
    }
  }, [downloadComplete]);

  return (
    <Wrapper>
      {update == null && (
        <>
          <Header title="Checking for updates..." />
          <p className="h5">
            Please stand by while we check if there is a new version available.
            <br />
            If this message does not disappear in about 20 seconds, please
            restart the application.
          </p>
          <ProgressBar css="progress--success" value={counter} max="100" />
        </>
      )}

      {update === 'updating' && (
        <>
          <Header title="🎉 Update found! 🎉" />
          <p className="h5">
            We found an update! EmuDeck will restart as soon as it finishes
            installing the latest update. Hold on tight.
          </p>
          <ProgressBar css="progress--success" value={counter} max="100" />
        </>
      )}
      {update === 'up-to-date' && (
        <>
          {second === true && <Header title="Checking for updates" />}
          {second === false && <Header title="Welcome to EmuDeck" />}
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
        </>
      )}
    </Wrapper>
  );
}

export default CheckUpdatePage;
