const saveObjectInLocalStorage = async function (obj) {
  return new Promise((resolve, reject) => {
    try {
      chrome.storage.local.set(obj, function () {
        resolve();
      });
    } catch (ex) {
      reject(ex);
    }
  });
};

const getObjectInLocalStorage = async function () {
  return new Promise((resolve, reject) => {
    try {
      chrome.storage.local.get(key, function (value) {
        resolve(value);
      });
    } catch (ex) {
      reject(ex);
    }
  });
};
chrome.runtime.onConnect.addListener(function (port) {
  port.onMessage.addListener(async function ({ message }) {
    if (message === "startScrap") {
      const status = "start";
      await saveObjectInLocalStorage(status);
    }
    if (message === "finish") {
      /*const status = getObjectInLocalStorage("status");
      if (status == "start")*/ port.postMessage({ message: "nextPage" });
    }
  });
});
