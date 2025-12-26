# Wie SillyTavern Memory Books (STMB) funktionieren – Ein "Programmer-Lite" Leitfaden

Dieser Leitfaden erklärt die Funktionsweise von STMB in klaren, verständlichen Begriffen für Benutzer, die keinen SillyTavern-Code schreiben, aber verstehen wollen, wie Prompts aufgebaut werden.

## Was STMB an die KI sendet (Memory-Generierung)

Wenn du "Generate Memory" (Memory generieren) ausführst, sendet STMB einen zweiteiligen Prompt:

A) System-Anweisungen (aus einem Preset wie "summary", "synopsis", usw.)

- Ein kurzer Anweisungsblock, der:
- Das Modell anweist, die Szene zu analysieren.
- Es anweist, NUR JSON zurückzugeben.
- Die erforderlichen JSON-Felder definiert.

- Makros wie {{user}} und {{char}} werden durch die Namen deines Chats ersetzt.
- Dies ist NICHT dein normales Chat-Preset! Diese Prompts sind eigenständig und können im 🧩Summary Prompt Manager verwaltet werden.

B) Die Szene, formatiert für die Analyse

- STMB formatiert deine letzten Nachrichten wie ein Drehbuch:
- Optionaler Kontextblock früherer Memories (klar gekennzeichnet als DO NOT SUMMARIZE / NICHT ZUSAMMENFASSEN).
- Das aktuelle Szenen-Transkript, eine Zeile pro Nachricht:
  Alice: …
  Bob: …

Grundgerüst der Prompt-Struktur

```text
— System-Anweisungen (aus deinem gewählten Preset) —
Analysiere die folgende Chat-Szene und gib eine Erinnerung (Memory) als JSON zurück.

Du musst mit NUR gültigem JSON in exakt diesem Format antworten:
{
  "title": "Kurzer Szenentitel (1-3 Wörter)",
  "content": "…",
  "keywords": ["…","…"]
}

…(Preset-Anleitung geht weiter; Makros wie {{user}} und {{char}} bereits ersetzt)…

— Szenen-Daten —
=== VORHERIGER SZENEN-KONTEXT (NICHT ZUSAMMENFASSEN) ===
Kontext 1 - [Titel]:
[Text der vorherigen Memory]
Schlüsselwörter: alpha, beta, …
…(null oder mehr vorherige Memories)…
=== ENDE VORHERIGER SZENEN-KONTEXT - FASSE NUR DIE SZENE UNTEN ZUSAMMEN ===

=== SZENEN-TRANSKRIPT ===
{{user}}: …
{{char}}: …
… (jede Nachricht in einer eigenen Zeile)
=== ENDE SZENE ===

```

Anmerkungen

- Token-Sicherheit: STMB schätzt den Token-Verbrauch und warnt dich, wenn ein Grenzwert überschritten wird.
- Wenn du ausgehende Regex in den Einstellungen aktiviert hast, wendet STMB deine ausgewählten Regex-Skripte auf den Prompt-Text an, direkt bevor er gesendet wird.

## Was die KI zurückgeben muss (JSON-Vertrag)

Die KI muss ein einzelnes JSON-Objekt mit diesen Feldern zurückgeben:

- title: string (kurz)
- content: string (der Text der Zusammenfassung/Memory)
- keywords: array von strings (10–30 spezifische Begriffe, von Presets empfohlen)

Strenge und Kompatibilität

- Gib NUR das JSON-Objekt zurück – keine Prosa, keine Erklärungen.
- Die Schlüssel (Keys) müssen exakt lauten: "title", "content", "keywords".
- STMB toleriert "summary" oder "memory_content" für content, aber "content" ist die beste Praxis.

- keywords muss ein Array von Strings sein (kein kommagetrennter String).

Minimales Beispiel (gültig)

