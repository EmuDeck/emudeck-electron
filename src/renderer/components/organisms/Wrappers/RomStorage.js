import React, { useEffect, useState, useContext } from "react";
import { GlobalContext } from "context/globalContext";

import Footer from "components/organisms/Footer/Footer.js";
import Header from "components/organisms/Header/Header.js";
import Aside from "components/organisms/Aside/Aside.js";
import Main from "components/organisms/Main/Main.js";

import imgSD from "assets/sdcard.png";
import imgInternal from "assets/internal.png";

const RomStorage = () => {
  const { state, setState } = useContext(GlobalContext);
  const { storage, SDID } = state;
  const [statePage, setStatePage] = useState({
    disabledNext: true,
    disabledBack: false,
  });
  const { disabledNext, disabledBack } = statePage;

  const storageSet = (storageName) => {
    setState({
      ...state,
      storage: storageName,
    });
  };
  //Enabling button when changing the global state only if we have a device selected
  useEffect(() => {
    if (storage != "") {
      setStatePage({ ...statePage, disabledNext: false });
    }
  }, [state]); // <-- here put the parameter to listen

  const getSDCardName = async () => {
    return "deck";
  };
  return (
    <>
      {/*  <ExploreContainer name="Tab 1 page" /> */}
      <div className="app">
        <Aside />

        <div className="wrapper">
          <Header title="Choose your" bold="ROMs Storage" />
          <Main>
            <p className="lead">Where do you want to store your roms?</p>
            <div className="steps">
              <input
                type="radio"
                id="sdCard"
                name="storage"
                onChange={() => storageSet("SD-Card")}
              />
              <label
                for="sdCard"
                className="step step--device"
                onClick={() => getSDCardName()}
              >
                <div className="step-img">
                  <img src={imgSD} width="100" alt="Background" />
                </div>
                <figcaption>
                  SD Card
                  <br />
                  {SDID}
                </figcaption>
              </label>
              <input
                type="radio"
                id="internal"
                name="storage"
                onChange={() => storageSet("Internal")}
              />
              <label for="internal" className="step step--device">
                <div className="step-img">
                  <img src={imgInternal} width="100" alt="Background" />
                </div>
                <figcaption>Internal Storage</figcaption>
              </label>
            </div>
          </Main>
          <Footer
            back="emulator-configuration"
            next="rom-structure"
            disabledNext={disabledNext}
            disabledBack={disabledBack}
          />
        </div>
      </div>
    </>
  );
};

export default RomStorage;
