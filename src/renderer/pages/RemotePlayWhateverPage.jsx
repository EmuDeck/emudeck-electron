import React, { useState, useContext, useRef, useEffect } from 'react';
import { GlobalContext } from 'context/globalContext';
import Wrapper from 'components/molecules/Wrapper/Wrapper';
import GamePad from 'components/organisms/GamePad/GamePad';
import Header from 'components/organisms/Header/Header';
import Footer from 'components/organisms/Footer/Footer';
import EmuModal from 'components/molecules/EmuModal/EmuModal';
import ProgressBar from 'components/atoms/ProgressBar/ProgressBar';
import RemotePlayWhatever from 'components/organisms/Wrappers/RemotePlayWhatever';

function RemotePlayWhateverPage() {
  const [statePage, setStatePage] = useState({
    disabledNext: false,
    disabledBack: false,
    modal: false,
    dom: undefined,
  });
  const { disabledNext, disabledBack, modal, dom } = statePage;

  const ipcChannel = window.electron.ipcRenderer;

  const installRPW = () => {
    let modalData = {
      active: true,
      header: <span className="h4">Installing RemotePlayWhatEver</span>,
      body: <p>Please wait while we install the plugin</p>,
      footer: <ProgressBar css="progress--success" infinite={true} max="100" />,
      css: 'emumodal--xs',
    };

    setStatePage({
      ...statePage,
      modal: modalData,
    });

    ipcChannel.sendMessage('emudeck', [
      'RemotePlayWhatever|||RemotePlayWhatever_install',
    ]);

    ipcChannel.once('EmuDecky', (status) => {
      modalData = {
        active: true,
        header: <span className="h4">Success!</span>,
        body: <p>RemotePlayWhatEver installed</p>,
        css: 'emumodal--xs',
      };

      setStatePage({
        ...statePage,
        modal: modalData,
      });
    });
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
        <Header title="Multiplayer with  RemotePlayWhatever - Beta" />
        <RemotePlayWhatever
          showNotification={showNotification}
          notificationText={notificationText}
          onClick={installRPW}
        />
        <Footer
          next={false}
          disabledNext={disabledNext}
          disabledBack={disabledBack}
        />
        <EmuModal modal={modal} />
      </Wrapper>
    </div>
  );
}

export default RemotePlayWhateverPage;
