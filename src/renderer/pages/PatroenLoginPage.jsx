import { useTranslation } from 'react-i18next';
import React, { useEffect, useState, useContext, useRef } from 'react';
import { GlobalContext } from 'context/globalContext';
import { useNavigate } from 'react-router-dom';

//
// components
//
import { BtnSimple, FormInputSimple } from 'getbasecore/Atoms';
import Wrapper from 'components/molecules/Wrapper/Wrapper';

import Main from 'components/organisms/Main/Main';
import Header from 'components/organisms/Header/Header';

//
// hooks
//
import useFetch from '../hooks/useFetch';

//
// imports & requires
//
const branchFile = require('data/branch.json');

const { branch } = branchFile;

function PatreonLoginPage() {
  const { t, i18n } = useTranslation();
  //
  // i18
  //

  //
  // States
  //

  const [statePage, setStatePage] = useState({
    patreonClicked: false,
    status: null,
    accessAllowed: false,
    patreonTokenTemp: null,
    errorMessage: undefined,
  });
  const {
    patreonClicked,
    status,
    accessAllowed,
    patreonTokenTemp,
    errorMessage,
  } = statePage;

  const { state, setState } = useContext(GlobalContext);

  const {
    installEmus,
    overwriteConfigEmus,
    achievements,
    shader,
    patreonToken,
    patreonStatus,
  } = state;

  //
  // Web services
  //
  const patreonWS = useFetch('check.php');
  //
  // Const & Vars
  //
  const navigate = useNavigate();
  const ipcChannel = window.electron.ipcRenderer;
  //
  // Functions
  //
  const patreonShowInput = (openBrowser = true) => {
    setStatePage({
      ...statePage,
      patreonClicked: true,
    });
  };

  const patreonSetToken = (data) => {
    let patronTokenValue;

    data.target.value === ''
      ? (patronTokenValue = null)
      : (patronTokenValue = data.target.value);

    setStatePage({
      ...statePage,
      patreonTokenTemp: patronTokenValue,
    });
  };

  const patreonCheckToken = (tokenArg) => {
    const settingsStorage = JSON.parse(
      localStorage.getItem('settings_emudeck')
    );

    let token;
    let system = 'NA';
    let device = 'NA';
    let installEmus = 'NA';

    if (settingsStorage) {
      system = settingsStorage.system;
      device = settingsStorage.device;
      installEmus = settingsStorage.installEmus;
    }

    if (!tokenArg) {
      token = patreonTokenTemp;
    } else {
      token = tokenArg;
    }

    patreonWS
      .post({ token, system, device, installEmus })
      .then((data) => {
        const patreonJson = data;

        console.log({ patreonJson });
        if (patreonJson.error) {
          setStatePage({
            ...statePage,
            status: null,
            patreonClicked: false,
            errorMessage: patreonJson.error,
          });
          return;
        }

        if (patreonJson.cancel) {
          setStatePage({
            ...statePage,
            accessAllowed: 'cancel',
          });
          return;
        }

        // eslint-disable-next-line promise/always-return
        if (patreonJson.status === true) {
          setStatePage({
            ...statePage,
            patreonTokenTemp: patreonJson.new_token,
            accessAllowed: true,
          });
        } else {
          const settingsStorage = JSON.parse(
            localStorage.getItem('settings_emudeck')
          );
          const shadersStored = settingsStorage.shaders;
          const overwriteConfigEmusStored = settingsStorage.overwriteConfigEmus;
          const achievementsStored = settingsStorage.achievements;

          delete settingsStorage.installEmus.primehacks;
          delete settingsStorage.installEmus.cemunative;
          delete settingsStorage.overwriteConfigEmus.primehacks;
          const installEmusStored = settingsStorage.installEmus;

          // Theres probably a better way to do this...

          ipcChannel.sendMessage('version');

          ipcChannel.once('version-out', (version) => {
            ipcChannel.sendMessage('system-info-in');
            ipcChannel.once('system-info-out', (platform) => {
              console.log({
                system: platform,
                version: version[0],
                gamemode: version[1],
              });
              alert(
                "No patreon detected, you can use EmuDeck but you won't get new updates"
              );
              setState({
                ...state,
                patreonStatus: null,
                //...settingsStorage,
                system: platform,
                // version: version[0],
                second: true,
                branch: 'early',
              });
            });
          });
        }
      })
      .catch((error) => {
        setStatePage({
          ...statePage,
          status: null,
          patreonClicked: false,
        });
      });
  };

  //
  // UseEffects
  //
  useEffect(() => {
    if (patreonStatus === null) {
      //navigate('/emulators');
      console.log({ patreonStatus });
    }
  }, [patreonStatus]);
  useEffect(() => {
    const patreonTokenLS = localStorage.getItem('patreon_token');
    if (!branch.includes('early')) {
      navigate('/check-updates');
    } else if (patreonTokenLS) {
      patreonCheckToken(patreonTokenLS);
    }
  }, []);

  useEffect(() => {
    if (accessAllowed === true) {
      localStorage.setItem('patreon_token', patreonTokenTemp);
      const partial = patreonTokenTemp.split('|||');
      const splitToken = partial[1];

      ipcChannel.sendMessage('emudeck', [
        `storePatreonToken|||storePatreonToken ${splitToken}`,
      ]);
      ipcChannel.once('storePatreonToken', (message) => {
        setState({
          ...state,
          patreonToken: splitToken,
        });
      });
    } else if (accessAllowed === 'cancel') {
      const updateOrLogin = confirm(
        'Please log back in to Patreon to keep EmuDeck updated. Press OK to log in again or Cancel to continue with no updates'
      );
      if (!updateOrLogin) {
        const settingsStorage = JSON.parse(
          localStorage.getItem('settings_emudeck')
        );
        const shadersStored = settingsStorage.shaders;
        const overwriteConfigEmusStored = settingsStorage.overwriteConfigEmus;
        const achievementsStored = settingsStorage.achievements;

        delete settingsStorage.installEmus.primehacks;
        delete settingsStorage.installEmus.cemunative;
        delete settingsStorage.overwriteConfigEmus.primehacks;
        const installEmusStored = settingsStorage.installEmus;

        // Theres probably a better way to do this...

        ipcChannel.sendMessage('version');

        ipcChannel.once('version-out', (version) => {
          ipcChannel.sendMessage('system-info-in');
          ipcChannel.once('system-info-out', (platform) => {
            console.log({
              system: platform,
              version: version[0],
              gamemode: version[1],
            });
            setState({
              ...state,
              patreonStatus: true,
              ...settingsStorage,
              installEmus: { ...installEmus, ...installEmusStored },
              overwriteConfigEmus: {
                ...overwriteConfigEmus,
                ...overwriteConfigEmusStored,
              },
              achievements: {
                ...achievements,
                ...achievementsStored,
              },
              shaders: { ...shaders, ...shadersStored },
              system: platform,
              version: version[0],
              gamemode: version[1],
              branch,
            });
          });
        });
      }
    }
  }, [accessAllowed]);
  useEffect(() => {
    if (patreonToken !== null) {
      navigate('/check-updates');
    }
  }, [patreonToken]);

  useEffect(() => {
    if (state.version != '') {
      navigate('/emulators');
    }
  }, [state]);

  //
  // Render
  //

  return (
    <Wrapper>
      <Header title={t('PatroenLoginPage.title')} />
      <Main>
        {errorMessage === undefined && (
          <p className="lead">{t('PatroenLoginPage.description')}</p>
        )}
        {!!errorMessage && <p className="lead">{errorMessage}</p>}

        {!patreonClicked && (
          <>
            <BtnSimple
              css="btn-simple--3"
              type="link"
              target="_blank"
              href="https://token.emudeck.com/"
              aria={t('PatroenLoginPage.login')}
              onClick={() => patreonShowInput()}
              disabled={accessAllowed}
            >
              {accessAllowed || t('PatroenLoginPage.login')}{' '}
              {accessAllowed && `- ${t('general.loading')}`}
            </BtnSimple>
            <BtnSimple
              css="btn-simple--3"
              type="link"
              target="_blank"
              href="https://patreon.com/"
              aria={t('PatroenLoginPage.change')}
            >
              {t('PatroenLoginPage.change')}
            </BtnSimple>
            <BtnSimple
              css="btn-simple--2"
              type="button"
              aria={t('PatroenLoginPage.login')}
              onClick={() => patreonShowInput(false)}
              disabled={accessAllowed}
            >
              {accessAllowed || t('PatroenLoginPage.license')}{' '}
              {accessAllowed && `- ${t('general.loading')}`}
            </BtnSimple>
          </>
        )}
        {patreonClicked && (
          <div className="form">
            <FormInputSimple
              label="Token"
              type="token"
              name="token"
              id="token"
              value={patreonTokenTemp}
              onChange={patreonSetToken}
            />
            {patreonTokenTemp !== null && (
              <BtnSimple
                css="btn-simple--3"
                type="button"
                aria={t('general.next')}
                onClick={() => patreonCheckToken()}
              >
                {status === null && t('PatroenLoginPage.check')}
                {status === 'checking' && t('PatroenLoginPage.checking')}
              </BtnSimple>
            )}
          </div>
        )}
      </Main>
    </Wrapper>
  );
}

export default PatreonLoginPage;
