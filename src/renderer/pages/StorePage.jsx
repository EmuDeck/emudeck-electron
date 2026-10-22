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
    login: false,
    account: false,
    orders: null,
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
    login,
    account,
    orders,
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
  const purchasedGames = catalog
    .flatMap((item) => item.games)
    .filter((item) => item.price > 0 && (orders || []).includes(item.id));

  const storeWS = useFetchCond('https://store.emudeck.com/rest/store.php');
  const freeOrderWS = useFetchCond('https://store.emudeck.com/rest/add-free-order.php');
  const downloadLinkWS = useFetchCond('https://store.emudeck.com/rest/generate-link.php');
  const commentsWS = useFetchCond('https://store.emudeck.com/rest/comments.php');
  const loginWS = useFetchCond('https://store.emudeck.com/rest/login.php');
  const checkOrderWS = useFetchCond('https://store.emudeck.com/rest/check-order.php');
  const ordersWS = useFetchCond('https://store.emudeck.com/rest/orders.php');

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
      account: false,
      orders: null,
    }));
  };

  const openAccount = () => {
    setStatePage({ ...statePage, account: true, orders: null });
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

  const selectPlatform = (selected) => {
    setStatePage({ ...statePage, platform: selected, tag: '', account: false });
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
          setStatus(response.ok ? 'installed' : 'error');
        });
      })
      .catch(() => setStatus('error'));
  };

  const selectGame = (selected) => {
    setStatePage({
      ...statePage,
      game: selected,
      comments: [],
      status: '',
      currentGameOwned: false,
    });
    if (token && selected.price) {
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
          owned={currentGameOwned}
          onAction={() =>
            !game.price || currentGameOwned
              ? installGame(game)
              : window.open(`https://store.emudeck.com/?game=${game.id}`, '_blank')
          }
          onClose={closeGame}
        />
      ),
      footer: <></>,
      css: 'emumodal--game',
    };
  }, [game, comments, status, currentGameOwned, token]);

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
                <Icon name="cloud" fill="transparent" />
                {token ? t('StorePage.purchases') : t('StorePage.login')}
              </div>
            </div>
          </button>
        </li>
      </AsideLibrary>
      <div className="wrapper">
        <Header />
        {account ? (
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
        ) : (
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
