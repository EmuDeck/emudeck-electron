import React, { useEffect, useState, useContext } from 'react';
import { GlobalContext } from 'context/globalContext';

import CHDTool from 'components/organisms/Wrappers/CHDTool.js';

const CHDToolPage = () => {
  const { state, setState } = useContext(GlobalContext);

  const [statePage, setStatePage] = useState({
    disabledNext: false,
    disabledBack: false,
  });

  const { storagePath } = state;
  const { disabledNext, disabledBack } = statePage;

  const ipcChannel = window.electron.ipcRenderer;

  const runCHD = (data) => {
    console.log(
      `konsole -e /bin/bash --rcfile <(bash ${storagePath}/tools/chdconv/chddeck.sh)`
    );
    ipcChannel.sendMessage('bash-nolog', [
      `konsole -e /bin/bash --rcfile <(bash ${storagePath}/tools/chdconv/chddeck.sh)`,
    ]);
  };

  return (
    <CHDTool
      disabledNext={disabledNext}
      disabledBack={disabledBack}
      onClick={runCHD}
    />
  );
};

export default CHDToolPage;
