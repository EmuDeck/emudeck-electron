import React, { useEffect, useState, useContext } from 'react';
import { GlobalContext } from 'context/globalContext';

import AspectRatio3D from 'components/organisms/Wrappers/AspectRatio3D';

const AspectRatio3DPage = () => {
  const { state, setState } = useContext(GlobalContext);
  const { ar } = state;
  const [statePage, setStatePage] = useState({
    disabledNext: false,
    disabledBack: false,
    data: '',
  });
  const { disabledNext, disabledBack, data } = statePage;
  const arSet = (arStatus) => {
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
