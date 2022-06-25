import React, { useEffect, useState, useContext } from "react";
import { GlobalContext } from "context/globalContext";

import RABezels from "components/organisms/Wrappers/RABezels.js";

const RABezelsPage = () => {
  const { state, setState } = useContext(GlobalContext);
  const { bezels } = state;
  const [statePage, setStatePage] = useState({
    disabledNext: true,
    disabledBack: false,
  });
  const { disabledNext, disabledBack } = statePage;
  const copyDir = () => {
    console.log("nah");
  };
  const bezelsSet = (bezelStatus) => {
    copyDir();
    setState({
      ...state,
      bezels: bezelStatus,
    });
  };
  //Enabling button when changing the global state only if we have a device selected
  useEffect(() => {
    if (bezels != "") {
      setStatePage({ ...statePage, disabledNext: false });
    }
  }, [state]); // <-- here put the parameter to listen

  return (
    <RABezels disabledNext={disabledNext}
      disabledBack={disabledBack}
    />
  );
};

export default RABezelsPage;
