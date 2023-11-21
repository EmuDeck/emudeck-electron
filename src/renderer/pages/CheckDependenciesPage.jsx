import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Wrapper from 'components/molecules/Wrapper/Wrapper';
import GamePad from 'components/organisms/GamePad/GamePad';
import Header from 'components/organisms/Header/Header';
import { Img } from 'getbasecore/Atoms';
import Card from 'components/molecules/Card/Card';
import { iconSuccess, iconDanger } from 'components/utils/images/images';
import ProgressBar from 'components/atoms/ProgressBar/ProgressBar';
import EmuModal from 'components/molecules/EmuModal/EmuModal';

import gitLogo from 'assets/git-logo.png';
import steamLogo from 'assets/steam-logo.png';

function CheckDependenciesPage() {
  const [stateGIT, setStateGIT] = useState({
    statusGIT: null,
  });
  const { statusGIT } = stateGIT;
  const [state7Zip, setState7Zip] = useState({
    status7Zip: true,
  });
  const { status7Zip } = state7Zip;
  const [stateSteam, setStateSteam] = useState({
    statusSteam: null,
  });
  const { statusSteam } = stateSteam;

  const ipcChannel = window.electron.ipcRenderer;
  const navigate = useNavigate();

  const [statePage, setStatePage] = useState({
    dom: undefined,
    modal: false,
  });
  const { dom, modal } = statePage;

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

  const showModal = (url) => {
    const modalData = {
      active: true,
      header: <span className="h4">Downloading dependency</span>,
      body: (
        <>
          <p>
            If your download doesn't start please open this url in a browser:
          </p>
          <p>
            <strong>{url}</strong>
          </p>
          <p>
            After that, restart EmuDeck, if the problem persists restart your
            device.
          </p>
        </>
      ),
    };
    setStatePage({ ...statePage, modal: modalData });
  };

  useEffect(() => {
    ipcChannel.sendMessage('system-info-in');
    ipcChannel.once('system-info-out', (system) => {
      if (system === 'win32') {
        // GIT?
        checkGit();
        // 7ZIP?
        check7Zip();
        // //Steam?
        checkSteam();
      } else {
        navigate('/patreon-login');
      }
    });
  }, []);

  useEffect(() => {
    if (statusGIT === true && status7Zip === true) {
      navigate('/patreon-login');
    }
  }, [statusGIT, status7Zip]);

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
        {statusGIT === undefined ||
          (statusSteam === undefined && (
            <Header title="Checking dependencies..." />
          ))}

        {!statusGIT ||
          (!statusSteam && (
            <>
              <Header title="Missing dependencies..." />
              <p className="lead">
                Please install the following programs, EmuDeck needs them to
                work. After that, restart EmuDeck, if the problem persists
                restart your device.
              </p>
            </>
          ))}

        <div className="container--grid">
          {statusGIT !== true && (
            <div data-col-sm="2">
              <Card css="is-selected">
                <img src={gitLogo} alt="GIT" />
                <a
                  className="btn-simple btn-simple--1 btn-simple--xs"
                  href="https://github.com/git-for-windows/git/releases/download/v2.43.0.windows.1/Git-2.43.0-64-bit.exe"
                  rel="noreferrer"
                  onClick={() =>
                    showModal(
                      'https://github.com/git-for-windows/git/releases/download/v2.43.0.windows.1/Git-2.43.0-64-bit.exe'
                    )
                  }
                >
                  Download GIT
                </a>
              </Card>
            </div>
          )}
          {statusSteam !== true && (
            <div data-col-sm="2">
              <Card css="is-selected">
                <img src={steamLogo} alt="Steam" />
                <a
                  className="btn-simple btn-simple--1 btn-simple--xs"
                  href="https://cdn.akamai.steamstatic.com/client/installer/SteamSetup.exe"
                  rel="noreferrer"
                  onClick={() =>
                    showModal(
                      'https://cdn.akamai.steamstatic.com/client/installer/SteamSetup.exe'
                    )
                  }
                >
                  Install Steam
                </a>
              </Card>
            </div>
          )}
        </div>
        <EmuModal modal={modal} />
      </Wrapper>
    </div>
  );
}

export default CheckDependenciesPage;
