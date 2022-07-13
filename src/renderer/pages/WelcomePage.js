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

  const { device, system, mode, command } = state;

  const runCommand = () => {
    ipcChannel.sendMessage('emudeck', [`TEST|||${command}`]);
    ipcChannel.on('TEST', (message) => {
      console.log(message);
    });
  };
  const saveCommand = (e) => {
    setState({ ...state, command: e.target.value });
  };

  useEffect(() => {
    //
    //Cloning project
    //
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
    if (cloned == false) {
      ipcChannel.sendMessage('bash', [
        'clone|||mkdir -p ~/emudeck/backend && git clone https://github.com/dragoonDorise/EmuDeck.git ~/emudeck/backend/ && cd ~/emudeck/backend && git checkout EmuReorg && touch ~/emudeck/.cloned && source ~/emudeck/backend/functions/all.sh && clear && echo true',
      ]);
      ipcChannel.on('clone', (stdout) => {
        if (stdout.includes('true')) {
          setStatePage({ ...statePage, downloadComplete: true });
        }
      });
    } else if (cloned == true) {
      console.log('git pull');

      ipcChannel.sendMessage('bash', [
        'pull|||cd ~/emudeck/backend && git pull',
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
      disabledNext={disabledNext}
      disabledBack={disabledBack}
      downloadComplete={downloadComplete}
      onClick={selectMode}
      saveCommand={saveCommand}
      runCommand={runCommand}
      back={false}
      next="rom-storage"
    />
  );
};

export default WelcomePage;
