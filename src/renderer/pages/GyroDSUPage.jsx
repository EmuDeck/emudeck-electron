import { useTranslation } from 'react-i18next';
import React, { useEffect, useState, useContext, useRef } from 'react';
import { GlobalContext } from 'context/globalContext';
import Wrapper from 'components/molecules/Wrapper/Wrapper';

import Header from 'components/organisms/Header/Header';
import Footer from 'components/organisms/Footer/Footer';
import EmuModal from 'components/molecules/EmuModal/EmuModal';
import ProgressBar from 'components/atoms/ProgressBar/ProgressBar';
import GyroDSU from 'components/organisms/Wrappers/GyroDSU';

function GyroDSUPage() {
  const { t, i18n } = useTranslation();
  const { state, setState } = useContext(GlobalContext);
  const [statePage, setStatePage] = useState({
    disabledNext: false,
    disabledBack: false,
    data: '',
    hasSudo: false,
    sudoPass: 'Decky!',
    pass1: 'a',
    pass2: 'b',
    modal: false,
    dom: undefined,
  });
  const {
    disabledNext,
    disabledBack,
    hasSudo,
    sudoPass,
    pass1,
    pass2,
    modal,
    dom,
  } = statePage;

  const ipcChannel = window.electron.ipcRenderer;

  const installGyro = (data) => {
    const escapedPass = sudoPass.replaceAll("'", "'\\''");
    ipcChannel.sendMessage('bash', [
      `Gyro|||konsole -e  sh -c '. ~/.config/EmuDeck/backend/functions/all.sh && Plugins_installSteamDeckGyroDSU "${escapedPass}" && echo "" && read -n 1 -s -r -p "Press any key to exit" && exit 0'`,
    ]);

    ipcChannel.once('Gyro', (status) => {
      const { stdout } = status;
      const sterr = status.stdout;
      const { error } = status;

      let modalData;
      if (stdout.includes('true')) {
        modalData = {
          active: true,
          header: <span className="h4">Success!</span>,
          body: <p>GyroDSU Installed</p>,
          css: 'emumodal--xs',
        };

        setStatePage({
          ...statePage,
          modal: modalData,
        });
      } else {
        modalData = {
          active: true,
          header: <span className="h4">Error installing plugin</span>,
          body: <p>{JSON.stringify(status.stderr)}</p>,
          css: 'emumodal--xs',
        };

        setStatePage({
          ...statePage,
          modal: modalData,
        });
      }
    });
  };

  useEffect(() => {
    ipcChannel.sendMessage('bash', [
      'checkPWD|||passwd -S $(whoami) | awk -F " " "{print $2}" & exit',
    ]);

    ipcChannel.once('checkPWD', (stdout) => {
      stdout = stdout.replace('\n', '');
      stdout.includes('NP') ? (stdout = false) : (stdout = true);
      setStatePage({
        ...statePage,
        hasSudo: stdout,
      });
    });
  }, []);

  return (
    <Wrapper>
      <Header title={t('GyroDSUPage.title')} />
      <p className="lead">{t('GyroDSUPage.description')}</p>
      <GyroDSU installClick={installGyro} passValidates={pass1 === pass2} />
      <Footer
        next={false}
        nextText={sudoPass ? t('general.continue') : t('general.skip')}
        disabledNext={disabledNext}
        disabledBack={disabledBack}
      />
      <EmuModal modal={modal} />
    </Wrapper>
  );
}

export default GyroDSUPage;
