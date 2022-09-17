import React, { useEffect, useState, useContext } from 'react';
import { GlobalContext } from 'context/globalContext';

import RemotePlayWhatever from 'components/organisms/Wrappers/RemotePlayWhatever.js';

const RemotePlayWhateverPage = () => {
  const { state, setState } = useContext(GlobalContext);

  const [statePage, setStatePage] = useState({
    disabledNext: false,
    disabledBack: false,
  });
  const { disabledNext, disabledBack } = statePage;

  const ipcChannel = window.electron.ipcRenderer;

  const installRPW = (data) => {
    ipcChannel.sendMessage('emudeck', [
      'RemotePlayWhatever|||RemotePlayWhatever_install',
    ]);
  };

  const openSRM = () => {
    ipcChannel.sendMessage('bash', [
      `zenity --question --width 450 --title \"Close Steam/Steam Input?\" --text \"Exit Steam to launch Steam Rom Manager? Desktop controls will temporarily revert to touch/trackpad/L2/R2\" && (kill -15 \$(pidof steam) & ${storagePath}/Emulation/tools/srm/Steam-ROM-Manager.AppImage)`,
    ]);
  };

  return (
    <RemotePlayWhatever
      disabledNext={disabledNext}
      disabledBack={disabledBack}
      onClick={installRPW}
      onClickSRM={openSRM}
    />
  );
};

export default RemotePlayWhateverPage;
