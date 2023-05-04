import React, { useEffect, useState } from 'react';
import Wrapper from 'components/molecules/Wrapper/Wrapper';
import Header from 'components/organisms/Header/Header';
import Footer from 'components/organisms/Footer/Footer';

import PowerTools from 'components/organisms/Wrappers/PowerTools';

function PowerToolsPage() {
  const [statePage, setStatePage] = useState({
    disabledNext: false,
    disabledBack: false,
    data: '',
    hasSudo: false,
    sudoPass: '',
    showNotification: false,
    disableButton: false,
    pass1: 'a',
    pass2: 'b',
    textNotification: '',
  });
  const {
    disabledNext,
    disabledBack,
    hasSudo,
    sudoPass,
    showNotification,
    pass1,
    pass2,
    textNotification,
    disableButton,
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
        sudoPass: '',
      });
    }
  };

  const createSudo = () => {
    ipcChannel.sendMessage('bash', [
      `echo '${pass1}' > test && cat test >> test1 && cat test >> test1 && passwd deck < test1 && rm test test1`,
    ]);
    setStatePage({
      ...statePage,
      hasSudo: true,
      sudoPass: pass1,
      showNotification: true,
      textNotification: '🎉 Password created!',
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
    setStatePage({
      ...statePage,
      disableButton: true,
    });

    const escapedPass = sudoPass.replaceAll("'", "'\\''");

    ipcChannel.sendMessage('emudeck', [
      `powerTools|||echo '${escapedPass}' | sudo -v -S && Plugins_installPluginLoader && Plugins_installPowerTools && echo true`,
    ]);

    ipcChannel.once('powerTools', (status) => {
      // console.log({ status });
      const { stdout } = status;

      if (stdout.includes('true')) {
        setStatePage({
          ...statePage,
          showNotification: true,
          textNotification: '🎉 PowerTools Installed!',
          sudoPass: '',
        });
        if (showNotification === true) {
          setTimeout(() => {
            setStatePage({
              ...statePage,
              showNotification: false,
            });
          }, 2000);
        }
      } else {
        setStatePage({
          ...statePage,
          showNotification: true,
          textNotification: JSON.stringify(status.stderr),
        });
        if (showNotification === true) {
          setTimeout(() => {
            setStatePage({
              ...statePage,
              showNotification: false,
            });
          }, 2000);
        }
      }
    });
  };

  //

  useEffect(() => {
    ipcChannel.sendMessage('bash', [
      'checkPWD|||passwd -S $(whoami) | awk -F " " "{print $2}" & exit',
    ]);

    ipcChannel.once('checkPWD', (messagePWD) => {
      // console.log({ stdout });
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
      <Header title="Configure" bold="Power Tools" />
      <PowerTools
        showNotification={showNotification}
        installClick={installPowerTools}
        sudoPass={sudoPass}
        onChange={setSudoPass}
        onChangeSetPass={setPassword}
        onChangeCheckPass={checkPassword}
        onClick={createSudo}
        disableButton={disableButton}
        hasSudo={hasSudo}
        passValidates={pass1 === pass2}
        textNotification={textNotification}
      />
      <Footer
        next={false}
        nextText={sudoPass ? 'Continue' : 'Skip'}
        disabledNext={disabledNext}
        disabledBack={disabledBack}
      />
    </Wrapper>
  );
}

export default PowerToolsPage;
