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
      onClick={toggleEmus}
      disabledNext={disabledNext}
      disabledBack={disabledBack}
    />
  );
};

export default DeviceSelectorPage;
