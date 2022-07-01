import React, { useEffect, useState, useContext } from "react";
import { GlobalContext } from "context/globalContext";

import RomStructure from "components/organisms/Wrappers/RomStructure.js";

const RomStoragePage = () => {
  const { state, setState } = useContext(GlobalContext);
  const { SDID, storage } = state;
  const [statePage, setStatePage] = useState({
    disabledNext: false,
    disabledBack: false,
    structureCreated: true,
    data: "",
  });
  const { disabledNext, disabledBack, structureCreated, data } = statePage;

  //Enabling button when changing the global state only if we have a device selected
  useEffect(() => {}, [state]); // <-- here put the parameter to listen

  return (
    <RomStructure
      data={data}
      disabledNext={disabledNext}
      disabledBack={disabledBack}
      structureCreated={structureCreated}
    />
  );
};

export default RomStoragePage;
