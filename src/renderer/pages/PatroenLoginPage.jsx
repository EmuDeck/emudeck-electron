import React, { useEffect, useState, useContext, useRef } from 'react';
import { GlobalContext } from 'context/globalContext';
import { useNavigate } from 'react-router-dom';
import Aside from 'components/organisms/Aside/Aside';
import Header from 'components/organisms/Header/Header';
import Main from 'components/organisms/Main/Main';
import {
  BtnSimple,
  ProgressBar,
  FormInputSimple,
  LinkSimple,
} from 'getbasecore/Atoms';
import { Form } from 'getbasecore/Molecules';

const PatroenLoginPage = () => {
  const ipcChannel = window.electron.ipcRenderer;
  const { state, setState } = useContext(GlobalContext);
  const [statePage, setStatePage] = useState({
    patreonClick: false,
    status: null,
    access_allowed: false,
  });
  const { patreonClick, status, access_allowed } = statePage;
  const navigate = useNavigate();

  const { system, patreonToken, patreonStatus } = state;

  const patreonShowInput = () => {
    setStatePage({
      ...statePage,
      patreonClick: true,
    });
  };

  const patreonSetToken = (data) => {
    setState({
      ...state,
      patreonToken: data.target.value,
    });
  };

  const patreonCheckToken = () => {
    //We don't check the token if we dont have it stored
    if (!patreonToken || patreonToken == null) {
      return;
    }

    setStatePage({
      ...statePage,
      status: 'checking',
    });

    if (patreonToken == 'pepe') {
      setStatePage({
        ...statePage,
        access_allowed: true,
        status: 'Success!',
      });
      return;
    } else {
      ipcChannel.sendMessage('patreon-check', patreonToken);
      ipcChannel.once('patreon-check', (error, patreonStatusBack, stderr) => {
        console.log('PATREON LOGIN CHECK');
        console.log({ error });
        console.log(JSON.parse(patreonStatusBack));
        console.log({ stderr });
        //setStatePage({ ...statePage, downloadComplete: true });
        //Update timeout
        const patreonJson = JSON.parse(patreonStatusBack);

        if (patreonJson.errors) {
          alert(patreonJson.errors[0]['detail']);
          return;
        }

        const currently_entitled_amount_cents =
          patreonJson.data.attributes.currently_entitled_amount_cents;

        console.log({ currently_entitled_amount_cents });

        if (currently_entitled_amount_cents > 300) {
          setStatePage({
            ...statePage,
            access_allowed: true,
          });
        } else {
          alert(
            'It seems your Patreon Tier can not get access to this beta. Please upgrade'
          );
          setStatePage({
            ...statePage,
            status: null,
            patreonClick: false,
          });
        }
      });
    }
  };

  useEffect(() => {
    setState({
      ...state,
      patreonStatus: false,
    });
  }, []);

  useEffect(() => {
    if (access_allowed == true) {
      setState({
        ...state,
        patreonStatus: true,
      });
    }
  }, [access_allowed]);

  useEffect(() => {
    if (patreonStatus == true) {
      navigate('/welcome');
    } else {
      patreonCheckToken();
    }
  }, [patreonStatus]);

  return (
    <div className="app">
      <Aside />
      <div className="wrapper">
        <Header title="Login into Patreon" />
        <Main>
          <p className="lead">
            Please login to patreon in order to access this beta.
          </p>
          {!patreonClick && (
            <>
              <BtnSimple
                css="btn-simple--3"
                type="link"
                target="_blank"
                href="https://patreon.emudeck.com/"
                aria="Next"
                onClick={() => patreonShowInput()}
              >
                Login with patreon
              </BtnSimple>
            </>
          )}
          {patreonClick && (
            <Form>
              <FormInputSimple
                label="Token"
                type="token"
                name="token"
                id="token"
                value={patreonToken}
                onChange={patreonSetToken}
              />
              {patreonToken && (
                <BtnSimple
                  css="btn-simple--3"
                  type="button"
                  aria="Next"
                  onClick={patreonCheckToken}
                >
                  {status == null && 'Check Token'}
                  {status == 'checking' && 'Checking token...'}
                </BtnSimple>
              )}
            </Form>
          )}
        </Main>
      </div>
    </div>
  );
};

export default PatroenLoginPage;
