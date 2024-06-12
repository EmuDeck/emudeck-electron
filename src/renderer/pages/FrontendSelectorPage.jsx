import { useTranslation } from 'react-i18next';
import React, { useState, useContext, useRef, useEffect } from 'react';
import { GlobalContext } from 'context/globalContext';
import Wrapper from 'components/molecules/Wrapper/Wrapper';

import Header from 'components/organisms/Header/Header';
import Footer from 'components/organisms/Footer/Footer';
import EmuModal from 'components/molecules/EmuModal/EmuModal';
import FrontendSelector from 'components/organisms/Wrappers/FrontendSelector';
import { BtnSimple } from 'getbasecore/Atoms';
import {
  themesPegasusGameOS,
  rbsimple2,
  imgSTEAM,
  imgDeckyRomLauncher,
} from 'components/utils/images/images';

const images = {
  esde: rbsimple2,
  pegasus: themesPegasusGameOS,
  steam: imgSTEAM,
  deckyromlauncher: imgDeckyRomLauncher,
};

function FrontendSelectorPage() {
  const { t, i18n } = useTranslation();
  const { state, setState } = useContext(GlobalContext);
  const { device, installFrontends, mode, system } = state;

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

  const setAlternativeFrontend = (frontendToEnable, frontendToDisable) => {
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
      if (frontendProp === 'steam') {
        const modalData = {
          active: true,
          header: <span className="h4">You still need Steam</span>,
          css: 'emumodal--sm',
          body: (
            <p>
              Remember that even if you don't want to add your games to your
              Steam Library, you still need to run Steam Rom Manager at the end
              on the installation to add the other Frontends to Steam and you
              have to launch them from there so things like CloudSync and
              controllers hotkeys work.
            </p>
          ),
        };
        setStatePage({
          ...statePage,
          modal: modalData,
          lastSelected: frontendProp,
        });
      }

      console.log('disable');
    }

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
      return;
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
              onClick={() => setAlternativeFrontend(emuID1, emuID2)}
              disabled={false}
            >
              {emuOption1}
            </BtnSimple>
            <BtnSimple
              css="btn-simple--2"
              type="button"
              aria={emuOption2}
              onClick={() => setAlternativeFrontend(emuID2, emuID1)}
              disabled={false}
            >
              {emuOption2}
            </BtnSimple>
            <BtnSimple
              css="btn-simple--3"
              type="button"
              aria="Go Back"
              onClick={() => setAlternativeFrontend('both')}
            >
              Both
            </BtnSimple>
          </>
        ),
      };

      setStatePage({ ...statePage, modal: modalData });
    }
  }, [installFrontends]);

  const nextPage = () => {
    if (installFrontends.pegasus.status && installFrontends.esde.status) {
      return 'esde-theme';
    }
    if (installFrontends.esde.status) {
      return 'esde-theme';
    }
    if (installFrontends.pegasus.status) {
      return 'pegasus-theme';
    }
    if (installFrontends.steam.status) {
      return 'confirmation';
    }

    // if (system !== 'SteamOS') {
    //   return 'emulator-resolution';
    // }
    // if (mode === 'easy') {
    //   return 'end';
    // }
    // return 'confirmation';
  };

  return (
    <Wrapper>
      <Header title={t('FrontendSelectorPage.title', { device: device })} />
      <p className="lead">{t('FrontendSelectorPage.description')}</p>
      <FrontendSelector
        installFrontends={installFrontends}
        lastSelected={lastSelected}
        onClick={toggleEmus}
        images={images}
      />
      <Footer
        next={nextPage()}
        disabledNext={
          !installFrontends.esde.status &&
          !installFrontends.pegasus.status &&
          !installFrontends.steam.status
        }
        disabledBack={disabledBack}
      />
      <EmuModal modal={modal} />
    </Wrapper>
  );
}

export default FrontendSelectorPage;
