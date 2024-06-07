import { useTranslation } from 'react-i18next';
import React, { useEffect, useState, useContext, useRef } from 'react';
import { GlobalContext } from 'context/globalContext';
import Wrapper from 'components/molecules/Wrapper/Wrapper';

import Header from 'components/organisms/Header/Header';
import Footer from 'components/organisms/Footer/Footer';

import RABezels from 'components/organisms/Wrappers/RABezels';

const AndroidRABezelsPage = () => {
  const { t, i18n } = useTranslation();
  const { state, setState } = useContext(GlobalContext);
  const { android } = state;
  const { bezels } = android;

  const [statePage, setStatePage] = useState({
    disabledNext: false,
    disabledBack: false,
    dom: undefined,
  });
  const { disabledNext, disabledBack, data, dom } = statePage;
  const bezelsSet = (bezelStatus) => {
    setState({
      ...state,
      android: { ...android, bezels: bezelStatus },
    });
  };
  //Enabling button when changing the global state only if we have a device selected
  useEffect(() => {
    if (bezels != '') {
      setStatePage({ ...statePage, disabledNext: false });
    }
  }, [state]);

  return (
    <Wrapper>
      <Header title={t('RABezelsPage.title')} />
      <p className="lead">{t('RABezelsPage.description')}</p>
      <RABezels bezels={bezels} onClick={bezelsSet} />
      <Footer
        next="android-frontend-selector"
        disabledNext={disabledNext}
        disabledBack={disabledBack}
      />
    </Wrapper>
  );
};

export default AndroidRABezelsPage;
