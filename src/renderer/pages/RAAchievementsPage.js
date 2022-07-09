import React, { useEffect, useState, useContext } from 'react';
import { GlobalContext } from 'context/globalContext';

import RAAchievements from 'components/organisms/Wrappers/RAAchievements.js';

const RAAchievementsPage = () => {
  const { state, setState } = useContext(GlobalContext);
  const { achievements } = state;
  const [statePage, setStatePage] = useState({
    disabledNext: false,
    disabledBack: false,
    data: '',
  });
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

  return (
    <RAAchievements
      data={data}
      disabledNext={disabledNext}
      disabledBack={disabledBack}
      onChange={setAchievements}
    />
  );
};

export default RAAchievementsPage;
