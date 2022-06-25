import React, { useEffect, useState, useContext } from "react";
import { GlobalContext } from "context/globalContext";

import Welcome from "components/organisms/Wrappers/Welcome.js";

const WelcomePage = () => {
  const { state, setState } = useContext(GlobalContext);
  const [statePage, setStatePage] = useState({
    disabledNext: false,
    disabledBack: true,
    downloadComplete: true,
  });
  const { disabledNext, disabledBack, downloadComplete } = statePage;

  return (
    <Welcome
      disabledNext={disabledNext}
      disabledBack={disabledBack}
      downloadComplete={downloadComplete}
    />
  );
};

export default WelcomePage;
