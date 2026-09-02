import { useTranslation } from 'react-i18next';
import React, { useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { GlobalContext } from 'context/globalContext';

import Wrapper from 'components/molecules/Wrapper/Wrapper';
import Header from 'components/organisms/Header/Header';
import Footer from 'components/organisms/Footer/Footer';
import Main from 'components/organisms/Main/Main';
import Video from 'components/atoms/Video/Video';
import { Img, Iframe } from 'getbasecore/Atoms';

import { iconSuccess, iconDanger } from 'components/utils/images/icons';
function FrontendSelectorPage() {
  const { t, i18n } = useTranslation();
  const { state, setState } = useContext(GlobalContext);

  const { installFrontends, branch, system, mode } = state;
  const { steam, esde } = installFrontends;

  const enableESDE = () => {
    setState({
      ...state,
      installFrontends: {
        ...installFrontends,
        steam: {
          ...steam,
          status: false,
        },
        esde: {
          ...esde,
          status: true,
        },
      },
    });
  };

  const enableSRM = () => {
    setState({
      ...state,
      installFrontends: {
        ...installFrontends,
        steam: {
          ...steam,
          status: true,
        },
        esde: {
          ...esde,
          status: false,
        },
      },
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
        <div className="selector-menu ">
          <div className="selector-menu__text">
            <div className="selector-menu__options selector-menu__options--full">
              <ul>
                <li className="">
                  <button
                    type="button"
                    className={`card ${esde.status ? 'is-selected' : ''}`}
                    onClick={() => enableESDE()}
                  >
                    <svg
                      className="card__selected"
                      width={20}
                      height={20}
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M19.9219 9.96094C19.9219 15.4004 15.4102 19.9219 9.96094 19.9219C4.52148 19.9219 0 15.4004 0 9.96094C0 4.51172 4.51172 0 9.95117 0C15.4004 0 19.9219 4.51172 19.9219 9.96094ZM12.998 6.08398L8.82812 12.7832L6.8457 10.2246C6.60156 9.90234 6.38672 9.81445 6.10352 9.81445C5.66406 9.81445 5.32227 10.1758 5.32227 10.6152C5.32227 10.8398 5.41016 11.0547 5.55664 11.25L8.00781 14.2578C8.26172 14.5996 8.53516 14.7363 8.86719 14.7363C9.19922 14.7363 9.48242 14.5801 9.6875 14.2578L14.2773 7.03125C14.3945 6.82617 14.5215 6.60156 14.5215 6.38672C14.5215 5.92773 14.1211 5.63477 13.6914 5.63477C13.4375 5.63477 13.1836 5.79102 12.998 6.08398Z"
                        fill="#E7D8FF"
                      />
                    </svg>
                    <span className="h4">{t('FrontendSelectorPage.low')}</span>
                    <p>EmulationStation (ES-DE)</p>
                  </button>
                </li>

                <li className="">
                  <button
                    type="button"
                    className={`card ${steam.status ? 'is-selected' : ''}`}
                    onClick={() => enableSRM()}
                  >
                    <svg
                      className="card__selected"
                      width={20}
                      height={20}
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M19.9219 9.96094C19.9219 15.4004 15.4102 19.9219 9.96094 19.9219C4.52148 19.9219 0 15.4004 0 9.96094C0 4.51172 4.51172 0 9.95117 0C15.4004 0 19.9219 4.51172 19.9219 9.96094ZM12.998 6.08398L8.82812 12.7832L6.8457 10.2246C6.60156 9.90234 6.38672 9.81445 6.10352 9.81445C5.66406 9.81445 5.32227 10.1758 5.32227 10.6152C5.32227 10.8398 5.41016 11.0547 5.55664 11.25L8.00781 14.2578C8.26172 14.5996 8.53516 14.7363 8.86719 14.7363C9.19922 14.7363 9.48242 14.5801 9.6875 14.2578L14.2773 7.03125C14.3945 6.82617 14.5215 6.60156 14.5215 6.38672C14.5215 5.92773 14.1211 5.63477 13.6914 5.63477C13.4375 5.63477 13.1836 5.79102 12.998 6.08398Z"
                        fill="#E7D8FF"
                      />
                    </svg>
                    <span className="h4">
                      {t('FrontendSelectorPage.highest')}
                    </span>
                    <p>Steam Rom Manager</p>
                  </button>
                </li>
              </ul>
            </div>
            {esde.status && (
              <div className="selector-menu__details">
                <p className="lead">{t('general.description')}</p>
                <p>{t('FrontendSelectorPage.esde.description')}</p>
                <p className="lead">{t('general.features')}</p>
                <ul>
                  <li>
                    <Img src={iconSuccess} css="icon icon--xs" alt="OK" />
                    {t('FrontendSelectorPage.esde.feature1')}
                  </li>
                  <li>
                    <Img src={iconSuccess} css="icon icon--xs" alt="OK" />
                    {t('FrontendSelectorPage.esde.feature2')}
                  </li>
                  <li>
                    <Img src={iconDanger} css="icon icon--xs" alt="OK" />
                    {t('FrontendSelectorPage.esde.feature3')}
                  </li>
                  <li>
                    <Img src={iconDanger} css="icon icon--xs" alt="OK" />
                    {t('FrontendSelectorPage.esde.feature4')}
                  </li>
                </ul>
              </div>
            )}
            {steam.status && (
              <div className="selector-menu__details">
                <p className="lead">{t('general.description')}</p>
                <p>{t('FrontendSelectorPage.srm.description')}</p>
                <p className="lead">{t('general.features')}</p>
                <ul>
                  <li>
                    <Img src={iconSuccess} css="icon icon--xs" alt="OK" />
                    {t('FrontendSelectorPage.srm.feature1')}
                  </li>
                  <li>
                    <Img src={iconDanger} css="icon icon--xs" alt="OK" />
                    {t('FrontendSelectorPage.srm.feature2')}
                  </li>
                  <li>
                    <Img src={iconDanger} css="icon icon--xs" alt="OK" />
                    {t('FrontendSelectorPage.srm.feature3')}
                  </li>
                </ul>
              </div>
            )}
          </div>

          <div className="selector-menu__img" style={{ flex: '1' }}>
            {esde.status && (
              <div className="embed-responsive__item">
                <Video src="https://f005.backblazeb2.com/file/emudeck-assets/videos/twNE8i3aI0g-ESDE.mp4" />
              </div>
            )}
            {steam.status && (
              <Video src="https://f005.backblazeb2.com/file/emudeck-assets/videos/BsqWFHPp5UU-SRM.mp4" />
            )}
          </div>
        </div>
      </Main>
      <Footer
        next={nextPage()}
        disabledNext={
          !installFrontends.esde.status && !installFrontends.steam.status
        }
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
