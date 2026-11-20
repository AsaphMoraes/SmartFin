import webview

from . import database, importer, kpis


class Api:
    def __init__(self):
        self._janela = None

    def obter_dashboard(self, estado="tudo", filtros=None):
        return kpis.dashboard(estado, filtros)

    def obter_versao_dados(self):
        return database.versao_dados()

    def listar_registros(self, filtros=None):
        return database.listar_registros(filtros)

    def listar_categorias(self):
        return database.listar_categorias()

    def criar_categoria(self, nome):
        return {"id": database.obter_ou_criar_categoria(nome)}

    def criar_registro(self, dados):
        return {"id": database.criar_registro(dados), "versao": database.versao_dados()}

    def atualizar_registro(self, registro_id, dados):
        database.atualizar_registro(registro_id, dados)
        return {"versao": database.versao_dados()}

    def excluir_registro(self, registro_id):
        database.excluir_registro(registro_id)
        return {"versao": database.versao_dados()}

    def apagar_todos_dados(self):
        database.apagar_todos_dados()
        return {"versao": database.versao_dados()}

    def selecionar_csv(self):
        if self._janela is None:
            return None
        caminhos = self._janela.create_file_dialog(
            webview.OPEN_DIALOG,
            allow_multiple=False,
            file_types=("Arquivos CSV (*.csv)",),
        )
        return caminhos[0] if caminhos else None

    def analisar_csv(self, caminho):
        return importer.analisar_csv(caminho)

    def importar_csv(self, caminho, classificacoes=None):
        resultado = importer.importar_csv(caminho, classificacoes)
        resultado["versao"] = database.versao_dados()
        return resultado
