import React, { useState, useEffect } from 'react';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { app, BrowserWindow, shell, ipcMain } from 'electron';

import CheckUpdatePage from 'pages/CheckUpdatePage';
import WelcomePage from 'pages/WelcomePage';
import DeviceSelectorPage from 'pages/DeviceSelectorPage';
import EmulatorSelectorPage from 'pages/EmulatorSelectorPage';
import FrontendSelectorPage from 'pages/FrontendSelectorPage';
import AndroidFrontendSelectorPage from 'pages/AndroidFrontendSelectorPage';
import ParserSelectorPage from 'pages/ParserSelectorPage';
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
import PegasusThemeChoicePage from 'pages/PegasusThemeChoicePage';
import PatroenLoginPage from 'pages/PatroenLoginPage';
import ESDEThemePage from 'pages/ESDEThemePage';
import PowerToolsPage from 'pages/PowerToolsPage';
import PowerControlsPage from 'pages/PowerControlsPage';
import EmuDeckyPage from 'pages/EmuDeckyPage';
import DeckyRomLauncherPage from 'pages/DeckyRomLauncherPage';
import DeckyRomLauncherInstallPage from 'pages/DeckyRomLauncherInstallPage';
import CheckBiosPage from 'pages/CheckBiosPage';

import CHDToolPage from 'pages/CHDToolPage';
import GyroDSUPage from 'pages/GyroDSUPage';
import HelpPage from 'pages/HelpPage';
import EarlyAccessPage from 'pages/EarlyAccessPage';

import UpdateEmusPage from 'pages/UpdateEmusPage';

import CloudSyncPage from 'pages/CloudSyncPage';
import CloudSyncConfigPage from 'pages/CloudSyncConfigPage';
import GameModePage from 'pages/GameModePage';

import ChangeLogPage from 'pages/ChangeLogPage';
import QuickSettingsPage from 'pages/QuickSettingsPage';
import UninstallPage from 'pages/UninstallPage';

import RemotePlayWhateverPage from 'pages/RemotePlayWhateverPage';
import VideoGuidePage from 'pages/VideoGuidePage';
import MigrationPage from 'pages/MigrationPage';
import CopyGamesPage from 'pages/CopyGamesPage';

import ManageEmulatorsPage from 'pages/ManageEmulatorsPage';
import EmulatorsDetailPage from 'pages/EmulatorsDetailPage';

import AutoSavePage from 'pages/AutoSavePage';
import ControllerLayoutPage from 'pages/ControllerLayoutPage';
import ConfirmationPage from 'pages/ConfirmationPage';
import StoreFrontPage from 'pages/StoreFrontPage';
import EmulatorResolutionPage from 'pages/EmulatorResolutionPage';
import EmulatorConfigResolutionPage from 'pages/EmulatorConfigResolutionPage';

import EndPage from 'pages/EndPage';

import ErrorPage from 'pages/ErrorPage';
import Hotkeys from 'pages/Hotkeys';
import FinishPage from 'pages/FinishPage';

import AndroidRomStoragePage from 'pages/AndroidRomStoragePage';
import AndroidEmulatorSelectorPage from 'pages/AndroidEmulatorSelectorPage';
import AndroidRABezelsPage from 'pages/AndroidRABezelsPage';
import AndroidOwnAPKPage from 'pages/AndroidOwnAPKPage';
import AndroidEndPage from 'pages/AndroidEndPage';
import AndroidWelcomePage from 'pages/AndroidWelcomePage';
import AndroidSetupPage from 'pages/AndroidSetupPage';
import AndroidFinishPage from 'pages/AndroidFinishPage';

import { GlobalContext } from './context/globalContext';

import 'getbasecore/src/utils/reset/core_reset.scss';
import 'getbasecore/src/utils/grid-layout/core_grid-layout.scss';
import 'getbasecore/src/components/atoms/Typography/core_typography.scss';

const branch = require('data/branch.json');

