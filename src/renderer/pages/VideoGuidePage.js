import React, { useEffect, useState, useContext } from 'react';
import { GlobalContext } from 'context/globalContext';

import VideoGuide from 'components/organisms/Wrappers/VideoGuide.js';

const VideoGuidePage = () => {
  const { state, setState } = useContext(GlobalContext);

  const [statePage, setStatePage] = useState({
    disabledNext: false,
    disabledBack: false,
    showNotification: false,
    minute: 0,
  });
  const { disabledNext, disabledBack, minute } = statePage;

  const changeMinute = (minute) => {
    setStatePage({
      minute: minute,
    });
  };

  return (
    <VideoGuide
      disabledNext={disabledNext}
      disabledBack={disabledBack}
      onClick={changeMinute}
      minute={minute}
    />
  );
};

export default VideoGuidePage;
