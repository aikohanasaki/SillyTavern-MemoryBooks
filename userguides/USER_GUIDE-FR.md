# 📕 ST Memory Books - Votre Assistant de Mémoire pour Chat IA

**Transformez vos conversations interminables en souvenirs organisés et consultables !**

Vous avez besoin que le bot se souvienne de certaines choses, mais la conversation est trop longue pour le contexte ? Vous voulez suivre automatiquement les points importants de l'intrigue sans prendre de notes manuellement ? ST Memory Books fait exactement cela : il surveille vos chats et crée des résumés intelligents pour que vous ne perdiez plus jamais le fil de votre histoire.

(Vous cherchez des détails techniques sur les coulisses ? Peut-être préférerez-vous [Comment fonctionne STMB](userguides\howSTMBworks-en.md) (en anglais).)

---

## 🚀 Démarrage Rapide (Votre premier souvenir en 5 minutes !)

**Nouveau sur ST Memory Books ?** Configurons votre premier souvenir automatique en quelques clics :

### Étape 1 : Trouver l'Extension
- Cherchez l'icône de la baguette magique (🪄) à côté de votre zone de saisie de chat.
- Cliquez dessus, puis cliquez sur **"Memory Books"**.
- Vous verrez le panneau de contrôle de ST Memory Books.

### Étape 2 : Activer l'Auto-Magie
- Dans le panneau de contrôle, trouvez **"Auto-Summary"** (Résumé Auto).
- Mettez-le sur **ON** (Activé).
- Réglez-le pour créer des souvenirs tous les **20-30 messages** (un bon point de départ).
- C'est tout ! 🎉

### Étape 3 : Discutez Normalement
- Continuez à discuter comme d'habitude.
- Après 20-30 nouveaux messages, ST Memory Books va automatiquement :
  - Choisir les meilleures limites de scène.
  - Demander à votre IA d'écrire un résumé.
  - L'enregistrer dans votre collection de souvenirs.
  - Vous afficher une notification une fois terminé.

**Félicitations !** Vous avez maintenant une gestion automatisée de la mémoire. Fini l'oubli de ce qui s'est passé il y a plusieurs chapitres !

---

## 💡 Ce que fait réellement ST Memory Books

Considérez ST Memory Books comme votre **bibliothécaire IA personnel** pour vos conversations :

### 🤖 **Résumés Automatiques**
*"Je ne veux pas y penser, je veux juste que ça marche"*
- Surveille votre chat en arrière-plan.
- Crée automatiquement des souvenirs tous les X messages.
- Parfait pour les longs jeux de rôle (RP), l'écriture créative ou les histoires en cours.

### ✋ **Création Manuelle de Souvenirs**
*"Je veux contrôler ce qui est sauvegardé"*
- Marquez les scènes importantes avec de simples boutons fléchés (► ◄).
- Créez des souvenirs à la demande pour des moments spéciaux.
- Idéal pour capturer les points clés de l'intrigue ou le développement des personnages.

### 📊 **Side Prompts & Traceurs Intelligents**
*"Je veux suivre les relations, les fils de l'intrigue ou des statistiques"*
- Des fragments de prompt réutilisables qui améliorent la génération de souvenirs.
- Bibliothèque de modèles avec des traceurs prêts à l'emploi.
- Prompts IA personnalisés pour suivre tout ce que vous voulez.
- Mise à jour automatique des tableaux de scores, statuts relationnels, résumés d'intrigue.
- Exemples : "Qui aime qui ?", "Statut actuel de la quête", "Suivi de l'humeur du personnage".

### 📚 **Collections de Souvenirs (Lorebooks)**
*Là où vivent tous vos souvenirs*
- Organisés et consultables automatiquement.
- Fonctionne avec le système de "Lorebook" intégré à SillyTavern.
- Votre IA peut référencer des souvenirs passés dans de nouvelles conversations.

---

## 🎯 Choisissez Votre Style

<details>
<summary><strong>🔄 "Réglez et Oubliez" (Recommandé pour les débutants)</strong></summary>

**Parfait si vous voulez :** Une automatisation sans intervention qui fonctionne tout simplement.

**Comment ça marche :**
1. Activez "Auto-Summary" dans les paramètres.
2. Choisissez la fréquence de création des souvenirs (tous les 20-50 messages fonctionne bien).
3. Continuez à discuter normalement - les souvenirs se créent automatiquement !

**Ce que vous obtenez :**
- Aucun travail manuel requis.
- Création de souvenirs cohérente.
- Ne manquez jamais les moments importants de l'histoire.
- Fonctionne aussi bien dans les chats individuels que de groupe.

