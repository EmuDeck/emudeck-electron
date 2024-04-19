import { useTranslation } from 'react-i18next';
import React, { useState, useContext, useRef, useEffect } from 'react';
import { GlobalContext } from 'context/globalContext';
import { useNavigate } from 'react-router-dom';
import Wrapper from 'components/molecules/Wrapper/Wrapper';

import Header from 'components/organisms/Header/Header';
import Footer from 'components/organisms/Footer/Footer';
import Main from 'components/organisms/Main/Main';
import CardSettings from 'components/molecules/CardSettings/CardSettings';
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
  imgpcsx2,
  imgrpcs3,
  imgyuzu,
  imgryujinx,
  imgcemu,
  imgxemu,
  imgmame,
  imgvita3k,
  imgflycast,
  imgFrontPegasus,
  imgxenia,
  imgsrm,
  imgrmg,
  imgscummvm,
  imgsupermodel,
  imgFrontESDE,
  imgmelonds,
  imgmgba,
  xemuGrid,
  cemuGrid,
  citraGrid,
  dolphinGrid,
  duckstationGrid,
  mameGrid,
  rmgGrid,
  supermodelGrid,
  model2Grid,
  bigpemuGrid,
  flycastGrid,
  melondsGrid,
  mgbaGrid,
  pcsx2Grid,
  ppssppGrid,
  primehackGrid,
  raGrid,
  rpcs3Grid,
  ryujinxGrid,
  scummvmGrid,
  vita3kGrid,
  xeniaGrid,
  yuzuGrid,
  esdeGrid,
  srmGrid,
  pegasusGrid,
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
  iconGear,
  iconPackage,
} from 'components/utils/images/icons';

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
  supermodel: imgsupermodel,
  esde: imgFrontESDE,
  rmg: imgrmg,
  mgba: imgmgba,
  xenia: imgxenia,
  srm: imgsrm,
  pegasus: imgFrontPegasus,
};

const imagesGrid = {
  xemu: xemuGrid,
  cemu: cemuGrid,
  citra: citraGrid,
  dolphin: dolphinGrid,
  duckstation: duckstationGrid,
  flycast: flycastGrid,
  mame: mameGrid,
  rmg: rmgGrid,
  supermodel: supermodelGrid,
  model2: model2Grid,
  melonds: melondsGrid,
  mgba: mgbaGrid,
  pcsx2: pcsx2Grid,
  ppsspp: ppssppGrid,
  primehack: primehackGrid,
  ra: raGrid,
  rpcs3: rpcs3Grid,
  ryujinx: ryujinxGrid,
  scummvm: scummvmGrid,
  vita3k: vita3kGrid,
  xenia: xeniaGrid,
  yuzu: yuzuGrid,
  esde: esdeGrid,
  srm: srmGrid,
  pegasus: pegasusGrid,
  bigpemu: bigpemuGrid,
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
      header: <span className="h4">Resetting Emulators configuration</span>,
      body: <p>Please wait while we reset all the Emulators configuration</p>,
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
          if (item.id === 'model2') {
            return;
          }
          if (item.id === 'supermodel') {
            return;
          }
          if (item.id === 'bigpemu') {
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
          header: <span className="h4">Resetting {code}'s configuration</span>,
          body: <p>Please wait while we reset {code}'s configuration</p>,
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
                <span className="h4">{name}'s configuration updated!</span>
              ),
              body: (
                <p>
                  {name}'s configuration was updated with our latest
                  improvements, optimizations and bug fixes!
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
                <span className="h4">{name} configuration reset failed</span>
              ),
              body: (
                <p>There was an issue trying to reset {name} configuration</p>
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
    <div style={{ height: '100vh' }}>
      <Wrapper>
        <Header title={t('manageEmulators.title')} />
        <p className="lead">{t('manageEmulators.description')}</p>
        <Main>
          {updates && (
            <>
              <div className="container--grid">
                {Object.keys(updates).length > 0 && (
                  <div data-col-md="6">
                    <CardSettings
                      icon={iconGear}
                      css="is-highlighted"
                      btnCSS="btn-simple--1"
                      iconSize="md"
                      title={t('manageEmulators.updateConfigs.title')}
                      description={t(
                        'manageEmulators.updateConfigs.description'
                      )}
                      button={t('manageEmulators.updateConfigs.button')}
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
                      button={t('manageEmulators.updateEmus.button')}
                      title={t('manageEmulators.updateEmus.title')}
                      description={t('manageEmulators.updateEmus.description')}
                      onClick={() => navigate(`/update-emulators`)}
                    />
                  </div>
                )}
              </div>
              <hr />
              <div className="container--grid">
                {installEmusArray.map((item) => {
                  const img = images[item.id];
                  const picture = imagesGrid[item.id];
                  const updateNotif = updates[item.id];
                  if (system === 'win32') {
                    if (item.id === 'rmg') {
                      return;
                    }
                  }

                  if (item.id === 'ares') {
                    return;
                  }

                  if (system === 'darwin') {
                    if (item.id !== 'ra' && item.id !== 'srm') {
                      return;
                    }
                  }
                  if (system === 'win32') {
                    if (item.id === 'model2') {
                      return;
                    }
                    if (item.id === 'supermodel') {
                      return;
                    }
                    if (item.id === 'bigpemu') {
                      return;
                    }
                  }
                  return (
                    <div key={item.id} data-col-md="4">
                      <CardSettings
                        icon={img}
                        picture={picture}
                        css="is-nothighlighted"
                        btnCSS={
                          item.status === true
                            ? 'btn-simple--5'
                            : 'btn-simple--2'
                        }
                        iconSize="sm"
                        title={`${item.name}`}
                        button="Manage"
                        onClick={() => navigate(`/emulators-detail/${item.id}`)}
                        notification={
                          item.status === true
                            ? updateNotif != undefined
                            : false
                        }
                      />
                    </div>
                  );
                })}
                {installFrontendsArray.map((item) => {
                  const img = images[item.id];
                  const picture = imagesGrid[item.id];
                  const updateNotif = updates[item.id];

                  if (item.id === 'steam') {
                    return;
                  }

                  return (
                    <div key={item.id} data-col-md="4">
                      <CardSettings
                        icon={img}
                        picture={picture}
                        css="is-highlighted"
                        btnCSS={
                          item.status === true
                            ? 'btn-simple--5'
                            : 'btn-simple--2'
                        }
                        iconSize="sm"
                        title={`${item.name}`}
                        button="Manage"
                        onClick={() => navigate(`/emulators-detail/${item.id}`)}
                        notification={
                          item.status === true
                            ? updateNotif != undefined
                            : false
                        }
                      />
                    </div>
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
    </div>
  );
}

export default ManageEmulatorsPage;
