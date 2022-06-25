import React, { useEffect, useState, useContext } from "react";
import { GlobalContext } from "context/globalContext";

import Footer from "components/organisms/Footer/Footer.js";
import Header from "components/organisms/Header/Header.js";
import Aside from "components/organisms/Aside/Aside.js";
import Main from "components/organisms/Main/Main.js";

import DeviceSelector from "components/organisms/Wrappers/DeviceSelector.js";

import img552 from "assets/rg552.png";
import imgOdin from "assets/odin.png";
import imgRP2 from "assets/rp2.png";
import imgAndroid from "assets/android.png";
import imgDeck from "assets/deck.png";

const EmulatorSelectorPage = () => {
  const { state, setState } = useContext(GlobalContext);
  const { device } = state;
  const [statePage, setStatePage] = useState({
    disabledNext: true,
    disabledBack: false,
  });
  const { disabledNext, disabledBack } = statePage;

  //Setting the device
  const deviceSet = (deviceName) => {
    if (deviceName === "Odin") {
      setState({
        ...state,
        device: deviceName,
        installEmus: {
          ra: true,
          dolphinmmjr: true,
          drastic: true,
          redream: false,
          yaba: false,
          ppsspp: true,
          duckstation: true,
          citra: true,
          aether: true,
          mupen: false,
        },
      });
    } else if (deviceName === "RG552") {
      setState({
        ...state,
        device: deviceName,
        installEmus: {
          ra: true,
          dolphinmmjr: false,
          drastic: true,
          redream: false,
          yaba: true,
          ppsspp: true,
          duckstation: true,
          citra: false,
          aether: true,
          mupen: true,
        },
      });
    } else if (deviceName === "RP2") {
      setState({
        ...state,
        device: deviceName,
        installEmus: {
          ra: true,
          dolphinmmjr: false,
          drastic: true,
          redream: true,
          yaba: true,
          ppsspp: true,
          duckstation: true,
          citra: true,
          aether: true,
          mupen: true,
        },
      });
    } else if (deviceName === "Android") {
      setState({
        ...state,
        device: deviceName,
        installEmus: {
          ra: true,
          dolphinmmjr: true,
          drastic: true,
          redream: true,
          yaba: true,
          ppsspp: true,
          duckstation: true,
          citra: true,
          aether: true,
          mupen: true,
        },
      });
    } else if (deviceName === "Steam Deck") {
      setState({
        ...state,
        device: deviceName,
        installEmus: {
          ra: true,
          dolphinmmjr: true,
          drastic: true,
          redream: true,
          yaba: true,
          ppsspp: true,
          duckstation: true,
          citra: true,
          aether: true,
          mupen: true,
        },
      });
    }
  };

  //Enabling button when changing the global state only if we have a device selected
  useEffect(() => {
    if (device != "") {
      setStatePage({ ...statePage, disabledNext: false });
    }
  }, [state]); // <-- here put the parameter to listen

  return <DeviceSelector />;
};

export default EmulatorSelectorPage;
