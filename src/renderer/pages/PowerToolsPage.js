import React, { useEffect, useState, useContext } from 'react';
import { GlobalContext } from 'context/globalContext';

import PowerTools from 'components/organisms/Wrappers/PowerTools.js';

const PowerToolsPage = () => {
  const { state, setState } = useContext(GlobalContext);
  const { achievements } = state;
  const [statePage, setStatePage] = useState({
    disabledNext: false,
    disabledBack: false,
    data: '',
  });
  const { disabledNext, disabledBack, data } = statePage;
  const setPowerTools = (data) => {
    if (data.target.value != '') {
      setState({
        ...state,
        powerTools: true,
      });
    } else {
      setState({
        ...state,
        powerTools: false,
      });
    }
  };

  const createSudo = (data) => {
    console.log('hi');
    //echo -e "cacadevaca\ncacadevaca" | passwd deck
  };
  return (
    <PowerTools
      data={data}
      disabledNext={disabledNext}
      disabledBack={disabledBack}
      onChange={setPowerTools}
      onClick={createSudo}
    />
  );
};

export default PowerToolsPage;
