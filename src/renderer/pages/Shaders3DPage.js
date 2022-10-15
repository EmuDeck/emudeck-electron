import React, { useEffect, useState, useContext } from 'react';
import { GlobalContext } from 'context/globalContext';

import Shaders3D from 'components/organisms/Wrappers/Shaders3D.js';

const Shaders3DPage = () => {
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
        classic3d: shaderStatus,
      },
    });
  };

  return (
    <Shaders3D
      data={data}
      onClick={shaderSet}
      disabledNext={disabledNext}
      disabledBack={disabledBack}
    />
  );
};

export default Shaders3DPage;
