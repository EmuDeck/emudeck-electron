import React, { useEffect, useState, useContext } from 'react';
import { GlobalContext } from 'context/globalContext';

import GyroDSU from 'components/organisms/Wrappers/GyroDSU.js';

const GyroDSUPage = () => {
  const { state, setState } = useContext(GlobalContext);
  const [statePage, setStatePage] = useState({
    disabledNext: false,
    disabledBack: false,
    data: '',
    hasSudo: false,
    sudoPass: '',
    showNotification: false,
  });
  const { disabledNext, disabledBack, hasSudo, sudoPass, showNotification } =
    statePage;

  const ipcChannel = window.electron.ipcRenderer;

  const setGyro = (data) => {
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
      'cp ~/emudeck/backend/tools/passwd.desktop ~/Desktop/passwd.desktop && chmod +x ~/Desktop/passwd.desktop && ~/Desktop/passwd.desktop && rm ~/Desktop/passwd.desktop ',
    ]);
  };

  const installGyro = (data) => {
    ipcChannel.sendMessage('emudeck', [
      `Gyro|||echo "${sudoPass}" | sudo -v -S && Plugins_installSteamDeckGyroDSU`,
    ]);

    ipcChannel.once('Gyro', (stdout) => {
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
    <GyroDSU
      showNotification={showNotification}
      sudoPass={sudoPass}
      disabledNext={disabledNext}
      disabledBack={disabledBack}
      onChange={setGyro}
      onClick={createSudo}
      installClick={installGyro}
      hasSudo={hasSudo}
      nextText={sudoPass ? 'Continue' : 'Skip'}
    />
  );
};

export default GyroDSUPage;
