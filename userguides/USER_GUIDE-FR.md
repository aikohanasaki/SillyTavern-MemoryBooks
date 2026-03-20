# 📕 ST Memory Books - Votre Assistant Mémoire IA pour le Chat

**Transformez vos conversations interminables en souvenirs organisés et consultables !**

Vous avez besoin que le bot se souvienne de certaines choses, mais la discussion est trop longue pour le contexte ? Vous voulez suivre automatiquement les points importants de l'intrigue sans prendre de notes manuellement ? ST Memory Books fait exactement cela : il surveille vos discussions et crée des résumés intelligents pour que vous ne perdiez plus jamais le fil de votre histoire.

(Vous cherchez des détails techniques sur les coulisses ? Peut-être préférez-vous [Comment fonctionne STMB](userguides\howSTMBworks-en.md).)

---

## 🚀 Démarrage Rapide (Votre premier souvenir en 5 minutes !)

**Nouveau sur ST Memory Books ?** Configurons votre première mémoire automatique en quelques clics :

### Étape 1 : Trouvez l'extension
- Cherchez l'icône de baguette magique (🪄) à côté de votre zone de saisie de chat.
- Cliquez dessus, puis cliquez sur **"Memory Books"**.
- Vous verrez le panneau de contrôle de ST Memory Books.

### Étape 2 : Activez la "Magie Automatique"
- Dans le panneau de contrôle, trouvez **"Auto-Summary"** (Résumé Automatique).
- Mettez-le sur **ON**.
- Réglez-le pour créer des souvenirs tous les **20-30 messages** (un bon point de départ).
- C'est tout ! 🎉

### Étape 3 : Discutez normalement
- Continuez à discuter comme d'habitude.
- Après 20-30 nouveaux messages, ST Memory Books va automatiquement :
  - Choisir les meilleures limites de scène.
  - Demander à votre IA d'écrire un résumé.
  - L'enregistrer dans votre collection de souvenirs.
  - Vous afficher une notification une fois terminé.

**Félicitations !** Vous disposez maintenant d'une gestion automatisée de la mémoire. Plus besoin d'oublier ce qui s'est passé il y a plusieurs chapitres !

---

## 💡 Ce que fait réellement ST Memory Books

Considérez ST Memory Books comme votre **bibliothécaire IA personnel** pour les conversations de chat :

### 🤖 **Résumés Automatiques**
*"Je ne veux pas y penser, je veux juste que ça marche"*
- Surveille votre chat en arrière-plan.
- Crée automatiquement des souvenirs tous les X messages.
- Parfait pour les longs roleplays, l'écriture créative ou les histoires en cours.

### ✋ **Création Manuelle de Souvenirs**
*"Je veux avoir le contrôle sur ce qui est sauvegardé"*
- Marquez les scènes importantes avec de simples boutons fléchés (► ◄).
- Créez des souvenirs à la demande pour les moments spéciaux.
- Idéal pour capturer les points clés de l'intrigue ou l'évolution des personnages.

### 📊 **Prompts Secondaires & Suivi Intelligent**
*"Je veux suivre les relations, les fils de l'intrigue ou les statistiques"*
- Des fragments de prompt réutilisables qui améliorent la génération de mémoire.
- Bibliothèque de modèles avec des traceurs prêts à l'emploi.
- Prompts IA personnalisés qui suivent tout ce que vous voulez.
- Mise à jour automatique des tableaux de scores, des statuts relationnels, des résumés d'intrigue.
- Exemples : "Qui aime qui ?", "Statut actuel de la quête", "Suivi de l'humeur du personnage".

### 📚 **Collections de Souvenirs (Lorebooks)**
*L'endroit où vivent tous vos souvenirs*
- Organisés et consultables automatiquement.
- Fonctionne avec le système de Lorebook intégré de SillyTavern.
- Votre IA peut faire référence aux souvenirs passés dans de nouvelles conversations.

---

## 🎯 Choisissez votre style

<details>
<summary><strong>🔄 "Régler et Oublier" (Recommandé pour les débutants)</strong></summary>

**Parfait si vous voulez :** Une automatisation sans intervention qui fonctionne tout simplement.

**Comment ça marche :**
1. Activez "Auto-Summary" dans les paramètres.
2. Choisissez la fréquence de création des souvenirs (tous les 20-50 messages fonctionne bien).
3. Continuez à discuter normalement - les souvenirs se créent automatiquement !

