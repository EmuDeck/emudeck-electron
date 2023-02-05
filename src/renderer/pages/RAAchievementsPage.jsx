import React, { useEffect, useState, useContext } from 'react';
import { GlobalContext } from 'context/globalContext';
import Wrapper from 'components/molecules/Wrapper/Wrapper';

import RAAchievements from 'components/organisms/Wrappers/RAAchievements';

const RAAchievementsPage = () => {
  const { state, setState } = useContext(GlobalContext);
  const { achievements } = state;
  const [statePage, setStatePage] = useState({
    disabledNext: false,
    disabledBack: false,
    data: '',
  });
  const ipcChannel = window.electron.ipcRenderer;
  const { disabledNext, disabledBack, data } = statePage;
  const setAchievements = (data) => {
    if (data.target.name == 'user') {
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

  const setAchievementsHardCore = (data) => {
    setState({
      ...state,
      achievements: { ...achievements, hardcore: !achievements.hardcore },
    });
  };

  return (
    <Wrapper>
      <RAAchievements
        data={data}
        disabledNext={disabledNext}
        disabledBack={disabledBack}
        next="ra-bezels"
        nextText={achievements.pass ? 'Continue' : 'Skip'}
        onChange={setAchievements}
        onToggle={setAchievementsHardCore}
      />
    </Wrapper>
  );
};

export default RAAchievementsPage;
