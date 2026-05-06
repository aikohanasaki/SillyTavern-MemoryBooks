# 📕 Memory Books (Une extension pour SillyTavern)

Une extension de nouvelle génération pour SillyTavern permettant la création automatique, structurée et fiable de mémoires. Marquez des scènes dans le chat, générez des résumés basés sur JSON avec l’IA, puis stockez-les comme entrées dans vos lorebooks. Prend en charge les discussions de groupe, la gestion avancée des profils, les Side Prompts/trackers et la consolidation de mémoires multi-niveaux.

### ❓ Vocabulaire

- Scene (Scène) → Memory (Mémoire)
- One saved fact (Un fait enregistré) → Clip
- Ongoing tracker (Suivi continu) → Side Prompt
- Many Memories (Plusieurs mémoires) → Summary / Consolidation (Résumé / Consolidation)
- One long entry (Une longue entrée) → Compaction

### Clips vs Side Prompts

<details>
<summary><strong>Clips vs Side Prompts</strong></summary>

| **Clips** | **Side Prompts** |
|---|---|
| Enregistrent du texte sélectionné du chat dans une entrée de Memory Book. | Demandent à l’IA de relire le chat et de mettre à jour une entrée de suivi. |
| Idéal pour un fait clair, une ligne, une promesse, une préférence, un objet ou une note. | Idéal pour les informations qui changent avec le temps. |
| Pensez : « épingler cette note ». | Pensez : « garder cette section à jour ». |

</details>

