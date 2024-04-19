import { useTranslation } from 'react-i18next';
import React, { useState, useContext, useRef, useEffect } from 'react';
import { GlobalContext } from 'context/globalContext';
import { useNavigate } from 'react-router-dom';

import Wrapper from 'components/molecules/Wrapper/Wrapper';
import Header from 'components/organisms/Header/Header';
import Footer from 'components/organisms/Footer/Footer';

import ControllerLayout from 'components/organisms/Wrappers/ControllerLayout';

function ControllerLayoutPage() {
  const navigate = useNavigate();
  const { state, setState } = useContext(GlobalContext);
  const { system } = state;
  const [statePage] = useState({
    disabledNext: false,
    disabledBack: false,
  });
  const { disabledNext, disabledBack } = statePage;
  const controllerLayoutSet = (shaderStatus) => {
    setState({
      ...state,
      controllerLayout: shaderStatus,
    });
  };

  useEffect(() => {
    if (system === 'win32') {
      navigate('/frontend-selector');
    }
  }, []);

  return (
    <div style={{ height: '100vh' }}>
      <Wrapper>
        <Header title="Configure Controller Layout" />
        <ControllerLayout onClick={controllerLayoutSet} />
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
