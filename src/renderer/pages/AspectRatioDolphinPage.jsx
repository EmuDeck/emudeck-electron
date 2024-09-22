import { useTranslation } from 'react-i18next';
import React, { useState, useContext, useRef, useEffect } from 'react';
import { GlobalContext } from 'context/globalContext';
import Wrapper from 'components/molecules/Wrapper/Wrapper';

import Header from 'components/organisms/Header/Header';
import Footer from 'components/organisms/Footer/Footer';

import AspectRatioDolphin from 'components/organisms/Wrappers/AspectRatioDolphin';

function AspectRatioDolphinPage() {
  const { t, i18n } = useTranslation();
  const { state, setState } = useContext(GlobalContext);
  const { ar, overwriteConfigEmus } = state;
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
        dolphin: arStatus,
      },
    });
  };

  return (
    <Wrapper>
      <Header title={t('AspectRatioDolphinPage.title')} />
      <p className="lead">{t('AspectRatioDolphinPage.description')}</p>
      <AspectRatioDolphin data={data} onClick={arSet} />
      <Footer
        next={
          overwriteConfigEmus.ra.status === true
            ? 'shaders-handhelds'
            : 'controller-layout'
        }
        disabledNext={disabledNext}
        disabledBack={disabledBack}
      />
    </Wrapper>
  );
}

export default AspectRatioDolphinPage;
