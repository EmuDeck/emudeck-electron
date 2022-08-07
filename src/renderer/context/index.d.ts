export interface Achievements {
  user: string;
  pass: string;
}

export interface Ar {
  sega: string;
  snes: string;
  classic3d: string;
  dolphin: string;
}

export interface Shaders {
  handhelds: boolean;
  classic: boolean;
}

export interface Ra {
  id: string;
  status: boolean;
  name: string;
}

export interface Dolphin {
  id: string;
  status: boolean;
  name: string;
}

export interface Primehacks {
  id: string;
  status: boolean;
  name: string;
}

export interface Ppsspp {
  id: string;
  status: boolean;
  name: string;
}

export interface Duckstation {
  id: string;
  status: boolean;
  name: string;
}

export interface Citra {
  id: string;
  status: boolean;
  name: string;
}

export interface Pcsx2 {
  id: string;
  status: boolean;
  name: string;
}

export interface Rpcs3 {
  id: string;
  status: boolean;
  name: string;
}

export interface Yuzu {
  id: string;
  status: boolean;
  name: string;
}

export interface Xemu {
  id: string;
  status: boolean;
  name: string;
}

export interface Cemu {
  id: string;
  status: boolean;
  name: string;
}

export interface Srm {
  id: string;
  status: boolean;
  name: string;
}

export interface InstallEmus {
  ra: Ra;
  dolphin: Dolphin;
  primehacks: Primehacks;
  ppsspp: Ppsspp;
  duckstation: Duckstation;
  citra: Citra;
  pcsx2: Pcsx2;
  rpcs3: Rpcs3;
  yuzu: Yuzu;
  xemu: Xemu;
  cemu: Cemu;
  srm: Srm;
}

export interface Ra2 {
  id: string;
  status: boolean;
  name: string;
}

export interface Dolphin2 {
  id: string;
  status: boolean;
  name: string;
}

export interface Primehacks2 {
  id: string;
  status: boolean;
  name: string;
}

export interface Ppsspp2 {
  id: string;
  status: boolean;
  name: string;
}

export interface Duckstation2 {
  id: string;
  status: boolean;
  name: string;
}

export interface Citra2 {
  id: string;
  status: boolean;
  name: string;
}

export interface Pcsx22 {
  id: string;
  status: boolean;
  name: string;
}

export interface Rpcs32 {
  id: string;
  status: boolean;
  name: string;
}

export interface Yuzu2 {
  id: string;
  status: boolean;
  name: string;
}

export interface Xemu2 {
  id: string;
  status: boolean;
  name: string;
}

export interface Cemu2 {
  id: string;
  status: boolean;
  name: string;
}

export interface Srm2 {
  id: string;
  status: boolean;
  name: string;
}

export interface OverwriteConfigEmus {
  ra: Ra2;
  dolphin: Dolphin2;
  primehacks: Primehacks2;
  ppsspp: Ppsspp2;
  duckstation: Duckstation2;
  citra: Citra2;
  pcsx2: Pcsx22;
  rpcs3: Rpcs32;
  yuzu: Yuzu2;
  xemu: Xemu2;
  cemu: Cemu2;
  srm: Srm2;
}

export interface GlobalState {
  version: string;
  branch: string;
  command: string;
  debug: boolean;
  debugText: string;
  second: boolean;
  mode: string;
  system: string;
  device: string;
  storage: string;
  storagePath: string;
  SDID: string;
  bezels: boolean;
  powerTools: boolean;
  GyroDSU: boolean;
  cloudSync: boolean;
  sudoPass: string;
  achievements: Achievements;
  ar: Ar;
  shaders: Shaders;
  theme: string;
  installEmus: InstallEmus;
  overwriteConfigEmus: OverwriteConfigEmus;
}
