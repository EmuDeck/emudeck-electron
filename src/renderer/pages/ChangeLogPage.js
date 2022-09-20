import React, { useEffect, useState, useContext } from 'react';
import { GlobalContext } from 'context/globalContext';

import ChangeLog from 'components/organisms/Wrappers/ChangeLog.js';

const ChangeLogPage = () => {
  const { state, setState } = useContext(GlobalContext);
  const [statePage, setStatePage] = useState({
    disabledNext: false,
    disabledBack: false,
    data: '',
  });
  const { disabledNext, disabledBack, hasSudo } = statePage;

  return (
    <ChangeLog
      disabledNext={disabledNext}
      disabledBack={disabledBack}
      onChange={setGyro}
      onClick={createSudo}
      hasSudo={hasSudo}
      nextText={sudoPass ? 'Continue' : 'Skip'}
    />
  );
};

export default ChangeLogPage;
