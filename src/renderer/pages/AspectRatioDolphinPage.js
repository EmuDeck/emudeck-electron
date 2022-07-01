import React, { useEffect, useState, useContext } from "react";
import { GlobalContext } from "context/globalContext";

import AspectRatioDolphin from "components/organisms/Wrappers/AspectRatioDolphin.js";

const AspectRatioDolphinPage = () => {
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
        dolphin: arStatus,
      }
    });
  };
  
  return (
    <AspectRatioDolphin onClick={arSet} disabledNext={disabledNext} disabledBack={disabledBack} />
  );
};

export default AspectRatioDolphinPage;
