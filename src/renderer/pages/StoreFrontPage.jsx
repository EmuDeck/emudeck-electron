import React, { useEffect, useState, useContext } from 'react';
import { GlobalContext } from 'context/globalContext';
import Wrapper from 'components/molecules/Wrapper/Wrapper';
import Header from 'components/organisms/Header/Header';
import Footer from 'components/organisms/Footer/Footer';

import StoreFront from 'components/organisms/Wrappers/StoreFront';
import { Img, BtnSimple } from 'getbasecore/Atoms';
const StoreFrontPage = () => {
  const { state, setState } = useContext(GlobalContext);
  const { bezels } = state;
  const [statePage, setStatePage] = useState({
    disabledNext: false,
    disabledBack: false,
    data: '',
  });
  const { disabledNext, disabledBack, data } = statePage;

  //Enabling button when changing the global state only if we have a device selected
  useEffect(() => {
    if (bezels != '') {
      setStatePage({ ...statePage, disabledNext: false });
    }
  }, [state]); // <-- here put the parameter to listen

  return (
    <Wrapper>
      <Header title="" />
      <StoreFront
        data={data}
        disabledNext={disabledNext}
        disabledBack={disabledBack}
      />
      <footer className="footer">
        <BtnSimple
          css="btn-simple--1"
          type="button"
          aria="Go Back"
          disabled={false}
          onClick={() => navigate(-1)}
        >
          Go Back
        </BtnSimple>
      </footer>
    </Wrapper>
  );
};

export default StoreFrontPage;
