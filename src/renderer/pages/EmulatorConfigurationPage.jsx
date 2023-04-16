import React, { useEffect, useState, useContext } from 'react';
import { GlobalContext } from 'context/globalContext';
import Wrapper from 'components/molecules/Wrapper/Wrapper';
import Header from 'components/organisms/Header/Header';
import Footer from 'components/organisms/Footer/Footer';

import EmulatorConfiguration from 'components/organisms/Wrappers/EmulatorConfiguration';

import {
  imgdefault,
  imgra,
  imgdolphin,
  imgprimehack,
  imgppsspp,
  imgduckstation,
  imgcitra,
  imgpcsx2,
  imgrpcs3,
  imgyuzu,
  imgryujinx,
  imgcemu,
  imgxemu,
  imgmame,
  imgvita3k,
  imgxenia,
  imgsrm,
  imgrmg,
  imgscummvm,
  imgsupermodelista,
  imgesde,
  imgmelonds,
  imgmgba,
} from 'components/utils/images/images';

const images = {
  ra: imgra,
  dolphin: imgdolphin,
  primehack: imgprimehack,
  ppsspp: imgppsspp,
  duckstation: imgduckstation,
  citra: imgcitra,
  pcsx2: imgpcsx2,
  rpcs3: imgrpcs3,
  rmg: imgrmg,
  melonds: imgmelonds,
  yuzu: imgyuzu,
  ryujinx: imgryujinx,
  cemu: imgcemu,
  xemu: imgxemu,
  mame: imgmame,
  vita3k: imgvita3k,
  scummvm: imgscummvm,
  supermodelista: imgsupermodelista,
  srm: imgsrm,
  esde: imgesde,
  mgba: imgmgba,
  xenia: imgxenia,
};

const EmulatorConfigurationPage = () => {
  const { state, setState } = useContext(GlobalContext);
  const { device, overwriteConfigEmus } = state;

  const [statePage, setStatePage] = useState({
    disabledNext: false,
    disabledBack: false,
    data: '',
  });
  const { disabledNext, disabledBack, data } = statePage;

  const toggleEmus = (emulatorProp) => {
    let { id, name, status } = overwriteConfigEmus[emulatorProp];

    setState({
      ...state,
      overwriteConfigEmus: {
        ...overwriteConfigEmus,
        [emulatorProp]: {
          ...overwriteConfigEmus[emulatorProp],
          status: !status,
        },
      },
    });
  };

  let nextPage;

  if (overwriteConfigEmus.ra.status == true) {
    nextPage = 'auto-save';
  } else if (
    overwriteConfigEmus.ra.status == false &&
    overwriteConfigEmus.dolphin.status == false
  ) {
    nextPage = 'pegasus-theme';
  } else {
    nextPage = 'aspect-ratio-dolphin';
  }

  return (
    <Wrapper>
      <Header title="Update emulator" bold="configurations" />
      <EmulatorConfiguration data={data} onClick={toggleEmus} images={images} />
      <Footer
        next={nextPage}
        disabledNext={disabledNext}
        disabledBack={disabledBack}
      />
    </Wrapper>
  );
};

export default EmulatorConfigurationPage;
