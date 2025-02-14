import { useTranslation } from 'react-i18next';
import React, { useEffect, useState, useContext, useRef } from 'react';
import { GlobalContext } from 'context/globalContext';
import { BtnSimple } from 'getbasecore/Atoms';
import Wrapper from 'components/molecules/Wrapper/Wrapper';

import EmuModal from 'components/molecules/EmuModal/EmuModal';
import Header from 'components/organisms/Header/Header';
import Footer from 'components/organisms/Footer/Footer';
import { useParams } from 'react-router-dom';
import CloudSyncConfig from 'components/organisms/Wrappers/CloudSyncConfig';
import ProgressBar from 'components/atoms/ProgressBar/ProgressBar';
import PatreonLogin from 'components/organisms/PatreonLogin/PatreonLogin';

function CloudSyncPageConfig() {
  const { t, i18n } = useTranslation();
  const { state, setState } = useContext(GlobalContext);
  const json = JSON.stringify(state);
  const { cloudSync, cloudSyncType, system, mode } = state;
  const { type } = useParams();
  const [statePage, setStatePage] = useState({
    disabledNext: false,
    disabledBack: false,
    disableButton: false,
    showLoginButton: false,
    modal: undefined,
    dom: undefined,
  });
  const {
    disabledNext,
    disabledBack,
    disableButton,
    showLoginButton,
    modal,
    dom,
  } = statePage;

  const ipcChannel = window.electron.ipcRenderer;

  const cloudSyncSet = (item) => {
    let modalData;
    if (item === 'Emudeck-GDrive') {
      modalData = {
        active: true,
        header: <span className="h4">Warning</span>,
        body: (
          <p>
            If you are using a free Google Drive account we don't recomended to
            use it with CloudSync since Google will throttle your connection,
            making CloudSync really really slow.
          </p>
        ),
        css: 'emumodal--sm',
      };
    }

    if (item === 'Emudeck-SMB' || item === 'Emudeck-SFTP') {
      modalData = {
        active: true,
        header: <span className="h4">Warning</span>,
        body: (
          <p>
            You might need to create an emudeck folder in the root of your
            storage before setting up CloudSync
          </p>
        ),
        css: 'emumodal--sm',
      };
    }

    setState({
      ...state,
      cloudSync: item,
    });
    setStatePage({
      ...statePage,
      showLoginButton: false,
      modal: modalData,
    });
  };

  const closeModal = () => {
    const modalData = { active: false };
    setStatePage({
      ...statePage,
      modal: modalData,
    });
  };

  const uploadAll = () => {
    const modalData = {
      active: true,
      header: <span className="h4">Uploading</span>,
      body: <p>Please stand by...</p>,
      footer: <ProgressBar css="progress--success" infinite max="100" />,
    };
    setStatePage({ ...statePage, modal: modalData });

    ipcChannel.sendMessage('emudeck', [`uploadAll|||cloud_sync_uploadEmuAll`]);

    ipcChannel.once('uploadAll', (message) => {
      const modalData = {
        active: true,
        header: <span className="h4">Upload Complete</span>,
        body: (
          <p>
            All your saved games and states have been uploaded to your cloud
            provider.
          </p>
        ),
        css: 'emumodal--xs',
      };
      setStatePage({ ...statePage, modal: modalData });
    });
  };

  const downloadAll = () => {
    const modalData = {
      active: true,
      header: <span className="h4">Downloading</span>,
      body: <p>Please stand by...</p>,
      footer: <ProgressBar css="progress--success" infinite max="100" />,
      css: 'emumodal--xs',
    };
    setStatePage({ ...statePage, modal: modalData });

    ipcChannel.sendMessage('emudeck', [
      `downloadAll|||cloud_sync_downloadEmuAll`,
    ]);

    ipcChannel.once('downloadAll', (message) => {
      const modalData = {
        active: true,
        header: <span className="h4">Download Complete</span>,
        body: (
          <p>
            All your saved games and states have been downloaded from your cloud
            provider.
          </p>
        ),
        css: 'emumodal--xs',
      };
      setStatePage({ ...statePage, modal: modalData });
    });
  };

  const checkHealth = () => {
    const modalData = {
      active: true,
      header: <span className="h4">Testing CloudSync</span>,
      body: <p>Please wait a few minutes while we test your configuration.</p>,
      footer: <ProgressBar css="progress--success" infinite max="100" />,
      css: 'emumodal--sm',
    };
    setStatePage({
      ...statePage,
      modal: modalData,
    });
    ipcChannel.sendMessage('emudeck', [`cloudSyncHealth|||cloudSyncHealth`]);

    ipcChannel.once('cloudSyncHealth', (message) => {
      console.log({ message });
      const { stdout } = message;
      let modalData;
      if (stdout.includes('true')) {
        modalData = {
          active: true,
          header: <span className="h4">Success!</span>,
          body: <div dangerouslySetInnerHTML={{ __html: stdout }} />,
          css: 'emumodal--sm',
        };
      } else {
        console.log({ stdout });
        modalData = {
          active: true,
          header: <span className="h4">CloudSync failure</span>,
          body: <div dangerouslySetInnerHTML={{ __html: stdout }} />,
          css: 'emumodal--sm',
        };
      }
      setStatePage({
        ...statePage,
        modal: modalData,
      });
    });
  };

  const installRclone = () => {
    const modalData = {
      active: true,
      header: <span className="h4">Installing Cloud{cloudSyncType}</span>,
      css: 'emumodal--xs',
      body: (
        <p>
          Please stand by... this could take a while, depending on your provider
          & internet speed
        </p>
      ),
      footer: <ProgressBar css="progress--success" infinite max="100" />,
    };
    setStatePage({ ...statePage, disableButton: true, modal: modalData });

    let cloudFunction;
    cloudFunction = 'cloud_sync_install_and_config ';
    let patreonToken = undefined;
    patreonToken = localStorage.getItem('patreon_token');
    if (patreonToken) {
      patreonToken = patreonToken.replaceAll('|', '-');
    }
    console.log(`cloud_saves|||${cloudFunction} ${cloudSync} ${patreonToken}`);
    ipcChannel.sendMessage('emudeck', [
      `cloud_saves|||${cloudFunction} ${cloudSync} ${patreonToken}`,
    ]);

    ipcChannel.once('cloud_saves', (message) => {
      const { stdout } = message;
      console.log({ stdout });
      let modalData;
      if (stdout.includes('true')) {
        // checkHealth();
        modalData = {
          active: true,
          header: <span className="h4">Cloud{cloudSyncType} Configured</span>,
          body: (
            <>
              <p>
                Now every time you load a game your game states and saved games
                will be synced to the cloud. Keep in mind that every time you
                play on a device that last save will be the one on the cloud
              </p>
              <p>Do you want to upload or download all your saved games now?</p>
            </>
          ),
          css: 'emumodal--sm',
          footer: (
            <>
              <BtnSimple
                css="btn-simple--1"
                type="button"
                aria="Download all saves from your Cloud Provider"
                onClick={() => downloadAll()}
              >
                Download all saves
              </BtnSimple>
              <BtnSimple
                css="btn-simple--1"
                type="button"
                aria="Upload all your saves to your Cloud Provider"
                onClick={() => uploadAll()}
              >
                Upload all saves
              </BtnSimple>
              <BtnSimple
                css="btn-simple--1"
                type="button"
                aria="Close"
                onClick={() => closeModal()}
              >
                Close
              </BtnSimple>
            </>
          ),
        };
        setState({
          ...state,
          cloudSyncStatus: true,
        });
      } else {
        // checkHealth();
        let warningChrome;
        if (system !== 'win32') {
          warningChrome = `Make sure you have Google Chrome installed, Firefox won't work. Once you have Cloud${cloudSyncType} installed you can remove Chrome`;
        }
        modalData = {
          active: true,
          header: (
            <span className="h4">Error Installing Cloud{cloudSyncType}</span>
          ),
          css: 'emumodal--xs',
          body: (
            <>
              <p>
                There's been an issue installing Cloud{cloudSyncType}, please
                try again. Make sure your credentials are correct.
              </p>
              <p>
                <strong>{warningChrome}</strong>
              </p>
            </>
          ),
        };
        setState({
          ...state,
          cloudSyncStatus: false,
        });
      }

      setStatePage({ ...statePage, disableButton: false, modal: modalData });
    });
    // }
  };

  const uninstallRclone = () => {
    setStatePage({
      ...statePage,
      disableButton: true,
    });
    ipcChannel.sendMessage('emudeck', [
      `cloud_sync_uninstall|||cloud_sync_uninstall`,
    ]);
    ipcChannel.once('cloud_sync_uninstall', (message) => {
      // No versioning found, what to do?

      const modalData = {
        active: true,
        header: <span className="h4">Cloud Sync uninstalled</span>,
        css: 'emumodal--xs',
      };
      setStatePage({
        ...state,
        cloudSync: null,
        disableButton: false,
        modal: modalData,
      });
      setState({
        ...state,
        cloudSyncStatus: false,
      });
    });
  };

  useEffect(() => {
    if (cloudSync !== '' || cloudSync !== undefined) {
      ipcChannel.sendMessage('emudeck', [
        `save-setting|||setSetting rclone_provider ${cloudSync} && setSetting cloud_sync_provider ${cloudSync} `,
      ]);
      localStorage.setItem('settings_emudeck', json);
    }
  }, [cloudSync]);

  useEffect(() => {
    if (system !== 'win32') {
      const modalData = {
        active: true,
        header: <span className="h4">Google Chrome dependency</span>,
        body: (
          <p>
            Make sure you have Google Chrome or any other Chromium browser set
            as your default browser to install Cloud{cloudSyncType}. You can set
            your old browser by default once the installation is complete.
          </p>
        ),
        css: 'emumodal--sm',
      };
      setStatePage({
        ...statePage,
        modal: modalData,
      });
    }
  }, []);

  const nextButtonStatus = () => {
    if (type === 'welcome') {
      return false;
    }
    return 'copy-games';
  };

  return (
    <Wrapper>
      {cloudSyncType === 'Sync' && (
        <PatreonLogin>
          <Header title="Cloud Sync - Select your provider" />
          <CloudSyncConfig
            onClick={cloudSyncSet}
            onClickInstall={installRclone}
            onClickUninstall={uninstallRclone}
            onClickCheckHealth={checkHealth}
            disableButton={disableButton}
            showLoginButton={showLoginButton}
          />

          <EmuModal modal={modal} />
        </PatreonLogin>
      )}

      {cloudSyncType === 'Save' && (
        <>
          <Header title="Cloud Backup - Select your provider" />
          <CloudSyncConfig
            onClick={cloudSyncSet}
            onClickInstall={installRclone}
            onClickUninstall={uninstallRclone}
            onClickCheckHealth={checkHealth}
            disableButton={disableButton}
            showLoginButton={showLoginButton}
          />

          <EmuModal modal={modal} />
        </>
      )}
      <Footer
        next={nextButtonStatus()}
        nextText="Copy games"
        disabledNext={disabledNext}
        disabledBack={disabledBack}
      />
    </Wrapper>
  );
}

export default CloudSyncPageConfig;
