import React, { useEffect, useState, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { GlobalContext } from 'context/globalContext';
import ProgressBar from 'components/atoms/ProgressBar/ProgressBar';
import Wrapper from 'components/molecules/Wrapper/Wrapper';
import GamePad from 'components/organisms/GamePad/GamePad';
import Header from 'components/organisms/Header/Header';
import Footer from 'components/organisms/Footer/Footer';
import EmuDetail from 'components/organisms/Wrappers/EmuDetail';
import EmuModal from 'components/molecules/EmuModal/EmuModal';
import { BtnSimple, BtnGroup, FormInputSimple } from 'getbasecore/Atoms';
import {
  citraControls,
  citraHotkeys,
  duckstationControls,
  duckstationHotkeys,
  duckstationHotkeys,
  gamecubeControls,
  gamecubeHotkeysExpert,
  gamecubeHotkeys,
  primehackControls,
  primehackHotkeysExpert,
  primehackHotkeys,
  pcsx2Controls,
  pcsx2HotkeysExpert,
  pcsx2Hotkeys,
  raHotkeys,
  wiiClassicHotkeys,
  wiiControls,
  wiiHotkeysExpert,
  wiiHotkeys,
  wiiNunchuckControls,
  cemuControls,
  cemuHotkeys,
  yuzuControls,
  yuzuHotkeysExpert,
  yuzuHotkeys,
} from 'components/utils/images/hotkeys.js';

const emuData = require('data/emuData.json');

function EmulatorsDetailPage() {
  const navigate = useNavigate();
  const { state, setState, stateCurrentConfigs, setStateCurrentConfigs } =
    useContext(GlobalContext);
  const {
    installEmus,
    installFrontends,
    mode,
    system,
    yuzuEAtoken,
    emulatorAlternative,
  } = state;

  const { emulator } = useParams();

  const [statePage, setStatePage] = useState({
    disabledNext: false,
    disabledBack: false,
    emulatorSelected: emulator,
    updates: null,
    newDesiredVersions: null,
    modal: null,
    dom: undefined,
  });
  const {
    disabledNext,
    disabledBack,
    emulatorSelected,
    modal,
    updates,
    newDesiredVersions,
    dom,
  } = statePage;

  const yuzuEAsetToken = (data) => {
    console.log({ data });
    let yuzuEAtokenValue;
    data.target.value === ''
      ? (yuzuEAtokenValue = null)
      : (yuzuEAtokenValue = data.target.value);

    setState({
      ...state,
      yuzuEAtoken: yuzuEAtokenValue,
    });
  };

  const parserSeletor = () => {
    navigate('/parser-selector');
  };

  const yuzuEAaskToken = () => {
    const modalData = {
      active: true,
      header: <span className="h4">Yuzu Early Access</span>,
      body: (
        <>
          <p>
            Enter your Yuzu Early Access Token to automatically download and
            update Yuzu Early Access.
          </p>
          <p>You can get this from your Yuzu Patreon.</p>
          <p>https://yuzu-emu.org/help/early-access/</p>
          <p>
            Once you have entered your token in this window it will be saved to
            ~/emudeck/yuzu-ea-token.txt
          </p>
          <div className="form">
            <FormInputSimple
              css="form__control--dark"
              label="Yuzu EA Token"
              type="yuzuEAtoken"
              name="yuzuEAtoken"
              id="yuzuEAtoken"
              value={yuzuEAtoken}
              onChange={yuzuEAsetToken}
            />
          </div>
        </>
      ),
      footer: (
        <BtnGroup>
          <BtnSimple
            css="btn-simple--2"
            type="button"
            aria="Close Modal"
            onClick={() => closeModal()}
          >
            Close
          </BtnSimple>
          <BtnSimple
            css="btn-simple--1"
            type="button"
            aria="Add Token"
            onClick={() => yuzuEAaddToken()}
          >
            Next
          </BtnSimple>
        </BtnGroup>
      ),
      css: 'emumodal--xs',
    };
    setStatePage({
      ...statePage,
      modal: modalData,
    });
  };

  const yuzuEAaddToken = () => {
    const modalData = {
      active: true,
      body: <p>Please wait, installing Yuzu Early Access</p>,
      footer: <ProgressBar css="progress--success" infinite max="100" />,
    };
    setStatePage({
      ...statePage,
      modal: modalData,
      css: 'emumodal--xs',
    });

    ipcChannel.sendMessage('emudeck', [
      `YuzuEA_addToken|||YuzuEA_addToken "${yuzuEAtoken}"`,
    ]);
    let modalHeader;
    let modalBody;
    let modalFooter;
    ipcChannel.once('YuzuEA_addToken', (message) => {
      console.log({ message });
      const { stdout } = message;
      const response = stdout.replaceAll('\n', '');
      // We store the token for next installs
      console.log({ response });
      switch (true) {
        case response.includes('invalid'):
          modalHeader = <span className="h4">Wrong Token</span>;
          modalBody = 'Please check your Token and try again';
          break;
        case response.includes('fail'):
          modalHeader = <span className="h4">Yuzu Early Access Failed</span>;
          modalBody =
            'There was an issue installing Yuzu Early Access, please try again.';
          break;
        case response.includes('true'):
          modalHeader = <span className="h4">Yuzu Early Access Success!</span>;
          modalBody = (
            <p>
              Yuzu Early Access has been installed, you can play games as
              always. EmuDeck will detect you have Yuzu EA and use that
              instead.You don't need to do setup anything else.
            </p>
          );
          break;
        default:
          modalHeader = <span className="h4">Unknown error!</span>;
          modalBody = <p>There's been an error, please try again</p>;
          break;
      }

      const modalData = {
        active: true,
        header: modalHeader,
        body: modalBody,
        footer: modalFooter,
        css: 'emumodal--xs',
      };
      setStatePage({
        ...statePage,
        modal: modalData,
      });

      if (response === 'true') {
        const json = JSON.stringify(state);
        localStorage.setItem('settings_emudeck', json);
      }
    });
  };

  // const yuzuEAInstall = () => {
  //
  // };

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
      status = status.stdout;

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

  const closeModal = () => {
    const modalData = {
      active: false,
    };
    setStatePage({ ...statePage, modal: modalData });
  };

  const showControls = (emulator, code) => {
    switch (emulator) {
      case 'ra':
        img = raControls;
        break;
      case 'primehack':
        img = primehackControls;
        break;
      case 'ppsspp':
        img = ppssppControls;
        break;
      case 'duckstation':
        img = duckstationControls;
        break;
      case 'melonds':
        img = melondsControls;
        break;
      case 'citra':
        img = citraControls;
        break;
      case 'pcsx2':
        img = pcsx2Controls;
        break;
      case 'rpcs3':
        img = rpcs3Controls;
        break;
      case 'yuzu':
        img = yuzuControls;
        break;
      case 'ryujinx':
        img = ryujinxControls;
        break;
      case 'xemu':
        img = xemuControls;
        break;
      case 'cemu':
        img = cemuControls;
        break;
      case 'rmg':
        img = rmgControls;
        break;
      case 'mame':
        img = mameControls;
        break;
      case 'vita3k':
        img = vita3kControls;
        break;
      case 'flycast':
        img = flycastControls;
        break;
      case 'scummvm':
        img = scummvmControls;
        break;
      case 'xenia':
        img = xeniaControls;
        break;
      case 'mgba':
        img = mgbaControls;
        break;
      case 'ares':
        img = aresControls;
        break;
      case 'gamecube':
        img = gamecubeControls;
        break;
      case 'wii_nunchuck':
        img = wiiNunchuckControls;
        break;
      case 'wii_classic':
        img = wiiClassicHotkeys;
        break;
      case 'wii':
        img = wiiControls;
        break;
      default:
        img = defaultControls;
        break;
    }
    const modalData = {
      active: true,
      body: <img onClick={() => closeModal()} src={img} alt="Controls" />,
      css: 'emumodal--full',
    };
    setStatePage({
      ...statePage,
      modal: modalData,
    });
  };

  const showHotkeys = (emulator, code) => {
    console.log({ emulator });
    let img;
    switch (emulator) {
      case 'ra':
        img = raHotkeys;
        break;
      case 'primehack':
        img = primehackHotkeys;
        break;
      case 'ppsspp':
        img = ppssppHotkeys;
        break;
      case 'duckstation':
        img = duckstationHotkeys;
        break;
      case 'melonds':
        img = melondsHotkeys;
        break;
      case 'citra':
        img = citraHotkeys;
        break;
      case 'pcsx2':
        img = pcsx2Hotkeys;
        break;
      case 'rpcs3':
        img = rpcs3Hotkeys;
        break;
      case 'yuzu':
        img = yuzuHotkeys;
        break;
      case 'ryujinx':
        img = ryujinxHotkeys;
        break;
      case 'xemu':
        img = xemuHotkeys;
        break;
      case 'cemu':
        img = cemuHotkeys;
        break;
      case 'rmg':
        img = rmgHotkeys;
        break;
      case 'mame':
        img = mameHotkeys;
        break;
      case 'vita3k':
        img = vita3kHotkeys;
        break;
      case 'flycast':
        img = flycastHotkeys;
        break;
      case 'scummvm':
        img = scummvmHotkeys;
        break;
      case 'xenia':
        img = xeniaHotkeys;
        break;
      case 'mgba':
        img = mgbaHotkeys;
        break;
      case 'ares':
        img = aresHotkeys;
        break;
      case 'gamecube':
        img = gamecubeHotkeys;
        break;
      case 'gamecube_expert':
        img = gamecubeHotkeysExpert;
        break;
      case 'wii':
        img = wiiHotkeys;
        break;
      case 'wii_expert':
        img = wiiHotkeysExpert;
        break;

      default:
        img = defaultControls;
        break;
    }

    const modalData = {
      active: true,
      body: <img onClick={() => closeModal()} src={img} alt="Hotkeys" />,
      css: 'emumodal--full',
    };
    setStatePage({
      ...statePage,
      modal: modalData,
    });
  };

  const reInstallEmu = (emulator, code) => {
    const modalData = {
      active: true,
      header: <span className="h4">Installing {code}</span>,
      body: <p>Please wait while we install {code}</p>,
      footer: <ProgressBar css="progress--success" infinite max="100" />,
      css: 'emumodal--xs',
    };

    setStatePage({
      ...statePage,
      modal: modalData,
    });
    ipcChannel.sendMessage('emudeck', [`${code}_install|||${code}_install`]);

    ipcChannel.once(`${code}_install`, (message) => {
      let status = message.stdout;
      status.replace('\n', '');
      // Lets check if it did install
      ipcChannel.sendMessage('emudeck', [
        `${code}_IsInstalled|||${code}_IsInstalled`,
      ]);

      ipcChannel.once(`${code}_IsInstalled`, (message) => {
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

          if (emulator === 'esde' || emulator === 'pegasus') {
            setState({
              ...state,
              installFrontends: {
                ...installFrontends,
                [emulator]: {
                  id: emulator,
                  name: code,
                  status: true,
                },
              },
            });
          } else {
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
          }
        } else {
          const modalData = {
            active: true,
            header: <span className="h4">{code} failed</span>,
            body: <p>There was an issue trying to install {code}</p>,
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

  const saveParsers = () => {
    const modalData = {
      active: true,
      header: <span className="h4">Updating Parsers!</span>,
      body: <p>Please wait a few seconds...</p>,
      footer: <ProgressBar css="progress--success" infinite max="100" />,
      css: 'emumodal--xs',
    };

    setStatePage({
      ...statePage,
      modal: modalData,
    });
  };

  const setAlternativeEmulator = (system, emuName, emuName2, disable) => {
    if (emuName === 'ra' || emuName === 'ares') {
      setState({
        ...state,
        emulatorAlternative: {
          ...emulatorAlternative,
          [system]: emuName,
        },
        installEmus: {
          ...installEmus,
          [emuName2]: { ...installEmus[emuName2], status: false },
        },
      });
    } else if (emuName2 === 'multiemulator' || emuName2 === 'both') {
      setState({
        ...state,
        emulatorAlternative: {
          ...emulatorAlternative,
          [system]: emuName,
        },
      });
    } else {
      setStatePage({ ...statePage, lastSelected: emuName });

      setState({
        ...state,
        emulatorAlternative: {
          ...emulatorAlternative,
          [system]: emuName,
        },
        installEmus: {
          ...installEmus,
          [emuName2]: { ...installEmus[emuName2], status: false },
        },
      });
    }
    saveParsers();
  };

  useEffect(() => {
    const ogStateAlternativeValues = emulatorAlternative;
    const json = JSON.stringify(ogStateAlternativeValues);
    localStorage.setItem('ogStateAlternative', json);
  }, []);

  useEffect(() => {
    const ogStateAlternative = JSON.parse(
      localStorage.getItem('ogStateAlternative')
    );

    function sameObjects(obj1, obj2) {
      const keys1 = Object.keys(obj1);
      const keys2 = Object.keys(obj2);

      if (keys1.length !== keys2.length) {
        return false;
      }

      for (const key of keys1) {
        if (obj1[key] !== obj2[key]) {
          return false;
        }
      }

      return true;
    }

    const sameObject = sameObjects(ogStateAlternative, emulatorAlternative);

    if (sameObject) {
      return;
    }

    if (system === 'win32') {
      ipcChannel.sendMessage('emudeck', [
        `parsersUpdatePrev|||setSetting emuGBA ${state.emulatorAlternative.gba}; setSetting emuMAME ${state.emulatorAlternative.mame}; setSetting emuMULTI ${state.emulatorAlternative.multiemulator}; setSetting emuN64 ${state.emulatorAlternative.n64}; setSetting emuNDS ${state.emulatorAlternative.nds}; setSetting emuPSP ${state.emulatorAlternative.psp}; setSetting emuPSX ${state.emulatorAlternative.psx}; setSetting emuSCUMMVM ${state.emulatorAlternative.scummvm}; setSetting doInstallPPSSPP ${state.installEmus.ppsspp.status};setSetting doInstallmelonDS ${state.installEmus.melonds.status};setSetting doInstallDuck ${state.installEmus.duckstation.status};;setSetting doInstallFlycast ${state.installEmus.dreamcast.status}`,
      ]);
    } else {
      ipcChannel.sendMessage('emudeck', [
        `parsersUpdatePrev|||$(. ~/.config/EmuDeck/backend/functions/all.sh && setSetting emuGBA ${state.emulatorAlternative.gba} >/dev/null && setSetting emuMAME ${state.emulatorAlternative.mame} >/dev/null && setSetting emuMULTI ${state.emulatorAlternative.multiemulator} >/dev/null && setSetting emuN64 ${state.emulatorAlternative.n64} >/dev/null && setSetting emuNDS ${state.emulatorAlternative.nds} >/dev/null && setSetting emuPSP ${state.emulatorAlternative.psp} >/dev/null && setSetting emuPSX ${state.emulatorAlternative.psx} >/dev/null && setSetting emuSCUMMVM ${state.emulatorAlternative.scummvm} && setSetting doInstallPPSSPP ${state.installEmus.ppsspp.status} >/dev/null && setSetting doInstallMAME ${state.installEmus.mame.status} >/dev/null && setSetting doInstallmelonDS ${state.installEmus.melonds.status} >/dev/null && setSetting doInstallDuck ${state.installEmus.duckstation.status} >/dev/null && setSetting doInstallFlycast ${state.installEmus.flycast.status} >/dev/null && setSetting doInstallMAME ${state.installEmus.mame} >/dev/null && setSetting doInstallRMG ${state.installEmus.rmg.status} >/dev/null && setSetting doInstallScummVM ${state.installEmus.scummvm.status} >/dev/null && setSetting doInstallScummVM ${state.installEmus.scummvm.status}} >/dev/null) >/dev/null`,
      ]);
    }

    ipcChannel.once(`parsersUpdatePrev`, () => {
      ipcChannel.sendMessage('emudeck', [`parsersUpdate|||SRM_init`]);
    });

    ipcChannel.once(`parsersUpdate`, (message) => {
      const status = message.stdout;
      status.replace('\n', '');
      console.log({ message });
      let modalData;
      if (status.includes('true')) {
        modalData = {
          active: true,
          header: <span className="h4">Success!</span>,
          body: <p>All Parsers have been configured.</p>,
          footer: (
            <BtnSimple
              css="btn-simple--1"
              type="button"
              onClick={() => navigate('/welcome')}
            >
              Close
            </BtnSimple>
          ),
          css: 'emumodal--xs',
        };
      } else if (system !== 'win32') {
        modalData = {
          active: true,
          header: <span className="h4">Failed</span>,
          body: <p>There was an issue trying to configure your parsers</p>,
          css: 'emumodal--xs',
        };
        console.log({ modalData });
      }
      setStatePage({
        ...statePage,
        modal: modalData,
      });
    });
  }, [emulatorAlternative]);

  const installEmu = (emulator, code) => {
    const modalData = {
      active: true,
      header: <span className="h4">Installing {code}</span>,
      body: <p>Please wait while we install {code}</p>,
      footer: <ProgressBar css="progress--success" infinite max="100" />,
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
      let status = message.stdout;
      status.replace('\n', '');
      // Lets check if it did install
      ipcChannel.sendMessage('emudeck', [
        `${code}_IsInstalled|||${code}_IsInstalled`,
      ]);

      ipcChannel.once(`${code}_IsInstalled`, (message) => {
        console.log({ message });
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

          if (
            emulator === 'ppsspp' ||
            emulator === 'melonds' ||
            emulator === 'scummvm' ||
            emulator === 'duckstation' ||
            emulator === 'mame' ||
            emulator === 'rmg' ||
            emulator === 'flycast'
          ) {
            let emuOption1;
            let emuOption2;
            let emuID1;
            let emuID2;
            let system;
            let multiemulatorName;
            let multiemulatorID;
            let modalData;
            // //RA || ARES + mGBA
            if (
              (emulator === 'mgba' && installEmus.ra.status) ||
              (emulator === 'mgba' && installEmus.ares.status)
            ) {
              if (emulatorAlternative.gba !== 'both') {
                multiemulatorID = 'multiemulator';
                multiemulatorName = 'RetroArch';
                if (installEmus.ares.status) {
                  multiemulatorID = 'multiemulator';
                  multiemulatorName = 'ares';
                }

                emuOption1 = 'mGBA';
                emuOption2 = multiemulatorName;
                emuID2 = 'mgba';
                emuID1 = multiemulatorID;
                system = 'gba';
                modalData = {
                  active: true,
                  body: (
                    <>
                      <p>
                        Which emulator do you want to use for GameBoy Advance.
                      </p>
                      <div className="h5">
                        <strong>RetroArch (recommended)</strong> has these pros:
                      </div>
                      <ol className="list">
                        <li>RetroAchievements</li>
                        <li>Bezels & Shaders</li>
                        <li>Auto Save States</li>
                      </ol>
                      <div className="h5">
                        <strong>mGBA</strong> has this pro:
                      </div>
                      <ol className="list">
                        <li>GBA Link for Multiplayer, Pokemon Trading, etc.</li>
                      </ol>
                      <p>
                        We will only add the parser according to your selection
                        so you don't end up with duplicates in your library.
                      </p>
                    </>
                  ),
                };
                const myTimeout = setTimeout(launchModal, 500);
              }
            }

            // //RA || ARES + rmg
            if (
              (emulator === 'rmg' && installEmus.ra.status) ||
              (emulator === 'rmg' && installEmus.ares.status)
            ) {
              // alert(emuModified);
              if (emulatorAlternative.n64 !== 'both') {
                multiemulatorID = 'multiemulator';
                multiemulatorName = 'RetroArch';
                if (installEmus.ares.status) {
                  multiemulatorID = 'multiemulator';
                  multiemulatorName = 'ares';
                }

                emuOption1 = 'rmg';
                emuOption2 = multiemulatorName;
                emuID2 = 'rmg';
                emuID1 = multiemulatorID;
                system = 'n64';
                modalData = {
                  active: true,
                  body: (
                    <>
                      <p>Which emulator do you want to use</p>
                      <div className="h5">
                        <strong>RetroArch (recommended)</strong> has these pros:
                      </div>
                      <ol className="list">
                        <li>RetroAchievements</li>
                        <li>Bezels & Shaders</li>
                        <li>Auto Save States</li>
                      </ol>
                      <div className="h5">
                        <strong>RMG</strong> has this pro:
                      </div>
                      <ol className="list">
                        <li>Better Performance</li>
                      </ol>
                      <p>
                        We will only add the parser according to your selection
                        so you don't end up with duplicates in your library.
                      </p>
                    </>
                  ),
                };
                const myTimeout = setTimeout(launchModal, 500);
              }
            }

            if (
              (emulator === 'duckstation' && installEmus.ra.status) ||
              (emulator === 'duckstation' && installEmus.ares.status)
            ) {
              if (emulatorAlternative.psx !== 'both') {
                multiemulatorID = 'multiemulator';
                multiemulatorName = 'RetroArch';
                if (installEmus.ares.status) {
                  multiemulatorID = 'multiemulator';
                  multiemulatorName = 'ares';
                }

                emuOption1 = 'DuckStation';
                emuOption2 = multiemulatorName;
                emuID2 = 'duckstation';
                emuID1 = multiemulatorID;
                system = 'psx';
                modalData = {
                  active: true,
                  body: (
                    <>
                      <p>Which emulator do you want to use</p>
                      <div className="h5">
                        <strong>RetroArch</strong> has these prosss:
                      </div>
                      <ol className="list">
                        <li>RetroAchievements</li>
                        <li>Bezels & Shaders</li>
                        <li>Auto Save States</li>
                      </ol>
                      <div className="h5">
                        <strong>DuckStation (recommended)</strong> has this pro:
                      </div>
                      <ol className="list">
                        <li>Better Performance</li>
                      </ol>
                      <p>
                        We will only add the parser according to your selection
                        so you don't end up with duplicates in your library.
                      </p>
                    </>
                  ),
                };
                const myTimeout = setTimeout(launchModal, 500);
              }
            }

            if (
              (emulator === 'flycast' && installEmus.ra.status) ||
              (emulator === 'flycast' && installEmus.ares.status)
            ) {
              if (emulatorAlternative.dreamcast !== 'both') {
                multiemulatorID = 'multiemulator';
                multiemulatorName = 'RetroArch';
                if (installEmus.ares.status) {
                  multiemulatorID = 'multiemulator';
                  multiemulatorName = 'ares';
                }

                emuOption1 = 'Flycast';
                emuOption2 = multiemulatorName;
                emuID2 = 'flycast';
                emuID1 = multiemulatorID;
                system = 'dreamcast';
                modalData = {
                  active: true,
                  body: (
                    <>
                      <p>Which emulator do you want to use</p>
                      <div className="h5">
                        <strong>RetroArch</strong> has these prosss:
                      </div>
                      <ol className="list">
                        <li>RetroAchievements</li>
                        <li>Bezels & Shaders</li>
                      </ol>
                      <div className="h5">
                        <strong>Flycast (recommended)</strong> has this pro:
                      </div>
                      <ol className="list">
                        <li>Better Performance</li>
                      </ol>
                      <p>
                        We will only add the parser according to your selection
                        so you don't end up with duplicates in your library.
                      </p>
                    </>
                  ),
                };
                const myTimeout = setTimeout(launchModal, 500);
              }
            }

            if (
              (emulator === 'melonds' && installEmus.ra.status) ||
              (emulator === 'melonds' && installEmus.ares.status)
            ) {
              if (emulatorAlternative.nds !== 'both') {
                multiemulatorID = 'multiemulator';
                multiemulatorName = 'RetroArch';
                if (installEmus.ares.status) {
                  multiemulatorID = 'multiemulator';
                  multiemulatorName = 'ares';
                }

                emuOption1 = 'melonDS';
                emuOption2 = multiemulatorName;
                emuID2 = 'melonds';
                emuID1 = multiemulatorID;
                system = 'nds';
                modalData = {
                  active: true,
                  body: (
                    <>
                      <p>Which emulator do you want to use</p>
                      <div className="h5">
                        <strong>RetroArch</strong> has these pros:
                      </div>
                      <ol className="list">
                        <li>RetroAchievements</li>
                        <li>Bezels & Shaders</li>
                        <li>Auto Save States</li>
                      </ol>
                      <div className="h5">
                        <strong>melonDS (recommended)</strong> has this pros:
                      </div>
                      <ol className="list">
                        <li>Better performance and scaling</li>
                      </ol>
                      <p>
                        We will only add the parser according to your selection
                        so you don't end up with duplicates in your library.
                      </p>
                    </>
                  ),
                };
                const myTimeout = setTimeout(launchModal, 500);
              }
            }

            if (
              (emulator === 'ppsspp' && installEmus.ra.status) ||
              (emulator === 'ppsspp' && installEmus.ares.status)
            ) {
              multiemulatorID = 'multiemulator';
              multiemulatorName = 'RetroArch';
              if (installEmus.ares.status) {
                multiemulatorID = 'multiemulator';
                multiemulatorName = 'ares';
              }

              emuOption1 = 'PPSSPP';
              emuOption2 = multiemulatorName;
              emuID2 = 'ppsspp';
              emuID1 = multiemulatorID;
              system = 'psp';
              modalData = {
                active: true,
                body: (
                  <>
                    <p>Which emulator do you want to use</p>
                    <div className="h5">
                      <strong>RetroArch</strong> has these pros:
                    </div>
                    <ol className="list">
                      <li>RetroAchievements</li>
                      <li>Bezels & Shaders</li>
                      <li>Auto Save States</li>
                    </ol>
                    <div className="h5">
                      <strong>PPSSPP (recommended)</strong> has this pro:
                    </div>
                    <ol className="list">
                      <li>Better performance</li>
                      <li>Better compatibility</li>
                    </ol>
                    <p>
                      We will only add the parser according to your selection so
                      you don't end up with duplicates in your library.
                    </p>
                  </>
                ),
              };
              console.log({ modalData });
              const myTimeout = setTimeout(launchModal, 500);
            }

            if (
              (emulator === 'mame' && installEmus.ra.status) ||
              (emulator === 'mame' && installEmus.ares.status)
            ) {
              if (emulatorAlternative.mame !== 'both') {
                multiemulatorID = 'multiemulator';
                multiemulatorName = 'RetroArch';
                if (installEmus.ares.status) {
                  multiemulatorID = 'multiemulator';
                  multiemulatorName = 'ares';
                }

                emuOption1 = 'MAME';
                emuOption2 = multiemulatorName;
                emuID2 = 'mame';
                emuID1 = multiemulatorID;
                system = 'mame';
                modalData = {
                  active: true,
                  body: (
                    <>
                      <p>Which emulator do you want to use</p>
                      <div className="h5">
                        <strong>RetroArch (recommended)</strong> has these pros:
                      </div>
                      <ol className="list">
                        <li>RetroAchievements</li>
                        <li>Bezels & Shaders</li>
                        <li>Auto Save States</li>
                        <li>3 different cores: 2003 plus, 2010 and current</li>
                      </ol>
                      <p>
                        We will only add the parser according to your selection
                        so you don't end up with duplicates in your library.
                      </p>
                    </>
                  ),
                };
                const myTimeout = setTimeout(launchModal, 500);
              }
            }

            if (
              (emulator === 'scummvm' && installEmus.ra.status) ||
              (emulator === 'scummvm' && installEmus.ares.status)
            ) {
              if (emulatorAlternative.scummvm !== 'both') {
                multiemulatorID = 'multiemulator';
                if (installEmus.ares.status) {
                  multiemulatorID = 'multiemulator';
                }

                emuOption1 = 'ScummVM';
                emuOption2 = multiemulatorName;
                emuID2 = 'scummvm';
                emuID1 = multiemulatorID;
                system = 'scummvm';
                modalData = {
                  active: true,
                  body: (
                    <>
                      <p>Which emulator do you want to use</p>
                      <div className="h5">
                        <strong>RetroArch</strong> has these pros:
                      </div>
                      <ol className="list">
                        <li>RetroAchievements</li>
                        <li>Bezels & Shaders</li>
                        <li>Auto Save States</li>
                        <li>Better Keymapping and Controller support</li>
                      </ol>
                      <div className="h5">
                        <strong>ScummVM (recommended)</strong> has these pros:
                      </div>
                      <ol className="list">
                        <li>Not an emulation but runs natively</li>
                        <li>Takes less resources</li>
                        <li>Has better compatibility</li>
                        <li>More flexible configuration</li>
                      </ol>
                      <p>
                        We will only add the parser according to your selection
                        so you don't end up with duplicates in your library.
                      </p>
                    </>
                  ),
                };
                const myTimeout = setTimeout(launchModal, 500);
              }
            }
            console.log({ modalData });
            function launchModal() {
              modalData = {
                ...modalData,
                header: (
                  <span className="h4">RetroArch or Standalone Emulator?</span>
                ),
                css: 'emumodal--sm',
                footer: (
                  <>
                    <BtnSimple
                      css="btn-simple--1"
                      type="button"
                      aria={emuOption1}
                      onClick={() =>
                        setAlternativeEmulator(system, emuID2, emuID1, false)
                      }
                      disabled={false}
                    >
                      {emuOption1}
                    </BtnSimple>
                    <BtnSimple
                      css="btn-simple--2"
                      type="button"
                      aria={emuOption2}
                      onClick={() =>
                        setAlternativeEmulator(system, emuID1, emuID2, true)
                      }
                      disabled={false}
                    >
                      {emuOption2}
                    </BtnSimple>
                    <BtnSimple
                      css="btn-simple--3"
                      type="button"
                      aria="Go Back"
                      onClick={() =>
                        setAlternativeEmulator(system, 'both', 'both')
                      }
                    >
                      Both
                    </BtnSimple>
                  </>
                ),
              };
              setStatePage({ ...statePage, modal: modalData });
            }
          }
        } else {
          const modalData = {
            active: true,
            header: <span className="h4">{code} installation failed</span>,
            body: <p>There was an issue trying to install {code}</p>,
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
      footer: <ProgressBar css="progress--success" infinite max="100" />,
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
      status = status.stdout;

      status = status.replace('\n', '');
      // Lets check if it did install
      ipcChannel.sendMessage('emudeck', [
        `${code}_IsInstalled|||${code}_IsInstalled`,
      ]);

      ipcChannel.once(`${code}_IsInstalled`, (status) => {
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
          if (emulator === 'esde' || emulator === 'pegasus') {
            setState({
              ...state,
              installFrontends: {
                ...installFrontends,
                [emulator]: {
                  id: emulator,
                  name: code,
                  status: false,
                },
              },
            });
          } else {
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
          }
        } else {
          const modalData = {
            active: true,
            header: <span className="h4">{code} uninstall failed</span>,
            body: <p>There was an issue trying to uninstall {code}</p>,
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
      footer: <ProgressBar css="progress--success" infinite max="100" />,
      css: 'emumodal--xs',
    };

    setStatePage({
      ...statePage,
      modal: modalData,
    });

    if (system === 'win32') {
      ipcChannel.sendMessage('emudeck', [
        `${code}_resetConfig|||${code}_resetConfig;${code}_setupSaves`,
      ]);
    } else {
      ipcChannel.sendMessage('emudeck', [
        `${code}_resetConfig|||${code}_resetConfig`,
      ]);
    }

    ipcChannel.once(`${code}_resetConfig`, (status) => {
      status = status.stdout;

      status = status.replace('\n', '');

      if (status.includes('true')) {
        const modalData = {
          active: true,
          header: <span className="h4">{name}'s configuration updated!</span>,
          body: (
            <p>
              {name}'s configuration was updated with our latest improvements,
              optimizations and bug fixes!
            </p>
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
          body: <p>There was an issue trying to reset {name} configuration</p>,
          css: 'emumodal--xs',
        };

        setStatePage({
          ...statePage,
          modal: modalData,
        });
      }
    });
  };

  const onClickMigrate = (code) => {
    const modalData = {
      active: true,
      header: (
        <span className="h4">Migrate {code} from Flatpak to AppImage</span>
      ),
      body: (
        <>
          <p>
            It's migration time! To keep things simple, the version of RPCS3 you
            are using is unofficially supported by the primary developers of
            RPCS3. This migration will download the RPCS3 AppImage, which will
            also include frequent updates and performance improvements.
          </p>
          <p>
            EmuDeck will migrate your saves and your configurations (yes your
            per-game configurations too), so you can continue playing right
            away.
          </p>
        </>
      ),
      footer: (
        <BtnGroup>
          <BtnSimple
            css="btn-simple--2"
            type="button"
            aria="Close Modal"
            onClick={() => closeModal()}
          >
            Close
          </BtnSimple>
          <BtnSimple
            css="btn-simple--1"
            type="button"
            aria="Add Token"
            onClick={() => doMigration(code)}
          >
            Migrate
          </BtnSimple>
        </BtnGroup>
      ),
      css: 'emumodal--xs',
    };

    setStatePage({
      ...statePage,
      modal: modalData,
    });
  };

  const doMigration = (code) => {
    const modalData = {
      active: true,
      body: <p>Please wait, migrating {code}</p>,
      footer: <ProgressBar css="progress--success" infinite max="100" />,
    };
    setStatePage({
      ...statePage,
      modal: modalData,
      css: 'emumodal--xs',
    });

    ipcChannel.sendMessage('emudeck', [`${code}_migrate|||${code}_migrate`]);

    ipcChannel.once(`${code}_migrate`, (message) => {
      const stdout = message.message;

      const response = stdout.replaceAll('\n', '');
      let modalData;
      if (response.includes('true')) {
        modalData = {
          active: true,
          header: <span className="h4">{code} success!</span>,
          body: <p>{code} has been migrated, have fun!</p>,
          css: 'emumodal--xs',
        };
      } else {
        modalData = {
          active: true,
          header: <span className="h4">{code} failed</span>,
          body: <p>There was an issue trying to migrate {code}</p>,
          css: 'emumodal--xs',
        };
      }
    });
  };

  useEffect(() => {
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
      }

      const updates = diff(repoVersions, stateCurrentConfigs);

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

      setStatePage({
        ...statePage,
        updates,
      });

      const json = JSON.stringify(stateCurrentConfigs);
      localStorage.setItem('current_versions_beta', json);
    }
  }, [modal]);
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

  return (
    <div style={{ height: '100vh' }} ref={domElementsRef}>
      {dom !== undefined && <GamePad elements={dom} />}
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
            onClickHotkeys={showHotkeys}
            onClickControls={showControls}
            onClickUninstall={uninstallEmu}
            onClickMigrate={onClickMigrate}
            onClickParsers={parserSeletor}
            installEmus={installEmus[emulatorSelected]}
            yuzuEAaskToken={yuzuEAaskToken}
          />
        )}
        <Footer next={false} />
        <EmuModal modal={modal} />
      </Wrapper>
    </div>
  );
}

export default EmulatorsDetailPage;
