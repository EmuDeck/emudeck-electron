import { useTranslation } from 'react-i18next';
import React, { useEffect, useState, useContext, useRef } from 'react';
import { GlobalContext } from 'context/globalContext';
import { useNavigate } from 'react-router-dom';
import Wrapper from 'components/molecules/Wrapper/Wrapper';

import Header from 'components/organisms/Header/Header';
import ProgressBar from 'components/atoms/ProgressBar/ProgressBar';
import { BtnSimple } from 'getbasecore/Atoms';
import Sonic from 'components/organisms/Sonic/Sonic';
import End from 'components/organisms/Wrappers/End';

function EndPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { state, setState } = useContext(GlobalContext);
  const [statePage, setStatePage] = useState({
    disabledNext: true,
    disabledBack: true,
    data: '',
    step: undefined,
    dom: undefined,
  });

  const { disabledNext, data, step, dom } = statePage;
  const {
    second,
    branch,
    storagePath,
    gamemode,
    device,
    system,
    installEmus,
    installFrontends,
    overwriteConfigEmus,
  } = state;
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
      timer = 10;
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

  const showLog = () => {
    if (system === 'win32') {
      ipcChannel.sendMessage('bash-nolog', [
        `start powershell -NoExit -ExecutionPolicy Bypass -command "& { Get-Content $env:APPDATA/emudeck/logs/emudeckSetup.log -Tail 100 -Wait }"`,
      ]);
    } else if (system === 'darwin') {
      ipcChannel.sendMessage('bash-nolog', [
        `osascript -e 'tell app "Terminal" to do script "clear && tail -f $HOME/.config/EmuDeck/logs/emudeckSetup.log"'`,
      ]);
    } else {
      ipcChannel.sendMessage('bash-nolog', [
        `konsole -e tail -f "$HOME/.config/EmuDeck/logs/emudeckSetup.log"`,
      ]);
    }
  };

  let pollingTime = 500;
  if (system === 'win32') {
    pollingTime = 2000;
  }

  // Reading messages from backend
  useEffect(() => {
    const interval = setInterval(() => {
      readMSG();
      if (message.includes('100')) {
        clearInterval(interval);
      }
    }, pollingTime);

    return () => clearInterval(interval);
  }, []);

  // Running the installer
  useEffect(() => {
    const json = JSON.stringify(state);

    localStorage.setItem('settings_emudeck', json);

    ipcChannel.sendMessage('saveSettings', [JSON.stringify(state)]);
    ipcChannel.once('saveSettings', () => {
      if (system === 'win32') {
        ipcChannel.sendMessage('bash-nolog', [
          `finish|||powershell -ExecutionPolicy Bypass . $env:USERPROFILE/AppData/Roaming/EmuDeck/backend/setup.ps1`,
        ]);
      } else if (system === 'darwin') {
        ipcChannel.sendMessage('bash-nolog', [
          `finish|||osascript -e 'tell application "Terminal" to do script "bash ~/.config/EmuDeck/backend/setup.sh" activate'`,
        ]);
      } else {
        ipcChannel.sendMessage('bash-nolog', [
          `finish|||bash ~/.config/EmuDeck/backend/setup.sh ${branch} false`,
        ]);
      }

      ipcChannel.once('finish', () => {
        setStatePage({ ...statePage, disabledNext: false });
      });
    });
  }, []);

  let nextPage = '/copy-games';

  if (branch.includes('early') || branch === 'dev') {
    nextPage = '/cloud-sync';
  }

  return (
    <Wrapper css="wrapper__full" aside={false}>
      {disabledNext === true && <Header title={t('EndPage.title')} />}
      {disabledNext === false && step === undefined && system !== 'win32' && (
        <Header title={t('EndPage.titleFinish')} />
      )}

      {disabledNext === false &&
        step === undefined &&
        device === 'Asus Rog Ally' && <Header title={t('EndPage.titleAlly')} />}

      {disabledNext === false &&
        step === undefined &&
        device !== 'Asus Rog Ally' &&
        system === 'win32' && <Header title={t('EndPage.titleWin32')} />}

      <End
        onClick={openSRM}
        data={data}
        step={step}
        message={message}
        percentage={percentage}
        disabledNext={disabledNext}
      />
      <footer className="footer">
        <BtnSimple
          css="btn-simple--1"
          type="button"
          aria="Go Next"
          disabled={disabledNext && 'true'}
          onClick={() => navigate(nextPage)}
        >
          Next
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
      </footer>
    </Wrapper>
  );
}

export default EndPage;
