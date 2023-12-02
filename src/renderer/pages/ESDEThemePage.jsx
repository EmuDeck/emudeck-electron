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
  const { mode, system, installFrontends } = state;
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
    if (installFrontends.pegasus.status === true) {
      return 'pegasus-theme';
    }
    if (system === 'SteamOS') {
      return 'confirmation';
    }
    if (mode === 'easy') {
      return 'end';
    }
    return 'emulator-resolution';
  };



  return (
    <div style={{ height: '100vh' }} >
      
      <Wrapper aside={false}>
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
