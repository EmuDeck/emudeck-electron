import React, { useState, useContext, useRef, useEffect } from 'react';
import { GlobalContext } from 'context/globalContext';
import Wrapper from 'components/molecules/Wrapper/Wrapper';
import GamePad from 'components/organisms/GamePad/GamePad';
import Header from 'components/organisms/Header/Header';
import Footer from 'components/organisms/Footer/Footer';

import CHDTool from 'components/organisms/Wrappers/CHDTool';

function CHDToolPage() {
  const [statePage] = useState({
    disabledNext: false,
    disabledBack: false,
    dom: undefined,
  });

  const { disabledNext, disabledBack, dom } = statePage;

  const ipcChannel = window.electron.ipcRenderer;

  const runCHD = (data) => {
    ipcChannel.sendMessage('bash-nolog', [
      `konsole -e "/bin/bash $HOME/.config/EmuDeck/backend/tools/chdconv/chddeck.sh"`,
    ]);
  };



  return (
    <div style={{ height: '100vh' }} >
      
      <Wrapper>
        <Header title="EmuDeck Compression Tool" />
        <CHDTool onClick={runCHD} />
        <Footer
          next={false}
          disabledNext={disabledNext}
          disabledBack={disabledBack}
        />
      </Wrapper>
    </div>
  );
}

export default CHDToolPage;
