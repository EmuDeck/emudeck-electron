import { useState, useEffect } from 'react';
import { useGlobalContext } from 'context/globalContext';

import AspectRatio2D from 'components/organisms/Wrappers/AspectRatio2D.js';

const AspectRatio2DPage = () => {
  const { state, setState } = useGlobalContext();
  const { bezels } = state;
  const [statePage, setStatePage] = useState({
    disabledNext: true,
    disabledBack: false,
  });
  const { disabledNext, disabledBack } = statePage;
  const copyDir = () => console.log('nah');

  // Enabling button when changing the global state only if we have a device selected
  useEffect(() => {
    if (bezels) {
      setStatePage({ ...statePage, disabledNext: false });
    }
  }, [state]); // <-- here put the parameter to listen

  const bezelsSet = (bezelStatus: boolean) => {
    copyDir();
    setState({
      ...state,
      bezels: bezelStatus,
    });
  };

  return (
    <AspectRatio2D disabledNext={disabledNext} disabledBack={disabledBack} />
  );
};

export default AspectRatio2DPage;
