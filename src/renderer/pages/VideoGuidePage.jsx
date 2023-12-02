import React, { useState, useRef, useEffect } from 'react';
import Wrapper from 'components/molecules/Wrapper/Wrapper';
import GamePad from 'components/organisms/GamePad/GamePad';
import Header from 'components/organisms/Header/Header';
import Footer from 'components/organisms/Footer/Footer';

import VideoGuide from 'components/organisms/Wrappers/VideoGuide';

function VideoGuidePage() {
  const [statePage, setStatePage] = useState({
    disabledNext: false,
    disabledBack: false,
    showNotification: false,
    minute: 0,
    dom: undefined,
  });
  const { disabledNext, disabledBack, minute, dom } = statePage;

  const changeMinute = (value) => {
    setStatePage({
      minute: value,
    });
  };



  return (
    <div style={{ height: '100vh' }} >
      
      <Wrapper>
        <Header title="Emulation Showcase" />
        <VideoGuide onClick={changeMinute} minute={minute} />
        <Footer
          next={false}
          disabledNext={disabledNext}
          disabledBack={disabledBack}
        />
      </Wrapper>
    </div>
  );
}

export default VideoGuidePage;
