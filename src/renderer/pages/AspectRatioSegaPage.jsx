import React, { useState, useContext, useRef, useEffect } from 'react';
import { GlobalContext } from 'context/globalContext';
import Wrapper from 'components/molecules/Wrapper/Wrapper';

import Header from 'components/organisms/Header/Header';
import Footer from 'components/organisms/Footer/Footer';

import AspectRatioSega from 'components/organisms/Wrappers/AspectRatioSega';

function AspectRatioSegaPage() {
  const { state, setState } = useContext(GlobalContext);
  const { ar } = state;
  const [statePage] = useState({
    disabledNext: false,
    disabledBack: false,
    data: '',
    dom: undefined,
  });
  const { disabledNext, disabledBack, data, dom } = statePage;
  const arSet = (arStatus) => {
    setState({
      ...state,
      ar: {
        ...ar,
        sega: arStatus,
      },
    });
  };



  return (
    <div style={{ height: '100vh' }} >
      
      <Wrapper>
        <Header title="Configure Aspect Ratio for Classic Sega Systems" />
        <AspectRatioSega
          data={data}
          onClick={arSet}
          disabledNext={disabledNext}
          disabledBack={disabledBack}
        />
        <Footer
          next="aspect-ratio-snes"
          disabledNext={disabledNext}
          disabledBack={disabledBack}
        />
      </Wrapper>
    </div>
  );
}

export default AspectRatioSegaPage;
