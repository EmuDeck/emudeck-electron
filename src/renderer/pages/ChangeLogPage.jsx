import React, { useEffect, useState, useContext, useRef } from 'react';
import { GlobalContext } from 'context/globalContext';
import Wrapper from 'components/molecules/Wrapper/Wrapper';
import GamePad from 'components/organisms/GamePad/GamePad';
import Header from 'components/organisms/Header/Header';
import Footer from 'components/organisms/Footer/Footer';
import Card from 'components/molecules/Card/Card';
import ChangeLog from 'components/organisms/Wrappers/ChangeLog';
import img0 from 'assets/banner_steamOS.jpg';
import img1 from 'assets/banner_store.png';
import img2 from 'assets/banner_ui.png';
import img3 from 'assets/banner_melonds.png';
import img4 from 'assets/banner_usbtransfer.png';
import img5 from 'assets/banner_ESDE.jpg';
import img6 from 'assets/banner_emulators_manage.png';
import img7 from 'assets/banner_migration.png';
import img8 from 'assets/banner_streaming.jpg';
import img9 from 'assets/banner_emudeck-theme.png';
import img10 from 'assets/banner_steaminput.jpg';

function ChangeLogPage() {
  const { state } = useContext(GlobalContext);
  const [statePage, setStatePage] = useState({
    disabledNext: false,
    disabledBack: false,
    current: 0,
    img: img0,
    log: [],
    dom: undefined,
  });
  const { disabledNext, disabledBack, current, img, log, dom } = statePage;
  const { system, branch } = state;

  const imgC0 = img0;
  const activeItem = (id) => {
    let imgID;
    switch (id) {
      case 0:
        imgID = img0;
        break;
      case 1:
        imgID = img1;
        break;
      case 2:
        imgID = img2;
        break;
      case 3:
        imgID = img3;
        break;
      case 4:
        imgID = img4;
        break;
      case 5:
        imgID = img5;
        break;
      case 6:
        imgID = img6;
        break;
      case 7:
        imgID = img7;
        break;
      case 8:
        imgID = img8;
        break;
      case 9:
        imgID = img9;
      case 10:
        imgID = img10;
        break;
    }

    setStatePage({ ...statePage, current: id, img: imgID });
  };

  // Hide changelog after seen
  useEffect(() => {
    localStorage.setItem('show_changelog', false);
    let systemName;
    switch (system) {
      case 'darwin':
        systemName = 'darwin';
        break;
      case 'win32':
        systemName = 'win32';
        break;
      case 'SteamOS':
        systemName = 'SteamOS';
        break;
      default:
        systemName = 'linux';
        break;
    }

    const changeLogData = require(`data/changelog-${systemName}-${branch}.json`);
    setStatePage({
      ...statePage,
      log: changeLogData,
    });
  }, []);

  // GamePad
  const domElementsRef = useRef(null);
  const domElementsCur = domElementsRef.current;
  let domElements;
  useEffect(() => {
    if (domElementsCur && dom === undefined) {
      domElements = domElementsCur.querySelectorAll('button');
      setStatePage({ ...statePage, dom: domElements });
    }
  }, [statePage]);

  return (
    <div style={{ height: '100vh' }} ref={domElementsRef}>
      {dom !== undefined && <GamePad elements={dom} />}
      <Wrapper>
        <Header title="Latest changes" />
        <ChangeLog disabledNext={disabledNext} disabledBack={disabledBack}>
          <div className="container--grid">
            <div data-col-sm="4">
              <div
                className="changelog-scroll"
                style={{
                  height: '62vh',
                  overflow: 'auto',
                  overflowX: 'hidden',
                  paddingRight: '20px',
                }}
              >
                <ul>
                  {log.map((item, i) => {
                    return (
                      <li tabIndex="0" key={i}>
                        <Card
                          css={current === i && 'is-selected'}
                          onClick={() => activeItem(i)}
                        >
                          <span className="h5">{item.title}</span>
                        </Card>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
            <div data-col-sm="8">
              {log.map((item, i) => {
                return (
                  <div tabIndex="0" key={i}>
                    {current === i && (
                      <Card
                        onClick={() => activeItem(i)}
                        css={current === i && 'is-selected'}
                      >
                        {item.image === 'true' && (
                          <div
                            style={{
                              maxHeight: 280,
                              overflow: 'hidden',
                              marginBottom: 10,
                              borderRadius: 10,
                            }}
                          >
                            <img src={img} alt="Image" />
                          </div>
                        )}
                        <p
                          dangerouslySetInnerHTML={{ __html: item.description }}
                        />
                      </Card>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </ChangeLog>
        <Footer
          next={false}
          backText="Back to Home"
          disabledNext={disabledNext}
          disabledBack={disabledBack}
        />
      </Wrapper>
    </div>
  );
}

export default ChangeLogPage;
