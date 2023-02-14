import React, { useEffect, useState, useContext } from 'react';
import { GlobalContext } from 'context/globalContext';
import Wrapper from 'components/molecules/Wrapper/Wrapper';
import Header from 'components/organisms/Header/Header';
import Footer from 'components/organisms/Footer/Footer';

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

  const changeMinute = (value) => {
    setStatePage({
      minute: value,
    });
  };

  return (
    <Wrapper>
      <Header title="Emulation Showcase" />
      <CopyGames onClick={changeMinute} minute={minute} />
      <Footer
        next={false}
        disabledNext={disabledNext}
        disabledBack={disabledBack}
      />
    </Wrapper>
  );
};

export default CopyGamesPage;
