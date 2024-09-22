import { useTranslation } from 'react-i18next';
import React, { useState, useContext, useRef, useEffect } from 'react';
import { GlobalContext } from 'context/globalContext';
import Wrapper from 'components/molecules/Wrapper/Wrapper';

import Header from 'components/organisms/Header/Header';
import Footer from 'components/organisms/Footer/Footer';
import EmuModal from 'components/molecules/EmuModal/EmuModal';
import FrontendSelector from 'components/organisms/Wrappers/FrontendSelector';
import { BtnSimple } from 'getbasecore/Atoms';
import {
  themesPegasusGameOS,
  rbsimple2,
  imgSTEAM,
} from 'components/utils/images/images';

const images = {
  esde: rbsimple2,
  pegasus: themesPegasusGameOS,
  steam: imgSTEAM,
};

function AndroidFrontendSelectorPage() {
  const { t, i18n } = useTranslation();
  const { state, setState } = useContext(GlobalContext);
  const { device, android, mode, system } = state;
  const { installFrontends } = android;
  console.log({ installFrontends });
  const [statePage, setStatePage] = useState({
    disabledNext: false,
    disabledBack: false,
    data: '',
    modal: false,
    lastSelected: undefined,
    dom: undefined,
  });
  const { disabledNext, disabledBack, modal, lastSelected, dom } = statePage;

  const closeModal = () => {
    setStatePage({ ...statePage, modal: false });
  };

  let modalData = {};
  const toggleEmus = (frontendProp) => {
    console.log(installFrontends[frontendProp]);

    const { status } = installFrontends[frontendProp];
    const enable = !status;
    const systemsValue = {};
    const systemsOption = {};

    setState({
      ...state,
      android: {
        ...android,
        installFrontends: {
          ...installFrontends,
          [frontendProp]: {
            ...installFrontends[frontendProp],
            status: !status,
          },
        },
      },
    });
  };

  const [previousState, setPreviousState] = useState(installFrontends);
  const [changedKeys, setChangedKeys] = useState({});
  const emuModified = '';

  return (
    <Wrapper>
      <Header title={t('AndroidFrontendSelectorPage.title')} />
      <FrontendSelector
        installFrontends={installFrontends}
        lastSelected={lastSelected}
        onClick={toggleEmus}
        images={images}
      />
      <Footer
        next="android-own-apk"
        disabledNext={false}
        disabledBack={disabledBack}
      />
      <EmuModal modal={modal} />
    </Wrapper>
  );
}

export default AndroidFrontendSelectorPage;
