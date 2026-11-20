## Filosofia de Design: Flat Design 2.0 (Semi-Flat)

O estilo visual segue o **Flat Design 2.0**, que mantém a estética limpa e bidimensional do flat design original, mas introduz sutileza física para comunicar interatividade e hierarquia.

- **Superfícies predominantemente planas**: O visual base é 2D e sólido, sem gradientes chamativos ou texturas.
- **Elevação sutil e intencional**: Sombras extremamente suaves e difusas são usadas **apenas** para indicar elementos interativos (botões, cards clicáveis) ou camadas (modais, popovers). Sombras nunca devem ser pretas puras; use uma cor derivada do fundo com baixa opacidade.
- **Micro-gradientes (opcional)**: Gradientes lineares quase imperceptíveis podem ser usados em grandes superfícies para evitar uma sensação de “morte” visual.
- **Tipografia e ícones como pilares da hierarquia**: Como a profundidade é mínima, a clareza tipográfica e a iconografia consistente são os principais veículos de organização visual.

**Exemplo de CSS para elevação sutil (Flat 2.0):**
```css
:root {
  --shadow-color: rgba(43, 48, 58, 0.08); /* Sombra tintada, não preta */
}
.flat-card {
  background-color: var(--bg-surface);
  border-radius: 8px;
  box-shadow: 0 10px 30px var(--shadow-color);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.flat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 40px rgba(43, 48, 58, 0.12);
}
```

---

## Sistema de Temas e Paleta de Cores

A aplicação oferece dois temas distintos, alternáveis pelo usuário na aba **Configurações**. Ambos usam o **azul** como cor de acento primária, mas com fundos e superfícies diferentes.

### 1 Tema Escuro (“Preto com Azul”)

| Token | Valor (Hex) | Uso |
|---|---|---|
| `--bg-base` | `#0B0F19` | Fundo geral da aplicação (quase preto, levemente azulado) |
| `--bg-surface` | `#151C2C` | Fundo de cards, sidebar e barras |
| `--bg-elevated` | `#1E293B` | Modais, popovers, dropdowns |
| `--border-default` | `#2D3A4F` | Bordas de separação e contornos |
| `--text-primary` | `#F1F5F9` | Texto principal |
| `--text-secondary` | `#94A3B8` | Texto secundário, labels, metadados |
| `--accent` | `#3B82F6` | Cor de acento primária (botões, links, estados ativos) |
| `--accent-hover` | `#60A5FA` | Estado hover do acento |
| `--accent-subtle` | `rgba(59, 130, 246, 0.12)` | Fundo de item ativo na navegação |
| `--focus-ring` | `#60A5FA` | Anel de foco para navegação por teclado |

### 2 Tema Claro (“Branco com Azul”)

| Token | Valor (Hex) | Uso |
|---|---|---|
| `--bg-base` | `#F8FAFC` | Fundo geral da aplicação |
| `--bg-surface` | `#FFFFFF` | Fundo de cards, sidebar e barras |
| `--bg-elevated` | `#FFFFFF` | Modais, popovers, dropdowns (com sombra sutil) |
| `--border-default` | `#E2E8F0` | Bordas de separação e contornos |
| `--text-primary` | `#0F172A` | Texto principal |
| `--text-secondary` | `#64748B` | Texto secundário, labels, metadados |
| `--accent` | `#2563EB` | Cor de acento primária |
| `--accent-hover` | `#1D4ED8` | Estado hover do acento |
| `--accent-subtle` | `rgba(37, 99, 235, 0.08)` | Fundo de item ativo na navegação |
| `--focus-ring` | `#2563EB` | Anel de foco para navegação por teclado |

### 3 Regras de Contraste (WCAG 2.1 AA)

Todos os pares texto/fundo **devem** atender à relação mínima de **4.5:1** para texto normal e **3:1** para texto grande e componentes de interface. A tabela de verificação de contraste deve ser documentada no código (ex: `colors.css`) e validada antes da entrega.

- No tema escuro, o texto `--text-primary` sobre `--bg-base` deve ter contraste > 12:1; sobre `--bg-surface`, > 10:1.
- No tema claro, o texto `--text-primary` sobre `--bg-base` deve ter contraste > 15:1; sobre `--bg-surface`, > 16:1.
- O anel de foco (`--focus-ring`) deve ter contraste de pelo menos 3:1 contra as cores de fundo adjacentes.

---

## Tipografia e Espaçamento

