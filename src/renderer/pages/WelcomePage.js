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
      'check-clone|||test -f ~/emudeck/.cloned  && echo true',
    ]);
    ipcChannel.on('check-clone', (stdout) => {
      stdout = stdout.replace('\n', '');
      stdout.includes('true') ? (stdout = true) : (stdout = false);
      setStatePage({
        ...statePage,
        cloned: stdout,
      });
    });

    ipcChannel.sendMessage('system-info');
    ipcChannel.once('system-info-out', (platform) => {
      setState({ ...state, system: platform });
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

      ipcChannel.on('clone', (stdout) => {
        if (stdout.includes('true')) {
          setStatePage({ ...statePage, downloadComplete: true });
        }
      });
    } else if (cloned == true) {
      ipcChannel.sendMessage('bash', [
        'pull|||cd ~/emudeck/backend && git reset --hard && git clean -fd && git checkout '+branch+' && git pull',
      ]);
      ipcChannel.on('pull', (stdout) => {
        setStatePage({ ...statePage, downloadComplete: true });
      });
    }
  }, [cloned]);

  return (
    <Welcome
      alert="This version of EmuDeck comes with a mayor update of the PS2 Emulator, you'll need to refresh your PS2 Steam Games using Steam Rom Manager at the end of this installation."
      disabledNext={second ? false : disabledNext}
      disabledBack={disabledBack}
      downloadComplete={downloadComplete}
      onClick={selectMode}
      back={false}
      next="rom-storage"
    />
  );
};

export default WelcomePage;
