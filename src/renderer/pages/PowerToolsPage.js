import React, { useEffect, useState, useContext } from 'react';
import { GlobalContext } from 'context/globalContext';

import PowerTools from 'components/organisms/Wrappers/PowerTools.js';

const PowerToolsPage = () => {
  const { state, setState } = useContext(GlobalContext);
  const [statePage, setStatePage] = useState({
    disabledNext: false,
    disabledBack: false,
    data: '',
    hasSudo: false,
    sudoPass: '',
    showNotification: false,
    pass1: 'a',
    pass2: 'b',
  });
  const {
    disabledNext,
    disabledBack,
    hasSudo,
    sudoPass,
    showNotification,
    pass1,
    pass2,
  } = statePage;

  const ipcChannel = window.electron.ipcRenderer;

  const setSudoPass = (data) => {
    if (data.target.value != '') {
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

  const createSudo = (data) => {
    ipcChannel.sendMessage('bash', [
      `echo ${pass1} > test && cat test >> test1 && cat test >> test1 && passwd deck < test1 && rm test test1`,
    ]);
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

  const installPowerTools = (data) => {
    ipcChannel.sendMessage('emudeck', [
      `powerTools|||echo "${sudoPass}" | sudo -v -S && Plugins_installPluginLoader && Plugins_installPowerTools`,
    ]);

    ipcChannel.once('powerTools', (stdout) => {
      console.log({ stdout });
      setStatePage({
        ...statePage,
        showNotification: true,
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
    });
  };

  //

  useEffect(() => {
    ipcChannel.sendMessage('bash', [
      'checkPWD|||passwd -S $(whoami) | awk -F " " "{print $2}" & exit',
    ]);

    ipcChannel.once('checkPWD', (stdout) => {
      console.log({ stdout });
      stdout = stdout.replace('\n', '');
      stdout.includes('NP') ? (stdout = false) : (stdout = true);
      setStatePage({
        ...statePage,
        hasSudo: stdout,
      });
    });
  }, []);

  return (
    <PowerTools
      showNotification={showNotification}
      installClick={installPowerTools}
      disabledNext={disabledNext}
      disabledBack={disabledBack}
      onChange={setSudoPass}
      onChangeSetPass={setPassword}
      onChangeCheckPass={checkPassword}
      onClick={createSudo}
      hasSudo={hasSudo}
      sudoPass={sudoPass}
      passValidates={pass1 === pass2 ? true : false}
      nextText={sudoPass ? 'Continue' : 'Skip'}
    />
  );
};

export default PowerToolsPage;
