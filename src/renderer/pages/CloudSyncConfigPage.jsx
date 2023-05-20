import React, { useEffect, useState, useContext } from 'react';
import { GlobalContext } from 'context/globalContext';
import Wrapper from 'components/molecules/Wrapper/Wrapper';
import Header from 'components/organisms/Header/Header';
import Footer from 'components/organisms/Footer/Footer';
import { useParams } from 'react-router-dom';
import CloudSyncConfig from 'components/organisms/Wrappers/CloudSyncConfig';

function CloudSyncPageConfig() {
  const { state, setState } = useContext(GlobalContext);
  const json = JSON.stringify(state);
  const { cloudSync, cloudSyncType, system, mode } = state;
  const { type } = useParams();
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

  const installRclone = () => {
    // OLD TOKEN upload, not needed for now
    // if (
    //   confirm(
    //     'Press OK if you already have CloudSync installed on another EmuDeck installation and you want to sync that installation to this one, if not, press Cancel'
    //   ) === true
    // ) {
    //   ipcChannel.sendMessage('emudeck', [
    //     `cloud_sync_install_and_config_with_code|||cloud_sync_install_and_config_with_code ${cloudSync}`,
    //   ]);
    //   ipcChannel.once('cloud_sync_install_and_config_with_code', (message) => {
    //     // No versioning found, what to do?
    //     console.log('cloudSync', message);
    //     alert(
    //       `All Done, every time you load a game your Game states and Saved games will be synced to ${cloudSync}`
    //     );
    //   });
    // } else {
    alert(`A web browser will open so you can log in to your Cloud provider`);

    ipcChannel.sendMessage('emudeck', [
      `cloud_sync_install_and_config|||cloud_sync_install_and_config ${cloudSync}`,
    ]);

    ipcChannel.once('cloud_sync_install_and_config', (message) => {
      console.log(message);
      const { stdout } = message;
      if (stdout.includes('true')) {
        alert(
          'CloudSync Configured! Now every time you load a game your game states and saved games will be synced to the cloud. Keep in mind that every time you play on a device that last save will be the one on the cloud'
        );
      }
    });
    // }
  };

  const uninstallRclone = () => {
    ipcChannel.sendMessage('emudeck', [
      `cloud_sync_uninstall|||cloud_sync_uninstall`,
    ]);
    ipcChannel.once('cloud_sync_uninstall', (message) => {
      // No versioning found, what to do?
      setStatePage({
        ...state,
        cloudSync: null,
      });
      alert(`Cloud Sync uninstalled`);
    });
  };

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
        alert(
          `All Done, every time you load a Game your Game states and Saved games will be synced to ${cloudSync}`
        );
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

  const nextButtonStatus = () => {
    if (type === 'welcome') {
      return false;
    }
    return mode === 'easy' ? 'end' : 'emulator-selector';
  };

  return (
    <Wrapper>
      <Header title="Cloud Saves - Select your provider" />
      <CloudSyncConfig
        onClick={cloudSyncSet}
        onClickInstall={
          cloudSyncType === 'Sync' ? installRclone : createDesktopIcon
        }
        onClickUninstall={uninstallRclone}
        disableButton={disableButton}
      />

      <Footer
        next={nextButtonStatus()}
        nextText={mode === 'easy' ? 'Finish' : 'Next'}
        disabledNext={disabledNext}
        disabledBack={disabledBack}
      />
    </Wrapper>
  );
}

export default CloudSyncPageConfig;
