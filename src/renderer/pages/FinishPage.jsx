import { useTranslation } from 'react-i18next';
import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Wrapper from 'components/molecules/Wrapper/Wrapper';
import Header from 'components/organisms/Header/Header';
import { basicHotkeys, basicHotkeysWin } from 'components/utils/images/hotkeys';
import Main from 'components/organisms/Main/Main';
import { BtnSimple } from 'getbasecore/Atoms';
import { GlobalContext } from 'context/globalContext';
import { yoshiMario, yoshi } from 'components/utils/images/gifs';
import Card from 'components/molecules/Card/Card';
import EmuModal from 'components/molecules/EmuModal/EmuModal';

function FinishPage() {
  const { t, i18n } = useTranslation();
  const { state, setState } = useContext(GlobalContext);
  const {
    system,
    second,
    device,
    installFrontends,
    branch,
    mode,
    cloudSyncStatus,
  } = state;
  const navigate = useNavigate();
  const ipcChannel = window.electron.ipcRenderer;
  useEffect(() => {
    const json = JSON.stringify(state);
    localStorage.setItem('settings_emudeck', json);
  }, []);

  const restartSteam = () => {
    ipcChannel.sendMessage('emudeck', [`killSteam|||killSteam`]);
  };

  // Leaves Desktop Mode and goes back to Game Mode
  const backToGameMode = () => {
    ipcChannel.sendMessage('emudeck', [
      'gameMode|||(command -v steamos-session-select >/dev/null && steamos-session-select gamescope) || qdbus org.kde.Shutdown /Shutdown org.kde.Shutdown.logout',
    ]);
  };

  // Asks for confirmation before running an action
  const confirmAction = (title, body, action) => {
    setModal({
      active: true,
      header: <span className="h4">{title}</span>,
      body: <p>{body}</p>,
      footer: (
        <>
          <BtnSimple
            css="btn-simple--2"
            type="button"
            aria={t('general.cancel')}
            onClick={() => setModal({ active: false })}
          >
            {t('general.cancel')}
          </BtnSimple>
          <BtnSimple
            css="btn-simple--1"
            type="button"
            aria={title}
            onClick={() => {
              setModal({ active: false });
              action();
            }}
          >
            {title}
          </BtnSimple>
        </>
      ),
      css: 'emumodal--xs',
    });
  };

  // Opens the Cloud Services Manager
  const openCSM = () => {
    ipcChannel.sendMessage('bash', [
      'csm|||bash ~/.config/EmuDeck/backend/functions/cloudServicesManager.sh',
    ]);
  };

  const [spriteIcons, setSpriteIcons] = useState({});
  const [modal, setModal] = useState(false);

  // Turns the Aside SVG sprite symbols into image URLs so the cards can use them in an img
  useEffect(() => {
    const urls = {};
    [
      'prize',
      'joystick',
      'package',
      'gamepad',
      'compress',
      'cloud',
      'plugin',
    ].forEach((name) => {
      const symbol = document.getElementById(name);
      if (symbol) {
        const content = symbol.innerHTML.replace(/clip-path="[^"]*"/g, '');
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${symbol.getAttribute(
          'viewBox',
        )}">${content}</svg>`;
        urls[name] =
          `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
      }
    });
    setSpriteIcons(urls);
  }, []);

  // Same featured options we show in the Aside
  const featured = [
    {
      iconFlat: 'joystick',
      title: t('FinishPage.backToGameMode'),
      status:
        system !== 'win32' && system !== 'darwin' && device !== 'Steam Frame',
      highlight: true,
      function: () =>
        confirmAction(
          t('FinishPage.backToGameMode'),
          t('FinishPage.backToGameModeBody'),
          backToGameMode,
        ),
    },
    {
      iconFlat: 'joystick',
      title: t('FinishPage.restartSteam'),
      status: device === 'Steam Frame',
      highlight: true,
      function: () =>
        confirmAction(
          t('FinishPage.restartSteam'),
          t('FinishPage.restartSteamBody'),
          restartSteam,
        ),
    },
    {
      iconFlat: 'prize',
      title: t('aside.earlyAccess'),
      status: !branch.includes('early'),
      function: () => navigate('/early-access'),
    },
    {
      iconFlat: 'joystick',
      title: t('aside.romLibrary'),
      status: branch.includes('dev'),
      function: () => navigate('/rom-library'),
    },
    {
      iconFlat: 'package',
      title: t('StoreFrontPage.title'),
      status: true,
      function: () => window.open('https://store.emudeck.com', '_blank'),
    },
    {
      iconFlat: 'prize',
      title: t('aside.retroAchievements'),
      status: system !== 'darwin' && mode === 'easy',
      function: () => navigate('/RA-achievements-config'),
    },
    {
      iconFlat: 'compress',
      title: t('aside.cards.compressor.title'),
      status: system !== 'darwin',
      function: () => navigate('/chd-tool'),
    },
    {
      iconFlat: 'cloud',
      title: t('aside.cloudSaves'),
      status: system !== 'darwin' && !branch.includes('early'),
      function: () => navigate('/cloud-sync/welcome'),
    },
    {
      iconFlat: 'cloud',
      title: t('aside.cloudServices'),
      status: !(system === 'win32' || system === 'darwin'),
      function: () => openCSM(),
    },
    {
      iconFlat: 'plugin',
      title: 'EmuDecky',
      status: system !== 'win32' && !cloudSyncStatus,
      function: () => navigate('/decky-controls'),
    },
    {
      iconFlat: 'gamepad',
      title: 'Metro Cop',
      status: true,
      function: () => navigate('/metro-cop'),
    },
  ];

  return (
    <Wrapper aside={second === true}>
      <Header
        title={`${t(
          'FinishPage.title',
        )}<img src=${yoshi} style="width:30px" alt="" />`}
      />
      <Main>
        <p className="lead">
          {t('FinishPage.line1')}
          <br />
          {t('FinishPage.line2')}
          <br />
          {t('FinishPage.line3')}
          <br />
          {t('FinishPage.line4')}
          <strong>{t('FinishPage.line5')}</strong>
        </p>
        <div className="cards cards--medium">
          {featured
            .filter((item) => item.status)
            .map((item) => (
              <Card
                key={item.title}
                css={item.highlight ? 'is-selected is-selected--hide-tick' : ''}
                onClick={() => item.function()}
              >
                <img src={spriteIcons[item.iconFlat]} alt={item.title} />
                <span className="h6">{item.title}</span>
              </Card>
            ))}
        </div>
      </Main>
      <EmuModal modal={modal} />
    </Wrapper>
  );
}

export default FinishPage;
