import { useTranslation } from 'react-i18next';
import React, { useState, useContext, useRef, useEffect } from 'react';
import { GlobalContext } from 'context/globalContext';
import Wrapper from 'components/molecules/Wrapper/Wrapper';

import Header from 'components/organisms/Header/Header';
import Footer from 'components/organisms/Footer/Footer';

import CHDTool from 'components/organisms/Wrappers/CHDTool';

function CHDToolPage() {
  const { t, i18n } = useTranslation();
  const [statePage] = useState({
    disabledNext: false,
    disabledBack: false,
    dom: undefined,
  });

  const { disabledNext, disabledBack, dom } = statePage;

  const { state, setState } = useContext(GlobalContext);
  const { system } = state;
  const ipcChannel = window.electron.ipcRenderer;

  const runCHD = (data) => {
    ipcChannel.sendMessage('emudeck', 'startCompressor');
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
