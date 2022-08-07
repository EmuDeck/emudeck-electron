import { useEffect, useState } from 'react';
// import { useGlobalContext } from 'context/globalContext';

import PegasusInstall from 'components/organisms/Wrappers/PegasusInstall.js';

const PegasusInstallPage = () => {
  // const { state, setState } = useGlobalContext();
  const [statePage, setStatePage] = useState({
    disabledNext: false,
    disabledBack: false,
    data: '',
  });
  const { disabledNext, disabledBack, data } = statePage;

  return (
    <PegasusInstall
      data={data}
      disabledNext={disabledNext}
      disabledBack={disabledBack}
    />
  );
};

export default PegasusInstallPage;
