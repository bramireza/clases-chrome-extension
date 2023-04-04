let statusScrap = "stop";

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

const getObjectInLocalStorage = async function (key) {
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

function addPageToURL(url) {
  const regex = /page=(\d+)/;
  const match = url.match(regex);

  //from ttps://www.occ.com.mx/empleos/?tm=0
  if (!match) return url.concat("&page=2");
  //to https://www.occ.com.mx/empleos/?page=2

  const pageNumber = match && match[1];
  const newPage = parseInt(pageNumber) + 1;
  return url.replace(regex, `page=${newPage}`);
}
async function refreshJobsLocalStorage(jobs) {
  // Get the "jobs" object from local storage, or initialize it as an empty array if it doesn't exist
  const { jobs: currentJobs = [] } = await getObjectInLocalStorage("jobs");

  // Combine the existing jobs with the new jobs using the spread operator
  const allJobs = [...currentJobs, ...jobs];

  // Save the combined jobs back to local storage
  await saveObjectInLocalStorage({ jobs: allJobs });
}

function getMetricsJobs(allJobs) {
  allJobs.map((job) => {});
}
chrome.runtime.onConnect.addListener(function (port) {
  port.onMessage.addListener(async function ({ message, jobs }, sender) {
    if (message === "start") {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (!tab) return;
      statusScrap = "start";
      let port = chrome.tabs.connect(tab.id, { name: "background-content" });
      port.postMessage({ message: "scrap" });

      return;
    }
    if (message === "next") {
      await refreshJobsLocalStorage(jobs);

      const url = addPageToURL(sender.sender.url);
      await chrome.tabs.update(sender.sender.tab.id, {
        url: url,
      });
      return;
    }
    if (message === "online" && statusScrap === "start") {
      port.postMessage({ message: "scrap" });

      return;
    }
    if (message === "finish") {
      statusScrap = "stop";
      const { jobs: data } = await getObjectInLocalStorage("jobs");

      chrome.runtime.sendMessage({ message: "ok", data });
      //port.postMessage({ message: "stop" });
      return;
    }
  });
});
