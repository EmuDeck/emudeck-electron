import React, { useEffect, useState, useContext } from 'react';
import { GlobalContext } from 'context/globalContext';

import EmulatorConfiguration from 'components/organisms/Wrappers/EmulatorConfiguration.js';

import {
  imgdefault,
  imgra,
  imgdolphin,
  imgprimehacks,
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
} from 'components/utils/images/images.js';

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
