import { useState } from 'react';
import { useGlobalContext } from 'context/globalContext';

import AspectRatioSNES from 'components/organisms/Wrappers/AspectRatioSNES.js';

const AspectRatioSNESPage = () => {
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
        snes: arStatus,
      },
    });
  };

  return (
    <AspectRatioSNES
      data={data}
      onClick={arSet}
      disabledNext={disabledNext}
      disabledBack={disabledBack}
    />
  );
};

export default AspectRatioSNESPage;
