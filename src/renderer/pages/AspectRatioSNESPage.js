import React, { useEffect, useState, useContext } from "react";
import { GlobalContext } from "context/globalContext";

import AspectRatioSNES from "components/organisms/Wrappers/AspectRatioSNES.js";

const AspectRatioSNESPage = () => {
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
        snes: arStatus,
      }
    });
  };

  return (
    <AspectRatioSNES onClick={arSet} disabledNext={disabledNext} disabledBack={disabledBack} />
  );
};

export default AspectRatioSNESPage;
