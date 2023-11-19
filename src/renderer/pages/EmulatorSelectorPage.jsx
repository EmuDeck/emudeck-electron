import React, { useState, useContext, useRef, useEffect } from 'react';
import { GlobalContext } from 'context/globalContext';
import Wrapper from 'components/molecules/Wrapper/Wrapper';
import GamePad from 'components/organisms/GamePad/GamePad';
import Header from 'components/organisms/Header/Header';
import Footer from 'components/organisms/Footer/Footer';
import EmuModal from 'components/molecules/EmuModal/EmuModal';
import EmulatorSelector from 'components/organisms/Wrappers/EmulatorSelector';
import { BtnSimple } from 'getbasecore/Atoms';
import {
  imgra,
  imgares,
  imgdolphin,
  imgprimehack,
  imgppsspp,
  imgduckstation,
  imgcitra,
  imgpcsx2,
  imgrpcs3,
  imgyuzu,
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
  imgsupermodelista,
  imgFrontESDE,
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
  citra: imgcitra,
  pcsx2: imgpcsx2,
  rpcs3: imgrpcs3,
  yuzu: imgyuzu,
  melonds: imgmelonds,
  ryujinx: imgryujinx,
  cemu: imgcemu,
  xemu: imgxemu,
  mame: imgmame,
  vita3k: imgvita3k,
  flycast: imgflycast,
  scummvm: imgscummvm,
  supermodelista: imgsupermodelista,
  esde: imgFrontESDE,
  rmg: imgrmg,
  mgba: imgmgba,
  xenia: imgxenia,
  srm: imgsrm,
};

function EmulatorSelectorPage() {
  const { state, setState } = useContext(GlobalContext);
  const { device, installEmus, emulatorAlternative, second } = state;

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
          header: <span className="h4">Xenia Emulator - Disclaimer</span>,
          body: (
            <p>
              Xenia is an experimental Emulator, don't expect a lot of games to
              work.
            </p>
          ),
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
        if (emulatorProp === 'flycast') {
          systemsOption = {
            ...systemsOption,
            dreamcast:
              emulatorAlternative.dreamcast === 'both'
                ? 'multiemulator'
                : 'flycast',
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
        dreamcast: systemsOption.dreamcast
          ? systemsOption.dreamcast
          : emulatorAlternative.dreamcast,
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
          dreamcast: emulatorAlternative.dreamcast === 'both' ? 'flycast' : '',
          nds: emulatorAlternative.nds === 'both' ? 'melonds' : '',
          mame: emulatorAlternative.mame === 'both' ? 'mame' : '',
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
        if (emulatorProp === 'flycast') {
          systemsOption = {
            ...systemsOption,
            flycast:
              emulatorAlternative.dreamcast === 'both'
                ? 'multiemulator'
                : emulatorAlternative.dreamcast === 'flycast'
                ? 'multiemulator'
                : 'flycast',
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
        dreamcast: systemsOption.dreamcast
          ? systemsOption.dreamcast
          : emulatorAlternative.dreamcast,
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
                <p>
                  You've selected two emulators for the same systems, which one
                  do you want to use for Classic games like Super Nintendo, Nes,
                  Nintendo 64, Dreamcast, etc?
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
                  <strong>ares</strong> has this pro:
                </div>
                <ol className="list">
                  <li>Alternative for people that dislike RetroArch</li>
                </ol>
                <p>
                  If you chose Both, we will use Ares when available, and
                  RetroArch for all the other cores
                </p>
                <p>
                  We will only add the parser according to your selection so you
                  don't end up with duplicates in your library.
                </p>
              </>
            ),
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
                  onClick={() => setAlternativeEmulator(system, 'both', 'both')}
                >
                  Both
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
                <p>Which emulator do you want to use for GameBoy Advance.</p>
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
                  We will only add the parser according to your selection so you
                  don't end up with duplicates in your library.
                </p>
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
                  We will only add the parser according to your selection so you
                  don't end up with duplicates in your library.
                </p>
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
                  We will only add the parser according to your selection so you
                  don't end up with duplicates in your library.
                </p>
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
                  We will only add the parser according to your selection so you
                  don't end up with duplicates in your library.
                </p>
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
                  We will only add the parser according to your selection so you
                  don't end up with duplicates in your library.
                </p>
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
                  We will only add the parser according to your selection so you
                  don't end up with duplicates in your library.
                </p>
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
                  We will only add the parser according to your selection so you
                  don't end up with duplicates in your library.
                </p>
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
          system = 'flycast';
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
                </ol>
                <div className="h5">
                  <strong>Flycast</strong> has this pro:
                </div>
                <ol className="list">
                  <li>Better performance</li>
                </ol>
                <p>
                  We will only add the parser according to your selection so you
                  don't end up with duplicates in your library.
                </p>
              </>
            ),
          };
          const myTimeout = setTimeout(launchModal, 500);
        }
      }

      function launchModal() {
        modalData = {
          ...modalData,
          header: <span className="h4">RetroArch or Standalone Emulator?</span>,
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
                onClick={() => setAlternativeEmulator(system, 'both', 'both')}
              >
                Both
              </BtnSimple>
            </>
          ),
        };

        setStatePage({ ...statePage, modal: modalData });
      }
    }
  }, [installEmus]);

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
        <Header title="Emulators and tools for" bold={`${device}`} />
        <EmulatorSelector data={data} onClick={toggleEmus} images={images} />
        <Footer
          next="emulator-configuration"
          disabledNext={disabledNext}
          disabledBack={disabledBack}
        />
        <EmuModal modal={modal} />
      </Wrapper>
    </div>
  );
}

export default EmulatorSelectorPage;
