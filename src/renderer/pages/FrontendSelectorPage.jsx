import { useTranslation } from 'react-i18next';
import React, { useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { GlobalContext } from 'context/globalContext';

import Wrapper from 'components/molecules/Wrapper/Wrapper';
import Header from 'components/organisms/Header/Header';
import Footer from 'components/organisms/Footer/Footer';
import Main from 'components/organisms/Main/Main';
import { Img, Iframe } from 'getbasecore/Atoms';

import { iconSuccess, iconDanger } from 'components/utils/images/icons';
function FrontendSelectorPage() {
  const { t, i18n } = useTranslation();
  const { state, setState } = useContext(GlobalContext);

  const { installFrontends, branch, system, mode } = state;
  const { steam, deckyromlauncher, esde } = installFrontends;

  const enableESDE = () => {
    setState({
      ...state,
      installFrontends: {
        ...installFrontends,
        steam: {
          ...steam,
          status: false,
        },
        deckyromlauncher: {
          ...deckyromlauncher,
          status: false,
        },
        esde: {
          ...esde,
          status: true,
        },
      },
    });
  };

  const enableRL = () => {
    setState({
      ...state,
      installFrontends: {
        ...installFrontends,
        steam: {
          ...steam,
          status: false,
        },
        deckyromlauncher: {
          ...deckyromlauncher,
          status: true,
        },
        esde: {
          ...esde,
          status: false,
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
        deckyromlauncher: {
          ...deckyromlauncher,
          status: false,
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

  //Forced RL on non windows
  useEffect(() => {
    if (system != 'win32' && branch != 'main') {
      enableRL();
    } else {
      enableESDE();
    }
  }, []);

  return (
    <Wrapper css="wrapper__full">
      <Header title="Pick your level of integration" />
      <p class="lead">
        EmuDeck can integrate into your system in different levels
      </p>
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
                    <span className="h4">Low</span>
                    <p>EmulationStation (ES-DE)</p>
                  </button>
                </li>

                {system !== 'win32' && branch != 'main' && (
                  <li className="">
                    <button
                      type="button"
                      className={`card ${
                        deckyromlauncher.status ? 'is-selected' : ''
                      }`}
                      onClick={() => enableRL()}
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
                      <span className="h4">Medium</span>
                      <p>Retro Library</p>
                    </button>
                  </li>
                )}
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
                    <span className="h4">Highest</span>
                    <p>Steam Rom Manager</p>
                  </button>
                </li>
              </ul>
            </div>
            {esde.status && (
              <div className="selector-menu__details">
                <p className="lead">Description</p>
                <p>
                  EmulationStation will be added as a non Steam Game so you can
                  launch all your games from one single app
                </p>
                <p className="lead">Features</p>
                <ul>
                  <li>
                    <Img src={iconSuccess} css="icon icon--xs" alt="OK" />
                    Plenty of Themes
                  </li>
                  <li>
                    <Img src={iconSuccess} css="icon icon--xs" alt="OK" />
                    Doesn't clutter your library
                  </li>
                  <li>
                    <Img src={iconDanger} css="icon icon--xs" alt="OK" />
                    Manual artwork parsing
                  </li>
                  <li>
                    <Img src={iconDanger} css="icon icon--xs" alt="OK" />
                    Games not integrated with Steam
                  </li>
                </ul>
              </div>
            )}
            {deckyromlauncher.status && (
              <div className="selector-menu__details">
                <p className="lead">Description</p>
                <p>
                  RetroLibrary and Decky loader will be installed, you can
                  access Retro Library from your Steam Menu
                </p>
                <p className="lead">Features</p>
                <ul>
                  <li>
                    <Img src={iconSuccess} css="icon icon--xs" alt="OK" />
                    Doesn't clutter your library
                  </li>
                  <li>
                    <Img src={iconSuccess} css="icon icon--xs" alt="OK" />
                    Automatic artwork parsing
                  </li>
                  <li>
                    <Img src={iconSuccess} css="icon icon--xs" alt="OK" />
                    Most recently played games will appear in your home
                  </li>
                  <li>
                    <Img src={iconDanger} css="icon icon--xs" alt="OK" />
                    Small number of Themes to chose from
                  </li>
                </ul>
              </div>
            )}
            {steam.status && (
              <div className="selector-menu__details">
                <p className="lead">Description</p>
                <p>
                  Steam Rom Manager will be installed so you can add your games
                  in Steam just like if they were Steam Games
                </p>
                <p className="lead">Features</p>
                <ul>
                  <li>
                    <Img src={iconSuccess} css="icon icon--xs" alt="OK" />
                    Games tightly integrated with your Steam Library
                  </li>
                  <li>
                    <Img src={iconDanger} css="icon icon--xs" alt="OK" />
                    Can clutter your library if you have a lot of games
                  </li>
                  <li>
                    <Img src={iconDanger} css="icon icon--xs" alt="OK" />
                    Desktop mode needed to add more games
                  </li>
                </ul>
              </div>
            )}
          </div>

          <div className="selector-menu__img" style={{ flex: '1' }}>
            {esde.status && (
              <Iframe src="https://www.youtube-nocookie.com/embed/twNE8i3aI0g?autoplay=1&playlist=twNE8i3aI0g&loop=1&controls=0&mute=1&rel=0&modestbranding=1" />
            )}
            {deckyromlauncher.status && (
              <Iframe src="https://www.youtube-nocookie.com/embed/aVZuoIfIdkU?autoplay=1&playlist=aVZuoIfIdkU&loop=1&controls=0&mute=1&rel=0&modestbranding=1" />
            )}
            {steam.status && (
              <Iframe src="https://www.youtube-nocookie.com/embed/BsqWFHPp5UU?autoplay=1&playlist=BsqWFHPp5UU&loop=1&controls=0&mute=1&rel=0&modestbranding=1" />
            )}
          </div>
        </div>
      </Main>
      <Footer
        next={nextPage()}
        disabledNext={
          !installFrontends.esde.status &&
          !installFrontends.steam.status &&
          !installFrontends.deckyromlauncher.status
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
