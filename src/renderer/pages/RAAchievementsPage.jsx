import React, { useState, useContext, useRef, useEffect } from 'react';
import { GlobalContext } from 'context/globalContext';
import Wrapper from 'components/molecules/Wrapper/Wrapper';

import Header from 'components/organisms/Header/Header';
import Footer from 'components/organisms/Footer/Footer';

import RAAchievements from 'components/organisms/Wrappers/RAAchievements';

function RAAchievementsPage() {
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
    <div style={{ height: '100vh' }} >
      
      <Wrapper>
        <Header title="Configure RetroAchievements" />
        <RAAchievements
          onChange={setAchievements}
          onToggle={setAchievementsHardCore}
        />
        <Footer
          next="ra-bezels"
          nextText={achievements.token ? 'Continue' : 'Skip'}
          disabledNext={disabledNext}
          disabledBack={disabledBack}
        />
      </Wrapper>
    </div>
  );
}

export default RAAchievementsPage;
