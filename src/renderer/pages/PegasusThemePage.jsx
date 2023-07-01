import React, { useState, useContext } from 'react';
import { GlobalContext } from 'context/globalContext';
import Wrapper from 'components/molecules/Wrapper/Wrapper';
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
  });
  const { disabledNext, disabledBack, data } = statePage;
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

  return (
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
  );
}

export default PegasusThemePage;
