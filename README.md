# SmartFin

Aplicativo desktop para analisar transações financeiras exportadas do Nubank (CSV), com dashboard de KPIs, gráficos e gestão de registros.

# Sumário
<ol>
    <li><a href="#stack">Stack</a></li>
    <li> Instalação
        <ol type="A">
            <li><a href="#produção">Produção</a></li>
            <li><a href="#desenvolvimento">Desenvolvimento</a></li>
        </ol>
    </li>
    <li> Documentação
        <ul>
            <li><a href="/docs/banco-de-dados.md">Banco de Dados</a></li>
            <li><a href="/docs/processo-importacao.md">Processamento do CSV</a></li>
            <li><a href="/docs/processo-web.md">Processamento do Frontend</a></li>
        </ul>
    </li>
    <li><a href="#estrutura">Estrutura de Pastas</a></li>
    <li><a href="#utilização">Utilização</a></li> 
</ol>

## Stack

- 🐍 Python — linguagem principal

- 🐼 pandas — análises de dados

- 🪟 pywebview — janela desktop

- 🗄️ SQLite — persistência local

- 🌐 HTML/CSS/JavaScript — interface

-  📊 Chart.js — gráficos offline

## Estrutura

```
app.py                     🚀 Entrada da aplicação
requirements.txt           📦 Dependências do projeto

src/
├── backend/               ⚙️ Database, importer, KPIs e API pywebview
└── public/                🎨 Interface (HTML, CSS, JS e Chart.js local)

docs/                      📚 Diagramas de banco, importação e fluxo Web
tests/                     🧪 Verificação headless do pipeline
.agent/                    📝 Design e milestones do projeto
```

### 🗄️ Banco de dados

| Item | Descrição |
|------|-----------|
| `%LOCALAPPDATA%\SmartFin\smartfin.db` | Banco SQLite criado automaticamente no primeiro uso |

## Instalação

### Pré-requisitos

Antes de iniciar, certifique-se de ter instalado em sua máquina:
- **Python 3.8+** ([download](https://www.python.org/downloads/))
- **Git** ([download](https://git-scm.com/downloads))

> ⚠️ **Windows:** Durante a instalação do Python, marque a opção "Add Python to PATH".

---

### 1. Clonar o repositório

Baixe o código-fonte do projeto para sua máquina local:

```cmd
git clone https://github.com/AsaphMoraes/SmartFin.git
cd SmartFin
```

> 📁 Todos os comandos abaixo devem ser executados **dentro da pasta do projeto**.

### 2. Criar o ambiente virtual (venv)

O ambiente virtual isola as dependências do projeto, evitando conflitos com outras bibliotecas instaladas globalmente no sistema.

```cmd
python -m venv .venv
```

> 💡 A pasta `.venv` será criada na raiz do projeto e não deve ser versionada (já está no `.gitignore`).

### 3. Instalar as dependências

Instale todas as bibliotecas listadas no `requirements.txt` dentro do ambiente virtual:

```cmd
.venv\Scripts\python.exe -m pip install -r requirements.txt
```

> ✅ Sempre utilize o caminho `.venv\Scripts\python.exe` para garantir que os comandos sejam executados dentro do ambiente virtual, sem depender de ativação manual.

---

## Desenvolvimento

Use esta seção se você for **desenvolver, testar ou depurar** a aplicação.

### 4. Validar o código (testes)

Antes de rodar a aplicação, valide se todas as funcionalidades principais estão operando corretamente:

```cmd
.venv\Scripts\python.exe tests\verificar_pipeline.py
```

**O que este script verifica:**
- 🧹 Limpeza e normalização do CSV
- 🏷️ Classificação das transações
- 🔁 Deduplicação de registros
- 📊 Cálculo de KPIs
- 🔍 Aplicação de filtros
- ✏️ Operações de CRUD (Create, Read, Update, Delete)

> 🧪 Os testes são executados em um **banco de dados temporário**, sem afetar os dados reais da aplicação.

### 5. Iniciar a aplicação

Com o ambiente configurado, execute a aplicação:

```cmd
.venv\Scripts\python.exe app.py
```

> 🚀 A interface será aberta e a aplicação estará pronta para uso.

---

## Produção

Use esta seção para **gerar o executável** distribuível da aplicação (arquivo `.exe` autônomo, que não requer Python instalado no computador de destino).

### 6. Instalar o PyInstaller

O PyInstaller é responsável por empacotar a aplicação em um único executável:

```cmd
.venv\Scripts\python.exe -m pip install pyinstaller
```

### 7. Gerar o executável

Execute o comando abaixo para compilar a aplicação:

```cmd
.venv\Scripts\python.exe -m PyInstaller --noconfirm --clean --windowed --name SmartFin --icon "src\public\assets\icone.ico" --add-data "src\public;src\public" --onefile --distpath output app.py
```

**Entendendo os parâmetros:**

| Parâmetro | Descrição |
|-----------|-----------|
| `--noconfirm` | Sobrescreve arquivos existentes sem pedir confirmação |
| `--clean` | Limpa cache do PyInstaller antes de compilar |
| `--windowed` | Não abre janela do console ao executar (modo GUI) |
| `--name SmartFin` | Define o nome do executável gerado |
| `--icon` | Define o ícone da aplicação |
| `--add-data` | Inclui a pasta `src\public` (recursos) no executável |
| `--onefile` | Gera um único arquivo `.exe` |
| `--distpath output` | Define a pasta de saída (`output\`) |

### 📦 Resultado da compilação

O executável final será gerado em:

```
output\SmartFin.exe
```

> 🗑️ Os diretórios `build\` e o arquivo `SmartFin.spec` são **intermediários** gerados durante a compilação e podem ser excluídos com segurança após a geração do `.exe`.

---

## Resumo dos comandos

| Etapa | Comando |
|-------|---------|
| Clonar repositório | `git clone https://github.com/AsaphMoraes/SmartFin.git` |
| Criar venv | `python -m venv .venv` |
| Instalar dependências | `.venv\Scripts\python.exe -m pip install -r requirements.txt` |
| Rodar testes | `.venv\Scripts\python.exe tests\verificar_pipeline.py` |
| Executar app | `.venv\Scripts\python.exe app.py` |
| Gerar executável | `.venv\Scripts\python.exe -m PyInstaller ...` (ver seção Produção) |

---

## Problemas comuns

| Problema | Solução |
|----------|---------|
| `python` não reconhecido | Reinstale o Python marcando "Add to PATH" |
| Erro ao instalar dependências | Verifique se o venv foi criado corretamente |
| Executável não abre | Rode sem `--windowed` para visualizar o erro no console |
| Falha no PyInstaller | Execute com `--clean` para limpar cache e tente novamente |
## Utilização

<img src="https://i.imgur.com/pmr6zMU.png">

Abra o aplicativo.

<img src="https://i.imgur.com/BOTSv5K.png">

Vá em Registros

<img src="https://i.imgur.com/zspOpxL.png">

Faça o upload do arquivo csv

<img src="https://i.imgur.com/7qrSz9D.png">

Selecione o arquivo csv e clique em "Abrir"

<img src="https://i.imgur.com/LCtKxws.png">

Selecione a categoria da transação e o apelido(opcional)

**Nota**: Se fechar o aplicativo sem terminar a classificação de todas as transações num csv, você perderá todo seu progresso.

<img src="https://i.imgur.com/jIV2hni.png">

Pronto! Agora só gerir seus gastos.