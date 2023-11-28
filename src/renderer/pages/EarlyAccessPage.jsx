import Wrapper from 'components/molecules/Wrapper/Wrapper';
import Header from 'components/organisms/Header/Header';
import Footer from 'components/organisms/Footer/Footer';
import Main from 'components/organisms/Main/Main';
import Card from 'components/molecules/Card/Card';
import { BtnSimple } from 'getbasecore/Atoms';

function EarlyAccessPage() {
  return (
    <Wrapper>
      <Header title="Pick your subscription" />
      <Main>
        <div className="container--grid">
          <div data-col-sm="4">
            <Card css="is-selected card--image">
              <img
                src="https://c10.patreonusercontent.com/4/patreon-media/p/reward/8177547/d25d1d8a63be4156bb9674e1ec648742/eyJ3Ijo0MDB9/2.png?token-time=2145916800&token-hash=eCnq7Vd9gAQZKL260iHqfYYpmoNncD0vTP-YbQlDwfw%3D"
                alt="Keep up the Work"
              />
              <span className="h4">Keep up the Work</span>
              <span className="h5">1€/month</span>
              <BtnSimple
                css="btn-simple--2"
                type="link"
                target="_blank"
                href="https://www.patreon.com/checkout/dragoonDorise?rid=8177547"
                aria="Next"
              >
                Join
              </BtnSimple>
              <p>
                With this you will allow me to continue developing more themes
                and apps
              </p>
              <ul className="list">
                <li>- General Support</li>
              </ul>
            </Card>
          </div>
          <div data-col-sm="4">
            <Card css="is-selected card--image">
              <img
                src="https://c10.patreonusercontent.com/4/patreon-media/p/reward/8177551/ddb4b46ac6364051bb421679e918504e/eyJ3Ijo0MDB9/2.png?token-time=2145916800&token-hash=IBIc0gRiCjKYoLoBXJBXN8xi1gu-drm2UKB6SSDdtGs%3D"
                alt="Keep up the Work"
              />
              <span className="h4">Early Access Tier</span>
              <span className="h5">3€/month</span>
              <BtnSimple
                css="btn-simple--2"
                type="link"
                target="_blank"
                href="https://www.patreon.com/checkout/dragoonDorise?rid=8177551"
                aria="Next"
              >
                Join
              </BtnSimple>
              <p>
                Get access to the latest features and apps before anyone, this
                includes exclusive support and new features for SteamOS,
                Windows, MacOS and Android in the future.
              </p>
              <ul className="list">
                <li>- Early access</li>
                <li>- General Support</li>
                <li>- Private community</li>
                <li>- Acceso a Discord</li>
              </ul>
            </Card>
          </div>
          <div data-col-sm="4">
            <Card css="is-selected card--image">
              <img
                src="https://c10.patreonusercontent.com/4/patreon-media/p/reward/8681416/3c5aa559e51c41f89b0fe48ea1e01318/eyJ3Ijo0MDB9/2.png?token-time=2145916800&token-hash=wMOmBQQnP02K1L6iOHDX0mLF9p0cbzuePcQVLlNSF2I%3D"
                alt="Keep up the Work"
              />
              <span className="h4">Keep up the Work</span>
              <span className="h5">10€/month</span>
              <BtnSimple
                css="btn-simple--2"
                type="link"
                target="_blank"
                href="https://www.patreon.com/checkout/dragoonDorise?rid=8681416"
                aria="Next"
              >
                Join
              </BtnSimple>
              <p>
                You really really love what I do, and I thank you for that! This
                contribution will help EmuDeck buy new devices and set custom
                optimizations for others systems.
              </p>
              <ul className="list">
                <li>- Early access</li>
                <li>- General Support</li>
                <li>- Private community</li>
                <li>- Acceso a Discord</li>
              </ul>
            </Card>
          </div>
        </div>
      </Main>
      <Footer nextText="Exit" next="emulators" />
    </Wrapper>
  );
}

export default EarlyAccessPage;
