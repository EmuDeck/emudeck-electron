import { useTranslation } from 'react-i18next';
import React, { useState, useRef, useEffect } from 'react';
import Wrapper from 'components/molecules/Wrapper/Wrapper';

import Header from 'components/organisms/Header/Header';
import Footer from 'components/organisms/Footer/Footer';

import Uninstall from 'components/organisms/Wrappers/Uninstall';

function UninstallPage() {
  const { t, i18n } = useTranslation();
  const [statePage] = useState({
    disabledNext: false,
    disabledBack: false,
    dom: undefined,
  });
  const { disabledNext, disabledBack, dom } = statePage;

  const ipcChannel = window.electron.ipcRenderer;

  const uninstall = () => {
    ipcChannel.sendMessage('bash', [
      'bash ~/.config/EmuDeck/backend/uninstall.sh',
    ]);
  };

  return (
    <Wrapper>
      <Header title={t('UninstallPage.title')} />
      <p className="lead">{t('UninstallPage.description')}</p>
      <Uninstall
        disabledNext={disabledNext}
        disabledBack={disabledBack}
        onClick={uninstall}
      />
      <Footer
        next={false}
        disabledNext={disabledNext}
        disabledBack={disabledBack}
      />
    </Wrapper>
  );
}

export default UninstallPage;
