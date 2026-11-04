import { useTranslation } from 'react-i18next';
import React, { useEffect, useMemo, useState } from 'react';

import Wrapper from 'components/molecules/Wrapper/Wrapper';
import EmuModal from 'components/molecules/EmuModal/EmuModal';
import PortDetail from 'components/molecules/PortDetail/PortDetail';
import Header from 'components/organisms/Header/Header';
import Ports from 'components/organisms/Wrappers/Ports';

function PortsPage() {
  const { t } = useTranslation();
  const ipcChannel = window.electron.ipcRenderer;
  const [statePage, setStatePage] = useState({
    games: [],
    statuses: {},
    game: null,
    busy: '',
    error: '',
  });
  const { games, statuses, game, busy, error } = statePage;

  // Runs a Ports_* backend function and returns its stdout
  const runPorts = (fn, id = '') =>
    new Promise((resolve) => {
      const channel = `Ports_${fn}_${id}`;
      ipcChannel.sendMessage('emudeck', [`${channel}|||Ports_${fn} ${id}`]);
      ipcChannel.once(channel, (message) => resolve(String(message.stdout)));
    });

  const loadStatuses = () => {
    runPorts('status').then((stdout) => {
      try {
        const json = stdout.slice(
          stdout.indexOf('{'),
          stdout.lastIndexOf('}') + 1,
        );
        setStatePage((prev) => ({ ...prev, statuses: JSON.parse(json) }));
      } catch (e) {
        console.error('Ports status error', stdout);
      }
    });
  };

  useEffect(() => {
    ipcChannel.sendMessage('ports-json', []);
    ipcChannel.once('ports-json', (catalog) => {
      setStatePage((prev) => ({
        ...prev,
        games: catalog
          .filter((item) => item.status === 'true')
          .flatMap((item) => item.games)
          .filter((item) => item.status === 'true'),
      }));
    });
    loadStatuses();
  }, []);

  // Runs an install/uninstall/launch action and refreshes the statuses
  const portAction = (fn, busyCode = '') => {
    setStatePage((prev) => ({ ...prev, busy: busyCode, error: '' }));
    runPorts(fn, game.id).then((stdout) => {
      setStatePage((prev) => ({
        ...prev,
        busy: '',
        error: stdout.includes('true') ? '' : fn,
      }));
      if (busyCode) {
        loadStatuses();
      }
    });
  };

  const closeGame = () => {
    setStatePage((prev) => ({ ...prev, game: null, error: '' }));
  };

  const modal = useMemo(() => {
    if (!game) {
      return false;
    }
    return {
      active: true,
      body: (
        <PortDetail
          key={game.id}
          game={game}
          status={statuses[game.id] || ''}
          busy={busy}
          error={error}
          onInstall={() => portAction('install', 'installing')}
          onUninstall={() => portAction('uninstall', 'uninstalling')}
          onLaunch={() => portAction('launch')}
          onClose={closeGame}
        />
      ),
      footer: <></>,
      css: 'emumodal--game',
    };
  }, [game, statuses, busy, error]);

  return (
    <Wrapper>
      <Header title={t('PortsPage.title')} />
      <Ports
        games={games}
        onClick={(selected) =>
          setStatePage({ ...statePage, game: selected, error: '' })
        }
      />
      <EmuModal modal={modal} />
    </Wrapper>
  );
}

export default PortsPage;
