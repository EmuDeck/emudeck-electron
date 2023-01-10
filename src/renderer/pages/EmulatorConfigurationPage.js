import React, { useEffect, useState, useContext } from 'react';
import { GlobalContext } from 'context/globalContext';

import EmulatorConfiguration from 'components/organisms/Wrappers/EmulatorConfiguration.js';

import imgra from 'assets/emulators/ra.png';
import imgdolphin from 'assets/emulators/dolphin.png';
import imgprimehacks from 'assets/emulators/primehacks.png';
import imgppsspp from 'assets/emulators/ppsspp.png';
import imgduckstation from 'assets/emulators/duckstation.png';
import imgcitra from 'assets/emulators/citra.png';
import imgpcsx2 from 'assets/emulators/pcsx2.png';
import imgrpcs3 from 'assets/emulators/rpcs3.png';
import imgyuzu from 'assets/emulators/yuzu.png';
import imgryujinx from 'assets/emulators/ryujinx.png';
import imgcemu from 'assets/emulators/cemu.png';
import imgrmg from 'assets/emulators/rmg.png';
import imgxemu from 'assets/emulators/xemu.png';
import imgmame from 'assets/emulators/mame.png';
import imgvita3k from 'assets/emulators/vita3k.png';
import imgscummvm from 'assets/emulators/scummvm.png';
import imgsupermodelista from 'assets/emulators/supermodelista.png';
import imgsrm from 'assets/emulators/srm.png';
import imgesde from 'assets/emulators/esde.png';

const images = {
  ra: imgra,
  dolphin: imgdolphin,
  primehacks: imgprimehacks,
  ppsspp: imgppsspp,
  duckstation: imgduckstation,
  citra: imgcitra,
  pcsx2: imgpcsx2,
  rpcs3: imgrpcs3,
  rmg: imgrmg,
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
    <EmulatorConfiguration
      data={data}
      onClick={toggleEmus}
      disabledNext={disabledNext}
      disabledBack={disabledBack}
      next={nextPage}
      images={images}
    />
  );
};

export default EmulatorConfigurationPage;
