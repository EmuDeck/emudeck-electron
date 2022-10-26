import React, { useEffect, useState, useContext, useRef } from 'react';
import { GlobalContext } from 'context/globalContext';

import Welcome from 'components/organisms/Wrappers/Welcome.js';

const WelcomePage = () => {
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
    console.log({ statePage });
  }, [statePage]);

  useEffect(() => {
    //Update timeout + Force clone check
    console.log('UPDATE - SETTING TIMER FOR TIMEOUT');
    setTimeout(() => {
      if (updateRef === null) {
        console.log('UPDATE - TIMEOUT');
        setStatePage({
          ...statePage,
          update: 'up-to-date',
          cloned: null,
        });
      }
    }, 15000);

    //Ask for branch

    ipcChannel.sendMessage('branch');
    ipcChannel.once('branch-out', (branchNode) => {
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
              branch: branchNode,
            });
          });
        });
      } else {
        ipcChannel.sendMessage('version');
        ipcChannel.once('version-out', (version) => {
          ipcChannel.sendMessage('system-info-in');
          ipcChannel.once('system-info-out', (platform) => {
            setState({
              ...state,
              system: platform,
              version: version,
              branch: branchNode,
            });
          });
        });
      }
    });

    //ipcChannel.sendMessage('clean-log');

    //  setTimeout(() => {
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
    });

    //  }, 500);
  }, []);

  useEffect(() => {
    //
    //Cloning project
    //

    if (update == 'up-to-date') {
      //is the git repo cloned?
      ipcChannel.sendMessage('bash', [
        'check-git|||mkdir -p $HOME/emudeck/ && cd ~/.config/EmuDeck/backend/ && git rev-parse --is-inside-work-tree',
      ]);
      ipcChannel.once('check-git', (cloneStatusCheck) => {
        console.log({ cloneStatusCheck });
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
    console.log({ mode });
    if (mode != null && downloadComplete == true) {
      setStatePage({ ...statePage, disabledNext: false });
    }
  }, [mode]);

  useEffect(() => {
    //settings here

    if (cloned == false) {
      if (navigator.onLine) {
        ipcChannel.sendMessage('bash', [
          'clone|||rm -rf ~/.config/EmuDeck/backend && mkdir -p ~/.config/EmuDeck/backend && git clone --no-single-branch --depth=1 https://github.com/dragoonDorise/EmuDeck.git ~/.config/EmuDeck/backend/ && cd ~/.config/EmuDeck/backend && git checkout ' +
            branch +
            ' && touch ~/.config/EmuDeck/.cloned && printf "ec" && echo true',
        ]);

        ipcChannel.once('clone', (cloneStatusClone) => {
          console.log({ cloneStatusClone });
          if (cloneStatusClone.includes('true')) {
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
          //Update timeout
        });
      } else {
        setStatePage({ ...statePage, downloadComplete: true });
      }
    }
  }, [cloned]);

  return (
    <Welcome
      update={update}
      data={data}
      counter={counter}
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
