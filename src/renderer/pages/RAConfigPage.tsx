import { useEffect, useState } from 'react';
import { useGlobalContext } from 'context/globalContext';

import RAConfig from 'components/organisms/Wrappers/RAConfig.js';

const RAConfigPage = () => {
  const { state, setState } = useGlobalContext();
  const { snes } = state;
  const [statePage, setStatePage] = useState({
    disabledNext: true,
    disabledBack: false,
    data: '',
  });
  const { disabledNext, disabledBack, overlaysInstalled, data } = statePage;

  const snesSet = (snesAR) => {
    setState({
      ...state,
      snes: snesAR,
    });
  };
  // Enabling button when changing the global state only if we have a device selected
  useEffect(() => {
    if (snes != '') {
      setStatePage({ ...statePage, disabledNext: false });
    }
  }, [state]); // <-- here put the parameter to listen

  return (
    <RAConfig
      data={data}
      disabledNext={disabledNext}
      disabledBack={disabledBack}
      overlaysInstalled={overlaysInstalled}
    />
  );
};

export default RAConfigPage;
