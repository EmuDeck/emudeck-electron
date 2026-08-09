import { useTranslation } from 'react-i18next';
import React, { useEffect, useState, useContext, useRef } from 'react';
import { GlobalContext } from 'context/globalContext';
import Wrapper from 'components/molecules/Wrapper/Wrapper';

import Header from 'components/organisms/Header/Header';
import Footer from 'components/organisms/Footer/Footer';
import DeviceSelector from 'components/organisms/Wrappers/DeviceSelector';
import Card from 'components/molecules/Card/Card';

import {
  imgDeck,
  imgSteamMachine,
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
  const { t, i18n } = useTranslation();
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
      citron: '720P',
      ppsspp: '1080P',
      rpcs3: '720P',
      ryujinx: '720P',
      xemu: '720P',
      cemu: '720P',
      xenia: '720P',
      azahar: '1080P',
      vita3k: '1080P',
      flycast: '1080P',
      melonds: '1080P',
    };

    const deck = {
      dolphin: '720P',
      duckstation: '720P',
      pcsx2: '720P',
      yuzu: '720P',
      citron: '720P',
      ppsspp: '720P',
      rpcs3: '720P',
      ryujinx: '720P',
      xemu: '720P',
      cemu: '720P',
      xenia: '720P',
      azahar: '720P',
      vita3k: '720P',
      flycast: '720P',
      melonds: '720P',
    };

    const steamMachine = {
      dolphin: '4K',
      duckstation: '4K',
      pcsx2: '4K',
      yuzu: '1080P',
      citron: '1080P',
      ppsspp: '4K',
      rpcs3: '1080P',
      ryujinx: '1080P',
      xemu: '1080P',
      cemu: '1080P',
      xenia: '1080P',
      azahar: '4K',
      vita3k: '4K',
      flycast: '4K',
      melonds: '4K',
    };

    const r1080p = {
      dolphin: '1080P',
      duckstation: '1080P',
      pcsx2: '1080P',
      yuzu: '1080P',
      citron: '1080P',
      ppsspp: '1080P',
      rpcs3: '1080P',
      ryujinx: '1080P',
      xemu: '1080P',
      cemu: '1080P',
      xenia: '1080P',
      azahar: '1080P',
      vita3k: '1080P',
      flycast: '1080P',
      melonds: '1080P',
    };

    let resolutionsObj = {};
    switch (deviceName) {
      case 'Steam Deck':
        resolutionsObj = deck;
        break;
      case 'Steam Machine':
        resolutionsObj = steamMachine;
        break;
      case 'Playnix Console':
        resolutionsObj = r1080p;
        break;
      case 'Mac':
        resolutionsObj = r1080p;
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

  return (
    <Wrapper>
      <Header title={t('DeviceSelectorPage.title')} />
      <p className="lead">{t('DeviceSelectorPage.description')}</p>
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
        {system !== 'darwin' && system !== 'win32' && (
          <>
            <Card
              css={device === 'Steam Deck' && 'is-selected'}
              onClick={() => deviceSet('Steam Deck')}
            >
              <img src={imgDeck} width="100" alt="Background" />
              <span className="h6">Steam Deck</span>
            </Card>
            <Card
              css={device === 'Steam Machine' && 'is-selected'}
              onClick={() => deviceSet('Steam Machine')}
            >
              <img src={imgSteamMachine} width="100" alt="Background" />
              <span className="h6">Steam Machine</span>
            </Card>
            <Card
              css={device === 'Steam OS Handheld' && 'is-selected'}
              onClick={() => deviceSet('Steam OS Handheld')}
            >
              <img src={imgayaneokun} width="100" alt="Background" />
              <span className="h6">SteamOS Handheld</span>
            </Card>
            <Card
              css={device === 'Linux PC' && 'is-selected'}
              onClick={() => deviceSet('Linux PC')}
            >
              <img src={imglinux} width="100" alt="Background" />
              <span className="h6">Linux PC</span>
            </Card>
          </>
        )}

        {system === 'win32' && (
          <>
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
        next={
          system === 'win32'
            ? 'frontend-selector'
            : mode === 'easy'
              ? 'frontend-selector'
              : 'automap'
        }
        nextText={t('general.next')}
        disabledNext={disabledNext}
        disabledBack={disabledBack}
      />
    </Wrapper>
  );
}

export default DeviceSelectorPage;
