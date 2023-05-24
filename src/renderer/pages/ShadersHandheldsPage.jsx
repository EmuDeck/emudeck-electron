import React, { useState, useContext } from 'react';
import { GlobalContext } from 'context/globalContext';
import Wrapper from 'components/molecules/Wrapper/Wrapper';
import Header from 'components/organisms/Header/Header';
import Footer from 'components/organisms/Footer/Footer';

import ShadersHandhelds from 'components/organisms/Wrappers/ShadersHandhelds';

function ShadersHandheldsPage() {
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
        handhelds: shaderStatus,
      },
    });
  };

  return (
    <Wrapper>
      <Header title="Configure LCD Shader for" bold="Handheld Systems" />
      <ShadersHandhelds
        data={data}
        onClick={shaderSet}
        disabledNext={disabledNext}
        disabledBack={disabledBack}
      />
      <Footer
        next="shaders-classic"
        disabledNext={disabledNext}
        disabledBack={disabledBack}
      />
    </Wrapper>
  );
}

export default ShadersHandheldsPage;
