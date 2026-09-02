import { useTranslation } from 'react-i18next';
import React, { useEffect, useState, useContext, useRef } from 'react';
import { GlobalContext } from 'context/globalContext';
import { BtnSimple, Img } from 'getbasecore/Atoms';
import Wrapper from 'components/molecules/Wrapper/Wrapper';

import EmuModal from 'components/molecules/EmuModal/EmuModal';
import Header from 'components/organisms/Header/Header';
import Footer from 'components/organisms/Footer/Footer';
import Main from 'components/organisms/Main/Main';
import { useParams } from 'react-router-dom';
import CloudSyncConfig from 'components/organisms/Wrappers/CloudSyncConfig';
import ProgressBar from 'components/atoms/ProgressBar/ProgressBar';
import PatreonLogin from 'components/organisms/PatreonLogin/PatreonLogin';
import { useFetchCond } from 'hooks/useFetchCond';
import {
  iconSuccess,
  iconDanger,
  iconQuestion,
} from 'components/utils/images/icons';

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
    showHealth: false,
    dom: undefined,
  });
  const {
    disabledNext,
    disabledBack,
    disableButton,
    showLoginButton,
    modal,
    showHealth,
  } = statePage;

  // Health state checks
  const [stateBin, setStateBin] = useState(undefined);
  const [stateCfg, setStateCfg] = useState(undefined);
  const [stateServiceCreated, setStateServiceCreated] = useState(undefined);
  const [stateCheckServiceStarts, setStateCheckServiceStarts] =
    useState(undefined);
  const [stateUpload, setStateUpload] = useState(undefined);
  const [stateIsFileUploaded, setStateIsFileUploaded] = useState(undefined);
  const [stateDownload, setStateDownload] = useState(undefined);
  const [stateIsFileDownloaded, setStateIsFileDownloaded] = useState(undefined);

  const ipcChannel = window.electron.ipcRenderer;

  const emudeckCloudLogin = useFetchCond('https://cloud.emudeck.com/login.php');

  const cloudSyncSet = (item) => {
    let modalData;
    if (item === 'Emudeck-cloud-selector') {
      const patreonToken = localStorage.getItem('patreon_token');
      const cloudSyncUser = patreonToken.split('|||')[0];

      emudeckCloudLogin.post({ token: patreonToken }).then((data) => {
        const emudeckCloudType = data.cloud;
        let emudeckCloudProvider;
        let cloudSyncPrefix = 'pe';
        if (data.cloud == 'cloud1') {
          emudeckCloudProvider = 'Emudeck-cloud';
          cloudSyncPrefix = 'cs' + cloudSyncUser;
        } else {
          emudeckCloudProvider = 'Emudeck-cloud2';
          cloudSyncPrefix = 'emudeck-saves/cs' + cloudSyncUser;
        }

        setState({
          ...state,
          cloudSync: emudeckCloudProvider,
          cs_user: cloudSyncPrefix,
        });
      });
    } else {
      if (item === 'Emudeck-GDrive') {
        modalData = {
          active: true,
          header: <span className="h4">{t('general.warning')}</span>,
          body: <p>{t('CloudSyncConfigPage.gdriveWarning')}</p>,
          css: 'emumodal--sm',
        };
      }

      if (item === 'Emudeck-SMB' || item === 'Emudeck-SFTP') {
        modalData = {
          active: true,
          header: <span className="h4">{t('general.warning')}</span>,
          body: <p>{t('CloudSyncConfigPage.smbWarning')}</p>,
          css: 'emumodal--sm',
        };
      }

      setState({
        ...state,
        cloudSync: item,
        cs_user: '',
      });
      setStatePage({
        ...statePage,
        showLoginButton: false,
        modal: modalData,
      });
    }
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
      header: <span className="h4">{t('CloudSyncConfigPage.uploading')}</span>,
      body: <p>{t('CloudSyncConfigPage.standBy')}</p>,
      footer: <ProgressBar css="progress--success" infinite max="100" />,
    };
    setStatePage({ ...statePage, modal: modalData });

    ipcChannel.sendMessage('emudeck', [`uploadAll|||cloud_sync_uploadEmuAll`]);

    ipcChannel.once('uploadAll', (message) => {
      const modalData = {
        active: true,
        header: (
          <span className="h4">{t('CloudSyncConfigPage.uploadComplete')}</span>
        ),
        body: <p>{t('CloudSyncConfigPage.uploadCompleteBody')}</p>,
        css: 'emumodal--xs',
      };
      setStatePage({ ...statePage, modal: modalData });
    });
  };

  const downloadAll = () => {
    const modalData = {
      active: true,
      header: (
        <span className="h4">{t('CloudSyncConfigPage.downloading')}</span>
      ),
      body: <p>{t('CloudSyncConfigPage.standBy')}</p>,
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
        header: (
          <span className="h4">
            {t('CloudSyncConfigPage.downloadComplete')}
          </span>
        ),
        body: <p>{t('CloudSyncConfigPage.downloadCompleteBody')}</p>,
        css: 'emumodal--xs',
      };
      setStatePage({ ...statePage, modal: modalData });
    });
  };

  const sendHealthCheck = (command) => {
    return new Promise((resolve) => {
      ipcChannel.sendMessage('emudeck', [`${command}|||${command}`]);
      ipcChannel.once(command, (message) => {
        resolve(message.stdout.includes('false') ? false : true);
      });
    });
  };

  const checkHealth = async () => {
    setStatePage((prev) => ({
      ...prev,
      showHealth: true,
    }));

    const binOk = await sendHealthCheck('cloud_sync_health_checkBin');
    setStateBin(binOk);

    const cfgOk = await sendHealthCheck('cloud_sync_health_checkCfg');
    setStateCfg(cfgOk);

    const serviceCreatedOk = await sendHealthCheck(
      'cloud_sync_health_checkServiceCreated'
    );
    setStateServiceCreated(serviceCreatedOk);

    const serviceStartsOk = await sendHealthCheck(
      'cloud_sync_health_checkServiceStarts'
    );
    setStateCheckServiceStarts(serviceStartsOk);

    const uploadOk = await sendHealthCheck('cloud_sync_health_upload');
    setStateUpload(uploadOk);

    const uploadedOk = await sendHealthCheck(
      'cloud_sync_health_isFileUploaded'
    );
    setStateIsFileUploaded(uploadedOk);

    const downloadOk = await sendHealthCheck('cloud_sync_health_download');
    setStateDownload(downloadOk);

    const downloadedOk = await sendHealthCheck(
      'cloud_sync_health_isFileDownloaded'
    );
    setStateIsFileDownloaded(downloadedOk);
  };

  const installRclone = () => {
    const modalData = {
      active: true,
      header: (
        <span className="h4">
          {t('CloudSyncConfigPage.installing', { type: cloudSyncType })}
        </span>
      ),
      css: 'emumodal--xs',
      body: <p>{t('CloudSyncConfigPage.installingBody')}</p>,
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
      if (stdout.includes('true_cs')) {
        // checkHealth();
        modalData = {
          active: true,
          header: (
            <span className="h4">
              {t('CloudSyncConfigPage.configured', { type: cloudSyncType })}
            </span>
          ),
          body: (
            <>
              <p>{t('CloudSyncConfigPage.configuredBody')}</p>
              <p>{t('CloudSyncConfigPage.uploadOrDownload')}</p>
            </>
          ),
          css: 'emumodal--sm',
          footer: (
            <>
              <BtnSimple
                css="btn-simple--1"
                type="button"
                aria={t('aria.downloadAllSaves')}
                onClick={() => downloadAll()}
              >
                {t('CloudSyncConfigPage.downloadAll')}
              </BtnSimple>
              <BtnSimple
                css="btn-simple--1"
                type="button"
                aria={t('aria.uploadAllSaves')}
                onClick={() => uploadAll()}
              >
                {t('CloudSyncConfigPage.uploadAll')}
              </BtnSimple>
              <BtnSimple
                css="btn-simple--1"
                type="button"
                aria={t('general.close')}
                onClick={() => closeModal()}
              >
                {t('general.close')}
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
          warningChrome = t('CloudSyncConfigPage.chromeWarning', {
            type: cloudSyncType,
          });
        }
        modalData = {
          active: true,
          header: (
            <span className="h4">
              {t('CloudSyncConfigPage.installError', { type: cloudSyncType })}
            </span>
          ),
          css: 'emumodal--xs',
          body: (
            <>
              <p>
                {t('CloudSyncConfigPage.installErrorBody', {
                  type: cloudSyncType,
                })}
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
        header: (
          <span className="h4">{t('CloudSyncConfigPage.uninstalled')}</span>
        ),
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
    if (cloudSync !== null) {
      ipcChannel.sendMessage('emudeck', [
        `save-setting|||setSetting rclone_provider ${cloudSync} && setSetting cloud_sync_provider ${cloudSync} `,
      ]);
      localStorage.setItem('settings_emudeck', json);
    }
  }, [cloudSync]);

  useEffect(() => {
    setState({
      ...state,
      cloudSync: null,
      cs_user: null,
    });
    if (system !== 'win32') {
      const modalData = {
        active: true,
        header: (
          <span className="h4">{t('CloudSyncConfigPage.chromeDep')}</span>
        ),
        body: (
          <p>
            {t('CloudSyncConfigPage.chromeDepBody', { type: cloudSyncType })}
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

  const iconMap = {
    undefined: iconQuestion,
    false: iconDanger,
    true: iconSuccess,
  };

  return (
    <Wrapper>
      {cloudSyncType === 'Sync' && (
        <PatreonLogin>
          {!showHealth && (
            <>
              <Header title={t('CloudSyncConfigPage.title')} />

              <CloudSyncConfig
                onClick={cloudSyncSet}
                onClickInstall={installRclone}
                onClickUninstall={uninstallRclone}
                onClickCheckHealth={checkHealth}
                disableButton={disableButton}
                showLoginButton={showLoginButton}
              />
            </>
          )}

          {showHealth && (
            <>
              <Header title={t('CloudSyncConfigPage.testingHealth')} />
              <Main>
                <div className="container--grid">
                  <div data-col-sm="6">
                    <ul className="list list--customization other">
                      <li>
                        {t('CloudSyncConfigPage.health.rclone')}{' '}
                        <div className="list--customization__pill">
                          <Img
                            src={iconMap[stateBin]}
                            css="icon icon--xs"
                            alt="OK"
                          />
                        </div>
                      </li>
                      <li>
                        {t('CloudSyncConfigPage.health.serviceExists')}{' '}
                        <div className="list--customization__pill">
                          <Img
                            src={iconMap[stateServiceCreated]}
                            css="icon icon--xs"
                            alt="OK"
                          />
                        </div>
                      </li>
                      <li>
                        {t('CloudSyncConfigPage.health.serviceStarts')}{' '}
                        <div className="list--customization__pill">
                          <Img
                            src={iconMap[stateCheckServiceStarts]}
                            css="icon icon--xs"
                            alt="OK"
                          />
                        </div>
                      </li>
                      <li>
                        {t('CloudSyncConfigPage.health.testUpload')}{' '}
                        <div className="list--customization__pill">
                          <Img
                            src={iconMap[stateUpload]}
                            css="icon icon--xs"
                            alt="OK"
                          />
                        </div>
                      </li>
                      <li>
                        {t('CloudSyncConfigPage.health.fileUploaded')}{' '}
                        <div className="list--customization__pill">
                          <Img
                            src={iconMap[stateIsFileUploaded]}
                            css="icon icon--xs"
                            alt="OK"
                          />
                        </div>
                      </li>
                      <li>
                        {t('CloudSyncConfigPage.health.testDownload')}{' '}
                        <div className="list--customization__pill">
                          <Img
                            src={iconMap[stateDownload]}
                            css="icon icon--xs"
                            alt="OK"
                          />
                        </div>
                      </li>
                      <li>
                        {t('CloudSyncConfigPage.health.fileDownloaded')}{' '}
                        <div className="list--customization__pill">
                          <Img
                            src={iconMap[stateIsFileDownloaded]}
                            css="icon icon--xs"
                            alt="OK"
                          />
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
              </Main>
            </>
          )}

          <EmuModal modal={modal} />
        </PatreonLogin>
      )}

      {cloudSyncType === 'Save' && (
        <>
          {!showHealth && (
            <>
              <Header title={t('CloudSyncConfigPage.title2')} />

              <CloudSyncConfig
                onClick={cloudSyncSet}
                onClickInstall={installRclone}
                onClickUninstall={uninstallRclone}
                onClickCheckHealth={checkHealth}
                disableButton={disableButton}
                showLoginButton={showLoginButton}
              />
            </>
          )}

          <EmuModal modal={modal} />
        </>
      )}
      <Footer
        next={nextButtonStatus()}
        nextText={t('general.copyGames')}
        disabledNext={disabledNext}
        disabledBack={disabledBack}
      />
    </Wrapper>
  );
}

export default CloudSyncPageConfig;
