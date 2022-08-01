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


  const updateEmus = (data) => {
    ipcChannel.sendMessage('bash', [
      'bash ~/emudeck/backend/tools/binupdate/binupdate.sh',
    ]);
  };

  return (
    <UpdateEmus
      disabledNext={disabledNext}
      disabledBack={disabledBack}
      onClick={updateEmus}
    />
  );
};

export default UpdateEmusPage;
