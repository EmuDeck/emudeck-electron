import React, { useState, useContext, useRef, useEffect } from 'react';
import { GlobalContext } from 'context/globalContext';
import { useNavigate } from 'react-router-dom';
import Wrapper from 'components/molecules/Wrapper/Wrapper';
import GamePad from 'components/organisms/GamePad/GamePad';
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
  imgxenia,
  imgsrm,
  imgrmg,
  imgscummvm,
  imgsupermodelista,
  imgFrontESDE,
  imgmelonds,
  imgmgba,
  iconGear,
  iconPackage,
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

function EmulatorsPage() {
  const navigate = useNavigate();
  const { state, stateCurrentConfigs, setStateCurrentConfigs } =
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

  const { system, installEmus, installFrontends, branch } = state;

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
          if (item.id === 'rmg' || item.id === 'mgba') {
            return;
          }
        }

        if (item.id === 'ares') {
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
    }, 1000);
  };

  useEffect(() => {
    // Clean win32 systems

    if (system === 'win32') {
      delete stateCurrentConfigs.rmg;
    }

    ipcChannel.sendMessage('check-versions');
    ipcChannel.once('check-versions', (repoVersions) => {
      // No versioning found, what to do?

      // Thanks chatGPT lol
      const obj1 = repoVersions;
      const obj2 = stateCurrentConfigs;

      const differences = {};

      for (const key in obj1) {
        if (JSON.stringify(obj1[key]) !== JSON.stringify(obj2[key])) {
          differences[key] = obj1[key];
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
      localStorage.setItem('current_versions_beta', json);
    }
  }, [modal]);

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
        <Header title="Manage your Emulators" />
        <p className="lead">
          On this page, you can update your configurations or install new
          emulators. An orange notification means you have a configuration
          update ready for the respective emulator.
        </p>
        <Main>
          {updates && (
            <>
              <div className="container--grid">
                {Object.keys(updates).length > 0 && system !== 'darwin' && (
                  <div data-col-md="4">
                    <CardSettings
                      icon={iconGear}
                      css="is-highlighted"
                      btnCSS="btn-simple--1"
                      iconSize="md"
                      title="Update all Configurations"
                      description="Update all of your configurations at once. New configurations might contain bug fixes or performance improvements. This will overwrite any global emulator settings you have changed. Per game settings will be retained."
                      button="Update"
                      onClick={() => resetEmus()}
                    />
                  </div>
                )}
                {system !== 'win32' && system !== 'darwin' && (
                  <div data-col-md="4">
                    <CardSettings
                      icon={iconPackage}
                      css="is-highlighted"
                      btnCSS="btn-simple--1"
                      iconSize="md"
                      button="Update"
                      title="Update your Emulators"
                      description="Update your emulators right from EmuDeck"
                      onClick={() => navigate(`/update-emulators`)}
                    />
                  </div>
                )}
              </div>
              <hr />
              <div className="container--grid">
                {installEmusArray.map((item) => {
                  const img = images[item.id];
                  const updateNotif = updates[item.id];
                  if (system === 'win32') {
                    if (item.id === 'rmg') {
                      return;
                    }
                  }
                  if (system === 'win32' && branch === 'beta') {
                    if (
                      item.id === 'mame' ||
                      item.id === 'flycast' ||
                      item.id === 'mgba'
                    ) {
                      return;
                    }
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
                    <div key={item.id} data-col-md="2">
                      <CardSettings
                        icon={img}
                        css="is-highlighted"
                        btnCSS={
                          item.status === true
                            ? 'btn-simple--5'
                            : 'btn-simple--2'
                        }
                        iconSize="sm"
                        title={`${item.name}`}
                        button={item.status === true ? 'Manage' : 'Install'}
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
                  const updateNotif = updates[item.id];

                  if (item.id === 'pegasus' || item.id === 'steam') {
                    return;
                  }

                  return (
                    <div key={item.id} data-col-md="2">
                      <CardSettings
                        icon={img}
                        css="is-highlighted"
                        btnCSS={
                          item.status === true
                            ? 'btn-simple--5'
                            : 'btn-simple--2'
                        }
                        iconSize="sm"
                        title={`${item.name}`}
                        button={item.status === true ? 'Manage' : 'Install'}
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
          disabledNext={disabledNext}
          disabledBack={disabledBack}
        />
        <EmuModal modal={modal} />
      </Wrapper>
    </div>
  );
}

export default EmulatorsPage;
