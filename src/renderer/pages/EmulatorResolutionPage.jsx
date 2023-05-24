import React, { useEffect, useState, useContext } from 'react';
import { GlobalContext } from 'context/globalContext';
import Wrapper from 'components/molecules/Wrapper/Wrapper';
import Header from 'components/organisms/Header/Header';
import Footer from 'components/organisms/Footer/Footer';

import EmulatorResolution from 'components/organisms/Wrappers/EmulatorResolution';

function EmulatorResolutionPage() {
  const { state, setState } = useContext(GlobalContext);
  const { bezels, resolutions } = state;
  const [statePage, setStatePage] = useState({
    disabledNext: false,
    disabledBack: false,
    data: '',
  });
  const { disabledNext, disabledBack, data } = statePage;
  const setResolution = (emulator, resolution) => {
    setState({
      ...state,
      resolutions: {
        ...resolutions,
        [emulator]: resolution,
      },
    });
  };
  // Enabling button when changing the global state only if we have a device selected
  useEffect(() => {
    if (bezels != '') {
      setStatePage({ ...statePage, disabledNext: false });
    }
  }, [state]); 

  return (
    <Wrapper>
      <Header title="Emulator Resolution" />
      <EmulatorResolution data={data} onClick={setResolution} />
      <Footer next="confirmation" nextText="Next" />
    </Wrapper>
  );
}

export default EmulatorResolutionPage;
