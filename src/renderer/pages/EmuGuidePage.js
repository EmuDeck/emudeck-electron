import React, { useEffect, useState, useContext } from 'react';
import { GlobalContext } from 'context/globalContext';

import EmuGuide from 'components/organisms/Wrappers/EmuGuide.js';

const EmuGuidePage = () => {
  const { state, setState } = useContext(GlobalContext);
  const { installEmus } = state;
  const emuData = require('data/emuData.json');
  const [statePage, setStatePage] = useState({
    disabledNext: false,
    disabledBack: false,
    showNotification: false,
    emulatorSelected: 'citra',
    textNotification: '',
  });
  const {
    disabledNext,
    disabledBack,
    emulatorSelected,
    showNotification,
    textNotification,
  } = statePage;

  const [ps1Bios, setps1Bios] = useState(null);
  const [ps2Bios, setps2Bios] = useState(null);
  const [switchBios, setSwitchBios] = useState(null);
  const [segaCDBios, setSegaCDBios] = useState(null);
  const [saturnBios, setSaturnBios] = useState(null);
  const [dreamcastBios, setDreamcastBios] = useState(null);
  const [DSBios, setDSBios] = useState(null);
  const ipcChannel = window.electron.ipcRenderer;
  const checkBios = (biosCommand) => {
    ipcChannel.sendMessage('emudeck', [`${biosCommand}|||${biosCommand}`]);
    ipcChannel.once(`${biosCommand}`, (status) => {
      console.log({ status });
      status = status.stdout;
      console.log({ status });
      status = status.replace('\n', '');
      let biosStatus;
      status.includes('true') ? (biosStatus = true) : (biosStatus = false);

      switch (biosCommand) {
        case 'checkPS1BIOS':
          setps1Bios(biosStatus);
          break;
        case 'checkPS2BIOS':
          setps2Bios(biosStatus);
          break;
        case 'checkYuzuBios':
          setSwitchBios(biosStatus);
          break;
        case 'checkSegaCDBios':
          setSegaCDBios(biosStatus);
          break;
        case 'checkSaturnBios':
          setSaturnBios(biosStatus);
          break;
        case 'checkDreamcastBios':
          setDreamcastBios(biosStatus);
          break;
        case 'checkDSBios':
          setDSBios(biosStatus);
          break;
      }
    });
  };

  const resetEmu = (emulator, name) => {
    let biosCommand = 'RetroArch_resetCoreConfigs';
    ipcChannel.sendMessage('emudeck', [`${biosCommand}|||${biosCommand}`]);
    ipcChannel.once(`${biosCommand}`, (status) => {
      console.log({ status });
      status = status.stdout;
      console.log({ status });
      status = status.replace('\n', '');
      let biosStatus;
      status.includes('true') ? (biosStatus = true) : (biosStatus = false);

      setStatePage({
        ...statePage,
        textNotification: `${name} configuration reset to EmuDeck's default configuration 🎉`,
        showNotification: true,
      });
    });
  };

  useEffect(() => {
    setTimeout(() => {
      setStatePage({
        ...statePage,
        showNotification: false,
      });
    }, 3000);
  }, [showNotification]);

  const installEmu = (emulator, name) => {
    ipcChannel.sendMessage('emudeck', [
      `${name}_resetConfig|||${name}_resetConfig`,
    ]);
    ipcChannel.once(`${command}`, (status) => {
      // console.log({ status });
      status = status.stdout;
      console.log({ status });
      status = status.replace('\n', '');

      if (status.includes('true')) {
        setStatePage({
          ...statePage,
          textNotification: `${name} configuration reset to EmuDeck's defaults! 🎉`,
          showNotification: true,
        });
      } else {
        setStatePage({
          ...statePage,
          textNotification: `There was an issue trying to reset ${name} configuration 😥`,
          showNotification: true,
        });
      }
    });
  };

  useEffect(() => {
    setTimeout(() => {
      setStatePage({
        ...statePage,
        showNotification: false,
      });
    }, 3000);
  }, [showNotification]);

  const checkInstallation = (emulator, name) => {
    console.log(`Checking ${name} status`);
    //alert(emulator);
    // setState(
    //   ...state,
    //   (installEmus: {
    //     ...installEmus,
    //     (emulator:{
    //       ...emulator,
    //       status: true,
    //     })
    //   })
    // );
  };

  useEffect(() => {
    checkBios('checkPS1BIOS');
    checkBios('checkPS2BIOS');
    checkBios('checkYuzuBios');
    checkBios('checkSegaCDBios');
    checkBios('checkSaturnBios');
    checkBios('checkDreamcastBios');
    checkBios('checkDSBios');

    checkInstallation('ra', 'RetroArch');
  }, []);

  const selectEmu = (e) => {
    const emu = e.target.value;
    if (emu != '-1') {
      setStatePage({
        ...statePage,
        emulatorSelected: emu,
      });
    }
  };

  return (
    <>
      <EmuGuide
        disabledNext={disabledNext}
        disabledBack={disabledBack}
        emuData={emuData[emulatorSelected]}
        ps1={ps1Bios}
        ps2={ps2Bios}
        nswitch={switchBios}
        segacd={segaCDBios}
        saturn={saturnBios}
        dreamcast={dreamcastBios}
        onChange={selectEmu}
        onClick={resetEmu}
        onClickInstall={installEmu}
        showNotification={showNotification}
        textNotification={textNotification}
        installEmus={installEmus[emulatorSelected]}
      />
    </>
  );
};

export default EmuGuidePage;
