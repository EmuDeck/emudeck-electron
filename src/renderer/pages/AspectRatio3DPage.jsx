import React, { useState, useContext } from 'react';
import { GlobalContext } from 'context/globalContext';
import Wrapper from 'components/molecules/Wrapper/Wrapper';
import Header from 'components/organisms/Header/Header';
import Footer from 'components/organisms/Footer/Footer';

import AspectRatio3D from 'components/organisms/Wrappers/AspectRatio3D';

const AspectRatio3DPage = () => {
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
        classic3d: arStatus,
      },
    });
  };

  return (
    <Wrapper>
      <Header title="Configure Aspect Ratio for" bold="Classic 3D Games" />
      <AspectRatio3D data={data} onClick={arSet} />
      <Footer
        next="aspect-ratio-dolphin"
        disabledNext={disabledNext}
        disabledBack={disabledBack}
      />
    </Wrapper>
  );
};

export default AspectRatio3DPage;
