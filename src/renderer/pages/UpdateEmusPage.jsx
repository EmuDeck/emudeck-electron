import React, { useState } from 'react';
import Wrapper from 'components/molecules/Wrapper/Wrapper';
import Header from 'components/organisms/Header/Header';
import Footer from 'components/organisms/Footer/Footer';

import UpdateEmus from 'components/organisms/Wrappers/UpdateEmus';

const UpdateEmusPage = () => {
  const [statePage] = useState({
    disabledNext: false,
    disabledBack: false,
  });
  const { disabledNext, disabledBack } = statePage;

  const ipcChannel = window.electron.ipcRenderer;

  const updateFlatpak = () => {
    ipcChannel.sendMessage('bash', [
      'bash ~/.config/EmuDeck/backend/tools/flatpakupdate/flatpakupdate.sh',
    ]);
  };

  const updateAppImage = () => {
    ipcChannel.sendMessage('bash', [
      'bash ~/.config/EmuDeck/backend/tools/binupdate/binupdate.sh',
    ]);
  };

  return (
    <Wrapper>
      <Header title="Update your" bold="Emulators & Tools" />
      <UpdateEmus
        disabledNext={disabledNext}
        disabledBack={disabledBack}
        onClickFlatpak={updateFlatpak}
        onClickAppImage={updateAppImage}
      />
      <Footer
        next={false}
        disabledNext={disabledNext}
        disabledBack={disabledBack}
      />
    </Wrapper>
  );
};

export default UpdateEmusPage;
