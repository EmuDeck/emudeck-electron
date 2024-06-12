import { useTranslation } from 'react-i18next';
import React, { useState, useContext, useRef, useEffect } from 'react';
import { GlobalContext } from 'context/globalContext';
import Wrapper from 'components/molecules/Wrapper/Wrapper';

import Header from 'components/organisms/Header/Header';
import Footer from 'components/organisms/Footer/Footer';
import EmuModal from 'components/molecules/EmuModal/EmuModal';
import EmulatorSelector from 'components/organisms/Wrappers/EmulatorSelector';
import { BtnSimple } from 'getbasecore/Atoms';
import {
  imgra,
  imgares,
  imgdolphin,
  imgprimehack,
  imgppsspp,
  imgduckstation,
  imgcitra,
  imglime3ds,
  imgpcsx2,
  imgrpcs3,
  imgyuzu,
  imgryujinx,
  imgcemu,
  imgxemu,
  imgmame,
  imgvita3k,
  imgflycast,
  imgxenia,
  imgsrm,
  imgrmg,
  imgscummvm,
  imgFrontESDE,
  imgmelonds,
  imgmgba,
  imgsupermodel,
  imgmodel2,
  imgbigpemu,
  imgnethersx2,
} from 'components/utils/images/images';

const images = {
  ra: imgra,
  ares: imgares,
  dolphin: imgdolphin,
  primehack: imgprimehack,
  ppsspp: imgppsspp,
  duckstation: imgduckstation,
  citrammj: imgcitra,
  lime3ds: imglime3ds,
  pcsx2: imgpcsx2,
  rpcs3: imgrpcs3,
  yuzu: imgyuzu,
  melonds: imgmelonds,
  ryujinx: imgryujinx,
  cemu: imgcemu,
  xemu: imgxemu,
  mame: imgmame,
  vita3k: imgvita3k,
  flycast: imgflycast,
  scummvm: imgscummvm,
  esde: imgFrontESDE,
  rmg: imgrmg,
  mgba: imgmgba,
  xenia: imgxenia,
  srm: imgsrm,
  supermodel: imgsupermodel,
  model2: imgmodel2,
  bigpemu: imgbigpemu,
  nethersx2: imgnethersx2,
};

function AndroidEmulatorSelectorPage() {
  const { t, i18n } = useTranslation();
  const { state, setState } = useContext(GlobalContext);
  const { device, android, emulatorAlternative, overwriteConfigEmus } = state;

  const { installEmus } = android;

  const [statePage, setStatePage] = useState({
    disabledNext: false,
    disabledBack: false,
    data: '',
    modal: false,
    lastSelected: undefined,
    dom: undefined,
  });
  const { disabledNext, disabledBack, data, modal, lastSelected, dom } =
    statePage;

  const setAlternativeEmulator = (system, emuName, emuName2, disable) => {
    if (emuName === 'ra' || emuName === 'ares') {
      setState({
        ...state,
        emulatorAlternative: {
          ...emulatorAlternative,
          [system]: emuName,
        },
        installEmus: {
          ...installEmus,
          [emuName2]: { ...installEmus[emuName2], status: false },
        },
      });
    } else if (emuName2 === 'multiemulator' || emuName2 === 'both') {
      setState({
        ...state,
        emulatorAlternative: {
          ...emulatorAlternative,
          [system]: emuName,
        },
      });
    } else {
      setStatePage({ ...statePage, lastSelected: emuName });

      setState({
        ...state,
        emulatorAlternative: {
          ...emulatorAlternative,
          [system]: emuName,
        },
        installEmus: {
          ...installEmus,
          [emuName2]: { ...installEmus[emuName2], status: false },
        },
      });
    }
    closeModal();
  };

  const closeModal = () => {
    setStatePage({ ...statePage, modal: false });
  };

  let modalData = {};
  const toggleEmus = (emulatorProp) => {
    const { status } = installEmus[emulatorProp];
    const enable = !status;
    let multiemulatorValue;
    let systemsValue = {};
    let systemsOption = {};

    setState({
      ...state,
      android: {
        ...android,
        installEmus: {
          ...installEmus,
          [emulatorProp]: { ...installEmus[emulatorProp], status: !status },
        },
      },
    });
  };

  const [previousState, setPreviousState] = useState(installEmus);
  const [changedKeys, setChangedKeys] = useState({});
  let emuModified = '';

  return (
    <Wrapper>
      <Header title={t('AndroidEmulatorSelectorPage.title')} />
      <p className="lead">{t('AndroidEmulatorSelectorPage.description')}</p>
      <EmulatorSelector
        installEmus={installEmus}
        data={data}
        onClick={toggleEmus}
        images={images}
      />
      <Footer
        next="android-RA-bezels"
        disabledNext={disabledNext}
        disabledBack={disabledBack}
      />
      <EmuModal modal={modal} />
    </Wrapper>
  );
}

export default AndroidEmulatorSelectorPage;
