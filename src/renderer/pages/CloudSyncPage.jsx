import React, { useState, useContext } from 'react';
import { GlobalContext } from 'context/globalContext';
import Wrapper from 'components/molecules/Wrapper/Wrapper';
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
  });
  const { disabledNext, disabledBack, disableButton } = statePage;

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
      ? mode === 'easy'
        ? 'end'
        : 'emulator-selector'
      : `cloud-sync-config/${type}`;
  };

  return (
    <Wrapper>
      <Header title="Cloud Saves" />
      <CloudSync
        onClick={cloudSyncSet}
        disableButton={disableButton}
        showNone={type !== 'welcome'}
      />
      <Footer
        next={nextButtonStatus()}
        nextText={
          cloudSyncType === 'none'
            ? mode === 'easy'
              ? 'Finish'
              : 'Next'
            : 'Next'
        }
        disabledNext={disabledNext}
        disabledBack={disabledBack}
      />
    </Wrapper>
  );
}

export default CloudSyncPage;
