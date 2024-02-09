import React, { useEffect, useState, useContext, useRef } from 'react';
import { GlobalContext } from 'context/globalContext';
import { useNavigate } from 'react-router-dom';
import Wrapper from 'components/molecules/Wrapper/Wrapper';
import Header from 'components/organisms/Header/Header';
import ProgressBar from 'components/atoms/ProgressBar/ProgressBar';
import { Main } from 'components/organisms/Main/Main';
import End from 'components/organisms/Wrappers/End';
import { yoshiMario } from 'components/utils/images/gifs';

function AndroidEndPage() {
  const navigate = useNavigate();
  const { state, setState } = useContext(GlobalContext);
  const [statePage, setStatePage] = useState({
    disabledNext: true,
    disabledBack: true,
    data: '',
    step: undefined,
    dom: undefined,
  });

  const { disabledNext, data, step } = statePage;
  const { second, branch, gamemode, device, system, android } = state;
  const { storagePath, installEmus, installFrontends, overwriteConfigEmus } =
    android;
  const ipcChannel = window.electron.ipcRenderer;

  const [msg, setMsg] = useState({
    message: '',
    percentage: 0,
  });

  const { message, percentage } = msg;

  const readMSG = () => {
    ipcChannel.sendMessage('getMSG', []);
    ipcChannel.on('getMSG', (messageInput) => {
      //
      console.log({ messageInput });
      const messageArray = messageInput.stdout.split('#');
      const messageText = messageArray[1];
      let messagePercent = messageArray[0];
      messagePercent = messagePercent.replaceAll(' ', '');
      messagePercent = messagePercent.replaceAll('\n', '');
      messagePercent = messagePercent.replaceAll('\n\r', '');
      messagePercent = messagePercent.replaceAll('\r', '');
      setMsg({ message: messageText, percentage: messagePercent });
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
      timer = 30000;
    } else {
      timer = 10000;
    }
    const timerId = setTimeout(() => {
      setStatePage({
        ...statePage,
        modal: {
          active: false,
        },
      });
      clearTimeout(timerId);
    }, timer);
  };

  let pollingTime = 500;
  if (system === 'win32') {
    pollingTime = 2000;
  }

  // Reading messages from backend
  useEffect(() => {
    if (disabledNext) {
      const interval = setInterval(() => {
        if (system === 'win32') {
          readMSG();
        } else {
          readMSG();
        }

        if (message.includes('100ANDROID')) {
          clearInterval(interval);
        }
      }, pollingTime);
      return () => clearInterval(interval);
    }
  }, [disabledNext]);

  // Running the installer
  useEffect(() => {
    const json = JSON.stringify(state);

    localStorage.setItem('settings_emudeck', json);

    // ipcChannel.sendMessage('bash-nolog', [
    //   `echo ${state.achievements.token} > "%userprofile%/AppData/Roaming/EmuDeck/.rat"`,
    // ]);
    // ipcChannel.sendMessage('bash-nolog', [
    //   `echo ${state.achievements.user} > "%userprofile%/AppData/Roaming/EmuDeck/.rau"`,
    // ]);

    ipcChannel.sendMessage('saveSettings', [JSON.stringify(state)]);
    ipcChannel.once('saveSettings', () => {
      if (system === 'win32') {
        ipcChannel.sendMessage('bash-nolog', [
          `finish|||powershell -ExecutionPolicy Bypass . $env:USERPROFILE/AppData/Roaming/EmuDeck/backend/android/setup.ps1`,
        ]);
      } else {
        ipcChannel.sendMessage('bash-nolog', [
          `finish|||bash ~/.config/EmuDeck/backend/android/setup.sh ${branch} false`,
        ]);
      }

      ipcChannel.once('finish', () => {
        setStatePage({ ...statePage, disabledNext: false });
      });
    });
  }, []);

  return (
    <Wrapper css="wrapper__full" aside={!disabledNext}>
      {disabledNext === true && (
        <>
          <Header title="We are completing your installation..." />

          <End
            onClick={openSRM}
            data={data}
            step={step}
            message={message}
            percentage={percentage}
            disabledNext
          />
        </>
      )}
      {disabledNext === false && (
        <>
          <span className="h3">Installation complete!</span>
          <p className="lead">You need to do some steps manually:</p>

          <p className="lead">
            You need to open every Emulator before launching Pegasus
          </p>
          <p className="lead">
            We've downloaded the RetroArch cores for you but you need to
            manually install them going to{' '}
            <strong>Load Core --- Install or Restore a core</strong> and select
            them one by one
          </p>
        </>
      )}
    </Wrapper>
  );
}

export default AndroidEndPage;
