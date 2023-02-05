import React, { useEffect, useState, useContext } from 'react';
import { GlobalContext } from 'context/globalContext';
import Wrapper from 'components/molecules/Wrapper/Wrapper';

import PegasusTheme from 'components/organisms/Wrappers/PegasusTheme';

const PegasusThemePage = () => {
  const { state, setState } = useContext(GlobalContext);
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
      <PegasusTheme
        data={data}
        onClick={themeSet}
        disabledNext={disabledNext}
        disabledBack={disabledBack}
      />
    </Wrapper>
  );
};

export default PegasusThemePage;
