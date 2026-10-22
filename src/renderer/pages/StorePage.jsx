import { useTranslation } from 'react-i18next';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { GlobalContext } from 'context/globalContext';
import { useFetchCond } from 'hooks/useFetchCond';
import { BtnSimple } from 'getbasecore/Atoms';
import Icon from 'components/atoms/Sprite/Icon';
import AsideLibrary from 'components/molecules/AsideLibrary/AsideLibrary';
import EmuModal from 'components/molecules/EmuModal/EmuModal';
import GameDetail from 'components/molecules/GameDetail/GameDetail';
import StoreLogin from 'components/molecules/StoreLogin/StoreLogin';

import Header from 'components/organisms/Header/Header';

import Store from 'components/organisms/Wrappers/Store';
import StoreTop from 'components/organisms/Wrappers/StoreTop';

import './store-page.scss';

function StorePage() {
  const { t } = useTranslation();
  const { state } = useContext(GlobalContext);
  const { system } = state;
  const ipcChannel = window.electron.ipcRenderer;
  const [statePage, setStatePage] = useState({
    catalog: [],
    platform: {},
    game: null,
    comments: [],
    status: '',
    tag: '',
    pricing: 'all',
    token: localStorage.getItem('emudeck_store_token') || '',
    currentGameOwned: false,
    currentGameInstalled: false,
    ratingStatus: '',
    commentStatus: '',
    login: false,
    view: 'store',
    orders: null,
    top: null,
  });
  const {
    catalog,
    platform,
    game,
    comments,
    status,
    tag,
    pricing,
    token,
    currentGameOwned,
    currentGameInstalled,
    ratingStatus,
    commentStatus,
    login,
    view,
    orders,
    top,
  } = statePage;
  const platformGames = platform.games || [];
  const tags = [...new Set(platformGames.flatMap((item) => item.tags))].sort();
  const games = platformGames.filter((item) => {
    if (tag && !item.tags.includes(tag)) {
      return false;
    }
    if (pricing === 'free') {
      return !item.price;
    }
    if (pricing === 'paid') {
      return item.price > 0;
    }
    return true;
  });
  const catalogGames = catalog.flatMap((item) => item.games);
  const purchasedGames = catalogGames
    .filter((item) => item.price > 0 && (orders || []).includes(item.id));

  const storeWS = useFetchCond('https://store.emudeck.com/rest/store.php');
  const freeOrderWS = useFetchCond('https://store.emudeck.com/rest/add-free-order.php');
  const downloadLinkWS = useFetchCond('https://store.emudeck.com/rest/generate-link.php');
  const commentsWS = useFetchCond('https://store.emudeck.com/rest/comments.php');
  const ratingWS = useFetchCond('https://store.emudeck.com/rest/rating.php');
  const loginWS = useFetchCond('https://store.emudeck.com/rest/login.php');
  const checkOrderWS = useFetchCond('https://store.emudeck.com/rest/check-order.php');
  const ordersWS = useFetchCond('https://store.emudeck.com/rest/orders.php');
  const topWS = useFetchCond('https://store.emudeck.com/rest/top.php');
  const developersWS = useFetchCond('https://store.emudeck.com/rest/developer.php');

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

  const logout = () => {
    localStorage.removeItem('emudeck_store_token');
    setStatePage((prev) => ({
      ...prev,
      token: '',
      currentGameOwned: false,
      view: 'store',
      orders: null,
    }));
  };

  const openAccount = () => {
    setStatePage({ ...statePage, view: 'purchases', orders: null });
    ordersWS
      .post({ token })
      .then((data) => {
        if (data.status === 'success') {
          setStatePage((prev) => ({
            ...prev,
            orders: data.orders.map((order) => order.game_id),
          }));
        }
      })
      .catch((error) => console.error('Store orders error', error));
  };

  useEffect(() => {
    if (!token) {
      return;
    }
    loginWS
      .post({ token })
      .then((data) => {
        if (!data.exists) {
          logout();
        }
      })
      .catch((error) => console.error('Store login error', error));
  }, [token]);

  const saveToken = (newToken) => {
    localStorage.setItem('emudeck_store_token', newToken);
    setStatePage((prev) => ({ ...prev, token: newToken, login: false }));
  };

  const openTop = () => {
    setStatePage({ ...statePage, view: 'top' });
    Promise.all([topWS.get(), developersWS.get()])
      .then(([games, developers]) => {
        setStatePage((prev) => ({
          ...prev,
          top: {
            free: games.free || [],
            paid: games.paid || [],
            developers: developers.developers || [],
          },
        }));
      })
      .catch((error) => console.error('Store top error', error));
  };

  const selectPlatform = (selected) => {
    setStatePage({ ...statePage, platform: selected, tag: '', view: 'store' });
  };

  const setStatus = (code) => {
    setStatePage((prev) => ({ ...prev, status: code }));
  };

  const installGame = (selected) => {
    setStatus('installing');
    const order = selected.price
      ? Promise.resolve()
      : freeOrderWS.post({ game_id: selected.id, token });
    order
      .then(() =>
        downloadLinkWS.post({ game_id: selected.id, type: 'file', token }),
      )
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
          setStatePage((prev) => ({
            ...prev,
            status: response.ok ? 'installed' : 'error',
            currentGameInstalled: response.ok,
            currentGameOwned: prev.currentGameOwned || (response.ok && !!token),
          }));
        });
      })
      .catch(() => setStatus('error'));
  };

  const uninstallGame = (selected) => {
    setStatus('uninstalling');
    ipcChannel.sendMessage('uninstallGame', [selected.platform, selected.name]);
    ipcChannel.once('uninstallGame', (response) => {
      if (!response.ok) {
        setStatus('uninstallError');
        return;
      }
      setStatePage((prev) => ({
        ...prev,
        status: 'uninstalled',
        currentGameInstalled: false,
      }));
    });
  };

  const selectGame = (selected) => {
    setStatePage({
      ...statePage,
      game: selected,
      comments: [],
      status: '',
      currentGameOwned: false,
      currentGameInstalled: false,
      ratingStatus: '',
      commentStatus: '',
    });
    ipcChannel.sendMessage('store-installed', [selected.platform, selected.name]);
    ipcChannel.once('store-installed', (installed) => {
      setStatePage((prev) => ({ ...prev, currentGameInstalled: installed }));
    });
    if (token) {
      checkOrderWS
        .post({ token, game_id: selected.id })
        .then((data) => {
          setStatePage((prev) => ({ ...prev, currentGameOwned: data.exists === true }));
        })
        .catch((error) => console.error('Store order error', error));
    }
    commentsWS
      .post({ action: 'get', game_id: selected.id })
      .then((data) => {
        if (data.status === 'success') {
          setStatePage((prev) => ({ ...prev, comments: data.comments }));
        }
      })
      .catch((error) => console.error('Store comments error', error));
  };

  const rateGame = (rating) => {
    ratingWS
      .post({ token, game_id: game.id, rating })
      .then((data) => {
        if (data.status !== 'success') {
          setStatePage((prev) => ({ ...prev, ratingStatus: 'error' }));
          return;
        }
        const newRating = { avg: data.avg_rating, total: data.total };
        const withRating = (list) =>
          list.map((item) =>
            item.id === game.id ? { ...item, rating: newRating } : item,
          );
        setStatePage((prev) => ({
          ...prev,
          ratingStatus: 'sent',
          game: { ...prev.game, rating: newRating },
          catalog: prev.catalog.map((item) => ({
            ...item,
            games: withRating(item.games),
          })),
          platform: { ...prev.platform, games: withRating(prev.platform.games || []) },
        }));
      })
      .catch(() => setStatePage((prev) => ({ ...prev, ratingStatus: 'error' })));
  };

  const postComment = (body) => {
    setStatePage((prev) => ({ ...prev, commentStatus: 'sending' }));
    return commentsWS
      .post({ action: 'post', game_id: game.id, token, body })
      .then((data) => {
        if (data.status === 'success') {
          setStatePage((prev) => ({ ...prev, commentStatus: 'sent' }));
          return true;
        }
        const code = String(data.message).includes('already') ? 'already' : 'error';
        setStatePage((prev) => ({ ...prev, commentStatus: code }));
        return false;
      })
      .catch(() => {
        setStatePage((prev) => ({ ...prev, commentStatus: 'error' }));
        return false;
      });
  };

  const closeGame = () => {
    setStatePage((prev) => ({ ...prev, game: null }));
  };

  const modal = useMemo(() => {
    if (!game) {
      return false;
    }
    let reviewBlock = '';
    if (!token) {
      reviewBlock = 'login';
    } else if (game.price && !currentGameOwned) {
      reviewBlock = 'buy';
    } else if (!game.price && !currentGameInstalled) {
      reviewBlock = 'install';
    } else if (!currentGameOwned) {
      reviewBlock = 'reinstall';
    }
    const canReview = !reviewBlock;
    return {
      active: true,
      body: (
        <GameDetail
          key={game.id}
          game={game}
          comments={comments}
          status={status}
          owned={currentGameOwned}
          installed={currentGameInstalled}
          ratingStatus={ratingStatus}
          commentStatus={commentStatus}
          reviewBlock={reviewBlock}
          onRate={canReview ? rateGame : null}
          onComment={canReview ? postComment : null}
          onAction={() => {
            if (currentGameInstalled) {
              uninstallGame(game);
              return;
            }
            if (!game.price || currentGameOwned) {
              installGame(game);
              return;
            }
            window.open(`https://store.emudeck.com/?game=${game.id}`, '_blank');
          }}
          onClose={closeGame}
        />
      ),
      footer: <></>,
      css: 'emumodal--game',
    };
  }, [
    game,
    comments,
    status,
    currentGameOwned,
    currentGameInstalled,
    ratingStatus,
    commentStatus,
    token,
  ]);

  const loginModal = useMemo(() => {
    if (!login) {
      return false;
    }
    return {
      active: true,
      header: <span className="h4">{t('StorePage.login')}</span>,
      body: (
        <StoreLogin
          onLogin={saveToken}
          onClose={() => setStatePage((prev) => ({ ...prev, login: false }))}
        />
      ),
      footer: <></>,
      css: 'emumodal--xs',
    };
  }, [login]);

  return (
    <div className={`app ${system}`}>
      <AsideLibrary systems={catalog} onClick={selectPlatform}>
        <li>
          <button
            type="button"
            onClick={() =>
              token ? openAccount() : setStatePage({ ...statePage, login: true })
            }
          >
            <div className="list--icons list--icons--xs">
              <div className="text">
                <Icon name="package" fill="transparent" />
                {token ? t('StorePage.purchases') : t('StorePage.login')}
              </div>
            </div>
          </button>
        </li>
        <li>
          <button type="button" onClick={openTop}>
            <div className="list--icons list--icons--xs">
              <div className="text">
                <Icon name="prize" fill="transparent" />
                {t('StorePage.top')}
              </div>
            </div>
          </button>
        </li>
      </AsideLibrary>
      <div className="wrapper">
        <Header />
        {view === 'purchases' && (
          <>
            <div className="store-page__toolbar">
              <h1 className="h2">{t('StorePage.purchases')}</h1>
              <BtnSimple
                css="btn-simple--3"
                type="button"
                aria={t('StorePage.logout')}
                onClick={logout}
              >
                {t('StorePage.logout')}
              </BtnSimple>
            </div>
            {orders && purchasedGames.length === 0 && (
              <p>{t('StorePage.noPurchases')}</p>
            )}
            <Store games={purchasedGames} onClick={selectGame} />
          </>
        )}
        {view === 'top' && (
          <StoreTop top={top} games={catalogGames} onClick={selectGame} />
        )}
        {view === 'store' && (
          <>
            <div className="store-page__toolbar">
              <h1 className="h2">{platform.title}</h1>
              <div className="store-page__filters">
                {['', ...tags].map((item) => (
                  <button
                    key={item}
                    type="button"
                    className={`store-page__filter ${tag === item ? 'is-active' : ''}`}
                    onClick={() => setStatePage({ ...statePage, tag: item })}
                  >
                    {item || t('StorePage.allTags')}
                  </button>
                ))}
              </div>
              <div className="store-page__filters">
                {['all', 'free', 'paid'].map((item) => (
                  <button
                    key={item}
                    type="button"
                    className={`store-page__filter ${pricing === item ? 'is-active' : ''}`}
                    onClick={() => setStatePage({ ...statePage, pricing: item })}
                  >
                    {t(`StorePage.${item}`)}
                  </button>
                ))}
              </div>
            </div>
            <Store games={games} onClick={selectGame} />
          </>
        )}
      </div>
      <EmuModal modal={modal} />
      <EmuModal modal={loginModal} />
    </div>
  );
}

export default StorePage;