**Ce que vous obtenez :**
- Aucun travail manuel requis.
- Création de mémoire cohérente.
- Ne manquez jamais les moments importants de l'histoire.
- Fonctionne aussi bien dans les chats solo que de groupe.

**Conseil pro :** Commencez avec 30 messages, puis ajustez en fonction de votre style de chat. Les chats rapides peuvent nécessiter 50+, les chats lents et détaillés peuvent préférer 20.

</details>

<details>
<summary><strong>✋ "Contrôle Manuel" (Pour une création de mémoire sélective)</strong></summary>

**Parfait si vous voulez :** Décider exactement ce qui devient un souvenir.

**Comment ça marche :**
1. Cherchez les petits boutons fléchés (► ◄) sur vos messages de chat.
2. Cliquez sur ► sur le premier message d'une scène importante.
3. Cliquez sur ◄ sur le dernier message de cette scène.
4. Ouvrez Memory Books (🪄) et cliquez sur "Create Memory" (Créer un souvenir).

**Ce que vous obtenez :**
- Contrôle total sur le contenu de la mémoire.
- Parfait pour capturer des moments spécifiques.
- Idéal pour les scènes complexes qui nécessitent des limites précises.

**Conseil pro :** Les boutons fléchés apparaissent quelques secondes après le chargement d'un chat. Si vous ne les voyez pas, attendez un instant ou actualisez la page.

</details>

<details>
<summary><strong>⚡ "Utilisateur Expert" (Commandes Slash)</strong></summary>

**Parfait si vous voulez :** Des raccourcis clavier et des fonctionnalités avancées.

**Commandes essentielles :**
- `/scenememory 10-25` - Créer un souvenir à partir des messages 10 à 25.
- `/creatememory` - Créer un souvenir à partir de la scène actuellement marquée.
- `/nextmemory` - Résumer tout ce qui s'est passé depuis le dernier souvenir.
- `/sideprompt "Relationship Tracker" {{macro}}="value"` - Lancer un traceur personnalisé.

**Ce que vous obtenez :**
- Création de mémoire ultra-rapide.
- Opérations par lots.
- Intégration avec des flux de travail personnalisés.

</details>

---

## 🌈 Résumés d'Arc (Arc Summaries)

Les Résumés d'Arc sont créés manuellement. Rien n'est résumé ou supprimé à moins que vous ne choisissiez de le faire.

### Q : Que sont les Résumés d'Arc ?

**R :** Les Résumés d'Arc aident à garder les longues histoires gérables. Avec le temps, vous pouvez accumuler de nombreuses entrées de mémoire. Certaines d'entre elles décrivent la même partie de l'histoire.
Un Résumé d'Arc vous permet de combiner plusieurs anciens souvenirs en un seul résumé plus court.

### Q : Que se passe-t-il lorsque je fais un Résumé d'Arc ?

**R :** Lorsque vous créez un Résumé d'Arc :

* Les souvenirs sélectionnés sont combinés en une nouvelle entrée.
* Le nouveau résumé remplace ces anciens souvenirs.
  *(les anciens souvenirs peuvent être masqués automatiquement — pas supprimés)*
* L'histoire est toujours mémorisée, mais avec moins de tokens.

### Q : Pourquoi faire des Résumés d'Arc ?

**R :** Les Résumés d'Arc sont utiles lorsque :

* Votre liste de souvenirs devient très longue.
* Les anciens souvenirs ne sont plus nécessaires dans tous leurs détails.
* Vous voulez réduire l'utilisation de tokens dans les longs chats.

### Q : Comment faire un Résumé d'Arc ?

**R :** Pour créer un Résumé d'Arc :

1. Cliquez sur **🌈 Consolidate Memories into Arcs** au bas de la fenêtre contextuelle principale de STMB.
2. Choisissez un type d'arc :

   * **Multi-Arc**
     L'IA recherche les pauses naturelles et crée plusieurs arcs.
     Vous pouvez définir un nombre minimum de souvenirs par arc.
     *Fonctionne mieux avec des modèles puissants (GPT, Gemini, Sonnet). Les modèles locaux peuvent avoir du mal.*
   * **Single Arc (Arc Unique)**
     L'IA combine tous les souvenirs sélectionnés en un seul arc.
     Les arcs précédents sont inclus pour aider à garder l'histoire cohérente.
   * **Tiny (Minuscule)**
     Une option plus rapide et plus simple qui peut mieux fonctionner avec les modèles locaux, mais les résultats peuvent être moins détaillés.
