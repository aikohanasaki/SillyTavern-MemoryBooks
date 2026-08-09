<!--
Copyright (C) 2024–2026 Aiko Hanasaki
SPDX-License-Identifier: AGPL-3.0-only
-->

# Como funciona o SillyTavern Memory Books (STMB)

Esta é uma explicação geral de como o STMB funciona. Ela não se destina a explicar o código! Em vez disso, este documento explica quais informações o STMB reúne, em que ordem elas são enviadas e o que se espera que o modelo retorne.

Use este documento para ajudar a escrever ou editar prompts para o STMB.

## Os 3 Principais Fluxos de Prompt do STMB

O STMB possui três fluxos de trabalho principais:

1. Geração de memória
2. Prompts laterais
3. Consolidação

Eles estão relacionados, mas não esperam o mesmo tipo de saída.

- A geração de memória espera JSON estrito.
- Os prompts laterais normalmente esperam texto simples e limpo (podem usar Markdown ou outros formatos de entrada de lorebook; NÃO USE JSON em prompts laterais).
- A consolidação espera JSON estrito, mas com um esquema diferente do usado pelas memórias.

## I. Geração de Memória

Quando você cria uma memória, o STMB envia um único prompt montado que normalmente contém estas partes, nesta ordem:

1. O prompt de memória selecionado ou o texto da predefinição
   - Este é o bloco de instruções do Gerenciador de Prompts de Resumo.
   - Ele informa ao modelo que tipo de resumo deve escrever e qual estrutura JSON deve retornar.
   - Macros como `{{user}}` e `{{char}}` são resolvidas antes do envio.

2. Contexto opcional de memórias anteriores
   - Se a execução tiver sido configurada para incluir memórias anteriores, elas serão inseridas como contexto somente para leitura.
   - Elas são claramente identificadas como contexto, e não como o conteúdo que deve ser resumido novamente.

3. A transcrição da cena atual
   - O intervalo selecionado do chat é formatado linha por linha como `Falante: mensagem`.
   - Esta é a cena que o modelo realmente deve transformar em uma memória.

Estrutura bastante aproximada:

```text
[prompt de memória / instruções da predefinição]

=== CONTEXTO DE CENAS ANTERIORES (NÃO PROCESSAR) ===
[zero ou mais memórias anteriores]
=== FIM DO CONTEXTO DE CENAS ANTERIORES — PROCESSE SOMENTE A CENA ABAIXO ===

=== TRANSCRIÇÃO DA CENA ===
Alice: ...
Bob: ...
=== FIM DA CENA ===
```

### O que o modelo deve retornar

Esperamos um objeto JSON:

```json
{
  "title": "Título curto da cena",
  "content": "O texto da memória propriamente dita",
  "keywords": ["palavra-chave1", "palavra-chave2", "palavra-chave3"]
}
```

Boas práticas:

- Retorne somente o objeto JSON.
- Use exatamente as chaves `title`, `content` e `keywords`.
- Faça de `keywords` um array JSON real de strings.
- Mantenha o título curto e legível.
- Use palavras-chave concretas e úteis para recuperação: locais, objetos, nomes próprios, ações distintas e identificadores.

Às vezes, o STMB consegue recuperar uma saída levemente desorganizada, mas os prompts não devem depender disso.

### O que caracteriza um bom prompt de memória

Bons prompts de memória fazem quatro coisas com clareza:

1. Informam ao modelo que tipo de memória deve escrever
   - Registro detalhado da cena
   - Sinopse compacta
   - Recapitulação mínima
   - Memória narrativa literária

2. Informam ao modelo o que importa
   - acontecimentos da história
   - decisões
   - mudanças nos personagens
   - revelações
   - resultados
   - detalhes relevantes para a continuidade

3. Informam ao modelo o que ignorar
   - geralmente OOC
   - preenchimento
   - conversas apenas decorativas, caso você queira uma memória mais concisa

4. Informam ao modelo exatamente qual JSON deve retornar

### O que caracteriza um prompt de memória fraco

Prompts fracos normalmente falham de uma destas maneiras:

- Descrevem o estilo de escrita, mas não a estrutura JSON.
- Pedem “análises úteis” ou “opiniões” em vez de um objeto de memória finalizado.
- Incentivam palavras-chave abstratas em vez de termos concretos para recuperação.
- Não distinguem entre o contexto anterior e a cena atual.
- Pedem formatos de saída demais ao mesmo tempo.

### Recomendações práticas para escrever prompts de memória

- Seja explícito sobre se o resumo deve ser exaustivo ou eficiente em tokens.
- Caso queira Markdown dentro de `content`, diga isso claramente.
- Caso queira memórias curtas, limite o corpo, não o esquema JSON.
- Caso queira uma recuperação eficiente, dedique espaço do prompt à qualidade das palavras-chave, não apenas ao estilo do resumo.
- Trate as memórias anteriores como contexto de continuidade, não como material de origem a ser reescrito.

