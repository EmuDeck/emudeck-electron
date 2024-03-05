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
import androidGif from 'assets/gifs/android.gif';

function AndroidFinishPage() {
  const navigate = useNavigate();
  const { state, setState } = useContext(GlobalContext);
  const [statePage, setStatePage] = useState({});

  const { disabledNext, data, step } = statePage;
  const { android } = state;
  const { storage } = android;
  const ipcChannel = window.electron.ipcRenderer;

  useEffect(() => {
    ipcChannel.sendMessage('emudeck', [
      `launchPegasus|||adb shell am start -n org.pegasus_frontend.android/.MainActivity`,
    ]);
  }, []);

  return (
    <Wrapper aside>
      <Main>
        <Header title="EmuDeck Android Installed!" />
        <div className="container--grid">
          <div data-col-sm="6">
            {' '}
            <p className="lead">
              If everything went well, you should see Pegasus Frontend on your
              Android device.
            </p>
            <p className="lead">
              If you dont, please reinstall EmuDeck on your device.
            </p>
          </div>
          <div data-col-sm="6">
            <img src={androidGif} alt="Android" />
          </div>
        </div>
      </Main>
    </Wrapper>
  );
}

export default AndroidFinishPage;
