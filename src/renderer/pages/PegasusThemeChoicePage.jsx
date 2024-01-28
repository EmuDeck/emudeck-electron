import React, { useState, useContext, useRef, useEffect } from 'react';
import { useFetchCond } from 'hooks/useFetchCond';
import { useNavigate } from 'react-router-dom';
import { GlobalContext } from 'context/globalContext';
import Wrapper from 'components/molecules/Wrapper/Wrapper';

import Header from 'components/organisms/Header/Header';
import Footer from 'components/organisms/Footer/Footer';
import EmuModal from 'components/molecules/EmuModal/EmuModal';
import PegasusThemeChoice from 'components/organisms/Wrappers/PegasusThemeChoice';
import { BtnSimple } from 'getbasecore/Atoms';
import ProgressBar from 'components/atoms/ProgressBar/ProgressBar';

function PegasusThemeChoicePage() {
  const navigate = useNavigate();
  const ipcChannel = window.electron.ipcRenderer;
  const { state, setState } = useContext(GlobalContext);
  const { themePegasus } = state;
  const [statePage, setStatePage] = useState({
    disabledNext: false,
    disabledBack: false,
    themes: undefined,
    modal: undefined,
  });

  const { disabledNext, disabledBack, themes, modal } = statePage;
  const themeSet = (themeName) => {
    setState({
      ...state,
      themePegasus: themeName,
    });
  };

  const themesWS = useFetchCond('https://token.emudeck.com/pegasus-themes.php');
  useEffect(() => {
    themesWS.post({}).then((data) => {
      setStatePage({ ...statePage, themes: data });
    });
  }, []);

  const installTheme = () => {
    const modalData = {
      active: true,
      header: <span className="h4">Installing theme</span>,
      body: <p>Please wait...</p>,
      footer: <ProgressBar css="progress--success" infinite max="100" />,
      css: 'emumodal--xs',
    };
    setStatePage({ ...statePage, modal: modalData });
    console.log(`pegasus_applyTheme|||pegasus_applyTheme ${themePegasus[0]}`);

    ipcChannel.sendMessage('emudeck', [
      `pegasus_applyTheme|||pegasus_applyTheme ${themePegasus[0]}`,
    ]);
    ipcChannel.once('pegasus_applyTheme', () => {
      const modalData = {
        active: true,
        header: <span className="h4">Theme installed</span>,
        body: <p>Next time you open Pegasus this will be the default theme.</p>,
        css: 'emumodal--sm',
      };
      setStatePage({ ...statePage, modal: modalData });
    });
  };

  return (
    <div style={{ height: '100vh' }}>
      <Wrapper aside={false}>
        <Header title="Pegasus Default Theme" />
        <PegasusThemeChoice themes={themes} onClick={themeSet} />
        <footer className="footer">
          <BtnSimple
            css="btn-simple--2"
            type="button"
            aria="Install Theme"
            onClick={() => navigate(-1)}
          >
            Back
          </BtnSimple>
          <BtnSimple
            css="btn-simple--1"
            type="button"
            aria="Install Theme"
            onClick={() => installTheme()}
          >
            Install Theme
          </BtnSimple>
        </footer>
        <EmuModal modal={modal} />
      </Wrapper>
    </div>
  );
}

export default PegasusThemeChoicePage;
