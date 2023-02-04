import React, { useEffect, useState, useContext } from 'react';
import { GlobalContext } from 'context/globalContext';

import ShadersHandhelds from 'components/organisms/Wrappers/ShadersHandhelds';

const ShadersHandheldsPage = () => {
  const { state, setState } = useContext(GlobalContext);
  const { shaders } = state;
  const [statePage, setStatePage] = useState({
    disabledNext: false,
    disabledBack: false,
    data: '',
  });
  const { disabledNext, disabledBack, data } = statePage;
  const shaderSet = (shaderStatus) => {
    setState({
      ...state,
      shaders: {
        ...shaders,
        handhelds: shaderStatus,
      },
    });
  };

  return (
    <ShadersHandhelds
      data={data}
      onClick={shaderSet}
      disabledNext={disabledNext}
      disabledBack={disabledBack}
    />
  );
};

export default ShadersHandheldsPage;
