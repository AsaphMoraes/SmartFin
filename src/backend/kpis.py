import pandas as pd

from . import database

MESES_ABREVIADOS = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"]
LIMITE_TOPO = 5
LIMITE_TOPO_COMPLETO = 300


def carregar_transacoes():
    conexao = database.get_connection()
    try:
        return pd.read_sql_query(
            "SELECT r.id, r.data, r.valor_centavos, r.nome, r.apelido, r.id_categoria, "
            "c.nome AS categoria FROM registros r JOIN categorias c ON c.id = r.id_categoria",
            conexao,
        )
    finally:
        conexao.close()


def dashboard(estado="tudo", filtros=None):
    filtros = filtros or {}
    transacoes = carregar_transacoes()
    filtradas = _aplicar_filtros(transacoes, filtros)
    gastos = filtradas[filtradas["valor_centavos"] < 0].copy()
    gastos["gasto"] = -gastos["valor_centavos"]
    gastos["mes"] = gastos["data"].str.slice(0, 7)
    gastos["apelido"] = gastos["apelido"].fillna("")

    resultado = {
        "versao": database.versao_dados(),
        "estado": estado,
        "opcoes": _montar_opcoes(transacoes),
        "vazio": gastos.empty,
    }
    if gastos.empty:
        resultado.update(
            {
                "cartoes": [],
                "topo": [],
                "topo_completo": [],
                "graficos": _graficos_vazios(),
            }
        )
        return resultado

    montadores = {
        "tudo": _kpis_tudo,
        "categoria": _kpis_categoria,
        "mes": _kpis_mes,
        "apelido": _kpis_apelido,
    }
    cartoes, graficos = montadores.get(estado, _kpis_tudo)(gastos)
    resultado.update(
        {
            "cartoes": cartoes,
            "topo": _montar_topo(gastos, LIMITE_TOPO),
            "topo_completo": _montar_topo(gastos, LIMITE_TOPO_COMPLETO),
            "graficos": graficos,
        }
    )
    return resultado


def _kpis_tudo(gastos):
    categoria = _maior_por_soma(gastos, "categoria")
    mes = _maior_por_soma(gastos, "mes")
    apelido = _maior_por_soma(gastos, "apelido")
    cartoes = [
        _cartao("Total gasto", _formatar_moeda(gastos["gasto"].sum()), principal=True),
        _cartao("Categoria com maior gasto", categoria[0], _formatar_moeda(categoria[1])),
        _cartao("Mês com maior gasto", _formatar_mes(mes[0]), _formatar_moeda(mes[1])),
        _cartao("Apelido com maior gasto", apelido[0] or "Sem apelido", _formatar_moeda(apelido[1])),
    ]
    graficos = {
        "barra": _serie_mensal(gastos, "Gastos por mês"),
        "pizza": _serie_categoria(gastos, "Gastos por categoria"),
    }
    return cartoes, graficos


def _kpis_categoria(gastos):
    media = gastos["gasto"].mean()
    cartoes = [
        _cartao("Gasto médio por transação", _formatar_moeda(media), principal=True),
        _cartao("Maior gasto numa transação", _formatar_moeda(gastos["gasto"].max())),
        _cartao("Menor gasto numa transação", _formatar_moeda(gastos["gasto"].min())),
        _cartao("Total gasto na categoria", _formatar_moeda(gastos["gasto"].sum())),
    ]
    graficos = {
        "barra": _serie_mensal(gastos, "Gastos por mês na categoria"),
        "pizza": _serie_apelido(gastos, "Gastos por apelido"),
    }
    return cartoes, graficos


def _kpis_mes(gastos):
    dia_maior_gasto = gastos.groupby("data")["gasto"].sum().idxmax()
    dia_mais_transacoes = gastos.groupby("data").size().idxmax()
    quantidade_transacoes = int(gastos.loc[gastos["data"] == dia_mais_transacoes].shape[0])
    categoria = _maior_por_soma(gastos, "categoria")
    cartoes = [
        _cartao("Total gasto no mês", _formatar_moeda(gastos["gasto"].sum()), principal=True),
        _cartao("Dia com maior gasto", _formatar_data(dia_maior_gasto), _formatar_moeda(
            gastos.loc[gastos["data"] == dia_maior_gasto, "gasto"].sum()
        )),
        _cartao(
            "Dia com mais transações",
            _formatar_data(dia_mais_transacoes),
            f"{quantidade_transacoes} transaç{'ão' if quantidade_transacoes == 1 else 'ões'}",
        ),
        _cartao("Categoria com maior gasto", categoria[0], _formatar_moeda(categoria[1])),
    ]
    graficos = {
        "barra": _serie_diaria(gastos, "Gastos por dia"),
        "pizza": _serie_categoria(gastos, "Gastos por categoria"),
    }
    return cartoes, graficos


