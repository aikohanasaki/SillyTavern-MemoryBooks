# 📕 ST Memory Books - Votre assistant mémoire IA pour le chat

**Transformez vos longues conversations en souvenirs organisés et faciles à retrouver !**

Vous voulez que le bot se souvienne de ce qui s'est passé, mais votre chat est devenu trop long pour tenir dans le contexte ? Vous voulez suivre les éléments importants de l'histoire sans prendre des notes à la main ? ST Memory Books fait exactement cela : il surveille vos discussions et crée des résumés intelligents pour que vous ne perdiez plus le fil de votre récit.

(Vous cherchez plutôt les détails techniques et le déroulement interne ? Consultez [Comment STMB fonctionne](howSTMBworks-fr.md).)

## 📑 Table des matières

- [Démarrage rapide](#-démarrage-rapide-5-minutes-pour-votre-première-mémoire)
- [Ce que fait réellement ST Memory Books](#-ce-que-fait-réellement-st-memory-books)
- [Choisir votre style](#-choisir-votre-style)
- [Épingler dans le Memory Book](#️-épingler-dans-le-memory-book)
- [Clips vs Side Prompts](#️-clips-vs-side-prompts)
- [Économie de tokens : masquer / afficher](#-économie-de-tokens--masquer--afficher)
- [Compaction vs Consolidation](#-compaction-vs-consolidation)
- [Consolidation des résumés](#-consolidation-des-résumés)
- [Trackers, Side Prompts et modèles](#-trackers-side-prompts-et-modèles-fonction-avancée)
- [Compaction](#-compaction)
- [Les réglages à apprendre en premier](#️-les-réglages-à-apprendre-en-premier)
- [Dépannage](#-dépannage-quand-les-choses-ne-fonctionnent-pas)
- [Ce que ST Memory Books ne fait pas](#-ce-que-st-memory-books-ne-fait-pas)
- [Aide et informations](#-aide-et-informations)
- [Boostez le tout avec STLO](#-boostez-le-tout-avec-stlo)

---

## 🚀 Démarrage rapide (5 minutes pour votre première mémoire)

**Vous découvrez ST Memory Books ?** Voici la façon la plus simple de mettre en place votre première mémoire automatique.

### Étape 1 : trouver l'extension

- Repérez l'icône de baguette magique (🪄) à côté de la zone de saisie du chat
- Cliquez dessus, puis ouvrez **Memory Books**
- Vous verrez le panneau principal de ST Memory Books

### Étape 2 : activer l'auto-magie

- Dans le panneau, activez **Créer des résumés de mémoire automatiques**
- Réglez **Intervalle d'Auto-Résumé** sur **20-30 messages** pour commencer
- Laissez **Tampon d'Auto-Résumé** assez bas au début (`0-2` est une bonne plage de départ)
- Créez d'abord **une mémoire manuelle** pour amorcer le chat
- Et voilà ! 🎉

### Étape 3 : discuter normalement

- Continuez votre discussion comme d'habitude
- Après 20 à 30 nouveaux messages, STMB va automatiquement :
  - prendre les nouveaux messages depuis le dernier point traité
  - demander à l'IA de rédiger un résumé
  - l'enregistrer dans votre collection de mémoires
  - afficher une notification une fois terminé

**Félicitations !** Vous avez maintenant une gestion de mémoire automatique. Plus besoin de vous demander ce qui s'est passé plusieurs chapitres plus tôt.

---

## 💡 Ce que fait réellement ST Memory Books

Pensez à ST Memory Books comme à votre **bibliothécaire IA personnel** pour les discussions.

### 🤖 **Résumés automatiques**
*"Je ne veux pas y penser, je veux juste que ça marche."*

- Surveille le chat en arrière-plan
- Crée automatiquement des mémoires à intervalles réguliers
- Idéal pour les longs roleplays, l'écriture créative et les histoires continues

### ✋ **Création manuelle de mémoire**
*"Je veux décider précisément ce qui mérite d'être gardé."*

- Marquez une scène avec les petites flèches (► ◄)
- Créez une mémoire à la demande pour un moment important
- Très pratique pour les tournants de scénario, scènes clés et évolutions de personnages

### 📊 **Side Prompts et trackers intelligents**
*"Je veux suivre les relations, les arcs, les stats ou l'état du monde."*

- Fragments de prompts réutilisables qui complètent la mémoire
- Bibliothèque de modèles prêts à l'emploi
- Possibilité de suivre tout ce que vous voulez avec des prompts personnalisés
- Mise à jour automatique d'éléments comme les relations, objectifs, scoreboards ou résumés d'état

### 📚 **Collections de mémoires**
*L'endroit où tout est stocké*

- Les mémoires sont organisées et consultables
- Elles s'intègrent au système de lorebook de SillyTavern
- Votre IA peut ensuite s'appuyer sur ces souvenirs dans les conversations futures

---

## 🎯 Choisir votre style

<details>
<summary><strong>🔄 « Régler et oublier » (idéal pour commencer)</strong></summary>

**Parfait si vous voulez :** une automatisation discrète qui tourne toute seule.

**Comment ça marche :**
1. Activez `Créer des résumés de mémoire automatiques`
2. Réglez `Intervalle d'Auto-Résumé` selon le rythme de votre chat
3. Ajoutez éventuellement un petit `Tampon d'Auto-Résumé`
4. Continuez à discuter normalement après avoir créé la première mémoire manuelle

**Ce que vous y gagnez :**
- Aucun travail manuel au quotidien
- Une création régulière de mémoires
- Moins de risques d'oublier des éléments importants
- Un fonctionnement valable pour les chats solo comme pour les groupes

**Conseil pratique :** commencez vers 30 messages puis ajustez. Un chat lent et détaillé peut préférer 20, un chat rapide peut monter à 50 ou plus.

</details>

<details>
<summary><strong>✋ « Contrôle manuel » (pour choisir précisément)</strong></summary>

**Parfait si vous voulez :** décider exactement de ce qui devient une mémoire.

**Comment ça marche :**
1. Repérez les flèches (► ◄) sur les messages
2. Cliquez sur ► au début de la scène importante
3. Cliquez sur ◄ à la fin de cette scène
4. Ouvrez Memory Books puis cliquez sur `Créer une mémoire`

**Ce que vous y gagnez :**
- Un contrôle total sur le contenu sauvegardé
- Une bonne méthode pour les scènes complexes
- Une sélection plus fine des moments qui comptent vraiment

**Conseil pratique :** les flèches apparaissent quelques secondes après le chargement du chat. Si vous ne les voyez pas, attendez un peu ou rechargez la page.

</details>

<details>
<summary><strong>⚡ « Power User » (slash commands)</strong></summary>

**Parfait si vous voulez :** des raccourcis clavier et des workflows plus avancés.

**Commandes essentielles :**
- `/scenememory 10-25` - créer une mémoire des messages 10 à 25
- `/creatememory` - créer une mémoire à partir de la scène déjà marquée
- `/nextmemory` - résumer tout ce qui s'est passé depuis la dernière mémoire
- `/sideprompt "Relationship Tracker" {{macro}}="value" [X-Y]` - lancer un Side Prompt, avec macros runtime et plage optionnelle
- `/sideprompt-on "Name"` ou `/sideprompt-off "Name"` - activer ou désactiver un Side Prompt
- `/stmb-set-highest <N|none>` - ajuster la base de référence de l'auto-summary dans ce chat

**Ce que vous y gagnez :**
- Une création de mémoire très rapide
- De meilleures possibilités de workflow
- Une intégration plus confortable si vous aimez travailler au clavier

</details>

---

## ✂️ Épingler dans le Memory Book

Utilisez **Épingler dans le Memory Book** quand vous voulez enregistrer une ligne ou un fait important sans créer une mémoire de scène complète. Surlignez du texte dans le chat, cliquez sur le bouton flottant avec les ciseaux, puis choisissez une entrée de clip existante ou créez-en une nouvelle.

Vous ne savez pas si cela doit être un Clip ou un Side Prompt ? Consultez [Clips vs Side Prompts](#-clips-vs-side-prompts).

### Quand utiliser les Clips ?

Les Clips sont faits pour les petits faits que l’IA doit retenir, par exemple :

- une préférence de personnage
- une promesse ou un secret
- un détail de relation
- un animal, lieu, objet ou détail récurrent
- une courte « note pour moi-même » qui ne mérite pas une mémoire complète

Pour les scènes plus larges, utilisez plutôt la création de mémoire normale.

### Comment fonctionne le clipping

1. Surlignez la phrase ou l’expression à enregistrer.
2. Cliquez sur le bouton flottant avec les ciseaux.
3. Choisissez une entrée de clip existante ou créez-en une nouvelle.
4. Vérifiez l’aperçu de l’entrée.
5. Enregistrez le clip.

Les entrées de clip sont des entrées de lorebook normales marquées avec `[STMB Clip]`. Par exemple :

```txt
Seraphina Healed Me [STMB Clip]
```

À l’intérieur de l’entrée, STMB conserve le contenu dans un format de section propre :

```md
=== Seraphina Healed Me ===

- Seraphina healed my wounds with magic.

=== END Seraphina Healed Me ===
```

### Créer ou renommer des entrées de clip

Quand vous créez une nouvelle entrée de clip, le titre de l’entrée devient aussi l’en-tête de section. Vous pouvez renommer l’entrée pendant le clipping ; STMB mettra l’en-tête de section à jour pour correspondre.

Les nouvelles entrées de clip peuvent être :

- **toujours actives**, pour les faits qui doivent toujours être disponibles
- **déclenchées par mots-clés**, pour les faits qui doivent apparaître seulement quand des mots correspondants sont présents

Utilisez des mots-clés quand le clip ne concerne qu’un sujet, personnage, lieu, animal, objet ou relation spécifique.

### Bouton flottant avec les ciseaux

Le bouton flottant avec les ciseaux apparaît seulement après avoir surligné du texte dans le chat. Vous pouvez l’activer ou le désactiver dans la fenêtre principale de Memory Books.

### Relire les entrées de clip longues

Si une entrée de clip devient longue, STMB peut vous rappeler de la relire. Vous pouvez la modifier vous-même, ou utiliser la **Compaction** pour demander à l’IA de rendre une entrée de Clip, de Side Prompt ou de mémoire STMB plus économe en tokens avant de décider si vous remplacez l’original.

---

## ✂️ Clips vs Side Prompts

Les Clips et les Side Prompts enregistrent tous deux des informations dans votre Memory Book, mais ils ne servent pas au même travail.

Règle simple : **les Clips enregistrent un fait précis. Les Side Prompts maintiennent un tracker vivant.**

| **Clips** | **Side Prompts** |
|---|---|
| Enregistrent du texte sélectionné du chat dans une entrée de Memory Book. | Demandent à l’IA de relire le chat et de mettre à jour une entrée de tracker. |
| Idéal pour un fait clair, une ligne, une promesse, une préférence, un objet ou une note. | Idéal pour les informations qui changent avec le temps, comme l’état d’une relation, la progression d’une quête, l’inventaire ou les fils narratifs non résolus. |
| Vous choisissez le texte exact. STMB enregistre ce que vous avez sélectionné. | L’IA interprète le chat et rédige ou met à jour le tracker. |
| À utiliser quand le fait est déjà évident et ne nécessite pas d’analyse. | À utiliser quand l’IA doit comparer, résumer ou mettre à jour un état à partir de plusieurs messages. |
| Grandit généralement seulement quand vous ajoutez manuellement un autre clip. | Peut être mis à jour plusieurs fois pendant que l’histoire change. |
| Pensez : « épingler cette note ». | Pensez : « garder cette section à jour ». |

Bons exemples de Clips :

- `Aiko aime le thé au miel.`
- `Andalino a promis de ne plus lui mentir.`
- `Colt l’appelle Boss.`

Bons exemples de Side Prompts :

- état d’une relation
- progression de quête actuelle
- inventaire et ressources
- répertoire de PNJ
- fils narratifs non résolus

Si vous voulez seulement retenir un détail, utilisez un Clip. Si vous avez besoin d’un tracker continu, utilisez un Side Prompt.

---

## 🙈 Économie de tokens : masquer / afficher

Une des façons les plus simples d'alléger un chat long est de masquer les messages une fois qu'ils ont déjà été transformés en mémoire.

### Que signifie « masquer » ?

Masquer des messages ne les supprime **pas**. Ils restent présents dans le chat, et les mémoires restent enregistrées dans le lorebook. Cela retire simplement ces messages du flux habituel envoyé à l'IA.

### Pourquoi utiliser cela ?

C'est utile quand :

- le chat commence à devenir très long
- les messages ont déjà été couverts par une mémoire
- vous voulez alléger l'affichage et économiser des tokens

### Masquage automatique après création de mémoire

STMB peut masquer automatiquement les messages après la création d'une mémoire. Vous pouvez choisir :

- **Ne pas masquer automatiquement** : tout reste visible
- **Masquer automatiquement tous les messages jusqu'à la dernière mémoire** : tout ce qui a déjà été couvert est masqué
- **Masquer automatiquement uniquement les messages de la dernière mémoire** : seule la dernière plage traitée est masquée

Vous pouvez aussi décider du nombre de messages récents qui restent visibles avec **Messages à laisser visibles**.

### Afficher avant la génération

Le réglage **Afficher les messages cachés pour la génération (exécute /unhide X-Y)** demande à STMB de lancer temporairement `/unhide X-Y` sur la plage concernée avant de générer la mémoire. C'est utile si vous retravaillez souvent des mémoires ou si vous masquez beaucoup de choses manuellement.

### Réglage simple pour commencer

Une bonne base de départ :

- utiliser **Masquer automatiquement uniquement les messages de la dernière mémoire**
- laisser **2** messages visibles
- activer **Afficher les messages cachés pour la génération (exécute /unhide X-Y)**

---

## 🧭 Compaction vs Consolidation

Les noms se ressemblent, mais ces fonctions ne font pas le même travail.

Règle simple : **la Compaction nettoie une entrée. La Consolidation combine plusieurs mémoires en un récapitulatif de niveau supérieur.**

| **Compaction** | **Consolidation** |
|---|---|
| Réduit la taille d’une entrée existante gérée par STMB. | Combine plusieurs mémoires ou résumés en un récapitulatif de niveau supérieur. |
| Travaille sur une entrée de Clip, de Side Prompt ou de mémoire STMB à la fois. | Travaille à partir de plusieurs entrées de mémoire/résumé sélectionnées. |
| Idéal quand une entrée est utile, mais trop longue, répétitive ou coûteuse à garder dans le contexte. | Idéal quand les anciennes mémoires de scène s’accumulent et doivent devenir un résumé Arc, Chapter, Book, Legend, Series ou Epic. |
| Réécrit l’entrée sélectionnée sous une forme plus économe en tokens. | Crée une nouvelle entrée de résumé à partir des entrées source sélectionnées. |
| Doit préserver les faits existants et retirer le gras. | Doit préserver le grand arc de continuité et réduire le détail scène par scène. |
| Ne crée pas une nouvelle mémoire depuis le chat brut. | Ne compacte pas une seule entrée gonflée toute seule. |
| Pensez : « raccourcir cette entrée ». | Pensez : « regrouper ces mémoires en récapitulatif ». |

Les deux outils passent d’abord par une relecture : STMB vous montre ce que l’IA a écrit avant tout enregistrement ou remplacement.

---

## 🌈 Consolidation des résumés

La Consolidation des résumés aide à garder les longues histoires gérables en compressant d’anciennes mémoires STMB en entrées récapitulatives de niveau supérieur.

### Q : Qu'est-ce que la Consolidation des résumés ?

**R :** Au lieu de créer indéfiniment des mémoires de scène, STMB peut combiner des mémoires ou résumés existants en un récapitulatif plus compact. Le premier niveau est **Arc**, et des niveaux de récapitulatif plus élevés sont aussi disponibles pour les longues histoires :

- Arc
- Chapter
- Book
- Legend
- Series
- Epic

### Q : Pourquoi s’en servir ?

**R :** La Consolidation est utile quand :

- votre liste de mémoires devient longue
- les anciennes entrées n’ont plus besoin d’un détail scène par scène complet
- vous voulez réduire les tokens sans perdre la continuité
- vous voulez des récapitulatifs narratifs plus propres et de niveau supérieur

### Q : Est-ce automatique ?

**R :** Non. La Consolidation demande toujours une confirmation.

- Vous pouvez toujours ouvrir **Consolider les mémoires** manuellement depuis la fenêtre principale
- Vous pouvez aussi activer **Demander une consolidation lorsqu’un niveau est prêt**
- Quand un niveau cible sélectionné atteint son minimum enregistré d’entrées éligibles, STMB affiche une confirmation **oui/plus tard**
- Choisir **Oui** ouvre la fenêtre de consolidation avec ce niveau déjà sélectionné ; cela ne lance rien en silence

### Q : Comment s’en servir ?

**R :** Pour créer un résumé consolidé :

1. Cliquez sur **Consolider les mémoires** dans la fenêtre principale de STMB
2. Choisissez le niveau de résumé cible
3. Sélectionnez les entrées source à inclure
4. Désactivez éventuellement les entrées source après la création du nouveau résumé
5. Cliquez sur **Run**

Pour prévisualiser ces entrées, activez « afficher les aperçus » dans vos préférences.

---

## 🎨 Trackers, Side Prompts et modèles (fonction avancée)

Les **Side Prompts** sont des trackers en arrière-plan. Ils tournent à côté de la création de mémoire et mettent à jour des entrées séparées dans votre lorebook. Pensez-y comme à de petits assistants qui surveillent un aspect précis de votre histoire.

### 🚀 **Démarrage rapide avec des modèles**

1. Ouvrez les réglages de Memory Books
2. Cliquez sur **Side Prompts**
3. Parcourez la bibliothèque de modèles et choisissez ceux qui conviennent à votre histoire :
   - **Character Development Tracker** - suit l'évolution d'un personnage
   - **Relationship Dynamics** - suit les relations entre personnages
   - **Plot Thread Tracker** - suit les fils narratifs en cours
   - **Mood & Atmosphere** - suit l'ambiance et la tonalité
   - **World Building Notes** - suit le lore et les détails du monde
4. Activez les modèles qui vous intéressent
5. Si le modèle utilise des déclencheurs automatiques, STMB mettra cette entrée à jour en même temps que les mémoires

[Guide Scribe pas à pas pour activer les Side Prompts automatiques](https://scribehow.com/viewer/How_to_Enable_Side_Prompts_in_Memory_Books__fif494uSSjCmxE2ZCmRGxQ)

### ⚙️ **Comment fonctionnent les Side Prompts**

- **Trackers de fond** : ils tournent discrètement et mettent à jour une information au fil du temps
- **Non intrusifs** : ils ne modifient pas vos prompts principaux ni votre fiche personnage
- **Contrôle par chat** : différents chats peuvent utiliser différents trackers
- **Basés sur des modèles** : vous pouvez partir des modèles fournis ou créer les vôtres
- **Automatiques ou manuels** : les modèles standard peuvent tourner automatiquement ; ceux avec macros runtime personnalisées sont manuels uniquement
- **Support des macros** : `Prompt`, `Response Format`, `Title` et les champs de mots-clés peuvent utiliser les macros ST standard comme `{{user}}` et `{{char}}`
- **Macros runtime** : les `{{...}}` non standard deviennent des arguments obligatoires, par exemple `{{npc name}}="Jane Doe"`
- **Texte brut autorisé** : les Side Prompts n'ont pas besoin de renvoyer du JSON
- **Comportement d'écrasement** : un Side Prompt met à jour sa propre entrée au fil du temps au lieu de créer une nouvelle mémoire séquentielle à chaque exécution

### 🛠️ **Gérer les Side Prompts**

- **Gestionnaire de Side Prompts** : créer, modifier, dupliquer et organiser les trackers
- **Activer / désactiver** : les allumer ou les couper à tout moment
- **Importer / exporter** : partager des modèles ou faire des sauvegardes
- **Vue d'état** : voir quels trackers sont actifs dans le chat actuel et quand ils se déclenchent
- **Vérifications de sécurité** : si un modèle contient des macros runtime personnalisées, STMB retire ses déclencheurs automatiques lors de l'enregistrement/de l'import et affiche un avertissement

### 💡 **Exemples de modèles**

- Bibliothèque de modèles Side Prompt (JSON à importer) :
  [SidePromptTemplateLibrary.json](/resources/SidePromptTemplateLibrary.json)

Exemples d'idées :

- « suivre les dialogues importants et les interactions entre personnages »
- « garder le statut de la quête à jour »
- « noter les nouveaux éléments de worldbuilding quand ils apparaissent »
- « suivre la relation entre le personnage A et le personnage B »

### 🔧 **Créer vos propres Side Prompts**

1. Ouvrez le gestionnaire de Side Prompts
2. Cliquez sur **Créer nouveau**
3. Écrivez une instruction claire et courte
4. Ajoutez si besoin des macros ST standard comme `{{user}}` ou `{{char}}`
5. Si vous ajoutez des macros runtime personnalisées comme `{{location name}}`, lancez le modèle manuellement avec `/sideprompt "Name" {{location name}}="value"`
6. Enregistrez puis activez-le
7. Le tracker mettra ensuite cette information à jour automatiquement si le modèle utilise des déclencheurs automatiques ; sinon, lancez-le manuellement

### 💬 **Conseil pratique**

Les Side Prompts fonctionnent mieux quand ils sont **petits et ciblés**.

Au lieu de « suivre tout », préférez quelque chose comme « suivre la tension romantique entre les personnages principaux ».

### ⌨️ **Syntaxe manuelle de `/sideprompt`**

Utilisation :
`/sideprompt "Name" {{macro}}="value" [X-Y]`

Exemples :

- `/sideprompt "Status" 10-20`
- `/sideprompt "NPC Directory" {{npc name}}="Jane Doe" 40-50`
- `/sideprompt "Location Notes" {{place name}}="Black Harbor" 100-120`

Notes :

- Le nom du Side Prompt doit être entre guillemets
- Les valeurs des macros runtime doivent être entre guillemets
- L'autocomplétion des slash commands proposera les macros runtime requises après avoir choisi le Side Prompt
- Si un modèle contient des macros runtime personnalisées, STMB le garde en mode manuel uniquement et retire les déclencheurs automatiques
- `X-Y` est optionnel. Si vous l'omettez, STMB utilise les messages depuis la dernière mise à jour de ce Side Prompt

---

### 🧠 Contrôle avancé du texte avec l'extension Regex

**Vous voulez contrôler précisément ce que STMB envoie à l'IA et ce qu'il enregistre ?** STMB peut exécuter des scripts Regex sélectionnés avant la génération et avant la sauvegarde.

C'est utile si vous voulez :

- nettoyer des répétitions ou des artefacts dans les réponses IA
- normaliser des noms ou une terminologie avant la génération
- reformater le texte avant que STMB ne le parse ou l'affiche en aperçu

#### **Comment cela fonctionne maintenant**

1. Créez les scripts souhaités dans l'extension **Regex** de SillyTavern
2. Dans STMB, activez **Utiliser regex (avancé)**
3. Cliquez sur **📐 Configurer regex…**
4. Choisissez les scripts que STMB doit exécuter :
   - avant l'envoi du texte à l'IA
   - avant l'ajout de la réponse au lorebook

#### **Comportement important**

- La sélection Regex pour STMB se fait **dans STMB**, pas via l'état activé/désactivé du script dans l'extension Regex
- Un script sélectionné dans STMB peut encore s'exécuter même s'il est désactivé dans l'extension Regex
- STMB prend en charge la multi-sélection pour le traitement sortant comme entrant

#### **Exemple rapide**

Si votre modèle ajoute souvent `(OOC: I hope this summary is helpful!)`, vous pouvez :

1. Créer un script Regex qui supprime ce texte
2. Activer **Utiliser regex (avancé)** dans STMB
3. Ouvrir **📐 Configurer regex…**
4. Ajouter ce script dans la sélection **entrante**

STMB nettoiera alors la réponse avant l'aperçu ou l'enregistrement.

---

## 🧹 Compaction

La compaction sert quand une entrée de lorebook gérée par STMB est encore utile, mais qu’elle est devenue trop longue ou répétitive. Au lieu de la couper à la main, vous pouvez demander à l’IA de la réécrire sous une forme plus économe en tokens.

C’est un outil de **relecture avant remplacement**. STMB vous montre l’original et le brouillon compacté avant d’enregistrer quoi que ce soit.

### Que peut-on compacter ?

La compaction peut lister ces entrées depuis un Memory Book sélectionné :

- entrées Clip
- entrées de tracker SidePrompt
- entrées de mémoire STMB

Elle n’affiche pas les entrées ordinaires de lorebook que STMB ne gère pas.

### Comment utiliser la compaction

1. Ouvrez la fenêtre Memory Books.
2. Cliquez sur **📝 Compaction**.
3. Sélectionnez le **Memory Book** à relire. Si votre chat actuel a déjà un Memory Book, il peut être sélectionné automatiquement.
4. Sélectionnez un **Profil de compaction**. Cela choisit quelle connexion IA / quel modèle réécrit l’entrée.
5. Facultatif : cliquez sur **Modifier le prompt de compaction** si vous voulez changer les instructions de réécriture.
6. Trouvez l’entrée dans le tableau et cliquez sur **Compacter l’entrée**.
7. Relisez le résultat :
   - **Contenu original** montre ce qui est actuellement enregistré.
   - **Brouillon compacté** montre la réécriture de l’IA.
   - Les deux affichent une estimation de tokens.
8. Modifiez le brouillon compacté si nécessaire.
9. Choisissez une option :
   - **Remplacer par la version compactée** pour enregistrer le brouillon à la place de l’entrée originale.
   - **Copier le brouillon compacté** pour le copier sans enregistrer.
   - **Annuler** pour laisser l’entrée inchangée.

STMB ne doit jamais remplacer l’original en silence. Si vous ne cliquez pas sur **Remplacer par la version compactée**, l’entrée de lorebook reste telle quelle.

### Modifier le Prompt de compaction

Le Prompt de compaction contrôle la façon dont l’IA réécrit les entrées. Le prompt intégré est volontairement conservateur : préserver les faits importants, les noms, les pronoms, les macros, les en-têtes d’enveloppe et les marqueurs de fin ; supprimer les répétitions et les formulations à faible valeur ; ne rien inventer.

Le prompt prend en charge ces placeholders :

- `{{ENTRY_CONTENT}}` — le contenu actuel de l’entrée. Obligatoire.
- `{{ENTRY_KIND}}` — le type d’entrée, par exemple Clip, SidePrompt ou Mémoire.
- `{{ENTRY_TITLE}}` — le titre de l’entrée.

Utilisez **Rétablir la valeur par défaut** si votre prompt personnalisé ne se comporte plus correctement.

### Bons cas d’usage

Utilisez la compaction pour :

- longues entrées Clip
- trackers SidePrompt qui se répètent au fil du temps
- entrées de mémoire correctes mais gonflées
- entrées toujours actives qui coûtent trop de tokens

Ne l’utilisez pas pour :

- créer une nouvelle mémoire depuis le chat
- ajouter de nouveaux faits
- corriger une continuité absente de l’entrée
- modifier des entrées normales de lorebook hors STMB

La compaction est un outil de nettoyage, pas un outil de génération de mémoire.

---

## ⚙️ Les réglages à apprendre en premier

Ce guide n'est pas la référence complète des réglages. Pour la liste détaillée, consultez [readme-FR.md](readme-FR.md).

Les contrôles que la plupart des utilisateurs devraient comprendre en premier :

- **Créer des résumés de mémoire automatiques** : active la création automatique de mémoires
- **Intervalle d'Auto-Résumé** et **Tampon d'Auto-Résumé** : contrôlent quand l'auto-summary se déclenche
- **Afficher les aperçus de mémoire** : permet de relire ou modifier la réponse IA avant sauvegarde
- **Demander une consolidation lorsqu'un niveau est prêt** et **Niveaux d'auto-consolidation** : signalent les opportunités de consolidation sans rien lancer silencieusement
- **Activer le Mode Manuel du Lorebook** et **Créer le lorebook s'il n'existe pas** : contrôlent l'endroit où les mémoires sont enregistrées
- **Utiliser regex (avancé)** : ouvre la sélection Regex gérée par STMB pour l'aller et le retour
- **Paramètres SillyTavern Actuels** : utilise directement votre connexion ST active sans créer de profil fournisseur personnalisé

---

## 🔧 Dépannage (quand les choses ne fonctionnent pas)

Ce guide n'est pas la matrice complète de dépannage. Pour la liste détaillée, consultez [readme-FR.md](readme-FR.md).

Vérifications rapides :

- Vérifiez que STMB est bien activé et que l'entrée **Memory Books** apparaît dans le menu des extensions
- Si l'auto-summary ne se déclenche pas, vérifiez que vous avez d'abord créé une mémoire manuelle et que vos réglages interval/buffer sont cohérents
- Si les mémoires ne peuvent pas être enregistrées, assurez-vous qu'un lorebook est lié au chat ou que **Créer le lorebook s'il n'existe pas** est activé
- Si Regex se comporte bizarrement, vérifiez d'abord la sélection dans **📐 Configurer regex…**
- Si la consolidation ne se propose pas, vérifiez que **Demander une consolidation lorsqu'un niveau est prêt** est activé et que le niveau cible figure dans **Niveaux d'auto-consolidation**

---

## 🚫 Ce que ST Memory Books ne fait pas

- **Ce n'est pas un éditeur de lorebook généraliste** : ce guide se concentre sur les entrées créées par STMB. Pour l'édition générale d'un lorebook, utilisez l'éditeur intégré de SillyTavern.

---

## 💡 Aide et informations

- **Infos plus détaillées** : [readme-FR.md](readme-FR.md)
- **Dernières mises à jour** : [../changelog.md](../changelog.md)
- **Support communautaire** : rejoignez la communauté SillyTavern sur Discord (cherchez le fil 📕 ST Memory Books ou contactez @tokyoapple)
- **Bugs / idées** : ouvrez une issue GitHub dans ce dépôt

---

### 📚 Boostez le tout avec STLO

Pour une organisation mémoire plus poussée et une meilleure intégration dans l'histoire, utilisez STMB avec [SillyTavern-LorebookOrdering (STLO)](https://github.com/aikohanasaki/SillyTavern-LorebookOrdering/blob/main/guides/STMB%20and%20STLO%20-%20English.md). Consultez le guide pour les bonnes pratiques, l'installation et les conseils d'usage.
