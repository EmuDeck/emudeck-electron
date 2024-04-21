import { useTranslation } from 'react-i18next';
import React, { useState, useContext, useRef, useEffect } from 'react';
import { GlobalContext } from 'context/globalContext';
import Wrapper from 'components/molecules/Wrapper/Wrapper';

import Header from 'components/organisms/Header/Header';
import Footer from 'components/organisms/Footer/Footer';

import AutoSave from 'components/organisms/Wrappers/AutoSave';

function AutoSavePage() {
const { t, i18n } = useTranslation();
  const { state, setState } = useContext(GlobalContext);
  const [statePage] = useState({
    disabledNext: false,
    disabledBack: false,
    data: '',
    dom: undefined,
  });
  const { disabledNext, disabledBack, data, dom } = statePage;
  const autoSaveSet = (shaderStatus) => {
    setState({
      ...state,
      autosave: shaderStatus,
    });
  };

  return (
    <div style={{ height: '100vh' }}>
      <Wrapper>
        <Header title="Configure Auto Save" />
        <AutoSave data={data} onClick={autoSaveSet} />
        <Footer
          next="ra-achievements"
          disabledNext={disabledNext}
          disabledBack={disabledBack}
        />
      </Wrapper>
    </div>
  );
}

export default AutoSavePage;
