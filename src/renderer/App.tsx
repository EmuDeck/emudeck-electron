import React, { useState } from 'react';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { app, BrowserWindow, shell, ipcMain } from 'electron';
import icon from '../../assets/icon.svg';
import './App.css';
import { GlobalContext } from './context/globalContext';
import WelcomePage from "./pages/WelcomePage";
import DeviceSelectorPage from "./pages/DeviceSelectorPage";
import EmulatorSelectorPage from "./pages/EmulatorSelectorPage";
import EmulatorConfigurationPage from "./pages/EmulatorConfigurationPage";
import RomStoragePage from "./pages/RomStoragePage";
import RomStructurePage from "./pages/RomStructurePage";
import AspectRatio2DPage from "./pages/AspectRatio2DPage";
import AspectRatio3DPage from "./pages/AspectRatio3DPage";
import AspectRatioSNESPage from "./pages/AspectRatioSNESPage";
import RABezelsPage from "./pages/RABezelsPage";
import PegasusThemePage from "./pages/PegasusThemePage";
import EndPage from "./pages/EndPage";
import './components/atoms/Typography/typography.scss';

export default function App() {
  const [state, setState] = useState({
    debug: 'initial',
    device: '',
    storage: '',
    SDID: '',
    bezels: '',
    snes: '',
    installEmus: {
      ra: true,
      dolphinmmjr: true,
      drastic: true,
      redream: true,
      yaba: true,
      ppsspp: true,
      duckstation: true,
      citra: true,
      aether: true,
      mupen: true,
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
          <Route exact path="/device-selector" element={<DeviceSelectorPage />} />
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
          <Route exact path="/aspect-ratio-2d" element={<AspectRatio2DPage />} />
          <Route exact path="/aspect-ratio-snes" element={<AspectRatioSNESPage />} />
          <Route exact path="/aspect-ratio-3d" element={<AspectRatio3DPage />} />
          <Route exact path="/pegasus-theme" element={<PegasusThemePage />} />
          <Route exact path="/end" element={<EndPage />} />
        </Routes>
      </Router>
    </GlobalContext.Provider>
  );
}