- **Família tipográfica**: Uma única família **sans-serif limpa e legível** (ex: `Inter`, `system-ui`, `-apple-system`, `Segoe UI`, `Roboto`). Use `font-variant-numeric: tabular-nums` para números em métricas e tabelas.
- **Hierarquia**:
  - Títulos de página (`h1`): 24–28px, `font-weight: 700`.
  - Títulos de seção (`h2`): 18–20px, `font-weight: 600`.
  - Corpo de texto: 14–15px, `font-weight: 400`, `line-height: 1.5`.
  - Labels e metadados: 12–13px, `font-weight: 500`, cor `--text-secondary`.
- **Espaçamento**: Use uma escala consistente baseada em múltiplos de 4px (4, 8, 12, 16, 24, 32, 48). O padding interno de cards e seções deve seguir essa escala.

---

## Estrutura de Navegação e Layout Geral

A aplicação é uma **Single Page Application (SPA)** para desktop, com uma barra de navegação persistente e uma área de conteúdo principal.

### 1 Sidebar de Navegação

- **Posição**: Fixa à esquerda, com largura entre 240px e 280px.
- **Fundo**: `--bg-surface` com uma leve diferença de tonalidade em relação ao conteúdo principal (não use preto puro no tema escuro).
- **Estrutura**:
  - Logotipo/marca no topo.
  - Três itens de navegação (um por aba), com ícone + rótulo textual.
  - Perfil do usuário ou indicador de status na parte inferior.
- **Estado ativo**: O item da aba atual deve ter `background: var(--accent-subtle)`, `color: var(--accent)` e, semanticamente, `aria-current="page"`.
- **Acessibilidade**: O contêiner `<nav>` deve ter `aria-label="Navegação principal"`.

### 2 Área de Conteúdo Principal

- Ocupa o restante da largura. Cada aba renderiza seu conteúdo dentro de um contêiner com `role="region"` e `aria-labelledby` apontando para o título da aba correspondente.
- Deve haver uma **mensagem de estado vazio** clara e acessível quando não houver dados para exibir.

---

## Especificação das Abas

### 1 Aba: Dashboard

**Propósito**: Exibir visualizações gráficas e permitir a exploração dos dados por meio de filtros.

#### Layout e Componentes

1.  **Barra de Filtros (Topo)**:
    - Posicione os filtros na parte superior, alinhados à esquerda, pois o olhar naturalmente começa ali.
    - Limite a **no máximo 3 filtros** visíveis simultaneamente para não sobrecarregar a tela. Se necessário, agrupe filtros secundários em um painel expansível.
    - Cada filtro deve ter um `<label>` visível associado ao controle (ex: `<select>` ou `<input type="search">`).
    - Inclua um botão **“Limpar filtros”** com `aria-label="Remover todos os filtros aplicados"`.
    - **Acessibilidade**: O estado do filtro aplicado deve ser anunciado (ex: uma região `aria-live="polite"` informando “Filtrado por: categoria X”).

2.  **Cartões de Métricas (Metric Cards)**:
    - Exiba de 2 a 4 cartões no topo da área de gráficos.
    - **Diferencie o cartão da métrica principal**: fundo com `var(--accent-subtle)`, número em `var(--accent)` e tamanho de fonte ligeiramente maior (ex: 32px vs 24px). Os cartões secundários usam `--bg-surface` e `--text-primary`.
    - Inclua uma variação textual em cor neutra (ex: “+12% em relação ao mês anterior”). **Evite** setas verdes/vermelhas para juízos de valor.

3.  **Área de Gráficos**:
    - Use uma grade de 1 ou 2 colunas para os gráficos.
    - Cada gráfico deve ter um `<h2>` ou `<h3>` descritivo e um `aria-describedby` apontando para uma descrição textual dos dados (ex: “Gráfico de linhas mostrando a evolução das vendas de janeiro a junho”).
    - Se a biblioteca de gráficos gerar um `<canvas>` ou `<svg>`, forneça um **resumo textual acessível** em um elemento visualmente oculto, mas legível por leitores de tela.
    - **Acessibilidade de cores**: Não dependa apenas da cor para distinguir séries de dados. Use padrões, rótulos diretos ou formas diferentes.

#### Checklist de Acessibilidade para o Dashboard
- [ ] Todos os filtros têm `<label>` associado via `for`/`id`.
- [ ] O botão “Limpar filtros” tem nome acessível explícito.
- [ ] Cada gráfico tem um título semântico (`h2`/`h3`) e uma descrição textual alternativa.
- [ ] A região de feedback dos filtros usa `aria-live="polite"`.
- [ ] A navegação por teclado alcança todos os filtros e botões na ordem lógica.

