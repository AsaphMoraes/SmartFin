const CHAVE_TEMA = "smartfin:tema";

function temaInicial() {
  const salvo = localStorage.getItem(CHAVE_TEMA);
  if (salvo === "dark" || salvo === "light") {
    return salvo;
  }
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

function aplicarTema(tema) {
  document.documentElement.dataset.theme = tema;
  localStorage.setItem(CHAVE_TEMA, tema);
  document.querySelectorAll('input[name="tema"]').forEach((radio) => {
    radio.checked = radio.value === tema;
  });
  const rotulo = document.getElementById("rotulo-tema-atual");
  if (rotulo) {
    rotulo.textContent = tema === "dark" ? "Escuro" : "Claro";
  }
  if (typeof atualizarCoresGraficos === "function") {
    atualizarCoresGraficos();
  }
}
