import React, { useEffect, useState, useContext } from 'react';
import { GlobalContext } from 'context/globalContext';

import EmuGuide from 'components/organisms/Wrappers/EmuGuide.js';

const EmuGuidePage = () => {
  const { state, setState } = useContext(GlobalContext);
  const { installEmus } = state;
  const { ryujinx } = installEmus;
  const emuData = require('data/emuData.json');
  const [statePage, setStatePage] = useState({
    disabledNext: false,
    disabledBack: false,
    showNotification: false,
    emulatorSelected: 'citra',
    textNotification: '',
    disableInstallButton: false,
    disableResetButton: false,
  });
  const {
    disabledNext,
    disabledBack,
    emulatorSelected,
    showNotification,
    textNotification,
    disableInstallButton,
    disableResetButton,
  } = statePage;

  //TODO: Use only one state for bioses, doing it this way is quick but madness
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
      // console.log({ biosCommand });
      status = status.stdout;
      //console.log({ status });
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

  const installEmu = (emulator, name) => {
    console.log(emulator);

    setStatePage({
      ...statePage,
      disableInstallButton: true,
    });
    ipcChannel.sendMessage('emudeck', [
      `${name}_install|||${name}_install && ${name}_init`,
    ]);
    ipcChannel.once(`${name}_install`, (status) => {
      // console.log({ status });
      status = status.stdout;
      //console.log({ status });
      status = status.replace('\n', '');
      //Lets check if it did install
      ipcChannel.sendMessage('emudeck', [
        `${name}_IsInstalled|||${name}_IsInstalled`,
      ]);

      ipcChannel.once(`${name}_IsInstalled`, (status) => {
        // console.log({ status });
        status = status.stdout;
        console.log({ status });
        status = status.replace('\n', '');

        if (status.includes('true')) {
          setStatePage({
            ...statePage,
            textNotification: `${name} installed! 🎉`,
            showNotification: true,
            disableInstallButton: false,
          });
          //We set the emu as install = yes
          setState({
            ...state,
            installEmus: {
              ...installEmus,
              [emulator]: {
                id: emulator,
                name: name,
                status: true,
              },
            },
          });
        } else {
          setStatePage({
            ...statePage,
            textNotification: `There was an issue trying to install ${name} 😥`,
            showNotification: true,
            disableInstallButton: false,
          });
        }
      });
    });
  };

  const resetEmu = (emulator, name) => {
    setStatePage({
      ...statePage,
      disableInstallButton: true,
    });
    ipcChannel.sendMessage('emudeck', [
      `${name}_resetConfig|||${name}_resetConfig`,
    ]);
    ipcChannel.once(`${name}_resetConfig`, (status) => {
      console.log(`${name}_resetConfig`);
      status = status.stdout;
      console.log({ status });
      status = status.replace('\n', '');

      if (status.includes('true')) {
        setStatePage({
          ...statePage,
          textNotification: `${name} configuration reset to EmuDeck's defaults! 🎉`,
          showNotification: true,
          disableResetButton: false,
        });
      } else {
        setStatePage({
          ...statePage,
          textNotification: `There was an issue trying to reset ${name} configuration 😥`,
          showNotification: true,
          disableResetButton: false,
        });
      }
    });
  };

  useEffect(() => {
    if (showNotification === true) {
      setTimeout(() => {
        setStatePage({
          ...statePage,
          showNotification: false,
        });
      }, 3000);
    }
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
    checkBios('checkDSBios');
    checkBios('checkDreamcastBios');
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
        nds={DSBios}
        onChange={selectEmu}
        onClick={resetEmu}
        onClickInstall={installEmu}
        showNotification={showNotification}
        textNotification={textNotification}
        installEmus={installEmus[emulatorSelected]}
        disableInstallButton={disableInstallButton ? true : false}
        disableResetButton={disableResetButton ? true : false}
      />
    </>
  );
};

export default EmuGuidePage;
