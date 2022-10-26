import React, { useEffect, useState, useContext } from "react";
import { GlobalContext } from "context/globalContext";

import PegasusInstall from "components/organisms/Wrappers/PegasusInstall.js";

const PegasusInstallPage = () => {
  const { state, setState } = useContext(GlobalContext);
  const [statePage, setStatePage] = useState({
    disabledNext: false,
    disabledBack: false,
    data: "",
  });
  const { disabledNext, disabledBack, data } = statePage;

  return (
    <PegasusInstall
      data={data}
      disabledNext={disabledNext}
      disabledBack={disabledBack}
    />
  );
};

export default PegasusInstallPage;
