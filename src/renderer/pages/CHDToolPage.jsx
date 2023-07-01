import React, { useState, useContext } from 'react';
import { GlobalContext } from 'context/globalContext';
import Wrapper from 'components/molecules/Wrapper/Wrapper';
import Header from 'components/organisms/Header/Header';
import Footer from 'components/organisms/Footer/Footer';

import CHDTool from 'components/organisms/Wrappers/CHDTool';

function CHDToolPage() {
  const [statePage] = useState({
    disabledNext: false,
    disabledBack: false,
  });

  const { disabledNext, disabledBack } = statePage;

  const ipcChannel = window.electron.ipcRenderer;

  const runCHD = (data) => {
    ipcChannel.sendMessage('bash-nolog', [
      `konsole -e "/bin/bash $HOME/.config/EmuDeck/backend/tools/chdconv/chddeck.sh"`,
    ]);
  };

  return (
    <Wrapper>
      <Header title="EmuDeck Compression Tool" />
      <CHDTool onClick={runCHD} />
      <Footer
        next={false}
        disabledNext={disabledNext}
        disabledBack={disabledBack}
      />
    </Wrapper>
  );
}

export default CHDToolPage;
