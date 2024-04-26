import { useTranslation } from 'react-i18next';
import React, { useState, useRef, useEffect } from 'react';
import Wrapper from 'components/molecules/Wrapper/Wrapper';

import Header from 'components/organisms/Header/Header';
import Footer from 'components/organisms/Footer/Footer';

import UpdateEmus from 'components/organisms/Wrappers/UpdateEmus';

function UpdateEmusPage() {
  const { t, i18n } = useTranslation();
  const [statePage] = useState({
    disabledNext: false,
    disabledBack: false,
    dom: undefined,
  });
  const { disabledNext, disabledBack, dom } = statePage;

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
      <Header title={t('UpdateEmusPage.title')} />
      <p className="lead">{t('UpdateEmusPage.description')}</p>
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
}

export default UpdateEmusPage;
