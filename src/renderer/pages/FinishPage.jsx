import { useTranslation } from 'react-i18next';
import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Wrapper from 'components/molecules/Wrapper/Wrapper';
import Header from 'components/organisms/Header/Header';
import { basicHotkeys, basicHotkeysWin } from 'components/utils/images/hotkeys';
import Main from 'components/organisms/Main/Main';
import { BtnSimple } from 'getbasecore/Atoms';
import { GlobalContext } from 'context/globalContext';
import { yoshiMario, yoshi } from 'components/utils/images/gifs';

function FinishPage() {
  const { state, setState } = useContext(GlobalContext);
  const { system, second } = state;
  const navigate = useNavigate();
  useEffect(() => {
    const json = JSON.stringify(state);
    localStorage.setItem('settings_emudeck', json);
  }, []);

  return (
    <Wrapper aside={second === true}>
      <Header title={`What's left?<img src=${yoshi} alt="" />`} />
      <Main>
        <p className="lead">
          Now that you have placed your files in their proper place and selected
          a front-end, you may be asking yourself, what’s left?
        </p>
        <p className="lead">
          You can simply go back to Game Mode and get to retro-gaming!
        </p>
        <p className="lead">
          However, EmuDeck contains a large suite of features for you to check
          out. You may want to use the <strong>"Compression Tool"</strong> to
          compress your ROMs to save on space, or use the{' '}
          <strong>"Cloud Services"</strong> tool to add your favorite streaming
          services to your preferred front-end.
        </p>
        <p className="lead">
          There’s plenty to check out and explore in the application, but for
          now, your onboarding is complete,{' '}
          <strong>
            the EmuDeck developers sincerely hope you enjoy your experience
          </strong>
          !
        </p>
      </Main>
    </Wrapper>
  );
}

export default FinishPage;
