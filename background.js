let ativo = false;

function iniciarLembretes() {
  chrome.alarms.create("agua", { periodInMinutes: 60 });
  chrome.alarms.create("visao", { periodInMinutes: 30 });
}

chrome.runtime.onMessage.addListener((request) => {
  if (request.action === "toggle") {
    ativo = !ativo;

    if (ativo) {
      iniciarLembretes();
    } else {
      chrome.alarms.clearAll();
    }
  }
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "agua") {
    chrome.notifications.create({
      type: "basic",
      iconUrl: "icon.png",
      title: "💧 Hora de beber água",
      message: "Mantenha-se hidratada."
    });
  }

  if (alarm.name === "visao") {
    chrome.notifications.create({
      type: "basic",
      iconUrl: "icon.png",
      title: "👀 Descanse a vista",
      message: "Olhe para longe por 20 segundos."
    });
  }
});
