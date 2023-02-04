import React, { useEffect, useState, useContext } from 'react';
import { GlobalContext } from 'context/globalContext';

import DeviceSelector from 'components/organisms/Wrappers/DeviceSelector';

import img552 from 'assets/rg552.png';
import imgOdin from 'assets/odin.png';
import imgRP2 from 'assets/rp2.png';
import imgAndroid from 'assets/android.png';
import imgDeck from 'assets/deck.png';
import Card from 'components/molecules/Card/Card';

// import img552 from 'assets/rg552.png';
// import imgOdin from 'assets/odin.png';
// import imgRP2 from 'assets/rp2.png';
// import imgAndroid from 'assets/android.png';
import imgDeck from 'assets/deck.png';
import imgWin600 from 'assets/win600.png';
import imgWin from 'assets/winlogo.png';

const DeviceSelectorPage = () => {
  const { state, setState } = useContext(GlobalContext);
  const { device, installEmus, system } = state;
  const [statePage, setStatePage] = useState({
    disabledNext: true,
    disabledBack: false,
    data: '',
  });
  const { disabledNext, disabledBack, data } = statePage;

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
    if (device != '') {
      setStatePage({ ...statePage, disabledNext: false });
    }
  }, [state]); // <-- here put the parameter to listen

  return (
    <DeviceSelector
      data={data}
      onClick={deviceSet}
      disabledNext={disabledNext}
      disabledBack={disabledBack}
      next="emulator-selector"
    >
      <Card
        css={device == 'Steam Deck' && 'is-selected'}
        onClick={() => deviceSet('Steam Deck')}
      >
        <img src={imgDeck} width="100" alt="Background" />
        <span className="h6">Steam Deck</span>
      </Card>
      <Card
        css={device == 'Anbernic Win600' && 'is-selected'}
        onClick={() => deviceSet('Anbernic Win600')}
      >
        <img src={imgWin600} width="100" alt="Background" />
        <span className="h6">Anbernic WIN600</span>
      </Card>

      {system === 'win32' && (
        <Card
          css={device == 'Windows' && 'is-selected'}
          onClick={() => deviceSet('Windows')}
        >
          <img src={imgWin} width="100" alt="Background" />
          <span className="h6">Windows Machine</span>
        </Card>
      )}

      {/*



    <Card
      css={device == 'RG552' && 'is-selected'}
      onClick={() => onClick('RG552')}
    >
      <img src={img552} width="100" alt="Background" />
      <span className="h6">Anbernic RG552</span>
    </Card>

    <Card
      css={device == 'Odin Base/Pro' && 'is-selected'}
      onClick={() => onClick('Odin Base/Pro')}
    >
      <img src={imgOdin} width="100" alt="Background" />
      <span className="h6">AYN Odin Base/Pro</span>
    </Card>

    <Card
      css={device == 'Odin Lite' && 'is-selected'}
      onClick={() => onClick('Odin Lite')}
    >
      <img src={imgOdin} width="100" alt="Background" />
      <span className="h6">AYN Odin Lite</span>
    </Card>
    <Card
      css={device == 'RP2+' && 'is-selected'}
      onClick={() => onClick('RP2+')}
    >
      <img src={imgRP2} width="100" alt="Background" />
      <span className="h6">Retroid Pocket 2+</span>
    </Card>

    <Card
      css={device == 'Android' && 'is-selected'}
      onClick={() => onClick('Android')}
    >
      <img src={imgAndroid} width="100" alt="Background" />
      <span className="h6">Android Phone</span>
    </Card>
    */}
    </DeviceSelector>
  );
};

export default DeviceSelectorPage;
