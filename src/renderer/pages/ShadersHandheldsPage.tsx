import { useState, useContext } from 'react';
import { useGlobalContext } from 'context/globalContext';

import ShadersHandhelds from 'components/organisms/Wrappers/ShadersHandhelds.js';

const ShadersHandheldsPage = () => {
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
