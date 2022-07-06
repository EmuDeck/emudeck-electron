import React, { useState, useEffect } from 'react';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { app, BrowserWindow, shell, ipcMain } from 'electron';
import { GlobalContext } from './context/globalContext';
import WelcomePage from 'pages/WelcomePage';
import DeviceSelectorPage from 'pages/DeviceSelectorPage';
import EmulatorSelectorPage from 'pages/EmulatorSelectorPage';
import EmulatorConfigurationPage from 'pages/EmulatorConfigurationPage';
import RomStoragePage from 'pages/RomStoragePage';
import RomStructurePage from 'pages/RomStructurePage';
import AspectRatioSegaPage from 'pages/AspectRatioSegaPage';
import AspectRatioSNESPage from 'pages/AspectRatioSNESPage';
import AspectRatio3DPage from 'pages/AspectRatio3DPage';
import AspectRatioDolphinPage from 'pages/AspectRatioDolphinPage';
import RABezelsPage from 'pages/RABezelsPage';
import PegasusThemePage from 'pages/PegasusThemePage';
import EndPage from 'pages/EndPage';

import 'getbasecore/src/utils/reset/core_reset.scss';
import 'getbasecore/src/utils/grid-layout/core_grid-layout.scss';
import 'getbasecore/src/components/atoms/Typography/core_typography.scss';

export default function App() {
  const [state, setState] = useState({
    debug: true,
    second: false,
    mode: '',
    system: '',
    device: '',
    storage: 'SD-Card',
    SDID: '',
    bezels: true,
    ar: {
      sega: '43',
      snes: '43',
      classic3d: '43',
      dolphin: '43',
    },
    theme: 'EPICNOIR',
    installEmus: {
      ra: { id: 'ra', status: true, name: 'RetroArch' },
      dolphin: { id: 'dolphin', status: true, name: 'Dolphin' },
      primehacks: { id: 'primehacks', status: true, name: 'Prime Hacks' },
      ppsspp: { id: 'ppsspp', status: true, name: 'PPSSPP' },
      duckstation: { id: 'duckstation', status: true, name: 'DuckStation' },
      citra: { id: 'citra', status: true, name: 'Citra' },
      pcsx2: { id: 'pcsx2', status: true, name: 'PCSX2' },
      rpcs3: { id: 'rpcs3', status: true, name: 'RPCS3' },
      yuzu: { id: 'yuzu', status: true, name: 'Yuzu' },
      xemu: { id: 'xemu', status: true, name: 'Xemu' },
      cemu: { id: 'cemu', status: true, name: 'Cemu' },
      srm: { id: 'srm', status: true, name: 'Steam Rom Manager' },
    },
    keepConfigEmus: {
      ra: { id: 'ra', status: true, name: 'RetroArch' },
      dolphin: { id: 'dolphin', status: true, name: 'Dolphin' },
      primehacks: { id: 'primehacks', status: true, name: 'Prime Hacks' },
      ppsspp: { id: 'ppsspp', status: true, name: 'PPSSPP' },
      duckstation: { id: 'duckstation', status: true, name: 'DuckStation' },
      citra: { id: 'citra', status: true, name: 'Citra' },
      pcsx2: { id: 'pcsx2', status: true, name: 'PCSX2' },
      rpcs3: { id: 'rpcs3', status: true, name: 'RPCS3' },
      yuzu: { id: 'yuzu', status: true, name: 'Yuzu' },
      xemu: { id: 'xemu', status: true, name: 'Xemu' },
      cemu: { id: 'cemu', status: true, name: 'Cemu' },
      srm: { id: 'srm', status: true, name: 'Steam Rom Manager' },
    },
  });

  //Second install?
  useEffect(() => {
    //const settingsStorage = localStorage.getItem('settings_emudeck');
    //if (!!settingsStorage) {
    //setState(JSON.parse(settingsStorage));
    // }
  }, []);

  return (
    <GlobalContext.Provider
      value={{
        state,
        setState,
      }}
    >
      <Router>
        <Routes>
          <Route exact path="/" element={<WelcomePage />} />
          <Route exact path="/welcome" element={<WelcomePage />} />
          <Route
            exact
            path="/device-selector"
            element={<DeviceSelectorPage />}
          />
          <Route
            exact
            path="/emulator-selector"
            element={<EmulatorSelectorPage />}
          />
          <Route
            exact
            path="/emulator-configuration"
            element={<EmulatorConfigurationPage />}
          />
          <Route exact path="/rom-storage" element={<RomStoragePage />} />
          <Route exact path="/rom-structure" element={<RomStructurePage />} />
          <Route exact path="/RA-bezels" element={<RABezelsPage />} />
          <Route
            exact
            path="/aspect-ratio-sega"
            element={<AspectRatioSegaPage />}
          />
          <Route
            exact
            path="/aspect-ratio-snes"
            element={<AspectRatioSNESPage />}
          />
          <Route
            exact
            path="/aspect-ratio-3d"
            element={<AspectRatio3DPage />}
          />
          <Route
            exact
            path="/aspect-ratio-dolphin"
            element={<AspectRatioDolphinPage />}
          />

          <Route exact path="/pegasus-theme" element={<PegasusThemePage />} />
          <Route exact path="/end" element={<EndPage />} />
        </Routes>
      </Router>
    </GlobalContext.Provider>
  );
}
