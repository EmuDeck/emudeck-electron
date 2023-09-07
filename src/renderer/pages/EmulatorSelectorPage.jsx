import React, { useState, useContext, useEffect } from 'react';
import { GlobalContext } from 'context/globalContext';
import Wrapper from 'components/molecules/Wrapper/Wrapper';
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
  imgxenia,
  imgsrm,
  imgrmg,
  imgscummvm,
  imgsupermodelista,
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
  scummvm: imgscummvm,
  supermodelista: imgsupermodelista,
  esde: imgesde,
  rmg: imgrmg,
  mgba: imgmgba,
  xenia: imgxenia,
  srm: imgsrm,
};

function EmulatorSelectorPage() {
  const { state, setState } = useContext(GlobalContext);
  const { device, installEmus, emulatorAlternative } = state;

  const [statePage, setStatePage] = useState({
    disabledNext: false,
    disabledBack: false,
    data: '',
    modal: false,
    lastSelected: undefined,
  });
  const { disabledNext, disabledBack, data, modal, lastSelected } = statePage;

  const setAlternativeEmulator = (system, emuName, emuName2, disable) => {
    

    if (emuName == 'ra' || emuName == 'ares') {
      

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
    } else {
      if (emuName2 === 'multiemulator' || emuName2 === 'both') {
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
    }
    closeModal();
  };

  const closeModal = () => {
    setStatePage({ ...statePage, modal: false });
  };
  //This funciones enable / disable RA, Ares, standalone alternative emulators when unselecting any of them
  //   const defineMultiOrStandalone = (standalone) => {
  //     let system, emuToEnable;
  //     switch (standalone) {
  //       case 'mgba':
  //         system = 'gba';
  //       case 'duckstation':
  //         system = 'psx';
  //       case 'melonds':
  //         system = 'nds';
  //       case 'ppsspp':
  //         system = 'psp';
  //       case 'scummvm':
  //         system = 'scummvm';
  //       case 'rmg':
  //         system = 'n64';
  //     }
  //
  //     const emuToCheck = installEmus[standalone];
  //
  //     if (installEmus.ra.status && emuToCheck.status) {
  //       emuToEnable = 'ra';
  //     } else if (installEmus.ares.status && emuToCheck.status) {
  //       emuToEnable = 'ares';
  //     } else if (!installEmus[standalone][status]) {
  //       emuToEnable = standalone;
  //     }
  //
  //     return {
  //       system: system,
  //       emuToEnable: emuToEnable,
  //     };
  //   };
  let modalData = {};
  const toggleEmus = (emulatorProp) => {
    const { status } = installEmus[emulatorProp];
    let enable = status ? false : true;
    let multiemulatorValue;
    let systemsValue = {};
    let systemsOption = {};

    //Enabling
    if (enable) {
      if (emulatorProp === 'xenia') {
        modalData = {
          active: true,
          header: <span className="h4">Xenia Emulator - Disclaimer</span>,
          body: (
            <>
              <p>
                Xenia is an experimental Emulator, don't expect a lot of games
                to work.
              </p>
            </>
          ),
        };
        //setStatePage({ ...statePage, modal: modalData });
      }

      //Setting multiemulator
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
        systemsOption = {
          ...systemsOption,
          gba: 'multiemulator',
          n64: 'multiemulator',
          scummvm: 'multiemulator',
          psp: 'multiemulator',
          melonds: 'multiemulator',
          mame: 'multiemulator',
          multiemulator: emulatorProp,
        };
      } else {
        if (emulatorProp === 'mgba') {
          systemsOption = {
            ...systemsOption,
            gba: emulatorAlternative.gba === 'both' ? 'multiemulator' : 'mgba',
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
        if (emulatorProp === 'melonDS') {
          systemsOption = {
            ...systemsOption,
            nds:
              emulatorAlternative.nds === 'both' ? 'multiemulator' : 'melonDS',
          };
        }
      }

      //ARREGLAR ESTO

      systemsValue = {
        gba: systemsOption.gba ? systemsOption.gba : emulatorAlternative.gba,
        n64: systemsOption.n64 ? systemsOption.n64 : emulatorAlternative.n64,
        scummvm: systemsOption.scummvm
          ? systemsOption.scummvm
          : emulatorAlternative.scummvm,
        psp: systemsOption.psp ? systemsOption.psp : emulatorAlternative.psp,
        nds: systemsOption.nds ? systemsOption.nds : emulatorAlternative.nds,
        mame: systemsOption.mame
          ? systemsOption.mame
          : emulatorAlternative.mame,
      };

      //Setting standalone vs multiemulator
      //       if (emulatorProp === 'mgba') {
      //         systems.gba = 'mgba';
      //       } else if (emulatorAlternative.gba !== 'mgba') {
      //         systems.gba = multiemulatorValue;
      //       }
      //
      //       if (emulatorProp === 'rmg') {
      //         systems.n64 = 'rmg';
      //       } else if (emulatorAlternative.n64 !== 'rmg') {
      //         systems.n64 = multiemulatorValue;
      //       }
      //
      //       systems: {
      //         gba: systems.gba;
      //         n64: systems.n64;
      //       }

      //Disabling
    } else {
      setStatePage({ ...statePage, lastSelected: '' });
      //Setting multiemulator
      if (emulatorProp === 'ares' || emulatorProp === 'ra') {
        if (emulatorProp === 'ares') {
          multiemulatorValue = 'ra';
        } else {
          multiemulatorValue = 'ares';
        }
      } else {
        multiemulatorValue = emulatorAlternative.multiemulator;
      }

      //Setting standalone vs multiemulator

      if (emulatorProp === 'ares' || emulatorProp === 'ra') {
        systemsOption = {
          ...systemsOption,
          gba: emulatorAlternative.gba !== 'both' ? 'multiemulator' : 'mgba',
          n64: emulatorAlternative.n64 !== 'both' ? 'multiemulator' : 'rmg',
          psp: emulatorAlternative.psp !== 'both' ? 'multiemulator' : 'ppsspp',
          psx:
            emulatorAlternative.psx !== 'both'
              ? 'multiemulator'
              : 'duckstation',
          nds: emulatorAlternative.nds !== 'both' ? 'multiemulator' : 'melonDS',
          mame: emulatorAlternative.mame !== 'both' ? 'multiemulator' : 'mame',
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
        if (emulatorProp === 'melonDS') {
          systemsOption = {
            ...systemsOption,
            nds:
              emulatorAlternative.nds === 'both'
                ? 'multiemulator'
                : emulatorAlternative.nds === 'melonDS'
                ? 'multiemulator'
                : 'melonDS',
          };
        }

        // systemsOption = {
        //   ...systemsOption,
        //   gba:
        //     emulatorAlternative.gba === 'both'
        //       ? 'multiemulator'
        //       : emulatorAlternative.gba === 'mgba'
        //       ? 'multiemulator'
        //       : 'mgba',
        //   n64:
        //     emulatorAlternative.n64 === 'both'
        //       ? 'multiemulator'
        //       : emulatorAlternative.n64 === 'rmg'
        //       ? 'rmg'
        //       : 'multiemulator',
        //   psp:
        //     emulatorAlternative.psp === 'both'
        //       ? 'multiemulator'
        //       : emulatorAlternative.psp === 'ppsspp'
        //       ? 'ppsspp'
        //       : 'multiemulator',
        //   psx:
        //     emulatorAlternative.psx === 'both'
        //       ? 'multiemulator'
        //       : emulatorAlternative.psx === 'duckstation'
        //       ? 'duckstation'
        //       : 'multiemulator',
        //   nds:
        //     emulatorAlternative.nds === 'both'
        //       ? 'multiemulator'
        //       : emulatorAlternative.nds === 'melonDS'
        //       ? 'melonDS'
        //       : 'multiemulator',
        //   mame:
        //     emulatorAlternative.mame === 'both'
        //       ? 'multiemulator'
        //       : emulatorAlternative.mame === 'mame'
        //       ? 'mame'
        //       : 'multiemulator',
        // };
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

      //       if (emulatorProp === 'mgba') {
      //         systems.gba = multiemulatorValue;
      //       } else if (emulatorProp === 'ares' || emulatorProp === 'ra') {
      //         if (emulatorAlternative.gba === 'mgba') {
      //           systems.gba = 'mgba';
      //         } else {
      //           systems.gba = multiemulatorValue;
      //         }
      //       }
      //
      //       if (emulatorProp === 'rmg') {
      //         systems.n64 = multiemulatorValue;
      //       } else if (emulatorProp === 'ares' || emulatorProp === 'ra') {
      //         if (emulatorAlternative.n64 === 'rmg') {
      //           systems.n64 = 'rmg';
      //         } else {
      //           systems.n64 = multiemulatorValue;
      //         }
      //       }
      //
      //       systems: {
      //         gba: systems.gba;
      //         n64: systems.n64;
      //       }
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
    let emuOption1,
      emuOption2,
      emuID1,
      emuID2,
      system,
      multiemulatorName,
      multiemulatorID;

    const keys = Object.keys(previousState);
    const changed = {};

    for (const key of keys) {
      if (previousState[key] !== installEmus[key]) {
        changed[key] = installEmus[key];
      }
    }

    setChangedKeys(changed);

    setPreviousState(installEmus);

    //     installEmus.forEach((element) => 
    //
    //
    //     
    //     Object.keys(changedKeys).map((key) => (emuModified = key));
    //     if (
    //       installEmus[emuModified] !== undefined &&
    //       installEmus[emuModified].status
    //     ) {
    //       
    //
    //     }

    emuModified = '';

    //RA + Ares
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
                You've selected two emulators for the same system, which one do
                you want to use for Classic games like Super Nintendo, Nes,
                Nintendo 64, Dreamcast, etc?
              </p>
              <div className="h5">
                <strong>RetroArch</strong> has these pros:
              </div>
              <ol className="list">
                <li>RetroAchievements</li>
                <li>Bezels & Shaders</li>
                <li>Auto Save States</li>
                <li>
                  Multiplatform ( Mac, Linux, Windows, Anbernic, Batocera, etc )
                </li>
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
      (installEmus.mgba.status && installEmus.ra.status) ||
      (installEmus.mgba.status && installEmus.ares.status)
    ) {
      if (lastSelected === 'mgba') {
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
                You've selected two emulators for the same system, which one do
                you want to use for GameBoy Advance.
              </p>
              <div className="h5">
                <strong>RetroArch</strong> has these pros:
              </div>
              <ol className="list">
                <li>RetroAchievements</li>
                <li>Bezels & Shaders</li>
                <li>Auto Save States</li>
                <li>
                  Multiplatform ( Mac, Linux, Windows, Anbernic, Batocera, etc )
                </li>
              </ol>
              <div className="h5">
                <strong>mGBA</strong> has this pro:
              </div>
              <ol className="list">
                <li>GBA Link</li>
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
      (installEmus.rmg.status && installEmus.ra.status) ||
      (installEmus.rmg.status && installEmus.ares.status)
    ) {
      //alert(emuModified);
      if (lastSelected === 'rmg') {
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
              <p>
                You've selected two emulators for the same system, which one do
                you want to use
              </p>
              <div className="h5">
                <strong>RetroArch</strong> has these pros:
              </div>
              <ol className="list">
                <li>RetroAchievements</li>
                <li>Bezels & Shaders</li>
                <li>Auto Save States</li>
                <li>
                  Multiplatform ( Mac, Linux, Windows, Anbernic, Batocera, etc )
                </li>
              </ol>
              <div className="h5">
                <strong>RMG</strong> has this pro:
              </div>
              <ol className="list">
                <li>NPI</li>
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
      (installEmus.duckstation.status && installEmus.ra.status) ||
      (installEmus.duckstation.status && installEmus.ares.status)
    ) {
      if (lastSelected === 'duckstation') {
        multiemulatorID = 'multiemulator';
        multiemulatorName = 'RetroArch';
        if (installEmus.ares.status) {
          multiemulatorID = 'multiemulator';
          multiemulatorName = 'ares';
        }

        emuOption1 = 'duckstation';
        emuOption2 = multiemulatorName;
        emuID2 = 'duckstation';
        emuID1 = multiemulatorID;
        system = 'psx';
        modalData = {
          active: true,
          body: (
            <>
              <p>
                You've selected two emulators for the same system, which one do
                you want to use
              </p>
              <div className="h5">
                <strong>RetroArch</strong> has these pros:
              </div>
              <ol className="list">
                <li>RetroAchievements</li>
                <li>Bezels & Shaders</li>
                <li>Auto Save States</li>
                <li>
                  Multiplatform ( Mac, Linux, Windows, Anbernic, Batocera, etc )
                </li>
              </ol>
              <div className="h5">
                <strong>duckstation</strong> has this pro:
              </div>
              <ol className="list">
                <li>NPI</li>
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
      (installEmus.melonds.status && installEmus.ra.status) ||
      (installEmus.melonds.status && installEmus.ares.status)
    ) {
      if (lastSelected === 'melonds') {
        multiemulatorID = 'multiemulator';
        multiemulatorName = 'RetroArch';
        if (installEmus.ares.status) {
          multiemulatorID = 'multiemulator';
          multiemulatorName = 'ares';
        }

        emuOption1 = 'melonds';
        emuOption2 = multiemulatorName;
        emuID2 = 'melonDS';
        emuID1 = multiemulatorID;
        system = 'nds';
        modalData = {
          active: true,
          body: (
            <>
              <p>
                You've selected two emulators for the same system, which one do
                you want to use
              </p>
              <div className="h5">
                <strong>RetroArch</strong> has these pros:
              </div>
              <ol className="list">
                <li>RetroAchievements</li>
                <li>Bezels & Shaders</li>
                <li>Auto Save States</li>
                <li>
                  Multiplatform ( Mac, Linux, Windows, Anbernic, Batocera, etc )
                </li>
              </ol>
              <div className="h5">
                <strong>melonDS</strong> has this pro:
              </div>
              <ol className="list">
                <li>NPI</li>
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
      (installEmus.ppsspp.status && installEmus.ra.status) ||
      (installEmus.ppsspp.status && installEmus.ares.status)
    ) {
      if (lastSelected === 'ppsspp') {
        multiemulatorID = 'multiemulator';
        multiemulatorName = 'RetroArch';
        if (installEmus.ares.status) {
          multiemulatorID = 'multiemulator';
          multiemulatorName = 'ares';
        }

        emuOption1 = 'ppsspp';
        emuOption2 = multiemulatorName;
        emuID2 = 'ppsspp';
        emuID1 = multiemulatorID;
        system = 'psp';
        modalData = {
          active: true,
          body: (
            <>
              <p>
                You've selected two emulators for the same system, which one do
                you want to use
              </p>
              <div className="h5">
                <strong>RetroArch</strong> has these pros:
              </div>
              <ol className="list">
                <li>RetroAchievements</li>
                <li>Bezels & Shaders</li>
                <li>Auto Save States</li>
                <li>
                  Multiplatform ( Mac, Linux, Windows, Anbernic, Batocera, etc )
                </li>
              </ol>
              <div className="h5">
                <strong>ppsspp</strong> has this pro:
              </div>
              <ol className="list">
                <li>NPI</li>
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
      (installEmus.mame.status && installEmus.ra.status) ||
      (installEmus.mame.status && installEmus.ares.status)
    ) {
      if (lastSelected === 'mame') {
        multiemulatorID = 'multiemulator';
        multiemulatorName = 'RetroArch';
        if (installEmus.ares.status) {
          multiemulatorID = 'multiemulator';
          multiemulatorName = 'ares';
        }

        emuOption1 = 'mame';
        emuOption2 = multiemulatorName;
        emuID2 = 'mame';
        emuID1 = multiemulatorID;
        system = 'mame';
        modalData = {
          active: true,
          body: (
            <>
              <p>
                You've selected two emulators for the same system, which one do
                you want to use
              </p>
              <div className="h5">
                <strong>RetroArch</strong> has these pros:
              </div>
              <ol className="list">
                <li>RetroAchievements</li>
                <li>Bezels & Shaders</li>
                <li>Auto Save States</li>
                <li>
                  Multiplatform ( Mac, Linux, Windows, Anbernic, Batocera, etc )
                </li>
              </ol>
              <div className="h5">
                <strong>mame</strong> has this pro:
              </div>
              <ol className="list">
                <li>NPI</li>
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
      (installEmus.scummvm.status && installEmus.ra.status) ||
      (installEmus.scummvm.status && installEmus.ares.status)
    ) {
      if (lastSelected === 'scummvm') {
        multiemulatorID = 'multiemulator';
        multiemulatorName = 'RetroArch';
        if (installEmus.ares.status) {
          multiemulatorID = 'multiemulator';
          multiemulatorName = 'ares';
        }

        emuOption1 = 'scummvm';
        emuOption2 = multiemulatorName;
        emuID2 = 'scummvm';
        emuID1 = multiemulatorID;
        system = 'scummvm';
        modalData = {
          active: true,
          body: (
            <>
              <p>
                You've selected two emulators for the same system, which one do
                you want to use
              </p>
              <div className="h5">
                <strong>RetroArch</strong> has these pros:
              </div>
              <ol className="list">
                <li>RetroAchievements</li>
                <li>Bezels & Shaders</li>
                <li>Auto Save States</li>
                <li>
                  Multiplatform ( Mac, Linux, Windows, Anbernic, Batocera, etc )
                </li>
              </ol>
              <div className="h5">
                <strong>scummvm</strong> has this pro:
              </div>
              <ol className="list">
                <li>NPI</li>
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
        header: <span className="h4">Conflicting Emulators</span>,
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
  }, [installEmus]);

  return (
    <Wrapper>
      <Header title="Emulators for" bold={`${device}`} />
      <EmulatorSelector data={data} onClick={toggleEmus} images={images} />
      <Footer
        next="emulator-configuration"
        disabledNext={disabledNext}
        disabledBack={disabledBack}
      />
      <EmuModal modal={modal} />
    </Wrapper>
  );
}

export default EmulatorSelectorPage;
