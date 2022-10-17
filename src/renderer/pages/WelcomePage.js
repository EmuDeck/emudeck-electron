import React, { useEffect, useState, useContext, useRef } from 'react';
import { GlobalContext } from 'context/globalContext';

import Welcome from 'components/organisms/Wrappers/Welcome.js';

const WelcomePage = () => {
  const ipcChannel = window.electron.ipcRenderer;
  const { state, setState } = useContext(GlobalContext);
  const [statePage, setStatePage] = useState({
    disabledNext: true,
    disabledBack: true,
    downloadComplete: null,
    update: null,
    cloned: undefined,
    data: '',
  });
  const { disabledNext, disabledBack, downloadComplete, data, cloned, update } =
    statePage;

  const selectMode = (value) => {
    setState({ ...state, mode: value });
  };

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
  } = state;

  const updateRef = useRef(update);
  updateRef.current = update;

  useEffect(() => {
    ipcChannel.sendMessage('clean-log');
    if (!navigator.onLine) {
      setTimeout(() => {
        setStatePage({
          ...statePage,
          update: 'up-to-date',
        });
      }, 500);
    } else {
      setTimeout(() => {
        ipcChannel.sendMessage('update-check');
        ipcChannel.once('update-check-out', (message) => {
          setStatePage({
            ...statePage,
            update: message,
          });
        });
      }, 500);
    }
    //Update timeout
    setTimeout(() => {
      if (updateRef === null) {
        setStatePage({
          ...statePage,
          update: 'up-to-date',
        });
      }
    }, 15000);
  }, []);

  useEffect(() => {
    //
    //Cloning project
    //

    //is the git repo cloned?
    ipcChannel.sendMessage('bash', [
      'check-git|||cd ~/.config/EmuDeck/backend/ && git rev-parse --is-inside-work-tree',
    ]);
    ipcChannel.once('check-git', (cloneStatus) => {
      console.log({ cloneStatus });
      cloneStatus = cloneStatus.replace('\n', '');
      cloneStatus.includes('true')
        ? (cloneStatus = true)
        : (cloneStatus = false);
      setStatePage({
        ...statePage,
        cloned: cloneStatus,
      });
    });
  }, [update]);

  useEffect(() => {
    if (mode != '') {
      setStatePage({ ...statePage, disabledNext: false });
    }
  }, [mode]);

  useEffect(() => {
    const settingsStorage = JSON.parse(
      localStorage.getItem('settings_emudeck')
    );
    console.log({ settingsStorage });
    if (!!settingsStorage) {
      const shadersStored = settingsStorage.shaders;
      //Theres probably a better way to do this...
      ipcChannel.sendMessage('version');
      ipcChannel.once('version-out', (version) => {
        ipcChannel.sendMessage('system-info-in');
        ipcChannel.once('system-info-out', (platform) => {
          setState({
            ...state,
            ...settingsStorage,
            installEmus: state.installEmus,
            overwriteConfigEmus: state.overwriteConfigEmus,
            shaders: { ...shaders, ...shadersStored },
            system: platform,
            version: version,
            branch: 'main',
          });
        });
      });
      setStatePage({ ...statePage, disabledNext: false });
    } else {
      ipcChannel.sendMessage('version');
      ipcChannel.once('version-out', (version) => {
        ipcChannel.sendMessage('system-info-in');
        ipcChannel.once('system-info-out', (platform) => {
          setState({ ...state, system: platform, version: version });
        });
      });
    }

    if (cloned == false) {
      if (navigator.onLine) {
        ipcChannel.sendMessage('bash', [
          'clone|||rm -rf ~/.config/EmuDeck/backend && mkdir -p ~/.config/EmuDeck/backend && git clone --no-single-branch --depth=1 https://github.com/dragoonDorise/EmuDeck.git ~/.config/EmuDeck/backend/ && cd ~/.config/EmuDeck/backend && git checkout ' +
            branch +
            ' && touch ~/.config/EmuDeck/.cloned && printf "ec" && echo true',
        ]);

        ipcChannel.once('clone', (cloneStatus) => {
          console.log({ cloneStatus });
          if (cloneStatus.includes('true')) {
            setStatePage({ ...statePage, downloadComplete: true });
          }
        });
      } else {
        alert('You need to be connected to the internet');
      }
    } else if (cloned == true) {
      if (navigator.onLine) {
        ipcChannel.sendMessage('bash', [
          'pull|||cd ~/.config/EmuDeck/backend && git reset --hard && git clean -fd && git checkout ' +
            branch +
            ' && git pull',
        ]);
        ipcChannel.once('pull', (pullStatus) => {
          console.log({ pullStatus });
          setStatePage({ ...statePage, downloadComplete: true });
        });
      } else {
        setStatePage({ ...statePage, downloadComplete: true });
      }
    }
  }, [cloned]);

  return (
    <Welcome
      update={update}
      alert={
        second
          ? 'Welcome back! Make sure to check the Tools & Stuff section!'
          : 'Do you need help installing EmuDeck for the first time? <a href="https://youtu.be/rs9jDHIDKkU" target="_blank">Check out this guide</a>'
      }
      disabledNext={second ? false : disabledNext}
      disabledBack={second ? false : disabledBack}
      downloadComplete={downloadComplete}
      onClick={selectMode}
      back={second ? 'tools-and-stuff' : false}
      backText={second ? 'Tools & stuff' : 'Install EmuDeck First'}
      next="rom-storage"
      third="change-log"
      thirdText="See changelog"
      fourthText="Exit EmuDeck"
    />
  );
};

export default WelcomePage;
