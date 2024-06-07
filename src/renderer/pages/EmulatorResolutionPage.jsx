import { useTranslation } from 'react-i18next';
import React, { useContext, useRef, useState, useEffect } from 'react';
import { GlobalContext } from 'context/globalContext';
import Wrapper from 'components/molecules/Wrapper/Wrapper';

import Header from 'components/organisms/Header/Header';
import Footer from 'components/organisms/Footer/Footer';

import EmulatorResolution from 'components/organisms/Wrappers/EmulatorResolution';

function EmulatorResolutionPage() {
  const { t, i18n } = useTranslation();
  const { state, setState } = useContext(GlobalContext);
  const { resolutions, system } = state;

  const setResolution = (emulator, resolution) => {
    setState({
      ...state,
      resolutions: {
        ...resolutions,
        [emulator]: resolution,
      },
    });
  };

  const [statePage, setStatePage] = useState({
    dom: undefined,
  });
  const { dom } = statePage;

  return (
    <Wrapper>
      <Header title={t('EmulatorResolutionPage.title')} />
      <p className="lead">{t('EmulatorResolutionPage.description')}</p>
      <EmulatorResolution onClick={setResolution} />
      <Footer next="confirmation" nextText={t('general.next')} />
    </Wrapper>
  );
}

export default EmulatorResolutionPage;
