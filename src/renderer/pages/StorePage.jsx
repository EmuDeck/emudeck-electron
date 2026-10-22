import React, { useContext, useEffect, useMemo, useState } from 'react';
import { GlobalContext } from 'context/globalContext';
import { useFetchCond } from 'hooks/useFetchCond';
import AsideLibrary from 'components/molecules/AsideLibrary/AsideLibrary';
import EmuModal from 'components/molecules/EmuModal/EmuModal';
import GameDetail from 'components/molecules/GameDetail/GameDetail';

import Header from 'components/organisms/Header/Header';

import Store from 'components/organisms/Wrappers/Store';

function StorePage() {
  const { state } = useContext(GlobalContext);
  const { system } = state;
  const ipcChannel = window.electron.ipcRenderer;
  const [statePage, setStatePage] = useState({
    catalog: [],
    platform: {},
    game: null,
    comments: [],
    status: '',
  });
  const { catalog, platform, game, comments, status } = statePage;

  const storeWS = useFetchCond('https://store.emudeck.com/rest/store.php');
  const freeOrderWS = useFetchCond('https://store.emudeck.com/rest/add-free-order.php');
  const downloadLinkWS = useFetchCond('https://store.emudeck.com/rest/generate-link.php');
  const commentsWS = useFetchCond('https://store.emudeck.com/rest/comments.php');

  useEffect(() => {
    storeWS
      .get()
      .then((data) => {
        const systems = data
          .filter((item) => item.status === 'true')
          .map((item) => ({
            ...item,
            games: item.games.filter((item2) => item2.status === 'true'),
          }));
        setStatePage((prev) => ({
          ...prev,
          catalog: systems,
          platform: systems[0] || {},
        }));
      })
      .catch((error) => console.error('Store error', error));
  }, []);

  const selectPlatform = (selected) => {
    setStatePage({ ...statePage, platform: selected });
  };

  const setStatus = (code) => {
    setStatePage((prev) => ({ ...prev, status: code }));
  };

  const installGame = (selected) => {
    setStatus('installing');
    freeOrderWS
      .post({ game_id: selected.id })
      .then(() => downloadLinkWS.post({ game_id: selected.id, type: 'file' }))
      .then((data) => {
        if (data.status !== 'success' || !data.url) {
          setStatus('error');
          return;
        }
        const artwork = selected.artwork || {};
        ipcChannel.sendMessage('installGame', [
          data.url,
          selected.platform,
          selected.name,
          (artwork.titlescreen || [])[0],
          (artwork.screenshot || [])[0],
        ]);
        ipcChannel.once('installGame', (response) => {
          setStatus(response.ok ? 'installed' : 'error');
        });
      })
      .catch(() => setStatus('error'));
  };

  const selectGame = (selected) => {
    setStatePage({ ...statePage, game: selected, comments: [], status: '' });
    commentsWS
      .post({ action: 'get', game_id: selected.id })
      .then((data) => {
        if (data.status === 'success') {
          setStatePage((prev) => ({ ...prev, comments: data.comments }));
        }
      })
      .catch((error) => console.error('Store comments error', error));
  };

  const closeGame = () => {
    setStatePage((prev) => ({ ...prev, game: null }));
  };

  const modal = useMemo(() => {
    if (!game) {
      return false;
    }
    return {
      active: true,
      body: (
        <GameDetail
          game={game}
          comments={comments}
          status={status}
          onAction={() =>
            !game.price
              ? installGame(game)
              : window.open(`https://store.emudeck.com/?game=${game.id}`, '_blank')
          }
          onClose={closeGame}
        />
      ),
      footer: <></>,
      css: 'emumodal--game',
    };
  }, [game, comments, status]);

  return (
    <div className={`app ${system}`}>
      <AsideLibrary systems={catalog} onClick={selectPlatform} />
      <div className="wrapper">
        <Header title={platform.title} />
        <Store
          games={platform.games}
          onClick={selectGame}
        />
      </div>
      <EmuModal modal={modal} />
    </div>
  );
}

export default StorePage;
