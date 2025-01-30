import { useTranslation } from 'react-i18next';
import React, { useState, useContext, useRef, useEffect } from 'react';
import { GlobalContext } from 'context/globalContext';
import Wrapper from 'components/molecules/Wrapper/Wrapper';

import Header from 'components/organisms/Header/Header';
import Footer from 'components/organisms/Footer/Footer';
import { useFetchCond } from 'hooks/useFetchCond';
import ESDETheme from 'components/organisms/Wrappers/ESDETheme';

function ESDEThemePage() {
  const { t, i18n } = useTranslation();
  const { state, setState } = useContext(GlobalContext);
  const { mode, system, installFrontends } = state;
  const [statePage, setStatePage] = useState({
    disabledNext: false,
    disabledBack: false,
    themes: undefined,
    dom: undefined,
  });
  const { disabledNext, disabledBack, themes, dom } = statePage;
  const themeSet = (themeName) => {
    setState({
      ...state,
      themeESDE: themeName,
    });
  };

  const themesWS = useFetchCond('https://token.emudeck.com/esde-themes.php');
  useEffect(() => {
    themesWS.post({}).then((data) => {
      setStatePage({ ...statePage, themes: data });
    });
  }, []);

  const nextPage = () => {
    if (mode === 'easy') {
      return 'end';
    }
    return 'emulator-selector';
  };

  return (
    <Wrapper aside={false}>
      <Header title={t('ESDEThemePage.title')} />
      <p className="lead">{t('ESDEThemePage.description')}</p>
      <ESDETheme themes={themes} onClick={themeSet} />
      <Footer
        next={nextPage()}
        nextText={t('general.next')}
        disabledNext={disabledNext}
        disabledBack={disabledBack}
      />
    </Wrapper>
  );
}

export default ESDEThemePage;
