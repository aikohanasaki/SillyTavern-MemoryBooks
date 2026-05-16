# Fonctionnement de SillyTavern Memory Books (STMB)

Voici une explication de haut niveau du fonctionnement de STMB. Ce document n'est pas là pour expliquer le code. Il explique plutôt quelles informations STMB assemble, dans quel ordre elles sont envoyées, et ce que le modèle est censé renvoyer.

Servez-vous de ce document pour vous aider à écrire ou modifier des prompts pour STMB.

## Les 3 grands flux de prompts STMB

STMB a trois grands flux de travail :

1. Génération de mémoire
2. Suivis et prompts secondaires
3. Consolidation

Ils sont liés, mais ils n'attendent pas le même type de sortie.

- La génération de mémoire attend un JSON strict.
- Les suivis et prompts secondaires attendent en général un texte brut propre (vous pouvez utiliser du Markdown ou d'autres formats d'entrée de lorebook, N'UTILISEZ PAS de JSON dans les prompts secondaires).
- La consolidation attend aussi un JSON strict, mais dans un schéma différent de celui des mémoires.

## I. Génération de mémoire

Quand vous créez une mémoire, STMB envoie un prompt assemblé qui contient en général ces parties dans cet ordre :

1. Le texte du prompt de mémoire ou du préréglage sélectionné
   - C'est le bloc d'instructions provenant du Gestionnaire de Prompts de Résumé.
   - Il indique au modèle quel genre de résumé produire et quel schéma JSON renvoyer.
   - Les macros comme `{{user}}` et `{{char}}` sont résolues avant l'envoi.

2. Contexte optionnel de mémoires précédentes
   - Si l'exécution a été configurée pour inclure des mémoires précédentes, elles sont ajoutées comme contexte en lecture seule.
   - Elles sont clairement marquées comme contexte et non comme l'élément à résumer de nouveau.

3. La transcription de la scène actuelle
   - La plage de chat sélectionnée est formatée ligne par ligne sous la forme `Intervenant : message`.
   - C'est la scène que le modèle doit transformer en mémoire.

Forme très simplifiée :

```text
[instructions du prompt / préréglage de mémoire]

=== PREVIOUS SCENE CONTEXT (DO NOT PROCESS) ===
[zéro ou plusieurs mémoires précédentes]
=== END PREVIOUS SCENE CONTEXT - PROCESS ONLY THE SCENE BELOW ===

=== SCENE TRANSCRIPT ===
Alice: ...
Bob: ...
=== END SCENE ===
```

### Ce que le modèle doit renvoyer

On attend un objet JSON unique :

```json
{
  "title": "Short scene title",
  "content": "The actual memory text",
  "keywords": ["keyword1", "keyword2", "keyword3"]
}
```

Bonne pratique :

- Renvoyer uniquement l'objet JSON.
- Utiliser exactement les clés `title`, `content` et `keywords`.
- Faire de `keywords` un vrai tableau JSON de chaînes.
- Garder `title` court et lisible.
- Faire en sorte que les `keywords` soient concrets et utiles pour la récupération : lieux, objets, noms propres, actions distinctives, identifiants.

STMB peut parfois rattraper une sortie légèrement brouillonne, mais vos prompts ne doivent pas compter là-dessus.

### Ce qui fait un bon prompt de mémoire

Un bon prompt de mémoire fait clairement quatre choses :

1. Il dit au modèle quel genre de mémoire écrire
   - Journal de scène détaillé
   - Synopsis compact
   - Récapitulatif minimal
   - Mémoire narrative plus littéraire

2. Il dit au modèle ce qui compte
   - points d'intrigue
   - décisions
   - changements chez les personnages
   - révélations
   - résultats
   - détails utiles pour la continuité

3. Il dit au modèle ce qu'il doit ignorer
   - en général le OOC / HRP
   - le remplissage
   - les échanges purement d'ambiance si vous voulez une mémoire plus serrée

4. Il dit au modèle exactement quel JSON renvoyer

### Ce qui fait un prompt de mémoire faible

Un prompt faible échoue en général d'une de ces manières :

- Il décrit le style d'écriture, mais pas la forme JSON.
- Il demande une "analyse utile" ou des "réflexions" au lieu d'un objet mémoire final.
- Il pousse vers des mots-clés abstraits au lieu de termes concrets utiles à la récupération.
- Il ne distingue pas le contexte précédent de la scène actuelle.
- Il demande trop de formats de sortie en même temps.

### Conseils pratiques pour écrire des prompts de mémoire

- Dites clairement si le résumé doit être exhaustif ou économe en tokens.
- Si vous voulez du Markdown dans `content`, dites-le sans ambiguïté.
- Si vous voulez des mémoires courtes, contraignez le corps du texte, pas le schéma JSON.
- Si vous voulez une bonne récupération, consacrez une partie du prompt à la qualité des mots-clés, pas seulement au style du résumé.
- Traitez les mémoires précédentes comme du contexte de continuité, pas comme de la matière à réécrire.

## II. Suivis et prompts secondaires

Les suivis et prompts secondaires NE SONT PAS des mémoires. Ce sont des prompts de suivi ou de mise à jour qui écrivent en général ou remplacent une entrée de lorebook séparée. C'est un concept très différent d'une mémoire, et il faut vraiment garder cela en tête.

Quand un prompt secondaire s'exécute, STMB assemble en général ces parties dans cet ordre :

1. Le texte principal du prompt secondaire
   - C'est le véritable prompt de travail pour ce suivi.
   - Les macros standard de ST comme `{{user}}` et `{{char}}` sont résolues.
   - Des macros d'exécution personnalisées peuvent aussi être insérées pour les lancements manuels.

2. Entrée précédente optionnelle
   - Si ce prompt secondaire a déjà un contenu enregistré, STMB peut d'abord insérer sa version actuelle.
   - Cela permet au modèle de mettre à jour un suivi existant au lieu de repartir de zéro à chaque fois.

3. Contexte optionnel de mémoires précédentes
   - Si le modèle le demande, STMB insère des mémoires précédentes comme contexte en lecture seule.

4. Le texte compilé de la scène
   - C'est la matière de la scène actuelle à laquelle le suivi doit réagir.

5. Consignes optionnelles de format de réponse
   - Ce n'est pas appliqué comme un schéma d'analyse.
   - Ce sont simplement des instructions supplémentaires sur la forme de sortie voulue.

Forme très simplifiée :

```text
[instructions du prompt secondaire]

=== PRIOR ENTRY ===
[texte du suivi existant, le cas échéant]

=== PREVIOUS SCENE CONTEXT (DO NOT PROCESS) ===
[mémoires précédentes optionnelles]
=== END PREVIOUS SCENE CONTEXT ===

=== SCENE TEXT ===
[texte compilé de la scène]

=== RESPONSE FORMAT ===
[consignes de format optionnelles]
```

### Ce que le modèle doit renvoyer

STMB attend un texte brut prêt à être enregistré.

Voilà la différence clé avec les mémoires :

- Les prompts secondaires ne veulent pas de JSON.
- STMB enregistre normalement le texte renvoyé tel quel.
- Si vous demandez du JSON dans un prompt secondaire, ce JSON ne sera qu'un texte, sauf si votre propre workflow en dépend.

Cela signifie qu'un prompt secondaire doit viser une sortie finale directement exploitable, pas un JSON optimisé pour l'analyse des mémoires.

### Ce qui fait un bon prompt secondaire

Un bon prompt secondaire est étroit, stable et facile à mettre à jour.

Exemples :

- Tenir une liste des personnages par ordre d'importance.
- Suivre l'état actuel des relations.
- Suivre les fils d'intrigue non résolus.
- Suivre ce que `{{char}}` pense actuellement de `{{user}}`.

La meilleure formulation pour un prompt secondaire fait en général ceci :

1. Définir clairement la tâche
   - "Maintiens un suivi des personnages"
   - "Mets à jour la fiche relationnelle actuelle"
   - "Garde un rapport des fils non résolus"

2. Dire s'il faut mettre à jour, remplacer ou ajouter
   - C'est important parce qu'un texte précédent peut être inclus.

3. Définir la structure de sortie
   - titres
   - structure en puces
   - sections
   - règles d'ordre

4. Dire ce qu'il ne faut pas inclure
   - spéculation
   - doublons
   - informations périmées
   - narration sur la tâche elle-même

### Ce qui fait un prompt secondaire faible

- Il est trop large : "suis absolument tout".
- Il ne dit jamais si l'ancienne entrée doit être révisée ou réécrite.
- Il demande une chaîne de pensée ou des explications au lieu d'un texte final de suivi.
- Il laisse le format trop vague, donc le suivi se dégrade avec le temps.

### Conseils pratiques pour écrire des prompts secondaires

- Écrivez les prompts secondaires comme des consignes de maintenance, pas comme des prompts de résumé.
- Partez du principe que le modèle peut voir le suivi actuel d'abord, puis la nouvelle scène.
- Gardez chaque suivi centré sur une seule tâche.
- Utilisez le champ Format de Réponse pour contrôler la mise en page, les noms de section et l'ordre.

## III. Consolidation

La consolidation regroupe des entrées de niveau inférieur en résumés de niveau supérieur.

Exemples :

- mémoires vers résumés d'arc
- résumés d'arc vers résumés de chapitre
- résumés de chapitre vers résumés de livre

Quand une consolidation s'exécute, STMB assemble en général ces parties dans cet ordre :

1. Le texte du prompt de consolidation ou du préréglage sélectionné
   - Il explique au modèle comment compresser les entrées source.
   - Il définit aussi le schéma JSON que le modèle doit renvoyer.

2. Résumé précédent optionnel du niveau supérieur
   - Si un résumé précédent de ce niveau est reconduit, il est inclus en premier comme contexte canonique.
   - Le prompt indique au modèle de ne pas le réécrire.

3. Les entrées du niveau inférieur sélectionnées, dans l'ordre chronologique
   - Chaque élément source est inclus avec un identifiant, un titre et son contenu.
   - C'est la matière que le modèle doit regrouper, compresser et transformer en résumés de niveau supérieur.

Forme très simplifiée :

```text
[instructions du prompt / préréglage de consolidation]

=== PREVIOUS ARC/CHAPTER/BOOK (CANON - DO NOT REWRITE) ===
[résumé précédent de niveau supérieur, si présent]
=== END PREVIOUS ... ===

=== MEMORIES / ARCS / CHAPTERS ===
=== memory 001 ===
Title: ...
Contents: ...
=== end memory 001 ===

=== memory 002 ===
Title: ...
Contents: ...
=== end memory 002 ===
...
=== END ... ===
```

### Ce que le modèle doit renvoyer

STMB attend un objet JSON de cette forme :

```json
{
  "summaries": [
    {
      "title": "Short higher-tier title",
      "summary": "The consolidated recap text",
      "keywords": ["keyword1", "keyword2"],
      "member_ids": ["001", "002"]
    }
  ],
  "unassigned_items": [
    {
      "id": "003",
      "reason": "Why this item was left out"
    }
  ]
}
```

Idée importante :

- La consolidation peut renvoyer un seul résumé ou plusieurs.
- `member_ids` indique à STMB quelles entrées source appartiennent à quel résumé renvoyé.
- `unassigned_items` est la manière pour le modèle de dire : "cette entrée ne rentre pas dans le résumé que je viens de produire".

### Ce qui fait un bon prompt de consolidation

Un bon prompt de consolidation fait bien trois choses :

1. Il définit la cible de compression
   - un seul arc
   - un ou plusieurs arcs
   - un récapitulatif compact mais complet
   - un récapitulatif compressé de façon agressive

2. Il définit la logique de sélection
   - respecter la chronologie
   - conserver la continuité
   - fusionner les éléments liés
   - laisser de côté les éléments sans rapport dans `unassigned_items`

3. Il définit très clairement la structure JSON

Les meilleurs prompts de consolidation disent aussi au modèle ce qu'il faut préserver :

- grands points d'intrigue
- tournants
- promesses
- conséquences
- fils non résolus
- évolutions relationnelles
- citations ou identifiants cruciaux pour la continuité

### Ce qui fait un prompt de consolidation faible

- Il demande un récapitulatif, mais n'explique jamais comment grouper les entrées source.
- Il ne dit pas quoi faire des éléments hors sujet.
- Il n'exige pas `member_ids`.
- Il demande de la prose libre au lieu de l'objet JSON de consolidation.
- Il survalorise le style et sous-définit la sélection et le regroupement.

### Conseils pratiques pour écrire des prompts de consolidation

- Dites au modèle si vous voulez un seul récapitulatif cohérent ou le plus petit nombre cohérent de récapitulatifs.
- Exigez le respect de la chronologie.
- Exigez une gestion explicite des restes.
- Gardez ici aussi des mots-clés concrets ; les résumés de niveau supérieur doivent eux aussi rester utiles pour la récupération.

## La vraie règle d'écriture des prompts

Quand vous écrivez pour STMB, ne vous demandez pas seulement : "Qu'est-ce que je veux que l'IA dise ?"

Demandez-vous plutôt :

1. Quel contexte STMB va-t-il placer avant la scène ?
2. Quelle est l'unité réelle de matière qui est analysée ?
3. Ce flux attend-il un JSON strict ou un texte brut final ?
4. Quelles informations doivent survivre pour une récupération ultérieure ?
5. Qu'est-ce que le modèle doit ignorer, compresser, préserver ou faire passer à la suite ?

Si votre prompt répond clairement à ces cinq questions, il fonctionnera en général bien avec STMB.

## Notes style FAQ

- "Puis-je voir ce qui a vraiment été envoyé à l'IA ?"
  Oui. Vérifiez la sortie du terminal ou des journaux si vous voulez inspecter le prompt assemblé.

- "Est-ce que STMB force une bonne sortie même si mon prompt est faible ?"
  Pas vraiment. STMB peut parfois rattraper un JSON mal formé, mais il ne peut pas corriger un prompt vague qui demandait la mauvaise chose.

- "Qu'est-ce que je dois optimiser en premier quand je réécris des prompts ?"
  Commencez par optimiser le format de sortie. Ensuite, optimisez les détails à conserver. Le style vient après.