## II. Prompts Laterais

Prompts laterais NÃO são memórias. Eles são prompts de rastreamento/atualização que normalmente escrevem ou sobrescrevem uma entrada separada de lorebook. Este é um conceito muito diferente de uma memória e é extremamente importante ter isso em mente.

Quando um prompt lateral é executado, o STMB normalmente reúne estas partes, nesta ordem:

1. O texto principal de instruções do prompt lateral
   - Este é o prompt da tarefa propriamente dita para aquele rastreador.
   - Macros padrão do ST, como `{{user}}` e `{{char}}`, são resolvidas.
   - Macros personalizadas de tempo de execução também podem ser inseridas em execuções manuais.

2. Entrada anterior opcional
   - Caso o prompt lateral já tenha conteúdo salvo, o STMB pode incluir primeiro a versão atual.
   - Isso permite que o modelo atualize um rastreador existente em vez de reescrevê-lo do zero todas as vezes.

3. Contexto opcional de memórias anteriores
   - Caso o modelo de prompt solicite memórias anteriores, o STMB as insere como contexto somente para leitura.

4. O texto compilado da cena
   - Este é o material da cena atual ao qual o rastreador deve reagir.

5. Orientação opcional sobre o formato da resposta
   - Isso não é imposto como um esquema de parser.
   - É apenas uma instrução adicional sobre o formato de saída desejado.

Estrutura bastante aproximada:

```text
[instruções do prompt lateral]

=== ENTRADA ANTERIOR ===
[texto existente do rastreador, caso exista]

=== CONTEXTO DE CENAS ANTERIORES (NÃO PROCESSAR) ===
[memórias anteriores opcionais]
=== FIM DO CONTEXTO DE CENAS ANTERIORES ===

=== TEXTO DA CENA ===
[texto compilado da cena]

=== FORMATO DA RESPOSTA ===
[orientação opcional sobre o formato]
```

### O que o modelo deve retornar

O STMB espera texto simples pronto para ser salvo.

Esta é a principal diferença em relação às memórias:

- Prompts laterais não devem retornar JSON.
- Normalmente, o STMB salva o texto retornado sem alterações.
- Caso você peça JSON em um prompt lateral, esse JSON será apenas texto, a menos que seu próprio fluxo de trabalho dependa dele.

Isso significa que os prompts laterais devem buscar uma saída final utilizável, e não um JSON de memória adequado para um parser.

### O que caracteriza um bom prompt lateral

Bons prompts laterais são específicos, estáveis e fáceis de atualizar.

Exemplos:

- Manter uma lista de personagens em ordem de importância.
- Rastrear o estado atual de um relacionamento.
- Rastrear fios narrativos não resolvidos.
- Rastrear o que `{{char}}` acredita atualmente sobre `{{user}}`.

A melhor formulação para um prompt lateral normalmente faz o seguinte:

1. Define claramente a tarefa
   - “Manter um rastreador de personagens”
   - “Atualizar a ficha atual do relacionamento”
   - “Manter um relatório de fios não resolvidos”

2. Especifica se deve atualizar, substituir ou acrescentar
   - Isso importa porque o texto da entrada anterior pode ser incluído.

3. Define a estrutura da saída
   - títulos
   - estrutura de marcadores
   - seções
   - regras de ordenação

4. Especifica o que não deve ser incluído
   - especulação
   - itens duplicados
   - informações desatualizadas
   - narração sobre a própria tarefa

### O que caracteriza um prompt lateral fraco

- É amplo demais: “rastreie tudo”.
- Nunca informa se a entrada antiga deve ser revisada ou reescrita.
- Pede raciocínio passo a passo ou explicações em vez do texto final do rastreador.
- Deixa a formatação vaga, fazendo com que o rastreador mude de formato ao longo do tempo.

### Recomendações práticas para escrever prompts laterais

- Escreva prompts laterais como instruções de manutenção, não como prompts de resumo.
- Presuma que o modelo poderá ver primeiro o rastreador atual e depois a nova cena.
- Mantenha cada rastreador concentrado em uma única tarefa.
- Use o campo Formato da Resposta para controlar a estrutura, os nomes das seções e a ordenação.

## III. Consolidação

A consolidação combina entradas de camadas inferiores em resumos de camadas superiores.

Exemplos:

- memórias em resumos de Arco
- resumos de Arco em resumos de Capítulo
- resumos de Capítulo em resumos de Livro

Quando a consolidação é executada, o STMB normalmente reúne estas partes, nesta ordem:

1. O prompt de consolidação selecionado ou o texto da predefinição
   - Ele explica como o modelo deve condensar as entradas de origem.
   - Também define o esquema JSON que o modelo deve retornar.

