import React, { useEffect, useState, useContext, useRef } from 'react';
import { GlobalContext } from 'context/globalContext';
import Wrapper from 'components/molecules/Wrapper/Wrapper';
import GamePad from 'components/organisms/GamePad/GamePad';
import Header from 'components/organisms/Header/Header';
import Footer from 'components/organisms/Footer/Footer';
import DeviceSelector from 'components/organisms/Wrappers/DeviceSelector';
import Card from 'components/molecules/Card/Card';

import {
  imgDeck,
  imgWin600,
  imgally,
  imgaokzoepro,
  imgayaneo2,
  imgayaneogeek,
  imglinux,
  imgwindows,
  imgmac,
  imgchimeraOS,
  imgayaneokun,
  imglegiongo,
} from 'components/utils/images/images';

function DeviceSelectorPage() {
  const { state, setState } = useContext(GlobalContext);
  const { device, system, mode } = state;
  const [statePage, setStatePage] = useState({
    disabledNext: true,
    disabledBack: false,
    data: '',
    dom: undefined,
  });
  const { disabledNext, disabledBack, data, dom } = statePage;

  // Setting the device
  const deviceSet = (deviceName) => {
    setStatePage({ ...statePage, disabledNext: false });

    const amd6800U = {
      dolphin: '1080P',
      duckstation: '1080P',
      pcsx2: '1080P',
      yuzu: '720P',
      ppsspp: '1080P',
      rpcs3: '720P',
      ryujinx: '720P',
      xemu: '720P',
      cemu: '720P',
      xenia: '720P',
      citra: '1080P',
      vita3k: '1080P',
      flycast: '1080P',
      melonds: '1080P',
    };

    const deck = {
      dolphin: '720P',
      duckstation: '720P',
      pcsx2: '720P',
      yuzu: '720P',
      ppsspp: '720P',
      rpcs3: '720P',
      ryujinx: '720P',
      xemu: '720P',
      cemu: '720P',
      xenia: '720P',
      citra: '720P',
      vita3k: '720P',
      flycast: '720P',
      melonds: '720P',
    };

    const r1080p = {
      dolphin: '1080P',
      duckstation: '1080P',
      pcsx2: '1080P',
      yuzu: '1080P',
      ppsspp: '1080P',
      rpcs3: '1080P',
      ryujinx: '1080P',
      xemu: '1080P',
      cemu: '1080P',
      xenia: '1080P',
      citra: '1080P',
      vita3k: '1080P',
      flycast: '1080P',
      melonds: '1080P',
    };

    let resolutionsObj = {};
    switch (deviceName) {
      case 'Steam Deck':
        resolutionsObj = deck;
        break;
      case 'Mac':
        resolutionsObj = deck;
        break;
      case 'Anbernic Win600':
        resolutionsObj = deck;
        break;
      case 'Asus Rog Ally':
        resolutionsObj = amd6800U;
        break;
      case 'AOKZOE PRO1':
        resolutionsObj = amd6800U;
        break;
      case 'AYA Neo Geek':
        resolutionsObj = amd6800U;
        break;
      case 'AYA Neo 2':
        resolutionsObj = amd6800U;
        break;
      case 'AYA Neo Kun':
        resolutionsObj = amd6800U;
        break;
      case 'Lenovo Legion Go':
        resolutionsObj = amd6800U;
        break;
      case 'Windows PC':
        resolutionsObj = r1080p;
        break;
      case 'Linux PC':
        resolutionsObj = r1080p;
        break;
      default:
        resolutionsObj = deck;
    }

    setState({
      ...state,
      device: deviceName,
      resolutions: resolutionsObj,
    });
  };

  // Enabling button when changing the global state only if we have a device selected
  useEffect(() => {
    if (device !== '') {
      setStatePage({ ...statePage, disabledNext: false });
    }
    const json = JSON.stringify(state);
    localStorage.setItem('settings_emudeck', json);
  }, [state]);

  useEffect(() => {
    if (system === 'darwin') {
      deviceSet('Mac');
    }
  }, []);

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
        <Header title={`Select your device `} />
        <DeviceSelector data={data} onClick={deviceSet}>
          {system === 'darwin' && (
            <Card
              css={device === 'Mac' && 'is-selected'}
              onClick={() => deviceSet('Mac')}
            >
              <img src={imgmac} width="100" alt="Background" />
              <span className="h6">Mac</span>
            </Card>
          )}
          {system !== 'win32' && system !== 'darwin' && (
            <>
              <Card
                css={device === 'Steam Deck' && 'is-selected'}
                onClick={() => deviceSet('Steam Deck')}
              >
                <img src={imgDeck} width="100" alt="Background" />
                <span className="h6">Steam Deck</span>
              </Card>
              <Card
                css={device === 'Anbernic Win600' && 'is-selected'}
                onClick={() => deviceSet('Anbernic Win600')}
              >
                <img src={imgWin600} width="100" alt="Background" />
                <span className="h6">Anbernic WIN600</span>
              </Card>
              {system !== 'win32' &&
                system !== 'darwin' &&
                system !== 'SteamOS' && (
                  <>
                    <Card
                      css={device === 'Linux PC' && 'is-selected'}
                      onClick={() => deviceSet('Linux PC')}
                    >
                      <img src={imglinux} width="100" alt="Background" />
                      <span className="h6">Linux PC</span>
                    </Card>

                    <Card
                      css={device === 'ChimeraOS' && 'is-selected'}
                      onClick={() => deviceSet('ChimeraOS')}
                    >
                      <img src={imgchimeraOS} width="100" alt="Background" />
                      <span className="h6">ChimeraOS</span>
                    </Card>
                  </>
                )}
            </>
          )}
          {system === 'win32' && (
            <>
              <Card
                css={device === 'Steam Deck' && 'is-selected'}
                onClick={() => deviceSet('Steam Deck')}
              >
                <img src={imgDeck} width="100" alt="Background" />
                <span className="h6">Steam Deck</span>
              </Card>
              <Card
                css={device === 'Anbernic Win600' && 'is-selected'}
                onClick={() => deviceSet('Anbernic Win600')}
              >
                <img src={imgWin600} width="100" alt="Background" />
                <span className="h6">Anbernic WIN600</span>
              </Card>
              <Card
                css={device === 'Asus Rog Ally' && 'is-selected'}
                onClick={() => deviceSet('Asus Rog Ally')}
              >
                <img src={imgally} width="100" alt="Background" />
                <span className="h6">Asus Rog Ally</span>
              </Card>
              <Card
                css={device === 'AOKZOE PRO1' && 'is-selected'}
                onClick={() => deviceSet('AOKZOE PRO1')}
              >
                <img src={imgaokzoepro} width="100" alt="Background" />
                <span className="h6">AOKZOE PRO1</span>
              </Card>
              <Card
                css={device === 'AYA Neo Geek' && 'is-selected'}
                onClick={() => deviceSet('AYA Neo Geek')}
              >
                <img src={imgayaneogeek} width="100" alt="Background" />
                <span className="h6">AYA Neo Geek</span>
              </Card>
              <Card
                css={device === 'AYA Neo 2' && 'is-selected'}
                onClick={() => deviceSet('AYA Neo 2')}
              >
                <img src={imgayaneo2} width="100" alt="Background" />
                <span className="h6">AYA Neo 2</span>
              </Card>
              <Card
                css={device === 'AYA Neo Kun' && 'is-selected'}
                onClick={() => deviceSet('AYA Neo Kun')}
              >
                <img src={imgayaneokun} width="100" alt="Background" />
                <span className="h6">AYA Neo Kun</span>
              </Card>
              <Card
                css={device === 'Lenovo Legion Go' && 'is-selected'}
                onClick={() => deviceSet('Lenovo Legion Go')}
              >
                <img src={imglegiongo} width="100" alt="Background" />
                <span className="h6">Lenovo Legion Go</span>
              </Card>
              <Card
                css={device === 'Windows PC' && 'is-selected'}
                onClick={() => deviceSet('Windows PC')}
              >
                <img src={imgwindows} width="100" alt="Background" />
                <span className="h6">Windows PC</span>
              </Card>
              <Card
                css={device === 'Windows Handlheld' && 'is-selected'}
                onClick={() => deviceSet('Windows Handlheld')}
              >
                <img src={imgwindows} width="100" alt="Background" />
                <span className="h6">Windows Handlheld</span>
              </Card>
            </>
          )}
        </DeviceSelector>
        <Footer
          next={mode === 'easy' ? 'end' : 'emulator-selector'}
          nextText={mode === 'easy' ? 'Finish' : 'Next'}
          disabledNext={disabledNext}
          disabledBack={disabledBack}
        />
      </Wrapper>
    </div>
  );
}

export default DeviceSelectorPage;
