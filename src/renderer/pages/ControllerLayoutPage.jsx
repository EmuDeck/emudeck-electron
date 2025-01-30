import { useTranslation } from 'react-i18next';
import React, { useState, useContext, useRef, useEffect } from 'react';
import { GlobalContext } from 'context/globalContext';
import { useNavigate } from 'react-router-dom';

import Wrapper from 'components/molecules/Wrapper/Wrapper';
import Header from 'components/organisms/Header/Header';
import Footer from 'components/organisms/Footer/Footer';

import ControllerLayout from 'components/organisms/Wrappers/ControllerLayout';

function ControllerLayoutPage() {
  const { t, i18n } = useTranslation();
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
      navigate('/confirmation');
    }
  }, []);

  return (
    <Wrapper>
      <Header title={t('ControllerLayoutPage.title')} />
      <p className="lead">{t('ControllerLayoutPage.description')}</p>
      <ControllerLayout onClick={controllerLayoutSet} />
      <Footer
        next="confirmation"
        disabledNext={disabledNext}
        disabledBack={disabledBack}
      />
    </Wrapper>
  );
}

export default ControllerLayoutPage;
