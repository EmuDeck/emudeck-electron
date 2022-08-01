import React, { useEffect, useState, useContext } from 'react';
import { GlobalContext } from 'context/globalContext';

import UpdateEmus from 'components/organisms/Wrappers/UpdateEmus.js';

const UpdateEmusPage = () => {
  const { state, setState } = useContext(GlobalContext);

  const [statePage, setStatePage] = useState({
    disabledNext: false,
    disabledBack: false
  });
  const { disabledNext, disabledBack } = statePage;

  const ipcChannel = window.electron.ipcRenderer;


  const updateFlatpak = (data) => {
    ipcChannel.sendMessage('bash', [
      'bash ~/emudeck/backend/tools/flatpakupdate/flatpakupdate.sh',
    ]);
  };

  const updateAppImage = (data) => {
    ipcChannel.sendMessage('bash', [
      'bash ~/emudeck/backend/tools/binupdate/binupdate.sh',
    ]);
  };

  return (
    <UpdateEmus
      disabledNext={disabledNext}
      disabledBack={disabledBack}
      onClickFlatpak={updateFlatpak}
      onClickAppImage={updateAppImage}
    />
  );
};

export default UpdateEmusPage;
