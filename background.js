function iniciarLembretes(config) {
  chrome.alarms.create("agua", { periodInMinutes: config.agua });
  chrome.alarms.create("visao", { periodInMinutes: config.visao });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

  if (request.action === "toggle") {

    chrome.storage.local.get(["ativo", "config"], (data) => {
      const novoEstado = !data.ativo;

      chrome.storage.local.set({ ativo: novoEstado });

      if (novoEstado) {
        iniciarLembretes(data.config);
      } else {
        chrome.alarms.clearAll();
      }

      sendResponse({ ativo: novoEstado });
    });

    return true;
  }

  if (request.action === "salvarConfig") {
    chrome.storage.local.set({ config: request.config });
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
