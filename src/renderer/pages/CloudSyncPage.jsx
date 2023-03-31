import React, { useEffect, useState, useContext } from 'react';
import { GlobalContext } from 'context/globalContext';
import Wrapper from 'components/molecules/Wrapper/Wrapper';
import Header from 'components/organisms/Header/Header';
import Footer from 'components/organisms/Footer/Footer';

import CloudSync from 'components/organisms/Wrappers/CloudSync';

function CloudSyncPage() {
  const { state, setState } = useContext(GlobalContext);
  let json = JSON.stringify(state);
  const { cloudSync, system } = state;
  const [statePage, setStatePage] = useState({
    disabledNext: false,
    disabledBack: false,
    disableButton: false,
  });
  const { disabledNext, disabledBack, disableButton } = statePage;

  const ipcChannel = window.electron.ipcRenderer;

  const cloudSyncSet = (item) => {
    setState({
      ...state,
      cloudSync: item,
    });
  };

  // const createDesktopIcon = () => {
  //   ipcChannel.sendMessage('emudeck', [`save-setting|||rclone_setup`]);
  // };

  const createDesktopIcon = () => {
    setStatePage({
      ...statePage,
      disableButton: true,
    });

    if (system === 'win32') {
      ipcChannel.sendMessage('emudeck', [
        `rclone_install|||rclone_install ${cloudSync}`,
      ]);
      ipcChannel.once('rclone_install', (message) => {
        // No versioning found, what to do?
        setStatePage({
          ...statePage,
          disableButton: false,
        });
      });
    } else {
      ipcChannel.sendMessage('emudeck', [
        `createDesktop|||createDesktopShortcut "$HOME/Desktop/SaveBackup.desktop" "EmuDeck SaveBackup" ". $HOME/.config/EmuDeck/backend/functions/all.sh && rclone_setup" true`,
      ]);

      ipcChannel.once('createDesktop', (message) => {
        // No versioning found, what to do?
        setStatePage({
          ...statePage,
          disableButton: false,
        });
      });

      ipcChannel.sendMessage('bash-nolog', [
        `zenity --info --width=400 --text="Go to your Desktop and open the new EmuDeck SaveBackup icon.`,
      ]);
    }
  };

  const openKonsole = () => {
    ipcChannel.sendMessage('emudeck', [
      `openKonsole|||konsole -e echo $emulationPath && rclone_setup`,
    ]);
  };

  useEffect(() => {
    ipcChannel.sendMessage('emudeck', [
      `save-setting|||setSetting rclone_provider ${cloudSync}`,
    ]);
    localStorage.setItem('settings_emudeck', json);
  }, [cloudSync]);

  return (
    <Wrapper>
      <Header title="SaveBackup - BETA" />
      <CloudSync
        onClick={cloudSyncSet}
        onClickInstall={createDesktopIcon}
        disableButton={disableButton}
      />
      <Footer
        next={false}
        disabledNext={disabledNext}
        disabledBack={disabledBack}
      />
    </Wrapper>
  );
}

export default CloudSyncPage;
