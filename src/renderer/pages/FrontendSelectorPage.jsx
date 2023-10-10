import React, { useState, useContext, useRef, useEffect } from 'react';
import { GlobalContext } from 'context/globalContext';
import Wrapper from 'components/molecules/Wrapper/Wrapper';
import GamePad from 'components/organisms/GamePad/GamePad';
import Header from 'components/organisms/Header/Header';
import Footer from 'components/organisms/Footer/Footer';
import EmuModal from 'components/molecules/EmuModal/EmuModal';
import FrontendSelector from 'components/organisms/Wrappers/FrontendSelector';
import { BtnSimple } from 'getbasecore/Atoms';
import {
  imgFrontESDE,
  themesPegasusGameOS,
  imgFrontSteam,
  rbsimple2,
  imgSTEAM,
} from 'components/utils/images/images';

const images = {
  esde: rbsimple2,
  pegasus: themesPegasusGameOS,
  steam: imgSTEAM,
};

function FrontendSelectorPage() {
  const { state, setState } = useContext(GlobalContext);
  const { device, installFrontends } = state;

  const [statePage, setStatePage] = useState({
    disabledNext: false,
    disabledBack: false,
    data: '',
    modal: false,
    lastSelected: undefined,
    dom: undefined,
  });
  const { disabledNext, disabledBack, modal, lastSelected, dom } = statePage;

  const closeModal = () => {
    setStatePage({ ...statePage, modal: false });
  };

  const setAlternativeFrontend = (
    system,
    frontendToEnable,
    frontendToDisable
  ) => {
    if (frontendToEnable !== 'both') {
      setState({
        ...state,
        installFrontends: {
          ...installFrontends,
          [frontendToEnable]: {
            ...installFrontends[frontendToEnable],
            status: true,
          },
          [frontendToDisable]: {
            ...installFrontends[frontendToDisable],
            status: false,
          },
        },
      });
    }

    closeModal();
  };

  let modalData = {};
  const toggleEmus = (frontendProp) => {
    console.log(installFrontends[frontendProp]);

    const { status } = installFrontends[frontendProp];
    const enable = !status;
    const systemsValue = {};
    const systemsOption = {};

    // Enabling
    if (enable) {
      console.log('enable');
    } else {
      console.log('disable');
    }

    setStatePage({
      ...statePage,
      lastSelected: frontendProp,
    });

    setState({
      ...state,
      installFrontends: {
        ...installFrontends,
        [frontendProp]: {
          ...installFrontends[frontendProp],
          status: !status,
        },
      },
    });
  };

  const [previousState, setPreviousState] = useState(installFrontends);
  const [changedKeys, setChangedKeys] = useState({});
  const emuModified = '';
  useEffect(() => {
    let emuOption1;
    let emuOption2;
    let emuID1;
    let emuID2;
    let system;
    let multifrontendName;
    let multifrontendID;

    const keys = Object.keys(previousState);
    const changed = {};

    for (const key of keys) {
      if (previousState[key] !== installFrontends[key]) {
        changed[key] = installFrontends[key];
      }
    }

    setChangedKeys(changed);

    setPreviousState(installFrontends);

    if (installFrontends.pegasus.status && installFrontends.esde.status) {
      if (lastSelected === 'pegasus' || lastSelected === 'esde') {
        emuOption1 = 'Pegasus';
        emuOption2 = 'Emulation Station DE';
        emuID1 = 'pegasus';
        emuID2 = 'esde';
        system = 'pegasus';
        modalData = {
          active: true,
          body: (
            <>
              <p>You've selected two frontends that are similar</p>
              <div className="h5">
                <strong>Pegasus</strong> has these pros:
              </div>
              <ol className="list">
                <li>Lorem Ipsum</li>
              </ol>
              <div className="h5">
                <strong>Emulation Station</strong> has these pros:
              </div>
              <ol className="list">
                <li>Lorem Ipsum</li>
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
        header: <span className="h4">Conflicting Frontends</span>,
        css: 'emumodal--sm',
        footer: (
          <>
            <BtnSimple
              css="btn-simple--1"
              type="button"
              aria={emuOption1}
              onClick={() => setAlternativeFrontend(system, emuID1, emuID2)}
              disabled={false}
            >
              {emuOption1}
            </BtnSimple>
            <BtnSimple
              css="btn-simple--2"
              type="button"
              aria={emuOption2}
              onClick={() => setAlternativeFrontend(system, emuID2, emuID1)}
              disabled={false}
            >
              {emuOption2}
            </BtnSimple>
            <BtnSimple
              css="btn-simple--3"
              type="button"
              aria="Go Back"
              onClick={() => setAlternativeFrontend(system, 'both')}
            >
              Both
            </BtnSimple>
          </>
        ),
      };

      setStatePage({ ...statePage, modal: modalData });
    }
  }, [installFrontends]);

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
        <Header title="Frontends for" bold={`${device}`} />
        <FrontendSelector
          lastSelected={lastSelected}
          onClick={toggleEmus}
          images={images}
        />
        <Footer
          next={
            installFrontends.pegasus.status ? 'pegasus-theme' : 'confirmation'
          }
          disabledNext={disabledNext}
          disabledBack={disabledBack}
        />
        <EmuModal modal={modal} />
      </Wrapper>
    </div>
  );
}

export default FrontendSelectorPage;
