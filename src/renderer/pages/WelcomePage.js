import React, { useEffect, useState, useContext } from 'react';
import { GlobalContext } from 'context/globalContext';

import Welcome from 'components/organisms/Wrappers/Welcome.js';

const WelcomePage = () => {
  const { state, setState } = useContext(GlobalContext);
  const [statePage, setStatePage] = useState({
    disabledNext: true,
    disabledBack: true,
    downloadComplete: true,
  });
  const { disabledNext, disabledBack, downloadComplete } = statePage;

  const selectMode = (value) => {
    setState({ ...state, mode: value });
    setStatePage({ ...statePage, disabledNext: false });
  };

  const { device } = state;

  return (
    <Welcome
      disabledNext={disabledNext}
      disabledBack={disabledBack}
      downloadComplete={downloadComplete}
      onClick={selectMode}
      back={false}
      next={device === 'Steam Deck' ? 'rom-storage' : 'device-selector'}
    />
  );
};

export default WelcomePage;
