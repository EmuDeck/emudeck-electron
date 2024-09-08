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
                {t('AndroidSetupPage.configs.yuzu', { storage: storage })}
              </p>
              <p className="lead">
                <strong>{t('general.pressContinue')}</strong>
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
                {t('AndroidSetupPage.configs.ppsspp', {
                  storage: storage,
                })}
              </p>
              <p className="lead">
                <strong>{t('general.pressContinue')}</strong>
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
                {t('AndroidSetupPage.configs.nethersx2', {
                  storage: storage,
                })}
              </p>
              <p className="lead">
                <strong>{t('general.pressContinue')}</strong>
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
              <p className="lead">{t('AndroidSetupPage.configs.ra1')}</p>

              <p className="lead">
                {t('AndroidSetupPage.configs.ra2')}
                <strong>{t('AndroidSetupPage.configs.ra3')}</strong>
              </p>
              <p className="lead" />
              <p className="lead">
                {t('AndroidSetupPage.configs.ra4', {
                  storage: storage,
                })}
              </p>
              <p className="lead">
                <strong>{t('general.pressContinue')}</strong>
              </p>
            </div>
          </div>
        )}
      </Main>
    </Wrapper>
  );
}

export default AndroidSetupPage;
