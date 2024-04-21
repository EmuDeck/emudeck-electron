import { useTranslation } from 'react-i18next';
import Wrapper from 'components/molecules/Wrapper/Wrapper';
import Footer from 'components/organisms/Footer/Footer';
import Header from 'components/organisms/Header/Header';

function AndroidOwnAPKPage() {
const { t, i18n } = useTranslation();
  return (
    <div style={{ height: '100vh' }}>
      <Wrapper>
        <Header title={`Bring your own APK`} />
        <p class="lead">
          Do you have another emulator or do you want to install ESDE?
        </p>
        <p>
          Put all your APK in your downloads folder and EmuDeck will install
          them
        </p>
        <p>
          <strong>Please don't use pirated APKs</strong>
        </p>
        <Footer next="android-end" disabledNext={false} disabledBack={false} />
      </Wrapper>
    </div>
  );
}

export default AndroidOwnAPKPage;
