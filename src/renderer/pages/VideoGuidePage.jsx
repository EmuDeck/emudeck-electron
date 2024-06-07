import { useTranslation } from 'react-i18next';
import React, { useState, useRef, useEffect } from 'react';
import Wrapper from 'components/molecules/Wrapper/Wrapper';

import Header from 'components/organisms/Header/Header';
import Footer from 'components/organisms/Footer/Footer';

import VideoGuide from 'components/organisms/Wrappers/VideoGuide';

function VideoGuidePage() {
  const { t, i18n } = useTranslation();
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
    <Wrapper>
      <Header title="Emulation Showcase" />
      <VideoGuide onClick={changeMinute} minute={minute} />
      <Footer
        next={false}
        disabledNext={disabledNext}
        disabledBack={disabledBack}
      />
    </Wrapper>
  );
}

export default VideoGuidePage;
