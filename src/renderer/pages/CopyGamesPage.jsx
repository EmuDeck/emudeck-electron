import { useTranslation } from 'react-i18next';
import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlobalContext } from 'context/globalContext';
import Wrapper from 'components/molecules/Wrapper/Wrapper';
import Main from 'components/organisms/Main/Main';
import EmuModal from 'components/molecules/EmuModal/EmuModal';
import ProgressBar from 'components/atoms/ProgressBar/ProgressBar';
import Header from 'components/organisms/Header/Header';
import { BtnSimple, Img, Iframe } from 'getbasecore/Atoms';
import CopyGamesAuto from 'components/organisms/Wrappers/CopyGamesAuto';
import SelectorMenu from 'components/molecules/SelectorMenu/SelectorMenu';
import { Alert } from 'getbasecore/Molecules';
import { imgSTEAM } from 'components/utils/images/images';
import { iconSuccess, iconDanger } from 'components/utils/images/icons';

function CopyGamesPage() {
  const { t, i18n } = useTranslation();
  const ipcChannel = window.electron.ipcRenderer;
  const navigate = useNavigate();
  const { state, setState } = useContext(GlobalContext);
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
    mode: undefined,
    frontend: undefined,
  });
  const {
    statusCopyGames,
    statusCreateStructure,
    status,
    storageUSBPath,
    storageUSB,
    modal,
    mode,
    frontend,
  } = statePage;
  const [stateBios, setStateBios] = useState({
    PlayStation1: undefined,
    PlayStation2: undefined,
    SegaCD: undefined,
    Saturn: undefined,
    NintendoDS: undefined,
    Switch: undefined,
    Dreamcast: undefined,
  });

  const updateBiosState = (prevState, key) => {
    return { ...prevState, key };
  };

  const checkBios = (bios) => {
    let biosToCheck;
    switch (bios) {
      case 'PlayStation1':
        biosToCheck = 'checkPS1BIOS';
        break;
      case 'PlayStation2':
        biosToCheck = 'checkPS2BIOS';
        break;
      case 'Switch':
        biosToCheck = 'checkYuzuBios';
        break;
      case 'SegaCD':
        biosToCheck = 'checkSegaCDBios';
        break;
      case 'Saturn':
        biosToCheck = 'checkSaturnBios';
        break;
      case 'Dreamcast':
        biosToCheck = 'checkDreamcastBios';
        break;
      case 'NintendoDS':
        biosToCheck = 'checkDSBios';
        break;
      default:
        break;
    }

    ipcChannel.sendMessage('emudeck', [`checkBios|||${biosToCheck}`]);

    ipcChannel.once('checkBios', (message) => {
      const { stdout } = message;
      let status;
      stdout.includes('false') ? (status = false) : (status = true);
      updateBiosState((prevState) => ({ ...prevState, [bios]: status }));

      setStateBios((prevState) =>
        updateBiosState({ ...prevState, [bios]: status })
      );
    });
  };

  useEffect(() => {
    if (statusCopyGames === true) {
      checkBios('PlayStation1');
      checkBios('PlayStation2');
      checkBios('Switch');
      checkBios('SegaCD');
      checkBios('Saturn');
      checkBios('Dreamcast');
      checkBios('NintendoDS');
    }
  }, [statusCopyGames]);

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
      console.log({ stdout });
      let status;
      stdout.includes('true') ? (status = true) : (status = false);
      let modalData;
      if (stdout.includes('true')) {
        status = true;
        modalData = {
          active: true,
          header: <span className="h4">Folders created</span>,
          body: (
            <>
              <p>We've created the following folders:</p>
              <ul className="list">
                <li>{storageUSBPath}/EmuDeck/roms</li>
                <li>{storageUSBPath}/EmuDeck/bios</li>
              </ul>
              <span className="h4">Roms</span>
              <p>
                Every system has it's own subfolder, check {storageUSBPath}
                /roms/systems.txt to learn which folder is for each system
              </p>
              <span className="h4">Bios</span>
              <p>
                Don't create any aditional folder or subfolder, if a system
                doesn't have its own folder, just copy the bios file in the roms
                folder.
              </p>
            </>
          ),
          css: 'emumodal--xl',
        };
        setStatePage({
          ...statePage,
          modal: modalData,
          statusCreateStructure: status,
        });
      } else if (stdout.includes('false')) {
        status = false;
        modalData = {
          active: true,
          header: <span className="h4">Error</span>,
          body: (
            <p>
              There was an issue creating folders in your USB Drive, please try
              again.
            </p>
          ),
          css: 'emumodal--xs',
        };
        setStatePage({
          ...statePage,
          modal: modalData,
          statusCreateStructure: status,
        });
      } else {
        // Already created folders? let's copy
        startCopyGames();
      }
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
    let timer;

    if (system === 'win32') {
      timer = 10;
    } else {
      timer = 10;
    }
    const timerId = setTimeout(() => {
      setStatePage({
        ...statePage,
        modal: {
          active: false,
        },
      });
      navigate('/hotkeys');
      clearTimeout(timerId);
    }, timer);
  };

  const skipAddingGames = () => {
    setStatePage({
      ...statePage,
      statusCopyGames: 'final',
    });
  };

  const finishAddingGames = () => {
    setStatePage({
      ...statePage,
      statusCopyGames: 'final',
    });
  };

  const selectMode = (item) => {
    setStatePage({
      ...statePage,
      mode: item,
    });
  };

  const selectFrontend = (item) => {
    setStatePage({
      ...statePage,
      frontend: item,
    });
  };

  const openEmulationFolder = () => {
    ipcChannel.sendMessage('open-folder', `${storagePath}/Emulation`);

    const modalData = {
      active: true,
      header: <span className="h4">Where do I copy my games?</span>,
      body: (
        <>
          <p>
            In the <strong>"roms"</strong> folder, you will find a large
            assortment of folders. These folders correspond to consoles. For
            example, <strong>"gc"</strong> is the folder for your Nintendo
            Gamecube ROMs. In the
            <strong>"bios"</strong> folder, you will place your BIOS directly
            into the folder unless a folder already exists.
          </p>
          <p>
            Once you have placed your ROMs and BIOS, you are ready to continue
          </p>
        </>
      ),
      css: 'emumodal--sm',
    };
    setStatePage({
      ...statePage,
      modal: modalData,
      statusCopyGames: 'manual',
    });
  };

  return (
    <Wrapper aside={second === true}>
      {mode === 'auto' && statusCopyGames === null && (
        <>
          <Header title="Use a USB Drive to transfer your games" />

          <CopyGamesAuto
            onClick={storageSet}
            onClickStart={startCreateStructureOnUSB}
            onClickCopyGames={startCopyGames}
            storagUSB={storageUSB}
            storageUSBPath={storageUSBPath}
            statusCopyGames={system === 'win32' ? true : statusCopyGames}
            statusCreateStructure={statusCreateStructure}
            installFrontends={installFrontends}
          />
        </>
      )}

      {mode === 'manual' && statusCopyGames === null && (
        <>
          <Header title="Manual Copy" />
          <p className="lead">
            Once you have collected your files, click the “Open Emulation
            Folder” button below
          </p>
          <div>
            <BtnSimple
              css="btn-simple--1"
              type="button"
              aria="Go Next"
              onClick={() => openEmulationFolder()}
            >
              Open Emulation Folder
            </BtnSimple>
          </div>
        </>
      )}

      {mode === 'manual' && statusCopyGames === 'manual' && (
        <>
          <Header title="Waiting for Manual Copy" />
          <p className="lead">
            Once you have copied your files please click on the "Next" button
          </p>
        </>
      )}

      {mode === undefined && (
        <>
          <Header title="Let's copy your games" />
          <p className="lead">
            First, you will need to gather your ROMs and BIOS. These are
            copyright and EmuDeck will not provide these for legal reasons.
          </p>
          {system !== 'win32' && (
            <SelectorMenu
              imgs={[[imgSTEAM, mode === undefined ? '' : 'is-hidden']]}
              options={[
                [
                  () => selectMode('manual'),
                  mode === 'manual' ? 'is-selected' : '',
                  'Manual copy',
                  'You will need to copy your games manually',
                  true,
                ],
                [
                  () => selectMode('auto'),
                  mode === 'auto' ? 'is-selected' : '',
                  'Automatic import',
                  "You'll need a different computer to create a USB Drive",
                  true,
                ],
              ]}
            />
          )}
          {system === 'win32' && (
            <SelectorMenu
              imgs={[[imgSTEAM, mode === undefined ? '' : 'is-hidden']]}
              options={[
                [
                  () => selectMode('manual'),
                  mode === 'manual' ? 'is-selected' : '',
                  'Manual copy',
                  'You will need to copy your games manually',
                  true,
                ],
              ]}
            />
          )}
        </>
      )}

      {statusCopyGames === true && (
        <>
          <Header title="Let's test those BIOS" />
          <p className="lead">
            Some games will not load properly without BIOS files in place. Place
            your BIOS in Emulation/bios and use this BIOS Checker to ensure that
            you have the correct BIOS for your system.
          </p>
          <Main>
            <div className="container--grid">
              <div data-col-sm="6">
                {Object.entries(stateBios).map((item, index) => {
                  if (item[0] === 'key') {
                    return;
                  }
                  return (
                    <Alert
                      key={item[0]}
                      css={`alert--mini ${
                        item[1] === true ? 'alert--success' : 'alert--danger'
                      }`}
                    >
                      {item[1] === true && (
                        <Img src={iconSuccess} css="icon icon--xs" alt="OK" />
                      )}
                      {item[1] === false && (
                        <Img src={iconDanger} css="icon icon--xs" alt="OK" />
                      )}
                      {item[0]} BIOS
                    </Alert>
                  );
                })}
              </div>
              <div data-col-sm="6">
                <Alert css="alert--info">
                  <ul className="list">
                    <li>
                      Tip 1: Not all systems require additional BIOS files.
                      Listed here are the more common systems.
                    </li>
                    <li>
                      Tip 2: Make sure you have the correct BIOS for your ROM
                      region. Your ROMs may come from the United States, Japan,
                      Europe, etc.
                    </li>
                    <li>
                      Tip 3: Casing matters. Even if your BIOS are detected,
                      your BIOS must be lowercase for Playstation 1 and
                      Playstation 2.
                    </li>
                    <li>
                      Tip 4: Your BIOS files must be placed in Emulation/bios.
                      Do not make sub-folders for BIOS files. For the Nintendo
                      Switch, use our pre-created folders.
                    </li>
                  </ul>
                </Alert>
              </div>
            </div>
          </Main>
        </>
      )}

      {statusCopyGames === 'final' && (
        <>
          <Header title="How to launch your games?" />

          {system != 'win32' && (
            <Main>
              {installFrontends.steam.status && (
                <>
                  <p className="lead">
                    Steam ROM Manager or SRM is a tool that will add your Games,
                    Emulators to your Steam Library so you can launch them in
                    Game Mode
                  </p>

                  <Iframe src="https://www.youtube-nocookie.com/embed/BsqWFHPp5UU?autoplay=1&playlist=BsqWFHPp5UU&loop=1&controls=0&mute=1&rel=0&modestbranding=1" />
                </>
              )}
              {installFrontends.esde.status && (
                <>
                  <p className="lead">
                    We've added EmulationStation DE (ES-DE) to your Steam
                    Library. Finish the installation and then go back to gaming
                    mode, look for ES-DE in the Non Steam Games tab
                  </p>
                  <Iframe src="https://www.youtube-nocookie.com/embed/twNE8i3aI0g?autoplay=1&playlist=twNE8i3aI0g&loop=1&controls=0&mute=1&rel=0&modestbranding=1" />
                </>
              )}
              {installFrontends.deckyromlauncher.status && (
                <>
                  <p className="lead">
                    We've added EmulationStation DE (ES-DE) to your Steam
                    Library. Finish the installation and then go back to gaming
                    mode, look for ES-DE in the Non Steam Games tab
                  </p>
                  <Iframe src="https://www.youtube-nocookie.com/embed/aVZuoIfIdkU?autoplay=1&playlist=aVZuoIfIdkU&loop=1&controls=0&mute=1&rel=0&modestbranding=1" />
                </>
              )}
            </Main>
          )}

          {system == 'win32' && mode == 'easy' && (
            <Main>
              {installFrontends.esde.status && (
                <>
                  <p className="lead">
                    We've added EmulationStation DE (ES-DE) to your Steam
                    Library. Finish the installation and then go back to gaming
                    mode, look for ES-DE in the Non Steam Games tab
                  </p>
                  <Iframe src="https://www.youtube-nocookie.com/embed/twNE8i3aI0g?autoplay=1&playlist=twNE8i3aI0g&loop=1&controls=0&mute=1&rel=0&modestbranding=1" />
                </>
              )}
            </Main>
          )}
          {system == 'win32' && mode != 'easy' && (
            <Main>
              {installFrontends.steam.status && (
                <>
                  <p className="lead">
                    Steam ROM Manager or SRM is a tool that will add your Games,
                    Emulators to your Steam Library so you can launch them in
                    Game Mode
                  </p>

                  <Iframe src="https://www.youtube-nocookie.com/embed/BsqWFHPp5UU?autoplay=1&playlist=BsqWFHPp5UU&loop=1&controls=0&mute=1&rel=0&modestbranding=1" />
                </>
              )}
              {installFrontends.esde.status && (
                <>
                  <p className="lead">
                    We've added EmulationStation DE (ES-DE) to your Steam
                    Library. Finish the installation and then go back to gaming
                    mode, look for ES-DE in the Non Steam Games tab
                  </p>
                  <Iframe src="https://www.youtube-nocookie.com/embed/twNE8i3aI0g?autoplay=1&playlist=twNE8i3aI0g&loop=1&controls=0&mute=1&rel=0&modestbranding=1" />
                </>
              )}
            </Main>
          )}
        </>
      )}
      <footer className="footer">
        {statusCopyGames === true ||
          (statusCopyGames === 'final' && second && (
            <BtnSimple
              css="btn-simple--2"
              type="button"
              aria="Go Next"
              onClick={() => navigate('/hotkeys')}
            >
              Skip
            </BtnSimple>
          ))}
        {statusCopyGames === 'final' && installFrontends.steam.status && (
          <BtnSimple
            css="btn-simple--1"
            type="button"
            aria="Go Next"
            onClick={() => openSRM()}
          >
            Launch Steam ROM Manager
          </BtnSimple>
        )}
        {statusCopyGames === 'final' && installFrontends.esde.status && (
          <BtnSimple
            css="btn-simple--2"
            type="button"
            aria="Go Next"
            onClick={() => navigate('/hotkeys')}
          >
            Next
          </BtnSimple>
        )}
        {statusCopyGames === 'final' &&
          installFrontends.deckyromlauncher.status && (
            <BtnSimple
              css="btn-simple--2"
              type="button"
              aria="Go Next"
              onClick={() => navigate('/hotkeys')}
            >
              Next
            </BtnSimple>
          )}
        {statusCopyGames === true && (
          <BtnSimple
            css="btn-simple--1"
            type="button"
            aria="Go Next"
            onClick={() => finishAddingGames()}
          >
            Next
          </BtnSimple>
        )}
        {statusCopyGames === 'manual' && (
          <BtnSimple
            css="btn-simple--1"
            type="button"
            aria="Go Next"
            onClick={() => skipAddingGames()}
          >
            Next
          </BtnSimple>
        )}

        {second && statusCopyGames === null && (
          <BtnSimple
            css="btn-simple--2"
            type="button"
            aria="Go Back"
            onClick={() => navigate('/emulators')}
          >
            Skip for now
          </BtnSimple>
        )}
      </footer>
      <EmuModal modal={modal} />
    </Wrapper>
  );
}

export default CopyGamesPage;
