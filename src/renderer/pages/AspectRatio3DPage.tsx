import { useState } from 'react';
import { useGlobalContext } from 'context/globalContext';

import AspectRatio3D from 'components/organisms/Wrappers/AspectRatio3D.js';

const AspectRatio3DPage = () => {
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
        classic3d: arStatus,
      },
    });
  };

  return (
    <AspectRatio3D
      data={data}
      onClick={arSet}
      disabledNext={disabledNext}
      disabledBack={disabledBack}
    />
  );
};

export default AspectRatio3DPage;
