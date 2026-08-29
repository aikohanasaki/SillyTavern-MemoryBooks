<!--
Copyright (C) 2024–2026 Aiko Hanasaki
SPDX-License-Identifier: AGPL-3.0-only
-->

# Memory Books: Manual Completo de Referência para IA

**Produto:** SillyTavern Memory Books (STMB)  
**Versão de referência:** v8.5.0, 1 de agosto de 2026  
**Objetivo:** Uma única fonte de verdade, densa e completa, para um assistente de IA que ensina, explica e soluciona problemas do Memory Books.

---

## Índice

- [1. Como um assistente de IA deve usar este manual](#1-como-um-assistente-de-ia-deve-usar-este-manual)
- [2. Definição do produto e modelo mental](#2-definição-do-produto-e-modelo-mental)
- [3. Vocabulário básico e seleção de recursos](#3-vocabulário-básico-e-seleção-de-recursos)
- [4. Requisitos, instalação e verificação inicial](#4-requisitos-instalação-e-verificação-inicial)
- [5. Abrindo o Memory Books e entendendo o painel principal](#5-abrindo-o-memory-books-e-entendendo-o-painel-principal)
- [6. Modos de armazenamento do Memory Book](#6-modos-de-armazenamento-do-memory-book)
- [7. Perfis, conexões e roteamento de geração](#7-perfis-conexões-e-roteamento-de-geração)
- [8. Cenas, Memories manuais, Memories automáticas e Catch-Up](#8-cenas-memories-manuais-memories-automáticas-e-catch-up)
- [9. Economia de tokens, mensagens ocultas e limite de memória](#9-economia-de-tokens-mensagens-ocultas-e-limite-de-memória)
- [10. Ativação e recuperação de lorebook](#10-ativação-e-recuperação-de-lorebook)
- [11. Modo de chat em grupo real](#11-modo-de-chat-em-grupo-real)
- [12. Narrator Mode](#12-narrator-mode)
- [13. Ramificações de chat](#13-ramificações-de-chat)
- [14. Clips](#14-clips)
- [15. Topical Clips](#15-topical-clips)
- [16. Side Prompts](#16-side-prompts)
- [17. Consolidation](#17-consolidation)
- [18. Compaction](#18-compaction)
- [19. Regeneration](#19-regeneration)
- [20. Contexto para geração](#20-contexto-para-geração)
- [21. Arquitetura de prompts, Summary Prompts integrados e regras de autoria](#21-arquitetura-de-prompts-summary-prompts-integrados-e-regras-de-autoria)
- [22. Summary Prompt Manager e Consolidation Prompt Manager](#22-summary-prompt-manager-e-consolidation-prompt-manager)
- [23. STMB e outras extensões](#23-stmb-e-outras-extensões)
- [24. Títulos de entradas de lorebook e política de caracteres](#24-títulos-de-entradas-de-lorebook-e-política-de-caracteres)
- [25. Fila de tarefas e controles de repetição](#25-fila-de-tarefas-e-controles-de-repetição)
- [26. Feedback visual e acessibilidade](#26-feedback-visual-e-acessibilidade)
- [27. Mapa de configurações e referência atual](#27-mapa-de-configurações-e-referência-atual)
- [28. Referência de comandos slash](#28-referência-de-comandos-slash)
- [29. Solução de problemas por estágio](#29-solução-de-problemas-por-estágio)
- [30. FAQ](#30-faq)
- [31. Compatibilidade, migração e notas históricas atuais](#31-compatibilidade-migração-e-notas-históricas-atuais)
- [32. Notas de desenvolvimento e licença](#32-notas-de-desenvolvimento-e-licença)
- [33. Árvore compacta de diagnóstico](#33-árvore-compacta-de-diagnóstico)
- [34. Sequência mínima de ensino recomendada](#34-sequência-mínima-de-ensino-recomendada)
- [35. Resumo final dos conceitos](#35-resumo-final-dos-conceitos)

---

## 1. Como um assistente de IA deve usar este manual

Trate este documento como a referência operacional atual do Memory Books. Ele substitui a necessidade de carregar separadamente o guia Start Here, o README, o User Guide, o guia Side Prompts, o guia How STMB Works e o changelog histórico como arquivos independentes de conhecimento.

Termos:

- STMB = SillyTavern=MemoryBooks (esta extensão)
- ST = SillyTavern (o código-base que o STMB estende)

Ao responder aos usuários:

1. Preserve exatamente a terminologia do Memory Books. Um **Memory Book** é um lorebook do SillyTavern usado pelo STMB; não é um formato de banco de dados separado.
2. Diferencie o comportamento atual do comportamento histórico. Não ensine um fluxo removido ou substituído apenas porque ele apareceu em um changelog antigo.
3. Diferencie **Group Chat Mode** de **Narrator Mode**. Eles resolvem problemas diferentes.
4. Diferencie a **geração** de Memories, o **armazenamento/configuração** do lorebook e a **recuperação posterior pelo SillyTavern**. Activation/retrieval faz parte do código-base do ST.
5. Não invente controles, nomes de menus, comportamento de provedores ou configurações que não estejam descritos aqui.
6. Quando houver uma captura de tela, identifique apenas os controles visíveis. Dê a próxima ação imediata em vez de presumir que existe um controle fora da tela.
7. Ao solucionar problemas, identifique o primeiro estágio que falhou e teste-o antes de recomendar alterações de prompt.
8. Prefira primeiro uma configuração simples que funcione, antes de roteamento avançado, vários books, prompts personalizados, Regex ou automação de Side Prompts.
9. Explique que character filters e Memory Books separados melhoram o roteamento e a relevância; eles não constituem uma barreira de segurança.
10. Declare incerteza quando a versão instalada do usuário, a versão do SillyTavern, o provedor ou um prompt personalizado puderem diferir.

### Notas do documento atual

Narrator Mode está implementado na v8.5.0.

Vários documentos para iniciantes diziam que uma Memory manual era tecnicamente necessária antes do início das Memories automáticas. O STMB atual pode criar a primeira Memory automática a partir da mensagem 0 quando não existe um baseline de mensagens processadas. Uma primeira Memory manual ainda é recomendada porque verifica a conexão, o Memory Book, o formato da saída e o limite inicial desejado antes de confiar na automação.

---

## 2. Definição do produto e modelo mental

Memory Books é uma extensão do SillyTavern que converte intervalos de chat selecionados ou escolhidos automaticamente em entradas estruturadas de memória armazenadas em lorebooks do SillyTavern.

O processo básico é:

```text
Chat messages
    ↓
STMB selects or receives a message range
    ↓
STMB assembles an AI request
    ↓
The model returns a structured memory
    ↓
STMB saves a lorebook entry
    ↓
Old processed chat messages may be hidden from active context
    ↓
SillyTavern later activates relevant lorebook entries
    ↓
The chat model receives those entries as context
```

O STMB não dá ao modelo uma memória interna permanente. Ele mantém um sistema externo de referência (entradas de lorebook). O modelo de chat “lembra” quando o SillyTavern inclui as entradas relevantes do lorebook no prompt enviado à IA.

### Os três estágios separados

1. **Qualidade da geração** — O modelo de geração de Memory produziu um resultado correto e útil?
2. **Armazenamento e configuração** — O resultado foi salvo no Memory Book pretendido, com configurações de ativação adequadas?
3. **Recuperação e uso pelo modelo** — O SillyTavern ativou e enviou a entrada, e o modelo de chat a usou corretamente?

Solucione esses estágios separadamente.

### Lorebooks e Memory Books

Um **lorebook**, também chamado de **World Info** em partes do SillyTavern, é uma coleção de entradas que o SillyTavern pode adicionar condicionalmente a uma solicitação ao modelo. Uma entrada de lorebook normalmente possui:

- título/comentário;
- conteúdo;
- palavras-chave de ativação ou outro modo de ativação;
- posição e ordem de inserção;
- controles de recursão e orçamento;
- filtros opcionais de personagens e outros metadados.

Um **Memory Book** é um lorebook comum do SillyTavern usado pelo STMB. Pode ser aberto, editado, reordenado, exportado, importado ou excluído usando as ferramentas normais de lorebook. Dependendo dos recursos utilizados, pode conter:

- Memories de cena;
- resumos Arc, Chapter, Book, Legend, Series ou Epic;
- entradas Clip e Topical Clip;
- entradas de tracker de Side Prompt;
- outras entradas gerenciadas pelo STMB.

### Entradas de Memory são contexto comprimido

Uma Memory de cena não é a transcrição original. É uma representação comprimida destinada a preservar informações relevantes para continuidade, como:

- eventos e consequências;
- decisões e planos;
- descobertas e revelações;
- mudanças emocionais ou de relacionamento;
- conhecimento, crenças ou mal-entendidos individuais;
- objetos, locais, identidades, promessas e restrições importantes.

Ocultar mensagens processadas não as exclui. Isso impede que sejam enviadas à IA e, portanto, que continuem consumindo contexto ativo do histórico do chat.

---

## 3. Vocabulário básico e seleção de recursos

| Necessidade | Recurso | Significado |
|---|---|---|
| Resumir um intervalo de chat selecionado ou automático | **Memory** | “Lembre-se do que aconteceu nesta cena.” |
| Salvar um trecho selecionado do chat ou um fato | **Clip** | “Salve esta nota.” |
| Reunir fatos sobre um assunto a partir de Memories salvas | **Topical Clip** | “Reúna tudo que minhas Memories dizem sobre isto.” |
| Manter informações que mudam ao longo de execuções repetidas | **Side Prompt** | “Mantenha este tracker atualizado.” |
| Combinar várias Memories ou resumos de nível inferior | **Consolidation** | “Transforme estas entradas em um resumo de nível mais alto.” |
| Encurtar uma única entrada existente gerenciada pelo STMB | **Compaction** | “Enxugue esta entrada sem perder fatos.” |
| Substituir uma entrada existente usando suas fontes originais | **Regeneration** | “Reconstrua esta entrada e revise uma substituição.” |

### Diferenças entre recursos que os usuários costumam confundir

- **Clip vs Topical Clip:** um Clip começa com texto destacado no chat atual. Um Topical Clip começa com Memories confirmadas do STMB já existentes.
- **Topical Clip vs Side Prompt:** um Topical Clip é executado manualmente para reunir um tópico. Um Side Prompt pode manter repetidamente um tracker que muda.
- **Compaction vs Consolidation:** Compaction reescreve uma entrada. Consolidation cria um novo resumo de nível superior a partir de várias entradas.
- **Memory vs Side Prompt:** Memories normalmente são registros sequenciais de cenas. Side Prompts normalmente atualizam ou sobrescrevem um único documento de suporte contínuo.
- **Geração vs recuperação:** criar uma entrada não garante que o SillyTavern a ative posteriormente.

---

## 4. Requisitos, instalação e verificação inicial

### Requisitos

- SillyTavern 1.18.0 ou posterior; recomenda-se a versão compatível mais recente.
- Uma conexão de IA funcionando.
- Um modelo capaz de seguir instruções e, nos fluxos de Memory e Consolidation, retornar JSON válido.
- Permissão para instalar extensões de terceiros no SillyTavern.
- Um preset de Chat Completion disponível no SillyTavern ao usar um backend local ou Text Completion por meio de um endpoint OpenAI-compatible Chat Completion.

### Usuários normais de Chat Completion

OpenAI, Anthropic/Claude, OpenRouter, Gemini/Google e outras conexões de Chat Completion normalmente podem usar o perfil integrado **Current SillyTavern Settings**.

### Usuários de backends locais e Text Completion

KoboldCpp, llama.cpp, TextGen, Ollama e backends semelhantes geralmente funcionam com maior confiabilidade quando expostos por um endpoint OpenAI-compatible Chat Completion. Mesmo quando o roleplay normal usa Text Completion, o SillyTavern precisa ter um preset de Chat Completion disponível para o STMB.

Configuração típica do KoboldCpp:

- API type: Chat Completion;
- source: Custom OpenAI-compatible;
- endpoint como `http://localhost:5001/v1` ou `http://127.0.0.1:5000/v1`;
- qualquer custom API key não vazia, se o SillyTavern exigir uma;
- model ID no formato esperado pelo endpoint, normalmente `koboldcpp/modelname`, sem um sufixo `.gguf` desnecessário;
- preset de Chat Completion importado;
- response length de pelo menos 2048 tokens, sendo 4096 frequentemente mais seguro.

Configuração típica do llama.cpp:

- API type: Chat Completion;
- source: Custom OpenAI-compatible;
- endpoint `http://localhost:8080/v1`, ou `http://host.docker.internal:8080/v1` quando o SillyTavern estiver em Docker;
- qualquer API key não vazia, se exigido pelo SillyTavern;
- o model ID servido;
- sem prompt post-processing, a menos que o endpoint exija.

Exemplo de comando de servidor:

```sh
llama-server -m <model-path> -c <context-size> --port 8080
```

### Chat Top Bar opcional

O STMB funciona sem Chat Top Bar / Chat Top Info Bar. Instalá-lo adiciona a interface de fila **Memory Books Jobs** para trabalhos ativos, concluídos, com falha, cancelados, bloqueados e aguardando revisão.

### Instalação

1. Abra o SillyTavern.
2. Abra o painel principal **Extensions**.
3. Escolha **Install Extension**.
4. Instale o repositório oficial do Memory Books.
5. Recarregue o SillyTavern, se solicitado.
6. Abra um chat de personagem ou chat em grupo.
7. Aguarde alguns segundos para os controles do STMB inicializarem.

SillyTavern Extras não é necessário.

### Confirmar que o STMB carregou

Pelo menos um destes elementos deve aparecer:

- **Memory Books** no menu Extensions de varinha mágica ao lado da caixa de entrada do chat;
- chevrons de cena **►** e **◄** nas ações expandidas das mensagens.

Se nenhum aparecer:

1. aguarde até dez segundos;
2. atualize a página;
3. confirme que a extensão está instalada e habilitada;
4. reabra um chat de personagem ou grupo;
5. só examine o console do navegador depois que as verificações básicas falharem.

---

## 5. Abrindo o Memory Books e entendendo o painel principal

Abra o menu Extensions de varinha mágica perto da caixa de entrada do chat e escolha **Memory Books**.

O painel pode incluir:

- Current Scene;
- Memory Status / highest processed message;
- Current Lorebook Configuration;
- Memory Profiles;
- Profile Actions;
- Extra Function Buttons;
- Prompt Managers;
- General Settings;
- Automatic Memories;
- Token Saving;
- controles de personagem de grupo ou Narrator, quando relevantes.

Para uma primeira Memory, apenas três decisões são necessárias:

1. Qual Memory Book receberá a entrada?
2. Qual perfil/conexão irá gerá-la?
3. Quais mensagens do chat formam a cena?

---

## 6. Modos de armazenamento do Memory Book

### 6.1 Automatic Mode: Memory Book vinculado ao chat

Automatic Mode é o padrão normal. O STMB usa o lorebook vinculado ao chat atual pelo SillyTavern.

Use quando:

- um chat tem um Memory Book principal;
- prefere-se configuração mínima;
- personagens de grupo não precisam de Memory Books separados.

Se nenhum lorebook estiver vinculado, vincule um no SillyTavern ou use Auto-Create.

### 6.2 Auto-Create Lorebook Mode

Ative **Auto-create lorebook if none exists** para permitir que o STMB crie e vincule um lorebook quando uma Memory for salva pela primeira vez.

O template de nome padrão pode usar:

- `{{char}}` — nome do personagem ou grupo;
- `{{user}}` — nome do usuário;
- `{{chat}}` — ID/nome do chat.

O STMB adiciona sufixos numéricos quando necessário para evitar nomes duplicados.

Auto-Create e Manual Lorebook Mode são mutuamente exclusivos.

### 6.3 Manual Lorebook Mode

Ative **Manual Lorebook Mode** para escolher um Memory Book independentemente do lorebook vinculado ao chat.

Use quando:

- as Memories devem ficar em um lorebook dedicado;
- vários chats compartilham intencionalmente um Memory Book;
- membros de grupo precisam de books separados;
- Narrator Mode é usado;
- o usuário entende o plano de ativação resultante.

A seleção do Memory Book manual principal é armazenada para o chat atual, a menos que um lock persistente de personagem a substitua em um chat solo compatível.

### 6.4 Memory Books separados geralmente são mais claros

Um Memory Book dedicado facilita:

- separar Memories de definições de personagem e lore de cenário;
- definir orçamento e ordem de lorebook independentes;
- reutilizar ou exportar o histórico de memória;
- inspecionar entradas gerenciadas pelo STMB sem lore não relacionado;
- diagnosticar ativação.

É uma recomendação, não uma exigência.

### 6.5 Character Memory Book locks

Um character Memory Book lock é uma atribuição persistente de Manual Mode anexada a um character card.

Em um chat solo:

- um manual book desbloqueado pertence ao chat atual;
- um book bloqueado acompanha o character card entre chats compatíveis de Manual Mode;
- o manual book não pode ser alterado até o lock ser removido.

Em um chat em grupo real:

- uma atribuição por personagem desbloqueada pertence ao chat em grupo atual;
- uma atribuição por personagem bloqueada acompanha aquele character card em grupos compatíveis de Manual Mode;
- um locked book ausente gera um estado de broken lock que deve ser desbloqueado ou reparado.

Use locks somente quando o mesmo personagem deve compartilhar intencionalmente um único Memory Book contínuo entre histórias. Eles são perigosos para universos alternativos ou linhas do tempo não relacionadas.

### 6.6 Layout inicial recomendado

- Chat solo: um Memory Book vinculado ao chat ou criado automaticamente.
- Chat em grupo real: um Memory Book do grupo.
- Chat Narrator: um Memory Book onisciente mais um book único para cada personagem declarado, conforme exigido pelo Narrator Mode.

---

## 7. Perfis, conexões e roteamento de geração

Um perfil do Memory Books controla tanto a geração quanto as configurações da entrada de lorebook resultante.

### 7.1 Primeiro perfil recomendado

Use **Current SillyTavern Settings** primeiro. Ele usa o provedor, modelo e temperatura atualmente ativos no SillyTavern.

Não comece reescrevendo prompts nem configurando um endpoint Full Manual. Primeiro prove que uma Memory pode ser gerada e salva.

### 7.2 Por que criar um perfil STMB salvo

Crie um perfil separado quando for necessário:

- usar um modelo mais barato ou mais confiável para Memories;
- usar um provedor diferente do roleplay;
- vincular uma conexão Custom nomeada;
- escolher um summary prompt personalizado;
- usar temperatura ou comportamento de saída máxima diferentes;
- alterar a formatação do título;
- alterar ativação, inserção, ordem ou recursão;
- usar prompts separados de grupo/onisciente e focados em personagem.

### 7.3 Campos de perfil

Um perfil pode incluir:

- display name;
- API/provider;
- model ID;
- temperature;
- preset de Summary Prompt;
- prompts opcionais separados para múltiplos personagens;
- comportamento de structured output;
- roteamento opcional pelo SillyTavern ChatCompletionService;
- preset opcional de Chat Completion;
- comportamento de reverse proxy;
- formato de título;
- modo de ativação: Normal, Constant ou Vectorized;
- posição de inserção, incluindo character, example-message, author’s-note e Outlet;
- nome do Outlet, quando aplicável;
- valor de ordem automático ou manual;
- Prevent Recursion;
- Delay Until Recursion.

### 7.4 Conexões Custom OpenAI-compatible nomeadas

Um perfil Custom OpenAI-compatible pode:

- usar a conexão Custom atualmente ativa no SillyTavern; ou
- vincular uma conexão Custom nomeada do Connection Manager do SillyTavern.

A conexão nomeada fornece sua URL e secret salvos. O campo de modelo no perfil STMB continua sendo o override de modelo. Se a conexão nomeada for excluída ou deixar de ser uma conexão Custom Chat Completion, o STMB bloqueia a solicitação em vez de roteá-la silenciosamente para outro lugar.

### 7.5 Fallback de structured output

**Skip structured output and use plain-text completion** impede que o STMB envie um schema de structured output a provedores que o rejeitam. O modelo ainda precisa retornar o JSON válido exigido pelo prompt de Memory ou Consolidation selecionado.

### 7.6 ChatCompletionService

**Use ST’s ChatCompletionService** roteia solicitações de perfis compatíveis pelo helper de requisição do SillyTavern e pode aplicar um preset de Chat Completion selecionado do SillyTavern. Solicitações OpenRouter também herdam a ordem de provedores, filtros de quantização, controles de fallback e a configuração de roteamento middle-out do SillyTavern. Esses controles do OpenRouter permanecem em vigor se o ChatCompletionService falhar e o STMB repetir pela rota de fallback. Se essa tentativa também falhar, o STMB retém e relata tanto o erro inicial do ChatCompletionService quanto a resposta do provedor no fallback. Perfis Full Manual não usam essa rota.

### 7.7 Reverse proxy e Full Manual Configuration

**Use reverse proxy** encaminha os detalhes de reverse proxy configurados no SillyTavern para provedores compatíveis.

**Full Manual Configuration** armazena um endpoint e uma key separados dentro do perfil STMB. É uma rota excepcional. Sempre que possível, prefira um provedor ou conexão Custom configurado e testado no SillyTavern.

### 7.8 Tamanho da saída

A configuração global de maximum response tokens do STMB pode substituir o comprimento normal de saída de Chat Completion para trabalhos do Memory Books. JSON cortado é uma causa comum de falha de geração. Aumente o limite de saída antes de enfraquecer o schema ou o prompt.

---

## 8. Cenas, Memories manuais, Memories automáticas e Catch-Up

### 8.1 O que é uma cena

Uma **cena** é o intervalo inclusivo de mensagens do chat que o STMB processa em uma única Memory.

Limites úteis normalmente contêm uma unidade coerente:

- um evento;
- uma conversa;
- uma etapa de investigação;
- um desenvolvimento emocional ou de relacionamento;
- uma mudança de local ou objetivo;
- uma sequência de ações conectadas.

Intervalos triviais muito pequenos podem produzir pouco valor. Intervalos muito grandes custam mais, são mais difíceis de resumir, podem exceder o contexto e frequentemente combinam eventos não relacionados.

### 8.2 Marcar uma cena manualmente

1. Expanda as ações da mensagem, normalmente por um controle de três pontos ou semelhante.
2. Clique em **►** na primeira mensagem incluída.
3. Clique em **◄** na última mensagem incluída.
4. Abra Memory Books e confirme início, fim, speakers, contagem de mensagens e estimativa de tokens exibidos.

As duas mensagens de limite são incluídas.

Use **Clear Scene** para remover a seleção, ou escolha outro marcador de início/fim para substituir um dos limites.

### 8.3 Criar uma Memory manual

1. Confirme a cena.
2. Confirme o Memory Book efetivo.
3. Confirme o perfil selecionado.
4. Clique em **Create Memory** ou use `/creatememory`.
5. Revise janelas de confirmação, aviso de tokens, confirmação de participantes ou preview, quando aparecerem.
6. Aprove o resultado.
7. Confirme que existe uma nova entrada de lorebook e que Memory Status avançou até o fim da cena.

Um resultado válido de Memory normalmente contém:

- um título;
- conteúdo;
- palavras-chave;
- metadados STMB, incluindo intervalo de origem e identidade do chat.

### 8.4 Previews de Memory

Quando **Show memory previews** está ativado, revise e opcionalmente edite:

- título;
- conteúdo da Memory;
- palavras-chave.

Verifique nomes, atribuição, fatos, consequências omitidas e comentários não relacionados. Sem previews, um resultado válido é salvo automaticamente.

### 8.5 Memories automáticas

Ative **Auto-create memory summaries** e configure:

- **Auto-Summary Interval** — quantidade de novas mensagens processadas por Memory automática;
- **Auto-Summary Buffer** — quantidade de mensagens mais recentes deixadas de fora para que uma cena ainda em andamento não seja resumida cedo demais.

Exemplo:

```text
Interval: 30
Buffer: 2
```

O STMB aguarda até existirem pelo menos 32 mensagens além do limite processado e cria uma Memory terminando duas mensagens antes da mensagem mais recente.

Se nenhum baseline processado existir, o STMB atual trata o baseline como `-1` e pode começar na mensagem 0. Uma primeira Memory manual continua recomendada para validar a configuração e escolher deliberadamente o ponto inicial.

Intervalos menores criam Memories mais focadas e mais solicitações. Intervalos maiores criam menos Memories, porém maiores, com maior risco de combinar material não relacionado. Um ponto inicial prático é aproximadamente 20–40 mensagens em roleplay detalhado e 40–60 para trocas mais curtas e rápidas.

A geração automática pode ser adiada quando um Memory Book exigido ainda não foi atribuído.

### 8.6 Baseline de mensagens processadas

O STMB armazena a mensagem processada de maior ID para cada chat. Ela determina:

- onde `/nextmemory` começa;
- onde Memories automáticas começam;
- o indicador de limite de memória;
- quais mensagens contam como já processadas.

Use:

- `/stmb-highest` para exibi-la;
- `/stmb-set-highest <N>` para defini-la manualmente;
- `/stmb-set-highest none` para limpá-la.

Alterações manuais devem ser deliberadas porque podem causar intervalos pulados ou repetidos.

### 8.7 Catch-up para um chat longo já existente

Use:

```text
/stmb-catchup interval=<chunk size> start=<first message id> end=<last message id>
```

Exemplo:

```text
/stmb-catchup interval=40 start=0 end=245
```

O intervalo é inclusivo. Os chunks são processados em sequência; o último pode ser menor.

Catch-up é intencionalmente não interativo. Antes de executá-lo:

- selecione e teste o perfil pretendido;
- ative **Always use default profile**;
- desative **Show memory previews**;
- confirme que o Memory Book efetivo existe ou permita Auto-Create no Automatic Mode;
- repare todas as atribuições exigidas de books em configuração multi-character;
- escolha um chunk size abaixo do limite de aviso de tokens.

O STMB faz preflight de cada chunk, processa em ordem e para na primeira falha ou em `/stmb-stop`. Chunks anteriores já concluídos permanecem salvos. Retome da primeira mensagem não concluída em vez de repetir o intervalo inteiro.

Use catch-up para conversão ampla. Limites manuais de cena continuam melhores quando limites literários ou de evento importam.

---

## 9. Economia de tokens, mensagens ocultas e limite de memória

### 9.1 Ocultar não é excluir

Mensagens ocultas permanecem no arquivo do chat. Elas são omitidas do contexto ativo do chat até serem reveladas novamente.

### 9.2 Modos de auto-hide

**Auto-hide messages after adding memory** pode ser:

- Do not auto-hide;
- Auto-hide all messages up to the last Memory;
- Auto-hide only messages in the last Memory.

**Messages to leave unhidden** preserva uma pequena sobreposição recente perto do limite.

> **Usando a extensão Presence:** Presence pode revelar depois mensagens que o STMB ocultou, porque ambas as extensões modificam o estado compartilhado de visibilidade de mensagens do SillyTavern. Consulte [STMB e outras extensões](#23-stmb-e-outras-extensões) para orientações de configuração.

### 9.3 Unhide antes da geração

**Unhide hidden messages for memory generation** revela um intervalo selecionado antes que o STMB o compile. Use ao regenerar ou reprocessar intervalos que já haviam sido ocultados. O modo de auto-hide selecionado determina o que volta a ser ocultado depois de um salvamento bem-sucedido.

### 9.4 Indicador de limite da Memory

O indicador usa a maior mensagem processada para mostrar onde termina o histórico processado e começa o chat não processado.

Modos:

- Off;
- Memory boundary divider;
- draggable jump button;
- divider plus jump button.

O jump button rola em direção à primeira mensagem não processada e memoriza sua posição arrastada.

### 9.5 Boa configuração para aprender

Uma configuração inicial prática é:

- mostrar o divider do limite e o jump button;
- deixar duas mensagens sem ocultar;
- ativar unhide temporário para geração;
- não usar auto-hide até confirmar que uma Memory foi salva corretamente;
- depois mudar para ocultar todas as mensagens processadas e obter o principal benefício de economia de tokens.

---

## 10. Ativação e recuperação de lorebook

### 10.1 Palavras-chave

Memories normais são frequentemente ativadas por palavras-chave. Boas palavras-chave são concretas e distintas:

- nomes e aliases de personagens;
- locais ou organizações nomeados;
- objetos importantes;
- nomes de eventos;
- identificadores;
- descobertas ou ações específicas.

Palavras-chave fracas como `important event`, `conversation` ou `secret` são amplas demais.

O conteúdo da Memory determina o que o modelo aprende. As palavras-chave ajudam a determinar quando o SillyTavern a recupera.

### 10.2 Modos de ativação

- **Normal:** ativação baseada em palavras-chave/regras.
- **Constant:** sempre ativa, sujeita ao orçamento e aos controles de entrada aplicáveis.
- **Vectorized:** usa recuperação relacionada a vetores quando a configuração do usuário a suporta.

Vectors são opcionais. O STMB funciona por palavras-chave sem a extensão Vectors.

### 10.3 Configurações globais recomendadas de World Info

Recomendações iniciais comuns:

- Match Whole Words: off;
- Scan Depth: relativamente alto, como 8;
- Max Recursion Steps: aproximadamente 2;
- Context percentage: dimensionado para o contexto total do usuário e o material concorrente no prompt.

São recomendações, não exigências rígidas.

### 10.4 Delay Until Recursion

Se o Memory Book for a única fonte ativa de lorebook/World Info, deixe **Delay Until Recursion** desativado. Caso contrário, nenhuma entrada pode iniciar o primeiro ciclo de recursão e a Memory pode nunca ativar.

### 10.5 Diagnosticar recuperação

Quando uma IA “não lembra”:

1. Confirme que a entrada existe.
2. Confirme que o Memory Book correto está ativo para o chat.
3. Confirme que a entrada está habilitada.
4. Confirme que palavras-chave ou modo de ativação combinam com a conversa atual.
5. Confirme que o orçamento de lorebook é suficiente.
6. Confirme as configurações de recursão.
7. Use uma ferramenta de inspeção de World Info ou log de requisição para confirmar se a entrada realmente foi enviada.
8. Se foi enviada, mas ignorada, o problema restante é comportamento do modelo ou contexto concorrente, não armazenamento do STMB.

---
## 11. Modo de chat em grupo real

### 11.1 Definição

Group Chat Mode se aplica a um grupo real do SillyTavern contendo dois ou mais character cards separados.

```text
SillyTavern Group
├── Alice character card
├── Bob character card
└── Clara character card
```

O SillyTavern registra qual card escreveu cada mensagem, portanto o STMB pode preservar a atribuição de falas e detectar os membros do grupo participantes.

Não é necessário um interruptor separado de Group Chat Mode. Abra um chat em grupo e use o STMB normalmente.

### 11.2 Detecção de participantes

Um participante detectado normalmente é um character card que escreveu pelo menos uma mensagem dentro da cena selecionada.

O STMB não deduz pela prosa todas as pessoas fisicamente presentes. Portanto:

- um observador silencioso pode não ser detectado;
- um personagem apenas mencionado não é participante;
- um personagem ausente discutido pelo grupo não é selecionado;
- o usuário não é tratado como um alvo separado de Memory Book de personagem do grupo;
- identidades duplicadas ou incomuns de speaker podem precisar de correção.

Se a detecção automática de participantes não encontrar nenhum personagem do grupo, o STMB abre a confirmação de participantes mesmo quando a aceitação automática está habilitada. O aviso explica que a detecção falhou e exige que o usuário revise quais personagens do grupo estavam presentes antes de continuar.

O prompt de participantes significa: **A quais personagens do grupo esta Memory deve ser associada?** Ele não comprova quem sabia cada fato nem quem estava fisicamente presente.

### 11.3 Um único Memory Book do grupo

Este é o layout inicial recomendado.

Use Automatic Mode, Auto-Create ou um book principal de Manual Mode. Cada cena produz uma entrada canônica no Memory Book do grupo. Quando nomes de participantes estão disponíveis, a entrada pode receber um filtro inclusivo de personagem do SillyTavern.

Um filtro inclusivo para Alice e Bob significa que a entrada pode ativar quando Alice **ou** Bob estiver ativo. Ele não cria um personagem sintético “Alice and Bob” nem um book separado para o subconjunto.

Um único book de grupo é melhor quando:

- o elenco compartilha principalmente uma só história;
- um resumo onisciente/orientado ao grupo é suficiente;
- prefere-se configuração mínima e menos entradas duplicadas;
- STLO não é necessário.

Uma única Memory de grupo ainda pode preservar conhecimento assimétrico:

> Alice found the transmitter and hid it. Bob believed the room was empty.

### 11.4 Um book do grupo mais books por personagem

O layout avançado de grupo real usa:

- um Memory Book canônico do grupo;
- um Memory Book atribuído para cada membro do grupo.

Requisitos:

- Manual Lorebook Mode;
- SillyTavern-LorebookOrdering (STLO) instalado e habilitado;
- uma atribuição válida para cada membro do grupo exigido.

O book canônico do grupo não pode também ser um character book. Mais de um personagem pode compartilhar o mesmo character book; o STMB grava uma única cópia nesse book compartilhado em vez de duplicatas.

Quando uma Memory é salva:

1. a versão canônica é gravada no book do grupo;
2. a seleção de participantes é confirmada, a menos que aceitação automática esteja ativada;
3. cópias vinculadas são gravadas nos books dos participantes selecionados;
4. o STMB reverte gravações parciais quando possível se um salvamento exigido falhar.

Selecionar nenhum participante na confirmação de participantes de grupo real aplica a Memory a todos os membros atuais do grupo.

### 11.5 Prompts separados de grupo e personagem

Por padrão, a mesma Memory orientada ao grupo é copiada para os books dos participantes.

Um perfil pode ativar **Use separate group and character prompts in group chats**. Então:

- o Group Summary Prompt grava a versão canônica do grupo;
- o Character Summary Prompt grava uma versão individualizada para cada book de destino de um único personagem.

Versões focadas em personagem podem preservar:

- conhecimento privado;
- crenças incorretas;
- reações emocionais pessoais;
- prioridades específicas de relacionamento;
- o que foi importante para um participante.

Isso exige solicitações adicionais à IA. Um character book compartilhado recebe uma única cópia compartilhada, não uma duplicata por personagem atribuído.

### 11.6 Responsabilidades do STLO

Memory Books decide:

- intervalo da cena;
- participantes;
- conteúdo do resumo;
- quais books recebem cópias;
- se prompts individualizados são usados.

STLO decide:

- quando um lorebook está ativo;
- qual personagem pode ativá-lo;
- prioridade, posição, orçamento e ordenação.

Quando o STMB atribui um character book, ele adiciona o basename do avatar do personagem a `stlo.characterOverrides` e habilita `stlo.onlyWhenSpeaking`, preservando prioridades, orçamentos e overrides existentes do STLO.

O STMB usa comportamento somente de merge. Limpar ou alterar uma atribuição não remove automaticamente o override antigo de personagem no STLO. Remova overrides obsoletos manualmente no STLO.

### 11.7 Filtros e books não são controles de privacidade

Books e filtros separados melhoram a relevância. Eles não garantem que:

- um personagem nunca receba informações de outro;
- o modelo nunca veja a versão canônica do grupo;
- o contexto de Memories anteriores seja perfeitamente particionado por conhecimento;
- um character book represente somente conhecimento consciente.

Use-os como ferramentas de roteamento de contexto, não como barreiras de segurança.

### 11.8 Cópias vinculadas não são sincronizadas ao vivo

Entradas vinculadas compartilham metadados que permitem ao STMB reconhecer o mesmo evento original, mas edições posteriores são independentes.

Editar, excluir ou compactar uma cópia não altera automaticamente as outras. Regenerar uma cópia de personagem também muda somente essa cópia. Ao regenerar a entrada canônica do grupo, porém, o STMB pergunta se deve regenerar só aquela entrada ou regenerá-la junto com todas as entradas de personagem vinculadas. Cada entrada selecionada recebe sua própria geração e revisão de aprovação, portanto prompts focados em personagem continuam focados em personagem.

### 11.9 Adicionar, remover ou reatribuir membros do grupo

Ao adicionar um personagem:

- atribua um book válido antes da próxima Memory distribuída;
- Memories antigas não são copiadas retroativamente;
- filtros antigos não são reescritos;
- forneça contexto histórico manualmente, se necessário.

Ao remover um personagem:

- entradas existentes permanecem;
- filtros antigos e overrides do STLO permanecem;
- cópias vinculadas não são excluídas automaticamente.

Ao trocar o book de um personagem:

- muda o roteamento futuro;
- não necessariamente remove o personagem dos overrides do STLO no book antigo.

### 11.10 Consolidation de grupo

O book canônico do grupo usa o prompt automático de análise de consolidation para chat em grupo, que busca uma cronologia onisciente distinguindo eventos objetivos do conhecimento individual.

Character books usam o preset de consolidation selecionado no popup. Os books podem ter quantidades diferentes de fontes elegíveis. Um book sem material suficiente pode ser ignorado com aviso enquanto os books prontos continuam.

Uma cena ausente em um character book é uma lacuna cronológica. Não comprova ausência, ignorância ou inconsciência. Um character book compartilhado recebe uma única entrada consolidada.

---

## 12. Narrator Mode

### 12.1 Definição

Narrator Mode é para um chat normal um-a-um do SillyTavern no qual um único character card Narrator escreve vários personagens fictícios.

```text
Normal SillyTavern Chat
└── Narrator card
    ├── writes Alice
    ├── writes Bob
    └── writes Clara
```

Sem Narrator Mode, o SillyTavern vê todas as respostas da IA como escritas pelo card Narrator. Narrator Mode fornece um modelo manual de elenco para que o STMB possa associar cenas e Memory Books a personagens fictícios dentro da prosa do Narrator.

Narrator Mode não está disponível dentro de um chat em grupo real do SillyTavern.

### 12.2 Layout de armazenamento obrigatório

Narrator Mode exige:

- Manual Lorebook Mode;
- um **Memory Book onisciente/canônico** selecionado;
- um Memory Book único para cada membro declarado do elenco.

Regras:

- um membro do elenco não pode usar o book onisciente;
- dois membros do elenco não podem compartilhar o mesmo book;
- todo membro declarado precisa de um book disponível;
- membros aposentados mantêm sua identidade e atribuição reservada de book até serem restaurados ou removidos de outra forma pela implementação;
- Auto-Create é incompatível porque Narrator Mode depende de Manual Lorebook Mode.

Ao contrário do layout avançado de grupo real, Narrator Mode não exige STLO para recuperação do personagem ativo. O STMB injeta os books dos membros selecionados do elenco no contexto de lorebook ativo durante a geração.

### 12.3 Configuração

1. Abra o chat normal do card Narrator.
2. Ative Manual Lorebook Mode.
3. Selecione o main manual book; ele será o Memory Book onisciente.
4. Ative **Narrator Mode**.
5. Abra **Manage Narrator Cast**.
6. Adicione cada personagem fictício por nome e atribua um Memory Book único.
7. Use o drawer flutuante **Active Cast** para selecionar os personagens presentes na próxima troca.

Narrator Mode deve ser desativado antes que Manual Lorebook Mode possa ser desativado.

### 12.4 Drawer Active Cast e metadados de timeline

O drawer flutuante Active Cast pode ser expandido, recolhido, movido e usado para selecionar os membros atuais do elenco.

No momento da geração, o STMB tira um snapshot do elenco ativo e o armazena nos metadados das mensagens:

- a mensagem do usuário recebe o snapshot do elenco ativo;
- a resposta do Narrator recebe o snapshot da geração;
- uma continuation combina seu elenco com metadados de elenco já existentes;
- metadados de swipe são armazenados separadamente para cada swipe;
- selecionar um swipe pode restaurar o elenco ativo a partir daquele ponto da timeline;
- excluir mensagens recentes pode restaurar o estado do elenco a partir da mensagem Narrator marcada mais recente que permaneceu.

O marcador de elenco registra associação, não uma análise semântica da prosa.

### 12.5 Recuperação durante geração normal do Narrator

Quando uma geração do Narrator começa, o STMB carrega os Memory Books do elenco ativo e combina suas entradas na coleção de character-lore usada naquela solicitação, evitando pares duplicados de world/UID.

Consequências:

- somente books do elenco ativo são adicionados por esse fluxo Narrator;
- o book onisciente continua seguindo sua configuração/ativação normal de Manual Mode;
- filtros STLO por personagem não são necessários no Narrator Mode;
- a seleção do elenco deve estar correta antes da geração para que os character books corretos apareçam no contexto.

### 12.6 Detecção de participantes da cena

Para uma cena selecionada, respostas Narrator marcadas são autoritativas. O STMB combina os cast IDs gravados nas mensagens escritas pelo Narrator.

Se a cena contiver mensagens Narrator antigas sem marcação, o STMB recorre às informações de continuidade de todas as mensagens e pede ao usuário que confirme o elenco da cena. Os membros atualmente ativos são pré-selecionados. Uma seleção vazia significa que nenhum membro individual do elenco estava presente.

Essa confirmação é especificamente para metadados de elenco antigos ou incompletos; cenas totalmente marcadas não precisam dela.

### 12.7 Distribuição de Memory

Uma Memory de cena do Narrator é gravada como:

- uma entrada canônica onisciente no Memory Book principal;
- uma cópia vinculada no Memory Book único de cada participante selecionado.

Cópias do Narrator não usam filtros nativos de personagem do SillyTavern. Em vez disso, o STMB armazena IDs de participante e proprietário do Narrator nos metadados da entrada.

Se prompts separados para múltiplos personagens estiverem desativados, os books de participantes recebem cópias do resumo onisciente. Se estiverem ativados, cada book de um único personagem pode receber uma geração focada naquele personagem.

### 12.8 Consolidation e regeneration do Narrator

Metadados de propriedade e participação do Narrator são carregados pelas fontes de consolidation. Isso permite que entradas de nível superior mantenham qual character book é proprietário de uma cópia e quais membros do elenco participaram do material subjacente.

Regeneration usa esses metadados para determinar se o alvo do prompt de substituição é onisciente/orientado ao grupo ou focado em personagem.

Assim como cópias de grupo real, entradas vinculadas do Narrator não são sincronizadas ao vivo depois da criação.

### 12.9 Aposentar membros do elenco

O cast manager pode marcar um membro como aposentado e restaurá-lo depois. Membros aposentados:

- são removidos das opções de elenco ativo;
- são removidos do conjunto de active-cast IDs;
- mantêm metadados estáveis de identidade/histórico;
- mantêm a reserva do book, evitando reutilização acidental que misturaria identidades.

Use retirement para um personagem que deixou o elenco ativo, mas cuja identidade histórica de Memory deve permanecer intacta.

---

## 13. Ramificações de chat

Branches nativos do SillyTavern podem se tornar continuidades diferentes. Se uma branch e seu parent escreverem nos mesmos Memory Books desbloqueados, timelines contraditórias podem se misturar.

**Copy Memory Books when branching** está habilitado por padrão.

### 13.1 O que é copiado

Quando o STMB reconhece uma branch nativa recém-criada:

- Automatic Mode copia o Memory Book ativo vinculado ao chat;
- Manual Mode copia o main manual Memory Book;
- um grupo real em Manual Mode copia cada Memory Book de personagem único e desbloqueado;
- Narrator Mode copia o book onisciente e cada character book declarado;
- locks persistentes de personagens reais são preservados em vez de copiados porque um lock significa “continue usando este mesmo book”.

Todos os books copiados em uma operação de branch usam o mesmo número de lineage disponível:

```text
Group Memories Branch 1
Alice Memories Branch 1
Bob Memories Branch 1
```

Criar uma branch a partir de outra branch mantém a raiz de lineage original em vez de produzir nomes como `Branch 1 Branch 1`.

### 13.2 Metadados reescritos

Dentro das cópias, o STMB:

- reescreve IDs do chat pai correspondentes para o novo ID da branch;
- redireciona links canônicos de grupo/personagem quando ambos os books vinculados foram copiados;
- atualiza os bindings da nova branch para apontar para as cópias.

Ele clona o conteúdo existente; não regenera Memories.

### 13.3 Segurança em caso de falha

Não troque de chat enquanto a cópia da branch estiver em andamento.

Se a cópia falhar, o STMB limpa os bindings graváveis herdados da nova branch e registra a falha, impedindo que ela escreva silenciosamente nos originais do parent.

### 13.4 Desativar cópias de branch

Desative essa configuração somente quando a branch tiver intenção explícita de compartilhar os mesmos Memory Books e a mesma história contínua do parent.

---

## 14. Clips

Um Clip salva texto selecionado do chat diretamente em uma entrada `[STMB Clip]` do lorebook. Ele não chama um modelo de IA.

### 14.1 Use Clips para

- uma preferência;
- uma promessa ou segredo;
- um nome ou alias;
- um item ou pet;
- um fato curto de relacionamento;
- uma linha que deve ser preservada exatamente ou quase exatamente;
- uma rápida “nota para mim” que não justifica uma Memory de cena.

### 14.2 Fluxo

1. Destaque texto dentro de uma mensagem do chat.
2. Clique no botão flutuante de tesoura.
3. Escolha uma entrada Clip existente ou crie uma nova.
4. Para uma nova entrada, escolha comportamento always-active ou keyword-triggered.
5. Revise a entrada atual e o preview atualizado.
6. Renomeie se necessário.
7. Salve.

O botão flutuante de tesoura só aparece depois que texto do chat é selecionado e pode ser desativado no painel principal.

### 14.3 Formato da entrada

Título:

```text
Seraphina Healed Me [STMB Clip]
```

Conteúdo:

```markdown
=== Seraphina Healed Me ===

- Seraphina healed the user’s wounds with magic.

=== END Seraphina Healed Me ===
```

Uma entrada Clip tem uma única seção. Títulos focados favorecem palavras-chave de ativação focadas.

### 14.4 Entradas existentes

Uma entrada existente pode ser tratada como Clip adicionando `[STMB Clip]` ao final de seu título. Entradas Clip longas podem ser editadas manualmente ou compactadas.

Clips salvam apenas o texto escolhido. Eles não adicionam atribuição de origem automaticamente.

---

## 15. Topical Clips

Um Topical Clip lê entradas confirmadas de Memory do STMB, um intervalo explícito de mensagens do chat atual ou ambos, e pede a uma IA que produza uma entrada focada “sobre este tópico”. Fontes de Memory elegíveis podem incluir Memories de cena e resumos consolidados; entradas Clip e Side Prompt são excluídas como fontes.

### 15.1 Quando usar Topical Clip

Quando informações sobre um único assunto estão espalhadas por várias Memories, por exemplo:

- um NPC recorrente;
- histórico de relacionamento;
- local ou facção;
- investigação ou mistério;
- poderes, ferimentos, promessas, preferências ou segredos;
- objeto importante;
- fio de trama não resolvido.

Topical Clip organiza pelo assunto, não pela cronologia de cada Memory de origem.

### 15.2 Restrições de fontes

Topical Clip usa:

- entradas confirmadas de Memory do STMB no source book selecionado, incluindo resumos consolidados elegíveis;
- mensagens visíveis de um intervalo inclusivo `X-Y` selecionado explicitamente no chat atual.

Os controles **Include saved Memories** e **Include chat messages** podem ser usados separadamente ou juntos. Intervalos de mensagens seguem a configuração global de unhide-before-memory e restauram mensagens anteriormente ocultas após a compilação.

Não usa:

- mensagens do chat fora do intervalo selecionado;
- entradas Clip comuns;
- entradas Side Prompt;
- entradas comuns de lorebook sem relação.

### 15.3 Criar um Topical Clip

1. Abra Memory Books.
2. Clique em **Topical Clip**.
3. Escolha o source Memory Book.
4. Digite o tópico.
5. Digite palavras-chave de ativação ou deixe em branco para usar o tópico.
6. Escolha uma nova entrada ou um alvo existente `[STMB Clip]` para atualização.
7. Escolha Memories salvas, mensagens do chat ou ambos como fontes.
8. Opcionalmente selecione apenas determinadas Memories de origem e/ou informe um intervalo exato de mensagens.
9. Escolha o perfil de geração.
10. Gere o draft.
11. Revise e edite.
12. Salve somente quando estiver correto.

O draft gerado nunca é salvo automaticamente.

### 15.4 Atualizar um Topical Clip existente

Depois de uma execução bem-sucedida, o STMB registra quais Memories de origem foram usadas e, quando aplicável, o chat de origem, intervalo de mensagens, IDs de mensagens e hashes. Uma atualização posterior baseada em Memories normalmente envia apenas fontes novas ou alteradas junto com o conteúdo existente do Clip. Intervalos de mensagens são sempre escolhidos explicitamente.

Use **Rebuild from all source memories** quando:

- a entrada atual está incompleta ou desorganizada;
- o prompt mudou;
- Memories antigas foram editadas substancialmente;
- o tópico inteiro deve ser reconsiderado.

### 15.5 Seleção manual de fontes e avisos de tokens

Use **Use only selected memories** quando o book for grande, o tópico estiver limitado a um período da história, nomes se sobrepuserem ou houver necessidade de controle rigoroso de evidências.

O STMB estima o tamanho da solicitação e avisa quando o limite configurado de tokens é ultrapassado. Reduza as fontes, aumente o limite deliberadamente ou execute uma vez mesmo assim.

### 15.6 Padrão de revisão

Confira se o draft:

- permanece no tópico;
- preserva nomes e relacionamentos;
- inclui fatos relevantes importantes;
- identifica contradições em vez de escolher silenciosamente uma versão;
- não inventa explicações sem suporte nas Memories de origem;
- combina atualizações sem duplicação desnecessária.

### 15.7 Placeholders do prompt

Um prompt personalizado de Topical Clip deve incluir `{{SOURCE_MEMORIES}}` quando Memories salvas estiverem selecionadas e `{{SOURCE_MESSAGES}}` quando mensagens do chat estiverem selecionadas.

Placeholders de origem:

```text
{{SOURCE_MEMORIES}}
{{SOURCE_MESSAGES}}
```

Placeholders suportados incluem:

```text
{{MODE}}
{{TOPIC}}
{{KEYWORDS}}
{{EXISTING_CLIP}}
{{EXISTING_ENTRY_CONTENT}}
{{SOURCE_MEMORIES}}
{{SOURCE_MESSAGES}}
```

Use Reset to Default se um prompt personalizado deixar de produzir saída útil.

---

## 16. Side Prompts

Um Side Prompt é um prompt nomeado do STMB que roda separadamente da resposta normal do personagem. Normalmente cria ou atualiza uma única entrada contínua de suporte em vez de outra Memory sequencial de cena.

Na lista **Trackers & Side Prompts**, o ícone de energia altera imediatamente a flag **Enabled** do prompt inteiro: verde significa habilitado e esmaecido significa desabilitado. Esse controle não adiciona, remove nem altera os triggers configurados do prompt.

### 16.1 Usos adequados

- trackers de trama e fios não resolvidos;
- estado de relacionamentos;
- status de NPCs ou facções;
- inventário e recursos;
- ferimentos, estatísticas ou reputação;
- timelines, datas, prazos e viagens;
- pistas de mistério, suspeitos e contradições;
- invenções, pesquisa e projetos;
- relatórios de risco de continuidade;
- resumos de estado do mundo.

Evite prompts vagos para “acompanhar tudo”, resumos duplicados de cena ou tarefas que precisam aparecer dentro da próxima resposta de roleplay.

### 16.2 Formato de saída

Side Prompts normalmente esperam texto simples final ou Markdown pronto para salvar. Não exigem JSON de Memory. JSON é permitido somente quando o usuário quer intencionalmente armazená-lo como texto do tracker.

### 16.3 Sequência de execução

Uma execução típica monta:

1. instruções do Side Prompt;
2. entrada anterior salva do tracker, se houver;
3. Memories anteriores opcionais;
4. Additional Context opcional;
5. texto da cena selecionada ou desde a última execução;
6. instruções opcionais de Response Format.

A entrada anterior é estado existente a revisar, não prova de que toda declaração antiga deva permanecer. Prompts devem ordenar explicitamente a remoção de informações obsoletas, resolvidas, contraditas ou duplicadas.

### 16.4 Execuções manuais

```text
/sideprompt "Prompt Name"
/sideprompt "Prompt Name" 10-20
/sideprompt "Relationship Tracker" {{npc name}}="Alice" 10-20
```

Nomes com espaços devem ser colocados entre aspas. Um intervalo fornecido é inclusivo.

Execuções manuais são melhores para análise direcionada e prompts que exigem valores de macros em runtime.

### 16.5 Execuções automáticas após Memory

Um Side Prompt pode habilitar **Run automatically after memory**.

O chat então usa um de dois modos de seleção automática:

- Side Prompts habilitados individualmente; ou
- um Side Prompt Set selecionado.

Um set selecionado substitui os prompts automáticos habilitados individualmente para aquele chat. Ele não se soma a eles.

#### Memory Assistance Side Prompt

**Memory Assistance** é um Side Prompt reservado com quatro modos independentes. Ele roda após Memories salvas com sucesso independentemente da habilitação normal de Side Prompts ou do Side Prompt Set selecionado. Não roda durante regeneration de Memory.

Memory Assistance compara a cena bruta processada com Clips comuns e Topical Clips em cada Memory Book que recebeu a Memory. Ele envia à IA o título/tópico, palavras-chave, conteúdo atual, ID estável e tipo de cada Clip revisado.

Quando a job queue está disponível, cada Memory Book alvo recebe um job separado de **Memory Assistance** depois que a Memory é salva. Um erro de request, validação de resposta, salvamento do relatório ou aplicação automática marca esse job como **Failed** e expõe o erro na fila. A Memory salva permanece **Completed**, e repetir Memory Assistance não regenera a Memory.

- **Off** desativa Memory Assistance.
- **Update** revisa diretamente cinco Clips ou menos; com mais de cinco, abre uma lista de seleção. Alterações propostas aguardam aprovação manual.
- **Update and Suggest** primeiro faz uma solicitação de descoberta de tópicos e depois executa o mesmo fluxo de revisão de Clips existentes do modo Update.
- **Automatic** revisa todos os Clips em batches baseados em tokens sem perguntar quais revisar. Aplica diretamente adições válidas a Clips comuns, enquanto substituições de Topical Clip ficam pendentes para aprovação em **Memory Assistance Suggestions**.

- Nos modos Update e Update and Suggest, a lista maior de seleção oferece **Query Selected** e **Query All**.
- Query All e Automatic usam batches baseados em tokens em vez de forçar todos os Clips em uma única solicitação grande demais.
- Cada Clip comum recebe no máximo um trecho exato de mensagem proposto como adição.
- Topical Clips recebem drafts completos de substituição.
- A resposta da IA é um objeto JSON simples que mapeia diretamente cada Clip UID afetado ao trecho sugerido ou substituição. Um objeto vazio significa que nenhum Clip precisa ser atualizado.
- Resultados de Update são gravados em `Memory Assistance (STMB SidePrompt)` e permanecem sem aplicação até serem aprovados em **Memory Assistance Suggestions**.
- Resultados do modo Automatic registram quantas adições a Clips comuns foram aplicadas e mantêm substituições de Topical Clip e quaisquer falhas de aplicação para revisão manual.
- Cancelar a seleção limpa sugestões antigas para que não sejam confundidas com resultados da cena mais recente.

Update and Suggest usa um prompt separado apenas para sugestões antes dos batches de revisão dos Clips existentes. A solicitação contém a cena processada e uma lista leve de títulos, tópicos e palavras-chave de Topical Clips existentes. Não envia Clips comuns nem corpos de Clips existentes durante a descoberta. A IA retorna de zero a cinco novos tópicos como objetos JSON contendo um tópico e palavras-chave de ativação; `{"topics":[]}` é um resultado válido.

Tópicos sugeridos são salvos no relatório de Memory Assistance. Em **Memory Assistance Suggestions**, escolha **Review Topics** para vê-los como linhas marcadas e editáveis. É possível desmarcar tópicos indesejados, editar nomes ou palavras-chave e adicionar tópicos adicionais. Tópicos confirmados abrem o fluxo padrão de draft do Topical Clip um por vez. Um tópico pendente só é removido depois que seu Topical Clip é salvo; fechar o draft o mantém disponível em **Memory Assistance Suggestions**.

Quando sugestões revisáveis estão prontas, o STMB abre um popup de conclusão para o Memory Book atualizado. **Dismiss** fecha o aviso, enquanto **Go to Suggestions** abre **Memory Assistance Suggestions** com aquele Memory Book já selecionado. Abrir **Memory Assistance Suggestions** pelo menu da extensão seleciona primeiro o Memory Book efetivo do chat atual: o book vinculado ao chat no Automatic Mode ou o manual book resolvido no Manual Mode.

Os prompts de Update e Topic Suggestions e o override de connection profile podem ser editados independentemente, mas os dois contratos de resposta estruturada são fixos. Memory Assistance não pode ser excluído, duplicado, colocado em Side Prompt Set nem executado manualmente.

### 16.6 Intervalos automáticos de mensagens visíveis

Um Side Prompt pode habilitar **Run on visible message interval** e especificar uma quantidade de mensagens visíveis desde seu checkpoint.

Mensagens ocultas e de sistema não contam.

Quando um set está ativo, somente linhas desse set cujo prompt referenciado tenha o trigger apropriado de intervalo são candidatas.

### 16.7 Side Prompt Sets

Um Side Prompt Set é uma lista ordenada de execuções, não apenas uma pasta. O mesmo template pode aparecer mais de uma vez com diferentes valores de macros.

Exemplo:

1. Relationship Tracker — Alice
2. Relationship Tracker — Bob
3. Plot Tracker
4. Cleanup Report

Linhas podem armazenar:

- referência a um prompt;
- label opcional;
- valores de macros em runtime;
- ordem;
- ações de duplicar ou excluir.

As linhas rodam de cima para baixo.

Comandos manuais de set:

```text
/sideprompt-set "Set Name"
/sideprompt-set "Set Name" 10-20
/sideprompt-macroset "Relationship Pass" {{npc_1}}="Alice" {{npc_2}}="Bob" 10-20
```

### 16.8 Sets padrão e seleção por chat

General Settings pode definir:

- um set padrão para chats solo;
- um set padrão para chats em grupo.

Cada chat pode:

1. herdar o padrão aplicável;
2. usar explicitamente prompts habilitados individualmente;
3. escolher um set nomeado.

Um padrão global vazio significa modo individual.

Se um set selecionado for excluído, o STMB avisa em vez de substituir silenciosamente por outro fluxo. Um prompt de linha ausente ou macro não resolvida faz aquela linha ser ignorada com aviso.

O set seleciona linhas candidatas. Cada Side Prompt referenciado ainda precisa do trigger automático relevante para execução após Memory ou por intervalo. Comandos manuais de set não exigem essas caixas de trigger.

### 16.9 Macros

Side Prompts podem usar macros normais do SillyTavern, como:

```text
{{user}}
{{char}}
```

Placeholders não padrão `{{...}}` são macros em runtime. Devem ser fornecidos manualmente ou armazenados em uma linha do set.

Exemplos:

```text
{{npc name}}
{{faction}}
{{project_name}}
```

Um prompt com macros de runtime não resolvidas não pode rodar automaticamente. Execuções automáticas não podem pausar para perguntar valores.

### 16.10 Macros de contagem de Memory

O STMB registra macros inteiros para o Memory Book principal efetivo:

| Macro | Contagem |
|---|---|
| `{{memtier0}}` | Memories de cena |
| `{{memtier1}}` | Arcs |
| `{{memtier2}}` | Chapters |
| `{{memtier3}}` | Books |
| `{{memtier4}}` | Legends |
| `{{memtier5}}` | Series |
| `{{memtier6}}` | Epics |
| `{{memclips}}` | entradas Clip |
| `{{memside}}` | entradas Side Prompt |

O main book efetivo é o book vinculado ao chat no Automatic Mode ou o main manual book resolvido no Manual Mode. Em uma configuração multi-book de grupo ou Narrator, as contagens não somam todos os character books.

Uma macro de contagem fornece apenas um número, não o conteúdo dessas entradas.

### 16.11 Intervalos de mensagens

Um intervalo explícito usa exatamente aquele intervalo inclusivo. Sem intervalo, o STMB usa o comportamento de checkpoint/cap desde a última execução do Side Prompt.

Use intervalos explícitos para debugging, limpeza direcionada ou repetição de uma seção conhecida.

### 16.12 Additional Context e Memories anteriores

Um Side Prompt pode incluir até sete Memories de cena anteriores.

Sua fonte de Additional Context pode ser:

- nenhuma;
- **Follow chat**, usando o Context Setting selecionado do chat;
- um Context Setting fixo nomeado.

Esses são materiais de referência. O prompt não deve copiá-los cegamente para o tracker.

### 16.13 Alvos de lorebook

Um Side Prompt normalmente salva no Memory Book efetivo. Em vez disso, pode usar:

1. um target override por chat;
2. um target no nível do template;
3. o Memory Book efetivo como fallback.

Um override válido por chat vence.

Use alvos alternativos para um book de campanha compartilhado deliberadamente ou um book dedicado de tracker. Não espalhe trackers sem um plano de recuperação.

### 16.14 Controles da entrada de Side Prompt

Um template pode configurar:

- title override;
- palavras-chave;
- ativação Normal, Constant ou Vectorized;
- posição de inserção e nome do Outlet;
- modo/valor de ordem;
- Prevent Recursion;
- Delay Until Recursion;
- Ignore Budget.

Campos de título e palavras-chave podem expandir macros aplicáveis. **Ignore Budget** deve ser usado com parcimônia porque vários trackers sempre incluídos podem consumir muito contexto.

### 16.15 Override de connection profile

Um Side Prompt pode herdar a resolução normal de conexão do Memory Books ou vincular um perfil STMB específico. Um override é útil para um modelo mais barato ou melhor em manutenção estruturada. Combinações excessivas de perfis dificultam troubleshooting.

### 16.16 Regeneration de Side Prompt

Salvamentos compatíveis agora guardam um snapshot versão 2 contendo:

- Side Prompt template key;
- conteúdo anterior da entrada para regeneration;
- se a entrada existia antes da execução e seu estado anterior exato, excluindo um snapshot de rollback mais antigo;
- chat de origem e intervalo inclusivo;
- valores de macros em runtime;
- um fingerprint do estado exato da entrada escrito pelo STMB.

Para regenerar, abra o editor de lorebook e clique em **Regenerate side prompt**. A substituição usa o snapshot salvo com o template atual e as configurações atuais de perfil/contexto.

Regeneration não pode concluir quando o template foi excluído, o chat/intervalo de origem está indisponível ou o target/source mudou durante a geração. Apenas o conteúdo é substituído; título, palavras-chave e configurações existentes da entrada permanecem. Snapshots antigos versão 1 continuam suportando regeneration, embora não possam ser usados pelo Memory Auto-Rollback.

### 16.17 Escrevendo bons Side Prompts

Um bom Side Prompt define:

- o trabalho exato de manutenção;
- qual material de origem revisar;
- se deve revisar, substituir, combinar ou acrescentar;
- informações obsoletas a remover;
- headings e ordem estáveis da saída;
- limite estrito de tamanho;
- comportamento de retornar apenas a saída final.

Exemplo:

```text
Update the relationship tracker from the supplied scene. Preserve current facts, merge new developments into the existing sections, and remove resolved, contradicted, stale, or duplicate details. Keep each relationship to 1–3 concise bullets. Output only the updated tracker.
```

Proteções úteis:

```text
Do not append a new section unless there is genuinely new information.
Remove resolved threads and obsolete speculation.
Output only the updated report; no preface or explanation.
Keep the entire output under 300 words.
```

Headings estáveis reduzem drift entre atualizações repetidas.

### 16.18 Troubleshooting de Side Prompt

Se um prompt não rodou:

- confirme que o evento de Memory ou intervalo realmente ocorreu;
- inspecione a seleção individual/set do chat;
- confirme que o prompt referenciado ainda existe;
- confirme que o trigger automático relevante está habilitado;
- confirme que todas as macros de runtime têm valores;
- verifique se `/stmb-stop` ou um job com falha o cancelou.

Se rodou duas vezes:

- verifique invocação manual mais automática;
- linhas duplicadas no set;
- cópias duplicadas do prompt;
- vários tabs ou chats disparando trabalho.

Se o book errado recebeu a saída, inspecione os scopes de target por chat e por template.

Se a saída cresce indefinidamente, adicione regras explícitas de substituição, pruning, limite de itens e limite de palavras.

---

## 17. Consolidation

Consolidation combina Memories ou resumos STMB de nível inferior em recaps cronológicos de nível superior.

### 17.1 Tiers

```text
Scene Memory → Arc → Chapter → Book → Legend → Series → Epic
```

Consolidation trabalha a partir de entradas STMB existentes, não diretamente do chat bruto.

### 17.2 Finalidade

Use quando:

- Memories de cena estão se acumulando;
- material antigo não precisa mais de todos os detalhes de cena;
- uma fase importante de relacionamento, trama ou campanha terminou;
- é necessário reduzir uso de tokens preservando continuidade;
- é desejada uma cronologia de nível superior mais limpa.

Entradas consolidadas devem enfatizar mudanças duradouras, pontos de virada, objetivos, consequências, mudanças de relacionamento, fios não resolvidos e estado estável.

### 17.3 Fluxo manual

1. Abra **Consolidate Memories**.
2. Confirme o source Memory Book exibido. Selecione outro book quando o manual book ou chat-bound book configurado não for a fonte pretendida da consolidation. Essa seleção vale apenas para a execução atual e não altera o Memory Book configurado do chat.
3. Escolha o tier alvo.
4. Selecione entradas de origem elegíveis.
5. Escolha configurações de prompt/perfil da consolidation.
6. Decida se as entradas de origem devem ser desabilitadas após uma consolidation bem-sucedida.
7. Execute e revise os candidatos.
8. Aprove os resumos desejados.

### 17.4 Prompts de prontidão não são consolidation automática

**Prompt for consolidation when a tier is ready** monitora tiers alvo selecionados. Quando o mínimo salvo de entradas elegíveis é atingido, o STMB apresenta um prompt sim/mais tarde. Escolher Sim abre a interface de consolidation. Ele não consolida silenciosamente.

### 17.5 Schema de saída de consolidation

Consolidation comum espera JSON estrito:

```json
{
  "summaries": [
    {
      "title": "Short higher-tier title",
      "summary": "Consolidated chronological recap",
      "keywords": ["keyword1", "keyword2"],
      "member_ids": ["001", "002"]
    }
  ],
  "unassigned_items": [
    {
      "id": "003",
      "reason": "Why this source did not fit"
    }
  ]
}
```

O modelo pode retornar um ou vários resumos. `member_ids` atribui cada fonte a um resumo retornado. Outliers devem ficar em `unassigned_items` em vez de serem forçados para um recap sem relação.

### 17.6 Resumo anterior de tier superior

Um resumo anterior no tier alvo pode ser fornecido como contexto canônico. Não é material de origem a reescrever. Prompts de consolidation devem distingui-lo das entradas de nível inferior que estão sendo processadas.

### 17.7 Previews e respostas com falha

Previews de consolidation podem permitir editar, aceitar, regenerar um candidato a partir das mesmas fontes ou regenerar um batch pendente.

Respostas de IA malformadas ou com falha podem ser inspecionadas e, quando suportado, corrigidas manualmente antes do commit.

### 17.8 Desabilitar fontes

Quando habilitado, o STMB desabilita entradas de origem após consolidation bem-sucedida para que o resumo de tier superior assuma a recuperação. Isso é reversível pela edição do lorebook.

### 17.9 Bons prompts de consolidation

Devem definir:

- alvo de compressão;
- se deve criar um recap ou o menor número coerente deles;
- lógica de cronologia e agrupamento;
- detalhes que precisam sobreviver;
- tratamento explícito de outliers;
- estrutura JSON exata.

Devem preservar beats importantes, consequências, promessas, mudanças de relacionamento, identificadores, fios não resolvidos e palavras-chave úteis para recuperação, removendo detalhe repetido de nível de cena.

---

## 18. Compaction

Compaction pede a uma IA que encurte uma única entrada STMB existente e apresenta original e draft antes da substituição.

### 18.1 Entradas elegíveis

- entradas `[STMB Clip]`;
- entradas Side Prompt;
- entradas STMB Memory.

Entradas comuns de lorebook não gerenciadas pelo STMB não são listadas.

### 18.2 Fluxo

1. Abra **Compaction**.
2. Escolha um Memory Book.
3. Escolha um Compaction Profile.
4. Opcionalmente edite o Compaction Prompt.
5. Escolha uma entrada.
6. Compare estimativas/conteúdo de tokens do original e do compactado.
7. Edite o draft se necessário.
8. Substitua, copie o draft ou cancele.

O original não é alterado até **Replace with Compacted Version** ser selecionado.

### 18.3 Bons usos

- coleções longas de Clips;
- conteúdo repetido ou obsoleto de tracker;
- Memories de cena prolixas;
- entradas always-active consumindo contexto demais.

Compaction não serve para adicionar fatos, resumir chat bruto, criar uma nova Memory nem processar entradas comuns de lorebook.

### 18.4 Placeholders do prompt

```text
{{ENTRY_CONTENT}}  required current content
{{ENTRY_KIND}}     Clip, SidePrompt, or Memory
{{ENTRY_TITLE}}    entry title
```

O prompt deve preservar fatos, nomes, pronomes, macros, headings de wrapper e marcadores de fim, removendo redundância e texto de baixo valor.

---

## 19. Regeneration

Regeneration cria uma substituição revisável para uma entrada existente. Não cria uma segunda entrada numerada e nunca sobrescreve sem aprovação.

### 19.1 Regeneration de Memory de cena

- abra o chat de origem;
- abra o Memory Book no editor de lorebook;
- clique em **Regenerate memory**;
- para uma entrada canônica de grupo com entradas de personagem vinculadas, escolha se deseja regenerar apenas a entrada clicada ou todas as entradas vinculadas;
- escolha perfil atual, prompt, contagem de Memories anteriores e Additional Context;
- revise título, conteúdo e palavras-chave de cada entrada selecionada.

O intervalo original da cena e o sequence number são preservados. Entradas vinculadas reutilizam as mesmas configurações selecionadas de regeneration, mas são geradas usando seu próprio contexto de Memory Book e target de prompt de grupo/personagem. O STMB coleta todas as aprovações antes de começar a salvar regenerations diretas. Se todas as mensagens de origem estiverem ocultas, revele-as ou habilite unhide-before-generation.

### 19.2 Regeneration de consolidation

Um resumo de tier superior é regenerado a partir de seu conjunto exato de fontes vinculadas de nível inferior usando o preset dedicado **Regenerate Consolidation**.

O conjunto completo de fontes ainda precisa existir no tier correto. Uma fonte de nível inferior não pode ser regenerada enquanto um parent summary ativo depender dela; exclua primeiro o parent ao reconstruir intencionalmente o tier inferior.

### 19.3 Regeneration de Side Prompt

Consulte as regras de snapshot de Side Prompt na Seção 16.16.

### 19.4 Verificações de segurança

Imediatamente antes da substituição, o STMB verifica que:

- a entrada alvo não mudou;
- o intervalo do chat de origem não mudou;
- fontes exigidas de consolidation permanecem inalteradas e disponíveis;
- a entrada continua elegível.

Se qualquer verificação falhar, nada é sobrescrito.

Cópias vinculadas de grupo, personagem e Narrator permanecem independentes.

---

## 20. Contexto para geração

Várias fontes de contexto podem aparecer em uma solicitação do STMB. Elas não são intercambiáveis.

### 20.1 Cena atual

O intervalo de mensagens processado agora. É o material alvo de uma Memory comum de cena.

### 20.2 Memories anteriores

Memories de cena anteriores do Memory Book efetivo, incluídas como contexto de continuidade somente leitura. Normalmente o usuário pode incluir de 0 a 7.

Não devem ser resumidas novamente apenas porque aparecem antes da cena atual.

### 20.3 Additional Context

Entradas de lorebook fornecidas como material de referência estável, como:

- regras de personagem ou cenário;
- nomes e terminologia canônicos;
- restrições de campanha;
- timeline autoritativa;
- referências de local;
- fatos presumidos mas não repetidos na cena.

Additional Context aparece antes das Memories anteriores e da transcrição da cena. É material de referência, não outra cena.

### 20.4 Context Settings

Um Context Setting é uma coleção ordenada reutilizável de entradas de Additional Context.

Fluxo:

1. abra **Context Settings**;
2. crie um setting nomeado;
3. selecione entradas de lorebook;
4. ordene-as;
5. escolha o setting para o chat atual ou escolha explicitamente No Context.

A seleção é armazenada por chat e funciona com Current SillyTavern Settings e com perfis salvos.

Se um book ou entrada referenciado desaparecer, o STMB avisa, ignora a referência obsoleta e continua. Se o Context Setting inteiro for excluído, chats que o referenciam continuam sem Additional Context até outra seleção ser feita.

Context Settings podem ser duplicados, importados e exportados como `stmb-context-settings.json`.

### 20.5 Entrada anterior de Side Prompt

O texto atual do tracker a revisar. É estado, não evidência de que todas as declarações antigas continuem válidas.

### 20.6 Fontes de consolidation

Entradas de nível inferior que são o material real sendo agrupado e comprimido.

### 20.7 Resumo anterior de tier superior

Cânone carregado adiante durante consolidation. Não é uma fonte a reescrever.

### 20.8 Ordem correta por fluxo

Memory comum:

```text
Memory prompt
Additional Context
Previous Memories
Current scene transcript
```

Side Prompt:

```text
Side Prompt instructions
Prior entry
Previous Memories
Additional Context
Scene text
Response Format
```

Consolidation:

```text
Consolidation prompt
Previous higher-tier summary
Selected lower-tier source entries
```

Prompts devem rotular claramente o material alvo e o material apenas de referência.

---
## 21. Arquitetura de prompts, Summary Prompts integrados e regras de autoria

O STMB possui três sistemas principais de geração estruturada, além de vários fluxos auxiliares focados.

### 21.1 Geração comum de Memory

O STMB espera um único objeto JSON:

```json
{
  "title": "Short scene title",
  "content": "The memory text",
  "keywords": ["keyword1", "keyword2"]
}
```

Regras:

- retorne somente o objeto JSON;
- use exatamente as chaves `title`, `content` e `keywords`;
- `keywords` deve ser um array JSON de strings;
- mantenha o título curto e legível;
- use termos concretos de recuperação;
- coloque qualquer Markdown desejado dentro da string `content`;
- escape corretamente aspas.

O STMB consegue reparar alguns fences, vírgulas finais, think tags, wrappers ou pequenas malformações, mas prompts nunca devem depender dessa recuperação.

Um bom prompt de Memory declara:

1. o estilo de Memory desejado e nível de compressão;
2. quais informações relevantes à continuidade devem ser preservadas;
3. filler, OOC ou material sem suporte que deve ser omitido;
4. o schema JSON exato.

Prompts fracos especificam estilo mas não estrutura, pedem análise em vez de um objeto final, misturam contexto anterior com a cena atual ou usam palavras-chave abstratas.

### 21.2 Summary Prompts integrados e como escolher

Esses presets são somente para geração comum de Memory. Eles não controlam Consolidation, Side Prompts, Topical Clips ou Compaction. Um perfil seleciona um em **Memory Creation Method**. **Summary** é o fallback/default normal quando um perfil não especifica outro preset. Built-in significa fornecido pelo STMB; não significa que todos os presets rodam nem que todos são igualmente adequados para um chat.

Não existe um prompt universalmente melhor, porque detalhe, legibilidade, qualidade de recuperação e custo de tokens puxam em direções diferentes. A resposta prática curta é:

- **Melhor padrão inicial para a maioria dos usuários: Summary.** É equilibrado, geral e uma boa primeira prova com um modelo novo.
- **Melhor para roleplay longo e pesado em continuidade: Comprehensive.** Aplica orientação mais forte de filtragem, causalidade, continuidade e palavras-chave, mas exige mais do modelo e pode produzir uma Memory estruturada maior.
- **Melhor quando economizar tokens de contexto é a prioridade: Minimal.** É intencionalmente breve e perderá nuance.
- **Melhor para books separados de personagem em grupo real ou Narrator: Group e Character.** Use juntos pela configuração de prompts separados de grupo/personagem do perfil; são prompts de targeting, não estilos gerais concorrentes.

| Prompt integrado | Melhor uso | Principal trade-off |
|---|---|---|
| **Summary** | Maioria dos chats solo e primeira configuração. Produz prosa narrativa cronológica detalhada com eventos, interações, desenvolvimentos, revelações, resultados importantes e palavras-chave concretas de recuperação. | Preserva mais detalhe do que um usuário muito focado em economia pode querer, mas é mais simples e menos exigente que os presets mais estruturados. |
| **Comprehensive** | Histórias longas e sensíveis à continuidade onde cadeias causais, dinâmica de personagens, fatos estabelecidos, trocas importantes, fios não resolvidos e palavras-chave disciplinadas importam. Filtra explicitamente detalhes incidentais e melhora a construção de keywords. | Tem as instruções mais longas e exigentes. Use modelo bom em seguir instruções e permita tokens de resposta suficientes. |
| **Summarize** | Usuários que preferem um registro Markdown muito escaneável dividido em Timeline, Story Beats, Key Interactions, Notable Details e Outcome. | A saída cheia de bullets pode parecer mais notas de referência do que uma memória natural e pode repetir fatos entre seções. |
| **Synopsis** | Cenas em que preservar quase todo beat significativo, interação, detalhe e resultado importa mais que compactação. | Intencionalmente longo e abrangente; é uma das escolhas menos adequadas quando orçamento de lorebook/contexto é apertado. |
| **Sum Up** | Registro narrativo cronológico com heading visível de cena e timeline, mas com menos overhead de seções que Summarize ou Synopsis. | Oferece menos separação explícita entre eventos, dinâmica de personagens, fatos e estado de continuidade. |
| **Minimal** | Chats de alto volume, cobertura de arquivo barata ou setups em que Memories precisam consumir pouquíssimo contexto. Produz uma Memory breve de duas a cinco frases. | Motivações importantes, mudanças emocionais, causalidade e pequenos detalhes de continuidade podem ser perdidos. |
| **Northgate** | Usuários de escrita criativa que querem um registro literário coerente em terceira pessoa e passado, enfatizando ações, mudanças emocionais, desenvolvimento e diálogo significativo. Este estilo da comunidade é creditado a Northgate no Discord do SillyTavern. | Otimiza narrativa legível, não compressão máxima nem categorias de referência claramente separadas. Diferente da maioria dos presets gerais, seu texto integrado não exclui OOC explicitamente; revise quando OOC for comum. |
| **Aelemar** | Grandes cenas de trama e momentos emocionalmente consequentes que devem continuar compreensíveis como registro independente mesmo sem a cena de origem. Este estilo da comunidade é creditado a Aelemar no Discord do SillyTavern. | Exige pelo menos 300 palavras e é deliberadamente detalhado, portanto inadequado para economia agressiva de tokens. Seu texto integrado também não exclui OOC explicitamente. |
| **Group** | Memory Book compartilhado/onisciente em grupo real ou target onisciente em um fluxo multi-book. Preserva decisões e estado do grupo enquanto atribui ações, emoções e conhecimento ao membro correto. | Não use como Memory de um personagem individual; ele se concentra intencionalmente em continuidade compartilhada do grupo. |
| **Character** | Memory Book focado em um personagem em fluxo de grupo real/multi-character. Registra o que aquele personagem fez, sabia, sentiu, aprendeu, escondeu, entendeu errado ou foi afetado. | Omite intencionalmente material da cena irrelevante ao personagem alvo e restringe conhecimento privado sem suporte. |

Em uma instalação nova, use **Summary** até geração e recuperação funcionarem de forma confiável. Depois altere apenas o prompt e compare várias Memories de cenas semelhantes. Prefira **Comprehensive** quando o problema for causalidade omitida, estado de continuidade ou palavras-chave fracas; prefira **Minimal** quando o problema for tamanho da Memory. Alterar prompts não compensa um modelo fraco, saída truncada, limites ruins de cena ou configurações incorretas de recuperação.

O texto exato integrado pode ser recriado para o locale atual do SillyTavern. Recriar built-ins remove edições locais desses built-ins, mas não deve excluir presets personalizados não relacionados. Duplique ou exporte um built-in modificado antes de recriá-lo.

### 21.3 Targeting de prompt multi-character

Quando prompts separados de grupo/personagem estão habilitados, o STMB marca o target da solicitação como:

- `group` para uma Memory canônica de grupo real ou Narrator onisciente;
- `character` para uma versão de book de personagem individual.

O prompt deve usar explicitamente a perspectiva do target sem inventar conhecimento que não seja sustentado pela cena e pelo contexto fornecido.

### 21.4 Autoria de Side Prompt

Side Prompts normalmente retornam texto simples ou Markdown. Escreva-os como instruções de manutenção, não como prompts de Memory.

Um Side Prompt forte:

- define um trabalho estreito;
- explica como usar o tracker anterior;
- remove estado obsoleto;
- impõe headings estáveis e limites de tamanho;
- retorna somente o tracker final.

### 21.5 Autoria de Consolidation

Consolidation comum exige o schema da Seção 17.5. Um prompt forte:

- preserva cronologia;
- cria o menor número coerente de resumos;
- atribui toda fonte usada por `member_ids`;
- identifica sobras por `unassigned_items`;
- preserva mudanças grandes e continuidade não resolvida;
- usa palavras-chave concretas.

O preset dedicado **Regenerate Consolidation** é para um único resumo substituto e não pode ser selecionado como padrão normal de consolidation.

### 21.6 Autoria de Topical Clip

O prompt deve incluir `{{SOURCE_MEMORIES}}`, manter foco no tópico solicitado, distinguir evidência da fonte de inferência, combinar material novo com conteúdo existente do Clip e expor contradições.

### 21.7 Autoria de Compaction

O prompt deve incluir `{{ENTRY_CONTENT}}` e encurtar sem adicionar fatos não sustentados. Deve preservar wrappers estruturais e macros necessários à entrada.

### 21.8 Checklist para escrever prompts

Antes de finalizar qualquer prompt STMB, responda:

1. Qual material é o alvo real de análise?
2. Qual material serve apenas como referência?
3. Esse caminho espera JSON estrito ou texto simples final?
4. Que informação precisa sobreviver para recuperação posterior?
5. O que deve ser omitido, combinado, carregado adiante ou deixado sem atribuição?

Correção do formato de retorno vem antes do estilo.

---

## 22. Summary Prompt Manager e Consolidation Prompt Manager

### Summary Prompt Manager

Pode criar, editar, duplicar, excluir, importar e exportar presets de prompts comuns de Memory. Atribua um preset por um perfil do Memory Books.

Todos os presets comuns de Memory devem preservar o schema JSON obrigatório de Memory.

Consulte a Seção 21.2 para o guia de seleção e melhores usos dos Summary Prompts integrados.

### Consolidation Prompt Manager

Controla prompts usados para agrupar entradas de nível inferior em resumos de nível superior e seleciona o prompt normal padrão de consolidation.

O preset de consolidation somente para regeneration não pode ser usado para consolidation comum.

### Importação e comportamento de localização

Prompts integrados podem ser recriados no locale atual do aplicativo. Faça backup de built-ins modificados localmente antes de recriá-los.

---

## 23. STMB e outras extensões

Extensões do SillyTavern rodam lado a lado e podem ler ou modificar os mesmos dados do SillyTavern. O STMB não substitui, desabilita nem estabelece prioridade sobre outra extensão. Quando comportamentos se sobrepõem, o resultado final depende das configurações e do timing de todas as extensões envolvidas.

### 23.1 Visibilidade compartilhada de mensagens

Se uma mensagem de chat está oculta faz parte do estado compartilhado de mensagens do SillyTavern. Não é estado pertencente exclusivamente ao STMB.

As configurações **Token Saving** do STMB podem ocultar mensagens processadas depois que uma Memory é salva. Outra extensão pode posteriormente revelar essas mensagens, e o STMB não impedirá isso. Da mesma forma, **Unhide hidden messages for memory generation** pode revelar mensagens enquanto o STMB processa ou regenera um intervalo selecionado.

### 23.2 Presence

A extensão Presence e o STMB podem ambos alterar o estado oculto/visível das mensagens de chat. Se Presence revelar mensagens que o STMB ocultou, a configuração Token Saving do STMB não foi apagada nem ignorada; uma ação posterior do Presence alterou o mesmo estado de mensagem do SillyTavern.

Se você usa Presence e quer que mensagens ocultadas pelo STMB permaneçam ocultas, use o recurso de locking de mensagens ocultas do próprio Presence. Atualmente Presence fornece o comando `/presenceLockHiddenMessages` para isso. Execute-o para o intervalo de mensagens aplicável e repita à medida que o intervalo crescer. Consulte a documentação do Presence para o comportamento atual do comando.

O STMB não configura nem invoca Presence automaticamente, e seu tratamento de participantes de chat em grupo não tem relação com Token Saving.

### 23.3 Integração com Regex

O STMB integra com a extensão Regex do SillyTavern em dois estágios:

1. **Outgoing/User Input:** transforma o prompt montado antes de enviá-lo.
2. **Incoming/AI Output:** limpa ou padroniza a resposta bruta antes de parsear/salvar.

Ative **Use regex (advanced)**, depois abra **Configure regex** e selecione um ou mais scripts para cada direção.

Importante: os controles de seleção do próprio STMB controlam a execução. Um script selecionado pelo STMB pode rodar mesmo quando esse script está desativado na interface normal da extensão Regex.

Use Regex somente quando entender a transformação. Uma regra ruim de saída pode corromper instruções obrigatórias de schema; uma regra ruim de entrada pode corromper JSON que estava válido.

---

## 24. Títulos de entradas de lorebook e política de caracteres

### 24.1 Placeholders de título

Formatos de título de perfil podem usar:

- `{{title}}` — título gerado pela IA;
- `{{scene}}` — intervalo de origem;
- `{{char}}` — nome do personagem/grupo;
- `{{groupname}}` — nome exibido do grupo atual; resolve para `Unknown` fora de um chat em grupo;
- `{{present}}` — personagens presentes na cena, separados por vírgulas: speakers individuais em um chat em grupo, Active Cast selecionado da cena em Narrator Mode, ou o personagem atual em um chat de personagem normal;
- `{{user}}` — nome do usuário;
- `{{messages}}` — quantidade de mensagens na cena;
- `{{profile}}` — nome do perfil;
- placeholders suportados de data e hora.

### 24.2 Numeração automática

Tokens de numeração suportados incluem formatos como:

```text
[0] [00] (0) {0} #0
#[000] ([000]) {[000]}
```

O STMB atribui números sequenciais com zero padding conforme o formato escolhido.

### 24.3 Unicode imprimível

Todos os caracteres Unicode imprimíveis são permitidos em títulos, incluindo emoji, texto acentuado, CJK e símbolos. Caracteres de controle Unicode em U+0000–U+001F e U+007F–U+009F são removidos.

Nomes de arquivo de lorebook usados pelo Auto-Create são sanitizados separadamente para caracteres reservados do sistema de arquivos e tamanho.

---

## 25. Fila de tarefas e controles de repetição

A fila opcional exige Chat Top Bar / Chat Top Info Bar. Quando a fila está disponível, regenerar uma Memory, consolidation ou Side Prompt cria um job de regeneration; a substituição permanece em review até ser aprovada.

O drawer **Memory Books Jobs** pode mostrar:

- queued;
- active;
- completed;
- failed;
- canceled;
- blocked;
- Needs Review.

Jobs que processam um intervalo do chat mostram os números inicial e final das mensagens em suas linhas da fila. O drawer também pode cancelar trabalho ativo, reabrir jobs de review, inspecionar falhas, repetir trabalho e dispensar linhas de histórico terminal.

Escopos de retry:

- **Retry:** repete um job que não seja Memory, como Side Prompt ou consolidation.
- **Retry All:** repete/retoma a Memory e o trabalho associado de Side Prompts após Memory. Se a Memory já foi salva, o STMB pode retomar daquele resultado em vez de duplicá-la.
- **Retry Memory:** repete/retoma somente a Memory e intencionalmente pula Side Prompts após Memory.

Use Retry All para restaurar o fluxo combinado; use Retry Memory quando o trabalho de trackers não deve rodar.

Sem Chat Top Bar, o STMB ainda executa seus fluxos normais, mas não possui a interface de fila.

---

## 26. Feedback visual e acessibilidade

O STMB fornece estados visuais para controles de cena, incluindo inactive, selected, valid range, in-scene e processing. As cores exatas dependem do tema do SillyTavern.

O suporte de acessibilidade inclui:

- navegação por teclado;
- indicadores de foco;
- atributos ARIA;
- comportamento reduced-motion;
- controles amigáveis em mobile.

Ao ensinar a partir de uma captura de tela, descreva o ícone e label visíveis em vez de depender de uma cor específica.

---
## 27. Mapa de configurações e referência atual

Esta seção é o mapa de configurações. Ela identifica onde cada controle de configuração do STMB voltado ao usuário está localizado e o que controla. Também lista controles importantes salvos e de execução única em interfaces especializadas. Campos de conteúdo usados somente uma vez para criar um Clip, Topical Clip, Compaction ou preview específico são documentados nas seções de seus respectivos fluxos em vez de repetidos aqui.

O caminho inicial comum é:

**menu Extensions de varinha mágica ao lado da caixa de entrada do chat → Memory Books**

Todos os caminhos abaixo começam no painel principal **Memory Books**, a menos que indiquem explicitamente **SillyTavern**. Um controle pode estar oculto ou desabilitado quando não se aplica ao chat, provedor, perfil ou modo de armazenamento atual.

Escopos usados abaixo:

- **Global:** aplica-se a todo o STMB, a menos que uma configuração mais específica substitua.
- **Per chat:** armazenado para o chat ou grupo atual.
- **Per character:** acompanha o character card entre chats compatíveis.
- **Per profile/template/setting:** armazenado naquele objeto reutilizável.
- **Per run:** afeta somente a operação que está sendo preparada no momento.

### 27.1 Painel principal: armazenamento, modo do chat e perfil ativo

| Setting | Location | Scope | What it does |
|---|---|---|---|
| **Enable Manual Lorebook Mode** | **Current Lorebook Configuration** | Global mode; escolha do book é per chat | Para de usar o lorebook normal vinculado ao chat como alvo automático do STMB e exige que um Memory Book seja selecionado para o chat atual. Não pode ser ativado junto com Auto-Create Lorebook Mode. |
| **Selected manual Memory Book** | **Current Lorebook Configuration → manual lorebook controls**; visível no Manual Mode | Per chat | Escolhe o main Memory Book que recebe Memories neste chat. Em Narrator Mode, é o book onisciente. |
| **Group-character Memory Book assignments** | **Current Lorebook Configuration → group-character rows**; visível em grupo real usando Manual Mode | Per chat | Atribui um Memory Book separado a cada membro do grupo real. STLO é necessário para configurar essas atribuições e fornecer o comportamento de recuperação filtrado por personagem correspondente. |
| **Character Memory Book lock** | Ícone de lock ao lado da atribuição de Memory Book do personagem | Per character | Mantém aquele character card atribuído ao mesmo Memory Book entre chats compatíveis de Manual Mode. Desbloqueie antes de alterar a atribuição. |
| **Narrator Mode** | **Current Lorebook Configuration**; somente chats normais que não sejam grupo | Per chat | Usa o manual book selecionado como Memory Book onisciente e habilita personagens fictícios declarados com seus próprios books únicos. Manual Mode e um book onisciente são obrigatórios. |
| **Manage Narrator Cast** | Sob **Narrator Mode**; também disponível pelo drawer Active Cast | Per chat | Adiciona, aposenta, restaura e atribui Memory Books únicos aos personagens declarados do Narrator. |
| **Auto-create lorebook if none exists** | **Current Lorebook Configuration** | Global | No Automatic Mode, cria e vincula um lorebook quando o chat não tem nenhum. Não pode ser ativado junto com Manual Mode. |
| **Lorebook Name Template** | Diretamente abaixo de **Auto-create lorebook if none exists** | Global | Nomeia books criados automaticamente. Suporta `{{char}}`, `{{user}}` e `{{chat}}`. Só é usado enquanto Auto-Create Lorebook Mode está ativado. |
| **Memory profile selection** | seletor **Memory Profiles** | Per run | Escolhe o perfil para a próxima Memory e para as ações de perfil adjacentes. Esta seleção sozinha não altera o default salvo. |
| **Set as Default** | **Memory Profiles → Profile Actions** | Global default | Torna o perfil selecionado o padrão usado por Memories automáticas e outros fluxos, a menos que uma confirmação, override de Side Prompt ou escolha específica do fluxo selecione outro perfil. |
| **Memory Title Format** | **Memory Profiles → Memory Title Format** ou **Profile Actions → Edit Profile** | Per profile | Formata títulos de novas entradas de Memory e numeração opcional com as macros listadas. O controle do painel principal edita o formato do perfil default; **Edit Profile** altera diretamente o perfil selecionado. |

### 27.2 General Settings

Abra **Settings → General Settings** no painel principal.

| Setting | Scope | What it does |
|---|---|---|
| **Always use default profile (no confirmation prompt)** | Global | Pula a janela normal de confirmação antes da geração. Obrigatório para catch-up não interativo; avisos independentes e previews habilitados ainda podem aparecer. |
| **Automatically accept detected participants in future** | Global | Para de perguntar confirmação de participantes de grupo real e aceita o conjunto de participantes detectado pelo STMB para futuras Memories. |
| **Show memory previews** | Global | Abre uma revisão editável antes de salvar Memories geradas e saída aplicável de Side Prompt. |
| **Show consolidation previews** | Global | Abre controles de revisão de candidatos de consolidation gerados antes do commit. |
| **Show notifications** | Global | Habilita notificações toast do STMB. |
| **Show floating Clip button when text is highlighted** | Global | Mostra o controle flutuante de tesoura após selecionar texto do chat. |
| **Memory boundary indicator** | Global | Mostra nenhum controle, o divider do limite processado, o jump button arrastável ou ambos. |
| **Allow scene overlap** | Global | Permite que o intervalo de cena selecionado se sobreponha a IDs de mensagens já representados por uma Memory existente. |
| **Refresh lorebook editor after adding memories** | Global | Atualiza um editor de lorebook aberto depois que o STMB grava entradas para que o conteúdo novo apareça imediatamente. |
| **Copy Memory Books when branching** | Global | Dá a uma branch nativa do chat cópias independentes de seus Memory Books ativos e desbloqueados, vinculados ao chat ou manuais. Books bloqueados por personagem continuam compartilhados por design. |
| **Auto-rollback after message deletion** | Global | Habilita rollback coordenado quando exclusão ou truncamento cruza material de chat já processado. Desabilitado por padrão. Edições comuns de mensagem e swipes não o disparam. |
| **Update last message ID processed** | Global; ação de Auto-rollback | Move o checkpoint processado para o final da Memory sobrevivente mais recente, ou o limpa quando nenhuma sobrevive. |
| **Delete last Memory** | Global; ação de Auto-rollback | Exclui todas as Memories invalidadas selecionadas pelo escopo do rollback e suas cópias vinculadas. Exclusão de Memory e consolidation é irreversível. |
| **Restore previous Side Prompts** | Global; ação de Auto-rollback | Restaura cada Side Prompt afetado e inalterado ao seu estado anterior exato salvo mais recente. Apenas um nível de rollback é mantido. |
| **Default for solo chats** | Global | Seleciona o Side Prompt Set herdado por chats solo após uma Memory. Uma seleção vazia usa Side Prompts após Memory habilitados individualmente. |
| **Default for group chats** | Global | Seleciona o Side Prompt Set herdado por grupos reais após uma Memory. Uma seleção vazia usa Side Prompts após Memory habilitados individualmente. |
| **Max Response Tokens** | Global | Substitui o tamanho máximo de saída para geração STMB. Aumente quando JSON que seria válido estiver sendo cortado; `0` deixa o comportamento normal do provedor/SillyTavern disponível como fallback. |
| **Token Warning Threshold** | Global | Mostra um aviso de confirmação quando a solicitação de entrada estimada ultrapassa o limite. Não altera o limite de contexto do modelo. |
| **Default Previous Memories Count** | Global | Define o padrão normal de 0–7 Memories anteriores fornecidas como contexto de continuidade para uma nova Memory. Uma execução pode sobrescrever em **Advanced Memory Options**. |
| **Use regex (advanced)** | Global | Habilita a seleção de processamento Regex própria do STMB. Essas seleções são independentes de o script Regex subjacente estar habilitado em geral no SillyTavern. |
| **Configure regex… → Outgoing scripts** | Global | Seleciona scripts que o STMB executa no material antes de enviá-lo ao provedor de geração. |
| **Configure regex… → Incoming scripts** | Global | Seleciona scripts que o STMB executa no material retornado antes de parsear e salvar. |

#### Memory Auto-Rollback dentro de General Settings

**Auto-rollback after message deletion** é uma preferência mestra. Suas três caixas de ação podem ser selecionadas independentemente, vêm habilitadas por padrão e ficam visualmente desabilitadas enquanto o interruptor mestre está desligado. Assim, instalações existentes não começam a excluir nada simplesmente por atualizar.

Auto-rollback reage somente a exclusão ou truncamento de mensagens, incluindo a fase de exclusão de uma response regeneration. Não reage a uma edição comum nem a um swipe. O STMB acompanha as identidades reais das mensagens de cada chat porque o valor do evento de exclusão do SillyTavern não identifica de forma confiável uma exclusão no meio.

Para uma exclusão no final, toda Memory cujo intervalo de origem armazenado cruze o sufixo removido é afetada. Para uma exclusão no meio de um chat, o STMB oferece três opções:

- **Full rollback** exclui a Memory afetada e todas as Memories mais novas.
- **Affected only** exclui somente Memories que se sobrepõem, preserva as Memories mais novas e desloca seus intervalos armazenados, checkpoints relevantes de Side Prompt e o checkpoint processado pela quantidade de mensagens excluídas. Isso deixa deliberadamente uma lacuna permanente na cobertura de Memory.
- **Cancel** não faz alterações no Memory Books.

Rollback usa `STMB_chatId`, intervalos de origem e metadados canônicos/de link exatos em todos os Memory Books disponíveis. Uma Memory canônica de grupo ou Narrator e todas as cópias vinculadas descobríveis constituem uma única unidade de exclusão. Cópias canônicas ausentes, entradas antigas ambíguas sem identidade suficiente do chat, intervalos malformados ou dependências incompletas de consolidation interrompem o rollback inteiro e produzem orientação de reparo; o STMB não adivinha propriedade.

Quando **Delete last Memory** está selecionado, o STMB faz preflight de cada parent de consolidation direto e transitivo em cada Memory Book afetado. Uma confirmação combinada lista as consolidations que precisam ser excluídas. Cancelar essa confirmação cancela também alterações de checkpoint, Memory e Side Prompt. A aprovação exclui os ancestrais de consolidation, reabilita cada fonte direta existente que havia sido desabilitada por uma consolidation excluída e limpa seu backlink `disabledBySummaryId`, depois exclui as Memories base selecionadas. Entradas desabilitadas independentemente pelo usuário não são habilitadas.

Antes de salvar, o STMB verifica novamente fingerprints completos dos lorebooks. Lorebooks são gravados por suas lanes normais serializadas, em ordem classificada, e clones inalterados anteriores à gravação são mantidos para salvamentos compensatórios se um book posterior falhar. Metadados de checkpoint do chat só mudam depois que todas as gravações de lorebook têm sucesso. Trabalho enfileirado do chat é cancelado antes do preflight; criação ativa de Memory fora da fila pode terminar antes de o rollback prosseguir.

Rollback de Side Prompt usa snapshots de regeneration versão 2. Cada snapshot registra se a entrada existia, seu estado anterior exato sem um snapshot de rollback mais antigo, chat/intervalo de origem e um fingerprint do estado que o STMB escreveu. Se a execução revertida criou a entrada, o rollback a exclui. Se a entrada atual já não corresponder ao fingerprint salvo, o STMB presume que o usuário ou uma execução posterior a alterou e não mexe nela. Snapshots versão 1 ainda suportam regeneration, mas não são seguros o bastante para rollback e são ignorados com aviso. Uma restauração bem-sucedida consome o snapshot, então aquele Side Prompt não pode ser revertido uma segunda vez até rodar novamente. Se várias Memories forem revertidas juntas, somente o estado anterior disponível mais recente de cada Side Prompt pode ser restaurado; informações introduzidas por execuções revertidas mais antigas podem permanecer.

#### Token Saving dentro de General Settings

Esses controles ficam mais abaixo no mesmo popup **General Settings**, em **Token Saving (Hide/Unhide Messages)**.

| Setting | Scope | What it does |
|---|---|---|
| **Auto-hide messages after adding memory** | Global | Escolhe nenhuma ocultação automática, todas as mensagens processadas até a última Memory ou somente o intervalo usado pela última Memory. Ocultar é reversível e não exclui mensagens. |
| **Messages to leave unhidden** | Global | Mantém esta quantidade de mensagens recentes visíveis ao auto-hide, preservando sobreposição perto do limite da Memory. `0` oculta até o fim da cena aplicável. |
| **Unhide hidden messages for memory generation** | Global | Executa o equivalente a `/unhide X-Y` para o intervalo de origem antes de o STMB compilá-lo. O modo de auto-hide selecionado determina o que volta a ser ocultado após um salvamento bem-sucedido. |

### 27.3 Automatic Memories e lembretes de consolidation

Abra **Settings → Automatic Memories** no painel principal.

| Setting | Scope | What it does |
|---|---|---|
| **Auto-create memory summaries** | Global | Habilita criação automática de Memory no estilo `/nextmemory`. Sem baseline processado, o STMB atual pode começar na mensagem 0; uma primeira Memory manual continua recomendada para validar a configuração e escolher deliberadamente o limite inicial. |
| **Auto-Summary Interval** | Global | Define quantas mensagens compõem a cadência automática normal. |
| **Auto-Summary Buffer** | Global | Exclui esta quantidade de mensagens mais recentes de um intervalo automático que de outra forma já estaria pronto, para que a geração aconteça um pouco atrás da conversa ao vivo. |
| **Prompt for consolidation when a tier is ready** | Global | Mostra prompt sim/mais tarde quando um tier monitorado alcança seu mínimo salvo de fontes elegíveis. Nunca executa consolidation silenciosamente. |
| **Auto-Consolidation Tiers** | Global | Escolhe quais tiers alvo são monitorados para prompts de prontidão. O mínimo de cada tier é salvo em **Consolidate Memories**. |

### 27.4 Editor de perfil

Escolha um perfil em **Memory Profiles** e abra **Profile Actions → Edit Profile**. Estas configurações são **per profile**, salvo indicação em contrário. O perfil integrado **Current SillyTavern Settings** bloqueia intencionalmente campos controlados pelo SillyTavern.

| Setting | What it does |
|---|---|
| **Profile Name** | Nomeia o perfil reutilizável do STMB. O nome do perfil integrado é bloqueado. |
| **API/Provider** | Escolhe roteamento atual do SillyTavern, um provedor compatível, uma conexão Custom OpenAI-compatible ou Full Manual Configuration. |
| **Use this connection profile** | Para **Custom OpenAI-Compatible API**, usa a conexão Custom ativa do SillyTavern ou uma conexão Custom nomeada. URL e secret salvos são usados, enquanto **Model** no STMB continua sendo o override de modelo. |
| **Skip structured output and use plain-text completion** | Para de enviar schema de structured output quando um provedor o rejeita. O prompt selecionado ainda precisa fazer o modelo retornar JSON válido exigido pelo STMB. |
| **Use ST's ChatCompletionService** | Roteia solicitações compatíveis pelo helper de Chat Completion do SillyTavern. Indisponível para perfis Full Manual. |
| **Chat Completion Preset** | Opcionalmente aplica um preset de Chat Completion do SillyTavern via ChatCompletionService. |
| **Model** | Fornece o model ID exato para o perfil. **Current SillyTavern Settings** lê o modelo ativo no SillyTavern. |
| **Temperature** | Define a aleatoriedade da geração do perfil. **Current SillyTavern Settings** lê a temperatura ativa no SillyTavern. |
| **Use reverse proxy** | Passa detalhes de reverse proxy configurados no SillyTavern para provedores compatíveis; em Full Manual Configuration, o campo de secret aparece como proxy password. |
| **API Endpoint URL / API Key** | Fornece endpoint e credencial diretos separados somente para **Full Manual Configuration**. Para uso normal, prefira uma conexão configurada e testada no SillyTavern. |
| **Memory Creation Method** | Seleciona o preset de Summary Prompt usado para geração comum de Memory. O conteúdo do prompt é gerenciado em **Settings → Summary Prompt Manager**. |
| **Use separate group and character prompts in group chats** | Usa presets de prompt diferentes para o Memory Book do grupo e Memory Books focados em personagem. |
| **Group Summary Prompt / Character Summary Prompt** | Seleciona os dois presets usados quando prompting separado de grupo/personagem está habilitado. |
| **Memory Title Format** | Controla texto do título, macros e numeração automática de Memories produzidas pelo perfil. |
| **Activation Mode** | Salva novas entradas como ativação por keyword **Normal**, **Constant** ou **Vectorized**. |
| **Insertion Position** | Escolhe onde a entrada gerada é inserida em relação a Character, Example Messages, Author's Note ou um Outlet nomeado. |
| **Outlet Name** | Nomeia o Outlet alvo e aparece somente quando **Insertion Position** é **Outlet**. |
| **Insertion Order** | **Auto** deriva a ordem do número da Memory; **Manual** usa valor fixo; **Reverse** conta para baixo a partir de um valor inicial e é destinado somente a Outlets. |
| **Prevent Recursion** | Impede que o conteúdo da entrada gerada acione outras entradas de lorebook durante scanning recursivo. |
| **Delay Until Recursion** | Impede a entrada gerada de ativar no primeiro passe de scanning. Deixe desligado quando nada mais puder iniciar recursão. |
| **Also include** | Apenas compatibilidade de perfis legados. Perfis antigos podem mostrar referências ordenadas de lorebooks aqui; a configuração atual usa **Context Settings** por chat. |

O provedor ativo, modelo, temperatura, connection preset e reverse proxy do SillyTavern são configurados nos próprios controles de conexão do SillyTavern, não no STMB. O perfil **Current SillyTavern Settings** lê esses valores ao vivo.

### 27.5 Context Settings

Abra **Settings → Context Settings** no painel principal.

| Setting | Scope | What it does |
|---|---|---|
| **Additional Context for this chat** | Per chat | Seleciona um Context Setting nomeado, salva explicitamente **No Context** ou deixa a escolha não definida para que o STMB possa perguntar quando contexto migrado exigir decisão. |
| **Context Setting Name** | Per Context Setting | Nomeia uma coleção reutilizável de Additional Context. |
| **Additional Context entries and order** | Per Context Setting | Seleciona entradas de lorebook para enviar como material estável de referência e determina sua ordem. Entradas ausentes geram aviso e são ignoradas. |

**New**, **Duplicate**, **Delete**, **Import JSON** e **Export JSON** gerenciam Context Settings; não mudam o comportamento da geração até um setting ser selecionado por um chat ou Side Prompt.

### 27.6 Trackers & Side Prompts

Abra **Settings → Trackers & Side Prompts** no painel principal.

| Setting | Location and scope | What it does |
|---|---|---|
| **After-memory side prompt mode for this chat** | Tela principal do manager; per chat | Usa o default solo/grupo correspondente, usa explicitamente prompts após Memory habilitados individualmente ou seleciona um Side Prompt Set nomeado para o chat. |
| **How many concurrent prompts to run at once** | Tela principal do manager; global | Limita jobs simultâneos de Side Prompt entre 1 e 10. |
| **Side Prompt Set Name** | **New Set** ou edição de set; per set | Nomeia um grupo reutilizável e ordenado de execuções de Side Prompt. |
| **Side Prompt / Row Label / Macro Values** | Linha de Side Prompt Set; per set | Escolhe o template da linha, oferece label opcional de display/título, fornece valores literais ou de set para macros em runtime e usa a ordem das linhas como ordem de execução. |
| **Enabled** | **New** ou edição de Side Prompt comum; per template | Torna o template elegível quando o chat usa prompts após Memory habilitados individualmente. Configurações de trigger ainda determinam quando roda. |
| **Run on visible message interval / Interval** | Editor de Side Prompt; per template | Roda após a quantidade configurada de mensagens visíveis. Triggers automáticos ficam indisponíveis quando o template exige macros em runtime não resolvidas. |
| **Run automatically after memory** | Editor de Side Prompt; per template | Roda o template após uma Memory bem-sucedida, sujeito ao modo de Side Prompt ou set selecionado do chat. |
| **Allow manual run via `/sideprompt`** | Editor de Side Prompt; per template | Permite execução manual explícita. |
| **Prompt / Response Format** | Editor de Side Prompt; per template | Define a instrução e estrutura opcional de saída. Ambos os campos podem usar macros suportadas de Side Prompt. |
| **Previous memories for context** | Editor de Side Prompt; per template | Inclui de 0–7 entradas anteriores de Memory antes das mensagens de origem selecionadas. |
| **Use additional context / Additional Context Source** | Editor de Side Prompt; per template | Inclui Additional Context e segue o Context Setting do chat atual ou sempre usa um setting fixo nomeado. |
| **Lorebook Target** | Editor de Side Prompt; per template ou per chat | Salva a saída no Memory Book normal ou em outro lorebook escolhido. Quando alterado, o STMB pergunta se a escolha vale só para este chat ou para o template daqui em diante. |
| **Lorebook Entry Title Override / Keywords** | Editor de Side Prompt; per template | Opcionalmente controla template de título da entrada upserted e palavras-chave de ativação separadas por vírgulas. |
| **Activation Mode / Insertion Position / Outlet Name** | Editor de Side Prompt; per template | Controla ativação e posicionamento da entrada de lorebook do Side Prompt. |
| **Insertion Order / Order Value** | Editor de Side Prompt; per template | Usa ordenação automática por número de Memory ou valor manual fixo de ordem. |
| **Prevent Recursion / Delay Until Recursion / Ignore Budget** | Editor de Side Prompt; per template | Aplica as flags correspondentes de recursão e orçamento da entrada de lorebook do SillyTavern. |
| **Override default memory profile / Connection Profile** | Editor de Side Prompt; per template | Roteia este Side Prompt por um perfil STMB selecionado em vez do perfil default atual. |
| **Memory Assistance Mode** | Editar **Memory Assistance**; global | **Off** desabilita; **Update** propõe mudanças a Clips existentes; **Update and Suggest** também descobre tópicos de Topical Clip; **Automatic** aplica diretamente adições a Clips comuns, deixando substituições de Topical Clip para aprovação. |
| **Update Prompt / Topic Suggestions Prompt** | Editar **Memory Assistance**; per built-in template | Controla suas duas tarefas de IA. Os contratos de resposta permanecem fixos. |
| **Use a connection profile override** | Editar **Memory Assistance**; per built-in template | Usa o perfil STMB selecionado para Memory Assistance em vez do default. |

### 27.7 Prompt managers

| Setting | Location | Scope | What it does |
|---|---|---|---|
| **Summary Prompt name and prompt text** | **Settings → Summary Prompt Manager → New Preset** ou edição | Per preset | Define um prompt reutilizável de Memory comum. Um perfil só o usa depois que **Memory Creation Method** ou seleção de prompt de grupo/personagem aponta para esse preset. |
| **Default consolidation prompt** | **Settings → Consolidation Prompt Manager → Set Default** | Global | Seleciona o prompt normal pré-selecionado por **Consolidate Memories**. Presets apenas de regeneration ou apenas de grupo não podem ser selecionados. |
| **Consolidation Prompt name and prompt text** | **Settings → Consolidation Prompt Manager → New Consolidation Preset** ou edição | Per preset | Define instruções reutilizáveis de consolidation. Presets dedicados de regeneration e grupo são restritos a esses fluxos. |

### 27.8 Defaults de Topical Clip e Compaction

Abra **Settings → Topical Clip** ou **Settings → Compaction** no painel principal.

| Setting | Location | Scope | What it does |
|---|---|---|---|
| **Generation Profile / Compaction Profile** | **Topical Clip → Generation Profile** ou **Compaction → Compaction Profile** | Global shared default | Seleciona o perfil STMB usado para geração de Topical Clip e Compaction. Alterar em qualquer interface muda a seleção compartilhada usada por ambos os fluxos. |
| **Topical Clip Prompt** | **Topical Clip → Edit Topical Clip Prompt** | Global | Salva um template personalizado de prompt para geração de Topical Clip. **Reset to Default** retorna ao prompt integrado atual. Macros de origem obrigatórias são validadas antes de salvar ou gerar. |
| **Compaction Prompt** | **Compaction → Edit Compaction Prompt** | Global | Salva um template personalizado para encurtar entradas existentes de Memory, Clip e Side Prompt. **Reset to Default** retorna ao prompt integrado atual. `{{ENTRY_CONTENT}}` é obrigatório. |

Memory Book, tópico, palavras-chave, inclusão de fontes, seleção de fontes, intervalo de mensagens, draft e entrada escolhida para Compaction são escolhas por execução, não configurações persistentes.

### 27.9 Controles de Consolidate Memories

Abra **Consolidate Memories** pelos botões na parte inferior do painel principal. Esta interface mistura defaults salvos com escolhas para uma única execução.

| Setting | Scope | What it does |
|---|---|---|
| **Source Memory Book** | Per run | Mostra o Memory Book sendo consolidado e permite selecionar outro book disponível. Alterá-lo recarrega a lista de entradas elegíveis sem mudar a configuração do Memory Book manual ou vinculado ao chat. |
| **Target tier** | Per run | Escolhe o tier superior a criar e, portanto, o tier de origem elegível imediatamente abaixo. |
| **Consolidation Prompt** | Per run | Seleciona o prompt para esta consolidation; inicialmente usa o default do Consolidation Prompt Manager. |
| **Maximum entries per pass** | Per run | Limita quantas entradas de tier inferior são enviadas em um passe de análise. |
| **Token Budget** | Per run | Define o orçamento aproximado de entrada usado para fazer batches desta consolidation. |
| **Number of automatic summary attempts** | Per run | Limita passes repetidos de análise usados para obter atribuições e resumos utilizáveis. |
| **Saved minimum eligible entries** | Global, salvo separadamente por tier alvo | Define quando o tier escolhido é considerado pronto. Também controla o prompt automático de prontidão desse tier. |
| **Activation Mode / Insertion Position / Outlet / Insertion Order / Recursion Settings** | Global consolidation-entry defaults | Controla como novas entradas consolidadas são salvas. São separados das configurações de entrada dos perfis de Memory comuns. |
| **Disable selected source entries after creating summaries** | Per run | Desabilita fontes consolidadas com sucesso após commit para que resumos de tier superior possam substituí-las na recuperação. Não as exclui. |
| **Selected source entries** | Per run | Escolhe quais entradas elegíveis de tier inferior são processadas. Entradas desmarcadas ficam intocadas. |

### 27.10 Configurações relacionadas de World Info do SillyTavern

Estes controles ficam fora do STMB, nas configurações de World Info/lorebook do SillyTavern, mas afetam se Memories salvas serão recuperadas durante geração normal do chat.

| Setting | What it does |
|---|---|
| **Match Whole Words** | Controla correspondência de limites de keywords. Off é um ponto inicial comum para palavras-chave flexíveis de Memory. |
| **Scan Depth** | Controla quanto texto recente é escaneado para ativação de lorebook. Um valor relativamente alto, como 8, é um ponto inicial comum. |
| **Max Recursion Steps** | Limita ativação recursiva de World Info. Aproximadamente 2 é um ponto inicial comum. |
| **Context percentage / lorebook budget** | Limita quanto contexto as entradas de lorebook podem ocupar. Aumente somente em equilíbrio com o contexto total do modelo e outros materiais do prompt. |

São recomendações, não exigências rígidas; consulte a Seção 10 para diagnóstico de recuperação.

---
## 28. Referência de comandos slash

### Comandos de Memory

```text
/creatememory
```

Cria uma Memory a partir da cena atualmente marcada.

```text
/scenememory X-Y
```

Define o intervalo inclusivo e cria uma Memory, por exemplo `/scenememory 10-15`.

```text
/nextmemory
```

Cria uma Memory a partir da mensagem depois do maior limite processado até o fim elegível atual.

```text
/stmb-catchup interval=x start=y end=z
```

Processa um chat longo existente em chunks consecutivos.

### Comandos de Side Prompt

```text
/sideprompt "Name" {{macro}}="value" [X-Y]
/sideprompt-set "Set Name" [X-Y]
/sideprompt-macroset "Set Name" {{macro}}="value" [X-Y]
/sideprompt-on "Name" | all
/sideprompt-off "Name" | all
```

### Comandos de limite processado

```text
/stmb-highest
/stmb-set-highest <N|none>
```

### Parada de emergência

```text
/stmb-stop
```

Para toda geração STMB em andamento em todos os lugares, incluindo Side Prompts. Trabalho já committed permanece salvo.

---

## 29. Solução de problemas por estágio

### 29.1 Extensão/UI não carregou

Sintomas:

- Memory Books ausente do menu de varinha mágica;
- chevrons ausentes;
- nenhum botão flutuante de Clip após selecionar texto.

Verificações:

1. extensão instalada e habilitada;
2. página recarregada;
3. chat de personagem/grupo aberto;
4. aguarde até dez segundos;
5. expanda ações das mensagens;
6. só então inspecione o console se essas verificações falharem.

### 29.2 Nenhuma cena selecionada

Tanto **►** quanto **◄** são necessários para uma cena marcada. Confirme Current Scene no painel.

Se o intervalo se sobrepuser a uma Memory existente, escolha outro intervalo ou habilite Allow Scene Overlap.

### 29.3 Nenhum Memory Book válido

Automatic Mode:

- vincule um lorebook ao chat; ou
- habilite Auto-Create.

Manual Mode:

- selecione um main manual book;
- repare uma seleção excluída;
- desbloqueie um broken character lock antes de alterá-lo.

Grupo real multi-book:

- STLO precisa estar disponível;
- todo membro exigido precisa de uma atribuição válida;
- o group book não pode ser reutilizado como character book.

Narrator Mode:

- Manual Mode precisa estar habilitado;
- um book onisciente precisa estar selecionado;
- todo membro declarado precisa de um book único que não seja o onisciente.

### 29.4 A IA não produziu uma Memory válida

Verifique nesta ordem:

1. provedor/modelo/perfil são válidos;
2. a resposta não foi truncada;
3. maximum response tokens são suficientes;
4. o prompt selecionado ainda exige JSON exato;
5. Regex não corrompeu o schema;
6. o provedor suporta o modo de structured output selecionado;
7. tente Skip Structured Output somente se o provedor rejeitar schemas;
8. tente um modelo melhor em seguir instruções antes de reescrever o prompt;
9. clique em **Raw response from AI** na notificação persistente de erro para inspecionar a resposta capturada do provedor e use a interface de correção manual de JSON quando disponível.

Causas comuns incluem code fences, comentários, chave ausente, keywords que não são array, texto de recusa ou saída cortada.

### 29.5 Memory salva, mas mensagens desapareceram

Provavelmente foram ocultadas automaticamente. Altere as configurações de Token Saving. Mensagens ocultas não foram excluídas.

### 29.6 Memories automáticas não rodaram

Verifique:

- Auto-create memory summaries habilitado;
- mensagens suficientes além do maior limite processado;
- requisito de interval mais buffer satisfeito;
- nenhum postpone checkpoint ainda ativo;
- Memory Book válido disponível;
- nenhum outro job de Memory bloqueando o trigger;
- chat atual não foi trocado durante o trabalho;
- geração de grupo terminou antes do momento esperado do trigger.

Uma primeira Memory manual é recomendada, mas não tecnicamente exigida na versão atual.

### 29.7 Memory existe, mas não ativa

Verifique:

- book correto ativo;
- entrada habilitada;
- palavras-chave relevantes;
- modo de ativação;
- orçamento;
- recursão e Delay Until Recursion;
- roteamento STLO, se usado;
- inspeção/logs de World Info.

Não regenere a Memory até testar a recuperação.

### 29.8 Entrada foi enviada, mas ignorada

Isso é comportamento de uso do modelo. Possíveis respostas:

- tornar a Memory mais curta e explícita;
- melhorar posição/prioridade de inserção;
- reduzir contexto concorrente;
- usar um lembrete OOC;
- escolher um modelo que siga melhor o contexto fornecido.

### 29.9 Side Prompt não rodou

Consulte a Seção 16.18. Em especial, um set selecionado suprime prompts habilitados individualmente que estejam fora dele.

### 29.10 Consolidation não gerou prompt

Confirme:

- readiness prompt habilitado;
- tier alvo selecionado para monitoramento;
- entradas de origem elegíveis suficientes;
- fontes não estão já desabilitadas/inelegíveis;
- mínimo salvo daquele tier foi atingido.

### 29.11 Botão de regeneration desabilitado

Passe o mouse ou inspecione o motivo informado. Causas comuns:

- entrada anterior aos metadados de snapshot exigidos;
- chat/intervalo de origem indisponível;
- entradas de origem ausentes ou no tier errado;
- parent consolidation ativo bloqueia uma fonte inferior;
- sequence number original não pode ser determinado;
- template de Side Prompt excluído.

### 29.12 Branch não copiou os books

Verifique:

- Copy Memory Books when branching estava habilitado antes da criação da branch;
- era uma branch nativa do SillyTavern;
- source books existiam e podiam ser carregados;
- chat não foi trocado durante a cópia;
- branch não estava anteriormente marcada como completed/failed;
- locked books foram intencionalmente preservados em vez de copiados.

### 29.13 Elenco do Narrator Mode está errado

Verifique:

- seleção de Active Cast antes da geração;
- se a mensagem foi uma continuation que combinou metadados de elenco;
- se um swipe restaurou estado antigo do elenco;
- se a cena contém mensagens antigas sem marcação que exigem confirmação;
- se o personagem declarado foi aposentado;
- se cada character book ainda existe.

---

## 30. FAQ

### Preciso de vectors?

Não. Ativação por keywords é suficiente e gerada automaticamente. Vectors são opcionais.

### Memories devem usar um lorebook separado?

Normalmente sim, para organização, orçamento, reutilização e diagnóstico, mas não é obrigatório.

### O STMB exclui mensagens?

Não. Ele pode ocultar mensagens processadas do contexto ativo.

### Posso usar STMB totalmente de forma manual?

Sim. Marque cenas e crie Memories somente quando desejar.

### Memories automáticas podem criar a primeira Memory?

Sim, no STMB atual. Sem baseline processado, ele começa na mensagem 0 assim que interval mais buffer forem atingidos. Uma primeira execução manual ainda é recomendada para verificar a configuração e escolher o limite inicial desejado.

### Consolidation roda automaticamente?

Não. O STMB pode avisar quando um tier está pronto, mas o usuário confirma e revisa a operação.

### Um grupo real pode usar um único Memory Book?

Sim. É a configuração inicial recomendada e não exige STLO.

### Quando character books separados em grupo real são úteis?

Quando continuidade individual, conhecimento, recuperação específica por speaker ou resumos focados em personagem justificam a configuração extra e as solicitações adicionais à IA.

### Narrator Mode é igual a Group Chat Mode?

Não. Group Chat Mode lê autores de character cards separados do SillyTavern. Narrator Mode declara manualmente personagens fictícios escritos por um único card Narrator.

### Narrator Mode exige STLO?

Não para seu caminho de recuperação por Active Cast. Exige Manual Lorebook Mode, um book onisciente e books únicos por personagem.

### Cópias vinculadas são sincronizadas?

Não. São vinculadas por metadados de origem/consolidation, não por espelhamento contínuo.

### Por que Delay Until Recursion normalmente deve ficar desligado?

Se nenhuma outra entrada de lorebook iniciar recursão, uma Memory atrasada pode nunca ativar.

### O que fazer depois da primeira Memory bem-sucedida?

Verifique a recuperação da entrada, depois habilite Memories automáticas, escolha interval/buffer, habilite ocultação de tokens e adicione Clips ou um Side Prompt bem definido somente quando necessário. Use Topical Clip e Consolidation depois que houver Memories suficientes.

---

## 31. Compatibilidade, migração e notas históricas atuais

Esta seção preserva apenas histórico que afeta o uso atual.

### Baseline atual

- Versão documentada atual: v8.5.0, 1 de agosto de 2026.
- Requisito do SillyTavern: 1.14.0 ou posterior.
- Narrator Mode foi adicionado na v8.5.0.
- Cópia de books em branches, regeneration de Side Prompt e character Memory Book locks foram adicionados na v8.4.0.
- Distribuição de Memory multi-character em grupo real chegou na v8.0.0.
- Additional Context saiu dos perfis e foi para Context Settings reutilizáveis por chat na v7.0.0; contexto antigo de perfis é migrado.
- Topical Clip foi adicionado na v6.10.0.
- Compaction e Clips foram adicionados na v6.6.0.
- Side Prompt Sets e targets por prompt foram adicionados no período v6.4–v6.5.
- Consolidation tornou-se um sistema de vários tiers de Arc até Epic na v6.0.0; metadados antigos de Arc são migrados.
- Integração com Job Queue foi adicionada na v6.8.0 e permanece opcional.
- Defaults atuais de perfil deixam Delay Until Recursion desabilitado, a menos que usuário/perfil altere explicitamente.

### Memories existentes de versões antigas

Somente entradas com a flag `stmemorybooks` e metadados exigidos são reconhecidas como STMB Memories. Use o conversor de lorebook fornecido para entradas antigas anteriores aos metadados atuais.

### Funcionalidade removida

O antigo recurso de bookmark foi removido do Memory Books na v4.0.0 e separado da extensão principal. Não ensine controles de bookmark do Memory Books como comportamento atual.

### Built-ins localizados

Prompts integrados podem ser regenerados conforme o idioma ativo do SillyTavern. Faça backup de built-ins personalizados antes de recriá-los.

### Comportamento de importação

Importação de Side Prompt é aditiva. Prompts existentes são preservados; conflitos de key importada são renomeados em vez de sobrescrever o prompt existente.

---

## 32. Notas de desenvolvimento e licença

Memory Books usa Bun para bundling/minification.

```sh
bun run build
```

Instale o hook de build pre-commit do repositório com:

```sh
bun run install-hooks
```

O hook faz build antes do commit, adiciona os artefatos de build ao stage e aborta se o build falhar.

Memory Books é Copyright © 2024–2026 Aiko Hanasaki e licenciado sob a GNU Affero General Public License v3.0. Versões modificadas devem preservar avisos aplicáveis, identificar modificações e cumprir os requisitos de disponibilidade de código-fonte da AGPL.

---

## 33. Árvore compacta de diagnóstico

```text
User says “Memory Books is not working.”
│
├─ Is the menu/control visible?
│  ├─ No → installation/loading/UI checks.
│  └─ Yes
│
├─ Can a scene be selected?
│  ├─ No → expand message actions; set both chevrons; inspect overlap.
│  └─ Yes
│
├─ Is there a valid effective Memory Book?
│  ├─ No → bind, auto-create, select manual, or repair multi-book bindings.
│  └─ Yes
│
├─ Does generation return valid complete output?
│  ├─ No → profile, provider, output tokens, JSON schema, Regex, model.
│  └─ Yes
│
├─ Does the entry exist in the intended book?
│  ├─ No → save/rollback/permission/job failure.
│  └─ Yes
│
├─ Does SillyTavern activate and send it later?
│  ├─ No → keywords, activation mode, book binding, budget, recursion, STLO.
│  └─ Yes
│
└─ Does the model use the supplied entry?
   ├─ No → model compliance, placement, competing context, entry clarity.
   └─ Yes → workflow is functioning.
```

---

## 34. Sequência mínima de ensino recomendada

Para um usuário novo, ensine somente esta sequência primeiro:

1. Abra o menu de varinha mágica e encontre Memory Books.
2. Use Automatic Mode com um book vinculado ou habilite Auto-Create.
3. Selecione Current SillyTavern Settings.
4. Expanda ações das mensagens e marque uma cena curta e completa com **►** e **◄**.
5. Crie e faça preview de uma Memory.
6. Abra o Memory Book e verifique a entrada salva.
7. Confirme que a entrada pode ativar posteriormente.
8. Habilite Memories automáticas e escolha interval/buffer.
9. Habilite auto-hide somente depois de explicar que mensagens ocultas não são excluídas.
10. Apresente Clips, depois Side Prompts, depois Topical Clip/Consolidation somente quando o usuário tiver uma necessidade concreta.

Não comece com prompts personalizados, endpoints Full Manual, vários character books, Regex ou consolidation, a menos que o problema real do usuário exija isso.

---

## 35. Resumo final dos conceitos

Memory Books é um pipeline externo de continuidade construído sobre lorebooks do SillyTavern:

```text
Select or schedule chat material
→ generate a structured representation
→ save it with retrieval metadata
→ optionally hide processed transcript
→ let SillyTavern retrieve relevant entries later
```

O sistema funciona melhor quando:

- cenas são coerentes;
- prompts distinguem claramente target de contexto de referência;
- fluxos JSON retornam schemas exatos;
- palavras-chave são concretas;
- Memory Books são atribuídos e ativados deliberadamente;
- trackers de longa duração removem estado obsoleto;
- consolidation reduz detalhes antigos sem apagar continuidade;
- usuários verificam recuperação em vez de presumir que salvo significa enviado;
- roteamento avançado multi-book é usado somente quando sua precisão vale a complexidade.
