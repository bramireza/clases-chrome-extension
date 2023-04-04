const btnScripting = document.getElementById("btnScrap");
const btnStop = document.getElementById("btnStop");
const pResults = document.getElementById("results");

const port = chrome.runtime.connect({ name: "popup-background" });

btnScripting.addEventListener("click", async () => {
  port.postMessage({ message: "start" });
  pResults.innerText = "Waiting Results ...";
  chrome.runtime.onMessage.addListener(async function (
    { message, data },
    _sender,
    _sendResponse
  ) {
    if (message === "ok") pResults.innerText = JSON.stringify(data, null, 2);
  });
});
btnStop.addEventListener("click", async () => {
  port.postMessage({ message: "finish" });
});
