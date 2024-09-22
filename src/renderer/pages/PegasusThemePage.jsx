import { useTranslation } from 'react-i18next';
import React, { useState, useContext, useRef, useEffect } from 'react';
import { GlobalContext } from 'context/globalContext';
import Wrapper from 'components/molecules/Wrapper/Wrapper';

import Header from 'components/organisms/Header/Header';
import Footer from 'components/organisms/Footer/Footer';
import { useFetchCond } from 'hooks/useFetchCond';
import PegasusTheme from 'components/organisms/Wrappers/PegasusTheme';

function PegasusThemePage() {
  const { t, i18n } = useTranslation();
  const { state, setState } = useContext(GlobalContext);
  const { system, mode, installFrontends } = state;
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
      themePegasus: themeName,
    });
  };

  const themesWS = useFetchCond('https://token.emudeck.com/pegasus-themes.php');
  useEffect(() => {
    themesWS.post({}).then((data) => {
      setStatePage({ ...statePage, themes: data });
    });
  }, []);

  const nextPage = () => {
    if (system === 'SteamOS') {
      return 'confirmation';
    }
    if (mode === 'easy') {
      return 'end';
    }
    return 'emulator-resolution';
  };

  return (
    <Wrapper aside={false}>
      <Header title={t('PegasusThemePage.title')} />
      <p className="lead">{t('PegasusThemePage.description')}</p>
      <PegasusTheme themes={themes} onClick={themeSet} />
      <Footer
        next={nextPage()}
        nextText={t('general.next')}
        disabledNext={disabledNext}
        disabledBack={disabledBack}
      />
    </Wrapper>
  );
}

export default PegasusThemePage;