---

### 2 Aba: Registros

**Propósito**: Gerenciar o upload de dados e realizar operações CRUD (Criar, Ler, Atualizar, Excluir) nos registros.

#### Layout e Componentes

1.  **Área de Upload**:
    - Um componente de upload claro, com um `<input type="file">` visualmente oculto, mas acionado por um `<button>` ou `<label>` estilizado. O botão deve ter texto descritivo (ex: “Selecionar arquivo para upload”).
    - Exiba o nome do arquivo selecionado e o status do upload (pendente, em andamento, concluído, erro) em uma região com `aria-live="polite"`.

2.  **Tabela de Registros**:
    - Use `<table>` com `<thead>`, `<tbody>`, `<th scope="col">` e `<caption>` (pode ser visualmente oculto) descrevendo o conteúdo da tabela.
    - Cada linha deve ter ações de **Editar** e **Excluir**. **Não use botões idênticos com o mesmo nome acessível para todos os registros**. Em vez disso, use `aria-label` dinâmico, como `aria-label="Editar registro de [Nome do Registro]"` e `aria-label="Excluir registro de [Nome do Registro]"`.

3.  **Formulário de Criação/Edição (Modal ou Inline)**:
    - Use o elemento `<form>` para agrupar os controles.
    - **Estrutura vertical**: Organize os campos em uma única coluna para facilitar a leitura por usuários com visão limitada.
    - **Agrupamento**: Use `<fieldset>` e `<legend>` para agrupar campos relacionados (ex: “Dados Pessoais”, “Detalhes do Pedido”).
    - **Labels explícitos**: Cada `<input>`, `<select>` ou `<textarea>` deve ter um `<label>` associado via `for`/`id`. **Nunca** use `placeholder` como substituto do label.
    - **Campos obrigatórios**: Marque com `required` no HTML e indique visualmente com um asterisco (`*`), além de uma instrução no topo do formulário (“Campos com * são obrigatórios”).
    - **Validação e Erros**: Exiba mensagens de erro **em texto**, associadas ao campo via `aria-describedby`. O erro deve ser anunciado e o foco deve ser movido para o primeiro campo com erro ou para um sumário de erros no topo do formulário.
    - **Evite estados `disabled`**: Prefira manter os campos habilitados e usar validação inline e textos de ajuda. Se um estado desabilitado for inevitável, use `aria-disabled="true"` e explique o motivo.

#### Checklist de Acessibilidade para Registros
- [ ] O `<input type="file">` está associado a um `<label>` ou botão com texto claro.
- [ ] A `<table>` usa `<caption>`, `<th scope="col">` e tem uma estrutura semântica correta.
- [ ] Os botões de ação na tabela têm `aria-label` únicos e descritivos por linha.
- [ ] O `<form>` usa `<fieldset>`/`<legend>` para agrupamentos e `<label>` para cada campo.
- [ ] Mensagens de erro são textuais, associadas via `aria-describedby` e anunciadas.
- [ ] A ordem dos elementos no HTML reflete a ordem visual (sem reordenação via CSS).

---

### 3 Aba: Configurações

**Propósito**: Permitir a alteração do tema visual e a exclusão de todos os dados da aplicação.

#### Layout e Componentes

1.  **Seletor de Tema**:
    - Implemente um **botão de alternância** (`<button>`) que cicla entre os temas ou um grupo de botões de rádio estilizados.
    - **Acessibilidade**: O botão deve ter `aria-label` descritivo e dinâmico (ex: `aria-label="Alternar tema. Tema atual: Escuro"`). O estado atual deve ser comunicado. Se usar `role="switch"`, utilize `aria-checked` de forma adequada.
    - A mudança de tema deve ser aplicada via atributo `data-theme` no `<html>` ou `<body>`, com transições CSS suaves (ex: 150ms) para evitar flashes bruscos.
    - A preferência do usuário deve ser **persistida em `localStorage`** e restaurada no próximo início. Considere também respeitar a preferência do sistema operacional (`prefers-color-scheme`) como padrão inicial.

