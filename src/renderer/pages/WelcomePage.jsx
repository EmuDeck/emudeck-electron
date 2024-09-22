import { useTranslation } from 'react-i18next';
import React, {
  useEffect,
  useState,
  useContext,
  useRef,
  useCallback,
} from 'react';
import { GlobalContext } from 'context/globalContext';
import Wrapper from 'components/molecules/Wrapper/Wrapper';

import Header from 'components/organisms/Header/Header';
import Footer from 'components/organisms/Footer/Footer';
import EmuModal from 'components/molecules/EmuModal/EmuModal';
import Main from 'components/organisms/Main/Main';
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
  const { t, i18n } = useTranslation();
  // const { t } = useTranslation();
  const ipcChannel = window.electron.ipcRenderer;
  const { state, setState } = useContext(GlobalContext);
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
    if (value === 'android') {
      navigate('/android-welcome');
    } else {
      setState({ ...state, mode: value });
      if (second) {
        navigate('/rom-storage');
      }
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
        header: <span className="h4">{t('WelcomePage.errorModal.title')}</span>,
        body: t('WelcomePage.errorModal.description'),
        footer: '',
        css: 'emumodal--xs',
      };
      setStatePage({ ...statePage, modal: modalData });
    }
  }, [modal]);

  useEffect(() => {
    // Build games for the store
    ipcChannel.sendMessage('build-store');
    ipcChannel.once('build-store', (response) => {
      console.log({ response });
    });

    ipcChannel.sendMessage('check-versions');
    ipcChannel.once('check-versions', (repoVersions) => {
      // No versioning found, what to do?
      console.log({ repoVersions });
      if (repoVersions === '') {
        console.log('no versioning found');
      }
      const currentVersions = JSON.parse(
        localStorage.getItem('current_versions')
      );
      // If we don't have a previous log of the version, we make the one in the repo the default
      if (!currentVersions) {
        const json = JSON.stringify(repoVersions);
        localStorage.setItem('current_versions', json);
      }

      if (second === true) {
        localStorage.setItem('ogStateAlternative', '');
        localStorage.setItem('ogStateEmus', '');
      }

      if (second === true && mode === 'expert') {
        navigate('/emulators');
      }
      if (second === true && mode === 'easy') {
        navigate('/emulators');
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
    <Wrapper aside={second === true}>
      {second === false && (
        <>
          <Header title={t('WelcomePage.title', { systemName: systemName })} />
          <p className="lead">{t('WelcomePage.description')}:</p>
        </>
      )}

      {systemName !== 'ERROR' && second === false && (
        <Welcome onClick={selectMode} />
      )}

      {second === false && systemName !== 'ERROR' && (
        <Footer
          back={false}
          next="rom-storage"
          exit={gamemode}
          disabledNext={second ? false : disabledNext}
          disabledBack={second ? false : disabledBack}
        />
      )}
      <EmuModal modal={modal} />
    </Wrapper>
  );
}

export default WelcomePage;
