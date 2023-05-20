import React, { useState, useEffect } from 'react';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { app, BrowserWindow, shell, ipcMain } from 'electron';

import CheckUpdatePage from 'pages/CheckUpdatePage';
import PatreonLoginPage from 'pages/PatroenLoginPage';
import WelcomePage from 'pages/WelcomePage';
import DeviceSelectorPage from 'pages/DeviceSelectorPage';
import DeviceConfiguratorPage from 'pages/DeviceConfiguratorPage';
import EmulatorSelectorPage from 'pages/EmulatorSelectorPage';
import EmulatorConfigurationPage from 'pages/EmulatorConfigurationPage';
import RomStoragePage from 'pages/RomStoragePage';
import AspectRatioSegaPage from 'pages/AspectRatioSegaPage';
import AspectRatioSNESPage from 'pages/AspectRatioSNESPage';
import AspectRatio3DPage from 'pages/AspectRatio3DPage';
import AspectRatioDolphinPage from 'pages/AspectRatioDolphinPage';
import ShadersHandheldsPage from 'pages/ShadersHandheldsPage';
import Shaders2DPage from 'pages/Shaders2DPage';
import Shaders3DPage from 'pages/Shaders3DPage';
import RAAchievementsPage from 'pages/RAAchievementsPage';
import RAAchievementsConfigPage from 'pages/RAAchievementsConfigPage';
import RABezelsPage from 'pages/RABezelsPage';
import PegasusThemePage from 'pages/PegasusThemePage';
import PowerToolsPage from 'pages/PowerToolsPage';
import DeckyControlsPage from 'pages/DeckyControlsPage';
import CheckBiosPage from 'pages/CheckBiosPage';
import CheckDependenciesPage from 'pages/CheckDependenciesPage';
import CHDToolPage from 'pages/CHDToolPage';
import GyroDSUPage from 'pages/GyroDSUPage';

import UpdateEmusPage from 'pages/UpdateEmusPage';
import UpdateConfigsPage from 'pages/UpdateConfigsPage';
import CloudSyncPage from 'pages/CloudSyncPage';
import CloudSyncConfigPage from 'pages/CloudSyncConfigPage';
import ChangeLogPage from 'pages/ChangeLogPage';
import SettingsPage from 'pages/SettingsPage';
import UninstallPage from 'pages/UninstallPage';

import RemotePlayWhateverPage from 'pages/RemotePlayWhateverPage';
import VideoGuidePage from 'pages/VideoGuidePage';
import MigrationPage from 'pages/MigrationPage';
import CopyGamesPage from 'pages/CopyGamesPage';

import EmuGuidePage from 'pages/EmuGuidePage';
import EmulatorsPage from 'pages/EmulatorsPage';
import EmulatorsDetailPage from 'pages/EmulatorsDetailPage';

import AutoSavePage from 'pages/AutoSavePage';
import HomebrewGamesPage from 'pages/HomebrewGamesPage';
import ConfirmationPage from 'pages/ConfirmationPage';
import StoreFrontPage from 'pages/StoreFrontPage';
import EmulatorResolutionPage from 'pages/EmulatorResolutionPage';

import EndPage from 'pages/EndPage';

import ErrorPage from 'pages/ErrorPage';

import { GlobalContext } from './context/globalContext';

import 'getbasecore/src/utils/reset/core_reset.scss';
import 'getbasecore/src/utils/grid-layout/core_grid-layout.scss';
import 'getbasecore/src/components/atoms/Typography/core_typography.scss';

const branch = require('data/branch.json');