2. Resumo anterior opcional da camada superior
   - Caso um resumo anterior dessa camada seja levado adiante, ele é incluído primeiro como contexto canônico.
   - O prompt informa ao modelo que ele não deve ser reescrito.

3. As entradas selecionadas da camada inferior em ordem cronológica
   - Cada item de origem é incluído com um identificador, título e conteúdo.
   - Este é o material que o modelo deve agrupar, condensar e transformar em resumos de uma camada superior.

Estrutura bastante aproximada:

```text
[prompt de consolidação / instruções da predefinição]

=== ARCO/CAPÍTULO/LIVRO ANTERIOR (CÂNONE — NÃO REESCREVA) ===
[resumo anterior opcional da camada superior]
=== FIM DO ARCO/CAPÍTULO/LIVRO ANTERIOR ===

=== MEMÓRIAS / ARCOS / CAPÍTULOS ===
=== memória 001 ===
Título: ...
Conteúdo: ...
=== fim da memória 001 ===

=== memória 002 ===
Título: ...
Conteúdo: ...
=== fim da memória 002 ===
...
=== FIM DAS MEMÓRIAS / DOS ARCOS / DOS CAPÍTULOS ===
```

### O que o modelo deve retornar

O STMB espera um objeto JSON com esta estrutura:

```json
{
  "summaries": [
    {
      "title": "Título curto da camada superior",
      "summary": "O texto da recapitulação consolidada",
      "keywords": ["palavra-chave1", "palavra-chave2"],
      "member_ids": ["001", "002"]
    }
  ],
  "unassigned_items": [
    {
      "id": "003",
      "reason": "Motivo pelo qual este item foi deixado de fora"
    }
  ]
}
```

Ideia importante:

- A consolidação pode retornar um resumo ou vários.
- `member_ids` informa ao STMB quais entradas de origem pertencem a cada resumo retornado.
- `unassigned_items` é a forma de o modelo dizer: “esta entrada não se encaixa no resumo que acabei de criar”.

### O que caracteriza um bom prompt de consolidação

Bons prompts de consolidação fazem três coisas bem:

1. Definem o objetivo da condensação
   - um arco
   - um ou mais arcos
   - uma recapitulação concisa, mas completa
   - uma recapitulação condensada de forma agressiva

2. Definem a lógica de seleção
   - preservar a cronologia
   - manter a continuidade
   - combinar itens relacionados
   - deixar itens não relacionados como não atribuídos

3. Definem com muita clareza a estrutura JSON

Os melhores prompts de consolidação também informam ao modelo o que preservar:

- acontecimentos importantes
- pontos de virada
- promessas
- consequências
- fios não resolvidos
- mudanças nos relacionamentos
- citações ou identificadores essenciais para a continuidade

### O que caracteriza um prompt de consolidação fraco

- Pede uma recapitulação, mas nunca explica como agrupar as entradas de origem.
- Não informa ao modelo o que fazer com itens discrepantes.
- Não exige `member_ids`.
- Pede prosa livre em vez do objeto JSON de consolidação.
- Concentra-se demais no estilo e especifica de menos a seleção e o agrupamento.

### Recomendações práticas para escrever prompts de consolidação

- Informe ao modelo se você quer uma única recapitulação coerente ou o menor número coerente de recapitulações.
- Exija cronologia.
- Exija o tratamento explícito dos itens restantes.
- Também mantenha as palavras-chave concretas aqui; resumos de camadas superiores ainda precisam ter valor para recuperação.

## A Verdadeira Regra para Escrever Prompts

Ao escrever para o STMB, não pense apenas: “O que eu quero que a IA diga?”

Pense:

1. Que contexto o STMB colocará antes da cena?
2. Qual é a unidade real de material que está sendo analisada?
3. Este fluxo espera JSON estrito ou texto simples finalizado?
4. Quais informações devem sobreviver para serem recuperadas mais tarde?
5. O que o modelo deve ignorar, compactar, preservar ou levar adiante?

Caso seu prompt responda claramente a essas cinco perguntas, ele normalmente funcionará bem com o STMB.

## Observações em Formato de Perguntas Frequentes

- “Posso ver o que realmente foi enviado à IA?”
  Sim. Verifique a saída do terminal/log caso queira inspecionar o prompt montado.

- “O STMB garante uma boa saída caso meu prompt seja fraco?”
  Na verdade, não. Às vezes, o STMB consegue recuperar JSON malformado, mas não consegue corrigir um prompt vago que pediu a coisa errada.

- “O que devo otimizar primeiro ao reescrever prompts?”
  Primeiro, otimize o formato de retorno. Depois, otimize quais detalhes devem ser preservados. O estilo vem depois disso.
