import React, { useEffect, useState, useContext } from "react";
import { GlobalContext } from "context/globalContext";

import RomStorage from "components/organisms/Wrappers/RomStorage.js";

const RomStoragePage = () => {
  const { state, setState } = useContext(GlobalContext);
  const { storage, SDID } = state;
  const [statePage, setStatePage] = useState({
    disabledNext: true,
    disabledBack: false,
  });
  const { disabledNext, disabledBack } = statePage;

  const storageSet = (storageName) => {
    setState({
      ...state,
      storage: storageName,
    });
  };
  //Enabling button when changing the global state only if we have a device selected
  useEffect(() => {
    if (storage != "") {
      setStatePage({ ...statePage, disabledNext: false });
    }
  }, [state]); // <-- here put the parameter to listen

  const getSDCardName = async () => {
    return "deck";
  };
  return <RomStorage disabledNext={disabledNext}
    disabledBack={disabledBack}
  />;
};

export default RomStoragePage;
