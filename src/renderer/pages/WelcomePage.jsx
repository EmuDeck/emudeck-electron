import React, { useEffect, useState, useContext, useRef } from 'react';
import { GlobalContext } from 'context/globalContext';
import GamePad from 'components/organisms/GamePad/GamePad';
import Wrapper from 'components/molecules/Wrapper/Wrapper';
import Header from 'components/organisms/Header/Header';
import Footer from 'components/organisms/Footer/Footer';
import EmuModal from 'components/molecules/EmuModal/EmuModal';
import ProgressBar from 'components/atoms/ProgressBar/ProgressBar';
import { useNavigate } from 'react-router-dom';

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
} from 'components/utils/images/images';

function WelcomePage() {
  // const { t } = useTranslation();
  const ipcChannel = window.electron.ipcRenderer;
  const { state, setState, stateCurrentConfigs, setStateCurrentConfigs } =
    useContext(GlobalContext);
  const { system, mode, second, storagePath, gamemode, branch } = state;
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

  const sleep = (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };

  const openSRM = () => {
    let modalData = {
      active: true,
      header: <span className="h4">Launching Steam Rom Manager</span>,
      body: (
        <>
          <p>
            We will close Steam if its running and then Steam Rom Manager will
            open, this could take a few seconds, please wait.
          </p>
        </>
      ),
      footer: <ProgressBar css="progress--success" infinite={true} max="100" />,
      css: 'emumodal--xs',
    };

    if (system === 'win32') {
      setStatePage({ ...statePage, modal: modalData });
      ipcChannel.sendMessage('emudeck', [`PS3Folders|||RPCS3_renameFolders`]);
      ipcChannel.sendMessage('bash', [`taskkill /IM steam.exe /F`]);
      let srmPath;
      if (storagePath === '' || !storagePath || storagePath === null) {
        srmPath = 'C:\\';
      } else {
        srmPath = storagePath;
      }
      ipcChannel.sendMessage('run-app', `${srmPath}Emulation\\tools\\srm.exe`);
    } else if (system === 'darwin') {
      setStatePage({ ...statePage, modal: modalData });
      ipcChannel.sendMessage('bash', [`killall steam`]);
      ipcChannel.sendMessage('run-app', `/Applications/Steam Rom Manager.app`);
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
        footer: (
          <ProgressBar css="progress--success" infinite={true} max="100" />
        ),
        css: 'emumodal--sm',
      };
      setStatePage({ ...statePage, modal: modalData });
      ipcChannel.sendMessage('bash', [`kill -15 $(pidof steam`]);
      ipcChannel.sendMessage(
        'run-app',
        `${storagePath}/Emulation/tools/srm/Steam-ROM-Manager.AppImage`
      );
    }
    ipcChannel.once('run-app', (message) => {
      console.log({ message });
      if (message.includes('launched')) {
        const timerId = setTimeout(() => {
          setStatePage({
            ...statePage,
            modal: {
              active: false,
            },
          });
          clearTimeout(timerId);
        }, 5000);
      } else {
        setStatePage({
          ...statePage,
          modal: {
            active: false,
          },
        });
      }
    });
  };

  // show changelog after update
  useEffect(() => {
    const showChangelog = localStorage.getItem('show_changelog');

    if (showChangelog === 'true') {
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
          setStatePage({ ...statePage, updates: true });
        }
      } else {
        const json = JSON.stringify(repoVersions);
        localStorage.removeItem('current_versions_beta');
        localStorage.setItem('current_versions_beta', json);

        setStateCurrentConfigs(repoVersions);
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

  const sprunge = () => {
    ipcChannel.sendMessage('bash', [
      `sprunge|||cat ~/emudeck/emudeck.log | curl -F 'sprunge=<-' http://sprunge.us`,
    ]);
    ipcChannel.once('sprunge', (message) => {
      prompt('Copy this url:', `${message}`);
    });
  };

  const openWiki = () => {
    let url;
    {
      system === 'win32'
        ? (url = 'https://emudeck.github.io/common-issues/windows/')
        : (url = 'https://emudeck.github.io/?search=true');
    }

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
    sprunge,
    navigate,
    migrationFixSDPaths,
    openWiki,
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
      status: system === 'SteamOS',
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
      title: 'Power Tools',
      description:
        'A Decky Loader Plugin to manage performance settings in Game Mode',
      button: 'More info',
      btnCSS: 'btn-simple--5',
      status: system === 'SteamOS',
      function: () => functions.navigate('/power-tools'),
    },
    {
      icon: [iconPlugin],
      title: 'EmuDecky',
      description:
        'A Decky Loader Plugin to easily view emulator hotkeys and configure EmuDeck while in Game Mode',
      button: 'More info',
      btnCSS: 'btn-simple--5',
      status: system !== 'Win32',
      function: () => functions.navigate('/decky-controls'),
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
      icon: [iconCompress],
      title: 'EmuDeck Compressor',
      description: 'Compress your ROMs to optimize your storage',
      button: 'More info',
      btnCSS: 'btn-simple--5',
      status: system !== 'win32',
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
      status: true,
      function: () => functions.navigate('/cloud-sync/welcome'),
    },
    {
      icon: [iconCloud],
      title: 'Cloud Services Manager',
      description: 'Manage your cloud services, Xbox Cloud Gaming, and more!',
      button: 'More info',
      btnCSS: 'btn-simple--5',
      status: system !== 'win32',
      function: () => functions.openCSM(),
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
      icon: [iconMigrate],
      title: 'Migrate Installation',
      description:
        'Migrate your EmuDeck installation to your SD Card or vice versa',
      button: 'More info',
      btnCSS: 'btn-simple--5',
      status: system !== 'win32',
      function: () => functions.navigate('/migration'),
    },
    {
      icon: [iconDoc],
      title: 'Fetch Log File',
      description: 'Troubleshoot your EmuDeck install',
      button: 'Upload',
      btnCSS: 'btn-simple--5',
      status: system !== 'win32',
      function: () => functions.sprunge(),
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
      icon: [iconUninstall],
      title: 'Uninstall',
      description: 'Uninstall EmuDeck from your system',
      button: 'Uninstall',
      btnCSS: 'btn-simple--3',
      status: system !== 'win32',
      function: () => functions.navigate('/uninstall'),
    },
    {
      icon: [iconPrize],
      title: 'Become a Patron',
      description: 'Consider supporting EmuDeck on Patreon',
      button: 'Donate',
      btnCSS: 'btn-simple--3',
      status: branch !== 'early',
      type: 'link',
      href: 'https://www.patreon.com/bePatron?u=29065992',
      function: () => {},
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
        status: true,
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

  //GamePad
  const domElementsRef = useRef(null);
  const domElementsCur = domElementsRef.current;
  let domElements;
  useEffect(() => {
    if (domElementsCur && dom === undefined) {
      domElements = domElementsCur.querySelectorAll('button');
      setStatePage({ ...statePage, dom: domElements });
    }
  }, [statePage]);

  let systemName;

  switch (system) {
    case 'darwin':
      systemName = '\uF8FF';
      break;
    case 'win32':
      systemName = 'Windows';
      break;
    default:
      systemName = 'Linux';
  }

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
        {second === false && (
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
