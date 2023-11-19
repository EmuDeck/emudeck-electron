import React, { useContext, useRef, useState, useEffect } from 'react';
import { GlobalContext } from 'context/globalContext';
import { useNavigate } from 'react-router-dom';
import Wrapper from 'components/molecules/Wrapper/Wrapper';
import GamePad from 'components/organisms/GamePad/GamePad';
import { BtnSimple } from 'getbasecore/Atoms';
import Header from 'components/organisms/Header/Header';
import Footer from 'components/organisms/Footer/Footer';

import EmulatorResolution from 'components/organisms/Wrappers/EmulatorResolution';

function EmulatorConfigResolutionPage() {
  const ipcChannel = window.electron.ipcRenderer;
  const { state, setState } = useContext(GlobalContext);
  const { resolutions, system } = state;

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
    if (system === 'win32') {
      ipcChannel.sendMessage('emudeck', [
        `setResolutions|||setSetting dolphinResolution ${state.resolutions.dolphin}
				&& setSetting duckstationResolution ${state.resolutions.duckstation}
				&& setSetting pcsx2Resolution ${state.resolutions.pcsx2}
				&& setSetting yuzuResolution ${state.resolutions.yuzu}
				&& setSetting ppssppResolution ${state.resolutions.ppsspp}
				&& setSetting rpcs3Resolution ${state.resolutions.rpcs3}
				&& setSetting ryujinxResolution ${state.resolutions.ryujinx}
				&& setSetting xemuResolution ${state.resolutions.xemu}
				&& setSetting xeniaResolution ${state.resolutions.xenia} && setResolutions`,
      ]);
    } else {
      ipcChannel.sendMessage('emudeck', [
        `setResolutions|||setSetting dolphinResolution ${state.resolutions.dolphin};
				setSetting duckstationResolution ${state.resolutions.duckstation};
				setSetting pcsx2Resolution ${state.resolutions.pcsx2};
				setSetting yuzuResolution ${state.resolutions.yuzu};
				setSetting ppssppResolution ${state.resolutions.ppsspp};
				setSetting rpcs3Resolution ${state.resolutions.rpcs3};
				setSetting ryujinxResolution ${state.resolutions.ryujinx};
				setSetting xemuResolution ${state.resolutions.xemu};
				setSetting xeniaResolution ${state.resolutions.xenia}; setResolutions`,
      ]);
    }
    ipcChannel.once('setResolutions', (message) => {
      navigate('/');
    });
  };

  const [statePage, setStatePage] = useState({
    dom: undefined,
  });
  const { dom } = statePage;

  // GamePad
  const domElementsRef = useRef(null);
  const domElementsCur = domElementsRef.current;
  let domElements;
  useEffect(() => {
    if (domElementsCur && dom === undefined) {
      domElements = domElementsCur.querySelectorAll('button');
      setStatePage({ ...statePage, dom: domElements });
    }
  }, [statePage]);

  return (
    <div style={{ height: '100vh' }} ref={domElementsRef}>
      {dom !== undefined && <GamePad elements={dom} />}
      <Wrapper>
        <Header title="Emulator Resolution" />
        <EmulatorResolution onClick={setResolution} />
        <footer className="footer">
          <BtnSimple
            css="btn-simple--1"
            type="button"
            aria="Disabled"
            onClick={() => saveResolutions()}
          >
            Save settings
          </BtnSimple>
        </footer>
      </Wrapper>
    </div>
  );
}

export default EmulatorConfigResolutionPage;
