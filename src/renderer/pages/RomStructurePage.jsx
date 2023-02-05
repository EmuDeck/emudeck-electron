import React, { useEffect, useState, useContext } from 'react';
import { GlobalContext } from 'context/globalContext';
import Wrapper from 'components/molecules/Wrapper/Wrapper';

import RomStructure from 'components/organisms/Wrappers/RomStructure';

const RomStoragePage = () => {
  const { state, setState } = useContext(GlobalContext);
  const { SDID, storage } = state;
  const [statePage, setStatePage] = useState({
    disabledNext: false,
    disabledBack: false,
    structureCreated: true,
    data: '',
  });
  const { disabledNext, disabledBack, structureCreated, data } = statePage;

  //Enabling button when changing the global state only if we have a device selected
  useEffect(() => {}, [state]); // <-- here put the parameter to listen

  return (
    <Wrapper>
      <RomStructure
        data={data}
        disabledNext={disabledNext}
        disabledBack={disabledBack}
        structureCreated={structureCreated}
      />
    </Wrapper>
  );
};

export default RomStoragePage;
