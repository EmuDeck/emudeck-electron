import React, { useEffect, useState, useContext, useRef } from 'react';
import { GlobalContext } from 'context/globalContext';
import { useNavigate } from 'react-router-dom';
import Wrapper from 'components/molecules/Wrapper/Wrapper';
import GamePad from 'components/organisms/GamePad/GamePad';
import Header from 'components/organisms/Header/Header';

import StoreFront from 'components/organisms/Wrappers/StoreFront';
import { BtnSimple } from 'getbasecore/Atoms';

function StoreFrontPage() {
  const { state } = useContext(GlobalContext);
  const { bezels } = state;
  const [statePage, setStatePage] = useState({
    disabledNext: false,
    disabledBack: false,
    data: '',
    dom: undefined,
  });
  const { disabledNext, disabledBack, data, dom } = statePage;
  const navigate = useNavigate();
  // Enabling button when changing the global state only if we have a device selected
  useEffect(() => {
    if (bezels !== '') {
      setStatePage({ ...statePage, disabledNext: false });
    }
  }, [state]);
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
    <div ref={domElementsRef}>
      {dom !== undefined && <GamePad elements={dom} />}
      <div style={{ height: '100vh' }} ref={domElementsRef}>
        <Wrapper>
          <Header title="EmuDeck Store" />
          <StoreFront
            data={data}
            disabledNext={disabledNext}
            disabledBack={disabledBack}
          />
          <footer className="footer">
            <BtnSimple
              css="btn-simple--1"
              type="button"
              aria="Go Back"
              disabled={false}
              onClick={() => navigate(-1)}
            >
              Go Back
            </BtnSimple>
          </footer>
        </Wrapper>
      </div>
    </div>
  );
}

export default StoreFrontPage;
