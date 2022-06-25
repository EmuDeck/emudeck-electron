import React, { useEffect, useState, useContext } from "react";
import { GlobalContext } from "context/globalContext";

import Footer from "components/organisms/Footer/Footer.js";
import Header from "components/organisms/Header/Header.js";
import Aside from "components/organisms/Aside/Aside.js";
import Main from "components/organisms/Main/Main.js";

import img552 from "assets/rg552.png";
import imgOdin from "assets/odin.png";
import imgRP2 from "assets/rp2.png";
import imgAndroid from "assets/android.png";
import imgDeck from "assets/deck.png";

const EmulatorSelector = () => {
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

  return (
    <>
      {/*  <ExploreContainer name="Tab 1 page" /> */}
      <div className="app">
        <Aside />

        <div className="wrapper">
          <Header title="Choose your" bold="device" />
          <Main>
            <p className="lead">
              We tailor the experience depending of the selected device, each
              device has its own special configuration, different emulators and
              adjusted bezels.
            </p>

            <div className="steps">
              <input
                type="radio"
                id="rg552"
                name="device"
                onChange={() => deviceSet("RG552")}
              />

              <label htmlFor="rg552" className="step step--device">
                <div className="step-img">
                  <img src={img552} width="100" alt="Background" />
                </div>
                <figcaption>Anbernic RG552</figcaption>
              </label>
              <input
                type="radio"
                id="odin"
                name="device"
                onChange={() => deviceSet("Odin")}
              />

              <label htmlFor="odin" className="step step--device">
                <div className="step-img">
                  <img src={imgOdin} width="100" alt="Background" />
                </div>
                <figcaption>AYN Odin</figcaption>
              </label>
              <input
                type="radio"
                id="rp2"
                name="device"
                onChange={() => deviceSet("RP2")}
              />

              <label htmlFor="rp2" className="step step--device">
                <div className="step-img">
                  <img src={imgRP2} width="100" alt="Background" />
                </div>
                <figcaption>Retroid Pocket 2+</figcaption>
              </label>
              <input
                type="radio"
                id="android"
                name="device"
                onChange={() => deviceSet("Android")}
              />

              <label htmlFor="android" className="step step--device">
                <div className="step-img">
                  <img src={imgAndroid} width="100" alt="Background" />
                </div>
                <figcaption>Other Android</figcaption>
              </label>

              <input
                type="radio"
                id="deck"
                name="device"
                onChange={() => deviceSet("Steam Deck")}
              />

              <label htmlFor="deck" className="step step--device">
                <div className="step-img">
                  <img src={imgDeck} width="100" alt="Background" />
                </div>
                <figcaption>Steam Deck</figcaption>
              </label>
            </div>
          </Main>
          <Footer
            back="welcome"
            next="emulator-selector"
            disabledNext={disabledNext}
            disabledBack={disabledBack}
          />
        </div>
      </div>
    </>
  );
};

export default EmulatorSelector;
