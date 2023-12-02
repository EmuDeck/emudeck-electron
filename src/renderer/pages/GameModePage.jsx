import React, { useState, useContext, useRef, useEffect } from 'react';
import { GlobalContext } from 'context/globalContext';
import Wrapper from 'components/molecules/Wrapper/Wrapper';
import GamePad from 'components/organisms/GamePad/GamePad';
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
    dom: undefined,
  });
  const { disabledNext, disableButton, dom } = statePage;

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
    <div style={{ height: '100vh' }} >
      
      <Wrapper>
        <Header title="Boot Mode" />
        <GameMode onClick={gameModeSet} disableButton={disableButton} />

        <Footer
          next={nextButtonStatus()}
          nextText={type === 'welcome' ? 'Back' : 'Next'}
          disabledNext={disabledNext}
        />
      </Wrapper>
    </div>
  );
}

export default GameModePage;
