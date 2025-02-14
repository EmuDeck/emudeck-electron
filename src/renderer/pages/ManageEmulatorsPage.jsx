import { useTranslation } from 'react-i18next';
import React, { useState, useContext, useRef, useEffect } from 'react';
import { GlobalContext } from 'context/globalContext';
import { useNavigate } from 'react-router-dom';
import Wrapper from 'components/molecules/Wrapper/Wrapper';

import Header from 'components/organisms/Header/Header';
import Footer from 'components/organisms/Footer/Footer';
import Main from 'components/organisms/Main/Main';
import CardSettings from 'components/molecules/CardSettings/CardSettings';
import Card from 'components/molecules/Card/Card';
import ProgressBar from 'components/atoms/ProgressBar/ProgressBar';
import EmuModal from 'components/molecules/EmuModal/EmuModal';

import {
  imgra,
  imgares,
  imgdolphin,
  imgprimehack,
  imgppsspp,
  imgduckstation,
  imgcitra,
  imglime3ds,
  imgpcsx2,
  imgrpcs3,
  imgyuzu,
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
  imgFrontESDE,
  imgmelonds,
  imgmgba,
  imgsupermodel,
  imgmodel2,
  imgbigpemu,
  imgFrontPegasus,
  imgshadps4,
} from 'components/utils/images/images';
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
  iconPackage,
  iconUpdate,
} from 'components/utils/images/icons';

const images = {
  ra: imgra,
  ares: imgares,
  dolphin: imgdolphin,
  primehack: imgprimehack,
  ppsspp: imgppsspp,
  duckstation: imgduckstation,
  citra: imgcitra,
  lime3ds: imglime3ds,
  pcsx2: imgpcsx2,
  rpcs3: imgrpcs3,
  yuzu: imgyuzu,
  citron: imgcitron,
  melonds: imgmelonds,
  ryujinx: imgryujinx,
  cemu: imgcemu,
  xemu: imgxemu,
  mame: imgmame,
  vita3k: imgvita3k,
  flycast: imgflycast,
  scummvm: imgscummvm,
  esde: imgFrontESDE,
  rmg: imgrmg,
  mgba: imgmgba,
  xenia: imgxenia,
  srm: imgsrm,
  supermodel: imgsupermodel,
  model2: imgmodel2,
  bigpemu: imgbigpemu,
  pegasus: imgFrontPegasus,
  shadps4: imgshadps4,
};

function ManageEmulatorsPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { state, setState, stateCurrentConfigs, setStateCurrentConfigs } =
    useContext(GlobalContext);
  const [statePage, setStatePage] = useState({
    disabledNext: false,
    disabledBack: false,
    updates: null,
    newDesiredVersions: null,
    dom: undefined,
  });
  const {
    disabledNext,
    disabledBack,
    updates,
    newDesiredVersions,
    modal,
    dom,
  } = statePage;

  const { system, installEmus, installFrontends, branch, mode } = state;

  const installEmusArray = Object.values(installEmus);
  const installFrontendsArray = Object.values(installFrontends);

  const ipcChannel = window.electron.ipcRenderer;

  const countRef = useRef(stateCurrentConfigs);
  countRef.current = stateCurrentConfigs;

  const pageRef = useRef(statePage);
  pageRef.current = statePage;

  const resetEmus = () => {
    const modalData = {
      active: true,
      header: (
        <span className="h4">{t('ManageEmulatorsPage.modalResetTitle')}</span>
      ),
      body: <p>{t('ManageEmulatorsPage.modalResetDesc')}</p>,
      footer: <ProgressBar css="progress--success" infinite max="100" />,
      css: 'emumodal--xs',
    };

    setStatePage({
      ...pageRef.current,
      modal: modalData,
    });

    setTimeout(() => {
      let i = 2;
      const object = {};
      Object.values(updates).forEach((item) => {
        const name = item.code;
        const { code } = item;
        const { id } = item;
        const { version } = item;

        if (system === 'win32') {
          if (item.id === 'rmg') {
            return;
          }
        }

        if (item.id === 'ares') {
          return;
        }
        console.log(installEmus[item.id].status);
        if (!installEmus[item.id].status) {
          return;
        }

        const modalData = {
          active: true,
          header: (
            <span className="h4">
              {t('ManageEmulatorsPage.modalResetingTitle', { code: code })}
            </span>
          ),
          body: (
            <p>{t('ManageEmulatorsPage.modalResetingDesc', { code: code })}</p>
          ),
          footer: <ProgressBar css="progress--success" infinite max="100" />,
          css: 'emumodal--xs',
        };

        setStatePage({
          ...pageRef.current,
          modal: modalData,
        });

        ipcChannel.sendMessage('emudeck', [
          `${code}_resetConfig|||sleep ${i} && ${code}_resetConfig`,
        ]);

        ipcChannel.once(`${code}_resetConfig`, (message) => {
          let status = message.stdout;
          status = status.replace('\n', '');

          if (status.includes('true')) {
            const modalData = {
              active: true,
              header: (
                <span className="h4">
                  {t('ManageEmulatorsPage.modalUpdatedTitle', { name: name })}
                </span>
              ),
              body: (
                <p>
                  {t('ManageEmulatorsPage.modalUpdatedDesc', { name: name })}
                </p>
              ),
              footer: '',
              css: 'emumodal--xs',
            };

            setStatePage({
              ...pageRef.current,
              modal: modalData,
            });

            setStateCurrentConfigs({
              ...countRef.current,
              [id]: { ...countRef.current[id], version },
            });
          } else {
            const modalData = {
              active: true,
              header: (
                <span className="h4">
                  {t('ManageEmulatorsPage.modalFailedTitle', { name: name })}
                </span>
              ),
              body: (
                <p>
                  {t('ManageEmulatorsPage.modalFailedDesc', { name: name })}
                </p>
              ),
              css: 'emumodal--xs',
            };

            setStatePage({
              ...pageRef.current,
              modal: modalData,
            });
          }
        });
        i += 1;
      });
      setStatePage({ ...statePage, updates: [] });
    }, 1000);
  };

  useEffect(() => {
    // Clean win32 systems

    if (system === 'win32') {
      delete stateCurrentConfigs.rmg;
    }

    // We check if the user has pending updates
    ipcChannel.sendMessage('check-versions');
    ipcChannel.once('check-versions', (repoVersions) => {
      // No versioning found, what to do?

      // Thanks chatGPT lol
      const obj1 = repoVersions;
      const obj2 = stateCurrentConfigs;

      const differences = {};

      for (const key in obj1) {
        if (installEmus[obj1[key].id]) {
          if (
            JSON.stringify(obj1[key]) !== JSON.stringify(obj2[key]) &&
            installEmus[obj1[key].id].status &&
            installEmus[obj1[key].code] !== 'BigPemu'
          ) {
            differences[key] = obj1[key];
          }
        }
      }

      setStatePage({
        ...statePage,
        updates: differences,
        newDesiredVersions: repoVersions,
      });
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (modal === false) {
      // const updates = diff(newDesiredVersions, stateCurrentConfigs);
      alert('false');
      const obj1 = newDesiredVersions;
      const obj2 = stateCurrentConfigs;

      const updates = {};

      for (const key in obj1) {
        if (JSON.stringify(obj1[key]) !== JSON.stringify(obj2[key])) {
          updates[key] = obj1[key];
        }
      }

      setStatePage({
        ...statePage,
        updates,
      });

      const json = JSON.stringify(stateCurrentConfigs);
      localStorage.setItem('current_versions', json);
    }
  }, [modal]);

  return (
    <Wrapper>
      <Header title={t('ManageEmulatorsPage.title')} />
      <p className="lead">{t('ManageEmulatorsPage.description')}</p>
      <Main>
        {updates && (
          <>
            <div className="container--grid">
              {Object.keys(updates).length > 0 && (
                <div data-col-md="6">
                  <CardSettings
                    icon={iconUpdate}
                    css="is-highlighted"
                    btnCSS="btn-simple--1"
                    iconSize="md"
                    title={t('ManageEmulatorsPage.updateConfigs.title')}
                    description={t(
                      'ManageEmulatorsPage.updateConfigs.description'
                    )}
                    button={t('ManageEmulatorsPage.updateConfigs.button')}
                    onClick={() => resetEmus()}
                  />
                </div>
              )}
              {system !== 'win32' && system !== 'darwin' && (
                <div data-col-md="6">
                  <CardSettings
                    icon={iconPackage}
                    css="is-highlighted"
                    btnCSS="btn-simple--1"
                    iconSize="md"
                    button={t('ManageEmulatorsPage.updateEmus.button')}
                    title={t('ManageEmulatorsPage.updateEmus.title')}
                    description={t(
                      'ManageEmulatorsPage.updateEmus.description'
                    )}
                    onClick={() => navigate(`/update-emulators`)}
                  />
                </div>
              )}
            </div>
            <hr />
            <div className="cards cards--medium">
              {installEmusArray.map((item) => {
                const img = images[item.id];
                const updateNotif = updates[item.id];
                if (system === 'win32') {
                  if (item.id === 'rmg') {
                    return;
                  }
                }

                if (item.id === 'srm') {
                  return;
                }

                if (item.id === 'ares') {
                  return;
                }

                if (system === 'darwin') {
                  if (item.id !== 'ra') {
                    return;
                  }
                }
                return (
                  <Card
                    css={item.status === true && 'is-selected'}
                    key={item.id}
                    onClick={() => navigate(`/emulators-detail/${item.id}`)}
                  >
                    <img src={img} alt={item.name} />
                    <span className="h6">{item.name}</span>
                    <small className="small">{item.platforms}</small>
                    {updateNotif && (
                      <small className="card__update">
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 14 14"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M13.7506 6.8753C13.7506 10.6298 10.6365 13.7506 6.8753 13.7506C3.12085 13.7506 0 10.6298 0 6.8753C0 3.11411 3.11411 0 6.86856 0C10.6298 0 13.7506 3.11411 13.7506 6.8753ZM6.12037 9.66586C6.12037 10.0636 6.47087 10.3871 6.8753 10.3871C7.27975 10.3871 7.63025 10.0703 7.63025 9.66586C7.63025 9.26146 7.28644 8.93788 6.8753 8.93788C6.46413 8.93788 6.12037 9.26815 6.12037 9.66586ZM6.23495 3.90275L6.32258 7.57634C6.32932 7.93353 6.52479 8.129 6.8753 8.129C7.21231 8.129 7.40779 7.9403 7.41455 7.57634L7.5089 3.90948C7.51567 3.55224 7.2393 3.28936 6.86856 3.28936C6.4911 3.28936 6.22822 3.5455 6.23495 3.90275Z"
                            fill="#FF9B26"
                            fill-opacity="0.85"
                          />
                        </svg>
                        Update Available
                      </small>
                    )}
                  </Card>
                );
              })}
            </div>
            <hr />
            <span class="h2">Manage your Tools & Frontends</span>
            <div className="cards cards--medium">
              {installFrontendsArray.map((item) => {
                const img = images[item.id];
                const updateNotif = updates[item.id];

                if (item.id === 'steam') {
                  return;
                }
                if (item.id === 'deckyromlauncher') {
                  return;
                }

                if (system === 'darwin') {
                  if (item.id !== 'esde') {
                    return;
                  }
                }

                return (
                  <Card
                    css={item.status === true && 'is-selected'}
                    key={item.id}
                    onClick={() => navigate(`/emulators-detail/${item.id}`)}
                  >
                    <img src={img} alt={item.name} />
                    <span className="h6">{item.name}</span>
                    <small className="small">{item.platforms}</small>
                  </Card>
                );
              })}
              {installEmusArray.map((item) => {
                const img = images[item.id];
                const updateNotif = updates[item.id];
                if (item.id !== 'srm') {
                  return;
                }

                return (
                  <Card
                    css={item.status === true && 'is-selected'}
                    key={item.id}
                    onClick={() => navigate(`/emulators-detail/${item.id}`)}
                  >
                    <img src={img} alt={item.name} />
                    <span className="h6">{item.name}</span>
                    <small className="small">{item.platforms}</small>
                    {updateNotif && (
                      <small className="card__update">
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 14 14"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M13.7506 6.8753C13.7506 10.6298 10.6365 13.7506 6.8753 13.7506C3.12085 13.7506 0 10.6298 0 6.8753C0 3.11411 3.11411 0 6.86856 0C10.6298 0 13.7506 3.11411 13.7506 6.8753ZM6.12037 9.66586C6.12037 10.0636 6.47087 10.3871 6.8753 10.3871C7.27975 10.3871 7.63025 10.0703 7.63025 9.66586C7.63025 9.26146 7.28644 8.93788 6.8753 8.93788C6.46413 8.93788 6.12037 9.26815 6.12037 9.66586ZM6.23495 3.90275L6.32258 7.57634C6.32932 7.93353 6.52479 8.129 6.8753 8.129C7.21231 8.129 7.40779 7.9403 7.41455 7.57634L7.5089 3.90948C7.51567 3.55224 7.2393 3.28936 6.86856 3.28936C6.4911 3.28936 6.22822 3.5455 6.23495 3.90275Z"
                            fill="#FF9B26"
                            fill-opacity="0.85"
                          />
                        </svg>
                        Update Available
                      </small>
                    )}
                  </Card>
                );
              })}
            </div>
          </>
        )}
      </Main>
      <Footer
        next={false}
        back={false}
        disabledNext={disabledNext}
        disabledBack={disabledBack}
      />
      <EmuModal modal={modal} />
    </Wrapper>
  );
}

export default ManageEmulatorsPage;
