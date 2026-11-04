import { useTranslation } from 'react-i18next';
import React, { useContext } from 'react';
import { GlobalContext } from 'context/globalContext';

import Wrapper from 'components/molecules/Wrapper/Wrapper';
import Header from 'components/organisms/Header/Header';
import Footer from 'components/organisms/Footer/Footer';
import Main from 'components/organisms/Main/Main';
import Card from 'components/molecules/Card/Card';
import Video from 'components/atoms/Video/Video';
import { Img } from 'getbasecore/Atoms';

import { iconSuccess, iconDanger } from 'components/utils/images/icons';
import { isFrontendAvailable } from 'components/utils/isFrontendAvailable';

const levels = [
  {
    id: 'library',
    text: 'library',
    name: 'EmuDeck Library',
    features: [true, true, false],
    video:
      'https://f005.backblazeb2.com/file/emudeck-assets/videos/library.mp4',
  },
  {
    id: 'esde',
    text: 'esde',
    name: 'EmulationStation (ES-DE)',
    features: [true, true, false, false],
    video:
      'https://f005.backblazeb2.com/file/emudeck-assets/videos/twNE8i3aI0g-ESDE.mp4',
  },
  {
    id: 'steam',
    text: 'srm',
    name: 'Steam Rom Manager',
    features: [true, false, false],
    video:
      'https://f005.backblazeb2.com/file/emudeck-assets/videos/BsqWFHPp5UU-SRM.mp4',
  },
];

function FrontendSelectorPage() {
  const { t } = useTranslation();
  const { state, setState } = useContext(GlobalContext);

  const { installFrontends, mode, system, arch } = state;
  const available = levels.filter((item) =>
    isFrontendAvailable(item.id, system, arch),
  );
  const labels =
    available.length === 3 ? ['low', 'medium', 'highest'] : ['low', 'highest'];
  const selected = available.find((item) => installFrontends[item.id]?.status);

  // Marks one integration level as selected and clears the others
  const selectLevel = (id) => {
    const changes = {};
    levels.forEach((item) => {
      changes[item.id] = {
        ...installFrontends[item.id],
        status: item.id === id,
      };
    });
    setState({
      ...state,
      installFrontends: { ...installFrontends, ...changes },
    });
  };

  const nextPage = () => {
    if (installFrontends.esde.status) {
      return 'esde-theme';
    }
    if (mode === 'easy') {
      return 'end';
    }
    return 'emulator-selector';
  };

  return (
    <Wrapper css="wrapper__full">
      <Header title={t('FrontendSelectorPage.integrationTitle')} />
      <p className="lead">{t('FrontendSelectorPage.integrationDescription')}</p>
      <Main>
        <div className="selector-menu__options selector-menu__options--full">
          <ul>
            {available.map((item, index) => (
              <li key={item.id}>
                <Card
                  css={selected?.id === item.id ? 'is-selected' : ''}
                  onClick={() => selectLevel(item.id)}
                >
                  <span className="h4">
                    {t(`FrontendSelectorPage.${labels[index]}`)}
                  </span>
                  <p>{item.name}</p>
                </Card>
              </li>
            ))}
          </ul>
        </div>
        {selected && (
          <div className="selector-menu">
            <div className="selector-menu__text">
              <div className="selector-menu__details">
                <p className="lead">{t('general.description')}</p>
                <p>{t(`FrontendSelectorPage.${selected.text}.description`)}</p>
                <p className="lead">{t('general.features')}</p>
                <ul>
                  {selected.features.map((ok, index) => (
                    <li key={`${selected.id}-${index}`}>
                      <Img
                        src={ok ? iconSuccess : iconDanger}
                        css="icon icon--xs"
                        alt={ok ? 'OK' : 'KO'}
                      />
                      {t(
                        `FrontendSelectorPage.${selected.text}.feature${index + 1}`,
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            {selected.video && (
              <div className="selector-menu__img" style={{ flex: '1' }}>
                <Video key={selected.video} src={selected.video} />
              </div>
            )}
          </div>
        )}
      </Main>
      <Footer
        next={nextPage()}
        disabledNext={!selected}
        nextText={
          mode === 'easy' && !installFrontends.esde.status
            ? t('general.finish')
            : t('general.next')
        }
        disabledBack={false}
      />
    </Wrapper>
  );
}

export default FrontendSelectorPage;