**Conseil de pro :** Commencez avec 30 messages, puis ajustez en fonction de votre style de chat. Les chats rapides peuvent nécessiter 50+, les chats détaillés et lents peuvent préférer 20.

</details>

<details>
<summary><strong>✋ "Contrôle Manuel" (Pour une mémoire sélective)</strong></summary>

**Parfait si vous voulez :** Décider exactement ce qui devient un souvenir.

**Comment ça marche :**
1. Cherchez les petits boutons fléchés (► ◄) sur vos messages de chat.
2. Cliquez sur ► sur le premier message d'une scène importante.
3. Cliquez sur ◄ sur le dernier message de cette scène.
4. Ouvrez Memory Books (🪄) et cliquez sur "Create Memory" (Créer un souvenir).

**Ce que vous obtenez :**
- Contrôle total sur le contenu du souvenir.
- Parfait pour capturer des moments spécifiques.
- Idéal pour les scènes complexes nécessitant des limites précises.

**Conseil de pro :** Les boutons fléchés apparaissent quelques secondes après le chargement d'un chat. Si vous ne les voyez pas, attendez un moment ou rafraîchissez la page.

</details>

<details>
<summary><strong>⚡ "Utilisateur Avancé" (Commandes Slash)</strong></summary>

**Parfait si vous voulez :** Des raccourcis clavier et des fonctionnalités avancées.

**Commandes essentielles :**
- `/scenememory 10-25` - Créer un souvenir à partir des messages 10 à 25.
- `/creatememory` - Créer un souvenir à partir de la scène actuellement marquée.
- `/nextmemory` - Résumer tout depuis le dernier souvenir.
- `/sideprompt "Relationship Tracker"` - Exécuter un traceur personnalisé.

**Ce que vous obtenez :**
- Création de souvenirs ultra-rapide.
- Opérations par lots.
- Intégration avec des flux de travail personnalisés.

</details>

---

## 🎨 Side Prompts & Modèles (Fonctionnalité Avancée)

Les **Side Prompts** (Invites Secondaires) sont des fragments de prompt réutilisables qui améliorent la génération de votre mémoire sans modifier vos paramètres principaux d'IA. Considérez-les comme des "modules complémentaires" qui donnent à vos souvenirs une focalisation supplémentaire ou des capacités de suivi.

### 🚀 **Démarrage Rapide avec les Modèles**
1. Ouvrez les paramètres de Memory Books.
2. Cliquez sur le bouton **"Side Prompts"**.
3. Parcourez la **bibliothèque de modèles** - choisissez quelque chose qui correspond à votre histoire :
   - **Character Development Tracker** - Suit les changements de personnalité et la croissance.
   - **Relationship Dynamics** - Surveille les relations entre les personnages.
   - **Plot Thread Tracker** - Garde un œil sur les intrigues en cours.
   - **Mood & Atmosphere** - Capture le ton émotionnel des scènes.
   - **World Building Notes** - Enregistre les détails du cadre et le lore.
4. Activez les modèles que vous voulez, personnalisez-les si besoin.
5. Vos souvenirs incluront désormais ce suivi supplémentaire automatiquement !

### ⚙️ **Comment fonctionnent les Side Prompts**
- **Non-Intrusifs** : Ils ne modifient pas vos paramètres principaux d'IA ou les prompts de personnage.
- **Contrôle par Chat** : Activez différents prompts pour différents chats.
- **Basé sur des Modèles** : Utilisez des modèles pré-construits ou créez des modèles personnalisés.
- **Intégration Automatique** : Une fois activés, ils améliorent chaque souvenir créé.

### 🛠️ **Gérer les Side Prompts**
- **Gestionnaire de Side Prompts** : Créez, éditez, dupliquez et organisez vos prompts.
- **Import/Export** : Partagez des modèles de prompts avec d'autres ou sauvegardez votre collection.
- **Bascule Rapide** : Activez/désactivez les prompts instantanément dans la fenêtre contextuelle Side Prompts.
- **Aperçu en Direct** : Voyez quels prompts sont actifs pour le chat actuel.

### 💡 **Exemples de Modèles**
- Bibliothèque de modèles de Side Prompts (importez ce JSON) : [SidePromptTemplateLibrary.json](/resources/SidePromptTemplateLibrary.json)
- **"Se concentrer sur le dialogue et les interactions des personnages"**
- **"Suivre le statut actuel de la quête et les objectifs"**
- **"Noter tout détail de construction du monde (world-building) mentionné"**
- **"Surveiller la relation entre [Personnage A] et [Personnage B]"**

