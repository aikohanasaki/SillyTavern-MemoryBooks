<!--
Copyright (C) 2024–2026 Aiko Hanasaki
SPDX-License-Identifier: AGPL-3.0-only
-->

# 🎡 Prompts Laterais

Prompts Laterais são execuções adicionais de prompts do STMB usadas para manutenção do chat. Eles podem analisar, rastrear, resumir, limpar ou atualizar anotações de apoio sem obrigar a resposta normal do personagem a fazer todo esse trabalho. Use-os quando um chat precisar de um rastreador contínuo, relatório de relacionamento, lista de pontos da trama, registro de invenções, ficha de status de NPCs, linha do tempo ou documento de apoio semelhante. O personagem pode continuar o roleplay. O Prompt Lateral cuida da papelada. ❤️

## Sumário

- [O que São Prompts Laterais](#o-que-são-prompts-laterais)
- [Quando Usá-los](#quando-usá-los)
- [Passo a Passo da Configuração Rápida](#passo-a-passo-da-configuração-rápida)
- [Como as Execuções Funcionam](#como-as-execuções-funcionam)
- [Execuções Manuais](#execuções-manuais)
- [Execuções Automáticas Após a Memória](#execuções-automáticas-após-a-memória)
- [Conjuntos de Prompts Laterais](#conjuntos-de-prompts-laterais)
- [Macros](#macros)
- [Intervalos de Mensagens](#intervalos-de-mensagens)
- [Como Escrever Bons Prompts Laterais](#como-escrever-bons-prompts-laterais)
- [Exemplos](#exemplos)
- [Solução de Problemas](#solução-de-problemas)
- [Principais Conclusões](#principais-conclusões)

---

## O que São Prompts Laterais

Um Prompt Lateral é um prompt nomeado que é executado separadamente da resposta normal do personagem.

Ele pode produzir ou atualizar:

- rastreadores de trama
- rastreadores de relacionamento
- anotações sobre NPCs ou facções
- listas de inventário ou recursos
- linhas do tempo
- quadros de mistérios ou pistas
- rastreadores de invenções ou projetos
- relatórios de continuidade
- anotações de limpeza
- entradas de apoio no estilo lorebook

Prompts Laterais são diferentes de memórias normais. As memórias geralmente salvam resumos de cenas em sequência. Prompts Laterais normalmente mantêm um documento contínuo sobre o estado atual, que é atualizado ou sobrescrito.

Eles também **não** precisam retornar JSON. Texto simples e Markdown são aceitáveis, a menos que o prompt específico ou o destino de salvamento exija algo mais rígido.

---

## Quando Usá-los

Use Prompts Laterais para trabalhos estruturados de apoio.

Bons usos:

- **Pontos da trama:** fios ativos, fios resolvidos, pontas soltas
- **Relacionamentos:** confiança, tensão, atração, limites, objetivos
- **NPCs:** o que cada NPC sabe, deseja, fez recentemente ou precisa fazer em seguida
- **Linha do tempo:** datas, viagens, ferimentos, prazos, contagens regressivas
- **Estado do mundo:** locais, objetos, facções e recursos que mudaram
- **Mistérios:** pistas, suspeitos, contradições, perguntas sem resposta
- **Projetos:** invenções, pesquisas, bloqueios, desvio de escopo, próximos passos
- **Continuidade:** possíveis riscos de alucinação ou contexto ausente

Maus usos:

- qualquer coisa que precise aparecer dentro da próxima resposta do personagem
- prompts vagos como “melhore a história”
- prompts enormes de análise que produzem ensaios a cada execução
- resumos de memória duplicados sem uma função separada

Prompts Laterais não são mágicos. Um Prompt Lateral vago é apenas imprecisão organizada.

---

## Passo a Passo da Configuração Rápida

Precisa da versão explicada clique por clique? Use o [passo a passo do Scribe para ativar Prompts Laterais](https://scribehow.com/viewer/How_to_Enable_Side_Prompts_in_Memory_Books__fif494uSSjCmxE2ZCmRGxQ).

O caminho curto é: abra **Extensões**, abra **Livros de Memória**, clique em **Prompts Laterais**, escolha o prompt desejado, ative-o, habilite opcionalmente **Executar automaticamente após a memória** e depois clique em **Salvar** e **Fechar**.

---

## Como as Execuções Funcionam

Uma execução normal de Prompt Lateral segue este fluxo básico:

1. O STMB escolhe as mensagens que serão analisadas.
2. O Prompt Lateral é preparado.
3. As macros necessárias são preenchidas.
4. O modelo gera a saída do Prompt Lateral.
5. O STMB verifica a saída.
6. O resultado é exibido para prévia, salvo, atualizado ou ignorado de acordo com as configurações do Prompt Lateral.

Prompts Laterais manuais, Prompts Laterais após a memória e linhas de Conjuntos de Prompts Laterais devem funcionar como partes do mesmo sistema. Eles compartilham o mesmo comportamento geral para prévias, processamento em lotes, verificação de respostas vazias, salvamento, interrupções e notificações.

---

## Execuções Manuais

Use `/sideprompt` para executar manualmente um Prompt Lateral.

Formato básico:

```txt
/sideprompt "Nome do Prompt"
```

Com um intervalo de mensagens:

```txt
/sideprompt "Nome do Prompt" 10-20
```

Com uma macro de tempo de execução:

```txt
/sideprompt "Rastreador de Relacionamento" {{npc name}}="Alice" 10-20
```

Use aspas ao redor de nomes de prompts que contenham espaços.

Execuções manuais são mais adequadas para verificações pontuais, atualizações direcionadas e prompts que precisam de valores personalizados de macro.

---

## Execuções Automáticas Após a Memória

Alguns Prompts Laterais podem ser executados automaticamente depois que uma memória é criada.

Isso é útil quando um rastreador precisa permanecer atualizado conforme o chat avança. Por exemplo, um rastreador de relacionamento ou de pontos da trama pode ser atualizado depois de cada memória.

Há dois modos de execução após a memória:

- **Usar prompts laterais ativados individualmente** — comportamento antigo; qualquer Prompt Lateral com **Executar automaticamente após a memória** ativado pode ser executado.
- **Usar um Conjunto de Prompts Laterais nomeado** — o conjunto selecionado é executado no lugar deles.

Um Conjunto de Prompts Laterais selecionado substitui os Prompts Laterais após a memória ativados individualmente. Ele **não** é acrescentado a eles. Isso evita execuções duplicadas causadas por caixas antigas que o usuário esqueceu de desmarcar.

---

## Conjuntos de Prompts Laterais

Conjuntos de Prompts Laterais agrupam vários Prompts Laterais em um único fluxo de trabalho ordenado.

Um conjunto é uma lista ordenada de execuções, não apenas uma pasta. O mesmo Prompt Lateral pode aparecer mais de uma vez com valores de macro diferentes.

Exemplo de conjunto:

1. Rastreador de Relacionamento com `{{npc name}} = Alice`
2. Rastreador de Relacionamento com `{{npc name}} = Bob`
3. Rastreador de Pontos da Trama
4. Anotações de Limpeza da Cena

Isso permite que um único modelo de prompt mantenha entradas separadas para diferentes NPCs, facções, locais ou projetos.

### Gerenciamento de Conjuntos

Abra **🎡 Rastreadores e Prompts Laterais** para criar, editar, duplicar, excluir ou reordenar conjuntos.

Cada linha pode incluir:

- um Prompt Lateral
- um rótulo opcional para a linha
- valores de macro armazenados
- controles para duplicar ou excluir
- controles para mover para cima ou para baixo

As linhas são executadas de cima para baixo. Coloque primeiro os rastreadores fundamentais e depois os prompts de limpeza ou elaboração de relatórios.

### Execução Manual de um Conjunto

Execute um conjunto usando seus valores armazenados:

```txt
/sideprompt-set "Nome do Conjunto"
```

Com um intervalo:

```txt
/sideprompt-set "Nome do Conjunto" 10-20
```

Execute um conjunto reutilizável com valores de macro:

```txt
/sideprompt-macroset "Passagem de Relacionamentos" {{npc_1}}="Alice" {{npc_2}}="Bob" 10-20
```

Use `/sideprompt-macroset` quando o conjunto tiver tokens reutilizáveis que ainda precisem receber valores.

### Conjuntos ou Linhas Ausentes

Conjuntos de Prompts Laterais são rígidos de propósito:

- Se nenhum conjunto estiver selecionado, será usado o comportamento de prompts laterais após a memória ativados individualmente.
- Se um conjunto estiver selecionado, os prompts laterais após a memória ativados individualmente serão ignorados.
- Se o conjunto selecionado tiver sido excluído, nada será executado e o STMB exibirá um aviso.
- Se uma linha apontar para um prompt excluído, essa linha será ignorada e o STMB exibirá um aviso.
- Se uma linha ainda precisar de um valor de macro, essa linha será ignorada e o STMB exibirá um aviso.

Uma substituição silenciosa seria pior. Se um fluxo de trabalho selecionado estiver quebrado, você deve saber disso.

---

## Macros

Prompts Laterais podem usar macros normais do SillyTavern, como `{{user}}` e `{{char}}`.

Eles também podem usar macros de tempo de execução, que são placeholders preenchidos quando o Prompt Lateral é executado.

Exemplo de macro de tempo de execução:

```txt
{{npc name}}
```

Execução manual:

```txt
/sideprompt "Rastreador de Relacionamento" {{npc name}}="Alice"
```

Valor armazenado no conjunto:

```txt
{{npc name}} = Alice
```

Valor reutilizável no nível do conjunto:

```txt
{{npc name}} = {{npc_1}}
```

Depois, execute:

```txt
/sideprompt-macroset "Passagem de Relacionamentos" {{npc_1}}="Alice"
```

### Dicas para Macros

Use nomes simples:

```txt
{{npc name}}
{{npc_1}}
{{faction}}
{{project_name}}
```

Evite nomes como:

```txt
{{the guy we mean}}
{{stuff}}
{{important person}}
```

Espaços são fáceis de ler na interface. Sublinhados geralmente causam menos incômodo em comandos de barra.

Um Prompt Lateral com macros personalizadas de tempo de execução não deve ser automatizado individualmente, a menos que os valores necessários estejam armazenados em algum lugar, como dentro de uma linha de um Conjunto de Prompts Laterais. Execuções automáticas não podem parar para perguntar quem `{{npc name}}` deveria ser.

---

## Intervalos de Mensagens

Prompts Laterais podem ser executados sobre um intervalo específico de mensagens.

```txt
/sideprompt "Pontos da Trama" 50-80
```

Se você informar um intervalo, o STMB usará esse intervalo.

Se você não informar um intervalo, o STMB usará o comportamento normal de processar desde a última execução do Prompt Lateral, respeitando a lógica existente de limite e ponto de controle.

Para rastreamento rotineiro, o comportamento desde a última execução é mais fácil. Para depuração ou limpeza direcionada, intervalos explícitos são mais claros.

A compilação de intervalos para Prompts Laterais deve seguir a mesma preferência de mensagens ocultas usada pela memória, incluindo a configuração global para reexibir mensagens antes da geração de memória.

---

## Como Escrever Bons Prompts Laterais

Um bom Prompt Lateral tem uma função. Um Prompt Lateral ruim tem apenas uma vibe.

Seja claro sobre:

- o que ele deve analisar
- o que ele deve atualizar
- o que ele deve ignorar
- qual formato deve produzir
- qual deve ser o tamanho da saída
- se deve substituir, revisar ou acrescentar conteúdo

### Mantenha a Saída Curta de Propósito

Rastreadores ficam inchados quando não são instruídos a evitar isso.

Fraco:

```txt
Atualize o rastreador de relacionamento.
```

Melhor:

```txt
Atualize o rastreador de relacionamento. Preserve fatos úteis, remova detalhes resolvidos ou obsoletos e mantenha cada entrada em 1 a 3 marcadores concisos. Retorne somente o rastreador atualizado.
```

Restrições úteis:

```txt
Não acrescente uma nova seção, a menos que haja informações realmente novas. Quando possível, incorpore as atualizações às entradas existentes.
```

```txt
Remova fios resolvidos. Não preserve especulações desatualizadas apenas porque apareciam no rastreador antigo.
```

```txt
Retorne somente o relatório atualizado. Sem comentários, explicações ou introdução.
```

### Use Títulos Estáveis

Títulos estáveis tornam atualizações repetidas mais limpas.

Bom:

```md
# Rastreador de Relacionamento

## Estado Atual

## Mudanças Recentes

## Tensões em Aberto

## Próximos Desenvolvimentos Prováveis
```

Ruim:

```md
# Aqui está minha análise extensa e emocionalmente inteligente de tudo que talvez esteja acontecendo
```

### Não Peça Tudo

Um Prompt Lateral que pede todos os detalhes geralmente produzirá todos os detalhes.

Escolha o que importa. Um rastreador de trama normalmente precisa do gancho não resolvido, do que mudou, de quem sabe e do que precisa de acompanhamento. Ele não precisa de cada expressão facial da cena.

### Torne o Uso de Macros Óbvio

Bons nomes:

```txt
Rastreador de Relacionamento - {{npc name}}
Status do NPC - {{npc name}}
Rastreador de Facção - {{faction}}
```

Nomes menos úteis:

```txt
Rastreador 3
Atualizar coisa
Prompt diverso de relacionamento
```

Os usuários não deveriam precisar abrir todo o corpo do prompt para entender por que ele está solicitando um valor.

---

## Exemplos

### Rastreador de Pontos da Trama

Use isto quando um chat tiver várias linhas narrativas ativas.

```txt
Atualize o rastreador de pontos da trama com base nas mensagens selecionadas. Mantenha apenas fios ativos ou resolvidos recentemente. Agrupe por linha narrativa. Retorne somente o rastreador atualizado.
```

Estrutura sugerida:

```md
# Pontos da Trama

## Fios Ativos

1. **Artefato desaparecido** — Estado atual e pista mais recente.
2. **Facção rival** — O que deseja e o que mudou.

## Resolvidos Recentemente

1. **Antigo mal-entendido** — Resolvido quando Alice contou a verdade a Bob.

## Precisa de Acompanhamento

1. Quem está com a chave?
2. Por que o guarda mentiu?
```

### Rastreador de Relacionamento com Macro

O prompt exige:

```txt
{{npc name}}
```

Execução manual:

```txt
/sideprompt "Rastreador de Relacionamento" {{npc name}}="Alice" 10-40
```

Linhas do conjunto:

| Linha | Prompt Lateral | Macro Armazenada |
|---|---|---|
| 1 | Rastreador de Relacionamento | `{{npc name}} = Alice` |
| 2 | Rastreador de Relacionamento | `{{npc name}} = Bob` |

Isso evita a necessidade de criar definições de prompt separadas para cada NPC.

### Rastreador de Invenção ou Projeto

Use isto quando um usuário continuar inventando, pesquisando, construindo ou modificando algo ao longo do tempo.

```txt
Atualize o rastreador do projeto. Registre apenas mudanças significativas no objetivo, progresso, bloqueios, escopo, dependências ou relevância para a história. Mantenha as entradas concisas e ordenadas pela primeira aparição.
```

Isso geralmente é mais limpo do que salvar dez entradas de memória que apenas repetem que o projeto existe.

### Passagem Reutilizável pelo Elenco

Crie um conjunto usando tokens de tempo de execução no nível do conjunto:

```txt
{{npc_1}}
{{npc_2}}
```

Execute-o:

```txt
/sideprompt-macroset "Passagem pelo Elenco" {{npc_1}}="Alice" {{npc_2}}="Bob"
```

Reutilize-o mais tarde:

```txt
/sideprompt-macroset "Passagem pelo Elenco" {{npc_1}}="Mira" {{npc_2}}="Jonas"
```

Mesmo conjunto. Elenco diferente. 💡

---

## Solução de Problemas

### Meu Prompt Lateral não foi executado após a memória.

Verifique:

- A memória realmente foi executada?
- O Prompt Lateral está ativado para execuções após a memória?
- O chat está usando **Usar prompts laterais ativados individualmente**?
- O chat está usando um Conjunto de Prompts Laterais no lugar deles?
- O prompt precisa de um valor de macro que não foi fornecido?
- O prompt foi excluído, renomeado ou movido?

Se o chat usar um Conjunto de Prompts Laterais, as caixas de prompts laterais ativados individualmente para execução após a memória serão ignoradas nesse chat.

### Meu Conjunto de Prompts Laterais não foi executado.

Verifique:

- O conjunto está selecionado para este chat?
- O conjunto ainda existe?
- Todas as linhas apontam para Prompts Laterais existentes?
- Todas as macros obrigatórias possuem valores armazenados ou fornecidos?

Execuções automáticas não podem solicitar valores ausentes. Armazene os valores das macros no conjunto ou execute-o manualmente com `/sideprompt-macroset`.

### Uma linha foi ignorada.

Causas prováveis:

- o Prompt Lateral referenciado foi excluído
- o Prompt Lateral referenciado foi renomeado
- a linha possui macros não resolvidas
- o modelo retornou uma resposta vazia ou inválida

O STMB deve exibir um aviso em vez de fingir que tudo funcionou.

### A saída é longa demais.

Adicione limites rígidos:

```txt
Mantenha a saída completa abaixo de 300 palavras.
```

```txt
Use no máximo 5 itens ativos.
```

```txt
Combine detalhes relacionados. Remova detalhes desatualizados, resolvidos ou redundantes.
```

Os modelos não sabem naturalmente quando um rastreador se tornou grande a ponto de perder a utilidade. Diga isso a eles.

### Foi executado duas vezes.

Verifique se há:

- execução manual junto com execução automática
- linhas duplicadas dentro de um conjunto
- cópias repetidas do mesmo Prompt Lateral
- vários chats ou abas acionando trabalho quase ao mesmo tempo

Um Conjunto de Prompts Laterais selecionado deve substituir os prompts laterais após a memória ativados individualmente, o que evita uma causa comum de execuções duplicadas.

### As mensagens erradas foram analisadas.

Use um intervalo explícito:

```txt
/sideprompt "Pontos da Trama" 50-80
```

O comportamento desde a última execução é conveniente. Intervalos explícitos são melhores para depuração.

### O rastreador continua mantendo informações desatualizadas.

Instrua o Prompt Lateral a remover informações desatualizadas.

```txt
Atualize o rastreador. Remova especulações obsoletas, conflitos resolvidos e detalhes contraditos pelas mensagens selecionadas.
```

Rastreadores não permanecem limpos por acidente.

---

## Principais Conclusões

### Para Usuários

Use Prompts Laterais quando quiser ajuda estruturada para manter um chat longo.

Execuções manuais são mais adequadas para análises pontuais. Execuções após a memória ou Conjuntos de Prompts Laterais são mais adequados para rastreadores que precisam permanecer atualizados.

### Para Criadores de Bots

Crie Prompts Laterais como ferramentas de manutenção, não como prosa de roleplay.

Use títulos estáveis, regras rígidas de saída e comportamentos claros de atualização. Use macros quando um único prompt precisar funcionar para vários NPCs, facções, locais ou projetos.

### Para Administradores

Prompts Laterais acrescentam mais trabalho de geração.

Por isso, devem ser previsíveis, inspecionáveis e entediantes no melhor sentido possível. Os conjuntos ajudam porque tornam o fluxo de trabalho pretendido explícito, em vez de deixá-lo perdido em uma sopa de caixas de seleção.
