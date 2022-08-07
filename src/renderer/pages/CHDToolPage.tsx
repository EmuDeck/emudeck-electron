import { useState } from 'react';
// import { useGlobalContext } from 'context/globalContext';

import CHDTool from 'components/organisms/Wrappers/CHDTool.js';

const CHDToolPage = () => {
  // const { state, setState } = useGlobalContext();

  const [statePage, setStatePage] = useState({
    disabledNext: false,
    disabledBack: false,
  });
  const { disabledNext, disabledBack } = statePage;

  const ipcChannel = window.electron.ipcRenderer;

  const runCHD = (data: any) => {
    // TODO: figure out ipcChannel types
    ipcChannel.sendMessage('bash', [
      'bash ~/emudeck/backend/tools/chdconv/chddeck.sh',
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
