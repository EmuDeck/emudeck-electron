import React, { useState, useContext, useRef, useEffect } from 'react';
import { GlobalContext } from 'context/globalContext';
import Wrapper from 'components/molecules/Wrapper/Wrapper';
import GamePad from 'components/organisms/GamePad/GamePad';
import Header from 'components/organisms/Header/Header';
import Footer from 'components/organisms/Footer/Footer';
import { useFetchCond } from 'hooks/useFetchCond';
import ESDETheme from 'components/organisms/Wrappers/ESDETheme';

function ESDEThemePage() {
  const { state, setState } = useContext(GlobalContext);
  const { device, mode, system } = state;
  const [statePage, setStatePage] = useState({
    disabledNext: false,
    disabledBack: false,
    themes: undefined,
    dom: undefined,
  });
  const { disabledNext, disabledBack, themes, dom } = statePage;
  const themeSet = (themeName) => {
    setState({
      ...state,
      themeESDE: themeName,
    });
  };

  const themesWS = useFetchCond('https://token.emudeck.com/esde-themes.php');
  useEffect(() => {
    themesWS.post({}).then((data) => {
      setStatePage({ ...statePage, themes: data });
    });
  }, []);

  const nextPage = () => {
    if (system !== 'SteamOS') {
      return 'emulator-resolution';
    }
    if (mode === 'easy') {
      return 'end';
    }
    return 'confirmation';
  };

  // GamePad
  const domElementsRef = useRef(null);
  const domElementsCur = domElementsRef.current;
  let domElements;
  useEffect(() => {
    if (domElementsCur && dom === undefined) {
      domElements = domElementsCur.querySelectorAll('button');
      setStatePage({ ...statePage, dom: domElements });
    }
  }, [statePage]);

  return (
    <div style={{ height: '100vh' }} ref={domElementsRef}>
      {dom !== undefined && <GamePad elements={dom} />}
      <Wrapper>
        <Header title="EmulationStation-DE Default Theme" />
        <ESDETheme themes={themes} onClick={themeSet} />
        <Footer
          next={nextPage()}
          nextText="Next"
          disabledNext={disabledNext}
          disabledBack={disabledBack}
        />
      </Wrapper>
    </div>
  );
}

export default ESDEThemePage;
