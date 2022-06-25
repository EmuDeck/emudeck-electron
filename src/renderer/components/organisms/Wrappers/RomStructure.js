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

const RomStorage = () => {
  const { state, setState } = useContext(GlobalContext);
  const { SDID, storage } = state;
  const [statePage, setStatePage] = useState({
    disabledNext: false,
    disabledBack: false,
    structureCreated: true,
  });
  const { disabledNext, disabledBack, structureCreated } = statePage;

  //Enabling button when changing the global state only if we have a device selected
  useEffect(() => {}, [state]); // <-- here put the parameter to listen

  return (
    <>
      {/*  <ExploreContainer name="Tab 1 page" /> */}
      <div className="app">
        <Aside />

        <div className="wrapper">
          <Header title="Rom Systems" bold="Structure" />
          <Main>
            {structureCreated === false && (
              <>
                <p>Creating folders</p>
                <ProgressBar type="indeterminate"></ProgressBar>
              </>
            )}

            {storage === "SD-Card" && structureCreated === true && (
              <>
                <p>
                  You'll have to copy your roms in this folder on your SD Card:
                </p>
                <ul class="folder-structure">
                  <li>
                    <strong>
                      {SDID}/Android/data/roms.pegasus.installer/files/
                    </strong>
                    <ul>
                      <li>gamecube/</li>
                      <li>genesis/</li>
                      <li>saturn/</li>
                      <li>snes/</li>
                      <li>...</li>
                    </ul>
                  </li>
                </ul>
              </>
            )}
            {storage === "Internal" && structureCreated === true && (
              <>
                <p>
                  You'll have to copy your roms in this folder on your internal
                  storage:
                </p>
                <ul class="folder-structure">
                  <li>
                    <strong>/roms/</strong>
                    <ul>
                      <li>gamecube/</li>
                      <li>genesis/</li>
                      <li>saturn/</li>
                      <li>snes/</li>
                      <li>...</li>
                    </ul>
                  </li>
                </ul>
              </>
            )}
            {storage && structureCreated === true && (
              <p>
                You can't use other folders because of Android Security measures
              </p>
            )}
          </Main>
          <Footer
            back="rom-storage"
            next="ra-bezels"
            disabledNext={disabledNext}
            disabledBack={disabledBack}
          />
        </div>
      </div>
    </>
  );
};

export default RomStorage;
