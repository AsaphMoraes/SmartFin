function iniciarConfiguracoes() {
  document.querySelectorAll('input[name="tema"]').forEach((radio) => {
    radio.checked = radio.value === document.documentElement.dataset.theme;
    radio.addEventListener("change", () => aplicarTema(radio.value));
  });
  document.getElementById("botao-apagar-dados").addEventListener("click", () => {
    document.getElementById("dialogo-apagar").showModal();
  });
  document.getElementById("cancelar-apagar").addEventListener("click", () => {
    document.getElementById("dialogo-apagar").close();
  });
  document.getElementById("confirmar-apagar").addEventListener("click", apagarTodosOsDados);
}

async function apagarTodosOsDados() {
  const botao = document.getElementById("confirmar-apagar");
  botao.disabled = true;
  try {
    await apiPronta;
    await api().apagar_todos_dados();
    limparCachesDashboard();
    document.getElementById("dialogo-apagar").close();
    mostrarToast("Todos os dados foram apagados.");
    await carregarCategorias();
    await carregarRegistros();
    await carregarDashboard(false);
  } catch (erro) {
    tratarErro(erro);
  } finally {
    botao.disabled = false;
  }
}
