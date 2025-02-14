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
import Card from 'components/molecules/Card/Card';
import { useFetchCond } from 'hooks/useFetchCond';

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
    news: undefined,
    game_of_the_month: undefined,
  });
  const {
    disabledNext,
    disabledBack,
    updates,
    modal,
    dom,
    news,
    game_of_the_month,
  } = statePage;

  const navigate = useNavigate();

  const newsWS = useFetchCond(
    `https://token.emudeck.com/news.php?branch=${branch}`
  );
  useEffect(() => {
    newsWS.post({}).then((data) => {
      setStatePage({
        ...statePage,
        news: data[0].news,
        game_of_the_month: data[0].game_of_the_month,
      });
    });
  }, []);

  const selectMode = (value) => {
    console.log({ value });
    if (value === 'android') {
      navigate('/android-welcome');
    } else {
      if (value === 'easy' && second === false && system == 'win32') {
        console.log('esde default');
        setState({
          ...state,
          installFrontends: {
            ...state.installFrontends,
            esde: { ...state.installFrontends.esde, status: true },
            deckyromlauncher: {
              ...state.installFrontends.deckyromlauncher,
              status: false,
            },
          },
          mode: value,
        });
      } else {
        console.log('only state');
        setState({ ...state, mode: value });
      }

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

      {second && (
        <>
          <Header title="EmuDeck News" />
          <Main>
            <div className="cards cards--maxi">
              {news &&
                news.map((item) => {
                  return (
                    <Card key={item.link} css="is-selected">
                      <a target={item.target} href={item.link}>
                        <span class="h5">{item.title}</span>
                        <p>{item.desc}</p>
                        <img src={item.img} />
                      </a>
                    </Card>
                  );
                })}
            </div>
            <span class="h2">
              Games of the month by{' '}
              <a
                href="https://retrohandhelds.gg"
                target="blank"
                style={{ display: 'inline' }}
              >
                <img
                  src="https://retrohandhelds.gg/wp-content/uploads/2023/08/rh_logo_white.svg"
                  alt="RG logo"
                  style={{ width: 40 }}
                />
              </a>
            </span>
            <div className="cards cards--maxi">
              {game_of_the_month &&
                game_of_the_month.map((item) => {
                  return (
                    <Card css="is-selected">
                      <a target="blank" href={item.link}>
                        <span class="h5">{item.title}</span>
                        <img src={item.img} />
                      </a>
                    </Card>
                  );
                })}
            </div>
          </Main>
        </>
      )}
    </Wrapper>
  );
}

export default WelcomePage;
