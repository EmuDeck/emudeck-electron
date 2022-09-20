import React, { useEffect, useState, useContext } from 'react';
import { GlobalContext } from 'context/globalContext';

import ToolsAndStuff from 'components/organisms/Wrappers/ToolsAndStuff.js';

const ToolsAndStuffPage = () => {
  const { state, setState } = useContext(GlobalContext);
  const { sudoPass } = state;

  const [statePage, setStatePage] = useState({
    disabledNext: false,
    disabledBack: false,
    data: '',
  });
  const { disabledNext, disabledBack, hasSudo } = statePage;

  const ipcChannel = window.electron.ipcRenderer;

  return (
    <ToolsAndStuff
      disabledNext={disabledNext}
      disabledBack={disabledBack}
      nextText={sudoPass ? 'Continue' : 'Skip'}
    />
  );
};

export default ToolsAndStuffPage;
