const apiPronta = new Promise((resolver) => {
  if (window.pywebview && window.pywebview.api) {
    resolver(window.pywebview.api);
  } else {
    window.addEventListener("pywebviewready", () => resolver(window.pywebview.api));
  }
});

function api() {
  return window.pywebview.api;
}

const formatadorMoeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

function formatarMoeda(centavos) {
  return formatadorMoeda.format((Number(centavos) || 0) / 100);
}

function formatarDataIso(dataIso) {
  if (!dataIso) {
    return "";
  }
  const [ano, mes, dia] = dataIso.split("-");
  return `${dia}/${mes}/${ano}`;
}

function converterTextoParaCentavos(texto) {
  const limpo = String(texto ?? "").replace(/\s/g, "").replace("R$", "");
  if (!limpo) {
    return 0;
  }
  const normalizado = limpo.includes(",") ? limpo.replace(/\./g, "").replace(",", ".") : limpo;
  return Math.round(Number(normalizado) * 100);
}

function criarElemento(tag, classe, texto) {
  const elemento = document.createElement(tag);
  if (classe) {
    elemento.className = classe;
  }
  if (texto !== undefined) {
    elemento.textContent = texto;
  }
  return elemento;
}

function anunciarStatus(mensagem) {
  document.getElementById("status-app").textContent = mensagem;
}

function mostrarToast(mensagem, tipo) {
  const toast = criarElemento("div", `toast${tipo === "erro" ? " toast--erro" : ""}`, mensagem);
  document.getElementById("toasts").append(toast);
  window.setTimeout(() => toast.remove(), 4500);
}

function mensagemDeErro(erro) {
  return String(erro && erro.message ? erro.message : erro).replace(/^Error:\s*/, "");
}

function tratarErro(erro) {
  const mensagem = mensagemDeErro(erro);
  mostrarToast(mensagem, "erro");
  anunciarStatus(`Erro: ${mensagem}`);
}

function configurarAbas() {
  const abas = Array.from(document.querySelectorAll('[role="tab"]'));

  function ativarAba(aba) {
    abas.forEach((outra) => {
      const ativa = outra === aba;
      outra.setAttribute("aria-selected", String(ativa));
      outra.tabIndex = ativa ? 0 : -1;
    });
    document.querySelectorAll('[role="tabpanel"]').forEach((painel) => {
      painel.hidden = painel.id !== `painel-${aba.dataset.aba}`;
    });
    document.getElementById("titulo-pagina").textContent = aba.dataset.titulo;
    document.title = `SmartFin — ${aba.dataset.titulo}`;
  }

  abas.forEach((aba, indice) => {
    aba.addEventListener("click", () => ativarAba(aba));
    aba.addEventListener("keydown", (evento) => {
      const teclas = ["ArrowDown", "ArrowUp", "Home", "End"];
      if (!teclas.includes(evento.key)) {
        return;
      }
      evento.preventDefault();
      let alvo = indice;
      if (evento.key === "ArrowDown") {
        alvo = (indice + 1) % abas.length;
      } else if (evento.key === "ArrowUp") {
        alvo = (indice - 1 + abas.length) % abas.length;
      } else if (evento.key === "Home") {
        alvo = 0;
      } else if (evento.key === "End") {
        alvo = abas.length - 1;
      }
      ativarAba(abas[alvo]);
      abas[alvo].focus();
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  aplicarTema(temaInicial());
  configurarAbas();
  iniciarDashboard();
  iniciarRegistros();
  iniciarConfiguracoes();
});
