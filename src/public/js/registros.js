const estadoRegistros = {
  categorias: [],
  registroEmEdicao: null,
  registroParaExcluir: null,
  importacao: null,
};

function iniciarRegistros() {
  document.getElementById("form-filtros-registros").addEventListener("submit", (evento) => {
    evento.preventDefault();
    carregarRegistros();
  });
  document.getElementById("form-filtros-registros").addEventListener("reset", () => {
    window.setTimeout(carregarRegistros, 0);
  });
  document.getElementById("botao-novo-registro").addEventListener("click", () => abrirFormularioRegistro());
  document.getElementById("cancelar-registro").addEventListener("click", fecharFormularioRegistro);
  document.getElementById("form-registro").addEventListener("submit", salvarRegistro);
  document.getElementById("botao-upload").addEventListener("click", iniciarImportacao);
  document.getElementById("cancelar-excluir").addEventListener("click", () => {
    document.getElementById("dialogo-excluir").close();
  });
  document.getElementById("confirmar-excluir").addEventListener("click", confirmarExclusao);
  configurarClassificacao();
  carregarCategorias();
}

async function carregarCategorias() {
  try {
    await apiPronta;
    estadoRegistros.categorias = await api().listar_categorias();
    preencherCategoriaFiltro();
    preencherCategoriaFormulario();
    preencherCategoriaClassificacao();
  } catch (erro) {
    tratarErro(erro);
  }
}

function preencherCategoriaFiltro() {
  const select = document.getElementById("busca-categoria");
  const valorAtual = select.value;
  select.replaceChildren(
    new Option("Todas", ""),
    ...estadoRegistros.categorias.map((categoria) => new Option(categoria.nome, categoria.id))
  );
  if (estadoRegistros.categorias.some((categoria) => String(categoria.id) === valorAtual)) {
    select.value = valorAtual;
  }
}

function preencherCategoriaFormulario() {
  const select = document.getElementById("registro-categoria");
  const valorAtual = select.value;
  select.replaceChildren(
    ...estadoRegistros.categorias.map((categoria) => new Option(categoria.nome, categoria.id))
  );
  if (estadoRegistros.categorias.some((categoria) => String(categoria.id) === valorAtual)) {
    select.value = valorAtual;
  }
}

function preencherCategoriaClassificacao() {
  const select = document.getElementById("classificacao-categoria");
  select.replaceChildren(
    new Option("Selecione uma categoria", ""),
    ...estadoRegistros.categorias.map((categoria) => new Option(categoria.nome, categoria.id)),
    new Option("Criar nova categoria…", "__nova__")
  );
  const padrao = estadoRegistros.categorias.find((categoria) => categoria.nome === "Outros");
  select.value = padrao ? String(padrao.id) : "";
  alternarCampoNovaCategoria();
}

async function carregarRegistros() {
  anunciarStatus("Carregando registros…");
  try {
    await apiPronta;
    const registros = await api().listar_registros(coletarFiltrosRegistros());
    renderizarTabela(registros);
    document.getElementById("status-registros").textContent = `${registros.length} registro(s) exibido(s).`;
    anunciarStatus("Registros atualizados");
  } catch (erro) {
    tratarErro(erro);
  }
}

function coletarFiltrosRegistros() {
  const filtros = {};
  const nome = document.getElementById("busca-nome").value.trim();
  const apelido = document.getElementById("busca-apelido").value.trim();
  const categoria = document.getElementById("busca-categoria").value;
  const valorMinimo = document.getElementById("busca-valor-min").value;
  const valorMaximo = document.getElementById("busca-valor-max").value;
  const dataInicio = document.getElementById("busca-data-inicio").value;
  const dataFim = document.getElementById("busca-data-fim").value;
  if (nome) {
    filtros.nome = nome;
  }
  if (apelido) {
    filtros.apelido = apelido;
  }
  if (categoria) {
    filtros.id_categoria = Number(categoria);
  }
  if (valorMinimo !== "") {
    filtros.valor_min_centavos = converterTextoParaCentavos(valorMinimo);
  }
  if (valorMaximo !== "") {
    filtros.valor_max_centavos = converterTextoParaCentavos(valorMaximo);
  }
  if (dataInicio) {
    filtros.data_inicio = dataInicio;
  }
  if (dataFim) {
    filtros.data_fim = dataFim;
  }
  return filtros;
}

function renderizarTabela(registros) {
  const corpo = document.getElementById("corpo-tabela");
  if (!registros.length) {
    const linha = criarElemento("tr", "linha-vazia");
    const celula = criarElemento("td", "", "Nenhum registro encontrado.");
    celula.colSpan = 6;
    linha.append(celula);
    corpo.replaceChildren(linha);
    return;
  }

  corpo.replaceChildren(
    ...registros.map((registro) => {
      const linha = criarElemento("tr");
      const valor = criarElemento(
        "td",
        `alinhar-direita${registro.valor_centavos < 0 ? " valor-negativo" : ""}`,
        formatarMoeda(registro.valor_centavos)
      );
      const acoes = criarElemento("td");
      const grupo = criarElemento("div", "acoes-tabela");
      grupo.append(
        criarBotaoAcao("Editar", `Editar registro de ${registro.nome}`, () => abrirFormularioRegistro(registro)),
        criarBotaoAcao("Excluir", `Excluir registro de ${registro.nome}`, () => abrirConfirmacaoExclusao(registro), "botao-perigo")
      );
      acoes.append(grupo);
      linha.append(
        criarElemento("td", "", formatarDataIso(registro.data)),
        criarElemento("td", "", registro.nome),
        criarElemento("td", "", registro.apelido || "—"),
        criarElemento("td", "", registro.categoria),
        valor,
        acoes
      );
      return linha;
    })
  );
}

