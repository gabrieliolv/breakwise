// ==========================================
// INICIAR ALARMES
// ==========================================
function iniciarLembretes(config) {

  chrome.alarms.clearAll(() => {

    if (config?.agua > 0) {
      chrome.alarms.create("agua", {
        delayInMinutes: config.agua,
        periodInMinutes: config.agua
      });
    }

    if (config?.visao > 0) {
      chrome.alarms.create("visao", {
        delayInMinutes: config.visao,
        periodInMinutes: config.visao
      });
    }

    console.log("Alarmes iniciados:", config);
  });
}


// ==========================================
// FUNÇÃO SEGURA DE NOTIFICAÇÃO
// ==========================================
async function enviarNotificacao(titulo, mensagem) {
  try {
    await chrome.notifications.create(
      crypto.randomUUID(),
      {
        type: "basic",
        iconUrl: chrome.runtime.getURL("icon.png"),
        title: titulo,
        message: mensagem
      }
    );
  } catch (erro) {
    console.error("Erro ao criar notificação:", erro);
  }
}


// ==========================================
// MENSAGENS DO POPUP
// ==========================================
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

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
});


// ==========================================
// DISPARO DOS ALARMES
// ==========================================
chrome.alarms.onAlarm.addListener((alarm) => {

  console.log("Alarme disparado:", alarm.name);

  const opcoes = {
    type: "basic",
    iconUrl: chrome.runtime.getURL("icon.png"),
    title: "",
    message: ""
  };

  if (alarm.name === "agua") {
    opcoes.title = "💧 Hora de beber água";
    opcoes.message = "Mantenha-se hidratada.";
  }

  if (alarm.name === "visao") {
    opcoes.title = "👀 Descanse a vista";
    opcoes.message = "Olhe para longe por 20 segundos.";
  }

  if (alarm.name === "pausaRapida") {
    chrome.storage.local.remove("pausaFim");
    opcoes.title = "⏱️ Pausa finalizada!";
    opcoes.message = "Hora de voltar ao foco.";
  }

  // IMPORTANTE: usar callback para manter worker ativo
  chrome.notifications.create(
    `notif-${Date.now()}`,
    opcoes,
    () => {
      console.log("Notificação criada");
    }
  );
});

// ==========================================
// REINICIAR SE JÁ ESTAVA ATIVO
// ==========================================
chrome.storage.local.get(["ativo", "config"], (data) => {
  if (data.ativo) {
    iniciarLembretes(data.config || { agua: 120, visao: 30 });
  }
});
