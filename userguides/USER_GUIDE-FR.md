# 📕 ST Memory Books - Votre Assistant Mémoire IA pour le Chat

**Transformez vos conversations interminables en souvenirs organisés et consultables !**

Vous avez besoin que le bot se souvienne de certaines choses, mais la discussion est trop longue pour le contexte ? Vous voulez suivre automatiquement les points importants de l'intrigue sans prendre de notes manuellement ? ST Memory Books fait exactement cela : il surveille vos discussions et crée des résumés intelligents pour que vous ne perdiez plus jamais le fil de votre histoire.

(Vous cherchez des détails techniques sur les coulisses ? Peut-être préférez-vous [Comment fonctionne STMB](howSTMBworks-fr.md).)

---

## 📑 Table des matières

- [Démarrage rapide](#-démarrage-rapide-votre-premier-souvenir-en-5-minutes)
- [Ce que fait ST Memory Books](#-ce-que-fait-st-memory-books)
- [Choisir votre style](#-choisir-votre-style)
- [Économie de tokens](#-conomie-de-tokens-masquer--afficher)
- [Consolidation des résumés](#-consolidation-des-rsumes)
- [Side Prompts et modèles](#-side-prompts-et-modles)
- [Regex](#-regex)
- [Réglages importants](#-rglages-importants)
- [Dépannage](#-dpannage)
- [Aide et infos](#-aide-et-infos)

---

## 🚀 Démarrage Rapide (Votre premier souvenir en 5 minutes !)

1. Ouvrez Memory Books dans le menu des extensions.
2. Activez **Créer des résumés de mémoire automatiques**.
3. Réglez **Intervalle d'Auto-Résumé** autour de `20-30`.
4. Gardez **Tampon d'Auto-Résumé** faible au début, par exemple `0-2`.
5. Créez d'abord une mémoire manuelle pour « amorcer » le chat.

---

## 💡 Ce que fait ST Memory Books

### Résumés automatiques

STMB surveille votre chat en arrière-plan et crée des mémoires à intervalles réguliers.

### Création manuelle

Vous pouvez marquer une scène avec les flèches (► ◄) puis créer une mémoire uniquement pour cette scène.

### Side Prompts

Les Side Prompts agissent comme des traceurs pour les relations, les quêtes, l'humeur ou l'état du monde.

---

## 🎯 Choisissez votre style

### « Régler et oublier »

1. Activez `Créer des résumés de mémoire automatiques`.
2. Choisissez `Intervalle d'Auto-Résumé`.
3. Si besoin, ajoutez un petit `Tampon d'Auto-Résumé`.

### Contrôle manuel

1. Marquez le début et la fin de la scène avec les flèches.
2. Ouvrez Memory Books.
3. Cliquez sur `Create Memory`.

### Commandes slash

* `/creatememory` - créer une mémoire à partir de la scène marquée
* `/scenememory X-Y` - créer une mémoire sur une plage de messages
* `/nextmemory` - prendre les messages depuis la dernière mémoire
* `/sideprompt "Name" {{macro}}="value" [X-Y]` - lancer un Side Prompt
* `/sideprompt-on "Name"` ou `/sideprompt-off "Name"` - activer ou désactiver un Side Prompt
* `/stmb-set-highest <N|none>` - déplacer la base de l'auto-summary

---

## 🙈 Économie de tokens : masquer / afficher

Masquer les messages ne les supprime pas. Ils restent dans le chat et dans le lorebook, mais ne sont plus envoyés directement à l'IA.

### Quand c'est utile

* le chat devient très long
* les messages ont déjà été transformés en mémoire
* vous voulez alléger l'affichage

### Masquage automatique

* `Ne pas masquer automatiquement` - rien ne se masque automatiquement
* `Masquer automatiquement tous les messages jusqu'à la dernière mémoire` - masque tout ce qui est déjà couvert
* `Masquer automatiquement uniquement les messages de la dernière mémoire` - masque seulement la dernière plage traitée

### Affichage avant génération

`Afficher les messages cachés pour la génération (exécute /unhide X-Y)` exécute temporairement `/unhide X-Y` avant la création de la mémoire.

### Réglage de départ

* `Masquer automatiquement uniquement les messages de la dernière mémoire`
* laisser `2` messages visibles
* activer `Afficher les messages cachés pour la génération (exécute /unhide X-Y)`

---

## 🌈 Consolidation des résumés

La consolidation aide à garder les longues histoires gérables en compressant d'anciens souvenirs STMB en résumés de niveau supérieur.

### Qu'est-ce que c'est ?

STMB peut combiner des souvenirs ou des résumés existants en une entrée plus compacte. Le premier niveau est `Arc`, puis viennent `Chapter`, `Book`, `Legend`, `Series` et `Epic`.

### Quand l'utiliser ?

* votre liste de souvenirs devient très longue
* les anciens souvenirs n'ont plus besoin d'un détail scène par scène
* vous voulez réduire les tokens sans perdre la continuité

### Est-ce automatique ?

Non. La consolidation nécessite toujours une confirmation.

* vous pouvez ouvrir `Consolider les mémoires` manuellement
* STMB peut afficher une confirmation quand un niveau atteint son minimum
* choisir `Yes` ouvre seulement la fenêtre de consolidation

### Qu'est-ce qui est consolidé ?

* les souvenirs STMB normaux
* les résumés de niveau supérieur
* les Side Prompts ne sont pas intégrés dans Arc/Chapter

### Comment l'utiliser ?

1. Cliquez sur `Consolider les mémoires`
2. Choisissez le niveau cible
3. Sélectionnez les entrées source
4. Décidez si vous voulez désactiver les sources après création
5. Cliquez sur `Run`

Si l'IA renvoie une mauvaise réponse de consolidation, vous pouvez la relire et la corriger avant de valider à nouveau.

---

## 🎨 Side Prompts et modèles

Les Side Prompts sont des traceurs d'arrière-plan qui créent des entrées séparées dans le lorebook et s'exécutent en parallèle avec la création de mémoire.

### Comportement

* `Prompt`, `Response Format` et `Title` prennent en charge les macros ST standard
* les macros `{{...}}` personnalisées deviennent obligatoires pour l'exécution manuelle
* les Side Prompts peuvent renvoyer du texte brut, le JSON n'est pas obligatoire
* les Side Prompts mettent à jour une même entrée au lieu de créer une nouvelle séquence de mémoires

### Important

Si un modèle contient des macros runtime personnalisées, il devient manuel uniquement.

### `/sideprompt`

* `X-Y` est optionnel
* sans plage, STMB utilise les messages depuis le dernier point d'actualisation de ce Side Prompt

---

## 🧠 Regex

STMB peut exécuter des scripts Regex sélectionnés avant l'envoi à l'IA et avant l'enregistrement du résultat.

### À quoi ça sert ?

* nettoyer les répétitions dans les réponses IA
* normaliser les noms ou les termes
* ajuster le texte avant que STMB ne le parse ou l'aperçoive

### Comment ça marche

1. Créez vos scripts dans l'extension `Regex`.
2. Activez `Utiliser regex (avancé)` dans STMB.
3. Cliquez sur `📐 Configurer regex…`.
4. Choisissez les scripts à exécuter avant l'envoi et avant l'enregistrement.

### Important

* le choix Regex pour STMB est contrôlé dans STMB
* un script peut s'exécuter même s'il est désactivé dans Regex
* STMB prend en charge la multi-sélection pour le traitement sortant et entrant

---

## ⚙️ Réglages importants

Ce n'est pas la documentation complète des réglages. Pour la liste détaillée, utilisez [readme.md](readme.md).

* `Créer des résumés de mémoire automatiques` - active la création automatique de mémoires
* `Intervalle d'Auto-Résumé` et `Tampon d'Auto-Résumé` - contrôlent le moment de création
* `Show memory previews` - permet de vérifier/modifier la réponse IA avant sauvegarde
* `Demander une consolidation lorsqu'un niveau est prêt` et `Niveaux d'auto-consolidation` - signalent les opportunités de consolidation
* `Activer le Mode Manuel du Lorebook` et `Créer le lorebook s'il n'existe pas` - contrôlent où les souvenirs sont enregistrés
* `Utiliser regex (avancé)` - ouvre la sélection Regex gérée par STMB
* `Paramètres SillyTavern Actuels` - utilise directement votre connexion ST active

---

## 🔧 Dépannage

Ce n'est pas la matrice complète de dépannage. Pour la liste détaillée, utilisez [readme.md](readme.md).

* Vérifiez que STMB est activé et que l'entrée `Memory Books` apparaît dans le menu des extensions
* Si l'auto-summary ne se déclenche pas, créez d'abord une mémoire manuelle et vérifiez interval/buffer
* Si une mémoire ne peut pas être enregistrée, assurez-vous qu'un lorebook est lié ou que `Créer le lorebook s'il n'existe pas` est activé
* Si Regex se comporte bizarrement, vérifiez la sélection dans `📐 Configurer regex…`
* Si la consolidation ne se propose pas, vérifiez `Demander une consolidation lorsqu'un niveau est prêt` et `Niveaux d'auto-consolidation`

---

## 💡 Aide et infos

* [readme.md](readme.md)
* [changelog.md](changelog.md)
* [Comment ça fonctionne (technique)](howSTMBworks-fr.md)

### 📚 Boostez vos possibilités avec STLO

Pour une organisation avancée de la mémoire et une intégration plus profonde de l'histoire, nous recommandons fortement d'utiliser STMB avec [SillyTavern-LorebookOrdering (STLO)](https://github.com/aikohanasaki/SillyTavern-LorebookOrdering/blob/main/guides/STMB%20and%20STLO%20-%20English.md).