```json
{
  "title": "Stilles Geständnis",
  "content": "Später Abend, Alice gibt zu, dass der Hack persönlich war. Bob hinterfragt die Ethik; sie einigen sich auf Grenzen und planen einen vorsichtigen nächsten Schritt.",
  "keywords": [
    "Alice",
    "Bob",
    "Geständnis",
    "Grenzen",
    "Hack",
    "Ethik",
    "Abend",
    "nächste Schritte"
  ]
}
```

Längeres Beispiel (gültig)

```json
{
  "title": "Waffenstillstand auf dem Dach",
  "content": "Zeitlinie: Nacht nach dem Vorfall auf dem Markt. Handlungspunkte: Alice offenbart, dass sie den Sender platziert hat. Bob ist frustriert, hört aber zu; sie gehen den Hinweis durch und identifizieren das Lagerhaus. Schlüsselinteraktionen: Alice entschuldigt sich ohne Ausreden; Bob stellt Bedingungen für die Fortsetzung. Nennenswerte Details: Kaputtes Funkgerät, Lagerhaus-Label \"K-17\", entfernte Sirenen. Ergebnis: Sie schließen einen vorläufigen Waffenstillstand und vereinbaren, K-17 im Morgengrauen auszukundschaften.",
  "keywords": [
    "Alice",
    "Bob",
    "Waffenstillstand",
    "Lagerhaus K-17",
    "Entschuldigung",
    "Bedingungen",
    "Sirenen",
    "Erkundungsplan",
    "Nacht",
    "Markt-Vorfall"
  ]
}
```

### Wenn das Modell sich falsch verhält

STMB versucht, leicht fehlerhafte Ausgaben zu retten:

- Akzeptiert JSON innerhalb von Code-Blöcken (Fences) und extrahiert den Block.
- Entfernt Kommentare und nachgestellte Kommas vor dem Parsen.
- Erkennt abgeschnittenes/unbalanciertes JSON und gibt klare Fehler aus, z. B.:
- NO_JSON_BLOCK – Modell antwortete mit Prosa statt JSON
- UNBALANCED / INCOMPLETE_SENTENCE – wahrscheinlich abgeschnitten
- MISSING_FIELDS_TITLE / MISSING_FIELDS_CONTENT / INVALID_KEYWORDS – Schema-Probleme

Bestes Modell-Verhalten

- Ein einzelnes JSON-Objekt mit den erforderlichen Feldern ausgeben.
- Keinen umgebenden Text oder Markdown-Fences hinzufügen.
- "title" kurz halten; "keywords" spezifisch und abruffreundlich gestalten.
- Dem Preset gehorchen (z. B. [OOC]-Inhalte ignorieren).

### Fortgeschritten: Ausführungspfad (Optional)

- Prompt-Zusammenstellung: `buildPrompt(profile, scene)` kombiniert den Anweisungstext des gewählten Presets mit dem Szenen-Transkript und dem optionalen Block vorheriger Memories.
- Senden: `sendRawCompletionRequest()` übermittelt den Text an deinen gewählten Provider/Modell.
- Parsen: `parseAIJsonResponse()` extrahiert und validiert title/content/keywords, mit leichter Reparatur falls nötig.
- Ergebnis: STMB speichert die strukturierte Memory, wendet dein Titelformat an und bereitet vorgeschlagene Lorebook-Schlüssel (Keys) vor.

## Side Prompts (Anleitung)

Side Prompts sind zusätzliche, vorlagengesteuerte Generatoren, die strukturierte Notizen zurück in dein Lorebook schreiben (z. B. Tracker, Berichte, Besetzungslisten). Sie sind getrennt vom "Memory-Generierung"-Pfad und können automatisch oder auf Abruf laufen.

Wofür sie gut sind

- Handlungs-/Status-Tracker (z. B. "Plotpoints")
- Status-/Beziehungs-Dashboards (z. B. "Status")
- Besetzungslisten / NPC Who’s Who (z. B. "Cast of Characters")
- POV-Notizen oder Einschätzungen (z. B. "Assess")

Eingebaute Vorlagen (von STMB mitgeliefert)

