# Fonctionnement de SillyTavern Memory Books (STMB) — Guide "Programmeur-Lite"

Ce guide explique le fonctionnement de STMB en termes clairs et accessibles pour les utilisateurs qui ne programment pas dans SillyTavern mais qui souhaitent comprendre comment les prompts (invites) sont construits.

## Ce que STMB envoie à l'IA (Génération de Mémoire)

Lorsque vous exécutez "Générer la mémoire" (Generate Memory), STMB envoie un prompt en deux parties :

A) Instructions Système (provenant d'un préréglage comme "summary", "synopsis", etc.)

- Un bloc d'instructions court qui :
  - Demande au modèle d'analyser la scène.
  - Lui ordonne de renvoyer UNIQUEMENT du JSON.
  - Définit les champs JSON requis.
- Les macros comme {{user}} et {{char}} sont remplacées par les noms de votre chat.
- Ce n'est PAS votre préréglage principal ! Ces prompts sont autonomes et peuvent être gérés depuis le 🧩Gestionnaire de Prompts de Résumé (Summary Prompt Manager).

B) La Scène, formatée pour l'analyse

- STMB formate vos messages récents comme un script :
  - Bloc de contexte optionnel des mémoires précédentes (clairement marqué NE PAS RÉSUMER).
  - La transcription de la scène actuelle, une ligne par message :
    Alice : …
    Bob : …

Squelette de la forme du prompt

```text
— Instructions Système (de votre préréglage sélectionné) —
Analysez la scène de chat suivante et renvoyez une mémoire au format JSON.

Vous devez répondre avec UNIQUEMENT un JSON valide dans ce format exact :
{
  "title": "Titre court de la scène (1-3 mots)",
  "content": "…",
  "keywords": ["…","…"]
}

…(les conseils du préréglage continuent ; les macros comme {{user}} et {{char}} sont déjà substituées)…

— Données de la Scène —
=== CONTEXTE DE LA SCÈNE PRÉCÉDENTE (NE PAS RÉSUMER) ===
Contexte 1 - [Titre] :
[Texte de la mémoire précédente]
Mots-clés : alpha, beta, …
…(zéro ou plusieurs mémoires précédentes)…
=== FIN DU CONTEXTE DE LA SCÈNE PRÉCÉDENTE - RÉSUMEZ UNIQUEMENT LA SCÈNE CI-DESSOUS ===

=== TRANSCRIPTION DE LA SCÈNE ===
{{user}} : …
{{char}} : …
… (chaque message sur sa propre ligne)
=== FIN DE LA SCÈNE ===

```

Notes

- Sécurité des tokens : STMB estime l'utilisation des tokens et vous avertit si vous dépassez un seuil.
- Si vous avez activé les regex sortantes (outgoing regex) dans les Paramètres, STMB applique vos scripts regex sélectionnés au texte du prompt juste avant l'envoi.

## Ce que l'IA doit renvoyer (Contrat JSON)

L'IA doit renvoyer un objet JSON unique avec ces champs :

- title : chaîne de caractères (courte)
- content : chaîne de caractères (le texte du résumé/mémoire)
- keywords : tableau de chaînes (10–30 termes spécifiques recommandés par les préréglages)

Rigueur et compatibilité

- Renvoyer UNIQUEMENT l'objet JSON — pas de prose, pas d'explications.
- Les clés doivent être exactement : "title", "content", "keywords".
- STMB tolère "summary" ou "memory_content" pour le contenu, mais "content" est la meilleure pratique.

- keywords doit être un tableau de chaînes (et non une chaîne séparée par des virgules).

Exemple minimal (valide)

```json
{
  "title": "Aveux Discrets",
  "content": "Tard dans la soirée, Alice admet que le piratage était personnel. Bob conteste l'éthique ; ils s'accordent sur des limites et planifient une prochaine étape prudente.",
  "keywords": [
    "Alice",
    "Bob",
    "aveux",
    "limites",
    "piratage",
    "éthique",
    "soirée",
    "prochaines étapes"
  ]
}
```

Exemple plus long (valide)

```json
{
  "title": "Trêve sur le toit",
  "content": "Chronologie : Nuit après l'incident du marché. Points de l'histoire : Alice révèle qu'elle a placé le traceur. Bob est frustré mais écoute ; ils rejouent la piste et identifient l'entrepôt. Interactions clés : Alice s'excuse sans chercher d'excuses ; Bob pose des conditions pour continuer. Détails notables : Radio cassée, étiquette d'entrepôt \"K‑17\", sirènes lointaines. Résultat : Ils forment une trêve provisoire et acceptent d'explorer K‑17 à l'aube.",
  "keywords": [
    "Alice",
    "Bob",
    "trêve",
    "entrepôt K-17",
    "excuses",
    "conditions",
    "sirènes",
    "plan d'exploration",
    "nuit",
    "incident du marché"
  ]
}
```

