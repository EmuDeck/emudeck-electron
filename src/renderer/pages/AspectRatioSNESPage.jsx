import { useTranslation } from 'react-i18next';
import React, { useState, useContext, useRef, useEffect } from 'react';
import { GlobalContext } from 'context/globalContext';
import Wrapper from 'components/molecules/Wrapper/Wrapper';

import Header from 'components/organisms/Header/Header';
import Footer from 'components/organisms/Footer/Footer';

import AspectRatioSNES from 'components/organisms/Wrappers/AspectRatioSNES';

function AspectRatioSNESPage() {
  const { t, i18n } = useTranslation();
  const { state, setState } = useContext(GlobalContext);
  const { ar } = state;
  const [statePage] = useState({
    disabledNext: false,
    disabledBack: false,
    data: '',
    dom: undefined,
  });
  const { disabledNext, disabledBack, data, dom } = statePage;
  const arSet = (arStatus) => {
    setState({
      ...state,
      ar: {
        ...ar,
        snes: arStatus,
      },
    });
  };

  return (
    <Wrapper>
      <Header title={t('AspectRatioSNESPage.title')} />
      <p className="lead">{t('AspectRatioSNESPage.description')}</p>
      <AspectRatioSNES data={data} onClick={arSet} />
      <Footer
        next="aspect-ratio-3d"
        disabledNext={disabledNext}
        disabledBack={disabledBack}
      />
    </Wrapper>
  );
}

export default AspectRatioSNESPage;