### 🔧 **Créer des Side Prompts Personnalisés**
1. Ouvrez le Gestionnaire de Side Prompts.
2. Cliquez sur "Create New" (Créer Nouveau).
3. Écrivez votre prompt (exemple : "Toujours noter quel est le temps qu'il fait dans chaque scène").
4. Sauvegardez et activez-le.
5. Maintenant, tous vos souvenirs incluront un suivi de la météo !

**Conseil de Pro** : Les Side Prompts fonctionnent mieux lorsqu'ils sont spécifiques et ciblés. Au lieu de "tout suivre", essayez "suivre la tension romantique entre les personnages principaux".

---

### 🧠 Contrôle Avancé du Texte avec l'Extension Regex

**Vous voulez un contrôle ultime sur le texte envoyé et reçu de l'IA ?** ST Memory Books s'intègre désormais parfaitement avec l'extension officielle **Regex**, vous permettant de transformer automatiquement le texte à l'aide de règles personnalisées.

**Support Multi-Sélection :** Vous pouvez maintenant sélectionner plusieurs scripts regex dans l'extension Regex. Tous les scripts activés seront appliqués dans l'ordre à chaque étape (Prompt et Réponse), permettant des transformations puissantes et flexibles.

C'est une fonctionnalité avancée parfaite pour les utilisateurs qui veulent :
- Nettoyer automatiquement les phrases répétitives ou les artefacts de la réponse d'une IA.
- Reformater des parties de la transcription du chat avant que l'IA ne les voie.
- Standardiser la terminologie ou les manies des personnages à la volée.

#### **Comment ça marche : Deux Points d'Ancrage Simples**

L'intégration fonctionne en appliquant vos scripts regex activés à deux points critiques. Vous contrôlez quels scripts s'exécutent en définissant leur **Placement** dans l'éditeur de l'extension Regex :

