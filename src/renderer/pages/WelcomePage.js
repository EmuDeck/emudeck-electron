import React, { useEffect, useState, useContext } from 'react';
import { GlobalContext } from 'context/globalContext';

import Welcome from 'components/organisms/Wrappers/Welcome.js';

const WelcomePage = () => {
  const ipcChannel = window.electron.ipcRenderer;
  const { state, setState } = useContext(GlobalContext);
  const [statePage, setStatePage] = useState({
    disabledNext: true,
    disabledBack: true,
    downloadComplete: false,
    update: 'updating',
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
  } = state;

  useEffect(() => {
    ipcChannel.sendMessage('update-check');
    ipcChannel.once('update-check-out', (message) => {
      setStatePage({
        ...statePage,
        update: message,
      });
    });
  }, []);

  useEffect(() => {
    //
    //Cloning project
    //
    //     //Already cloned?
    ipcChannel.sendMessage('bash', [
      'check-clone|||test -e ~/emudeck/backend/.git/config  && echo true',
    ]);
    ipcChannel.once('check-clone', (cloneStatus) => {
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

    if (!!settingsStorage) {
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
            system: platform,
            version: version,
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
      ipcChannel.sendMessage('bash', [
        'clone|||mkdir -p ~/emudeck/backend && git clone https://github.com/dragoonDorise/EmuDeck.git ~/emudeck/backend/ && cd ~/emudeck/backend && git checkout ' +
          branch +
          ' && touch ~/emudeck/.cloned && printf "ec" && echo true',
      ]);

      ipcChannel.once('clone', (cloneStatus) => {
        console.log({ cloneStatus });
        if (cloneStatus.includes('true')) {
          setStatePage({ ...statePage, downloadComplete: true });
        }
      });
    } else if (cloned == true) {
      ipcChannel.sendMessage('bash', [
        'pull|||cd ~/emudeck/backend && git reset --hard && git clean -fd && git checkout ' +
          branch +
          ' && git pull',
      ]);
      ipcChannel.once('pull', (pullStatus) => {
        console.log({ pullStatus });
        setStatePage({ ...statePage, downloadComplete: true });
      });
    }
  }, [cloned]);

  return (
    <Welcome
      update={update}
      alert={
        second
          ? ''
          : 'If you came from an old installarion of EmuDeck your settings will be overwritten on first install, next time you update you can keep your changes by choosing Custom Update'
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
    />
  );
};

export default WelcomePage;
