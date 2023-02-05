import React, { useEffect, useState, useContext } from 'react';
import { GlobalContext } from 'context/globalContext';
import Wrapper from 'components/molecules/Wrapper/Wrapper';

import RAConfig from 'components/organisms/Wrappers/RAConfig';

const RAConfigPage = () => {
  const { state, setState } = useContext(GlobalContext);
  const { snes } = state;
  const [statePage, setStatePage] = useState({
    disabledNext: true,
    disabledBack: false,
    data: '',
  });
  const { disabledNext, disabledBack, overlaysInstalled, data } = statePage;

  const snesSet = (snesAR) => {
    setState({
      ...state,
      snes: snesAR,
    });
  };
  //Enabling button when changing the global state only if we have a device selected
  useEffect(() => {
    if (snes != '') {
      setStatePage({ ...statePage, disabledNext: false });
    }
  }, [state]); // <-- here put the parameter to listen

  return (
    <Wrapper>
      <RAConfig
        data={data}
        disabledNext={disabledNext}
        disabledBack={disabledBack}
        overlaysInstalled={overlaysInstalled}
      />
    </Wrapper>
  );
};

export default RAConfigPage;
