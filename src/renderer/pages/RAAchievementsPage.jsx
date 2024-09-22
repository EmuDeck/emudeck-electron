import { useTranslation } from 'react-i18next';
import React, { useState, useContext, useRef, useEffect } from 'react';
import { GlobalContext } from 'context/globalContext';
import Wrapper from 'components/molecules/Wrapper/Wrapper';

import Header from 'components/organisms/Header/Header';
import Footer from 'components/organisms/Footer/Footer';

import RAAchievements from 'components/organisms/Wrappers/RAAchievements';

function RAAchievementsPage() {
  const { t, i18n } = useTranslation();
  const { state, setState } = useContext(GlobalContext);
  const { achievements } = state;
  const [statePage] = useState({
    disabledNext: false,
    disabledBack: false,
    dom: undefined,
  });
  const { disabledNext, disabledBack, dom } = statePage;
  const setAchievements = (data) => {
    if (data.target.name === 'user') {
      setState({
        ...state,
        achievements: { ...achievements, user: data.target.value },
      });
    } else {
      setState({
        ...state,
        achievements: { ...achievements, pass: data.target.value },
      });
    }
  };

  const setAchievementsHardCore = () => {
    setState({
      ...state,
      achievements: { ...achievements, hardcore: !achievements.hardcore },
    });
  };

  return (
    <Wrapper>
      <Header title={t('RAAchievementsPage.title')} />
      <p className="lead">{t('RAAchievementsPage.description')}</p>
      <RAAchievements
        onChange={setAchievements}
        onToggle={setAchievementsHardCore}
      />
      <Footer
        next="ra-bezels"
        nextText={achievements.token ? t('general.next') : t('general.skip')}
        disabledNext={disabledNext}
        disabledBack={disabledBack}
      />
    </Wrapper>
  );
}

export default RAAchievementsPage;
