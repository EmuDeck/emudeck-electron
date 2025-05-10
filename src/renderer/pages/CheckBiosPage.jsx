import { useTranslation } from 'react-i18next';
import React, { useEffect, useState, useContext, useRef } from 'react';
import { GlobalContext } from 'context/globalContext';
import Wrapper from 'components/molecules/Wrapper/Wrapper';

import Header from 'components/organisms/Header/Header';
import Footer from 'components/organisms/Footer/Footer';
import { useNavigate } from 'react-router-dom';
import CheckBios from 'components/organisms/Wrappers/CheckBios';

function CheckBiosPage() {
  const { t, i18n } = useTranslation();
  const { state, setState } = useContext(GlobalContext);

  const [statePage, setStatePage] = useState({
    disabledNext: true,
    disabledBack: false,
    showNotification: false,
    dom: undefined,
  });

  // TODO: Use only one state for bioses, doing it this way is quick but madness
  const [ps1Bios, setps1Bios] = useState(null);
  const [ps2Bios, setps2Bios] = useState(null);
  const [switchBios, setSwitchBios] = useState(null);
  const [edenBios, setEdenBios] = useState(null);
  const [citronBios, setCitronBios] = useState(null);
  const [ryujinxBios, setRyujinxBios] = useState(null);
  const [segaCDBios, setSegaCDBios] = useState(null);
  const [saturnBios, setSaturnBios] = useState(null);
  const [dreamcastBios, setDreamcastBios] = useState(null);
  const [DSBios, setDSBios] = useState(null);

  const { disabledNext, disabledBack, showNotification, dom } = statePage;
  const navigate = useNavigate();
  const ipcChannel = window.electron.ipcRenderer;

  const checkBios = (biosCommand) => {
    ipcChannel.sendMessage('emudeck', [`${biosCommand}|||${biosCommand}`]);
    ipcChannel.once(`${biosCommand}`, (status) => {
      status = status.stdout;

      status = status.replace('\n', '');
      let biosStatus;
      /true|OK/.test(status) ? (biosStatus = true) : (biosStatus = false);

      switch (biosCommand) {
        case 'check_psx_bios':
          setps1Bios(biosStatus);
          break;
        case 'check_ps2_bios':
          setps2Bios(biosStatus);
          break;
        case 'check_yuzu_bios':
          setSwitchBios(biosStatus);
          break;
        case 'check_eden_bios':
          setEdenBios(biosStatus);
          break;
        case 'check_ryujinx_bios':
          setRyujinxBios(biosStatus);
          break;
        case 'check_citron_bios':
          setCitronBios(biosStatus);
          break;
        case 'check_segacd_bios':
          setSegaCDBios(biosStatus);
          break;
        case 'check_saturn_bios':
          setSaturnBios(biosStatus);
          break;
        case 'check_dreamcast_bios':
          setDreamcastBios(biosStatus);
          break;
        case 'check_ds_bios':
          setDSBios(biosStatus);
          break;
      }
    });
  };

  const checkBiosAgain = () => {
    checkBios('check_PS1_bios');
    checkBios('check_PS2_bios');
    checkBios('check_Yuzu_bios');
    checkBios('check_Ryujinx_bios');
    checkBios('check_Citron_bios');
    checkBios('check_SegaCD_bios');
    checkBios('check_Saturn_bios');
    checkBios('check_Dreamcast_bios');
    checkBios('check_DS_bios');
  };

  useEffect(() => {
    checkBios('check_PS1_bios');
    checkBios('check_PS2_bios');
    checkBios('check_Yuzu_bios');
    checkBios('check_Ryujinx_bios');
    checkBios('check_Citron_bios');
    checkBios('check_SegaCD_bios');
    checkBios('check_Saturn_bios');
    checkBios('check_Dreamcast_bios');
    checkBios('check_DS_bios');
  }, []);

  return (
    <Wrapper>
      <Header title={t('CheckBiosPage.title')} />
      <p className="lead">{t('CheckBiosPage.description')}</p>
      <CheckBios
        checkBiosAgain={checkBiosAgain}
        ps1Bios={ps1Bios}
        ps2Bios={ps2Bios}
        switchBios={switchBios}
        ryujinxBios={ryujinxBios}
        citronBios={citronBios}
        segaCDBios={segaCDBios}
        saturnBios={saturnBios}
        dreamcastBios={dreamcastBios}
        DSBios={DSBios}
        showNotification={showNotification}
      />
      <Footer
        next={false}
        disabledNext={disabledNext}
        disabledBack={disabledBack}
      />
    </Wrapper>
  );
}

export default CheckBiosPage;
