import React, { useEffect, useState, useContext } from 'react';
import { GlobalContext } from 'context/globalContext';
import Wrapper from 'components/molecules/Wrapper/Wrapper';
import Header from 'components/organisms/Header/Header';
import Footer from 'components/organisms/Footer/Footer';

import HomebrewGames from 'components/organisms/Wrappers/HomebrewGames';

function HomebrewGamesPage() {
  const { state, setState } = useContext(GlobalContext);
  const { bezels, mode, system } = state;
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
  // Enabling button when changing the global state only if we have a device selected
  useEffect(() => {
    if (bezels !== '') {
      setStatePage({ ...statePage, disabledNext: false });
    }
  }, [state]);

  return (
    <Wrapper>
      <Header title="Install" bold="Homebrew Games" />
      <HomebrewGames
        data={data}
        disabledNext={disabledNext}
        disabledBack={disabledBack}
        onClick={HomebrewGamesSet}
      />
      <Footer
        next={
          mode === 'easy'
            ? 'end'
            : system === 'win32'
            ? 'emulator-resolution'
            : 'confirmation'
        }
        nextText={mode === 'easy' ? 'Finish' : 'Next'}
        disabledNext={disabledNext}
        disabledBack={disabledBack}
      />
    </Wrapper>
  );
}

export default HomebrewGamesPage;
