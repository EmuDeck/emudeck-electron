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
      <strong>2.0.5</strong>
      <ul className="list-two-cols">
        <li>
          - FIX: Issue with RetroAchievements usernames/passwords containing the
          $ character
        </li>
        <li>- NEW: RA AutoSave</li>
      </ul>
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
