import React, { useEffect, useState, useContext } from 'react';
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

function PatroenLoginPage() {
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

  //
  // Web services
  //
  const patreonWS = useFetch('check.php');
  //
  // Const & Vars
  //
  const navigate = useNavigate();
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
    setStatePage({
      ...statePage,
      patreonToken: data.target.value,
    });
  };

  const patreonCheckToken = (tokenArg) => {
    let token;
    if (!tokenArg) {
      token = patreonToken;
    } else {
      token = tokenArg;
    }

    setStatePage({
      ...statePage,
      status: 'checking',
    });

    patreonWS
      .post({ token })
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
        console.log({ error });
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
    if (patreonTokenLS) {
      patreonCheckToken(patreonTokenLS);
    } else if (branch !== 'early') {
      navigate('/check-updates');
    }
  }, []);

  useEffect(() => {
    if (accessAllowed === true) {
      localStorage.setItem('patreon_token', patreonToken);
      navigate('/check-updates');
    }
  }, [accessAllowed]);

  //
  // Render
  //
  return (
    <Wrapper>
      <Header title="Login into Patreon" />
      <Main>
        {errorMessage === undefined && (
          <p className="lead">
            Please login to patreon in order to access this beta.
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
        {!patreonClicked && (
          <BtnSimple
            css="btn-simple--2"
            type="button"
            target="_blank"
            aria="Next"
            onClick={() => patreonShowInput()}
          >
            Login with Token
          </BtnSimple>
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
            {patreonToken != null && (
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
  );
}

export default PatroenLoginPage;