2.  **Zona de Perigo (Excluir Todos os Dados)**:
    - Esta ação é **destrutiva e irreversível**. Deve ser visualmente distinta (ex: borda ou texto em uma cor de alerta, mas ainda acessível).
    - **Confirmação obrigatória**: A ação só deve ser executada após uma confirmação explícita do usuário. Implemente um modal de confirmação com um texto claro sobre a consequência (“Esta ação não pode ser desfeita. Todos os registros e configurações serão apagados.”).
    - **Acessibilidade**: O botão inicial deve ter `aria-label` explícito (ex: “Excluir permanentemente todos os dados”). No modal, o foco deve ser gerenciado (preso no modal enquanto aberto) e o botão de confirmação deve ser distinto do botão de cancelar. Use `role="alertdialog"` para o modal de confirmação.

#### Checklist de Acessibilidade para Configurações
- [ ] O seletor de tema tem nome acessível e comunica o estado atual.
- [ ] A mudança de tema é aplicada via atributo e persistida.
- [ ] A ação de exclusão exige confirmação em um modal com `role="alertdialog"`.
- [ ] O foco é gerenciado corretamente no modal de confirmação.
- [ ] Os rótulos dos botões são inequívocos sobre a ação destrutiva.

---

## Diretrizes Globais de Acessibilidade (WCAG 2.1 AA)

Além dos checklists específicos de cada aba, as seguintes regras se aplicam a **toda a interface**.

### 1 Estrutura e Semântica HTML

- Use HTML semântico: `<header>`, `<nav>`, `<main>`, `<section>`, `<h1>`–`<h6>`. Não use `<div>` ou `<span>` clicáveis quando um `<button>` ou `<a>` for apropriado.
- A página deve ter um **título (`<title>`) descritivo** e um único `<h1>` que identifique a aba atual.
- Forneça um **link de “Pular para o conteúdo principal”** (skip link) como primeiro elemento focável, visível ao receber foco.

### 2 Navegação por Teclado

- **Toda** a funcionalidade deve ser operável apenas com teclado (Tab, Shift+Tab, Enter, Espaço, Setas).
- A ordem de tabulação deve seguir a ordem visual e lógica do conteúdo.
- O **indicador de foco** deve ser sempre visível e ter contraste suficiente (use `outline` ou `box-shadow` com `--focus-ring`). Nunca remova o outline sem fornecer uma alternativa.

### 3 Nomes Acessíveis e ARIA

- **Prefira mecanismos nativos**: Use `<label for="...">` para formulários e texto visível dentro de `<button>` sempre que possível. ARIA só deve ser usado quando o HTML nativo não for suficiente.
- **`aria-labelledby` > `aria-label`**: Quando houver um rótulo visível na tela, use `aria-labelledby` apontando para o `id` desse rótulo, em vez de duplicar o texto em `aria-label` .
- **Ícones**: Ícones puramente decorativos devem ter `aria-hidden="true"`. Ícones que transmitem informação ou são botões devem ter um nome acessível (texto visível ou `aria-label`).

### 4 Feedback Dinâmico

- Regiões que são atualizadas dinamicamente (resultados de filtro, status de upload, mensagens de erro/sucesso) devem ser contêineres com `aria-live="polite"` (para atualizações não urgentes) ou `aria-live="assertive"` / `role="alert"` (para erros críticos).

---

## Instruções de Implementação para o Agente

1.  **Comece pelo sistema de temas**: Implemente os tokens CSS (variáveis) para os dois temas no `:root` e em `[data-theme="dark"]`. Crie um pequeno script para alternar o atributo e persistir no `localStorage`.
2.  **Construa o layout base**: Crie a sidebar de navegação e a área de conteúdo principal (`<main>`). Garanta que a troca de abas seja acessível (use `role="tablist"`, `role="tab"` e `role="tabpanel"`, ou uma navegação simples com links e atualização de conteúdo).
3.  **Implemente aba por aba**, seguindo as especificações e checklists da Seção 5. Para cada componente, consulte as diretrizes globais da Seção 6.
4.  **Valide a acessibilidade continuamente**: Use ferramentas como axe DevTools ou o Lighthouse do Chrome para verificar contraste, nomes acessíveis e estrutura semântica. A meta é **zero violações de nível AA do WCAG 2.1**.
5.  **Documente o contraste**: Crie uma tabela de verificação de contraste no código (como no exemplo `colors.css`) provando que todos os pares de cores usados atingem as proporções exigidas.

Este documento deve ser a referência definitiva. Qualquer decisão de design ou implementação que não esteja explicitamente coberta aqui deve seguir os princípios do **Flat Design 2.0** e as diretrizes da **WCAG 2.1 AA**.