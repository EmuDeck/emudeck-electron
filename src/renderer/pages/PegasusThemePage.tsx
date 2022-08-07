import { useEffect, useState } from 'react';
import { useGlobalContext } from 'context/globalContext';

import PegasusTheme from 'components/organisms/Wrappers/PegasusTheme.js';

const PegasusThemePage = () => {
  const { state, setState } = useGlobalContext();
  const [statePage, setStatePage] = useState({
    disabledNext: false,
    disabledBack: false,
    data: '',
  });
  const { disabledNext, disabledBack, data } = statePage;
  const themeSet = (themeName: string) => {
    setState({
      ...state,
      theme: themeName,
    });
  };

  return (
    <PegasusTheme
      data={data}
      onClick={themeSet}
      disabledNext={disabledNext}
      disabledBack={disabledBack}
    />
  );
};

export default PegasusThemePage;
