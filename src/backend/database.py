import os
import sqlite3
from contextlib import contextmanager
from pathlib import Path

BASE_DADOS = Path(os.environ.get("LOCALAPPDATA", Path.home() / "AppData" / "Local")) / "SmartFin"
DB_PATH = BASE_DADOS / "smartfin.db"

CATEGORIAS_PADRAO = [
    "Alimentação",
    "Transporte",
    "Moradia",
    "Saúde",
    "Lazer",
    "Educação",
    "Investimentos",
    "Transferências",
    "Outros",
]

CAMPOS_REGISTRO = ("nome", "valor_centavos", "apelido", "id_categoria", "data", "identificador")


def get_connection(db_path=None):
    caminho = Path(db_path or DB_PATH)
    caminho.parent.mkdir(parents=True, exist_ok=True)
    conexao = sqlite3.connect(caminho)
    conexao.row_factory = sqlite3.Row
    conexao.execute("PRAGMA foreign_keys = ON")
    return conexao


@contextmanager
def abrir_conexao(db_path=None):
    conexao = get_connection(db_path)
    try:
        yield conexao
        conexao.commit()
    except Exception:
        conexao.rollback()
        raise
    finally:
        conexao.close()


def init_db(db_path=None):
    with abrir_conexao(db_path) as conexao:
        conexao.executescript(
            """
            CREATE TABLE IF NOT EXISTS categorias (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nome TEXT NOT NULL COLLATE NOCASE UNIQUE
            );
            CREATE TABLE IF NOT EXISTS registros (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nome TEXT NOT NULL,
                valor_centavos INTEGER NOT NULL,
                apelido TEXT,
                id_categoria INTEGER NOT NULL REFERENCES categorias(id),
                data TEXT NOT NULL,
                identificador TEXT UNIQUE
            );
            CREATE INDEX IF NOT EXISTS idx_registros_data ON registros(data);
            CREATE INDEX IF NOT EXISTS idx_registros_categoria ON registros(id_categoria);
            """
        )
        total = conexao.execute("SELECT COUNT(*) FROM categorias").fetchone()[0]
        if total == 0:
            conexao.executemany(
                "INSERT INTO categorias (nome) VALUES (?)",
                [(nome,) for nome in CATEGORIAS_PADRAO],
            )


def listar_categorias():
    with abrir_conexao() as conexao:
        linhas = conexao.execute("SELECT id, nome FROM categorias ORDER BY nome").fetchall()
    return [dict(linha) for linha in linhas]


def obter_ou_criar_categoria(nome):
    nome = (nome or "").strip()
    if not nome:
        raise ValueError("O nome da categoria é obrigatório.")
    with abrir_conexao() as conexao:
        existente = conexao.execute("SELECT id FROM categorias WHERE nome = ?", (nome,)).fetchone()
        if existente:
            return existente["id"]
        cursor = conexao.execute("INSERT INTO categorias (nome) VALUES (?)", (nome,))
        return cursor.lastrowid


def listar_registros(filtros=None):
    filtros = filtros or {}
    clausulas = []
    parametros = []

    if filtros.get("nome"):
        clausulas.append("r.nome LIKE ?")
        parametros.append(f"%{filtros['nome'].strip()}%")
    if filtros.get("apelido"):
        clausulas.append("r.apelido LIKE ?")
        parametros.append(f"%{filtros['apelido'].strip()}%")
    if filtros.get("id_categoria"):
        clausulas.append("r.id_categoria = ?")
        parametros.append(int(filtros["id_categoria"]))
    if filtros.get("valor_min_centavos") not in (None, ""):
        clausulas.append("r.valor_centavos >= ?")
        parametros.append(int(filtros["valor_min_centavos"]))
    if filtros.get("valor_max_centavos") not in (None, ""):
        clausulas.append("r.valor_centavos <= ?")
        parametros.append(int(filtros["valor_max_centavos"]))
    if filtros.get("data_inicio"):
        clausulas.append("r.data >= ?")
        parametros.append(filtros["data_inicio"])
    if filtros.get("data_fim"):
        clausulas.append("r.data <= ?")
        parametros.append(filtros["data_fim"])

    sql = (
        "SELECT r.id, r.nome, r.valor_centavos, r.apelido, r.id_categoria, "
        "c.nome AS categoria, r.data, r.identificador "
        "FROM registros r JOIN categorias c ON c.id = r.id_categoria"
    )
    if clausulas:
        sql += " WHERE " + " AND ".join(clausulas)
    sql += " ORDER BY r.data DESC, r.id DESC"

    with abrir_conexao() as conexao:
        linhas = conexao.execute(sql, parametros).fetchall()
    return [dict(linha) for linha in linhas]


