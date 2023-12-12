import React, { useState, useContext, useRef, useEffect } from 'react';
import { GlobalContext } from 'context/globalContext';
import { useParams, useNavigate } from 'react-router-dom';
import PatreonLogin from 'components/organisms/PatreonLogin/PatreonLogin';
import Wrapper from 'components/molecules/Wrapper/Wrapper';
import GamePad from 'components/organisms/GamePad/GamePad';
import Header from 'components/organisms/Header/Header';
import Footer from 'components/organisms/Footer/Footer';
import GameMode from 'components/organisms/Wrappers/GameMode';
import { BtnSimple } from 'getbasecore/Atoms';
import EmuModal from 'components/molecules/EmuModal/EmuModal';

function GameModePage() {
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
        header: <span className="h4">Game Mode enabled</span>,
        body: (
          <>
            <p>
              Restart your device to go into Game Mode, Exit Steam to go back to
              your Desktop
            </p>
            <p>
              Make sure to add exceptions in your antivirus to these files
              before restarting or your computer won't start properly.
              <br />
            </p>
            <p>
              <code>
                USER\AppData\Roaming\EmuDeck\backend\tools\gamemode\enable.exe
              </code>
              <code>
                USER\AppData\Roaming\EmuDeck\backend\tools\gamemode\disable.exe
              </code>
              <code>
                USER\AppData\Roaming\EmuDeck\backend\tools\gamemode\login.exe
              </code>
            </p>
          </>
        ),
        css: 'emumodal--sm',
      };
    } else {
      modalData = {
        active: true,
        header: <span className="h4">Desktop Mode enabled</span>,
        body: (
          <p>
            Next time you restart your device you'll go directly into Desktop
            Mode
          </p>
        ),
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
    <div style={{ height: '100vh' }}>
      <Wrapper>
        <PatreonLogin>
          <Header title="Boot Mode" />
          <GameMode onClick={gameModeSet} disableButton={disableButton} />
        </PatreonLogin>
        <Footer />
        <EmuModal modal={modal} />
      </Wrapper>
    </div>
  );
}

export default GameModePage;
