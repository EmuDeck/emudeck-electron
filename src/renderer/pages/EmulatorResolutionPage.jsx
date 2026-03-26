import { useTranslation } from 'react-i18next';
import React, { useContext, useRef, useState, useEffect } from 'react';
import { GlobalContext } from 'context/globalContext';
import { useNavigate } from 'react-router-dom';

import Wrapper from 'components/molecules/Wrapper/Wrapper';

import Header from 'components/organisms/Header/Header';
import Footer from 'components/organisms/Footer/Footer';

import EmulatorResolution from 'components/organisms/Wrappers/EmulatorResolution';

function EmulatorResolutionPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { state, setState } = useContext(GlobalContext);
  const { resolutions, system, device } = state;

  const setResolution = (emulator, resolution) => {
    setState({
      ...state,
      resolutions: {
        ...resolutions,
        [emulator]: resolution,
      },
    });
  };

  useEffect(() => {
    if (
      device === 'Steam Deck' ||
      device === 'Steam Machine' ||
      device === 'Playnix Console' ||
      device === 'Windows Handlheld'
    ) {
      navigate('/controller-layout');
    }
  }, []);

  const [statePage, setStatePage] = useState({
    dom: undefined,
  });
  const { dom } = statePage;

  return (
    <Wrapper>
      <Header title={t('EmulatorResolutionPage.title')} />
      <p className="lead">{t('EmulatorResolutionPage.description')}</p>
      <EmulatorResolution onClick={setResolution} />
      <Footer next="controller-layout" nextText={t('general.next')} />
    </Wrapper>
  );
}

export default EmulatorResolutionPage;
