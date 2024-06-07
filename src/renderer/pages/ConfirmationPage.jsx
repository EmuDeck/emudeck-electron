import { useTranslation } from 'react-i18next';
import React, { useEffect, useState, useContext, useRef } from 'react';
import { GlobalContext } from 'context/globalContext';
import Wrapper from 'components/molecules/Wrapper/Wrapper';

import Header from 'components/organisms/Header/Header';
import Footer from 'components/organisms/Footer/Footer';

import Confirmation from 'components/organisms/Wrappers/Confirmation';

function ConfirmationPage() {
  const { t, i18n } = useTranslation();
  const { state, setState } = useContext(GlobalContext);
  const { bezels, system } = state;
  const [statePage, setStatePage] = useState({
    disabledNext: false,
    disabledBack: false,
    data: '',
    dom: undefined,
  });
  const { disabledNext, disabledBack, data, dom } = statePage;

  // Enabling button when changing the global state only if we have a device selected
  useEffect(() => {
    if (bezels !== '') {
      setStatePage({ ...statePage, disabledNext: false });
    }
  }, [state]);

  return (
    <Wrapper>
      <Header title={t('ConfirmationPage.title')} />
      <Confirmation data={data} />
      <Footer
        next="end"
        nextText={t('general.finish')}
        disabledNext={disabledNext}
        disabledBack={disabledBack}
      />
    </Wrapper>
  );
}

export default ConfirmationPage;
