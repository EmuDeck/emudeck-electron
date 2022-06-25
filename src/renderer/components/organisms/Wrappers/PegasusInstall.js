import React, { useEffect, useState, useContext } from 'react';

import { GlobalContext } from 'context/globalContext';

import Footer from 'components/organisms/Footer/Footer.js';
import Header from 'components/organisms/Header/Header.js';
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
} from 'getbasecore/Atoms';

const PegasusInstall = () => {
  const { state, setState } = useContext(GlobalContext);
  const [statePage, setStatePage] = useState({
    disabledNext: false,
    disabledBack: false,
  });
  const { disabledNext, disabledBack } = statePage;

  return (
    <>
      {/*  <ExploreContainer name="Tab 1 page" /> */}
      <div className="app">
        <Aside />

        <div className="wrapper">
          <Header title="Let's install" bold="Pegasus" />
          <Main>
            <p className="lead">This is doing nothing, it's just the UI</p>
            <p>Downloading Pegasus</p>
            <ProgressBar type="indeterminate"></ProgressBar>
          </Main>
          <Footer
            back="RA-config"
            next="pegasus-theme"
            disabledNext={disabledNext}
            disabledBack={disabledBack}
          />
        </div>
      </div>
    </>
  );
};

export default PegasusInstall;
