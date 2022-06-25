import React, { useEffect, useState, useContext } from "react";
import { GlobalContext } from "context/globalContext";

import EmulatorSelector from "components/organisms/Wrappers/EmulatorSelector.js";

const DeviceSelectorPage = () => {
  const { state, setState } = useContext(GlobalContext);
  const { device, installEmus } = state;

  const [statePage, setStatePage] = useState({
    disabledNext: false,
    disabledBack: false,
  });
  const { disabledNext, disabledBack } = statePage;

  const toggleEmus = (emu, stateEmu) => {
    // if (emu === "ra") {
    //   setState({
    //     ...state,
    //     installEmus: {
    //       ...installEmus,
    //       ra: state,
    //     },
    //   });
    // }

    for (const property in installEmus) {
      //console.log(`${property}: ${installEmus[property]}`);
      setState({
        ...state,
        installEmus: {
          ...installEmus,
          [emu]: stateEmu,
        },
      });

      console.log(`${property}: ${installEmus[property]}`);
    }
  };

  return (
    <EmulatorSelector disabledNext={disabledNext}
    disabledBack={disabledBack}/>
  );
};

export default DeviceSelectorPage;
