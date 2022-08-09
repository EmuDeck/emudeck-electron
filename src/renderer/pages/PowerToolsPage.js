import React, { useEffect, useState, useContext } from 'react';
import { GlobalContext } from 'context/globalContext';

import PowerTools from 'components/organisms/Wrappers/PowerTools.js';

const PowerToolsPage = () => {
  const { state, setState } = useContext(GlobalContext);
  const { sudoPass } = state;
  const [statePage, setStatePage] = useState({
    disabledNext: false,
    disabledBack: false,
    data: '',
    hasSudo: false,
  });
  const { disabledNext, disabledBack, hasSudo } = statePage;

  const ipcChannel = window.electron.ipcRenderer;

  const setPowerTools = (data) => {
    if (data.target.value != '') {
      setState({
        ...state,
        powerTools: true,
        sudoPass: data.target.value
      });
    } else {
      setState({
        ...state,
        powerTools: false,
        sudoPass:''
      });
    }
  };

  const createSudo = (data) => {
    ipcChannel.sendMessage('bash', [
      'cp ~/emudeck/backend/tools/passwd.desktop ~/Desktop/passwd.desktop && chmod +x ~/Desktop/passwd.desktop && ~/Desktop/passwd.desktop && rm ~/Desktop/passwd.desktop ',
    ]);
  };

  const installPowerTools = (data)=>{
    ipcChannel.sendMessage('emudeck', [
      `powerTools|||echo "${sudoPass}" | sudo -v -S && Plugins_installPluginLoader && Plugins_installPowerTools`,
    ]);

    ipcChannel.once('powerTools', (stdout) => {
      console.log({ stdout });
    });

  }

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
      install={installPowerTools}
      disabledNext={disabledNext}
      disabledBack={disabledBack}
      onChange={setPowerTools}
      onClick={createSudo}
      hasSudo={hasSudo}
      nextText={sudoPass ? 'Continue' : 'Skip'}
    />
  );
};

export default PowerToolsPage;
