import { useTranslation } from 'react-i18next';
import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Wrapper from 'components/molecules/Wrapper/Wrapper';
import Header from 'components/organisms/Header/Header';
import { basicHotkeys, basicHotkeysWin } from 'components/utils/images/hotkeys';
import Main from 'components/organisms/Main/Main';
import { BtnSimple } from 'getbasecore/Atoms';
import { GlobalContext } from 'context/globalContext';

function Hotkeys() {
  const { t, i18n } = useTranslation();
  const { state, setState } = useContext(GlobalContext);
  const { system, second } = state;
  const navigate = useNavigate();
  useEffect(() => {
    if (second) {
      navigate('/finish');
    }
  }, [second]);

  return (
    <Wrapper aside={second === true}>
      <Header title={t('HotkeysPage.title')} />
      <p className="lead">{t('HotkeysPage.description')}</p>
      <Main>
        <div className="container--grid">
          <div data-col-sm="9">
            {system === 'win32' && <img src={basicHotkeysWin} alt="Hotkeys" />}
            {system !== 'win32' && <img src={basicHotkeys} alt="Hotkeys" />}
          </div>
        </div>
      </Main>
      <footer className="footer">
        <BtnSimple
          css="btn-simple--1"
          type="button"
          aria={t('general.finish')}
          onClick={() => {
            setState({ ...state, second: true });
          }}
        >
          {t('general.finish')}
        </BtnSimple>
      </footer>
    </Wrapper>
  );
}

export default Hotkeys;
