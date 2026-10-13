import { useTranslation } from 'react-i18next';
import React, { useEffect, useState, useContext, useRef } from 'react';
import { GlobalContext } from 'context/globalContext';
import { useNavigate } from 'react-router-dom';
import Wrapper from 'components/molecules/Wrapper/Wrapper';

import Header from 'components/organisms/Header/Header';
import ProgressBar from 'components/atoms/ProgressBar/ProgressBar';
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
  const installFinished = useRef(false);

  const readMSG = () => {
    ipcChannel.sendMessage('getMSG', []);
    ipcChannel.once('getMSG', (messageInput) => {
      if (installFinished.current) {
        return;
      }
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
    const modalData = {
      active: true,
      header: (
        <span className="h4">{t('general.launching')} Steam Rom Manager</span>
      ),
      body: <p>{t('aside.srm.body')}</p>,
      footer: <ProgressBar css="progress--success" infinite max="100" />,
      css: 'emumodal--xs',
    };

    if (system === 'win32') {
      setStatePage({ ...statePage, modal: modalData });
      ipcChannel.sendMessage(
        'emudeck',
        'powershell -ExecutionPolicy Bypass -NoProfile -File "$toolsPath/launchers/srm/steamrommanager.ps1"',
      );
    } else {
      setStatePage({ ...statePage, modal: modalData });
      ipcChannel.sendMessage(
        'emudeck',
        '"$toolsPath/launchers/srm/steamrommanager.sh"',
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
    if (!disabledNext) {
      installFinished.current = true;
      setMsg({ message: t('EndPage.installFinished'), percentage: 100 });
      return undefined;
    }
    const interval = setInterval(readMSG, pollingTime);

    return () => clearInterval(interval);
  }, [disabledNext]);

  // Running the installer
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      setTimeout(
        () => setStatePage({ ...statePage, disabledNext: false }),
        1000,
      );
      return;
    }

    const json = JSON.stringify(state);

    localStorage.setItem('settings_emudeck', json);

    ipcChannel.sendMessage('saveSettings', [JSON.stringify(state)]);
    ipcChannel.once('saveSettings', () => {
      if (system === 'win32') {
        ipcChannel.sendMessage('bash-nolog', [
          `finish|||powershell -ExecutionPolicy Bypass . $env:USERPROFILE/AppData/Roaming/EmuDeck/backend/setup.ps1`,
        ]);
      } else {
        ipcChannel.sendMessage('bash-nolog', [
          `finish|||bash ~/.config/EmuDeck/backend/setup.sh ${branch} false`,
        ]);
      }

      ipcChannel.once('finish', () => {
        localStorage.setItem('install_finished', 'true');
        setStatePage({ ...statePage, disabledNext: false });
      });
    });
  }, []);

  let nextPage = '/copy-games';

  if (branch.includes('early') || branch === 'dev') {
    nextPage = '/cloud-sync';
  }

  return (
    <Wrapper css="wrapper__fullscreen" aside={false}>
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
        onNext={() => navigate(nextPage)}
      />
    </Wrapper>
  );
}

export default EndPage;
