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
  const { state, setState, stateUpdates, setStateUpdates } =
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
      icon: [iconJoystick],
      title: 'Steam Rom Manager',
      description: 'Launch SRM to add more games to your Steam Library',
      button: 'Launch',
      btnCSS: 'btn-simple--5',
      status: true,
      function: () => functions.openSRM(),
    },
    {
      icon: [iconPackage],
      title: 'Update Emulators',
      description: 'Update your emulators right from EmuDeck',
      button: 'More info',
      btnCSS: 'btn-simple--5',
      status: true,
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

    ipcChannel.sendMessage('emudeck', [
      `getEmuInstallStatus|||getEmuInstallStatus`,
    ]);
    ipcChannel.once('getEmuInstallStatus', (message) => {
      console.log(message);
      console.log(json.parse(message));
    });

    // ipcChannel.sendMessage('check-installed');
    // ipcChannel.once('check-installed', (statuso) => {
    //   console.log({ statuso });
    //   console.log(typeof statuso.stdout);
    //   console.log(statuso.stdout);
    // });

    ipcChannel.sendMessage('check-versions');
    ipcChannel.once('check-versions', (repoVersions) => {
      // No versioning found, what to do?
      if (repoVersions === '') {
        console.log('no versioning found');
      }

      const diff = (obj1, obj2) => {
        // Make sure an object to compare is provided
        if (
          !obj2 ||
          Object.prototype.toString.call(obj2) !== '[object Object]'
        ) {
          return obj1;
        }

        //
        // Variables
        //

        const diffs = {};
        let key;

        //
        // Methods
        //

        /**
         * Check if two arrays are equal
         * @param  {Array}   arr1 The first array
         * @param  {Array}   arr2 The second array
         * @return {Boolean}      If true, both arrays are equal
         */
        const arraysMatch = (arr1, arr2) => {
          // Check if the arrays are the same length
          if (arr1.length !== arr2.length) return false;

          // Check if all items exist and are in the same order
          for (let i = 0; i < arr1.length; i++) {
            if (arr1[i] !== arr2[i]) return false;
          }

          // Otherwise, return true
          return true;
        };

        /**
         * Compare two items and push non-matches to object
         * @param  {*}      item1 The first item
         * @param  {*}      item2 The second item
         * @param  {String} key   The key in our object
         */
        const compare = (item1, item2, key) => {
          // Get the object type
          const type1 = Object.prototype.toString.call(item1);
          const type2 = Object.prototype.toString.call(item2);

          // If type2 is undefined it has been removed
          if (type2 === '[object Undefined]') {
            diffs[key] = null;
            return;
          }

          // If items are different types
          if (type1 !== type2) {
            diffs[key] = item2;
            return;
          }

          // If an object, compare recursively
          if (type1 === '[object Object]') {
            const objDiff = diff(item1, item2);
            if (Object.keys(objDiff).length > 0) {
              diffs[key] = objDiff;
            }
            return;
          }

          // If an array, compare
          if (type1 === '[object Array]') {
            if (!arraysMatch(item1, item2)) {
              diffs[key] = item2;
            }
            return;
          }

          // Else if it's a function, convert to a string and compare
          // Otherwise, just compare
          if (type1 === '[object Function]') {
            if (item1.toString() !== item2.toString()) {
              diffs[key] = item2;
            }
          } else if (item1 !== item2) {
            diffs[key] = item2;
          }
        };

        //
        // Compare our objects
        //

        // Loop through the first object
        for (key in obj1) {
          if (obj1.hasOwnProperty(key)) {
            compare(obj1[key], obj2[key], key);
          }
        }

        // Loop through the second object and find missing items
        for (key in obj2) {
          if (obj2.hasOwnProperty(key)) {
            if (!obj1[key] && obj1[key] !== obj2[key]) {
              diffs[key] = obj2[key];
            }
          }
        }

        // Return the object of differences
        return diffs;
      };

      const updates = diff(repoVersions, stateUpdates);

      console.log({ updates });

      if (Object.keys(updates).length > 0) {
        setStatePage({ ...statePage, updates: true });
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