Pour l’explication plus longue, consultez le [Guide utilisateur](USER_GUIDE-FR.md#-clips-vs-side-prompts).

### Compaction vs Consolidation

<details>
<summary><strong>Compaction vs Consolidation</strong></summary>

| **Compaction** | **Consolidation** |
|---|---|
| Raccourcit une entrée existante gérée par STMB. | Combine plusieurs mémoires ou résumés en un récapitulatif de niveau supérieur. |
| À utiliser quand un Clip, un Side Prompt ou une entrée de mémoire est utile, mais devient trop long. | À utiliser quand plusieurs mémoires sont prêtes à devenir un Arc, Chapter, Book ou autre résumé plus large. |
| Pensez : « raccourcir cette entrée ». | Pensez : « regrouper ces mémoires en récapitulatif ». |

</details>

Pour l’explication plus longue, consultez le [Guide utilisateur](USER_GUIDE-FR.md#-compaction-vs-consolidation).

## ❗ Lisez-moi d’abord !

Commencez ici :

- ⚠️‼️ Veuillez lire les [prérequis](#-prérequis) pour les notes d’installation, surtout si vous utilisez une API Text Completion.
- 📽️ [Vidéo de démarrage rapide](https://youtu.be/mG2eRH_EhHs) - anglais uniquement ; désolée, c’est la langue que je maîtrise le mieux.
- ❓ [FAQ](#faq)
- 🛠️ [Dépannage](#dépannage)

Autres liens :

- 📘 [Guide utilisateur (FR)](USER_GUIDE-FR.md)
- 📋 [Historique des versions & Changelog](../changelog.md)
- 💡 [Utiliser 📕 Memory Books avec 📚 Lorebook Ordering](https://github.com/aikohanasaki/SillyTavern-LorebookOrdering/blob/main/guides/STMB%20and%20STLO%20-%20French.md)

> Note : plusieurs langues sont prises en charge ; consultez le dossier [`/locales`](../locales) pour la liste. Les Readme et Guides utilisateur internationaux/localisés se trouvent dans le dossier [`/userguides`](./).
> Le convertisseur de lorebook et la bibliothèque de modèles de Side Prompts se trouvent dans le dossier [`/resources`](../resources).

## 📑 Table des matières

- [Prérequis](#-prérequis)
  - [Conseils KoboldCpp pour utiliser 📕 ST Memory Books](#conseils-koboldcpp-pour-utiliser--st-memory-books)
  - [Conseils Llama.cpp pour utiliser 📕 ST Memory Books](#conseils-llamacpp-pour-utiliser--st-memory-books)
- [Paramètres recommandés pour l’activation globale de World Info/Lorebook](#-paramètres-recommandés-pour-lactivation-globale-de-world-infolorebook)
- [Pour commencer](#-pour-commencer)
  - [1. Installer & charger](#1-installer--charger)
  - [2. Marquer une scène](#2-marquer-une-scène)
  - [3. Créer une mémoire](#3-créer-une-mémoire)
- [Types de mémoire : scènes vs résumés](#-types-de-mémoire--scènes-vs-résumés)
  - [Mémoires de scène (par défaut)](#-mémoires-de-scène-par-défaut)
  - [Consolidation des résumés](#-consolidation-des-résumés)
- [Génération de mémoire](#-génération-de-mémoire)
  - [Sortie JSON uniquement](#sortie-json-uniquement)
  - [Presets intégrés](#presets-intégrés)
  - [Prompts personnalisés](#prompts-personnalisés)
- [Intégration lorebook](#-intégration-lorebook)
- [Épingler dans le Memory Book](#️-épingler-dans-le-memory-book)
- [Commandes slash](#-commandes-slash)
- [Support des discussions de groupe](#-support-des-discussions-de-groupe)
- [Modes de fonctionnement](#-modes-de-fonctionnement)
  - [Mode automatique (par défaut)](#mode-automatique-par-défaut)
  - [Mode création automatique de lorebook](#mode-création-automatique-de-lorebook)
  - [Mode lorebook manuel](#mode-lorebook-manuel)
- [Trackers & Side Prompts](#-trackers--side-prompts)
- [Compaction](#-compaction)
- [Intégration Regex pour personnalisation avancée](#-intégration-regex-pour-personnalisation-avancée)
- [Gestion des profils](#-gestion-des-profils)
- [Paramètres & configuration](#-paramètres--configuration)
  - [Paramètres globaux](#paramètres-globaux)
  - [Champs du profil](#champs-du-profil)
- [Formatage des titres](#-formatage-des-titres)
- [Mémoires contextuelles](#-mémoires-contextuelles)
- [Retour visuel & accessibilité](#-retour-visuel--accessibilité)
- [FAQ](#faq)
  - [Dois-je créer un lorebook séparé pour les mémoires, ou puis-je utiliser le même lorebook que celui que j’utilise déjà pour autre chose ?](#dois-je-créer-un-lorebook-séparé-pour-les-mémoires-ou-puis-je-utiliser-le-même-lorebook-que-celui-que-jutilise-déjà-pour-autre-chose-)
  - [Dois-je utiliser les vecteurs ?](#dois-je-utiliser-les-vecteurs-)
  - [Dois-je utiliser "Delay until recursion" si Memory Books est le seul lorebook ?](#dois-je-utiliser-delay-until-recursion-si-memory-books-est-le-seul-lorebook-)
  - [Pourquoi l’IA ne voit-elle pas mes entrées ?](#pourquoi-lia-ne-voit-elle-pas-mes-entrées-)
- [Dépannage](#dépannage)
- [Augmenter la puissance avec Lorebook Ordering (STLO)](#-augmenter-la-puissance-avec-lorebook-ordering-stlo)
- [Politique de caractères](#-politique-de-caractères-v451)
- [Pour les développeurs](#-pour-les-développeurs)
  - [Compiler l’extension](#compiler-lextension)
  - [Git Hooks](#git-hooks)

---

## 📋 Prérequis

- **SillyTavern :** 1.14.0+ (dernière version recommandée)
- **Sélection de scène :** les marqueurs de début et de fin (début < fin) doivent être définis.
- **Support Chat Completion :** support complet pour OpenAI, Claude, Anthropic, OpenRouter ou d’autres API Chat Completion.
- **Support Text Completion :** les API Text Completion (Kobold, TextGen, etc.) sont prises en charge lorsqu’elles sont connectées via un endpoint d’API Chat Completion compatible OpenAI. Je recommande de configurer une connexion Chat Completion selon les conseils KoboldCpp ci-dessous ; adaptez si nécessaire si vous utilisez Ollama ou un autre logiciel. Ensuite, configurez un profil STMB et utilisez `Custom` (recommandé) ou la configuration manuelle complète (uniquement si `Custom` échoue ou si vous avez plus d’une connexion personnalisée).
**NOTE :** si vous utilisez Text Completion, vous devez avoir un preset Chat Completion.

### Conseils KoboldCpp pour utiliser 📕 ST Memory Books

Configurez ceci dans ST. Vous pouvez revenir à Text Completion APRÈS avoir fait fonctionner STMB :

- Chat Completion API
- Custom chat completion source
- Endpoint `http://localhost:5001/v1` (vous pouvez aussi utiliser `127.0.0.1:5000/v1`)
- Entrez n’importe quoi dans `custom API key` ; peu importe, mais ST exige une clé.
- L’ID du modèle doit être `koboldcpp/modelname` (ne mettez pas `.gguf` dans le nom du modèle).
- Téléchargez un preset Chat Completion et importez-le. N’importe lequel convient ; il faut juste AVOIR un preset Chat Completion. Cela évite les erreurs “not supported”.
- Modifiez la longueur maximale de réponse dans le preset Chat Completion pour qu’elle soit d’au moins 2048 ; 4096 est recommandé. Une valeur plus basse augmente le risque que la réponse soit coupée.

### Conseils Llama.cpp pour utiliser 📕 ST Memory Books

Comme avec Kobold, configurez ce qui suit comme une *API Chat Completion* dans ST. Vous pouvez revenir à votre configuration précédente après avoir vérifié que STMB fonctionne :

- Créez un nouveau profil de connexion pour une API Chat Completion.
- Completion Source : `Custom (Open-AI Compatible)`
- Endpoint URL : `http://host.docker.internal:8080/v1` si ST tourne dans Docker ; sinon `http://localhost:8080/v1`
- Custom API Key : entrez n’importe quoi (ST en exige une)
- Model ID : `llama2-7b-chat.gguf` (ou votre modèle ; peu importe si vous n’en exécutez pas plus d’un dans llama.cpp)
- Prompt post-processing : none

Pour démarrer Llama.cpp, je recommande de placer quelque chose de similaire dans un script shell ou un fichier bat, afin de faciliter le démarrage :

```sh
llama-server -m <model-path> -c <context-size> --port 8080
```

## 💡 Paramètres recommandés pour l’activation globale de World Info/Lorebook

- **Match Whole Words :** laissez décoché (false)
- **Scan Depth :** plus c’est élevé, mieux c’est (le mien est réglé sur 8)
- **Max Recursion Steps :** 2 (recommandation générale, non obligatoire)
- **Context % :** 80 % (basé sur une fenêtre de contexte de 100 000 tokens) ; suppose que vous n’avez pas un historique de chat ou des bots extrêmement lourds.
- Note supplémentaire : si le lorebook de mémoires est votre seul lorebook, assurez-vous que `Delay until recursion` est désactivé dans le profil STMB, sinon les mémoires ne se déclencheront pas.

---

## 🚀 Pour commencer

### 1. **Installer & charger**

- Chargez SillyTavern et sélectionnez un personnage ou une discussion de groupe.
- Attendez que les boutons chevrons (► ◄) apparaissent sur les messages du chat. Cela peut prendre jusqu’à 10 secondes.

![Attendez l’apparition de ces boutons](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/startup.png)

### 2. **Marquer une scène**

- Cliquez sur ► sur le premier message de votre scène.
- Cliquez sur ◄ sur le dernier message.

Voici quelques exemples de l’apparence des boutons chevrons après clic. Les couleurs peuvent varier selon votre thème CSS.

![Retour visuel montrant la sélection de scène](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/button-start.png)

### 3. **Créer une mémoire**

- Ouvrez le menu Extensions (la baguette magique 🪄) et cliquez sur “Memory Books”, ou utilisez la commande slash `/creatememory`.
- Confirmez les paramètres (profil, contexte, API/modèle) si demandé.
- Attendez la génération par l’IA et l’entrée automatique dans le lorebook.

---

## 🧩 Types de mémoire : scènes vs résumés

📕 Memory Books prend en charge les **mémoires de scène** et la **consolidation de résumés multi-niveaux**, chacune conçue pour différents types de continuité.

### 🎬 Mémoires de scène (par défaut)

Les mémoires de scène capturent **ce qui s’est passé** dans une plage spécifique de messages.

- Basées sur une sélection explicite de scène (► ◄)
- Idéales pour le rappel moment par moment
- Préservent le dialogue, les actions et les résultats immédiats
- À utiliser fréquemment

C’est le type de mémoire standard et le plus couramment utilisé.

---

### 🌈 Consolidation des résumés

La consolidation des résumés capture **ce qui a changé au fil du temps** à travers plusieurs mémoires ou résumés.

Au lieu de résumer une seule scène, les résumés consolidés se concentrent sur :

- Le développement des personnages et les changements relationnels
- Les objectifs à long terme, les tensions et les résolutions
- La trajectoire émotionnelle et la direction narrative
- Les changements d’état persistants qui doivent rester stables

Le premier niveau de consolidation est **Arc**, construit à partir des mémoires de scène. Des niveaux supérieurs sont également pris en charge pour les histoires plus longues :

- Arc
- Chapter
- Book
- Legend
- Series
- Epic

> 💡 Pensez-y comme à des *récapitulatifs*, pas comme à des journaux de scène.

#### Quand utiliser les résumés consolidés

- Après un changement relationnel majeur
- À la fin d’un chapitre ou d’un arc d’histoire
- Lorsque les motivations, la confiance ou les dynamiques de pouvoir changent
- Avant de commencer une nouvelle phase de l’histoire

#### Comment ça marche

- Les résumés consolidés sont générés à partir de mémoires/résumés STMB existants, pas directement à partir du chat brut.
- L’outil **Consolidate Memories** vous permet de choisir un niveau de résumé cible et de sélectionner les entrées source.
- STMB peut surveiller en option les niveaux de résumé sélectionnés et afficher une confirmation oui/plus tard lorsqu’un niveau atteint son minimum enregistré d’entrées éligibles.
- STMB peut désactiver les entrées source après consolidation si vous voulez que le résumé de niveau supérieur prenne le relais.
- Les réponses de résumé IA échouées peuvent être relues et corrigées dans l’interface avant de réessayer l’enregistrement.

Cela offre :

- une utilisation plus faible des tokens
- une meilleure continuité narrative dans les longs chats

---

## 📝 Génération de mémoire

### **Sortie JSON uniquement**

Tous les prompts et presets **doivent** demander à l’IA de ne renvoyer que du JSON valide, par exemple :

```json
{
  "title": "Titre court de la scène",
  "content": "Résumé détaillé de la scène...",
  "keywords": ["mot-clé1", "mot-clé2"]
}
```

**Aucun autre texte n’est autorisé dans la réponse.**

### **Presets intégrés**

1. **Summary :** Résumés détaillés temps par temps.
2. **Summarize :** En-têtes Markdown pour chronologie, temps forts, interactions et résultat.
3. **Synopsis :** Markdown complet et structuré.
4. **Sum Up :** Résumé concis des temps forts avec chronologie.
5. **Minimal :** Résumé en 1-2 phrases.
6. **Northgate :** Style de résumé littéraire conçu pour l’écriture créative.
7. **Aelemar :** Se concentre sur les points d’intrigue et les mémoires des personnages.
8. **Comprehensive :** Résumé de type synopsis avec extraction de mots-clés améliorée.

### **Prompts personnalisés**

- Vous pouvez créer les vôtres, mais ils **doivent** renvoyer un JSON valide comme ci-dessus.

---

## 📚 Intégration lorebook

- **Création automatique d’entrées :** les nouvelles mémoires sont stockées comme entrées avec toutes les métadonnées.
- **Détection basée sur les flags :** seules les entrées avec le flag `stmemorybooks` sont reconnues comme mémoires.
- **Numérotation automatique :** numérotation séquentielle avec zéros initiaux et plusieurs formats pris en charge (`[000]`, `(000)`, `{000}`, `#000`).
- **Ordre manuel/automatique :** paramètres d’ordre d’insertion par profil.
- **Rafraîchissement de l’éditeur :** rafraîchit éventuellement l’éditeur de lorebook après l’ajout d’une mémoire.

> **Les mémoires existantes doivent être converties.**
> Utilisez le [Lorebook Converter](../resources/lorebookconverter.html) pour ajouter le flag `stmemorybooks` et les champs requis.

---

## ✂️ Épingler dans le Memory Book

Utilisez **Épingler dans le Memory Book** quand vous voulez enregistrer une ligne ou un fait important sans créer une mémoire de scène complète. Surlignez du texte dans le chat, cliquez sur le bouton flottant avec les ciseaux, puis choisissez une entrée de clip existante ou créez-en une nouvelle.

Vous ne savez pas si cela doit être un Clip ou un Side Prompt ? Consultez [Clips vs Side Prompts](USER_GUIDE-FR.md#-clips-vs-side-prompts).

#### Fonctionnement

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

#### Conseils

- Utilisez les Clips pour les faits isolés, préférences, promesses, objets ou notes courtes.
- Utilisez la création de mémoire normale pour les scènes plus larges.
- Si une entrée de clip devient trop longue, STMB peut vous rappeler de la vérifier ou de la raccourcir avec la Compaction.

---

## 🆕 Commandes slash

- `/creatememory` - Crée une mémoire à partir de la scène marquée.
- `/scenememory X-Y` - Définit la plage de scène et crée une mémoire (par exemple, `/scenememory 10-15`).
- `/nextmemory` - Crée une mémoire depuis la fin de la dernière mémoire jusqu’au message actuel.
- `/stmb-catchup interval:x start:y end:y` - Crée des mémoires de rattrapage pour un long chat existant en traitant la plage de messages sélectionnée par blocs de la taille indiquée par l’intervalle.
- `/sideprompt "Name" {{macro}}="value" [X-Y]` - Exécute un Side Prompt (`{{macro}}` est optionnel).
- `/sideprompt-set "Set Name" [X-Y]` - Exécute un Side Prompt Set enregistré.
- `/sideprompt-macroset "Set Name" {{macro}}="value" [X-Y]` - Exécute un Side Prompt Set et fournit des valeurs de macro réutilisables.
- `/sideprompt-on "Name" | all` - Active un Side Prompt par nom, ou tous.
- `/sideprompt-off "Name" | all` - Désactive un Side Prompt par nom, ou tous.
- `/stmb-highest` - Renvoie l’ID de message le plus élevé pour les mémoires traitées dans ce chat.
- `/stmb-set-highest <N|none>` - Définit manuellement l’ID de message traité le plus élevé pour ce chat.
- `/stmb-stop` - Arrête toutes les générations STMB en cours partout. À utiliser comme arrêt d’urgence.

### `/stmb-catchup`

Utilisez `/stmb-catchup` lorsque vous voulez convertir un long chat existant en mémoires STMB.

Syntaxe : `/stmb-catchup interval:x start:y end:y`

Exemple : `/stmb-catchup interval:30 start:0 end:300`

---

## 👥 Support des discussions de groupe

- Toutes les fonctionnalités fonctionnent avec les discussions de groupe.
- Les marqueurs de scène, la création de mémoire et l’intégration lorebook sont stockés dans les métadonnées du chat actif.
- Aucune configuration spéciale n’est requise ; sélectionnez simplement une discussion de groupe et utilisez comme d’habitude.

---

## 🧭 Modes de fonctionnement

### **Mode automatique (par défaut)**

- **Comment ça marche :** utilise automatiquement le lorebook lié à votre chat actuel.
- **Idéal pour :** simplicité et rapidité. La plupart des utilisateurs devraient commencer ici.
- **Pour l’utiliser :** assurez-vous qu’un lorebook est sélectionné dans le menu déroulant “Chat Lorebooks” pour votre personnage ou votre discussion de groupe.

![Exemple de liaison de lorebook au chat](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/chatlorebook.png)

### **Mode création automatique de lorebook**

- **Comment ça marche :** crée et lie automatiquement un nouveau lorebook lorsqu’il n’en existe aucun, en utilisant votre modèle de nommage personnalisé.
- **Idéal pour :** nouveaux utilisateurs et configuration rapide. Parfait pour créer un lorebook en un clic.
- **Pour l’utiliser :**
  1. Activez “Auto-create lorebook if none exists” dans les paramètres de l’extension.
  2. Configurez votre modèle de nommage (par défaut : `LTM - {{char}} - {{chat}}`).
  3. Lorsque vous créez une mémoire sans lorebook lié, un lorebook est automatiquement créé et lié.
- **Placeholders du modèle :** `{{char}}` (nom du personnage), `{{user}}` (votre nom), `{{chat}}` (ID du chat)
- **Numérotation intelligente :** ajoute automatiquement des numéros (2, 3, 4...) si des noms en double existent.
- **Note :** ne peut pas être utilisé en même temps que le Mode lorebook manuel.

### **Mode lorebook manuel**

- **Comment ça marche :** vous permet de sélectionner un lorebook différent pour les mémoires, chat par chat, en ignorant le lorebook principal lié au chat.
- **Idéal pour :** utilisateurs avancés qui veulent diriger les mémoires vers un lorebook spécifique et séparé.
- **Pour l’utiliser :**
  1. Activez “Enable Manual Lorebook Mode” dans les paramètres de l’extension.
  2. La première fois que vous créez une mémoire dans un chat, il vous sera demandé de choisir un lorebook.
  3. Ce choix est sauvegardé pour ce chat spécifique jusqu’à ce que vous l’effaciez ou repassiez en Mode automatique.
- **Note :** ne peut pas être utilisé en même temps que le Mode création automatique de lorebook.

---

### 🎡 Trackers & Side Prompts

> 📘 Les Side Prompts ont leur propre guide : [Guide des Side Prompts](side-prompts-fr.md). Utilisez-le pour les sets, les macros, les exemples et le dépannage.
> 🎡 Besoin du chemin exact dans l’interface ? Consultez le [guide Scribe pour activer les Side Prompts](https://scribehow.com/viewer/How_to_Enable_Side_Prompts_in_Memory_Books__fif494uSSjCmxE2ZCmRGxQ).

Les Side Prompts sont des exécutions de prompt STMB séparées, utilisées pour maintenir l’état continu du chat. Utilisez-les pour des trackers et des notes de support qui ne devraient pas alourdir la réponse normale du personnage, par exemple :

- 💰 Inventaire & ressources (“Quels objets l’utilisateur possède-t-il ?”)
- ❤️ Statut relationnel (“Que ressent X pour Y ?”)
- 📊 Stats du personnage (“Santé actuelle, compétences, réputation”)
- 🎯 Progression de quête (“Quels objectifs sont actifs ?”)
- 🌍 État du monde (“Qu’est-ce qui a changé dans le cadre ?”)

#### **Accès :** depuis les paramètres de Memory Books, cliquez sur “🎡 Trackers & Side Prompts”.

#### **Fonctionnalités :**

- Voir, créer, dupliquer, modifier, supprimer, exporter et importer des Side Prompts.
- Exécuter des Side Prompts manuellement, après une mémoire ou dans le cadre d’un Side Prompt Set.
- Utiliser les macros SillyTavern standard comme `{{user}}` et `{{char}}`.
- Utiliser des macros d’exécution comme `{{npc name}}` lorsqu’un prompt a besoin d’une valeur fournie au moment de l’exécution.
- Enregistrer la sortie du Side Prompt comme des entrées side-prompt séparées dans votre lorebook de mémoires.

#### **Astuces d’utilisation :**

- Copiez depuis les modèles intégrés lorsque vous créez un nouveau prompt.
- Les Side Prompts ne sont pas obligés de renvoyer du JSON. Le texte brut ou le Markdown convient.
- Les Side Prompts sont généralement mis à jour/écrasés ; les mémoires sont sauvegardées séquentiellement.
- La syntaxe manuelle est `/sideprompt "Name" {{macro}}="value" [X-Y]`.
- Utilisez des Side Prompt Sets lorsqu’un chat a besoin d’un bundle ordonné de trackers.
- Un Side Prompt Set sélectionné pour l’après-mémoire remplace les Side Prompts après mémoire activés individuellement pour ce chat.
- Bibliothèque supplémentaire de modèles de Side Prompts : [fichier JSON](../resources/SidePromptTemplateLibrary.json). Il suffit de l’importer pour l’utiliser.

---

## 🧹 Compaction

La compaction est un flux de relecture qui sert à rendre les entrées de lorebook gérées par STMB plus économes en tokens. Elle demande à l’IA de réécrire une entrée existante, puis affiche l’original et le brouillon compacté avant tout remplacement.

Vous pouvez l’ouvrir depuis la fenêtre principale de Memory Books avec **📝 Compaction**. Les longues entrées de clip peuvent aussi proposer un bouton **Compacter l’entrée** depuis le flux Clip.

#### Entrées éligibles

La compaction liste les entrées éligibles du Memory Book sélectionné :

- les entrées Clip marquées avec `[STMB Clip]`
- les entrées SidePrompt
- les entrées de mémoire STMB signalées par Memory Books

Les entrées ordinaires de lorebook qui ne sont pas gérées par STMB ne sont pas affichées.

#### Fonctionnement

1. Ouvrez Memory Books et cliquez sur **📝 Compaction**.
2. Choisissez un **Memory Book**. Si le chat actuel a déjà un Memory Book valide, STMB le présélectionne ; sinon, choisissez-en un dans le menu déroulant avec recherche.
3. Choisissez un **Profil de compaction**. Cela contrôle quelle connexion IA / quel modèle est utilisé pour la demande de compaction.
4. Facultatif : cliquez sur **Modifier le prompt de compaction** si vous voulez changer les instructions envoyées à l’IA.
5. Cliquez sur **Compacter l’entrée** à côté de l’entrée que vous voulez réécrire.
6. Comparez **Contenu original** et **Brouillon compacté**. STMB affiche les estimations de tokens pour les deux.
7. Modifiez le brouillon si nécessaire, puis choisissez **Remplacer par la version compactée**, **Copier le brouillon compacté** ou **Annuler**.

STMB ne remplace **pas** l’original automatiquement. L’entrée de lorebook ne change que si vous cliquez sur **Remplacer par la version compactée**.

#### Prompt de compaction

Le Prompt de compaction est modifiable. Le prompt par défaut demande à l’IA de préserver les faits importants, les noms, les pronoms, les macros, les en-têtes d’enveloppe et les marqueurs de fin, tout en supprimant les redondances et les formulations à faible valeur.

Placeholders pris en charge :

- `{{ENTRY_CONTENT}}` — le contenu actuel de l’entrée de lorebook. Ce placeholder est obligatoire.
- `{{ENTRY_KIND}}` — le type d’entrée, par exemple Clip, SidePrompt ou Mémoire.
- `{{ENTRY_TITLE}}` — le titre de l’entrée de lorebook.

Utilisez **Rétablir la valeur par défaut** dans l’éditeur de prompt si vous voulez restaurer le Prompt de compaction intégré.

#### Meilleurs cas d’usage

- longues entrées Clip
- entrées de tracker SidePrompt qui ont accumulé des notes répétées
- entrées de mémoire STMB utiles mais trop verbeuses
- entrées toujours actives qui commencent à gaspiller du contexte

#### À ne pas utiliser pour

- ajouter de nouveaux faits
- résumer le chat brut
- créer de nouvelles mémoires
- réécrire des entrées ordinaires de lorebook que STMB ne gère pas

---

### 🧠 Intégration Regex pour personnalisation avancée

- **Contrôle total sur le traitement du texte :** Memory Books s’intègre avec l’extension **Regex** de SillyTavern, ce qui permet d’appliquer de puissantes transformations de texte à deux étapes clés :
  1. **Génération du prompt :** modifiez automatiquement les prompts envoyés à l’IA en créant des scripts regex ciblant l’emplacement **User Input**.
  2. **Analyse de la réponse :** nettoyez, reformatez ou standardisez la réponse brute de l’IA avant son enregistrement en ciblant l’emplacement **AI Output**.
- **Support de la sélection multiple :** vous pouvez choisir plusieurs scripts pour le traitement sortant et entrant.
- **Comment ça marche :** activez `Use regex (advanced)` dans STMB, cliquez sur `📐 Configure regex…`, puis choisissez quels scripts STMB doit exécuter avant l’envoi à l’IA et avant l’analyse/l’enregistrement de la réponse.
- **Important :** la sélection Regex est contrôlée par STMB. Les scripts sélectionnés là s’exécuteront **même s’ils sont désactivés** dans l’extension Regex elle-même.

---

## 👤 Gestion des profils

- **Profils :** chaque profil inclut API, modèle, température, prompt/preset, format de titre et paramètres de lorebook.
- **Import/Export :** partagez les profils au format JSON.
- **Création de profil :** utilisez la popup d’options avancées pour enregistrer de nouveaux profils.
- **Surcharges par profil :** changez temporairement API/modèle/température pour la création de mémoire, puis restaurez vos paramètres d’origine.
- **Fournisseur/profil intégré :** STMB inclut une option obligatoire `Current SillyTavern Settings`, qui utilise directement votre connexion/configuration SillyTavern active.

---

## ⚙️ Paramètres & configuration

![Panneau principal des paramètres](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/Main.png)

### **Paramètres globaux**

[Courte présentation vidéo sur YouTube](https://youtu.be/mG2eRH_EhHs)

- **Manual Lorebook Mode :** active la sélection des lorebooks par chat.
- **Auto-create lorebook if none exists :** crée et lie automatiquement les lorebooks à l’aide de votre modèle de nommage.
- **Lorebook Name Template :** personnalise les noms des lorebooks créés automatiquement avec les placeholders `{{char}}`, `{{user}}`, `{{chat}}`.
- **Allow Scene Overlap :** autorise ou empêche les plages de mémoire qui se chevauchent.
- **Always Use Default Profile :** ignore les popups de confirmation.
- **Show memory previews :** active une popup d’aperçu pour relire et modifier les mémoires avant de les ajouter au lorebook.
- **Show Notifications :** active ou désactive les notifications toast.
- **Refresh Editor :** rafraîchit automatiquement l’éditeur de lorebook après la création d’une mémoire.
- **Max Response Tokens :** définit la longueur maximale de génération pour les résumés de mémoire.
- **Token Warning Threshold :** définit le seuil d’avertissement pour les grandes scènes.
- **Default Previous Memories :** nombre de mémoires précédentes à inclure comme contexte (0-7).
- **Auto-create memory summaries :** active la création automatique de mémoires à intervalles.
- **Auto-Summary Interval :** nombre de messages après lequel créer automatiquement un résumé de mémoire.
- **Auto-Summary Buffer :** retarde le résumé automatique d’un nombre configurable de messages.
- **Prompt for consolidation when a tier is ready :** affiche une confirmation oui/plus tard lorsqu’un niveau sélectionné a suffisamment d’entrées source éligibles à consolider.
- **Auto-Consolidation Tiers :** choisissez un ou plusieurs niveaux de résumé qui doivent déclencher la confirmation lorsqu’ils sont prêts. Prend actuellement en charge Arc jusqu’à Series.
- **Unhide hidden messages before memory generation :** peut exécuter `/unhide X-Y` avant de créer une mémoire.
- **Auto-hide messages after adding memory :** masque éventuellement tous les messages traités ou seulement la plage de mémoire la plus récente.
- **Use regex (advanced) :** active la fenêtre de sélection Regex de STMB pour le traitement sortant/entrant.
- **Memory Title Format :** choisissez ou personnalisez le format ; voir ci-dessous.

![Configuration de profil](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/Profile.png)

### **Champs du profil**

- **Name :** nom d’affichage.
- **API/Provider :** `Current SillyTavern Settings`, openai, claude, custom, full manual et autres fournisseurs pris en charge.
- **Model :** nom du modèle (par exemple, gpt-4, claude-3-opus).
- **Temperature :** 0.0–2.0.
- **Prompt or Preset :** personnalisé ou intégré.
- **Title Format :** modèle par profil.
- **Activation Mode :** Vectorized, Constant, Normal.
- **Position :** ↑Char, ↓Char, ↑EM, ↓EM, ↑AN, ↓AN, Outlet (et nom du champ).
- **Order Mode :** Auto/manuel.
- **Recursion :** prévenir/retarder jusqu’à récursion.

---

## 🏷️ Formatage des titres

Personnalisez les titres de vos entrées de lorebook avec un système de modèles puissant.

- **Placeholders :**
  - `{{title}}` - Le titre généré par l’IA (par exemple, “Une rencontre fatidique”).
  - `{{scene}}` - La plage de messages (par exemple, “Scene 15-23”).
  - `{{char}}` - Le nom du personnage.
  - `{{user}}` - Votre nom d’utilisateur.
  - `{{messages}}` - Le nombre de messages dans la scène.
  - `{{profile}}` - Le nom du profil utilisé pour la génération.
  - Placeholders de date/heure actuelle dans différents formats (par exemple, `August 13, 2025` pour la date, `11:08 PM` pour l’heure).
- **Numérotation automatique :** utilisez `[0]`, `[00]`, `(0)`, `{0}`, `#0`, et maintenant aussi les formes enveloppées comme `#[000]`, `([000])`, `{[000]}` pour une numérotation séquentielle avec zéros initiaux.
- **Formats personnalisés :** vous pouvez créer vos propres formats. Depuis la v4.5.1, tous les caractères Unicode imprimables sont autorisés dans les titres, y compris les emojis, CJK, caractères accentués et symboles. Seuls les caractères de contrôle Unicode sont bloqués.

---

## 🧵 Mémoires contextuelles

- **Inclure jusqu’à 7 mémoires précédentes** comme contexte pour une meilleure continuité.
- **L’estimation des tokens** inclut les mémoires contextuelles pour plus de précision.
- **Les options avancées** permettent de surcharger temporairement le comportement prompt/profil pour une seule génération de mémoire.

![Génération de mémoire avec contexte](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/context.png)

---

## 🎨 Retour visuel & accessibilité

- **États des boutons :**
  - Inactif, actif, sélection valide, dans la scène, traitement en cours.

![Sélection de scène complète montrant tous les états visuels](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/example.png)

- **Accessibilité :**
  - Navigation au clavier, indicateurs de focus, attributs ARIA, mouvement réduit et compatibilité mobile.

---

# FAQ

### Dois-je créer un lorebook séparé pour les mémoires, ou puis-je utiliser le même lorebook que celui que j’utilise déjà pour autre chose ?

Je recommande que votre lorebook de mémoires soit un livre séparé. Cela facilite l’organisation des mémoires par rapport aux autres entrées. Par exemple, vous pouvez l’ajouter à une discussion de groupe, l’utiliser dans un autre chat ou définir un budget individuel de lorebook via STLO.

### Dois-je utiliser les vecteurs ?

Vous pouvez, mais ce n’est pas obligatoire. Si vous n’utilisez pas l’extension de vecteurs (je ne l’utilise pas), cela fonctionne via les mots-clés. Tout cela est automatisé afin que vous n’ayez pas à réfléchir aux mots-clés à utiliser.

### Dois-je utiliser "Delay until recursion" si Memory Books est le seul lorebook ?

Non. S’il n’y a pas d’autre World Info ni d’autres lorebooks, sélectionner `Delay until recursion` peut empêcher la première boucle de se déclencher, ce qui fait que rien ne s’active. Si Memory Books est le seul lorebook, désactivez `Delay until recursion` ou assurez-vous de configurer au moins une World Info/un lorebook supplémentaire.

### Pourquoi l’IA ne voit-elle pas mes entrées ?

Vous devez d’abord vérifier que les entrées sont bien envoyées. J’aime utiliser [WorldInfo-Info](https://github.com/aikohanasaki/SillyTavern-WorldInfoInfo) pour ça.

Si les entrées se déclenchent et sont envoyées à l’IA, vous devrez probablement le dire plus directement à l’IA en OOC. Quelque chose comme : `[OOC: WHY are you not using the information you were given? Specifically: (whatever it was)]` 😁

---

# Dépannage

- **Je ne trouve pas Memory Books dans le menu Extensions !**
  Les paramètres se trouvent dans le menu Extensions (la baguette magique 🪄 à gauche de votre zone de saisie). Cherchez “Memory Books”.

![Emplacement des paramètres STMB](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/menu.png)

- **Aucun lorebook disponible ou sélectionné :**
  - En Mode manuel, sélectionnez un lorebook lorsque demandé.
  - En Mode automatique, liez un lorebook à votre chat.
  - Ou activez “Auto-create lorebook if none exists” pour la création automatique.

- **Erreur de validation du lorebook :**
  - Vous avez probablement supprimé le lorebook lié précédemment. Reliez simplement un nouveau lorebook. Il peut être vide.

- **Aucune scène sélectionnée :**
  - Marquez à la fois le point de début (►) et le point de fin (◄).

- **La scène chevauche une mémoire existante :**
  - Choisissez une plage différente ou activez “Allow Scene Overlap” dans les paramètres.

![Avertissement de chevauchement de scène](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/overlap.png)

- **L’IA n’a pas réussi à générer une mémoire valide :**
  - Utilisez un modèle qui prend en charge la sortie JSON.
  - Vérifiez votre prompt et les paramètres du modèle.

- **Seuil d’avertissement de tokens dépassé :**
  - Utilisez une scène plus petite ou augmentez le seuil.

- **Boutons chevrons manquants :**
  - Attendez que l’extension se charge ou actualisez la page.

- **Données du personnage non disponibles :**
  - Attendez que le chat/groupe soit complètement chargé.

---

## 📚 Augmenter la puissance avec Lorebook Ordering (STLO)

Pour une organisation avancée des mémoires et une intégration plus profonde à l’histoire, utilisez STMB avec [SillyTavern-LorebookOrdering (STLO)](https://github.com/aikohanasaki/SillyTavern-LorebookOrdering/blob/main/guides/STMB%20and%20STLO%20-%20French.md). Consultez le guide pour les meilleures pratiques, les instructions de configuration et les astuces.

---

## 📝 Politique de caractères (v4.5.1+)

- **Autorisés dans les titres :** tous les caractères Unicode imprimables sont autorisés, y compris les caractères accentués, les emojis, le CJK et les symboles.
- **Bloqués :** seuls les caractères de contrôle Unicode (U+0000–U+001F, U+007F–U+009F) sont bloqués ; ils sont supprimés automatiquement.

Consultez les [détails de la politique de caractères](../charset.md) pour des exemples et des notes de migration.

---

## 👨‍💻 Pour les développeurs

### Compiler l’extension

Cette extension utilise Bun pour la compilation. Le processus de compilation minifie et regroupe les fichiers source.

```sh
# Compiler l’extension
bun run build
```

### Git Hooks

Le projet inclut un hook de pré-commit qui compile automatiquement l’extension et inclut les artefacts compilés dans vos commits. Cela garantit que les fichiers compilés restent toujours synchronisés avec le code source.

**Pour installer le hook git :**

```sh
bun run install-hooks
```

Le hook fera ceci :

- Exécuter `bun run build` avant chaque commit
- Ajouter les artefacts compilés au commit
- Annuler le commit si la compilation échoue

---

*Développé avec amour en utilisant VS Code/Cline, des tests approfondis et les retours de la communauté.* 🤖💕
