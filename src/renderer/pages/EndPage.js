import React, { useEffect, useState, useContext } from "react";
import { GlobalContext } from "context/globalContext";

import End from "components/organisms/Wrappers/End.js";

const EndPage = () => {
  const { state, setState } = useContext(GlobalContext);
  const [statePage, setStatePage] = useState({
    disabledNext: false,
    disabledBack: false,
  });
  const { disabledNext, disabledBack } = statePage;
  return (
    <End disabledNext={disabledNext}
      disabledBack={disabledBack}
    />    
  );
};

export default EndPage;
