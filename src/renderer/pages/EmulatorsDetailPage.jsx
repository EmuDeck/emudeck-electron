import { useTranslation } from 'react-i18next';
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
  const { t, i18n } = useTranslation();
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
  const [citronBios, setCitronBios] = useState(null);
  const [ryujinxBios, setRyujinxBios] = useState(null);
  const [edenBios, setEdenBios] = useState(null);
  const [segaCDBios, setSegaCDBios] = useState(null);
  const [saturnBios, setSaturnBios] = useState(null);
  const [dreamcastBios, setDreamcastBios] = useState(null);
  const [DSBios, setDSBios] = useState(null);
  const ipcChannel = window.electron.ipcRenderer;

  const checkBios = (biosCommand) => {
    ipcChannel.sendMessage('emudeck', [`${biosCommand}|||${biosCommand}`]);
    ipcChannel.once(`${biosCommand}`, (message) => {
      let stdout = message.stdout.replace('\n', '');
      stdout = JSON.parse(stdout);
      const result = stdout.result;

      let biosStatus;
      /True|OK/.test(result) ? (biosStatus = true) : (biosStatus = false);

      switch (biosCommand) {
        case 'check_psx_bios':
          setps1Bios(biosStatus);
          break;
        case 'check_ps2_bios':
          setps2Bios(biosStatus);
          break;
        case 'check_eden_bios':
          setSwitchBios(biosStatus);
          break;
        case 'check_yuzu_bios':
          setEdenBios(biosStatus);
          break;

        case 'check_ryujinx_bios':
          setRyujinxBios(biosStatus);
          break;
        case 'check_citron_bios':
          setCitronBios(biosStatus);
          break;

        case 'check_sega_cd_bios':
          setSegaCDBios(biosStatus);
          break;
        case 'check_saturn_bios':
          setSaturnBios(biosStatus);
          break;
        case 'check_dreamcast_bios':
          setDreamcastBios(biosStatus);
          break;
        case 'check_ds_bios':
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
      case 'azahar':
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
      case 'eden':
        img = yuzuControls;
        break;
      case 'citron':
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
      case 'azahar':
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
      case 'eden':
        img = yuzuHotkeys;
        break;
      case 'citron':
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

  const reInstallEmu = (emulator, code, name) => {
    const modalData = {
      active: true,
      header: <span className="h4">Updating {name}</span>,
      body: <p>Please wait while we update {name}</p>,
      footer: <ProgressBar css="progress--success" infinite max="100" />,
      css: 'emumodal--xs',
    };

    setStatePage({
      ...statePage,
      modal: modalData,
    });
    ipcChannel.sendMessage('emudeck', [`${code}_install|||${code}_install`]);

    ipcChannel.once(`${code}_install`, (message) => {
      status = message.stdout;
      status.replace('\n', '');
      console.log({ message });
      if (/true|OK/.test(status)) {
        const modalData = {
          active: true,
          header: <span className="h4">{name} success!</span>,
          body: (
            <p>
              {name} has been installed, now you can play games from {name}{' '}
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

        if (
          emulator === 'esde' ||
          emulator === 'pegasus' ||
          emulator === 'srm'
        ) {
          if (emulator === 'srm') {
            emulator = 'steam';
          }

          setState({
            ...state,
            installFrontends: {
              ...installFrontends,
              [emulator]: {
                id: emulator,
                name: name,
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
                name: name,
                status: true,
              },
            },
          });
        }
      } else {
        const modalData = {
          active: true,
          header: <span className="h4">{name} failed</span>,
          body: <p>There was an issue trying to install {name}</p>,
          css: 'emumodal--xs',
        };

        setStatePage({
          ...statePage,
          modal: modalData,
        });
      }
    });
  };

  const installEmu = (emulator, code, name) => {
    const modalData = {
      active: true,
      header: <span className="h4">Installing {name}</span>,
      body: <p>Please wait while we install {name}</p>,
      footer: <ProgressBar css="progress--success" infinite max="100" />,
      css: 'emumodal--xs',
    };
    setStatePage({
      ...statePage,
      modal: modalData,
    });

    ipcChannel.sendMessage('emudeck', [`${code}_install|||${code}_install`]);

    console.log(`${code}_install|||${code}_install`);

    ipcChannel.once(`${code}_install`, (message) => {
      let status = message.stdout;
      status.replace('\n', '');
      // Lets check if it did install
      ipcChannel.sendMessage('emudeck', [
        `${code}_is_installed|||${code}_is_installed`,
      ]);
      ipcChannel.once(`${code}_is_installed`, (message) => {
        let stdout = message.stdout.replace('\n', '');
        stdout = JSON.parse(stdout);
        const result = stdout.result;
        if (/true|OK/.test(result)) {
          ipcChannel.sendMessage('emudeck', [`${code}_init|||${code}_init`]);

          const modalData = {
            active: true,
            header: <span className="h4">{name} installed!</span>,
            body: (
              <p>
                {name} has been installed, now you can play games from {name}{' '}
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
                name: name,
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
            header: <span className="h4">{name} installation failed</span>,
            body: <p>There was an issue trying to install {name}</p>,
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
        `${code}_is_installed|||${code}_is_installed`,
      ]);

      ipcChannel.once(`${code}_is_installed`, (message) => {
        console.log({ message });
        status = message.stdout;
        status = status.replace('\n', '');

        if (status.includes('KO')) {
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

    ipcChannel.sendMessage('emudeck', [`${code}_init|||${code}_init`]);

    ipcChannel.once(`${code}_init`, (status) => {
      status = status.stdout;
      console.log(status);
      status = status.replace('\n', '');

      if (/true|OK/.test(status)) {
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
    // Check for bios
    switch (emulator) {
      case 'ra':
        checkBios('check_psx_bios');
        checkBios('check_sega_cd_bios');
        checkBios('check_saturn_bios');
        checkBios('check_ds_bios');
        checkBios('check_dreamcast_bios');
        break;
      case 'duckstation':
        checkBios('check_psx_bios');
        break;
      case 'melonds':
        checkBios('check_ds_bios');
        break;
      case 'pcsx2':
        checkBios('check_ps2_bios');
        break;
      case 'yuzu':
        checkBios('check_yuzu_bios');
        break;
      case 'eden':
        checkBios('check_eden_bios');
        break;
      case 'citron':
        checkBios('check_citron_bios');
        break;
      case 'ryujinx':
        checkBios('check_ryujinx_bios');
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
  }, []);

  useEffect(() => {
    const json = JSON.stringify(stateCurrentConfigs);
    localStorage.setItem('current_versions', json);
  }, [stateCurrentConfigs]);

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
          eswitch={edenBios}
          nswitch={switchBios}
          rswitch={ryujinxBios}
          cswitch={citronBios}
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
          installEmus={installEmus[emulatorSelected]}
        />
      )}
      <Footer next={false} />
      <EmuModal modal={modal} />
    </Wrapper>
  );
}

export default EmulatorsDetailPage;
