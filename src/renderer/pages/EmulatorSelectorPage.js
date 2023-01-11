import React, { useEffect, useState, useContext } from 'react';
import { GlobalContext } from 'context/globalContext';

import EmulatorSelector from 'components/organisms/Wrappers/EmulatorSelector.js';

import imgra from 'assets/emulators/ra.png';
import imgdolphin from 'assets/emulators/dolphin.png';
import imgprimehacks from 'assets/emulators/primehacks.png';
import imgppsspp from 'assets/emulators/ppsspp.png';
import imgduckstation from 'assets/emulators/duckstation.png';
import imgmelonds from 'assets/emulators/melonds.png';
import imgcitra from 'assets/emulators/citra.png';
import imgpcsx2 from 'assets/emulators/pcsx2.png';
import imgrpcs3 from 'assets/emulators/rpcs3.png';
import imgyuzu from 'assets/emulators/yuzu.png';
import imgryujinx from 'assets/emulators/ryujinx.png';
import imgrmg from 'assets/emulators/rmg.png';
import imgcemu from 'assets/emulators/cemu.png';
import imgxemu from 'assets/emulators/xemu.png';
import imgmame from 'assets/emulators/mame.png';
import imgvita3k from 'assets/emulators/vita3k.png';
import imgscummvm from 'assets/emulators/scummvm.png';
import imgsupermodelista from 'assets/emulators/supermodelista.png';
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
  yuzu: imgyuzu,
  melonds: imgmelonds,
  ryujinx: imgryujinx,
  cemu: imgcemu,
  xemu: imgxemu,
  mame: imgmame,
  vita3k: imgvita3k,
  scummvm: imgscummvm,
  supermodelista: imgsupermodelista,
  esde: imgesde,
  rmg: imgrmg,
};

const EmulatorSelectorPage = () => {
  const { state, setState } = useContext(GlobalContext);
  const { device, installEmus } = state;

  const [statePage, setStatePage] = useState({
    disabledNext: false,
    disabledBack: false,
    data: '',
  });
  const { disabledNext, disabledBack, data } = statePage;

  const toggleEmus = (emulatorProp) => {
    let { id, name, status } = installEmus[emulatorProp];

    setState({
      ...state,
      installEmus: {
        ...installEmus,
        [emulatorProp]: { ...installEmus[emulatorProp], status: !status },
      },
    });
  };

  return (
    <EmulatorSelector
      data={data}
      onClick={toggleEmus}
      disabledNext={disabledNext}
      disabledBack={disabledBack}
      images={images}
    />
  );
};

export default EmulatorSelectorPage;