- Plotpoints – verfolgt Handlungsstränge und Hooks
- Status – fasst Beziehungs-/Affinitätsinformationen zusammen
- Cast of Characters – hält eine NPC-Liste in der Reihenfolge ihrer Wichtigkeit für die Handlung
- Assess – notiert, was {{char}} über {{user}} gelernt hat

Wo verwalten

- Öffne den "Side Prompts Manager" (innerhalb von STMB), um Vorlagen anzusehen, zu erstellen, zu importieren/exportieren, zu aktivieren oder zu konfigurieren.

Einen Side Prompt erstellen oder aktivieren

1. Öffne den Side Prompts Manager.
2. Erstelle eine neue Vorlage oder aktiviere eine eingebaute.
3. Konfigurieren:

- Name: Anzeigename (der gespeicherte Lorebook-Eintrag wird "Name (STMB SidePrompt)" betitelt).
- Prompt: Anweisungstext, dem das Modell folgen wird.
- Response Format: Optionaler Anleitungsblock, der an den Prompt angehängt wird (kein Schema, nur Anweisungen).
- Trigger (Auslöser):
  • On After Memory – läuft nach jeder erfolgreichen Memory-Generierung für die aktuelle Szene.
  • On Interval – läuft, wenn eine Schwelle sichtbarer Benutzer-/Assistenten-Nachrichten seit dem letzten Lauf erreicht ist (`visibleMessages`).
  • Manual command – erlaubt das Ausführen mit `/sideprompt`.
- Optionaler Kontext: `previousMemoriesCount` (0–7), um aktuelle Memories als Nur-Lese-Kontext einzubeziehen.
- Model/profile: Optional das Modell/Profil überschreiben (`overrideProfileEnabled` + `overrideProfileIndex`). Andernfalls wird das STMB-Standardprofil verwendet (das die aktuellen ST-UI-Einstellungen spiegeln kann, falls konfiguriert).
- Lorebook-Injektions-Einstellungen:
  • constVectMode: link (vektorisiert, Standard), green (normal), blue (konstant/constant)
  • position: Einfügestrategie
  • orderMode/orderValue: manuelle Sortierung bei Bedarf
  • preventRecursion/delayUntilRecursion: boolesche Flags (Ja/Nein)

Manueller Lauf mit /sideprompt

- Syntax: `/sideprompt "Name" [X‑Y]`
- Beispiele:
  • `/sideprompt "Status"`
  • `/sideprompt Cast 100‑120`

- Wenn du einen Bereich weglässt, kompiliert STMB Nachrichten seit dem letzten Checkpoint (begrenzt auf ein aktuelles Fenster).
- Manueller Lauf erfordert, dass die Vorlage den Sideprompt-Befehl erlaubt (aktiviere "Allow manual run via /sideprompt" in den Vorlageneinstellungen). Wenn deaktiviert, wird der Befehl abgewiesen.

Automatische Läufe

- After Memory (Nach Memory): Alle aktivierten Vorlagen mit dem `onAfterMemory`-Trigger laufen unter Verwendung der bereits kompilierten Szene. STMB verarbeitet Läufe stapelweise mit einem kleinen Limit für Gleichzeitigkeit und kann Erfolgs-/Fehlermeldungen pro Vorlage anzeigen.
- Intervall-Tracker: Aktivierte Vorlagen mit `onInterval` laufen, sobald die Anzahl der sichtbaren (Nicht-System-)Nachrichten seit dem letzten Lauf `visibleMessages` erreicht. STMB speichert Checkpoints pro Vorlage (z. B. `STMB_sp_<key>_lastMsgId`) und entprellt Läufe (~10s). Die Szenen-Zusammenstellung ist zur Sicherheit auf ein aktuelles Fenster begrenzt.

Vorschau und Speichern

