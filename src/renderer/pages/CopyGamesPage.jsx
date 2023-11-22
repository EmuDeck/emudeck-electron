import React, { useState, useContext, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlobalContext } from 'context/globalContext';
import Wrapper from 'components/molecules/Wrapper/Wrapper';
import GamePad from 'components/organisms/GamePad/GamePad';
import EmuModal from 'components/molecules/EmuModal/EmuModal';
import ProgressBar from 'components/atoms/ProgressBar/ProgressBar';
import Header from 'components/organisms/Header/Header';
import { BtnSimple } from 'getbasecore/Atoms';
import CopyGames from 'components/organisms/Wrappers/CopyGames';

function CopyGamesPage() {
  const ipcChannel = window.electron.ipcRenderer;
  const navigate = useNavigate();
  const { state } = useContext(GlobalContext);
  const { storagePath, second, system, installFrontends } = state;
  const [statePage, setStatePage] = useState({
    disabledNext: true,
    disabledBack: false,
    statusCopyGames: null,
    statusCreateStructure: null,
    status: undefined,
    storageUSB: undefined,
    storageUSBPath: undefined,
    modal: undefined,
    dom: undefined,
  });
  const {
    statusCopyGames,
    statusCreateStructure,
    status,
    storageUSBPath,
    storageUSB,
    modal,
    dom,
  } = statePage;

  const storageSet = (storageName) => {
    // We prevent the function to continue if the custom location testing is still in progress
    if (status === 'testing') {
      return;
    }

    if (storageName === 'Custom') {
      ipcChannel.sendMessage('emudeck', ['customLocation|||customLocation']);

      ipcChannel.once('customLocation', (message) => {
        const pathUSB = message.stdout.replace('\n', '');
        setStatePage({
          ...statePage,
          disabledNext: true,
          status: 'testing',
          storageUSB: storageName,
          storageUSBPath: pathUSB,
        });
        // is it valid?

        ipcChannel.sendMessage('emudeck', [
          `testLocation|||sleep 1 && testLocationValidRelaxed "custom" "${pathUSB}"`,
        ]);

        ipcChannel.once('testLocation', (message) => {
          const stdout = message.stdout.replace('\n', '');

          let status;
          stdout.includes('Valid') ? (status = true) : (status = false);

          if (status === true) {
            setStatePage({
              ...statePage,
              disabledNext: false,
              status: undefined,
              storageUSB: storageName,
              storageUSBPath: pathUSB,
            });
          } else {
            const modalData = {
              active: true,
              header: <span className="h4">Ooops 😞</span>,
              body: (
                <p>Non writable directory selected, please choose another.</p>
              ),
              css: 'emumodal--xs',
            };
            setStatePage({
              ...statePage,
              disabledNext: true,
              status: undefined,
              storageUSB: undefined,
              storageUSBPath: undefined,
              statusCreateStructure: null,
              modal: modalData,
            });
          }
        });
      });
    }
  };

  const startCopyGames = () => {
    ipcChannel.sendMessage('emudeck', [
      `CopyGames|||CopyGames '${storageUSBPath}'`,
    ]);

    ipcChannel.once('CopyGames', (message) => {
      const stdout = message.stdout.replace('\n', '');
      setStatePage({
        ...statePage,
        statusCopyGames: true,
      });
    });
  };

  const startCreateStructureOnUSB = () => {
    setStatePage({
      ...statePage,
      statusCreateStructure: 'waiting',
    });
    ipcChannel.sendMessage('emudeck', [
      `CreateStructureUSB|||CreateStructureUSB '${storageUSBPath}'`,
    ]);

    ipcChannel.once('CreateStructureUSB', (message) => {
      const stdout = message.stdout.replace('\n', '');

      setStatePage({
        ...statePage,
        statusCreateStructure: true,
      });
    });
  };

  const openSRM = () => {
    let modalData = {
      active: true,
      header: <span className="h4">Launching Steam Rom Manager</span>,
      body: (
        <p>
          We will close Steam if its running and then Steam Rom Manager will
          open, this could take a few seconds, please wait.
        </p>
      ),
      footer: <ProgressBar css="progress--success" infinite max="100" />,
      css: 'emumodal--xs',
    };

    if (system === 'win32') {
      setStatePage({ ...statePage, modal: modalData });
      ipcChannel.sendMessage(
        'emudeck',
        'powershell -ExecutionPolicy Bypass -NoProfile -File "$toolsPath/launchers/srm/steamrommanager.ps1"'
      );
    } else if (system !== 'darwin') {
      setStatePage({ ...statePage, modal: modalData });
      ipcChannel.sendMessage(
        'emudeck',
        '"$toolsPath/launchers/srm/steamrommanager.sh"'
      );
    } else {
      modalData = {
        active: true,
        header: <span className="h4">Launching Steam Rom Manager</span>,
        body: (
          <>
            <p>
              We will close Steam if its running and then Steam Rom Manager will
              open, this could take a few seconds, please wait.
            </p>
            <strong>
              Desktop controls will temporarily revert to touch/trackpad/L2/R2.
            </strong>
          </>
        ),
        footer: <ProgressBar css="progress--success" infinite max="100" />,
        css: 'emumodal--sm',
      };
      setStatePage({ ...statePage, modal: modalData });
      ipcChannel.sendMessage(
        'emudeck',
        '"$toolsPath/launchers/srm/steamrommanager.sh"'
      );
    }
    const timerId = setTimeout(() => {
      setStatePage({
        ...statePage,
        modal: {
          active: false,
        },
      });
      clearTimeout(timerId);
    }, 30000);
  };

  const skipAddingGames = () => {
    setStatePage({
      ...statePage,
      statusCopyGames: true,
    });
  };

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
        {statusCopyGames !== true && system !== 'win32' && (
          <Header title="Use a USB Drive to transfer your games" />
        )}

        <CopyGames
          onClick={storageSet}
          onClickStart={startCreateStructureOnUSB}
          onClickCopyGames={startCopyGames}
          storagUSB={storageUSB}
          storageUSBPath={storageUSBPath}
          statusCopyGames={system === 'win32' ? true : statusCopyGames}
          statusCreateStructure={statusCreateStructure}
          installFrontends={installFrontends}
        />
        <footer className="footer">
          {statusCopyGames === true && (
            <BtnSimple
              css="btn-simple--2"
              type="button"
              aria="Go Next"
              onClick={() => navigate('/welcome')}
            >
              Skip for now
            </BtnSimple>
          )}

          {system === 'win32' && (
            <BtnSimple
              css="btn-simple--1"
              type="button"
              aria="Go Next"
              onClick={() => openSRM()}
            >
              Open Steam ROM Manager
              <svg
                className="rightarrow"
                width="32"
                height="32"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill="currentColor"
                  d="M16.4091 8.48003L21.5024 13.5734L1.98242 13.5734L1.98242 18.0178H21.5024L16.4091 23.1111L19.5558 26.2578L30.018 15.7956L19.5558 5.33337L16.4091 8.48003Z"
                />
              </svg>
            </BtnSimple>
          )}

          {statusCopyGames === true && (
            <BtnSimple
              css="btn-simple--1"
              type="button"
              aria="Go Next"
              onClick={() => openSRM()}
            >
              Open Steam ROM Manager
              <svg
                className="rightarrow"
                width="32"
                height="32"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill="currentColor"
                  d="M16.4091 8.48003L21.5024 13.5734L1.98242 13.5734L1.98242 18.0178H21.5024L16.4091 23.1111L19.5558 26.2578L30.018 15.7956L19.5558 5.33337L16.4091 8.48003Z"
                />
              </svg>
            </BtnSimple>
          )}
          {statusCreateStructure === null &&
            statusCopyGames !== true &&
            !second && (
              <BtnSimple
                css="btn-simple--3"
                type="button"
                aria="Go Next"
                onClick={() => skipAddingGames()}
              >
                Skip
              </BtnSimple>
            )}
          {second && statusCopyGames === null && (
            <BtnSimple
              css="btn-simple--2"
              type="button"
              aria="Go Back"
              onClick={() => navigate('/welcome')}
            >
              Skip for now
            </BtnSimple>
          )}
        </footer>
        <EmuModal modal={modal} />
      </Wrapper>
    </div>
  );
}

export default CopyGamesPage;
