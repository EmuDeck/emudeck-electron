import React, { useEffect, useState, useContext } from "react";

import { GlobalContext } from "context/globalContext";

import Footer from "components/organisms/Footer/Footer.js";
import Header from "components/organisms/Header/Header.js";
import Aside from "components/organisms/Aside/Aside.js";
import Main from "components/organisms/Main/Main.js";

import imgBezels from "assets/bezels.png";
import imgNoBezels from "assets/no-bezels.png";

const RABezels = () => {
  const { state, setState } = useContext(GlobalContext);
  const { bezels } = state;
  const [statePage, setStatePage] = useState({
    disabledNext: true,
    disabledBack: false,
  });
  const { disabledNext, disabledBack } = statePage;
  const copyDir = () => {
    console.log("nah");
  };
  const bezelsSet = (bezelStatus) => {
    copyDir();
    setState({
      ...state,
      bezels: bezelStatus,
    });
  };
  //Enabling button when changing the global state only if we have a device selected
  useEffect(() => {
    if (bezels != "") {
      setStatePage({ ...statePage, disabledNext: false });
    }
  }, [state]); // <-- here put the parameter to listen

  return (
    <>
      {/*  <ExploreContainer name="Tab 1 page" /> */}
      <div className="app">
        <div className="wrapper">
          <Header title="Configure" bold="game bezels" />
          <Main>
            <p className="lead">
              You can use our preconfigured bezels to hide the vertical black
              vars on 8bit and 16bits games.
            </p>
            <div className="steps">
              <input
                type="radio"
                id="true"
                name="device"
                onChange={() => bezelsSet(true)}
              />
              <label for="true" className="step step--bezel">
                <div className="step-img">
                  <img src={imgBezels} alt="Background" />
                </div>
                <figcaption>Show Bezels</figcaption>
              </label>
              <input
                type="radio"
                id="false"
                name="device"
                onChange={() => bezelsSet(false)}
              />
              <label for="false" className="step step--bezel">
                <div className="step-img">
                  <img src={imgNoBezels} alt="Background" />
                </div>
                <figcaption>Show black borders</figcaption>
              </label>
            </div>
          </Main>
          <Footer
            back="rom-storage"
            next="pegasus-theme"
            disabledNext={disabledNext}
            disabledBack={disabledBack}
          />
        </div>
      </div>
    </>
  );
};

export default RABezels;
