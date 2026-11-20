# Abas
## DASHBOARD
### Gráfico
#### Tipos:
- Barras
- Pizza.

#### Filtros:
- Tudo.
- Categoria.
- Mês.
- Apelido.

#### KPIs:
1. Tudo:
- Categoria com maior gasto.
- Mês com maior gasto.
- Apelido com maior gasto.
- Top 5 maiores gastos por transação, apelido ou categoria (opcao para ver todos).

2. Categoria:
- Gasto Médio por transação.
- Maior Gasto numa transação.
- Menor Gasto numa transação.
- Top 5 maiores gastos por transação apelido em conjunto, podendo ser em 1 determinado mês (opcao para ver todos).
        
3. Mês:
- Dia com maior gasto.
- Dia com maior quantidade de transações.
- Categoria com maior gasto nesse mês.
- Top 5 maiores gastos por transacao em conjunto com categoria ou apelido (opcao para ver todos).

4. Apelido:
- Gasto Médio por transação.
- Maior Gasto numa transação.
- Menor Gasto numa transação.
- Top 5 maiores gastos podendo ter a opção mês em conjunto (opcao para ver todos).

## REGISTROS
### Filtros:
- Nome;
- Valor;
- Apelido;
- Categoria;
- Periodo (dia A até dia B).
    
Habilitar editar, deletar ou inserir registro.

## CONFIGURAÇÕES
Aviso sobre exclusão de todos os dados.

# INSTRUÇÕES FUNCIONALIDADES
## IDENTIFICAÇÃO DE TRANSAÇÕES
Implementar uma leitura de transação onde deve se analisar a descrição, deve se obter o nome e perguntar ao usuario, a qual categoria deve se atribuir o nome da transação, em seguida apelido, entao ao ler a proxima transação deve verificar se a transacao já nao foi classificada pelo usuario, até termninar todo o arquivo csv.

Primeiro faça a limpeza dos dados e então peça as informações extras ao usuário, quando o usuário enviar deve se manter numa variavel no formato de um dict, e entao após acabar todas as transações ai sim registrar no banco de dados da devida forma.

```python
{
    "registros": [{}], # deve imitar a estrutura da tabela registros.
    "categorias": [{}] # deve imitar a estrutura da tabela categorias.
}
```
    
A analise é voltada para csvs de transações do Nubank, o csv possui a estrutura abaixo.

| Headers | Valores |
|---|---|
|Data| Data da transação (DD/MM/YYYY)|
| Valor | Valor positivo para entradas e negativo para saidas e o valor em float |
| Descrição | Contém o nome do estabelecimento ou maquininha, se pix o cpf e nome do destinatário, estornos, resgates do RDB, pagamento de Contas (empréstimo, cartao de credito e boletos) |
| Identificador | UUID da transação |

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

## ARMAZENAMENTO EM CACHE
Deve verificar se o localStorage possui os dados para todos os Gráficos inclusive com seus filtros no Dashboard.
Deve verificar em seguida se não há dados novos no banco de dados.
Caso haja deve se atualizar o cache.

## DOCUMENTAR PROCESSAMENTO DO SISTEMA
Documentacao deve ser feitas de comentarios e diagramas utilizando o mermaid, a documentacao deve ser sempre .md.
    
Documentações necessarias:
- Banco de Dados e Modelo do CSV;
- Mapa do processo de obtenção dos dados até o registro no banco de dados;
- Mapa do processo da Web até os dados do banco de dados;

## CONTEÚDO DO README
- Objetivo do projeto.
- Instalação do ambiente.
- Utilização.

# DATABASE
## TABELAS
### registros
```sql
id INTEGER PK AUTOINCREMENT --Identificador
nome TEXT NOT NULL --Nome da maquininha, pessoa, estabelecimento.
valor INTEGER NOT NULL --Valor da transação em centavos.
apelido TEXT NULL --Apelido dado pelo usuario.
id_categoria INTEGER NOT NULL FK --Identificador para referenciar a categoria.
```

### categorias
```sql
id INTEGER PK AUTOINCREMENT --Identificador.
nome TEXT NOT NULL --Nome da categoria.
```