import { useState, useContext } from 'react';
import { useGlobalContext } from 'context/globalContext';

import Shaders2D from 'components/organisms/Wrappers/Shaders2D.js';

const Shaders2DPage = () => {
  const { state, setState } = useGlobalContext();
  const { shaders } = state;
  const [statePage, setStatePage] = useState({
    disabledNext: false,
    disabledBack: false,
    data: '',
  });
  const { disabledNext, disabledBack, data } = statePage;
  const shaderSet = (shaderStatus: boolean) => {
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