1.  **Modifier le Prompt (Texte Sortant)**
    * **Placement à utiliser** : `User Input` (Entrée Utilisateur)
    * **Ce que ça fait** : Intercepte le prompt entièrement assemblé (y compris l'historique du chat, les instructions système, etc.) juste avant qu'il ne soit envoyé à l'IA pour la génération de mémoire ou de side prompt.
    * **Exemple d'utilisation** : Vous pourriez créer un script pour remplacer automatiquement toutes les instances du surnom d'un personnage par son nom complet, assurant que l'IA a le bon contexte.

2.  **Modifier la Réponse (Texte Entrant)**
    * **Placement à utiliser** : `AI Output` (Sortie IA)
    * **Ce que ça fait** : Intercepte la réponse texte brute de l'IA *avant* qu'elle ne soit analysée ou sauvegardée comme souvenir.
    * **Exemple d'utilisation** : Si votre modèle d'IA inclut souvent des phrases répétitives comme *"En tant que grand modèle de langage..."* dans ses résumés, vous pouvez créer un script regex pour supprimer automatiquement cette phrase de chaque souvenir généré.

#### **Exemple de Démarrage Rapide : Nettoyer les Réponses de l'IA**

Disons que votre modèle d'IA ajoute systématiquement `(OOC: J'espère que ce résumé est utile !)` à ses générations de mémoire. Voici comment le supprimer automatiquement :

1.  **Allez dans l'Extension Regex** : Ouvrez le menu principal des extensions SillyTavern et allez dans **Regex**.
2.  **Créez un Nouveau Script** : Cliquez sur "Open Regex Editor" pour créer un nouveau script regex.
3.  **Configurez le Script** :
    * **Script Name** : `Clean OOC Notes` (Nettoyer Notes HRP)
    * **Find Regex** : `/\\(OOC:.*?\\)/g` (Ceci trouve le texte "(OOC: ...)" et tout ce qui est à l'intérieur).
    * **Replace String** : Laissez ce champ vide pour supprimer le texte trouvé.
    * **Affects (Placement)** : Décochez toutes les cases sauf **AI Output**. C'est l'étape la plus importante !
    * **Activez le Script** : Assurez-vous que le script n'est pas désactivé.
4.  **Sauvegardez et c'est fini !**

Maintenant, chaque fois que ST Memory Books reçoit une réponse de l'IA, ce script s'exécutera automatiquement, nettoyant le texte indésirable avant que le souvenir ne soit sauvegardé dans votre Lorebook.

---

## ⚙️ Les Paramètres qui comptent vraiment

Ne vous inquiétez pas, vous n'avez pas besoin de tout configurer ! Voici les paramètres qui font la plus grande différence :

### 🎛️ **Fréquence du Résumé Auto (Auto-Summary)**
- **20-30 messages** : Idéal pour les chats détaillés et lents.
- **40-60 messages** : Parfait pour les conversations plus rapides et pleines d'action.
- **80+ messages** : Pour les chats de groupe très rapides ou les conversations occasionnelles.

### 📝 **Aperçus des Souvenirs (Memory Previews)**
- Mettez ceci sur **ON** pour revoir les souvenirs avant qu'ils ne soient sauvegardés.
- Vous pouvez éditer, approuver ou régénérer si l'IA a manqué quelque chose d'important.
- Recommandé pour les intrigues importantes.

### 🏷️ **Titres des Souvenirs**
- Personnalisez la façon dont vos souvenirs sont nommés.
- Utilisez `{{title}}` pour les titres générés par l'IA, `{{scene}}` pour les numéros de messages.
- Exemple : `"Chapitre {{title}} ({{scene}})"` devient `"Chapitre La Grande Évasion (Scène 45-67)"`.

### 📚 **Collections de Souvenirs** (Lorebooks)
- **Auto mode** : Utilise la collection de souvenirs par défaut de votre chat (le plus simple).
- **Manual mode** : Choisissez une collection spécifique pour chaque chat (pour l'organisation).
- **Auto-create** : Crée automatiquement de nouvelles collections (bon pour les nouveaux personnages).

---

## 🔧 Dépannage (Quand ça ne marche pas)

### "Je ne vois pas l'option Memory Books !"
- Vérifiez que l'extension est installée et activée.
- Cherchez l'icône de la baguette magique (🪄) à côté de votre entrée de chat.
- Essayez de rafraîchir la page.

### "Les boutons fléchés (► ◄) n'apparaissent pas !"
- Attendez 3-5 secondes après le chargement d'un chat - ils ont besoin de temps pour apparaître.
- S'ils manquent toujours, rafraîchissez la page.
- Assurez-vous que ST Memory Books est activé dans les extensions.

### "L'Auto-Summary ne fonctionne pas !"
- Vérifiez deux fois que "Auto-Summary" est activé dans les paramètres de Memory Books.
- L'intervalle de messages a-t-il été atteint ? L'Auto-Summary attend suffisamment de nouveaux messages.
- Si vous avez reporté l'auto-summary, il peut attendre un certain nombre de messages.
- L'Auto-Summary ne traite que les nouveaux messages depuis le *dernier* souvenir. Si vous avez supprimé d'anciens souvenirs, il ne revient pas en arrière.

### "J'ai des erreurs concernant des Lorebooks manquants !"
- Allez dans les paramètres de Memory Books.
- Soit liez un Lorebook à votre chat (Mode Automatique), soit activez "Auto-create lorebook if none exists" (Créer automatiquement un lorebook s'il n'en existe pas).

### "Parfois ça échoue sans raison !"
- Assurez-vous que votre "Max Response Length" (dans les préréglages SillyTavern) est réglé sur un nombre assez grand. Aiko recommande au moins 2000 tokens (Aiko en utilise 4000).
- Les messages d'erreur sont plus détaillés maintenant, mais si vous avez toujours des problèmes, veuillez contacter Aiko sur Github ou Discord.

### "Mes prompts personnalisés ne fonctionnent pas correctement !"
- Vérifiez le "Summary Prompt Manager" dans les paramètres de Memory Books.
- Assurez-vous que votre prompt demande à l'IA de répondre au **format JSON** (ex: `{ "title": "...", "content": "..." }`).

---

## 🚫 Ce que ST Memory Books ne fait pas

- **Ce n'est pas un éditeur général de Lorebook :** Ce guide se concentre sur les entrées créées par STMB. Pour l'édition générale de Lorebook, utilisez l'éditeur de Lorebook intégré à SillyTavern.

---

## 💡 Obtenir de l'aide et plus d'infos

- **Infos plus détaillées :** [readme.md](readme.md)
- **Dernières mises à jour :** [changelog.md](changelog.md)
- **Convertir d'anciens lorebooks :** [lorebookconverter.html](lorebookconverter.html)
- **Support communautaire :** Rejoignez la communauté SillyTavern sur Discord ! (Cherchez le fil 📕ST Memory Books ou envoyez un MP à @tokyoapple pour une aide directe.)
- **Bugs/fonctionnalités :** Vous avez trouvé un bug ou avez une super idée ? Ouvrez un ticket GitHub dans ce dépôt.

---

### 📚 Passez à la vitesse supérieure avec l'Ordonnancement de Lorebook (STLO)

Pour une organisation avancée de la mémoire et une intégration plus profonde de l'histoire, nous recommandons fortement d'utiliser STMB avec [SillyTavern-LorebookOrdering (STLO)](https://github.com/aikohanasaki/SillyTavern-LorebookOrdering/blob/main/guides/STMB%20and%20STLO%20-%20English.md). Consultez le guide pour les meilleures pratiques, les instructions d'installation et des conseils !
