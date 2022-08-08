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
    cloned: undefined,
    data: '',
  });
  const { disabledNext, disabledBack, downloadComplete, data, cloned } =
    statePage;

  const selectMode = (value) => {
    setState({ ...state, mode: value });
  };

  const { device, system, mode, command, second, branch } = state;

  useEffect(() => {
    //
    //Cloning project
    //
    //     //Already cloned?
    ipcChannel.sendMessage('bash', [
      'check-clone|||test -e ~/emudeck/backend/.git/config  && echo true',
    ]);
    ipcChannel.once('check-clone', (cloneStatus) => {
      console.log({cloneStatus})
      cloneStatus = cloneStatus.replace('\n', '');
      cloneStatus.includes('true') ? (cloneStatus = true) : (cloneStatus = false);
      setStatePage({
        ...statePage,
        cloned: cloneStatus,
      });
    });

    ipcChannel.sendMessage('system-info');
    ipcChannel.once('system-info-out', (platform) => {
      setState({ ...state, system: platform });
    });

    ipcChannel.sendMessage('version');
    ipcChannel.once('version-out', (version) => {
      setState({ ...state, version: version });
    });
  }, []);

  useEffect(() => {
    if (mode != '') {
      setStatePage({ ...statePage, disabledNext: false });
    }
  }, [mode]);

  useEffect(() => {
    const settingsStorage = JSON.parse(localStorage.getItem('settings_emudeck'));
    if (!!settingsStorage) {
      setState({...state, ...settingsStorage});
      setStatePage({ ...statePage, disabledNext: false });
    }
    if (cloned == false) {
      ipcChannel.sendMessage('bash', [
        'clone|||mkdir -p ~/emudeck/backend && git clone https://github.com/dragoonDorise/EmuDeck.git ~/emudeck/backend/ && cd ~/emudeck/backend && git checkout '+branch+' && touch ~/emudeck/.cloned && printf "\ec" && echo true',
      ]);

      ipcChannel.once('clone', (cloneStatus) => {
        console.log({cloneStatus})
        if (cloneStatus.includes('true')) {
          setStatePage({ ...statePage, downloadComplete: true });
        }
      });
    } else if (cloned == true) {
      ipcChannel.sendMessage('bash', [
        'pull|||cd ~/emudeck/backend && git reset --hard && git clean -fd && git checkout '+branch+' && git pull',
      ]);
      ipcChannel.once('pull', (pullStatus) => {
        console.log({pullStatus})
        setStatePage({ ...statePage, downloadComplete: true });
      });
    }
  }, [cloned]);

  return (
    <Welcome
      alert="This version of EmuDeck comes with a major update of the PS2 Emulator, make sure to refresh your PS2 Steam Games using Steam Rom Manager at the end of this installation."
      disabledNext={second ? false : disabledNext}
      disabledBack={second ? false : disabledBack}
      downloadComplete={downloadComplete}
      onClick={selectMode}
      back={second ? "tools-and-stuff" : false}
      backText={second ? "Tools & stuff" : "Install EmuDeck First"}
      next="rom-storage"
    />
  );
};

export default WelcomePage;
