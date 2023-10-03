import React, { useState, useContext, useRef, useEffect } from 'react';
import { GlobalContext } from 'context/globalContext';
import Wrapper from 'components/molecules/Wrapper/Wrapper';
import GamePad from 'components/organisms/GamePad/GamePad';
import Header from 'components/organisms/Header/Header';
import Footer from 'components/organisms/Footer/Footer';

import PegasusTheme from 'components/organisms/Wrappers/PegasusTheme';

function PegasusThemePage() {
  const { state, setState } = useContext(GlobalContext);
  const { device, mode } = state;
  const [statePage] = useState({
    disabledNext: false,
    disabledBack: false,
    data: '',
    dom: undefined,
  });
  const { disabledNext, disabledBack, data, dom } = statePage;
  const themeSet = (themeName) => {
    setState({
      ...state,
      theme: themeName,
    });
  };

  const nextPage = () => {
    if (
      device === 'Linux PC' ||
      device === 'Windows PC' ||
      device === 'Windows Handlheld'
    ) {
      return 'emulator-resolution';
    }
    if (mode === 'easy') {
      return 'end';
    }
    return 'confirmation';
  };

  //GamePad
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
        <Header title="EmulationStation DE  Theme" />
        <PegasusTheme data={data} onClick={themeSet} />
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

export default PegasusThemePage;
