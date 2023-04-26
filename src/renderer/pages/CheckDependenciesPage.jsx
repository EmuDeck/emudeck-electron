import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlobalContext } from 'context/globalContext';
import Wrapper from 'components/molecules/Wrapper/Wrapper';
import Header from 'components/organisms/Header/Header';
import Footer from 'components/organisms/Footer/Footer';
import { Img, BtnSimple, ProgressBar } from 'getbasecore/Atoms';
import { iconSuccess, iconDanger } from 'components/utils/images/images';
function CheckDependenciesPage() {
  const { state, setState } = useContext(GlobalContext);

  const [stateGIT, setStateGIT] = useState({
    statusGIT: null,
  });
  const { statusGIT } = stateGIT;
  const [state7Zip, setState7Zip] = useState({
    status7Zip: null,
  });
  const { status7Zip } = state7Zip;
  const [stateSteam, setStateSteam] = useState({
    statusSteam: null,
  });
  const { statusSteam } = stateSteam;

  const ipcChannel = window.electron.ipcRenderer;
  const navigate = useNavigate();

  const [counter, setCounter] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setCounter((prevCounter) => {
        if (prevCounter === 110) {
          prevCounter = -10;
        }
        return prevCounter + 1;
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const checkGit = () => {
    setStateGIT({
      statusGIT: undefined,
    });
    ipcChannel.sendMessage('validate-git');
    ipcChannel.once('validate-git', (messageGIT) => {
      console.log({ messageGIT });
      if (messageGIT.stdout === true) {
        setStateGIT({
          statusGIT: true,
        });
      } else {
        setStateGIT({
          statusGIT: false,
        });
      }
    });
  };

  const check7Zip = () => {
    setState7Zip({
      status7Zip: undefined,
    });
    ipcChannel.sendMessage('validate-7Zip');
    ipcChannel.once('validate-7Zip', (message7Zip) => {
      console.log({ message7Zip });
      if (message7Zip.stdout === true) {
        setState7Zip({
          status7Zip: true,
        });
      } else {
        setState7Zip({
          status7Zip: false,
        });
      }
    });
  };

  const checkSteam = () => {
    setStateSteam({
      statusSteam: undefined,
    });
    ipcChannel.sendMessage('validate-Steam');
    ipcChannel.once('validate-Steam', (messageSteam) => {
      console.log({ messageSteam });
      if (messageSteam.stdout === true) {
        setStateSteam({
          statusSteam: true,
        });
      } else {
        setStateSteam({
          statusSteam: false,
        });
      }
    });
  };

  useEffect(() => {
    ipcChannel.sendMessage('system-info-in');
    ipcChannel.once('system-info-out', (system) => {
      if (system === 'win32') {
        //GIT?
        checkGit();
        //7ZIP?
        check7Zip();
        // //Steam?
        checkSteam();
      } else {
        navigate('/check-updates');
      }
    });
  }, []);

  useEffect(() => {
    if (statusGIT === true && status7Zip === true) {
      navigate('/check-updates');
    }
  }, [statusGIT, status7Zip]);

  return (
    <Wrapper>
      <Header title="Installing dependencies..." />

      <ul>
        <li>
          <p className="h5">
            GIT{' '}
            <Img
              src={statusGIT === true ? iconSuccess : iconDanger}
              css="icon icon--xs"
              alt="OK"
            />
          </p>
          {statusGIT === undefined && (
            <>
              <span className="h6">Installing...</span>
              <ProgressBar css="progress--success" value={counter} max="100" />
            </>
          )}

          {statusGIT === false && status7Zip === true && (
            <span className="h6">Please restart EmuDeck to continue</span>
          )}
          <hr />
        </li>
        <li>
          <p className="h5">
            7Zip{' '}
            <Img
              src={status7Zip === true ? iconSuccess : iconDanger}
              css="icon icon--xs"
              alt="OK"
            />
          </p>
          {status7Zip === undefined && (
            <>
              <span className="h6">Installing...</span>
              <ProgressBar css="progress--success" value={counter} max="100" />
            </>
          )}
          <hr />
        </li>
        <li>
          <p className="h5">
            Steam{' '}
            <Img
              src={statusSteam === true ? iconSuccess : iconDanger}
              css="icon icon--xs"
              alt="OK"
            />
          </p>
          {statusSteam === undefined && (
            <>
              <span className="h6">Checking...</span>
              <ProgressBar css="progress--success" value={counter} max="100" />
            </>
          )}
          {statusSteam !== true && (
            <a
              className="btn-simple btn-simple--1 btn-simple--xs"
              href="https://store.steampowered.com/about/"
              target="_blank"
              rel="noreferrer"
            >
              Install Steam
            </a>
          )}
        </li>
      </ul>
    </Wrapper>
  );
}

export default CheckDependenciesPage;
