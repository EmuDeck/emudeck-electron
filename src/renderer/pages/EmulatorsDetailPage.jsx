import React, { useEffect, useState, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { GlobalContext } from 'context/globalContext';
import ProgressBar from 'components/atoms/ProgressBar/ProgressBar';
import Wrapper from 'components/molecules/Wrapper/Wrapper';

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
    lastSelected: null,
  });
  const {
    disabledNext,
    disabledBack,
    emulatorSelected,
    modal,
    updates,
    newDesiredVersions,
    lastSelected,
  } = statePage;

  // TODO: Use only one state for bioses, doing it this way is quick but madness
  const [ps1Bios, setps1Bios] = useState(null);
  const [ps2Bios, setps2Bios] = useState(null);
  const [switchBios, setSwitchBios] = useState(null);
  const [segaCDBios, setSegaCDBios] = useState(null);
  const [saturnBios, setSaturnBios] = useState(null);
  const [dreamcastBios, setDreamcastBios] = useState(null);
  const [DSBios, setDSBios] = useState(null);
  const ipcChannel = window.electron.ipcRenderer;

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

  const removeParsers = () => {
    ipcChannel.sendMessage('emudeck', [`SRM_deleteCache|||SRM_deleteCache`]);
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
            const modalData = {
              active: true,
              header: <span className="h4">Parser update needed</span>,
              body: (
                <p>
                  If you want to use this new Standalone emulator in Steam you
                  need to go to Steam Rom Manager and pick the proper parser.
                </p>
              ),
              css: 'emumodal--xs',
            };
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
          updates: [],
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

  const showCustom = () => {
    let bashCommand;
    if (system === 'win32') {
      bashCommand = `New-Item -ItemType Directory -Force -Path "$toolsPath\\srm\\userData\\parsers\\custom\\ -ErrorAction SilentlyContinue";Invoke-Item "$toolsPath\\srm\\userData\\parsers\\custom\\"`;
    } else if (system === 'darwin') {
      bashCommand = `mkdir -p "$HOME/.config/steam-rom-manager/userData/parsers/custom/"; open "$HOME/.config/steam-rom-manager/userData/parsers/custom/"`;
    } else {
      bashCommand = `mkdir -p "$HOME/.config/steam-rom-manager/userData/parsers/custom/"; gnome-open "$HOME/.config/steam-rom-manager/userData/parsers/custom/"; kde-open "$HOME/.config/steam-rom-manager/userData/parsers/custom/"`;
    }
    ipcChannel.sendMessage('emudeck', [`openCustomFolder|||${bashCommand}`]);
  };

  const installOptional = () => {
    const modalData = {
      active: true,
      body: (
        <>
          <p>Please wait, installing additional parsers:</p>
          <ul className="list">
            <li>Nintendo GameBoy - SameBoy</li>
            <li>Nintendo GameBoy Color - SameBoy</li>
            <li>Sega Saturn - Yabause</li>
            <li>Nintendo GameBoy Color - mGBA Standalone</li>
            <li>Nintendo GameBoy - mGBA Standalone</li>
          </ul>
        </>
      ),
      footer: <ProgressBar css="progress--success" infinite max="100" />,
    };
    setStatePage({
      ...statePage,
      modal: modalData,
    });
    ipcChannel.sendMessage('emudeck', [
      `API_optional_parsers|||API_optional_parsers`,
    ]);

    ipcChannel.once(`API_optional_parsers`, (message) => {
      const stdout = message.message;

      closeModal();
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
    // We save it on localstorage
    const json = JSON.stringify(state);
    localStorage.setItem('settings_emudeck', json);
  }, [state]);
  useEffect(() => {
    // Check for bios
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

    // Check for updates
    ipcChannel.sendMessage('check-versions');
    ipcChannel.once('check-versions', (repoVersions) => {
      // Thanks chatGPT lol
      const obj1 = repoVersions;
      const obj2 = stateCurrentConfigs;

      const differences = {};

      for (const key in obj1) {
        if (JSON.stringify(obj1[key]) !== JSON.stringify(obj2[key])) {
          differences[key] = obj1[key];
        }
      }

      setStatePage({
        ...statePage,
        updates: differences,
        newDesiredVersions: repoVersions,
      });
    });

    // save OG Alternatives

    const ogStateAlternativeValues = emulatorAlternative;
    delete ogStateAlternativeValues.multiemulator;
    const json = JSON.stringify(ogStateAlternativeValues);
    localStorage.setItem('ogStateAlternative', json);
  }, []);

  useEffect(() => {
    const json = JSON.stringify(stateCurrentConfigs);
    localStorage.setItem('current_versions', json);
  }, [stateCurrentConfigs]);

  useEffect(() => {
    if (lastSelected !== null) {
      saveParsers();
    }
  }, [lastSelected]);

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

    if (!sameObject) {
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
    }
  }, [emulatorAlternative]);

  return (
    <div style={{ height: '100vh' }}>
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
            onClickCustomParser={showCustom}
            onClickOptionalParser={installOptional}
            onClickInstall={installEmu}
            onClickReInstall={reInstallEmu}
            onClickHotkeys={showHotkeys}
            onClickControls={showControls}
            onClickUninstall={uninstallEmu}
            onClickMigrate={onClickMigrate}
            onClickParsers={parserSeletor}
            onClickRemoveParsers={removeParsers}
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
