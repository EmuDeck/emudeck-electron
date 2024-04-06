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
    patreonToken: null,
    errorMessage: undefined,
  });
  const { patreonClicked, status, accessAllowed, patreonToken, errorMessage } =
    statePage;

  const { state, setState } = useContext(GlobalContext);

  const { installEmus, overwriteConfigEmus, achievements, shaders } = state;

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
  const patreonShowInput = () => {
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
      patreonToken: patronTokenValue,
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
      token = patreonToken;
    } else {
      token = tokenArg;
    }

    patreonWS
      .post({ token, system, device, installEmus })
      .then((data) => {
        const patreonJson = data;

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
            patreonToken: patreonJson.new_token,
            accessAllowed: true,
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
    const patreonTokenLS = localStorage.getItem('patreon_token');
    if (!branch.includes('early')) {
      navigate('/check-updates');
    } else if (patreonTokenLS) {
      patreonCheckToken(patreonTokenLS);
    }
  }, []);

  useEffect(() => {
    if (accessAllowed === true) {
      localStorage.setItem('patreon_token', patreonToken);
      navigate('/check-updates');
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
    window.reload;
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
    <div style={{ height: '100vh' }}>
      <Wrapper>
        <Header title="Login into Patreon" />
        <Main>
          {errorMessage === undefined && (
            <p className="lead">
              Please login to patreon in order to access this early access
              release.
            </p>
          )}
          {!!errorMessage && <p className="lead">{errorMessage}</p>}

          {!patreonClicked && (
            <>
              <BtnSimple
                css="btn-simple--3"
                type="link"
                target="_blank"
                href="https://token.emudeck.com/"
                aria="Next"
                onClick={() => patreonShowInput()}
              >
                Login with Patreon
              </BtnSimple>
              <BtnSimple
                css="btn-simple--3"
                type="link"
                target="_blank"
                href="https://patreon.com/"
                aria="Next"
              >
                Change Patreon Account
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
                value={patreonToken}
                onChange={patreonSetToken}
              />
              {patreonToken !== null && (
                <BtnSimple
                  css="btn-simple--3"
                  type="button"
                  aria="Next"
                  onClick={() => patreonCheckToken()}
                >
                  {status === null && 'Check Token'}
                  {status === 'checking' && 'Checking token...'}
                </BtnSimple>
              )}
            </div>
          )}
        </Main>
      </Wrapper>
    </div>
  );
}

export default PatreonLoginPage;
