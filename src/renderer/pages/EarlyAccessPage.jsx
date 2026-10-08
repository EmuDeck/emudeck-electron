import { useTranslation } from 'react-i18next';
import Wrapper from 'components/molecules/Wrapper/Wrapper';
import Header from 'components/organisms/Header/Header';
import Footer from 'components/organisms/Footer/Footer';
import Main from 'components/organisms/Main/Main';
import EarlyAccessTiers from 'components/organisms/EarlyAccessTiers/EarlyAccessTiers';
import { BtnSimple } from 'getbasecore/Atoms';

function EarlyAccessPage() {
  const { t, i18n } = useTranslation();
  return (
    <Wrapper>
      <Header />
      <Main>
        <div className="container--grid">
          <div data-col-sm="8">
            <h1 className="h2">{t('EarlyAccessPage.title')}</h1>
            <p className="lead">{t('EarlyAccessPage.description')}</p>
            <BtnSimple
              css="btn-simple--6"
              type="link"
              target="_blank"
              href="https://www.patreon.com/checkout/dragoonDorise?rid=8177551"
              aria={t('PatroenLoginPage.joinPatreon')}
            >
              {t('PatroenLoginPage.joinPatreon')}
            </BtnSimple>
          </div>
          <div data-col-sm="4">
            <EarlyAccessTiers />
          </div>
        </div>
      </Main>
      <Footer nextText={t('EarlyAccessPage.exit')} next="emulators" />
    </Wrapper>
  );
}

export default EarlyAccessPage;
