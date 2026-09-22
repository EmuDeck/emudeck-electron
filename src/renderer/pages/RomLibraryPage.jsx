import { useTranslation } from 'react-i18next';
import React, { useEffect, useState, useContext, useRef } from 'react';
import { GlobalContext } from 'context/globalContext';
import Wrapper from 'components/molecules/Wrapper/Wrapper';
import Header from 'components/organisms/Header/Header';
import EmuModal from 'components/molecules/EmuModal/EmuModal';
import RomLibrary from 'components/organisms/Wrappers/RomLibrary';
import RomCollectionForm from 'components/organisms/Wrappers/RomCollectionForm';
import AsideLibrary from 'components/molecules/AsideLibrary/AsideLibrary';
import { BtnSimple } from 'getbasecore/Atoms';

const COLLECTIONS_KEY = 'rom_library_collections';

// Strips region/dump tags like "(USA)" or "[!]" for display
const displayName = (name) =>
  name
    .replace(/\([^)]*\)/g, '')
    .replace(/\[[^\]]*\]/g, '')
    .replace(/\s+/g, ' ')
    .trim() || name;

const loadCollections = () => {
  try {
    return JSON.parse(localStorage.getItem(COLLECTIONS_KEY)) || [];
  } catch {
    return [];
  }
};

// Evaluates one smart-collection rule against a game
const matchRule = (game, rule) => {
  const value = String(rule.value || '').toLowerCase();
  if (rule.field === 'platform') {
    return rule.op === 'isNot'
      ? game.platform !== rule.value
      : game.platform === rule.value;
  }
  if (rule.field === 'extension') {
    const ext = game.path.split('.').pop().toLowerCase();
    const wanted = value.replace(/^\./, '');
    return rule.op === 'isNot' ? ext !== wanted : ext === wanted;
  }
  const title = game.title.toLowerCase();
  switch (rule.op) {
    case 'notContains':
      return !title.includes(value);
    case 'startsWith':
      return title.startsWith(value);
    case 'endsWith':
      return title.endsWith(value);
    default:
      return title.includes(value);
  }
};

// Games matching a collection: manual keeps its own order, smart applies rules
const collectionGames = (collection, allGames) => {
  if (collection.type === 'manual') {
    const byPath = new Map(allGames.map((g) => [g.path, g]));
    return collection.games.map((p) => byPath.get(p)).filter(Boolean);
  }
  const rules = (collection.rules || []).filter(
    (r) => r.field === 'platform' || String(r.value || '').trim() !== '',
  );
  let games = rules.length
    ? allGames.filter((g) =>
        collection.matchAll
          ? rules.every((r) => matchRule(g, r))
          : rules.some((r) => matchRule(g, r)),
      )
    : allGames;
  if (collection.limit > 0) games = games.slice(0, collection.limit);
  return games;
};