### Si le modèle se comporte mal

STMB tente de sauver les sorties légèrement mal formées :

- Accepte le JSON à l'intérieur de blocs de code (code fences) et extrait le bloc.
- Supprime les commentaires et les virgules traînantes avant l'analyse.
- Détecte les JSON tronqués/déséquilibrés et lève des erreurs claires, par ex. :
- NO_JSON_BLOCK — le modèle a répondu par de la prose au lieu de JSON.
- UNBALANCED / INCOMPLETE_SENTENCE — probablement tronqué.
- MISSING_FIELDS_TITLE / MISSING_FIELDS_CONTENT / INVALID_KEYWORDS — problèmes de schéma.

Meilleur comportement du modèle

- Émettre un objet JSON unique avec les champs requis.
- Ne pas ajouter de texte environnant ou de balises Markdown.
- Garder le "title" court ; rendre les "keywords" spécifiques et propices à la récupération (retrieval).
- Obéir au préréglage (ex. ignorer le contenu [HRP/OOC]).

### Avancé : Chemin d'exécution (Optionnel)

- Assemblage du prompt : `buildPrompt(profile, scene)` combine le texte d'instruction du préréglage sélectionné avec la transcription de la scène et le bloc optionnel des mémoires précédentes.
- Envoi : `sendRawCompletionRequest()` soumet le texte à votre fournisseur/modèle sélectionné.
- Analyse : `parseAIJsonResponse()` extrait et valide title/content/keywords, avec une réparation légère si nécessaire.
- Résultat : STMB stocke la mémoire structurée, applique votre format de titre et prépare les clés de lorebook suggérées.

## Side Prompts / Prompts Annexes (Guide Pratique)

Les Side Prompts sont des générateurs auxiliaires basés sur des modèles qui écrivent des notes structurées dans votre lorebook (par ex. suivis, rapports, listes de personnages). Ils sont distincts du chemin de "génération de mémoire" et peuvent s'exécuter automatiquement ou à la demande.

À quoi ils servent

- Suivis d'intrigue/d'état (ex. "Plotpoints")
- Tableaux de bord de statut/relations (ex. "Status")
- Listes de distribution / Qui est qui parmi les PNJ (ex. "Cast of Characters")
- Notes de point de vue ou évaluations (ex. "Assess")

Modèles intégrés (fournis par STMB)

- Plotpoints — suit les fils de l'histoire et les accroches.
- Status — résume les informations sur les relations/affinités.
- Cast of Characters — maintient une liste de PNJ par ordre d'importance dans l'intrigue.
- Assess — note ce que {{char}} a appris sur {{user}}.

Où gérer

- Ouvrez le Gestionnaire de Side Prompts (dans STMB) pour voir, créer, importer/exporter, activer ou configurer les modèles.

Créer ou activer un Side Prompt

1. Ouvrez le Gestionnaire de Side Prompts.
2. Créez un nouveau modèle ou activez-en un intégré.
3. Configurez :

- Name : Titre d'affichage (l'entrée sauvegardée dans le lorebook sera titrée "Nom (STMB SidePrompt)").
- Prompt : Texte d'instruction que le modèle suivra.
- Response Format : Bloc de conseils optionnel ajouté au prompt (pas un schéma, juste des directives).
- Triggers (Déclencheurs) :
  • On After Memory — s'exécute après chaque génération de mémoire réussie pour la scène actuelle.
  • On Interval — s'exécute lorsqu'un seuil de messages visibles utilisateur/assistant depuis la dernière exécution est atteint (`visibleMessages`).
  • Manual command — autorise l'exécution avec `/sideprompt`.
