import React, { useEffect, useState, useContext } from 'react';
import { GlobalContext } from 'context/globalContext';
import Wrapper from 'components/molecules/Wrapper/Wrapper';

import CHDTool from 'components/organisms/Wrappers/CHDTool';

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
    ipcChannel.sendMessage('bash-nolog', [
      `konsole -e "${storagePath}/Emulation/tools/chdconv/chddeck.sh"`,
    ]);
  };

  return (
    <Wrapper>
      <CHDTool
        disabledNext={disabledNext}
        disabledBack={disabledBack}
        onClick={runCHD}
      />
    </Wrapper>
  );
};

export default CHDToolPage;
