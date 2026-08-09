<!--
Copyright (C) 2024–2026 Aiko Hanasaki
SPDX-License-Identifier: AGPL-3.0-only
-->

# 📕 Memory Books (uma extensão do SillyTavern)

Uma extensão de última geração para o SillyTavern, voltada à criação automática, estruturada e confiável de memórias. Marque cenas no chat, gere resumos em JSON com IA e armazene-os como entradas nos seus lorebooks. Oferece suporte a chats em grupo, gerenciamento avançado de perfis, prompts laterais/rastreadores e consolidação de memórias em várias camadas.

### ❓ Vocabulário
- Cena → Memória  
- Um fato salvo → Clip  
- Rastreador contínuo → Prompt Lateral  
- Muitas Memórias → Resumo / Consolidação  
- Uma entrada longa → Compactação

### Clips vs. Prompts Laterais

<details>
<summary><strong>Clips vs. Prompts Laterais</strong></summary>

| **Clips** | **Prompts Laterais** |
|---|---|
| Salvam o texto selecionado do chat em uma entrada do Livro de Memória. | Pedem à IA para revisar o chat e atualizar uma entrada de rastreador. |
| São mais adequados para um fato, frase, promessa, preferência, item ou anotação bem definidos. | São mais adequados para informações que mudam ao longo do tempo. |
| Pense: “fixe esta anotação.” | Pense: “mantenha esta seção atualizada.” |

</details>

