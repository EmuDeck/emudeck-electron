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
  const { disabledNext, disabledBack, showNotification } = statePage;
  const navigate = useNavigate();
  const ipcChannel = window.electron.ipcRenderer;

  const checkBiosPS1 = () => {
    ipcChannel.sendMessage('emudeck', ['CheckBiosPS1|||checkPS1BIOS']);
  };
  const checkBiosPS2 = () => {
    ipcChannel.sendMessage('emudeck', ['CheckBiosPS2|||checkPS1BIOS']);
  };
  const checkBiosSwitch = () => {
    ipcChannel.sendMessage('emudeck', ['CheckBiosSwitch|||checkYuzuBios']);
  };
  const checkBiosSegaCD = () => {
    ipcChannel.sendMessage('emudeck', ['CheckBiosSegaCD|||checkSegaCDBios']);
  };
  const checkBiosSaturn = () => {
    ipcChannel.sendMessage('emudeck', ['CheckBiosSaturn|||checkSaturnBios']);
  };

  return (
    <CheckBios
      onClickPS1={checkBiosPS1}
      onClickPS2={checkBiosPS2}
      onClickSwitch={checkBiosSwitch}
      onClickSegaCD={checkBiosSegaCD}
      onClickSaturn={checkBiosSaturn}
      disabledNext={disabledNext}
      disabledBack={disabledBack}
      showNotification={showNotification}
    />
  );
};

export default CheckBiosPage;
