import React, { useEffect, useState } from 'react';
import { useGlobalContext } from 'context/globalContext';
import type { EmuConfigKeys } from 'context/index';
import EmulatorConfiguration from 'components/organisms/Wrappers/EmulatorConfiguration.js';

const EmulatorConfigurationPage = () => {
  const { state, setState } = useGlobalContext();
  const { device, overwriteConfigEmus } = state;

  const [statePage, setStatePage] = useState({
    disabledNext: false,
    disabledBack: false,
    data: '',
  });
  const { disabledNext, disabledBack, data } = statePage;

  const toggleEmus = (emulatorProp: EmuConfigKeys) => {
    const { id, name, status } = overwriteConfigEmus[emulatorProp];

    setState({
      ...state,
      overwriteConfigEmus: {
        ...overwriteConfigEmus,
        [emulatorProp]: {
          ...overwriteConfigEmus[emulatorProp],
          status: !status,
        },
      },
    });
  };

  return (
    <EmulatorConfiguration
      data={data}
      onClick={toggleEmus}
      disabledNext={disabledNext}
      disabledBack={disabledBack}
    />
  );
};

export default EmulatorConfigurationPage;
