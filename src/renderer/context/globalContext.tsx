import {
  createContext,
  Dispatch,
  FC,
  SetStateAction,
  useContext,
  useState,
} from 'react';
import { GlobalState } from '.';

export interface GlobalContextInterface {
  state: GlobalState;
  setState: Dispatch<SetStateAction<GlobalState>>;
}

export const initialState: GlobalState = {
  version: '',
  branch: 'beta',
  command: '',
  debug: false,
  debugText: '',
  second: false,
  mode: '',
  system: '',
  device: '',
  storage: '',
  storagePath: '',
  SDID: '',
  bezels: true,
  powerTools: false,
  GyroDSU: false,
  cloudSync: false,
  sudoPass: '',
  achievements: {
    user: '',
    pass: '',
  },
  ar: {
    sega: '43',
    snes: '43',
    classic3d: '43',
    dolphin: '43',
  },
  shaders: {
    handhelds: false,
    classic: false,
  },
  theme: 'EPICNOIR',
  installEmus: {
    ra: { id: 'ra', status: true, name: 'RetroArch' },
    dolphin: { id: 'dolphin', status: true, name: 'Dolphin' },
    primehacks: { id: 'primehacks', status: true, name: 'Prime Hacks' },
    ppsspp: { id: 'ppsspp', status: true, name: 'PPSSPP' },
    duckstation: { id: 'duckstation', status: true, name: 'DuckStation' },
    citra: { id: 'citra', status: true, name: 'Citra' },
    pcsx2: { id: 'pcsx2', status: true, name: 'PCSX2' },
    rpcs3: { id: 'rpcs3', status: true, name: 'RPCS3' },
    yuzu: { id: 'yuzu', status: true, name: 'Yuzu' },
    xemu: { id: 'xemu', status: true, name: 'Xemu' },
    cemu: { id: 'cemu', status: true, name: 'Cemu' },
    srm: { id: 'srm', status: true, name: 'Steam Rom Manager Parsers' },
  },
  overwriteConfigEmus: {
    ra: { id: 'ra', status: true, name: 'RetroArch' },
    dolphin: { id: 'dolphin', status: true, name: 'Dolphin' },
    primehacks: { id: 'primehacks', status: true, name: 'Prime Hacks' },
    ppsspp: { id: 'ppsspp', status: true, name: 'PPSSPP' },
    duckstation: { id: 'duckstation', status: true, name: 'DuckStation' },
    citra: { id: 'citra', status: true, name: 'Citra' },
    pcsx2: { id: 'pcsx2', status: true, name: 'PCSX2' },
    rpcs3: { id: 'rpcs3', status: true, name: 'RPCS3' },
    yuzu: { id: 'yuzu', status: true, name: 'Yuzu' },
    xemu: { id: 'xemu', status: true, name: 'Xemu' },
    cemu: { id: 'cemu', status: true, name: 'Cemu' },
    srm: { id: 'srm', status: true, name: 'Steam Rom Manager Parsers' },
  },
};

export const GlobalContext = createContext<GlobalContextInterface>({
  state: initialState,
  setState: () => {},
});

// TODO: I shouldn't have to type JSX.Element here, but it's not working.
export const GlobalContextProvider: FC<{ children: JSX.Element }> = ({
  children,
}) => {
  const [state, setState] = useState(initialState);
  return (
    <GlobalContext.Provider value={{ state, setState }}>
      {children}
    </GlobalContext.Provider>
  );
};

// TODO: fix this
export const useGlobalContext = () => useContext(GlobalContext);
