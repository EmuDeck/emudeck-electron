import React, { useEffect, useState, useContext } from 'react';
import { GlobalContext } from 'context/globalContext';
import Wrapper from 'components/molecules/Wrapper/Wrapper';
import Header from 'components/organisms/Header/Header';
import Footer from 'components/organisms/Footer/Footer';

import DeviceSelector from 'components/organisms/Wrappers/DeviceSelector';

import img552 from 'assets/rg552.png';
import imgOdin from 'assets/odin.png';
import imgRP2 from 'assets/rp2.png';
import imgAndroid from 'assets/android.png';
import Card from 'components/molecules/Card/Card';

// import img552 from 'assets/rg552.png';
// import imgOdin from 'assets/odin.png';
// import imgRP2 from 'assets/rp2.png';
// import imgAndroid from 'assets/android.png';

import imgDeck from 'assets/devices/deck.png';
import imgPS4 from 'assets/devices/PS4.png';
import imgPS5 from 'assets/devices/PS5.png';
import imgSteam from 'assets/devices/steam.png';
import imgWin600 from 'assets/devices/win600.png';
import imgX360 from 'assets/devices/x360.png';
import imgXOne from 'assets/devices/xone.png';

function DeviceSelectorPage() {
  const { state, setState } = useContext(GlobalContext);
  const { device, installEmus, system, mode } = state;
  const [statePage, setStatePage] = useState({
    disabledNext: true,
    disabledBack: false,
    data: '',
  });
  const { disabledNext, disabledBack, data } = statePage;
  const ipcChannel = window.electron.ipcRenderer;
  //Setting the device
  const deviceSet = (deviceName) => {
    setStatePage({ ...statePage, disabledNext: false });
    setState({
      ...state,
      device: deviceName,
    });
  };

  //Enabling button when changing the global state only if we have a device selected
  useEffect(() => {
    if (device !== '') {
      setStatePage({ ...statePage, disabledNext: false });
    }
    const json = JSON.stringify(state);
    localStorage.setItem('settings_emudeck', json);
  }, [state]); // <-- here put the parameter to listen

  return (
    <Wrapper>
      <Header
        title={`Select your ${system === 'win32' ? 'controller' : 'device'} `}
      />
      <DeviceSelector data={data} onClick={deviceSet}>
        {system !== 'win32' && (
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
              css={device === 'PS4' && 'is-selected'}
              onClick={() => deviceSet('PS4')}
            >
              <img src={imgPS4} width="100" alt="Background" />
              <span className="h6">PS4 Controller</span>
            </Card>
            <Card
              css={device === 'PS5' && 'is-selected'}
              onClick={() => deviceSet('PS5')}
            >
              <img src={imgPS5} width="100" alt="Background" />
              <span className="h6">PS5 Controller</span>
            </Card>
            <Card
              css={device === 'X360' && 'is-selected'}
              onClick={() => deviceSet('X360')}
            >
              <img src={imgX360} width="100" alt="Background" />
              <span className="h6">Xbox 360 Controller</span>
            </Card>
            <Card
              css={device === 'XONE' && 'is-selected'}
              onClick={() => deviceSet('XONE')}
            >
              <img src={imgXOne} width="100" alt="Background" />
              <span className="h6">Xbox One Controller</span>
            </Card>
          </>
        )}
      </DeviceSelector>
      <Footer
        next={
          system === 'win32'
            ? mode === 'easy'
              ? 'end'
              : 'emulator-resolution'
            : mode === 'easy'
            ? 'end'
            : 'emulator-selector'
        }
        nextText={mode === 'easy' ? 'Finish' : 'Next'}
        disabledNext={disabledNext}
        disabledBack={disabledBack}
      />
    </Wrapper>
  );
}

export default DeviceSelectorPage;
