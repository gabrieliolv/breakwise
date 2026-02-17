const pausaBtn = document.getElementById("pausaBtn");
const cronometroEl = document.getElementById("cronometro");
const toggleBtn = document.getElementById("toggle");
const statusEl = document.getElementById("status");

let intervalo;

// =============================
// ATUALIZA STATUS ATIVO/INATIVO
// =============================
function atualizarUI(ativo) {

  if (ativo) {
    statusEl.textContent = "ATIVO";
    toggleBtn.textContent = "Desativar";
    toggleBtn.classList.remove("inativo");
    toggleBtn.classList.add("ativo");
  } else {
    statusEl.textContent = "INATIVO";
    toggleBtn.textContent = "Ativar";
    toggleBtn.classList.remove("ativo");
    toggleBtn.classList.add("inativo");
  }
}

// =============================
// VERIFICAR ESTADO AO ABRIR
// =============================
chrome.storage.local.get(["ativo", "config"], (data) => {

  atualizarUI(data.ativo || false);

  if (data.config) {
    document.getElementById("agua").value = data.config.agua;
    document.getElementById("visao").value = data.config.visao;
  }
});

// =============================
// TOGGLE ATIVAR/DESATIVAR
// =============================
toggleBtn.addEventListener("click", () => {

  chrome.runtime.sendMessage({ action: "toggle" }, (response) => {
    atualizarUI(response.ativo);
  });

});

// =============================
// SALVAR CONFIG
// =============================
document.getElementById("salvar").addEventListener("click", () => {

  const config = {
    agua: parseInt(document.getElementById("agua").value),
    visao: parseInt(document.getElementById("visao").value)
  };

  chrome.runtime.sendMessage({ action: "salvarConfig", config }, () => {
    alert("Configuração salva!");
  });

});

// =============================
// CRONÔMETRO PERSISTENTE
// =============================
function atualizarCronometro() {

  chrome.storage.local.get(["pausaFim"], (data) => {

    if (!data.pausaFim) {
      cronometroEl.textContent = "00:00";
      return;
    }

    const tempoRestante = Math.floor((data.pausaFim - Date.now()) / 1000);

    if (tempoRestante <= 0) {
      cronometroEl.textContent = "00:00";
      clearInterval(intervalo);
      return;
    }

    const minutos = Math.floor(tempoRestante / 60);
    const segundos = tempoRestante % 60;

    cronometroEl.textContent =
      `${String(minutos).padStart(2, "0")}:${String(segundos).padStart(2, "0")}`;
  });
}

// Atualiza ao abrir
atualizarCronometro();
intervalo = setInterval(atualizarCronometro, 1000);

// =============================
// INICIAR PAUSA
// =============================
pausaBtn.addEventListener("click", () => {

  const tempo = parseInt(document.getElementById("tempoPausa").value);

  chrome.runtime.sendMessage({ action: "iniciarPausa", tempo });

});
