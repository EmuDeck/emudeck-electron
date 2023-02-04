import React, { useEffect, useState, useContext } from 'react';
import { GlobalContext } from 'context/globalContext';

import CopyGames from 'components/organisms/Wrappers/CopyGames';

const CopyGamesPage = () => {
  const { state, setState } = useContext(GlobalContext);

  const [statePage, setStatePage] = useState({
    disabledNext: false,
    disabledBack: false,
    showNotification: false,
    minute: 0,
  });
  const { disabledNext, disabledBack, minute } = statePage;

  const changeMinute = (minute) => {
    setStatePage({
      minute: minute,
    });
  };

  return (
    <CopyGames
      disabledNext={disabledNext}
      disabledBack={disabledBack}
      onClick={changeMinute}
      minute={minute}
    />
  );
};

export default CopyGamesPage;
