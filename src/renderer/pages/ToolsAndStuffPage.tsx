import { useEffect, useState } from 'react';
import { useGlobalContext } from 'context/globalContext';

import ToolsAndStuff from 'components/organisms/Wrappers/ToolsAndStuff.js';

const ToolsAndStuffPage = () => {
  const { state, setState } = useGlobalContext();
  const { sudoPass } = state;

  const [statePage, setStatePage] = useState({
    disabledNext: false,
    disabledBack: false,
    data: '',
    hasSudo: false,
  });
  const { disabledNext, disabledBack, hasSudo } = statePage;

  const ipcChannel = window.electron.ipcRenderer;

  const setToolsAndStuff = (data) => {
    if (data.target.value != '') {
      setState({
        ...state,
        ToolsAndStuff: true,
      });
    } else {
      setState({
        ...state,
        ToolsAndStuff: false,
      });
    }
  };

  const createSudo = (data) => {
    ipcChannel.sendMessage('bash', [
      'cp ~/emudeck/backend/tools/passwd.desktop ~/Desktop/passwd.desktop && chmod +x ~/Desktop/passwd.desktop && ~/Desktop/passwd.desktop && rm ~/Desktop/passwd.desktop ',
    ]);
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
    <ToolsAndStuff
      disabledNext={disabledNext}
      disabledBack={disabledBack}
      onChange={setToolsAndStuff}
      onClick={createSudo}
      hasSudo={hasSudo}
      nextText={sudoPass ? 'Continue' : 'Skip'}
    />
  );
};

export default ToolsAndStuffPage;
