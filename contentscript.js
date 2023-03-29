console.log("Ejecutando el content script 1.0");

const getJobInformation = () => {
  const arrayJobs = [...document.querySelectorAll("[id*='jobcard-']")];
  const jobs = arrayJobs.map((jobcard) => {
    const [
      { href: url },
      {
        children: [
          {
            children: [
              { innerText: date },
              { innerText: title },
              { innerText: salaryRange },
              { innerText: benefits },
              { innerText: description },
              companyCity,
            ],
          },
        ],
      },
    ] = jobcard.children;

    const company = companyCity?.querySelector("label")?.innerText;
    const city = companyCity?.querySelector("p")?.innerText;

    return {
      date: date.split("\n")[0],
      title,
      salaryRange,
      benefits: benefits.split("\n"),
      description,
      company,
      city,
      url,
    };
  });
  return jobs;
};

//Connect to background
const portBackground = chrome.runtime.connect({ name: "content-background" });

portBackground.onMessage.addListener(async ({ message }) => {
  if (message === "nextPage") {
    const nextPageButton = document.querySelector("[class*=next-]");
    nextPageButton.click();
  }
});

chrome.runtime.onConnect.addListener(function (port) {
  port.onMessage.addListener(function ({ message }) {
    //alert(`${port.name}: message`);
    if (message === "getJobs") {
      const jobs = getJobInformation();
      port.postMessage({ message: "ok", data: jobs });
      portBackground.postMessage({ message: "finish" });
    }
  });
});