def criar_registro(dados):
    valores = _validar_registro(dados)
    with abrir_conexao() as conexao:
        cursor = conexao.execute(
            "INSERT INTO registros (nome, valor_centavos, apelido, id_categoria, data, identificador) "
            "VALUES (?, ?, ?, ?, ?, ?)",
            tuple(valores[campo] for campo in CAMPOS_REGISTRO),
        )
        return cursor.lastrowid


def atualizar_registro(registro_id, dados):
    valores = _validar_registro(dados)
    with abrir_conexao() as conexao:
        conexao.execute(
            "UPDATE registros SET nome = ?, valor_centavos = ?, apelido = ?, "
            "id_categoria = ?, data = ?, identificador = ? WHERE id = ?",
            tuple(valores[campo] for campo in CAMPOS_REGISTRO) + (int(registro_id),),
        )


def excluir_registro(registro_id):
    with abrir_conexao() as conexao:
        conexao.execute("DELETE FROM registros WHERE id = ?", (int(registro_id),))


def apagar_todos_dados():
    with abrir_conexao() as conexao:
        conexao.execute("DELETE FROM registros")
        conexao.execute("DELETE FROM categorias")
        conexao.executemany(
            "INSERT INTO categorias (nome) VALUES (?)",
            [(nome,) for nome in CATEGORIAS_PADRAO],
        )


def mapa_nomes_classificados():
    sql = (
        "SELECT r.nome, r.apelido, r.id_categoria, c.nome AS categoria "
        "FROM registros r JOIN categorias c ON c.id = r.id_categoria"
    )
    with abrir_conexao() as conexao:
        linhas = conexao.execute(sql).fetchall()
    return {
        linha["nome"]: {
            "apelido": linha["apelido"],
            "id_categoria": linha["id_categoria"],
            "categoria": linha["categoria"],
        }
        for linha in linhas
    }


def identificadores_existentes():
    with abrir_conexao() as conexao:
        linhas = conexao.execute(
            "SELECT identificador FROM registros WHERE identificador IS NOT NULL"
        ).fetchall()
    return {linha["identificador"] for linha in linhas}


def versao_dados():
    with abrir_conexao() as conexao:
        total, ultimo_id, soma = conexao.execute(
            "SELECT COUNT(*), COALESCE(MAX(id), 0), COALESCE(SUM(valor_centavos), 0) FROM registros"
        ).fetchone()
        total_categorias = conexao.execute("SELECT COUNT(*) FROM categorias").fetchone()[0]
    return f"{total}:{ultimo_id}:{soma}:{total_categorias}"


def _validar_registro(dados):
    nome = (dados.get("nome") or "").strip()
    if not nome:
        raise ValueError("O nome do registro é obrigatório.")
    if not dados.get("id_categoria"):
        raise ValueError("A categoria do registro é obrigatória.")
    if not dados.get("data"):
        raise ValueError("A data do registro é obrigatória.")
    valor_centavos = int(dados.get("valor_centavos") or 0)
    if valor_centavos == 0:
        raise ValueError("O valor do registro não pode ser zero.")
    apelido = (dados.get("apelido") or "").strip() or None
    identificador = (dados.get("identificador") or "").strip() or None
    return {
        "nome": nome,
        "valor_centavos": valor_centavos,
        "apelido": apelido,
        "id_categoria": int(dados["id_categoria"]),
        "data": dados["data"],
        "identificador": identificador,
    }
