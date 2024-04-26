import { useTranslation } from 'react-i18next';
import React, { useState, useContext, useRef, useEffect } from 'react';
import { GlobalContext } from 'context/globalContext';
import Wrapper from 'components/molecules/Wrapper/Wrapper';

import Header from 'components/organisms/Header/Header';
import Footer from 'components/organisms/Footer/Footer';

import ShadersHandhelds from 'components/organisms/Wrappers/ShadersHandhelds';

function ShadersHandheldsPage() {
  const { t, i18n } = useTranslation();
  const { state, setState } = useContext(GlobalContext);
  const { shaders } = state;
  const [statePage] = useState({
    disabledNext: false,
    disabledBack: false,
    data: '',
    dom: undefined,
  });
  const { disabledNext, disabledBack, data, dom } = statePage;
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
      <Header title={t('ShadersHandheldsPage.title')} />
      <p className="lead">{t('ShadersHandheldsPage.description')}</p>
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
