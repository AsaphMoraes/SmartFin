# Milestones
- 1. Criar o Layout inicial.
- 2. Criar a aba Dashboard.
-- Gráfico:
    Tipos:
        Barras, Pizza.
    
    Filtros:
        Tudo.
        Categoria.
        Mês.
        Apelido.

    KPIs:
        Tudo:
            Categoria com maior gasto.
            Mês com maior gasto.
            Apelido com maior gasto.
            Top 5 maiores gastos por transação, apelido ou categoria (opcao para ver todos).

        Categoria:
            Gasto Médio por transação.
            Maior Gasto numa transação.
            Menor Gasto numa transação.
            Top 5 maiores gastos por transação apelido em conjunto, podendo ser em 1 determinado mês (opcao para ver todos).
        
        Mês:
            Dia com maior gasto.
            Dia com maior quantidade de transações.
            Categoria com maior gasto nesse mês.
            Top 5 maiores gastos por transacao em conjunto com categoria ou apelido (opcao para ver todos).

        Apelido:
            Gasto Médio por transação.
            Maior Gasto numa transação.
            Menor Gasto numa transação.
            Top 5 maiores gastos podendo ter a opção mês em conjunto (opcao para ver todos).


- 3. Criar a aba Registros.
    Filtros:
        Nome, Valor, Apelido, Categoria, Periodo (dia A até dia B).
    
    Habilitar editar, deletar ou inserir registro.
    
- 4. Criar a aba Configurações.
    Aviso sobre exclusão de todos os dados.

- 5. Estruturar o banco de dados.
-- Estrutura:
    registros:
        id INTEGER PK AUTOINCREMENT //Identificador
        nome TEXT NOT NULL //Nome da maquininha, pessoa, estabelecimento.
        valor INTEGER NOT NULL // Valor da transação em centavos.
        apelido TEXT NULL // Apelido dado pelo usuario.
        id_categoria INTEGER NOT NULL FK // Identificador para referenciar a categoria.

    categorias:
        id INTEGER PK AUTOINCREMENT // Identificador.
        nome TEXT NOT NULL // Nome da categoria.

- 6. Criar a identificação de transações via input do usuário.
    Implementar uma leitura de transação onde deve se analisar a descrição, deve se obter o nome e perguntar ao usuario, a qual categoria deve se atribuir o nome da transação, em seguida apelido, entao ao ler a proxima transação deve verificar se a transacao já nao foi classificada pelo usuario, até termninar todo o arquivo csv.

    Primeiro faça a limpeza dos dados e então peça as informações extras ao usuário, quando o usuário enviar deve se manter numa variavel no formato de um dict, e entao após acabar todas as transações ai sim registrar no banco de dados da devida forma.

    Dict:
    {
        "registros": [{} //imita a estrutura da tabela registros.],
        "categorias": [{} //imita a estrutura da tabela categorias.]
    }
    
    A analise é voltada para csvs de transações do Nubank, portanto segue as seguintes headers (
        Data // Data da transação.
        Valor // Valor positivo para entradas e negativo para saidas e o valor em float.
        Descrição // Contém o nome do estabelecimento ou maquininha, se pix o cpf e nome do destinatário, estornos, resgates do RDB, pagamento de Contas (empréstimo, cartao de credito e boletos).
        Identificador // UUID da transação
    )

    Exemplo de descrições:
    - Compra no débito - AUTOPASS S.A*ATM TMOB
    - Transferência enviada pelo Pix - Fxxxxxxx Exxxxx Bxxxxxx Dxxxx - •••.xxx.xxx-•• - PAGSEGURO INTERNET IP S.A. (0290) Agência: 0 Conta: 00000000-4
    - Compra no débito via NuPay - Uber
    - Transferência Recebida - Axxxxxxxx Mxxxxx Cxxxxxx - •••.000.000-•• - NU PAGAMENTOS - IP (0260) Agência: 0 Conta: 00000000-7
    - Transferência recebida pelo Pix via Open Banking - Axxxx Axxxxx Mxxxxx Cxxxxxx - •••.000.000-•• - BCO SANTANDER (BRASIL) S.A. (0033) Agência: 0000 Conta: 00000000-3
    - Transferência enviada pelo Pix - CRUZEIRO DO SUL EDUCACIONAL S.A. - 62.984.091/0001-02 - BCO DO BRASIL S.A. (0001) Agência: 0000 Conta: 0000-0
    - Aplicação RDB
    - Estorno - Compra no débito via NuPay - Uber
    - Pagamento de fatura

7. Criar analises de KPIs com pandas direto do banco de dados.

8. Criar armazenamento em cache no localStorage para os dados analizados.
    Deve verificar se o localStorage possui os dados para todos os Gráficos inclusive com seus filtros no Dashboard.
    Deve verificar em seguida se não há dados novos no banco de dados.
    Caso haja deve se atualizar o cache.

9. Criar venv para instalação das bibliotecas.

10. Instalar todas as Bibliotecas necessarias para o funcionamento do sistema.

11. Documentar todo o processamento do sistema.
    Documentacao deve ser feitas de comentarios e diagramas utilizando o mermaid, a documentacao deve ser sempre .md.
    
    Documentações necessarias:
        Banco de Dados e Modelo do CSV;
        Mapa do processo de obtenção dos dados até o registro no banco de dados;
        Mapa do processo da Web até os dados do banco de dados;


12. Criar o README.md.
    Objetivo do projeto.
    Instalação do ambiente.
    Utilização.

13. Debugar Projeto.

14. Criar Executavel para Windows.