import { useTranslation } from 'react-i18next';
import React, { useState, useContext, useRef, useEffect } from 'react';
import { GlobalContext } from 'context/globalContext';
import Wrapper from 'components/molecules/Wrapper/Wrapper';

import Header from 'components/organisms/Header/Header';
import Footer from 'components/organisms/Footer/Footer';

import CHDTool from 'components/organisms/Wrappers/CHDTool';

function CHDToolPage() {
  const { t, i18n } = useTranslation();
  const { state, setState } = useContext(GlobalContext);
  const { system } = state;
  const [statePage] = useState({
    disabledNext: false,
    disabledBack: false,
    dom: undefined,
  });

  const { disabledNext, disabledBack, dom } = statePage;

  const ipcChannel = window.electron.ipcRenderer;

  const runCHD = (data) => {
    if (system == 'win32') {
      ipcChannel.sendMessage('bash-nolog', [
        `powershell -ExecutionPolicy Bypass -NoExit . $env:APPDATA\EmuDeck\backend\tools\chdconv\chddeck.ps1"`,
      ]);
    } else {
      ipcChannel.sendMessage('bash-nolog', [
        `konsole -e "/bin/bash $HOME/.config/EmuDeck/backend/tools/chdconv/chddeck.sh"`,
      ]);
    }
  };

  return (
    <Wrapper>
      <Header title={t('CHDToolPage.title')} />
      <p className="lead">{t('CHDToolPage.description')}</p>
      <CHDTool onClick={runCHD} />
      <Footer
        next={false}
        disabledNext={disabledNext}
        disabledBack={disabledBack}
      />
    </Wrapper>
  );
}

export default CHDToolPage;
