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

  const { device, system, mode, command, second } = state;

  useEffect(() => {
    //
    //Cloning project
    //
    //
    //     //Already cloned?
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
    //
    //     ipcChannel.once('console', (stdout) => {
    //       console.log({ stdout });
    //     });
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
    const settingsStorage = localStorage.getItem('settings_emudeck');

    if (!!settingsStorage) {
      console.log({ settingsStorage });
      setState(JSON.parse(settingsStorage));
      setStatePage({ ...statePage, disabledNext: false });
    }
    if (cloned == false) {
      console.log('cloning');
      ipcChannel.sendMessage('bash', [
        'clone|||mkdir -p ~/emudeck/backend && git clone https://github.com/dragoonDorise/EmuDeck.git ~/emudeck/backend/ && cd ~/emudeck/backend && git checkout beta && touch ~/emudeck/.cloned && printf "\ec" && echo true',
      ]);

      ipcChannel.on('clone', (stdout) => {
        console.log('clone msg '+stdout);
        if (stdout.includes('true')) {
          console.log('cloned');
          setStatePage({ ...statePage, downloadComplete: true });
        }
      });
    } else if (cloned == true) {
      console.log('git pull');

      ipcChannel.sendMessage('bash', [
        'pull|||cd ~/emudeck/backend && git reset --hard && git pull && git checkout beta',
      ]);
      ipcChannel.on('pull', (stdout) => {
        console.log(stdout);
        setStatePage({ ...statePage, downloadComplete: true });
      });
    }
  }, [cloned]);

  return (
    <Welcome
      data={data}
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
