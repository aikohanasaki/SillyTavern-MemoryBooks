# 📕 Memory Books (Une Extension SillyTavern)

Une extension de nouvelle génération pour SillyTavern permettant la création automatique, structurée et fiable de mémoires. Marquez des scènes dans le chat, générez des résumés basés sur JSON avec l'IA, et stockez-les sous forme d'entrées "[vectorisées](#vectorized)" dans vos lorebooks. Prend en charge les chats de groupe, la gestion avancée des profils et une gestion robuste des API/modèles.

Commencez ici :

- ⚠️‼️ Veuillez lire les [prérequis](#-prérequis) pour les notes d'installation (surtout si vous utilisez l'API Text Completion)
- ❓ [Foire Aux Questions](#FAQ)
- 🛠️ [Dépannage](#Dépannage)

Autres liens :

- 📘 [Guide Utilisateur (EN)](USER_GUIDE.md)
- 📋 [Historique des versions & Changelog](changelog.md)
- 💡 [Utiliser 📕 Memory Books avec 📚 Lorebook Ordering](https://github.com/aikohanasaki/SillyTavern-LorebookOrdering/blob/main/guides/STMB%20and%20STLO%20-%20English.md)

---

### 📚 Boostez votre expérience avec Lorebook Ordering (STLO)

Pour une organisation avancée de la mémoire et une intégration plus profonde dans l'histoire, nous recommandons vivement d'utiliser STMB conjointement avec [SillyTavern-LorebookOrdering (STLO)](https://github.com/aikohanasaki/SillyTavern-LorebookOrdering/blob/main/guides/STMB%20and%20STLO%20-%20English.md). Consultez le guide pour les meilleures pratiques, les instructions de configuration et des astuces !

> Note : Prend en charge plusieurs langues : voir le dossier [`/locales`](locales) pour la liste. Le Readme et les Guides Utilisateurs internationaux/traduits se trouvent dans le dossier [`/userguides`](userguides).
> Le convertisseur de lorebook et la bibliothèque de modèles de "side prompts" se trouvent dans le dossier [`/resources`](resources).

---

## 📋 Prérequis

- **SillyTavern :** 1.13.5+ (dernière version recommandée)
- ⚠️‼️**INSTALLER POUR TOUS LES UTILISATEURS :**‼️⚠️ Comme STMB réutilise de nombreuses fonctions du code de base de ST, veuillez vous assurer que l'extension est installée pour tous les utilisateurs afin que l'emplacement soit `/public/scripts/extensions/third-party/SillyTavern-MemoryBooks`. Sinon, l'importation des fonctions échouera.
- **Sélection de Scène :** Les marqueurs de début et de fin (début < fin) doivent être définis.
- **Support Chat Completion :** Support complet pour OpenAI, Claude, Anthropic, OpenRouter ou toute autre API de chat completion.
- **Support Text Completion :** Les API de complétion de texte (Kobold, TextGen, etc.) sont prises en charge lorsqu'elles sont connectées via un point de terminaison API Chat Completion (compatible OpenAI). Je recommande de configurer une connexion API Chat Completion selon les astuces KoboldCpp ci-dessous (modifiez si nécessaire pour Ollama ou un autre logiciel). Ensuite, configurez un profil STMB et utilisez la configuration "Custom" (recommandé) ou entièrement manuelle (seulement si Custom échoue ou si vous avez plus d'une connexion personnalisée).

### Astuces KoboldCpp pour utiliser 📕 ST Memory Books

Configurez ceci dans ST (vous pouvez revenir à Text Completion APRÈS avoir fait fonctionner STMB)

- Chat Completion API
- Source chat completion : Custom
- Endpoint : `http://localhost:5001/v1` (vous pouvez aussi utiliser `127.0.0.1:5000/v1`)
- Entrez n'importe quoi dans "custom API key" (cela n'a pas d'importance, mais ST en exige une)
- L'ID du modèle doit être `koboldcpp/nomdumodele` (ne mettez pas .gguf dans le nom du modèle !)
- Téléchargez un préréglage (preset) de chat completion et importez-le (n'importe lequel fera l'affaire) juste pour AVOIR un préréglage de chat completion. Cela évite les erreurs de type "non supporté".

## 💡 Paramètres Recommandés d'Activation Globale World Info/Lorebook

- **Match Whole Words (Mots entiers uniquement) :** laisser décoché (false)
- **Scan Depth (Profondeur de scan) :** plus c'est élevé, mieux c'est (le mien est réglé sur 8)
- **Max Recursion Steps (Étapes de récursion max) :** 2 (recommandation générale, non obligatoire)
- **Context % :** 80% (basé sur une fenêtre contextuelle de 100 000 tokens) - suppose que vous n'avez pas un historique de chat ou des bots extrêmement lourds.

---

## 🚀 Pour Commencer

### 1. **Installer & Charger**

- Chargez SillyTavern et sélectionnez un personnage ou un chat de groupe.
- Attendez que les boutons en chevron (► ◄) apparaissent sur les messages du chat (cela peut prendre jusqu'à 10 secondes).

![Attendez ces boutons](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/startup.png)

### 2. **Marquer une Scène**

- Cliquez sur ► sur le premier message de votre scène.
- Cliquez sur ◄ sur le dernier message.

![Retour visuel montrant la sélection de scène](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/button-start.png)

### 3. **Créer un Souvenir**

- Ouvrez le menu Extensions (la baguette magique 🪄) et cliquez sur "Memory Books", ou utilisez la commande slash `/creatememory`.
- Confirmez les paramètres (profil, contexte, API/modèle) si demandé.
- Attendez la génération par l'IA et l'entrée automatique dans le lorebook.

---

## 🆕 Raccourcis Commandes Slash

- `/creatememory` utilisera les marqueurs de début/fin existants pour créer un souvenir.
- `/scenememory x-y` créera un souvenir commençant par le message x et finissant par le message y.
- `/nextmemory` créera un souvenir avec tous les messages depuis le dernier souvenir.

## 👥 Support Chat de Groupe

- Toutes les fonctionnalités fonctionnent avec les chats de groupe.
- Les marqueurs de scène, la création de mémoire et l'intégration au lorebook sont stockés dans les métadonnées du groupe.
- Aucune configuration spéciale requise — sélectionnez simplement un chat de groupe et utilisez normalement.

---

## 🧭 Modes de Fonctionnement

### **Mode Automatique (Par défaut)**

- **Comment ça marche :** Utilise automatiquement le lorebook qui est lié à votre chat actuel.
- **Idéal pour :** Simplicité et rapidité. La plupart des utilisateurs devraient commencer par ici.
- **Pour utiliser :** Assurez-vous qu'un lorebook est sélectionné dans le menu déroulant "Chat Lorebooks" pour votre personnage ou chat de groupe.

![Exemple de liaison de lorebook au chat](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/chatlorebook.png)

### **Mode Auto-Création de Lorebook** ⭐ _Nouveau dans la v4.2.0_

- **Comment ça marche :** Crée et lie automatiquement un nouveau lorebook lorsqu'aucun n'existe, en utilisant votre modèle de nommage personnalisé.
- **Idéal pour :** Les nouveaux utilisateurs et une configuration rapide. Parfait pour la création de lorebook en un clic.
- **Pour utiliser :**
  1. Activez "Auto-create lorebook if none exists" dans les paramètres de l'extension.
  2. Configurez votre modèle de nommage (par défaut : "LTM - {{char}} - {{chat}}").
  3. Lorsque vous créez un souvenir sans lorebook lié, un lorebook est automatiquement créé et lié.
- **Placeholders du modèle :** {{char}} (nom du personnage), {{user}} (votre nom), {{chat}} (ID du chat)
- **Numérotation intelligente :** Ajoute automatiquement des nombres (2, 3, 4...) si des noms en double existent.
- **Note :** Ne peut pas être utilisé simultanément avec le Mode Lorebook Manuel.

### **Mode Lorebook Manuel**

- **Comment ça marche :** Vous permet de sélectionner un lorebook différent pour les souvenirs, spécifique à chaque chat, ignorant le lorebook principal lié au chat.
- **Idéal pour :** Les utilisateurs avancés qui souhaitent diriger les souvenirs vers un lorebook spécifique et séparé.
- **Pour utiliser :**
  1. Activez "Enable Manual Lorebook Mode" dans les paramètres de l'extension.
  2. La première fois que vous créez un souvenir dans un chat, il vous sera demandé de choisir un lorebook.
  3. Ce choix est sauvegardé pour ce chat spécifique jusqu'à ce que vous l'effaciez ou reveniez au Mode Automatique.
- **Note :** Ne peut pas être utilisé simultanément avec le Mode Auto-Création de Lorebook.

---

## 📝 Génération de Mémoire

### **Sortie JSON Uniquement**

Tous les prompts et presets **doivent** demander à l'IA de retourner uniquement un JSON valide, par ex. :

```json
{
  "title": "Titre court de la scène",
  "content": "Résumé détaillé de la scène...",
  "keywords": ["mot-clé1", "mot-clé2"]
}
```

**Aucun autre texte n'est autorisé dans la réponse.**

### **Presets Intégrés**

1. **Summary :** Résumés détaillés point par point.
2. **Summarize :** En-têtes Markdown pour la chronologie, les points clés, les interactions, le résultat.
3. **Synopsis :** Markdown complet et structuré.
4. **Sum Up :** Résumé concis des points clés avec chronologie.
5. **Minimal :** Résumé en 1-2 phrases.

### **Prompts Personnalisés**

- Créez le vôtre, mais il **doit** retourner un JSON valide comme ci-dessus.

---

## 📚 Intégration Lorebook

- **Création Automatique d'Entrée :** Les nouveaux souvenirs sont stockés comme des entrées avec toutes les métadonnées.
- **Détection par Drapeau :** Seules les entrées avec le drapeau `stmemorybooks` sont reconnues comme des souvenirs.
- **Numérotation Auto :** Numérotation séquentielle avec zéros de remplissage (padding), formats multiples supportés (`[000]`, `(000)`, `{000}`, `#000`).
- **Ordre Manuel/Automatique :** Paramètres d'ordre d'insertion par profil.
- **Rafraîchissement de l'Éditeur :** Rafraîchit optionnellement l'éditeur de lorebook après l'ajout d'un souvenir.

> **Les souvenirs existants doivent être convertis !**
> Utilisez le [Convertisseur de Lorebook](https://www.google.com/search?q=/resources/lorebookconverter.html) pour ajouter le drapeau `stmemorybooks` et les champs requis.

---

### 🎡 Side Prompts (Prompts Secondaires)

Les Side Prompts peuvent être utilisés comme des traqueurs et créeront des entrées dans votre lorebook de mémoire.

- **Accès :** Depuis les paramètres de Memory Books, cliquez sur “🎡 Side Prompt Manager”.
- **Fonctionnalités :**
- Voir tous les side prompts.
- Créer de nouveaux prompts ou dupliquer pour expérimenter avec différents styles.
- Éditer ou supprimer n'importe quel preset (y compris ceux intégrés).
- Exporter et importer des presets sous forme de fichiers JSON pour sauvegarde ou partage.
- Les exécuter manuellement ou automatiquement avec la création de mémoire.

- **Astuces d'utilisation :**
- Lors de la création d'un nouveau prompt, vous pouvez copier ceux intégrés pour une meilleure compatibilité.
- Bibliothèque de modèles de Side Prompts supplémentaire [Fichier JSON](https://www.google.com/search?q=resources/SidePromptTemplateLibrary.json) - importez simplement pour utiliser.

---

### 🧠 Intégration Regex pour une Personnalisation Avancée

- **Contrôle Total sur le Traitement du Texte** : Memory Books s'intègre désormais à l'extension **Regex** de SillyTavern, vous permettant d'appliquer de puissantes transformations de texte à deux étapes clés :

1. **Génération du Prompt** : Modifiez automatiquement les prompts envoyés à l'IA en créant des scripts regex qui ciblent l'emplacement **User Input**.
2. **Analyse de la Réponse** : Nettoyez, reformatez ou standardisez la réponse brute de l'IA avant qu'elle ne soit sauvegardée en ciblant l'emplacement **AI Output**.

- **Support Multi-Sélection** : Vous pouvez désormais sélectionner plusieurs scripts regex. Tous les scripts activés seront appliqués en séquence à chaque étape (Génération du Prompt et Analyse de la Réponse), permettant des transformations avancées et flexibles.
- **Comment ça marche** : L'intégration est transparente. Créez et activez (multi-sélection) simplement vos scripts souhaités dans l'extension Regex, et Memory Books les appliquera automatiquement lors de la création de mémoire et de side prompts.

---

## 👤 Gestion des Profils

- **Profils :** Chaque profil inclut l'API, le modèle, la température, le prompt/preset, le format de titre et les paramètres de lorebook.
- **Import/Export :** Partagez des profils en tant que JSON.
- **Création de Profil :** Utilisez le popup d'options avancées pour sauvegarder de nouveaux profils.
- **Remplacements par Profil (Overrides) :** Changez temporairement l'API/modèle/temp pour la création de mémoire, puis restaurez vos paramètres d'origine.

---

## ⚙️ Paramètres & Configuration

### **Paramètres Globaux**

[Courte vidéo de présentation sur Youtube](https://youtu.be/mG2eRH_EhHs)

- **Manual Lorebook Mode :** Activez pour sélectionner les lorebooks par chat.
- **Auto-create lorebook if none exists :** ⭐ _Nouveau dans la v4.2.0_ - Crée et lie automatiquement les lorebooks en utilisant votre modèle de nommage.
- **Lorebook Name Template :** ⭐ _Nouveau dans la v4.2.0_ - Personnalisez les noms de lorebooks auto-créés avec les placeholders {{char}}, {{user}}, {{chat}}.
- **Allow Scene Overlap :** Autorisez ou empêchez les plages de mémoire qui se chevauchent.
- **Always Use Default Profile :** Ignore les popups de confirmation.
- **Show memory previews :** Active le popup de prévisualisation pour revoir et éditer les souvenirs avant l'ajout au lorebook.
- **Show Notifications :** Active/désactive les messages toast.
- **Refresh Editor :** Rafraîchissement auto de l'éditeur de lorebook après création de mémoire.
- **Token Warning Threshold :** Définit le niveau d'avertissement pour les grandes scènes (défaut : 30 000).
- **Default Previous Memories :** Nombre de souvenirs précédents à inclure comme contexte (0-7).
- **Auto-create memory summaries :** Active la création automatique de mémoire à intervalles.
- **Auto-Summary Interval :** Nombre de messages après lequel créer automatiquement un résumé de mémoire (10-200, défaut : 100).
- **Memory Title Format :** Choisissez ou personnalisez (voir ci-dessous).

### **Champs de Profil**

- **Name :** Nom d'affichage.
- **API/Provider :** openai, claude, custom, etc.
- **Model :** Nom du modèle (ex: gpt-4, claude-3-opus).
- **Temperature :** 0.0–2.0.
- **Prompt or Preset :** Personnalisé ou intégré.
- **Title Format :** Modèle par profil.
- **Activation Mode :** Vectorized, Constant, Normal.
- **Position :** ↑Char, ↓Cha, ↑EM, ↓EM, ↑AN, Outlet (et nom du champ).
- **Order Mode :** Auto/manuel.
- **Recursion :** Prévenir/retarder la récursion.

---

## 🏷️ Formatage du Titre

Personnalisez les titres de vos entrées de lorebook en utilisant un système de modèle puissant.

- **Placeholders :**
- `{{title}}` - Le titre généré par l'IA (ex: "Une rencontre fatidique").
- `{{scene}}` - La plage de messages (ex: "Scène 15-23").
- `{{char}}` - Le nom du personnage.
- `{{user}}` - Votre nom d'utilisateur.
- `{{messages}}` - Le nombre de messages dans la scène.
- `{{profile}}` - Le nom du profil utilisé pour la génération.
- Placeholders de date/heure actuelles dans divers formats (ex: `August 13, 2025` pour la date, `11:08 PM` pour l'heure).

- **Auto-numérotation :** Utilisez `[0]`, `[00]`, `(0)`, `{0}`, `#0`, et maintenant aussi les formes enveloppées comme `#[000]`, `([000])`, `{[000]}` pour une numérotation séquentielle avec zéros de remplissage.
- **Formats Personnalisés :** Vous pouvez créer vos propres formats. Depuis la v4.5.1, tous les caractères Unicode imprimables (y compris emoji, CJK, accentués, symboles, etc.) sont autorisés dans les titres ; seuls les caractères de contrôle Unicode sont bloqués.

---

## 🧵 Souvenirs Contextuels

- **Incluez jusqu'à 7 souvenirs précédents** comme contexte pour une meilleure continuité.
- **L'estimation des tokens** inclut les souvenirs contextuels pour plus de précision.

---

## 🎨 Retour Visuel & Accessibilité

- **États des Boutons :**
- Inactif, actif, sélection valide, dans la scène, en traitement.

- **Accessibilité :**
- Navigation au clavier, indicateurs de focus, attributs ARIA, mouvement réduit, compatible mobile.

---

# FAQ

### Je ne trouve pas Memory Books dans le menu Extensions !

Les paramètres se trouvent dans le menu Extensions (la baguette magique 🪄 à gauche de votre boîte de saisie). Cherchez "Memory Books".

### Dois-je utiliser les vecteurs (vectors) ?

L'entrée 🔗 dans les informations du monde (World Info) est nommée "vectorized" dans l'interface de ST. C'est pourquoi j'utilise le mot "vectorized". Si vous n'utilisez pas l'extension vectors (ce qui est mon cas), cela fonctionne via des mots-clés. Tout est automatisé pour que vous n'ayez pas à réfléchir aux mots-clés à utiliser.

### Dois-je faire un lorebook séparé pour les souvenirs, ou puis-je utiliser le même lorebook que j'utilise déjà pour d'autres choses ?

Je recommande que votre lorebook de mémoire soit un livre séparé. Cela rend plus facile l'organisation des souvenirs (par rapport aux autres entrées). Par exemple, l'ajouter à un chat de groupe, l'utiliser dans un autre chat, ou définir un budget de lorebook individuel (en utilisant STLO).

### Dois-je utiliser 'Delay until recursion' si Memory Books est le seul lorebook ?

Non. S'il n'y a pas d'autres informations du monde ou lorebooks, sélectionner 'Delay until recursion' peut empêcher la première boucle de se déclencher, faisant que rien ne s'active. Si Memory Books est le seul lorebook, désactivez 'Delay until recursion' ou assurez-vous qu'au moins une autre entrée world info/lorebook est configurée.

---

# Dépannage

- **Aucun lorebook disponible ou sélectionné :**
- En Mode Manuel, sélectionnez un lorebook lorsque demandé.
- En Mode Automatique, liez un lorebook à votre chat.
- Ou activez "Auto-create lorebook if none exists" pour la création automatique.

- **Aucune scène sélectionnée :**
- Marquez les points de début (►) et de fin (◄).

- **La scène chevauche un souvenir existant :**
- Choisissez une plage différente, ou activez "Allow scene overlap" dans les paramètres.

- **L'IA n'a pas réussi à générer un souvenir valide :**
- Utilisez un modèle qui supporte la sortie JSON.
- Vérifiez votre prompt et les paramètres du modèle.

- **Seuil d'avertissement de tokens dépassé :**
- Utilisez une scène plus petite, ou augmentez le seuil.

- **Boutons en chevron manquants :**
- Attendez que l'extension charge, ou rafraîchissez.

- **Données du personnage non disponibles :**
- Attendez que le chat/groupe soit entièrement chargé.

---

## 📝 Politique des Caractères (v4.5.1+)

- **Autorisé dans les titres :** Tous les caractères Unicode imprimables sont autorisés, y compris les lettres accentuées, les emoji, les CJK et les symboles.
- **Bloqué :** Seuls les caractères de contrôle Unicode (U+0000–U+001F, U+007F–U+009F) sont bloqués ; ils sont supprimés automatiquement.

## Voir [Détails de la Politique des Caractères](https://www.google.com/search?q=charset.md) pour des exemples et des notes de migration.

_Développé avec amour en utilisant VS Code/Cline, des tests approfondis et les retours de la communauté._ 🤖💕
