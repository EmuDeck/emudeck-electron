import React, { useState, useContext, useEffect, useRef } from 'react';
import { GlobalContext } from 'context/globalContext';
import { useNavigate } from 'react-router-dom';
import Wrapper from 'components/molecules/Wrapper/Wrapper';
import Header from 'components/organisms/Header/Header';
import Footer from 'components/organisms/Footer/Footer';
import Main from 'components/organisms/Main/Main';
import CardSettings from 'components/molecules/CardSettings/CardSettings';
import Notification from 'components/molecules/Notification/Notification';
import {
  imgra,
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
  iconGear,
  iconPackage,
} from 'components/utils/images/images';

const images = {
  ra: imgra,
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

function EmulatorsPage() {
  const navigate = useNavigate();
  const { state, stateCurrentConfigs, setStateCurrentConfigs } =
    useContext(GlobalContext);
  const [statePage, setStatePage] = useState({
    disabledNext: false,
    disabledBack: false,
    updates: null,
    showNotification: undefined,
    textNotification: '',
    disableInstallButton: false,
    disableResetButton: false,
    newDesiredVersions: null,
  });
  const {
    disabledNext,
    disabledBack,
    updates,
    showNotification,
    textNotification,
    newDesiredVersions,
    disableResetButton,
  } = statePage;

  const { system, installEmus } = state;

  const installEmusArray = Object.values(installEmus);

  const ipcChannel = window.electron.ipcRenderer;

  const countRef = useRef(stateCurrentConfigs);
  countRef.current = stateCurrentConfigs;

  const pageRef = useRef(statePage);
  pageRef.current = statePage;

  const resetEmus = () => {
    setStatePage({
      ...pageRef.current,
      disableResetButton: true,
    });

    console.log({ updates });

    setTimeout(() => {
      let i = 2;
      const object = {};
      Object.values(updates).forEach((item) => {
        const name = item.code;
        const { code } = item;
        const { id } = item;
        const { version } = item;

        if (system === 'win32') {
          if (
            item.id === 'primehack' ||
            item.id === 'primehacks' ||
            item.id === 'rmg' ||
            item.id === 'mame' ||
            item.id === 'vita3k' ||
            item.id === 'scummvm' ||
            item.id === 'xemu' ||
            item.id === 'mgba'
          ) {
            console.log('NOT SUPPORTED');
            return;
          }
        }

        ipcChannel.sendMessage('emudeck', [
          `${code}_resetConfig|||sleep ${i} && ${code}_resetConfig`,
        ]);

        ipcChannel.once(`${code}_resetConfig`, (message) => {
          console.log(`${code}_resetConfig`);
          let status = message.stdout;
          status = status.replace('\n', '');

          if (status.includes('true')) {
            setStatePage({
              ...pageRef.current,
              textNotification: `${name} configuration updated! 🎉`,
              showNotification: true,
            });

            setStateCurrentConfigs({
              ...countRef.current,
              [id]: { ...countRef.current[id], version },
            });
          } else {
            setStatePage({
              ...pageRef.current,
              textNotification: `There was an issue trying to reset ${name} configuration 😥`,
              showNotification: true,
            });
          }
        });
        i += 1;
      });
    }, 1000);
  };

  useEffect(() => {
    if (showNotification === true) {
      setTimeout(() => {
        setStatePage({
          ...statePage,
          showNotification: false,
        });
      }, 1000);
    }
  }, [showNotification]);

  useEffect(() => {
    // Clean win32 systems

    if (system === 'win32') {
      delete stateCurrentConfigs.primehack;
      delete stateCurrentConfigs.melonds;
      delete stateCurrentConfigs.rmg;
      delete stateCurrentConfigs.mame;
      delete stateCurrentConfigs.vita3k;
      delete stateCurrentConfigs.scummvm;
      delete stateCurrentConfigs.xemu;
      delete stateCurrentConfigs.mgba;
      delete stateCurrentConfigs.xenia;
    }

    ipcChannel.sendMessage('check-versions');
    ipcChannel.once('check-versions', (repoVersions) => {
      // No versioning found, what to do?
      if (repoVersions === '') {
        console.log('no versioning found');
      }

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
        disableResetButton: false,
      });
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (showNotification === false) {
      // const updates = diff(newDesiredVersions, stateCurrentConfigs);

      const obj1 = newDesiredVersions;
      const obj2 = stateCurrentConfigs;

      const updates = {};

      for (const key in obj1) {
        if (JSON.stringify(obj1[key]) !== JSON.stringify(obj2[key])) {
          updates[key] = obj1[key];
        }
      }
      console.log({ updates });

      setStatePage({
        ...statePage,
        updates,
      });

      const json = JSON.stringify(stateCurrentConfigs);
      localStorage.setItem('current_versions_beta', json);
    }
  }, [showNotification]);

  return (
    <Wrapper>
      <Header title="Manage your Emulators" />
      <p className="lead">
        On this page, you can update your configurations or install new
        emulators. An orange notification means you have a configuration update
        ready for the respective emulator.
      </p>
      <Notification css={showNotification ? 'is-animated' : 'nope'}>
        {textNotification}
      </Notification>
      <Main>
        {updates && (
          <>
            <div className="container--grid">
              {Object.keys(updates).length > 0 && (
                <div data-col-md="4">
                  <CardSettings
                    icon={iconGear}
                    css="is-highlighted"
                    btnCSS="btn-simple--1"
                    iconSize="md"
                    title="Update all Configurations"
                    description="Update all of your configurations at once. New configurations might contain bug fixes or performance improvements. This will overwrite any global emulator settings you have changed. Per game settings will be retained."
                    button={disableResetButton ? 'Please wait...' : 'Update'}
                    onClick={() => resetEmus()}
                    disabled={disableResetButton}
                    notification
                  />
                </div>
              )}
              {system !== 'win32' && (
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
                  if (
                    item.id === 'primehack' ||
                    item.id === 'rmg' ||
                    item.id === 'mame' ||
                    item.id === 'vita3k' ||
                    item.id === 'scummvm' ||
                    item.id === 'xemu' ||
                    item.id === 'mgba' ||
                    item.id === 'xenia'
                  ) {
                    return;
                  }
                }
                return (
                  <div data-col-md="2">
                    <CardSettings
                      key={item.id}
                      icon={img}
                      css="is-highlighted"
                      btnCSS={
                        item.status === true ? 'btn-simple--5' : 'btn-simple--2'
                      }
                      iconSize="sm"
                      title={`${item.name}`}
                      button={item.status === true ? 'Manage' : 'Install'}
                      onClick={() => navigate(`/emulators-detail/${item.id}`)}
                      notification={
                        item.status === true ? updateNotif != undefined : ''
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
    </Wrapper>
  );
}

export default EmulatorsPage;
