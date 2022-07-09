import React, { useEffect, useState, useContext } from 'react';
import { GlobalContext } from 'context/globalContext';

import GyroDSU from 'components/organisms/Wrappers/GyroDSU.js';

const GyroDSUPage = () => {
  const { state, setState } = useContext(GlobalContext);
  const { achievements } = state;
  const [statePage, setStatePage] = useState({
    disabledNext: false,
    disabledBack: false,
    data: '',
  });
  const { disabledNext, disabledBack, data } = statePage;
  const setGyro = (data) => {
    if (data.target.value != '') {
      setState({
        ...state,
        GyroDSU: true,
      });
    } else {
      setState({
        ...state,
        GyroDSU: false,
      });
    }
    //echo -e "cacadevaca\ncacadevaca" | passwd deck
  };

  const createSudo = (data) => {
    console.log('hi');
    //echo -e "cacadevaca\ncacadevaca" | passwd deck
  };

  return (
    <GyroDSU
      data={data}
      disabledNext={disabledNext}
      disabledBack={disabledBack}
      onChange={setGyro}
      onClick={createSudo}
    />
  );
};

export default GyroDSUPage;
