import React, { useEffect, useState, useContext } from 'react';
import { GlobalContext } from 'context/globalContext';
import Wrapper from 'components/molecules/Wrapper/Wrapper';
import Header from 'components/organisms/Header/Header';
import Footer from 'components/organisms/Footer/Footer';

import PegasusTheme from 'components/organisms/Wrappers/PegasusTheme';

const PegasusThemePage = () => {
  const { state, setState } = useContext(GlobalContext);
  const { theme, system } = state;
  const [statePage, setStatePage] = useState({
    disabledNext: false,
    disabledBack: false,
    data: '',
  });
  const { disabledNext, disabledBack, data } = statePage;
  const themeSet = (themeName) => {
    setState({
      ...state,
      theme: themeName,
    });
  };

  return (
    <Wrapper>
      <Header title="EmulationStation DE " bold="Theme" />
      <PegasusTheme data={data} onClick={themeSet} />
      <Footer
        next={
          system == 'win32'
            ? 'emulator-resolution'
            : mode == 'easy'
            ? 'end'
            : 'confirmation'
        }
        nextText="Next"
        disabledNext={disabledNext}
        disabledBack={disabledBack}
      />
    </Wrapper>
  );
};

export default PegasusThemePage;