- Wenn "show memory previews" in den STMB-Einstellungen aktiviert ist, erscheint ein Vorschau-Popup. Du kannst akzeptieren, bearbeiten, wiederholen oder abbrechen. Akzeptierter Inhalt wird in dein gebundenes Lorebook unter "Name (STMB SidePrompt)" geschrieben.
- Side Prompts erfordern ein an den Chat gebundenes Memory-Lorebook (oder Auswahl im manuellen Modus). Wenn keines gebunden ist, zeigt STMB eine Benachrichtigung und überspringt den Lauf.

Import/Export und Zurücksetzen der Eingebauten

- Export: Speichere dein Side Prompts-Dokument als JSON.
- Import: Fügt Einträge additiv hinzu; Duplikate werden sicher umbenannt (kein Überschreiben).
- Recreate Built‑ins: Setzt die eingebauten Vorlagen auf die Standards der aktuellen Spracheinstellung zurück (benutzererstellte Vorlagen bleiben unberührt).

## Side Prompts vs. Memory Path: Hauptunterschiede

- Zweck
- Memory Path: Erzeugt kanonische Szenen-Memories als striktes JSON (title, content, keywords) für den Abruf (Retrieval).
- Side Prompts: Erzeugt zusätzliche Berichte/Tracker als Freitext, der in deinem Lorebook gespeichert wird.

- Wann sie laufen
- Memory Path: Läuft nur, wenn du "Generate Memory" drückst (oder über dessen Workflow).
- Side Prompts: Kann "After Memory" (nach Memory), bei Intervall-Schwellenwerten oder manuell mit `/sideprompt` laufen.

- Prompt-Form
- Memory Path: Verwendet ein dediziertes "Summary Prompt Manager"-Preset mit einem strengen JSON-Vertrag; STMB validiert/repariert JSON.
- Side Prompts: Verwendet den Anweisungstext der Vorlage + optionalen vorherigen Eintrag + optionale vorherige Memories + kompilierten Szenentext; kein JSON-Schema erforderlich (optionales Response Format dient nur als Anleitung).

- Ausgabe und Speicherung
- Memory Path: Ein JSON-Objekt: `{ title, content, keywords }` → gespeichert als Memory-Eintrag, der für den Abruf genutzt wird.
- Side Prompts: Reintext-Inhalt → gespeichert als Lorebook-Eintrag mit dem Titel "Name (STMB SidePrompt)" (Legacy-Namen werden für Updates erkannt). Keywords sind nicht erforderlich.

- Einbindung in den Chat-Prompt
- Memory Path: Einträge werden über Tags/Keywords, Prioritäten, Scopes und Token-Budgets ausgewählt.
- Side Prompts: Einbindung wird durch die Lorebook-Injektions-Einstellungen jeder Vorlage gesteuert (konstant vs. vektorisiert, Position, Reihenfolge).

- Modell-/Profil-Auswahl
- Memory Path: Verwendet Memory-Profile, die im STMB Summary Prompt Manager definiert sind.
- Side Prompts: Verwendet das STMB-Standardprofil (welches die aktuelle ST-UI spiegeln kann), sofern keine vorlagenspezifische Überschreibung aktiviert ist.

- Gleichzeitigkeit und Batching
- Memory Path: Einzellauf pro Generierung.
- Side Prompts: "After-Memory"-Läufe werden stapelweise mit begrenzter Gleichzeitigkeit ausgeführt; Ergebnisse können in Wellen vorgeprüft und gespeichert werden.

- Token-/Größenkontrollen
- Memory Path: STMB schätzt den Token-Verbrauch und erzwingt einen JSON-Vertrag.
- Side Prompts: Kompiliert ein begrenztes Szenenfenster und fügt optional einige aktuelle Memories hinzu; keine strikte JSON-Durchsetzung.

## FAQ-Stil Notizen

- "Wird das ändern, wie ich Nachrichten schreibe?"
  Nicht wirklich. Du kuratierst hauptsächlich Einträge und lässt STMB die richtigen automatisch einbinden.
- "Kann ich sehen, was tatsächlich an die KI gesendet wurde?"
  Ja – schau in dein Terminal, um zu inspizieren, was injiziert wurde.