function criarBotaoAcao(rotulo, nomeAcessivel, aoClicar, variante) {
  const botao = criarElemento("button", `botao botao-secundario botao-icone${variante ? ` ${variante}` : ""}`, rotulo);
  botao.type = "button";
  botao.setAttribute("aria-label", nomeAcessivel);
  botao.addEventListener("click", aoClicar);
  return botao;
}

function abrirFormularioRegistro(registro) {
  estadoRegistros.registroEmEdicao = registro || null;
  const formulario = document.getElementById("form-registro");
  formulario.reset();
  preencherCategoriaFormulario();
  document.getElementById("erro-registro").hidden = true;
  document.getElementById("titulo-dialogo-registro").textContent = registro ? "Editar registro" : "Novo registro";

  if (registro) {
    document.getElementById("registro-nome").value = registro.nome;
    document.getElementById("registro-valor").value = (registro.valor_centavos / 100).toFixed(2);
    document.getElementById("registro-data").value = registro.data;
    document.getElementById("registro-categoria").value = String(registro.id_categoria);
    document.getElementById("registro-apelido").value = registro.apelido || "";
  } else {
    document.getElementById("registro-data").value = new Date().toISOString().slice(0, 10);
  }

  document.getElementById("dialogo-registro").showModal();
  document.getElementById("registro-nome").focus();
}

function fecharFormularioRegistro() {
  estadoRegistros.registroEmEdicao = null;
  document.getElementById("dialogo-registro").close();
}

async function salvarRegistro(evento) {
  evento.preventDefault();
  const formulario = document.getElementById("form-registro");
  if (!formulario.reportValidity()) {
    return;
  }

  const dados = {
    nome: document.getElementById("registro-nome").value.trim(),
    valor_centavos: converterTextoParaCentavos(document.getElementById("registro-valor").value),
    data: document.getElementById("registro-data").value,
    id_categoria: Number(document.getElementById("registro-categoria").value),
    apelido: document.getElementById("registro-apelido").value.trim(),
  };

  const emEdicao = estadoRegistros.registroEmEdicao;
  try {
    await apiPronta;
    if (emEdicao) {
      await api().atualizar_registro(emEdicao.id, dados);
      mostrarToast("Registro atualizado.");
    } else {
      await api().criar_registro(dados);
      mostrarToast("Registro criado.");
    }
    fecharFormularioRegistro();
    await carregarRegistros();
    await carregarDashboard(false);
  } catch (erro) {
    const area = document.getElementById("erro-registro");
    area.textContent = mensagemDeErro(erro);
    area.hidden = false;
    document.getElementById("registro-nome").focus();
  }
}

function abrirConfirmacaoExclusao(registro) {
  estadoRegistros.registroParaExcluir = registro;
  document.getElementById("texto-dialogo-excluir").textContent =
    `Deseja excluir o registro "${registro.nome}" no valor de ${formatarMoeda(registro.valor_centavos)}?`;
  document.getElementById("dialogo-excluir").showModal();
}

async function confirmarExclusao() {
  const registro = estadoRegistros.registroParaExcluir;
  if (!registro) {
    return;
  }
  try {
    await apiPronta;
    await api().excluir_registro(registro.id);
    estadoRegistros.registroParaExcluir = null;
    document.getElementById("dialogo-excluir").close();
    mostrarToast("Registro excluído.");
    await carregarRegistros();
    await carregarDashboard(false);
  } catch (erro) {
    tratarErro(erro);
  }
}

function definirStatusUpload(mensagem) {
  document.getElementById("status-upload").textContent = mensagem;
  anunciarStatus(mensagem);
}

async function iniciarImportacao() {
  try {
    await apiPronta;
    const caminho = await api().selecionar_csv();
    if (!caminho) {
      return;
    }
    definirStatusUpload("Analisando arquivo…");
    const analise = await api().analisar_csv(caminho);
    estadoRegistros.importacao = { caminho, analise, indice: 0, classificacoes: [] };
    definirStatusUpload(
      `${analise.novos.length} nome(s) novo(s) para classificar; ${analise.reconhecidos} transação(ões) já reconhecida(s); ${analise.duplicados} duplicada(s) ignorada(s).`
    );
    if (!analise.novos.length) {
      await concluirImportacao();
      return;
    }
    preencherWizard();
    document.getElementById("dialogo-classificacao").showModal();
    document.getElementById("classificacao-categoria").focus();
  } catch (erro) {
    estadoRegistros.importacao = null;
    definirStatusUpload("Falha na importação.");
    tratarErro(erro);
  }
}

