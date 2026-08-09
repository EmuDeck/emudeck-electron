import { useTranslation } from 'react-i18next';
import React, { useContext, useRef, useState, useEffect } from 'react';
import { GlobalContext } from 'context/globalContext';
import Wrapper from 'components/molecules/Wrapper/Wrapper';

import Header from 'components/organisms/Header/Header';
import Footer from 'components/organisms/Footer/Footer';

import AutoMap from 'components/organisms/Wrappers/AutoMap';

function AutoMapPage() {
  const { t, i18n } = useTranslation();
  const { state, setState } = useContext(GlobalContext);
  const { automap, system } = state;

  const setAutoMap = (emulator, status) => {
    setState({
      ...state,
      automap: {
        ...automap,
        [emulator]: status,
      },
    });
  };

  const [statePage, setStatePage] = useState({
    dom: undefined,
  });
  const { dom } = statePage;

  return (
    <Wrapper>
      <Header title={t('AutoMapPage.title')} />
      <p className="lead">{t('AutoMapPage.description')}</p>
      <AutoMap onClick={setAutoMap} />
      <Footer next="frontend-selector" nextText={t('general.next')} />
    </Wrapper>
  );
}

export default AutoMapPage;
