import React, { useEffect, useState, useContext } from 'react';
import { GlobalContext } from 'context/globalContext';

import Shaders2D from 'components/organisms/Wrappers/Shaders2D';

const Shaders2DPage = () => {
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
        classic: shaderStatus,
      },
    });
  };

  return (
    <Shaders2D
      data={data}
      onClick={shaderSet}
      disabledNext={disabledNext}
      disabledBack={disabledBack}
    />
  );
};

export default Shaders2DPage;
