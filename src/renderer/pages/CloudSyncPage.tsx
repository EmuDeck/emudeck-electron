import { useState } from 'react';
import { useGlobalContext } from 'context/globalContext';

import CloudSync from 'components/organisms/Wrappers/CloudSync.js';

const CloudSyncPage = () => {
  const { state, setState } = useGlobalContext();
  // const { ar } = state;
  const [statePage, setStatePage] = useState({
    disabledNext: false,
    disabledBack: false,
    data: '',
  });
  const { disabledNext, disabledBack, data } = statePage;
  const cloudSyncSet = (cloudSyncStatus: boolean) => {
    setState({
      ...state,
      cloudSync: cloudSyncStatus,
    });
  };

  return (
    <CloudSync
      data={data}
      onClick={cloudSyncSet}
      disabledNext={disabledNext}
      disabledBack={disabledBack}
    />
  );
};

export default CloudSyncPage;
