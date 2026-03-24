# 📕 ST Memory Books - Votre assistant mémoire IA pour le chat

**Transformez vos longues conversations en souvenirs organisés et faciles à retrouver !**

Vous voulez que le bot se souvienne de ce qui s'est passé, mais votre chat est devenu trop long pour tenir dans le contexte ? Vous voulez suivre les éléments importants de l'histoire sans prendre des notes à la main ? ST Memory Books fait exactement cela : il surveille vos discussions et crée des résumés intelligents pour que vous ne perdiez plus le fil de votre récit.

(Vous cherchez plutôt les détails techniques et le déroulement interne ? Consultez [Comment STMB fonctionne](howSTMBworks-fr.md).)

## 📑 Table des matières

- [Démarrage rapide](#-démarrage-rapide-5-minutes-pour-votre-première-mémoire)
- [Ce que fait réellement ST Memory Books](#-ce-que-fait-réellement-st-memory-books)
- [Choisir votre style](#-choisir-votre-style)
- [Économie de tokens : masquer / afficher](#-économie-de-tokens--masquer--afficher)
- [Consolidation des résumés](#-consolidation-des-résumés)
- [Trackers, prompts secondaires et modèles](#-trackers-prompts-secondaires-et-modèles-fonction-avancée)
- [Les réglages à apprendre en premier](#-les-réglages-à-apprendre-en-premier)
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

### 📊 **Prompts secondaires et trackers intelligents**
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

## 🌈 Consolidation des résumés

La consolidation permet de garder les longues histoires lisibles et gérables en compressant d'anciennes mémoires STMB dans des résumés de niveau supérieur.

### Q : Qu'est-ce que la consolidation des résumés ?

**R :** Au lieu d'accumuler uniquement des mémoires de scène, STMB peut combiner des mémoires ou des résumés existants pour en faire une entrée plus compacte. Le premier niveau est **Arc**, puis viennent aussi :

- Arc
- Chapter
- Book
- Legend
- Series
- Epic

### Q : Pourquoi s'en servir ?

**R :** C'est utile quand :

- votre liste de mémoires devient très longue
- les anciennes scènes n'ont plus besoin d'un niveau de détail scène par scène
- vous voulez réduire les tokens sans perdre la continuité
- vous voulez des récapitulatifs narratifs plus larges et plus propres

### Q : Est-ce automatique ?

**R :** Non. La consolidation demande toujours une confirmation.

- Vous pouvez ouvrir **Consolider les mémoires** manuellement depuis la fenêtre principale
- Vous pouvez aussi activer **Demander une consolidation lorsqu'un niveau est prêt**
- Quand un niveau cible sélectionné atteint son minimum requis, STMB affiche une confirmation **yes/later**
- Choisir **Yes** ouvre simplement la fenêtre de consolidation avec ce niveau déjà sélectionné ; cela ne lance pas la consolidation en silence

### Q : Comment s'en servir ?

**R :** Pour créer un résumé consolidé :

1. Cliquez sur **Consolider les mémoires** dans la fenêtre principale de STMB
2. Choisissez le niveau de résumé cible
3. Sélectionnez les entrées source à inclure
4. Décidez si vous voulez désactiver les entrées source après création
5. Cliquez sur **Run**

Si l'IA renvoie une mauvaise réponse, STMB peut vous proposer une étape de relecture/correction avant de réessayer la validation.

### Que consolide-t-on, et que ne consolide-t-on pas ?

La consolidation porte sur **les mémoires STMB et les résumés STMB**.

Cela signifie :

- les mémoires normales peuvent être consolidées dans des résumés de niveau supérieur
- les résumés de niveau supérieur peuvent eux-mêmes être consolidés plus tard

Les prompts secondaires sont différents.

**Les prompts secondaires sont des entrées de suivi**, pas des entrées de type mémoire/résumé. Ils servent à maintenir à jour un état continu, par exemple :

- le statut d'une relation
- les objectifs actuels
- des scoreboards
- l'état du monde
- des trackers de trame

En clair :

- **Mémoires** = « que s'est-il passé dans cette scène ? »
- **Prompts secondaires** = « quel est l'état actuel de cette chose ? »
- **Consolidation** = « résumer plusieurs mémoires en un récapitulatif plus large »

### Pourquoi est-ce important ?

Des utilisateurs s'attendent parfois à ce que les trackers et scoreboards remontent automatiquement dans les résumés Arc ou Chapter.

Ce n'est **pas** le cas.

Si vous voulez qu'un élément fasse partie de la consolidation, il doit exister sous forme de mémoire/résumé STMB normal, pas uniquement comme Side Prompt.

### Règle simple

Utilisez :

- **les mémoires** pour résumer une scène
- **les prompts secondaires** pour les suivis continus
- **la consolidation** pour réduire plusieurs mémoires en récapitulatifs plus larges

---

## 🎨 Trackers, prompts secondaires et modèles (fonction avancée)

Les **prompts secondaires** sont des trackers en arrière-plan. Ils tournent à côté de la création de mémoire et mettent à jour des entrées séparées dans votre lorebook. Pensez-y comme à de petits assistants qui surveillent un aspect précis de votre histoire.

### 🚀 **Démarrage rapide avec des modèles**

1. Ouvrez les réglages de Memory Books
2. Cliquez sur **Prompts secondaires**
3. Parcourez la bibliothèque de modèles et choisissez ceux qui conviennent à votre histoire :
   - **Character Development Tracker** - suit l'évolution d'un personnage
   - **Relationship Dynamics** - suit les relations entre personnages
   - **Plot Thread Tracker** - suit les fils narratifs en cours
   - **Mood & Atmosphere** - suit l'ambiance et la tonalité
   - **World Building Notes** - suit le lore et les détails du monde
4. Activez les modèles qui vous intéressent
5. Si le modèle utilise des déclencheurs automatiques, STMB mettra cette entrée à jour en même temps que les mémoires

[Guide Scribe pas à pas pour activer les prompts secondaires automatiques](https://scribehow.com/viewer/How_to_Enable_Side_Prompts_in_Memory_Books__fif494uSSjCmxE2ZCmRGxQ)

### ⚙️ **Comment fonctionnent les prompts secondaires**

- **Trackers de fond** : ils tournent discrètement et mettent à jour une information au fil du temps
- **Non intrusifs** : ils ne modifient pas vos prompts principaux ni votre fiche personnage
- **Contrôle par chat** : différents chats peuvent utiliser différents trackers
- **Basés sur des modèles** : vous pouvez partir des modèles fournis ou créer les vôtres
- **Automatiques ou manuels** : les modèles standard peuvent tourner automatiquement ; ceux avec macros runtime personnalisées sont manuels uniquement
- **Support des macros** : `Prompt`, `Response Format`, `Title` et les champs de mots-clés peuvent utiliser les macros ST standard comme `{{user}}` et `{{char}}`
- **Macros runtime** : les `{{...}}` non standard deviennent des arguments obligatoires, par exemple `{{npc name}}="Jane Doe"`
- **Texte brut autorisé** : les prompts secondaires n'ont pas besoin de renvoyer du JSON
- **Comportement d'écrasement** : un Side Prompt met à jour sa propre entrée au fil du temps au lieu de créer une nouvelle mémoire séquentielle à chaque exécution

### 🛠️ **Gérer les prompts secondaires**

- **Gestionnaire de prompts secondaires** : créer, modifier, dupliquer et organiser les trackers
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

### 🔧 **Créer vos propres prompts secondaires**

1. Ouvrez le gestionnaire de prompts secondaires
2. Cliquez sur **Créer nouveau**
3. Écrivez une instruction claire et courte
4. Ajoutez si besoin des macros ST standard comme `{{user}}` ou `{{char}}`
5. Si vous ajoutez des macros runtime personnalisées comme `{{location name}}`, lancez le modèle manuellement avec `/sideprompt "Name" {{location name}}="value"`
6. Enregistrez puis activez-le
7. Le tracker mettra ensuite cette information à jour automatiquement si le modèle utilise des déclencheurs automatiques ; sinon, lancez-le manuellement

### 💬 **Conseil pratique**

Les prompts secondaires fonctionnent mieux quand ils sont **petits et ciblés**.

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