3. Sélectionnez les souvenirs que vous souhaitez inclure.
4. Cliquez sur **Run** et attendez que l'analyse de l'arc soit terminée.

---

## 🎨 Traceurs, Prompts Secondaires & Modèles (Fonctionnalité Avancée)

Les **Side Prompts** (Prompts Secondaires) sont des traceurs d'arrière-plan qui aident à maintenir les informations de l'histoire en cours.
Ils créent des entrées Side Prompt séparées dans le lorebook et s'exécutent parallèlement à la création de mémoire. Considérez-les comme des **assistants qui surveillent votre histoire et maintiennent certains détails à jour**.
Les macros ST standard comme `{{user}}` et `{{char}}` sont développées dans `Prompt` et `Response Format`. Les macros non standard `{{...}}` deviennent des entrées obligatoires pour l'exécution manuelle.

### 🚀 **Démarrage Rapide avec les Modèles**

1. Ouvrez les paramètres de Memory Books.
2. Cliquez sur **Side Prompts**.
3. Parcourez la **bibliothèque de modèles** (template library) et choisissez ce qui convient à votre histoire :

   * **Character Development Tracker** – Suit les changements de personnalité et la croissance.
   * **Relationship Dynamics** – Suit les relations entre les personnages.
   * **Plot Thread Tracker** – Suit les intrigues en cours.
   * **Mood & Atmosphere** – Suit le ton émotionnel.
   * **World Building Notes** – Suit les détails du cadre et le lore.
4. Activez les modèles que vous souhaitez (vous pouvez les personnaliser plus tard).
5. Si le modèle contient des macros d'exécution personnalisées, il ne s'exécutera pas automatiquement et devra être lancé manuellement avec `/sideprompt`.

### ⚙️ **Comment fonctionnent les Prompts Secondaires**

* **Traceurs d'arrière-plan** : Ils s'exécutent discrètement et mettent à jour les informations au fil du temps.
* **Non-intrusifs** : Ils ne modifient pas vos paramètres principaux d'IA ou les prompts de personnage.
* **Contrôle par chat** : Différents chats peuvent utiliser différents traceurs.
* **Basé sur des modèles** : Utilisez des modèles intégrés ou créez les vôtres.
* **Automatique ou Manuel** : Les modèles standards peuvent s'exécuter automatiquement ; ceux qui contiennent des macros d'exécution personnalisées sont réservés au mode manuel.
* **Prise en charge des macros** : `Prompt` et `Response Format` développent les macros ST standard comme `{{user}}` et `{{char}}`.
* **Contrôles de sécurité** : Si un modèle contient des macros d'exécution personnalisées, STMB supprime `onInterval` et `onAfterMemory` lors de la sauvegarde/import et affiche un avertissement.

Cela rend le comportement de déclenchement compréhensible sans termes techniques.

### 🛠️ **Gérer les Prompts Secondaires**

* **Side Prompts Manager** : Créez, modifiez, dupliquez et organisez les traceurs.
* **Enable / Disable** : Activez ou désactivez les traceurs à tout moment.
* **Import / Export** : Partagez des modèles ou sauvegardez-les.
* **Status View** : Voyez quels traceurs sont actifs dans le chat actuel.

