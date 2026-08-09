<!--
Copyright (C) 2024–2026 Aiko Hanasaki
SPDX-License-Identifier: AGPL-3.0-only
-->

# 📕 ST Memory Books — Seu Assistente de Memória para Chats com IA

**Transforme suas conversas intermináveis em memórias organizadas e pesquisáveis!**

Precisa que o bot se lembre das coisas, mas o chat é extenso demais para caber no contexto? Quer acompanhar automaticamente pontos importantes da trama sem fazer anotações manualmente? O ST Memory Books faz exatamente isso: ele acompanha seus chats e cria resumos inteligentes para que você nunca mais perca o fio da história.

(Procurando detalhes técnicos dos bastidores? Talvez você queira ler [Como o STMB Funciona](howSTMBworks-pt-br.md).)

## 📑 Índice

- [Início Rápido](#-quick-start-5-minutes-to-your-first-memory)
- [O que o ST Memory Books Realmente Faz](#-what-st-memory-books-actually-does)
- [Escolha Seu Estilo](#-choose-your-style)
- [Chats em Grupo](#-group-chats)
- [Clip para Livro de Memória](#-clip-to-memory-book)
- [Clip Temático](#-topical-clip)
- [Clips vs. Prompts Laterais](#-clips-vs-side-prompts)
- [Economia de Tokens: Ocultar/Reexibir Mensagens](#-token-saving-hide--unhide-messages)
- [Compactação vs. Consolidação](#-compaction-vs-consolidation)
- [Consolidação de Resumos](#-summary-consolidation)
- [Rastreadores, Prompts Laterais e Modelos](#-trackers-side-prompts--templates-advanced-feature)
- [Compactação](#-compaction)
- [Configurações Mais Importantes no Início](#-settings-that-matter-first)
- [Solução de Problemas](#-troubleshooting-when-things-dont-work)
- [O que o ST Memory Books Não Faz](#-what-st-memory-books-doesnt-do)
- [Ajuda e Mais Informações](#-getting-help--more-info)
- [Potencialize com a Ordenação de Lorebooks (STLO)](#-power-up-with-lorebook-ordering-stlo)

---

<a id="-quick-start-5-minutes-to-your-first-memory"></a>
## 🚀 Início Rápido (5 Minutos até Sua Primeira Memória!)

**Nunca usou o ST Memory Books?** Vamos configurar sua primeira memória automática com apenas alguns cliques:

### Etapa 1: Encontre a Extensão
- Procure o ícone de varinha mágica (🪄) ao lado da caixa de entrada do chat
- Clique nele e depois em **"Livros de Memória"**
- O painel de controle do ST Memory Books será exibido

### Etapa 2: Ative a Mágica Automática
- No painel de controle, encontre **"Criar resumos de memória automaticamente"**
- Ative essa opção
- Defina o **Intervalo do Resumo Automático** como **20–30 mensagens** (um bom ponto de partida)
- No início, mantenha o **Buffer do Resumo Automático** baixo (`0–2` é uma boa faixa para iniciantes)
- Crie primeiro uma memória manual para preparar o chat
- Pronto! 🎉

### Etapa 3: Converse Normalmente
- Continue conversando como sempre
- Após 20–30 mensagens novas, o ST Memory Books fará automaticamente o seguinte:
  - Usará as novas mensagens desde o último ponto processado
  - Pedirá à sua IA que escreva um resumo
  - Salvará o resumo na sua coleção de memórias
  - Exibirá uma notificação quando terminar

**Parabéns!** Agora você possui gerenciamento automático de memórias. Chega de esquecer o que aconteceu vários capítulos atrás!

---

<a id="-what-st-memory-books-actually-does"></a>
## 💡 O que o ST Memory Books Realmente Faz

Pense no ST Memory Books como seu **bibliotecário pessoal de IA** para conversas:

### 🤖 **Resumos Automáticos**
*"Não quero pensar nisso; só quero que funcione"*
- Acompanha seu chat em segundo plano
- Cria memórias automaticamente a cada X mensagens
- Perfeito para roleplays longos, escrita criativa ou histórias contínuas

### ✋ **Criação Manual de Memórias**
*"Quero controlar o que será salvo"*
- Marque cenas importantes com botões simples de seta (► ◄)
- Crie memórias sob demanda para momentos especiais
- Ótimo para registrar pontos importantes da trama ou desenvolvimentos de personagem

### 📊 **Prompts Laterais e Rastreadores Inteligentes**
*"Quero acompanhar relacionamentos, fios da trama ou estatísticas"*
- Trechos de prompt reutilizáveis que complementam a geração de memórias
- Biblioteca de modelos com rastreadores prontos para uso
- Prompts personalizados de IA que acompanham o que você quiser
- Atualizam automaticamente placares, status de relacionamento e resumos da trama
- Exemplos: "Quem gosta de quem?", "Status atual da missão", "Rastreador de humor do personagem"

### 📚 **Coleções de Memórias**
*Onde todas as suas memórias ficam armazenadas*
- Organizadas e pesquisáveis automaticamente
- Funcionam com o sistema integrado de lorebooks do SillyTavern
- Sua IA pode consultar memórias anteriores em novas conversas

---

<a id="-choose-your-style"></a>
## 🎯 Escolha Seu Estilo

<details>
<summary><strong>🔄 "Configure e Esqueça" (Recomendado para Iniciantes)</strong></summary>

**Perfeito se você quer:** automação sem intervenção que simplesmente funcione

**Como funciona:**
1. Ative `Criar resumos de memória automaticamente`
2. Defina o `Intervalo do Resumo Automático` em uma faixa adequada à velocidade do seu chat
3. Opcionalmente, defina um `Buffer do Resumo Automático` pequeno caso queira geração tardia
4. Depois de preparar o chat com uma memória manual, continue conversando normalmente

**O que você recebe:**
- Nenhum trabalho manual necessário
- Criação consistente de memórias
- Nenhum momento importante da história será perdido
- Funciona em chats individuais e em grupo

**Dica:** comece com 30 mensagens e ajuste de acordo com seu estilo de conversa. Chats rápidos podem usar 50 ou mais; chats mais lentos e detalhados talvez funcionem melhor com 20.

</details>

<details>
<summary><strong>✋ "Controle Manual" (Para Criar Memórias Seletivamente)</strong></summary>

**Perfeito se você quer:** decidir exatamente o que se tornará uma memória

**Como funciona:**
1. Procure os pequenos botões de seta (► ◄) nas mensagens do chat
2. Clique em ► na primeira mensagem de uma cena importante
3. Clique em ◄ na última mensagem dessa cena
4. Abra o Memory Books (🪄) e clique em "Criar Memória"

**O que você recebe:**
- Controle completo sobre o conteúdo da memória
- Perfeito para registrar momentos específicos
- Ótimo para cenas complexas que precisam de limites bem definidos

**Dica:** os botões de seta aparecem alguns segundos após o carregamento do chat. Caso não os veja, aguarde um momento ou atualize a página.

</details>

<details>
<summary><strong>⚡ "Usuário Avançado" (Comandos de Barra)</strong></summary>

**Perfeito se você quer:** atalhos de teclado e recursos avançados

**Comandos essenciais:**
- `/scenememory 10-25` — cria uma memória das mensagens 10 a 25
- `/creatememory` — cria uma memória da cena marcada no momento
- `/nextmemory` — resume tudo desde a última memória
- `/sideprompt "Rastreador de Relacionamento" {{macro}}="valor" [X-Y]` — executa um Prompt Lateral, fornecendo opcionalmente as macros obrigatórias de tempo de execução e um intervalo de mensagens
- `/sideprompt-on "Nome"` ou `/sideprompt-off "Nome"` — ativa ou desativa manualmente um Prompt Lateral
- `/stmb-set-highest <N|none>` — ajusta o ponto inicial do resumo automático para o chat atual

**O que você recebe:**
- Criação extremamente rápida de memórias
- Operações em lote
- Integração com fluxos de trabalho personalizados

</details>

---

<a id="-group-chats"></a>
## 👥 Chats em Grupo

Sim, o ST Memory Books funciona com chats em grupo! Você pode marcar cenas, criar memórias manualmente, usar resumos automáticos e executar comandos de barra da mesma forma que faria em um chat individual.

Você **não** precisa procurar um interruptor oculto de “modo de grupo”. Abra seu chat em grupo e use o STMB normalmente.

### O que acontece com uma memória de grupo?

O STMB observa quem falou durante a cena. Quando consegue identificar os participantes, ele adiciona esses personagens ao filtro de personagens da memória. Em termos simples: a memória permanece ligada às pessoas que realmente estavam presentes, em vez de tratar todo o grupo como um único personagem gigantesco.

O prompt de resumo também foi escrito para manter separados os nomes e o conhecimento de cada pessoa. Se Alice fez uma promessa e Bob descobriu um segredo, a memória deve dizer exatamente isso — e não transformar tudo em “eles sabiam e sentiam as mesmas coisas”.

### A configuração simples: um Livro de Memória para o grupo

Esta é a configuração que recomendo para começar.

1. Vincule um lorebook ao chat em grupo.
2. Crie memórias normalmente.
3. Pronto! O STMB salva as memórias no Livro de Memória do grupo e adiciona filtros de participantes quando consegue identificar os falantes.

Se **Criar lorebook automaticamente se nenhum existir** estiver ativado, o STMB poderá criar e vincular o Livro de Memória do grupo para você.

Esta configuração funciona melhor quando todos compartilham o mesmo histórico geral da história e você não precisa manter versões separadas de cada memória.

### A configuração avançada: Livros de Memória separados para cada personagem

Quer que o grupo possua um histórico compartilhado, mas que cada personagem também mantenha suas próprias memórias relevantes? Você pode fazer isso com o **Modo Manual de Lorebook** e o [SillyTavern-LorebookOrdering (STLO)](https://github.com/aikohanasaki/SillyTavern-LorebookOrdering).

1. Instale e ative o STLO.
2. Abra o chat em grupo.
3. Ative o **Modo Manual de Lorebook** no Memory Books.
4. Selecione o Livro de Memória principal do grupo.
5. Em **Lorebooks dos Personagens do Grupo**, escolha um Livro de Memória para cada membro do grupo. O Livro de Memória principal do grupo não pode também ser selecionado como Livro de Memória de personagem.
6. Crie sua memória.
7. Confira a lista de participantes antes da geração. O STMB pré-selecionará os personagens encontrados na cena.

A versão principal é salva no Livro de Memória do grupo. As cópias são salvas somente nos Livros de Memória atribuídos aos participantes selecionados. Caso deixe todos os participantes desmarcados, o STMB tratará a memória como aplicável ao grupo inteiro.

Durante a Consolidação de Resumos, esta configuração avançada usa automaticamente a **Análise de Consolidação de Chat em Grupo (Automática)** no Livro de Memória principal do grupo. Esse prompt mantém uma linha do tempo onisciente do grupo sem tratar todos os fatos como conhecimento compartilhado pelos personagens. Cada Livro de Memória de personagem continua usando a predefinição de consolidação escolhida na janela de consolidação. Isso também se aplica quando vários personagens compartilham um único Livro de Memória atribuído.

Ao atribuir um Livro de Memória de personagem, o STMB também adiciona esse personagem aos metadados `characterOverrides` do STLO no lorebook e ativa **Ativar somente para personagens específicos**. As configurações existentes de prioridade, orçamento, ordem e personagens do STLO são preservadas. Atribuições antigas são atualizadas automaticamente quando você abre o Memory Books ou cria uma memória.

Limpar ou alterar a atribuição não remove o filtro antigo de personagem do STLO. Caso esse lorebook não deva mais ser ativado para o personagem, abra o STLO e remova ali a substituição preservada.

Se estiver satisfeito com a detecção de participantes do STMB, marque **Aceitar automaticamente os participantes detectados no futuro** para não precisar confirmar a lista todas as vezes.

### Opcional: escreva uma versão compartilhada e outra focada no personagem

Abra o **Gerenciador de Perfis**, edite seu perfil de memória e ative **Usar prompts separados de grupo e personagem em chats em grupo**.

- O **Prompt de Resumo do Grupo** escreve a memória compartilhada do grupo.
- O **Prompt de Resumo do Personagem** escreve uma versão focada em um personagem para um Livro de Memória atribuído individualmente ao usar a configuração avançada de Modo Manual + STLO. Caso vários membros compartilhem um único Livro de Memória atribuído, o STMB mantém uma única cópia compartilhada nele.

Isso pode ser excelente quando os personagens sabem coisas diferentes, se importam com partes diferentes da cena ou precisam de continuidade emocional própria. Também gera solicitações adicionais à IA, portanto eu deixaria essa opção desativada a menos que você realmente queira versões separadas.

### Algumas coisas para lembrar

- As configurações e o progresso do chat em grupo pertencem ao chat atual. Mudar para outro grupo ou chat não leva junto os marcadores de cena nem o ponto inicial das mensagens processadas.
- No Modo Manual, cada membro do grupo precisa ter um lorebook válido atribuído para que o STMB possa salvar a memória distribuída.
- Você pode atribuir o mesmo Livro de Memória de personagem a mais de um membro do grupo.
- Caso os nomes dos falantes sejam incomuns ou duplicados, revise a lista de participantes em vez de aceitá-la automaticamente.

**Minha recomendação:** comece com um único Livro de Memória do grupo. Passe a usar Livros de Memória separados para os personagens somente quando a história realmente precisar de conhecimento privado ou continuidade individual. Simples é bom até deixar de ser suficiente.

---
<a id="-clip-to-memory-book"></a>
## ✂️ Clip para Livro de Memória

Use **Clip para Livro de Memória** quando quiser salvar uma linha ou um fato importante sem criar uma memória completa da cena. Destaque o texto no chat, clique no botão flutuante de tesoura e escolha uma entrada de Clip existente ou crie uma nova.

Não sabe se deveria usar um Clip ou um Prompt Lateral? Consulte [Clips vs. Prompts Laterais](#-clips-vs-side-prompts).

### Quando devo usar Clips?

Clips funcionam melhor para pequenos fatos que você deseja que a IA se lembre, como:

- uma preferência de personagem
- uma promessa ou um segredo
- um detalhe de relacionamento
- um animal de estimação, local, item ou detalhe recorrente
- uma rápida “anotação para mim” que não precisa de um resumo completo da cena

Para cenas maiores, use a criação normal de Memórias.

### Como o recorte funciona

1. Destaque a frase ou expressão que deseja salvar.
2. Clique no botão flutuante de tesoura.
3. Escolha uma entrada de Clip existente ou crie uma nova.
4. Revise a prévia da entrada.
5. Salve o Clip.

Entradas de Clip são entradas normais de lorebook marcadas com `[STMB Clip]`. Por exemplo:

```txt
Seraphina Me Curou [STMB Clip]
```

Dentro da entrada, o STMB mantém o conteúdo em um formato de seção organizado:

```md
=== Seraphina Me Curou ===

- Seraphina curou meus ferimentos com magia.

=== END Seraphina Me Curou ===
```

### Criando ou renomeando entradas de Clip

Quando você cria uma nova entrada de Clip, o título da entrada também se torna o cabeçalho da seção. Você pode renomear a entrada durante o recorte, e o STMB atualizará o cabeçalho da seção para corresponder ao novo título.

Novas entradas de Clip podem ser:

- **sempre ativas**, para fatos que devem estar sempre disponíveis
- **acionadas por palavras-chave**, para fatos que devem aparecer somente quando palavras correspondentes forem mencionadas

Use palavras-chave quando o Clip for relevante apenas para um tópico, personagem, local, animal, item ou relacionamento específico.

### Botão flutuante de tesoura

O botão flutuante de tesoura aparece somente depois que você destaca um texto dentro do chat. É possível ativar ou desativar esse botão na janela principal do Memory Books.

### Revisando entradas de Clip longas

Se uma entrada de Clip ficar longa, o STMB poderá lembrá-lo de revisá-la. Você pode editá-la manualmente ou usar a **Compactação** para pedir à IA que torne uma entrada de Clip, Prompt Lateral ou memória do STMB mais eficiente em tokens antes de decidir se deseja substituir a original.

---

<a id="-clips-vs-side-prompts"></a>
## ✂️ Clips vs. Prompts Laterais

Clips e Prompts Laterais salvam informações no seu Livro de Memória, mas não servem para o mesmo trabalho.

Regra simples: **Clips salvam um fato específico. Prompts Laterais mantêm um rastreador vivo.**

| **Clips** | **Prompts Laterais** |
|---|---|
| Salvam o texto selecionado do chat em uma entrada do Livro de Memória. | Pedem à IA para revisar o chat e atualizar uma entrada de rastreador. |
| São mais adequados para um fato, frase, promessa, preferência, item ou anotação bem definidos. | São mais adequados para informações que mudam ao longo do tempo, como status de relacionamento, progresso de missão, inventário ou fios da trama não resolvidos. |
| Você escolhe o texto exato. O STMB salva o que você selecionou. | A IA interpreta o chat e escreve ou atualiza o rastreador. |
| Use quando o fato já estiver claro e não precisar de análise. | Use quando a IA precisar comparar, resumir ou atualizar um estado com base em várias mensagens. |
| Normalmente só cresce quando você adiciona outro Clip manualmente. | Pode ser atualizado repetidamente à medida que a história muda. |
| Pense: “fixe esta anotação.” | Pense: “mantenha esta seção atualizada.” |

Exemplos de bons Clips:

- `Aiko gosta de chá com mel.`
- `Andalino prometeu não mentir para ela novamente.`
- `Colt a chama de Chefe.`

Exemplos de bons Prompts Laterais:

- status do relacionamento
- progresso atual da missão
- inventário e recursos
- diretório de NPCs
- fios da trama não resolvidos

Caso precise lembrar apenas um detalhe, use um Clip. Caso precise de um rastreador contínuo, use um Prompt Lateral.

---

<a id="-topical-clip"></a>
## 🔎 Clip Temático

O Clip Temático serve para criar uma entrada de memória focada em “tudo sobre este tópico” a partir das memórias já criadas.

Pense nele como se estivesse pedindo ao STMB:

> “Leia minhas memórias salvas e crie uma entrada útil sobre esta pessoa, local, relacionamento, fio da trama, item, segredo ou tópico.”

Ele ainda é uma entrada no estilo Clip, mas você não está recortando um texto destacado do chat. Em vez disso, o STMB usa entradas de memória existentes como origem.

Regra simples: **Clip salva o texto selecionado. Clip Temático reúne detalhes relacionados de memórias salvas. Prompts Laterais mantêm rastreadores ao longo do tempo.**

### Quando usar o Clip Temático

Use o Clip Temático quando seu Livro de Memória já tiver várias memórias e você quiser uma entrada sobre um assunto específico que seja mais fácil de acionar.

Bons exemplos:

- Um NPC recorrente
- Um relacionamento entre dois personagens
- Um mistério ou uma investigação
- Um local
- Uma facção
- Os poderes, ferimentos, promessas, segredos ou preferências de um personagem
- Um fio da trama que aparece em várias cenas

Exemplos de tópicos:

```txt
Seraphina
A magia de {{user}}
O relacionamento de Alex e Mira
A investigação do Porto Negro
A chave de prata
````

### Quando não usar o Clip Temático

Não use o Clip Temático quando:

* você quiser salvar apenas uma linha destacada do chat — use **Clip para Livro de Memória**
* quiser um rastreador atualizado automaticamente durante futuras execuções de memória — use **Prompts Laterais**
* quiser encurtar uma entrada longa — use **Compactação**
* quiser combinar várias memórias em uma recapitulação de nível superior — use **Consolidação de Resumos**

### Como usar o Clip Temático

1. Abra a janela do Memory Books.
2. Clique em **🔎 Clip Temático**.
3. Escolha o **Livro de Memória de Origem**.
4. Informe o **Tópico**.

   * Este é o assunto no qual a IA deve se concentrar.
   * Mantenha-o específico.
5. Informe as **Palavras-chave**.

   * Elas se tornarão as palavras-chave de ativação do lorebook.
   * Caso deixe as palavras-chave vazias, o STMB usará o tópico.
6. Escolha um modo:

   * **Criar novo Clip Temático** cria uma nova entrada `[STMB Clip]`.
   * **Atualizar entrada existente** atualiza uma entrada de Clip existente.
7. Escolha um **Perfil de Geração**.

   * Ele controla qual conexão/modelo de IA escreverá o rascunho.
8. Opcional: clique em **Editar Prompt de Clip Temático** caso queira alterar as instruções enviadas à IA.
9. Clique em **Gerar Rascunho**.
10. Revise o rascunho gerado.
11. Edite o rascunho, se necessário.
12. Clique em **Salvar Clip Temático**.

O STMB não salva o rascunho automaticamente. O lorebook só é alterado depois que você clica em **Salvar Clip Temático**.

### Criando um novo Clip Temático

Ao criar um novo Clip Temático, o STMB cria uma entrada de lorebook no estilo Clip.

Por exemplo, caso seu tópico seja:

```txt
Seraphina
```

O título da entrada será semelhante a:

```txt
Sobre Seraphina [STMB Clip]
```

A seção visível dentro da entrada usa o mesmo formato delimitador das entradas de Clip comuns.

### Atualizando um Clip Temático existente

O Clip Temático também pode atualizar uma entrada `[STMB Clip]` existente.

Isso é útil quando você já possui uma entrada como:

```txt
Sobre Seraphina [STMB Clip]
```

e novas memórias foram adicionadas desde a última atualização.

Quando uma atualização de Clip Temático é salva com sucesso, o STMB armazena um pequeno histórico de execuções nessa entrada. Isso inclui as memórias de origem usadas durante a execução. Na próxima atualização, o STMB pode usar esse histórico para localizar somente memórias de origem novas ou alteradas, em vez de reler tudo.

Isso mantém as atualizações menores e ajuda a evitar que as mesmas memórias antigas sejam enviadas repetidamente à IA.

### Reconstruir usando todas as memórias de origem

Ao atualizar um Clip Temático existente, você poderá ver **Reconstruir usando todas as memórias de origem**.

Deixe essa opção desativada nas atualizações normais. Quando possível, o STMB usará somente memórias de origem novas ou alteradas.

Ative-a quando:

* o Clip Temático existente estiver muito desatualizado
* você tiver alterado o prompt do Clip Temático
* tiver alterado significativamente o tópico ou as palavras-chave
* quiser que a IA reconsidere todas as memórias salvas sobre o tópico
* a entrada ainda não tiver um histórico de execuções útil

### Quais entradas de origem ele usa?

O Clip Temático usa entradas confirmadas de memória do STMB no Livro de Memória selecionado.

Ele não usa:

* entradas normais de Clip
* entradas de rastreador de Prompt Lateral
* entradas comuns de lorebook que não sejam gerenciadas pelo STMB

Isso mantém o Clip Temático focado nas memórias que o STMB já sabe identificar com segurança.

### Bons hábitos para Clips Temáticos

Use tópicos específicos.

Melhor:

```txt
O relacionamento de Alex e Mira
```

Menos útil:

```txt
Tudo sobre a história
```

Melhor:

```txt
A chave de prata
```

Menos útil:

```txt
Itens importantes
```

O Clip Temático funciona melhor quando o tópico é específico o bastante para que a IA consiga determinar o que pertence a ele e o que não pertence.

### Edição do prompt

O prompt do Clip Temático pode ser editado.

O prompt padrão orienta a IA a:

* extrair somente informações relacionadas ao tópico
* evitar acontecimentos não relacionados
* preservar nomes, relacionamentos, preferências, promessas, segredos, restrições e questões não resolvidas
* mencionar conflitos em vez de escolher silenciosamente uma versão
* atualizar o conteúdo existente do Clip sem duplicá-lo
* não inventar detalhes ausentes

O prompt deve incluir:

```txt
{{SOURCE_MEMORIES}}
```

Sem esse placeholder, o STMB não saberá onde inserir as memórias de origem.

Outros placeholders compatíveis incluem:

```txt
{{MODE}}
{{TOPIC}}
{{KEYWORDS}}
{{EXISTING_CLIP}}
{{EXISTING_ENTRY_CONTENT}}
{{SOURCE_MEMORIES}}
```

Use **Restaurar Padrão** caso seu prompt personalizado pare de funcionar bem.

---

<a id="-token-saving-hide--unhide-messages"></a>
## 🙈 Economia de Tokens: Ocultar/Reexibir Mensagens

Uma das formas mais fáceis de reduzir a poluição e economizar tokens em chats longos é ocultar mensagens depois que você já as transformou em memórias.

### O que significa “ocultar”?

Ocultar mensagens **não** as exclui. Apenas as oculta da IA. As mensagens continuam no chat, e as memórias permanecem no lorebook; portanto, as informações importantes não são perdidas — elas apenas deixam de ser enviadas diretamente à IA.

### Por que eu usaria isso?

Ocultar e reexibir mensagens é útil quando:
- seu chat ficou muito longo
- você já criou memórias para essas mensagens

### Ocultar automaticamente após a criação da memória

O STMB pode ocultar automaticamente as mensagens depois que uma memória é criada. Você pode escolher:

- **Não ocultar automaticamente**: deixa tudo visível (você pode ocultar mensagens manualmente com `/hide x-y`)
- **Ocultar automaticamente todas as mensagens até a última memória**: oculta tudo o que já foi coberto pela criação de memórias
- **Ocultar automaticamente somente as mensagens da última memória**: oculta apenas o intervalo processado mais recentemente

Você também pode escolher quantas mensagens recentes permanecerão visíveis em **Mensagens a deixar visíveis**.

### Reexibir antes da geração da memória

A configuração **Reexibir mensagens ocultas para gerar memórias** instrui o STMB a executar temporariamente `/unhide X-Y` no intervalo selecionado antes de gerar a memória. Use-a caso costume refazer memórias.

### Boa configuração para iniciantes

Configurações da Aiko:
- use **Ocultar automaticamente as mensagens até a última memória**
- deixe **2 mensagens visíveis**
- ative **Reexibir mensagens ocultas para gerar memórias**

---

<a id="-compaction-vs-consolidation"></a>
## 🧭 Compactação vs. Consolidação

Os nomes são parecidos, mas as ferramentas fazem trabalhos diferentes.

Regra simples: **A Compactação limpa uma entrada. A Consolidação combina várias memórias em uma recapitulação de nível superior.**

| **Compactação** | **Consolidação** |
|---|---|
| Torna menor uma entrada existente gerenciada pelo STMB. | Combina várias memórias ou resumos em uma recapitulação de nível superior. |
| Trabalha com uma entrada de Clip, Prompt Lateral ou memória do STMB por vez. | Trabalha com várias entradas selecionadas de memória ou resumo. |
| É mais adequada quando uma entrada é útil, mas longa, repetitiva ou cara demais para permanecer no contexto. | É mais adequada quando memórias de cenas antigas estão se acumulando e devem se tornar um resumo de Arco, Capítulo, Livro, Lenda, Série ou Épico. |
| Reescreve a entrada selecionada de forma mais eficiente em tokens. | Cria uma nova entrada de resumo com base nas entradas de origem selecionadas. |
| Deve preservar os fatos existentes e remover o excesso. | Deve preservar o arco maior de continuidade e reduzir os detalhes de cada cena. |
| Não cria uma nova memória a partir do chat bruto. | Não compacta sozinha uma única entrada inchada. |
| Pense: “reduza esta entrada.” | Pense: “agrupe estas memórias em uma recapitulação.” |

As duas ferramentas exigem revisão antes do salvamento. O STMB mostra o que a IA escreveu antes que qualquer conteúdo seja salvo ou substituído.

---
<a id="-summary-consolidation"></a>
## 🌈 Consolidação de Resumos

A Consolidação de Resumos ajuda a manter histórias longas administráveis ao comprimir memórias antigas do STMB em entradas de recapitulação de nível superior.

### P: O que é a Consolidação de Resumos?

**R:** Em vez de criar somente memórias de cenas para sempre, o STMB pode combinar memórias ou resumos existentes em uma recapitulação mais compacta. A primeira camada é **Arco**, e camadas superiores também estão disponíveis para histórias mais longas:

- Arco
- Capítulo
- Livro
- Lenda
- Série
- Épico

### P: Por que usá-la?

**R:** A Consolidação é útil quando:

- Sua lista de memórias está ficando longa
- Entradas antigas já não precisam de todos os detalhes de cada cena
- Você quer reduzir o uso de tokens sem perder continuidade
- Você quer recapitulações narrativas mais limpas e de nível superior

### P: Ela é executada automaticamente?

**R:** Não. A Consolidação ainda exige confirmação.

- Você sempre pode abrir **Consolidar Memórias** manualmente na janela principal
- Também pode ativar **Solicitar consolidação quando uma camada estiver pronta**
- Quando uma camada de destino selecionada atinge a contagem mínima salva de entradas elegíveis, o STMB exibe uma confirmação de **sim/mais tarde**
- Escolher **Sim** abre a janela de consolidação com essa camada selecionada; a consolidação não é executada silenciosamente

### P: Como faço para usá-la?

**R:** Para criar um resumo consolidado:

1. Clique em **Consolidar Memórias** na janela principal do STMB
2. Escolha a camada de resumo de destino
3. Selecione as entradas de origem que deseja incluir
4. Opcionalmente, escolha desativar as entradas de origem depois que o novo resumo for criado
5. Clique em **Executar**

Para ver prévias dessas entradas, ative “mostrar prévias” nas suas preferências.

---

<a id="-trackers-side-prompts--templates-advanced-feature"></a>
## 🎨 Rastreadores, Prompts Laterais e Modelos (Recurso Avançado)

**Prompts Laterais** são rastreadores em segundo plano que ajudam a manter informações contínuas da história. Eles são executados junto com a criação de memórias e atualizam entradas separadas de Prompt Lateral no lorebook ao longo do tempo. Pense neles como **assistentes que observam sua história e mantêm determinados detalhes atualizados**.

Caso queira salvar apenas um fato destacado, use [Clip para Livro de Memória](#-clip-to-memory-book). Prompts Laterais servem para acompanhamento repetido ou contínuo.

### 🚀 **Início Rápido com Modelos**

1. Abra as configurações do Memory Books
2. Clique em **Prompts Laterais**
3. Explore a **biblioteca de modelos** e escolha o que combina com sua história:

   * **Rastreador de Desenvolvimento do Personagem** — acompanha mudanças de personalidade e crescimento
   * **Dinâmica de Relacionamentos** — acompanha relacionamentos entre personagens
   * **Rastreador de Fios da Trama** — acompanha tramas em andamento
   * **Humor e Atmosfera** — acompanha o tom emocional
   * **Anotações de Construção de Mundo** — acompanha detalhes do cenário e lore
4. Ative os modelos desejados (você poderá personalizá-los depois)
5. Caso o modelo use gatilhos automáticos, o STMB manterá essa entrada de Prompt Lateral atualizada junto com a criação de memórias

[Passo a passo do Scribe para ativar Prompts Laterais automáticos](https://scribehow.com/viewer/How_to_Enable_Side_Prompts_in_Memory_Books__fif494uSSjCmxE2ZCmRGxQ)

### ⚙️ **Como os Prompts Laterais Funcionam**

* **Rastreadores em Segundo Plano**: são executados discretamente e atualizam informações ao longo do tempo
* **Não Intrusivos**: não alteram suas configurações principais de IA nem os prompts dos personagens
* **Controle por Chat**: chats diferentes podem usar rastreadores diferentes
* **Baseados em Modelos**: use modelos integrados ou crie os seus
* **Automáticos ou Manuais**: modelos padrão podem ser executados automaticamente; modelos com macros personalizadas de tempo de execução são exclusivamente manuais
* **Suporte a Macros**: os campos `Prompt`, `Formato da Resposta`, `Título` e palavras-chave podem expandir macros padrão do ST, como `{{user}}` e `{{char}}`
* **Macros de Tempo de Execução**: tokens `{{...}}` não padrão tornam-se entradas obrigatórias do comando, como `{{npc name}}="Jane Doe"`
* **Texto Simples Permitido**: Prompts Laterais não precisam retornar JSON
* **Comportamento de Sobrescrita**: Prompts Laterais atualizam a própria entrada rastreada ao longo do tempo, em vez de criar uma nova memória sequencial a cada execução

### 🛠️ **Gerenciando Prompts Laterais**

* **Gerenciador de Prompts Laterais**: crie, edite, duplique e organize rastreadores
* **Ativar/Desativar**: ligue ou desligue rastreadores a qualquer momento
* **Importar/Exportar**: compartilhe modelos ou crie backups
* **Visualização de Status**: veja quais rastreadores estão ativos no chat atual e quando são executados
* **Verificações de Segurança**: se um modelo contiver macros personalizadas de tempo de execução, o STMB removerá os gatilhos automáticos ao salvar ou importar e exibirá um aviso

### 💡 **Exemplos de Modelos**

* Biblioteca de Modelos de Prompts Laterais (importe este JSON):
  [SidePromptTemplateLibrary.json](../resources/SidePromptTemplateLibrary.json)

Ideias de prompts:

* “Acompanhe diálogos importantes e interações entre personagens”
* “Mantenha o status atual da missão atualizado”
* “Registre novos detalhes de construção de mundo quando aparecerem”
* “Acompanhe o relacionamento entre o Personagem A e o Personagem B”

### 🔧 **Criando Prompts Laterais Personalizados**

1. Abra o Gerenciador de Prompts Laterais
2. Clique em **Criar Novo**
3. Escreva uma instrução curta e clara
   *(exemplo: “Sempre registre como está o clima em cada cena”)*
4. Opcionalmente, adicione macros padrão do ST, como `{{user}}` ou `{{char}}`
5. Caso adicione macros personalizadas de tempo de execução, como `{{location name}}`, execute o prompt manualmente com `/sideprompt "Nome" {{location name}}="valor"`
6. Salve e ative o prompt
7. O rastreador passará a atualizar essas informações ao longo do tempo caso use gatilhos automáticos; caso contrário, execute-o manualmente quando necessário

### 💬 **Dica**

Prompts Laterais funcionam melhor quando são **pequenos e específicos**.
Em vez de “acompanhe tudo”, tente “acompanhe a tensão romântica entre os personagens principais”.

### ⌨️ **Sintaxe Manual de /sideprompt**

Use:
`/sideprompt "Nome" {{macro}}="valor" [X-Y]`

Exemplos:
- `/sideprompt "Status" 10-20`
- `/sideprompt "Diretório de NPCs" {{npc name}}="Jane Doe" 40-50`
- `/sideprompt "Anotações de Local" {{place name}}="Porto Negro" 100-120`

Observações:

- O nome do Prompt Lateral deve estar entre aspas.
- Os valores das macros de tempo de execução devem estar entre aspas.
- O preenchimento automático dos comandos de barra sugerirá as macros obrigatórias de tempo de execução depois que você escolher o Prompt Lateral.
- Caso um modelo contenha macros personalizadas de tempo de execução, o STMB o manterá exclusivamente manual e removerá os gatilhos automáticos.
- `X-Y` é opcional. Caso seja omitido, o STMB usará as mensagens desde a última atualização desse Prompt Lateral.
- Caso execute Prompts Laterais de forma manual e separada, lembre-se de ativar `reexibir antes da geração`!

---

### 🧠 Controle Avançado de Texto com a Extensão Regex

**Quer controle total sobre o texto que o STMB envia e recebe da IA?** O STMB pode executar scripts Regex selecionados antes da geração e antes do salvamento.

Isso é útil quando você quer:
- Remover lixo repetitivo das respostas da IA
- Padronizar nomes ou terminologia antes da geração
- Reformatar o texto antes que o STMB o analise ou exiba na prévia

#### **Como Funciona Agora**

1. Crie os scripts desejados na extensão **Regex** do SillyTavern
2. No STMB, ative **Usar regex (avançado)**
3. Clique em **📐 Configurar regex…**
4. Escolha quais scripts o STMB deve executar:
   - antes de enviar o texto à IA
   - antes de adicionar a resposta ao lorebook

#### **Comportamento Importante**

- A seleção de Regex do STMB é controlada dentro do **STMB**, e não pelo estado ativado/desativado do script na extensão Regex
- Um script selecionado no STMB pode ser executado mesmo que esteja desativado na própria extensão Regex
- O STMB permite seleção múltipla para o processamento de saída e entrada

#### **Exemplo Rápido**

Caso seu modelo continue adicionando `(OOC: Espero que este resumo seja útil!)`, você pode:

1. Criar um script Regex que remova esse texto
2. Ativar **Usar regex (avançado)** no STMB
3. Abrir **📐 Configurar regex…**
4. Adicionar esse script à seleção de **entrada**

Agora o STMB limpará a resposta antes de exibi-la na prévia ou salvá-la.

---
<a id="-compaction"></a>
## 🧹 Compactação

A Compactação ajuda quando uma entrada de lorebook gerenciada pelo STMB ainda é útil, mas ficou longa ou repetitiva demais. Em vez de reduzi-la manualmente, você pode pedir à IA que reescreva a entrada de forma mais eficiente em tokens.

Não sabe se deseja usar esta ferramenta ou a Consolidação de Resumos? Use a versão curta acima: **A Compactação limpa uma entrada. A Consolidação combina várias memórias em uma recapitulação de nível superior.**

Esta é uma ferramenta de **revisão antes do salvamento**. O STMB mostra a entrada original e o rascunho compactado antes de substituir qualquer conteúdo.

### O que pode ser compactado?

A Compactação pode listar as seguintes entradas de um Livro de Memória selecionado:

- entradas de Clip
- entradas de rastreador de Prompt Lateral
- entradas de memória do STMB

Ela não exibe entradas comuns de lorebook que não sejam gerenciadas pelo STMB.

### Como usar a Compactação

1. Abra a janela do Memory Books.
2. Clique em **📝 Compactação**.
3. Selecione o **Livro de Memória** que deseja revisar. Caso o chat atual já tenha um Livro de Memória, ele poderá ser selecionado automaticamente.
4. Selecione um **Perfil de Compactação**. Ele determina qual conexão/modelo de IA reescreverá a entrada.
5. Opcional: clique em **Editar Prompt de Compactação** caso queira alterar as instruções de reescrita.
6. Encontre a entrada na tabela e clique em **Compactar Entrada**.
7. Revise o resultado:
   - **Conteúdo original** mostra o que está salvo no momento.
   - **Rascunho compactado** mostra a reescrita da IA.
   - Ambos exibem contagens estimadas de tokens.
8. Edite o rascunho compactado, se necessário.
9. Escolha uma opção:
   - **Substituir pela Versão Compactada** para salvar o rascunho sobre a entrada original.
   - **Copiar Rascunho Compactado** para copiá-lo sem salvar.
   - **Cancelar** para deixar a entrada inalterada.

O STMB nunca deve substituir silenciosamente a entrada original. Caso você não clique em **Substituir pela Versão Compactada**, a entrada do lorebook permanecerá como estava.

### Editando o Prompt de Compactação

O Prompt de Compactação controla como a IA reescreve as entradas. O prompt integrado é deliberadamente conservador: preservar fatos importantes, nomes, pronomes, macros, cabeçalhos delimitadores e marcadores de fim; remover repetições e texto de baixo valor; não inventar nada.

O prompt aceita estes placeholders:

- `{{ENTRY_CONTENT}}` — o conteúdo atual da entrada. Este placeholder é obrigatório.
- `{{ENTRY_KIND}}` — o tipo da entrada, como Clip, SidePrompt ou Memory.
- `{{ENTRY_TITLE}}` — o título da entrada.

Use **Restaurar Padrão** caso seu prompt personalizado pare de funcionar bem.

### Bons usos

Use a Compactação para:

- entradas de Clip longas
- rastreadores de Prompt Lateral que se repetem ao longo do tempo
- entradas de memória corretas, mas inchadas
- entradas sempre ativas que consomem tokens demais

Não a use para:

- criar uma nova memória a partir do chat
- adicionar fatos novos
- corrigir continuidade ausente que nunca esteve na entrada
- editar entradas comuns de lorebook fora do STMB

A Compactação é uma ferramenta de limpeza, não uma ferramenta de geração de memórias.

---

<a id="-settings-that-matter-first"></a>
## ⚙️ Configurações Mais Importantes no Início

Este guia não é a referência completa de configurações. Para ver a lista detalhada de cada configuração, consulte [readme-pt-br.md](../readme-pt-br.md).

Os controles que a maioria dos usuários deve aprender primeiro são:
- **Configurações Atuais do SillyTavern**: usa diretamente sua conexão ativa do ST sem criar um perfil personalizado de provedor
- **Crie seu próprio Perfil do STMB**: permite personalizar o STMB; por exemplo, usar um modelo diferente ou mais barato para memórias e outro para roleplay
- **Ocultar/reexibir mensagens automaticamente**: a economia de tokens que justifica criar memórias!
- **Modo Manual de Lorebook** e **Criar lorebook automaticamente se nenhum existir**: controlam onde as memórias são armazenadas
- **Mostrar prévias de memória**: permite revisar ou editar a saída da IA antes do salvamento
- **Criar resumos de memória automaticamente**: ativa a geração automática de memórias
- **Intervalo do Resumo Automático** e **Buffer do Resumo Automático**: controlam quando a geração automática de memórias é executada
- **Prompts Laterais**: ativam rastreadores

---

<a id="-troubleshooting-when-things-dont-work"></a>
## 🔧 Solução de Problemas (Quando Algo Não Funciona)

Este guia não contém a matriz completa de solução de problemas. Para ver a lista detalhada, consulte [readme-pt-br.md](../readme-pt-br.md).

As verificações iniciais mais rápidas são:

- Verifique se o STMB está ativado e se o item **Livros de Memória** aparece no menu da varinha de extensões
- Caso o resumo automático não seja acionado, confirme que você criou primeiro uma memória manual e que as configurações de intervalo e buffer são razoáveis
- Caso as memórias não possam ser salvas, verifique se um lorebook está vinculado ao chat ou se **Criar lorebook automaticamente se nenhum existir** está ativado
- Caso as memórias não sejam acionadas, verifique se “Delay until recursion” está desativado
- Caso o comportamento de Regex pareça incorreto, confira as seleções dentro de **📐 Configurar regex…**, e não apenas a extensão Regex
- Caso a Consolidação não seja sugerida, confirme que **Solicitar consolidação quando uma camada estiver pronta** está ativado e que a camada de destino está incluída nas **Camadas de Consolidação Automática**

---

<a id="-what-st-memory-books-doesnt-do"></a>
## 🚫 O que o ST Memory Books Não Faz

- **Não é um editor geral de lorebooks:** este guia se concentra nas entradas criadas pelo STMB. Para editar lorebooks de forma geral, use o editor integrado de lorebooks do SillyTavern.

---

<a id="-getting-help--more-info"></a>
## 💡 Ajuda e Mais Informações

- **Informações mais detalhadas:** [readme-pt-br.md](../readme-pt-br.md)
- **Atualizações mais recentes:** [changelog.md](../changelog.md)
- **Suporte da comunidade:** participe da comunidade do SillyTavern no Discord! (Procure a thread 📕ST Memory Books ou envie uma mensagem direta para @tokyoapple para obter ajuda.)
- **Bugs/recursos:** encontrou um bug ou teve uma ótima ideia? Abra uma issue do GitHub neste repositório.

---

<a id="-power-up-with-lorebook-ordering-stlo"></a>
### 📚 Potencialize com a Ordenação de Lorebooks (STLO)

Para organização avançada de memórias e integração mais profunda com a história, use o STMB junto com o [SillyTavern-LorebookOrdering (STLO)](https://github.com/aikohanasaki/SillyTavern-LorebookOrdering/blob/main/guides/STMB%20and%20STLO%20-%20English.md). Consulte o guia para ver boas práticas, instruções de configuração e dicas!
