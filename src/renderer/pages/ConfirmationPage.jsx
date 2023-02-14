import React, { useEffect, useState, useContext } from 'react';
import { GlobalContext } from 'context/globalContext';
import Wrapper from 'components/molecules/Wrapper/Wrapper';
import Header from 'components/organisms/Header/Header';
import Footer from 'components/organisms/Footer/Footer';

import Confirmation from 'components/organisms/Wrappers/Confirmation';

const ConfirmationPage = () => {
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
      <Header title="Here's what we'll do" />
      <Confirmation data={data} />
      <Footer
        next="end"
        nextText="Finish"
        disabledNext={disabledNext}
        disabledBack={disabledBack}
      />
    </Wrapper>
  );
};

export default ConfirmationPage;