// OpenEmu-style ROM browser fed by the backend's generateGameLists
function RomLibraryPage() {
  const { t } = useTranslation();
  const ipcChannel = window.electron.ipcRenderer;
  const { state } = useContext(GlobalContext);
  const { system } = state;

  const [statePage, setStatePage] = useState({
    loading: true,
    building: false,
    buildStatus: '',
    error: null,
    systems: [],
    roms: {},
    collections: loadCollections(),
    selectedSystem: localStorage.getItem('rom_library_system') || 'all',
    query: '',
    size: Number(localStorage.getItem('rom_library_size')) || 160,
    selectedRom: null,
    status: null,
    cacheBust: Date.now(),
    modal: { active: false },
  });
  const config = useRef(null);
  const statusTimeout = useRef(null);
  const pollTimer = useRef(null);

  const mediaUrl = (platform, name) => {
    const file = `${config.current.storagePath}/retrolibrary/artwork/${platform}/media/box2dfront/${name}.jpg`;
    return `emudeck-media://local/${encodeURIComponent(file)}`;
  };

  // Turns the backend JSON into { systems, roms } for the wrapper
  const ingest = (list) => {
    const systems = [];
    const roms = {};
    list.forEach((entry) => {
      const games = (entry.games || [])
        .filter((g) => !g.og_name.startsWith('._'))
        .map((g) => ({
          system: entry.id,
          name: g.name,
          title: displayName(g.og_name),
          file: g.og_name,
          path: g.filename,
          platform: g.platform,
          launcher: entry.launcher,
          cover: mediaUrl(g.platform, g.name),
        }));
      if (games.length === 0) return;
      systems.push({ id: entry.id, name: entry.title, count: games.length });
      roms[entry.id] = games;
    });
    return { systems, roms };
  };

  const loadJson = (onMissing) => {
    ipcChannel.sendMessage('rom-library-json', []);
    ipcChannel.once('rom-library-json', (result) => {
      if (!result.ok) {
        if (result.error === 'missing' && onMissing) {
          onMissing();
          return;
        }
        setStatePage((prev) => ({
          ...prev,
          loading: false,
          error: result.error,
        }));
        return;
      }
      const { systems, roms } = ingest(result.systems);
      setStatePage((prev) => ({
        ...prev,
        loading: false,
        error: null,
        systems,
        roms,
        cacheBust: Date.now(),
      }));
    });
  };

  const pollStatus = () => {
    ipcChannel.sendMessage('rom-library-status', []);
    ipcChannel.once('rom-library-status', (message) => {
      setStatePage((prev) => ({ ...prev, buildStatus: message }));
    });
  };

  // Runs generateGameLists in the backend and reloads the JSON when done
  const build = () => {
    setStatePage((prev) => ({
      ...prev,
      loading: true,
      building: true,
      error: null,
    }));
    pollTimer.current = setInterval(pollStatus, 1000);
    ipcChannel.sendMessage('rom-library-build', []);
    ipcChannel.once('rom-library-build', (result) => {
      clearInterval(pollTimer.current);
      setStatePage((prev) => ({ ...prev, building: false, buildStatus: '' }));
      if (!result.ok) {
        setStatePage((prev) => ({
          ...prev,
          loading: false,
          error: result.error,
        }));
        return;
      }
      loadJson();
    });
  };

  useEffect(() => {
    ipcChannel.sendMessage('rom-library-config', []);
    ipcChannel.once('rom-library-config', (cfg) => {
      config.current = cfg;
      if (!cfg.storagePath) {
        setStatePage((prev) => ({
          ...prev,
          loading: false,
          error: 'no-settings',
        }));
        return;
      }
      loadJson(build);
    });
    return () => {
      clearTimeout(statusTimeout.current);
      clearInterval(pollTimer.current);
    };
  }, []);

  const showStatus = (status) => {
    clearTimeout(statusTimeout.current);
    setStatePage((prev) => ({ ...prev, status }));
    statusTimeout.current = setTimeout(() => {
      setStatePage((prev) => ({ ...prev, status: null }));
    }, 4000);
  };

  const selectSystem = (id) => {
    localStorage.setItem('rom_library_system', id);
    setStatePage((prev) => ({
      ...prev,
      selectedSystem: id,
      selectedRom: null,
    }));
  };

  const setQuery = (query) => setStatePage((prev) => ({ ...prev, query }));

  const setSize = (size) => {
    localStorage.setItem('rom_library_size', String(size));
    setStatePage((prev) => ({ ...prev, size }));
  };

  const selectRom = (rom) =>
    setStatePage((prev) => ({ ...prev, selectedRom: rom }));

  const launch = (rom) => {
    if (system === 'win32') {
      showStatus({ type: 'error', text: t('RomLibrary.launchUnsupported') });
      return;
    }
    showStatus({
      type: 'info',
      text: t('RomLibrary.launching', { name: rom.title }),
    });
    ipcChannel.sendMessage('rom-library-launch', [
      rom.launcher,
      rom.path,
      rom.platform,
    ]);
    ipcChannel.once('rom-library-launch', (result) => {
      if (!result.ok) {
        showStatus({
          type: 'error',
          text: t('RomLibrary.launchError', { name: rom.title }),
        });
      }
    });
  };

  //
  // Collections (manual + smart), persisted in localStorage
  //
  const saveCollections = (updater) => {
    setStatePage((prev) => {
      const collections = updater(prev.collections);
      localStorage.setItem(COLLECTIONS_KEY, JSON.stringify(collections));
      return { ...prev, collections };
    });
  };

  const closeModal = () =>
    setStatePage((prev) => ({ ...prev, modal: { active: false } }));

  const openCollectionForm = (existing) => {
    const onSave = (data) => {
      saveCollections((collections) => {
        if (existing) {
          return collections.map((c) =>
            c.id === existing.id ? { ...c, ...data } : c,
          );
        }
        return [...collections, { id: String(Date.now()), games: [], ...data }];
      });
      closeModal();
      if (!existing) {
        setStatePage((prev) => {
          const created = prev.collections[prev.collections.length - 1];
          return created
            ? { ...prev, selectedSystem: `col:${created.id}` }
            : prev;
        });
      }
    };
    setStatePage((prev) => ({
      ...prev,
      modal: {
        active: true,
        header: (
          <span className="h4">
            {existing
              ? t('RomLibrary.collection.edit')
              : t('RomLibrary.collection.new')}
          </span>
        ),
        body: (
          <RomCollectionForm
            key={existing ? existing.id : 'new'}
            initial={existing}
            systems={prev.systems}
            onSave={onSave}
            onCancel={closeModal}
          />
        ),
        footer: <span />,
        css: 'emumodal--sm emumodal--collection',
      },
    }));
  };

  const deleteCollection = (collection) => {
    setStatePage((prev) => ({
      ...prev,
      modal: {
        active: true,
        header: <span className="h4">{t('RomLibrary.collection.delete')}</span>,
        body: (
          <p>
            {t('RomLibrary.collection.deleteConfirm', {
              name: collection.name,
            })}
          </p>
        ),
        footer: (
          <div>
            <BtnSimple
              css="btn-simple--3"
              type="button"
              aria={t('general.yes')}
              style={{ marginBottom: 0 }}
              onClick={() => {
                saveCollections((collections) =>
                  collections.filter((c) => c.id !== collection.id),
                );
                setStatePage((p) => ({
                  ...p,
                  modal: { active: false },
                  selectedSystem:
                    p.selectedSystem === `col:${collection.id}`
                      ? 'all'
                      : p.selectedSystem,
                }));
              }}
            >
              {t('general.yes')}
            </BtnSimple>
            <BtnSimple
              css="btn-simple--2"
              type="button"
              aria={t('general.no')}
              style={{ marginBottom: 0 }}
              onClick={closeModal}
            >
              {t('general.no')}
            </BtnSimple>
          </div>
        ),
        css: 'emumodal--xs',
      },
    }));
  };

  const addGameToCollection = (collectionId, romPath) => {
    saveCollections((collections) =>
      collections.map((c) =>
        c.id === collectionId &&
        c.type === 'manual' &&
        !c.games.includes(romPath)
          ? { ...c, games: [...c.games, romPath] }
          : c,
      ),
    );
  };

  const removeGameFromCollection = (collectionId, romPath) => {
    saveCollections((collections) =>
      collections.map((c) =>
        c.id === collectionId
          ? { ...c, games: c.games.filter((p) => p !== romPath) }
          : c,
      ),
    );
  };

  //
  // What the grid shows for the current selection
  //
  const { systems, roms, collections, selectedSystem } = statePage;
  const allGames = systems.flatMap((s) => roms[s.id] || []);
  const collectionsWithCount = collections.map((c) => ({
    ...c,
    count: collectionGames(c, allGames).length,
  }));
  const currentCollection = selectedSystem.startsWith('col:')
    ? collections.find((c) => `col:${c.id}` === selectedSystem) || null
    : null;
  let games;
  if (currentCollection) {
    games = collectionGames(currentCollection, allGames);
  } else if (selectedSystem === 'all') {
    games = allGames;
  } else {
    games = roms[selectedSystem] || [];
  }

  return (
    <Wrapper
      asideComponent={
        <AsideLibrary
          systems={systems}
          collections={collectionsWithCount}
          selectedSystem={selectedSystem}
          onSelectSystem={selectSystem}
          onAddCollection={() => openCollectionForm(null)}
          onDropGame={addGameToCollection}
        />
      }
    >
      <Header title={t('RomLibrary.title')} />
      <RomLibrary
        {...statePage}
        games={games}
        showSystem={selectedSystem === 'all' || !!currentCollection}
        collection={currentCollection}
        onQuery={setQuery}
        onSize={setSize}
        onSelectRom={selectRom}
        onLaunch={launch}
        onRefresh={build}
        onEditCollection={() => openCollectionForm(currentCollection)}
        onDeleteCollection={() => deleteCollection(currentCollection)}
        onRemoveGame={(romPath) =>
          removeGameFromCollection(currentCollection.id, romPath)
        }
      />
      <EmuModal modal={statePage.modal} />
    </Wrapper>
  );
}

export default RomLibraryPage;
