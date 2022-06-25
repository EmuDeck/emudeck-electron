import React, { useEffect, useState, useContext } from "react";
import { GlobalContext } from "context/globalContext";

import EmulatorConfiguration from "components/organisms/Wrappers/EmulatorConfiguration.js";

const EmulatorConfigurationPage = () => {
  const { state, setState } = useContext(GlobalContext);
  const { installEmus } = state;
  const [statePage, setStatePage] = useState({
    disabledNext: false,
    disabledBack: false,
    downloads: {
      ra: true,
      dolphinmmjr: true,
      citra: true,
    },
  });
  const { disabledNext, disabledBack, downloads } = statePage;

  const emusApks = {
    ra: "https://buildbot.libretro.com/stable/1.9.14/android/RetroArch.apk",
    dolphinmmjr:
      "https://github.com/Bankaimaster999/Dolphin-MMJR/releases/download/1.0-11460/Dolphin.MMJR.v11460.apk",
    citra:
      "https://github.com/weihuoya/citra/releases/download/20220127/Citra_MMJ_20220127.apk",
  };

  const openDLFile = () => {
    console.log("nah");
  };

  const emusFiles = {
    ra: "RetroArch.apk",
    dolphinmmjr: "Dolphin.MMJR.v11460.apk",
    citra: "Citra_MMJ_20220127.apk",
  };

  return (
    <EmulatorConfiguration disabledNext={disabledNext}
    disabledBack={disabledBack} downloads={downloads}/>
  );
};

export default EmulatorConfigurationPage;
