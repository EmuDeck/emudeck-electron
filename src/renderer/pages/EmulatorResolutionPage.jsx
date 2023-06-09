import React, { useContext } from 'react';
import { GlobalContext } from 'context/globalContext';
import Wrapper from 'components/molecules/Wrapper/Wrapper';
import Header from 'components/organisms/Header/Header';
import Footer from 'components/organisms/Footer/Footer';

import EmulatorResolution from 'components/organisms/Wrappers/EmulatorResolution';

function EmulatorResolutionPage() {
  const { state, setState } = useContext(GlobalContext);
  const { resolutions, system } = state;

  const setResolution = (emulator, resolution) => {
    setState({
      ...state,
      resolutions: {
        ...resolutions,
        [emulator]: resolution,
      },
    });
  };

  return (
    <Wrapper>
      <Header title="Emulator Resolution" />
      <EmulatorResolution onClick={setResolution} />
      <Footer
        next={system === 'win32' ? 'game-mode' : 'confirmation'}
        nextText="Next"
      />
    </Wrapper>
  );
}

export default EmulatorResolutionPage;