def _kpis_apelido(gastos):
    cartoes = [
        _cartao("Gasto médio por transação", _formatar_moeda(gastos["gasto"].mean()), principal=True),
        _cartao("Maior gasto numa transação", _formatar_moeda(gastos["gasto"].max())),
        _cartao("Menor gasto numa transação", _formatar_moeda(gastos["gasto"].min())),
        _cartao("Total gasto do apelido", _formatar_moeda(gastos["gasto"].sum())),
    ]
    graficos = {
        "barra": _serie_mensal(gastos, "Gastos por mês do apelido"),
        "pizza": _serie_categoria(gastos, "Gastos por categoria"),
    }
    return cartoes, graficos


def _aplicar_filtros(transacoes, filtros):
    filtradas = transacoes
    if filtros.get("id_categoria"):
        filtradas = filtradas[filtradas["id_categoria"] == int(filtros["id_categoria"])]
    if filtros.get("mes"):
        filtradas = filtradas[filtradas["data"].str.startswith(filtros["mes"])]
    if filtros.get("apelido"):
        filtradas = filtradas[filtradas["apelido"].fillna("") == filtros["apelido"]]
    return filtradas


def _montar_opcoes(transacoes):
    meses = sorted(transacoes["data"].str.slice(0, 7).dropna().unique(), reverse=True)
    apelidos = sorted(transacoes["apelido"].dropna().unique())
    return {
        "categorias": database.listar_categorias(),
        "meses": [{"valor": mes, "rotulo": _formatar_mes(mes)} for mes in meses],
        "apelidos": apelidos,
    }


def _maior_por_soma(gastos, coluna):
    somas = gastos.groupby(coluna)["gasto"].sum()
    if somas.empty:
        return ("", 0)
    chave = somas.idxmax()
    return (str(chave), int(somas.max()))


def _serie_mensal(gastos, titulo):
    serie = gastos.groupby("mes")["gasto"].sum().sort_index()
    return {
        "titulo": titulo,
        "labels": [_formatar_mes(mes) for mes in serie.index],
        "valores": [round(float(valor) / 100, 2) for valor in serie.values],
    }


def _serie_diaria(gastos, titulo):
    serie = gastos.groupby("data")["gasto"].sum().sort_index()
    return {
        "titulo": titulo,
        "labels": [data[8:10] for data in serie.index],
        "valores": [round(float(valor) / 100, 2) for valor in serie.values],
    }


def _serie_categoria(gastos, titulo):
    serie = gastos.groupby("categoria")["gasto"].sum().sort_values(ascending=False)
    return {
        "titulo": titulo,
        "labels": list(serie.index),
        "valores": [round(float(valor) / 100, 2) for valor in serie.values],
    }


def _serie_apelido(gastos, titulo):
    rotulos = gastos["apelido"].where(gastos["apelido"] != "", "Sem apelido")
    serie = gastos.assign(rotulo_apelido=rotulos).groupby("rotulo_apelido")["gasto"].sum().sort_values(ascending=False)
    return {
        "titulo": titulo,
        "labels": list(serie.index),
        "valores": [round(float(valor) / 100, 2) for valor in serie.values],
    }


def _montar_topo(gastos, limite):
    ordenado = gastos.sort_values(["gasto", "data"], ascending=[False, False]).head(limite)
    return [
        {
            "data": _formatar_data(linha.data),
            "nome": linha.nome,
            "apelido": linha.apelido or "Sem apelido",
            "categoria": linha.categoria,
            "valor": _formatar_moeda(int(linha.gasto)),
        }
        for linha in ordenado.itertuples()
    ]


def _graficos_vazios():
    return {
        "barra": {"titulo": "Sem dados", "labels": [], "valores": []},
        "pizza": {"titulo": "Sem dados", "labels": [], "valores": []},
    }


def _cartao(rotulo, valor, detalhe="", principal=False):
    return {"rotulo": rotulo, "valor": valor, "detalhe": detalhe, "principal": principal}


def _formatar_moeda(centavos):
    reais = float(centavos) / 100
    texto = f"{reais:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")
    return f"R$ {texto}"


def _formatar_mes(mes):
    ano, numero = mes.split("-")
    return f"{MESES_ABREVIADOS[int(numero) - 1]}/{ano}"


def _formatar_data(data_iso):
    return f"{data_iso[8:10]}/{data_iso[5:7]}/{data_iso[:4]}"
