import React, { useState, useContext } from 'react';
import { GlobalContext } from 'context/globalContext';
import Wrapper from 'components/molecules/Wrapper/Wrapper';
import Header from 'components/organisms/Header/Header';
import Footer from 'components/organisms/Footer/Footer';

import RemotePlayWhatever from 'components/organisms/Wrappers/RemotePlayWhatever';

function RemotePlayWhateverPage() {
  const [statePage, setStatePage] = useState({
    disabledNext: false,
    disabledBack: false,
    showNotification: false,
    notificationText: '',
  });
  const { disabledNext, disabledBack, showNotification, notificationText } =
    statePage;

  const ipcChannel = window.electron.ipcRenderer;

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

  const installRPW = () => {
    ipcChannel.sendMessage('emudeck', [
      'RemotePlayWhatever|||RemotePlayWhatever_install',
    ]);

    notificationShow(
      '🎉 RemotePlayWhatEver installed! Steam Rom Manager will launch now'
    );
  };

  return (
    <Wrapper>
      <Header title="Multiplayer with  RemotePlayWhatever - Beta" />
      <RemotePlayWhatever
        showNotification={showNotification}
        notificationText={notificationText}
        onClick={installRPW}
      />
      <Footer
        next={false}
        disabledNext={disabledNext}
        disabledBack={disabledBack}
      />
    </Wrapper>
  );
}

export default RemotePlayWhateverPage;
