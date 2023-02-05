import React, { useEffect, useState, useContext } from 'react';
import { GlobalContext } from 'context/globalContext';
import Wrapper from 'components/molecules/Wrapper/Wrapper';

import UpdateEmus from 'components/organisms/Wrappers/UpdateEmus';

const UpdateEmusPage = () => {
  const { state, setState } = useContext(GlobalContext);

  const [statePage, setStatePage] = useState({
    disabledNext: false,
    disabledBack: false,
  });
  const { disabledNext, disabledBack } = statePage;

  const ipcChannel = window.electron.ipcRenderer;

  const updateFlatpak = (data) => {
    ipcChannel.sendMessage('bash', [
      'bash ~/.config/EmuDeck/backend/tools/flatpakupdate/flatpakupdate.sh',
    ]);
  };

  const updateAppImage = (data) => {
    ipcChannel.sendMessage('bash', [
      'bash ~/.config/EmuDeck/backend/tools/binupdate/binupdate.sh',
    ]);
  };

  return (
    <Wrapper>
      <UpdateEmus
        disabledNext={disabledNext}
        disabledBack={disabledBack}
        onClickFlatpak={updateFlatpak}
        onClickAppImage={updateAppImage}
      />
    </Wrapper>
  );
};

export default UpdateEmusPage;
