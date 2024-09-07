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
  const { t, i18n } = useTranslation();
  const { state, setState } = useContext(GlobalContext);
  const { system, second } = state;
  const navigate = useNavigate();
  useEffect(() => {
    const json = JSON.stringify(state);
    localStorage.setItem('settings_emudeck', json);
  }, []);

  return (
    <Wrapper aside={second === true}>
      <Header
        title={`${t(
          'FinishPage.title'
        )}<img src=${yoshi} style="width:30px" alt="" />`}
      />
      <Main>
        <p className="lead">
          {t('FinishPage.line1')}
          <br />
          {t('FinishPage.line2')}
          <br />
          {t('FinishPage.line3')}
          <br />
          {t('FinishPage.line4')}
          <strong>{t('FinishPage.line5')}</strong>
        </p>
      </Main>
    </Wrapper>
  );
}

export default FinishPage;