Para uma explicação mais longa, consulte o [Guia do Usuário](USER_GUIDE.md#-clips-vs-side-prompts).

### Compactação vs. Consolidação

<details>
<summary><strong>Compactação vs. Consolidação</strong></summary>

| **Compactação** | **Consolidação** |
|---|---|
| Encurta uma entrada existente gerenciada pelo STMB. | Combina várias memórias ou resumos em uma recapitulação de nível superior. |
| Use quando uma entrada de Clip, Prompt Lateral ou Memória for útil, mas estiver ficando longa demais. | Use quando várias memórias estiverem prontas para se tornar um Arco, Capítulo, Livro ou outro resumo maior. |
| Pense: “reduza esta entrada.” | Pense: “agrupe estas memórias em uma recapitulação.” |

</details>

Para uma explicação mais longa, consulte o [Guia do Usuário](USER_GUIDE.md#-compaction-vs-consolidation).

<a id="-read-me-first"></a>
## ❗ Leia Isto Primeiro!

Comece por aqui: 
* ⚠️‼️Leia os [pré-requisitos](#-prerequisites) para ver as observações de instalação, principalmente se você usa uma API de Text Completion.
* 📽️ [Vídeo de Início Rápido](https://youtu.be/mG2eRH_EhHs) — somente em inglês (desculpe, é o idioma em que tenho maior fluência).
* ❓ [Perguntas Frequentes](#FAQ)
* 🛠️ [Solução de Problemas](#Troubleshooting)

Outros links: 
* 📘 [Guia do Usuário (EN)](USER_GUIDE.md)
* 📋 [Histórico de Versões e Changelog](changelog.md)
* 💡 [Como usar 📕 Memory Books com 📚 Lorebook Ordering](https://github.com/aikohanasaki/SillyTavern-LorebookOrdering/blob/main/guides/STMB%20and%20STLO%20-%20English.md)

> Observação: há suporte a vários idiomas; consulte a pasta [`/locales`](locales) para ver a lista. Readmes e Guias do Usuário internacionais/localizados podem ser encontrados na pasta [`/userguides`](userguides). 
> O conversor de lorebooks e a biblioteca de modelos de Prompts Laterais ficam na pasta [`/resources`](resources).

<a id="-table-of-contents"></a>
## 📑 Índice

- [Pré-requisitos](#-prerequisites)
  - [Dicas para usar 📕 ST Memory Books com KoboldCpp](#koboldcpp-tips-to-using--st-memory-books)
  - [Dicas para usar 📕 ST Memory Books com Llama.cpp](#llamacpp-tips-to-using--st-memory-books)
- [Configurações Globais Recomendadas de Ativação de World Info/Lorebook](#-recommended-global-world-infolorebook-activation-settings)
- [Primeiros Passos](#-getting-started)
  - [1. Instalar e Carregar](#1-install--load)
  - [2. Marcar uma Cena](#2-mark-a-scene)
  - [3. Criar uma Memória](#3-create-a-memory)
- [Tipos de Memória: Cenas vs. Resumos](#-memory-types-scenes-vs-summaries)
  - [Memórias de Cena (Padrão)](#-scene-memories-default)
  - [Consolidação de Resumos](#-summary-consolidation)
- [Geração de Memória](#-memory-generation)
  - [Saída Somente em JSON](#json-only-output)
  - [Predefinições Integradas](#built-in-presets)
  - [Prompts Personalizados](#custom-prompts)
- [Integração com Lorebooks](#-lorebook-integration)
- [Clip para Livro de Memória](#-clip-to-memory-book)
- [Clip Temático](#-topical-clip)
- [Comandos de Barra](#-slash-commands)
- [Suporte a Chats em Grupo](#-group-chat-support)
- [Modos de Operação](#-modes-of-operation)
  - [Modo Automático (Padrão)](#automatic-mode-default)
  - [Modo de Criação Automática de Lorebook](#auto-create-lorebook-mode)
  - [Modo Manual de Lorebook](#manual-lorebook-mode)
- [Rastreadores e Prompts Laterais](#-trackers--side-prompts)
- [Compactação](#-compaction)
- [Integração com Regex para Personalização Avançada](#-regex-integration-for-advanced-customization)
- [Gerenciamento de Perfis](#-profile-management)
- [Configurações](#-settings--configuration)
  - [Configurações Globais](#global-settings)
  - [Campos do Perfil](#profile-fields)
- [Formatação de Títulos](#-title-formatting)
- [Memórias de Contexto](#-context-memories)
- [Fila Opcional de Tarefas](#-optional-job-queue-chat-top-bar-required)
- [Feedback Visual e Acessibilidade](#-visual-feedback--accessibility)
- [Perguntas Frequentes](#faq)
  - [Devo criar um lorebook separado para as memórias ou posso usar o mesmo lorebook que já uso para outras coisas?](#should-i-make-a-separate-lorebook-for-memories-or-can-i-use-the-same-lorebook-im-already-using-for-other-things)
  - [Preciso usar vetores?](#do-i-need-to-run-vectors)
  - [Devo usar “Delay until recursion” se o Memory Books for meu único lorebook?](#should-i-use-delay-until-recursion-if-memory-books-is-the-only-lorebook)
- [Solução de Problemas](#troubleshooting)
- [Potencialize com o Lorebook Ordering (STLO)](#-power-up-with-lorebook-ordering-stlo)
- [Política de Caracteres](#-character-policy-v451)
- [Para Desenvolvedores](#-for-developers)
  - [Compilando a Extensão](#building-the-extension)
  - [Hooks do Git](#git-hooks)

---

<a id="-prerequisites"></a>
## 📋 Pré-requisitos

- **SillyTavern:** 1.14.0 ou superior (recomenda-se a versão mais recente).
- **Fila Opcional de Tarefas:** o STMB funciona sem a fila de tarefas. Para usar o enfileiramento, instale e ative a **Chat Top Bar** / **Chat Top Info Bar**, a extensão oficial do SillyTavern que adiciona uma barra ao topo da janela do chat. O STMB usa essa barra para exibir o botão de Tarefas dos Livros de Memória e o painel da fila.
- **Suporte a Chat Completion:** suporte completo a OpenAI, Claude, Anthropic, OpenRouter e outras APIs de chat completion.
- **Suporte a Text Completion:** APIs de text completion (Kobold, TextGen etc.) são compatíveis quando conectadas por meio de um endpoint de API de Chat Completion compatível com OpenAI. Recomendo configurar uma conexão de API de Chat Completion conforme as dicas para KoboldCpp abaixo, adaptando-as conforme necessário para Ollama ou outro software. Depois disso, configure um perfil do STMB e use Personalizado (recomendado) ou a configuração totalmente manual (somente se Personalizado falhar ou se você tiver mais de uma conexão personalizada).
**OBSERVAÇÃO**: se você usa Text Completion, precisa ter uma predefinição de chat completion!

<a id="koboldcpp-tips-to-using--st-memory-books"></a>
### Dicas para usar 📕 ST Memory Books com KoboldCpp
Configure o seguinte no ST (você pode voltar para Text Completion DEPOIS de fazer o STMB funcionar):
- API de Chat Completion
- Fonte personalizada de chat completion
- endpoint `http://localhost:5001/v1` (você também pode usar `127.0.0.1:5000/v1`)
- digite qualquer coisa em “custom API key” (o valor não importa, mas o ST exige um)
- o ID do modelo deve ser `koboldcpp/modelname` (não inclua `.gguf` no nome do modelo!)
- baixe uma predefinição de chat completion e importe-a (qualquer uma serve), apenas para que você TENHA uma predefinição de chat completion. Isso evita erros de “not supported”.
- altere o comprimento máximo da resposta na predefinição de chat completion para pelo menos 2048; recomenda-se 4096. Valores menores aumentam o risco de a resposta ser cortada.

<a id="llamacpp-tips-to-using--st-memory-books"></a>
### Dicas para usar 📕 ST Memory Books com Llama.cpp
Assim como no Kobold, configure o seguinte como uma _API de Chat Completion_ no ST (você pode voltar para Chat Completion depois de verificar que o STMB está funcionando):
- Crie um novo perfil de conexão para uma API de Chat Completion.
- Fonte de Completion: `Custom (Open-AI Compatible)`
- URL do endpoint: `http://host.docker.internal:8080/v1` se estiver executando o ST no Docker; caso contrário, `http://localhost:8080/v1`
- Chave de API personalizada: digite qualquer coisa (o ST exige uma)
- ID do modelo: `llama2-7b-chat.gguf` (ou o seu modelo; isso não importa se você não estiver executando mais de um no llama.cpp)
- Pós-processamento do prompt: nenhum

Para iniciar o Llama.cpp, recomendo colocar algo semelhante ao seguinte em um script de shell ou arquivo `.bat`, para facilitar a inicialização:
```sh
llama-server -m <model-path> -c <context-size> --port 8080
```

<a id="-recommended-global-world-infolorebook-activation-settings"></a>
## 💡 Configurações Globais Recomendadas de Ativação de World Info/Lorebook

- **Match Whole Words:** deixe desmarcado (false)
- **Scan Depth:** quanto maior, melhor (o meu está definido como 8)
- **Max Recursion Steps:** 2 (recomendação geral, não obrigatória)
- **Context %:** 80% (com base em uma janela de contexto de 100.000 tokens) — pressupõe que você não tenha um histórico de chat ou bots extremamente pesados.
- Observação adicional: se o lorebook de memória for seu único lorebook, certifique-se de que “Delay until recursion” esteja desativado no perfil do STMB; caso contrário, as memórias não serão acionadas!

---

<a id="-getting-started"></a>
## 🚀 Primeiros Passos

<a id="1-install--load"></a>
### 1. **Instalar e Carregar**
- Abra o SillyTavern e selecione um personagem ou chat em grupo.
- Aguarde os botões de divisa (► ◄) aparecerem nas mensagens do chat; isso pode levar até 10 segundos.

![Aguarde estes botões](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/startup.png)

<a id="2-mark-a-scene"></a>
### 2. **Marcar uma Cena**
- Clique em ► na primeira mensagem da cena.
- Clique em ◄ na última mensagem.

Abaixo estão alguns exemplos da aparência dos botões de divisa depois de clicados. As cores podem variar de acordo com seu tema CSS!

![Botão de início selecionado](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/button-start.png)

![Botões no meio da cena](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/button-middle.png)

![Botão de fim selecionado](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/button-end.png)

<a id="3-create-a-memory"></a>
### 3. **Criar uma Memória**
- Abra o menu Extensões (a varinha mágica 🪄) e clique em “Livros de Memória”, ou use o comando de barra `/creatememory`.
- Confirme as configurações (perfil, contexto, API/modelo), caso solicitado.
- Aguarde a geração pela IA e a criação automática da entrada no lorebook.

---

<a id="-memory-types-scenes-vs-summaries"></a>
## 🧩 Tipos de Memória: Cenas vs. Resumos

📕 Memory Books oferece suporte a **memórias de cena** e à **consolidação de resumos em várias camadas**, cada uma destinada a um tipo diferente de continuidade.

<a id="-scene-memories-default"></a>
### 🎬 Memórias de Cena (Padrão)
As memórias de cena registram **o que aconteceu** em um intervalo específico de mensagens.

- Baseiam-se em uma seleção explícita de cena (► ◄)
- São ideais para recordação momento a momento
- Preservam diálogos, ações e resultados imediatos
- Funcionam melhor quando usadas com frequência

Este é o tipo de memória padrão e mais usado.

---

<a id="-summary-consolidation"></a>
### 🌈 Consolidação de Resumos

![Botão Consolidar](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/button-consolidate.png)

A consolidação de resumos registra **o que mudou ao longo do tempo** em várias memórias ou resumos.

Em vez de resumir uma única cena, os resumos consolidados se concentram em:
- Desenvolvimento de personagens e mudanças nos relacionamentos
- Objetivos, tensões e resoluções de longo prazo
- Trajetória emocional e direção narrativa
- Mudanças persistentes de estado que devem permanecer estáveis

A primeira camada de consolidação é o **Arco**, criado a partir de memórias de cena. Camadas superiores também são compatíveis com histórias mais longas:
- Arco
- Capítulo
- Livro
- Lenda
- Série
- Épico

> 💡 Pense neles como *recapitulações*, não como registros de cenas.

#### Quando Usar Resumos Consolidados
- Após uma grande mudança em um relacionamento
- Ao final de um capítulo ou arco da história
- Quando motivações, confiança ou dinâmicas de poder mudarem
- Antes de iniciar uma nova fase da história

#### Como Funciona
- Resumos consolidados são gerados a partir de memórias/resumos existentes do STMB, não diretamente do chat bruto.
- A ferramenta **Consolidar Memórias** permite escolher a camada de resumo de destino e selecionar as entradas de origem.
- O STMB pode monitorar opcionalmente as camadas de resumo selecionadas e exibir uma confirmação “sim/mais tarde” quando uma camada atingir a contagem mínima salva de entradas elegíveis.
- O STMB pode desativar as entradas de origem após a consolidação, caso você queira que o resumo de nível superior assuma seu lugar.
- Respostas de resumo da IA que falharem podem ser revisadas e corrigidas na interface antes de uma nova tentativa de salvamento.

Isso proporciona:
- menor uso de tokens
- melhor continuidade narrativa em chats longos

---

<a id="-memory-generation"></a>
## 📝 Geração de Memória

<a id="json-only-output"></a>
### **Saída Somente em JSON**
Todos os prompts e predefinições **devem** instruir a IA a retornar somente JSON válido, por exemplo:

```json
{
  "title": "Título curto da cena",
  "content": "Resumo detalhado da cena...",
  "keywords": ["palavra-chave1", "palavra-chave2"]
}
```
**Nenhum outro texto é permitido na resposta.**

<a id="built-in-presets"></a>
### **Predefinições Integradas**
1. **Summary:** resumos detalhados, passo a passo.
2. **Summarize:** cabeçalhos Markdown para linha do tempo, momentos, interações e resultado.
3. **Synopsis:** Markdown abrangente e estruturado.
4. **Sum Up:** resumo conciso dos principais momentos com linha do tempo.
5. **Minimal:** resumo de 1–2 frases.
6. **Northgate:** estilo de resumo literário voltado à escrita criativa.
7. **Aelemar:** concentra-se em pontos da trama e memórias dos personagens.
8. **Comprehensive:** resumo no estilo de sinopse com extração aprimorada de palavras-chave.

<a id="custom-prompts"></a>
### **Prompts Personalizados**
- Crie seus próprios prompts, mas eles **devem** retornar JSON válido conforme mostrado acima.

---

<a id="-lorebook-integration"></a>
## 📚 Integração com Lorebooks

- **Criação Automática de Entradas:** novas memórias são armazenadas como entradas com todos os metadados.
- **Detecção por Flag:** somente entradas com a flag `stmemorybooks` são reconhecidas como memórias.
- **Numeração Automática:** numeração sequencial com zeros à esquerda em vários formatos compatíveis (`[000]`, `(000)`, `{000}`, `#000`).
- **Ordem Manual/Automática:** configurações de ordem de inserção por perfil.
- **Atualização do Editor:** opcionalmente, atualiza automaticamente o editor de lorebooks após adicionar uma memória.

> **Memórias existentes precisam ser convertidas!**
> Use o [Conversor de Lorebooks](/resources/lorebookconverter.html) para adicionar a flag `stmemorybooks` e os campos obrigatórios.

---


<a id="-clip-to-memory-book"></a>
## ✂️ Clip para Livro de Memória

![Selecionar texto para Clip](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/clip.png)

Clip para Livro de Memória serve para anotações rápidas do tipo “lembre-se disto”. Destaque um texto importante do chat, clique no botão flutuante de tesoura e salve o texto selecionado como um marcador no seu Livro de Memória sem precisar abrir primeiro o editor de lorebooks.

Caso queira um rastreador contínuo que seja atualizado ao longo do tempo, use um Prompt Lateral. Em resumo: **Clip = um fato salvo; Prompt Lateral = rastreador contínuo.**

#### Como Funciona
- Destaque exatamente o texto que deseja lembrar.
- Clique no botão flutuante de tesoura. Você pode ativar ou desativar esse botão na janela do Memory Books.
- Escolha uma entrada de Clip existente ou crie uma nova.
- Revise a entrada atual e a prévia atualizada antes de salvar.
- Renomeie a entrada/seção, se necessário.

Entradas de Clip são entradas normais de lorebook marcadas com `[STMB Clip]` no final do título. Por exemplo:

```txt
Seraphina Me Curou [STMB Clip]
```

A seção visível dentro da entrada usa o título sem `[STMB Clip]`:

```md
=== Seraphina Me Curou ===

- Seraphina curou meus ferimentos com magia.
- Seraphina, guardiã desta floresta

=== END Seraphina Me Curou ===
```

#### Dicas
- Uma entrada de Clip possui uma seção. Use títulos específicos, como `Coisas de que {{user}} Gosta`, `Apelidos Carinhosos` ou `Preferências Alimentares`, para que as palavras-chave também possam permanecer específicas.
- Novas entradas de Clip podem estar sempre ativas ou ser acionadas por palavras-chave. Sempre ativa é a opção mais simples; palavras-chave são melhores quando a entrada deve aparecer apenas em determinadas situações.
- Entradas existentes podem se tornar entradas de Clip adicionando `[STMB Clip]` ao final do título.
- Entradas de Clip longas podem exibir um lembrete para revisá-las ou compactá-las. A Compactação pode ajudar a tornar entradas de Clip, Prompt Lateral e memória do STMB mais eficientes em tokens antes de você substituir a original.
- Entradas de Clip não adicionam atribuição da origem. Elas salvam apenas o texto que você escolheu recortar.

<a id="-topical-clip"></a>
## 🔎 Clip Temático

O Clip Temático cria ou atualiza uma entrada de memória específica, no estilo Clip, sobre um único tópico.

Use-o quando você já tiver memórias do STMB salvas, mas quiser uma única entrada organizada “sobre isto” que reúna detalhes relacionados dessas memórias. Por exemplo:

- `Sobre Seraphina`
- `Sobre a magia de {{user}}`
- `Sobre a investigação do Porto Negro`
- `Sobre o relacionamento de Alex e Mira`

O Clip Temático é diferente do Clip para Livro de Memória normal. Um Clip normal salva diretamente o texto destacado do chat. O Clip Temático lê entradas de memória existentes do STMB, pede à IA para extrair detalhes sobre um tópico e apresenta um rascunho editável antes de salvar.

#### Como Funciona

1. Abra o Memory Books.
2. Clique em **🔎 Clip Temático**.
3. Escolha o **Livro de Memória de Origem**.
4. Informe um **Tópico**.
5. Informe as **Palavras-chave** de ativação ou deixe-as vazias para usar o tópico.
6. Escolha entre criar um novo Clip Temático ou atualizar uma entrada `[STMB Clip]` existente.
7. Escolha um **Perfil de Geração**.
8. Clique em **Gerar Rascunho**.
9. Revise e edite o rascunho.
10. Clique em **Salvar Clip Temático** somente quando o resultado estiver como você deseja.

O Clip Temático salva as entradas como entradas de Clip normais, marcadas com `[STMB Clip]`. Novas entradas usam um título como:

```txt
Sobre Elliott [STMB Clip]
```

#### Atualizando Clips Temáticos Existentes

Quando você atualiza um Clip Temático existente, o STMB se lembra de quais memórias de origem foram usadas na última execução bem-sucedida. Normalmente, a próxima atualização usa apenas memórias de origem novas ou alteradas.

Caso queira reconstruir toda a entrada usando todas as memórias elegíveis, ative **Reconstruir a partir de todas as memórias de origem** antes de gerar o rascunho.

#### Observações

* O Clip Temático usa somente entradas confirmadas de memória do STMB como material de origem.
* Entradas de Clip e de Prompt Lateral não são usadas como memórias de origem.
* Os destinos de atualização são entradas `[STMB Clip]` existentes.
* O rascunho da IA sempre pode ser revisado e editado antes de ser salvo.
* O STMB não salva o rascunho gerado até que você clique em **Salvar Clip Temático**.
* Caso a solicitação seja grande, o STMB poderá exibir um aviso de tokens antes da execução.

<a id="-slash-commands"></a>
## 🆕 Comandos de Barra

- `/creatememory` — cria uma memória a partir da cena marcada.
- `/scenememory X-Y` — define o intervalo da cena e cria uma memória (por exemplo, `/scenememory 10-15`).
- `/nextmemory` — cria uma memória do final da última memória até a mensagem atual.
- `/stmb-catchup interval=x start=y end=y` — cria memórias de atualização em um chat longo existente, processando o intervalo de mensagens selecionado em blocos do tamanho informado.
- `/sideprompt "Name" {{macro}}="value" [X-Y]` — executa um Prompt Lateral (as `{{macro}}`s são opcionais).
- `/sideprompt-set "Set Name" [X-Y]` — executa um Conjunto de Prompts Laterais salvo.
- `/sideprompt-macroset "Set Name" {{macro}}="value" [X-Y]` — executa um Conjunto de Prompts Laterais e fornece valores reutilizáveis para macros.
- `/sideprompt-on "Name" | all` — ativa um Prompt Lateral pelo nome ou todos eles.
- `/sideprompt-off "Name" | all` — desativa um Prompt Lateral pelo nome ou todos eles.
- `/stmb-highest` — retorna o maior ID de mensagem das memórias processadas neste chat.
- `/stmb-set-highest <N|none>` — define manualmente o maior ID de mensagem processada neste chat.
- `/stmb-stop` — interrompe todas as gerações do STMB em andamento em qualquer lugar (parada de emergência).

### `/stmb-catchup`

Use `/stmb-catchup` ao converter um chat longo existente em memórias do STMB. Sintaxe: `/stmb-catchup interval=x start=y end=y`

Exemplo: `/stmb-catchup interval=30 start=0 end=300`

---

<a id="-group-chat-support"></a>
## 👥 Suporte a Chats em Grupo

O STMB funciona em chats em grupo com as mesmas ferramentas manuais, automáticas e de comandos de barra usadas em chats individuais. Não é necessário ativar um modo separado para chats em grupo: selecione o grupo e use o STMB normalmente.

#### Memórias Cientes dos Participantes

- O STMB lê o falante associado a cada mensagem do chat em grupo e mantém clara a atribuição dos personagens no resumo gerado.
- Quando o STMB consegue identificar os membros participantes do grupo, a memória salva recebe um filtro inclusivo de personagens do SillyTavern para esses membros. Isso mantém a memória do grupo vinculada aos personagens que realmente participaram da cena.
- Marcadores de cena, a maior mensagem processada, escolhas manuais de lorebook e outros estados específicos do chat são armazenados com o chat em grupo ativo. Trocar de chat não transfere essas configurações para outro chat.

#### Modos Automático e de Criação Automática: Um Livro de Memória

O Modo Automático usa o lorebook vinculado ao chat em grupo. O Modo de Criação Automática pode criar e vincular um caso o grupo ainda não tenha um lorebook. Em ambos os modos, as memórias são salvas no Livro de Memória do grupo, e filtros de participantes são adicionados automaticamente quando os falantes podem ser identificados.

Essa é a configuração mais simples e é suficiente para a maioria dos chats em grupo.

#### Modo Manual: Livros de Memória do Grupo e dos Personagens

O Modo Manual de Lorebook pode manter um Livro de Memória principal do grupo e um Livro de Memória designado para cada membro. A designação de lorebooks individuais para personagens exige que o [SillyTavern-LorebookOrdering (STLO)](https://github.com/aikohanasaki/SillyTavern-LorebookOrdering) esteja instalado e ativado.

1. Abra um chat em grupo e ative o **Modo Manual de Lorebook**.
2. Selecione o lorebook manual principal. Ele se tornará o Livro de Memória canônico do grupo.
3. Em **Lorebooks de Personagens do Grupo**, selecione um lorebook para cada membro. Você pode atribuir o mesmo lorebook de personagem a mais de um personagem, mas o Livro de Memória canônico do grupo não pode também ser um Livro de Memória de personagem.
4. Crie uma memória normalmente.
5. Confirme quais personagens participaram. O STMB pré-seleciona os membros detectados nas mensagens. Não selecionar ninguém aplica a memória a todos os membros do grupo.

O STMB salva a memória canônica no Livro de Memória do grupo e a copia para os Livros de Memória designados dos participantes selecionados. As entradas relacionadas são vinculadas internamente para que as consolidações do grupo e dos personagens possam manter suas linhas do tempo alinhadas. Caso algum lorebook de personagem obrigatório esteja ausente ou tenha sido excluído, o STMB interrompe o processo em vez de deixar um conjunto parcial de memórias.

Quando essa configuração de Livros de Memória do grupo e dos personagens é consolidada, o Livro de Memória canônico do grupo usa automaticamente o prompt editável **Análise de Consolidação de Chat em Grupo (Automática)**. Ele cria uma cronologia onisciente do grupo, preservando as diferenças entre acontecimentos objetivos e o conhecimento individual dos personagens. Os Livros de Memória dos personagens continuam usando a predefinição de consolidação selecionada na janela **Consolidar Memórias**. Caso vários personagens compartilhem um único Livro de Memória de personagem, o mesmo roteamento ainda se aplica.

Selecionar um Livro de Memória de personagem também atualiza os metadados do STLO na raiz desse lorebook. O STMB adiciona o nome-base do avatar do personagem a `stlo.characterOverrides` e ativa `stlo.onlyWhenSpeaking`, preservando prioridades, orçamentos e substituições de personagens já existentes no STLO. Atribuições manuais existentes são reparadas automaticamente quando o painel do Memory Books é aberto ou antes da geração de uma memória.

Os filtros do STLO usam um comportamento de somente mesclagem: limpar ou alterar uma atribuição do STMB não exclui a substituição de personagem do STLO no lorebook antigo. Remova esse filtro preservado no STLO caso o lorebook não deva mais ser ativado para aquele personagem.

A confirmação de participantes inclui **Aceitar automaticamente os participantes detectados no futuro**. Ative essa opção caso confie na detecção de falantes das mensagens e não queira aprovar a lista em cada memória.

#### Prompts Separados para Grupo e Personagem (Opcional)

Para gerar versões diferentes da mesma memória:

1. Abra o **Gerenciador de Perfis** e edite o perfil usado para criar memórias.
2. Ative **Usar prompts separados de grupo e personagem em chats em grupo**.
3. Escolha um **Prompt de Resumo do Grupo** e um **Prompt de Resumo do Personagem**.

O prompt do grupo grava a versão compartilhada no Livro de Memória principal do grupo. No Modo Manual com STLO, o prompt de personagem pode criar uma versão centrada em um personagem para o Livro de Memória atribuído individualmente a ele. Isso gera solicitações adicionais, mas permite que a memória compartilhada descreva a cena inteira enquanto uma cópia individual se concentra no que importou para aquele personagem. Caso vários membros compartilhem um único Livro de Memória atribuído, o STMB mantém apenas uma cópia compartilhada nele.

> 💡 **Recomendação:** comece com um único Livro de Memória do grupo. Adicione Livros de Memória individuais para personagens somente quando precisar de conhecimento, continuidade ou contexto diferentes para membros específicos.

---

<a id="-modes-of-operation"></a>
## 🧭 Modos de Operação

<a id="automatic-mode-default"></a>
### **Modo Automático (Padrão)**
- **Como funciona:** usa automaticamente o lorebook vinculado ao chat atual.
- **Melhor para:** simplicidade e rapidez. A maioria dos usuários deve começar por aqui.
- **Como usar:** certifique-se de que um lorebook esteja selecionado no menu suspenso “Chat Lorebooks” do personagem ou chat em grupo.

![Exemplo de vinculação do lorebook ao chat](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/chatlorebook.png)

<a id="auto-create-lorebook-mode"></a>
### **Modo de Criação Automática de Lorebook**
- **Como funciona:** cria e vincula automaticamente um novo lorebook quando nenhum existir, usando seu modelo personalizado de nome.
- **Melhor para:** novos usuários e configuração rápida. Ideal para criar um lorebook com um clique.
- **Como usar:**
  1. Ative “Criar lorebook automaticamente se nenhum existir” nas configurações da extensão.
  2. Configure seu modelo de nome (padrão: “LTM - {{char}} - {{chat}}”).
  3. Quando você criar uma memória sem um lorebook vinculado, um novo lorebook será criado e vinculado automaticamente.
- **Placeholders do modelo:** {{char}} (nome do personagem), {{user}} (seu nome), {{chat}} (ID do chat)
- **Numeração inteligente:** adiciona automaticamente números (2, 3, 4...) quando existirem nomes duplicados.
- **Observação:** não pode ser usado ao mesmo tempo que o Modo Manual de Lorebook.

<a id="manual-lorebook-mode"></a>
### **Modo Manual de Lorebook**
- **Como funciona:** permite selecionar um lorebook diferente para as memórias de cada chat, ignorando o lorebook principal vinculado ao chat.
- **Melhor para:** usuários avançados que desejam direcionar as memórias a um lorebook específico e separado.
- **Como usar:**
  1. Ative “Ativar Modo Manual de Lorebook” nas configurações da extensão.
  2. Na primeira vez em que criar uma memória em um chat, você será solicitado a escolher um lorebook.
  3. Essa escolha será salva para aquele chat específico até que você a limpe ou volte ao Modo Automático.
- **Observação:** não pode ser usado ao mesmo tempo que o Modo de Criação Automática de Lorebook.

---

<a id="-trackers--side-prompts"></a>
### 🎡 Rastreadores e Prompts Laterais

![Onde encontrar Rastreadores e Prompts Laterais](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/sp.png)

> 📘 Prompts Laterais possuem um guia próprio: [Guia de Prompts Laterais](userguides/side-prompts-pt-br.md). Consulte-o para ver conjuntos, macros, exemplos e solução de problemas.
> 🎡 Precisa do caminho exato dos cliques? Consulte o [passo a passo do Scribe para ativar Prompts Laterais](https://scribehow.com/viewer/How_to_Enable_Side_Prompts_in_Memory_Books__fif494uSSjCmxE2ZCmRGxQ).

Prompts Laterais são execuções separadas de prompts do STMB para manter o estado contínuo do chat. Use-os para rastreadores e anotações de apoio que não devem sobrecarregar a resposta normal do personagem. Caso queira apenas salvar um fato destacado, use Clip para Livro de Memória.

Use Prompts Laterais para coisas como:

- 💰 Inventário e Recursos (“Quais itens o usuário possui?”)
- ❤️ Estado do Relacionamento (“O que X sente por Y?”)
- 📊 Estatísticas do Personagem (“Saúde, habilidades e reputação atuais”)
- 🎯 Progresso de Missões (“Quais objetivos estão ativos?”)
- 🌍 Estado do Mundo (“O que mudou no cenário?”)

#### **Acesso:** nas configurações do Memory Books, clique em “🎡 Rastreadores e Prompts Laterais”.

#### **Recursos:**
- Visualize, crie, duplique, edite, exclua, exporte e importe Prompts Laterais.
- Execute Prompts Laterais manualmente, após uma memória ou como parte de um Conjunto de Prompts Laterais.
- Use macros padrão do SillyTavern, como `{{user}}` e `{{char}}`.
- Use macros de tempo de execução, como `{{npc name}}`, quando um prompt precisar de um valor fornecido durante a execução.
- Salve a saída de um Prompt Lateral como uma entrada separada de prompt lateral no lorebook de memória.

#### **Dicas de Uso:**
- Copie uma opção integrada ao criar um novo prompt.
- Prompts Laterais não precisam retornar JSON. Texto simples ou Markdown são aceitáveis.
- Prompts Laterais normalmente são atualizados/sobrescritos; memórias são salvas em sequência.
- A sintaxe manual é `/sideprompt "Name" {{macro}}="value" [X-Y]`.
- Use Conjuntos de Prompts Laterais quando um chat precisar de um pacote ordenado de rastreadores.
- Um Conjunto de Prompts Laterais selecionado para execução após a memória substitui os Prompts Laterais após a memória ativados individualmente naquele chat.
- [Arquivo JSON da Biblioteca Adicional de Modelos de Prompts Laterais](resources/SidePromptTemplateLibrary.json) — basta importá-lo para usar.

--- 

<a id="-compaction"></a>
## 🧹 Compactação

![Clique aqui para abrir o menu de Compactação](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/compaction.png)

A Compactação é um fluxo de revisão para tornar mais eficientes em tokens as entradas de lorebook gerenciadas pelo STMB. Ela pede à IA para reescrever uma entrada existente e mostra o original e o rascunho compactado antes que qualquer conteúdo seja substituído.

Ela é diferente da Consolidação de Resumos: a Compactação reescreve uma entrada; a Consolidação combina várias memórias em uma recapitulação maior.

Você pode abri-la na janela principal do Memory Books por meio de **📝 Compactação**. Entradas de Clip longas também podem oferecer um botão **Compactar Entrada** no fluxo de Clip.

#### Entradas Elegíveis

A Compactação lista as entradas elegíveis do Livro de Memória selecionado:

- Entradas de Clip marcadas com `[STMB Clip]`
- Entradas de Prompt Lateral
- Entradas de memória do STMB sinalizadas pelo Memory Books

Entradas comuns de lorebook que não são gerenciadas pelo STMB não são exibidas.

#### Como Funciona

1. Abra o Memory Books e clique em **📝 Compactação**.
2. Escolha um **Livro de Memória**. Caso o chat atual já tenha um Livro de Memória válido, o STMB o pré-selecionará; caso contrário, escolha um no menu suspenso pesquisável.
3. Escolha um **Perfil de Compactação**. Ele controla qual conexão/modelo de IA será usado na solicitação de compactação.
4. Opcional: clique em **Editar Prompt de Compactação** caso queira alterar as instruções enviadas à IA.
5. Clique em **Compactar Entrada** ao lado da entrada que deseja reescrever.
6. Compare o **Conteúdo original** e o **Rascunho compactado**. O STMB mostra uma estimativa de tokens para ambos.
7. Edite o rascunho, se necessário, e escolha **Substituir pela Versão Compactada**, **Copiar Rascunho Compactado** ou **Cancelar**.

O STMB **não** substitui o original automaticamente. A entrada do lorebook só é alterada caso você clique em **Substituir pela Versão Compactada**.

#### Prompt de Compactação

O Prompt de Compactação é editável. O prompt padrão orienta a IA a preservar fatos importantes, nomes, pronomes, macros, cabeçalhos delimitadores e marcadores de fim, removendo redundâncias e texto de baixo valor.

Placeholders compatíveis no prompt:

- `{{ENTRY_CONTENT}}` — o conteúdo atual da entrada do lorebook. Este placeholder é obrigatório.
- `{{ENTRY_KIND}}` — o tipo de entrada, como Clip, SidePrompt ou Memory.
- `{{ENTRY_TITLE}}` — o título da entrada do lorebook.

Use **Restaurar Padrão** no editor de prompts para recuperar o Prompt de Compactação integrado.

#### Mais Adequada para

- entradas de Clip longas
- entradas de rastreadores de Prompts Laterais que acumularam anotações repetidas
- entradas de memória do STMB úteis, mas prolixas
- entradas que estão sempre ativas e começando a desperdiçar contexto

#### Não se Destina a

- adicionar fatos novos
- resumir o chat bruto
- criar novas memórias
- reescrever entradas comuns de lorebook que não sejam gerenciadas pelo STMB

---

<a id="-regex-integration-for-advanced-customization"></a>
### 🧠 Integração com Regex para Personalização Avançada

![Configurar regex](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/regex.png)

- **Controle Total sobre o Processamento de Texto**: o Memory Books agora se integra à extensão **Regex** do SillyTavern, permitindo aplicar transformações poderosas de texto em duas etapas importantes:
    1. **Geração do Prompt**: modifique automaticamente os prompts enviados à IA criando scripts regex direcionados ao posicionamento **User Input**.
    2. **Análise da Resposta**: limpe, reformate ou padronize a resposta bruta da IA antes que ela seja salva, direcionando scripts ao posicionamento **AI Output**.
- **Suporte a Seleção Múltipla**: você pode escolher vários scripts para o processamento de saída e entrada.
- **Como Funciona**: ative `Usar regex (avançado)` no STMB, clique em `📐 Configurar regex…` e selecione quais scripts o STMB deve executar antes de enviar o conteúdo à IA e antes de analisar/salvar a resposta.
- **Importante**: a seleção de regex é controlada pelo STMB. Os scripts selecionados ali serão executados **mesmo que estejam desativados na própria extensão Regex**.

---

<a id="-profile-management"></a>
## 👤 Gerenciamento de Perfis

![Gerenciamento de Perfis](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/profiles.png)

- **Perfis:** cada perfil inclui API, modelo, temperatura, prompt/predefinição, formato do título e configurações do lorebook.
- **Importação/Exportação:** compartilhe perfis como JSON.
- **Criação de Perfis:** use a janela de opções avançadas para salvar novos perfis.
- **Substituições por Perfil:** altere temporariamente API/modelo/temperatura para criar uma memória e depois restaure as configurações originais.
- **Provedor/Perfil Integrado:** o STMB inclui a opção obrigatória `Configurações Atuais do SillyTavern`, que usa diretamente sua conexão e suas configurações ativas do SillyTavern.

---

<a id="-settings--configuration"></a>
## ⚙️ Configurações

![Painel principal de configurações 1](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/profile1.png)
![Painel principal de configurações 2](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/profile2.png)
![Painel principal de configurações 3](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/profile3.png)

<a id="global-settings"></a>
### **Configurações Globais**
[Visão geral curta em vídeo no YouTube](https://youtu.be/mG2eRH_EhHs)

- **Modo Manual de Lorebook:** ative para selecionar lorebooks por chat.
- **Criar lorebook automaticamente se nenhum existir:** ⭐ *Novo na v4.2.0* — cria e vincula lorebooks automaticamente usando seu modelo de nome.
- **Modelo de Nome do Lorebook:** ⭐ *Novo na v4.2.0* — personalize os nomes dos lorebooks criados automaticamente com os placeholders {{char}}, {{user}} e {{chat}}.
- **Permitir Sobreposição de Cenas:** permite ou impede intervalos de memória sobrepostos.
- **Sempre Usar o Perfil Padrão:** ignora as janelas de confirmação.
- **Mostrar prévias das memórias:** ativa uma janela de prévia para revisar e editar memórias antes de adicioná-las ao lorebook.
- **Mostrar Notificações:** ativa ou desativa mensagens toast.
- **Atualizar Editor:** atualiza automaticamente o editor de lorebooks após a criação de uma memória.
- **Máximo de Tokens da Resposta:** define o comprimento máximo da geração para resumos de memória.
- **Limite de Aviso de Tokens:** define o nível de aviso para cenas grandes.
- **Memórias Anteriores Padrão:** número de memórias anteriores incluídas como contexto (0–7).
- **Criar resumos de memória automaticamente:** ativa a criação automática de memórias em intervalos.
- **Intervalo do Resumo Automático:** número de mensagens após o qual uma memória é criada automaticamente.
- **Buffer do Resumo Automático:** atrasa o resumo automático por uma quantidade configurável de mensagens.
- **Solicitar consolidação quando uma camada estiver pronta:** exibe uma confirmação “sim/mais tarde” quando uma camada de resumo selecionada tiver entradas de origem elegíveis em quantidade suficiente para a consolidação.
- **Camadas de Consolidação Automática:** selecione uma ou mais camadas de resumo que devem acionar a confirmação quando estiverem prontas. Atualmente, há suporte de Arco até Série.
- **Reexibir mensagens ocultas antes da geração da memória:** pode executar `/unhide X-Y` antes de criar uma memória.
- **Ocultar mensagens automaticamente após adicionar a memória:** opcionalmente, oculta todas as mensagens processadas ou apenas o intervalo da memória mais recente.
- **Usar regex (avançado):** ativa a janela de seleção de regex do STMB para processamento de saída/entrada.
- **Formato do Título da Memória:** escolha ou personalize; consulte abaixo.

![Configuração do perfil](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/Profile.png)

<a id="profile-fields"></a>
### **Campos do Perfil**
- **Nome:** nome exibido.
- **API/Provedor:** `Configurações Atuais do SillyTavern`, OpenAI, Claude, personalizado, totalmente manual e outros provedores compatíveis.
- **Modelo:** nome do modelo (por exemplo, gpt-4, claude-3-opus).
- **Temperatura:** 0,0–2,0.
- **Prompt ou Predefinição:** personalizado ou integrado.
- **Formato do Título:** modelo por perfil.
- **Modo de Ativação:** Vetorizado, Constante, Normal.
- **Posição:** ↑Char, ↓Char, ↑EM, ↓EM, ↑AN, ↓AN, Outlet (e nome do campo).
- **Modo de Ordem:** automático/manual.
- **Recursão:** impedir/adiar até a recursão.

---

<a id="-title-formatting"></a>
## 🏷️ Formatação de Títulos

![Formato do título](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/titleformat.png)
![Formatos de título](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/titleformats.png)

Personalize os títulos das entradas do seu lorebook com um sistema poderoso de modelos.

- **Placeholders:**
  - `{{title}}` — o título gerado pela IA (por exemplo, “Um Encontro Fatídico”).
  - `{{scene}}` — o intervalo de mensagens (por exemplo, “Cena 15-23”).
  - `{{char}}` — o nome do personagem.
  - `{{user}}` — seu nome de usuário.
  - `{{messages}}` — o número de mensagens na cena.
  - `{{profile}}` — o nome do perfil usado para a geração.
  - Placeholders de data/hora atuais em vários formatos (por exemplo, `13 de agosto de 2025` para a data e `11:08 PM` para a hora).
- **Numeração Automática:** use `[0]`, `[00]`, `(0)`, `{0}`, `#0` e agora também formas delimitadas, como `#[000]`, `([000])` e `{[000]}`, para obter numeração sequencial com zeros à esquerda.
- **Formatos Personalizados:** você pode criar seus próprios formatos. A partir da v4.5.1, todos os caracteres Unicode imprimíveis, incluindo emoji, CJK, letras acentuadas e símbolos, são permitidos nos títulos; somente caracteres de controle Unicode são bloqueados.

---

<a id="-context-memories"></a>
## 🧵 Memórias de Contexto

- **Inclua até 7 memórias anteriores** como contexto para melhorar a continuidade.
- A **estimativa de tokens** inclui as memórias de contexto para maior precisão.
- As **opções avançadas** permitem substituir temporariamente o comportamento do prompt/perfil para uma única execução de memória.

![Geração de memória com contexto](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/context.png)

---

<a id="-optional-job-queue-chat-top-bar-required"></a>
## 🧾 Fila Opcional de Tarefas (Chat Top Bar obrigatória)

![Fila de Tarefas do ST Memory Books](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/queue.png)

A fila de tarefas é opcional. Você não precisa dela para usar o Memory Books.

Caso instale e ative a **Chat Top Bar** / **Chat Top Info Bar**, o STMB adicionará um botão **Tarefas dos Livros de Memória** à barra superior do chat. Esse botão abre um painel de fila em que você pode ver tarefas ativas, concluídas, com falha, canceladas ou que precisam de revisão.

Isso é especialmente útil quando você estiver:

- criando memórias a partir de cenas mais longas
- executando uma consolidação
- executando Prompts Laterais após a criação de uma memória
- trabalhando em chats longos e desejando maior clareza sobre o progresso e o tratamento das revisões

A fila pode mostrar o estado das tarefas, permitir o cancelamento de tarefas ativas, tentar novamente tarefas com falha e dispensar tarefas concluídas. Caso uma tarefa enfileirada precise de revisão do usuário, o STMB pode marcá-la como **Precisa de revisão** em vez de sobrescrever silenciosamente algo de forma insegura.

Caso a Chat Top Bar não esteja instalada ou ativada, o STMB continuará funcionando normalmente. Você apenas não terá a interface da fila de tarefas.

### Instalando a Chat Top Bar

![Como instalar a Chat Top Bar](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/install.png)

---

<a id="-visual-feedback--accessibility"></a>
## 🎨 Feedback Visual e Acessibilidade

- **Estados dos Botões:**
  - Inativo, ativo, seleção válida, dentro da cena, processando.

![Seleção completa da cena mostrando todos os estados visuais](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/example.png)


- **Acessibilidade:**
  - Navegação por teclado, indicadores de foco, atributos ARIA, movimento reduzido e compatibilidade com dispositivos móveis.

---

<a id="FAQ"></a>
<a id="faq"></a>
# Perguntas Frequentes

<a id="should-i-make-a-separate-lorebook-for-memories-or-can-i-use-the-same-lorebook-im-already-using-for-other-things"></a>
### Devo criar um lorebook separado para as memórias ou posso usar o mesmo lorebook que já uso para outras coisas?

Recomendo que seu lorebook de memória seja um livro separado. Isso facilita a organização das memórias em relação às demais entradas. Por exemplo: adicioná-lo a um chat em grupo, usá-lo em outro chat ou definir um orçamento individual para esse lorebook por meio do STLO.

<a id="do-i-need-to-run-vectors"></a>
### Preciso usar vetores?

Você pode, mas não é obrigatório. Caso não use a extensão de vetores — eu não uso —, o sistema funciona por meio de palavras-chave. Isso é totalmente automatizado para que você não precise pensar em quais palavras-chave usar.

<a id="should-i-use-delay-until-recursion-if-memory-books-is-the-only-lorebook"></a>
### Devo usar “Delay until recursion” se o Memory Books for meu único lorebook?

Não. Caso não existam outras World Info ou outros lorebooks, selecionar “Delay until recursion” pode impedir que o primeiro ciclo seja acionado, fazendo com que nada seja ativado. Se o Memory Books for o único lorebook, desative “Delay until recursion” ou configure pelo menos uma World Info ou um lorebook adicional.

### Por que a IA não está vendo minhas entradas?

Antes de tudo, você precisa verificar se as entradas estão sendo enviadas. Gosto de usar o [WorldInfo-Info](https://github.com/aikohanasaki/SillyTavern-WorldInfoInfo) para isso. 

Caso as entradas estejam sendo acionadas e enviadas à IA, provavelmente será necessário reclamar com a IA em OOC. Algo como: `[OOC: POR QUE você não está usando as informações que recebeu? Especificamente: (seja lá o que for)]` 😁

---

<a id="Troubleshooting"></a>
<a id="troubleshooting"></a>
# Solução de Problemas

- **Não consigo encontrar o Memory Books no menu Extensões!**
As configurações ficam no menu Extensões — a varinha mágica 🪄 à esquerda da caixa de entrada. Procure por “Livros de Memória”.

![Localização das configurações do STMB](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/menu.png)

- **Nenhum lorebook disponível ou selecionado:**
  - No Modo Manual, selecione um lorebook quando solicitado.
  - No Modo Automático, vincule um lorebook ao chat.
  - Ou ative “Criar lorebook automaticamente se nenhum existir”.

- **Erro de Validação do Lorebook:**
  - Você provavelmente excluiu o lorebook que estava vinculado. Basta vincular um novo lorebook, que pode estar vazio.

- **Nenhuma cena selecionada:**
  - Marque os pontos de início (►) e fim (◄).

- **A cena se sobrepõe a uma memória existente:**
  - Escolha outro intervalo ou ative “Permitir Sobreposição de Cenas” nas configurações.

![Aviso de sobreposição de cena](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/overlap.png)
![Ativar sobreposição de cenas](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/overlap2.png)

- **A IA não conseguiu gerar uma memória válida:**
  - Use um modelo compatível com saída em JSON.
  - Verifique as configurações do prompt e do modelo.

- **Limite de aviso de tokens excedido:**
  - Use uma cena menor ou aumente o limite.

- **Botões de divisa ausentes:**
  - Aguarde a extensão carregar ou atualize a página.

- **Dados do personagem indisponíveis:**
  - Aguarde o chat/grupo terminar de carregar.

---

<a id="-power-up-with-lorebook-ordering-stlo"></a>
## 📚 Potencialize com o Lorebook Ordering (STLO)

Para uma organização avançada das memórias e uma integração mais profunda com a história, use o STMB junto com o [SillyTavern-LorebookOrdering (STLO)](https://github.com/aikohanasaki/SillyTavern-LorebookOrdering/blob/main/guides/STMB%20and%20STLO%20-%20English.md). Consulte o guia para ver as melhores práticas, instruções de configuração e dicas!

---

<a id="-character-policy-v451"></a>
## 📝 Política de Caracteres (v4.5.1+)

- **Permitidos nos títulos:** todos os caracteres Unicode imprimíveis são permitidos, incluindo letras acentuadas, emoji, CJK e símbolos.
- **Bloqueados:** somente caracteres de controle Unicode (U+0000–U+001F, U+007F–U+009F) são bloqueados; eles são removidos automaticamente.

Consulte os [Detalhes da Política de Caracteres](charset.md) para ver exemplos e observações sobre migração.

---

<a id="-for-developers"></a>
## 👨‍💻 Para Desenvolvedores

<a id="building-the-extension"></a>
### Compilando a Extensão

Esta extensão usa Bun para a compilação. O processo minifica e empacota os arquivos de origem.

```sh
# Compilar a extensão
bun run build
```

<a id="git-hooks"></a>
### Hooks do Git

O projeto inclui um hook de pre-commit que compila automaticamente a extensão e inclui os artefatos de compilação nos commits. Isso garante que os arquivos compilados estejam sempre sincronizados com o código-fonte.

**Para instalar o hook do Git:**

```sh
bun run install-hooks
```

O hook irá:
- Executar `bun run build` antes de cada commit
- Adicionar os artefatos de compilação ao commit
- Cancelar o commit se a compilação falhar

---

*Desenvolvido com carinho usando VS Code/Cline, testes extensivos e feedback da comunidade.* 🤖💕

## Direitos Autorais e Licença

SillyTavern Memory Books é protegido por direitos autorais © 2024–2026 Aiko Hanasaki.

O código original deste repositório é licenciado sob a GNU Affero
General Public License v3.0. Versões modificadas devem preservar os avisos de
direitos autorais e licença aplicáveis, identificar suas modificações e cumprir
os requisitos de disponibilização do código-fonte da AGPL.

Consulte [LICENSE](./LICENSE).
