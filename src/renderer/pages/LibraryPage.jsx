import { useTranslation } from 'react-i18next';
import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlobalContext } from 'context/globalContext';
import AsideLibrary from 'components/molecules/AsideLibrary/AsideLibrary';

import Header from 'components/organisms/Header/Header';

import Library from 'components/organisms/Wrappers/Library';
import { BtnSimple } from 'getbasecore/Atoms';

function LibraryPage() {
  const { t } = useTranslation();
  const { state } = useContext(GlobalContext);
  const { system } = state;
  const navigate = useNavigate();
  const ipcChannel = window.electron.ipcRenderer;
  const [statePage, setStatePage] = useState({
    gameList: undefined,
    platform: {},
    storagePath: '',
  });
  const { gameList, platform, storagePath } = statePage;

  const selectPlatform = (selected) => {
    setStatePage({ ...statePage, platform: selected });
  };

  useEffect(() => {
    ipcChannel.sendMessage('rom-library-config', []);
    ipcChannel.once('rom-library-config', (config) => {
      setStatePage((prev) => ({ ...prev, storagePath: config.storagePath }));
    });
    ipcChannel.sendMessage('rom-library-build', []);
    ipcChannel.once('rom-library-build', () => {
      ipcChannel.sendMessage('rom-library-json', []);
      ipcChannel.once('rom-library-json', (data) => {
        setStatePage((prev) => ({
          ...prev,
          gameList: data,
          platform: (data.systems && data.systems[0]) || {},
        }));
      });
    });
  }, []);

  return (
    <div className={`app ${system}`}>
      <AsideLibrary
        systems={gameList && gameList.systems}
        onClick={selectPlatform}
      />
      <div className="wrapper">
        <Header title={platform.title} />
        <Library games={platform.games} storagePath={storagePath} />
      </div>
    </div>
  );
}

export default LibraryPage;
