import { useTranslation } from 'react-i18next';
import React, { useState, useContext, useRef, useEffect } from 'react';
import { GlobalContext } from 'context/globalContext';
import Wrapper from 'components/molecules/Wrapper/Wrapper';

import Header from 'components/organisms/Header/Header';
import Footer from 'components/organisms/Footer/Footer';

import AutoSave from 'components/organisms/Wrappers/AutoSave';

function AutoSavePage() {
  const { t, i18n } = useTranslation();
  const { state, setState } = useContext(GlobalContext);
  const [statePage] = useState({
    disabledNext: false,
    disabledBack: false,
    data: '',
    dom: undefined,
  });
  const { disabledNext, disabledBack, data, dom } = statePage;
  const autoSaveSet = (shaderStatus) => {
    setState({
      ...state,
      autosave: shaderStatus,
    });
  };

  return (
    <Wrapper>
      <Header title={t('AutoSavePage.title')} />
      <p className="lead">
        If enabled, your game state will be saved on exit and automatically
        loaded when opened again when using RetroArch.
      </p>
      <AutoSave data={data} onClick={autoSaveSet} />
      <Footer
        next="ra-achievements"
        disabledNext={disabledNext}
        disabledBack={disabledBack}
      />
    </Wrapper>
  );
}

export default AutoSavePage;
