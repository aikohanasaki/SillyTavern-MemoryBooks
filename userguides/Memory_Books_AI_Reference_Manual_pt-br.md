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
- [23. Integração com Regex](#23-integração-com-regex)
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

Trate este documento como a referência operacional atual do Memory Books. Ele substitui a necessidade de carregar separadamente o guia Start Here, README, User Guide, guia de Side Prompts, How STMB Works e changelog histórico como arquivos de conhecimento independentes.

Termos:

- STMB = SillyTavern=MemoryBooks (esta extensão)
- ST = SillyTavern (código-base que o STMB estende)

Ao responder usuários:

1. Preserve exatamente a terminologia do Memory Books. Um **Memory Book** é um lorebook do SillyTavern usado pelo STMB; não é um formato de banco de dados separado.
2. Diferencie comportamento atual de comportamento histórico. Não ensine um fluxo removido ou substituído apenas porque ele apareceu em um changelog antigo.
3. Diferencie **Group Chat Mode** de **Narrator Mode**. Eles resolvem problemas diferentes.
4. Diferencie **geração** da memória, **armazenamento/configuração** do lorebook e posterior **recuperação pelo SillyTavern**. Ativação/recuperação fazem parte do código-base do ST.
5. Não invente controles, rótulos de menu, comportamento de provedores ou configurações não descritas aqui.
6. Quando houver uma captura de tela, identifique apenas os controles visíveis. Dê a próxima ação imediata em vez de presumir que existe um controle fora da tela.
7. Ao solucionar problemas, identifique o primeiro estágio que falhou e teste-o antes de recomendar alterações nos prompts.
8. Prefira primeiro uma configuração simples que funcione, antes de roteamento avançado, vários books, prompts personalizados, Regex ou automação de Side Prompts.
9. Explique que filtros de personagens e Memory Books separados melhoram o roteamento e a relevância; eles não são uma barreira de segurança.
10. Declare incerteza quando a versão instalada, a versão do SillyTavern, o provedor ou o prompt personalizado do usuário puderem ser diferentes.

### Notas do documento atual

Narrator Mode está implementado na v8.5.0.

Vários documentos para iniciantes diziam que uma Memory manual era tecnicamente necessária antes do início das Memories automáticas. O STMB atual pode criar a primeira Memory automática a partir da mensagem 0 quando não existe um baseline de mensagens processadas. Uma primeira Memory manual ainda é recomendada porque verifica a conexão, o Memory Book, o formato da saída e o limite inicial desejado antes de confiar na automação.

---

## 2. Definição do produto e modelo mental

Memory Books é uma extensão do SillyTavern que converte intervalos de chat selecionados ou escolhidos automaticamente em entradas estruturadas de memória armazenadas em lorebooks do SillyTavern.

O processo básico é:

```text
Mensagens do chat
    ↓
STMB seleciona ou recebe um intervalo de mensagens
    ↓
STMB monta uma solicitação para a IA
    ↓
O modelo retorna uma memória estruturada
    ↓
STMB salva uma entrada no lorebook
    ↓
Mensagens antigas processadas podem ser ocultadas do contexto ativo
    ↓
SillyTavern ativa posteriormente as entradas relevantes do lorebook
    ↓
O modelo de chat recebe essas entradas como contexto
```

O STMB não dá ao modelo uma memória interna permanente. Ele mantém um sistema externo de referência (entradas de lorebook). O modelo de chat “lembra” quando o SillyTavern inclui as entradas relevantes do lorebook no prompt enviado à IA.

### Os três estágios separados

1. **Qualidade da geração** — O modelo de geração de memória produziu um resultado correto e útil?
2. **Armazenamento e configuração** — O resultado foi salvo no Memory Book desejado, com configurações de ativação adequadas?
3. **Recuperação e uso pelo modelo** — O SillyTavern ativou e enviou a entrada, e o modelo de chat a usou corretamente?

Solucione esses estágios separadamente.

### Lorebooks e Memory Books

Um **lorebook**, também chamado de **World Info** em partes do SillyTavern, é uma coleção de entradas que o SillyTavern pode adicionar condicionalmente a uma solicitação de modelo. Uma entrada de lorebook normalmente possui:

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

### Entradas de memória são contexto comprimido

Uma Memory de cena não é a transcrição original. É uma representação comprimida destinada a preservar informações relevantes para continuidade, como:

- eventos e consequências;
- decisões e planos;
- descobertas e revelações;
- mudanças emocionais ou de relacionamento;
- conhecimento, crenças ou mal-entendidos individuais;
- objetos, locais, identidades, promessas e restrições importantes.

Ocultar mensagens processadas não as exclui. Apenas impede que sejam enviadas à IA e continuem consumindo contexto ativo do histórico do chat.

---

## 3. Vocabulário básico e seleção de recursos

| Necessidade | Recurso | Significado |
|---|---|---|
| Resumir um intervalo selecionado ou automático do chat | **Memory** | “Lembre o que aconteceu nesta cena.” |
| Salvar texto selecionado do chat ou um fato | **Clip** | “Salve esta nota.” |
| Reunir fatos sobre um assunto a partir de Memories salvas | **Topical Clip** | “Reúna tudo que minhas Memories dizem sobre isto.” |
| Manter informações que mudam ao longo de várias execuções | **Side Prompt** | “Mantenha este tracker atualizado.” |
| Combinar várias Memories ou resumos de nível inferior | **Consolidation** | “Transforme estas entradas em um resumo de nível superior.” |
| Encurtar uma entrada existente gerenciada pelo STMB | **Compaction** | “Encurte esta entrada sem perder os fatos.” |
| Substituir uma entrada existente usando suas fontes originais | **Regeneration** | “Reconstrua esta entrada e revise a substituição.” |

### Diferenças que os usuários costumam confundir

- **Clip vs. Topical Clip:** um Clip começa com texto destacado no chat atual. Um Topical Clip começa com Memories STMB existentes e confirmadas.
- **Topical Clip vs. Side Prompt:** Topical Clip é executado manualmente para reunir um tema. Side Prompt pode manter repetidamente um tracker que muda.
- **Compaction vs. Consolidation:** Compaction reescreve uma entrada. Consolidation cria um novo resumo de nível superior a partir de várias entradas.
- **Memory vs. Side Prompt:** Memories normalmente são registros sequenciais de cenas. Side Prompts geralmente atualizam ou sobrescrevem um documento contínuo de suporte.
- **Geração vs. recuperação:** criar uma entrada não garante que o SillyTavern a ative depois.

---

## 4. Requisitos, instalação e verificação inicial

### Requisitos

- SillyTavern 1.18.0 ou mais recente; recomenda-se a versão compatível mais nova.
- Uma conexão de IA funcionando.
- Um modelo capaz de seguir instruções e, para fluxos de Memory e Consolidation, retornar JSON válido.
- Permissão para instalar extensões de terceiros no SillyTavern.
- Um preset Chat Completion disponível no SillyTavern ao usar backend local ou Text Completion por um endpoint Chat Completion compatível com OpenAI.

### Usuários comuns de Chat Completion

OpenAI, Anthropic/Claude, OpenRouter, Gemini/Google e outras conexões Chat Completion normalmente podem usar o perfil integrado **Current SillyTavern Settings**.

### Usuários locais e de Text Completion

KoboldCpp, llama.cpp, TextGen, Ollama e backends semelhantes normalmente funcionam melhor quando expostos por um endpoint Chat Completion compatível com OpenAI. Mesmo que o roleplay comum use Text Completion, o SillyTavern deve ter um preset Chat Completion disponível para STMB.

Configuração típica do KoboldCpp:

- tipo de API: Chat Completion;
- fonte: Custom OpenAI-compatible;
- endpoint como `http://localhost:5001/v1` ou `http://127.0.0.1:5000/v1`;
- qualquer chave API personalizada não vazia se o SillyTavern exigir;
- ID de modelo no formato esperado pelo endpoint, normalmente `koboldcpp/modelname`, sem sufixo `.gguf` desnecessário;
- preset Chat Completion importado;
- comprimento de resposta de pelo menos 2048 tokens, com 4096 frequentemente mais seguro.

Configuração típica do llama.cpp:

- tipo de API: Chat Completion;
- fonte: Custom OpenAI-compatible;
- endpoint `http://localhost:8080/v1`, ou `http://host.docker.internal:8080/v1` quando o SillyTavern roda no Docker;
- qualquer chave API não vazia se exigida;
- ID do modelo servido;
- sem pós-processamento de prompt, a menos que o endpoint exija.

Exemplo de comando do servidor:

```sh
llama-server -m <model-path> -c <context-size> --port 8080
```

### Chat Top Bar opcional

O STMB funciona sem Chat Top Bar / Chat Top Info Bar. Instalá-lo adiciona a interface de fila **Memory Books Jobs** para trabalhos ativos, concluídos, com falha, cancelados, bloqueados e que precisam de revisão.

### Instalação

1. Abra o SillyTavern.
2. Abra o painel principal **Extensions**.
3. Escolha **Install Extension**.
4. Instale o repositório oficial do Memory Books.
5. Recarregue o SillyTavern se solicitado.
6. Abra um chat com personagem ou grupo.
7. Aguarde alguns segundos para os controles do STMB inicializarem.

SillyTavern Extras não é necessário.

### Confirmar que o STMB carregou

Pelo menos um destes deve aparecer:

- **Memory Books** no menu Extensions da varinha mágica próximo à entrada do chat;
- chevrons de cena **►** e **◄** nas ações expandidas das mensagens.

Se nenhum aparecer:

1. aguarde até dez segundos;
2. atualize a página;
3. confirme que a extensão está instalada e ativada;
4. reabra um chat de personagem ou grupo;
5. só então inspecione o console do navegador.

---

## 5. Abrindo o Memory Books e entendendo o painel principal

Abra o menu Extensions da varinha mágica perto da entrada do chat e selecione **Memory Books**.

O painel pode incluir:

- Current Scene;
- Memory Status / mensagem processada mais alta;
- Current Lorebook Configuration;
- Memory Profiles;
- Profile Actions;
- Extra Function Buttons;
- Prompt Managers;
- General Settings;
- Automatic Memories;
- Token Saving;
- controles de personagem de grupo ou Narrator quando relevantes.

Para a primeira Memory, só três decisões são necessárias:

1. Qual Memory Book receberá a entrada?
2. Qual perfil/conexão vai gerá-la?
3. Quais mensagens do chat formam a cena?

---

## 6. Modos de armazenamento do Memory Book

### 6.1 Automatic Mode: Memory Book vinculado ao chat

Automatic Mode é o padrão normal. O STMB usa o lorebook vinculado ao chat atual pelo SillyTavern.

Use quando:

- um chat tem um Memory Book principal;
- prefere-se configuração mínima;
- personagens de grupo não precisam de Memory Books separados.

Se não houver lorebook vinculado, vincule um no SillyTavern ou use Auto-Create.

### 6.2 Auto-Create Lorebook Mode

Ative **Auto-create lorebook if none exists** para permitir que o STMB crie e vincule um lorebook quando uma Memory for salva pela primeira vez.

O template padrão de nome pode usar:

- `{{char}}` — nome do personagem ou grupo;
- `{{user}}` — nome do usuário;
- `{{chat}}` — ID/nome do chat.

O STMB adiciona sufixos numéricos quando necessário para evitar nomes duplicados.

Auto-Create e Manual Lorebook Mode são mutuamente exclusivos.

### 6.3 Manual Lorebook Mode

Ative **Manual Lorebook Mode** para escolher um Memory Book independentemente do lorebook vinculado ao chat.

Use quando:

- as memórias devem ficar em um lorebook dedicado;
- vários chats compartilham intencionalmente um Memory Book;
- membros do grupo precisam de books separados;
- Narrator Mode é usado;
- o usuário entende o plano de ativação resultante.

A seleção do Memory Book manual principal fica salva para o chat atual, a menos que um lock persistente de personagem a substitua em um chat solo compatível.

### 6.4 Memory Books separados geralmente são mais claros

Um Memory Book dedicado facilita:

- separar memórias de definições de personagens e lore de cenário;
- definir orçamento e ordem de lorebook independentes;
- reutilizar ou exportar histórico de memória;
- inspecionar entradas gerenciadas pelo STMB sem lore não relacionado;
- diagnosticar ativação.

É uma recomendação, não uma exigência.

### 6.5 Character Memory Book locks

Um character Memory Book lock é uma atribuição persistente de Manual Mode ligada a um card de personagem.

Em chat solo:

- um book manual desbloqueado pertence ao chat atual;
- um book bloqueado acompanha o card do personagem por chats Manual Mode compatíveis;
- o book manual não pode ser alterado até remover o lock.

Em chat de grupo real:

- uma atribuição por personagem desbloqueada pertence ao chat de grupo atual;
- uma atribuição bloqueada acompanha aquele card em grupos Manual Mode compatíveis;
- um book bloqueado ausente gera estado de lock quebrado, que precisa ser desbloqueado ou reparado.

Use locks somente quando o mesmo personagem deve compartilhar intencionalmente um Memory Book contínuo entre histórias. Eles são perigosos para universos alternativos ou timelines não relacionadas.

### 6.6 Layout inicial recomendado

- Chat solo: um Memory Book vinculado ao chat ou auto-criado.
- Chat de grupo real: um Memory Book de grupo.
- Chat Narrator: um Memory Book onisciente mais um book único por personagem declarado, conforme exigido pelo Narrator Mode.

---

## 7. Perfis, conexões e roteamento de geração

Um perfil Memory Books controla a geração e também as configurações da entrada de lorebook resultante.

### 7.1 Primeiro perfil recomendado

Use **Current SillyTavern Settings** primeiro. Ele usa provedor, modelo e temperatura atualmente ativos no SillyTavern.

Não comece reescrevendo prompts nem configurando um endpoint Full Manual. Primeiro prove que uma Memory pode ser gerada e salva.

### 7.2 Por que criar um perfil STMB salvo

Crie um perfil separado quando precisar:

- usar modelo mais barato ou confiável para memórias;
- usar provedor diferente do roleplay;
- vincular conexão Custom nomeada;
- escolher Summary Prompt personalizado;
- usar temperatura ou comportamento máximo de saída diferente;
- alterar formatação de título;
- alterar ativação, inserção, ordem ou recursão;
- usar prompts separados de grupo/onisciente e personagem.

### 7.3 Campos do perfil

Um perfil pode incluir:

- nome de exibição;
- API/provedor;
- ID do modelo;
- temperatura;
- preset Summary Prompt;
- prompts multi-personagem separados opcionais;
- comportamento de structured output;
- roteamento SillyTavern ChatCompletionService opcional;
- preset Chat Completion opcional;
- comportamento de reverse proxy;
- formato de título;
- modo de ativação: Normal, Constant ou Vectorized;
- posição de inserção, incluindo character, example-message, author’s-note e Outlet;
- nome do Outlet quando aplicável;
- valor de ordem automático ou manual;
- Prevent Recursion;
- Delay Until Recursion.

### 7.4 Conexões Custom OpenAI-compatible nomeadas

Um perfil Custom OpenAI-compatible pode:

- usar a conexão Custom do SillyTavern atualmente ativa; ou
- vincular uma conexão Custom nomeada do Connection Manager.

A conexão nomeada fornece URL e segredo salvos. O campo Model do perfil STMB continua sendo o override de modelo. Se a conexão nomeada for excluída ou deixar de ser Custom Chat Completion, o STMB bloqueia a solicitação em vez de rotear silenciosamente para outro lugar.

### 7.5 Fallback de structured output

**Skip structured output and use plain-text completion** impede o STMB de enviar schema structured-output a provedores que o rejeitam. O modelo ainda precisa retornar o JSON válido exigido pelo prompt Memory ou Consolidation selecionado.

### 7.6 ChatCompletionService

**Use ST’s ChatCompletionService** roteia solicitações compatíveis pelo helper de requisições do SillyTavern e pode aplicar um preset SillyTavern Chat Completion. Solicitações OpenRouter também herdam ordem de provedores, filtros de quantização, controles de fallback e configuração middle-out do SillyTavern. Esses controles continuam valendo se ChatCompletionService falhar e o STMB tentar novamente pelo caminho de fallback. Se essa tentativa também falhar, o STMB mantém e relata tanto o erro inicial quanto a resposta do provedor de fallback. Perfis Full Manual não usam esse caminho.

### 7.7 Reverse proxy e Full Manual Configuration

**Use reverse proxy** encaminha os detalhes de reverse proxy configurados no SillyTavern para provedores compatíveis.

**Full Manual Configuration** salva endpoint e chave separados dentro do perfil STMB. É um caminho excepcional. Prefira um provedor ou conexão Custom configurada e testada no SillyTavern sempre que possível.

### 7.8 Comprimento da saída

A configuração global STMB de máximo de tokens da resposta pode substituir o limite normal de Chat Completion para tarefas Memory Books. JSON cortado é causa comum de falha. Aumente o limite de saída antes de enfraquecer o schema ou prompt.

---

## 8. Cenas, Memories manuais, Memories automáticas e Catch-Up

### 8.1 O que é uma cena

Uma **cena** é o intervalo inclusivo de mensagens do chat que o STMB processa em uma Memory.

Limites úteis normalmente contêm uma unidade coerente:

- evento;
- conversa;
- etapa de investigação;
- desenvolvimento emocional ou de relacionamento;
- mudança de local ou objetivo;
- sequência de ações conectadas.

Intervalos triviais muito pequenos podem produzir pouco valor. Intervalos grandes custam mais, são mais difíceis de resumir, podem exceder o contexto e frequentemente juntam eventos não relacionados.

### 8.2 Marcar uma cena manualmente

1. Expanda as ações da mensagem, normalmente por três pontos ou controle semelhante.
2. Clique **►** na primeira mensagem incluída.
3. Clique **◄** na última mensagem incluída.
4. Abra Memory Books e confira início, fim, falantes, quantidade de mensagens e estimativa de tokens.

As duas mensagens de limite são incluídas.

Use **Clear Scene** para limpar a seleção ou outro marcador de início/fim para substituir um limite.

### 8.3 Criar uma Memory manual

1. Verifique a cena.
2. Verifique o Memory Book efetivo.
3. Verifique o perfil selecionado.
4. Clique **Create Memory**, ou use `/creatememory`.
5. Revise confirmação, aviso de tokens, confirmação de participantes ou previews quando aparecerem.
6. Aprove o resultado.
7. Confirme que existe nova entrada no lorebook e que Memory Status avançou até o final da cena.

Um resultado válido normalmente contém:

- título;
- conteúdo;
- palavras-chave;
- metadados STMB, incluindo intervalo de origem e identidade do chat.

### 8.4 Previews de Memory

Quando **Show memory previews** está ativado, revise e opcionalmente edite:

- título;
- conteúdo da memória;
- palavras-chave.

Confira nomes, atribuição, fatos, consequências omitidas e comentários irrelevantes. Sem previews, um resultado válido é salvo automaticamente.

### 8.5 Automatic Memories

Ative **Auto-create memory summaries** e configure:

- **Auto-Summary Interval** — quantidade de novas mensagens processadas por Memory automática;
- **Auto-Summary Buffer** — mensagens mais recentes deixadas de fora para não resumir uma cena ainda em desenvolvimento cedo demais.

Exemplo:

```text
Interval: 30
Buffer: 2
```

O STMB espera pelo menos 32 mensagens além do limite processado e cria uma Memory terminando duas mensagens antes da mais recente.

Se não houver baseline processado, o STMB atual usa `-1` e pode começar na mensagem 0. Uma primeira Memory manual continua recomendada para validar configuração e escolher um ponto inicial deliberado.

Intervalos menores geram Memories mais focadas e mais requisições. Intervalos maiores geram menos Memories, maiores, com risco maior de misturar assuntos. Ponto de partida prático: cerca de 20–40 mensagens para roleplay detalhado e 40–60 para trocas mais curtas.

A geração automática pode ser adiada se um Memory Book necessário ainda não estiver atribuído.

### 8.6 Baseline de mensagem processada

O STMB armazena a mensagem processada mais alta de cada chat. Ela determina:

- onde `/nextmemory` começa;
- onde Automatic Memories começam;
- indicador de limite de memória;
- quais mensagens contam como processadas.

Use:

- `/stmb-highest` para exibir;
- `/stmb-set-highest <N>` para definir manualmente;
- `/stmb-set-highest none` para limpar.

Mudanças manuais devem ser deliberadas, pois podem provocar intervalos pulados ou repetidos.

### 8.7 Catch-Up de um chat longo existente

Use:

```text
/stmb-catchup interval=<chunk size> start=<first message id> end=<last message id>
```

Exemplo:

```text
/stmb-catchup interval=40 start=0 end=245
```

O intervalo é inclusivo. Chunks são processados em sequência; o último pode ser menor.

Catch-Up é intencionalmente não interativo. Antes:

- selecione e teste o perfil desejado;
- ative **Always use default profile**;
- desative **Show memory previews**;
- garanta que o Memory Book efetivo exista, ou permita Auto-Create em Automatic Mode;
- repare todas as atribuições multi-personagem necessárias;
- escolha chunk abaixo do limite de aviso de tokens.

O STMB faz preflight de cada chunk, processa em ordem e para na primeira falha ou `/stmb-stop`. Chunks anteriores completos continuam salvos. Retome na primeira mensagem inacabada em vez de repetir tudo.

Use Catch-Up para conversão ampla. Limites manuais são melhores quando fronteiras literárias ou de evento importam.

---

## 9. Economia de tokens, mensagens ocultas e limite de memória

### 9.1 Ocultar não é excluir

Mensagens ocultas continuam no arquivo do chat. Elas são omitidas do contexto ativo até serem reveladas novamente.

### 9.2 Modos de Auto-Hide

**Auto-hide messages after adding memory** pode ser:

- Do not auto-hide;
- Auto-hide all messages up to the last Memory;
- Auto-hide only messages in the last Memory.

**Messages to leave unhidden** preserva pequena sobreposição recente perto do limite.

### 9.3 Unhide antes da geração

**Unhide hidden messages for memory generation** revela o intervalo selecionado antes de compilá-lo. Use ao regenerar ou reprocessar intervalos antes ocultos. O modo Auto-Hide escolhido determina o que será ocultado de novo após salvamento bem-sucedido.

### 9.4 Indicador de limite de Memory

O indicador usa a mensagem processada mais alta para mostrar onde termina o histórico processado e começa o chat não processado.

Modos:

- Off;
- divisor de limite;
- botão de salto arrastável;
- divisor mais botão.

O botão pula para a primeira mensagem não processada e lembra sua posição arrastada.

### 9.5 Boa configuração para aprender

Configuração inicial prática:

- mostrar divisor e botão;
- deixar duas mensagens visíveis;
- habilitar unhide temporário para geração;
- não usar Auto-Hide até confirmar que uma Memory foi salva corretamente;
- depois ocultar todas as mensagens processadas para o principal ganho de tokens.

---

## 10. Ativação e recuperação de lorebook

### 10.1 Palavras-chave

Memories normais costumam ser ativadas por palavras-chave. Boas palavras são concretas e distintas:

- nomes e aliases de personagens;
- locais ou organizações nomeados;
- objetos importantes;
- nomes de eventos;
- identificadores;
- descobertas ou ações específicas.

Palavras fracas como `important event`, `conversation` ou `secret` são amplas demais.

O conteúdo da Memory determina o que o modelo aprende. As keywords ajudam a determinar quando o SillyTavern a recupera.

### 10.2 Modos de ativação

- **Normal:** ativação por keyword/regra.
- **Constant:** sempre ativa, sujeita a orçamento e controles aplicáveis.
- **Vectorized:** usa recuperação vetorial quando a configuração suporta.

Vectors são opcionais. O STMB funciona por keywords sem a extensão Vectors.

### 10.3 Configurações globais World Info recomendadas

Pontos de partida comuns:

- Match Whole Words: off;
- Scan Depth: relativamente alto, como 8;
- Max Recursion Steps: aproximadamente 2;
- Context percentage: dimensionado para o contexto total e outros materiais.

São recomendações, não requisitos.

### 10.4 Delay Until Recursion

Se o Memory Book for a única fonte ativa de lorebook/World Info, deixe **Delay Until Recursion** desativado. Senão nenhuma entrada pode iniciar o primeiro ciclo e a Memory pode nunca ativar.

### 10.5 Diagnosticar recuperação

Quando a IA “não lembra”:

1. Confirme que a entrada existe.
2. Confirme que o Memory Book correto está ativo.
3. Confirme que a entrada está habilitada.
4. Confira keywords ou modo de ativação.
5. Confira orçamento.
6. Confira recursão.
7. Use inspeção de World Info ou log de requisição para confirmar se a entrada foi enviada.
8. Se foi enviada mas ignorada, o problema restante é comportamento do modelo ou contexto concorrente, não armazenamento STMB.

---

## 11. Modo de chat em grupo real

### 11.1 Definição

Group Chat Mode se aplica a um grupo real do SillyTavern com dois ou mais cards de personagens separados.

```text
SillyTavern Group
├── Alice character card
├── Bob character card
└── Clara character card
```

O SillyTavern registra qual card escreveu cada mensagem, então o STMB preserva atribuição e detecta participantes.

Não existe um botão separado de Group Chat Mode. Abra um chat de grupo e use STMB normalmente.

### 11.2 Detecção de participantes

Participante detectado normalmente é um card que escreveu pelo menos uma mensagem na cena selecionada.

O STMB não deduz da prosa toda pessoa fisicamente presente. Portanto:

- observador silencioso pode não ser detectado;
- personagem apenas mencionado não é participante;
- personagem ausente discutido pelo grupo não é selecionado;
- usuário não é alvo separado de Memory Book de personagem do grupo;
- identidades duplicadas ou incomuns podem precisar de correção.

Se a detecção não encontra personagens do grupo, o STMB abre confirmação mesmo com aceitação automática ativada. O aviso diz que a detecção falhou e exige revisão.

A pergunta significa: **A quais personagens do grupo esta Memory deve ser associada?** Não prova quem sabia cada fato nem quem estava fisicamente presente.

### 11.3 Um Memory Book de grupo

É o layout inicial recomendado.

Use Automatic Mode, Auto-Create ou book principal de Manual Mode. Cada cena produz uma entrada canônica no Memory Book de grupo. Quando nomes de participantes estão disponíveis, a entrada pode receber filtro inclusivo de personagem do SillyTavern.

Filtro inclusivo para Alice e Bob significa que a entrada pode ativar quando Alice **ou** Bob está ativo. Não cria personagem sintético “Alice e Bob” nem book de subconjunto.

Um group book é melhor quando:

- elenco compartilha principalmente uma história;
- um resumo onisciente/de grupo basta;
- prefere-se menos configuração e duplicatas;
- STLO não é necessário.

Uma única Memory de grupo ainda pode preservar conhecimento assimétrico:

> Alice encontrou o transmissor e o escondeu. Bob acreditava que a sala estava vazia.

### 11.4 Um group book mais books por personagem

O layout avançado usa:

- um Memory Book canônico de grupo;
- um Memory Book atribuído a cada membro.

Requisitos:

- Manual Lorebook Mode;
- SillyTavern-LorebookOrdering (STLO) instalado e ativado;
- atribuição válida para cada membro necessário.

O group book canônico não pode ser character book. Mais de um personagem pode compartilhar um character book; o STMB grava uma cópia nesse book compartilhado, não duplicatas.

Ao salvar uma Memory:

1. versão canônica vai para group book;
2. seleção de participantes é confirmada, salvo aceitação automática;
3. cópias vinculadas vão para books dos selecionados;
4. STMB faz rollback de gravações parciais quando possível se uma gravação exigida falhar.

Selecionar nenhum participante aplica a Memory a todos os membros atuais.

### 11.5 Prompts separados de grupo e personagem

Por padrão, a mesma Memory orientada ao grupo é copiada aos books de participantes.

Um perfil pode ativar **Use separate group and character prompts in group chats**. Então:

- Group Summary Prompt escreve a versão canônica de grupo;
- Character Summary Prompt escreve versão individual para cada book de personagem.

Versões focadas no personagem preservam:

- conhecimento privado;
- crenças erradas;
- reações emocionais pessoais;
- prioridades específicas;
- o que importou a um participante.

Isso exige requisições extras. Character book compartilhado recebe uma cópia compartilhada.

### 11.6 Responsabilidades do STLO

Memory Books decide:

- intervalo da cena;
- participantes;
- conteúdo do resumo;
- books que recebem cópias;
- uso de prompts individualizados.

STLO decide:

- quando lorebook está ativo;
- qual personagem pode ativá-lo;
- prioridade, posição, orçamento e ordem.

Ao atribuir character book, o STMB adiciona basename do avatar a `stlo.characterOverrides` e ativa `stlo.onlyWhenSpeaking`, preservando prioridades, budgets e overrides existentes.

STMB faz apenas merge. Limpar ou mudar atribuição não remove automaticamente override antigo. Remova overrides obsoletos manualmente no STLO.

### 11.7 Filtros e books não são controles de privacidade

Books e filtros separados melhoram relevância. Não garantem que:

- um personagem nunca receba informação de outro;
- o modelo nunca veja versão canônica do grupo;
- contexto de Previous Memories seja perfeitamente particionado por conhecimento;
- character book represente apenas conhecimento consciente.

Use como roteamento de contexto, não segurança.

### 11.8 Cópias vinculadas não são sincronizadas ao vivo

Entradas vinculadas compartilham metadados para reconhecer o mesmo evento original, mas edições posteriores são independentes.

Editar, excluir ou compactar uma cópia não altera as outras automaticamente. Regenerar uma cópia de personagem também muda só ela. Ao regenerar entrada canônica do grupo, porém, o STMB pergunta se deve regenerar só ela ou todas as character entries vinculadas. Cada entrada recebe sua própria geração e aprovação, mantendo prompts focados.

### 11.9 Adicionar, remover ou reatribuir membros

Adicionar:

- atribua book válido antes da próxima Memory distribuída;
- Memories antigas não são copiadas retroativamente;
- filtros antigos não são reescritos;
- forneça contexto histórico manualmente se necessário.

Remover:

- entradas existentes permanecem;
- filtros e overrides antigos permanecem;
- cópias vinculadas não são excluídas automaticamente.

Alterar book:

- muda roteamento futuro;
- pode não remover o personagem dos overrides do book antigo.

### 11.10 Consolidation de grupo

O group book canônico usa prompt automático de análise de group-chat consolidation que busca cronologia onisciente distinguindo eventos objetivos e conhecimento individual.

Character books usam preset escolhido no popup. Books podem ter números diferentes de fontes elegíveis. Um book sem material suficiente pode ser pulado com aviso enquanto os prontos continuam.

Cena ausente em character book é uma lacuna cronológica. Não prova ausência, ignorância ou inconsciência. Book compartilhado recebe uma entrada consolidada.

---

## 12. Narrator Mode

### 12.1 Definição

Narrator Mode é para um chat normal 1:1 do SillyTavern onde um único card Narrator escreve vários personagens fictícios.

```text
Normal SillyTavern Chat
└── Narrator card
    ├── writes Alice
    ├── writes Bob
    └── writes Clara
```

Sem Narrator Mode, o SillyTavern vê todas as respostas de IA como escritas pelo Narrator. O modo fornece elenco manual para o STMB associar cenas e Memory Books aos personagens fictícios dentro da prosa.

Narrator Mode não está disponível em grupo real.

### 12.2 Layout exigido

Narrator Mode requer:

- Manual Lorebook Mode;
- um **Memory Book onisciente/canônico** selecionado;
- um Memory Book único para cada membro declarado do elenco.

Regras:

- membro não pode usar book onisciente;
- dois membros não podem compartilhar o mesmo book;
- todo membro precisa de book disponível;
- membros aposentados mantêm identidade e reserva do book até restauração ou outra remoção da implementação;
- Auto-Create é incompatível por depender de Manual Lorebook Mode.

Diferente do layout avançado de grupo real, Narrator Mode não exige STLO para recuperação por personagem ativo. O STMB injeta os books do elenco ativo no contexto de lorebook durante geração.

### 12.3 Configuração

1. Abra o chat normal do card Narrator.
2. Ative Manual Lorebook Mode.
3. Selecione o main manual book; ele é o onisciente.
4. Ative **Narrator Mode**.
5. Abra **Manage Narrator Cast**.
6. Adicione cada personagem e atribua book único.
7. Use o drawer flutuante **Active Cast** para selecionar quem está presente na próxima troca.

Narrator Mode deve ser desativado antes de desativar Manual Lorebook Mode.

### 12.4 Active Cast e metadados de timeline

O drawer Active Cast pode expandir, recolher, mover e selecionar membros atuais.

Na geração, o STMB captura o elenco ativo e salva em metadata:

- mensagem do usuário recebe snapshot ativo;
- resposta Narrator recebe snapshot da geração;
- continuation mescla elenco com metadata existente;
- metadata de swipe é separada por swipe;
- selecionar swipe pode restaurar elenco daquele ponto;
- excluir mensagens recentes pode restaurar estado da última mensagem Narrator marcada restante.

O marcador registra associação, não análise semântica da prosa.

### 12.5 Recuperação durante geração Narrator normal

Ao iniciar geração Narrator, o STMB carrega os Memory Books do elenco ativo e mescla entradas na coleção character-lore da requisição, evitando pares world/UID duplicados.

Consequências:

- apenas books do Active Cast entram por este fluxo;
- book onisciente segue ativação/configuração normal de Manual Mode;
- filtros STLO por personagem não são exigidos;
- seleção do elenco deve estar correta antes de gerar.

### 12.6 Detecção de participantes da cena

Para cena selecionada, respostas Narrator marcadas são autoritativas. O STMB combina IDs de elenco salvos nessas mensagens.

Se houver mensagens Narrator antigas sem tags, o STMB usa informação de continuidade de todas as mensagens e pede confirmação do elenco. Membros ativos vêm pré-selecionados. Seleção vazia significa nenhum membro individual presente.

Cenas totalmente marcadas não precisam dessa confirmação.

### 12.7 Distribuição da Memory

Uma Narrator Scene Memory é gravada como:

- entrada onisciente canônica no main Memory Book;
- cópia vinculada no book único de cada participante selecionado.

Cópias Narrator não usam filtros nativos de personagem do SillyTavern. O STMB salva IDs de participante e owner Narrator em metadata.

Se prompts separados estão desativados, participant books recebem cópias do resumo onisciente. Se ativados, cada book individual pode receber geração focada.

### 12.8 Narrator Consolidation e Regeneration

Metadata de ownership e participant é carregada pelas fontes de Consolidation. Assim entradas superiores retêm qual book possui uma cópia e quais membros participaram do material.

Regeneration usa metadata para determinar se o alvo é onisciente/de grupo ou focado em personagem.

Como nas cópias de grupo real, entradas vinculadas não ficam sincronizadas ao vivo.

### 12.9 Aposentar membros do elenco

O cast manager pode marcar membro como retired e restaurá-lo depois. Retired members:

- saem das opções Active Cast;
- saem do conjunto de IDs ativos;
- mantêm identidade/histórico estáveis;
- mantêm reserva do book, evitando reutilização acidental que misturaria identidades.

Use retirement quando personagem sai do elenco ativo, mas sua identidade histórica de Memory deve permanecer intacta.

---

## 13. Ramificações de chat

Branches nativas do SillyTavern podem virar continuidades diferentes. Se branch e parent escreverem nos mesmos Memory Books desbloqueados, timelines contraditórias podem se misturar.

**Copy Memory Books when branching** é ativado por padrão.

### 13.1 O que é copiado

Ao reconhecer nova branch nativa:

- Automatic Mode copia Memory Book ativo vinculado;
- Manual Mode copia main manual Memory Book;
- grupo real Manual copia cada character Memory Book único desbloqueado;
- Narrator Mode copia book onisciente e cada character book declarado;
- locks persistentes de personagens reais são preservados, não copiados, pois lock significa “continue usando este mesmo book”.

Todos os books copiados numa operação usam o mesmo número de lineage:

```text
Group Memories Branch 1
Alice Memories Branch 1
Bob Memories Branch 1
```

Branch de uma branch existente mantém a raiz original em vez de `Branch 1 Branch 1`.

### 13.2 Metadados reescritos

Nas cópias, o STMB:

- troca IDs do chat pai pelo ID da nova branch;
- redireciona links canônicos group/character quando ambos os books foram copiados;
- atualiza bindings da branch para as cópias.

Ele clona conteúdo; não regenera Memories.

### 13.3 Segurança em falhas

Não troque de chat durante a cópia.

Se falhar, o STMB limpa bindings graváveis herdados da nova branch e registra falha para impedir escrita silenciosa nos originais.

### 13.4 Desativando cópias

Desative somente se a branch deve intencionalmente compartilhar os mesmos Memory Books e histórico contínuo do parent.

---

## 14. Clips

Um Clip salva texto selecionado diretamente em uma entrada `[STMB Clip]` de lorebook. Não chama IA.

### 14.1 Use Clips para

- preferência;
- promessa ou segredo;
- nome ou alias;
- item ou pet;
- fato curto de relacionamento;
- linha que deve ser preservada quase exatamente;
- nota rápida que não justifica Scene Memory.

### 14.2 Fluxo

1. Destaque texto em mensagem.
2. Clique no botão flutuante de tesoura.
3. Escolha Clip existente ou crie novo.
4. Para nova entrada, escolha always-active ou keyword-triggered.
5. Revise entrada atual e preview atualizado.
6. Renomeie se necessário.
7. Salve.

Botão só aparece após selecionar texto e pode ser desativado no painel principal.

### 14.3 Formato

Título:

```text
Seraphina Healed Me [STMB Clip]
```

Conteúdo:

```markdown
=== Seraphina Healed Me ===

- Seraphina curou os ferimentos do usuário com magia.

=== END Seraphina Healed Me ===
```

Uma entrada Clip possui uma seção. Títulos focados favorecem keywords focadas.

### 14.4 Entradas existentes

Uma entrada pode virar Clip adicionando `[STMB Clip]` ao fim do título. Clips longos podem ser editados ou compactados.

Clips salvam apenas texto escolhido. Não adicionam atribuição de fonte automaticamente.

---

## 15. Topical Clips

Topical Clip lê entradas confirmadas de STMB Memory, um intervalo explícito de mensagens do chat atual, ou ambos, e pede à IA uma entrada focada sobre um tópico. Fontes elegíveis podem incluir Scene Memories e resumos consolidados; Clips e Side Prompts são excluídos como fontes.

### 15.1 Use quando

Informação sobre um tema está espalhada por várias Memories:

- NPC recorrente;
- histórico de relacionamento;
- local ou facção;
- investigação/mistério;
- poderes, ferimentos, promessas, preferências ou segredos;
- objeto importante;
- trama não resolvida.

Topical Clip organiza por assunto, não pela cronologia de todas as fontes.

### 15.2 Restrições de fonte

Usa:

- Memories STMB confirmadas do book selecionado, incluindo resumos consolidados elegíveis;
- mensagens visíveis de intervalo inclusivo `X-Y` explicitamente selecionado.

**Include saved Memories** e **Include chat messages** podem ser separados ou juntos. Ranges seguem configuração global de unhide e restauram mensagens antes ocultas depois da compilação.

Não usa:

- mensagens fora do range;
- Clips comuns;
- Side Prompts;
- lorebook entries comuns não relacionadas.

### 15.3 Criar Topical Clip

1. Abra Memory Books.
2. Clique **Topical Clip**.
3. Escolha Source Memory Book.
4. Digite tópico.
5. Digite keywords, ou deixe vazio para usar tópico.
6. Escolha nova entrada ou target `[STMB Clip]` existente.
7. Escolha Memories salvas, mensagens ou ambos.
8. Opcionalmente selecione Memories específicas e/ou range exato.
9. Escolha profile.
10. Gere draft.
11. Revise/edite.
12. Salve só quando correto.

Draft nunca é salvo automaticamente.

### 15.4 Atualizar Topical Clip existente

Depois de execução bem-sucedida, o STMB registra Memories usadas e, quando aplicável, chat, range, IDs e hashes. Atualização baseada em Memories normalmente envia apenas fontes novas ou alteradas junto com conteúdo existente. Ranges são sempre explícitos.

Use **Rebuild from all source memories** quando:

- entrada atual está incompleta/desorganizada;
- prompt mudou;
- Memories antigas foram muito editadas;
- tema inteiro deve ser reconsiderado.

### 15.5 Seleção manual e avisos de token

Use **Use only selected memories** quando book é grande, tema cobre período limitado, nomes se sobrepõem ou controle de evidência é necessário.

STMB estima tamanho e avisa quando threshold excede. Reduza fontes, aumente threshold deliberadamente ou execute uma vez mesmo assim.

### 15.6 Padrão de revisão

Confira se draft:

- fica no tópico;
- preserva nomes/relacionamentos;
- inclui fatos principais;
- identifica contradições;
- não inventa explicações não apoiadas;
- mescla atualizações sem duplicação.

### 15.7 Placeholders

Prompt personalizado deve incluir `{{SOURCE_MEMORIES}}` quando Memories são usadas e `{{SOURCE_MESSAGES}}` quando mensagens são usadas.

```text
{{SOURCE_MEMORIES}}
{{SOURCE_MESSAGES}}
```

Placeholders suportados:

```text
{{MODE}}
{{TOPIC}}
{{KEYWORDS}}
{{EXISTING_CLIP}}
{{EXISTING_ENTRY_CONTENT}}
{{SOURCE_MEMORIES}}
{{SOURCE_MESSAGES}}
```

Use Reset to Default se prompt personalizado piorar.

---

## 16. Side Prompts

Side Prompt é um prompt nomeado do STMB executado separadamente da resposta normal do personagem. Geralmente cria ou atualiza uma entrada contínua de suporte, não outra Scene Memory sequencial.

Na lista **Trackers & Side Prompts**, o ícone de energia altera imediatamente o flag **Enabled** do prompt: verde = ativado, apagado = desativado. Não altera triggers configurados.

### 16.1 Usos apropriados

- trackers de trama e fios não resolvidos;
- estado de relacionamentos;
- estado de NPC/facção;
- inventário e recursos;
- ferimentos, estatísticas, reputação;
- timelines, datas, prazos e viagens;
- pistas, suspeitos e contradições;
- invenções, pesquisas e projetos;
- relatórios de risco de continuidade;
- resumos de estado do mundo.

Evite prompts vagos “rastreie tudo”, resumos duplicados ou tarefas que precisam aparecer na próxima resposta de RP.

### 16.2 Formato de saída

Normalmente espera texto final ou Markdown pronto para salvar. Não exige JSON de Memory. JSON só se o usuário quiser armazená-lo como texto de tracker.

### 16.3 Sequência de execução

Normalmente monta:

1. instruções Side Prompt;
2. entrada anterior do tracker;
3. Previous Memories opcionais;
4. Additional Context opcional;
5. texto de cena selecionado/since-last;
6. Response Format opcional.

Entrada anterior é estado para revisar, não prova de que tudo ainda vale. Prompts devem remover explicitamente informações obsoletas, resolvidas, contraditas ou duplicadas.

### 16.4 Execuções manuais

```text
/sideprompt "Prompt Name"
/sideprompt "Prompt Name" 10-20
/sideprompt "Relationship Tracker" {{npc name}}="Alice" 10-20
```

Nomes com espaços devem estar entre aspas. Range é inclusivo.

Ideal para análise focada e macros runtime.

### 16.5 Execuções automáticas após Memory

Um Side Prompt pode ativar **Run automatically after memory**.

O chat usa um destes modos:

- prompts ativados individualmente;
- um Side Prompt Set selecionado.

Set selecionado substitui prompts individuais; não soma.

#### Side Prompt Memory Assistance

**Memory Assistance** é reservado, com quatro modos independentes. Executa após Memories salvas, independentemente de enablement comum ou set selecionado. Não roda em Memory Regeneration.

Compara cena bruta com Clips comuns e Topical Clips em cada Memory Book que recebeu a Memory. Envia título/tópico, keywords, conteúdo, ID estável e tipo de cada Clip revisado.

Com Job Queue, cada book recebe job **Memory Assistance** separado. Erros de requisição, validação, save ou aplicação marcam o job **Failed**. A Memory permanece **Completed**; retry não a regenera.

- **Off** desativa.
- **Update** revisa até cinco Clips diretamente; mais de cinco abre seleção. Mudanças aguardam aprovação.
- **Update and Suggest** primeiro descobre tópicos, depois revisa existing Clips.
- **Automatic** revisa todos os Clips em batches por tokens; aplica adições válidas a Clips comuns e deixa substituições Topical para aprovação em **Memory Assistance Suggestions**.

- Update/Update and Suggest têm **Query Selected** e **Query All**.
- Query All e Automatic fazem batching por tokens.
- Cada Clip comum recebe no máximo um trecho exato proposto.
- Topical Clips recebem drafts completos de substituição.
- Resposta é objeto JSON simples mapeando UID para sugestão; `{}` significa nenhuma atualização.
- Resultados Update vão para `Memory Assistance (STMB SidePrompt)` e ficam sem aplicar até aprovação.
- Automatic registra adições aplicadas e mantém Topical replacements/falhas para revisão.
- Cancelar seleção limpa sugestões antigas.

Update and Suggest usa prompt suggestion-only antes da revisão. Request contém cena e lista leve de títulos/tópicos/keywords de Topical Clips, sem Clips comuns ou corpos existentes. IA retorna zero a cinco tópicos como objetos JSON; `{"topics":[]}` é válido.

Sugestões ficam no relatório. Em **Memory Assistance Suggestions**, **Review Topics** mostra linhas marcadas/editáveis. Desmarque, edite ou adicione tópicos. Confirmados abrem fluxo Topical Clip um a um. Tópico pendente só some após o Topical Clip ser salvo; fechar draft mantém disponível.

Quando há sugestões, STMB abre popup. **Dismiss** fecha; **Go to Suggestions** abre sugestões com book selecionado. Abrir pelo menu seleciona primeiro o Memory Book efetivo do chat.

Prompts Update/Topic Suggestions e override de profile são editáveis; contratos estruturados são fixos. Memory Assistance não pode ser excluído, duplicado, incluído em set ou executado manualmente.

### 16.6 Intervalos automáticos de mensagens visíveis

Side Prompt pode habilitar **Run on visible message interval** e definir mensagens visíveis desde checkpoint.

Mensagens ocultas e system não contam.

Com set ativo, só linhas cujos prompts têm trigger apropriado são candidatas.

### 16.7 Side Prompt Sets

Side Prompt Set é lista ordenada de execuções, não pasta. Mesmo template pode aparecer várias vezes com macros diferentes.

Exemplo:

1. Relationship Tracker — Alice
2. Relationship Tracker — Bob
3. Plot Tracker
4. Cleanup Report

Linhas podem armazenar prompt, label opcional, macros, ordem e ações de duplicar/excluir.

Executam de cima para baixo.

```text
/sideprompt-set "Set Name"
/sideprompt-set "Set Name" 10-20
/sideprompt-macroset "Relationship Pass" {{npc_1}}="Alice" {{npc_2}}="Bob" 10-20
```

### 16.8 Sets padrão e seleção por chat

General Settings define:

- set padrão solo;
- set padrão grupo.

Cada chat pode herdar, usar prompts individuais ou escolher set nomeado.

Default global vazio = modo individual.

Se set selecionado for excluído, STMB avisa; não substitui silenciosamente. Prompt ausente ou macro não resolvida pula linha com aviso.

Set escolhe candidatas; cada prompt ainda precisa trigger automático relevante. Comandos manuais não precisam desses checkboxes.

### 16.9 Macros

Pode usar macros SillyTavern:

```text
{{user}}
{{char}}
```

Placeholders `{{...}}` não padrão são runtime macros, fornecidas manualmente ou em linha do set.

```text
{{npc name}}
{{faction}}
{{project_name}}
```

Prompt com macro não resolvida não pode rodar automaticamente.

### 16.10 Macros de contagem

| Macro | Contagem |
|---|---|
| `{{memtier0}}` | Scene Memories |
| `{{memtier1}}` | Arcs |
| `{{memtier2}}` | Chapters |
| `{{memtier3}}` | Books |
| `{{memtier4}}` | Legends |
| `{{memtier5}}` | Series |
| `{{memtier6}}` | Epics |
| `{{memclips}}` | Clips |
| `{{memside}}` | Side Prompts |

Book efetivo = chat-bound em Automatic Mode ou main manual resolvido em Manual Mode. Em grupo/Narrator multi-book não soma character books.

Macro retorna número, não conteúdo.

### 16.11 Intervalos de mensagens

Range explícito usa exatamente o intervalo inclusivo. Sem range, usa since-last checkpoint/cap.

Use ranges para debug, limpeza focada ou rerun conhecido.

### 16.12 Additional Context e Previous Memories

Pode incluir até sete Scene Memories anteriores.

Additional Context pode ser none, **Follow chat** ou fixed named Context Setting.

São referência; não copiar cegamente no tracker.

### 16.13 Targets de lorebook

Normalmente salva no Memory Book efetivo. Pode usar:

1. override per-chat;
2. target do template;
3. book efetivo como fallback.

Override válido ganha.

Use target alternativo deliberadamente; não espalhe trackers sem plano de recuperação.

### 16.14 Controles da entrada

Template pode configurar:

- title override;
- keywords;
- Normal/Constant/Vectorized;
- posição e Outlet;
- order;
- Prevent Recursion;
- Delay Until Recursion;
- Ignore Budget.

Title/keywords podem expandir macros. **Ignore Budget** com cautela.

### 16.15 Override de connection profile

Pode herdar resolução normal ou fixar perfil STMB. Útil para modelo mais barato ou estruturado; combinações demais complicam debug.

### 16.16 Regeneration de Side Prompt

Saves compatíveis armazenam snapshot compacto:

- template key;
- conteúdo anterior;
- source chat/range;
- runtime macros.

No lorebook editor, clique **Regenerate side prompt**. Usa snapshot com template/profile/context atuais.

Falha se template foi excluído, source indisponível ou target/source mudou durante geração. Só conteúdo é substituído; título, keywords e settings permanecem.

### 16.17 Escrevendo bons Side Prompts

Defina:

- tarefa exata;
- fontes;
- revisar/substituir/mesclar/anexar;
- estado obsoleto a remover;
- headings/ordem estáveis;
- limite de tamanho;
- output final apenas.

Exemplo:

```text
Atualize o tracker de relacionamento a partir da cena fornecida. Preserve fatos atuais, incorpore novos desenvolvimentos nas seções existentes e remova detalhes resolvidos, contraditos, obsoletos ou duplicados. Mantenha cada relacionamento em 1–3 bullets concisos. Retorne somente o tracker atualizado.
```

Guardas úteis:

```text
Não adicione nova seção sem informação realmente nova.
Remova fios resolvidos e especulação obsoleta.
Retorne apenas o relatório atualizado; sem prefácio ou explicação.
Mantenha toda a saída abaixo de 300 palavras.
```

### 16.18 Troubleshooting de Side Prompt

Se não rodou:

- evento realmente ocorreu;
- seleção individual/set;
- prompt existe;
- trigger habilitado;
- macros resolvidas;
- `/stmb-stop` ou falha cancelou.

Se rodou duas vezes:

- manual + automático;
- rows duplicadas;
- copies duplicadas;
- múltiplas abas/chats.

Book errado: verifique target per-chat e template.

Saída cresce: regras explícitas de replace, pruning, item-count e word-count.

---

## 17. Consolidation

Consolidation combina Memories ou summaries inferiores em recaps cronológicos superiores.

### 17.1 Tiers

```text
Scene Memory → Arc → Chapter → Book → Legend → Series → Epic
```

Usa entradas STMB existentes, não chat bruto.

### 17.2 Objetivo

Use quando:

- Scene Memories acumulam;
- material antigo não precisa detalhe completo;
- fase de relacionamento/trama/campanha terminou;
- quer reduzir tokens mantendo continuidade;
- quer cronologia superior mais limpa.

Entradas consolidadas enfatizam mudanças duradouras, viradas, objetivos, consequências, mudanças relacionais, fios não resolvidos e estado estável.

### 17.3 Fluxo manual

1. Abra **Consolidate Memories**.
2. Escolha target tier.
3. Selecione fontes elegíveis.
4. Escolha prompt/profile.
5. Decida se fontes serão desabilitadas após sucesso.
6. Execute/revise.
7. Aprove resumos.

### 17.4 Readiness prompt não é automático

**Prompt for consolidation when a tier is ready** monitora tiers. Ao atingir mínimo, mostra yes/later. Yes abre interface, não consolida silenciosamente.

### 17.5 Schema

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

Pode retornar um ou vários resumos. `member_ids` atribui fontes; outliers vão em `unassigned_items`.

### 17.6 Previous higher-tier summary

Pode ser canon context, não fonte para reescrever. Prompt deve distinguir.

### 17.7 Previews e respostas falhas

Previews permitem editar, aceitar, regenerar candidato ou batch pendente.

Respostas malformadas podem ser inspecionadas e, quando suportado, corrigidas manualmente.

### 17.8 Desabilitar fontes

Se ativado, fontes são desabilitadas após sucesso para o resumo superior assumir retrieval. Reversível.

### 17.9 Bons prompts

Definem compression target, quantidade mínima coerente de recaps, cronologia/grupamento, detalhes obrigatórios, outliers e schema exato.

Preservam beats, consequências, promessas, mudanças relacionais, identificadores, fios e keywords; removem repetição de cena.

---

## 18. Compaction

Compaction pede à IA para encurtar uma entrada STMB e mostra original/draft antes de substituir.

### 18.1 Elegíveis

- `[STMB Clip]`;
- Side Prompt;
- STMB Memory.

Entradas comuns não STMB não aparecem.

### 18.2 Fluxo

1. Abra **Compaction**.
2. Escolha Memory Book.
3. Escolha Compaction Profile.
4. Opcionalmente edite prompt.
5. Escolha entrada.
6. Compare original e compacto.
7. Edite draft.
8. Substitua, copie ou cancele.

Original só muda após **Replace with Compacted Version**.

### 18.3 Bons usos

- Clips longos;
- tracker repetido/obsoleto;
- Scene Memories verbosas;
- always-active entries caras.

Não serve para adicionar fatos, resumir chat bruto, criar Memory ou processar lorebook comum.

### 18.4 Placeholders

```text
{{ENTRY_CONTENT}}  required current content
{{ENTRY_KIND}}     Clip, SidePrompt, or Memory
{{ENTRY_TITLE}}    entry title
```

Preserve fatos, nomes, pronomes, macros, wrappers e end markers; remova redundância.

---

## 19. Regeneration

Regeneration cria uma substituição revisável para uma entrada existente. Não cria uma segunda entrada numerada e nunca sobrescreve sem aprovação.

### 19.1 Regeneration de Scene Memory

- abra o source chat;
- abra o Memory Book no editor de lorebook;
- clique **Regenerate memory**;
- para entrada canônica de grupo com character entries vinculadas, escolha só a clicada ou todas;
- escolha profile atual, prompt, quantidade de Previous Memories e Additional Context;
- revise título, conteúdo e keywords de cada entrada.

Range original e sequence number são mantidos. Entradas vinculadas reutilizam as mesmas opções, mas são geradas contra seu próprio contexto e target group/character. O STMB coleta todas as aprovações antes de salvar regenerações diretas. Se todas as source messages estiverem ocultas, revele-as ou habilite unhide-before-generation.

### 19.2 Regeneration de Consolidation

Resumo superior é regenerado das fontes inferiores exatas usando **Regenerate Consolidation**.

O conjunto completo de fontes deve existir no tier correto. Fonte inferior não pode ser regenerada enquanto parent summary ativo depende dela; exclua parent primeiro quando reconstruir deliberadamente.

### 19.3 Regeneration de Side Prompt

Veja Section 16.16.

### 19.4 Verificações de segurança

Antes de substituir, o STMB verifica:

- target entry não mudou;
- source chat range não mudou;
- fontes de Consolidation estão disponíveis e inalteradas;
- entrada continua elegível.

Se falhar, nada é sobrescrito.

Cópias vinculadas group/character/Narrator continuam independentes.

---

## 20. Contexto para geração

Várias fontes de contexto podem aparecer numa request STMB. Não são equivalentes.

### 20.1 Cena atual

Intervalo sendo processado agora. É o material-alvo de uma Scene Memory comum.

### 20.2 Previous Memories

Scene Memories anteriores do Memory Book efetivo, incluídas como contexto de continuidade somente leitura. Normalmente 0–7.

Não devem ser resumidas de novo só por aparecerem antes da cena atual.

### 20.3 Additional Context

Lorebook entries selecionadas como referência estável:

- regras de personagem/cenário;
- nomes/terminologia canônicos;
- restrições de campanha;
- timeline autoritativa;
- referências de locais;
- fatos presumidos mas não repetidos na cena.

Aparece antes de Previous Memories e transcrição. É referência, não outra cena.

### 20.4 Context Settings

Context Setting é coleção ordenada reutilizável de Additional Context.

1. Abra **Context Settings**.
2. Crie setting nomeado.
3. Selecione entradas.
4. Ordene.
5. Escolha para o chat ou **No Context**.

Seleção fica por chat e funciona com Current SillyTavern Settings e perfis salvos.

Se book/entry sumir, STMB avisa, pula e continua. Se setting inteiro for excluído, chats continuam sem Additional Context até nova seleção.

Pode duplicar/importar/exportar como `stmb-context-settings.json`.

### 20.5 Entrada anterior de Side Prompt

Texto atual do tracker para revisar. É estado, não prova de que tudo ainda é válido.

### 20.6 Fontes de Consolidation

Entradas lower-tier que são o material real a agrupar/comprimir.

### 20.7 Previous higher-tier summary

Canon levado adiante; não é fonte para reescrever.

### 20.8 Ordem correta por workflow

Ordinary Memory:

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

Prompts devem distinguir alvo e referência.

---

## 21. Arquitetura de prompts, Summary Prompts integrados e regras de autoria

O STMB tem três sistemas principais de geração estruturada mais fluxos auxiliares.

### 21.1 Geração de Memory comum

Espera:

```json
{
  "title": "Short scene title",
  "content": "The memory text",
  "keywords": ["keyword1", "keyword2"]
}
```

Regras:

- só objeto JSON;
- chaves exatas `title`, `content`, `keywords`;
- `keywords` array de strings;
- título curto;
- termos concretos;
- Markdown dentro de `content`;
- aspas escapadas corretamente.

O STMB pode reparar fences, trailing commas, think tags, wrappers ou pequenas malformações, mas prompt não deve depender disso.

Prompt forte define estilo/compressão, fatos a preservar, material a omitir e schema exato.

Prompt fraco define estilo sem estrutura, pede análise, mistura contexto anterior com cena ou usa keywords abstratas.

### 21.2 Built-in Summary Prompts

Usados somente para Ordinary Memory. Não controlam Consolidation, Side Prompts, Topical Clips ou Compaction. Perfil escolhe em **Memory Creation Method**. **Summary** é fallback/default.

Não existe melhor universal:

- **Melhor início geral: Summary.** Equilibrado.
- **Continuidade longa: Comprehensive.** Mais forte em causalidade/continuidade/keywords, mais exigente.
- **Economia de tokens: Minimal.** Curto, perde nuance.
- **Books separados de grupo/Narrator: Group + Character.** Prompts de targeting.

| Prompt | Melhor para | Trade-off |
|---|---|---|
| **Summary** | Maioria dos chats solo e setup inicial. Prosa cronológica detalhada com eventos, interações, revelações, resultados e keywords concretas. | Mais detalhe que o mínimo, mas simples. |
| **Comprehensive** | Histórias longas sensíveis à continuidade, causalidade, dinâmica, fatos, fios e keywords. | Instruções longas; exige bom modelo/tokens. |
| **Summarize** | Registro Markdown escaneável em Timeline, Story Beats, Key Interactions, Notable Details e Outcome. | Muito bullet, possível repetição. |
| **Synopsis** | Preservar quase todos os beats importantes. | Longo; ruim para orçamento apertado. |
| **Sum Up** | Registro narrativo cronológico com heading/timeline e menos seções. | Menor separação explícita de categorias. |
| **Minimal** | Alto volume ou orçamento muito baixo; 2–5 frases. | Perde motivos, emoção, causalidade e detalhes menores. |
| **Northgate** | Registro literário em terceira pessoa/passado, ações, emoção e diálogo. Estilo comunitário de Northgate no Discord SillyTavern. | Prioriza leitura; não exclui OOC explicitamente. |
| **Aelemar** | Grandes cenas e momentos emocionais como registro autônomo. Estilo de Aelemar no Discord. | Pelo menos 300 palavras; detalhado; não exclui OOC explicitamente. |
| **Group** | Book compartilhado/onisciente, preservando atribuição correta. | Não usar como Memory individual. |
| **Character** | Book focado em um personagem, seu conhecimento, ações, sentimentos, erros e efeitos. | Omite material irrelevante e restringe private knowledge sem suporte. |

Em instalação nova, use **Summary** até geração e retrieval funcionarem. Depois mude só prompt e compare cenas semelhantes. **Comprehensive** para omissões; **Minimal** para tamanho. Prompt não corrige modelo ruim, truncamento, limites ruins ou retrieval mal configurado.

Built-ins podem ser recriados na locale atual. Faça backup de customizações.

### 21.3 Targeting multi-personagem

Com prompts separados, STMB marca target:

- `group` para real-group canônico ou Narrator onisciente;
- `character` para versão individual.

Prompt deve usar perspectiva correta sem inventar conhecimento.

### 21.4 Autoria de Side Prompt

Normalmente retorna texto/Markdown. Escreva como manutenção:

- uma tarefa estreita;
- como usar tracker anterior;
- remover estado antigo;
- headings/limite;
- só tracker final.

### 21.5 Autoria de Consolidation

Exige schema 17.5. Bom prompt preserva cronologia, cria número mínimo coerente, atribui via `member_ids`, deixa sobras em `unassigned_items`, preserva mudanças e usa keywords concretas.

**Regenerate Consolidation** é só substituição.

### 21.6 Autoria Topical Clip

Deve incluir `{{SOURCE_MEMORIES}}`, focar no tópico, distinguir evidência/inferência, mesclar com conteúdo existente e mostrar contradições.

### 21.7 Autoria Compaction

Deve incluir `{{ENTRY_CONTENT}}`, encurtar sem inventar e preservar wrappers/macros.

### 21.8 Checklist

1. Qual é o alvo?
2. Qual é só referência?
3. JSON estrito ou texto final?
4. O que precisa sobreviver?
5. O que omitir, mesclar, carregar ou deixar unassigned?

Formato correto vem antes de estilo.

---

## 22. Summary Prompt Manager e Consolidation Prompt Manager

### Summary Prompt Manager

Cria, edita, duplica, exclui, importa e exporta presets de Ordinary Memory. Atribua via perfil.

Todos devem preservar schema JSON.

### Consolidation Prompt Manager

Controla prompts para níveis superiores e default normal.

Preset regeneration-only não pode ser default comum.

### Import e localização

Built-ins podem ser recriados na locale atual. Faça backup de alterações.

---

## 23. Integração com Regex

Duas etapas:

1. **Outgoing/User Input:** transforma prompt montado antes de enviar.
2. **Incoming/AI Output:** limpa resposta antes de parse/save.

Ative **Use regex (advanced)** → **Configure regex** → scripts por direção.

Importante: seleção STMB controla execução. Script pode rodar mesmo desativado na UI normal de Regex.

Use só quando entender. Regra outgoing pode quebrar schema; incoming pode quebrar JSON válido.

---

## 24. Títulos de entradas de lorebook e política de caracteres

### 24.1 Placeholders

- `{{title}}` — título IA;
- `{{scene}}` — range;
- `{{char}}` — personagem/grupo;
- `{{user}}` — usuário;
- `{{messages}}` — contagem;
- `{{profile}}` — perfil;
- placeholders de data/hora.

### 24.2 Numeração

```text
[0] [00] (0) {0} #0
#[000] ([000]) {[000]}
```

Números sequenciais zero-padded.

### 24.3 Unicode

Todo Unicode imprimível é permitido em títulos, inclusive emoji, acentos, CJK e símbolos. Controles U+0000–U+001F e U+007F–U+009F são removidos.

Filenames de Auto-Create são sanitizados separadamente.

---

## 25. Fila de tarefas e controles de repetição

Fila opcional exige Chat Top Bar. Quando disponível, Regeneration de Memory/Consolidation/Side Prompt cria job e substituição aguarda review.

**Memory Books Jobs** mostra:

- queued;
- active;
- completed;
- failed;
- canceled;
- blocked;
- Needs Review.

Jobs com range mostram números. Drawer cancela, reabre review, inspeciona falhas, retry e remove histórico terminal.

- **Retry:** um job não-Memory.
- **Retry All:** Memory e Side Prompts pós-Memory; se Memory já salva, pode retomar sem duplicar.
- **Retry Memory:** só Memory, pulando Side Prompts.

Sem Chat Top Bar, workflows funcionam sem UI de fila.

---

## 26. Feedback visual e acessibilidade

Estados visuais incluem inactive, selected, valid range, in-scene e processing; cores dependem do tema.

Acessibilidade:

- teclado;
- foco;
- ARIA;
- reduced-motion;
- controles mobile.

Ao ensinar por screenshot, descreva ícone/rótulo, não cor específica.

---

## 27. Mapa de configurações e referência atual

Esta seção localiza controles persistentes e importantes. Campos temporários de Clip/Topical/Compaction ficam nas seções correspondentes.

Caminho comum:

**menu Extensions da varinha → Memory Books**

Escopos:

- **Global**
- **Per chat**
- **Per character**
- **Per profile/template/setting**
- **Per run**

### 27.1 Painel principal

| Setting | Local | Escopo | O que faz |
|---|---|---|---|
| **Enable Manual Lorebook Mode** | Current Lorebook Configuration | Modo global; book per chat | Deixa de usar chat-bound book e exige seleção manual. Incompatível com Auto-Create. |
| **Selected manual Memory Book** | controles manuais | Per chat | Main book; no Narrator é onisciente. |
| **Group-character Memory Book assignments** | rows de grupo | Per chat | Book separado por membro; STLO exigido. |
| **Character Memory Book lock** | ícone lock | Per character | Mantém atribuição entre chats compatíveis. |
| **Narrator Mode** | configuração atual | Per chat | Main manual vira onisciente e habilita elenco com books únicos. |
| **Manage Narrator Cast** | Narrator/Active Cast | Per chat | Adiciona, aposenta, restaura e atribui books. |
| **Auto-create lorebook if none exists** | configuração atual | Global | Cria e vincula book em Automatic Mode. |
| **Lorebook Name Template** | abaixo de Auto-Create | Global | `{{char}}`, `{{user}}`, `{{chat}}`. |
| **Memory profile selection** | Memory Profiles | Per run | Perfil da próxima Memory; não muda default sozinho. |
| **Set as Default** | Profile Actions | Global | Define default. |
| **Memory Title Format** | Profiles/Edit | Per profile | Formata títulos/numeração. |

### 27.2 General Settings

| Setting | Escopo | O que faz |
|---|---|---|
| **Always use default profile (no confirmation prompt)** | Global | Pula confirmação; exigido para Catch-Up não interativo. |
| **Automatically accept detected participants in future** | Global | Aceita participantes detectados. |
| **Show memory previews** | Global | Review editável. |
| **Show consolidation previews** | Global | Review de Consolidation. |
| **Show notifications** | Global | Toasts. |
| **Show floating Clip button when text is highlighted** | Global | Tesoura flutuante. |
| **Memory boundary indicator** | Global | Divider/jump button. |
| **Allow scene overlap** | Global | Permite overlap com Memories existentes. |
| **Refresh lorebook editor after adding memories** | Global | Atualiza editor aberto. |
| **Copy Memory Books when branching** | Global | Copia books desbloqueados em branch; locked continuam compartilhados. |
| **Default for solo chats** | Global | Set padrão solo. |
| **Default for group chats** | Global | Set padrão grupo. |
| **Max Response Tokens** | Global | Override de saída; `0` = fallback normal. |
| **Token Warning Threshold** | Global | Aviso de tamanho, não muda contexto do modelo. |
| **Default Previous Memories Count** | Global | 0–7 anteriores. |
| **Use regex (advanced)** | Global | Ativa seleção Regex STMB. |
| **Configure regex… → Outgoing scripts** | Global | Pré-envio. |
| **Configure regex… → Incoming scripts** | Global | Pré-parse/save. |

#### Token Saving

| Setting | Escopo | O que faz |
|---|---|---|
| **Auto-hide messages after adding memory** | Global | Nenhum, tudo processado ou só último range. |
| **Messages to leave unhidden** | Global | Sobreposição recente; `0` oculta até fim aplicável. |
| **Unhide hidden messages for memory generation** | Global | Equivalente `/unhide X-Y` antes de compilar. |

### 27.3 Automatic Memories

| Setting | Escopo | O que faz |
|---|---|---|
| **Auto-create memory summaries** | Global | Criação automática; pode começar em 0 sem baseline. |
| **Auto-Summary Interval** | Global | Cadência. |
| **Auto-Summary Buffer** | Global | Deixa mensagens novas de fora. |
| **Prompt for consolidation when a tier is ready** | Global | Pergunta quando tier está pronto. |
| **Auto-Consolidation Tiers** | Global | Tiers monitorados. |

### 27.4 Editor de perfil

| Setting | O que faz |
|---|---|
| **Profile Name** | Nome reutilizável. |
| **API/Provider** | Current ST, provider, Custom ou Full Manual. |
| **Use this connection profile** | Conexão Custom ativa/nomeada; Model STMB segue override. |
| **Skip structured output and use plain-text completion** | Não envia schema; ainda exige JSON. |
| **Use ST's ChatCompletionService** | Usa helper ST; não Full Manual. |
| **Chat Completion Preset** | Preset ST opcional. |
| **Model** | ID exato. |
| **Temperature** | Aleatoriedade. |
| **Use reverse proxy** | Passa proxy ST. |
| **API Endpoint URL / API Key** | Só Full Manual. |
| **Memory Creation Method** | Summary Prompt. |
| **Use separate group and character prompts in group chats** | Prompts separados. |
| **Group Summary Prompt / Character Summary Prompt** | Seleciona presets. |
| **Memory Title Format** | Títulos. |
| **Activation Mode** | Normal/Constant/Vectorized. |
| **Insertion Position** | Character, Example, Author's Note, Outlet. |
| **Outlet Name** | Nome Outlet. |
| **Insertion Order** | Auto/Manual/Reverse. |
| **Prevent Recursion** | Impede trigger de outras entries. |
| **Delay Until Recursion** | Não ativa no primeiro scan. |
| **Also include** | Compatibilidade legacy; atual usa Context Settings. |

### 27.5 Context Settings

| Setting | Escopo | O que faz |
|---|---|---|
| **Additional Context for this chat** | Per chat | Setting, No Context ou unset. |
| **Context Setting Name** | Per setting | Nome. |
| **Additional Context entries and order** | Per setting | Entradas e ordem. |

New/Duplicate/Delete/Import/Export gerenciam objetos.

### 27.6 Trackers & Side Prompts

| Setting | Local/escopo | O que faz |
|---|---|---|
| **After-memory side prompt mode for this chat** | Main/per chat | Default, individuais ou set. |
| **How many concurrent prompts to run at once** | Main/global | 1–10 jobs. |
| **Side Prompt Set Name** | Set | Nome. |
| **Side Prompt / Row Label / Macro Values** | Row | Template, label, macros, ordem. |
| **Enabled** | Template | Elegibilidade individual. |
| **Run on visible message interval / Interval** | Template | Trigger de intervalo. |
| **Run automatically after memory** | Template | Trigger pós-Memory. |
| **Allow manual run via `/sideprompt`** | Template | Manual. |
| **Prompt / Response Format** | Template | Instrução/saída. |
| **Previous memories for context** | Template | 0–7. |
| **Use additional context / Additional Context Source** | Template | Follow chat/fixed. |
| **Lorebook Target** | Template/chat | Target de save. |
| **Lorebook Entry Title Override / Keywords** | Template | Título/keywords. |
| **Activation Mode / Insertion Position / Outlet Name** | Template | Ativação/posição. |
| **Insertion Order / Order Value** | Template | Ordem. |
| **Prevent Recursion / Delay Until Recursion / Ignore Budget** | Template | Flags. |
| **Override default memory profile / Connection Profile** | Template | Perfil específico. |
| **Memory Assistance Mode** | Built-in/global | Off/Update/Update and Suggest/Automatic. |
| **Update Prompt / Topic Suggestions Prompt** | Built-in | Duas tarefas IA. |
| **Use a connection profile override** | Built-in | Override. |

### 27.7 Prompt Managers

| Setting | Local | Escopo | O que faz |
|---|---|---|---|
| **Summary Prompt name and prompt text** | Summary Prompt Manager | Per preset | Prompt de Ordinary Memory. |
| **Default consolidation prompt** | Consolidation Prompt Manager | Global | Default normal. |
| **Consolidation Prompt name and prompt text** | Manager | Per preset | Instruções reutilizáveis. |

### 27.8 Defaults Topical Clip/Compaction

| Setting | Local | Escopo | O que faz |
|---|---|---|---|
| **Generation Profile / Compaction Profile** | interfaces | Shared global | Perfil compartilhado. |
| **Topical Clip Prompt** | Edit | Global | Prompt custom; valida macros. |
| **Compaction Prompt** | Edit | Global | Prompt custom; exige `{{ENTRY_CONTENT}}`. |

### 27.9 Consolidate Memories

| Setting | Escopo | O que faz |
|---|---|---|
| **Target tier** | Per run | Tier a criar. |
| **Consolidation Prompt** | Per run | Prompt deste run. |
| **Maximum entries per pass** | Per run | Limite por análise. |
| **Token Budget** | Per run | Orçamento de input. |
| **Number of automatic summary attempts** | Per run | Tentativas. |
| **Saved minimum eligible entries** | Global per tier | Prontidão. |
| **Activation Mode / Insertion Position / Outlet / Insertion Order / Recursion Settings** | Global | Defaults de entradas consolidadas. |
| **Disable selected source entries after creating summaries** | Per run | Desabilita, não exclui. |
| **Selected source entries** | Per run | Fontes processadas. |

### 27.10 World Info do SillyTavern

| Setting | O que faz |
|---|---|
| **Match Whole Words** | Matching de keyword; off comum. |
| **Scan Depth** | Profundidade, como 8. |
| **Max Recursion Steps** | Recursão, ~2. |
| **Context percentage / lorebook budget** | Limite de contexto para lorebooks. |

Recomendações, não requisitos.

---

## 28. Referência de comandos slash

### Memory

```text
/creatememory
```

Cria da cena marcada.

```text
/scenememory X-Y
```

Define range inclusivo e cria, ex. `/scenememory 10-15`.

```text
/nextmemory
```

Da mensagem após highest processed até final elegível.

```text
/stmb-catchup interval=x start=y end=z
```

Processa chat longo em chunks.

### Side Prompt

```text
/sideprompt "Name" {{macro}}="value" [X-Y]
/sideprompt-set "Set Name" [X-Y]
/sideprompt-macroset "Set Name" {{macro}}="value" [X-Y]
/sideprompt-on "Name" | all
/sideprompt-off "Name" | all
```

### Limite processado

```text
/stmb-highest
/stmb-set-highest <N|none>
```

### Emergência

```text
/stmb-stop
```

Para toda geração STMB, incluindo Side Prompts. Trabalho já salvo permanece.

---

## 29. Solução de problemas por estágio

### 29.1 UI não carregou

- menu ausente;
- chevrons ausentes;
- Clip button ausente.

Cheque instalação/enable, reload, chat aberto, espere 10s, expanda ações, só então console.

### 29.2 Sem cena

Ambos **►** e **◄** são necessários. Confira Current Scene. Se overlap, altere range ou habilite Allow Scene Overlap.

### 29.3 Sem Memory Book válido

Automatic: vincule ou Auto-Create.

Manual: selecione main book, repare seleção excluída, desbloqueie lock quebrado.

Multi-book group: STLO, atribuições válidas, group book não pode ser character book.

Narrator: Manual ativo, onisciente selecionado, book único por membro.

### 29.4 IA não gera Memory válida

Ordem:

1. provider/model/profile;
2. não truncada;
3. tokens suficientes;
4. prompt exige JSON;
5. Regex não corrompeu;
6. provider suporta modo;
7. Skip Structured Output só se schema rejeitado;
8. modelo mais obediente antes de reescrever prompt;
9. **Raw response from AI** e correção manual quando disponível.

Comuns: fences, comentários, chave faltante, keywords não array, refusal, cut-off.

### 29.5 Memory salva, mensagens sumiram

Auto-Hide. Mensagens não foram excluídas.

### 29.6 Automatic Memories não rodaram

Cheque enable, mensagens suficientes, interval+buffer, postpone, book válido, jobs, troca de chat, geração de grupo concluída.

Primeira manual recomendada, não exigida.

### 29.7 Memory não ativa

Book, enabled, keywords, activation, budget, recursion, STLO, logs. Não regenere antes de testar retrieval.

### 29.8 Enviada mas ignorada

Problema de uso do modelo: encurte/torne explícita, melhore posição, reduza contexto, OOC reminder ou modelo melhor.

### 29.9 Side Prompt não rodou

Veja 16.18; set selecionado suprime individuais fora dele.

### 29.10 Consolidation não perguntou

Readiness, tier, fontes, eligibility, minimum.

### 29.11 Regeneration desativada

Possíveis: metadata antiga, source indisponível, fontes faltantes/tier errado, parent ativo, sequence desconhecida, template excluído.

### 29.12 Branch não copiou

Setting ativo antes, branch nativa, books carregáveis, não trocou chat, branch não processada, locked books preservados.

### 29.13 Narrator cast errado

Active Cast, continuation, swipe, legacy tags, retired, books existentes.

---

## 30. FAQ

### Preciso de vectors?

Não. Keywords bastam. Vectors opcionais.

### Memory deve usar lorebook separado?

Geralmente sim para organização/budget/reuse/diagnóstico, mas não obrigatório.

### STMB exclui mensagens?

Não. Pode ocultá-las do contexto.

### Posso usar totalmente manual?

Sim.

### Automatic Memories podem criar a primeira?

Sim. Sem baseline começa em 0 quando interval+buffer é alcançado. Manual inicial continua recomendada.

### Consolidation roda automaticamente?

Não. Pode avisar, mas usuário confirma/revisa.

### Grupo real pode usar um Memory Book?

Sim, recomendado e sem STLO.

### Quando usar books separados?

Quando conhecimento/continuidade/retrieval individual justifica complexidade.

### Narrator Mode é Group Chat Mode?

Não. Group usa cards separados; Narrator declara personagens escritos por um card.

### Narrator precisa STLO?

Não para Active Cast. Precisa Manual Mode, onisciente e books únicos.

### Cópias vinculadas sincronizam?

Não.

### Por que Delay Until Recursion normalmente off?

Sem outra entrada iniciando recursão, Memory atrasada pode nunca ativar.

### Depois da primeira Memory?

Teste retrieval, ative automático, interval/buffer, hide, depois Clips/Side Prompts conforme necessidade; Topical/Consolidation quando houver material.

---

## 31. Compatibilidade, migração e notas históricas atuais

### Baseline atual

- Release documentada: v8.5.0, 1 de agosto de 2026.
- SillyTavern: 1.14.0 ou mais recente.
- Narrator Mode: v8.5.0.
- Branch copying, Side Prompt Regeneration e locks: v8.4.0.
- Multi-character group: v8.0.0.
- Additional Context passou de profiles para Context Settings em v7.0.0.
- Topical Clip: v6.10.0.
- Compaction/Clips: v6.6.0.
- Side Prompt Sets/targets: v6.4–v6.5.
- Consolidation multi-tier: v6.0.0.
- Job Queue: v6.8.0, opcional.
- Defaults atuais: Delay Until Recursion desativado salvo override.

### Memories antigas

Só entradas com flag `stmemorybooks` e metadata exigida são reconhecidas. Use converter para entradas antigas.

### Funcionalidade removida

Bookmark antigo foi removido em v4.0.0. Não ensine como atual.

### Built-ins localizados

Podem ser regenerados conforme idioma ativo. Faça backup.

### Import

Import de Side Prompt é aditivo; conflitos de key são renomeados, não sobrescritos.

---

## 32. Notas de desenvolvimento e licença

Memory Books usa Bun para bundling/minification.

```sh
bun run build
```

Hook:

```sh
bun run install-hooks
```

Constrói antes de commit, adiciona artefatos e aborta se falhar.

Copyright © 2024–2026 Aiko Hanasaki, GNU Affero General Public License v3.0. Versões modificadas devem preservar avisos, identificar modificações e cumprir disponibilidade de fonte AGPL.

---

## 33. Árvore compacta de diagnóstico

```text
“Memory Books não funciona.”
│
├─ Menu/controle visível?
│  ├─ Não → instalação/carregamento/UI.
│  └─ Sim
│
├─ Cena pode ser selecionada?
│  ├─ Não → ações, ambos chevrons, overlap.
│  └─ Sim
│
├─ Memory Book efetivo válido?
│  ├─ Não → vincular, auto-create, manual ou reparar multi-book.
│  └─ Sim
│
├─ Geração válida/completa?
│  ├─ Não → perfil, provedor, tokens, JSON, Regex, modelo.
│  └─ Sim
│
├─ Entrada existe no book?
│  ├─ Não → save/rollback/permissão/job.
│  └─ Sim
│
├─ SillyTavern ativa/envia?
│  ├─ Não → keywords, activation, binding, budget, recursion, STLO.
│  └─ Sim
│
└─ Modelo usa a entrada?
   ├─ Não → compliance, placement, competing context, clareza.
   └─ Sim → workflow funcionando.
```

---

## 34. Sequência mínima de ensino recomendada

1. Abra menu da varinha e Memory Books.
2. Automatic Mode com book vinculado ou Auto-Create.
3. Current SillyTavern Settings.
4. Marque cena curta com **►**/**◄**.
5. Crie/preview uma Memory.
6. Abra book e confirme entrada.
7. Verifique ativação.
8. Ative Automatic Memories e interval/buffer.
9. Auto-Hide só depois de explicar que não exclui.
10. Introduza Clips, depois Side Prompts, depois Topical/Consolidation conforme necessidade.

Não comece por custom prompts, Full Manual, multi-books, Regex ou Consolidation sem necessidade real.

---

## 35. Resumo final dos conceitos

Memory Books é pipeline externo de continuidade sobre lorebooks SillyTavern:

```text
Selecionar/agendar material
→ gerar representação estruturada
→ salvar com metadata de retrieval
→ opcionalmente ocultar transcrição processada
→ SillyTavern recuperar entradas relevantes depois
```

Funciona melhor quando:

- cenas são coerentes;
- prompts distinguem alvo/referência;
- JSON segue schemas;
- keywords são concretas;
- books são atribuídos/ativados deliberadamente;
- trackers removem estado obsoleto;
- Consolidation reduz detalhe sem apagar continuidade;
- usuários verificam retrieval em vez de presumir saved = sent;
- multi-book avançado só quando precisão vale complexidade.
