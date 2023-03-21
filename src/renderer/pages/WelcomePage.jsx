import React, { useEffect, useState, useContext } from 'react';
import { GlobalContext } from 'context/globalContext';
import Wrapper from 'components/molecules/Wrapper/Wrapper';
import Header from 'components/organisms/Header/Header';
import Footer from 'components/organisms/Footer/Footer';
import { useNavigate } from 'react-router-dom';
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
  iconBooks,
  iconJoystick,
  iconPackage,
} from 'components/utils/images/images';

function WelcomePage() {
  const ipcChannel = window.electron.ipcRenderer;
  const { state, setState, stateCurrentConfigs, setStateCurrentConfigs } =
    useContext(GlobalContext);
  const { system, mode, second, storagePath, gamemode, storage } = state;
  const [statePage, setStatePage] = useState({
    disabledNext: true,
    disabledBack: true,
    downloadComplete: !navigator.onLine ? true : null,
    updates: null,
    cloned: null,
    data: '',
  });
  const { disabledNext, disabledBack, updates } = statePage;
  const navigate = useNavigate();
  const selectMode = (value) => {
    setState({ ...state, mode: value });
    if (second) {
      navigate('/rom-storage');
    }
  };

  const settingsCards = [
    {
      icon: [iconMigrate],
      title: 'Steam 3.5 Fix',
      description:
        'Update your paths to the new SD Card paths introduced in Steam 3.5',
      button: 'Fix',
      btnCSS: 'btn-simple--5',
      status: storage !== 'Internal Storage' ? true : false,
      function: () => functions.migrationFixSDPaths(),
    },
    {
      icon: [iconJoystick],
      title: 'Steam Rom Manager',
      description: 'Launch SRM to add more games to your Steam Library',
      button: 'Launch',
      btnCSS: 'btn-simple--5',
      status: true,
      function: () => functions.openSRM(),
    },
    {
      icon: [iconQuick],
      title: 'Quick Reset',
      description: 'Reset settings with our defaults in one click',
      button: 'Reinstall',
      btnCSS: 'btn-simple--5',
      status: true,
      function: () => selectMode('easy'),
    },
    {
      icon: [iconCustom],
      title: 'Custom Reset',
      description: 'Chose what emulators do you want to reset',
      button: 'Reinstall',
      btnCSS: 'btn-simple--5',
      status: true,
      function: () => selectMode('expert'),
    },

    {
      icon: [iconPackage],
      title: 'Update Emulators',
      description: 'Update your emulators right from EmuDeck',
      button: 'More info',
      btnCSS: 'btn-simple--5',
      status: false,
      function: () => functions.navigate('/update-emulators'),
    },
    {
      icon: [iconPlugin],
      title: 'PowerTools',
      description: 'Decky plugin to improve performance in some emulators',
      button: 'More info',
      btnCSS: 'btn-simple--5',
      status: true,
      function: () => functions.navigate('/power-tools'),
    },
    {
      icon: [iconPlugin],
      title: 'DeckyControls',
      description:
        'EmuDeck decky plugin to access emulator hotkeys in Gaming Mode',
      button: 'More info',
      btnCSS: 'btn-simple--5',
      status: true,
      function: () => functions.navigate('/decky-controls'),
    },
    {
      icon: [iconPlugin],
      title: 'Gyroscope',
      description: 'Use your SteamDeck gyroscope with Wii and Switch games',
      button: 'More info',
      btnCSS: 'btn-simple--5',
      status: true,
      function: () => functions.navigate('/gyrodsu'),
    },
    {
      icon: [iconCompress],
      title: 'EmuDeck Compressor',
      description: 'Lossless compression of ISO and Nintendo games',
      button: 'More info',
      btnCSS: 'btn-simple--5',
      status: true,
      function: () => functions.navigate('/chd-tool'),
    },
    {
      icon: [iconGear],
      title: 'Quick Settings',
      description: 'Customize bezels, shaders, aspect ratio and more',
      button: 'More info',
      btnCSS: 'btn-simple--5',
      status: false,
      function: () => functions.navigate('/settings'),
    },
    {
      icon: [iconSuccess],
      title: 'Bios Checker',
      description: 'Check if you have your correct bios installed',
      button: 'More info',
      btnCSS: 'btn-simple--5',
      status: true,
      function: () => functions.navigate('/check-bios'),
    },
    {
      icon: [iconCloud],
      title: 'Cloud Backup',
      description: 'Backup your states and saved games to the cloud',
      button: 'More info',
      btnCSS: 'btn-simple--5',
      status: true,
      function: () => functions.navigate('/cloud-sync'),
    },
    {
      icon: [iconCloud],
      title: 'Cloud Services Manager',
      description: 'Manage your cloud services',
      button: 'More info',
      btnCSS: 'btn-simple--5',
      status: true,
      function: () => functions.openCSM(),
    },
    {
      icon: [iconPrize],
      title: 'RetroAchievements',
      description:
        'Configure RetroAchivments for RetroArch, PCSX2 and DuckStation',
      button: 'More info',
      btnCSS: 'btn-simple--5',
      status: true,
      function: () => functions.navigate('/RA-achievements-config'),
    },
    {
      icon: [iconMigrate],
      title: 'Migrate installation',
      description: 'Move your installation to your SD Card or viceversa',
      button: 'More info',
      btnCSS: 'btn-simple--5',
      status: true,
      function: () => functions.navigate('/migration'),
    },
    {
      icon: [iconBooks],
      title: 'Emulator guides',
      description: 'Check our hotkeys, reset each emulator in case of issues',
      button: 'More info',
      btnCSS: 'btn-simple--5',
      status: false,
      function: () => functions.navigate('/emulator-guide'),
    },
    {
      icon: [iconDoc],
      title: 'Upload Log',
      description: 'Having issues installing? Send us your log',
      button: 'Upload',
      btnCSS: 'btn-simple--5',
      status: true,
      function: () => functions.sprunge(),
    },
    {
      icon: [iconList],
      title: 'ChangeLog',
      description:
        'Read all about the improvements done in this current version',
      button: 'Read',
      btnCSS: 'btn-simple--5',
      status: true,
      function: () => functions.navigate('/change-log'),
    },
    {
      icon: [iconUninstall],
      title: 'Uninstall',
      description: 'Uninstall EmuDeck from your system from here',
      button: 'Uninstall',
      btnCSS: 'btn-simple--3',
      status: true,
      function: () => functions.navigate('/uninstall'),
    },
    {
      icon: [iconPrize],
      title: 'Become a Patreon',
      description: 'Please consider supporting us on Patreon',
      button: 'Donate',
      btnCSS: 'btn-simple--3',
      status: true,
      type: 'link',
      href: 'https://www.patreon.com/bePatron?u=29065992',
      function: () => {},
    },
  ];

  // show changelog after update
  useEffect(() => {
    const showChangelog = localStorage.getItem('show_changelog');

    if (showChangelog === 'true') {
      navigate('/change-log');
    }

    ipcChannel.sendMessage('check-versions');
    ipcChannel.once('check-versions', (repoVersions) => {
      // No versioning found, what to do?
      if (repoVersions === '') {
        console.log('no versioning found');
      }

      if (second === true) {
        //Thanks chatGPT lol
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

  const openSRM = () => {
    if (system === 'win32') {
      ipcChannel.sendMessage('bash', [
        `srm|||cd ${storagePath} && cd Emulation && cd tools && start srm.exe`,
      ]);
      ipcChannel.once('srm', (message) => {
        console.log({ message });
      });
    } else {
      ipcChannel.sendMessage('bash', [
        `zenity --question --width 450 --title "Close Steam/Steam Input?" --text "$(printf "<b>Exit Steam to launch Steam Rom Manager? </b>\n\n To add your Emulators and EmulationStation-DE to steam hit Preview, then Generate App List, then wait for the images to download\n\nWhen you are happy with your image choices hit Save App List and wait for it to say it's completed.\n\nDesktop controls will temporarily revert to touch/trackpad/L2/R2")" && (kill -15 $(pidof steam) & ${storagePath}/Emulation/tools/srm/Steam-ROM-Manager.AppImage)`,
      ]);
    }
  };

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
      alert(`Copy this url: ${message}`);
    });
  };

  const migrationFixSDPaths = () => {
    ipcChannel.sendMessage('emudeck', [`SDPaths|||Migration_fix_SDPaths`]);
    ipcChannel.once('SDPaths', (message) => {
      message.includes('true')
        ? alert(`Paths Fixed!`)
        : alert(
            `There was an error tryting to fix your paths. If the problem persist rerun SteamRomManager to fix them`
          );
    });
  };

  const functions = {
    openSRM,
    openCSM,
    sprunge,
    navigate,
    migrationFixSDPaths,
  };
  return (
    <Wrapper>
      {second === false && <Header title="Welcome to EmuDeck" />}
      {second === true && <Header title="Welcome back to EmuDeck" />}

      <Welcome
        settingsCards={settingsCards}
        functions={functions}
        updates={updates}
        alert={
          second
            ? ``
            : 'Do you need help installing EmuDeck for the first time? <a href="https://youtu.be/rs9jDHIDKkU" target="_blank">Check out this guide</a>'
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
    </Wrapper>
  );
}

export default WelcomePage;
