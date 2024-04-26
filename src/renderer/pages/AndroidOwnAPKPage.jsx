import { useTranslation } from 'react-i18next';
import Wrapper from 'components/molecules/Wrapper/Wrapper';
import Footer from 'components/organisms/Footer/Footer';
import Header from 'components/organisms/Header/Header';

function AndroidOwnAPKPage() {
  const { t, i18n } = useTranslation();
  return (
    <Wrapper>
      <Header title={t('AndroidOwnAPKPage.title')} />
      <main>
        <p
          class="lead"
          dangerouslySetInnerHTML={{
            __html: t('AndroidOwnAPKPage.description'),
          }}
        />
      </main>
      <Footer next="android-end" disabledNext={false} disabledBack={false} />
    </Wrapper>
  );
}

export default AndroidOwnAPKPage;
