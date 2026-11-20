# Stack
Python:
- Pandas // Análise de dados.
- PyWebView // GUI do Usuário.
- PyInstaller // Criação de executaveis para o cliente final.

Web/ Javascript:
- Chart.js // Criação de gráficos.
- Tailwind // Facilidade na estilização do código.

Dados:
- CSV // Formato aceito para análise dos dados.
- SQLite // Persistencia de Dados.

# Regras de codigo

- snake_case em variáveis e funções.

- Nomes claros e descritivos (sem abreviações obscuras).

- Uma única responsabilidade por função (SRP).

- Sem comentários explicando o que o código faz (o nome deve tornar isso óbvio).

# Design

- Consultar arquivo DESIGN.md na pasta .agent na raiz do projeto.

# Objetivos

- Consultar arquivo MILESTONES.md na pasta .agent na raiz do projeto.

# Estrutura do Projeto

-/SmartFin // Raiz
--/.agent // Arquivos para auxiliar o agente na construção do projeto.
--/.venv // Bibliotecas para execução do projeto.
--/src // Codigo do projeto.
---/public // Codigo html, css e javascript para o usuário interagir.
---/backend // Codigo python para processar os dados.
--/output // Executaveis do projeto
--/docs // Documentação dos processos do sistema.
--/app.py // Inicia o sistema.
--/README.md // Documentação do projeto.
--/AGENTS.md // Instruções para o agente realizar.