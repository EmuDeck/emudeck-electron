import { useTranslation } from 'react-i18next';
import React, { useState, useContext, useRef, useEffect } from 'react';
import { GlobalContext } from 'context/globalContext';
import { useParams, useNavigate } from 'react-router-dom';
import Wrapper from 'components/molecules/Wrapper/Wrapper';
import ProgressBar from 'components/atoms/ProgressBar/ProgressBar';

import Header from 'components/organisms/Header/Header';
import Footer from 'components/organisms/Footer/Footer';
import EmuModal from 'components/molecules/EmuModal/EmuModal';
import ParserSelector from 'components/organisms/Wrappers/ParserSelector';
import { BtnSimple } from 'getbasecore/Atoms';
import {
  imgra,
  imgares,
  imgdolphin,
  imgprimehack,
  imgppsspp,
  imgduckstation,
  imgazahar,
  imgpcsx2,
  imgrpcs3,
  imgyuzu,
  imgeden,
  imgcitron,
  imgryujinx,
  imgcemu,
  imgxemu,
  imgmame,
  imgvita3k,
  imgflycast,
  imgxenia,
  imgsrm,
  imgrmg,
  imgscummvm,
  imgsupermodel,
  imgesde,
  imgmelonds,
  imgmgba,
} from 'components/utils/images/images';

const images = {
  ra: imgra,
  ares: imgares,
  dolphin: imgdolphin,
  primehack: imgprimehack,
  ppsspp: imgppsspp,
  duckstation: imgduckstation,
  azahar: imgazahar,
  pcsx2: imgpcsx2,
  rpcs3: imgrpcs3,
  yuzu: imgyuzu,
  eden: imgeden,
  citron: imgcitron,
  melonds: imgmelonds,
  ryujinx: imgryujinx,
  cemu: imgcemu,
  xemu: imgxemu,
  mame: imgmame,
  vita3k: imgvita3k,
  flycast: imgflycast,
  scummvm: imgscummvm,
  supermodel: imgsupermodel,
  esde: imgesde,
  rmg: imgrmg,
  mgba: imgmgba,
  xenia: imgxenia,
  srm: imgsrm,
};

