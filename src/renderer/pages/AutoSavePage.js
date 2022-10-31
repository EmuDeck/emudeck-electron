import React, { useEffect, useState, useContext } from 'react';
import { GlobalContext } from 'context/globalContext';

import AutoSave from 'components/organisms/Wrappers/AutoSave.js';

const AutoSavePage = () => {
  const { state, setState } = useContext(GlobalContext);
  const { shaders } = state;
  const [statePage, setStatePage] = useState({
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
    <AutoSave
      data={data}
      onClick={autoSaveSet}
      disabledNext={disabledNext}
      disabledBack={disabledBack}
    />
  );
};

export default AutoSavePage;