export default function App() {
  const [stateAside, setStateAside] = useState({
    links: false,
  });

  const [stateCurrentConfigs, setStateCurrentConfigs] = useState({
    ra: { id: 'ra', code: 'RetroArch', version: 0 },
    dolphin: { id: 'dolphin', code: 'Dolphin', version: 0 },
    primehack: { id: 'primehack', code: 'Primehack', version: 0 },
    ppsspp: { id: 'ppsspp', code: 'PPSSPP', version: 0 },
    duckstation: { id: 'duckstation', code: 'Duckstation', version: 0 },
    melonds: { id: 'melonds', code: 'melonDS', version: 0 },
    citra: { id: 'citra', code: 'Citra', version: 0 },
    lime3ds: { id: 'lime3ds', code: 'Lime3DS', version: 0 },
    pcsx2: { id: 'pcsx2', code: 'PCSX2QT', version: 0 },
    rpcs3: { id: 'rpcs3', code: 'RPCS3', version: 0 },
    yuzu: { id: 'yuzu', code: 'Yuzu', version: 0 },
    citron: { id: 'citron', code: 'Citron', version: 0 },
    ryujinx: { id: 'ryujinx', code: 'Ryujinx', version: 0 },
    xemu: { id: 'xemu', code: 'Xemu', version: 0 },
    cemu: { id: 'cemu', code: 'Cemu', version: 0 },
    srm: { id: 'srm', code: 'SRM', version: 0 },
    rmg: { id: 'rmg', code: 'RMG', version: 0 },
    esde: { id: 'esde', code: 'ESDE', version: 0 },
    pegasus: { id: 'pegasus', code: 'Pegasus', version: 0 },
    mame: { id: 'mame', code: 'MAME', version: 0 },
    vita3k: { id: 'vita3k', code: 'Vita3k', version: 0 },
    flycast: { id: 'flycast', code: 'Flycast', version: 0 },
    scummvm: { id: 'scummvm', code: 'ScummVM', version: 0 },
    xenia: { id: 'xenia', code: 'Xenia', version: 0 },
    mgba: { id: 'mgba', code: 'mGBA', version: 0 },
    ares: { id: 'ares', code: 'ares', version: 0 },
    shadps4: { id: 'shadps4', code: 'ShadPS4', version: 0 },
  });

  const [state, setState] = useState({
    app: 'electron',
    yuzuEAtoken: null,
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
    systemName: '',
    device: 'Steam Deck',
    storage: null,
    storagePath: null,
    SDID: '',
    bezels: true,
    powerTools: false,
    GyroDSU: false,
    cloudSync: undefined,
    cloudSyncType: 'Sync',
    cloudSyncStatus: false,
    sudoPass: 'Decky!',
    language: 'en',
    android: {
      bezels: true,
      second: false,
      installEmus: {
        ra: {
          id: 'ra',
          status: true,
          name: 'RetroArch',
        },
        dolphin: {
          id: 'dolphin',
          status: true,
          name: 'Dolphin',
        },
        ppsspp: {
          id: 'ppsspp',
          status: true,
          name: 'PPSSPP',
        },
        // citrammj: {
        //   id: 'citrammj',
        //   status: true,
        //   name: 'CitraMMJ',
        // },
        lime3ds: {
          id: 'lime3ds',
          status: true,
          name: 'Lime3DS',
        },
        nethersx2: {
          id: 'nethersx2',
          status: true,
          name: 'NetherSX2',
        },
        yuzu: {
          id: 'yuzu',
          status: false,
          name: 'Yuzu',
        },
        // vita3k: {
        //   id: 'vita3k',
        //   status: false,
        //   name: 'Vita3K',
        // },
        scummvm: {
          id: 'scummvm',
          status: true,
          name: 'ScummVM',
        },
      },
      overwriteConfigEmus: {
        ra: {
          id: 'ra',
          status: true,
          name: 'RetroArch',
        },
        dolphin: {
          id: 'dolphin',
          status: true,
          name: 'Dolphin',
        },
        ppsspp: {
          id: 'ppsspp',
          status: true,
          name: 'PPSSPP',
        },
        // citra: {
        //   id: 'citra',
        //   status: true,
        //   name: 'Citra',
        // },
        lime3ds: {
          id: 'lime3ds',
          status: true,
          name: 'Lime3DS',
        },
        aethersx2: {
          id: 'pcsx2',
          status: true,
          name: 'AetherSX2',
        },
        yuzu: {
          id: 'yuzu',
          status: false,
          name: 'Yuzu',
        },
        citron: {
          id: 'citron',
          status: false,
          name: 'Citron',
        },
        pegasus: {
          id: 'pegasus',
          status: true,
          name: 'Pegasus',
        },
        vita3k: {
          id: 'vita3k',
          status: true,
          name: 'Vita3K',
        },
        scummvm: {
          id: 'scummvm',
          status: true,
          name: 'ScummVM',
        },
      },
      installFrontends: {
        pegasus: {
          id: 'pegasus',
          status: true,
          name: 'Pegasus',
          desc: 'Free but you need to scrape your artwork using Skrapper on your PC',
        },
        esde: {
          id: 'esde',
          status: false,
          name: 'ES-DE',
          desc: 'You need to bring your own ESDE apk as it is a paid app. Get it at http://patreon.com/es_de',
        },
      },
    },
    achievements: {
      user: '',
      pass: '',
      token: '',
      hardcore: false,
    },
    autosave: false,
    ar: {
      sega: 43,
      snes: 43,
      classic3d: 43,
      dolphin: 43,
    },
    shaders: {
      handhelds: false,
      classic: false,
      classic3d: false,
    },
    themeESDE: [
      'https://github.com/anthonycaccese/epic-noir-revisited-es-de.git',
      'epic-noir-revisited-es-de',
    ],
    themePegasus: ['https://github.com/PlayingKarrde/gameOS.git', 'gameOS'],
    homebrewGames: false,
    installEmus: {
      ares: {
        id: 'ares',
        status: false,
        installed: undefined,
        name: 'ares',
        platforms: 'Retro Systems',
      },
      bigpemu: {
        id: 'bigpemu',
        status: false,
        installed: undefined,
        name: 'BigPEmu',
        platforms: 'Jaguar',
      },
      cemu: {
        id: 'cemu',
        status: true,
        installed: undefined,
        name: 'Cemu',
        platforms: 'Nintendo WiiU',
      },
      citra: {
        id: 'citra',
        status: true,
        installed: undefined,
        name: 'Citra',
        platforms: 'Nintendo 3DS',
      },
      citron: {
        id: 'citron',
        status: false,
        installed: undefined,
        name: 'Citron',
        platforms: 'Nintendo Switch',
      },
      dolphin: {
        id: 'dolphin',
        status: true,
        installed: undefined,
        name: 'Dolphin',
        platforms: 'GameCube & Wii',
      },
      duckstation: {
        id: 'duckstation',
        status: true,
        installed: undefined,
        name: 'DuckStation',
        platforms: 'Playstation',
      },
      flycast: {
        id: 'flycast',
        status: false,
        installed: undefined,
        name: 'Flycast',
        platforms: 'Dreamcast',
      },
      lime3ds: {
        id: 'lime3ds',
        status: false,
        installed: undefined,
        name: 'Lime3DS',
        platforms: 'Nintendo 3DS',
      },
      mame: {
        id: 'mame',
        status: false,
        name: 'MAME',
        platforms: 'Arcade',
      },
      melonds: {
        id: 'melonds',
        status: true,
        installed: undefined,
        name: 'melonDS',
        platforms: 'Nintendo DS',
      },
      mgba: {
        id: 'mgba',
        status: false,
        installed: undefined,
        name: 'mGBA',
        platforms: 'GameBoy Advance',
      },
      model2: {
        id: 'model2',
        status: true,
        installed: undefined,
        name: 'Model2',
        platforms: 'Arcade',
      },
      pcsx2: {
        id: 'pcsx2',
        status: true,
        installed: undefined,
        name: 'PCSX2',
        platforms: 'Playstation 2',
      },
      ppsspp: {
        id: 'ppsspp',
        status: true,
        installed: undefined,
        name: 'PPSSPP',
        platforms: 'Sony PSP',
      },
      primehack: {
        id: 'primehack',
        status: true,
        installed: undefined,
        name: 'Primehack',
        platforms: 'Metroid Prime',
      },
      ra: {
        id: 'ra',
        status: true,
        installed: undefined,
        name: 'RetroArch',
        platforms: 'Retro systems',
      },
      rmg: {
        id: 'rmg',
        status: false,
        installed: undefined,
        name: "Rosalie's Mupen Gui",
        platforms: 'Nintendo 64',
      },
      rpcs3: {
        id: 'rpcs3',
        status: true,
        installed: undefined,
        name: 'RPCS3',
        platforms: 'Playstation 3',
      },
      ryujinx: {
        id: 'ryujinx',
        status: true,
        installed: undefined,
        name: 'Ryujinx',
        platforms: 'Nintendo Switch',
      },
      scummvm: {
        id: 'scummvm',
        status: true,
        installed: undefined,
        name: 'ScummVM',
        platforms: 'DOS Games',
      },
      shadps4: {
        id: 'shadps4',
        status: true,
        installed: undefined,
        name: 'ShadPS4',
        platforms: 'Playstation 4',
      },
      supermodel: {
        id: 'supermodel',
        status: true,
        installed: undefined,
        name: 'Supermodel',
        platforms: 'Arcade',
      },
      vita3k: {
        id: 'vita3k',
        status: true,
        installed: undefined,
        name: 'Vita3K',
        platforms: 'PS Vita',
      },
      xemu: {
        id: 'xemu',
        status: true,
        installed: undefined,
        name: 'Xemu',
        platforms: 'Xbox',
      },
      xenia: {
        id: 'xenia',
        status: true,
        installed: false,
        name: 'Xenia',
        platforms: 'Xbox 360',
      },
      yuzu: {
        id: 'yuzu',
        status: false,
        installed: undefined,
        name: 'Yuzu',
        platforms: 'Nintendo Switch',
      },
      srm: {
        id: 'srm',
        status: false,
        installed: undefined,
        name: 'Steam Rom Manager',
      },
    },
    overwriteConfigEmus: {
      ares: { id: 'ares', status: false, name: 'ares' },
      bigpemu: {
        id: 'bigpemu',
        status: false,
        name: 'BigPEmu',
      },
      cemu: { id: 'cemu', status: true, name: 'Cemu' },
      citra: { id: 'citra', status: true, name: 'Citra' },
      dolphin: { id: 'dolphin', status: true, name: 'Dolphin' },
      duckstation: { id: 'duckstation', status: true, name: 'DuckStation' },
      flycast: { id: 'flycast', status: false, name: 'Flycast' },
      lime3ds: { id: 'lime3ds', status: false, name: 'Lime3DS' },
      mame: { id: 'mame', status: false, name: 'MAME' },
      melonds: { id: 'melonds', status: true, name: 'melonDS' },
      mgba: { id: 'mgba', status: false, name: 'mGBA' },
      model2: { id: 'model2', status: true, name: 'Model2' },
      pcsx2: { id: 'pcsx2', status: true, name: 'PCSX2' },
      ppsspp: { id: 'ppsspp', status: true, name: 'PPSSPP' },
      primehack: { id: 'primehack', status: true, name: 'Primehack' },
      ra: { id: 'ra', status: true, name: 'RetroArch' },
      rmg: { id: 'rmg', status: false, name: "Rosalie's Mupen Gui" },
      rpcs3: { id: 'rpcs3', status: true, name: 'RPCS3' },
      ryujinx: { id: 'ryujinx', status: false, name: 'Ryujinx' },
      scummvm: { id: 'scummvm', status: true, name: 'ScummVM' },
      shadps4: {
        id: 'shadps4',
        status: false,
        name: 'ShadPS4',
      },
      supermodel: { id: 'supermodel', status: true, name: 'Supermodel' },
      vita3k: { id: 'vita3k', status: true, name: 'Vita3K' },
      xenia: { id: 'xenia', status: true, name: 'Xenia' },
      xemu: { id: 'xemu', status: true, name: 'Xemu' },
      yuzu: { id: 'yuzu', status: false, name: 'Yuzu' },
      citron: { id: 'citron', status: false, name: 'Citron' },
      esde: { id: 'esde', status: true, name: 'EmulationStation DE' },
      pegasus: { id: 'pegasus', status: true, name: 'Pegasus' },
      srm: { id: 'srm', status: false, name: 'Steam Rom Manager' },
    },
    installFrontends: {
      esde: {
        id: 'esde',
        status: false,
        installed: undefined,
        name: 'EmulationStation-DE',
        desc: 'Add this launcher to your Steam Library. Recommended for big collections',
      },
      pegasus: {
        id: 'pegasus',
        status: false,
        installed: undefined,
        name: 'Pegasus',
        desc: 'Add this launcher to your Steam Library. Recommended for big collections. You need to run EmulationStation parsers to show artwork in Pegasus Themes',
      },
      deckyromlauncher: {
        id: 'deckyromlauncher',
        status: true,
        name: 'Retro Library',
        desc: 'A separate Retro Library that does not interfiere with your Games Library. All games and artwork are detected automatically.',
      },
      steam: {
        id: 'steam',
        status: false,
        installed: undefined,
        name: 'Steam Library',
        desc: 'Integrate your games inside your Steam Library. Recommended for curated collections',
      },
    },
    emulatorAlternative: {
      gba: 'multiemulator',
      mame: 'multiemulator',
      n64: 'multiemulator',
      nds: 'melonds',
      psp: 'ppsspp',
      psx: 'duckstation',
      scummvm: 'scummvm',
      multiemulator: 'ra',
      dreamcast: 'multiemulator',
    },
    controllerLayout: 'baxy',
    revertParsers: false,
    resolutions: {
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
      citra: '720P',
      lime3ds: '720P',
      vita3k: '720P',
      flycast: '720P',
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
        stateAside,
        setStateAside,
      }}
    >
      <Router>
        <Routes>
          <Route exact path="/" element={<PatroenLoginPage />} />
          <Route exact path="/error" element={<ErrorPage />} />
          <Route exact path="/check-updates" element={<CheckUpdatePage />} />

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
            path="/frontend-selector"
            element={<FrontendSelectorPage />}
          />
          <Route
            exact
            path="/parser-selector"
            element={<ParserSelectorPage />}
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
          <Route
            exact
            path="/change-resolution"
            element={<EmulatorConfigResolutionPage />}
          />
          <Route exact path="/patreon-login" element={<PatroenLoginPage />} />

          <Route exact path="/rom-storage" element={<RomStoragePage />} />
          <Route exact path="/RA-bezels" element={<RABezelsPage />} />

          <Route exact path="/auto-save" element={<AutoSavePage />} />
          <Route
            exact
            path="/controller-layout"
            element={<ControllerLayoutPage />}
          />

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
          <Route exact path="/power-controls" element={<PowerControlsPage />} />
          <Route exact path="/decky-controls" element={<EmuDeckyPage />} />
          <Route
            exact
            path="/decky-rom-launcher"
            element={<DeckyRomLauncherPage />}
          />
          <Route
            exact
            path="/decky-rom-launcher-install"
            element={<DeckyRomLauncherInstallPage />}
          />

          <Route exact path="/help" element={<HelpPage />} />
          <Route exact path="/early-access" element={<EarlyAccessPage />} />

          <Route exact path="/chd-tool" element={<CHDToolPage />} />
          <Route exact path="/change-log" element={<ChangeLogPage />} />
          <Route exact path="/settings" element={<QuickSettingsPage />} />
          <Route exact path="/check-bios" element={<CheckBiosPage />} />

          <Route exact path="/emulators" element={<ManageEmulatorsPage />}>
            <Route path=":emulator" element={<ManageEmulatorsPage />} />
          </Route>

          <Route exact path="/android-setup" element={<AndroidSetupPage />}>
            <Route path=":emulator" element={<AndroidSetupPage />} />
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

          <Route exact path="/cloud-sync" element={<CloudSyncPage />}>
            <Route path=":type" element={<CloudSyncPage />} />
          </Route>
          <Route exact path="/game-mode" element={<GameModePage />}>
            <Route path=":type" element={<GameModePage />} />
          </Route>
          <Route
            exact
            path="/cloud-sync-config"
            element={<CloudSyncConfigPage />}
          >
            <Route path=":type" element={<CloudSyncConfigPage />} />
          </Route>

          <Route exact path="/pegasus-theme" element={<PegasusThemePage />} />
          <Route
            exact
            path="/pegasus-theme-choice"
            element={<PegasusThemeChoicePage />}
          />
          <Route exact path="/esde-theme" element={<ESDEThemePage />} />
          <Route exact path="/end" element={<EndPage />} />
          <Route exact path="/hotkeys" element={<Hotkeys />} />
          <Route exact path="/finish" element={<FinishPage />} />

          <Route
            exact
            path="/android-welcome"
            element={<AndroidWelcomePage />}
          />
          <Route
            exact
            path="/android-rom-storage"
            element={<AndroidRomStoragePage />}
          />
          <Route
            exact
            path="/android-frontend-selector"
            element={<AndroidFrontendSelectorPage />}
          />
          <Route
            exact
            path="/android-emulator-selector"
            element={<AndroidEmulatorSelectorPage />}
          />
          <Route
            exact
            path="/android-RA-bezels"
            element={<AndroidRABezelsPage />}
          />
          <Route
            exact
            path="/android-own-apk"
            element={<AndroidOwnAPKPage />}
          />
          <Route exact path="/android-end" element={<AndroidEndPage />} />
          <Route exact path="/android-finish" element={<AndroidFinishPage />} />
        </Routes>
      </Router>
    </GlobalContext.Provider>
  );
}
