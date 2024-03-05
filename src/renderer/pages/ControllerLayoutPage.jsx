import React, { useState, useContext, useRef, useEffect } from 'react';
import { GlobalContext } from 'context/globalContext';
import Wrapper from 'components/molecules/Wrapper/Wrapper';

import Header from 'components/organisms/Header/Header';
import Footer from 'components/organisms/Footer/Footer';

import ControllerLayout from 'components/organisms/Wrappers/ControllerLayout';

function ControllerLayoutPage() {
  const { state, setState } = useContext(GlobalContext);
  const [statePage] = useState({
    disabledNext: false,
    disabledBack: false,
    data: '',
    dom: undefined,
  });
  const { disabledNext, disabledBack, data, dom } = statePage;
  const controllerLayoutSet = (shaderStatus) => {
    setState({
      ...state,
      controllerLayout: shaderStatus,
    });
  };

  return (
    <div style={{ height: '100vh' }}>
      <Wrapper>
        <Header title="Configure Controller Layout" />
        <ControllerLayout data={data} onClick={controllerLayoutSet} />
        <Footer
          next="frontend-selector"
          disabledNext={disabledNext}
          disabledBack={disabledBack}
        />
      </Wrapper>
    </div>
  );
}

export default ControllerLayoutPage;
