import { useTranslation } from 'react-i18next';

import React, { useEffect, useState, useContext, useRef } from 'react';
import { GlobalContext } from 'context/globalContext';
import { useNavigate } from 'react-router-dom';
import Wrapper from 'components/molecules/Wrapper/Wrapper';
import Header from 'components/organisms/Header/Header';
import ProgressBar from 'components/atoms/ProgressBar/ProgressBar';
import Main from 'components/organisms/Main/Main';
import Footer from 'components/organisms/Footer/Footer';
import EmuModal from 'components/molecules/EmuModal/EmuModal';

import {
  imgra,
  imgares,
  imgdolphin,
  imgprimehack,
  imgppsspp,
  imgduckstation,
  imgcitra,
  imgpcsx2,
  imgrpcs3,
  imgyuzu,
  imgryujinx,
  imgcemu,
  imgxemu,
  imgmame,
  imgvita3k,
  imgflycast,
  imgxenia,
  imgsrm,
  imgrmg,
  imgscummvm,
  imgFrontESDE,
  imgmelonds,
  imgmgba,
  imgsupermodel,
  imgmodel2,
  imgbigpemu,
} from 'components/utils/images/images';

function AndroidEndPage() {
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
      //
      //       if (messageInput.includes('0')) {
      //         setStatePage({ ...statePage, disabledNext: false });
      //       }
      //       if (messageText.includes('999')) {
      //         setStatePage({ ...statePage, disabledNext: false });
      //       }
    });
  };

  let pollingTime = 500;
  if (system === 'win32') {
    pollingTime = 500;
  }

  // Reading messages from backend
  useEffect(() => {
    let interval;
    if (disabledNext) {
      interval = setInterval(() => {
        readMSG();
      }, pollingTime);
      return () => clearInterval(interval);
    }
    clearInterval(interval);
    navigate('/android-setup/Yuzu');
  }, [disabledNext]);

  // Running the installer
  useEffect(() => {
    const json = JSON.stringify(state);

    localStorage.setItem('settings_emudeck', json);

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
      {step !== 'setup' && (
        <Main>
          <EmuModal
            modalActiveValue={disabledNext === true}
            modalHeaderValue=<span className="h4">
              {t('AndroidEndPage.title')}
            </span>
            modalBodyValue={<p>{message}...</p>}
            modalFooterValue=""
            modalCSSValue="emumodal--xs"
          />
        </Main>
      )}
    </Wrapper>
  );
}

export default AndroidEndPage;
