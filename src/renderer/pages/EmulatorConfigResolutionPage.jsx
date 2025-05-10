import { useTranslation } from 'react-i18next';
import React, { useContext, useRef, useState, useEffect } from 'react';
import { GlobalContext } from 'context/globalContext';
import { useNavigate } from 'react-router-dom';
import Wrapper from 'components/molecules/Wrapper/Wrapper';

import { BtnSimple } from 'getbasecore/Atoms';
import Header from 'components/organisms/Header/Header';
import EmuModal from 'components/molecules/EmuModal/EmuModal';
import EmulatorResolution from 'components/organisms/Wrappers/EmulatorResolution';

function EmulatorConfigResolutionPage() {
  const { t, i18n } = useTranslation();
  const ipcChannel = window.electron.ipcRenderer;
  const { state, setState } = useContext(GlobalContext);
  const { resolutions, system } = state;
  const [statePage, setStatePage] = useState({
    modal: false,
  });
  const { modal } = statePage;
  const navigate = useNavigate();

  const setResolution = (emulator, resolution) => {
    setState({
      ...state,
      resolutions: {
        ...resolutions,
        [emulator]: resolution,
      },
    });
  };

  const saveResolutions = () => {
    const json = JSON.stringify(state);
    localStorage.setItem('settings_emudeck', json);

    const modalData = {
      active: true,
      header: <span className="h4">Settings saved!</span>,
      css: 'emumodal--sm',
      body: <p>Your emulators now have the new resolutions you set.</p>,
    };
    setStatePage({
      ...statePage,
      modal: modalData,
    });
  };

  return (
    <Wrapper>
      <Header title={t('EmulatorResolutionPage.title')} />
      <EmulatorResolution onClick={setResolution} />
      <footer className="footer">
        <BtnSimple
          css="btn-simple--1"
          type="button"
          aria="Disabled"
          onClick={() => saveResolutions()}
        >
          {t('general.save')}
        </BtnSimple>
      </footer>
      <EmuModal modal={modal} />
    </Wrapper>
  );
}

export default EmulatorConfigResolutionPage;
