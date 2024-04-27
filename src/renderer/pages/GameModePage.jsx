import { useTranslation } from 'react-i18next';
import React, { useState, useContext, useRef, useEffect } from 'react';
import { GlobalContext } from 'context/globalContext';
import { useParams, useNavigate } from 'react-router-dom';
import PatreonLogin from 'components/organisms/PatreonLogin/PatreonLogin';
import Wrapper from 'components/molecules/Wrapper/Wrapper';

import Header from 'components/organisms/Header/Header';
import Footer from 'components/organisms/Footer/Footer';
import GameMode from 'components/organisms/Wrappers/GameMode';
import { BtnSimple } from 'getbasecore/Atoms';
import EmuModal from 'components/molecules/EmuModal/EmuModal';

function GameModePage() {
  const { t, i18n } = useTranslation();
  const ipcChannel = window.electron.ipcRenderer;
  const { state, setState } = useContext(GlobalContext);
  const { type } = useParams();
  const { cloudSyncType } = state;
  const [statePage, setStatePage] = useState({
    disabledNext: false,
    disabledBack: false,
    disableButton: false,
    modal: undefined,
  });
  const { disabledNext, disableButton, modal } = statePage;

  const navigate = useNavigate();

  const gameModeSet = (status) => {
    setState({
      ...state,
      gamemode: status,
    });

    let functionBootMode;
    status === true
      ? (functionBootMode = 'game_mode_enable')
      : (functionBootMode = 'game_mode_disable');
    let modalData;
    if (status) {
      modalData = {
        active: true,
        header: (
          <span className="h4">{t('GameModePage.modalGameEnabledTitle')}</span>
        ),
        body: <p>{t('GameModePage.modalGameEnabledDesc')}</p>,
        css: 'emumodal--sm',
      };
    } else {
      modalData = {
        active: true,
        header: (
          <span className="h4">
            {t('GameModePage.modalDesktopEnabledTitle')}
          </span>
        ),
        body: <p>{t('GameModePage.modalDesktopEnabledDesc')}</p>,
        css: 'emumodal--sm',
      };
    }

    ipcChannel.sendMessage('emudeck', [`bootMode|||${functionBootMode}`]);
    ipcChannel.once('bootMode', () => {
      setStatePage({ ...statePage, modal: modalData });
    });
  };

  const nextButtonStatus = () => {
    if (type === 'welcome') {
      return 'welcome';
    }
    return 'confirmation';
  };

  const CloseApp = () => {
    window.close();
  };

  return (
    <Wrapper>
      <PatreonLogin>
        <Header title={t('GameModePage.title')} />
        <p className="lead">{t('GameModePage.description')}.</p>
        <GameMode onClick={gameModeSet} disableButton={disableButton} />
      </PatreonLogin>
      <Footer />
      <EmuModal modal={modal} />
    </Wrapper>
  );
}

export default GameModePage;
