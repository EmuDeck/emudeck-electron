import React, { useEffect, useState, useContext } from 'react';
import { GlobalContext } from 'context/globalContext';
import { useNavigate } from 'react-router-dom';
import Welcome from 'components/organisms/Wrappers/Welcome';
import Wrapper from 'components/molecules/Wrapper/Wrapper';
import Footer from 'components/organisms/Footer/Footer';
import Header from 'components/organisms/Header/Header';

const WelcomePage = () => {
  const ipcChannel = window.electron.ipcRenderer;
  const { state, setState } = useContext(GlobalContext);
  const { system, mode, second, storagePath, gamemode } = state;
  const [statePage, setStatePage] = useState({
    disabledNext: true,
    disabledBack: true,
    downloadComplete: !navigator.onLine ? true : null,
    update: null,
    cloned: null,
    data: '',
  });
  const { disabledNext, disabledBack } = statePage;
  const navigate = useNavigate();
  const selectMode = (value) => {
    setState({ ...state, mode: value });
    if (second) {
      navigate('/rom-storage');
    }
  };

  // show changelog after update
  useEffect(() => {
    const showChangelog = localStorage.getItem('show_changelog');
    if (showChangelog === 'true') {
      navigate('/change-log');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (mode != null) {
      setStatePage({ ...statePage, disabledNext: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    ipcChannel.sendMessage('bash', [
      `sprunge|||cat ~/emudeck/emudeck.log | curl -F 'sprunge=<-' http://sprunge.us`,
    ]);
    ipcChannel.once('sprunge', (message) => {
      alert(`Copy this url: ${message}`);
    });
  };
  const functions = { openSRM, openCSM, sprunge, navigate };

  return (
    <Wrapper>
      {second === false && <Header title="Welcome to EmuDeck" />}
      {second === true && <Header title="Welcome back to EmuDeck" />}
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
