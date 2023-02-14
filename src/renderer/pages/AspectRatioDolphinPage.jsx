import React, { useEffect, useState, useContext } from 'react';
import { GlobalContext } from 'context/globalContext';
import Wrapper from 'components/molecules/Wrapper/Wrapper';
import Header from 'components/organisms/Header/Header';
import Footer from 'components/organisms/Footer/Footer';

import AspectRatioDolphin from 'components/organisms/Wrappers/AspectRatioDolphin';

const AspectRatioDolphinPage = () => {
  const { state, setState } = useContext(GlobalContext);
  const { ar, overwriteConfigEmus } = state;
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
        dolphin: arStatus,
      },
    });
  };

  return (
    <Wrapper>
      <Header title="Configure Aspect Ratio for the" bold="GameCube" />
      <AspectRatioDolphin data={data} onClick={arSet} />
      <Footer
        next={
          overwriteConfigEmus.ra.status == true
            ? 'shaders-handhelds'
            : 'pegasus-theme'
        }
        disabledNext={disabledNext}
        disabledBack={disabledBack}
      />
    </Wrapper>
  );
};

export default AspectRatioDolphinPage;
