# 🎡 Side Prompts

Les Side Prompts sont des exécutions de prompts STMB supplémentaires pour l’entretien des chats. Ils peuvent analyser, suivre, résumer, nettoyer ou mettre à jour des notes de soutien sans obliger la réponse normale du personnage à faire tout ce travail.

Utilisez-les lorsqu’un chat a besoin d’un tracker continu, d’un rapport de relation, d’une liste d’intrigues, d’un journal d’inventions, d’une fiche d’état de PNJ, d’une chronologie ou d’un document de soutien similaire. Le personnage peut continuer à roleplay. Le Side Prompt s’occupe de la paperasse. ❤️

## Table des matières

- [Ce que sont les Side Prompts](#ce-que-sont-les-side-prompts)
- [Quand les utiliser](#quand-les-utiliser)
- [Configuration rapide](#configuration-rapide)
- [Fonctionnement des exécutions](#fonctionnement-des-exécutions)
- [Exécutions manuelles](#exécutions-manuelles)
- [Exécutions automatiques après mémoire](#exécutions-automatiques-après-mémoire)
- [Side Prompt Sets](#side-prompt-sets)
- [Macros](#macros)
- [Plages de messages](#plages-de-messages)
- [Écrire de bons Side Prompts](#écrire-de-bons-side-prompts)
- [Exemples](#exemples)
- [Dépannage](#dépannage)
- [À retenir](#à-retenir)

---

## Ce que sont les Side Prompts

Un Side Prompt est un prompt nommé qui s’exécute séparément de la réponse normale du personnage.

Il peut produire ou mettre à jour :

- des trackers d’intrigue
- des trackers de relation
- des notes de PNJ ou de faction
- des listes d’inventaire ou de ressources
- des chronologies
- des tableaux d’indices, de mystères ou de pistes
- des trackers d’inventions ou de projets
- des rapports de continuité
- des notes de nettoyage
- des entrées de soutien de type lorebook

Les Side Prompts sont différents des mémoires normales. Les mémoires enregistrent généralement des résumés de scène dans l’ordre. Les Side Prompts maintiennent plutôt un document d’état continu qui est mis à jour ou remplacé.

Ils n’ont pas non plus besoin de renvoyer du JSON. Le texte brut et le Markdown conviennent, sauf si votre prompt précis ou votre cible d’enregistrement exige quelque chose de plus strict.

---

## Quand les utiliser

Utilisez les Side Prompts pour du travail de soutien structuré.

Bons usages :

- **Points d’intrigue :** fils actifs, fils résolus, détails en suspens
- **Relations :** confiance, tension, attirance, limites, objectifs
- **PNJ :** ce que chaque PNJ sait, veut, a fait récemment ou doit faire ensuite
- **Chronologie :** dates, voyages, blessures, échéances, comptes à rebours
- **État du monde :** lieux, objets, factions ou ressources modifiés
- **Mystères :** indices, suspects, contradictions, questions sans réponse
- **Projets :** inventions, recherches, bloqueurs, dérive de périmètre, prochaines étapes
- **Continuité :** risques probables d’hallucination ou contexte manquant

Mauvais usages :

- tout ce qui doit apparaître dans la prochaine réponse du personnage
- des prompts vagues du type « améliore l’histoire »
- de gigantesques prompts d’analyse qui produisent des essais à chaque exécution
- des résumés de mémoire en double sans tâche distincte

Les Side Prompts ne sont pas magiques. Un Side Prompt vague reste seulement du flou mieux organisé.

---

## Configuration rapide

Besoin de la version étape par étape ? Utilisez le [guide Scribe pour activer les Side Prompts](https://scribehow.com/viewer/How_to_Enable_Side_Prompts_in_Memory_Books__fif494uSSjCmxE2ZCmRGxQ).

Le chemin court : ouvrez **Extensions**, ouvrez **Memory Books**, cliquez sur **Side Prompts**, choisissez le prompt souhaité, activez-le, activez éventuellement **Run automatically after memory**, puis cliquez sur **Save** et **Close**.

---

## Fonctionnement des exécutions

Une exécution normale de Side Prompt suit le même chemin de base :

1. STMB choisit les messages à examiner.
2. Le Side Prompt est préparé.
3. Les macros nécessaires sont remplies.
4. Le modèle génère la sortie du Side Prompt.
5. STMB vérifie la sortie.
6. Le résultat est prévisualisé, enregistré, mis à jour ou ignoré selon les paramètres du Side Prompt.

Les Side Prompts manuels, les Side Prompts après mémoire et les lignes de Side Prompt Set devraient donner l’impression d’appartenir au même système. Ils partagent le même comportement général pour les aperçus, le traitement par lots, les vérifications de réponse vide, les enregistrements, l’arrêt et les notifications.

---

## Exécutions manuelles

Utilisez `/sideprompt` pour exécuter manuellement un Side Prompt.

Forme de base :

```txt
/sideprompt "Nom du prompt"
```

Avec une plage de messages :

```txt
/sideprompt "Nom du prompt" 10-20
```

Avec une macro d’exécution :

```txt
/sideprompt "Relationship Tracker" {{npc name}}="Alice" 10-20
```

Utilisez des guillemets autour des noms de prompts qui contiennent des espaces.

Les exécutions manuelles sont surtout utiles pour des vérifications ponctuelles, des mises à jour ciblées et des prompts qui ont besoin de valeurs de macros personnalisées.

---

## Exécutions automatiques après mémoire

Certains Side Prompts peuvent s’exécuter automatiquement après la création d’une mémoire.

C’est utile lorsqu’un tracker doit rester à jour au fil du chat. Par exemple, un tracker de relation ou d’intrigue peut être mis à jour après chaque mémoire.

Il existe deux modes après mémoire :

- **Use individually-enabled side prompts** — ancien comportement ; tout Side Prompt dont **Run automatically after memory** est activé peut s’exécuter.
- **Use a named Side Prompt Set** — le set sélectionné s’exécute à la place.

Un Side Prompt Set sélectionné remplace les Side Prompts après mémoire activés individuellement. Il ne s’y ajoute **pas**. Cela évite les exécutions en double causées par d’anciennes cases cochées que l’utilisateur a oubliées.

---

## Side Prompt Sets

Les Side Prompt Sets regroupent plusieurs Side Prompts dans un workflow ordonné.

Un set est une liste d’exécution ordonnée, pas seulement un dossier. Le même Side Prompt peut y apparaître plusieurs fois avec des valeurs de macros différentes.

Exemple de set :

1. Relationship Tracker avec `{{npc name}} = Alice`
2. Relationship Tracker avec `{{npc name}} = Bob`
3. Plot Points Tracker
4. Scene Cleanup Notes

Cela permet à un même modèle de prompt de maintenir des entrées séparées pour différents PNJ, factions, lieux ou projets.

### Gérer les sets

Ouvrez **🎡 Trackers & Side Prompts** pour créer, modifier, dupliquer, supprimer ou réordonner des sets.

Chaque ligne peut inclure :

- un Side Prompt
- une étiquette de ligne facultative
- des valeurs de macros enregistrées
- des contrôles dupliquer/supprimer
- des contrôles monter/descendre

Les lignes s’exécutent de haut en bas. Placez les trackers fondamentaux au début, puis les prompts de nettoyage ou de rapport plus tard.

### Exécuter un set manuellement

Exécuter un set avec ses valeurs enregistrées :

```txt
/sideprompt-set "Nom du set"
```

Avec une plage :

```txt
/sideprompt-set "Nom du set" 10-20
```

Exécuter un set réutilisable avec des valeurs de macros :

```txt
/sideprompt-macroset "Relationship Pass" {{npc_1}}="Alice" {{npc_2}}="Bob" 10-20
```

Utilisez `/sideprompt-macroset` lorsque le set contient des tokens réutilisables qui ont encore besoin de valeurs.

### Sets ou lignes manquants

Les Side Prompt Sets sont stricts exprès :

- Si aucun set n’est sélectionné, le comportement après mémoire avec Side Prompts activés individuellement est utilisé.
- Si un set est sélectionné, les prompts après mémoire activés individuellement sont ignorés.
- Si le set sélectionné a été supprimé, rien ne s’exécute et STMB vous avertit.
- Si une ligne pointe vers un prompt supprimé, cette ligne est ignorée et STMB vous avertit.
- Si une ligne a encore besoin d’une valeur de macro, cette ligne est ignorée et STMB vous avertit.

Un repli silencieux serait pire. Si un workflow sélectionné est cassé, vous devez le savoir.

---

## Macros

Les Side Prompts peuvent utiliser les macros SillyTavern normales comme `{{user}}` et `{{char}}`.

Ils peuvent aussi utiliser des macros d’exécution, c’est-à-dire des placeholders remplis lorsque le Side Prompt s’exécute.

Exemple de macro d’exécution :

```txt
{{npc name}}
```

Exécution manuelle :

```txt
/sideprompt "Relationship Tracker" {{npc name}}="Alice"
```

Valeur enregistrée dans un set :

```txt
{{npc name}} = Alice
```

Valeur réutilisable au niveau du set :

```txt
{{npc name}} = {{npc_1}}
```

Puis exécution :

```txt
/sideprompt-macroset "Relationship Pass" {{npc_1}}="Alice"
```

### Conseils pour les macros

Utilisez des noms ennuyeux :

```txt
{{npc name}}
{{npc_1}}
{{faction}}
{{project_name}}
```

Évitez des noms comme :

```txt
{{the guy we mean}}
{{stuff}}
{{important person}}
```

Les espaces sont lisibles dans l’interface. Les underscores sont généralement moins pénibles dans les slash commands.

Un Side Prompt avec des macros d’exécution personnalisées ne devrait pas être automatisé individuellement, sauf si les valeurs nécessaires sont enregistrées quelque part, par exemple dans une ligne de Side Prompt Set. Les exécutions automatiques ne peuvent pas s’arrêter pour vous demander qui `{{npc name}}` est censé représenter.

---

## Plages de messages

Les Side Prompts peuvent s’exécuter sur une plage de messages précise.

```txt
/sideprompt "Plot Points" 50-80
```

Si vous fournissez une plage, STMB utilise cette plage.

Si vous ne fournissez pas de plage, STMB utilise le comportement normal depuis le dernier Side Prompt, avec la logique existante de plafond et de checkpoint.

Pour le suivi régulier, le comportement depuis la dernière exécution est plus simple. Pour le débogage ou un nettoyage ciblé, les plages explicites sont plus claires.

La compilation des plages de Side Prompt devrait suivre la même préférence de messages masqués que la mémoire, y compris le réglage global qui démasque avant la mémoire.

---

## Écrire de bons Side Prompts

Un bon Side Prompt a une tâche. Un mauvais Side Prompt a des vibes.

Soyez clair sur :

- ce qu’il doit examiner
- ce qu’il doit mettre à jour
- ce qu’il doit ignorer
- le format de sortie attendu
- la longueur attendue de la sortie
- s’il doit remplacer, réviser ou ajouter

### Garder volontairement une sortie courte

Les trackers gonflent si on ne leur dit pas de ne pas le faire.

Faible :

```txt
Update the relationship tracker.
```

Mieux :

```txt
Update the relationship tracker. Preserve useful facts, remove resolved or obsolete details, and keep each entry to 1-3 concise bullets. Output only the updated tracker.
```

Garde-fous utiles :

```txt
Do not append a new section unless there is genuinely new information. Merge updates into existing entries when possible.
```

```txt
Remove resolved threads. Do not preserve stale speculation just because it appeared in the old tracker.
```

```txt
Output only the updated report. No commentary, no explanation, no preface.
```

### Utiliser des titres stables

Des titres stables rendent les mises à jour répétées plus propres.

Bon :

```md
# Relationship Tracker

## Current Status

## Recent Changes

## Open Tensions

## Next Likely Developments
```

Mauvais :

```md
# Here is my extensive and emotionally intelligent breakdown of everything that might be happening
```

### Ne pas tout demander

Un Side Prompt qui demande tous les détails produira généralement tous les détails.

Choisissez ce qui compte. Un tracker d’intrigue a généralement besoin du crochet non résolu, de ce qui a changé, de qui sait quoi, et de ce qui demande un suivi. Il n’a pas besoin de chaque expression faciale de la scène.

### Rendre l’usage des macros évident

Bons noms :

```txt
Relationship Tracker - {{npc name}}
NPC Status - {{npc name}}
Faction Tracker - {{faction}}
```

Noms moins utiles :

```txt
Tracker 3
Update thing
Misc relationship prompt
```

Les utilisateurs ne devraient pas avoir besoin d’ouvrir tout le corps du prompt pour comprendre pourquoi il demande une valeur.

---

## Exemples

### Plot Points Tracker

Utilisez-le lorsqu’un chat contient plusieurs intrigues actives.

```txt
Update the plot points tracker based on the selected messages. Keep only active or recently resolved threads. Group by storyline. Output only the updated tracker.
```

Forme suggérée :

```md
# Plot Points

## Active Threads

1. **Missing artifact** — Current status and latest clue.
2. **Rival faction** — What they want and what changed.

## Recently Resolved

1. **Old misunderstanding** — Resolved when Alice told Bob the truth.

## Needs Follow-Up

1. Who has the key?
2. Why did the guard lie?
```

### Relationship Tracker avec macro

Le prompt exige :

```txt
{{npc name}}
```

Exécution manuelle :

```txt
/sideprompt "Relationship Tracker" {{npc name}}="Alice" 10-40
```

Lignes du set :

| Ligne | Side Prompt | Macro enregistrée |
|---|---|---|
| 1 | Relationship Tracker | `{{npc name}} = Alice` |
| 2 | Relationship Tracker | `{{npc name}} = Bob` |

Cela évite de créer des définitions de prompt séparées pour chaque PNJ.

### Tracker d’invention ou de projet

Utilisez-le lorsqu’un utilisateur invente, recherche, construit ou modifie quelque chose au fil du temps.

```txt
Update the project tracker. Track only meaningful changes in goal, progress, blockers, scope, dependencies, or story relevance. Keep entries concise and ordered by first introduction.
```

C’est généralement plus propre que d’enregistrer dix entrées de mémoire qui disent toutes que le projet existe.

### Reusable Cast Pass

Créez un set avec des tokens d’exécution au niveau du set :

```txt
{{npc_1}}
{{npc_2}}
```

Exécutez-le :

```txt
/sideprompt-macroset "Cast Pass" {{npc_1}}="Alice" {{npc_2}}="Bob"
```

Réutilisez-le plus tard :

```txt
/sideprompt-macroset "Cast Pass" {{npc_1}}="Mira" {{npc_2}}="Jonas"
```

Même set. Distribution différente. 💡

---

## Dépannage

### Mon Side Prompt ne s’est pas exécuté après la mémoire.

Vérifiez :

- La mémoire s’est-elle réellement exécutée ?
- Le Side Prompt est-il activé pour les exécutions après mémoire ?
- Le chat utilise-t-il **Use individually-enabled side prompts** ?
- Le chat utilise-t-il plutôt un Side Prompt Set ?
- Le prompt a-t-il besoin d’une valeur de macro qui n’a pas été fournie ?
- Le prompt a-t-il été supprimé, renommé ou déplacé ?

Si le chat utilise un Side Prompt Set, les cases après mémoire activées individuellement sont ignorées pour ce chat.

### Mon Side Prompt Set ne s’est pas exécuté.

Vérifiez :

- Le set est-il sélectionné pour ce chat ?
- Le set existe-t-il toujours ?
- Toutes les lignes pointent-elles vers des Side Prompts existants ?
- Toutes les macros requises ont-elles des valeurs enregistrées ou fournies ?

Les exécutions automatiques ne peuvent pas demander les valeurs manquantes. Enregistrez les valeurs de macros dans le set ou exécutez-le manuellement avec `/sideprompt-macroset`.

### Une ligne a été ignorée.

Causes probables :

- le Side Prompt référencé a été supprimé
- le Side Prompt référencé a été renommé
- la ligne contient des macros non résolues
- le modèle a renvoyé une réponse vide ou invalide

STMB devrait avertir au lieu de faire semblant que tout a fonctionné.

### La sortie est trop longue.

Ajoutez des limites strictes :

```txt
Keep the full output under 300 words.
```

```txt
Use no more than 5 active items.
```

```txt
Merge related details. Remove stale, resolved, or redundant details.
```

Les modèles ne savent pas naturellement quand un tracker est devenu inutilement énorme. Dites-leur.

### Il s’est exécuté deux fois.

Vérifiez :

- exécution manuelle plus exécution automatique
- lignes dupliquées dans un set
- copies répétées du même Side Prompt
- plusieurs chats ou onglets déclenchant du travail à peu d’intervalle

Un Side Prompt Set sélectionné devrait remplacer les prompts après mémoire activés individuellement, ce qui évite une cause fréquente de double exécution.

### Les mauvais messages ont été analysés.

Utilisez une plage explicite :

```txt
/sideprompt "Plot Points" 50-80
```

Le comportement depuis la dernière exécution est pratique. Les plages explicites sont meilleures pour le débogage.

### Le tracker garde des informations obsolètes.

Dites au Side Prompt de supprimer les informations obsolètes.

```txt
Update the tracker. Remove obsolete speculation, resolved conflicts, and details contradicted by the selected messages.
```

Les trackers ne restent pas propres par accident.

---

## À retenir

### Pour les utilisateurs

Utilisez les Side Prompts lorsque vous voulez une aide structurée pour maintenir un long chat.

Les exécutions manuelles sont idéales pour une analyse ponctuelle. Les exécutions après mémoire ou les Side Prompt Sets sont préférables pour les trackers qui doivent rester à jour.

### Pour les botmakers

Construisez les Side Prompts comme des outils de maintenance, pas comme de la prose de roleplay.

Utilisez des titres stables, des règles de sortie strictes et un comportement de mise à jour clair. Utilisez les macros lorsqu’un même prompt doit fonctionner pour plusieurs PNJ, factions, lieux ou projets.

### Pour les admins

Les Side Prompts ajoutent davantage de travail généré.

Ils doivent donc être prévisibles, inspectables et ennuyeux dans le bon sens du terme. Les sets aident, parce qu’ils rendent le workflow voulu explicite au lieu de le laisser à une soupe de cases à cocher.
