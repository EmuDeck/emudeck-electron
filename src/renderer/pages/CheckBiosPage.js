import React, { useEffect, useState, useContext } from 'react';
import { GlobalContext } from 'context/globalContext';
import { useNavigate } from 'react-router-dom';
import CheckBios from 'components/organisms/Wrappers/CheckBios.js';

const CheckBiosPage = () => {
  const { state, setState } = useContext(GlobalContext);

  const [statePage, setStatePage] = useState({
    disabledNext: true,
    disabledBack: false,
    showNotification: false,
  });

  const [ps1Bios, setps1Bios] = useState(null);
  const [ps2Bios, setps2Bios] = useState(null);
  const [switchBios, setSwitchBios] = useState(null);
  const [segaCDBios, setSegaCDBios] = useState(null);
  const [saturnBios, setSaturnBios] = useState(null);
  const [dreamcastBios, setDreamcastBios] = useState(null);
  const [DSBios, setDSBios] = useState(null);

  const { disabledNext, disabledBack, showNotification } = statePage;
  const navigate = useNavigate();
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

  const checkBiosAgain = () => {
    checkBios('checkPS1BIOS');
    checkBios('checkPS2BIOS');
    checkBios('checkYuzuBios');
    checkBios('checkSegaCDBios');
    checkBios('checkSaturnBios');
    checkBios('checkDreamcastBios');
    checkBios('checkDSBios');
  };

  useEffect(() => {
    checkBios('checkPS1BIOS');
    checkBios('checkPS2BIOS');
    checkBios('checkYuzuBios');
    checkBios('checkSegaCDBios');
    checkBios('checkSaturnBios');
    checkBios('checkDreamcastBios');
    checkBios('checkDSBios');
  }, []);

  return (
    <CheckBios
      checkBiosAgain={checkBiosAgain}
      ps1Bios={ps1Bios}
      ps2Bios={ps2Bios}
      switchBios={switchBios}
      segaCDBios={segaCDBios}
      saturnBios={saturnBios}
      dreamcastBios={dreamcastBios}
      DSBios={DSBios}
      disabledNext={disabledNext}
      disabledBack={disabledBack}
      showNotification={showNotification}
    />
  );
};

export default CheckBiosPage;
