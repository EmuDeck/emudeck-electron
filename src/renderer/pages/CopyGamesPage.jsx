import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlobalContext } from 'context/globalContext';
import Wrapper from 'components/molecules/Wrapper/Wrapper';
import Header from 'components/organisms/Header/Header';
import Footer from 'components/organisms/Footer/Footer';
import { BtnSimple } from 'getbasecore/Atoms';
import CopyGames from 'components/organisms/Wrappers/CopyGames';

function CopyGamesPage() {
  const ipcChannel = window.electron.ipcRenderer;
  const navigate = useNavigate();
  const { state, setState } = useContext(GlobalContext);
  const { storagePath, second } = state;
  const [statePage, setStatePage] = useState({
    disabledNext: true,
    disabledBack: false,
    statusCopyGames: null,
    statusCreateStructure: null,
    status: undefined,
    storageUSB: undefined,
    storageUSBPath: undefined,
  });
  const {
    disabledNext,
    disabledBack,
    statusCopyGames,
    statusCreateStructure,
    status,
    storageUSBPath,
    storageUSB,
  } = statePage;

  const storageSet = (storageName) => {
    console.log({ storageName });
    //We prevent the function to continue if the custom location testing is still in progress
    if (status == 'testing') {
      return;
    }

    if (storageName === 'Custom') {
      ipcChannel.sendMessage('emudeck', ['customLocation|||customLocation']);

      ipcChannel.once('customLocation', (message) => {
        let pathUSB = message.stdout.replace('\n', '');

        setStatePage({
          ...statePage,
          disabledNext: true,
          status: 'testing',
          storageUSB: storageName,
          storageUSBPath: pathUSB,
        });
        //is it valid?

        ipcChannel.sendMessage('emudeck', [
          `testLocation|||sleep 1 && testLocationValidRelaxed "custom" "${stdout}"`,
        ]);

        ipcChannel.once('testLocation', (message) => {
          let stdout = message.stdout.replace('\n', '');
          console.log({ stdout });
          let status;
          stdout.includes('Valid') ? (status = true) : (status = false);
          console.log({ status });
          if (status == true) {
            setStatePage({
              ...statePage,
              disabledNext: false,
              status: undefined,
              storageUSB: storageName,
              storageUSBPath: pathUSB,
            });
          } else {
            alert('Non writable directory selected, please choose another.');
            setStatePage({
              ...statePage,
              disabledNext: true,
              status: undefined,
              storageUSB: undefined,
              storageUSBPath: undefined,
              statusCreateStructure: null,
            });
          }
        });
      });
    }
  };

  const startCopyGames = () => {
    setStatePage({
      ...statePage,
      statusCopyGames: true,
    });

    ipcChannel.sendMessage('emudeck', [
      `CopyGames|||CopyGames ${storageUSBPath} ${storageUSBPath}`,
    ]);

    ipcChannel.once('CopyGames', (message) => {
      let stdout = message.stdout.replace('\n', '');
      console.log(stdout);
      setStatePage({
        ...statePage,
        statusCopyGames: null,
      });
    });
  };

  const startCreateStructureOnUSB = () => {
    setStatePage({
      ...statePage,
      statusCreateStructure: 'waiting',
    });
    ipcChannel.sendMessage('emudeck', [
      `CreateStructureUSB|||CreateStructureUSB ${storageUSBPath}`,
    ]);

    ipcChannel.once('CopyGames_init', (message) => {
      let stdout = message.stdout.replace('\n', '');
      console.log(stdout);
      setStatePage({
        ...statePage,
        statusCreateStructure: true,
      });
    });
  };

  const openSRM = () => {
    if (system === 'win32') {
      ipcChannel.sendMessage('bash', [
        `cd ${storagePath} && cd Emulation && cd tools && start srm.exe`,
      ]);
    } else {
      ipcChannel.sendMessage('bash', [
        `zenity --question --width 450 --title "Close Steam/Steam Input?" --text "$(printf "<b>Exit Steam to launch Steam Rom Manager? </b>\n\n To add your Emulators and EmulationStation-DE to steam hit Preview, then Generate App List, then wait for the images to download\n\nWhen you are happy with your image choices hit Save App List and wait for it to say it's completed.\n\nDesktop controls will temporarily revert to touch/trackpad/L2/R2")" && (kill -15 $(pidof steam) & ${storagePath}/Emulation/tools/srm/Steam-ROM-Manager.AppImage)`,
      ]);
    }

    setTimeout(() => {
      navigate('/welcome');
    }, 5000);
  };

  const skipAddingGames = () => {
    setStatePage({
      ...statePage,
      statusCopyGames: true,
    });
  };

  return (
    <Wrapper>
      {statusCopyGames !== true && (
        <Header title="Let's use an USB Drive to copy your games" />
      )}

      <CopyGames
        onClick={storageSet}
        onClickStart={startCreateStructureOnUSB}
        onClickCopyGames={startCopyGames}
        storagUSB={storageUSB}
        storageUSBPath={storageUSBPath}
        statusCopyGames={statusCopyGames}
        statusCreateStructure={statusCreateStructure}
      />
      <footer className="footer">
        {statusCopyGames === true && (
          <BtnSimple
            css="btn-simple--2"
            type="button"
            aria="Go Next"
            onClick={() => navigate('/welcome')}
          >
            Skip and go back to the home screen
          </BtnSimple>
        )}
        {statusCopyGames === true && (
          <BtnSimple
            css="btn-simple--1"
            type="button"
            aria="Go Next"
            onClick={() => openSRM()}
          >
            Open Steam Rom Manager
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
        {second && (
          <>
            <BtnSimple
              css="btn-simple--2"
              type="button"
              aria="Go Back"
              onClick={() => navigate(-1)}
            >
              Go Back
            </BtnSimple>
            <BtnSimple
              css="btn-simple--3"
              type="button"
              aria="Go Next"
              onClick={() => openSRM()}
            >
              Skip, just open Steam Rom Manager
            </BtnSimple>
          </>
        )}
      </footer>
    </Wrapper>
  );
}

export default CopyGamesPage;
