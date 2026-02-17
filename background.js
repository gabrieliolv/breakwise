// ===============================
// INICIAR LEMBRETES CONFIGURÁVEIS
// ===============================
function iniciarLembretes(config) {

  chrome.alarms.clearAll(() => {

    if (config.agua > 0) {
      chrome.alarms.create("agua", {
        delayInMinutes: config.agua,
        periodInMinutes: config.agua
      });
    }

    if (config.visao > 0) {
      chrome.alarms.create("visao", {
        delayInMinutes: config.visao,
        periodInMinutes: config.visao
      });
    }

    console.log("Alarmes iniciados:", config);
  });
}


// ===============================
// RECEBER MENSAGENS DO POPUP
// ===============================
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

  // ATIVAR / DESATIVAR EXTENSÃO
  if (request.action === "toggle") {

    chrome.storage.local.get(["ativo", "config"], (data) => {

      const novoEstado = !data.ativo;
      chrome.storage.local.set({ ativo: novoEstado });

      if (novoEstado) {
        iniciarLembretes(data.config || { agua: 120, visao: 30 });
      } else {
        chrome.alarms.clearAll();
      }

      sendResponse({ ativo: novoEstado });
    });

    return true;
  }


  // SALVAR CONFIGURAÇÃO
  if (request.action === "salvarConfig") {

    chrome.storage.local.set({ config: request.config });

    chrome.storage.local.get(["ativo"], (data) => {
      if (data.ativo) {
        iniciarLembretes(request.config);
      }
    });

    sendResponse({ salvo: true });
    return true;
  }


  // INICIAR PAUSA RÁPIDA (COM TIMESTAMP REAL)
  if (request.action === "iniciarPausa") {

    const agora = Date.now();
    const fim = agora + (request.tempo * 60 * 1000);

    chrome.storage.local.set({ pausaFim: fim });

    chrome.alarms.create("pausaRapida", {
      when: fim
    });

    sendResponse({ iniciado: true });
    return true;
  }


  // CANCELAR PAUSA
  if (request.action === "cancelarPausa") {

    chrome.alarms.clear("pausaRapida");
    chrome.storage.local.remove("pausaFim");

    sendResponse({ cancelado: true });
    return true;
  }
});


// ===============================
// DISPARO DOS ALARMES
// ===============================
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

  if (alarm.name === "pausaRapida") {

    chrome.storage.local.remove("pausaFim");

    chrome.notifications.create({
      type: "basic",
      iconUrl: "icon.png",
      title: "⏱️ Pausa finalizada!",
      message: "Hora de voltar ao foco."
    });
  }
});
