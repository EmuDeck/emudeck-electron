import React, { useEffect, useState, useContext } from "react";
import { GlobalContext } from "context/globalContext";

import RAConfig from "components/organisms/Wrappers/RAConfig.js";

const RAConfigPage = () => {
  const { state, setState } = useContext(GlobalContext);
  const { snes } = state;
  const [statePage, setStatePage] = useState({
    disabledNext: true,
    disabledBack: false,
    overlaysInstalled: false,
  });
  const { disabledNext, disabledBack, overlaysInstalled } = statePage;

  const snesSet = (snesAR) => {
    setState({
      ...state,
      snes: snesAR,
    });
  };
  //Enabling button when changing the global state only if we have a device selected
  useEffect(() => {
    if (snes != "") {
      setStatePage({ ...statePage, disabledNext: false });
    }
  }, [state]); // <-- here put the parameter to listen

  return <RAConfig disabledNext={disabledNext}
    disabledBack={disabledBack}
    overlaysInstalled={overlaysInstalled}
  />;
};

export default RAConfigPage;
