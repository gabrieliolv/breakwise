const statusEl = document.getElementById("status");
const toggleBtn = document.getElementById("toggle");

function atualizarUI(ativo) {
  statusEl.textContent = ativo ? "ATIVO" : "INATIVO";
  toggleBtn.textContent = ativo ? "Desativar" : "Ativar";
}

chrome.storage.local.get(["ativo", "config"], (data) => {
  atualizarUI(data.ativo || false);

  if (data.config) {
    document.getElementById("agua").value = data.config.agua;
    document.getElementById("visao").value = data.config.visao;
  }
});

toggleBtn.addEventListener("click", () => {
  chrome.runtime.sendMessage({ action: "toggle" }, (response) => {
    atualizarUI(response.ativo);
  });
});

document.getElementById("salvar").addEventListener("click", () => {
  const config = {
    agua: parseInt(document.getElementById("agua").value),
    visao: parseInt(document.getElementById("visao").value)
  };

  chrome.runtime.sendMessage({ action: "salvarConfig", config });

  alert("Configuração salva!");
});
