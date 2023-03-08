import React, { useState, useContext, useEffect } from 'react';
import { GlobalContext } from 'context/globalContext';
import Wrapper from 'components/molecules/Wrapper/Wrapper';
import Header from 'components/organisms/Header/Header';
import Footer from 'components/organisms/Footer/Footer';

import UpdateConfigs from 'components/organisms/Wrappers/UpdateConfigs';
import Notification from 'components/molecules/Notification/Notification';

function UpdateConfigsPage() {
  const { stateUpdates, setStateUpdates } = useContext(GlobalContext);
  const [statePage, setStatePage] = useState({
    disabledNext: false,
    disabledBack: false,
    updates: null,
    showNotification: undefined,
    textNotification: '',
    disableInstallButton: false,
    disableResetButton: false,
    newDesiredVersions: null,
  });
  const {
    disabledNext,
    disabledBack,
    updates,
    showNotification,
    textNotification,
    newDesiredVersions,
  } = statePage;

  const ipcChannel = window.electron.ipcRenderer;

  const diff = (obj1, obj2) => {
    // Make sure an object to compare is provided
    if (!obj2 || Object.prototype.toString.call(obj2) !== '[object Object]') {
      return obj1;
    }

    //
    // Variables
    //

    const diffs = {};
    let key;

    //
    // Methods
    //

    /**
     * Check if two arrays are equal
     * @param  {Array}   arr1 The first array
     * @param  {Array}   arr2 The second array
     * @return {Boolean}      If true, both arrays are equal
     */
    const arraysMatch = (arr1, arr2) => {
      // Check if the arrays are the same length
      if (arr1.length !== arr2.length) return false;

      // Check if all items exist and are in the same order
      for (let i = 0; i < arr1.length; i++) {
        if (arr1[i] !== arr2[i]) return false;
      }

      // Otherwise, return true
      return true;
    };

    /**
     * Compare two items and push non-matches to object
     * @param  {*}      item1 The first item
     * @param  {*}      item2 The second item
     * @param  {String} key   The key in our object
     */
    const compare = (item1, item2, key) => {
      // Get the object type
      const type1 = Object.prototype.toString.call(item1);
      const type2 = Object.prototype.toString.call(item2);

      // If type2 is undefined it has been removed
      if (type2 === '[object Undefined]') {
        diffs[key] = null;
        return;
      }

      // If items are different types
      if (type1 !== type2) {
        diffs[key] = item2;
        return;
      }

      // If an object, compare recursively
      if (type1 === '[object Object]') {
        const objDiff = diff(item1, item2);
        if (Object.keys(objDiff).length > 0) {
          diffs[key] = objDiff;
        }
        return;
      }

      // If an array, compare
      if (type1 === '[object Array]') {
        if (!arraysMatch(item1, item2)) {
          diffs[key] = item2;
        }
        return;
      }

      // Else if it's a function, convert to a string and compare
      // Otherwise, just compare
      if (type1 === '[object Function]') {
        if (item1.toString() !== item2.toString()) {
          diffs[key] = item2;
        }
      } else if (item1 !== item2) {
        diffs[key] = item2;
      }
    };

    //
    // Compare our objects
    //

    // Loop through the first object
    for (key in obj1) {
      if (obj1.hasOwnProperty(key)) {
        compare(obj1[key], obj2[key], key);
      }
    }

    // Loop through the second object and find missing items
    for (key in obj2) {
      if (obj2.hasOwnProperty(key)) {
        if (!obj1[key] && obj1[key] !== obj2[key]) {
          diffs[key] = obj2[key];
        }
      }
    }

    // Return the object of differences
    return diffs;
  };

  const resetEmu = (code, name, id) => {
    setStatePage({
      ...statePage,
      disableInstallButton: true,
    });
    ipcChannel.sendMessage('emudeck', [
      `${name}_resetConfig|||${name}_resetConfig`,
    ]);
    ipcChannel.once(`${name}_resetConfig`, (status) => {
      console.log(`${name}_resetConfig`);
      status = status.stdout;
      console.log({ status });
      status = status.replace('\n', '');

      if (status.includes('true')) {
        setStatePage({
          ...statePage,
          textNotification: `${name} configuration updated! 🎉`,
          showNotification: true,
          disableResetButton: false,
        });
        setStateUpdates({
          ...stateUpdates,
          [id]: newDesiredVersions[id],
        });
      } else {
        setStatePage({
          ...statePage,
          textNotification: `There was an issue trying to reset ${name} configuration 😥`,
          showNotification: true,
          disableResetButton: false,
        });
      }
    });
  };

  useEffect(() => {
    if (showNotification === true) {
      setTimeout(() => {
        setStatePage({
          ...statePage,
          showNotification: false,
        });
      }, 3000);
    }
  }, [showNotification]);

  useEffect(() => {
    ipcChannel.sendMessage('check-versions');
    ipcChannel.once('check-versions', (repoVersions) => {
      // No versioning found, what to do?
      if (repoVersions === '') {
        console.log('no versioning found');
      }

      const updates = diff(repoVersions, stateUpdates);
      console.log({ updates });
      setStatePage({
        ...statePage,
        updates: updates,
        newDesiredVersions: repoVersions,
      });
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (showNotification === false) {
      const updates = diff(newDesiredVersions, stateUpdates);
      console.log({ updates });
      setStatePage({
        ...statePage,
        updates: updates,
      });

      let json = JSON.stringify(stateUpdates);
      localStorage.setItem('current_versions', json);
    }
  }, [showNotification]);

  return (
    <Wrapper>
      <Header title="Update your" bold="Configurations" />
      <Notification css={showNotification ? 'is-animated' : 'nope'}>
        {textNotification}
      </Notification>
      <UpdateConfigs
        onClick={resetEmu}
        updates={updates}
        disabledNext={disabledNext}
        disabledBack={disabledBack}
      />
      <Footer
        next={false}
        disabledNext={disabledNext}
        disabledBack={disabledBack}
      />
    </Wrapper>
  );
}

export default UpdateConfigsPage;