function configurarClassificacao() {
  const dialogo = document.getElementById("dialogo-classificacao");
  document.getElementById("classificacao-categoria").addEventListener("change", alternarCampoNovaCategoria);
  document.getElementById("classificacao-proximo").addEventListener("click", avancarClassificacao);
  document.getElementById("classificacao-voltar").addEventListener("click", voltarClassificacao);
  document.getElementById("form-classificacao").addEventListener("submit", (evento) => {
    evento.preventDefault();
    avancarClassificacao();
  });
  dialogo.addEventListener("close", () => {
    if (estadoRegistros.importacao) {
      estadoRegistros.importacao = null;
      definirStatusUpload("Importação cancelada.");
    }
  });
}

function alternarCampoNovaCategoria() {
  const select = document.getElementById("classificacao-categoria");
  document.getElementById("campo-nova-categoria").hidden = select.value !== "__nova__";
}

function preencherWizard(prefill) {
  const importacao = estadoRegistros.importacao;
  const item = importacao.analise.novos[importacao.indice];
  document.getElementById("progresso-classificacao").textContent =
    `Classificação ${importacao.indice + 1} de ${importacao.analise.novos.length}. ` +
    "As próximas transações com o mesmo nome usarão esta classificação.";
  document.getElementById("nome-classificacao").textContent = item.nome;
  document.getElementById("ocorrencias-classificacao").textContent = `${item.ocorrencias} transação(ões) com este nome.`;
  document.getElementById("exemplos-classificacao").replaceChildren(
    ...item.exemplos.map((exemplo) => criarElemento("li", "", exemplo))
  );
  document.getElementById("erro-classificacao").hidden = true;

  const select = document.getElementById("classificacao-categoria");
  const campoNova = document.getElementById("classificacao-nova-categoria");
  select.value = "";
  campoNova.value = "";
  document.getElementById("classificacao-apelido").value = "";

  if (prefill) {
    if (prefill.categoria_nome) {
      select.value = "__nova__";
      campoNova.value = prefill.categoria_nome;
    } else if (prefill.id_categoria) {
      select.value = String(prefill.id_categoria);
    }
    document.getElementById("classificacao-apelido").value = prefill.apelido || "";
  }
  alternarCampoNovaCategoria();
  document.getElementById("classificacao-voltar").disabled = importacao.indice === 0;
  document.getElementById("classificacao-proximo").textContent =
    importacao.indice === importacao.analise.novos.length - 1 ? "Importar transações" : "Próximo";
}

function avancarClassificacao() {
  const importacao = estadoRegistros.importacao;
  if (!importacao) {
    return;
  }
  const select = document.getElementById("classificacao-categoria");
  const novaCategoria = document.getElementById("classificacao-nova-categoria").value.trim();
  const apelido = document.getElementById("classificacao-apelido").value.trim();
  const erro = document.getElementById("erro-classificacao");
  const item = importacao.analise.novos[importacao.indice];

  if (!select.value) {
    erro.textContent = "Selecione uma categoria para continuar.";
    erro.hidden = false;
    select.focus();
    return;
  }
  if (select.value === "__nova__" && !novaCategoria) {
    erro.textContent = "Informe o nome da nova categoria.";
    erro.hidden = false;
    document.getElementById("classificacao-nova-categoria").focus();
    return;
  }

  importacao.classificacoes.push(
    select.value === "__nova__"
      ? { nome: item.nome, categoria_nome: novaCategoria, apelido }
      : { nome: item.nome, id_categoria: Number(select.value), apelido }
  );
  erro.hidden = true;

  if (importacao.indice === importacao.analise.novos.length - 1) {
    concluirImportacao();
    return;
  }
  importacao.indice += 1;
  preencherWizard();
  document.getElementById("classificacao-categoria").focus();
}

function voltarClassificacao() {
  const importacao = estadoRegistros.importacao;
  if (!importacao || importacao.indice === 0) {
    return;
  }
  const anterior = importacao.classificacoes.pop();
  importacao.indice -= 1;
  preencherWizard(anterior);
  document.getElementById("classificacao-categoria").focus();
}

async function concluirImportacao() {
  const importacao = estadoRegistros.importacao;
  if (!importacao) {
    return;
  }
  estadoRegistros.importacao = null;
  const dialogo = document.getElementById("dialogo-classificacao");
  if (dialogo.open) {
    dialogo.close();
  }
  definirStatusUpload("Importando transações…");
  try {
    await apiPronta;
    const resultado = await api().importar_csv(importacao.caminho, importacao.classificacoes);
    definirStatusUpload(`${resultado.inseridos} transação(ões) importada(s); ${resultado.ignorados} ignorada(s).`);
    mostrarToast(`${resultado.inseridos} transação(ões) importada(s).`);
    await carregarCategorias();
    await carregarRegistros();
    await carregarDashboard(false);
  } catch (erro) {
    definirStatusUpload("Falha na importação.");
    tratarErro(erro);
  }
}
