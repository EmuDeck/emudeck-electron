import React, { useState, useContext } from 'react';
import { GlobalContext } from 'context/globalContext';
import Wrapper from 'components/molecules/Wrapper/Wrapper';
import Header from 'components/organisms/Header/Header';
import Footer from 'components/organisms/Footer/Footer';
import { useParams } from 'react-router-dom';
import GameMode from 'components/organisms/Wrappers/GameMode';

function GameModePage() {
  const { state, setState } = useContext(GlobalContext);
  const { type } = useParams();
  const { cloudSyncType } = state;
  const [statePage] = useState({
    disabledNext: false,
    disabledBack: false,
    disableButton: false,
  });
  const { disabledNext, disableButton } = statePage;

  const gameModeSet = (item) => {
    setState({
      ...state,
      gamemode: item,
    });
  };
  const nextButtonStatus = () => {
    if (type === 'welcome') {
      return 'welcome';
    }
    return 'confirmation';
  };

  return (
    <Wrapper>
      <Header title="Boot Mode" />
      <GameMode onClick={gameModeSet} disableButton={disableButton} />

      <Footer
        next={nextButtonStatus()}
        nextText={type === 'welcome' ? 'Back' : 'Next'}
        disabledNext={disabledNext}
      />
    </Wrapper>
  );
}

export default GameModePage;
