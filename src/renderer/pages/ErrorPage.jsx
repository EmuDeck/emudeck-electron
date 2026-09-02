import { useTranslation } from 'react-i18next';
import Wrapper from 'components/molecules/Wrapper/Wrapper';

import Header from 'components/organisms/Header/Header';

function ErrorPage() {
  const { t, i18n } = useTranslation();
  return (
    <Wrapper>
      <Header title={t('ErrorPage.title')} />
      <p className="lead">{t('ErrorPage.noConnection')}</p>
      <p>{t('ErrorPage.needConnection')}</p>
    </Wrapper>
  );
}

export default ErrorPage;
