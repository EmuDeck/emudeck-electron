import React, {
  useEffect,
  useState,
  useContext,
  useRef,
  useCallback,
} from 'react';
import { GlobalContext } from 'context/globalContext';
import Wrapper from 'components/molecules/Wrapper/Wrapper';
import GamePad from 'components/organisms/GamePad/GamePad';
import Header from 'components/organisms/Header/Header';
import Footer from 'components/organisms/Footer/Footer';
import EmuModal from 'components/molecules/EmuModal/EmuModal';

import ProgressBar from 'components/atoms/ProgressBar/ProgressBar';
import { useNavigate } from 'react-router-dom';
import { BtnSimple } from 'getbasecore/Atoms';

// import { useTranslation } from 'react-i18next';
import Welcome from 'components/organisms/Wrappers/Welcome';
import {
  iconSuccess,
  iconCloud,
  iconCompress,
  iconGear,
  iconList,
  iconMigrate,
  iconPlugin,
  iconPrize,
  iconUninstall,
  iconQuick,
  iconCustom,
  iconDoc,
  iconJoystick,
  iconPackage,
  iconDisk,
  iconHelp,
  iconScreen,
} from 'components/utils/images/icons';

function WelcomePage() {
  // const { t } = useTranslation();
  const ipcChannel = window.electron.ipcRenderer;
  const { state, setState, stateCurrentConfigs, setStateCurrentConfigs } =
    useContext(GlobalContext);
  const { system, systemName, mode, second, storagePath, gamemode, branch } =
    state;
  const [statePage, setStatePage] = useState({
    disabledNext: true,
    disabledBack: true,
    downloadComplete: !navigator.onLine ? true : null,
    updates: null,
    cloned: null,
    data: '',
    modal: undefined,
    dom: undefined,
  });
  const { disabledNext, disabledBack, updates, modal, dom } = statePage;

  const navigate = useNavigate();
  const selectMode = (value) => {
    setState({ ...state, mode: value });
    if (second) {
      navigate('/rom-storage');
    }
  };

  const closeModal = () => {
    const modalData = { active: false };
    setStatePage({
      ...statePage,
      modal: modalData,
    });
  };

  const sleep = (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };

  // show changelog after update

  useEffect(() => {
    if (systemName === 'ERROR') {
      const modalData = {
        active: true,
        header: (
          <span className="h4">Error detecting your Operating System</span>
        ),
        body: (
          <>
            <p>Click on the Close button to try again</p>
            <p>
              If the issue persists, please contact us on Discord:
              https://discord.com/invite/b9F7GpXtFP
            </p>
          </>
        ),
        footer: '',
        css: 'emumodal--xs',
      };
      setStatePage({ ...statePage, modal: modalData });
    }
  }, [modal]);

  useEffect(() => {
    let modalData;

    // Build games for the store
    ipcChannel.sendMessage('build-store');
    ipcChannel.once('build-store', (response) => {
      console.log({ response });
    });

    ipcChannel.sendMessage('check-versions');
    ipcChannel.once('check-versions', (repoVersions) => {
      // No versioning found, what to do?
      if (repoVersions === '') {
        console.log('no versioning found');
      }

      if (second === true) {
        // Thanks chatGPT lol
        const obj1 = repoVersions;
        const obj2 = stateCurrentConfigs;

        const differences = {};

        for (const key in obj1) {
          if (JSON.stringify(obj1[key]) !== JSON.stringify(obj2[key])) {
            differences[key] = obj1[key];
          }
        }

        if (Object.keys(differences).length > 0) {
          setStatePage({ ...statePage, updates: true, modal: modalData });
        }

        const json = JSON.stringify(repoVersions);
        localStorage.removeItem('current_versions_beta');
        localStorage.setItem('current_versions_beta', json);

        localStorage.setItem('ogStateAlternative', '');
        localStorage.setItem('ogStateEmus', '');

        setStateCurrentConfigs(repoVersions);
      } else if (branch === 'main') {
        modalData = {
          active: true,
          header: <span className="h4">Welcome to EmuDeck's demo!</span>,
          body: (
            <>
              <p>
                This build has limited features so you can test EmuDeck before
                its public release.
              </p>
              <p>
                This demo only contains EmulationStation and RetroArch, you can
                have access to all features now on our{' '}
                <strong>Early Access</strong> program in Patreon, or wait a
                little longer for the public release.
              </p>
              <p>
                This demo will update itself to the public release whenever it's
                available
              </p>
            </>
          ),
          css: 'emumodal--sm',
          footer: (
            <>
              <BtnSimple
                css="btn-simple--1"
                type="link"
                aria="Next"
                href="https://www.patreon.com/bePatron?u=29065992"
              >
                Check Patron
              </BtnSimple>
              <BtnSimple
                css="btn-simple--1"
                type="button"
                aria="Next"
                onClick={() => closeModal()}
              >
                Close
              </BtnSimple>
            </>
          ),
        };
        setStatePage({ ...statePage, modal: modalData });
      }
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (mode != null) {
      setStatePage({ ...statePage, disabledNext: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  return (
    <div style={{ height: '100vh' }}>
      <Wrapper aside={false}>
        {second === false && (
          <Header title={`Welcome to EmuDeck for ${systemName}`} />
        )}

        {second === true && (
          <Header title={`Welcome back to EmuDeck for ${systemName}`} />
        )}
        {systemName !== 'ERROR' && (
          <Welcome
            updates={updates}
            alert={
              second
                ? ``
                : 'Do you need help installing EmuDeck for the first time? <a href="https://youtu.be/Y5r2WZAImuY" target="_blank">Check out this guide</a>'
            }
            alertCSS="alert--info"
            onClick={selectMode}
          />
        )}
        {second === false && systemName !== 'ERROR' && (
          <Footer
            back={second ? 'tools-and-stuff' : false}
            backText={second ? 'Tools & stuff' : 'Install EmuDeck First'}
            third={system !== 'win32' ? 'change-log' : ''}
            thirdText="See changelog"
            fourthText="Exit EmuDeck"
            next="rom-storage"
            exit={gamemode}
            disabledNext={second ? false : disabledNext}
            disabledBack={second ? false : disabledBack}
          />
        )}
        <EmuModal modal={modal} />
      </Wrapper>
    </div>
  );
}

export default WelcomePage;