export default function App() {
  const [stateCurrentConfigs, setStateCurrentConfigs] = useState({
    ra: { id: 'ra', code: 'RetroArch', version: 0 },
    dolphin: { id: 'dolphin', code: 'Dolphin', version: 0 },
    primehack: { id: 'primehack', code: 'Primehack', version: 0 },
    ppsspp: { id: 'ppsspp', code: 'PPSSPP', version: 0 },
    duckstation: { id: 'duckstation', code: 'Duckstation', version: 0 },
    melonds: { id: 'melonds', code: 'melonDS', version: 0 },
    citra: { id: 'citra', code: 'Citra', version: 0 },
    pcsx2: { id: 'pcsx2', code: 'PCSX2QT', version: 0 },
    rpcs3: { id: 'rpcs3', code: 'RPCS3', version: 0 },
    yuzu: { id: 'yuzu', code: 'Yuzu', version: 0 },
    ryujinx: { id: 'ryujinx', code: 'Ryujinx', version: 0 },
    xemu: { id: 'xemu', code: 'Xemu', version: 0 },
    cemu: { id: 'cemu', code: 'Cemu', version: 0 },
    srm: { id: 'srm', code: 'SRM', version: 0 },
    rmg: { id: 'rmg', code: 'RMG', version: 0 },
    esde: { id: 'esde', code: 'ESDE', version: 0 },
    mame: { id: 'mame', code: 'MAME', version: 0 },
    vita3k: { id: 'vita3k', code: 'Vita3k', version: 0 },
    scummvm: { id: 'scummvm', code: 'ScummVM', version: 0 },
    xenia: { id: 'xenia', code: 'Xenia', version: 0 },
    mgba: { id: 'mgba', code: 'mGBA', version: 0 },
  });

  const [state, setState] = useState({
    app: 'electron',
    patreonToken: null,
    patreonStatus: false,
    version: '',
    gamemode: false,
    branch: branch.branch,
    command: '',
    debug: false,
    debugText: '',
    second: false,
    mode: null,
    system: '',
    device: 'Steam Deck',
    storage: null,
    storagePath: null,
    SDID: '',
    bezels: true,
    powerTools: false,
    GyroDSU: false,
    cloudSync: '',
    cloudSyncType: 'Sync',
    sudoPass: '',
    language: 'en',
    achievements: {
      user: '',
      pass: '',
      token: '',
      hardcore: false,
    },
    autosave: false,
    ar: {
      sega: '43',
      snes: '43',
      classic3d: '43',
      dolphin: '43',
    },
    shaders: {
      handhelds: false,
      classic: false,
      classic3d: false,
    },
    theme: 'EPICNOIR',
    homebrewGames: false,
    installEmus: {
      ra: { id: 'ra', status: true, installed: undefined, name: 'RetroArch' },
      dolphin: {
        id: 'dolphin',
        status: true,
        installed: undefined,
        name: 'Dolphin',
      },
      primehack: {
        id: 'primehack',
        status: true,
        installed: undefined,
        name: 'Primehack',
      },
      ppsspp: {
        id: 'ppsspp',
        status: true,
        installed: undefined,
        name: 'PPSSPP',
      },
      duckstation: {
        id: 'duckstation',
        status: true,
        installed: undefined,
        name: 'DuckStation',
      },
      melonds: {
        id: 'melonds',
        status: true,
        installed: undefined,
        name: 'melonDS',
      },
      citra: { id: 'citra', status: true, installed: undefined, name: 'Citra' },
      pcsx2: { id: 'pcsx2', status: true, installed: undefined, name: 'PCSX2' },
      rpcs3: { id: 'rpcs3', status: true, installed: undefined, name: 'RPCS3' },
      yuzu: { id: 'yuzu', status: true, installed: undefined, name: 'Yuzu' },
      ryujinx: {
        id: 'ryujinx',
        status: false,
        installed: undefined,
        name: 'Ryujinx',
      },
      xemu: { id: 'xemu', status: true, installed: undefined, name: 'Xemu' },
      cemu: { id: 'cemu', status: true, installed: undefined, name: 'Cemu' },
      srm: {
        id: 'srm',
        status: true,
        installed: undefined,
        name: 'Steam Rom Manager',
      },
      rmg: {
        id: 'rmg',
        status: false,
        installed: undefined,
        name: "Rosalie's Mupen Gui",
      },
      esde: {
        id: 'esde',
        status: true,
        installed: undefined,
        name: 'EmulationStation-DE',
      },
      mame: { id: 'mame', status: false, name: 'MAME' },
      vita3k: {
        id: 'vita3k',
        status: true,
        installed: undefined,
        name: 'Vita3K',
      },
      scummvm: {
        id: 'scummvm',
        status: true,
        installed: undefined,
        name: 'ScummVM',
      },
      xenia: {
        id: 'xenia',
        status: false,
        installed: false,
        name: 'Xenia',
      },
      mgba: { id: 'mgba', status: false, installed: undefined, name: 'mGBA' },
    },
    overwriteConfigEmus: {
      ra: { id: 'ra', status: true, name: 'RetroArch' },
      dolphin: { id: 'dolphin', status: true, name: 'Dolphin' },
      primehack: { id: 'primehack', status: true, name: 'Primehack' },
      ppsspp: { id: 'ppsspp', status: true, name: 'PPSSPP' },
      duckstation: { id: 'duckstation', status: true, name: 'DuckStation' },
      melonds: { id: 'melonds', status: true, name: 'melonDS' },
      citra: { id: 'citra', status: true, name: 'Citra' },
      pcsx2: { id: 'pcsx2', status: true, name: 'PCSX2' },
      rpcs3: { id: 'rpcs3', status: true, name: 'RPCS3' },
      yuzu: { id: 'yuzu', status: true, name: 'Yuzu' },
      ryujinx: { id: 'ryujinx', status: true, name: 'Ryujinx' },
      xemu: { id: 'xemu', status: true, name: 'Xemu' },
      cemu: { id: 'cemu', status: true, name: 'Cemu' },
      srm: { id: 'srm', status: true, name: 'Steam Rom Manager' },
      rmg: { id: 'rmg', status: false, name: "Rosalie's Mupen Gui" },
      esde: { id: 'esde', status: true, name: 'EmulationStation-DE' },
      mame: { id: 'mame', status: true, name: 'MAME' },
      vita3k: { id: 'vita3k', status: true, name: 'Vita3K' },
      scummvm: { id: 'scummvm', status: true, name: 'ScummVM' },
      mgba: { id: 'mgba', status: true, name: 'mGBA' },
    },
    resolutions: {
      dolphin: '720P',
      duckstation: '720P',
      pcsx2: '720P',
      yuzu: '720P',
      ppsspp: '720P',
      rpcs3: '720P',
      ryujinx: '720P',
      xemu: '720P',
      cemu: '720P',
      xenia: '720P',
      citra: '720P',
      vita3k: '720P',
      melonds: '720P',
    },
  });

  return (
    <GlobalContext.Provider
      value={{
        state,
        setState,
        stateCurrentConfigs,
        setStateCurrentConfigs,
      }}
    >
      <Router>
        <Routes>
          <Route exact path="/" element={<CheckDependenciesPage />} />
          <Route exact path="/error" element={<ErrorPage />} />
          <Route exact path="/check-updates" element={<CheckUpdatePage />} />
          <Route exact path="/patreon-login" element={<PatreonLoginPage />} />

          <Route exact path="/welcome" element={<WelcomePage />} />
          <Route
            exact
            path="/device-selector"
            element={<DeviceSelectorPage />}
          />
          <Route
            exact
            path="/device-configurator"
            element={<DeviceConfiguratorPage />}
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
          <Route
            exact
            path="/emulator-resolution"
            element={<EmulatorResolutionPage />}
          />
          <Route exact path="/rom-storage" element={<RomStoragePage />} />
          <Route exact path="/RA-bezels" element={<RABezelsPage />} />

          <Route exact path="/auto-save" element={<AutoSavePage />} />
          <Route exact path="/homebrew-games" element={<HomebrewGamesPage />} />
          <Route exact path="/confirmation" element={<ConfirmationPage />} />
          <Route exact path="/store-front" element={<StoreFrontPage />} />

          <Route
            exact
            path="/RA-achievements"
            element={<RAAchievementsPage />}
          />

          <Route
            exact
            path="/RA-achievements-config"
            element={<RAAchievementsConfigPage />}
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
          <Route exact path="/shaders-3d-classic" element={<Shaders3DPage />} />
          <Route exact path="/gyrodsu" element={<GyroDSUPage />} />
          <Route exact path="/power-tools" element={<PowerToolsPage />} />
          <Route exact path="/decky-controls" element={<DeckyControlsPage />} />

          <Route exact path="/chd-tool" element={<CHDToolPage />} />
          <Route exact path="/change-log" element={<ChangeLogPage />} />
          <Route exact path="/settings" element={<SettingsPage />} />
          <Route exact path="/check-bios" element={<CheckBiosPage />} />
          <Route exact path="/emulator-guide" element={<EmuGuidePage />}>
            <Route path=":emulator" element={<EmuGuidePage />} />
          </Route>

          <Route exact path="/emulators" element={<EmulatorsPage />}>
            <Route path=":emulator" element={<EmulatorsPage />} />
          </Route>

          <Route path="/emulators-detail" element={<EmulatorsDetailPage />}>
            <Route path=":emulator" element={<EmulatorsDetailPage />} />
            <Route path="" element={<EmulatorsDetailPage />} />
          </Route>

          <Route exact path="/uninstall" element={<UninstallPage />} />
          <Route
            exact
            path="/remote-play-whatever"
            element={<RemotePlayWhateverPage />}
          />

          <Route exact path="/video-guide" element={<VideoGuidePage />} />
          <Route exact path="/migration" element={<MigrationPage />} />
          <Route exact path="/copy-games" element={<CopyGamesPage />} />
          <Route exact path="/update-emulators" element={<UpdateEmusPage />} />
          <Route
            exact
            path="/update-configurators"
            element={<UpdateConfigsPage />}
          />

          <Route exact path="/cloud-sync" element={<CloudSyncPage />} />
          <Route
            exact
            path="/cloud-sync-config"
            element={<CloudSyncConfigPage />}
          >
            <Route path=":type" element={<CloudSyncConfigPage />} />
          </Route>

          <Route exact path="/pegasus-theme" element={<PegasusThemePage />} />
          <Route exact path="/end" element={<EndPage />} />
        </Routes>
      </Router>
    </GlobalContext.Provider>
  );
}
