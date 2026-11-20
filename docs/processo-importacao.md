# Processo de importação do CSV ao banco

```mermaid
flowchart TD
    A[Usuário clica em 'Selecionar arquivo para upload'] --> B[Api.selecionar_csv abre diálogo nativo]
    B --> C[Api.analisar_csv]
    C --> D[importer.ler_csv: utf-8-sig, colunas Data/Valor/Descrição/Identificador]
    D --> E[Limpeza: data ISO, valor em centavos, extração do nome]
    E --> F[Remove transações cujo identificador já existe no banco]
    F --> G[Nomes já classificados no banco são reconhecidos automaticamente]
    G --> H{Existem nomes novos?}
    H -- Não --> L[Api.importar_csv sem classificações]
    H -- Sim --> I[Diálogo de classificação sequencial]
    I --> J[Usuário escolhe categoria existente ou cria nova e define apelido]
    J --> K[Classificações acumuladas em memória]
    K --> I
    K --> L
    L --> M[INSERT em registros com deduplicação por identificador]
    M --> N[Categorias novas são criadas com COLLATE NOCASE]
    N --> O[Resposta: inseridos e ignorados]
    O --> P[Frontend recarrega registros, categorias e dashboard]
```

## Contrato de classificações

O frontend envia uma lista equivalente ao dicionário de classificação do fluxo original:

```json
[
  { "nome": "Uber", "id_categoria": 2, "apelido": "Transporte app" },
  { "nome": "Padaria Central", "categoria_nome": "Alimentação", "apelido": "Padaria" }
]
```

- `id_categoria` referencia categoria existente; `categoria_nome` cria a categoria se necessário.
- O nome classificado passa a valer para todas as transações do mesmo arquivo e para importações futuras (mapeamento persistido em `registros`).
- Nomes sem classificação caem na categoria `Outros`.

## Garantias

- Nenhuma transação é gravada antes do fim da classificação.
- Reimportar o mesmo arquivo resulta em `inseridos = 0` (deduplicação pelo `Identificador`).
- Linhas com valor zero são ignoradas.
