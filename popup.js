const pausaBtn = document.getElementById("pausaBtn");
const cronometroEl = document.getElementById("cronometro");

let intervalo;

// Atualiza contador baseado no timestamp real
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

// Ao abrir popup
atualizarCronometro();
intervalo = setInterval(atualizarCronometro, 1000);

// Iniciar pausa
pausaBtn.addEventListener("click", () => {

  const tempo = parseInt(document.getElementById("tempoPausa").value);

  chrome.runtime.sendMessage({ action: "iniciarPausa", tempo });
});
