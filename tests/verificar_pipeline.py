import sys
import tempfile
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import pandas as pd

from src.backend import database, importer, kpis

CSV_EXEMPLO = [
    ["05/01/2026", -45.90, "Compra no débito - Padaria Central", "uuid-1"],
    ["06/01/2026", -120.00, "Compra no débito via NuPay - Uber", "uuid-2"],
    ["06/01/2026", -30.50, "Transferência enviada pelo Pix - João Silva - 123.456.789-00 - BCO X", "uuid-3"],
    ["10/02/2026", -200.00, "Compra no débito - Mercado Bom Preço", "uuid-4"],
    ["10/02/2026", 1000.00, "Transferência Recebida - Empresa X", "uuid-5"],
    ["10/02/2026", 50.00, "Estorno - Compra no débito via NuPay - Uber", "uuid-6"],
]


def main():
    assert importer.extrair_nome("Compra no débito - AUTOPASS S.A*ATM TMOB") == "AUTOPASS S.A*ATM TMOB"
    assert importer.extrair_nome("Compra no débito via NuPay - Uber") == "Uber"
    assert importer.extrair_nome("Estorno - Compra no débito via NuPay - Uber") == "Uber"
    assert importer.extrair_nome("Pagamento de fatura") == "Pagamento de fatura"
    assert importer.extrair_nome(
        "Transferência enviada pelo Pix - João Silva - 123.456.789-00 - BCO X"
    ) == "João Silva"

    with tempfile.TemporaryDirectory() as pasta:
        pasta = Path(pasta)
        caminho_csv = pasta / "transacoes.csv"
        pd.DataFrame(CSV_EXEMPLO, columns=["Data", "Valor", "Descrição", "Identificador"]).to_csv(
            caminho_csv, index=False
        )
        database.DB_PATH = pasta / "teste.db"
        database.init_db()

        analise = importer.analisar_csv(caminho_csv)
        nomes_pendentes = {item["nome"] for item in analise["novos"]}
        assert analise["total"] == 6, analise
        assert nomes_pendentes == {"Padaria Central", "Uber", "João Silva", "Mercado Bom Preço", "Empresa X"}, nomes_pendentes

        categorias = {categoria["nome"]: categoria["id"] for categoria in database.listar_categorias()}
        classificacoes = [
            {"nome": "Uber", "id_categoria": categorias["Transporte"], "apelido": "Uber"},
            {"nome": "Padaria Central", "id_categoria": categorias["Alimentação"], "apelido": "Padaria"},
            {"nome": "João Silva", "categoria_nome": "Transferências", "apelido": "João"},
            {"nome": "Mercado Bom Preço", "id_categoria": categorias["Alimentação"], "apelido": "Mercado"},
            {"nome": "Empresa X", "categoria_nome": "Transferências", "apelido": "Empresa"},
        ]
        resultado = importer.importar_csv(caminho_csv, classificacoes)
        assert resultado == {"inseridos": 6, "ignorados": 0}, resultado

        repetido = importer.importar_csv(caminho_csv, [])
        assert repetido == {"inseridos": 0, "ignorados": 6}, repetido

        registros = database.listar_registros()
        assert len(registros) == 6
        uber = [registro for registro in registros if registro["nome"] == "Uber"]
        assert len(uber) == 2 and uber[0]["apelido"] == "Uber" and uber[0]["categoria"] == "Transporte"

        dados = kpis.dashboard("tudo", {})
        assert dados["vazio"] is False
        assert dados["cartoes"][0]["valor"] == "R$ 396,40", dados["cartoes"][0]
        assert dados["cartoes"][1]["valor"] == "Alimentação", dados["cartoes"][1]
        assert dados["cartoes"][1]["detalhe"] == "R$ 245,90", dados["cartoes"][1]
        assert dados["cartoes"][2]["valor"] == "fev/2026", dados["cartoes"][2]
        assert dados["topo"][0]["nome"] == "Mercado Bom Preço", dados["topo"][0]
        assert dados["graficos"]["barra"]["valores"] == [196.4, 200.0], dados["graficos"]["barra"]

        por_mes = kpis.dashboard("mes", {"mes": "2026-02"})
        assert por_mes["cartoes"][1]["valor"] == "10/02/2026", por_mes["cartoes"]
        assert por_mes["cartoes"][2]["detalhe"] == "1 transação", por_mes["cartoes"]

        por_categoria = kpis.dashboard("categoria", {"id_categoria": categorias["Alimentação"]})
        assert por_categoria["cartoes"][0]["valor"] == "R$ 122,95", por_categoria["cartoes"]

        por_apelido = kpis.dashboard("apelido", {"apelido": "Uber"})
        assert por_apelido["cartoes"][3]["valor"] == "R$ 120,00", por_apelido["cartoes"]

        novo_id = database.criar_registro(
            {
                "nome": "Loja Teste",
                "valor_centavos": -990,
                "apelido": "Teste",
                "id_categoria": categorias["Lazer"],
                "data": "2026-03-01",
            }
        )
        database.atualizar_registro(
            novo_id,
            {
                "nome": "Loja Teste Atualizada",
                "valor_centavos": -1990,
                "apelido": "Teste",
                "id_categoria": categorias["Lazer"],
                "data": "2026-03-02",
            },
        )
        filtrados = database.listar_registros({"nome": "Atualizada"})
        assert len(filtrados) == 1 and filtrados[0]["valor_centavos"] == -1990
        database.excluir_registro(novo_id)
        assert len(database.listar_registros()) == 6

        try:
            database.criar_registro({"nome": "", "valor_centavos": 100, "id_categoria": 1, "data": "2026-01-01"})
        except ValueError:
            pass
        else:
            raise AssertionError("Registro sem nome deveria falhar")

        database.apagar_todos_dados()
        assert database.listar_registros() == []

    print("Pipeline verificado com sucesso.")


if __name__ == "__main__":
    main()
