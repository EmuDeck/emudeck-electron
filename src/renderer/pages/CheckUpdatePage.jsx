import { useTranslation } from 'react-i18next';
import React, { useEffect, useState, useContext, useRef } from 'react';
import { GlobalContext } from 'context/globalContext';
import Wrapper from 'components/molecules/Wrapper/Wrapper';

import EmuModal from 'components/molecules/EmuModal/EmuModal';
import Header from 'components/organisms/Header/Header';
import ProgressBar from 'components/atoms/ProgressBar/ProgressBar';
import Kamek from 'components/organisms/Kamek/Kamek';

import { useNavigate } from 'react-router-dom';
import Main from 'components/organisms/Main/Main';

import { BtnSimple } from 'getbasecore/Atoms';

// Ask for branch
const branchFile = require('data/branch.json');

const { branch } = branchFile;

function CheckUpdatePage() {
  const { t } = useTranslation();
  const ipcChannel = window.electron.ipcRenderer;
  const { state, setState, setStateCurrentConfigs } = useContext(GlobalContext);
  const [statePage, setStatePage] = useState({
    disabledNext: true,
    disabledBack: true,
    downloadComplete: !navigator.onLine ? true : null,
    update: 'up-to-date',
    cloned: null,
    data: '',
    dom: undefined,
    modal: {
      active: true,
      header: <span className="h4">{t('CheckUpdatePage.checking.title')}</span>,
      body: <p>{t('CheckUpdatePage.checking.description')}</p>,
      footer: <ProgressBar css="progress--success" infinite max="100" />,
      css: 'emumodal--xs emumodal--loading',
    },
  });

  const statePageRef = useRef(statePage);
  statePageRef.current = statePage;
  const { downloadComplete, cloned, update, modal } = statePageRef.current;
  const navigate = useNavigate();
  const updateRef = useRef(update);
  updateRef.current = update;

  const downloadCompleteRef = useRef(downloadComplete);
  downloadCompleteRef.current = downloadComplete;

  const {
    system,
    second,
    installEmus,
    installFrontends,
    overwriteConfigEmus,
    shaders,
    achievements,
  } = state;

  let pullTimeOut;
  let cloneTimeOut;
  const showLog = (system) => {
    if (system === 'win32') {
      ipcChannel.sendMessage('bash-nolog', [
        `start powershell -NoExit -ExecutionPolicy Bypass -command "& { Get-Content $env:APPDATA/emudeck/logs/git.log -Tail 100 -Wait }"`,
      ]);
    } else {
      ipcChannel.sendMessage('bash-nolog', [
        `konsole -e tail -f "$HOME/.config/EmuDeck/logs/git.log"`,
      ]);
    }
  };

  const updateFiles = () => {
    // Get latest settings versions in storage
    const currentVersions = JSON.parse(
      localStorage.getItem('current_versions')
    );
    if (currentVersions) {
      setStateCurrentConfigs({ ...currentVersions });
    }

    const settingsStorage = JSON.parse(
      localStorage.getItem('settings_emudeck')
    );

    if (settingsStorage) {
      const shadersStored = settingsStorage.shaders;
      const overwriteConfigEmusStored = settingsStorage.overwriteConfigEmus;
      const achievementsStored = settingsStorage.achievements;
      delete settingsStorage.installEmus.esde;
      delete settingsStorage.installEmus.pegasus;
      delete settingsStorage.installEmus.citra;
      delete settingsStorage.installEmus.lime3ds;
      delete settingsStorage.installEmus.primehacks;
      delete settingsStorage.installEmus.melonDS;
      delete settingsStorage.installEmus.cemunative;
      delete settingsStorage.overwriteConfigEmus.primehacks;
      delete settingsStorage.overwriteConfigEmus.citra;
      delete settingsStorage.overwriteConfigEmus.lime3ds;
      delete settingsStorage.installEmus.ares;
      delete settingsStorage.overwriteConfigEmus.ares;
      //delete settingsStorage.android;
      delete settingsStorage.installFrontends;
      const installEmusStored = settingsStorage.installEmus;
      // const installFrontendsStored = settingsStorage.installFrontends;

      if (!settingsStorage.overwriteConfigEmus.esde) {
        settingsStorage.overwriteConfigEmus.esde = {
          esde: { id: 'esde', status: true, name: 'EmulationStation DE' },
        };
      }

      if (
        settingsStorage.emulatorAlternative &&
        settingsStorage.emulatorAlternative.nds === 'melonDS'
      ) {
        delete settingsStorage.emulatorAlternative.nds;
        settingsStorage.emulatorAlternative.nds = 'melonds';
      }

      if (settingsStorage.themeESDE === 'EPICNOIR') {
        delete settingsStorage.themeESDE;
        settingsStorage.themeESDE = [
          'https://github.com/anthonycaccese/epic-noir-revisited-es-de.git',
          'epic-noir-revisited-es-de',
        ];
      }

      if (settingsStorage.themePegasus === 'gameOS') {
        delete settingsStorage.themePegasus;
        settingsStorage.themePegasus = [
          'https://github.com/PlayingKarrde/gameOS.git',
          'gameOS',
        ];
      }
      // Theres probably a better way to do this...

      ipcChannel.sendMessage('version');

      ipcChannel.once('version-out', (version) => {
        ipcChannel.sendMessage('system-info-in');
        ipcChannel.once('system-info-out', (platform, arch) => {
          console.log({
            system: platform,
            arch,
            version: version[0],
            gamemode: version[1],
          });
          let systemNameValue;
          switch (platform) {
            case 'darwin':
              systemNameValue = '\uF8FF';
              break;
            case 'win32':
              systemNameValue = 'Windows';
              break;
            case 'SteamOS':
              systemNameValue = 'SteamOS';
              break;
            case 'ChimeraOS':
              systemNameValue = 'ChimeraOS';
              break;
            case 'chimeraOS':
              systemNameValue = 'ChimeraOS';
              break;
            case '':
              systemNameValue = 'ERROR';
              break;
            case null:
              systemNameValue = 'ERROR';
              break;
            case undefined:
              systemNameValue = 'ERROR';
              break;
            default:
              systemNameValue = 'Linux';
              break;
          }
          setState({
            ...state,
            ...settingsStorage,
            second:
              settingsStorage.second === true ||
              localStorage.getItem('install_finished') === 'true',
            installEmus: { ...installEmus, ...installEmusStored },
            overwriteConfigEmus: {
              ...overwriteConfigEmus,
              ...overwriteConfigEmusStored,
            },
            achievements: {
              ...achievements,
              ...achievementsStored,
            },
            shaders: { ...shaders, ...shadersStored },
            system: platform,
            arch,
            systemName: systemNameValue,
            version: version[0],
            gamemode: version[1],
            branch,
          });
        });
      });
    } else {
      ipcChannel.sendMessage('version');
      ipcChannel.once('version-out', (version) => {
        ipcChannel.sendMessage('system-info-in');
        ipcChannel.once('system-info-out', (platform, arch) => {
          console.log({
            system: platform,
            arch,
            version: version[0],
            gamemode: version[1],
            branch,
          });
          let systemNameValue;
          switch (platform) {
            case 'darwin':
              systemNameValue = '\uF8FF';
              break;
            case 'win32':
              systemNameValue = 'Windows';
              break;
            case 'SteamOS':
              systemNameValue = 'SteamOS';
              break;
            case 'ChimeraOS':
              systemNameValue = 'ChimeraOS';
              break;
            case 'chimeraOS':
              systemNameValue = 'ChimeraOS';
              break;
            case '':
              systemNameValue = 'ERROR';
              break;
            case null:
              systemNameValue = 'ERROR';
              break;
            case undefined:
              systemNameValue = 'ERROR';
              break;
            default:
              systemNameValue = 'Linux';
              break;
          }
          setState({
            ...state,
            system: platform,
            arch,
            systemName: systemNameValue,
            version: version[0],
            gamemode: version[1],
            branch,
          });
        });
      });
    }
  };

  useEffect(() => {
    updateFiles();
  }, []);

  useEffect(() => {
    //
    // Cloning project
    //

    if (update === 'up-to-date') {
      // is the git repo cloned?

      const modalDataGit = {
        active: true,
        header: <span className="h4">{t('CheckUpdatePage.backend')}</span>,
        body: <ProgressBar css="progress--success" infinite max="100" />,
        footer: (
          <BtnSimple
            css="btn-simple--1"
            type="button"
            aria={t('aria.showLog')}
            disabled={false}
            style={{ marginBottom: 0 }}
            onClick={() => showLog(system)}
          >
            {t('CheckUpdatePage.seeMoreDetails')}
          </BtnSimple>
        ),
        css: 'emumodal--xs emumodal--loading',
      };

      if (navigator.onLine) {
        setStatePage({ ...statePageRef.current, modal: modalDataGit });
        console.log(`GIT PULL ${branch}`);
        ipcChannel.sendMessage('pull', branch);
        pullTimeOut = setTimeout(() => {
          ipcChannel.sendMessage('check-git-status', branch);
          ipcChannel.once('check-git-status', (output) => {
            console.log({ output });
            if (output.includes('up-to-date')) {
              setStatePage({ ...statePageRef.current, downloadComplete: true });
            } else {
              const modalData = {
                active: true,
                header: <span className="h4">{t('general.ooops')}</span>,
                body: <p>{t('CheckUpdatePage.backendError2')}</p>,
                footer: '',
                css: 'emumodal--xs',
              };
              setStatePage({
                ...statePageRef.current,
                modal: modalData,
              });
            }
          });
        }, 20000);
        ipcChannel.once('pull', (output) => {
          console.log('GIT PULL response');
          console.log({ output });
          clearTimeout(pullTimeOut);
          if (output && output.includes('not-cloned')) {
            setStatePage({ ...statePageRef.current, cloned: false });
            return;
          }
          // appImageInit runs in the background while the user is already on Welcome
          ipcChannel.sendMessage('app-init');
          setStatePage({ ...statePageRef.current, downloadComplete: true });
        });
        return;
      }

      ipcChannel.sendMessage('check-git');
      ipcChannel.once('check-git', (error, stdout, stderr) => {
        // alert('checking git');
        const cloneStatusCheck = stdout.replace('\n', '');
        let cloneStatusCheckValue;

        if (cloneStatusCheck.includes('true')) {
          cloneStatusCheckValue = true;
        } else {
          cloneStatusCheckValue = false;
        }

        setStatePage({
          ...statePage,
          cloned: cloneStatusCheckValue,
          modal: modalDataGit,
        });
      });
    }
  }, [update, system]);

  useEffect(() => {
    // settings here
    if (cloned === false) {
      // alert('cloneFalse');
      if (navigator.onLine) {
        ipcChannel.sendMessage(`clone`, branch);
        cloneTimeOut = setTimeout(() => {
          ipcChannel.sendMessage('check-git-status', branch);
          ipcChannel.once('check-git-status', (output) => {
            if (output.includes('not-a-repo')) {
              // alert('There seems to be an issue, please restart EmuDeck');
              const modalData = {
                active: true,
                header: <span className="h4">{t('general.ooops')}</span>,
                body: <p>{t('CheckUpdatePage.backendError')}</p>,
                css: 'emumodal--xs',
              };
              setStatePage({ ...statePageRef.current, modal: modalData });
            } else {
              setStatePage({ ...statePageRef.current, downloadComplete: true });
            }
          });
        }, 60000);
        ipcChannel.once('clone', (error, cloneStatusClone) => {
          if (cloneStatusClone.includes('true')) {
            clearTimeout(cloneTimeOut);
            setStatePage({ ...statePage, downloadComplete: true });
            console.log({ downloadComplete });
          }
        });
      } else {
        const modalData = {
          active: true,
          header: <span className="h4">{t('general.ooops')}</span>,
          body: <p>{t('CheckUpdatePage.offline')}</p>,
          css: 'emumodal--xs emumodal--loading',
        };
        setStatePage({
          ...statePage,
          modal: modalData,
        });
      }
    } else if (cloned === true) {
      setStatePage({ ...statePage, downloadComplete: true });
    }
  }, [cloned]);

  useEffect(() => {
    console.log({ downloadComplete });
    if (downloadComplete === true) {
      // First launch after an update: show the changelog instead of Welcome
      if (localStorage.getItem('show_changelog') === 'true') {
        navigate('/change-log', { state: { fromUpdate: true } });
      } else if (navigator.onLine) {
        navigate('/welcome');
      } else {
        navigate('/settings');
      }
    }
  }, [downloadComplete]);

  return (
    <Wrapper css="wrapper__full" aside={false}>
      <Kamek />
      <Header title={t('CheckUpdatePage.title')} />
      <EmuModal modal={modal} />
    </Wrapper>
  );
}

export default CheckUpdatePage;
