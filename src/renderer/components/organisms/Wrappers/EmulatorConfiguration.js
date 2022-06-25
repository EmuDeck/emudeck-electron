import React, { useEffect, useState, useContext } from "react";

import { GlobalContext } from "context/globalContext";

import Footer from "components/organisms/Footer/Footer.js";
import Header from "components/organisms/Header/Header.js";
import Aside from "components/organisms/Aside/Aside.js";
import Main from "components/organisms/Main/Main.js";

import {
  BtnSimple,
  BtnGroup,
  BtnSwitch,
  Icon,
  LinkSimple,
  Img,
  Iframe,
  List,
  ProgressBar,
  FormInputSimple,
  FormSelectSimple,
  FormRadioSimple,
  FormCheckboxSimple,
  FormInputRangeSimple,
} from "getbasecore/Atoms";

const EmulatorConfiguration = () => {
  const { state, setState } = useContext(GlobalContext);
  const { installEmus } = state;
  const [statePage, setStatePage] = useState({
    disabledNext: false,
    disabledBack: false,
    downloads: {
      ra: true,
      dolphinmmjr: true,
      citra: true,
    },
  });
  const { disabledNext, disabledBack, downloads } = statePage;

  const emusApks = {
    ra: "https://buildbot.libretro.com/stable/1.9.14/android/RetroArch.apk",
    dolphinmmjr:
      "https://github.com/Bankaimaster999/Dolphin-MMJR/releases/download/1.0-11460/Dolphin.MMJR.v11460.apk",
    citra:
      "https://github.com/weihuoya/citra/releases/download/20220127/Citra_MMJ_20220127.apk",
  };

  const openDLFile = () => {
    console.log("nah");
  };

  const emusFiles = {
    ra: "RetroArch.apk",
    dolphinmmjr: "Dolphin.MMJR.v11460.apk",
    citra: "Citra_MMJ_20220127.apk",
  };

  return (
    <>
      {/*  <ExploreContainer name="Tab 1 page" /> */}
      <div className="app">
        <Aside />

        <div className="wrapper">
          <Header title="Let's install your" bold="emulators" />
          <Main>
            {/* Apk Emus */}
            {installEmus.ra && downloads.ra === false && (
              <>
                <p>Downloading 2D Systems - RetroArch </p>
                <ProgressBar type="indeterminate"></ProgressBar>
                <br />
              </>
            )}
            {installEmus.dolphinmmjr && downloads.dolphinmmjr === false && (
              <>
                <p>Downloading GameCube - Dolphin MMJR</p>
                <ProgressBar type="indeterminate"></ProgressBar>
                <br />
              </>
            )}
            {installEmus.citra && downloads.citra === false && (
              <>
                <p>Downloaing Nintendo 3DS - Citra MMJR</p>
                <ProgressBar type="indeterminate"></ProgressBar>
                <br />
              </>
            )}

            {/* PlayStore Emus */}
            {downloads.ra && downloads.dolphinmmjr && downloads.citra && (
              <div>
                {installEmus.ra && (
                  <BtnSimple
                    css="btn-simple--1"
                    type="button"
                    color="danger"
                    onClick={() => openDLFile(emusFiles.ra)}
                  >
                    Install RetroArch
                  </BtnSimple>
                )}
                {installEmus.dolphinmmjr && (
                  <BtnSimple
                    css="btn-simple--1"
                    type="button"
                    color="danger"
                    onClick={() => openDLFile(emusFiles.dolphinmmjr)}
                  >
                    Install Dolphin MMJR
                  </BtnSimple>
                )}
                {installEmus.citra && (
                  <BtnSimple
                    css="btn-simple--1"
                    type="button"
                    color="danger"
                    onClick={() => openDLFile(emusFiles.citra)}
                  >
                    Install Citra MMJR
                  </BtnSimple>
                )}
                {installEmus.redream && (
                  <BtnSimple css="btn-simple--1" type="button" color="danger">
                    Install Redream from PlayStore
                  </BtnSimple>
                )}
                {installEmus.yaba && (
                  <BtnSimple css="btn-simple--1" type="button" color="danger">
                    Install Yaba Sanshiro 2 from PlayStore
                  </BtnSimple>
                )}
                {installEmus.mupen && (
                  <BtnSimple css="btn-simple--1" type="button" color="danger">
                    Install Mupen 64 Plus from PlayStore
                  </BtnSimple>
                )}
                {installEmus.drastic && (
                  <BtnSimple css="btn-simple--1" type="button" color="danger">
                    Install Drastic ( Paid ) from PlayStore
                  </BtnSimple>
                )}

                {installEmus.duckstation && (
                  <BtnSimple css="btn-simple--1" type="button" color="danger">
                    Install Duckstation from PlayStore
                  </BtnSimple>
                )}
                {installEmus.aether && (
                  <BtnSimple css="btn-simple--1" type="button" color="danger">
                    Install AetherSX from PlayStore
                  </BtnSimple>
                )}
                {installEmus.ppsspp && (
                  <BtnSimple css="btn-simple--1" type="button" color="danger">
                    Install PPSSPP from PlayStore
                  </BtnSimple>
                )}
              </div>
            )}
          </Main>
          <Footer
            back="emulator-selector"
            next="rom-storage"
            disabledNext={disabledNext}
            disabledBack={disabledBack}
          />
        </div>
      </div>
    </>
  );
};

export default EmulatorConfiguration;
