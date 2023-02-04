import React, { useEffect, useState, useContext, useRef } from 'react';
import { GlobalContext } from 'context/globalContext';
import { useNavigate } from 'react-router-dom';
import Welcome from 'components/organisms/Wrappers/Welcome.js';
import Wrapper from 'components/molecules/Wrapper/Wrapper.js';
import Footer from 'components/organisms/Footer/Footer.js';
import Header from 'components/organisms/Header/Header.js';
const WelcomePage = () => {
  const ipcChannel = window.electron.ipcRenderer;
  const { state, setState } = useContext(GlobalContext);
  const [statePage, setStatePage] = useState({
    disabledNext: true,
    disabledBack: true,
    downloadComplete: !navigator.onLine ? true : null,
    update: null,
    cloned: null,
    data: '',
  });
  const { disabledNext, disabledBack, downloadComplete, data, cloned, update } =
    statePage;
  const navigate = useNavigate();
  const selectMode = (value) => {
    setState({ ...state, mode: value });
    if (second) {
      navigate('/rom-storage');
    }
  };

  const {
    device,
    system,
    mode,
    command,
    second,
    branch,
    installEmus,
    overwriteConfigEmus,
    shaders,
    achievements,
    storagePath,
    gamemode,
  } = state;

  //show changelog after update
  useEffect(() => {
    const showChangelog = localStorage.getItem('show_changelog');
    const pendingUpdate = localStorage.getItem('pending_update');
    if (showChangelog == 'true') {
      navigate('/change-log');
    }
  }, []);

  useEffect(() => {
    console.log({ mode });
    if (mode != null) {
      setStatePage({ ...statePage, disabledNext: false });
    }
  }, [mode]);
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
  };

  const openCSM = () => {
    ipcChannel.sendMessage('bash', [
      'csm|||bash ~/.config/EmuDeck/backend/functions/cloudServicesManager.sh',
    ]);
    ipcChannel.once('csm', (message) => {
      console.log({ message });
    });
  };

  const sprunge = () => {
    const idMessage = Math.random();
    ipcChannel.sendMessage('bash', [
      `sprunge|||cat ~/emudeck/emudeck.log | curl -F 'sprunge=<-' http://sprunge.us`,
    ]);
    ipcChannel.once('sprunge', (message) => {
      let messageText = message.stdout;
      alert(`Copy this url: ${message}`);
    });
  };
  const functions = { openSRM, openCSM, sprunge, navigate };

  return (
    <Wrapper>
      {second === false && <Header title="Welcome to" bold={`EmuDeck`} />}
      {second === true && <Header title="Welcome back to" bold={`EmuDeck`} />}
      <Welcome
        functions={functions}
        alert={
          second
            ? ``
            : 'Do you need help installing EmuDeck for the first time? <a href="https://youtu.be/rs9jDHIDKkU" target="_blank">Check out this guide</a>'
        }
        alertCSS="alert--info"
        onClick={selectMode}
      />
      {second === false && (
        <Footer
          back={second ? 'tools-and-stuff' : false}
          backText={second ? 'Tools & stuff' : 'Install EmuDeck First'}
          third="change-log"
          thirdText="See changelog"
          fourthText="Exit EmuDeck"
          next="rom-storage"
          exit={gamemode}
          disabledNext={second ? false : disabledNext}
          disabledBack={second ? false : disabledBack}
        />
      )}
    </Wrapper>
  );
};

export default WelcomePage;
