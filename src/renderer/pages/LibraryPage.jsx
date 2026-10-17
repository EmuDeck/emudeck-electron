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
    missingArtwork: [],
    artworkVersion: 0,
    scraping: false,
  });
  const {
    gameList,
    platform,
    storagePath,
    missingArtwork,
    artworkVersion,
    scraping,
  } = statePage;

  const selectPlatform = (selected) => {
    setStatePage({ ...statePage, platform: selected });
  };

  const launchGame = (game) => {
    ipcChannel.sendMessage('rom-library-launch', [
      platform.launcher,
      game.filename,
    ]);
    ipcChannel.once('rom-library-launch', (response) => {
      if (!response.ok) {
        console.error('Library launch error', response.error);
      }
    });
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
        const missingPlatforms = (data.missingArtwork || [])
          .filter((item) => item.games.length)
          .map((item) => item.id);
        setStatePage((prev) => ({
          ...prev,
          gameList: data,
          platform: (data.systems && data.systems[0]) || {},
          missingArtwork: missingPlatforms,
          scraping: system !== 'win32' || data.artworkRunning,
        }));
      });
    });

    const unsubscribe = window.backend.message((line) => {
      let json;
      try {
        json = JSON.parse(line);
      } catch (error) {
        return;
      }
      if (json && json.key === 'retrolibrary.artwork') {
        setStatePage((prev) => ({
          ...prev,
          missingArtwork: json.missing,
          artworkVersion: prev.artworkVersion + 1,
          scraping: !json.finished,
        }));
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className={`app ${system}`}>
      <AsideLibrary
        systems={gameList && gameList.systems}
        missing={missingArtwork}
        scraping={scraping}
        onClick={selectPlatform}
      />
      <div className="wrapper">
        <Header title={platform.title} />
        <Library
          games={platform.games}
          storagePath={storagePath}
          artworkVersion={artworkVersion}
          onLaunch={launchGame}
        />
      </div>
    </div>
  );
}

export default LibraryPage;
