import React, { useState, useContext, useRef, useEffect } from 'react';
import { GlobalContext } from 'context/globalContext';
import Wrapper from 'components/molecules/Wrapper/Wrapper';

import Header from 'components/organisms/Header/Header';
import Footer from 'components/organisms/Footer/Footer';

import EmulatorConfiguration from 'components/organisms/Wrappers/EmulatorConfiguration';

import {
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
  imgflycast,
  imgxenia,
  imgsrm,
  imgrmg,
  imgscummvm,
  imgsupermodel,
  imgmodel2,
  imgbigpemu,
  imgFrontESDE,
  imgFrontPegasus,
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
  flycast: imgflycast,
  scummvm: imgscummvm,
  supermodel: imgsupermodel,
  model2: imgmodel2,
  bigpemu: imgbigpemu,
  srm: imgsrm,
  esde: imgFrontESDE,
  mgba: imgmgba,
  xenia: imgxenia,
  pegasus: imgFrontPegasus,
};

function EmulatorConfigurationPage() {
  const { state, setState } = useContext(GlobalContext);
  const { overwriteConfigEmus } = state;

  const [statePage] = useState({
    disabledNext: false,
    disabledBack: false,
    data: '',
    dom: undefined,
  });
  const { disabledNext, disabledBack, data, dom } = statePage;

  const toggleEmus = (emulatorProp) => {
    const { status } = overwriteConfigEmus[emulatorProp];

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

  if (overwriteConfigEmus.ra.status === true) {
    nextPage = 'auto-save';
  } else if (
    overwriteConfigEmus.ra.status === false &&
    overwriteConfigEmus.dolphin.status === false
  ) {
    nextPage = 'frontend-selector';
  } else {
    nextPage = 'aspect-ratio-dolphin';
  }

  return (
    <div style={{ height: '100vh' }}>
      <Wrapper>
        <Header title="Emulator and Tools Configurations" />
        <EmulatorConfiguration
          data={data}
          onClick={toggleEmus}
          images={images}
        />
        <Footer
          next={nextPage}
          disabledNext={disabledNext}
          disabledBack={disabledBack}
        />
      </Wrapper>
    </div>
  );
}

export default EmulatorConfigurationPage;
