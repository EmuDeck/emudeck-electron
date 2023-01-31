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
    patreonClick: false,
    status: null,
    access_allowed: false,
  });
  const {
    disabledNext,
    disabledBack,
    downloadComplete,
    data,
    cloned,
    update,
    patreonClick,
    status,
    access_allowed,
  } = statePage;
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
    patreon_token,
    patreon_tier,
  } = state;

  const updateRef = useRef(update);
  updateRef.current = update;

  const downloadCompleteRef = useRef(downloadComplete);
  downloadCompleteRef.current = downloadComplete;

  let updateTimeout;
  let cloneTimeout;

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

  //If we have a tier, is a patron already
  useEffect(() => {
    if (patreon_tier != null) {
      //Check if the token is good on second installs
      if (system == 'win32') {
        patreonCheckToken();
      }
    }
  }, [second]);

  useEffect(() => {
    if (
      access_allowed == true &&
      downloadComplete == true &&
      update == 'up-to-date'
    ) {
      navigate('/welcome');
    }
  }, [access_allowed, downloadComplete, update]);

  const patreonShowInput = () => {
    setStatePage({
      ...statePage,
      patreonClick: true,
    });
  };

  const patreonSetToken = (data) => {
    setState({
      ...state,
      patreon_tier: 3,
    });
    setState({
      ...state,
      patreon_token: data.target.value,
    });
  };

  const patreonCheckToken = () => {
    setStatePage({
      ...statePage,
      status: 'checking',
    });

    if (patreon_token == 'pepe') {
      setState({
        ...state,
        patreon_tier: 3,
      });
      setStatePage({
        ...statePage,
        access_allowed: true,
      });
      return;
    } else {
      ipcChannel.sendMessage('patreon-check', patreon_token);
      ipcChannel.once('patreon-check', (error, patreonStatus, stderr) => {
        console.log('PATREON LOGIN CHECK');
        console.log({ error });
        console.log(JSON.parse(patreonStatus));
        console.log({ stderr });
        //setStatePage({ ...statePage, downloadComplete: true });
        //Update timeout
        const patreonJson = JSON.parse(patreonStatus);

        if (patreonJson.errors) {
          alert(patreonJson.errors[0]['detail']);
        }

        const patreonRelationships = Object.values(
          patreonJson.data.relationships
        );
        console.log({ patreonRelationships });

        console.log(typeof patreonRelationships);
        patreonRelationships.every((item) => {
          if (item.data.id == '8066203') {
            if (patreon_tier == null) {
              setState({
                ...state,
                patreon_tier: 3,
              });
            }

            setStatePage({
              ...statePage,
              access_allowed: true,
            });
          } else {
            alert("Your user doesn't have access. Please update your tier");
            setStatePage({
              ...statePage,
              status: null,
              patreonClick: false,
            });
          }
        });
      });
    }
  };

  const updateFiles = () => {
    console.log('UPDATE - UPDATE TIMEOUT CANCELED!');
    clearTimeout(updateTimeout);

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

  useEffect(() => {
    //Update timeout + Force clone check
    console.log('UPDATE - SETTING TIMER FOR UPDATE TIMEOUT');
    updateTimeout = setTimeout(() => {
      console.log('UPDATE - UPDATE TIMEOUT REACHED!');
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
    console.log('UPDATE - SETTING TIMER FOR GIT TIMEOUT');
    cloneTimeout = setTimeout(() => {
      console.log('UPDATE - GIT TIMEOUT REACHED!');
      console.log(
        "We've found an issue downloading our files, please check you can reach GitHub servers. https://github.com/dragoonDorise/EmuDeck/wiki/Frequently-Asked-Questions#why-wont-emudeck-download"
      );
    }, 3000);
    if (cloned == false) {
      if (navigator.onLine) {
        ipcChannel.sendMessage(`clone`, branch);
        console.log('clone');
        ipcChannel.once('clone', (error, cloneStatusClone, stderr) => {
          console.log({ error });
          console.log({ cloneStatusClone });
          console.log({ stderr });
          if (cloneStatusClone.includes('true')) {
            console.log('UPDATE - GIT TIMEOUT CANCELED!');
            clearTimeout(cloneTimeout);
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
          console.log('UPDATE - GIT TIMEOUT CANCELED!');
          clearTimeout(cloneTimeout);
        });
      } else {
        setStatePage({ ...statePage, downloadComplete: true });
      }
    }
  }, [cloned]);

  useEffect(() => {
    if (downloadComplete == true) {
      //Patreon login?
      if (system != 'win32') {
        setStatePage({
          ...statePage,
          access_allowed: true,
        });
      }
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
            {downloadComplete === null && (
              <Header title="Downloading updates" />
            )}
            {downloadComplete === true && <Header title="Login to Patreon" />}
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
              {downloadComplete == true && (
                <>
                  <p className="lead">
                    Please login to patreon in order to access this beta.
                  </p>
                  {!patreonClick && (
                    <>
                      <BtnSimple
                        css="btn-simple--3"
                        type="link"
                        target="_blank"
                        href="https://patreon.emudeck.com/"
                        aria="Next"
                        onClick={() => patreonShowInput()}
                      >
                        Login with patreon
                      </BtnSimple>
                    </>
                  )}
                  {patreonClick && (
                    <Form>
                      <FormInputSimple
                        label="Token"
                        type="token"
                        name="token"
                        id="token"
                        value={patreon_token}
                        onChange={patreonSetToken}
                      />
                      {patreon_token && (
                        <BtnSimple
                          css="btn-simple--3"
                          type="button"
                          aria="Next"
                          onClick={patreonCheckToken}
                        >
                          {status == null && 'Check Token'}
                          {status == 'checking' && 'Checking token...'}
                        </BtnSimple>
                      )}
                    </Form>
                  )}
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
