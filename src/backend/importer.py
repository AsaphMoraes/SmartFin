import re

import pandas as pd

from . import database

PREFIXOS_DESCRICAO = re.compile(
    r"^(Estorno|Compra no débito via NuPay|Compra no débito|Compra no crédito|"
    r"Transferência enviada pelo Pix via Open Banking|"
    r"Transferência recebida pelo Pix via Open Banking|"
    r"Transferência enviada pelo Pix|Transferência Recebida|Transferência recebida|"
    r"Transferência enviada|Pagamento de fatura|Pagamento de boleto|"
    r"Aplicação RDB|Resgate RDB)\s*(?:-\s*)?",
    re.IGNORECASE,
)

CATEGORIA_PADRAO_IMPORTACAO = "Outros"


def extrair_nome(descricao):
    texto = " ".join(str(descricao or "").split())
    original = texto
    anterior = None
    while texto and texto != anterior:
        anterior = texto
        texto = PREFIXOS_DESCRICAO.sub("", texto, count=1).strip(" -")
    nome = texto.split(" - ")[0].strip(" -") or original
    return " ".join(nome.split())[:120] or "Sem descrição"


def ler_csv(caminho):
    dados = pd.read_csv(caminho, encoding="utf-8-sig")
    colunas_obrigatorias = {"Data", "Valor", "Descrição"}
    faltantes = colunas_obrigatorias - set(dados.columns)
    if faltantes:
        raise ValueError("CSV sem as colunas: " + ", ".join(sorted(faltantes)))

    if "Identificador" in dados.columns:
        identificadores = dados["Identificador"].fillna("").astype(str).str.strip()
    else:
        identificadores = pd.Series("", index=dados.index)

    transacoes = pd.DataFrame(
        {
            "data": pd.to_datetime(dados["Data"].astype(str).str.strip(), dayfirst=True).dt.strftime("%Y-%m-%d"),
            "valor_centavos": dados["Valor"].map(_converter_centavos).astype("int64"),
            "descricao": dados["Descrição"].fillna("").astype(str).str.strip(),
            "identificador": identificadores.where(identificadores != "", None),
        }
    )
    transacoes["nome"] = transacoes["descricao"].map(extrair_nome)
    return transacoes


def analisar_csv(caminho):
    transacoes = ler_csv(caminho)
    existentes = database.identificadores_existentes()
    marcados = transacoes["identificador"].notna() & transacoes["identificador"].isin(existentes)
    novas = transacoes[~marcados]
    conhecidos = database.mapa_nomes_classificados()
    reconhecidos = novas[novas["nome"].isin(conhecidos)]
    pendentes = []

    for nome, grupo in novas[~novas["nome"].isin(conhecidos)].groupby("nome", sort=True):
        pendentes.append(
            {
                "nome": nome,
                "ocorrencias": int(len(grupo)),
                "exemplos": grupo["descricao"].drop_duplicates().head(3).tolist(),
            }
        )

    return {
        "total": int(len(transacoes)),
        "duplicados": int(marcados.sum()),
        "reconhecidos": int(len(reconhecidos)),
        "novos": pendentes,
    }


def importar_csv(caminho, classificacoes=None):
    transacoes = ler_csv(caminho)
    classificacoes = classificacoes or []
    conhecidos = database.mapa_nomes_classificados()
    resolvidos = {
        nome: (dados["id_categoria"], dados["apelido"]) for nome, dados in conhecidos.items()
    }
    categoria_fallback = database.obter_ou_criar_categoria(CATEGORIA_PADRAO_IMPORTACAO)

    for item in classificacoes:
        nome = (item.get("nome") or "").strip()
        if not nome:
            continue
        if item.get("id_categoria"):
            id_categoria = int(item["id_categoria"])
        else:
            id_categoria = database.obter_ou_criar_categoria(item.get("categoria_nome"))
        resolvidos[nome] = (id_categoria, (item.get("apelido") or "").strip() or None)

    inseridos = 0
    ignorados = 0
    with database.abrir_conexao() as conexao:
        identificadores = database.identificadores_existentes()
        for linha in transacoes.itertuples(index=False):
            if linha.identificador and linha.identificador in identificadores:
                ignorados += 1
                continue
            if linha.valor_centavos == 0:
                ignorados += 1
                continue
            id_categoria, apelido = resolvidos.get(linha.nome, (categoria_fallback, None))
            conexao.execute(
                "INSERT INTO registros (nome, valor_centavos, apelido, id_categoria, data, identificador) "
                "VALUES (?, ?, ?, ?, ?, ?)",
                (
                    linha.nome,
                    int(linha.valor_centavos),
                    apelido,
                    id_categoria,
                    linha.data,
                    linha.identificador,
                ),
            )
            if linha.identificador:
                identificadores.add(linha.identificador)
            inseridos += 1

    return {"inseridos": inseridos, "ignorados": ignorados}


def _converter_centavos(valor):
    texto = str(valor).strip().replace("R$", "").replace("\u00a0", "").replace(" ", "")
    if not texto:
        return 0
    if "," in texto:
        texto = texto.replace(".", "").replace(",", ".")
    return int(round(float(texto) * 100))
