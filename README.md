# SmartFin

Aplicativo desktop para analisar transações financeiras exportadas do Nubank (CSV), com dashboard de KPIs, gráficos e gestão de registros.

## Stack

- Python + pandas (análises) e pywebview (janela desktop)
- SQLite (persistência)
- HTML/CSS/JavaScript + Chart.js (interface, gráficos offline)

## Instalação

```cmd
python -m venv .venv
.venv\Scripts\python.exe -m pip install -r requirements.txt
```

## Utilização

```cmd
.venv\Scripts\python.exe app.py
```

1. **Registros → Selecionar arquivo para upload**: escolha o CSV exportado do Nubank.
2. Classifique cada nome novo (categoria e apelido); transações já classificadas são reconhecidas automaticamente.
3. **Dashboard**: alterne entre as visões Tudo, Categoria, Mês e Apelido, aplique filtros e consulte KPIs, top gastos e gráficos.
4. **Configurações**: alterne o tema e, se necessário, exclua todos os dados.

## Verificação

```cmd
.venv\Scripts\python.exe tests\verificar_pipeline.py
```

O script valida limpeza do CSV, classificação, deduplicação, KPIs, filtros e CRUD em um banco temporário.

## Executável (Windows)

```cmd
.venv\Scripts\python.exe -m pip install pyinstaller
.venv\Scripts\python.exe -m PyInstaller --noconfirm --clean --windowed --name SmartFin --icon "src\public\assets\icone.ico" --add-data "src\public;src\public" --onefile --distpath output app.py
```

O executável é gerado em `output\SmartFin\SmartFin.exe`. Os diretórios `build\` e o arquivo `SmartFin.spec` são intermediários e podem ser excluídos.

## Estrutura

```
app.py                  entrada da aplicação
requirements.txt        dependências
%LOCALAPPDATA%\SmartFin\smartfin.db   banco SQLite criado no primeiro uso
src/backend/            database, importer, kpis e API pywebview
src/public/             interface (HTML, CSS, JS, Chart.js local)
docs/                   diagramas de banco, importação e fluxo Web
tests/                  verificação headless do pipeline
.agent/                 design e milestones
```
