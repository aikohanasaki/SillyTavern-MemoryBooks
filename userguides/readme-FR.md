# 📕 Memory Books (Une extension pour SillyTavern)

Une extension de nouvelle génération pour SillyTavern permettant la création automatique, structurée et fiable de mémoires. Marquez des scènes dans le chat, générez des résumés basés sur JSON avec l'IA et stockez-les en tant qu'entrées "[vectorisées](#vectorized)" dans vos lorebooks. Prend en charge les discussions de groupe, la gestion avancée des profils et une gestion robuste des API/modèles.

### ❓ Vocabulaire
- Scène → Mémoire
- Plusieurs Scènes → Résumé d'Arc
- Toujours actif (Always-On) → Prompt Secondaire (Suivi/Tracker)

## ❗ Lisez-moi d'abord !

Commencez ici :
* ⚠️‼️ Veuillez lire les [prérequis](#-prerequisites) pour les notes d'installation (surtout si vous utilisez l'API Text Completion).
* ❓ [Foire Aux Questions (FAQ)](#FAQ)
* 🛠️ [Dépannage](#Troubleshooting)

Autres liens :
* 📘 [Guide Utilisateur (EN)](USER_GUIDE.md)
* 📋 [Historique des versions & Changelog](changelog.md)
* 💡 [Utiliser 📕 Memory Books avec 📚 Lorebook Ordering](https://github.com/aikohanasaki/SillyTavern-LorebookOrdering/blob/main/guides/STMB%20and%20STLO%20-%20English.md)

---

### 📚 Augmentez la puissance avec Lorebook Ordering (STLO)

Pour une organisation avancée de la mémoire et une intégration plus profonde dans l'histoire, nous recommandons vivement d'utiliser STMB avec [SillyTavern-LorebookOrdering (STLO)](https://github.com/aikohanasaki/SillyTavern-LorebookOrdering/blob/main/guides/STMB%20and%20STLO%20-%20English.md). Consultez le guide pour les meilleures pratiques, les instructions de configuration et des astuces !

> Note : Prend en charge plusieurs langues : voir le dossier [`/locales`](locales) pour la liste. Les fichiers Readme et Guides Utilisateurs internationaux/localisés se trouvent dans le dossier [`/userguides`](userguides).
> Le convertisseur de lorebook et la bibliothèque de modèles de prompts secondaires se trouvent dans le dossier [`/resources`](resources).

---

## 📋 Prérequis

- **SillyTavern :** 1.14.0+ (dernière version recommandée)
- **Sélection de scène :** Les marqueurs de début et de fin (début < fin) doivent être définis.
- **Support Chat Completion :** Support complet pour OpenAI, Claude, Anthropic, OpenRouter, ou toute autre API de complétion de chat (Chat Completion).
- **Support Text Completion :** Les API de complétion de texte (Kobold, TextGen, etc.) sont prises en charge lorsqu'elles sont connectées via un point de terminaison d'API Chat Completion (compatible OpenAI). Je recommande de configurer une connexion API Chat Completion selon les conseils KoboldCpp ci-dessous (modifiez si nécessaire si vous utilisez Ollama ou un autre logiciel). Ensuite, configurez un profil STMB et utilisez la configuration personnalisée (recommandée) ou manuelle complète (uniquement si la personnalisée échoue ou si vous avez plus d'une connexion personnalisée).
**NOTE** : Veuillez noter que si vous utilisez la complétion de texte, vous devez suivre ces étapes.

### Conseils KoboldCpp pour utiliser 📕 ST Memory Books
Configurez ceci dans ST (vous pouvez revenir à Text Completion APRÈS avoir fait fonctionner STMB) :
- API Chat Completion
- Source de complétion de chat : Custom (Personnalisé)
- Point de terminaison (Endpoint) : `http://localhost:5001/v1` (vous pouvez aussi utiliser `127.0.0.1:5000/v1`)
- Entrez n'importe quoi dans "custom API key" (peu importe, mais ST en exige une)
- L'ID du modèle doit être `koboldcpp/nomdumodele` (ne mettez pas .gguf dans le nom du modèle !)
- Téléchargez un préréglage (preset) de chat completion et importez-le (n'importe lequel fera l'affaire) juste pour AVOIR un préréglage de chat completion. Cela évite les erreurs "not supported".
- Modifiez la longueur de réponse maximale sur le préréglage de chat completion pour qu'elle soit d'au moins 2048 ; 4096 est recommandé. (Plus petit signifie que vous risquez d'être coupé).

### Conseils Llama.cpp pour utiliser 📕 ST Memory Books
Tout comme Kobold, configurez ce qui suit comme une _API Chat Completion_ dans ST (vous pouvez revenir à Chat Completion après avoir vérifié que STMB fonctionne) :
- Créez un nouveau profil de connexion pour une API Chat Completion.
- Source de complétion : `Custom (Open-AI Compatible)`
- URL du point de terminaison : `http://host.docker.internal:8080/v1` si ST tourne sous docker, sinon `http://localhost:8080/v1`
- Custom API key : entrez n'importe quoi (ST en exige une)
- ID du modèle : `llama2-7b-chat.gguf` (ou votre modèle, peu importe si vous n'en exécutez pas plus d'un dans llama.cpp)
- Post-traitement du prompt : aucun

Pour démarrer Llama.cpp, je recommande de placer quelque chose de similaire à ce qui suit dans un script shell ou un fichier bat, pour faciliter le démarrage :
```sh
llama-server -m <chemin-du-modele> -c <taille-contexte> --port 8080

```

## 💡 Paramètres recommandés pour l'activation globale des Infos Monde/Lorebook

* **Match Whole Words (Mots entiers uniquement) :** laisser décoché (false)
* **Scan Depth (Profondeur de scan) :** plus c'est élevé, mieux c'est (le mien est réglé sur 8)
* **Max Recursion Steps (Étapes de récursion max) :** 2 (recommandation générale, non obligatoire)
* **Context % :** 80% (basé sur une fenêtre contextuelle de 100 000 tokens) - suppose que vous n'avez pas un historique de chat ou des bots super lourds.

---

## 🚀 Pour commencer

### 1. **Installer & Charger**

* Chargez SillyTavern et sélectionnez un personnage ou une discussion de groupe.
* Attendez que les boutons chevrons (► ◄) apparaissent sur les messages du chat (cela peut prendre jusqu'à 10 secondes).

### 2. **Marquer une scène**

* Cliquez sur ► sur le premier message de votre scène.
* Cliquez sur ◄ sur le dernier message.

### 3. **Créer une mémoire**

* Ouvrez le menu Extensions (la baguette magique 🪄) et cliquez sur "Memory Books", ou utilisez la commande slash `/creatememory`.
* Confirmez les paramètres (profil, contexte, API/modèle) si demandé.
* Attendez la génération par l'IA et l'entrée automatique dans le lorebook.

---

## 🆕 Raccourcis Commandes Slash

* `/creatememory` utilisera les marqueurs de début/fin existants pour créer une mémoire.
* `/scenememory x-y` créera une mémoire commençant au message x et finissant au message y.
* `/nextmemory` créera une mémoire avec tous les messages depuis la dernière mémoire.

## 👥 Support des Discussions de Groupe

* Toutes les fonctionnalités fonctionnent avec les discussions de groupe.
* Les marqueurs de scène, la création de mémoire et l'intégration au lorebook sont stockés dans les métadonnées du groupe.
* Aucune configuration spéciale requise — sélectionnez simplement un groupe et utilisez comme d'habitude.

---

## 🧭 Modes de Fonctionnement

### **Mode Automatique (Par défaut)**

* **Comment ça marche :** Utilise automatiquement le lorebook lié à votre chat actuel.
* **Idéal pour :** Simplicité et rapidité. La plupart des utilisateurs devraient commencer ici.
* **Pour utiliser :** Assurez-vous qu'un lorebook est sélectionné dans le menu déroulant "Chat Lorebooks" pour votre personnage ou groupe.

### **Mode Création Auto de Lorebook** ⭐ *Nouveau dans la v4.2.0*

* **Comment ça marche :** Crée et lie automatiquement un nouveau lorebook si aucun n'existe, en utilisant votre modèle de nommage personnalisé.
* **Idéal pour :** Nouveaux utilisateurs et configuration rapide. Parfait pour la création de lorebook en un clic.
* **Pour utiliser :**
1. Activez "Auto-create lorebook if none exists" dans les paramètres de l'extension.
2. Configurez votre modèle de nommage (par défaut : "LTM - {{char}} - {{chat}}").
3. Lorsque vous créez une mémoire sans lorebook lié, un lorebook est automatiquement créé et lié.


* **Espaces réservés (Placeholders) :** {{char}} (nom du perso), {{user}} (votre nom), {{chat}} (ID du chat).
* **Numérotation intelligente :** Ajoute automatiquement des numéros (2, 3, 4...) si des noms en double existent.
* **Note :** Ne peut pas être utilisé simultanément avec le Mode Lorebook Manuel.

### **Mode Lorebook Manuel**

* **Comment ça marche :** Vous permet de sélectionner un lorebook différent pour les mémoires sur une base par chat, ignorant le lorebook principal lié au chat.
* **Idéal pour :** Utilisateurs avancés qui veulent diriger les mémoires vers un lorebook spécifique et séparé.
* **Pour utiliser :**
1. Activez "Enable Manual Lorebook Mode" dans les paramètres de l'extension.
2. La première fois que vous créez une mémoire dans un chat, il vous sera demandé de choisir un lorebook.
3. Ce choix est sauvegardé pour ce chat spécifique jusqu'à ce que vous l'effaciez ou repassiez en Mode Automatique.


* **Note :** Ne peut pas être utilisé simultanément avec le Mode Création Auto de Lorebook.

---

## 🧩 Types de Mémoire : Scènes vs Arcs

📕 Memory Books prend en charge **deux niveaux de mémoire narrative**, chacun conçu pour différents types de continuité.

### 🎬 Mémoires de Scène (Défaut)

Les mémoires de scène capturent **ce qui s'est passé** dans une plage spécifique de messages.

* Basé sur la sélection explicite de scène (► ◄).
* Idéal pour le rappel moment par moment.
* Préserve le dialogue, les actions et les résultats immédiats.
* À utiliser fréquemment.

C'est le type de mémoire standard et le plus couramment utilisé.

---

### 🧭 Résumés d'Arc *(Bêta)*

Les résumés d'arc capturent **ce qui a changé au fil du temps** à travers plusieurs scènes.

Au lieu de résumer les événements, les résumés d'arc se concentrent sur :

* Le développement du personnage et les changements relationnels.
* Les objectifs à long terme, les tensions et les résolutions.
* La trajectoire émotionnelle et la direction narrative.
* Les changements d'état persistants qui doivent rester stables.

Les résumés d'arc sont des **mémoires de plus haut niveau et de fréquence plus basse** conçues pour empêcher la dérive du personnage et la perte narrative dans les longs chats.

> 💡 Pensez aux résumés d'arc comme à des *récapitulatifs de saison*, pas des journaux de scène.

#### Quand utiliser les Résumés d'Arc

* Après un changement relationnel majeur.
* À la fin d'un chapitre d'histoire ou d'un arc.
* Lorsque les motivations, la confiance ou la dynamique de pouvoir changent.
* Avant de commencer une nouvelle phase de l'histoire.

#### Notes Bêta

* Les résumés d'arc sont sensibles au prompt et intentionnellement conservateurs.
* Il est recommandé de vérifier avant de valider dans le lorebook.
* Mieux vaut les coupler avec des entrées de lorebook de moindre priorité ou de style "meta".

Les résumés d'arc sont générés **à partir de mémoires de scènes existantes**, et non directement à partir du chat brut.

Cela vous offre :

* une réduction de l'utilisation de tokens.
* une meilleure compréhension du flux narratif par l'IA.

---

## 📝 Génération de Mémoire

### **Sortie JSON Uniquement**

Tous les prompts et préréglages (presets) **doivent** instruire l'IA de ne renvoyer que du JSON valide, par ex. :

```json
{
  "title": "Titre court de la scène",
  "content": "Résumé détaillé de la scène...",
  "keywords": ["motclé1", "motclé2"]
}

```

**Aucun autre texte n'est autorisé dans la réponse.**

### **Préréglages Intégrés (Presets)**

1. **Summary :** Résumés détaillés temps par temps.
2. **Summarize :** En-têtes Markdown pour la chronologie, les temps forts, les interactions, le résultat.
3. **Synopsis :** Markdown complet et structuré.
4. **Sum Up :** Résumé concis des temps forts avec chronologie.
5. **Minimal :** Résumé en 1-2 phrases.

### **Prompts Personnalisés**

* Créez le vôtre, mais il **doit** retourner un JSON valide comme ci-dessus.

---

## 📚 Intégration Lorebook

* **Création Automatique d'Entrée :** Les nouvelles mémoires sont stockées comme des entrées avec toutes les métadonnées.
* **Détection par Drapeau :** Seules les entrées avec le drapeau (flag) `stmemorybooks` sont reconnues comme des mémoires.
* **Numérotation Auto :** Numérotation séquentielle, complétée par des zéros, avec plusieurs formats supportés (`[000]`, `(000)`, `{000}`, `#000`).
* **Ordre Manuel/Automatique :** Paramètres d'ordre d'insertion par profil.
* **Rafraîchissement de l'Éditeur :** Rafraîchit optionnellement l'éditeur de lorebook après l'ajout d'une mémoire.

> **Les mémoires existantes doivent être converties !**
> Utilisez le [Lorebook Converter](https://www.google.com/search?q=/resources/lorebookconverter.html) pour ajouter le drapeau `stmemorybooks` et les champs requis.

---

### 🎡 Suivis & Prompts Secondaires (Side Prompts)

Les Prompts Secondaires peuvent être utilisés comme des traceurs (trackers) et créeront des entrées Side Prompt séparées dans votre lorebook de mémoire. Les Prompts Secondaires vous permettent de suivre **l'état en cours**, pas seulement les événements passés. Par exemple :

* 💰 Inventaire & Ressources ("Quels objets l'utilisateur possède-t-il ?")
* ❤️ Statut Relationnel ("Que ressent X pour Y ?")
* 📊 Stats du Personnage ("Santé actuelle, compétences, réputation")
* 🎯 Progression de Quête ("Quels objectifs sont actifs ?")
* 🌍 État du Monde ("Qu'est-ce qui a changé dans le cadre ?")

#### **Accès :** Depuis les paramètres de Memory Books, cliquez sur “🎡 Suivis & Prompts Secondaires”.

#### **Fonctionnalités :**

```
- Voir tous les prompts secondaires.
- Créer de nouveaux prompts ou dupliquer pour expérimenter avec différents styles.
- Éditer ou supprimer n'importe quel préréglage (y compris ceux intégrés).
- Exporter et importer des préréglages en fichiers JSON pour sauvegarde ou partage.
- Les exécuter manuellement ou automatiquement, selon le modèle.
- Utiliser les macros ST standard comme `{{user}}` et `{{char}}` dans `Prompt` et `Response Format`.
- Utiliser des macros d'exécution personnalisées comme `{{npc name}}`, fournies lors de l'exécution de `/sideprompt`.

```

#### **Astuces d'Utilisation :**

```
- Lors de la création d'un nouveau prompt, vous pouvez copier ceux intégrés pour une meilleure compatibilité.
- Bibliothèque de Modèles de Prompts Secondaires supplémentaire [fichier JSON](resources/SidePromptTemplateLibrary.json) - importez simplement pour utiliser.
- Syntaxe manuelle : `/sideprompt "Nom" {{macro}}="value" [X-Y]`.
- Après avoir choisi un side prompt dans l'autocomplétion de commande, STMB suggère les macros d'exécution manquantes.
- Les side prompts avec des macros d'exécution personnalisées sont réservés au mode manuel. STMB supprime `On Interval` et `On After Memory` de ces modèles lors de l'enregistrement/de l'import et affiche un avertissement.

```

---

### 🧠 Intégration Regex pour Personnalisation Avancée

* **Contrôle Total sur le Traitement du Texte** : Memory Books s'intègre maintenant avec l'extension **Regex** de SillyTavern, vous permettant d'appliquer des transformations de texte puissantes à deux étapes clés :
1. **Génération du Prompt** : Modifiez automatiquement les prompts envoyés à l'IA en créant des scripts regex qui ciblent l'emplacement **User Input**.
2. **Analyse de la Réponse** : Nettoyez, reformatez ou standardisez la réponse brute de l'IA avant qu'elle ne soit sauvegardée en ciblant l'emplacement **AI Output**.


* **Support Multi-Sélection** : Vous pouvez maintenant sélectionner plusieurs scripts regex. Tous les scripts activés seront appliqués en séquence à chaque étape (Génération du Prompt et Analyse de la Réponse), permettant des transformations avancées et flexibles.
* **Comment ça marche** : L'intégration est transparente. Créez et activez simplement (multi-sélection) vos scripts désirés dans l'extension Regex, et Memory Books les appliquera automatiquement lors de la création de mémoires et de prompts secondaires.

---

## 👤 Gestion des Profils

* **Profils :** Chaque profil inclut les paramètres d'API, modèle, température, prompt/préréglage, format de titre et lorebook.
* **Import/Export :** Partagez les profils au format JSON.
* **Création de Profil :** Utilisez la popup d'options avancées pour sauvegarder de nouveaux profils.
* **Surcharges par Profil :** Changez temporairement l'API/modèle/temp pour la création de mémoire, puis restaurez vos paramètres d'origine.

---

## ⚙️ Paramètres & Configuration

### **Paramètres Globaux**

[Courte vidéo de présentation sur Youtube (EN)](https://youtu.be/mG2eRH_EhHs)

* **Manual Lorebook Mode (Mode Lorebook Manuel) :** Activer pour sélectionner les lorebooks par chat.
* **Auto-create lorebook if none exists (Créer auto le lorebook si absent) :** ⭐ *Nouveau dans la v4.2.0* - Crée et lie automatiquement les lorebooks en utilisant votre modèle de nommage.
* **Lorebook Name Template (Modèle de nom de Lorebook) :** ⭐ *Nouveau dans la v4.2.0* - Personnalisez les noms de lorebooks auto-créés avec les espaces réservés {{char}}, {{user}}, {{chat}}.
* **Allow Scene Overlap (Autoriser chevauchement de scène) :** Permettre ou empêcher les plages de mémoire qui se chevauchent.
* **Always Use Default Profile (Toujours utiliser le profil par défaut) :** Sauter les popups de confirmation.
* **Show memory previews (Montrer les aperçus de mémoire) :** Activer la popup d'aperçu pour réviser et éditer les mémoires avant l'ajout au lorebook.
* **Show Notifications (Montrer les notifications) :** Basculer les messages toast.
* **Refresh Editor (Rafraîchir l'éditeur) :** Rafraîchissement auto de l'éditeur de lorebook après création de mémoire.
* **Token Warning Threshold (Seuil d'avertissement de tokens) :** Définir le niveau d'avertissement pour les grandes scènes (défaut : 30 000).
* **Default Previous Memories (Mémoires précédentes par défaut) :** Nombre de mémoires antérieures à inclure comme contexte (0-7).
* **Auto-create memory summaries (Création auto de résumés de mémoire) :** Activer la création automatique de mémoire à intervalles.
* **Auto-Summary Interval (Intervalle de résumé auto) :** Nombre de messages après lequel créer automatiquement un résumé de mémoire (10-200, défaut : 100).
* **Memory Title Format (Format du titre de mémoire) :** Choisir ou personnaliser (voir ci-dessous).

### **Champs du Profil**

* **Name :** Nom d'affichage.
* **API/Provider :** openai, claude, custom, etc.
* **Model :** Nom du modèle (ex: gpt-4, claude-3-opus).
* **Temperature :** 0.0–2.0.
* **Prompt or Preset :** Personnalisé ou intégré.
* **Title Format :** Modèle par profil.
* **Activation Mode :** Vectorized (Vectorisé), Constant, Normal.
* **Position :** ↑Char, ↓Cha, ↑EM, ↓EM, ↑AN, Outlet (et nom du champ).
* **Order Mode (Mode d'ordre) :** Auto/manuel.
* **Recursion :** Prévenir/retarder la récursion.

---

## 🏷️ Formatage des Titres

Personnalisez les titres de vos entrées de lorebook en utilisant un système de modèles puissant.

* **Espaces réservés (Placeholders) :**
* `{{title}}` - Le titre généré par l'IA (ex: "Une Rencontre Fatidique").
* `{{scene}}` - La plage de messages (ex: "Scène 15-23").
* `{{char}}` - Le nom du personnage.
* `{{user}}` - Votre nom d'utilisateur.
* `{{messages}}` - Le nombre de messages dans la scène.
* `{{profile}}` - Le nom du profil utilisé pour la génération.
* Espaces réservés pour la date/heure actuelle dans divers formats (ex: `August 13, 2025` pour la date, `11:08 PM` pour l'heure).


* **Numérotation Auto :** Utilisez `[0]`, `[00]`, `(0)`, `{0}`, `#0`, et maintenant aussi les formes enveloppées comme `#[000]`, `([000])`, `{[000]}` pour une numérotation séquentielle avec zéros initiaux.
* **Formats Personnalisés :** Vous pouvez créer vos propres formats. Depuis la v4.5.1, tous les caractères Unicode imprimables (y compris emoji, CJK, accentués, symboles, etc.) sont autorisés dans les titres ; seuls les caractères de contrôle Unicode sont bloqués.

---

## 🧵 Mémoires Contextuelles

* **Inclure jusqu'à 7 mémoires précédentes** comme contexte pour une meilleure continuité.
* **L'estimation des tokens** inclut les mémoires contextuelles pour plus de précision.

---

## 🎨 Retour Visuel & Accessibilité

* **États des Boutons :**
* Inactif, actif, sélection valide, dans la scène, traitement en cours.


* **Accessibilité :**
* Navigation au clavier, indicateurs de focus, attributs ARIA, mouvement réduit, compatible mobile.



---

# FAQ

### Je ne trouve pas Memory Books dans le menu Extensions !

Les paramètres se trouvent dans le menu Extensions (la baguette magique 🪄 à gauche de votre boîte de saisie). Cherchez "Memory Books".

### Dois-je exécuter les vecteurs ?

L'entrée 🔗 dans les infos du monde est nommée "vectorized" dans l'interface de ST. C'est pourquoi j'utilise le mot vectorisé. Si vous n'utilisez pas l'extension de vecteurs (je ne l'utilise pas), cela fonctionne via des mots-clés. Tout cela est automatisé pour que vous n'ayez pas à penser aux mots-clés à utiliser.

### Dois-je faire un lorebook séparé pour les mémoires, ou puis-je utiliser le même lorebook que j'utilise déjà pour d'autres choses ?

Je recommande que votre lorebook de mémoire soit un livre séparé. Cela rend plus facile l'organisation des mémoires (par rapport aux autres entrées). Par exemple, l'ajouter à un chat de groupe, l'utiliser dans un autre chat, ou définir un budget de lorebook individuel (en utilisant STLO).

### Dois-je utiliser 'Delay until recursion' si Memory Books est le seul lorebook ?

Non. S'il n'y a pas d'autres infos du monde ou lorebooks, sélectionner 'Delay until recursion' (Retarder jusqu'à la récursion) peut empêcher la première boucle de se déclencher, faisant que rien ne s'active. Si Memory Books est le seul lorebook, désactivez 'Delay until recursion' ou assurez-vous qu'au moins une autre info monde/lorebook est configurée.

---

# Dépannage

* **Aucun lorebook disponible ou sélectionné :**
* En Mode Manuel, sélectionnez un lorebook lorsque demandé.
* En Mode Automatique, liez un lorebook à votre chat.
* Ou activez "Auto-create lorebook if none exists" pour la création automatique.


* **Aucune scène sélectionnée :**
* Marquez les points de début (►) et de fin (◄).


* **La scène chevauche une mémoire existante :**
* Choisissez une plage différente, ou activez "Allow scene overlap" dans les paramètres.


* **L'IA a échoué à générer une mémoire valide :**
* Utilisez un modèle qui supporte la sortie JSON.
* Vérifiez votre prompt et les paramètres du modèle.


* **Seuil d'avertissement de tokens dépassé :**
* Utilisez une scène plus petite, ou augmentez le seuil.


* **Boutons chevrons manquants :**
* Attendez que l'extension se charge, ou rafraîchissez.


* **Données du personnage non disponibles :**
* Attendez que le chat/groupe soit entièrement chargé.



---

## 📝 Politique de Caractères (v4.5.1+)

* **Autorisés dans les titres :** Tous les caractères Unicode imprimables sont autorisés, y compris les lettres accentuées, les émojis, le CJK et les symboles.
* **Bloqués :** Seuls les caractères de contrôle Unicode (U+0000–U+001F, U+007F–U+009F) sont bloqués ; ils sont supprimés automatiquement.

## Voir [Détails de la Politique de Caractères](https://www.google.com/search?q=charset.md) pour des exemples et des notes de migration.

*Développé avec amour en utilisant VS Code/Cline, des tests approfondis et les retours de la communauté.* 🤖💕
