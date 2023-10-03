import React, { useState, useRef, useEffect } from 'react';
import Wrapper from 'components/molecules/Wrapper/Wrapper';
import GamePad from 'components/organisms/GamePad/GamePad';
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

  //GamePad
  const domElementsRef = useRef(null);
  const domElementsCur = domElementsRef.current;
  let domElements;
  useEffect(() => {
    if (domElementsCur && dom === undefined) {
      domElements = domElementsCur.querySelectorAll('button');
      setStatePage({ ...statePage, dom: domElements });
    }
  }, [statePage]);

  return (
    <div style={{ height: '100vh' }} ref={domElementsRef}>
      {dom !== undefined && <GamePad elements={dom} />}
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
