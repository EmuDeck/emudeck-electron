import { useTranslation } from 'react-i18next';
import React, { useEffect, useState, useContext, useRef } from 'react';
import { GlobalContext } from 'context/globalContext';
import { useNavigate, useParams } from 'react-router-dom';
import Wrapper from 'components/molecules/Wrapper/Wrapper';
import Header from 'components/organisms/Header/Header';
import ProgressBar from 'components/atoms/ProgressBar/ProgressBar';
import Main from 'components/organisms/Main/Main';
import CardSettings from 'components/molecules/CardSettings/CardSettings';
import {
  imgra,
  imgares,
  imgdolphin,
  imgprimehack,
  imgppsspp,
  imgduckstation,
  imgcitra,
  imgpcsx2,
  imgrpcs3,
  imgyuzu,
  imgryujinx,
  imgcemu,
  imgxemu,
  imgmame,
  imgvita3k,
  imgflycast,
  imgFrontPegasus,
  imgxenia,
  imgsrm,
  imgrmg,
  imgscummvm,
  imgsupermodel,
  imgFrontESDE,
  imgmelonds,
  imgmgba,
  xemuGrid,
  cemuGrid,
  citraGrid,
  dolphinGrid,
  duckstationGrid,
  mameGrid,
  rmgGrid,
  supermodelGrid,
  model2Grid,
  bigpemuGrid,
  flycastGrid,
  melondsGrid,
  mgbaGrid,
  pcsx2Grid,
  ppssppGrid,
  primehackGrid,
  raGrid,
  rpcs3Grid,
  ryujinxGrid,
  scummvmGrid,
  vita3kGrid,
  xeniaGrid,
  yuzuGrid,
  esdeGrid,
  srmGrid,
  pegasusGrid,
} from 'components/utils/images/images';

function AndroidSetupPage() {
const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { state, setState } = useContext(GlobalContext);
  const [statePage, setStatePage] = useState({});

  const { disabledNext, data, step } = statePage;
  const { android } = state;
  const { second, storage } = android;
  const ipcChannel = window.electron.ipcRenderer;
  const { emulator } = useParams();

  useEffect(() => {
    ipcChannel.sendMessage('emudeck', [
      `Android_${emulator}_setup|||Android_${emulator}_setup`,
    ]);

    ipcChannel.once(`Android_${emulator}_setup`, (message) => {
      let url;
      switch (emulator) {
        case 'Yuzu':
          url = '/android-setup/PPSSPP';
          break;
        case 'PPSSPP':
          url = '/android-setup/NetherSX2';
          break;
        case 'NetherSX2':
          url = '/android-setup/RetroArch';
          break;
        case 'RetroArch':
          url = '/android-finish';
          break;
        default:
          url = 'PPSSPP';
      }
      navigate(url);
    });
  }, [emulator]);

  return (
    <Wrapper aside>
      <Main>
        <Header title={emulator} />

        {emulator === 'Yuzu' && (
          <div className="container--grid">
            <div data-col-sm="2">
              <img src={imgyuzu} alt="Yuzu" />
            </div>
            <div data-col-sm="10">
              <p className="lead">
                Go to your device, and click on Get Started and finish setup on
                your device. Your Keys should be in {storage}
                /Emulation/bios/yuzu/keys.
              </p>
              <p className="lead">
                <strong>Press Continue when you've done it</strong>
              </p>
            </div>
          </div>
        )}
        {emulator === 'PPSSPP' && (
          <div className="container--grid">
            <div data-col-sm="2">
              <img src={imgppsspp} alt="PPSSPP" />
            </div>
            <div data-col-sm="10">
              <p className="lead">
                Go to your device and create the PSP folder in {storage}
                /Emulation/saves/. Press Continue when you've done it.
              </p>
              <p className="lead">
                <strong>Press Continue when you've done it</strong>
              </p>
            </div>
          </div>
        )}
        {emulator === 'NetherSX2' && (
          <div className="container--grid">
            <div data-col-sm="2">
              <img src={imgpcsx2} alt="NetherSX2" />
            </div>
            <div data-col-sm="10">
              <p className="lead">
                Go to your device and setup your bios. Your bios should be in{' '}
                {storage}
                /Emulation/bios/yuzu/keys.
              </p>
              <p className="lead">
                <strong>Press Continue when you've done it</strong>
              </p>
            </div>
          </div>
        )}
        {emulator === 'RetroArch' && (
          <div className="container--grid">
            <div data-col-sm="2">
              <img src={imgra} alt="RetroArch" />
            </div>
            <div data-col-sm="10">
              <p className="lead">
                Go to your device, go to Load Core, Download Core and install
                all the cores you need.
              </p>

              <p className="lead">
                Each core is used for a different systems, these are the ones
                needed for the most common systems:{' '}
                <strong>
                  mgba (GameBoy Advance), genesis_plus_gx(Genesis,
                  MasterSystem), snex9x(Super Nintendo), melonds (Nintendo DS),
                  mame2003_plus (MAME), mesen (NES), gambatte (GameBoy),
                  mupen64plus_next(Nintendo 64), swanstation (Playstation 1)
                </strong>
              </p>
              <p className="lead" />
              <p className="lead">
                Then go to Settings, Directory. Set your System/Bios to
                {storage}/Emulation/bios. Set Save Files to
                {storage}/Emulation/saves/RetroArch/saves and Save States to{' '}
                {storage}/Emulation/saves/RetroArch/states
              </p>
              <p className="lead">
                <strong>Press Continue when you've done it</strong>
              </p>
            </div>
          </div>
        )}
      </Main>
    </Wrapper>
  );
}

export default AndroidSetupPage;
