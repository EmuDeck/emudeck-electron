import React, { useEffect, useState, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { GlobalContext } from 'context/globalContext';
import Wrapper from 'components/molecules/Wrapper/Wrapper';
import Header from 'components/organisms/Header/Header';
import Footer from 'components/organisms/Footer/Footer';

import EmuGuide from 'components/organisms/Wrappers/EmuGuide';

function EmulatorsDetailPage() {
  const { state, setState, stateCurrentConfigs, setStateCurrentConfigs } =
    useContext(GlobalContext);
  const { installEmus, mode } = state;
  const { ryujinx } = installEmus;
  const emuData = require('data/emuData.json');
  const { emulator } = useParams();

  const [statePage, setStatePage] = useState({
    disabledNext: false,
    disabledBack: false,
    showNotification: undefined,
    emulatorSelected: emulator,
    textNotification: '',
    hideInstallButton: false,
    disableResetButton: false,
    updates: null,
    newDesiredVersions: null,
  });
  const {
    disabledNext,
    disabledBack,
    emulatorSelected,
    showNotification,
    textNotification,
    hideInstallButton,
    disableResetButton,
    updates,
    newDesiredVersions,
  } = statePage;

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

  //TODO: Use only one state for bioses, doing it this way is quick but madness
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
      //console.log({ status });
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

  const installEmu = (emulator, code) => {
    console.log(emulator);

    setStatePage({
      ...statePage,
      hideInstallButton: true,
    });

    ipcChannel.sendMessage('emudeck', [
      `${code}_install|||${code}_install && ${code}_init`,
    ]);

    ipcChannel.once(`${code}_install`, (status) => {
      // console.log({ status });
      status = status.stdout;
      //console.log({ status });
      status = status.replace('\n', '');
      //Lets check if it did install
      ipcChannel.sendMessage('emudeck', [
        `${name}_IsInstalled|||${code}_IsInstalled`,
      ]);

      ipcChannel.once(`${code}_IsInstalled`, (status) => {
        // console.log({ status });
        status = status.stdout;
        console.log({ status });
        status = status.replace('\n', '');

        if (status.includes('true')) {
          setStatePage({
            ...statePage,
            textNotification: `${code} installed! 🎉`,
            showNotification: true,
            hideInstallButton: false,
          });
          //We set the emu as install = yes
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

          //We save it on localstorage
          let json = JSON.stringify(state);
          localStorage.setItem('settings_emudeck', json);
        } else {
          setStatePage({
            ...statePage,
            textNotification: `There was an issue trying to install ${name} 😥`,
            showNotification: true,
            hideInstallButton: false,
          });
        }
      });
    });
  };

  const uninstallEmu = (emulator, code, alternative = false) => {
    console.log(emulator);

    if (
      confirm(
        'Are you sure you want to uninstall? Your saved games will be deleted'
      )
    ) {
      // Uninstall it!

      setStatePage({
        ...statePage,
        hideInstallButton: true,
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
        //console.log({ status });
        status = status.replace('\n', '');
        //Lets check if it did install
        ipcChannel.sendMessage('emudeck', [
          `${code}_IsInstalled|||${code}_IsInstalled`,
        ]);

        ipcChannel.once(`${code}_IsInstalled`, (status) => {
          console.log({ status });
          status = status.stdout;
          status = status.replace('\n', '');

          if (status.includes('false')) {
            setStatePage({
              ...statePage,
              textNotification: `${code} Uninstalled! 🎉`,
              showNotification: true,
              hideInstallButton: false,
            });
            //We set the emu as install = no
            setState({
              ...state,
              installEmus: {
                ...installEmus,
                [emulator]: {
                  id: emulator,
                  name: name,
                  status: false,
                },
              },
            });
          } else {
            setStatePage({
              ...statePage,
              textNotification: `There was an issue trying to uninstall ${code} 😥`,
              showNotification: true,
              hideInstallButton: false,
            });
          }
        });
      });
    } else {
      // Do nothing!
    }
  };

  const resetEmu = (code, name, id) => {
    setStatePage({
      ...statePage,
      disableResetButton: true,
    });
    ipcChannel.sendMessage('emudeck', [
      `${code}_resetConfig|||${code}_resetConfig`,
    ]);
    ipcChannel.once(`${code}_resetConfig`, (status) => {
      console.log(`${code}_resetConfig`);
      status = status.stdout;
      console.log({ status });
      status = status.replace('\n', '');

      if (status.includes('true')) {
        setStatePage({
          ...statePage,
          textNotification: `${name} configuration updated! 🎉`,
          showNotification: true,
          disableResetButton: false,
        });
        setStateCurrentConfigs({
          ...stateCurrentConfigs,
          [id]: newDesiredVersions[id],
        });
      } else {
        setStatePage({
          ...statePage,
          textNotification: `There was an issue trying to reset ${name} configuration 😥`,
          showNotification: true,
          disableResetButton: false,
        });
      }
    });
  };

  useEffect(() => {
    if (showNotification === true) {
      setTimeout(() => {
        setStatePage({
          ...statePage,
          showNotification: false,
        });
      }, 3000);
    }
  }, [showNotification]);

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
        updates: updates,
        newDesiredVersions: repoVersions,
      });
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (showNotification === false) {
      const updates = diff(newDesiredVersions, stateCurrentConfigs);
      console.log({ updates });
      setStatePage({
        ...statePage,
        updates: updates,
      });

      let json = JSON.stringify(stateCurrentConfigs);
      localStorage.setItem('current_versions_beta', json);
    }
  }, [showNotification]);
  return (
    <Wrapper>
      <Header title={emuData[emulatorSelected].name} />

      {updates && (
        <>
          <EmuGuide
            mode={mode}
            disabledNext={disabledNext}
            disabledBack={disabledBack}
            emuData={emuData[emulatorSelected]}
            updateAvailable={updates[emulator] !== undefined ? true : false}
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
            onClickUninstall={uninstallEmu}
            showNotification={showNotification}
            textNotification={textNotification}
            installEmus={installEmus[emulatorSelected]}
            disableResetButton={disableResetButton ? true : false}
            hideInstallButton={hideInstallButton ? true : false}
          />
        </>
      )}
      <Footer next={false} />
    </Wrapper>
  );
}

export default EmulatorsDetailPage;
