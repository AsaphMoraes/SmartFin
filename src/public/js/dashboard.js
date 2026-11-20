const PREFIXO_CACHE_DASHBOARD = "smartfin:dashboard:";
const PALETA_GRAFICOS = [
  "#3B82F6",
  "#60A5FA",
  "#2563EB",
  "#93C5FD",
  "#1D4ED8",
  "#38BDF8",
  "#0EA5E9",
  "#64748B",
  "#94A3B8",
  "#CBD5E1",
];

let graficoBarra = null;
let graficoPizza = null;
let ultimoDashboard = null;

function iniciarDashboard() {
  ["filtro-estado", "filtro-categoria", "filtro-mes", "filtro-apelido"].forEach((id) => {
    document.getElementById(id).addEventListener("change", () => carregarDashboard());
  });
  document.getElementById("limpar-filtros").addEventListener("click", () => {
    document.getElementById("filtro-estado").value = "tudo";
    document.getElementById("filtro-categoria").value = "";
    document.getElementById("filtro-mes").value = "";
    document.getElementById("filtro-apelido").value = "";
    document.getElementById("estado-filtros").textContent = "Filtros removidos.";
    carregarDashboard();
  });
  document.getElementById("ver-todos").addEventListener("click", abrirTodosOsGastos);
  document.getElementById("fechar-todos").addEventListener("click", () => {
    document.getElementById("dialogo-todos").close();
  });
  carregarDashboard();
}

function coletarFiltrosDashboard() {
  const filtros = {};
  const categoria = document.getElementById("filtro-categoria").value;
  const mes = document.getElementById("filtro-mes").value;
  const apelido = document.getElementById("filtro-apelido").value;
  if (categoria) {
    filtros.id_categoria = Number(categoria);
  }
  if (mes) {
    filtros.mes = mes;
  }
  if (apelido) {
    filtros.apelido = apelido;
  }
  return filtros;
}

function lerCacheDashboard(chave) {
  try {
    const conteudo = localStorage.getItem(chave);
    return conteudo ? JSON.parse(conteudo) : null;
  } catch {
    return null;
  }
}

function gravarCacheDashboard(chave, dados) {
  try {
    localStorage.setItem(chave, JSON.stringify(dados));
    const versaoAtual = chave.slice(PREFIXO_CACHE_DASHBOARD.length).split(":")[0];
    Object.keys(localStorage)
      .filter((item) => item.startsWith(PREFIXO_CACHE_DASHBOARD) && !item.startsWith(`${PREFIXO_CACHE_DASHBOARD}${versaoAtual}:`))
      .forEach((item) => localStorage.removeItem(item));
  } catch {
    return;
  }
}

function limparCachesDashboard() {
  Object.keys(localStorage)
    .filter((item) => item.startsWith(PREFIXO_CACHE_DASHBOARD))
    .forEach((item) => localStorage.removeItem(item));
}

async function carregarDashboard(usarCache = true) {
  anunciarStatus("Carregando análise…");
  try {
    await apiPronta;
    const estado = document.getElementById("filtro-estado").value;
    const filtros = coletarFiltrosDashboard();
    const versao = await api().obter_versao_dados();
    const chave = `${PREFIXO_CACHE_DASHBOARD}${versao}:${estado}:${JSON.stringify(filtros)}`;
    let dados = usarCache ? lerCacheDashboard(chave) : null;
    if (!dados) {
      dados = await api().obter_dashboard(estado, filtros);
      gravarCacheDashboard(chave, dados);
    }
    ultimoDashboard = dados;
    renderizarDashboard(dados);
    anunciarStatus("Análise atualizada");
  } catch (erro) {
    tratarErro(erro);
  }
}

function renderizarDashboard(dados) {
  preencherOpcoesDashboard(dados.opcoes);
  renderizarResumo(dados);
  document.getElementById("estado-vazio").hidden = !dados.vazio;
  document.getElementById("cartoes").hidden = dados.vazio;
  document.getElementById("grade-graficos").hidden = dados.vazio;
  document.getElementById("secao-topo").hidden = dados.vazio;

  const container = document.getElementById("cartoes");
  container.replaceChildren(...dados.cartoes.map(criarCartaoDashboard));
  preencherListaGastos(document.getElementById("topo-gastos"), dados.topo);
  renderizarGraficos(dados.graficos);
  atualizarMensagemFiltros();
}

function renderizarResumo(dados) {
  const resumo = document.getElementById("resumo-dashboard");
  if (dados.vazio) {
    resumo.hidden = true;
    return;
  }
  resumo.hidden = false;
  const descricoes = {
    tudo: "Mostrando os destaques de todas as transações de gasto.",
    categoria: "Mostrando os destaques da categoria selecionada.",
    mes: "Mostrando os destaques do mês selecionado.",
    apelido: "Mostrando os destaques do apelido selecionado.",
  };
  resumo.textContent = descricoes[dados.estado] || descricoes.tudo;
}

function preencherOpcoesDashboard(opcoes) {
  preencherSelect("filtro-categoria", opcoes.categorias.map((categoria) => ({
    valor: categoria.id,
    rotulo: categoria.nome,
  })), "Todas");
  preencherSelect("filtro-mes", opcoes.meses.map((mes) => ({
    valor: mes.valor,
    rotulo: mes.rotulo,
  })), "Todos");
  preencherSelect("filtro-apelido", opcoes.apelidos.map((apelido) => ({
    valor: apelido,
    rotulo: apelido,
  })), "Todos");
}

