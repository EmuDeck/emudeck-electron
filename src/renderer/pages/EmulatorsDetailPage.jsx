import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { GlobalContext } from 'context/globalContext';
import ProgressBar from 'components/atoms/ProgressBar/ProgressBar';
import Wrapper from 'components/molecules/Wrapper/Wrapper';
import Header from 'components/organisms/Header/Header';
import Footer from 'components/organisms/Footer/Footer';
import EmuDetail from 'components/organisms/Wrappers/EmuDetail';
import EmuModal from 'components/molecules/EmuModal/EmuModal';
const emuData = require('data/emuData.json');

function EmulatorsDetailPage() {
  const { state, setState, stateCurrentConfigs, setStateCurrentConfigs } =
    useContext(GlobalContext);
  const { installEmus, mode, system } = state;

  const { emulator } = useParams();

  const [statePage, setStatePage] = useState({
    disabledNext: false,
    disabledBack: false,
    emulatorSelected: emulator,
    updates: null,
    newDesiredVersions: null,
    modal: null,
  });
  const {
    disabledNext,
    disabledBack,
    emulatorSelected,
    modal,
    updates,
    newDesiredVersions,
  } = statePage;

  const yuzuEAaddToken = () => {
    ipcChannel.sendMessage('emudeck', [`YuzuEA_addToken|||YuzuEA_addToken`]);
    ipcChannel.once('YuzuEA_addToken', (message) => {
      console.log({ message });
    });
  };

  const diff = (obj1, obj2) => {
    // Make sure an object to compare is provided
    if (!obj2 || Object.prototype.toString.call(obj2) !== '[object Object]') {
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

  // TODO: Use only one state for bioses, doing it this way is quick but madness
  const [ps1Bios, setps1Bios] = useState(null);
  const [ps2Bios, setps2Bios] = useState(null);
  const [switchBios, setSwitchBios] = useState(null);
  const [segaCDBios, setSegaCDBios] = useState(null);
  const [saturnBios, setSaturnBios] = useState(null);
  const [dreamcastBios, setDreamcastBios] = useState(null);
  const [DSBios, setDSBios] = useState(null);
  const ipcChannel = window.electron.ipcRenderer;
  const checkBios = (biosCommand) => {
    ipcChannel.sendMessage('emudeck', [`${biosCommand}|||${biosCommand}`]);
    ipcChannel.once(`${biosCommand}`, (status) => {
      // console.log({ biosCommand });
      status = status.stdout;
      // console.log({ status });
      status = status.replace('\n', '');
      let biosStatus;
      status.includes('true') ? (biosStatus = true) : (biosStatus = false);

      switch (biosCommand) {
        case 'checkPS1BIOS':
          setps1Bios(biosStatus);
          break;
        case 'checkPS2BIOS':
          setps2Bios(biosStatus);
          break;
        case 'checkYuzuBios':
          setSwitchBios(biosStatus);
          break;
        case 'checkSegaCDBios':
          setSegaCDBios(biosStatus);
          break;
        case 'checkSaturnBios':
          setSaturnBios(biosStatus);
          break;
        case 'checkDreamcastBios':
          setDreamcastBios(biosStatus);
          break;
        case 'checkDSBios':
          setDSBios(biosStatus);
          break;
      }
    });
  };

  const reInstallEmu = (emulator, code) => {
    const modalData = {
      active: true,
      header: <span className="h4">Installing {code}</span>,
      body: <p>Please wait while we install {code}</p>,
      footer: <ProgressBar css="progress--success" infinite={true} max="100" />,
      css: 'emumodal--xs',
    };

    setStatePage({
      ...statePage,
      modal: modalData,
    });
    if (system === 'win32') {
      ipcChannel.sendMessage('emudeck', [`${code}_install|||${code}_install;${code}_resetConfig;${code}_setupSaves`]);
    }else{
      ipcChannel.sendMessage('emudeck', [`${code}_install|||${code}_install`]);
    }
    

    ipcChannel.once(`${code}_install`, (message) => {
      // console.log({ status });
      let status = message.stdout;
      status.replace('\n', '');
      // Lets check if it did install
      ipcChannel.sendMessage('emudeck', [
        `${code}_IsInstalled|||${code}_IsInstalled`,
      ]);

      ipcChannel.once(`${code}_IsInstalled`, (message) => {
        // console.log({ status });
        status = message.stdout;
        status.replace('\n', '');

        if (status.includes('true')) {
          const modalData = {
            active: true,
            header: <span className="h4">{code} success!</span>,
            body: (
              <p>
                {code} has been installed, now you can play games from {code}{' '}
                using EmulationStation-DE or adding them to your Steam Library
                using Steam Rom Manager
              </p>
            ),
            css: 'emumodal--xs',
          };

          setStatePage({
            ...statePage,
            modal: modalData,
          });
          // We set the emu as install = yes
          setState({
            ...state,
            installEmus: {
              ...installEmus,
              [emulator]: {
                id: emulator,
                name: code,
                status: true,
              },
            },
          });
        } else {
          const modalData = {
            active: true,
            header: `<span className="h4">${code} failed</span>`,
            body: (
              <>
                <p>There was an issue trying to install ${code}</p>
              </>
            ),
            css: 'emumodal--xs',
          };

          setStatePage({
            ...statePage,
            modal: modalData,
          });
          // We save it on localstorage
          const json = JSON.stringify(state);
          localStorage.setItem('settings_emudeck', json);
        }
      });
    });
  };

  const installEmu = (emulator, code) => {
    console.log(emulator);

    const modalData = {
      active: true,
      header: <span className="h4">Installing {code}</span>,
      body: <p>Please wait while we install {code}</p>,
      footer: <ProgressBar css="progress--success" infinite={true} max="100" />,
      css: 'emumodal--xs',
    };
    setStatePage({
      ...statePage,
      modal: modalData,
    });

    ipcChannel.sendMessage('emudeck', [
      `${code}_install|||${code}_install && ${code}_init`,
    ]);

    ipcChannel.once(`${code}_install`, (message) => {
      // console.log({ status });
      let status = message.stdout;
      status.replace('\n', '');
      // Lets check if it did install
      ipcChannel.sendMessage('emudeck', [
        `${code}_IsInstalled|||${code}_IsInstalled`,
      ]);

      ipcChannel.once(`${code}_IsInstalled`, (message) => {
        // console.log({ status });
        status = message.stdout;
        status.replace('\n', '');

        if (status.includes('true')) {
          const modalData = {
            active: true,
            header: <span className="h4">{code} installed!</span>,
            body: (
              <p>
                {code} has been installed, now you can play games from {code}{' '}
                using EmulationStation-DE or adding them to your Steam Library
                using Steam Rom Manager
              </p>
            ),
            css: 'emumodal--xs',
          };

          setStatePage({
            ...statePage,
            modal: modalData,
          });
          // We set the emu as install = yes
          setState({
            ...state,
            installEmus: {
              ...installEmus,
              [emulator]: {
                id: emulator,
                name: code,
                status: true,
              },
            },
          });
        } else {
          const modalData = {
            active: true,
            header: <span className="h4">{code} installation failed</span>,
            body: (
              <>
                <p>There was an issue trying to install {code}</p>
              </>
            ),
            css: 'emumodal--xs',
          };

          setStatePage({
            ...statePage,
            modal: modalData,
          });
          // We save it on localstorage
          const json = JSON.stringify(state);
          localStorage.setItem('settings_emudeck', json);
        }
      });
    });
  };

  const uninstallEmu = (emulator, code, alternative = false) => {
    // Uninstall it!

    const modalData = {
      active: true,
      header: <span className="h4">Uninstalling {code}</span>,
      body: <p>Please wait while we uninstall {code}</p>,
      footer: <ProgressBar css="progress--success" infinite={true} max="100" />,
      css: 'emumodal--xs',
    };

    setStatePage({
      ...statePage,
      modal: modalData,
    });

    if (alternative) {
      ipcChannel.sendMessage('emudeck', [
        `${code}_uninstall|||${code}_uninstall_alt`,
      ]);
    } else {
      ipcChannel.sendMessage('emudeck', [
        `${code}_uninstall|||${code}_uninstall`,
      ]);
    }

    ipcChannel.once(`${code}_uninstall`, (status) => {
      // console.log({ status });
      status = status.stdout;
      // console.log({ status });
      status = status.replace('\n', '');
      // Lets check if it did install
      ipcChannel.sendMessage('emudeck', [
        `${code}_IsInstalled|||${code}_IsInstalled`,
      ]);

      ipcChannel.once(`${code}_IsInstalled`, (status) => {
        console.log({ status });
        status = status.stdout;
        status = status.replace('\n', '');

        if (status.includes('false')) {
          const modalData = {
            active: true,
            header: <span className="h4">{code} uninstalled!</span>,
            body: (
              <p>
                {code} has been uninstalled, you will need to delete your
                entries from Steam using Steam Rom Manager and manually delete
                your saved games in Emulation/saves/{code}
              </p>
            ),
            css: 'emumodal--xs',
          };

          setStatePage({
            ...statePage,
            modal: modalData,
          });
          // We set the emu as install = no
          setState({
            ...state,
            installEmus: {
              ...installEmus,
              [emulator]: {
                id: emulator,
                name: code,
                status: false,
              },
            },
          });
        } else {
          const modalData = {
            active: true,
            header: <span className="h4">{code} uninstall failed</span>,
            body: (
              <>
                <p>There was an issue trying to uninstall {code}</p>
              </>
            ),
            css: 'emumodal--xs',
          };

          setStatePage({
            ...statePage,
            modal: modalData,
          });
        }
      });
    });
  };

  const resetEmu = (code, name, id) => {
    const modalData = {
      active: true,
      header: <span className="h4">Resetting {code}'s configuration</span>,
      body: <p>Please wait while we reset {code}'s configuration</p>,
      footer: <ProgressBar css="progress--success" infinite={true} max="100" />,
      css: 'emumodal--xs',
    };

    setStatePage({
      ...statePage,
      modal: modalData,
    });
    
    if (system === 'win32') {
      ipcChannel.sendMessage('emudeck', [`${code}_resetConfig|||${code}_resetConfig;${code}_setupSaves`]);
    }else{
      ipcChannel.sendMessage('emudeck', [`${code}_resetConfig|||${code}_resetConfig`]);
    }
    
    ipcChannel.once(`${code}_resetConfig`, (status) => {
      console.log(`${code}_resetConfig`);
      status = status.stdout;
      console.log({ status });
      status = status.replace('\n', '');

      if (status.includes('true')) {
        const modalData = {
          active: true,
          header: <span className="h4">{name}'s configuration updated!</span>,
          body: (
            <>
              <p>
                {name}'s configuration was updated with our latest improvements,
                optimizations and bug fixes!
              </p>
            </>
          ),
          css: 'emumodal--xs',
        };

        setStatePage({
          ...statePage,
          modal: modalData,
        });
        setStateCurrentConfigs({
          ...stateCurrentConfigs,
          [id]: newDesiredVersions[id],
        });
      } else {
        const modalData = {
          active: true,
          header: <span className="h4">{name} configuration reset failed</span>,
          body: (
            <>
              <p>There was an issue trying to reset {name} configuration</p>
            </>
          ),
          css: 'emumodal--xs',
        };

        setStatePage({
          ...statePage,
          modal: modalData,
        });
      }
    });
  };

  useEffect(() => {
    console.log('update saved state');
    // We save it on localstorage
    const json = JSON.stringify(state);
    localStorage.setItem('settings_emudeck', json);
  }, [state]);

  useEffect(() => {
    switch (emulator) {
      case 'ra':
        checkBios('checkPS1BIOS');
        checkBios('checkYuzuBios');
        checkBios('checkSegaCDBios');
        checkBios('checkSaturnBios');
        checkBios('checkDSBios');
        checkBios('checkDreamcastBios');
        break;
      case 'duckstation':
        checkBios('checkPS1BIOS');
        break;
      case 'melonds':
        checkBios('checkDSBios');
        break;
      case 'pcsx2':
        checkBios('checkPS2BIOS');
        break;
      case 'yuzu':
        checkBios('checkYuzuBios');
        break;
      default:
        console.log('No bios');
    }
  }, []);

  const selectEmu = (e) => {
    const emu = e.target.value;
    if (emu != '-1') {
      setStatePage({
        ...statePage,
        emulatorSelected: emu,
      });
    }
  };
  useEffect(() => {
    ipcChannel.sendMessage('check-versions');
    ipcChannel.once('check-versions', (repoVersions) => {
      // No versioning found, what to do?
      if (repoVersions === '') {
        console.log('no versioning found');
      }

      const updates = diff(repoVersions, stateCurrentConfigs);
      console.log({ updates });
      setStatePage({
        ...statePage,
        updates,
        newDesiredVersions: repoVersions,
      });
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (modal === false) {
      const updates = diff(newDesiredVersions, stateCurrentConfigs);
      console.log({ updates });
      setStatePage({
        ...statePage,
        updates,
      });

      const json = JSON.stringify(stateCurrentConfigs);
      localStorage.setItem('current_versions_beta', json);
    }
  }, [modal]);
  return (
    <Wrapper>
      <Header title={emuData[emulatorSelected].name} />

      {updates && (
        <EmuDetail
          mode={mode}
          disabledNext={disabledNext}
          disabledBack={disabledBack}
          emuData={emuData[emulatorSelected]}
          updateAvailable={updates[emulator] !== undefined}
          ps1={ps1Bios}
          ps2={ps2Bios}
          nswitch={switchBios}
          segacd={segaCDBios}
          saturn={saturnBios}
          dreamcast={dreamcastBios}
          nds={DSBios}
          onChange={selectEmu}
          onClick={resetEmu}
          onClickInstall={installEmu}
          onClickReInstall={reInstallEmu}
          onClickUninstall={uninstallEmu}
          installEmus={installEmus[emulatorSelected]}
          YuzuEAaddToken={yuzuEAaddToken}
        />
      )}
      <Footer next={false} />
      <EmuModal modal={modal} />
    </Wrapper>
  );
}

export default EmulatorsDetailPage;
