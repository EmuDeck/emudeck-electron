import React, { useState, useContext } from 'react';
import { GlobalContext } from 'context/globalContext';
import Wrapper from 'components/molecules/Wrapper/Wrapper';
import Header from 'components/organisms/Header/Header';
import Footer from 'components/organisms/Footer/Footer';

import Shaders2D from 'components/organisms/Wrappers/Shaders2D';

function Shaders2DPage() {
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
        classic: shaderStatus,
      },
    });
  };

  return (
    <Wrapper>
      <Header title="Configure CRT Shader for" bold="Classic 2D Games" />
      <Shaders2D
        data={data}
        onClick={shaderSet}
        disabledNext={disabledNext}
        disabledBack={disabledBack}
      />
      <Footer
        next="shaders-3d-classic"
        disabledNext={disabledNext}
        disabledBack={disabledBack}
      />
    </Wrapper>
  );
}

export default Shaders2DPage;
