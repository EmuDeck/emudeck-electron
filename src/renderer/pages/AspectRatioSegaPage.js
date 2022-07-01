import React, { useEffect, useState, useContext } from "react";
import { GlobalContext } from "context/globalContext";

import AspectRatioSega from "components/organisms/Wrappers/AspectRatioSega.js";

const AspectRatioSegaPage = () => {
  const { state, setState } = useContext(GlobalContext);
  const {ar} = state;
  const [statePage, setStatePage] = useState({
    disabledNext: false,
    disabledBack: false,
  });
  const { disabledNext, disabledBack } = statePage;
  const arSet = (arStatus) => {    
    setState({
      ...state,
      ar:{
        ...ar,
        sega: arStatus,
      }
    });
  };

  return (
    <AspectRatioSega onClick={arSet} disabledNext={disabledNext} disabledBack={disabledBack} />
  );
};

export default AspectRatioSegaPage;