La "Status View" (Vue d'état) est plus claire que "Live Preview" pour les lecteurs non anglophones.

### 💡 **Exemples de Modèles**

* Bibliothèque de modèles de Side Prompts (importez ce JSON) :
  [SidePromptTemplateLibrary.json](/resources/SidePromptTemplateLibrary.json)

Exemples d'idées de prompts :

* "Suivre les dialogues importants et les interactions entre les personnages"
* "Tenir à jour le statut actuel de la quête"
* "Noter les nouveaux détails de construction du monde (world-building) lorsqu'ils apparaissent"
* "Suivre la relation entre le Personnage A et le Personnage B"

### 🔧 **Créer des Prompts Secondaires Personnalisés**

1. Ouvrez le **Side Prompts Manager**.
2. Cliquez sur **Create New**.
3. Écrivez une instruction courte et claire.
   *(exemple : "Toujours noter quel temps il fait dans chaque scène")*
4. Ajoutez si nécessaire des macros ST standard ou des macros d'exécution au format `{{macro}}="value"`.
5. Sauvegardez et activez-le.
6. Le traceur mettra désormais à jour cette information au fil du temps si les déclencheurs automatiques restent activés.

### 💬 **Conseil Pro**

Les Prompts Secondaires fonctionnent mieux lorsqu'ils sont **petits et ciblés**.
Au lieu de "tout suivre", essayez "suivre la tension romantique entre les personnages principaux".

---

### 🧠 Contrôle Avancé du Texte avec l'Extension Regex

**Vous voulez un contrôle ultime sur le texte envoyé et reçu de l'IA ?** ST Memory Books s'intègre désormais parfaitement avec l'extension officielle **Regex**, vous permettant de transformer automatiquement le texte à l'aide de règles personnalisées.

**Support de la Multi-Sélection :** Vous pouvez maintenant sélectionner plusieurs scripts regex dans l'extension Regex. Tous les scripts activés seront appliqués dans l'ordre à chaque étape (Prompt et Réponse), permettant des transformations puissantes et flexibles.

C'est une fonctionnalité avancée parfaite pour les utilisateurs qui veulent :
- Nettoyer automatiquement les phrases répétitives ou les artefacts de la réponse d'une IA.
- Reformater des parties de la transcription du chat avant que l'IA ne la voie.
- Standardiser la terminologie ou les manies des personnages à la volée.

#### **Comment ça marche : Deux points d'ancrage (Hooks) simples**

L'intégration fonctionne en appliquant vos scripts regex activés à deux points critiques. Vous contrôlez quels scripts s'exécutent en définissant leur **Placement** dans l'éditeur de l'extension Regex :

1.  **Modification du Prompt (Texte Sortant)**
    * **Placement à utiliser** : `User Input`
    * **Ce que ça fait** : Intercepte le prompt entièrement assemblé (y compris l'historique du chat, les instructions système, etc.) juste avant qu'il ne soit envoyé à l'IA pour la mémoire ou la génération de prompt secondaire.
    * **Exemple d'utilisation** : Vous pourriez créer un script pour remplacer automatiquement toutes les instances du surnom d'un personnage par son nom complet, assurant que l'IA a le bon contexte.

2.  **Modification de la Réponse (Texte Entrant)**
    * **Placement à utiliser** : `AI Output`
    * **Ce que ça fait** : Intercepte la réponse brute de l'IA *avant* qu'elle ne soit analysée ou enregistrée comme souvenir.
    * **Exemple d'utilisation** : Si votre modèle d'IA inclut souvent des phrases répétitives comme *"En tant que grand modèle de langage..."* dans ses résumés, vous pouvez créer un script regex pour supprimer automatiquement cette phrase de chaque souvenir généré.

#### **Exemple de démarrage rapide : Nettoyer les réponses de l'IA**

Disons que votre modèle d'IA ajoute constamment `(OOC : J'espère que ce résumé est utile !)` à ses générations de mémoire. Voici comment le supprimer automatiquement :

1.  **Allez dans l'extension Regex** : Ouvrez le menu principal des extensions de SillyTavern et allez dans **Regex**.
2.  **Créez un nouveau Script** : Cliquez sur "Open Regex Editor" pour créer un nouveau script regex.
3.  **Configurez le Script** :
    * **Script Name** : `Clean OOC Notes`
    * **Find Regex** : `/\\(OOC:.*?\\)/g` (Ceci trouve le texte "(OOC: ...)" et tout ce qu'il contient).
    * **Replace String** : Laissez vide pour supprimer le texte correspondant.
    * **Affects (Placement)** : Décochez toutes les cases sauf **AI Output**. C'est l'étape la plus importante !
    * **Activez le Script** : Assurez-vous que le script n'est pas désactivé.
4.  **Sauvegardez et c'est fini !**

Maintenant, chaque fois que ST Memory Books reçoit une réponse de l'IA, ce script s'exécutera automatiquement, nettoyant le texte indésirable avant que le souvenir ne soit enregistré dans votre Lorebook.

---

## ⚙️ Les paramètres qui comptent vraiment

Ne vous inquiétez pas, vous n'avez pas besoin de tout configurer ! Voici les paramètres qui font la plus grande différence :

### 🎛️ **Fréquence du Résumé Automatique (Auto-Summary)**
- **20-30 messages** : Idéal pour les chats détaillés et plus lents.
- **40-60 messages** : Parfait pour les conversations plus rapides et pleines d'action.
- **80+ messages** : Pour les chats de groupe très rapides ou les conversations décontractées.

### 📝 **Aperçus de Mémoire (Memory Previews)**
- Activez ceci (ON) pour examiner les souvenirs avant qu'ils ne soient enregistrés.
- Vous pouvez modifier, approuver ou régénérer si l'IA a manqué quelque chose d'important.
- Recommandé pour les intrigues importantes.

### 🏷️ **Titres de Mémoire**
- Personnalisez la façon dont vos souvenirs sont nommés.
- Utilisez `{{title}}` pour les titres générés par l'IA, `{{scene}}` pour les numéros de message.
- Exemple : `"Chapitre {{title}} ({{scene}})"` devient `"Chapitre La Grande Évasion (Scène 45-67)"`.

### 📚 **Collections de Mémoire** (Lorebooks)
- **Mode Auto** : Utilise la collection de mémoire par défaut de votre chat (le plus simple).
- **Mode Manuel** : Choisissez une collection spécifique pour chaque chat (pour l'organisation).
- **Auto-create** : Crée automatiquement de nouvelles collections (bon pour les nouveaux personnages).

---

## 🔧 Dépannage (Quand ça ne marche pas)

### "Je ne vois pas l'option Memory Books !"
- Vérifiez que l'extension est installée et activée.
- Cherchez l'icône de la baguette magique (🪄) à côté de votre saisie de chat.
- Essayez d'actualiser la page.

### "Les boutons fléchés (► ◄) n'apparaissent pas !"
- Attendez 3-5 secondes après le chargement d'un chat - ils ont besoin de temps pour apparaître.
- S'ils sont toujours manquants, actualisez la page.
- Assurez-vous que ST Memory Books est activé dans les extensions.

### "Le Résumé Automatique ne fonctionne pas !"
- Vérifiez que "Auto-Summary" est activé dans les paramètres de Memory Books.
- L'intervalle de messages a-t-il été atteint ? Le résumé automatique attend suffisamment de nouveaux messages.
- Si vous avez reporté le résumé automatique, il peut attendre un certain nombre de messages.
- Le résumé automatique ne traite que les nouveaux messages depuis la *dernière* mémoire. Si vous avez supprimé d'anciens souvenirs, il ne revient pas en arrière.

### "J'ai des erreurs concernant des Lorebooks manquants !"
- Allez dans les paramètres de Memory Books.
- Liez un lorebook à votre chat (Mode Automatique) ou activez "Auto-create lorebook if none exists" (Créer automatiquement un lorebook s'il n'en existe pas).

### "Parfois ça échoue sans raison !"
- Assurez-vous que votre longueur de réponse maximale (Max Response Length) dans les préréglages SillyTavern est réglée sur un nombre assez grand. Aiko recommande au moins 2000 tokens (Aiko en utilise 4000).
- Les messages d'erreur sont maintenant plus détaillés, mais si vous rencontrez toujours des problèmes, veuillez contacter Aiko sur Github ou Discord.

### "Mes prompts personnalisés ne fonctionnent pas bien !"
- Vérifiez le "Summary Prompt Manager" dans les paramètres de Memory Books.
- Assurez-vous que votre prompt demande à l'IA de répondre au **format JSON** (par exemple, `{ "title": "...", "content": "..." }`).

---

## 🚫 Ce que ST Memory Books ne fait pas

- **Ce n'est pas un éditeur général de Lorebook :** Ce guide se concentre sur les entrées créées par STMB. Pour l'édition générale de Lorebook, utilisez l'éditeur de Lorebook intégré à SillyTavern.

---

## 💡 Obtenir de l'aide et plus d'infos

- **Infos plus détaillées :** [readme.md](readme.md)
- **Dernières mises à jour :** [changelog.md](changelog.md)
- **Convertir d'anciens lorebooks :** [lorebookconverter.html](lorebookconverter.html)
- **Support communautaire :** Rejoignez la communauté SillyTavern sur Discord ! (Cherchez le fil 📕ST Memory Books ou envoyez un MP à @tokyoapple pour une aide directe).
- **Bugs/Fonctionnalités :** Vous avez trouvé un bug ou avez une idée géniale ? Ouvrez un ticket GitHub dans ce dépôt.

---

### 📚 Boostez vos possibilités avec Lorebook Ordering (STLO)

Pour une organisation avancée de la mémoire et une intégration plus profonde de l'histoire, nous recommandons fortement d'utiliser STMB avec [SillyTavern-LorebookOrdering (STLO)](https://github.com/aikohanasaki/SillyTavern-LorebookOrdering/blob/main/guides/STMB%20and%20STLO%20-%20English.md). Consultez le guide pour les meilleures pratiques, les instructions d'installation et des astuces !