function ParserSelectorPage() {
  const { t, i18n } = useTranslation();
  const ipcChannel = window.electron.ipcRenderer;
  const navigate = useNavigate();
  const { state, setState } = useContext(GlobalContext);
  const { device, installEmus, emulatorAlternative, revertParsers, system } =
    state;

  useEffect(() => {
    const ogStateAlternativeValues = state.emulatorAlternative;
    let json = JSON.stringify(ogStateAlternativeValues);
    localStorage.setItem('ogStateAlternative', json);
    const ogStateEmus = state.installEmus;
    json = JSON.stringify(ogStateEmus);
    localStorage.setItem('ogStateEmus', json);

    setState({
      ...state,
      emulatorAlternative: {
        gba: 'multiemulator',
        mame: 'multiemulator',
        n64: 'multiemulator',
        nds: 'multiemulator',
        psp: 'multiemulator',
        psx: 'multiemulator',
        scummvm: 'multiemulator',
        multiemulator: 'ra',
      },
      installEmus: {
        ...installEmus,
        ra: {
          id: 'ra',
          status: true,
          installed: undefined,
          name: 'RetroArch',
        },
        ppsspp: {
          id: 'ppsspp',
          status: false,
          installed: undefined,
          name: 'PPSSPP',
        },
        duckstation: {
          id: 'duckstation',
          status: false,
          installed: undefined,
          name: 'DuckStation',
        },
        melonds: {
          id: 'melonds',
          status: false,
          installed: undefined,
          name: 'melonDS',
        },
        rmg: {
          id: 'rmg',
          status: false,
          installed: undefined,
          name: "Rosalie's Mupen Gui",
        },
        mame: { id: 'mame', status: false, name: 'MAME' },
        flycast: {
          id: 'flycast',
          status: false,
          installed: undefined,
          name: 'Flycast',
        },
        scummvm: {
          id: 'scummvm',
          status: false,
          installed: undefined,
          name: 'ScummVM',
        },
        mgba: { id: 'mgba', status: false, installed: undefined, name: 'mGBA' },
        ares: { id: 'ares', status: false, installed: undefined, name: 'ares' },
      },
    });
  }, []);
  const [statePage, setStatePage] = useState({
    disabledNext: false,
    disabledBack: false,
    data: '',
    modal: false,
    lastSelected: undefined,
    dom: undefined,
  });
  const { disabledNext, disabledBack, data, modal, lastSelected, dom } =
    statePage;

  const setAlternativeParser = (systemCode, emuName, emuName2, disable) => {
    if (emuName === 'ra' || emuName === 'ares') {
      setState({
        ...state,
        emulatorAlternative: {
          ...emulatorAlternative,
          [systemCode]: emuName,
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
          [systemCode]: emuName,
        },
      });
    } else {
      setStatePage({ ...statePage, lastSelected: emuName });

      setState({
        ...state,
        emulatorAlternative: {
          ...emulatorAlternative,
          [systemCode]: emuName,
        },
        installEmus: {
          ...installEmus,
          [emuName2]: { ...installEmus[emuName2], status: false },
        },
      });
    }
    closeModal();
  };

  const closeModal = () => {
    setStatePage({ ...statePage, modal: false });
  };

  let modalData = {};

  const toggleEmus = (emulatorProp) => {
    const { status } = installEmus[emulatorProp];
    const enable = !status;
    let multiemulatorValue;
    let systemsValue = {};
    let systemsOption = {};

    // Enabling
    if (enable) {
      setStatePage({ ...statePage, lastSelected: emulatorProp });

      if (emulatorProp === 'xenia') {
        modalData = {
          active: true,
          header: (
            <span className="h4">{t('EmulatorSelectorPage.xeniaTitle')}</span>
          ),
          body: <p>{t('EmulatorSelectorPage.xeniaBody')}</p>,
        };
        // setStatePage({ ...statePage, modal: modalData });
      }

      // Setting multiemulator
      if (emulatorProp === 'ares' || emulatorProp === 'ra') {
        multiemulatorValue = emulatorProp;
      } else {
        multiemulatorValue = emulatorAlternative.multiemulator;
        setStatePage({
          ...statePage,
          lastSelected: emulatorProp,
          modal: modalData,
        });
      }

      if (emulatorProp === 'ares' || emulatorProp === 'ra') {
        console.log('multi off');
        // systemsOption = {
        //   ...systemsOption,
        //   gba: 'multiemulator',
        //   n64: 'multiemulator',
        //   scummvm: 'multiemulator',
        //   psp: 'multiemulator',
        //   melonds: 'multiemulator',
        //   mame: 'multiemulator',
        //   multiemulator: emulatorProp,
        // };
      } else {
        if (emulatorProp === 'mgba') {
          systemsOption = {
            ...systemsOption,
            gba: emulatorAlternative.gba === 'both' ? 'multiemulator' : 'mgba',
          };
        }
        if (emulatorProp === 'flycast') {
          systemsOption = {
            ...systemsOption,
            dreamcast:
              emulatorAlternative.dreamcast === 'both'
                ? 'multiemulator'
                : 'flycast',
          };
        }
        if (emulatorProp === 'duckstation') {
          systemsOption = {
            ...systemsOption,
            psx:
              emulatorAlternative.psx === 'both'
                ? 'multiemulator'
                : 'duckstation',
          };
        }
        if (emulatorProp === 'rmg') {
          systemsOption = {
            ...systemsOption,
            n64: emulatorAlternative.n64 === 'both' ? 'multiemulator' : 'rmg',
          };
        }
        if (emulatorProp === 'scummvm') {
          systemsOption = {
            ...systemsOption,
            scummvm:
              emulatorAlternative.scummvm === 'both'
                ? 'multiemulator'
                : 'scummvm',
          };
        }
        if (emulatorProp === 'ppsspp') {
          systemsOption = {
            ...systemsOption,
            psp:
              emulatorAlternative.psp === 'both' ? 'multiemulator' : 'ppsspp',
          };
        }
        if (emulatorProp === 'mame') {
          systemsOption = {
            ...systemsOption,
            mame:
              emulatorAlternative.mame === 'both' ? 'multiemulator' : 'mame',
          };
        }
        if (emulatorProp === 'melonds') {
          systemsOption = {
            ...systemsOption,
            nds:
              emulatorAlternative.nds === 'both' ? 'multiemulator' : 'melonds',
          };
        }
      }

      // ARREGLAR ESTO

      systemsValue = {
        gba: systemsOption.gba ? systemsOption.gba : emulatorAlternative.gba,
        n64: systemsOption.n64 ? systemsOption.n64 : emulatorAlternative.n64,
        scummvm: systemsOption.scummvm
          ? systemsOption.scummvm
          : emulatorAlternative.scummvm,
        psp: systemsOption.psp ? systemsOption.psp : emulatorAlternative.psp,
        psx: systemsOption.psx ? systemsOption.psx : emulatorAlternative.psx,
        nds: systemsOption.nds ? systemsOption.nds : emulatorAlternative.nds,
        mame: systemsOption.mame
          ? systemsOption.mame
          : emulatorAlternative.mame,
      };

      console.log({ systemsValue });

      // Disabling
    } else {
      setStatePage({ ...statePage, lastSelected: undefined });
      // Setting multiemulator
      if (emulatorProp === 'ares' || emulatorProp === 'ra') {
        if (emulatorProp === 'ares') {
          multiemulatorValue = 'ra';
        } else {
          // multiemulatorValue = 'ares';
          multiemulatorValue = undefined;
        }
      } else {
        multiemulatorValue = emulatorAlternative.multiemulator;
      }

      // Setting standalone vs multiemulator

      if (emulatorProp === 'ares' || emulatorProp === 'ra') {
        systemsOption = {
          ...systemsOption,
          gba: emulatorAlternative.gba === 'both' ? 'mgba' : '',
          n64: emulatorAlternative.n64 === 'both' ? 'rmg' : '',
          psp: emulatorAlternative.psp === 'both' ? 'ppsspp' : '',
          psx: emulatorAlternative.psx === 'both' ? 'duckstation' : '',
          nds: emulatorAlternative.nds === 'both' ? 'melonds' : '',
          mame: emulatorAlternative.mame === 'both' ? 'mame' : '',
          dreamcast: emulatorAlternative.mame === 'both' ? 'flycast' : '',
        };
      } else {
        if (emulatorProp === 'mgba') {
          systemsOption = {
            ...systemsOption,
            gba:
              emulatorAlternative.gba === 'both'
                ? 'multiemulator'
                : emulatorAlternative.gba === 'mgba'
                ? 'multiemulator'
                : 'mgba',
          };
        }
        if (emulatorProp === 'flycast') {
          systemsOption = {
            ...systemsOption,
            dreamcast:
              emulatorAlternative.dreamcast === 'both'
                ? 'multiemulator'
                : emulatorAlternative.dreamcast === 'flycast'
                ? 'multiemulator'
                : 'flycast',
          };
        }
        if (emulatorProp === 'duckstation') {
          systemsOption = {
            ...systemsOption,
            duckstation:
              emulatorAlternative.psx === 'both'
                ? 'multiemulator'
                : emulatorAlternative.psx === 'duckstation'
                ? 'multiemulator'
                : 'duckstation',
          };
        }
        if (emulatorProp === 'rmg') {
          systemsOption = {
            ...systemsOption,
            n64:
              emulatorAlternative.n64 === 'both'
                ? 'multiemulator'
                : emulatorAlternative.n64 === 'rmg'
                ? 'multiemulator'
                : 'rmg',
          };
        }
        if (emulatorProp === 'scummvm') {
          systemsOption = {
            ...systemsOption,
            scummvm:
              emulatorAlternative.scummvm === 'both'
                ? 'multiemulator'
                : emulatorAlternative.scummvm === 'scummvm'
                ? 'multiemulator'
                : 'scummvm',
          };
        }
        if (emulatorProp === 'ppsspp') {
          systemsOption = {
            ...systemsOption,
            psp:
              emulatorAlternative.psp === 'both'
                ? 'multiemulator'
                : emulatorAlternative.psp === 'ppsspp'
                ? 'multiemulator'
                : 'ppsspp',
          };
        }
        if (emulatorProp === 'duckstation') {
          systemsOption = {
            ...systemsOption,
            psx:
              emulatorAlternative.psx === 'both'
                ? 'multiemulator'
                : emulatorAlternative.psx === 'duckstation'
                ? 'multiemulator'
                : 'duckstation',
          };
        }
        if (emulatorProp === 'mame') {
          systemsOption = {
            ...systemsOption,
            mame:
              emulatorAlternative.mame === 'both'
                ? 'multiemulator'
                : emulatorAlternative.mame === 'mame'
                ? 'multiemulator'
                : 'mame',
          };
        }
        if (emulatorProp === 'melonds') {
          systemsOption = {
            ...systemsOption,
            nds:
              emulatorAlternative.nds === 'both'
                ? 'multiemulator'
                : emulatorAlternative.nds === 'melonds'
                ? 'multiemulator'
                : 'melonds',
          };
        }
      }

      systemsValue = {
        gba: systemsOption.gba ? systemsOption.gba : emulatorAlternative.gba,
        n64: systemsOption.n64 ? systemsOption.n64 : emulatorAlternative.n64,
        scummvm: systemsOption.scummvm
          ? systemsOption.scummvm
          : emulatorAlternative.scummvm,
        psp: systemsOption.psp ? systemsOption.psp : emulatorAlternative.psp,
        psx: systemsOption.psx ? systemsOption.psx : emulatorAlternative.psx,
        nds: systemsOption.nds ? systemsOption.nds : emulatorAlternative.nds,
        mame: systemsOption.mame
          ? systemsOption.mame
          : emulatorAlternative.mame,
      };

      console.log({ systemsValue });
    }

    setState({
      ...state,
      installEmus: {
        ...installEmus,
        [emulatorProp]: { ...installEmus[emulatorProp], status: !status },
      },
      emulatorAlternative: {
        ...emulatorAlternative,
        ...systemsValue,
        multiemulator: multiemulatorValue,
      },
    });
  };

  const [previousState, setPreviousState] = useState(installEmus);
  const [changedKeys, setChangedKeys] = useState({});
  let emuModified = '';

  useEffect(() => {
    if (lastSelected !== undefined) {
      let emuOption1;
      let emuOption2;
      let emuID1;
      let emuID2;
      let system;
      let multiemulatorName;
      let multiemulatorID;

      const keys = Object.keys(previousState);
      const changed = {};

      for (const key of keys) {
        if (previousState[key] !== installEmus[key]) {
          changed[key] = installEmus[key];
        }
      }

      setChangedKeys(changed);

      setPreviousState(installEmus);

      emuModified = '';

      // RA + Ares
      if (installEmus.ares.status && installEmus.ra.status) {
        if (emulatorAlternative.multiemulator !== 'both') {
          emuOption1 = 'ares';
          emuOption2 = 'RetroArch';
          emuID2 = 'ares';
          emuID1 = 'ra';
          system = 'multiemulator';
          modalData = {
            active: true,
            body: (
              <>
                <p>{t('EmulatorSelectorPage.classicGamesQuestion')}</p>
                <div className="h5">
                  <strong>RetroArch ({t('general.recommended')})</strong>{' '}
                  {t('EmulatorSelectorPage.hasPros')}
                </div>
                <ol className="list">
                  <li>{t('EmulatorSelectorPage.pros.retroAchievements')}</li>
                  <li>{t('EmulatorSelectorPage.pros.bezelsShaders')}</li>
                  <li>{t('EmulatorSelectorPage.pros.autoSaveStates')}</li>
                </ol>
                <div className="h5">
                  <strong>ares</strong> {t('EmulatorSelectorPage.hasPro')}
                </div>
                <ol className="list">
                  <li>{t('EmulatorSelectorPage.pros.alternativeRA')}</li>
                </ol>
                <p>{t('EmulatorSelectorPage.bothNote')}</p>
                <p>{t('EmulatorSelectorPage.parserNote')}</p>
              </>
            ),
            footer: (
              <>
                <BtnSimple
                  css="btn-simple--1"
                  type="button"
                  aria={emuOption1}
                  onClick={() =>
                    setAlternativeParser(system, emuID2, emuID1, false)
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
                    setAlternativeParser(system, emuID1, emuID2, true)
                  }
                  disabled={false}
                >
                  {emuOption2}
                </BtnSimple>
                <BtnSimple
                  css="btn-simple--3"
                  type="button"
                  aria={t('aria.goBack')}
                  onClick={() => setAlternativeParser(system, 'both', 'both')}
                >
                  {t('general.both')}
                </BtnSimple>
              </>
            ),
          };
        }
      }

      // //RA || ARES + mGBA
      if (
        (installEmus.mgba.status &&
          installEmus.ra.status &&
          lastSelected === 'mgba') ||
        (installEmus.mgba.status &&
          installEmus.ares.status &&
          lastSelected === 'mgba')
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
                <p>{t('EmulatorSelectorPage.whichEmulatorGBA')}</p>
                <div className="h5">
                  <strong>RetroArch ({t('general.recommended')})</strong>{' '}
                  {t('EmulatorSelectorPage.hasPros')}
                </div>
                <ol className="list">
                  <li>{t('EmulatorSelectorPage.pros.retroAchievements')}</li>
                  <li>{t('EmulatorSelectorPage.pros.bezelsShaders')}</li>
                  <li>{t('EmulatorSelectorPage.pros.autoSaveStates')}</li>
                </ol>
                <div className="h5">
                  <strong>mGBA</strong> {t('EmulatorSelectorPage.hasPro')}
                </div>
                <ol className="list">
                  <li>{t('EmulatorSelectorPage.pros.gbaLink')}</li>
                </ol>
                <p>{t('EmulatorSelectorPage.parserNote')}</p>
              </>
            ),
          };
          const myTimeout = setTimeout(launchModal, 500);
        }
      }

      // //RA || ARES + rmg
      if (
        (installEmus.rmg.status &&
          installEmus.ra.status &&
          lastSelected === 'rmg') ||
        (installEmus.rmg.status &&
          installEmus.ares.status &&
          lastSelected === 'rmg')
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
                <p>{t('EmulatorSelectorPage.whichEmulator')}</p>
                <div className="h5">
                  <strong>RetroArch ({t('general.recommended')})</strong>{' '}
                  {t('EmulatorSelectorPage.hasPros')}
                </div>
                <ol className="list">
                  <li>{t('EmulatorSelectorPage.pros.retroAchievements')}</li>
                  <li>{t('EmulatorSelectorPage.pros.bezelsShaders')}</li>
                  <li>{t('EmulatorSelectorPage.pros.autoSaveStates')}</li>
                </ol>
                <div className="h5">
                  <strong>RMG</strong> {t('EmulatorSelectorPage.hasPro')}
                </div>
                <ol className="list">
                  <li>{t('EmulatorSelectorPage.pros.betterPerformance')}</li>
                </ol>
                <p>{t('EmulatorSelectorPage.parserNote')}</p>
              </>
            ),
          };
          const myTimeout = setTimeout(launchModal, 500);
        }
      }

      if (
        (installEmus.flycast.status &&
          installEmus.ra.status &&
          lastSelected === 'flycast') ||
        (installEmus.flycast.status &&
          installEmus.ares.status &&
          lastSelected === 'flycast')
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
                <p>{t('EmulatorSelectorPage.whichEmulator')}</p>
                <div className="h5">
                  <strong>RetroArch</strong> {t('EmulatorSelectorPage.hasPros')}
                </div>
                <ol className="list">
                  <li>{t('EmulatorSelectorPage.pros.retroAchievements')}</li>
                  <li>{t('EmulatorSelectorPage.pros.bezelsShaders')}</li>
                  <li>{t('EmulatorSelectorPage.pros.autoSaveStates')}</li>
                </ol>
                <div className="h5">
                  <strong>Flycast</strong> {t('EmulatorSelectorPage.hasPro')}
                </div>
                <ol className="list">
                  <li>{t('EmulatorSelectorPage.pros.betterPerformance')}</li>
                </ol>
                <p>{t('EmulatorSelectorPage.parserNote')}</p>
              </>
            ),
          };
          const myTimeout = setTimeout(launchModal, 500);
        }
      }

      if (
        (installEmus.duckstation.status &&
          installEmus.ra.status &&
          lastSelected === 'duckstation') ||
        (installEmus.duckstation.status &&
          installEmus.ares.status &&
          lastSelected === 'duckstation')
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
                <p>{t('EmulatorSelectorPage.whichEmulator')}</p>
                <div className="h5">
                  <strong>RetroArch</strong> {t('EmulatorSelectorPage.hasPros')}
                </div>
                <ol className="list">
                  <li>{t('EmulatorSelectorPage.pros.retroAchievements')}</li>
                  <li>{t('EmulatorSelectorPage.pros.bezelsShaders')}</li>
                  <li>{t('EmulatorSelectorPage.pros.autoSaveStates')}</li>
                </ol>
                <div className="h5">
                  <strong>DuckStation ({t('general.recommended')})</strong>{' '}
                  {t('EmulatorSelectorPage.hasPros')}
                </div>
                <ol className="list">
                  <li>{t('EmulatorSelectorPage.pros.betterPerformance')}</li>
                </ol>
                <p>{t('EmulatorSelectorPage.parserNote')}</p>
              </>
            ),
          };
          const myTimeout = setTimeout(launchModal, 500);
        }
      }

      if (
        (installEmus.melonds.status &&
          installEmus.ra.status &&
          lastSelected === 'melonds') ||
        (installEmus.melonds.status &&
          installEmus.ares.status &&
          lastSelected === 'melonds')
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
                <p>{t('EmulatorSelectorPage.whichEmulator')}</p>
                <div className="h5">
                  <strong>RetroArch</strong> {t('EmulatorSelectorPage.hasPros')}
                </div>
                <ol className="list">
                  <li>{t('EmulatorSelectorPage.pros.retroAchievements')}</li>
                  <li>{t('EmulatorSelectorPage.pros.bezelsShaders')}</li>
                  <li>{t('EmulatorSelectorPage.pros.autoSaveStates')}</li>
                </ol>
                <div className="h5">
                  <strong>melonDS ({t('general.recommended')})</strong>{' '}
                  {t('EmulatorSelectorPage.hasPros')}
                </div>
                <ol className="list">
                  <li>
                    {t('EmulatorSelectorPage.pros.betterPerformanceScaling')}
                  </li>
                </ol>
                <p>{t('EmulatorSelectorPage.parserNote')}</p>
              </>
            ),
          };
          const myTimeout = setTimeout(launchModal, 500);
        }
      }

      if (
        (installEmus.ppsspp.status &&
          installEmus.ra.status &&
          lastSelected === 'ppsspp') ||
        (installEmus.ppsspp.status &&
          installEmus.ares.status &&
          lastSelected === 'ppsspp')
      ) {
        if (emulatorAlternative.psp !== 'both') {
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
                <p>{t('EmulatorSelectorPage.whichEmulator')}</p>
                <div className="h5">
                  <strong>RetroArch</strong> {t('EmulatorSelectorPage.hasPros')}
                </div>
                <ol className="list">
                  <li>{t('EmulatorSelectorPage.pros.retroAchievements')}</li>
                  <li>{t('EmulatorSelectorPage.pros.bezelsShaders')}</li>
                  <li>{t('EmulatorSelectorPage.pros.autoSaveStates')}</li>
                </ol>
                <div className="h5">
                  <strong>PPSSPP ({t('general.recommended')})</strong>{' '}
                  {t('EmulatorSelectorPage.hasPros')}
                </div>
                <ol className="list">
                  <li>{t('EmulatorSelectorPage.pros.betterPerformance')}</li>
                  <li>{t('EmulatorSelectorPage.pros.betterCompatibility')}</li>
                </ol>
                <p>{t('EmulatorSelectorPage.parserNote')}</p>
              </>
            ),
          };
          const myTimeout = setTimeout(launchModal, 500);
        }
      }

      if (
        (installEmus.mame.status &&
          installEmus.ra.status &&
          lastSelected === 'mame') ||
        (installEmus.mame.status &&
          installEmus.ares.status &&
          lastSelected === 'mame')
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
                <p>{t('EmulatorSelectorPage.whichEmulator')}</p>
                <div className="h5">
                  <strong>RetroArch ({t('general.recommended')})</strong>{' '}
                  {t('EmulatorSelectorPage.hasPros')}
                </div>
                <ol className="list">
                  <li>{t('EmulatorSelectorPage.pros.retroAchievements')}</li>
                  <li>{t('EmulatorSelectorPage.pros.bezelsShaders')}</li>
                  <li>{t('EmulatorSelectorPage.pros.autoSaveStates')}</li>
                  <li>{t('EmulatorSelectorPage.pros.threeCores')}</li>
                </ol>
                <p>{t('EmulatorSelectorPage.parserNote')}</p>
              </>
            ),
          };
          const myTimeout = setTimeout(launchModal, 500);
        }
      }

      if (
        (installEmus.scummvm.status &&
          installEmus.ra.status &&
          lastSelected === 'scummvm') ||
        (installEmus.scummvm.status &&
          installEmus.ares.status &&
          lastSelected === 'scummvm')
      ) {
        if (emulatorAlternative.scummvm !== 'both') {
          multiemulatorID = 'multiemulator';
          multiemulatorName = 'RetroArch';
          if (installEmus.ares.status) {
            multiemulatorID = 'multiemulator';
            multiemulatorName = 'ares';
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
                <p>{t('EmulatorSelectorPage.whichEmulator')}</p>
                <div className="h5">
                  <strong>RetroArch</strong> {t('EmulatorSelectorPage.hasPros')}
                </div>
                <ol className="list">
                  <li>{t('EmulatorSelectorPage.pros.retroAchievements')}</li>
                  <li>{t('EmulatorSelectorPage.pros.bezelsShaders')}</li>
                  <li>{t('EmulatorSelectorPage.pros.autoSaveStates')}</li>
                  <li>{t('EmulatorSelectorPage.pros.betterKeymapping')}</li>
                </ol>
                <div className="h5">
                  <strong>ScummVM ({t('general.recommended')})</strong>{' '}
                  {t('EmulatorSelectorPage.hasPros')}
                </div>
                <ol className="list">
                  <li>{t('EmulatorSelectorPage.pros.native')}</li>
                  <li>{t('EmulatorSelectorPage.pros.lessResources')}</li>
                  <li>
                    {t('EmulatorSelectorPage.pros.hasBetterCompatibility')}
                  </li>
                  <li>{t('EmulatorSelectorPage.pros.flexibleConfig')}</li>
                </ol>
                <p>{t('EmulatorSelectorPage.parserNote')}</p>
              </>
            ),
          };
          const myTimeout = setTimeout(launchModal, 500);
        }
      }

      function launchModal() {
        modalData = {
          ...modalData,
          header: (
            <span className="h4">{t('EmulatorSelectorPage.standaloneRA')}</span>
          ),
          css: 'emumodal--sm',
          footer: (
            <>
              <BtnSimple
                css="btn-simple--1"
                type="button"
                aria={emuOption1}
                onClick={() =>
                  setAlternativeParser(system, emuID2, emuID1, false)
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
                  setAlternativeParser(system, emuID1, emuID2, true)
                }
                disabled={false}
              >
                {emuOption2}
              </BtnSimple>
              <BtnSimple
                css="btn-simple--3"
                type="button"
                aria={t('aria.goBack')}
                onClick={() => setAlternativeParser(system, 'both', 'both')}
              >
                {t('general.both')}
              </BtnSimple>
            </>
          ),
        };

        setStatePage({ ...statePage, modal: modalData });
      }
    }
  }, [installEmus]);

  const restoreParsers = (restoreAlternative) => {
    // We revert back the emulators status
    const localogStateEmus = JSON.parse(localStorage.getItem('ogStateEmus'));
    const localogStateAlternativeEmus = JSON.parse(
      localStorage.getItem('ogStateAlternative')
    );
    if (restoreAlternative) {
      setState({
        ...state,
        installEmus: localogStateEmus,
        emulatorAlternative: localogStateAlternativeEmus,
        revertParsers: false,
      });
      navigate(-1);
    } else {
      setState({
        ...state,
        installEmus: localogStateEmus,
        revertParsers: false,
      });
      navigate('/emulators');
    }
  };

  const saveParsers = () => {
    const modalData = {
      active: true,
      header: <span className="h4">{t('ParserSelectorPage.updating')}</span>,
      body: <p>{t('ParserSelectorPage.updatingWait')}</p>,
      footer: <ProgressBar css="progress--success" infinite max="100" />,
      css: 'emumodal--xs',
    };

    setStatePage({
      ...statePage,
      modal: modalData,
    });

    if (system === 'win32') {
      ipcChannel.sendMessage('emudeck', [
        `parsersUpdatePrev|||setSetting emuGBA ${state.emulatorAlternative.gba}; setSetting emuDreamcast ${state.emulatorAlternative.dreamcast}; setSetting emuMAME ${state.emulatorAlternative.mame}; setSetting emuMULTI ${state.emulatorAlternative.multiemulator}; setSetting emuN64 ${state.emulatorAlternative.n64}; setSetting emuNDS ${state.emulatorAlternative.nds}; setSetting emuPSP ${state.emulatorAlternative.psp}; setSetting emuPSX ${state.emulatorAlternative.psx}; setSetting emuSCUMMVM ${state.emulatorAlternative.scummvm}; setSetting doInstallPrimeHack ${installEmus.primehack.status}; setSetting doInstallRPCS3 ${installEmus.rpcs3.status}; setSetting doInstallAzahar ${installEmus.azahar.status}; setSetting doInstallDolphin ${installEmus.dolphin.status}; setSetting doInstallPPSSPP ${installEmus.ppsspp.status}; setSetting doInstallXemu ${installEmus.xemu.status}; setSetting doInstallCemu ${installEmus.cemu.status}; setSetting doInstallXenia ${installEmus.xenia.status}; setSetting doInstallScummVM ${installEmus.scummvm.status}; setSetting doInstallRMG ${installEmus.rmg.status}; setSetting doInstallmelonDS ${installEmus.melonds.status}; setSetting doInstallVita3K ${installEmus.vita3k.status}; setSetting doInstallFlycast ${installEmus.flycast.status}; setSetting doInstallMGBA ${installEmus.mgba.status}; setSetting doInstallMAME ${installEmus.mame.status}; setSetting doInstallYuzu ${installEmus.yuzu.status}; setSetting doInstallCitron ${installEmus.citron.status};setSetting doInstallEden ${installEmus.eden.status}; setSetting doInstallRyujinx ${installEmus.ryujinx.status}; setSetting doInstallPCSX2QT ${installEmus.pcsx2.status}; setSetting doInstallDuck ${installEmus.duckstation.status}; echo "true"`,
      ]);
      ipcChannel.once(`parsersUpdatePrev`, (message) => {
        ipcChannel.sendMessage('emudeck', [
          `parsersUpdate|||SRM_Init > $null; if ($?) { Write-Output "true" }`,
        ]);
      });
    } else {
      ipcChannel.sendMessage('emudeck', [
        `parsersUpdate|||$(. ~/.config/EmuDeck/backend/functions/all.sh && setSetting emuGBA ${state.emulatorAlternative.gba} >/dev/null && setSetting emuDreamcast ${state.emulatorAlternative.dreamcast} >/dev/null && setSetting emuMAME ${state.emulatorAlternative.mame} >/dev/null && setSetting emuMULTI ${state.emulatorAlternative.multiemulator} >/dev/null && setSetting emuN64 ${state.emulatorAlternative.n64} >/dev/null && setSetting emuNDS ${state.emulatorAlternative.nds} >/dev/null && setSetting emuPSP ${state.emulatorAlternative.psp} >/dev/null && setSetting emuPSX ${state.emulatorAlternative.psx} >/dev/null && setSetting emuSCUMMVM ${state.emulatorAlternative.scummvm} >/dev/null && setSetting doInstallPrimeHack ${installEmus.primehack.status} >/dev/null && setSetting doInstallRPCS3 ${installEmus.rpcs3.status} >/dev/null && setSetting doInstallAzahar ${installEmus.azahar.status} >/dev/null && setSetting doInstallDolphin ${installEmus.dolphin.status} >/dev/null && setSetting doInstallPPSSPP ${installEmus.ppsspp.status} >/dev/null && setSetting doInstallXemu ${installEmus.xemu.status} >/dev/null && setSetting doInstallCemu ${installEmus.cemu.status} >/dev/null && setSetting doInstallXenia ${installEmus.xenia.status} >/dev/null && setSetting doInstallScummVM ${installEmus.scummvm.status} >/dev/null && setSetting doInstallRMG ${installEmus.rmg.status} >/dev/null && setSetting doInstallmelonDS ${installEmus.melonds.status} >/dev/null && setSetting doInstallVita3K ${installEmus.vita3k.status} >/dev/null && setSetting doInstallFlycast ${installEmus.flycast.status} >/dev/null && setSetting doInstallMGBA ${installEmus.mgba.status} >/dev/null && setSetting doInstallMAME ${installEmus.mame.status} >/dev/null && setSetting doInstallYuzu ${installEmus.yuzu.status} >/dev/null && setSetting doInstallCitron ${installEmus.citron.status} >/dev/null && setSetting doInstallEden ${installEmus.eden.status} >/dev/null && setSetting doInstallRyujinx ${installEmus.ryujinx.status} >/dev/null && setSetting doInstallPCSX2QT ${installEmus.pcsx2.status} >/dev/null && setSetting doInstallDuck ${installEmus.duckstation.status} >/dev/null) >/dev/null && . ~/.config/EmuDeck/backend/functions/all.sh && SRM_init`,
      ]);
    }

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
              onClick={() => restoreParsers(false)}
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
      }
      setStatePage({
        ...statePage,
        modal: modalData,
      });
    });
  };

  useEffect(() => {
    if (revertParsers === true) {
      console.log({ installEmus });
      if (system === 'win32') {
        ipcChannel.sendMessage('emudeck', [
          `installupdate|||setSetting doInstallPrimeHack ${installEmus.primehack.status} ; setSetting doInstallRPCS3 ${installEmus.rpcs3.status} ;setSetting doInstallAzahar ${installEmus.azahar.status} ; setSetting doInstallDolphin ${installEmus.dolphin.status} ; setSetting doInstallPPSSPP ${installEmus.ppsspp.status} ; setSetting doInstallXemu ${installEmus.xemu.status} ; setSetting doInstallCemu ${installEmus.cemu.status} ; setSetting doInstallXenia ${installEmus.xenia.status} ; setSetting doInstallScummVM ${installEmus.scummvm.status} ; setSetting doInstallRMG ${installEmus.rmg.status} ; setSetting doInstallmelonDS ${installEmus.melonds.status} ; setSetting doInstallVita3K ${installEmus.vita3k.status} ; setSetting doInstallFlycast ${installEmus.flycast.status} ; setSetting doInstallMGBA ${installEmus.mgba.status} ; setSetting doInstallMAME ${installEmus.mame.status} ; setSetting doInstallYuzu ${installEmus.yuzu.status} ;setSetting doInstallEden ${installEmus.eden.status} ; setSetting doInstallCitron ${installEmus.citron.status} ; setSetting doInstallRyujinx ${installEmus.ryujinx.status} ; setSetting doInstallPCSX2QT ${installEmus.pcsx2.status}`,
        ]);
      } else {
        ipcChannel.sendMessage('emudeck', [
          `installupdate|||setSetting doInstallPrimeHack ${installEmus.primehack.status} >/dev/null && setSetting doInstallRPCS3 ${installEmus.rpcs3.status} >/dev/null && setSetting doInstallAzahar ${installEmus.azahar.status} >/dev/null && setSetting doInstallDolphin ${installEmus.dolphin.status} && setSetting doInstallPPSSPP ${installEmus.ppsspp.status} >/dev/null && setSetting doInstallXemu ${installEmus.xemu.status} >/dev/null && setSetting doInstallCemu ${installEmus.cemu.status} >/dev/null && setSetting doInstallXenia ${installEmus.xenia.status} >/dev/null && setSetting doInstallScummVM ${installEmus.scummvm.status} >/dev/null && setSetting doInstallRMG ${installEmus.rmg.status} >/dev/null && setSetting doInstallmelonDS ${installEmus.melonds.status} >/dev/null && setSetting doInstallVita3K ${installEmus.vita3k.status} >/dev/null && setSetting doInstallFlycast ${installEmus.flycast.status} >/dev/null && setSetting doInstallMGBA ${installEmus.mgba.status} >/dev/null && setSetting doInstallMAME ${installEmus.mame.status} >/dev/null && setSetting doInstallYuzu ${installEmus.yuzu.status} >/dev/null && setSetting doInstallEden ${installEmus.eden.status} >/dev/null && setSetting doInstallCitron ${installEmus.citron.status} >/dev/null && setSetting doInstallRyujinx ${installEmus.ryujinx.status} >/dev/null && setSetting doInstallPCSX2QT ${installEmus.pcsx2.status} >/dev/null`,
        ]);
      }
      ipcChannel.once(`installupdate`, (message) => {
        const status = message.stdout;
        status.replace('\n', '');
        console.log({ message });
        setState({
          ...state,
          revertParsers: false,
        });
      });
    }
  }, [revertParsers]);

  // const json = JSON.stringify(state);
  // localStorage.setItem('settings_emudeck', json);

  return (
    <Wrapper>
      <Header title={t('ParserSelectorPage.title')} />
      <p className="lead">{t('ParserSelectorPage.description')}</p>
      <ParserSelector data={data} onClick={toggleEmus} images={images} />
      <footer className="footer">
        <BtnSimple
          css="btn-simple--2"
          type="button"
          onClick={() => restoreParsers(true)}
          aria={t('general.back')}
        >
          {t('general.back')}
        </BtnSimple>
        <BtnSimple
          css="btn-simple--1"
          type="button"
          aria={t('general.save')}
          onClick={() => saveParsers()}
        >
          {t('general.save')}
        </BtnSimple>
      </footer>
      <EmuModal modal={modal} />
    </Wrapper>
  );
}

export default ParserSelectorPage;
