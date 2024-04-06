import React, { useState, useRef, useEffect } from 'react';
import Wrapper from 'components/molecules/Wrapper/Wrapper';

import Header from 'components/organisms/Header/Header';
import Footer from 'components/organisms/Footer/Footer';

import Uninstall from 'components/organisms/Wrappers/Uninstall';

function UninstallPage() {
  const [statePage] = useState({
    disabledNext: false,
    disabledBack: false,
    dom: undefined,
  });
  const { disabledNext, disabledBack, dom } = statePage;

  const ipcChannel = window.electron.ipcRenderer;

  const uninstall = () => {
    ipcChannel.sendMessage('bash', [
      'bash ~/.config/EmuDeck/backend/uninstall.sh',
    ]);
  };



  return (
    <div style={{ height: '100vh' }} >
      
      <Wrapper>
        <Header title="Uninstall EmuDeck" />
        <Uninstall
          disabledNext={disabledNext}
          disabledBack={disabledBack}
          onClick={uninstall}
        />
        <Footer
          next={false}
          disabledNext={disabledNext}
          disabledBack={disabledBack}
        />
      </Wrapper>
    </div>
  );
}

export default UninstallPage;
