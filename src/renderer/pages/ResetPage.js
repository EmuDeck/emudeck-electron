import React, { useEffect, useState, useContext } from 'react';
import { GlobalContext } from 'context/globalContext';
import { useNavigate } from 'react-router-dom';
import Reset from 'components/organisms/Wrappers/Reset.js';

const ResetPage = () => {
  const { state, setState } = useContext(GlobalContext);

  const [statePage, setStatePage] = useState({
    disabledNext: true,
    disabledBack: false,
    showNotification: false,
  });
  const { disabledNext, disabledBack, showNotification } = statePage;
  const navigate = useNavigate();
  const ipcChannel = window.electron.ipcRenderer;

  const reset = () => {
    setState({
      version: '',
      branch: 'beta',
      command: '',
      debug: false,
      debugText: '',
      second: false,
      mode: '',
      system: '',
      device: 'Steam Deck',
      storage: 'Internal Storage',
      storagePath: '~/',
      SDID: '',
      bezels: true,
      powerTools: false,
      GyroDSU: false,
      cloudSync: false,
      sudoPass: '',
      achievements: {
        user: '',
        pass: '',
      },
      ar: {
        sega: '43',
        snes: '43',
        classic3d: '43',
        dolphin: '43',
      },
      shaders: {
        handhelds: false,
        classic: false,
      },
      theme: 'EPICNOIR',
      installEmus: {
        ra: { id: 'ra', status: true, name: 'RetroArch' },
        dolphin: { id: 'dolphin', status: true, name: 'Dolphin' },
        primehacks: { id: 'primehacks', status: true, name: 'Prime Hacks' },
        ppsspp: { id: 'ppsspp', status: false, name: 'PPSSPP' },
        duckstation: { id: 'duckstation', status: true, name: 'DuckStation' },
        citra: { id: 'citra', status: true, name: 'Citra' },
        pcsx2: { id: 'pcsx2', status: true, name: 'PCSX2' },
        rpcs3: { id: 'rpcs3', status: true, name: 'RPCS3' },
        yuzu: { id: 'yuzu', status: true, name: 'Yuzu' },
        ryujinx: { id: 'ryujinx', status: false, name: 'Ryujinx' },
        xemu: { id: 'xemu', status: true, name: 'Xemu' },
        cemu: { id: 'cemu', status: true, name: 'Cemu' },
        srm: { id: 'srm', status: true, name: 'Steam Rom Manager Parsers' },
        //supermodelista: { id: 'supermodelista', status: true, name: 'Supermodelista' },
      },
      overwriteConfigEmus: {
        ra: { id: 'ra', status: true, name: 'RetroArch' },
        dolphin: { id: 'dolphin', status: true, name: 'Dolphin' },
        primehacks: { id: 'primehacks', status: true, name: 'Prime Hacks' },
        ppsspp: { id: 'ppsspp', status: true, name: 'PPSSPP' },
        duckstation: { id: 'duckstation', status: true, name: 'DuckStation' },
        citra: { id: 'citra', status: true, name: 'Citra' },
        pcsx2: { id: 'pcsx2', status: true, name: 'PCSX2' },
        rpcs3: { id: 'rpcs3', status: true, name: 'RPCS3' },
        yuzu: { id: 'yuzu', status: true, name: 'Yuzu' },
        ryujinx: { id: 'ryujinx', status: true, name: 'Ryujinx' },
        xemu: { id: 'xemu', status: true, name: 'Xemu' },
        cemu: { id: 'cemu', status: true, name: 'Cemu' },
        srm: { id: 'srm', status: true, name: 'Steam Rom Manager Parsers' },
        // supermodelista: { id: 'supermodelista', status: true, name: 'Supermodelista' }
      },
    });

    localStorage.removeItem('settings_emudeck');

    setStatePage({
      ...statePage,
      showNotification: true,
      disabledBack: true,
    });
    setTimeout(() => {
      setStatePage({
        ...statePage,
        showNotification: false,
        disabledBack: false,
      });
      navigate('/welcome');
    }, 1500);
  };

  return (
    <Reset
      disabledNext={disabledNext}
      disabledBack={disabledBack}
      showNotification={showNotification}
      onClick={reset}
    />
  );
};

export default ResetPage;
