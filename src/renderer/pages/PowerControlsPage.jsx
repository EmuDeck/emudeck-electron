import { useTranslation } from 'react-i18next';
import React, { useEffect, useState, useContext } from 'react';
import { GlobalContext } from 'context/globalContext';
import Wrapper from 'components/molecules/Wrapper/Wrapper';

import Header from 'components/organisms/Header/Header';
import Footer from 'components/organisms/Footer/Footer';
import EmuModal from 'components/molecules/EmuModal/EmuModal';
import ProgressBar from 'components/atoms/ProgressBar/ProgressBar';
import PowerControls from 'components/organisms/Wrappers/PowerControls';

function PowerControlsPage() {
  const { t, i18n } = useTranslation();

  const { state, setState } = useContext(GlobalContext);
  const { system } = state;

  const [statePage, setStatePage] = useState({
    disabledNext: false,
    disabledBack: false,
    data: '',
    hasSudo: false,
    sudoPass: 'Decky!',
    disableButton: false,
    pass1: 'a',
    pass2: 'b',
    modal: false,
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
        sudoPass: system === 'chimeraos' ? 'gamer' : 'Decky!',
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

  const installPowerTools = () => {
    const modalData = {
      active: true,
      header: <span className="h4">Installing PowerControls</span>,
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
      `powerControls|||Plugins_installPowerControls ${escapedPass} && echo true`,
    ]);

    ipcChannel.once('powerControls', (status) => {
      const { stdout } = status;

      let modalData;
      if (stdout.includes('true')) {
        modalData = {
          active: true,
          header: <span className="h4">Success!</span>,
          body: <p>PowerControls Installed</p>,
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
      stdout.includes('NP') ? (stdoutPWD = false) : (stdoutPWD = true);
      setStatePage({
        ...statePage,
        hasSudo: stdoutPWD,
      });
    });
  }, []);

  return (
    <Wrapper>
      <Header title={t('PowerControlsPage.title')} />
      <p className="lead">{t('PowerControlsPage.description')}</p>
      <PowerControls
        installClick={installPowerTools}
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
        nextText={sudoPass ? t('general.next') : t('general.skip')}
        disabledNext={disabledNext}
        disabledBack={disabledBack}
      />
      <EmuModal modal={modal} />
    </Wrapper>
  );
}

export default PowerControlsPage;
