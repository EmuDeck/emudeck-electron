import { useState } from 'react';
import { useGlobalContext } from 'context/globalContext';

import AspectRatioDolphin from 'components/organisms/Wrappers/AspectRatioDolphin.js';

const AspectRatioDolphinPage = () => {
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
        dolphin: arStatus,
      },
    });
  };

  return (
    <AspectRatioDolphin
      data={data}
      onClick={arSet}
      disabledNext={disabledNext}
      disabledBack={disabledBack}
    />
  );
};

export default AspectRatioDolphinPage;
