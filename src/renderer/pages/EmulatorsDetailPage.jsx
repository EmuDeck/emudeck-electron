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
      header: (
        <span className="h4">{t('EmulatorsDetailPage.yuzuEA.title')}</span>
      ),
      body: (
        <>
          <p>{t('EmulatorsDetailPage.yuzuEA.enterToken')}</p>
          <p>{t('EmulatorsDetailPage.yuzuEA.fromPatreon')}</p>
          <p>https://yuzu-emu.org/help/early-access/</p>
          <p>{t('EmulatorsDetailPage.yuzuEA.savedTo')}</p>
          <div className="form">
            <FormInputSimple
              css="form__control--dark"
              label={t('EmulatorsDetailPage.yuzuEA.tokenLabel')}
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
            aria={t('aria.closeModal')}
            onClick={() => closeModal()}
          >
            {t('general.close')}
          </BtnSimple>
          <BtnSimple
            css="btn-simple--1"
            type="button"
            aria={t('aria.addToken')}
            onClick={() => yuzuEAaddToken()}
          >
            {t('general.next')}
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
      body: <p>{t('EmulatorsDetailPage.yuzuEA.installing')}</p>,
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
          modalHeader = (
            <span className="h4">
              {t('EmulatorsDetailPage.yuzuEA.wrongToken')}
            </span>
          );
          modalBody = t('EmulatorsDetailPage.yuzuEA.wrongTokenBody');
          break;
        case response.includes('fail'):
          modalHeader = (
            <span className="h4">{t('EmulatorsDetailPage.yuzuEA.failed')}</span>
          );
          modalBody = t('EmulatorsDetailPage.yuzuEA.failedBody');
          break;
        case response.includes('true'):
          modalHeader = (
            <span className="h4">
              {t('EmulatorsDetailPage.yuzuEA.success')}
            </span>
          );
          modalBody = <p>{t('EmulatorsDetailPage.yuzuEA.successBody')}</p>;
          break;
        default:
          modalHeader = (
            <span className="h4">{t('EmulatorsDetailPage.unknownError')}</span>
          );
          modalBody = <p>{t('EmulatorsDetailPage.unknownErrorBody')}</p>;
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
        case 'checkEdenBios':
          setSwitchBios(biosStatus);
          break;
        case 'checkYuzuBios':
          setEdenBios(biosStatus);
          break;

        case 'checkRyujinxBios':
          setRyujinxBios(biosStatus);
          break;
        case 'checkCitronBios':
          setCitronBios(biosStatus);
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
    let img;
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
      body: (
        <img
          onClick={() => closeModal()}
          src={img}
          alt={t('EmulatorsDetailPage.controls')}
        />
      ),
      css: 'emumodal--full',
    };
    setStatePage({
      ...statePage,
      modal: modalData,
    });
  };

  const showHotkeys = (emulator, code) => {
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
      case 'pcsx2_expert':
        img = pcsx2HotkeysExpert;
        break;

      default:
        img = defaultControls;
        break;
    }

    const modalData = {
      active: true,
      body: (
        <img
          onClick={() => closeModal()}
          src={img}
          alt={t('EmulatorsDetailPage.hotkeys')}
        />
      ),
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
      header: (
        <span className="h4">
          {t('EmulatorsDetailPage.installing', { code })}
        </span>
      ),
      body: <p>{t('EmulatorsDetailPage.installingWait', { code })}</p>,
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
          if (system == 'win32') {
            ipcChannel.sendMessage('emudeck', [
              `start_menu_reset|||start_menu_reset`,
            ]);
          }

          const modalData = {
            active: true,
            header: (
              <span className="h4">
                {t('EmulatorsDetailPage.installSuccess', { code })}
              </span>
            ),
            body: (
              <p>{t('EmulatorsDetailPage.installSuccessBody', { code })}</p>
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
            header: (
              <span className="h4">
                {t('EmulatorsDetailPage.installFailed', { code })}
              </span>
            ),
            body: <p>{t('EmulatorsDetailPage.installFailedBody', { code })}</p>,
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
      header: (
        <span className="h4">
          {t('EmulatorsDetailPage.installing', { code })}
        </span>
      ),
      body: <p>{t('EmulatorsDetailPage.installingWait', { code })}</p>,
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
            header: (
              <span className="h4">
                {t('EmulatorsDetailPage.installed', { code })}
              </span>
            ),
            body: (
              <p>{t('EmulatorsDetailPage.installSuccessBody', { code })}</p>
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
              header: (
                <span className="h4">
                  {t('EmulatorsDetailPage.parserUpdateNeeded')}
                </span>
              ),
              body: <p>{t('EmulatorsDetailPage.parserUpdateBody')}</p>,
              css: 'emumodal--xs',
            };
          }
        } else {
          const modalData = {
            active: true,
            header: (
              <span className="h4">
                {t('EmulatorsDetailPage.installFailed', { code })}
              </span>
            ),
            body: <p>{t('EmulatorsDetailPage.installFailedBody', { code })}</p>,
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
      header: (
        <span className="h4">
          {t('EmulatorsDetailPage.uninstalling', { code })}
        </span>
      ),
      body: <p>{t('EmulatorsDetailPage.uninstallingWait', { code })}</p>,
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
            header: (
              <span className="h4">
                {t('EmulatorsDetailPage.uninstalled', { code })}
              </span>
            ),
            body: <p>{t('EmulatorsDetailPage.uninstalledBody', { code })}</p>,
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
            header: (
              <span className="h4">
                {t('EmulatorsDetailPage.uninstallFailed', { code })}
              </span>
            ),
            body: (
              <p>{t('EmulatorsDetailPage.uninstallFailedBody', { code })}</p>
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
      header: (
        <span className="h4">
          {t('EmulatorsDetailPage.resetting', { code })}
        </span>
      ),
      body: <p>{t('EmulatorsDetailPage.resettingWait', { code })}</p>,
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
          header: (
            <span className="h4">
              {t('EmulatorsDetailPage.configUpdated', { name })}
            </span>
          ),
          body: <p>{t('EmulatorsDetailPage.configUpdatedBody', { name })}</p>,
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
          header: (
            <span className="h4">
              {t('EmulatorsDetailPage.configResetFailed', { name })}
            </span>
          ),
          body: (
            <p>{t('EmulatorsDetailPage.configResetFailedBody', { name })}</p>
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

  const onClickMigrate = (code) => {
    const modalData = {
      active: true,
      header: (
        <span className="h4">
          {t('EmulatorsDetailPage.migrateTitle', { code })}
        </span>
      ),
      body: (
        <>
          <p>{t('EmulatorsDetailPage.migrateBody1')}</p>
          <p>{t('EmulatorsDetailPage.migrateBody2')}</p>
        </>
      ),
      footer: (
        <BtnGroup>
          <BtnSimple
            css="btn-simple--2"
            type="button"
            aria={t('aria.closeModal')}
            onClick={() => closeModal()}
          >
            {t('general.close')}
          </BtnSimple>
          <BtnSimple
            css="btn-simple--1"
            type="button"
            aria={t('aria.addToken')}
            onClick={() => doMigration(code)}
          >
            {t('EmulatorsDetailPage.migrate')}
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
          <p>{t('EmulatorsDetailPage.optionalParsers')}</p>
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
      body: <p>{t('EmulatorsDetailPage.migrating', { code })}</p>,
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
          header: (
            <span className="h4">
              {t('EmulatorsDetailPage.installSuccess', { code })}
            </span>
          ),
          body: <p>{t('EmulatorsDetailPage.migratedBody', { code })}</p>,
          css: 'emumodal--xs',
        };
      } else {
        modalData = {
          active: true,
          header: (
            <span className="h4">
              {t('EmulatorsDetailPage.installFailed', { code })}
            </span>
          ),
          body: <p>{t('EmulatorsDetailPage.migrateFailedBody', { code })}</p>,
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
      case 'eden':
        checkBios('checkEdenBios');
        break;
      case 'citron':
        checkBios('checkEdenBios');
        break;
      case 'ryujinx':
        checkBios('checkRyujinxBios');
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
            header: <span className="h4">{t('general.successExcl')}</span>,
            body: <p>{t('ParserSelectorPage.allConfigured')}</p>,
            footer: (
              <BtnSimple
                css="btn-simple--1"
                type="button"
                onClick={() => navigate('/welcome')}
              >
                {t('general.close')}
              </BtnSimple>
            ),
            css: 'emumodal--xs',
          };
        } else if (system !== 'win32') {
          modalData = {
            active: true,
            header: <span className="h4">{t('general.failed')}</span>,
            body: <p>{t('ParserSelectorPage.configureError')}</p>,
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
  );
}

export default EmulatorsDetailPage;
