import React, { useEffect, useState, useContext } from 'react';
import { GlobalContext } from 'context/globalContext';

import RemotePlayWhatever from 'components/organisms/Wrappers/RemotePlayWhatever.js';

const RemotePlayWhateverPage = () => {
  const { state, setState } = useContext(GlobalContext);

  const [statePage, setStatePage] = useState({
    disabledNext: false,
    disabledBack: false,
    showNotification: false,
    notificationText: '',
  });
  const { disabledNext, disabledBack, showNotification, notificationText } =
    statePage;

  const ipcChannel = window.electron.ipcRenderer;

  const installRPW = (data) => {
    ipcChannel.sendMessage('emudeck', [
      'RemotePlayWhatever|||RemotePlayWhatever_install',
    ]);

    notificationShow(
      '🎉 RemotePlayWhatEver installed! Steam Rom Manager will launch now'
    );
  };

  const notificationShow = (text) => {
    setStatePage({
      ...statePage,
      notificationText: text,
      showNotification: true,
    });

    if (showNotification === true) {
      setTimeout(() => {
        setStatePage({
          ...statePage,
          showNotification: false,
        });
      }, 2000);
    }
  };

  return (
    <RemotePlayWhatever
      showNotification={showNotification}
      notificationText={notificationText}
      disabledNext={disabledNext}
      disabledBack={disabledBack}
      onClick={installRPW}
    />
  );
};

export default RemotePlayWhateverPage;
