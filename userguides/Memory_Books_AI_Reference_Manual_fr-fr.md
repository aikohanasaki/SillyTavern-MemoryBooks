<!--
Copyright (C) 2024–2026 Aiko Hanasaki
SPDX-License-Identifier: AGPL-3.0-only
-->

# Memory Books : Manuel de référence complet pour IA

**Produit :** SillyTavern Memory Books (STMB)  
**Version de référence :** v8.5.0, 1er août 2026  
**Objectif :** Une source de vérité unique et dense pour un assistant IA chargé d’enseigner, d’expliquer et de dépanner Memory Books.

---

## Table des matières

- [1. Comment un assistant IA doit utiliser ce manuel](#1-comment-un-assistant-ia-doit-utiliser-ce-manuel)
- [2. Définition du produit et modèle mental](#2-définition-du-produit-et-modèle-mental)
- [3. Vocabulaire essentiel et choix des fonctionnalités](#3-vocabulaire-essentiel-et-choix-des-fonctionnalités)
- [4. Prérequis, installation et vérification initiale](#4-prérequis-installation-et-vérification-initiale)
- [5. Ouvrir Memory Books et comprendre le panneau principal](#5-ouvrir-memory-books-et-comprendre-le-panneau-principal)
- [6. Modes de stockage des Memory Books](#6-modes-de-stockage-des-memory-books)
- [7. Profils, connexions et routage de génération](#7-profils-connexions-et-routage-de-génération)
- [8. Scènes, Memories manuelles, Memories automatiques et rattrapage](#8-scènes-memories-manuelles-memories-automatiques-et-rattrapage)
- [9. Économie de tokens, messages masqués et frontière de mémoire](#9-économie-de-tokens-messages-masqués-et-frontière-de-mémoire)
- [10. Activation et récupération des lorebooks](#10-activation-et-récupération-des-lorebooks)
- [11. Mode de véritable discussion de groupe](#11-mode-de-véritable-discussion-de-groupe)
- [12. Narrator Mode](#12-narrator-mode)
- [13. Branches de discussion](#13-branches-de-discussion)
- [14. Clips](#14-clips)
- [15. Topical Clips](#15-topical-clips)
- [16. Side Prompts](#16-side-prompts)
- [17. Consolidation](#17-consolidation)
- [18. Compaction](#18-compaction)
- [19. Regeneration](#19-regeneration)
- [20. Contexte pour la génération](#20-contexte-pour-la-génération)
- [21. Architecture des prompts, prompts de résumé intégrés et règles de rédaction](#21-architecture-des-prompts-prompts-de-résumé-intégrés-et-règles-de-rédaction)
- [22. Summary Prompt Manager et Consolidation Prompt Manager](#22-summary-prompt-manager-et-consolidation-prompt-manager)
- [23. Intégration Regex](#23-intégration-regex)
- [24. Titres des entrées de lorebook et politique de caractères](#24-titres-des-entrées-de-lorebook-et-politique-de-caractères)
- [25. File de tâches et contrôles de nouvelle tentative](#25-file-de-tâches-et-contrôles-de-nouvelle-tentative)
- [26. Retour visuel et accessibilité](#26-retour-visuel-et-accessibilité)
- [27. Carte des paramètres et référence des paramètres actuels](#27-carte-des-paramètres-et-référence-des-paramètres-actuels)
- [28. Référence des commandes slash](#28-référence-des-commandes-slash)
- [29. Dépannage par étape](#29-dépannage-par-étape)
- [30. FAQ](#30-faq)
- [31. Compatibilité, migration et notes historiques actuelles](#31-compatibilité-migration-et-notes-historiques-actuelles)
- [32. Notes développeur et licence](#32-notes-développeur-et-licence)
- [33. Arbre de diagnostic compact](#33-arbre-de-diagnostic-compact)
- [34. Séquence d’enseignement minimale recommandée](#34-séquence-denseignement-minimale-recommandée)
- [35. Résumé final des concepts](#35-résumé-final-des-concepts)

---

## 1. Comment un assistant IA doit utiliser ce manuel

Considérez ce document comme la référence opérationnelle actuelle de Memory Books. Il remplace la nécessité de charger séparément le guide Start Here, le README, le User Guide, le guide Side Prompts, le guide How STMB Works et l’historique du changelog comme fichiers de connaissances indépendants.

Termes :

- STMB = SillyTavern=MemoryBooks (cette extension)
- ST = SillyTavern (le code de base étendu par STMB)

Pour répondre aux utilisateurs :

1. Conservez exactement la terminologie de Memory Books. Un **Memory Book** est un lorebook SillyTavern utilisé par STMB ; ce n’est pas un format de base de données séparé.
2. Distinguez le comportement actuel du comportement historique. N’enseignez pas un flux supprimé ou remplacé simplement parce qu’il apparaît dans un ancien changelog.
3. Distinguez **Group Chat Mode** et **Narrator Mode**. Ils résolvent des problèmes différents.
4. Distinguez la **génération** de mémoire, le **stockage/la configuration** du lorebook, puis la **récupération ultérieure par SillyTavern**. L’activation/la récupération relève du code de base ST.
5. N’inventez pas de contrôles, libellés de menus, comportements de fournisseurs ou paramètres non décrits ici.
6. Lorsqu’une capture d’écran est fournie, identifiez uniquement les contrôles visibles. Donnez l’action immédiate suivante plutôt que de supposer qu’un contrôle hors écran existe.
7. Lors du dépannage, identifiez la première étape qui échoue et testez-la avant de recommander de réécrire les prompts.
8. Préférez une configuration simple et fonctionnelle avant d’aborder le routage avancé, plusieurs livres, les prompts personnalisés, Regex ou l’automatisation des Side Prompts.
9. Expliquez que les filtres de personnages et les Memory Books séparés améliorent le routage et la pertinence ; ils ne constituent pas une frontière de sécurité.
10. Signalez l’incertitude lorsque la version installée, la version de SillyTavern, le fournisseur ou le prompt personnalisé de l’utilisateur peuvent différer.

### Notes sur le document actuel

Narrator Mode est implémenté dans la v8.5.0.

Plusieurs documents pour débutants indiquaient qu’une Memory manuelle était techniquement nécessaire avant de pouvoir commencer les Memories automatiques. STMB actuel peut créer la première Memory automatique à partir du message 0 lorsqu’aucune référence de message traité n’existe. Une première Memory manuelle reste recommandée, car elle permet de vérifier la connexion, le Memory Book, le format de sortie et la frontière de départ souhaitée avant de faire confiance à l’automatisation.

---

## 2. Définition du produit et modèle mental

Memory Books est une extension SillyTavern qui convertit des plages de discussion choisies manuellement ou automatiquement en entrées de mémoire structurées stockées dans des lorebooks SillyTavern.

Le processus de base est :

```text
Messages de discussion
    ↓
STMB sélectionne ou reçoit une plage de messages
    ↓
STMB assemble une requête IA
    ↓
Le modèle renvoie une mémoire structurée
    ↓
STMB enregistre une entrée de lorebook
    ↓
Les anciens messages traités peuvent être masqués du contexte actif
    ↓
SillyTavern active plus tard les entrées de lorebook pertinentes
    ↓
Le modèle de discussion reçoit ces entrées comme contexte
```

STMB ne donne pas au modèle une mémoire interne permanente. Il maintient un système de référence externe (des entrées de lorebook). Le modèle de discussion « se souvient » lorsque SillyTavern inclut les entrées de lorebook pertinentes dans le prompt envoyé à l’IA.

### Les trois étapes distinctes

1. **Qualité de génération** — Le modèle de génération de mémoire a-t-il produit un résultat exact et utile ?
2. **Stockage et configuration** — Le résultat a-t-il été enregistré dans le Memory Book prévu avec les paramètres d’activation appropriés ?
3. **Récupération et utilisation par le modèle** — SillyTavern a-t-il activé et envoyé l’entrée, et le modèle de discussion l’a-t-il utilisée correctement ?

Dépannez ces étapes séparément.

### Lorebooks et Memory Books

Un **lorebook**, également appelé **World Info** dans certaines parties de SillyTavern, est une collection d’entrées que SillyTavern peut ajouter conditionnellement à une requête de modèle. Une entrée de lorebook comporte normalement :

- un titre/commentaire ;
- du contenu ;
- des mots-clés d’activation ou un autre mode d’activation ;
- une position et un ordre d’insertion ;
- des contrôles de récursion et de budget ;
- éventuellement des filtres de personnages et d’autres métadonnées.

Un **Memory Book** est un lorebook SillyTavern ordinaire utilisé par STMB. Il peut être ouvert, modifié, réordonné, exporté, importé ou supprimé avec les outils normaux de lorebook. Selon les fonctionnalités utilisées, il peut contenir :

- des Memories de scène ;
- des résumés Arc, Chapter, Book, Legend, Series ou Epic ;
- des entrées Clip et Topical Clip ;
- des entrées de suivi Side Prompt ;
- d’autres entrées gérées par STMB.

### Les entrées de mémoire sont du contexte compressé

Une Memory de scène n’est pas la transcription originale. C’est une représentation compressée destinée à préserver les informations utiles à la continuité, par exemple :

- événements et conséquences ;
- décisions et plans ;
- découvertes et révélations ;
- changements relationnels ou émotionnels ;
- connaissances, croyances ou malentendus individuels ;
- objets, lieux, identités, promesses et contraintes importants.

Masquer les messages traités ne les supprime pas. Cela empêche simplement leur envoi à l’IA et donc leur consommation continue du contexte actif de l’historique de discussion.

---

## 3. Vocabulaire essentiel et choix des fonctionnalités

| Besoin | Fonctionnalité | Signification |
|---|---|---|
| Résumer une plage de discussion sélectionnée ou automatique | **Memory** | « Souviens-toi de ce qui s’est passé dans cette scène. » |
| Enregistrer le texte sélectionné d’une discussion ou un fait précis | **Clip** | « Enregistre cette note. » |
| Rassembler des faits sur un sujet à partir de Memories enregistrées | **Topical Clip** | « Rassemble tout ce que mes Memories disent à ce sujet. » |
| Maintenir des informations qui évoluent au fil de plusieurs exécutions | **Side Prompt** | « Tiens ce suivi à jour. » |
| Combiner plusieurs Memories ou résumés de niveau inférieur | **Consolidation** | « Regroupe ces entrées dans un récapitulatif de niveau supérieur. » |
| Raccourcir une seule entrée existante gérée par STMB | **Compaction** | « Réduis cette entrée sans perdre ses faits. » |
| Remplacer une entrée existante à partir de ses sources d’origine | **Regeneration** | « Reconstruis cette entrée et fais examiner son remplacement. » |

### Distinctions que les utilisateurs confondent souvent

- **Clip vs Topical Clip :** un Clip commence par du texte surligné dans la discussion actuelle. Un Topical Clip commence par des Memories STMB déjà confirmées.
- **Topical Clip vs Side Prompt :** un Topical Clip est lancé manuellement pour rassembler un sujet. Un Side Prompt peut maintenir de manière répétée un suivi évolutif.
- **Compaction vs Consolidation :** la Compaction réécrit une entrée. La Consolidation crée un nouveau résumé de niveau supérieur à partir de plusieurs entrées.
- **Memory vs Side Prompt :** les Memories sont normalement des enregistrements de scène séquentiels. Les Side Prompts mettent généralement à jour ou remplacent un document de support continu.
- **Génération vs récupération :** créer une entrée ne garantit pas que SillyTavern l’activera plus tard.

---

## 4. Prérequis, installation et vérification initiale

### Prérequis

- SillyTavern 1.18.0 ou version ultérieure ; la dernière version compatible est recommandée.
- Une connexion IA fonctionnelle.
- Un modèle capable de suivre des instructions et, pour les flux Memory et Consolidation, de renvoyer du JSON valide.
- L’autorisation d’installer des extensions tierces SillyTavern.
- Un preset Chat Completion disponible dans SillyTavern lors de l’utilisation d’un backend local ou Text Completion via un endpoint Chat Completion compatible OpenAI.

### Utilisateurs Chat Completion ordinaires

OpenAI, Anthropic/Claude, OpenRouter, Gemini/Google et les autres connexions Chat Completion peuvent normalement utiliser le profil intégré **Current SillyTavern Settings**.

### Utilisateurs locaux et Text Completion

KoboldCpp, llama.cpp, TextGen, Ollama et les backends similaires fonctionnent généralement de manière plus fiable lorsqu’ils sont exposés via un endpoint Chat Completion compatible OpenAI. Même si le roleplay normal utilise Text Completion, SillyTavern doit disposer d’un preset Chat Completion pour STMB.

Configuration KoboldCpp typique :

- type d’API : Chat Completion ;
- source : Custom OpenAI-compatible ;
- endpoint comme `http://localhost:5001/v1` ou `http://127.0.0.1:5000/v1` ;
- toute clé API personnalisée non vide si SillyTavern en exige une ;
- ID du modèle au format attendu par l’endpoint, souvent `koboldcpp/modelname`, sans suffixe `.gguf` inutile ;
- preset Chat Completion importé ;
- longueur de réponse d’au moins 2048 tokens, 4096 étant souvent plus sûr.

Configuration llama.cpp typique :

- type d’API : Chat Completion ;
- source : Custom OpenAI-compatible ;
- endpoint `http://localhost:8080/v1`, ou `http://host.docker.internal:8080/v1` si SillyTavern s’exécute dans Docker ;
- toute clé API non vide si SillyTavern l’exige ;
- l’ID du modèle servi ;
- aucun post-traitement du prompt sauf si l’endpoint l’exige.

Exemple de commande serveur :

```sh
llama-server -m <model-path> -c <context-size> --port 8080
```

### Chat Top Bar facultatif

STMB fonctionne sans Chat Top Bar / Chat Top Info Bar. Son installation ajoute l’interface de file **Memory Books Jobs** pour les tâches actives, terminées, échouées, annulées, bloquées et nécessitant une révision.

### Installation

1. Ouvrez SillyTavern.
2. Ouvrez le panneau principal **Extensions**.
3. Choisissez **Install Extension**.
4. Installez le dépôt officiel Memory Books.
5. Rechargez SillyTavern si demandé.
6. Ouvrez une discussion avec un personnage ou une discussion de groupe.
7. Attendez quelques secondes que les contrôles STMB s’initialisent.

SillyTavern Extras n’est pas requis.

### Vérifier que STMB est chargé

Au moins un de ces éléments doit apparaître :

- **Memory Books** dans le menu Extensions « baguette magique » à côté de la zone de saisie ;
- les chevrons de scène **►** et **◄** dans les actions étendues des messages.

Si aucun n’apparaît :

1. attendez jusqu’à dix secondes ;
2. actualisez la page ;
3. vérifiez que l’extension est installée et activée ;
4. rouvrez une discussion de personnage ou de groupe ;
5. inspectez la console du navigateur seulement après l’échec des vérifications de base.

---

## 5. Ouvrir Memory Books et comprendre le panneau principal

Ouvrez le menu Extensions « baguette magique » près de la zone de saisie, puis choisissez **Memory Books**.

Le panneau peut contenir :

- Current Scene ;
- Memory Status / message traité le plus élevé ;
- Current Lorebook Configuration ;
- Memory Profiles ;
- Profile Actions ;
- Extra Function Buttons ;
- Prompt Managers ;
- General Settings ;
- Automatic Memories ;
- Token Saving ;
- les contrôles de personnages de groupe ou Narrator lorsque pertinents.

Pour une première Memory, seules trois décisions sont nécessaires :

1. Quel Memory Book recevra l’entrée ?
2. Quel profil/connexion la générera ?
3. Quels messages de discussion constituent la scène ?

---

## 6. Modes de stockage des Memory Books

### 6.1 Automatic Mode : Memory Book lié à la discussion

Automatic Mode est le mode par défaut normal. STMB utilise le lorebook lié à la discussion actuelle via SillyTavern.

Utilisez-le lorsque :

- une discussion possède un Memory Book principal ;
- une configuration minimale est préférable ;
- les personnages de groupe n’ont pas besoin de Memory Books séparés.

Si aucun lorebook n’est lié, liez-en un dans SillyTavern ou utilisez Auto-Create.

### 6.2 Auto-Create Lorebook Mode

Activez **Auto-create lorebook if none exists** pour permettre à STMB de créer et de lier un lorebook lors du premier enregistrement d’une Memory.

Le modèle de nom par défaut peut utiliser :

- `{{char}}` — nom du personnage ou du groupe ;
- `{{user}}` — nom de l’utilisateur ;
- `{{chat}}` — ID/nom de la discussion.

STMB ajoute des suffixes numériques si nécessaire pour éviter les doublons.

Auto-Create et Manual Lorebook Mode s’excluent mutuellement.

### 6.3 Manual Lorebook Mode

Activez **Manual Lorebook Mode** pour choisir un Memory Book indépendamment du lorebook lié à la discussion.

Utilisez-le lorsque :

- les mémoires doivent vivre dans un lorebook dédié ;
- plusieurs discussions doivent intentionnellement partager un Memory Book ;
- les membres d’un groupe ont besoin de livres séparés ;
- Narrator Mode est utilisé ;
- l’utilisateur comprend le plan d’activation qui en résulte.

La sélection principale du Memory Book manuel est enregistrée pour la discussion actuelle, sauf si un verrou de personnage persistant la remplace dans une discussion solo compatible.

### 6.4 Des Memory Books séparés sont généralement plus clairs

Un Memory Book dédié facilite :

- la séparation des mémoires des définitions de personnages et du lore de décor ;
- l’application d’un budget et d’un ordre de lorebook indépendants ;
- la réutilisation ou l’export de l’historique de mémoire ;
- l’inspection des entrées gérées par STMB sans lore sans rapport ;
- le diagnostic de l’activation.

C’est une recommandation, pas une obligation.

### 6.5 Verrous de Memory Book de personnage

Un verrou de Memory Book de personnage est une affectation persistante en Manual Mode attachée à une carte de personnage.

Dans une discussion solo :

- un livre manuel non verrouillé appartient à la discussion actuelle ;
- un livre verrouillé suit la carte de personnage dans les discussions Manual Mode compatibles ;
- le livre manuel ne peut pas être modifié avant la suppression du verrou.

Dans une véritable discussion de groupe :

- une affectation par personnage non verrouillée appartient à la discussion de groupe actuelle ;
- une affectation verrouillée suit cette carte de personnage dans les groupes Manual Mode compatibles ;
- un livre verrouillé manquant produit un état de verrou cassé qui doit être déverrouillé ou réparé.

Utilisez les verrous uniquement lorsque le même personnage doit intentionnellement partager un même Memory Book continu entre plusieurs histoires. Ils sont dangereux pour les univers alternatifs ou les chronologies sans rapport.

### 6.6 Disposition de départ recommandée

- Discussion solo : un Memory Book lié à la discussion ou auto-créé.
- Véritable discussion de groupe : un Memory Book de groupe.
- Discussion Narrator : un Memory Book omniscient plus un livre unique par personnage déclaré, selon les besoins de Narrator Mode.

---

## 7. Profils, connexions et routage de génération

Un profil Memory Books contrôle à la fois la génération et les paramètres de l’entrée de lorebook résultante.

### 7.1 Premier profil recommandé

Utilisez d’abord **Current SillyTavern Settings**. Il emploie le fournisseur, le modèle et la température actuellement actifs dans SillyTavern.

Ne commencez pas par réécrire les prompts ou configurer un endpoint Full Manual. Prouvez d’abord qu’une Memory peut être générée et enregistrée.

### 7.2 Pourquoi créer un profil STMB enregistré

Créez un profil séparé lorsque l’utilisateur doit :

- utiliser un modèle moins cher ou plus fiable pour les mémoires ;
- utiliser un fournisseur différent de celui du roleplay ;
- lier une connexion Custom nommée ;
- choisir un prompt de résumé personnalisé ;
- utiliser une température ou un comportement de sortie maximal différent ;
- modifier le format des titres ;
- modifier les paramètres d’activation, d’insertion, d’ordre ou de récursion ;
- utiliser des prompts distincts pour groupe/omniscient et pour personnage.

### 7.3 Champs du profil

Un profil peut inclure :

- nom d’affichage ;
- API/fournisseur ;
- ID du modèle ;
- température ;
- preset Summary Prompt ;
- prompts multi-personnages séparés facultatifs ;
- comportement de sortie structurée ;
- routage facultatif SillyTavern ChatCompletionService ;
- preset Chat Completion facultatif ;
- comportement reverse proxy ;
- format de titre ;
- mode d’activation : Normal, Constant ou Vectorized ;
- position d’insertion, notamment personnage, example-message, author’s-note et Outlet ;
- nom d’Outlet le cas échéant ;
- valeur d’ordre automatique ou manuelle ;
- Prevent Recursion ;
- Delay Until Recursion.

### 7.4 Connexions Custom OpenAI compatibles nommées

Un profil Custom OpenAI-compatible peut :

- utiliser la connexion Custom SillyTavern actuellement active ; ou
- lier une connexion Custom nommée depuis le Connection Manager de SillyTavern.

La connexion nommée fournit son URL et son secret enregistrés. Le champ modèle du profil STMB reste la surcharge de modèle. Si la connexion nommée est supprimée ou cesse d’être une connexion Custom Chat Completion, STMB bloque la requête au lieu de la router silencieusement ailleurs.

### 7.5 Repli de sortie structurée

**Skip structured output and use plain-text completion** empêche STMB d’envoyer un schéma de sortie structurée aux fournisseurs qui le refusent. Le modèle doit néanmoins renvoyer le JSON valide exigé par le prompt Memory ou Consolidation sélectionné.

### 7.6 ChatCompletionService

**Use ST’s ChatCompletionService** fait passer les requêtes de profil prises en charge par l’assistant de requêtes de SillyTavern et peut appliquer un preset SillyTavern Chat Completion sélectionné. Les requêtes OpenRouter héritent aussi de l’ordre des fournisseurs, des filtres de quantification, des contrôles de fallback et du réglage middle-out de SillyTavern. Ces contrôles OpenRouter restent en vigueur si ChatCompletionService échoue et que STMB réessaie via son chemin de requête de secours. Si cette tentative échoue aussi, STMB conserve et signale à la fois l’erreur initiale ChatCompletionService et la réponse du fournisseur de secours. Les profils Full Manual n’utilisent pas ce routage.

### 7.7 Reverse proxy et Full Manual Configuration

**Use reverse proxy** transmet les paramètres reverse proxy configurés dans SillyTavern pour les fournisseurs pris en charge.

**Full Manual Configuration** stocke un endpoint et une clé séparés dans le profil STMB. C’est un chemin exceptionnel. Préférez autant que possible un fournisseur ou une connexion Custom configurée et testée dans SillyTavern.

### 7.8 Longueur de sortie

Le paramètre global STMB de tokens de réponse maximum peut remplacer la longueur de sortie Chat Completion normale pour les tâches Memory Books. Un JSON tronqué est une cause fréquente d’échec de génération. Augmentez la longueur de sortie avant d’affaiblir le schéma ou le prompt.

---

## 8. Scènes, Memories manuelles, Memories automatiques et rattrapage

### 8.1 Qu’est-ce qu’une scène ?

Une **scène** est la plage inclusive de messages de discussion que STMB traite pour produire une Memory.

De bonnes frontières contiennent normalement une unité cohérente :

- un événement ;
- une conversation ;
- une étape d’enquête ;
- un développement émotionnel ou relationnel ;
- un changement de lieu ou d’objectif ;
- une séquence d’actions liées.

De très petites plages triviales peuvent produire peu de valeur. De très grandes plages coûtent plus cher, sont plus difficiles à résumer, peuvent dépasser le contexte et combinent souvent des événements sans rapport.

### 8.2 Marquer une scène manuellement

1. Développez les actions du message, généralement via un bouton à trois points ou similaire.
2. Cliquez sur **►** sur le premier message inclus.
3. Cliquez sur **◄** sur le dernier message inclus.
4. Ouvrez Memory Books et vérifiez les début, fin, locuteurs, nombre de messages et estimation de tokens affichés.

Les deux messages frontières sont inclus.

Utilisez **Clear Scene** pour supprimer la sélection, ou choisissez un autre marqueur de début/fin pour remplacer une frontière.

### 8.3 Créer une Memory manuelle

1. Vérifiez la scène.
2. Vérifiez le Memory Book effectif.
3. Vérifiez le profil sélectionné.
4. Cliquez sur **Create Memory**, ou utilisez `/creatememory`.
5. Examinez les fenêtres de confirmation, avertissement de tokens, confirmation des participants ou aperçu lorsqu’elles apparaissent.
6. Approuvez le résultat.
7. Vérifiez qu’une nouvelle entrée de lorebook existe et que Memory Status a avancé jusqu’à la fin de la scène.

Un résultat Memory valide contient normalement :

- un titre ;
- du contenu ;
- des mots-clés ;
- des métadonnées STMB, dont la plage source et l’identité de la discussion.

### 8.4 Aperçus de Memory

Lorsque **Show memory previews** est activé, examinez et modifiez éventuellement :

- le titre ;
- le contenu de la mémoire ;
- les mots-clés.

Vérifiez les noms, les attributions, les faits, les conséquences omises et les commentaires sans rapport. Sans aperçu, un résultat valide est enregistré automatiquement.

### 8.5 Memories automatiques

Activez **Auto-create memory summaries** et configurez :

- **Auto-Summary Interval** — nombre de nouveaux messages traités par Memory automatique ;
- **Auto-Summary Buffer** — nombre de messages les plus récents laissés de côté afin de ne pas résumer une scène encore en cours trop tôt.

Exemple :

```text
Interval: 30
Buffer: 2
```

STMB attend qu’au moins 32 messages existent au-delà de la frontière traitée, puis crée une Memory se terminant deux messages avant le message le plus récent.

Si aucune référence traitée n’existe, STMB actuel considère la référence comme `-1` et peut commencer au message 0. Une première Memory manuelle reste recommandée pour valider la configuration et choisir un point de départ délibéré.

Des intervalles plus bas créent des Memories plus ciblées et davantage de requêtes. Des intervalles plus élevés créent des Memories moins nombreuses et plus grandes, avec plus de risque de mélanger des éléments sans rapport. Une plage de départ pratique est d’environ 20–40 messages pour du roleplay détaillé et 40–60 pour des échanges plus courts et rapides.

La génération automatique peut être reportée lorsqu’un Memory Book requis n’est pas encore attribué.

### 8.6 Référence du message traité

STMB stocke le message traité le plus élevé pour chaque discussion. Il détermine :

- où `/nextmemory` commence ;
- où les Memories automatiques commencent ;
- l’indicateur de frontière de mémoire ;
- quels messages sont considérés comme déjà traités.

Utilisez :

- `/stmb-highest` pour l’afficher ;
- `/stmb-set-highest <N>` pour le définir manuellement ;
- `/stmb-set-highest none` pour le supprimer.

Les modifications manuelles doivent être délibérées, car elles peuvent entraîner des plages sautées ou répétées.

### 8.7 Rattrapage d’une longue discussion existante

Utilisez :

```text
/stmb-catchup interval=<chunk size> start=<first message id> end=<last message id>
```

Exemple :

```text
/stmb-catchup interval=40 start=0 end=245
```

La plage est inclusive. Les morceaux sont traités successivement ; le dernier peut être plus petit.

Le rattrapage est volontairement non interactif. Avant de l’exécuter :

- sélectionnez et testez le profil prévu ;
- activez **Always use default profile** ;
- désactivez **Show memory previews** ;
- assurez-vous que le Memory Book effectif existe, ou autorisez Auto-Create en Automatic Mode ;
- réparez toutes les affectations de livres multi-personnages requises ;
- choisissez une taille de morceau inférieure au seuil d’avertissement de tokens.

STMB prévalide chaque morceau, les traite dans l’ordre, et s’arrête au premier échec ou à `/stmb-stop`. Les morceaux antérieurs terminés restent enregistrés. Reprenez au premier message non terminé au lieu de répéter toute la plage.

Utilisez le rattrapage pour une conversion large. Les frontières de scène manuelles restent meilleures lorsque les limites littéraires ou événementielles importent.

---

## 9. Économie de tokens, messages masqués et frontière de mémoire

### 9.1 Masquer n’est pas supprimer

Les messages masqués restent dans le fichier de discussion. Ils sont omis du contexte de discussion actif jusqu’à ce qu’ils soient révélés de nouveau.

### 9.2 Modes de masquage automatique

**Auto-hide messages after adding memory** peut être :

- Do not auto-hide ;
- Auto-hide all messages up to the last Memory ;
- Auto-hide only messages in the last Memory.

**Messages to leave unhidden** conserve un petit chevauchement récent près de la frontière.

### 9.3 Réafficher avant génération

**Unhide hidden messages for memory generation** révèle une plage sélectionnée avant que STMB ne la compile. Utilisez-le lorsque vous régénérez ou retraitez des plages auparavant masquées. Le mode de masquage automatique sélectionné détermine ce qui est de nouveau masqué après un enregistrement réussi.

### 9.4 Indicateur de frontière de mémoire

L’indicateur utilise le message traité le plus élevé pour montrer où se termine l’historique traité et où commence la discussion non traitée.

Modes :

- Off ;
- séparateur de frontière de mémoire ;
- bouton de saut déplaçable ;
- séparateur plus bouton de saut.

Le bouton de saut fait défiler vers le premier message non traité et mémorise sa position après déplacement.

### 9.5 Bonne configuration d’apprentissage

Une configuration initiale pratique :

- afficher le séparateur de frontière et le bouton de saut ;
- laisser deux messages non masqués ;
- activer le réaffichage temporaire pour la génération ;
- n’utiliser aucun masquage automatique tant que l’utilisateur n’a pas confirmé qu’une Memory a été enregistrée correctement ;
- puis passer au masquage de tous les messages traités pour obtenir le principal gain de tokens.

---

## 10. Activation et récupération des lorebooks

### 10.1 Mots-clés

Les Memories normales sont couramment déclenchées par mots-clés. De bons mots-clés sont concrets et distinctifs :

- noms et alias de personnages ;
- lieux ou organisations nommés ;
- objets importants ;
- noms d’événements ;
- identifiants ;
- découvertes ou actions précises.

Des mots-clés faibles comme `important event`, `conversation` ou `secret` sont trop généraux.

Le contenu de la mémoire détermine ce que le modèle apprend. Les mots-clés aident à déterminer quand SillyTavern la récupère.

### 10.2 Modes d’activation

- **Normal :** activation par mots-clés/règles.
- **Constant :** toujours active, sous réserve du budget et des contrôles d’entrée applicables.
- **Vectorized :** utilise la récupération vectorielle lorsque la configuration de l’utilisateur la prend en charge.

Les vecteurs sont facultatifs. STMB fonctionne avec les mots-clés sans l’extension Vectors.

### 10.3 Paramètres World Info globaux recommandés

Recommandations de départ courantes :

- Match Whole Words : off ;
- Scan Depth : relativement élevé, par exemple 8 ;
- Max Recursion Steps : environ 2 ;
- Context percentage : dimensionné selon le contexte total de l’utilisateur et les autres éléments de prompt concurrents.

Ce sont des recommandations, pas des exigences strictes.

### 10.4 Delay Until Recursion

Si le Memory Book est la seule source de lorebook/World Info active, laissez **Delay Until Recursion** désactivé. Sinon, aucune entrée ne pourra initier le premier cycle de récursion et la Memory risque de ne jamais s’activer.

### 10.5 Diagnostiquer la récupération

Quand une IA « ne se souvient pas » :

1. Vérifiez que l’entrée existe.
2. Vérifiez que le bon Memory Book est actif pour la discussion.
3. Vérifiez que l’entrée est activée.
4. Vérifiez que les mots-clés ou le mode d’activation correspondent à la conversation actuelle.
5. Vérifiez que le budget du lorebook est suffisant.
6. Vérifiez les paramètres de récursion.
7. Utilisez un outil d’inspection World Info ou le journal des requêtes pour confirmer que l’entrée a réellement été envoyée.
8. Si elle a été envoyée mais ignorée, le problème restant concerne le comportement du modèle ou le contexte concurrent, pas le stockage STMB.

---

## 11. Mode de véritable discussion de groupe

### 11.1 Définition

Group Chat Mode s’applique à un véritable groupe SillyTavern contenant au moins deux cartes de personnages distinctes.

```text
SillyTavern Group
├── Alice character card
├── Bob character card
└── Clara character card
```

SillyTavern enregistre quelle carte a rédigé chaque message, ce qui permet à STMB de préserver l’attribution des locuteurs et de détecter les membres du groupe participants.

Aucun interrupteur Group Chat Mode séparé n’est requis. Ouvrez une discussion de groupe et utilisez STMB normalement.

### 11.2 Détection des participants

Un participant détecté est normalement une carte de personnage ayant rédigé au moins un message dans la scène sélectionnée.

STMB ne déduit pas à partir de la prose toutes les personnes physiquement présentes. Par conséquent :

- un observateur silencieux peut ne pas être détecté ;
- un personnage simplement mentionné n’est pas un participant ;
- un personnage absent dont le groupe parle n’est pas sélectionné ;
- l’utilisateur n’est pas considéré comme une cible de Memory Book de personnage de groupe ;
- des identités de locuteurs en doublon ou inhabituelles peuvent nécessiter une correction.

Si la détection automatique ne trouve aucun personnage du groupe, STMB ouvre la confirmation des participants même si l’acceptation automatique est activée. L’avertissement explique que la détection a échoué et exige que l’utilisateur vérifie quels personnages du groupe étaient présents avant de continuer.

Le prompt de participant signifie : **À quels personnages du groupe cette Memory doit-elle être associée ?** Il ne prouve pas qui connaissait chaque fait ni qui était physiquement présent.

### 11.3 Un Memory Book de groupe

C’est la disposition de départ recommandée.

Utilisez Automatic Mode, Auto-Create ou un livre principal Manual Mode. Chaque scène produit une entrée canonique dans le Memory Book de groupe. Lorsque les noms des participants sont disponibles, l’entrée peut recevoir un filtre de personnages SillyTavern inclusif.

Un filtre inclusif pour Alice et Bob signifie que l’entrée peut s’activer lorsque Alice **ou** Bob est actif. Il ne crée pas un personnage synthétique « Alice et Bob » ni un livre de sous-ensemble séparé.

Un seul livre de groupe convient le mieux lorsque :

- les personnages suivent surtout une histoire commune ;
- un résumé omniscient/orienté groupe suffit ;
- une configuration minimale et moins d’entrées dupliquées sont préférables ;
- STLO n’est pas nécessaire.

Une Memory de groupe unique peut tout de même préserver des connaissances asymétriques :

> Alice trouva l’émetteur et le cacha. Bob croyait que la pièce était vide.

### 11.4 Un livre de groupe plus des livres par personnage

La disposition avancée pour groupe réel utilise :

- un Memory Book de groupe canonique ;
- un Memory Book de personnage attribué à chaque membre du groupe.

Exigences :

- Manual Lorebook Mode ;
- SillyTavern-LorebookOrdering (STLO) installé et activé ;
- une affectation valide pour chaque membre du groupe requis.

Le livre de groupe canonique ne peut pas également servir de livre de personnage. Plusieurs personnages peuvent partager le même livre de personnage ; STMB écrit alors une seule copie dans ce livre partagé plutôt que des doublons.

Lorsqu’une Memory est enregistrée :

1. la version canonique est écrite dans le livre de groupe ;
2. la sélection des participants est confirmée sauf si l’acceptation automatique est activée ;
3. des copies liées sont écrites dans les livres des participants sélectionnés ;
4. STMB annule autant que possible les écritures partielles si un enregistrement requis échoue.

Ne sélectionner aucun participant dans la confirmation de groupe réel applique la Memory à tous les membres actuels du groupe.

### 11.5 Prompts de groupe et de personnage séparés

Par défaut, la même Memory orientée groupe est copiée dans les livres des participants.

Un profil peut activer **Use separate group and character prompts in group chats**. Alors :

- Group Summary Prompt écrit la version canonique de groupe ;
- Character Summary Prompt écrit une version individualisée pour chaque livre cible de personnage unique.

Les versions centrées sur un personnage peuvent préserver :

- connaissances privées ;
- croyances erronées ;
- réactions émotionnelles personnelles ;
- priorités spécifiques à une relation ;
- ce qui comptait pour un participant donné.

Cela nécessite des requêtes IA supplémentaires. Un livre de personnage partagé reçoit une seule copie partagée, pas un doublon par personnage attribué.

### 11.6 Responsabilités de STLO

Memory Books décide :

- de la plage de scène ;
- des participants ;
- du contenu du résumé ;
- des livres qui reçoivent des copies ;
- de l’utilisation éventuelle de prompts individualisés.

STLO décide :

- quand un lorebook est actif ;
- quel personnage peut l’activer ;
- de la priorité, de la position, du budget et de l’ordre.

Lorsque STMB attribue un livre de personnage, il ajoute le basename de l’avatar du personnage à `stlo.characterOverrides` et active `stlo.onlyWhenSpeaking`, tout en préservant les priorités, budgets et overrides STLO existants.

STMB suit un comportement d’ajout/fusion uniquement. Supprimer ou modifier une affectation ne retire pas automatiquement l’ancien override de personnage STLO. Supprimez manuellement les overrides obsolètes dans STLO.

### 11.7 Les filtres et livres ne sont pas des contrôles de confidentialité

Les livres et filtres séparés améliorent la pertinence. Ils ne garantissent pas que :

- un personnage ne recevra jamais les informations d’un autre ;
- le modèle ne verra jamais la version canonique de groupe ;
- le contexte de Memories précédentes soit parfaitement partitionné par connaissance ;
- un livre de personnage représente uniquement la connaissance consciente.

Utilisez-les comme outils de routage du contexte, pas comme frontières de sécurité.

### 11.8 Les copies liées ne sont pas synchronisées en direct

Les entrées liées partagent des métadonnées qui permettent à STMB de reconnaître le même événement d’origine, mais les modifications ultérieures sont indépendantes.

Modifier, supprimer ou compacter une copie ne modifie pas automatiquement les autres. Régénérer une copie de personnage ne change également que cette copie. Cependant, lors de la régénération de l’entrée canonique de groupe, STMB demande s’il faut régénérer uniquement cette entrée ou aussi toutes les entrées de personnage liées. Chaque entrée sélectionnée reçoit sa propre génération et sa propre révision d’approbation, de sorte que les prompts centrés personnage restent centrés personnage.

### 11.9 Ajouter, retirer ou réaffecter des membres du groupe

Ajout d’un personnage :

- attribuez un livre valide avant la prochaine Memory distribuée ;
- les anciennes Memories ne sont pas copiées rétroactivement ;
- les anciens filtres ne sont pas réécrits ;
- fournissez manuellement du contexte historique si nécessaire.

Retrait d’un personnage :

- les entrées existantes restent ;
- les anciens filtres et overrides STLO restent ;
- les copies liées ne sont pas supprimées automatiquement.

Changer le livre d’un personnage :

- change le routage futur ;
- ne retire pas nécessairement ce personnage des overrides STLO de l’ancien livre.

### 11.10 Consolidation de groupe

Le livre de groupe canonique utilise le prompt automatique d’analyse de consolidation de groupe, qui vise une chronologie omnisciente tout en distinguant événements objectifs et connaissances individuelles.

Les livres de personnage utilisent le preset de consolidation choisi dans la fenêtre. Les livres peuvent contenir des quantités différentes de sources admissibles. Un livre sans assez de contenu peut être ignoré avec avertissement tandis que les livres prêts continuent.

Une scène absente d’un livre de personnage est un trou dans la chronologie. Elle ne prouve ni absence, ni ignorance, ni inconscience. Un livre de personnage partagé reçoit une seule entrée consolidée.

---

## 12. Narrator Mode

### 12.1 Définition

Narrator Mode est destiné à une discussion SillyTavern normale en tête-à-tête dans laquelle une seule carte de personnage Narrator écrit plusieurs personnages fictifs.

```text
Normal SillyTavern Chat
└── Narrator card
    ├── writes Alice
    ├── writes Bob
    └── writes Clara
```

Sans Narrator Mode, SillyTavern considère toutes les réponses IA comme écrites par la carte Narrator. Narrator Mode fournit un modèle de distribution manuel afin que STMB puisse associer les scènes et les Memory Books aux personnages fictifs présents dans la prose du Narrator.

Narrator Mode n’est pas disponible dans une véritable discussion de groupe SillyTavern.

### 12.2 Disposition de stockage requise

Narrator Mode exige :

- Manual Lorebook Mode ;
- un **Memory Book omniscient/canonique** sélectionné ;
- un Memory Book unique pour chaque membre déclaré de la distribution.

Règles :

- un membre de la distribution ne peut pas utiliser le livre omniscient ;
- deux membres ne peuvent pas partager le même livre ;
- chaque membre déclaré doit disposer d’un livre disponible ;
- les membres retirés conservent leur identité et leur affectation de livre réservée jusqu’à leur restauration ou autre suppression prévue par l’implémentation ;
- Auto-Create est incompatible, car Narrator Mode dépend de Manual Lorebook Mode.

Contrairement à la disposition avancée des groupes réels, Narrator Mode ne nécessite pas STLO pour la récupération par personnage actif. STMB injecte les livres des membres actifs de la distribution dans le contexte de lorebook actif durant la génération.

### 12.3 Configuration

1. Ouvrez la discussion normale de la carte Narrator.
2. Activez Manual Lorebook Mode.
3. Sélectionnez le livre manuel principal ; il devient le Memory Book omniscient.
4. Activez **Narrator Mode**.
5. Ouvrez **Manage Narrator Cast**.
6. Ajoutez chaque personnage fictif par son nom et attribuez-lui un Memory Book unique.
7. Utilisez le panneau flottant **Active Cast** pour sélectionner les personnages présents dans le prochain échange.

Narrator Mode doit être désactivé avant de pouvoir désactiver Manual Lorebook Mode.

### 12.4 Panneau Active Cast et métadonnées de timeline

Le panneau flottant Active Cast peut être développé, réduit, déplacé et utilisé pour sélectionner les membres actuels.

Au moment de la génération, STMB capture l’état de la distribution active et l’enregistre dans les métadonnées des messages :

- le message utilisateur reçoit l’instantané de la distribution active ;
- la réponse Narrator reçoit l’instantané de génération ;
- une continuation fusionne sa distribution avec les métadonnées existantes ;
- les métadonnées de swipe sont stockées séparément pour chaque swipe ;
- sélectionner un swipe peut restaurer la distribution active depuis ce point de timeline ;
- supprimer des messages récents peut restaurer l’état de distribution depuis le dernier message Narrator marqué restant.

Le marqueur de distribution enregistre une association, pas une analyse sémantique de la prose.

### 12.5 Récupération durant une génération Narrator normale

Lorsqu’une génération Narrator commence, STMB charge les Memory Books de la distribution active et fusionne leurs entrées dans la collection de character-lore utilisée pour cette requête, en évitant les doublons de paires monde/UID.

Conséquences :

- seuls les livres de la distribution active sont ajoutés par ce flux Narrator ;
- le livre omniscient continue de suivre sa configuration/activation Manual Mode normale ;
- les filtres STLO par personnage ne sont pas requis pour Narrator Mode ;
- la sélection de la distribution doit être correcte avant génération si l’on souhaite que les bons livres de personnage soient présents dans le contexte.

### 12.6 Détection des participants à une scène

Pour une scène sélectionnée, les réponses Narrator marquées font autorité. STMB combine les IDs de distribution estampillés sur les messages écrits par le Narrator.

Si la scène contient des messages Narrator hérités non marqués, STMB utilise les informations de continuité de tous les messages comme fallback et demande à l’utilisateur de confirmer la distribution de la scène. Les membres actuellement actifs sont présélectionnés. Une sélection vide signifie qu’aucun membre individuel n’était présent.

Cette confirmation concerne spécifiquement les métadonnées de distribution héritées ou incomplètes ; les scènes entièrement marquées n’en ont pas besoin.

### 12.7 Distribution des Memories

Une Memory de scène Narrator est écrite sous forme de :

- une entrée canonique omnisciente dans le Memory Book principal ;
- une copie liée dans le Memory Book unique de chaque participant sélectionné.

Les copies Narrator n’utilisent pas les filtres de personnages natifs SillyTavern. STMB enregistre plutôt les IDs de participants et de propriétaire Narrator dans les métadonnées d’entrée.

Si les prompts multi-personnages séparés sont désactivés, les livres des participants reçoivent des copies du résumé omniscient. S’ils sont activés, chaque livre individuel peut recevoir une génération centrée sur son personnage.

### 12.8 Consolidation et régénération Narrator

Les métadonnées de propriété et de participation Narrator sont propagées dans les sources de consolidation. Les entrées de niveau supérieur peuvent ainsi conserver l’identité du livre de personnage propriétaire d’une copie et les membres de la distribution ayant participé au matériau sous-jacent.

Regeneration utilise ces métadonnées pour déterminer si la cible du prompt de remplacement est omnisciente/orientée groupe ou centrée personnage.

Comme pour les copies de groupe réel, les entrées Narrator liées ne sont pas synchronisées en direct après création.

### 12.9 Retirer des membres de la distribution

Le gestionnaire de distribution peut marquer un membre comme retiré puis le restaurer. Les membres retirés :

- sont retirés des choix Active Cast ;
- sont retirés de l’ensemble d’IDs Active Cast ;
- conservent une identité et un historique stables dans les métadonnées ;
- gardent leur réservation de livre, empêchant une réutilisation accidentelle qui fusionnerait des identités.

Utilisez le retrait pour un personnage qui quitte la distribution active mais dont l’identité historique de Memory doit rester intacte.

---

## 13. Branches de discussion

Les branches natives de SillyTavern peuvent devenir des continuités différentes. Si une branche et son parent écrivent dans les mêmes Memory Books non verrouillés, des chronologies contradictoires peuvent se mélanger.

**Copy Memory Books when branching** est activé par défaut.

### 13.1 Ce qui est copié

Lorsque STMB reconnaît une branche native nouvellement créée :

- Automatic Mode copie le Memory Book actif lié à la discussion ;
- Manual Mode copie le Memory Book manuel principal ;
- un véritable groupe en Manual Mode copie chaque Memory Book de personnage unique et non verrouillé ;
- Narrator Mode copie le livre omniscient et chaque livre de personnage déclaré ;
- les verrous persistants de personnages réels sont conservés au lieu d’être copiés, car un verrou signifie « continuer à utiliser ce même livre ».

Tous les livres copiés dans une même opération de branche utilisent le même numéro de lignée disponible :

```text
Group Memories Branch 1
Alice Memories Branch 1
Bob Memories Branch 1
```

Créer une branche depuis une branche existante conserve la racine de lignée originale au lieu de produire des noms comme `Branch 1 Branch 1`.

### 13.2 Métadonnées réécrites

Dans les copies, STMB :

- remplace les IDs de discussion parent correspondants par l’ID de la nouvelle branche ;
- redirige les liens canoniques groupe/personnage lorsque les deux livres liés ont été copiés ;
- met à jour les liaisons de la nouvelle branche pour pointer vers les copies.

Il clone le contenu existant ; il ne régénère pas les Memories.

### 13.3 Sécurité en cas d’échec

Ne changez pas de discussion pendant la copie des livres de branche.

Si la copie échoue, STMB efface les liaisons inscriptibles héritées de la nouvelle branche et enregistre l’échec afin que la branche ne puisse pas écrire silencieusement dans les originaux du parent.

### 13.4 Désactiver les copies de branche

Désactivez ce paramètre uniquement lorsque la branche est volontairement destinée à partager les mêmes Memory Books et la même histoire continue que le parent.

---

## 14. Clips

Un Clip enregistre directement du texte de discussion sélectionné dans une entrée de lorebook `[STMB Clip]`. Il n’appelle aucun modèle IA.

### 14.1 Utiliser Clips pour

- une préférence ;
- une promesse ou un secret ;
- un nom ou alias ;
- un objet ou animal ;
- un fait relationnel court ;
- une phrase à conserver exactement ou presque exactement ;
- une rapide « note à soi-même » qui ne justifie pas une Memory de scène.

### 14.2 Flux

1. Surlignez du texte dans un message de discussion.
2. Cliquez sur le bouton flottant ciseaux.
3. Choisissez une entrée Clip existante ou créez-en une nouvelle.
4. Choisissez un comportement toujours actif ou déclenché par mots-clés pour une nouvelle entrée.
5. Examinez l’entrée actuelle et l’aperçu mis à jour.
6. Renommez si nécessaire.
7. Enregistrez.

Le bouton flottant ciseaux n’apparaît qu’après sélection de texte de discussion et peut être désactivé dans le panneau principal.

### 14.3 Format d’entrée

Titre :

```text
Seraphina Healed Me [STMB Clip]
```

Contenu :

```markdown
=== Seraphina Healed Me ===

- Seraphina a guéri les blessures de l’utilisateur par magie.

=== END Seraphina Healed Me ===
```

Une entrée Clip possède une seule section. Des titres ciblés favorisent des mots-clés d’activation ciblés.

### 14.4 Entrées existantes

Une entrée existante peut être traitée comme Clip en ajoutant `[STMB Clip]` à la fin de son titre. Les longues entrées Clip peuvent être modifiées manuellement ou compactées.

Les Clips n’enregistrent que le texte choisi. Ils n’ajoutent pas automatiquement d’attribution de source.

---

## 15. Topical Clips

Un Topical Clip lit des entrées Memory STMB confirmées, une plage explicite de messages de la discussion actuelle, ou les deux, et demande à une IA de produire une entrée ciblée « à propos de ce sujet ». Les sources Memory admissibles peuvent inclure les Memories de scène et les résumés consolidés ; les entrées Clip et Side Prompt sont exclues comme sources.

### 15.1 Utiliser Topical Clip lorsque

Les informations sur un sujet sont réparties entre plusieurs Memories, par exemple :

- un PNJ récurrent ;
- un historique relationnel ;
- un lieu ou une faction ;
- une enquête ou un mystère ;
- pouvoirs, blessures, promesses, préférences ou secrets ;
- un objet important ;
- un fil narratif non résolu.

Topical Clip est organisé par sujet, pas selon la chronologie de chaque Memory source.

### 15.2 Restrictions des sources

Topical Clip utilise :

- des entrées Memory STMB confirmées du livre source sélectionné, y compris les résumés consolidés admissibles ;
- des messages visibles d’une plage inclusive `X-Y` explicitement sélectionnée dans la discussion actuelle.

Les contrôles **Include saved Memories** et **Include chat messages** peuvent être utilisés séparément ou ensemble. Les plages de messages suivent le réglage global de réaffichage avant Memory et restaurent les messages auparavant masqués après compilation.

Il n’utilise pas :

- les messages hors de la plage sélectionnée ;
- les entrées Clip ordinaires ;
- les entrées Side Prompt ;
- les entrées de lorebook ordinaires sans rapport.

### 15.3 Créer un Topical Clip

1. Ouvrez Memory Books.
2. Cliquez sur **Topical Clip**.
3. Choisissez le Memory Book source.
4. Saisissez le sujet.
5. Saisissez les mots-clés d’activation, ou laissez-les vides pour utiliser le sujet.
6. Choisissez une nouvelle entrée ou une cible existante `[STMB Clip]`.
7. Choisissez comme sources les Memories enregistrées, les messages de discussion, ou les deux.
8. Facultativement, sélectionnez uniquement certaines Memories sources et/ou saisissez une plage exacte de messages.
9. Choisissez le profil de génération.
10. Générez le brouillon.
11. Examinez-le et modifiez-le.
12. Enregistrez uniquement lorsqu’il est correct.

Le brouillon généré n’est jamais enregistré automatiquement.

### 15.4 Mettre à jour un Topical Clip existant

Après une exécution réussie, STMB enregistre quelles Memories sources ont été utilisées et, le cas échéant, la discussion source, la plage de messages, les IDs de messages et les hashes. Une mise à jour ultérieure basée sur les Memories envoie normalement uniquement les sources nouvelles ou modifiées, accompagnées du contenu Clip existant. Les plages de messages sont toujours choisies explicitement.

Utilisez **Rebuild from all source memories** lorsque :

- l’entrée actuelle est incomplète ou désorganisée ;
- le prompt a changé ;
- d’anciennes Memories ont été fortement modifiées ;
- le sujet entier doit être reconsidéré.

### 15.5 Sélection manuelle des sources et avertissements de tokens

Utilisez **Use only selected memories** lorsque le livre est volumineux, que le sujet se limite à une période de l’histoire, que des noms se chevauchent ou qu’un contrôle strict des preuves est nécessaire.

STMB estime la taille de la requête et avertit lorsque le seuil de tokens configuré est dépassé. Réduisez les sources, relevez volontairement le seuil, ou exécutez une fois malgré tout.

### 15.6 Norme de révision

Vérifiez que le brouillon :

- reste centré sur le sujet ;
- préserve noms et relations ;
- inclut les faits majeurs pertinents ;
- identifie les contradictions au lieu de choisir silencieusement une version ;
- n’invente pas d’explications non étayées par les Memories sources ;
- fusionne les mises à jour sans duplication inutile.

### 15.7 Placeholders du prompt

Un prompt Topical Clip personnalisé doit inclure `{{SOURCE_MEMORIES}}` lorsque les Memories enregistrées sont sélectionnées et `{{SOURCE_MESSAGES}}` lorsque les messages de discussion sont sélectionnés.

Placeholders de source :

```text
{{SOURCE_MEMORIES}}
{{SOURCE_MESSAGES}}
```

Placeholders pris en charge :

```text
{{MODE}}
{{TOPIC}}
{{KEYWORDS}}
{{EXISTING_CLIP}}
{{EXISTING_ENTRY_CONTENT}}
{{SOURCE_MEMORIES}}
{{SOURCE_MESSAGES}}
```

Utilisez Reset to Default si un prompt personnalisé cesse de produire des résultats utiles.

---

## 16. Side Prompts

Un Side Prompt est un prompt STMB nommé qui s’exécute séparément de la réponse normale du personnage. Il crée ou met généralement à jour une seule entrée de support continue plutôt qu’une autre Memory de scène séquentielle.

Dans la liste **Trackers & Side Prompts**, l’icône d’alimentation modifie immédiatement le drapeau global **Enabled** du prompt : verte signifie activé, atténuée signifie désactivé. Ce contrôle n’ajoute, ne supprime ni ne modifie les déclencheurs configurés du prompt.

### 16.1 Utilisations appropriées

- trackers d’intrigue et de fils non résolus ;
- état des relations ;
- statut des PNJ ou factions ;
- inventaire et ressources ;
- blessures, statistiques ou réputation ;
- chronologies, dates, échéances et voyages ;
- indices de mystère, suspects et contradictions ;
- inventions, recherches et projets ;
- rapports de risque de continuité ;
- résumés de l’état du monde.

Évitez les prompts vagues « suivez tout », les résumés de scène en double ou les tâches qui doivent apparaître dans la prochaine réponse de roleplay.

### 16.2 Format de sortie

Les Side Prompts attendent normalement du texte brut final ou du Markdown prêt à être enregistré. Ils ne nécessitent pas le JSON Memory. Le JSON n’est approprié que lorsque l’utilisateur souhaite volontairement enregistrer du JSON comme texte de tracker.

### 16.3 Séquence d’exécution

Une exécution typique assemble :

1. les instructions du Side Prompt ;
2. l’entrée tracker enregistrée précédemment, le cas échéant ;
3. éventuellement les Memories précédentes ;
4. éventuellement Additional Context ;
5. le texte de scène sélectionné ou depuis la dernière exécution ;
6. éventuellement les instructions Response Format.

L’entrée précédente est un état existant à réviser, pas une preuve que chaque ancienne affirmation doit rester. Les prompts doivent explicitement supprimer les informations obsolètes, résolues, contredites ou dupliquées.

### 16.4 Exécutions manuelles

```text
/sideprompt "Prompt Name"
/sideprompt "Prompt Name" 10-20
/sideprompt "Relationship Tracker" {{npc name}}="Alice" 10-20
```

Les noms contenant des espaces doivent être entre guillemets. Une plage fournie est inclusive.

Les exécutions manuelles conviennent aux analyses ciblées et aux prompts nécessitant des valeurs de macros runtime.

### 16.5 Exécutions automatiques après Memory

Un Side Prompt peut activer **Run automatically after memory**.

La discussion utilise alors un des deux modes de sélection automatique :

- Side Prompts activés individuellement ;
- un Side Prompt Set sélectionné.

Un set sélectionné remplace les prompts automatiques activés individuellement pour cette discussion. Il ne s’y ajoute pas.

#### Side Prompt Memory Assistance

**Memory Assistance** est un Side Prompt réservé avec quatre modes indépendants. Il s’exécute après les Memories enregistrées avec succès, indépendamment de l’activation ordinaire des Side Prompts ou du Side Prompt Set sélectionné. Il ne s’exécute pas durant la régénération d’une Memory.

Memory Assistance compare la scène brute traitée avec les Clips ordinaires et Topical Clips de chaque Memory Book ayant reçu la Memory. Il envoie à l’IA le titre/sujet, les mots-clés, le contenu actuel, l’ID stable et le type de chaque Clip examiné.

Lorsque la file de tâches est disponible, chaque Memory Book cible reçoit une tâche **Memory Assistance** séparée après enregistrement de la Memory. Une erreur de requête, de validation de réponse, d’enregistrement du rapport ou d’application automatique marque cette tâche **Failed** et expose l’erreur dans la file. La Memory enregistrée reste **Completed**, et réessayer Memory Assistance ne régénère pas la Memory.

- **Off** désactive Memory Assistance.
- **Update** examine directement cinq Clips ou moins ; plus de cinq ouvre une liste de sélection. Les modifications proposées attendent une approbation manuelle.
- **Update and Suggest** effectue d’abord une requête de découverte de sujets, puis le même flux d’examen des Clips existants qu’Update.
- **Automatic** examine tous les Clips en lots basés sur les tokens sans demander lesquels examiner. Il applique directement les ajouts valides aux Clips ordinaires, tandis que les remplacements de Topical Clips restent en attente d’approbation dans **Memory Assistance Suggestions**.

- Dans les modes Update et Update and Suggest, la grande liste de sélection propose **Query Selected** et **Query All**.
- Query All et le mode Automatic utilisent des lots basés sur les tokens au lieu de forcer tous les Clips dans une seule requête surdimensionnée.
- Chaque Clip ordinaire reçoit au maximum un extrait exact de message proposé comme ajout.
- Les Topical Clips reçoivent des brouillons de remplacement complets.
- La réponse IA est un objet JSON simple mappant directement chaque UID de Clip concerné vers l’extrait ou le remplacement suggéré. Un objet vide signifie qu’aucun Clip ne nécessite de mise à jour.
- Les résultats Update sont écrits dans `Memory Assistance (STMB SidePrompt)` et restent non appliqués jusqu’à approbation via **Memory Assistance Suggestions**.
- Les résultats du mode Automatic enregistrent combien d’ajouts de Clip ordinaire ont été appliqués et conservent les remplacements de Topical Clip ainsi que les éventuels échecs d’application pour révision manuelle.
- Annuler la sélection efface les anciennes suggestions afin qu’elles ne soient pas confondues avec les résultats de la dernière scène.

Update and Suggest utilise un prompt séparé uniquement pour la suggestion avant les lots d’examen des Clips existants. La requête contient la scène traitée et une liste légère des titres, sujets et mots-clés des Topical Clips existants. Elle n’envoie pas les Clips ordinaires ni les corps de Clips existants pendant la découverte. L’IA renvoie de zéro à cinq nouveaux sujets sous forme d’objets JSON contenant un sujet et des mots-clés d’activation ; `{"topics":[]}` est un résultat valide.

Les sujets suggérés sont enregistrés dans le rapport Memory Assistance. Dans **Memory Assistance Suggestions**, choisissez **Review Topics** pour les voir comme lignes cochées et modifiables. Vous pouvez décocher les sujets indésirables, modifier les noms ou mots-clés, ou ajouter d’autres sujets. Les sujets confirmés ouvrent le flux standard de brouillon Topical Clip un par un. Un sujet en attente n’est supprimé qu’après enregistrement de son Topical Clip ; fermer le brouillon le laisse disponible via **Memory Assistance Suggestions**.

Lorsque des suggestions à examiner sont prêtes, STMB ouvre une fenêtre de fin pour le Memory Book mis à jour. **Dismiss** ferme l’avis, tandis que **Go to Suggestions** ouvre **Memory Assistance Suggestions** avec ce Memory Book déjà sélectionné. Ouvrir **Memory Assistance Suggestions** depuis le menu de l’extension sélectionne d’abord le Memory Book effectif de la discussion actuelle (livre lié à la discussion en Automatic Mode ou livre manuel résolu en Manual Mode).

Les prompts Update et Topic Suggestions et la surcharge de profil de connexion sont modifiables indépendamment, mais les deux contrats de réponse structurée sont fixes. Memory Assistance ne peut pas être supprimé, dupliqué, placé dans un Side Prompt Set ni exécuté manuellement.

### 16.6 Intervalles automatiques de messages visibles

Un Side Prompt peut activer **Run on visible message interval** et spécifier un nombre de messages visibles depuis son checkpoint.

Les messages masqués et système ne comptent pas.

Lorsqu’un set est actif, seules les lignes de ce set dont le prompt référencé possède le déclencheur d’intervalle approprié sont candidates.

### 16.7 Side Prompt Sets

Un Side Prompt Set est une liste d’exécution ordonnée, pas simplement un dossier. Le même template peut apparaître plusieurs fois avec des valeurs de macro différentes.

Exemple :

1. Relationship Tracker — Alice
2. Relationship Tracker — Bob
3. Plot Tracker
4. Cleanup Report

Les lignes peuvent stocker :

- une référence de prompt ;
- un libellé facultatif ;
- des valeurs de macros runtime ;
- un ordre ;
- des actions dupliquer ou supprimer.

Les lignes s’exécutent de haut en bas.

Commandes manuelles de set :

```text
/sideprompt-set "Set Name"
/sideprompt-set "Set Name" 10-20
/sideprompt-macroset "Relationship Pass" {{npc_1}}="Alice" {{npc_2}}="Bob" 10-20
```

### 16.8 Sets par défaut et sélection par discussion

General Settings peut définir :

- un set par défaut pour les discussions solo ;
- un set par défaut pour les discussions de groupe.

Chaque discussion peut :

1. hériter du défaut applicable ;
2. utiliser explicitement les prompts activés individuellement ;
3. choisir un set nommé.

Un défaut global vide signifie mode individuel.

Si un set sélectionné est supprimé, STMB avertit au lieu de substituer silencieusement un autre flux. Un prompt de ligne manquant ou une macro non résolue fait ignorer cette ligne avec avertissement.

Le set sélectionne les lignes candidates. Chaque Side Prompt référencé doit toujours posséder le déclencheur automatique pertinent pour une exécution après-Memory ou d’intervalle. Les commandes manuelles de set ne nécessitent pas ces cases de déclenchement.

### 16.9 Macros

Les Side Prompts peuvent utiliser les macros SillyTavern normales telles que :

```text
{{user}}
{{char}}
```

Les placeholders `{{...}}` non standard sont des macros runtime. Ils doivent être fournis manuellement ou enregistrés dans une ligne de set.

Exemples :

```text
{{npc name}}
{{faction}}
{{project_name}}
```

Un prompt avec des macros runtime non résolues ne peut pas s’exécuter automatiquement. Les exécutions automatiques ne peuvent pas s’arrêter pour demander des valeurs.

### 16.10 Macros de comptage des Memories

STMB enregistre des macros entières pour le Memory Book principal effectif :

| Macro | Nombre |
|---|---|
| `{{memtier0}}` | Memories de scène |
| `{{memtier1}}` | Arcs |
| `{{memtier2}}` | Chapters |
| `{{memtier3}}` | Books |
| `{{memtier4}}` | Legends |
| `{{memtier5}}` | Series |
| `{{memtier6}}` | Epics |
| `{{memclips}}` | entrées Clip |
| `{{memside}}` | entrées Side Prompt |

Le livre principal effectif est le livre lié à la discussion en Automatic Mode ou le livre manuel principal résolu en Manual Mode. Dans une configuration de groupe ou Narrator multi-livres, les compteurs ne totalisent pas tous les livres de personnage.

Une macro de comptage ne fournit qu’un nombre, pas le contenu de ces entrées.

### 16.11 Plages de messages

Une plage explicite utilise exactement cette plage inclusive. Sans plage, STMB utilise le comportement depuis-le-dernier-checkpoint/limite du Side Prompt.

Utilisez des plages explicites pour le débogage, les nettoyages ciblés ou la réexécution d’une section connue.

### 16.12 Additional Context et Memories précédentes

Un Side Prompt peut inclure jusqu’à sept Memories de scène précédentes.

Sa source Additional Context peut être :

- aucune ;
- **Follow chat**, utilisant le Context Setting sélectionné par la discussion ;
- un Context Setting nommé fixe.

Ce sont des matériaux de référence. Le prompt ne doit pas les recopier aveuglément dans le tracker.

### 16.13 Cibles de lorebook

Un Side Prompt enregistre normalement dans le Memory Book effectif. Il peut à la place utiliser :

1. une surcharge de cible par discussion ;
2. une cible au niveau du template ;
3. le Memory Book effectif comme fallback.

Une surcharge valide par discussion a priorité.

Utilisez des cibles alternatives pour un livre de campagne partagé volontaire ou un livre de tracker dédié. Ne dispersez pas les trackers sans plan de récupération.

### 16.14 Contrôles d’entrée Side Prompt

Un template peut configurer :

- un remplacement de titre ;
- des mots-clés ;
- activation Normal, Constant ou Vectorized ;
- position d’insertion et nom d’Outlet ;
- mode/valeur d’ordre ;
- Prevent Recursion ;
- Delay Until Recursion ;
- Ignore Budget.

Les champs titre et mots-clés peuvent développer les macros applicables. **Ignore Budget** doit être utilisé avec parcimonie, car plusieurs trackers toujours inclus peuvent consommer beaucoup de contexte.

### 16.15 Surcharge du profil de connexion

Un Side Prompt peut hériter de la résolution de connexion Memory Books normale ou lier un profil STMB spécifique. Une surcharge est utile pour un modèle moins cher ou meilleur en maintenance structurée. Trop de combinaisons de profils rendent le dépannage plus difficile.

### 16.16 Régénération de Side Prompt

Les enregistrements compatibles stockent un instantané compact contenant :

- la clé du template Side Prompt ;
- le contenu précédent de l’entrée ;
- la discussion source et la plage inclusive ;
- les valeurs de macros runtime.

Pour régénérer, ouvrez l’éditeur de lorebook et cliquez sur **Regenerate side prompt**. Le remplacement utilise l’instantané enregistré avec le template actuel et les paramètres actuels de profil/contexte.

La régénération ne peut pas aboutir si le template a été supprimé, si la discussion/plage source est indisponible, ou si la cible/source a changé durant la génération. Seul le contenu est remplacé ; le titre, les mots-clés et les paramètres d’entrée existants restent inchangés.

### 16.17 Rédiger de bons Side Prompts

Un bon Side Prompt définit :

- la tâche de maintenance exacte ;
- le matériau source à examiner ;
- s’il faut réviser, remplacer, fusionner ou ajouter ;
- les informations obsolètes à supprimer ;
- des titres et un ordre de sortie stables ;
- une limite de longueur stricte ;
- un comportement « sortie finale uniquement ».

Exemple :

```text
Mettez à jour le tracker de relation à partir de la scène fournie. Conservez les faits actuels, fusionnez les nouveaux développements dans les sections existantes et supprimez les détails résolus, contredits, obsolètes ou dupliqués. Limitez chaque relation à 1–3 puces concises. Produisez uniquement le tracker mis à jour.
```

Garde-fous utiles :

```text
N’ajoutez pas de nouvelle section sauf s’il existe réellement de nouvelles informations.
Supprimez les fils résolus et les spéculations obsolètes.
Produisez uniquement le rapport mis à jour ; aucune préface ni explication.
Limitez l’ensemble de la sortie à 300 mots.
```

Des titres stables réduisent la dérive au fil des mises à jour répétées.

### 16.18 Dépannage des Side Prompts

Si un prompt ne s’est pas exécuté :

- confirmez que l’événement Memory ou intervalle a réellement eu lieu ;
- inspectez la sélection individuelle/set de la discussion ;
- vérifiez que le prompt référencé existe toujours ;
- vérifiez que le déclencheur automatique pertinent est activé ;
- vérifiez que toutes les macros runtime ont une valeur ;
- vérifiez si `/stmb-stop` ou une tâche échouée l’a annulé.

S’il s’est exécuté deux fois :

- vérifiez invocation manuelle plus automatique ;
- lignes dupliquées dans un set ;
- copies dupliquées du prompt ;
- plusieurs onglets ou discussions déclenchant du travail.

Si le mauvais livre l’a reçu, inspectez les cibles par discussion et au niveau du template.

Si la sortie grandit indéfiniment, ajoutez des règles explicites de remplacement, élagage, nombre d’éléments et nombre de mots.

---

## 17. Consolidation

La Consolidation combine des Memories ou résumés STMB de niveau inférieur en récapitulatifs chronologiques de niveau supérieur.

### 17.1 Niveaux

```text
Scene Memory → Arc → Chapter → Book → Legend → Series → Epic
```

La Consolidation travaille à partir d’entrées STMB existantes, pas directement à partir de la discussion brute.

### 17.2 Objectif

Utilisez-la lorsque :

- les Memories de scène s’accumulent ;
- les anciens éléments n’ont plus besoin du détail complet de chaque scène ;
- une grande phase de relation, intrigue ou campagne est terminée ;
- l’usage de tokens doit être réduit tout en préservant la continuité ;
- une chronologie de niveau supérieur plus propre est souhaitée.

Les entrées consolidées doivent mettre l’accent sur les changements durables, tournants, objectifs, conséquences, évolutions de relations, fils non résolus et états stables.

### 17.3 Flux manuel

1. Ouvrez **Consolidate Memories**.
2. Choisissez le niveau cible.
3. Sélectionnez les entrées sources admissibles.
4. Choisissez les paramètres de prompt/profil de consolidation.
5. Décidez si les entrées sources doivent être désactivées après une consolidation réussie.
6. Lancez l’opération et examinez les candidats.
7. Approuvez les résumés souhaités.

### 17.4 Les prompts de disponibilité ne sont pas une consolidation automatique

**Prompt for consolidation when a tier is ready** surveille les niveaux cibles sélectionnés. Lorsque le nombre minimal enregistré d’éléments admissibles est atteint, STMB présente un choix yes/later. Choisir Yes ouvre l’interface de consolidation. Cela ne consolide jamais silencieusement.

### 17.5 Schéma de sortie de Consolidation

La consolidation ordinaire attend un JSON strict :

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

Le modèle peut renvoyer un ou plusieurs résumés. `member_ids` affecte chaque source à un résumé renvoyé. Les éléments atypiques doivent aller dans `unassigned_items` au lieu d’être forcés dans un récapitulatif sans rapport.

### 17.6 Résumé précédent de niveau supérieur

Un résumé précédent du niveau cible peut être fourni comme contexte canonique. Ce n’est pas un matériau source à réécrire. Les prompts de consolidation doivent le distinguer des entrées de niveau inférieur traitées.

### 17.7 Aperçus et réponses échouées

Les aperçus de consolidation peuvent permettre de modifier, accepter, régénérer un candidat à partir des mêmes sources, ou régénérer un lot en attente.

Les réponses IA malformées ou échouées peuvent être inspectées et, lorsqu’elles sont prises en charge, corrigées manuellement avant validation.

### 17.8 Désactivation des sources

Lorsque cette option est activée, STMB désactive les entrées sources après consolidation réussie afin que le résumé de niveau supérieur puisse prendre le relais pour la récupération. Cette opération est réversible via l’édition de lorebook.

### 17.9 Bons prompts de consolidation

Ils doivent définir :

- la cible de compression ;
- s’il faut créer un récapitulatif ou le plus petit nombre cohérent ;
- la logique chronologique et de regroupement ;
- les détails qui doivent survivre ;
- la gestion explicite des éléments atypiques ;
- la structure JSON exacte.

Ils doivent préserver les grands événements, conséquences, promesses, changements relationnels, identifiants, fils non résolus et mots-clés utiles à la récupération tout en supprimant le détail répétitif au niveau scène.

---

## 18. Compaction

La Compaction demande à une IA de raccourcir une entrée STMB existante et présente l’original et le brouillon avant remplacement.

### 18.1 Entrées admissibles

- entrées `[STMB Clip]` ;
- entrées Side Prompt ;
- entrées STMB Memory.

Les entrées ordinaires non STMB de lorebook ne sont pas listées.

### 18.2 Flux

1. Ouvrez **Compaction**.
2. Choisissez un Memory Book.
3. Choisissez un Compaction Profile.
4. Modifiez éventuellement le Compaction Prompt.
5. Choisissez une entrée.
6. Comparez les estimations de tokens/contenu d’origine et compacté.
7. Modifiez le brouillon si nécessaire.
8. Remplacez, copiez le brouillon ou annulez.

L’original n’est pas modifié tant que **Replace with Compacted Version** n’est pas sélectionné.

### 18.3 Bons usages

- longues collections de Clips ;
- contenu de tracker répété ou obsolète ;
- Memories de scène trop verbeuses ;
- entrées toujours actives consommant trop de contexte.

La Compaction ne sert pas à ajouter des faits, résumer la discussion brute, créer une nouvelle Memory ni traiter des entrées de lorebook ordinaires.

### 18.4 Placeholders du prompt

```text
{{ENTRY_CONTENT}}  required current content
{{ENTRY_KIND}}     Clip, SidePrompt, or Memory
{{ENTRY_TITLE}}    entry title
```

Le prompt doit préserver les faits, noms, pronoms, macros, titres d’enveloppe et marqueurs de fin tout en supprimant les redondances et formulations de faible valeur.

---

## 19. Regeneration

Regeneration crée un remplacement révisable pour une entrée existante. Elle ne crée pas une seconde entrée numérotée et n’écrase jamais sans approbation.

### 19.1 Régénération d’une Scene Memory

- ouvrez la discussion source ;
- ouvrez le Memory Book dans l’éditeur de lorebook ;
- cliquez sur **Regenerate memory** ;
- pour une entrée canonique de groupe avec des entrées de personnage liées, choisissez de régénérer uniquement l’entrée cliquée ou toutes les entrées liées ;
- choisissez le profil actuel, le prompt, le nombre de Memories précédentes et Additional Context ;
- examinez le titre, le contenu et les mots-clés de chaque entrée sélectionnée.

La plage de scène originale et le numéro de séquence sont conservés. Les entrées liées réutilisent les mêmes paramètres de régénération sélectionnés, mais sont générées avec le contexte de leur propre Memory Book et leur propre cible de prompt groupe/personnage. STMB recueille toutes les approbations avant de commencer à enregistrer les régénérations directes. Si tous les messages sources sont masqués, révélez-les ou activez unhide-before-generation.

### 19.2 Régénération de Consolidation

Un résumé de niveau supérieur est régénéré à partir de ses sources exactes de niveau inférieur liées, à l’aide du preset dédié **Regenerate Consolidation**.

L’ensemble complet des sources doit encore exister au niveau correct. Une source de niveau inférieur ne peut pas être régénérée tant qu’un résumé parent actif en dépend ; supprimez d’abord le parent lorsque vous reconstruisez volontairement le niveau inférieur.

### 19.3 Régénération de Side Prompt

Voir les règles d’instantané Side Prompt dans la Section 16.16.

### 19.4 Contrôles de sécurité

Immédiatement avant remplacement, STMB vérifie que :

- l’entrée cible n’a pas changé ;
- la plage de discussion source n’a pas changé ;
- les sources de consolidation requises n’ont pas changé et sont disponibles ;
- l’entrée reste admissible.

Si une vérification échoue, rien n’est écrasé.

Les copies liées de groupe, personnage et Narrator restent indépendantes.

---

## 20. Contexte pour la génération

Plusieurs sources de contexte peuvent apparaître dans une requête STMB. Elles ne sont pas interchangeables.

### 20.1 Scène actuelle

La plage de messages actuellement traitée. C’est le matériau cible d’une Scene Memory ordinaire.

### 20.2 Previous Memories

Memories de scène antérieures provenant du Memory Book effectif, incluses comme contexte de continuité en lecture seule. L’utilisateur peut normalement en inclure de 0 à 7.

Elles ne doivent pas être résumées à nouveau simplement parce qu’elles apparaissent avant la scène actuelle.

### 20.3 Additional Context

Entrées de lorebook sélectionnées fournies comme matériau de référence stable, par exemple :

- règles de personnage ou de décor ;
- noms et terminologie canoniques ;
- contraintes de campagne ;
- chronologie faisant autorité ;
- références de lieux ;
- faits supposés mais non répétés dans la scène.

Additional Context apparaît avant les Previous Memories et la transcription de scène. C’est du matériau de référence, pas une autre scène.

### 20.4 Context Settings

Un Context Setting est une collection ordonnée réutilisable d’entrées Additional Context.

Flux :

1. ouvrez **Context Settings** ;
2. créez un réglage nommé ;
3. sélectionnez les entrées de lorebook ;
4. ordonnez-les ;
5. choisissez le réglage pour la discussion actuelle ou choisissez explicitement No Context.

La sélection est enregistrée par discussion et fonctionne avec Current SillyTavern Settings ainsi qu’avec les profils enregistrés.

Si un livre ou une entrée référencée disparaît, STMB avertit, ignore la référence obsolète et continue. Si le Context Setting entier est supprimé, les discussions qui y font référence continuent sans Additional Context jusqu’à ce qu’une autre sélection soit faite.

Les Context Settings peuvent être dupliqués, importés et exportés sous `stmb-context-settings.json`.

### 20.5 Entrée Side Prompt antérieure

Le texte actuel du tracker à réviser. C’est un état, pas une preuve que toutes les anciennes affirmations restent valides.

### 20.6 Sources de Consolidation

Entrées de niveau inférieur qui constituent le véritable matériau à regrouper et compresser.

### 20.7 Résumé précédent de niveau supérieur

Canon transporté durant la Consolidation. Ce n’est pas une source à réécrire.

### 20.8 Ordre correct selon le flux

Memory ordinaire :

```text
Memory prompt
Additional Context
Previous Memories
Current scene transcript
```

Side Prompt :

```text
Side Prompt instructions
Prior entry
Previous Memories
Additional Context
Scene text
Response Format
```

Consolidation :

```text
Consolidation prompt
Previous higher-tier summary
Selected lower-tier source entries
```

Les prompts doivent clairement étiqueter le matériau cible et le matériau de référence uniquement.

---

## 21. Architecture des prompts, prompts de résumé intégrés et règles de rédaction

STMB possède trois principaux systèmes de génération structurée, plus plusieurs flux auxiliaires ciblés.

### 21.1 Génération de Memory ordinaire

STMB attend un objet JSON :

```json
{
  "title": "Short scene title",
  "content": "The memory text",
  "keywords": ["keyword1", "keyword2"]
}
```

Règles :

- renvoyer uniquement l’objet JSON ;
- utiliser exactement les clés `title`, `content` et `keywords` ;
- `keywords` doit être un tableau JSON de chaînes ;
- conserver un titre court et lisible ;
- utiliser des termes de récupération concrets ;
- placer tout Markdown souhaité dans la chaîne `content` ;
- échapper correctement les guillemets.

STMB peut réparer certaines fences, virgules finales, think tags, wrappers ou petites malformations, mais les prompts ne doivent jamais dépendre de cette récupération.

Un bon Memory prompt précise :

1. le style de mémoire et le niveau de compression souhaités ;
2. les informations importantes pour la continuité à préserver ;
3. le remplissage, l’OOC ou le contenu non étayé à omettre ;
4. le schéma JSON exact.

Les prompts faibles décrivent le style mais pas la structure, demandent une analyse au lieu d’un objet final, mélangent le contexte précédent avec la scène actuelle ou utilisent des mots-clés abstraits.

### 21.2 Built-in Summary Prompts et choix

Ces presets servent uniquement à la génération de Memory ordinaire. Ils ne contrôlent pas Consolidation, Side Prompts, Topical Clips ou Compaction. Un profil en sélectionne un sous **Memory Creation Method**. **Summary** est le fallback/défaut ordinaire lorsqu’un profil ne précise pas un autre preset. « Built-in » signifie fourni par STMB ; cela ne veut pas dire que tous les presets s’exécutent ou conviennent également à une discussion.

Il n’existe pas de meilleur prompt universel, car détail, lisibilité, qualité de récupération et coût en tokens tirent dans des directions différentes. Réponse pratique courte :

- **Meilleur point de départ pour la plupart : Summary.** Équilibré, polyvalent et adapté au premier test avec un nouveau modèle.
- **Meilleur pour le roleplay long et sensible à la continuité : Comprehensive.** Il applique les consignes les plus fortes sur filtrage, causalité, continuité et mots-clés, mais exige davantage du modèle et peut produire une Memory structurée plus volumineuse.
- **Meilleur lorsque l’économie de contexte est prioritaire : Minimal.** Il est volontairement bref et perdra de la nuance.
- **Meilleur pour les livres séparés de personnages de groupe réel ou Narrator : Group et Character.** Utilisez-les ensemble via le réglage de prompts groupe/personnage séparés du profil ; ce sont des prompts de ciblage, pas des styles polyvalents concurrents.

| Prompt intégré | Meilleur usage | Principal compromis |
|---|---|---|
| **Summary** | La plupart des discussions solo et la première configuration. Produit une prose narrative chronologique détaillée avec événements, interactions, développements, révélations, résultats et mots-clés concrets. | Conserve plus de détails qu’un utilisateur très axé tokens peut souhaiter, mais reste plus simple et moins exigeant que les presets les plus structurés. |
| **Comprehensive** | Histoires longues très sensibles à la continuité, où chaînes causales, dynamiques de personnages, faits établis, échanges clés, fils non résolus et mots-clés disciplinés comptent. Il filtre explicitement les détails accessoires et améliore la construction des mots-clés. | Instructions les plus longues et exigeantes. Utilisez un modèle capable de bien suivre les consignes et prévoyez assez de tokens de réponse. |
| **Summarize** | Utilisateurs préférant un enregistrement Markdown très scannable divisé en Timeline, Story Beats, Key Interactions, Notable Details et Outcome. | Une sortie très en puces peut ressembler davantage à des notes de référence qu’à une mémoire naturelle et peut répéter des faits entre sections. |
| **Synopsis** | Scènes où préserver presque chaque événement, interaction, détail et conséquence important compte davantage que la concision. | Volontairement long et exhaustif ; l’un des choix les moins adaptés lorsque le budget lorebook/contexte est serré. |
| **Sum Up** | Un relevé narratif chronologique des événements avec un titre de scène et une timeline visibles, mais moins de sections que Summarize ou Synopsis. | Sépare moins explicitement événements, dynamiques de personnages, faits et état de continuité. |
| **Minimal** | Discussions à fort volume, couverture d’archive peu coûteuse ou configurations où les Memories doivent consommer très peu de contexte. Produit une Memory brève de deux à cinq phrases. | Peut perdre motifs, changements émotionnels, causalité et petits détails de continuité. |
| **Northgate** | Utilisateurs d’écriture créative qui veulent un enregistrement littéraire cohérent à la troisième personne et au passé, mettant l’accent sur actions, changements émotionnels, développement et dialogues importants. Ce style communautaire est crédité à Northgate sur le Discord SillyTavern. | Optimise la lisibilité narrative plutôt que la compression maximale ou des catégories de référence bien séparées. Contrairement à la plupart des presets généraux, son texte intégré n’exclut pas explicitement l’OOC ; révisez-le si l’OOC est fréquent. |
| **Aelemar** | Grandes scènes d’intrigue et moments émotionnels importants qui doivent rester compréhensibles comme enregistrement autonome même si la scène source est indisponible. Ce style communautaire est crédité à Aelemar sur le Discord SillyTavern. | Exige au moins 300 mots et est volontairement détaillé, donc inadapté à l’économie agressive de tokens. Son texte intégré n’exclut pas non plus explicitement l’OOC. |
| **Group** | Le Memory Book partagé/omniscient d’un véritable groupe, ou la cible omnisciente d’un flux multi-livres. Préserve décisions et état du groupe tout en attribuant actions, émotions et connaissances au bon membre. | Ne l’utilisez pas comme Memory individuelle d’un personnage ; il vise volontairement la continuité partagée du groupe. |
| **Character** | Un Memory Book centré sur un personnage dans un flux de groupe réel ou multi-personnages. Enregistre ce que ce personnage a fait, su, ressenti, appris, caché, mal compris ou subi. | Omet volontairement le matériau de scène non pertinent pour la cible et limite les connaissances privées non étayées. |

Pour une nouvelle installation, utilisez **Summary** jusqu’à ce que génération et récupération fonctionnent de manière fiable. Ensuite, modifiez uniquement le prompt et comparez plusieurs Memories de scènes similaires. Préférez **Comprehensive** si le problème est une causalité omise, un état de continuité faible ou des mots-clés médiocres ; préférez **Minimal** si le problème est la taille des Memories. Changer de prompt ne compense pas un modèle faible, une sortie tronquée, de mauvaises frontières de scène ou une récupération mal configurée.

Le texte exact des presets intégrés peut être recréé pour la locale SillyTavern actuelle. Recréer les built-ins supprime les modifications locales de ces built-ins, mais ne doit pas supprimer les presets personnalisés sans rapport. Dupliquez ou exportez un built-in modifié avant de le recréer.

### 21.3 Ciblage des prompts multi-personnages

Lorsque les prompts groupe/personnage séparés sont activés, STMB marque la cible de la requête comme :

- `group` pour une Memory canonique de groupe réel ou omnisciente Narrator ;
- `character` pour une version de livre individuel.

Le prompt doit explicitement utiliser la perspective cible sans inventer de connaissances non étayées par la scène et le contexte fourni.

### 21.4 Rédaction de Side Prompt

Les Side Prompts renvoient normalement du texte brut ou du Markdown. Rédigez-les comme des instructions de maintenance, pas comme des Memory prompts.

Un bon Side Prompt :

- définit une tâche étroite ;
- explique comment utiliser le tracker précédent ;
- supprime l’état obsolète ;
- impose des titres stables et des limites de longueur ;
- renvoie uniquement le tracker final.

### 21.5 Rédaction de Consolidation

La consolidation ordinaire exige le schéma de la Section 17.5. Un bon prompt :

- préserve la chronologie ;
- crée le plus petit nombre cohérent de résumés ;
- affecte chaque source utilisée via `member_ids` ;
- identifie les restes via `unassigned_items` ;
- préserve les changements majeurs et la continuité non résolue ;
- utilise des mots-clés concrets.

Le preset dédié **Regenerate Consolidation** sert à un seul résumé de remplacement et n’est pas sélectionnable comme défaut de consolidation normale.

### 21.6 Rédaction de Topical Clip

Le prompt doit inclure `{{SOURCE_MEMORIES}}`, rester centré sur le sujet demandé, distinguer preuve source et inférence, fusionner les nouveaux éléments avec le contenu Clip existant et faire apparaître les contradictions.

### 21.7 Rédaction de Compaction

Le prompt doit inclure `{{ENTRY_CONTENT}}` et raccourcir sans ajouter de faits non étayés. Il doit préserver les wrappers structurels et les macros nécessaires à l’entrée.

### 21.8 Checklist de rédaction de prompt

Avant de finaliser un prompt STMB, répondez à :

1. Quel matériau est la véritable cible de l’analyse ?
2. Quel matériau est uniquement référence ?
3. Ce chemin attend-il du JSON strict ou du texte final ?
4. Quelles informations doivent survivre pour la récupération ultérieure ?
5. Que faut-il omettre, fusionner, conserver ou laisser non affecté ?

La correction du format de retour passe avant le style.

---

## 22. Summary Prompt Manager et Consolidation Prompt Manager

### Summary Prompt Manager

Permet de créer, modifier, dupliquer, supprimer, importer et exporter les presets de prompts Memory ordinaires. Affectez un preset via un profil Memory Books.

Tous les presets Memory ordinaires doivent préserver le schéma JSON Memory requis.

Voir la Section 21.2 pour le guide de choix des Built-in Summary Prompts et leurs meilleurs usages.

### Consolidation Prompt Manager

Contrôle les prompts utilisés pour regrouper des entrées de niveau inférieur en résumés de niveau supérieur et sélectionne le prompt de consolidation ordinaire par défaut.

Le preset de consolidation réservé à la régénération ne peut pas servir à une consolidation ordinaire.

### Import et comportement de localisation

Les prompts intégrés peuvent être recréés dans la locale actuelle de l’application. Sauvegardez les built-ins modifiés localement avant de les recréer.

---

## 23. Intégration Regex

STMB s’intègre à l’extension Regex de SillyTavern à deux étapes :

1. **Outgoing/User Input :** transformer le prompt assemblé avant son envoi.
2. **Incoming/AI Output :** nettoyer ou standardiser la réponse brute avant analyse/enregistrement.

Activez **Use regex (advanced)**, puis ouvrez **Configure regex** et sélectionnez un ou plusieurs scripts pour chaque direction.

Important : les contrôles de sélection de STMB déterminent eux-mêmes l’exécution. Un script sélectionné par STMB peut s’exécuter même s’il est désactivé dans l’interface normale de l’extension Regex.

Utilisez Regex seulement si vous comprenez la transformation. Une mauvaise règle sortante peut corrompre les instructions de schéma requises ; une mauvaise règle entrante peut corrompre un JSON autrement valide.

---

## 24. Titres des entrées de lorebook et politique de caractères

### 24.1 Placeholders de titre

Les formats de titre de profil peuvent utiliser :

- `{{title}}` — titre généré par l’IA ;
- `{{scene}}` — plage source ;
- `{{char}}` — nom du personnage/groupe ;
- `{{user}}` — nom de l’utilisateur ;
- `{{messages}}` — nombre de messages de scène ;
- `{{profile}}` — nom du profil ;
- placeholders date et heure pris en charge.

### 24.2 Numérotation automatique

Les tokens de numérotation pris en charge comprennent notamment :

```text
[0] [00] (0) {0} #0
#[000] ([000]) {[000]}
```

STMB attribue des numéros séquentiels complétés par des zéros selon le format choisi.

### 24.3 Unicode imprimable

Tous les caractères Unicode imprimables sont autorisés dans les titres, notamment emoji, accents, CJK et symboles. Les caractères de contrôle Unicode U+0000–U+001F et U+007F–U+009F sont supprimés.

Les noms de fichiers de lorebook utilisés par Auto-Create sont nettoyés séparément pour les caractères réservés au système de fichiers et la longueur.

---

## 25. File de tâches et contrôles de nouvelle tentative

La file optionnelle nécessite Chat Top Bar / Chat Top Info Bar. Lorsque la file est disponible, régénérer une Memory, une consolidation ou un Side Prompt crée une tâche de régénération ; le remplacement reste en révision jusqu’à approbation.

Le panneau **Memory Books Jobs** peut afficher :

- queued ;
- active ;
- completed ;
- failed ;
- canceled ;
- blocked ;
- Needs Review.

Les tâches qui traitent une plage de discussion affichent les numéros de début et fin des messages dans leurs lignes de file. Le panneau peut aussi annuler le travail actif, rouvrir les tâches de révision, inspecter les échecs, réessayer du travail et supprimer les lignes d’historique terminales.

Portées de nouvelle tentative :

- **Retry :** relancer une tâche non-Memory, comme un Side Prompt ou une consolidation.
- **Retry All :** relancer/reprendre la Memory et les tâches Side Prompt après-Memory associées. Si la Memory a déjà été enregistrée, STMB peut reprendre à partir de ce résultat plutôt que de la dupliquer.
- **Retry Memory :** relancer/reprendre uniquement la Memory et ignorer volontairement les Side Prompts après-Memory.

Utilisez Retry All pour restaurer le flux combiné ; utilisez Retry Memory lorsque le travail des trackers ne doit pas s’exécuter.

Sans Chat Top Bar, STMB continue d’exécuter ses flux normaux mais n’a pas l’interface de file.

---

## 26. Retour visuel et accessibilité

STMB fournit des états visuels pour les contrôles de scène, notamment inactif, sélectionné, plage valide, dans la scène et en traitement. Les couleurs exactes dépendent du thème SillyTavern.

La prise en charge de l’accessibilité comprend :

- navigation clavier ;
- indicateurs de focus ;
- attributs ARIA ;
- comportement reduced-motion ;
- contrôles adaptés au mobile.

Lorsque vous enseignez à partir d’une capture d’écran, décrivez l’icône et le libellé visibles plutôt que de vous fier à une couleur précise.

---

## 27. Carte des paramètres et référence des paramètres actuels

Cette section est la carte des paramètres. Elle indique l’emplacement de chaque contrôle de configuration STMB visible par l’utilisateur et sa fonction. Elle liste également les contrôles importants enregistrés et ponctuels dans les interfaces spécialisées. Les champs de contenu ponctuels utilisés uniquement pour créer un Clip, Topical Clip, Compaction ou aperçu particulier sont documentés dans leurs sections de flux et ne sont pas répétés ici.

Chemin de départ courant :

**menu Extensions « baguette magique » près de la zone de saisie → Memory Books**

Tous les chemins ci-dessous commencent dans le panneau principal **Memory Books**, sauf mention explicite de **SillyTavern**. Un contrôle peut être masqué ou désactivé s’il ne s’applique pas à la discussion, au fournisseur, au profil ou au mode de stockage actuel.

Portées utilisées ci-dessous :

- **Global :** s’applique dans tout STMB sauf remplacement par un réglage plus étroit.
- **Per chat :** enregistré pour la discussion ou le groupe actuel.
- **Per character :** suit la carte de personnage entre discussions compatibles.
- **Per profile/template/setting :** enregistré dans l’objet réutilisable concerné.
- **Per run :** n’affecte que l’opération actuellement préparée.

### 27.1 Panneau principal : stockage, mode de discussion et profil actif

| Paramètre | Emplacement | Portée | Fonction |
|---|---|---|---|
| **Enable Manual Lorebook Mode** | **Current Lorebook Configuration** | Mode global ; choix de livre par discussion | Cesse d’utiliser le lorebook normal lié à la discussion comme cible STMB automatique et exige la sélection d’un Memory Book pour la discussion actuelle. Incompatible avec Auto-Create Lorebook Mode. |
| **Selected manual Memory Book** | **Current Lorebook Configuration → manual lorebook controls** ; visible en Manual Mode | Per chat | Choisit le Memory Book principal recevant les Memories de cette discussion. En Narrator Mode, il s’agit du livre omniscient. |
| **Group-character Memory Book assignments** | **Current Lorebook Configuration → group-character rows** ; visible dans un groupe réel utilisant Manual Mode | Per chat | Attribue un Memory Book séparé à chaque membre du groupe réel. STLO est requis pour configurer ces affectations et fournir le comportement de récupération filtré par personnage correspondant. |
| **Character Memory Book lock** | Icône de verrou près de l’affectation du Memory Book d’un personnage | Per character | Maintient cette carte de personnage affectée au même Memory Book entre discussions Manual Mode compatibles. Déverrouillez avant de modifier l’affectation. |
| **Narrator Mode** | **Current Lorebook Configuration** ; discussions normales non-groupes uniquement | Per chat | Utilise le livre manuel sélectionné comme Memory Book omniscient et active des personnages fictifs déclarés avec leurs propres livres uniques. Manual Mode et un livre omniscient sont requis. |
| **Manage Narrator Cast** | Sous **Narrator Mode** ; aussi disponible depuis le panneau Active Cast | Per chat | Ajoute, retire, restaure et attribue des Memory Books uniques aux personnages Narrator déclarés. |
| **Auto-create lorebook if none exists** | **Current Lorebook Configuration** | Global | En Automatic Mode, crée et lie un lorebook lorsque la discussion n’en possède aucun. Incompatible avec Manual Mode. |
| **Lorebook Name Template** | Directement sous **Auto-create lorebook if none exists** | Global | Nomme les livres auto-créés. Prend en charge `{{char}}`, `{{user}}` et `{{chat}}`. Utilisé uniquement quand Auto-Create Lorebook Mode est activé. |
| **Memory profile selection** | Sélecteur **Memory Profiles** | Per run | Choisit le profil de la prochaine Memory et pour les actions de profil adjacentes. Cette sélection seule ne modifie pas le défaut enregistré. |
| **Set as Default** | **Memory Profiles → Profile Actions** | Défaut global | Rend le profil sélectionné par défaut pour les Memories automatiques et autres flux sauf si une confirmation, une surcharge Side Prompt ou un choix spécifique au flux sélectionne un autre profil. |
| **Memory Title Format** | **Memory Profiles → Memory Title Format**, ou **Profile Actions → Edit Profile** | Per profile | Formate les titres des nouvelles entrées Memory et leur numérotation facultative avec les macros de titre listées. Le contrôle du panneau principal modifie le format du profil par défaut ; **Edit Profile** change directement le profil sélectionné. |

### 27.2 General Settings

Ouvrez **Settings → General Settings** dans le panneau principal.

| Paramètre | Portée | Fonction |
|---|---|---|
| **Always use default profile (no confirmation prompt)** | Global | Ignore la fenêtre normale de confirmation avant génération. Requis pour le catch-up non interactif ; des avertissements indépendants et aperçus activés peuvent toujours apparaître. |
| **Automatically accept detected participants in future** | Global | Cesse de demander une confirmation des participants de groupe réel et accepte l’ensemble détecté par STMB pour les Memories ultérieures. |
| **Show memory previews** | Global | Ouvre une révision modifiable avant enregistrement des Memories générées et des sorties Side Prompt applicables. |
| **Show consolidation previews** | Global | Ouvre les contrôles de révision des candidats de consolidation avant validation. |
| **Show notifications** | Global | Active les notifications toast STMB. |
| **Show floating Clip button when text is highlighted** | Global | Affiche le bouton flottant ciseaux après sélection de texte de discussion. |
| **Memory boundary indicator** | Global | Affiche aucun contrôle, le séparateur de frontière traitée, le bouton de saut déplaçable ou les deux. |
| **Allow scene overlap** | Global | Autorise une plage de scène sélectionnée à chevaucher des IDs de messages déjà représentés par une Memory existante. |
| **Refresh lorebook editor after adding memories** | Global | Actualise un éditeur de lorebook ouvert après écriture d’entrées STMB afin d’afficher immédiatement le nouveau contenu. |
| **Copy Memory Books when branching** | Global | Donne à une branche native des copies indépendantes de ses Memory Books actifs non verrouillés, liés à la discussion ou manuels. Les livres verrouillés par personnage restent partagés intentionnellement. |
| **Default for solo chats** | Global | Sélectionne le Side Prompt Set hérité par les discussions solo après une Memory. Une sélection vide utilise les Side Prompts après-Memory activés individuellement. |
| **Default for group chats** | Global | Sélectionne le Side Prompt Set hérité par les groupes réels après une Memory. Une sélection vide utilise les Side Prompts après-Memory activés individuellement. |
| **Max Response Tokens** | Global | Remplace la longueur de sortie maximale de génération STMB. Augmentez-la si un JSON autrement valide est tronqué ; `0` laisse le comportement normal fournisseur/SillyTavern comme fallback. |
| **Token Warning Threshold** | Global | Affiche un avertissement de confirmation lorsque l’estimation d’entrée dépasse le seuil. Ne change pas la limite de contexte du modèle. |
| **Default Previous Memories Count** | Global | Définit la valeur normale de 0 à 7 Memories antérieures fournies comme contexte de continuité pour une nouvelle Memory. Une exécution peut la remplacer dans **Advanced Memory Options**. |
| **Use regex (advanced)** | Global | Active la sélection de traitement regex propre à STMB. Ces sélections sont distinctes du fait que le script Regex SillyTavern sous-jacent soit généralement activé. |
| **Configure regex… → Outgoing scripts** | Global | Sélectionne les scripts exécutés par STMB sur le matériau avant envoi au fournisseur de génération. |
| **Configure regex… → Incoming scripts** | Global | Sélectionne les scripts exécutés sur le matériau renvoyé avant analyse et enregistrement. |

#### Token Saving dans General Settings

Ces contrôles se trouvent plus bas dans la même fenêtre **General Settings**, sous **Token Saving (Hide/Unhide Messages)**.

| Paramètre | Portée | Fonction |
|---|---|---|
| **Auto-hide messages after adding memory** | Global | Choisit aucun masquage automatique, tous les messages traités jusqu’à la dernière Memory, ou seulement la plage de la dernière Memory. Le masquage est réversible et ne supprime pas les messages. |
| **Messages to leave unhidden** | Global | Garde ce nombre de messages récents visibles lors du masquage automatique, préservant un chevauchement près de la frontière Memory. `0` masque jusqu’à la fin de scène applicable. |
| **Unhide hidden messages for memory generation** | Global | Exécute l’équivalent de `/unhide X-Y` pour la plage source avant sa compilation par STMB. Le mode auto-hide sélectionné détermine ce qui sera de nouveau masqué après un enregistrement réussi. |

### 27.3 Automatic Memories et rappels de consolidation

Ouvrez **Settings → Automatic Memories** dans le panneau principal.

| Paramètre | Portée | Fonction |
|---|---|---|
| **Auto-create memory summaries** | Global | Active la création automatique de Memory de type `/nextmemory`. Sans référence traitée, STMB actuel peut commencer au message 0 ; une première Memory manuelle reste recommandée pour valider la configuration et choisir une frontière de départ délibérée. |
| **Auto-Summary Interval** | Global | Définit le nombre de messages constituant la cadence automatique normale. |
| **Auto-Summary Buffer** | Global | Exclut ce nombre de messages les plus récents d’une plage autrement prête afin que la génération reste légèrement en retrait de la conversation live. |
| **Prompt for consolidation when a tier is ready** | Global | Affiche un prompt yes/later lorsqu’un niveau surveillé atteint son minimum de sources admissibles. Ne consolide jamais silencieusement. |
| **Auto-Consolidation Tiers** | Global | Choisit les niveaux cibles surveillés pour les prompts de disponibilité. Le minimum de chaque niveau est enregistré dans **Consolidate Memories**. |

### 27.4 Éditeur de profil

Choisissez un profil sous **Memory Profiles**, puis ouvrez **Profile Actions → Edit Profile**. Ces paramètres sont **per profile**, sauf mention contraire. Le profil intégré **Current SillyTavern Settings** verrouille intentionnellement les champs contrôlés par SillyTavern.

| Paramètre | Fonction |
|---|---|
| **Profile Name** | Nomme le profil STMB réutilisable. Le nom du profil intégré est verrouillé. |
| **API/Provider** | Choisit routage SillyTavern actuel, fournisseur pris en charge, connexion Custom OpenAI-compatible ou Full Manual Configuration. |
| **Use this connection profile** | Pour **Custom OpenAI-Compatible API**, utilise soit la connexion Custom SillyTavern active, soit une connexion Custom nommée. Son URL et secret enregistrés sont utilisés tandis que **Model** dans STMB reste la surcharge de modèle. |
| **Skip structured output and use plain-text completion** | Cesse d’envoyer un schéma structured-output lorsqu’un fournisseur le refuse. Le prompt sélectionné doit toujours obliger le modèle à renvoyer le JSON valide requis par STMB. |
| **Use ST's ChatCompletionService** | Route les requêtes prises en charge via l’assistant Chat Completion intégré de SillyTavern. Indisponible aux profils Full Manual. |
| **Chat Completion Preset** | Applique facultativement un preset SillyTavern Chat Completion via ChatCompletionService. |
| **Model** | Fournit l’ID exact du modèle pour ce profil. **Current SillyTavern Settings** lit plutôt le modèle actif dans SillyTavern. |
| **Temperature** | Définit l’aléatoire de génération de ce profil. **Current SillyTavern Settings** lit plutôt la température active de SillyTavern. |
| **Use reverse proxy** | Transmet les détails reverse proxy configurés dans SillyTavern pour les fournisseurs pris en charge ; en Full Manual Configuration, le champ secret est libellé comme mot de passe proxy. |
| **API Endpoint URL / API Key** | Fournit un endpoint direct et un identifiant séparés uniquement pour **Full Manual Configuration**. Pour l’usage normal, préférez une connexion configurée et testée dans SillyTavern. |
| **Memory Creation Method** | Sélectionne le preset Summary Prompt utilisé pour la génération Memory ordinaire. Le contenu du prompt est géré sous **Settings → Summary Prompt Manager**. |
| **Use separate group and character prompts in group chats** | Utilise des presets distincts pour le Memory Book de groupe et les Memory Books centrés personnage. |
| **Group Summary Prompt / Character Summary Prompt** | Sélectionne les deux presets utilisés lorsque les prompts séparés groupe/personnage sont activés. |
| **Memory Title Format** | Contrôle le texte du titre, les macros et la numérotation automatique des Memories produites par ce profil. |
| **Activation Mode** | Enregistre les nouvelles entrées en activation **Normal**, **Constant** ou **Vectorized**. |
| **Insertion Position** | Choisit où l’entrée générée est insérée par rapport à Character, Example Messages, Author's Note ou un Outlet nommé. |
| **Outlet Name** | Nomme l’Outlet cible et n’apparaît que lorsque **Insertion Position** vaut **Outlet**. |
| **Insertion Order** | **Auto** dérive l’ordre du numéro de Memory ; **Manual** utilise une valeur fixe ; **Reverse** décompte depuis une valeur de départ et est destiné uniquement aux Outlets. |
| **Prevent Recursion** | Empêche le contenu de l’entrée générée de déclencher d’autres entrées de lorebook durant le scan récursif. |
| **Delay Until Recursion** | Empêche l’entrée générée de s’activer lors du premier passage de scan. Laissez désactivé si rien d’autre ne peut commencer la récursion. |
| **Also include** | Compatibilité des anciens profils uniquement. Les anciens profils peuvent afficher ici des références de lorebook ordonnées ; la configuration actuelle utilise les **Context Settings** par discussion. |

Le fournisseur, modèle, température, preset de connexion et reverse proxy SillyTavern actifs sont configurés dans les propres contrôles de connexion de SillyTavern, pas dans STMB. Le profil **Current SillyTavern Settings** lit ces valeurs en direct.

### 27.5 Context Settings

Ouvrez **Settings → Context Settings** dans le panneau principal.

| Paramètre | Portée | Fonction |
|---|---|---|
| **Additional Context for this chat** | Per chat | Sélectionne un Context Setting nommé, enregistre explicitement **No Context**, ou laisse le choix non défini afin que STMB puisse demander une décision lorsque le contexte migré l’exige. |
| **Context Setting Name** | Per Context Setting | Nomme une collection Additional Context réutilisable. |
| **Additional Context entries and order** | Per Context Setting | Sélectionne les entrées de lorebook à envoyer comme référence stable et détermine leur ordre. Les entrées manquantes sont signalées puis ignorées. |

**New**, **Duplicate**, **Delete**, **Import JSON** et **Export JSON** gèrent les Context Settings ; ils ne modifient pas le comportement de génération tant qu’un réglage n’est pas sélectionné par une discussion ou un Side Prompt.

### 27.6 Trackers & Side Prompts

Ouvrez **Settings → Trackers & Side Prompts** dans le panneau principal.

| Paramètre | Emplacement et portée | Fonction |
|---|---|---|
| **After-memory side prompt mode for this chat** | Écran principal du gestionnaire ; per chat | Utilise le défaut solo/groupe correspondant, les prompts après-Memory activés individuellement, ou un Side Prompt Set nommé pour cette discussion. |
| **How many concurrent prompts to run at once** | Écran principal ; global | Limite à 1–10 le nombre de tâches Side Prompt simultanées. |
| **Side Prompt Set Name** | **New Set** ou modification d’un set ; per set | Nomme un groupe ordonné et réutilisable d’exécutions Side Prompt. |
| **Side Prompt / Row Label / Macro Values** | Ligne du Side Prompt Set ; per set | Choisit le template de la ligne, fournit un libellé/titre facultatif, des valeurs runtime littérales ou au niveau du set et utilise l’ordre des lignes comme ordre d’exécution. |
| **Enabled** | **New** ou modification d’un Side Prompt ordinaire ; per template | Rend le template admissible lorsque la discussion utilise les prompts après-Memory activés individuellement. Les réglages de trigger déterminent toujours quand il s’exécute. |
| **Run on visible message interval / Interval** | Éditeur Side Prompt ; per template | Exécute après le nombre configuré de messages visibles. Les triggers automatiques sont indisponibles lorsque le template nécessite des macros runtime non résolues. |
| **Run automatically after memory** | Éditeur Side Prompt ; per template | Exécute le template après une Memory réussie, sous réserve du mode Side Prompt de la discussion ou du set sélectionné. |
| **Allow manual run via `/sideprompt`** | Éditeur Side Prompt ; per template | Autorise l’exécution manuelle explicite. |
| **Prompt / Response Format** | Éditeur Side Prompt ; per template | Définit l’instruction et la structure de sortie facultative. Les deux champs peuvent utiliser les macros Side Prompt prises en charge. |
| **Previous memories for context** | Éditeur Side Prompt ; per template | Inclut 0–7 entrées Memory précédentes avant les messages sources sélectionnés. |
| **Use additional context / Additional Context Source** | Éditeur Side Prompt ; per template | Inclut Additional Context et suit soit le Context Setting de la discussion actuelle, soit un réglage nommé fixe. |
| **Lorebook Target** | Éditeur Side Prompt ; per template ou per chat | Enregistre la sortie dans le Memory Book normal ou un autre lorebook choisi. Lors du changement, STMB demande si le choix s’applique seulement à cette discussion ou au template à l’avenir. |
| **Lorebook Entry Title Override / Keywords** | Éditeur Side Prompt ; per template | Contrôle éventuellement le modèle de titre de l’entrée upsert et les mots-clés d’activation séparés par virgules. |
| **Activation Mode / Insertion Position / Outlet Name** | Éditeur Side Prompt ; per template | Contrôle activation et placement de l’entrée de lorebook Side Prompt. |
| **Insertion Order / Order Value** | Éditeur Side Prompt ; per template | Utilise un ordre automatique basé sur le numéro de Memory ou une valeur manuelle fixe. |
| **Prevent Recursion / Delay Until Recursion / Ignore Budget** | Éditeur Side Prompt ; per template | Applique les drapeaux correspondants de récursion et budget d’entrée SillyTavern. |
| **Override default memory profile / Connection Profile** | Éditeur Side Prompt ; per template | Route ce Side Prompt via un profil STMB sélectionné au lieu du profil par défaut actuel. |
| **Memory Assistance Mode** | Modifier **Memory Assistance** ; global | **Off** le désactive ; **Update** propose des changements aux Clips existants ; **Update and Suggest** découvre aussi des sujets Topical Clip ; **Automatic** applique directement les ajouts aux Clips ordinaires tout en gardant les remplacements de Topical Clip pour approbation. |
| **Update Prompt / Topic Suggestions Prompt** | Modifier **Memory Assistance** ; per built-in template | Contrôle ses deux tâches IA. Leurs contrats de réponse restent fixes. |
| **Use a connection profile override** | Modifier **Memory Assistance** ; per built-in template | Utilise le profil STMB sélectionné pour Memory Assistance au lieu du défaut. |

### 27.7 Prompt managers

| Paramètre | Emplacement | Portée | Fonction |
|---|---|---|---|
| **Summary Prompt name and prompt text** | **Settings → Summary Prompt Manager → New Preset** ou modifier | Per preset | Définit un prompt réutilisable de Memory ordinaire. Un profil l’utilise uniquement lorsque son **Memory Creation Method** ou sa sélection group/character pointe vers ce preset. |
| **Default consolidation prompt** | **Settings → Consolidation Prompt Manager → Set Default** | Global | Sélectionne le prompt normal présélectionné par **Consolidate Memories**. Les presets regeneration-only et group-only ne peuvent pas être sélectionnés. |
| **Consolidation Prompt name and prompt text** | **Settings → Consolidation Prompt Manager → New Consolidation Preset** ou modifier | Per preset | Définit des instructions de consolidation réutilisables. Les presets dédiés à la régénération et au groupe sont restreints à ces flux. |

### 27.8 Valeurs par défaut Topical Clip et Compaction

Ouvrez **Settings → Topical Clip** ou **Settings → Compaction** dans le panneau principal.

| Paramètre | Emplacement | Portée | Fonction |
|---|---|---|---|
| **Generation Profile / Compaction Profile** | **Topical Clip → Generation Profile**, ou **Compaction → Compaction Profile** | Défaut global partagé | Sélectionne le profil STMB utilisé pour la génération Topical Clip et Compaction. Le modifier dans une interface change la sélection partagée des deux flux. |
| **Topical Clip Prompt** | **Topical Clip → Edit Topical Clip Prompt** | Global | Enregistre un template de prompt personnalisé pour Topical Clip. **Reset to Default** revient au prompt intégré actuel. Les macros source requises sont validées avant enregistrement ou génération. |
| **Compaction Prompt** | **Compaction → Edit Compaction Prompt** | Global | Enregistre un template de prompt personnalisé pour raccourcir les entrées Memory, Clip et Side Prompt existantes. **Reset to Default** revient au prompt intégré actuel. `{{ENTRY_CONTENT}}` est requis. |

Le Memory Book, sujet, mots-clés, inclusion de sources, sélection de sources, plage de messages, brouillon et entrée choisie pour Compaction sont des choix de flux per-run, pas des paramètres persistants.

### 27.9 Contrôles Consolidate Memories

Ouvrez **Consolidate Memories** depuis les boutons au bas du panneau principal. Cette interface mélange des défauts enregistrés et des choix ponctuels.

| Paramètre | Portée | Fonction |
|---|---|---|
| **Target tier** | Per run | Choisit le niveau supérieur à créer et donc le niveau source immédiatement inférieur admissible. |
| **Consolidation Prompt** | Per run | Sélectionne le prompt de cette consolidation ; initialement le défaut du Consolidation Prompt Manager. |
| **Maximum entries per pass** | Per run | Limite le nombre d’entrées de niveau inférieur envoyées dans un passage d’analyse. |
| **Token Budget** | Per run | Définit le budget d’entrée approximatif utilisé pour grouper cette consolidation. |
| **Number of automatic summary attempts** | Per run | Limite les passages d’analyse répétés pour obtenir des affectations et résumés utilisables. |
| **Saved minimum eligible entries** | Global, enregistré séparément par niveau cible | Définit quand le niveau choisi est considéré prêt. Contrôle aussi le prompt automatique de disponibilité de ce niveau. |
| **Activation Mode / Insertion Position / Outlet / Insertion Order / Recursion Settings** | Défauts globaux des entrées consolidées | Contrôle comment les nouvelles entrées consolidées sont enregistrées. Distinct des réglages d’entrée des profils Memory ordinaires. |
| **Disable selected source entries after creating summaries** | Per run | Désactive les sources consolidées avec succès après validation afin que les résumés de niveau supérieur les remplacent en récupération. Ne les supprime pas. |
| **Selected source entries** | Per run | Choisit les entrées de niveau inférieur admissibles à traiter. Les entrées décochées restent intactes. |

### 27.10 Réglages World Info SillyTavern associés

Ces contrôles sont hors de STMB, dans les réglages World Info/lorebook de SillyTavern, mais influencent la récupération des Memories enregistrées pendant la discussion normale.

| Paramètre | Fonction |
|---|---|
| **Match Whole Words** | Contrôle la correspondance aux frontières des mots-clés. Off est un point de départ courant pour des mots-clés Memory flexibles. |
| **Scan Depth** | Contrôle la quantité de texte récent scannée pour l’activation du lorebook. Une valeur relativement élevée comme 8 est un point de départ courant. |
| **Max Recursion Steps** | Limite l’activation World Info récursive. Environ 2 est un point de départ courant. |
| **Context percentage / lorebook budget** | Limite la proportion de contexte occupée par les entrées de lorebook. Augmentez-la uniquement en équilibre avec le contexte total du modèle et les autres éléments de prompt. |

Ce sont des recommandations, pas des exigences ; voir la Section 10 pour le diagnostic de récupération.

---

## 28. Référence des commandes slash

### Commandes Memory

```text
/creatememory
```

Crée une Memory à partir de la scène actuellement marquée.

```text
/scenememory X-Y
```

Définit la plage inclusive et crée une Memory, par exemple `/scenememory 10-15`.

```text
/nextmemory
```

Crée une Memory depuis le message suivant la frontière traitée la plus élevée jusqu’à la fin actuellement admissible.

```text
/stmb-catchup interval=x start=y end=z
```

Traite une longue discussion existante en morceaux consécutifs.

### Commandes Side Prompt

```text
/sideprompt "Name" {{macro}}="value" [X-Y]
/sideprompt-set "Set Name" [X-Y]
/sideprompt-macroset "Set Name" {{macro}}="value" [X-Y]
/sideprompt-on "Name" | all
/sideprompt-off "Name" | all
```

### Commandes de frontière traitée

```text
/stmb-highest
/stmb-set-highest <N|none>
```

### Arrêt d’urgence

```text
/stmb-stop
```

Arrête toutes les générations STMB en cours partout, y compris les Side Prompts. Le travail déjà validé reste enregistré.

---

## 29. Dépannage par étape

### 29.1 Extension/UI non chargée

Symptômes :

- Memory Books absent du menu baguette magique ;
- chevrons absents ;
- aucun bouton Clip flottant après sélection.

Vérifications :

1. extension installée et activée ;
2. page rechargée ;
3. discussion personnage/groupe ouverte ;
4. attendre jusqu’à dix secondes ;
5. développer les actions de message ;
6. inspecter la console uniquement après ces vérifications.

### 29.2 Aucune scène sélectionnée

**►** et **◄** sont tous deux requis pour une scène marquée. Vérifiez Current Scene dans le panneau.

Si la plage chevauche une Memory existante, choisissez une autre plage ou activez Allow Scene Overlap.

### 29.3 Aucun Memory Book valide

Automatic Mode :

- liez un lorebook à la discussion ; ou
- activez Auto-Create.

Manual Mode :

- sélectionnez un livre manuel principal ;
- réparez une sélection supprimée ;
- déverrouillez un verrou de personnage cassé avant de le modifier.

Véritable groupe multi-livres :

- STLO doit être disponible ;
- chaque membre requis a besoin d’une affectation valide ;
- le livre de groupe ne peut pas être réutilisé comme livre de personnage.

Narrator Mode :

- Manual Mode doit être activé ;
- un livre omniscient doit être sélectionné ;
- chaque membre déclaré a besoin d’un livre unique non omniscient.

### 29.4 L’IA n’a pas produit une Memory valide

Vérifiez dans cet ordre :

1. fournisseur/modèle/profil valides ;
2. réponse non tronquée ;
3. maximum response tokens suffisant ;
4. le prompt sélectionné exige toujours le JSON exact ;
5. le schéma n’a pas été corrompu par Regex ;
6. le fournisseur prend en charge le mode structured-output sélectionné ;
7. essayez Skip Structured Output uniquement si le fournisseur refuse les schémas ;
8. essayez un modèle suivant mieux les instructions avant de réécrire le prompt ;
9. cliquez sur **Raw response from AI** dans la notification d’erreur persistante pour examiner la réponse capturée du fournisseur et utilisez l’interface de correction JSON manuelle lorsqu’elle est disponible.

Causes fréquentes : code fences, commentaires, clé manquante, keywords qui n’est pas un tableau, texte de refus ou sortie tronquée.

### 29.5 Memory enregistrée mais messages disparus

Ils ont probablement été auto-masqués. Modifiez les réglages Token Saving. Les messages masqués ne sont pas supprimés.

### 29.6 Les Memories automatiques ne se sont pas exécutées

Vérifiez :

- Auto-create memory summaries activé ;
- assez de messages au-delà de la frontière traitée ;
- condition interval plus buffer remplie ;
- aucun checkpoint de report encore actif ;
- Memory Book valide disponible ;
- aucune autre tâche Memory ne bloque actuellement le trigger ;
- la discussion actuelle n’a pas été changée pendant le travail ;
- la génération de groupe s’est terminée avant le moment attendu du trigger.

Une première Memory manuelle est recommandée mais n’est pas techniquement obligatoire dans la version actuelle.

### 29.7 La Memory existe mais ne s’active pas

Vérifiez :

- bon livre actif ;
- entrée activée ;
- mots-clés pertinents ;
- mode d’activation ;
- budget ;
- récursion et Delay Until Recursion ;
- routage STLO si utilisé ;
- inspection/logs World Info.

Ne régénérez pas la Memory avant d’avoir testé la récupération.

### 29.8 L’entrée a été envoyée mais ignorée

C’est un comportement d’utilisation du modèle. Réponses possibles :

- rendre la Memory plus courte et explicite ;
- améliorer position/priorité d’insertion ;
- réduire le contexte concurrent ;
- utiliser un rappel OOC ;
- choisir un modèle qui suit mieux le contexte fourni.

### 29.9 Side Prompt non exécuté

Voir Section 16.18. En particulier, un set sélectionné supprime les prompts activés individuellement hors de ce set.

### 29.10 Consolidation n’a pas proposé de prompt

Vérifiez :

- prompt de disponibilité activé ;
- niveau cible sélectionné pour surveillance ;
- assez d’entrées sources admissibles ;
- sources pas déjà désactivées/inadmissibles ;
- minimum enregistré de ce niveau atteint.

### 29.11 Bouton Regeneration désactivé

Survolez ou inspectez la raison indiquée. Causes fréquentes :

- l’entrée est antérieure aux métadonnées d’instantané requises ;
- discussion/plage source indisponible ;
- entrées sources manquantes ou mauvais niveau ;
- consolidation parent active bloquant une source inférieure ;
- numéro de séquence original impossible à déterminer ;
- template Side Prompt supprimé.

### 29.12 La branche n’a pas copié les livres

Vérifiez :

- Copy Memory Books when branching était activé avant la création de la branche ;
- c’était une branche native SillyTavern ;
- les livres sources existaient et pouvaient être chargés ;
- la discussion n’a pas été changée pendant la copie ;
- la branche n’était pas déjà marquée completed/failed ;
- les livres verrouillés ont volontairement été conservés au lieu d’être copiés.

### 29.13 Distribution Narrator incorrecte

Vérifiez :

- sélection Active Cast avant génération ;
- si le message était une continuation ayant fusionné les métadonnées de distribution ;
- si un swipe a restauré un ancien état de distribution ;
- si la scène contient des messages legacy non marqués nécessitant confirmation ;
- si le personnage déclaré a été retiré ;
- si chaque livre de personnage existe toujours.

---

## 30. FAQ

### Ai-je besoin de vectors ?

Non. L’activation par mots-clés suffit et est générée automatiquement. Les vectors sont facultatifs.

### Les Memories doivent-elles utiliser un lorebook séparé ?

Généralement oui pour l’organisation, le budget, la réutilisation et le diagnostic, mais ce n’est pas obligatoire.

### STMB supprime-t-il les messages ?

Non. Il peut masquer les messages traités du contexte actif.

### Puis-je utiliser STMB entièrement manuellement ?

Oui. Marquez des scènes et créez des Memories uniquement lorsque vous le souhaitez.

### Les Memories automatiques peuvent-elles créer la première Memory ?

Oui dans STMB actuel. Sans référence traitée, il commence au message 0 une fois interval plus buffer atteint. Une première exécution manuelle reste recommandée pour vérifier la configuration et choisir la frontière de départ souhaitée.

### La Consolidation s’exécute-t-elle automatiquement ?

Non. STMB peut avertir lorsqu’un niveau est prêt, mais l’utilisateur confirme et examine l’opération.

### Un véritable groupe peut-il utiliser un seul Memory Book ?

Oui. C’est la configuration de départ recommandée et elle ne nécessite pas STLO.

### Quand les livres séparés de personnages de groupe réel sont-ils utiles ?

Lorsque la continuité individuelle, les connaissances, la récupération propre à un locuteur ou les résumés centrés personnage justifient la configuration et les requêtes IA supplémentaires.

### Narrator Mode est-il identique à Group Chat Mode ?

Non. Group Chat Mode lit des auteurs provenant de cartes de personnages SillyTavern distinctes. Narrator Mode déclare manuellement plusieurs personnages fictifs écrits par une seule carte Narrator.

### Narrator Mode nécessite-t-il STLO ?

Pas pour son chemin de récupération Active Cast. Il exige Manual Lorebook Mode, un livre omniscient et des livres uniques par personnage.

### Les copies liées sont-elles synchronisées ?

Non. Elles sont liées pour les métadonnées d’origine/consolidation, pas pour un miroir continu.

### Pourquoi Delay Until Recursion devrait-il généralement être désactivé ?

Si aucune autre entrée de lorebook ne démarre la récursion, une entrée Memory retardée peut ne jamais s’activer.

### Que faire après la première Memory réussie ?

Vérifiez la récupération de l’entrée, puis activez les Memories automatiques, choisissez interval/buffer, activez le masquage pour économiser des tokens et ajoutez des Clips ou un Side Prompt ciblé uniquement si nécessaire. Utilisez Topical Clip et Consolidation après accumulation d’un nombre suffisant de Memories.

---

## 31. Compatibilité, migration et notes historiques actuelles

Cette section conserve uniquement l’historique qui affecte l’utilisation actuelle.

### Baseline actuelle

- Version documentée actuelle : v8.5.0, 1er août 2026.
- Prérequis SillyTavern : 1.14.0 ou version ultérieure.
- Narrator Mode a été ajouté dans la v8.5.0.
- La copie des livres lors des branches, la Regeneration de Side Prompt et les verrous de Memory Book de personnage ont été ajoutés en v8.4.0.
- La distribution de Memories multi-personnages pour groupes réels est arrivée en v8.0.0.
- Additional Context a migré des profils vers des Context Settings réutilisables par discussion en v7.0.0 ; les anciens contextes de profil sont migrés.
- Topical Clip a été ajouté en v6.10.0.
- Compaction et Clips ont été ajoutés en v6.6.0.
- Side Prompt Sets et les cibles par prompt ont été ajoutés pendant la période v6.4–v6.5.
- Consolidation est devenue un système multi-niveaux Arc jusqu’à Epic en v6.0.0 ; les anciennes métadonnées Arc sont migrées.
- L’intégration Job Queue a été ajoutée en v6.8.0 et reste facultative.
- Les défauts de profil actuels utilisent Delay Until Recursion désactivé, sauf modification explicite par l’utilisateur/profil.

### Memories existantes provenant d’anciennes versions

Seules les entrées avec le drapeau `stmemorybooks` et les métadonnées requises sont reconnues comme STMB Memories. Utilisez le convertisseur de lorebook fourni pour les entrées anciennes antérieures aux métadonnées actuelles.

### Fonctionnalité supprimée

L’ancienne fonctionnalité bookmark a été retirée de Memory Books en v4.0.0 et séparée de l’extension principale. N’enseignez pas les contrôles bookmark de Memory Books comme comportement actuel.

### Built-ins localisés

Les prompts intégrés peuvent être régénérés selon la langue SillyTavern active. Sauvegardez les built-ins personnalisés avant recréation.

### Comportement d’import

L’import Side Prompt est additif. Les prompts existants sont conservés ; les conflits de clés importées sont renommés plutôt que d’écraser le prompt existant.

---

## 32. Notes développeur et licence

Memory Books utilise Bun pour le bundling/minification.

```sh
bun run build
```

Installez le hook de build pre-commit du dépôt avec :

```sh
bun run install-hooks
```

Le hook construit avant commit, stage les artefacts de build et annule si le build échoue.

Memory Books est Copyright © 2024–2026 Aiko Hanasaki et distribué sous GNU Affero General Public License v3.0. Les versions modifiées doivent conserver les mentions applicables, identifier les modifications et respecter les exigences AGPL de disponibilité du code source.

---

## 33. Arbre de diagnostic compact

```text
L’utilisateur dit : « Memory Books ne fonctionne pas. »
│
├─ Le menu/contrôle est-il visible ?
│  ├─ Non → vérifications installation/chargement/UI.
│  └─ Oui
│
├─ Une scène peut-elle être sélectionnée ?
│  ├─ Non → développer les actions ; définir les deux chevrons ; vérifier chevauchement.
│  └─ Oui
│
├─ Existe-t-il un Memory Book effectif valide ?
│  ├─ Non → lier, auto-créer, sélectionner manuel, ou réparer les liaisons multi-livres.
│  └─ Oui
│
├─ La génération renvoie-t-elle une sortie valide et complète ?
│  ├─ Non → profil, fournisseur, output tokens, schéma JSON, Regex, modèle.
│  └─ Oui
│
├─ L’entrée existe-t-elle dans le livre prévu ?
│  ├─ Non → échec enregistrement/rollback/permission/tâche.
│  └─ Oui
│
├─ SillyTavern l’active-t-il et l’envoie-t-il plus tard ?
│  ├─ Non → mots-clés, activation, liaison du livre, budget, récursion, STLO.
│  └─ Oui
│
└─ Le modèle utilise-t-il l’entrée fournie ?
   ├─ Non → respect du contexte, placement, contexte concurrent, clarté de l’entrée.
   └─ Oui → le flux fonctionne.
```

---

## 34. Séquence d’enseignement minimale recommandée

Pour un nouvel utilisateur, enseignez d’abord uniquement cette séquence :

1. Ouvrir le menu baguette magique et trouver Memory Books.
2. Utiliser Automatic Mode avec un livre lié ou activer Auto-Create.
3. Sélectionner Current SillyTavern Settings.
4. Développer les actions des messages et marquer une courte scène complète avec **►** et **◄**.
5. Créer et prévisualiser une Memory.
6. Ouvrir le Memory Book et vérifier l’entrée enregistrée.
7. Vérifier que l’entrée peut s’activer ultérieurement.
8. Activer les Memories automatiques et choisir interval/buffer.
9. Activer auto-hide seulement après avoir expliqué que les messages masqués ne sont pas supprimés.
10. Présenter Clips, puis Side Prompts, puis Topical Clip/Consolidation seulement lorsqu’un besoin concret existe.

Ne commencez pas par les prompts personnalisés, endpoints Full Manual, plusieurs livres de personnages, Regex ou Consolidation sauf si le problème réel de l’utilisateur l’exige.

---

## 35. Résumé final des concepts

Memory Books est un pipeline externe de continuité basé sur les lorebooks SillyTavern :

```text
Sélectionner ou planifier du contenu de discussion
→ générer une représentation structurée
→ l’enregistrer avec des métadonnées de récupération
→ éventuellement masquer la transcription traitée
→ laisser SillyTavern récupérer plus tard les entrées pertinentes
```

Le système fonctionne le mieux lorsque :

- les scènes sont cohérentes ;
- les prompts distinguent clairement cible et contexte de référence ;
- les flux JSON renvoient les schémas exacts ;
- les mots-clés sont concrets ;
- les Memory Books sont affectés et activés volontairement ;
- les trackers longs élaguent l’état obsolète ;
- Consolidation réduit les anciens détails sans effacer la continuité ;
- les utilisateurs vérifient la récupération au lieu de supposer qu’enregistré signifie envoyé ;
- le routage avancé multi-livres n’est utilisé que lorsque sa précision justifie sa complexité.
