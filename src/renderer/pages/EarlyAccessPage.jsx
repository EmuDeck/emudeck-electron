import { useTranslation } from 'react-i18next';
import Wrapper from 'components/molecules/Wrapper/Wrapper';
import Header from 'components/organisms/Header/Header';
import Footer from 'components/organisms/Footer/Footer';
import Main from 'components/organisms/Main/Main';
import Card from 'components/molecules/Card/Card';
import { BtnSimple } from 'getbasecore/Atoms';

function EarlyAccessPage() {
  const { t, i18n } = useTranslation();
  return (
    <Wrapper>
      <Header title={t('EarlyAccessPage.title')} />
      <p className="lead">{t('EarlyAccessPage.description')}</p>
      <Main>
        <div className="container--grid">
          <div data-col-sm="2"></div>
          <div data-col-sm="4">
            <Card css="is-selected card--image">
              <img
                src="https://c10.patreonusercontent.com/4/patreon-media/p/reward/8177551/ddb4b46ac6364051bb421679e918504e/eyJ3Ijo0MDB9/2.png?token-time=2145916800&token-hash=IBIc0gRiCjKYoLoBXJBXN8xi1gu-drm2UKB6SSDdtGs%3D"
                alt="Keep up the Work"
              />
              <span className="h4">Early Access</span>
              <span className="h5">3€/{t('general.month')}</span>
              <BtnSimple
                css="btn-simple--2"
                type="link"
                target="_blank"
                href="https://www.patreon.com/checkout/dragoonDorise?rid=8177551"
                aria={t('general.next')}
              >
                {t('general.join')}
              </BtnSimple>
              <span></span>
              <BtnSimple
                css="btn-simple--2"
                type="link"
                target="_blank"
                href="https://www.patreon.com/posts/early-access-70000718"
                aria={t('general.next')}
              >
                {t('general.install')}
              </BtnSimple>
              <p>{t('EarlyAccessPage.eaTier.description')}</p>
              <ul
                className="list"
                dangerouslySetInnerHTML={{
                  __html: t('EarlyAccessPage.eaTier.list'),
                }}
              />
            </Card>
          </div>
          <div data-col-sm="4">
            <Card css="is-selected card--image">
              <img
                src="https://c10.patreonusercontent.com/4/patreon-media/p/reward/8681416/3c5aa559e51c41f89b0fe48ea1e01318/eyJ3Ijo0MDB9/2.png?token-time=2145916800&token-hash=wMOmBQQnP02K1L6iOHDX0mLF9p0cbzuePcQVLlNSF2I%3D"
                alt="Keep up the Work"
              />
              <span className="h4">EmuDeck Fan</span>
              <span className="h5">10€/{t('general.month')}</span>
              <BtnSimple
                css="btn-simple--2"
                type="link"
                target="_blank"
                href="https://www.patreon.com/checkout/dragoonDorise?rid=8681416"
                aria={t('general.next')}
              >
                {t('general.join')}
              </BtnSimple>
              <span></span>
              <BtnSimple
                css="btn-simple--2"
                type="link"
                target="_blank"
                href="https://www.patreon.com/posts/early-access-70000718"
                aria={t('general.next')}
              >
                {t('general.install')}
              </BtnSimple>
              <p>{t('EarlyAccessPage.fanTier.description')}</p>
              <ul
                className="list"
                dangerouslySetInnerHTML={{
                  __html: t('EarlyAccessPage.fanTier.list'),
                }}
              />
            </Card>
          </div>
        </div>
      </Main>
      <Footer nextText="Exit" next="emulators" />
    </Wrapper>
  );
}

export default EarlyAccessPage;