function preencherSelect(id, itens, rotuloVazio) {
  const select = document.getElementById(id);
  const valorAtual = select.value;
  const opcoes = [new Option(rotuloVazio, "")].concat(
    itens.map((item) => new Option(item.rotulo, item.valor))
  );
  select.replaceChildren(...opcoes);
  const existe = itens.some((item) => String(item.valor) === valorAtual);
  select.value = existe ? valorAtual : "";
}

function criarCartaoDashboard(cartao) {
  const artigo = criarElemento("article", `cartao metric-card${cartao.principal ? " metric-card--principal" : ""}`);
  artigo.append(
    criarElemento("h3", "metric-rotulo", cartao.rotulo),
    criarElemento("p", "metric-valor", cartao.valor)
  );
  if (cartao.detalhe) {
    artigo.append(criarElemento("p", "metric-detalhe", cartao.detalhe));
  }
  return artigo;
}

function preencherListaGastos(container, itens) {
  if (!itens.length) {
    container.replaceChildren(criarElemento("li", "linha-vazia", "Nenhum gasto encontrado."));
    return;
  }
  container.replaceChildren(
    ...itens.map((item) => {
      const linha = criarElemento("li");
      const detalhe = criarElemento("span", "item-detalhe", `${item.apelido} · ${item.categoria}`);
      const meio = criarElemento("span");
      meio.append(criarElemento("span", "item-nome", item.nome), document.createElement("br"), detalhe);
      linha.append(
        criarElemento("span", "item-data", item.data),
        meio,
        criarElemento("span", "item-valor", item.valor)
      );
      return linha;
    })
  );
}

function abrirTodosOsGastos() {
  if (!ultimoDashboard) {
    return;
  }
  preencherListaGastos(document.getElementById("lista-todos"), ultimoDashboard.topo_completo);
  document.getElementById("dialogo-todos").showModal();
}

function coresDoTema() {
  const estilo = getComputedStyle(document.documentElement);
  return {
    texto: estilo.getPropertyValue("--text-secondary").trim(),
    grade: estilo.getPropertyValue("--border-default").trim(),
  };
}

function descreverSerie(tipo, serie) {
  if (!serie.labels.length) {
    return `${tipo} sem dados.`;
  }
  const partes = serie.labels.map((rotulo, indice) => `${rotulo}: ${formatarMoeda(serie.valores[indice] * 100)}`);
  return `${tipo} de ${serie.titulo.toLowerCase()}. ${partes.join("; ")}.`;
}

function renderizarGraficos(graficos) {
  const { texto, grade } = coresDoTema();
  document.getElementById("titulo-barra").textContent = graficos.barra.titulo;
  document.getElementById("titulo-pizza").textContent = graficos.pizza.titulo;
  document.getElementById("descricao-barra").textContent = descreverSerie("Gráfico de barras", graficos.barra);
  document.getElementById("descricao-pizza").textContent = descreverSerie("Gráfico de pizza", graficos.pizza);
  document.getElementById("grafico-barra").setAttribute("aria-label", graficos.barra.titulo);
  document.getElementById("grafico-pizza").setAttribute("aria-label", graficos.pizza.titulo);

  if (graficoBarra) {
    graficoBarra.destroy();
  }
  if (graficoPizza) {
    graficoPizza.destroy();
  }

  graficoBarra = new Chart(document.getElementById("grafico-barra"), {
    type: "bar",
    data: {
      labels: graficos.barra.labels,
      datasets: [
        {
          label: graficos.barra.titulo,
          data: graficos.barra.valores,
          backgroundColor: "#3B82F6",
          borderRadius: 4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (contexto) => formatarMoeda(contexto.parsed.y * 100),
          },
        },
      },
      scales: {
        x: { ticks: { color: texto }, grid: { display: false } },
        y: {
          ticks: { color: texto, callback: (valor) => formatarMoeda(valor * 100) },
          grid: { color: grade },
        },
      },
    },
  });

  graficoPizza = new Chart(document.getElementById("grafico-pizza"), {
    type: "pie",
    data: {
      labels: graficos.pizza.labels,
      datasets: [
        {
          label: graficos.pizza.titulo,
          data: graficos.pizza.valores,
          backgroundColor: graficos.pizza.labels.map((_, indice) => PALETA_GRAFICOS[indice % PALETA_GRAFICOS.length]),
          borderColor: getComputedStyle(document.documentElement).getPropertyValue("--bg-surface").trim(),
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: { color: texto, boxWidth: 12 },
        },
        tooltip: {
          callbacks: {
            label: (contexto) => `${contexto.label}: ${formatarMoeda(contexto.parsed * 100)}`,
          },
        },
      },
    },
  });
}

function atualizarCoresGraficos() {
  if (ultimoDashboard) {
    renderizarGraficos(ultimoDashboard.graficos);
  }
}

function atualizarMensagemFiltros() {
  const descricoes = [];
  const categoria = document.getElementById("filtro-categoria");
  const mes = document.getElementById("filtro-mes");
  const apelido = document.getElementById("filtro-apelido");
  if (categoria.value) {
    descricoes.push(`categoria ${categoria.selectedOptions[0].textContent}`);
  }
  if (mes.value) {
    descricoes.push(`mês ${mes.selectedOptions[0].textContent}`);
  }
  if (apelido.value) {
    descricoes.push(`apelido ${apelido.selectedOptions[0].textContent}`);
  }
  const estado = document.getElementById("filtro-estado");
  const texto = descricoes.length
    ? `Filtrado por: ${descricoes.join(", ")}. Visão: ${estado.selectedOptions[0].textContent}.`
    : `Sem filtros aplicados. Visão: ${estado.selectedOptions[0].textContent}.`;
  document.getElementById("estado-filtros").textContent = texto;
}
