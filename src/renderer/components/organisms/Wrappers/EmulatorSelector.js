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

const DeviceSelector = () => {
  const { state, setState } = useContext(GlobalContext);
  const { device, installEmus } = state;

  const [statePage, setStatePage] = useState({
    disabledNext: false,
    disabledBack: false,
  });
  const { disabledNext, disabledBack } = statePage;

  const toggleEmus = (emu, stateEmu) => {
    // if (emu === "ra") {
    //   setState({
    //     ...state,
    //     installEmus: {
    //       ...installEmus,
    //       ra: state,
    //     },
    //   });
    // }

    for (const property in installEmus) {
      //console.log(`${property}: ${installEmus[property]}`);
      setState({
        ...state,
        installEmus: {
          ...installEmus,
          [emu]: stateEmu,
        },
      });

      console.log(`${property}: ${installEmus[property]}`);
    }
  };

  return (
    <>
      {/*  <ExploreContainer name="Tab 1 page" /> */}
      <div className="app">
        <Aside />

        <div className="wrapper">
          <Header title="Emulators for" bold={`${device}`} />
          <Main>
            <p className="lead">
              These are the recommended emulators we will install. Uncheck those
              that you already have installed. Go back to the selector screen if
              you need to start over.
            </p>
            <div>
              <ul className="list-two-cols">
                {installEmus.ra && (
                  <li>
                    <FormCheckboxSimple
                      defaultChecked
                      label="2D Systems - RetroArch"
                      id="2D Systems - RetroArch"
                      name="2D Systems - RetroArch"
                    />
                  </li>
                )}
                {installEmus.dolphinmmjr && (
                  <li>
                    <FormCheckboxSimple
                      defaultChecked
                      label="GameCube - Dolphin MMJR"
                      id="GameCube - Dolphin MMJR"
                      name="GameCube - Dolphin MMJR"
                      onClick={(e) =>
                        toggleEmus("dolphinmmjr", e.detail.defaultChecked)
                      }
                    />
                  </li>
                )}
                {installEmus.redream && (
                  <li>
                    <FormCheckboxSimple
                      defaultChecked
                      onClick={(e) =>
                        toggleEmus("redream", e.detail.defaultChecked)
                      }
                      label="Dreamcast - Redream"
                      id="Dreamcast - Redream"
                      name="Dreamcast - Redream"
                    />
                  </li>
                )}
                {installEmus.yaba && (
                  <li>
                    <FormCheckboxSimple
                      defaultChecked
                      label="Sega Saturn - Yaba Sanshiro 2"
                      id="Sega Saturn - Yaba Sanshiro 2"
                      name="Sega Saturn - Yaba Sanshiro 2"
                      onClick={(e) =>
                        toggleEmus("yaba", e.detail.defaultChecked)
                      }
                    />
                  </li>
                )}
                {installEmus.mupen && (
                  <li>
                    <FormCheckboxSimple
                      defaultChecked
                      label="Nintendo 64 - Mupen 64 Plus"
                      id="Nintendo 64 - Mupen 64 Plus"
                      name="Nintendo 64 - Mupen 64 Plus"
                      onClick={(e) =>
                        toggleEmus("mupen", e.detail.defaultChecked)
                      }
                    />
                  </li>
                )}
                {installEmus.drastic && (
                  <li>
                    <FormCheckboxSimple
                      defaultChecked
                      label="Nintendo DS - Drastic ( Paid )"
                      id="Nintendo DS - Drastic ( Paid )"
                      name="Nintendo DS - Drastic ( Paid )"
                      onClick={(e) =>
                        toggleEmus("drastic", e.detail.defaultChecked)
                      }
                    />
                  </li>
                )}
                {installEmus.citra && (
                  <li>
                    <FormCheckboxSimple
                      defaultChecked
                      label="Nintendo 3DS - Citra MMJR"
                      id="Nintendo 3DS - Citra MMJR"
                      name="Nintendo 3DS - Citra MMJR"
                      onClick={(e) =>
                        toggleEmus("citra", e.detail.defaultChecked)
                      }
                    />
                  </li>
                )}

                {installEmus.duckstation && (
                  <li>
                    <FormCheckboxSimple
                      defaultChecked
                      label="Sony Playstation - Duckstation"
                      id="Sony Playstation - Duckstation"
                      name="Sony Playstation - Duckstation"
                      onClick={(e) =>
                        toggleEmus("duckstation", e.detail.defaultChecked)
                      }
                    />
                  </li>
                )}
                {installEmus.aether && (
                  <li>
                    <FormCheckboxSimple
                      defaultChecked
                      label="Sony Playstation 2 - AetherSX"
                      id="Sony Playstation 2 - AetherSX"
                      name="Sony Playstation 2 - AetherSX"
                      onClick={(e) =>
                        toggleEmus("aether", e.detail.defaultChecked)
                      }
                    />
                  </li>
                )}
                {installEmus.ppsspp && (
                  <li>
                    <FormCheckboxSimple
                      defaultChecked
                      label="Sony PSP - PPSSPP"
                      id="Sony PSP - PPSSPP"
                      name="Sony PSP - PPSSPP"
                      onClick={(e) =>
                        toggleEmus("ppsspp", e.detail.defaultChecked)
                      }
                    />
                  </li>
                )}
              </ul>
            </div>
          </Main>
          <Footer
            back="device-selector"
            next="rom-storage"
            disabledNext={disabledNext}
            disabledBack={disabledBack}
          />
        </div>
      </div>
    </>
  );
};

export default DeviceSelector;
