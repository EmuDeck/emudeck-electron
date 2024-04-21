import { useTranslation } from 'react-i18next';
import React, { useEffect, useState, useContext, useRef } from 'react';
import { GlobalContext } from 'context/globalContext';
import { useNavigate } from 'react-router-dom';
import Wrapper from 'components/molecules/Wrapper/Wrapper';
import Header from 'components/organisms/Header/Header';
import ProgressBar from 'components/atoms/ProgressBar/ProgressBar';
import Main from 'components/organisms/Main/Main';
import CardSettings from 'components/molecules/CardSettings/CardSettings';
import {
  iconChecker,
  iconCloud,
  iconCompress,
  iconGear,
  iconList,
  iconMigrate,
  iconPlugin,
  iconPrize,
  iconUninstall,
  iconQuick,
  iconCustom,
  iconDoc,
  iconJoystick,
  iconPackage,
  iconDisk,
  iconHelp,
  iconScreen,
  iconAndroid,
} from 'components/utils/images/icons';

function AndroidWelcomePage() {
const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { state, setState } = useContext(GlobalContext);
  const [statePage, setStatePage] = useState({});

  const { disabledNext, data, step } = statePage;
  const { android } = state;
  const { second } = android;
  const ipcChannel = window.electron.ipcRenderer;

  const startInstall = () => {
    navigate('/android-rom-storage');
  };

  return (
    <Wrapper aside>
      <Main>
        <Header title="EmuDeck Android" />
        <p className="lead">
          This early access build allows you to install several emulators and
          configurations to <br />
          your Android Device
        </p>
        <div className="container--grid">
          <div data-col-sm="4">
            <CardSettings
              css="is-highlighted"
              icon={iconQuick}
              iconSize="md"
              title="Install to Android"
              button="Install"
              onClick={() => startInstall()}
              description="Wizard that will install your Emulators, copy your current bios folder and guide you through the setup of your Android device"
            />
          </div>{' '}
          <div data-col-sm="4">
            <CardSettings
              css="is-disabled"
              icon={iconList}
              iconSize="md"
              title="Manage Emulators"
              button="Install"
              btnCSS=""
              description="Install Emulators one by one"
            />
          </div>
          <div data-col-sm="4">
            <CardSettings
              css="is-disabled"
              icon={iconDisk}
              iconSize="md"
              title="SaveSync"
              button="Install"
              btnCSS=""
              description="Sync your saved games"
            />
          </div>
        </div>
      </Main>
    </Wrapper>
  );
}

export default AndroidWelcomePage;
