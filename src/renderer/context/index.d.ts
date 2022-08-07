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

// TODO: idk what to name this
export interface EmuConfig {
  id: string;
  status: boolean;
  name: string;
}

export interface InstallEmus {
  ra: EmuConfig;
  dolphin: EmuConfig;
  primehacks: EmuConfig;
  ppsspp: EmuConfig;
  duckstation: EmuConfig;
  citra: EmuConfig;
  pcsx2: EmuConfig;
  rpcs3: EmuConfig;
  yuzu: EmuConfig;
  xemu: EmuConfig;
  cemu: EmuConfig;
  srm: EmuConfig;
}

export interface OverwriteConfigEmus {
  ra: EmuConfig;
  dolphin: EmuConfig;
  primehacks: EmuConfig;
  ppsspp: EmuConfig;
  duckstation: EmuConfig;
  citra: EmuConfig;
  pcsx2: EmuConfig;
  rpcs3: EmuConfig;
  yuzu: EmuConfig;
  xemu: EmuConfig;
  cemu: EmuConfig;
  srm: EmuConfig;
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
