import { useTranslation } from 'react-i18next';
import React from 'react';
import Wrapper from 'components/molecules/Wrapper/Wrapper';

import Header from 'components/organisms/Header/Header';
import Footer from 'components/organisms/Footer/Footer';
import CheckBios from 'components/organisms/Wrappers/CheckBios';

function CheckBiosPage() {
  const { t } = useTranslation();

  return (
    <Wrapper>
      <Header title={t('CheckBiosPage.title')} />
      <p className="lead">{t('CheckBiosPage.description')}</p>
      <CheckBios />
      <Footer next={false} disabledNext disabledBack={false} />
    </Wrapper>
  );
}

export default CheckBiosPage;
