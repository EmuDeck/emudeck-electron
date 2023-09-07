import React, { useEffect, useState, useContext } from 'react';
import { GlobalContext } from 'context/globalContext';
import Wrapper from 'components/molecules/Wrapper/Wrapper';
import Header from 'components/organisms/Header/Header';
import Footer from 'components/organisms/Footer/Footer';
import EmuModal from 'components/molecules/EmuModal/EmuModal';
import ProgressBar from 'components/atoms/ProgressBar/ProgressBar';
import DeckyControls from 'components/organisms/Wrappers/DeckyControls';

function DeckyControlsPage() {
  const [statePage, setStatePage] = useState({
    disabledNext: false,
    disabledBack: false,
    data: '',
    hasSudo: false,
    sudoPass: 'Decky!',
    modal: false,
    pass1: 'a',
    pass2: 'b',
  });
  const { disabledNext, disabledBack, hasSudo, sudoPass, modal, pass1, pass2 } =
    statePage;

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
      footer: <ProgressBar css="progress--success" infinite={true} max="100" />,
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

  const installDeckyControls = () => {
    const modalData = {
      active: true,
      header: <span className="h4">Installing DeckyControls</span>,
      body: <p>Please wait while we install the plugin</p>,
      footer: <ProgressBar css="progress--success" infinite={true} max="100" />,
      css: 'emumodal--xs',
    };

    setStatePage({
      ...statePage,
      modal: modalData,
    });
    const escapedPass = sudoPass.replaceAll("'", "'\\''");
    ipcChannel.sendMessage('emudeck', [
      `DeckyControls|||Plugins_installPluginLoader "${escapedPass}" && Plugins_installDeckyControls "${escapedPass}" && echo true`,
    ]);

    ipcChannel.once('DeckyControls', (status) => {
      
      const { stdout } = status;
      let modalData;
      if (stdout.includes('true')) {
        modalData = {
          active: true,
          header: <span className="h4">Success!</span>,
          body: <p>DeckyControls Installed</p>,
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

    ipcChannel.once('checkPWD', (message) => {
      
      let sudo;
      stdout = message.replace('\n', '');
      stdout.includes('NP') ? (sudo = false) : (sudo = true);
      setStatePage({
        ...statePage,
        hasSudo: sudo,
      });
    });
  }, []);

  return (
    <Wrapper>
      <Header title="Configure DeckyControls" />
      <DeckyControls
        installClick={installDeckyControls}
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
  );
}

export default DeckyControlsPage;
