import React, { useState, useContext } from 'react';
import { GlobalContext } from 'context/globalContext';
import Wrapper from 'components/molecules/Wrapper/Wrapper';
import Header from 'components/organisms/Header/Header';
import Footer from 'components/organisms/Footer/Footer';

import AutoSave from 'components/organisms/Wrappers/AutoSave';

function AutoSavePage() {
  const { state, setState } = useContext(GlobalContext);
  const [statePage] = useState({
    disabledNext: false,
    disabledBack: false,
    data: '',
  });
  const { disabledNext, disabledBack, data } = statePage;
  const autoSaveSet = (shaderStatus) => {
    setState({
      ...state,
      autosave: shaderStatus,
    });
  };

  return (
    <Wrapper>
      <Header title="Configure Auto Save" />
      <AutoSave data={data} onClick={autoSaveSet} />
      <Footer
        next="ra-achievements"
        disabledNext={disabledNext}
        disabledBack={disabledBack}
      />
    </Wrapper>
  );
}

export default AutoSavePage;
