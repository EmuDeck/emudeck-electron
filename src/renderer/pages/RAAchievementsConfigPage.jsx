import React, { useState, useContext, useRef, useEffect } from 'react';
import { GlobalContext } from 'context/globalContext';
import Wrapper from 'components/molecules/Wrapper/Wrapper';

import Header from 'components/organisms/Header/Header';
import Footer from 'components/organisms/Footer/Footer';

import RAAchievements from 'components/organisms/Wrappers/RAAchievements';

function RAAchievementsConfigPage() {
  const ipcChannel = window.electron.ipcRenderer;
  const { state, setState } = useContext(GlobalContext);
  const { achievements } = state;
  const [statePage, setStatePage] = useState({
    disabledNext: false,
    disabledBack: false,
    data: '',
    dom: undefined,
  });
  const modalDataConfig = null;
  const { disabledNext, disabledBack, data, dom } = statePage;
  const setAchievements = (data) => {
    if (data.target.name === 'user') {
      setState({
        ...state,
        achievements: { ...achievements, user: data.target.value },
      });
    } else {
      setState({
        ...state,
        achievements: { ...achievements, pass: data.target.value },
      });
    }
  };

  const setAchievementsHardCore = (data) => {
    setState({
      ...state,
      achievements: { ...achievements, hardcore: !achievements.hardcore },
    });
    if (!achievements.hardcore) {
      ipcChannel.sendMessage('emudeck', [
        `setHardcore|||RetroArch_retroAchievementsHardCoreOn`,
      ]);
    } else {
      ipcChannel.sendMessage('emudeck', [
        `setHardcore|||RetroArch_retroAchievementsHardCoreOff`,
      ]);
    }

    ipcChannel.once('setHardcore', (message) => {});
  };

  return (
    <div style={{ height: '100vh' }}>
      <Wrapper>
        <Header title="Configure RetroAchievements" />
        <RAAchievements
          data={data}
          disabledBack
          onChange={setAchievements}
          onToggle={setAchievementsHardCore}
          modalDataConfig={modalDataConfig}
        />
        <Footer
          next="welcome"
          nextText={achievements.token ? 'Continue' : 'Skip'}
          disabledNext={disabledNext}
          disabledBack={disabledBack}
        />
      </Wrapper>
    </div>
  );
}

export default RAAchievementsConfigPage;
