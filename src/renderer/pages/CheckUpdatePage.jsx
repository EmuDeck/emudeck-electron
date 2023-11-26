import React, { useEffect, useState, useContext, useRef } from 'react';
import { GlobalContext } from 'context/globalContext';
import Wrapper from 'components/molecules/Wrapper/Wrapper';
import GamePad from 'components/organisms/GamePad/GamePad';
import EmuModal from 'components/molecules/EmuModal/EmuModal';
import Header from 'components/organisms/Header/Header';
import ProgressBar from 'components/atoms/ProgressBar/ProgressBar';
import Kamek from 'components/organisms/Kamek/Kamek';

import { useNavigate } from 'react-router-dom';
import Main from 'components/organisms/Main/Main';

import { BtnSimple } from 'getbasecore/Atoms';

import {
  iconChecker,
  iconCloud,
  iconCompress,
  iconGear,
  iconList,
  iconMigrate,
  iconPlugin,
  iconPrize,
  iconUninstall,
  iconQuick,
  iconCustom,
  iconDoc,
  iconJoystick,
  iconPackage,
  iconDisk,
  iconHelp,
  iconScreen,
} from 'components/utils/images/icons';

// Ask for branch
const branchFile = require('data/branch.json');

const { branch } = branchFile;

function CheckUpdatePage() {
  const ipcChannel = window.electron.ipcRenderer;
  const { state, setState, setStateCurrentConfigs, systemName } =
    useContext(GlobalContext);
  const [statePage, setStatePage] = useState({
    disabledNext: true,
    disabledBack: true,
    downloadComplete: !navigator.onLine ? true : null,
    update: null,
    cloned: null,
    data: '',
    dom: undefined,
    modal: {
      active: true,
      header: <span className="h4">Checking for updates...</span>,
      body: (
        <p>
          Please stand by while we check if there is a new version available...
        </p>
      ),
      footer: <ProgressBar css="progress--success" infinite max="100" />,
      css: 'emumodal--xs emumodal--loading',
    },
  });
  const { downloadComplete, cloned, update, modal, dom } = statePage;
  const navigate = useNavigate();
  const updateRef = useRef(update);
  updateRef.current = update;

  const downloadCompleteRef = useRef(downloadComplete);
  downloadCompleteRef.current = downloadComplete;

  const {
    system,
    second,
    installEmus,
    overwriteConfigEmus,
    shaders,
    achievements,
  } = state;

  const openCSM = () => {
    ipcChannel.sendMessage('bash', [
      'csm|||bash ~/.config/EmuDeck/backend/functions/cloudServicesManager.sh',
    ]);
    ipcChannel.once('csm', (message) => {
      console.log({ message });
    });
  };

  const getLogs = () => {
    ipcChannel.sendMessage('emudeck', [`zipLogs|||zipLogs`]);
    ipcChannel.once('zipLogs', (message) => {
      console.log({ message });
      let modalData;
      let { stdout } = message;

      stdout = stdout.replace('\n', '');

      if (stdout.includes('true')) {
        modalData = {
          active: true,
          header: <span className="h4">Success!</span>,
          body: <p>We've created a Zip file with all your logs</p>,
          css: 'emumodal--xs',
        };
      } else {
        modalData = {
          active: true,
          header: <span className="h4">Error!</span>,
          body: (
            <p>
              There was an issue getting your logs, please collect them manually
              from the emudeck folder in your user folder.
            </p>
          ),
          css: 'emumodal--xs',
        };
      }
      setStatePage({ ...statePage, modal: modalData });
    });
  };

  const openWiki = () => {
    let url;

    system === 'win32'
      ? (url = 'https://emudeck.github.io/known-issues/windows/')
      : (url = 'https://emudeck.github.io/?search=true');

    window.open(url, '_blank');
  };

  const uninstall = () => {
    if (system === 'win32') {
      ipcChannel.sendMessage(
        'emudeck',
        'powershell -ExecutionPolicy Bypass -NoProfile -File "$env:APPDATA/EmuDeck/backend/uninstall.ps1"'
      );
    } else {
      ipcChannel.sendMessage(
        'bash',
        'bash "~/.config/EmuDeck/backend/uninstall.sh"'
      );
    }
  };

  const openSRM = () => {
    let modalData = {
      active: true,
      header: <span className="h4">Launching Steam Rom Manager</span>,
      body: (
        <p>
          We will close Steam if its running and then Steam Rom Manager will
          open, this could take a few seconds, please wait.
        </p>
      ),
      footer: <ProgressBar css="progress--success" infinite max="100" />,
      css: 'emumodal--xs',
    };

    if (system === 'win32') {
      setStatePage({ ...statePage, modal: modalData });
      ipcChannel.sendMessage(
        'emudeck',
        'powershell -ExecutionPolicy Bypass -NoProfile -File "$toolsPath/launchers/srm/steamrommanager.ps1"'
      );
    } else if (system !== 'darwin') {
      setStatePage({ ...statePage, modal: modalData });
      ipcChannel.sendMessage(
        'emudeck',
        '"$toolsPath/launchers/srm/steamrommanager.sh"'
      );
    } else {
      modalData = {
        active: true,
        header: <span className="h4">Launching Steam Rom Manager</span>,
        body: (
          <>
            <p>
              We will close Steam if its running and then Steam Rom Manager will
              open, this could take a few seconds, please wait.
            </p>
            <strong>
              Desktop controls will temporarily revert to touch/trackpad/L2/R2.
            </strong>
          </>
        ),
        footer: <ProgressBar css="progress--success" infinite max="100" />,
        css: 'emumodal--sm',
      };
      setStatePage({ ...statePage, modal: modalData });
      ipcChannel.sendMessage(
        'emudeck',
        '"$toolsPath/launchers/srm/steamrommanager.sh"'
      );
    }
    const timerId = setTimeout(() => {
      setStatePage({
        ...statePage,
        modal: {
          active: false,
        },
      });
      clearTimeout(timerId);
    }, 30000);
  };

  const selectMode = (value) => {
    setState({ ...state, mode: value });
    navigate('/rom-storage');
  };

  const showLog = () => {
    if (system === 'win32') {
      ipcChannel.sendMessage('bash-nolog', [
        `start powershell -NoExit -ExecutionPolicy Bypass -command "& { Get-Content $env:USERPROFILE/emudeck/logs/git-pull.log -Tail 100 -Wait }"`,
      ]);
    } else if (system === 'darwin') {
      ipcChannel.sendMessage('bash-nolog', [
        `osascript -e 'tell app "Terminal" to do script "clear && tail -f $HOME/emudeck/logs/git-pull.log"'`,
      ]);
    } else {
      ipcChannel.sendMessage('bash-nolog', [
        `konsole -e tail -f "$HOME/emudeck/logs/git-pull.log"`,
      ]);
    }
  };

  let updateTimeOut;
  // Darwin terminal permissions
  useEffect(() => {
    if (system === 'darwin' && second === false) {
      ipcChannel.sendMessage('bash-nolog', [
        `osascript -e 'tell app "Terminal" to do script "pwd && exit"'`,
      ]);
    }
  }, [system]);

  useEffect(() => {
    // Update timeout + Force clone check

    updateTimeOut = setTimeout(() => {
      setStatePage({
        ...statePage,
        update: 'up-to-date',
      });
      updateFiles();
    }, 10000);

    if (navigator.onLine) {
      ipcChannel.sendMessage('update-check');

      ipcChannel.once('update-check-out', (message) => {
        // We clear the timeout
        clearTimeout(updateTimeOut);

        let modalData;
        if (message[0] == 'updating') {
          modalData = {
            active: true,
            header: <span className="h4">🎉 Update found! 🎉</span>,
            body: (
              <p className="h5">
                EmuDeck will restart as soon as it finishes the update. Hold on
                tight.
              </p>
            ),
            footer: <ProgressBar css="progress--success" infinite max="100" />,
            css: 'emumodal--xs emumodal--loading',
          };
        }

        setStatePage({
          ...statePage,
          update: message[0],
          data: message[1],
          modal: modalData,
        });
        if (message[0] === 'up-to-date') {
          updateFiles();
        } else {
        }
      });
    } else {
      clearTimeout(updateTimeOut);
      setStatePage({
        ...statePage,
        update: 'up-to-date',
      });
    }

    const updateFiles = () => {
      const currentVersions = JSON.parse(
        localStorage.getItem('current_versions_beta')
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
        delete settingsStorage.installEmus.primehacks;
        delete settingsStorage.installEmus.melonDS;
        delete settingsStorage.installEmus.cemunative;
        delete settingsStorage.overwriteConfigEmus.primehacks;
        const installEmusStored = settingsStorage.installEmus;

        if (system === 'darwin') {
          delete settingsStorage.installEmus.ares;
          delete settingsStorage.installEmus.cemu;
          delete settingsStorage.installEmus.citra;
          delete settingsStorage.installEmus.dolphin;
          delete settingsStorage.installEmus.duckstation;
          delete settingsStorage.installEmus.flycast;
          delete settingsStorage.installEmus.mame;
          delete settingsStorage.installEmus.melonds;
          delete settingsStorage.installEmus.mgba;
          delete settingsStorage.installEmus.pcsx2;
          delete settingsStorage.installEmus.ppsspp;
          delete settingsStorage.installEmus.primehack;
          delete settingsStorage.installEmus.rmg;
          delete settingsStorage.installEmus.rpcs3;
          delete settingsStorage.installEmus.ryujinx;
          delete settingsStorage.installEmus.scummvm;
          delete settingsStorage.installEmus.vita3k;
          delete settingsStorage.installEmus.xemu;
          delete settingsStorage.installEmus.xenia;
          delete settingsStorage.installEmus.yuzu;

          delete settingsStorage.overwriteConfigEmus.ares;
          delete settingsStorage.overwriteConfigEmus.cemu;
          delete settingsStorage.overwriteConfigEmus.citra;
          delete settingsStorage.overwriteConfigEmus.dolphin;
          delete settingsStorage.overwriteConfigEmus.duckstation;
          delete settingsStorage.overwriteConfigEmus.flycast;
          delete settingsStorage.overwriteConfigEmus.mame;
          delete settingsStorage.overwriteConfigEmus.melonds;
          delete settingsStorage.overwriteConfigEmus.mgba;
          delete settingsStorage.overwriteConfigEmus.pcsx2;
          delete settingsStorage.overwriteConfigEmus.ppsspp;
          delete settingsStorage.overwriteConfigEmus.primehack;
          delete settingsStorage.overwriteConfigEmus.rmg;
          delete settingsStorage.overwriteConfigEmus.rpcs3;
          delete settingsStorage.overwriteConfigEmus.ryujinx;
          delete settingsStorage.overwriteConfigEmus.scummvm;
          delete settingsStorage.overwriteConfigEmus.vita3k;
          delete settingsStorage.overwriteConfigEmus.xemu;
          delete settingsStorage.overwriteConfigEmus.xenia;
          delete settingsStorage.overwriteConfigEmus.yuzu;
        }

        if (!settingsStorage.overwriteConfigEmus.esde) {
          settingsStorage.overwriteConfigEmus.esde = {
            esde: { id: 'esde', status: true, name: 'EmulationStation DE' },
          };
        }

        if (settingsStorage.emulatorAlternative.nds === 'melonDS') {
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

        console.log(settingsStorage.emulatorAlternative.nds);

        // Theres probably a better way to do this...

        ipcChannel.sendMessage('version');

        ipcChannel.once('version-out', (version) => {
          ipcChannel.sendMessage('system-info-in');
          ipcChannel.once('system-info-out', (platform) => {
            console.log({
              system: platform,
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
          ipcChannel.once('system-info-out', (platform) => {
            console.log({
              system: platform,
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
              systemName: systemNameValue,
              version: version[0],
              gamemode: version[1],
              branch,
            });
          });
        });
      }
    };

    // ipcChannel.sendMessage('clean-log');

    //  setTimeout(() => {

    // ipcChannel.sendMessage('update-check');

    // ipcChannel.once('update-check-out', (message) => {
    //
    //
    //   setStatePage({
    //     ...statePage,
    //     update: message[0],
    //     data: message[1],
    //   });
    // });

    //  }, 500);
  }, []);

  useEffect(() => {
    //
    // Cloning project
    //

    // Force changelog after update
    if (update === 'updating') {
      localStorage.setItem('show_changelog', true);
    }
    if (update === 'up-to-date') {
      // is the git repo cloned?

      const modalDataGit = {
        active: true,
        header: (
          <span className="h4">
            Building EmuDeck backend and running autodiagnostics in the
            background...
          </span>
        ),
        body: <ProgressBar css="progress--success" infinite max="100" />,
        footer: (
          <BtnSimple
            css="btn-simple--1"
            type="button"
            aria="Show log"
            disabled={false}
            style={{ marginBottom: 0 }}
            onClick={() => showLog()}
          >
            Open detailed log
          </BtnSimple>
        ),
        css: 'emumodal--xs emumodal--loading',
      };

      // setStatePage({
      //   ...statePage,
      //   modal: modalDataGit,
      // });

      ipcChannel.sendMessage('check-git');
      ipcChannel.once('check-git', (error, stdout, stderr) => {
        // alert('checking git');
        console.log({ error, stdout, stderr });
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
  }, [update]);

  useEffect(() => {
    // settings here
    if (cloned === false) {
      // alert('cloneFalse');
      if (navigator.onLine) {
        ipcChannel.sendMessage(`clone`, branch);

        ipcChannel.once('clone', (error, cloneStatusClone, stderr) => {
          if (cloneStatusClone.includes('true')) {
            setStatePage({ ...statePage, downloadComplete: true });
          }
        });
      } else {
        const modalData = {
          active: true,
          header: <span className="h4">Ooops 😞</span>,
          body: <p>You need to be connected to the internet.</p>,
          css: 'emumodal--xs emumodal--loading',
        };
        setStatePage({
          ...statePage,
          modal: modalData,
        });
      }
    } else if (cloned === true) {
      // alert('cloned true');
      if (navigator.onLine) {
        // alert(branch);
        ipcChannel.sendMessage('pull', branch);

        ipcChannel.once('pull', (error, stdout, stderr) => {
          // alert(error, stdout, stderr);
          console.log({ error, stdout, stderr });
          setStatePage({ ...statePage, downloadComplete: true });
          // Update timeout
        });
      } else {
        // alert('cloned desconocido');
        setStatePage({ ...statePage, downloadComplete: true });
      }
    }
  }, [cloned]);

  useEffect(() => {
    if (downloadComplete === true) {
      if (second) {
        navigate('/emulators');
      } else {
        navigate('/welcome');
      }
    }
  }, [downloadComplete]);

  // GamePad
  const domElementsRef = useRef(null);
  const domElementsCur = domElementsRef.current;
  let domElements;
  useEffect(() => {
    if (domElementsCur && dom === undefined) {
      domElements = domElementsCur.querySelectorAll('button');
      setStatePage({ ...statePage, dom: domElements });
    }
  }, [statePage]);

  const functions = {
    openSRM,
    openCSM,
    getLogs,
    navigate,
    openWiki,
    uninstall,
  };

  const settingsCards = [
    {
      icon: [iconGear],
      iconFlat: 'gear',
      title: 'Quick Settings',
      description:
        'Customize bezels, shaders, aspect ratio, auto save, and more',
      button: 'Configure',
      btnCSS: 'btn-simple--1',
      status: true,
      function: () => functions.navigate('/settings'),
    },
    {
      icon: [iconGear],
      iconFlat: 'gear',
      title: 'Manage Emulators',
      description: 'Manage and update your Emulators and configurations',
      button: 'Update',
      btnCSS: 'btn-simple--1',
      status: true,
      function: () => functions.navigate('/emulators'),
    },
    {
      icon: [iconPackage],
      iconFlat: 'package',
      title: 'EmuDeck Store',
      description: 'Download free non-commercial homebrew games',
      button: 'Get free games',
      btnCSS: 'btn-simple--1',
      status: true,
      function: () => functions.navigate('/store-front'),
    },
    {
      icon: [iconHelp],
      iconFlat: 'help',
      title: 'Help',
      description: 'Having problems running EmuDeck?',
      button: 'Read the wiki',
      btnCSS: 'btn-simple--1',
      status: true,
      function: () => functions.openWiki(),
    },
    {
      icon: [iconPrize],
      iconFlat: 'prize',
      title: 'Early Access',
      description:
        'Support EmuDeck on Patreon and get early access to our latest features',
      button: 'Donate',
      btnCSS: 'btn-simple--3',
      status: branch !== 'early',
      type: 'link',
      href: 'https://www.patreon.com/bePatron?u=29065992',
      function: () => {},
    },
    {
      icon: [iconJoystick],
      iconFlat: 'joystick',
      title: 'Steam ROM Manager',
      description: 'Add emulators, tools, or ROMs to your Steam Library',
      button: 'Launch',
      btnCSS: 'btn-simple--5',
      status: true,
      function: () => functions.openSRM(),
    },
    {
      icon: [iconDisk],
      iconFlat: 'disk',
      title: 'USB Transfer Wizard',
      description: 'Transfer your games using a USB Drive',
      button: 'Add more games',
      btnCSS: 'btn-simple--1',
      status: !!(
        systemName === 'SteamOS' ||
        systemName === 'Linux' ||
        systemName === 'Chimera'
      ),
      function: () => functions.navigate('/copy-games'),
    },
    {
      icon: [iconQuick],
      iconFlat: 'quick',
      title: 'Quick Reset',
      description:
        'Update or reset your installation to the latest EmuDeck version in one easy click',
      button: 'Reinstall',
      btnCSS: 'btn-simple--5',
      status: true,
      function: () => selectMode('easy'),
    },
    {
      icon: [iconCustom],
      iconFlat: 'custom',
      title: 'Custom Reset',
      description:
        'Update or reset your installation to the latest EmuDeck version in custom mode',
      button: 'Reinstall',
      btnCSS: 'btn-simple--5',
      status: true,
      function: () => selectMode('expert'),
    },
    {
      status: 'separator',
      title: 'Other Settings',
    },
    {
      icon: [iconScreen],
      iconFlat: 'screen',
      title: 'Screen Resolution',
      description: 'Upscale your emulators resolution',
      button: 'More info',
      btnCSS: 'btn-simple--5',
      status: system !== 'darwin',
      function: () => functions.navigate('/change-resolution'),
    },
    {
      icon: [iconPrize],
      iconFlat: 'prize',
      title: 'RetroAchievements',
      description:
        'Configure RetroAchievements for Duckstation, PCSX2, and RetroArch',
      button: 'More info',
      btnCSS: 'btn-simple--5',
      status: system !== 'darwin',
      function: () => functions.navigate('/RA-achievements-config'),
    },

    {
      status: 'separator',
      title: 'EmuDeck Exclusive Tools',
    },

    {
      icon: [iconCompress],
      iconFlat: 'compress',
      title: 'EmuDeck Compressor',
      description: 'Compress your ROMs to optimize your storage',
      button: 'More info',
      btnCSS: 'btn-simple--5',
      status: !(system === 'win32' || system === 'darwin'),
      function: () => functions.navigate('/chd-tool'),
    },
    {
      icon: [iconChecker],
      iconFlat: 'checker',
      title: 'BIOS Checker',
      description: 'Use the EmuDeck BIOS Checker to validate your BIOS',
      button: 'More info',
      btnCSS: 'btn-simple--5',
      status: true,
      function: () => functions.navigate('/check-bios'),
    },

    {
      icon: [iconCloud],
      iconFlat: 'cloud',
      title: 'Cloud Saves',
      description: 'Sync or backup your saves and save states to the cloud',
      button: 'More info',
      btnCSS: 'btn-simple--5',
      status: true,
      function: () => functions.navigate('/cloud-sync/welcome'),
    },

    {
      icon: [iconMigrate],
      iconFlat: 'migrate',
      title: 'Migrate Installation',
      description:
        'Migrate your EmuDeck installation to your SD Card or vice versa',
      button: 'More info',
      btnCSS: 'btn-simple--5',
      status:
        system === 'win32' || system === 'darwin'
          ? false
          : !!(
              systemName === 'SteamOS' ||
              systemName === 'Linux' ||
              systemName === 'Chimera'
            ),
      function: () => functions.navigate('/migration'),
    },

    {
      icon: [iconPlugin],
      iconFlat: 'plugin',
      title: 'EmuDecky',
      description:
        'Plugin to easily view emulator hotkeys and configure EmuDeck in Gaming Mode',
      button: 'More info',
      btnCSS: 'btn-simple--5',
      status: system !== 'win32' || system !== 'darwin',
      function: () => functions.navigate('/decky-controls'),
    },

    {
      status: system !== 'win32' || system !== 'darwin' ? 'separator' : false,
      title: 'Third Party tools',
    },

    {
      icon: [iconCustom],
      iconFlat: 'custom',
      title: 'Online Multiplayer',
      description: 'Play your emulators over internet with your friends',
      button: 'Install',
      btnCSS: 'btn-simple--5',
      status: false,
      function: () => functions.navigate('/remote-play-whatever'),
    },
    {
      icon: [iconPlugin],
      iconFlat: 'plugin',
      title: 'Gyroscope',
      description: 'Enable your Steam Deck gyroscope in emulation',
      button: 'More info',
      btnCSS: 'btn-simple--5',
      status: system === 'SteamOS',
      function: () => functions.navigate('/gyrodsu'),
    },
    {
      icon: [iconPlugin],
      iconFlat: 'plugin',
      title: 'Power Tools',
      description:
        'A Decky Loader Plugin to manage performance settings in Game Mode',
      button: 'More info',
      btnCSS: 'btn-simple--5',
      status: system === 'SteamOS',
      function: () => functions.navigate('/power-tools'),
    },
    {
      status: 'separator',
      title: 'Other stuff',
    },
    {
      icon: [iconPrize],
      iconFlat: 'prize',
      title: 'Get Early Access',
      description:
        'Support EmuDeck on Patreon and get early access to our latest features',
      button: 'Donate',
      btnCSS: 'btn-simple--3',
      status: !branch.includes('early'),
      type: 'link',
      href: 'https://www.patreon.com/bePatron?u=29065992',
      function: () => {},
    },
    {
      icon: [iconDoc],
      iconFlat: 'doc',
      title: 'Get Log files',
      description: 'Send us your logs if you have issues',
      button: 'Create Zip',
      btnCSS: 'btn-simple--5',
      status: true,
      function: () => functions.getLogs(),
    },
    {
      icon: [iconList],
      iconFlat: 'list',
      title: 'ChangeLog',
      description: 'Read about the latest changes to EmuDeck',
      button: 'Read',
      btnCSS: 'btn-simple--5',
      status: true,
      function: () => functions.navigate('/change-log'),
    },

    {
      icon: [iconCloud],
      iconFlat: 'cloud',
      title: 'Cloud Services',
      description: 'Manage your cloud services, Xbox Cloud Gaming, and more!',
      button: 'More info',
      btnCSS: 'btn-simple--5',
      status: !(system === 'win32' || system === 'darwin'),
      function: () => functions.openCSM(),
    },
    {
      icon: [iconUninstall],
      iconFlat: 'uninstall',
      title: 'Uninstall',
      description: 'Uninstall EmuDeck from your system',
      button: 'Uninstall',
      btnCSS: 'btn-simple--3',
      status: system !== 'darwin',
      function: () => functions.uninstall(),
    },
  ];

  return (
    <div style={{ height: '100vh' }} ref={domElementsRef}>
      {dom !== undefined && <GamePad elements={dom} />}
      <Wrapper data={settingsCards} functions={functions} aside={false}>
        <Kamek />
        <Header title="EmuDeck is loading..." />
        <EmuModal modal={modal} />
      </Wrapper>
    </div>
  );
}

export default CheckUpdatePage;
