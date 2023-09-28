import React, { useState, useContext, useRef, useEffect } from 'react';
import { GlobalContext } from 'context/globalContext';
import Wrapper from 'components/molecules/Wrapper/Wrapper';
import GamePad from 'components/organisms/GamePad/GamePad';
import Header from 'components/organisms/Header/Header';
import Footer from 'components/organisms/Footer/Footer';
import { useParams } from 'react-router-dom';
import CloudSync from 'components/organisms/Wrappers/CloudSync';

function CloudSyncPage() {
  const { state, setState } = useContext(GlobalContext);
  const { type } = useParams();
  const { cloudSyncType, mode } = state;
  const [statePage] = useState({
    disabledNext: false,
    disabledBack: false,
    disableButton: false,
    dom: undefined,
  });
  const { disabledNext, disabledBack, disableButton, dom } = statePage;

  const cloudSyncSet = (item) => {
    setState({
      ...state,
      cloudSyncType: item,
    });
  };
  const nextButtonStatus = () => {
    if (type === 'welcome') {
      return cloudSyncType === 'none' ? false : `cloud-sync-config/${type}`;
    }
    return cloudSyncType === 'none'
      ? 'copy-games'
      : `cloud-sync-config/${type}`;
  };

  //GamePad
  const domElementsRef = useRef(null);
  const domElementsCur = domElementsRef.current;
  let domElements;
  useEffect(() => {
    if (domElementsCur && dom === undefined) {
      domElements = domElementsCur.querySelectorAll('button');
      setStatePage({ ...statePage, dom: domElements });
    }
  }, [statePage]);

  return (
    <div style={{ height: '100vh' }} ref={domElementsRef}>
      {dom !== undefined && <GamePad elements={dom} />}
      <Wrapper>
        <Header title="Cloud Saves" />
        <CloudSync
          onClick={cloudSyncSet}
          disableButton={disableButton}
          showNone={type !== 'welcome'}
        />

        <Footer
          next={nextButtonStatus()}
          nextText={cloudSyncType === 'none' ? 'Copy Games' : 'Next'}
          disabledNext={disabledNext}
          disabledBack={type !== 'welcome'}
        />
      </Wrapper>
    </div>
  );
}

export default CloudSyncPage;
