import React, { useEffect, useState, useContext } from 'react';
import { GlobalContext } from 'context/globalContext';

import HomebrewGames from 'components/organisms/Wrappers/HomebrewGames.js';

const HomebrewGamesPage = () => {
  const { state, setState } = useContext(GlobalContext);
  const { bezels } = state;
  const [statePage, setStatePage] = useState({
    disabledNext: false,
    disabledBack: false,
    data: '',
  });
  const { disabledNext, disabledBack, data } = statePage;
  const HomebrewGamesSet = (status) => {
    setState({
      ...state,
      homebrewGames: status,
    });
  };
  //Enabling button when changing the global state only if we have a device selected
  useEffect(() => {
    if (bezels != '') {
      setStatePage({ ...statePage, disabledNext: false });
    }
  }, [state]); // <-- here put the parameter to listen

  return (
    <HomebrewGames
      data={data}
      disabledNext={disabledNext}
      disabledBack={disabledBack}
      onClick={HomebrewGamesSet}
    />
  );
};

export default HomebrewGamesPage;
