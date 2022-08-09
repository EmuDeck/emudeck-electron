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
import ShadersHandheldsPage from 'pages/ShadersHandheldsPage';
import Shaders2DPage from 'pages/Shaders2DPage';
import RAAchievementsPage from 'pages/RAAchievementsPage';
import RABezelsPage from 'pages/RABezelsPage';
import PegasusThemePage from 'pages/PegasusThemePage';
import PowerToolsPage from 'pages/PowerToolsPage';
import CHDToolPage from 'pages/CHDToolPage';
import GyroDSUPage from 'pages/GyroDSUPage';
import ToolsAndStuffPage from 'pages/ToolsAndStuffPage';
import UpdateEmusPage from 'pages/UpdateEmusPage';
import CloudSyncPage from 'pages/CloudSyncPage';
import ChangeLogPage from 'pages/ChangeLogPage';

import UninstallPage from 'pages/UninstallPage';


import EndPage from 'pages/EndPage';

import 'getbasecore/src/utils/reset/core_reset.scss';
import 'getbasecore/src/utils/grid-layout/core_grid-layout.scss';
import 'getbasecore/src/components/atoms/Typography/core_typography.scss';

export default function App() {
  const [state, setState] = useState({
    version:'',
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
    cloudSync:false,
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
            path="/RA-achievements"
            element={<RAAchievementsPage />}
          />

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
          <Route
            exact
            path="/shaders-handhelds"
            element={<ShadersHandheldsPage />}
          />
          <Route exact path="/shaders-classic" element={<Shaders2DPage />} />
          <Route exact path="/gyrodsu" element={<GyroDSUPage />} />
          <Route exact path="/power-tools" element={<PowerToolsPage />} />
          <Route exact path="/chd-tool" element={<CHDToolPage />} />
          <Route exact path="/change-log" element={<ChangeLogPage />} />

          <Route exact path="/tools-and-stuff" element={<ToolsAndStuffPage />} />
          <Route exact path="/uninstall" element={<UninstallPage />} />
          <Route exact path="/update-emulators" element={<UpdateEmusPage />} />
            <Route exact path="/cloud-sync" element={<CloudSyncPage />} />
          <Route exact path="/pegasus-theme" element={<PegasusThemePage />} />
          <Route exact path="/end" element={<EndPage />} />
        </Routes>
      </Router>
    </GlobalContext.Provider>
  );
}