- Contexte optionnel : `previousMemoriesCount` (0–7) pour inclure les mémoires récentes en lecture seule.
- Modèle/profil : remplace optionnellement le modèle/profil (`overrideProfileEnabled` + `overrideProfileIndex`). Sinon, utilise le profil par défaut de STMB (qui peut refléter les paramètres actuels de l'interface ST si configuré).
- Paramètres d'injection Lorebook :
  • constVectMode : link (vectorisé, par défaut), green (normal), blue (constant)
  • position : stratégie d'insertion
  • orderMode/orderValue : ordre manuel si nécessaire
  • preventRecursion/delayUntilRecursion : drapeaux booléens

Exécution manuelle avec /sideprompt

- Syntaxe : `/sideprompt "Nom" [X‑Y]`
- Exemples :
  • `/sideprompt "Status"`
  • `/sideprompt Cast 100‑120`

- Si vous omettez une plage, STMB compile les messages depuis le dernier point de contrôle (plafonné à une fenêtre récente).
- L'exécution manuelle nécessite que le modèle autorise la commande sideprompt (activez "Allow manual run via /sideprompt" dans les paramètres du modèle). Si désactivé, la commande sera rejetée.

Exécutions automatiques

- Après Mémoire (After Memory) : Tous les modèles activés avec le déclencheur `onAfterMemory` s'exécutent en utilisant la scène déjà compilée. STMB traite les exécutions par lots avec une petite limite de concurrence et peut afficher des notifications de succès/échec par modèle.
- Suivis par intervalle : Les modèles activés avec `onInterval` s'exécutent une fois que le nombre de messages visibles (non système) depuis la dernière exécution atteint `visibleMessages`. STMB stocke des points de contrôle par modèle (ex. `STMB_sp_<key>_lastMsgId`) et temporise les exécutions (~10s). La compilation de la scène est plafonnée à une fenêtre récente pour la sécurité.

Aperçus et sauvegarde

- Si "show memory previews" est activé dans les paramètres STMB, une fenêtre d'aperçu apparaît. Vous pouvez accepter, éditer, réessayer ou annuler. Le contenu accepté est écrit dans votre lorebook lié sous "Nom (STMB SidePrompt)".
- Les Side Prompts nécessitent qu'un lorebook de mémoire soit lié au chat (ou sélectionné en Mode Manuel). Si aucun n'est lié, STMB affichera une notification et ignorera l'exécution.

Import/export et réinitialisation intégrée

- Exporter : Sauvegardez votre document Side Prompts en JSON.
- Importer : Fusionne les entrées de manière additive ; les doublons sont renommés en toute sécurité (pas d'écrasement).
- Recréer les intégrés (Recreate Built‑ins) : Réinitialise les modèles intégrés aux valeurs par défaut de la locale actuelle (les modèles créés par l'utilisateur ne sont pas touchés).

## Side Prompts vs Chemin de Mémoire : Différences Clés

- Objectif
- Chemin de Mémoire : Produit des mémoires de scène canoniques en JSON strict (title, content, keywords) pour la récupération.
- Side Prompts : Produit des rapports/suivis auxiliaires en texte libre sauvegardés dans votre lorebook.

- Quand ils s'exécutent
- Chemin de Mémoire : S'exécute uniquement lorsque vous appuyez sur Générer la Mémoire (ou via son flux de travail).
- Side Prompts : Peuvent s'exécuter Après Mémoire, sur des seuils d'Intervalle, ou manuellement avec `/sideprompt`.

- Forme du prompt
- Chemin de Mémoire : Utilise un préréglage dédié du "Summary Prompt Manager" avec un contrat JSON strict ; STMB valide/répare le JSON.
- Side Prompts : Utilise le texte d'instruction du modèle + entrée précédente optionnelle + mémoires précédentes optionnelles + texte de la scène compilée ; aucun schéma JSON requis (le Response Format optionnel est seulement indicatif).

- Sortie et stockage
- Chemin de Mémoire : Un objet JSON : `{ title, content, keywords }` → stocké comme une entrée de mémoire utilisée pour la récupération.
- Side Prompts : Contenu en texte brut → stocké comme une entrée de lorebook titrée "Nom (STMB SidePrompt)" (les anciens noms sont reconnus pour les mises à jour). Les mots-clés ne sont pas requis.

- Inclusion dans le prompt du chat
- Chemin de Mémoire : Les entrées sont sélectionnées via tags/mots-clés, priorités, portées et budgets de tokens.
- Side Prompts : L'inclusion est régie par les paramètres d'injection lorebook de chaque modèle (constant vs vectorisé, position, ordre).

- Sélection du modèle/profil
- Chemin de Mémoire : Utilise les profils de mémoire définis dans le Summary Prompt Manager de STMB.
- Side Prompts : Utilise le profil par défaut de STMB (qui peut refléter l'interface ST actuelle) sauf si un remplacement au niveau du modèle est activé.

- Concurrence et traitement par lots
- Chemin de Mémoire : Une seule exécution par génération.
- Side Prompts : Les exécutions "Après Mémoire" sont groupées avec une concurrence limitée ; les résultats peuvent être prévisualisés et sauvegardés par vagues.

- Contrôles de taille/tokens
- Chemin de Mémoire : STMB estime l'utilisation des tokens et impose un contrat JSON.
- Side Prompts : Compile une fenêtre de scène délimitée et ajoute optionnellement quelques mémoires récentes ; pas d'application stricte de JSON.

## Notes style FAQ

- "Est-ce que cela va changer ma façon d'écrire des messages ?"
  Pas vraiment. Vous devez principalement curer les entrées et laisser STMB inclure automatiquement les bonnes.
- "Puis-je voir ce qui a été réellement envoyé à l'IA ?"
  Oui — vérifiez votre Terminal pour inspecter ce qui a été injecté.
