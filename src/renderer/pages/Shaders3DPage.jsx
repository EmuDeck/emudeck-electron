import React, { useState, useContext } from 'react';
import { GlobalContext } from 'context/globalContext';
import Wrapper from 'components/molecules/Wrapper/Wrapper';
import Header from 'components/organisms/Header/Header';
import Footer from 'components/organisms/Footer/Footer';

import Shaders3D from 'components/organisms/Wrappers/Shaders3D';

function Shaders3DPage() {
  const { state, setState } = useContext(GlobalContext);
  const { shaders } = state;
  const [statePage] = useState({
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
    <Wrapper>
      <Header title="Configure CRT Shader for Classic 3D Games" />
      <Shaders3D
        data={data}
        onClick={shaderSet}
        disabledNext={disabledNext}
        disabledBack={disabledBack}
      />
      <Footer
        next="pegasus-theme"
        disabledNext={disabledNext}
        disabledBack={disabledBack}
      />
    </Wrapper>
  );
}

export default Shaders3DPage;
