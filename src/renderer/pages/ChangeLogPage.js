import React, { useEffect, useState, useContext } from 'react';
import { GlobalContext } from 'context/globalContext';

import ChangeLog from 'components/organisms/Wrappers/ChangeLog.js';

const ChangeLogPage = () => {
  const { state, setState } = useContext(GlobalContext);
  const [statePage, setStatePage] = useState({
    disabledNext: false,
    disabledBack: false,
    data: '',
  });
  const { disabledNext, disabledBack, hasSudo } = statePage;

  return (
    <ChangeLog disabledNext={disabledNext} disabledBack={disabledBack}>
      <strong>2.0.1 & 2.0.2</strong>
      <ul className="list-two-cols">
        <li>- FIX: Reset Config for PrimeHack and PCSX2</li>
        <li>- FIX: Distorted images in certain resolutions</li>
        <li>- FIX: Messages on PowerTools and Gyro Pages</li>
        <li>- FIX: Improved SD Card detection</li>
        <li>- FIX: Improved Backend detection</li>
        <li>- FIX: RetroAchievments</li>
        <li>- FIX: Powertools & GyuroDSU Installation</li>
        <li>- FIX: Checking for updates screen freeze</li>
        <li>- NEW: Appimage logs</li>
      </ul>
      <br />
      <strong>2.0</strong>
      <ul className="list-two-cols">
        <li>- NEW: Brand New UI</li>
        <li>- NEW: Tools & Stuff page with a lot of extra goodies</li>
        <li>
          - NEW: Settings page, configure some settings without the need of
          reinstall.
        </li>
        <li>- NEW: Guides, learn more about your Emulators</li>
        <li>- NEW: Default images for SRM to try and speed up downloads</li>
        <li>- NEW: SaveSync. Backup your saved games to the cloud</li>
        <li>- NEW: DooM SRM Parser</li>
        <li>- NEW: BiosChecker</li>
        <li>- NEW: RetroAchievements HardCore mode</li>
        <li>- NEW: SwanStation and Kronos Core</li>
        <li>- FIX: Updated config files for Duckstation</li>
        <li>- FIX: RetroArch Analog Stick for GB & GBC</li>
        <li>- FIX: Uninstaller fixes</li>
        <li>- FIX: Yuzu Config Changes</li>
        <li>- NEW: Vita3K and ScummVM Emulators</li>
        <li>
          - IMPROVEMENT: Cheats folder for RetroArch on Emulation to avoid RA
          save bug
        </li>
        <li>- IMPROVEMENT: PS1 bios automatic renaming to lowercase</li>
        <li>- IMPROVEMENT: No more cluttered icons on desktop mode</li>
        <li>- IMPROVEMENT: New emulator's hotkeys</li>
        <li>- IMPROVEMENT: Performance optimizations for all systems</li>
        <li>- IMPROVEMENT: Better Dolphin Performance on Anbernic Win600</li>
        <li>- IMPROVEMENT: Better Steam Input definitions</li>
      </ul>
      <br />
      <a
        target="_blank"
        href="https://github.com/EmuDeck/emudeck-electron/blob/main/CHANGELOG.md"
      >
        See previous changelogs
      </a>
    </ChangeLog>
  );
};

export default ChangeLogPage;
