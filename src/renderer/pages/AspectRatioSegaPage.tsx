import { useState } from 'react';
import { useGlobalContext } from 'context/globalContext';

import AspectRatioSega from 'components/organisms/Wrappers/AspectRatioSega.js';

const AspectRatioSegaPage = () => {
  const { state, setState } = useGlobalContext();
  const { ar } = state;
  const [statePage, setStatePage] = useState({
    disabledNext: false,
    disabledBack: false,
    data: '',
  });
  const { disabledNext, disabledBack, data } = statePage;
  const arSet = (arStatus: string) => {
    setState({
      ...state,
      ar: {
        ...ar,
        sega: arStatus,
      },
    });
  };

  return (
    <AspectRatioSega
      data={data}
      onClick={arSet}
      disabledNext={disabledNext}
      disabledBack={disabledBack}
    />
  );
};

export default AspectRatioSegaPage;
