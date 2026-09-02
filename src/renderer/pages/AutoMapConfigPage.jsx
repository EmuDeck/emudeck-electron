import { useTranslation } from 'react-i18next';
import React, { useContext, useRef, useState, useEffect } from 'react';
import { GlobalContext } from 'context/globalContext';
import { useNavigate } from 'react-router-dom';
import Wrapper from 'components/molecules/Wrapper/Wrapper';

import { BtnSimple } from 'getbasecore/Atoms';
import Header from 'components/organisms/Header/Header';
import EmuModal from 'components/molecules/EmuModal/EmuModal';
import AutoMap from 'components/organisms/Wrappers/AutoMap';

function AutoMapConfigPage() {
  const { t, i18n } = useTranslation();
  const ipcChannel = window.electron.ipcRenderer;
  const { state, setState } = useContext(GlobalContext);
  const { automap, system } = state;
  const [statePage, setStatePage] = useState({
    modal: false,
  });
  const { modal } = statePage;
  const navigate = useNavigate();

  const setAutoMap = (emulator, status) => {
    console.log({ emulator, status });
    setState({
      ...state,
      automap: {
        ...automap,
        [emulator]: status,
      },
    });
  };

  const saveAutoMapSettings = () => {
    const json = JSON.stringify(state);
    localStorage.setItem('settings_emudeck', json);

    ipcChannel.sendMessage('emudeck', [
      `setAutoMapSettings|||setSetting autoMapDolPhin ${state.automap.dolphin}; setSetting autoMapSwitch ${state.automap.yuzu}; setSetting autoMapCemu ${state.automap.cemu}; `,
    ]);

    ipcChannel.once('setAutoMapSettings', (message) => {
      console.log({ message });
      const modalData = {
        active: true,
        header: <span className="h4">{t('general.settingsSaved')}</span>,
        css: 'emumodal--sm',
        body: <p>{t('AutoMapConfigPage.saved')}</p>,
      };
      setStatePage({
        ...statePage,
        modal: modalData,
      });
    });
  };

  return (
    <Wrapper>
      <Header title={t('AutoMapPage.title')} />
      <p className="lead">{t('AutoMapPage.description')}</p>
      <AutoMap onClick={setAutoMap} />
      <footer className="footer">
        <BtnSimple
          css="btn-simple--1"
          type="button"
          aria={t('aria.disabled')}
          onClick={() => saveAutoMapSettings()}
        >
          {t('general.save')}
        </BtnSimple>
      </footer>
      <EmuModal modal={modal} />
    </Wrapper>
  );
}

export default AutoMapConfigPage;
