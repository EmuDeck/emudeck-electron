import { useEffect, useState } from 'react';
import { useGlobalContext } from 'context/globalContext';

import DeviceSelector from 'components/organisms/Wrappers/DeviceSelector.js';

import img552 from 'assets/rg552.png';
import imgOdin from 'assets/odin.png';
import imgRP2 from 'assets/rp2.png';
import imgAndroid from 'assets/android.png';
import imgDeck from 'assets/deck.png';

const DeviceSelectorPage = () => {
  const { state, setState } = useGlobalContext();
  const { device, installEmus } = state;
  const [statePage, setStatePage] = useState({
    disabledNext: true,
    disabledBack: false,
    data: '',
  });
  const { disabledNext, disabledBack, data } = statePage;

  // Setting the device
  const deviceSet = (deviceName: string) => {
    setStatePage({ ...statePage, disabledNext: false });
    if (deviceName === 'Odin Lite') {
      setState({
        ...state,
        device: deviceName,
        installEmus: {
          ...installEmus,
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
        },
      });
    } else if (deviceName === 'Odin Base/Pro') {
      setState({
        ...state,
        device: deviceName,
        installEmus: {
          ...installEmus,
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
        },
      });
    } else if (deviceName === 'RG552') {
      setState({
        ...state,
        device: deviceName,
        installEmus: {
          ...installEmus,
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
        },
      });
    } else if (deviceName === 'RP2+') {
      setState({
        ...state,
        device: deviceName,
        installEmus: {
          ...installEmus,
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
        },
      });
    } else if (deviceName === 'Android') {
      setState({
        ...state,
        device: deviceName,
        installEmus: {
          ...installEmus,
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
        },
      });
    } else if (deviceName === 'Steam Deck') {
      setState({
        ...state,
        device: deviceName,
        installEmus: {
          ...installEmus,
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
        },
      });
    } else if (deviceName === 'Anbernic Win600') {
      setState({
        ...state,
        device: deviceName,
        installEmus: {
          ...installEmus,
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
        },
      });
    }
  };

  // Enabling button when changing the global state only if we have a device selected
  useEffect(() => {
    if (device !== '') {
      setStatePage({ ...statePage, disabledNext: false });
    }
  }, [state]); // <-- here put the parameter to listen

  return (
    <DeviceSelector
      data={data}
      onClick={deviceSet}
      disabledNext={disabledNext}
      disabledBack={disabledBack}
      next="emulator-selector"
    />
  );
};

export default DeviceSelectorPage;
