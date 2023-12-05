import React, { useState, useContext, useRef, useEffect } from 'react';
import { GlobalContext } from 'context/globalContext';
import Wrapper from 'components/molecules/Wrapper/Wrapper';
import GamePad from 'components/organisms/GamePad/GamePad';
import Header from 'components/organisms/Header/Header';
import Footer from 'components/organisms/Footer/Footer';

import AspectRatioDolphin from 'components/organisms/Wrappers/AspectRatioDolphin';

function AspectRatioDolphinPage() {
  const { state, setState } = useContext(GlobalContext);
  const { ar, overwriteConfigEmus } = state;
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
        dolphin: arStatus,
      },
    });
  };



  return (
    <div style={{ height: '100vh' }} >
      
      <Wrapper>
        <Header title="Configure Aspect Ratio for GameCube games" />
        <AspectRatioDolphin data={data} onClick={arSet} />
        <Footer
          next={
            overwriteConfigEmus.ra.status === true
              ? 'shaders-handhelds'
              : 'frontend-selector'
          }
          disabledNext={disabledNext}
          disabledBack={disabledBack}
        />
      </Wrapper>
    </div>
  );
}

export default AspectRatioDolphinPage;
