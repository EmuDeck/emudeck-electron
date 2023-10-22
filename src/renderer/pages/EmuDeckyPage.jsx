import React, { useEffect, useState, useContext, useRef } from 'react';
import { GlobalContext } from 'context/globalContext';
import Wrapper from 'components/molecules/Wrapper/Wrapper';
import GamePad from 'components/organisms/GamePad/GamePad';
import Header from 'components/organisms/Header/Header';
import Footer from 'components/organisms/Footer/Footer';
import EmuModal from 'components/molecules/EmuModal/EmuModal';
import ProgressBar from 'components/atoms/ProgressBar/ProgressBar';
import EmuDecky from 'components/organisms/Wrappers/EmuDecky';

function EmuDeckyPage() {
  const [statePage, setStatePage] = useState({
    disabledNext: false,
    disabledBack: false,
    data: '',
    hasSudo: false,
    sudoPass: 'Decky!',
    modal: false,
    pass1: 'a',
    pass2: 'b',
    dom: undefined,
  });
  const {
    disabledNext,
    disabledBack,
    hasSudo,
    sudoPass,
    modal,
    pass1,
    pass2,
    dom,
  } = statePage;

  const ipcChannel = window.electron.ipcRenderer;

  const setSudoPass = (data) => {
    if (data.target.value !== '') {
      setStatePage({
        ...statePage,
        sudoPass: data.target.value,
      });
    } else {
      setStatePage({
        ...statePage,
        sudoPass: 'Decky!',
      });
    }
  };

  const createSudo = () => {
    ipcChannel.sendMessage('bash', [
      `echo '${pass1}' > test && cat test >> test1 && cat test >> test1 && passwd deck < test1 && rm test test1`,
    ]);

    const modalData = {
      active: true,
      header: <span className="h4">Success!</span>,
      body: <p>Password created</p>,
      footer: <ProgressBar css="progress--success" infinite max="100" />,
      css: 'emumodal--xs',
    };

    setStatePage({
      ...statePage,
      hasSudo: true,
      sudoPass: pass1,
      modal: modalData,
    });
  };

  const setPassword = (data) => {
    setStatePage({
      ...statePage,
      pass1: data.target.value,
    });
  };

  const checkPassword = (data) => {
    setStatePage({
      ...statePage,
      pass2: data.target.value,
    });
  };

  const installEmuDecky = () => {
    const modalData = {
      active: true,
      header: <span className="h4">Installing EmuDecky</span>,
      body: <p>Please wait while we install the plugin</p>,
      footer: <ProgressBar css="progress--success" infinite max="100" />,
      css: 'emumodal--xs',
    };

    setStatePage({
      ...statePage,
      modal: modalData,
    });
    const escapedPass = sudoPass.replaceAll("'", "'\\''");
    ipcChannel.sendMessage('emudeck', [
      `EmuDecky|||Plugins_installPluginLoader "${escapedPass}" && Plugins_installEmuDecky "${escapedPass}" && echo true`,
    ]);

    ipcChannel.once('EmuDecky', (status) => {
      const { stdout } = status;
      let modalData;
      if (stdout.includes('true')) {
        modalData = {
          active: true,
          header: <span className="h4">Success!</span>,
          body: <p>EmuDecky Installed</p>,
          css: 'emumodal--xs',
        };

        setStatePage({
          ...statePage,
          modal: modalData,
        });
      } else {
        modalData = {
          active: true,
          header: <span className="h4">Error installing plugin</span>,
          body: <p>{JSON.stringify(status.stderr)}</p>,
          css: 'emumodal--xs',
        };

        setStatePage({
          ...statePage,
          modal: modalData,
        });
      }
    });
  };

  //

  useEffect(() => {
    ipcChannel.sendMessage('bash', [
      'checkPWD|||passwd -S $(whoami) | awk -F " " "{print $2}" & exit',
    ]);

    ipcChannel.once('checkPWD', (messagePWD) => {
      const stdout = messagePWD.replace('\n', '');
      let stdoutPWD;
      console.log({ stdout });
      stdout.includes('NP') ? (stdoutPWD = false) : (stdoutPWD = true);
      setStatePage({
        ...statePage,
        hasSudo: stdoutPWD,
      });
    });
  }, []);

  // GamePad
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
        <Header title="Configure EmuDecky" />
        <EmuDecky
          installClick={installEmuDecky}
          sudoPass={sudoPass}
          onChange={setSudoPass}
          onChangeSetPass={setPassword}
          onChangeCheckPass={checkPassword}
          onClick={createSudo}
          hasSudo={hasSudo}
          passValidates={pass1 === pass2}
        />
        <Footer
          next={false}
          nextText={sudoPass ? 'Continue' : 'Skip'}
          disabledNext={disabledNext}
          disabledBack={disabledBack}
        />
        <EmuModal modal={modal} />
      </Wrapper>
    </div>
  );
}

export default EmuDeckyPage;
