import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { BtnSimple } from 'getbasecore/Atoms';
import MetroCop from 'components/organisms/MetroCop/MetroCop';

function MetroCopPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return (
    <>
      <MetroCop fullscreen />
      <BtnSimple
        css="btn-simple--1 metro-cop__back"
        type="button"
        aria={t('aria.goBack')}
        onClick={() => navigate(-1)}
      >
        {t('general.back')}
      </BtnSimple>
    </>
  );
}

export default MetroCopPage;
