import React, {
  useEffect,
  useState,
  useContext,
  useRef,
  useCallback,
} from 'react';
import { GlobalContext } from 'context/globalContext';
import GamePad from 'components/organisms/GamePad/GamePad';
import Wrapper from 'components/molecules/Wrapper/Wrapper';
import Header from 'components/organisms/Header/Header';
import Footer from 'components/organisms/Footer/Footer';
import EmuModal from 'components/molecules/EmuModal/EmuModal';

import ProgressBar from 'components/atoms/ProgressBar/ProgressBar';
import { useNavigate } from 'react-router-dom';
import { BtnSimple } from 'getbasecore/Atoms';

// import { useTranslation } from 'react-i18next';
import Welcome from 'components/organisms/Wrappers/Welcome';
import {
  iconSuccess,
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
} from 'components/utils/images/images';

function WelcomePage() {
  // const { t } = useTranslation();
  const ipcChannel = window.electron.ipcRenderer;
  const { state, setState, stateCurrentConfigs, setStateCurrentConfigs } =
    useContext(GlobalContext);
  const { system, systemName, mode, second, storagePath, gamemode, branch } =
    state;
  const [statePage, setStatePage] = useState({
    disabledNext: true,
    disabledBack: true,
    downloadComplete: !navigator.onLine ? true : null,
    updates: null,
    cloned: null,
    data: '',
    modal: undefined,
    dom: undefined,
  });
  const { disabledNext, disabledBack, updates, modal, dom } = statePage;

  const navigate = useNavigate();
  const selectMode = (value) => {
    setState({ ...state, mode: value });
    if (second) {
      navigate('/rom-storage');
    }
  };

  const closeModal = () => {
    const modalData = { active: false };
    setStatePage({
      ...statePage,
      modal: modalData,
    });
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

  const sleep = (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
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

  // show changelog after update

  useEffect(() => {
    if (systemName === 'ERROR') {
      const modalData = {
        active: true,
        header: (
          <span className="h4">Error detecting your Operating System</span>
        ),
        body: (
          <>
            <p>Click on the Close button to try again</p>
            <p>
              If the issue persists, please contact us on Discord:
              https://discord.com/invite/b9F7GpXtFP
            </p>
          </>
        ),
        footer: '',
        css: 'emumodal--xs',
      };
      setStatePage({ ...statePage, modal: modalData });
    }
  }, [modal]);

  useEffect(() => {
    let modalData;

    const showChangelog = localStorage.getItem('show_changelog');
    console.log({ system });
    console.log({ showChangelog });
    if (showChangelog === true) {
      navigate('/change-log');
    }

    // Build games for the store
    ipcChannel.sendMessage('build-store');
    ipcChannel.once('build-store', (response) => {
      console.log({ response });
    });

    ipcChannel.sendMessage('check-versions');
    ipcChannel.once('check-versions', (repoVersions) => {
      // No versioning found, what to do?
      if (repoVersions === '') {
        console.log('no versioning found');
      }

      if (second === true) {
        // Thanks chatGPT lol
        const obj1 = repoVersions;
        const obj2 = stateCurrentConfigs;

        const differences = {};

        for (const key in obj1) {
          if (JSON.stringify(obj1[key]) !== JSON.stringify(obj2[key])) {
            differences[key] = obj1[key];
          }
        }

        if (Object.keys(differences).length > 0) {
          setStatePage({ ...statePage, updates: true, modal: modalData });
        }

        const json = JSON.stringify(repoVersions);
        localStorage.removeItem('current_versions_beta');
        localStorage.setItem('current_versions_beta', json);

        localStorage.setItem('ogStateAlternative', '');
        localStorage.setItem('ogStateEmus', '');

        setStateCurrentConfigs(repoVersions);
      } else if (showChangelog === null && branch === 'beta') {
        modalData = {
          active: true,
          header: <span className="h4">Welcome to EmuDeck's public beta!</span>,
          body: (
            <>
              <p>
                This build has some unstable features that are not yet present
                in the public build so some bugs are expected.
              </p>
              <p>
                But it's still missing some exclusive features that are only
                available in our <strong>Early Access</strong> program in
                Patreon, like exclusive support forums or{' '}
                <strong>CloudSync</strong> that allows you to sync your saved
                games seamessly over the cloud between different EmuDeck and
                even other platform like OnionOS, local multiplayer,
                interoperability with other platforms, and more things to come!
              </p>
            </>
          ),
          css: 'emumodal--sm',
          footer: (
            <>
              <BtnSimple
                css="btn-simple--1"
                type="link"
                aria="Next"
                href="https://www.patreon.com/bePatron?u=29065992"
              >
                Check Patron
              </BtnSimple>
              <BtnSimple
                css="btn-simple--1"
                type="button"
                aria="Next"
                onClick={() => closeModal()}
              >
                Close
              </BtnSimple>
            </>
          ),
        };
        setStatePage({ ...statePage, modal: modalData });
      }
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (mode != null) {
      setStatePage({ ...statePage, disabledNext: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

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

  const migrationFixSDPaths = () => {
    ipcChannel.sendMessage('emudeck', [`SDPaths|||Migration_fix_SDPaths`]);
    ipcChannel.once('SDPaths', (message) => {
      let modalData;
      message.includes('true')
        ? (modalData = {
            active: true,
            header: <span className="h4">Success!</span>,
            body: <p>Paths fixed</p>,
            css: 'emumodal--xs',
          })
        : (modalData = {
            active: true,
            header: <span className="h4">Ooops 😞</span>,
            body: (
              <p>
                There was an error trying to fix your paths. If the problem
                persist rerun SteamRomManager to fix them
              </p>
            ),
            css: 'emumodal--xs',
          });

      setStatePage({ ...statePage, modal: modalData });
    });
  };

  const functions = {
    openSRM,
    openCSM,
    getLogs,
    navigate,
    migrationFixSDPaths,
    openWiki,
    uninstall,
  };

  const settingsCardsFeatured = [
    {
      icon: [iconGear],
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
      title: 'Manage Emulators',
      description: 'Manage and update your Emulators and configurations',
      button: 'Update',
      btnCSS: 'btn-simple--1',
      status: true,
      function: () => functions.navigate('/emulators'),
    },
    {
      icon: [iconPackage],
      title: 'EmuDeck Store',
      description: 'Download free non-commercial homebrew games',
      button: 'Get free games',
      btnCSS: 'btn-simple--1',
      status: true,
      function: () => functions.navigate('/store-front'),
    },
    {
      icon: [iconHelp],
      title: 'Help',
      description: 'Having problems running EmuDeck?',
      button: 'Read the wiki',
      btnCSS: 'btn-simple--1',
      status: true,
      function: () => functions.openWiki(),
    },
  ];

  let settingsCards;

  settingsCards = [
    {
      icon: [iconPrize],
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
      title: 'Steam ROM Manager',
      description: 'Add emulators, tools, or ROMs to your Steam Library',
      button: 'Launch',
      btnCSS: 'btn-simple--5',
      status: true,
      function: () => functions.openSRM(),
    },
    {
      icon: [iconDisk],
      title: 'USB Transfer Wizard',
      description: 'Transfer your games using a USB Drive',
      button: 'Add more games',
      btnCSS: 'btn-simple--1',
      status:
        system === 'win32' && system === 'darwin'
          ? false
          : systemName === 'SteamOS' ||
            systemName === 'Linux' ||
            systemName === 'Chimera'
          ? true
          : 'disabled',
      function: () => functions.navigate('/copy-games'),
    },
    {
      icon: [iconQuick],
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
      title: 'Screen Resolution',
      description: 'Upscale your emulators resolution',
      button: 'More info',
      btnCSS: 'btn-simple--5',
      status: true,
      function: () => functions.navigate('/change-resolution'),
    },
    {
      icon: [iconPrize],
      title: 'RetroAchievements',
      description:
        'Configure RetroAchievements for Duckstation, PCSX2, and RetroArch',
      button: 'More info',
      btnCSS: 'btn-simple--5',
      status: true,
      function: () => functions.navigate('/RA-achievements-config'),
    },

    {
      status: 'separator',
      title: 'EmuDeck Exclusive Tools',
    },

    {
      icon: [iconCompress],
      title: 'EmuDeck Compressor',
      description: 'Compress your ROMs to optimize your storage',
      button: 'More info',
      btnCSS: 'btn-simple--5',
      status:
        system === 'win32' && system === 'darwin'
          ? false
          : systemName === 'SteamOS' ||
            systemName === 'Linux' ||
            systemName === 'Chimera'
          ? true
          : 'disabled',
      function: () => functions.navigate('/chd-tool'),
    },
    {
      icon: [iconSuccess],
      title: 'BIOS Checker',
      description: 'Use the EmuDeck BIOS Checker to validate your BIOS',
      button: 'More info',
      btnCSS: 'btn-simple--5',
      status: true,
      function: () => functions.navigate('/check-bios'),
    },

    {
      icon: [iconCloud],
      title: 'Cloud Saves',
      description: 'Sync or backup your saves and save states to the cloud',
      button: 'More info',
      btnCSS: 'btn-simple--5',
      status: branch.includes('early') || branch === 'dev' ? true : 'early',
      function: () => functions.navigate('/cloud-sync/welcome'),
    },

    {
      icon: [iconMigrate],
      title: 'Migrate Installation',
      description:
        'Migrate your EmuDeck installation to your SD Card or vice versa',
      button: 'More info',
      btnCSS: 'btn-simple--5',
      status:
        system === 'win32' && system === 'darwin'
          ? false
          : systemName === 'SteamOS' ||
            systemName === 'Linux' ||
            systemName === 'Chimera'
          ? true
          : 'disabled',
      function: () => functions.navigate('/migration'),
    },

    {
      icon: [iconPlugin],
      title: 'EmuDecky',
      description:
        'Plugin to easily view emulator hotkeys and configure EmuDeck in Gaming Mode',
      button: 'More info',
      btnCSS: 'btn-simple--5',
      status: system !== 'win32',
      function: () => functions.navigate('/decky-controls'),
    },

    {
      status: system !== 'win32' ? 'separator' : false,
      title: 'Third Party tools',
    },

    {
      icon: [iconCustom],
      title: 'Online Multiplayer',
      description: 'Play your emulators over internet with your friends',
      button: 'Install',
      btnCSS: 'btn-simple--5',
      status: false,
      function: () => functions.navigate('/remote-play-whatever'),
    },
    {
      icon: [iconPlugin],
      title: 'Gyroscope',
      description: 'Enable your Steam Deck gyroscope in emulation',
      button: 'More info',
      btnCSS: 'btn-simple--5',
      status: system === 'SteamOS',
      function: () => functions.navigate('/gyrodsu'),
    },
    {
      icon: [iconPlugin],
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
      title: 'Get Log files',
      description: 'Send us your logs if you have issues',
      button: 'Create Zip',
      btnCSS: 'btn-simple--5',
      status: true,
      function: () => functions.getLogs(),
    },
    {
      icon: [iconList],
      title: 'ChangeLog',
      description: 'Read about the latest changes to EmuDeck',
      button: 'Read',
      btnCSS: 'btn-simple--5',
      status: true,
      function: () => functions.navigate('/change-log'),
    },

    {
      icon: [iconCloud],
      title: 'Cloud Services Manager',
      description: 'Manage your cloud services, Xbox Cloud Gaming, and more!',
      button: 'More info',
      btnCSS: 'btn-simple--5',
      status:
        system === 'win32' && system === 'darwin'
          ? false
          : systemName === 'SteamOS' ||
            systemName === 'Linux' ||
            systemName === 'Chimera'
          ? true
          : 'disabled',
      function: () => functions.openCSM(),
    },
    {
      icon: [iconUninstall],
      title: 'Uninstall',
      description: 'Uninstall EmuDeck from your system',
      button: 'Uninstall',
      btnCSS: 'btn-simple--3',
      status: system !== 'darwin',
      function: () => functions.uninstall(),
    },
  ];

  if (system === 'darwin') {
    settingsCards = [
      {
        icon: [iconJoystick],
        title: 'Steam ROM Manager',
        description: 'Add emulators, tools, or ROMs to your Steam Library',
        button: 'Launch',
        btnCSS: 'btn-simple--5',
        status: 'true',
        function: () => functions.openSRM(),
      },
      {
        icon: [iconQuick],
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
        title: 'Custom Reset',
        description:
          'Update or reset your installation to the latest EmuDeck version in custom mode',
        button: 'Reinstall',
        btnCSS: 'btn-simple--5',
        status: true,
        function: () => selectMode('expert'),
      },
      {
        icon: [iconSuccess],
        title: 'BIOS Checker',
        description: 'Use the EmuDeck BIOS Checker to validate your BIOS',
        button: 'More info',
        btnCSS: 'btn-simple--5',
        status: true,
        function: () => functions.navigate('/check-bios'),
      },
      {
        icon: [iconPrize],
        title: 'RetroAchievements',
        description:
          'Configure RetroAchievements for Duckstation, PCSX2, and RetroArch',
        button: 'More info',
        btnCSS: 'btn-simple--5',
        status: true,
        function: () => functions.navigate('/RA-achievements-config'),
      },
      {
        icon: [iconList],
        title: 'ChangeLog',
        description: 'Read about the latest changes to EmuDeck',
        button: 'Read',
        btnCSS: 'btn-simple--5',
        status: true,
        function: () => functions.navigate('/change-log'),
      },
    ];
  }

  // GamePad
  const domElementsRef = useRef(null);
  const domElementsCur = domElementsRef.current;
  let domElements;

  useEffect(() => {
    if (dom === undefined) {
      domElements = document.querySelectorAll('button');
      setStatePage({
        ...statePage,
        dom: domElements,
      });
    }
  }, [statePage]);

  return (
    <div style={{ height: '100vh' }} ref={domElementsRef}>
      {dom !== undefined && <GamePad elements={dom} />}
      <Wrapper>
        {second === false && (
          <Header title={`Welcome to EmuDeck for ${systemName}`} />
        )}

        {second === true && (
          <Header title={`Welcome back to EmuDeck for ${systemName}`} />
        )}
        {systemName !== 'ERROR' && (
          <Welcome
            settingsCards={settingsCards}
            settingsCardsFeatured={settingsCardsFeatured}
            functions={functions}
            updates={updates}
            alert={
              second
                ? ``
                : 'Do you need help installing EmuDeck for the first time? <a href="https://youtu.be/Y5r2WZAImuY" target="_blank">Check out this guide</a>'
            }
            alertCSS="alert--info"
            onClick={selectMode}
          />
        )}
        {second === false && systemName !== 'ERROR' && (
          <Footer
            back={second ? 'tools-and-stuff' : false}
            backText={second ? 'Tools & stuff' : 'Install EmuDeck First'}
            third={system !== 'win32' ? 'change-log' : ''}
            thirdText="See changelog"
            fourthText="Exit EmuDeck"
            next="rom-storage"
            exit={gamemode}
            disabledNext={second ? false : disabledNext}
            disabledBack={second ? false : disabledBack}
          />
        )}
        <EmuModal modal={modal} />
      </Wrapper>
    </div>
  );
}

export default WelcomePage;
