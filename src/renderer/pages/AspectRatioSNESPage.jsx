import React, { useState, useContext } from 'react';
import { GlobalContext } from 'context/globalContext';
import Wrapper from 'components/molecules/Wrapper/Wrapper';
import Header from 'components/organisms/Header/Header';
import Footer from 'components/organisms/Footer/Footer';

import AspectRatioSNES from 'components/organisms/Wrappers/AspectRatioSNES';

function AspectRatioSNESPage() {
  const { state, setState } = useContext(GlobalContext);
  const { ar } = state;
  const [statePage] = useState({
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
        snes: arStatus,
      },
    });
  };

  return (
    <Wrapper>
      <Header title="Configure Aspect Ratio for Classic Nintendo" />
      <AspectRatioSNES data={data} onClick={arSet} />
      <Footer
        next="aspect-ratio-3d"
        disabledNext={disabledNext}
        disabledBack={disabledBack}
      />
    </Wrapper>
  );
}

export default AspectRatioSNESPage;
