import React, { useEffect, useState, useContext } from 'react';
import { GlobalContext } from 'context/globalContext';

import Welcome from 'components/organisms/Wrappers/Welcome.js';

const WelcomePage = () => {
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

  const { device, system, mode } = state;

  const ipcChannel = window.electron.ipcRenderer;

  useEffect(() => {
    //
    //Cloning project
    //

    //Already cloned?
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

    ipcChannel.once('console', (stdout) => {
      console.log({ stdout });
    });
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
        'clone|||mkdir -p ~/dragoonDoriseTools/EmuDeck && git clone https://github.com/dragoonDorise/EmuDeck.git ~/dragoonDoriseTools/EmuDeck && cd ~/dragoonDoriseTools/EmuDeck && git checkout EmuReorg  && mkdir -p ~/emudeck/ && touch ~/emudeck/.cloned',
      ]);
      ipcChannel.on('clone', (stdout) => {
        setStatePage({ ...statePage, downloadComplete: true });
      });
    } else if (cloned == true) {
      console.log('git pull');

      ipcChannel.sendMessage('bash', [
        'pull|||cd ~/dragoonDoriseTools/EmuDeck && git pull',
      ]);
      ipcChannel.on('pull', (stdout) => {
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
      back={false}
      next="rom-storage"
    />
  );
};

export default WelcomePage;
