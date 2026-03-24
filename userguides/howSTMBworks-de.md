# Wie SillyTavern Memory Books (STMB) funktionieren

Dies ist eine allgemeine Erklärung dazu, wie STMB arbeitet. Der Text ist nicht dazu gedacht, den Code zu erklären. Stattdessen geht es darum, welche Informationen STMB zusammenstellt, in welcher Reihenfolge sie gesendet werden und was das Modell zurückgeben soll.

Nutze dieses Dokument, wenn du Prompts für STMB schreiben oder überarbeiten willst.

## Die 3 wichtigsten Prompt-Abläufe in STMB

STMB hat drei Hauptabläufe:

1. Erstellung von Erinnerungen
2. Side-Prompts
3. Konsolidierung

Sie hängen zusammen, erwarten aber nicht dieselbe Art von Ausgabe.

- Die Erstellung von Erinnerungen erwartet striktes JSON.
- Side-Prompts erwarten normalerweise sauberen Klartext und können Markdown oder andere Lorebook-Formate verwenden. JSON sollte in Side-Prompts nicht benutzt werden.
- Die Konsolidierung erwartet ebenfalls striktes JSON, aber in einem anderen Schema als Erinnerungen.

## I. Erstellung von Erinnerungen

Wenn du eine Erinnerung erstellst, sendet STMB in der Regel einen zusammengesetzten Prompt mit diesen Teilen in genau dieser Reihenfolge:

1. Der ausgewählte Erinnerungs-Prompt oder Voreinstellungstext
   - Das ist der Anweisungsblock aus dem Zusammenfassungs-Prompt-Manager.
   - Er sagt dem Modell, welche Art von Zusammenfassung geschrieben werden soll und welche JSON-Form erwartet wird.
   - Makros wie `{{user}}` und `{{char}}` werden vor dem Senden aufgelöst.

2. Optionaler Kontext aus früheren Erinnerungen
   - Wenn der Lauf so konfiguriert wurde, dass frühere Erinnerungen einbezogen werden, werden sie als Nur-Lese-Kontext eingefügt.
   - Sie sind klar als Kontext markiert und nicht als das Material, das noch einmal zusammengefasst werden soll.

3. Das aktuelle Szenentranskript
   - Der ausgewählte Chat-Bereich wird zeilenweise als `Sprecher: Nachricht` formatiert.
   - Das ist die eigentliche Szene, die das Modell in eine Erinnerung umwandeln soll.

Sehr grob sieht das so aus:

```text
[Anweisungen aus Erinnerungs-Prompt oder Voreinstellung]

=== PREVIOUS SCENE CONTEXT (DO NOT SUMMARIZE) ===
[null oder mehr frühere Erinnerungen]
=== END PREVIOUS SCENE CONTEXT - SUMMARIZE ONLY THE SCENE BELOW ===

=== SCENE TRANSCRIPT ===
Alice: ...
Bob: ...
=== END SCENE ===
```

### Was das Modell zurückgeben soll

Erwartet wird ein JSON-Objekt:

```json
{
  "title": "Short scene title",
  "content": "The actual memory text",
  "keywords": ["keyword1", "keyword2", "keyword3"]
}
```

Best Practice:

- Gib nur das JSON-Objekt zurück.
- Verwende genau die Schlüssel `title`, `content` und `keywords`.
- `keywords` muss ein echtes JSON-Array aus Strings sein.
- Halte den Titel kurz und gut lesbar.
- Halte die Keywords konkret und gut für den Abruf: Orte, Objekte, Eigennamen, markante Handlungen, Kennungen.

STMB kann leicht unordentliche Ausgaben manchmal noch retten, aber Prompts sollten sich nicht darauf verlassen.

### Was einen guten Erinnerungs-Prompt ausmacht

Gute Erinnerungs-Prompts machen vier Dinge klar:

1. Sie sagen dem Modell, welche Art von Erinnerung geschrieben werden soll
   - Detailliertes Szenenprotokoll
   - Kompakte Synopsis
   - Minimale Zusammenfassung
   - Literarische Erinnerung in Erzählform

2. Sie sagen dem Modell, worauf es ankommt
   - Story-Beats
   - Entscheidungen
   - Veränderungen bei Figuren
   - Enthüllungen
   - Ergebnisse
   - kontinuitätsrelevante Details

3. Sie sagen dem Modell, was ignoriert werden soll
   - meistens OOC
   - Filler
   - reine Ausschmückung, wenn die Erinnerung straffer sein soll

4. Sie sagen dem Modell exakt, welches JSON zurückgegeben werden soll

### Was einen schwachen Erinnerungs-Prompt ausmacht

Schwache Prompts scheitern meistens an einer dieser Stellen:

- Sie beschreiben den Schreibstil, aber nicht die JSON-Form.
- Sie fordern "hilfreiche Analyse" oder "Gedanken" statt eines fertigen Erinnerungsobjekts.
- Sie fordern abstrakte Keywords statt konkreter Begriffe für den späteren Abruf.
- Sie trennen früheren Kontext und aktuelle Szene nicht sauber voneinander.
- Sie verlangen zu viele Ausgabeformate gleichzeitig.

### Praktische Hinweise für Erinnerungs-Prompts

- Formuliere klar, ob die Zusammenfassung erschöpfend oder token-effizient sein soll.
- Wenn du Markdown innerhalb von `content` willst, sage das direkt.
- Wenn du kurze Erinnerungen willst, begrenze den Inhalt, nicht das JSON-Schema.
- Wenn dir guter Abruf wichtig ist, investiere Prompt-Platz eher in die Qualität der Keywords als nur in den Stil der Zusammenfassung.
- Behandle frühere Erinnerungen als Kontinuitäts-Kontext, nicht als Material, das neu geschrieben werden soll.

## II. Side-Prompts

Side-Prompts sind KEINE Erinnerungen. Sie sind Tracker- oder Update-Prompts, die meist einen eigenen Lorebook-Eintrag schreiben oder überschreiben. Das ist ein ganz anderes Konzept als eine Erinnerung, und genau das sollte man beim Schreiben der Prompts immer im Kopf behalten.

Wenn ein Side-Prompt läuft, stellt STMB normalerweise diese Teile in dieser Reihenfolge zusammen:

1. Der eigentliche Anweisungstext des Side-Prompts
   - Das ist der konkrete Arbeitsauftrag für diesen Tracker.
   - ST-Standardmakros wie `{{user}}` und `{{char}}` werden aufgelöst.
   - Benutzerdefinierte Laufzeitmakros können bei manuellen Aufrufen ebenfalls eingefügt werden.

2. Optional ein vorheriger Eintrag
   - Wenn für diesen Side-Prompt bereits Inhalt gespeichert ist, kann STMB die aktuelle Fassung zuerst einfügen.
   - So kann das Modell einen bestehenden Tracker aktualisieren, statt jedes Mal komplett neu zu beginnen.

3. Optionaler Kontext aus früheren Erinnerungen
   - Wenn die Vorlage frühere Erinnerungen anfordert, fügt STMB sie als Nur-Lese-Kontext ein.

4. Der kompilierte Szenentext
   - Das ist das aktuelle Szenenmaterial, auf das der Tracker reagieren soll.

5. Optionale Hinweise zum Antwortformat
   - Das ist kein erzwungenes Parser-Schema.
   - Es sind einfach zusätzliche Anweisungen für das Format, das du haben willst.

Sehr grob sieht das so aus:

```text
[Anweisungen des Side-Prompts]

=== PRIOR ENTRY ===
[bestehender Tracker-Text, falls vorhanden]

=== PREVIOUS SCENE CONTEXT (DO NOT SUMMARIZE) ===
[optionale frühere Erinnerungen]
=== END PREVIOUS SCENE CONTEXT ===

=== SCENE TEXT ===
[kompilierter Szenentext]

=== RESPONSE FORMAT ===
[optionale Hinweise zum Format]
```

### Was das Modell zurückgeben soll

STMB erwartet hier Klartext, der direkt gespeichert werden kann.

Genau das ist der entscheidende Unterschied zu Erinnerungen:

- Side-Prompts wollen kein JSON.
- STMB speichert den zurückgegebenen Text normalerweise unverändert.
- Wenn du in einem Side-Prompt JSON verlangst, ist dieses JSON nur Text, solange dein eigener Workflow nichts anderes daraus macht.

Das bedeutet: Side-Prompt-Prompts sollten auf nutzbare Endausgabe zielen, nicht auf parserfreundliches Erinnerungs-JSON.

### Was einen guten Side-Prompt ausmacht

Gute Side-Prompts sind eng gefasst, stabil und gut aktualisierbar.

Beispiele:

- Eine Figurenliste in Reihenfolge der Wichtigkeit pflegen
- Den aktuellen Beziehungsstatus festhalten
- Offene Handlungsstränge verfolgen
- Festhalten, was `{{char}}` aktuell über `{{user}}` glaubt

Gute Formulierungen für Side-Prompts machen meistens Folgendes:

1. Sie definieren die Aufgabe klar
   - "Pflege eine Figurenliste"
   - "Aktualisiere das aktuelle Beziehungsblatt"
   - "Halte einen Bericht zu offenen Handlungssträngen"

2. Sie sagen, ob aktualisiert, ersetzt oder angehängt werden soll
   - Das ist wichtig, weil ein vorheriger Eintrag Teil des Kontexts sein kann.

3. Sie definieren den Aufbau der Ausgabe
   - Überschriften
   - Listenstruktur
   - Abschnitte
   - Reihenfolge

4. Sie sagen, was nicht hinein soll
   - Spekulationen
   - Duplikate
   - veraltete Informationen
   - Erklärungen über die Aufgabe selbst

### Was einen schwachen Side-Prompt ausmacht

- Er ist zu breit: "Verfolge einfach alles."
- Er sagt nie, ob der alte Eintrag überarbeitet oder komplett neu geschrieben werden soll.
- Er fordert Erklärungen oder Chain-of-Thought statt fertigem Tracker-Text.
- Er lässt das Format so vage, dass der Tracker mit der Zeit auseinanderdriftet.

### Praktische Hinweise für Side-Prompts

- Schreibe Side-Prompts wie Wartungsanweisungen, nicht wie Zusammenfassungs-Prompts.
- Gehe davon aus, dass das Modell zuerst den aktuellen Tracker und danach die neue Szene sieht.
- Halte jeden Tracker auf genau eine Aufgabe fokussiert.
- Nutze das Antwortformat-Feld, um Aufbau, Abschnittsnamen und Reihenfolge zu steuern.

## III. Konsolidierung

Die Konsolidierung fasst niedrigere Ebenen zu höheren Zusammenfassungen zusammen.

Beispiele:

- Erinnerungen zu Arc-Zusammenfassungen
- Arc-Zusammenfassungen zu Kapitel-Zusammenfassungen
- Kapitel-Zusammenfassungen zu Buch-Zusammenfassungen

Wenn die Konsolidierung läuft, stellt STMB normalerweise diese Teile in dieser Reihenfolge zusammen:

1. Der ausgewählte Konsolidierungs-Prompt oder Voreinstellungstext
   - Er erklärt, wie die Quell-Einträge verdichtet werden sollen.
   - Er definiert zugleich das JSON-Schema, das das Modell zurückgeben soll.

2. Optional eine frühere Zusammenfassung der höheren Ebene
   - Wenn eine frühere Zusammenfassung dieser Ebene weitergeführt wird, wird sie zuerst als kanonischer Kontext eingefügt.
   - Der Prompt sagt dem Modell ausdrücklich, dass dieser Teil nicht umgeschrieben werden soll.

3. Die ausgewählten Einträge der niedrigeren Ebene in chronologischer Reihenfolge
   - Jeder Quell-Eintrag wird mit Kennung, Titel und Inhalt eingefügt.
   - Das ist das Material, das das Modell gruppieren, verdichten und in höhere Zusammenfassungen umwandeln soll.

Sehr grob sieht das so aus:

```text
[Anweisungen aus Konsolidierungs-Prompt oder Voreinstellung]

=== PREVIOUS ARC/CHAPTER/BOOK (CANON - DO NOT REWRITE) ===
[optionale frühere Zusammenfassung der höheren Ebene]
=== END PREVIOUS ... ===

=== MEMORIES / ARCS / CHAPTERS ===
=== memory 001 ===
Title: ...
Contents: ...
=== end memory 001 ===

=== memory 002 ===
Title: ...
Contents: ...
=== end memory 002 ===
...
=== END ... ===
```

### Was das Modell zurückgeben soll

STMB erwartet hier ein JSON-Objekt in dieser Form:

```json
{
  "summaries": [
    {
      "title": "Short higher-tier title",
      "summary": "The consolidated recap text",
      "keywords": ["keyword1", "keyword2"],
      "member_ids": ["001", "002"]
    }
  ],
  "unassigned_items": [
    {
      "id": "003",
      "reason": "Why this item was left out"
    }
  ]
}
```

Die wichtige Idee dahinter:

- Die Konsolidierung kann eine oder mehrere Zusammenfassungen zurückgeben.
- `member_ids` sagt STMB, welche Quell-Einträge zu welcher Zusammenfassung gehören.
- `unassigned_items` ist die Art, wie das Modell sagt: "Dieser Eintrag passt nicht in die Zusammenfassung, die ich gerade erstellt habe."

### Was einen guten Konsolidierungs-Prompt ausmacht

Gute Konsolidierungs-Prompts machen drei Dinge gut:

1. Sie definieren das Ziel der Verdichtung
   - ein einzelner Arc
   - ein oder mehrere Arcs
   - kompakte, aber vollständige Zusammenfassung
   - stark verdichtete Zusammenfassung

2. Sie definieren die Logik der Auswahl
   - Chronologie bewahren
   - Kontinuität bewahren
   - zusammengehörige Einträge zusammenfassen
   - nicht passende Einträge als nicht zugeordnet markieren

3. Sie definieren die JSON-Struktur sehr klar

Die besten Konsolidierungs-Prompts sagen dem Modell zusätzlich, was erhalten bleiben soll:

- wichtige Story-Beats
- Wendepunkte
- Versprechen
- Konsequenzen
- offene Fäden
- Veränderungen in Beziehungen
- Zitate oder Kennungen, die für die Kontinuität wichtig sind

### Was einen schwachen Konsolidierungs-Prompt ausmacht

- Er fordert eine Zusammenfassung, erklärt aber nicht, wie Quell-Einträge gruppiert werden sollen.
- Er sagt nicht, was mit Ausreißern oder unpassenden Einträgen passieren soll.
- Er fordert `member_ids` nicht ein.
- Er verlangt freien Fließtext statt des JSON-Objekts für die Konsolidierung.
- Er legt zu viel Gewicht auf Stil und zu wenig auf Auswahl- und Gruppierungslogik.

### Praktische Hinweise für Konsolidierungs-Prompts

- Sage dem Modell klar, ob du eine einzige kohärente Zusammenfassung willst oder die kleinste sinnvolle Anzahl von Zusammenfassungen.
- Verlange Chronologie.
- Verlange eine explizite Behandlung von Resten und Ausreißern.
- Halte auch hier die Keywords konkret, weil höhere Zusammenfassungen trotzdem noch für den Abruf nützlich sein sollen.

## Die eigentliche Regel für Prompt-Schreiben

Wenn du für STMB schreibst, denke nicht nur: "Was soll die KI sagen?"

Denk stattdessen:

1. Welchen Kontext setzt STMB vor die eigentliche Szene?
2. Was ist die wirkliche Einheit des Materials, das analysiert wird?
3. Erwartet dieser Ablauf striktes JSON oder fertigen Klartext?
4. Welche Informationen sollen für den späteren Abruf erhalten bleiben?
5. Was soll das Modell ignorieren, verdichten, bewahren oder weitertragen?

Wenn dein Prompt diese fünf Fragen klar beantwortet, funktioniert er mit STMB meistens gut.

## FAQ-Notizen

- "Kann ich sehen, was tatsächlich an die KI gesendet wurde?"
  Ja. Schau in dein Terminal oder Log, wenn du den zusammengesetzten Prompt ansehen willst.

- "Erzwingt STMB gute Ausgabe, selbst wenn mein Prompt schwach ist?"
  Nicht wirklich. STMB kann fehlerhaftes JSON manchmal retten, aber es kann keinen vagen Prompt reparieren, der von Anfang an das Falsche verlangt hat.

- "Worauf sollte ich beim Überarbeiten von Prompts zuerst optimieren?"
  Optimiere zuerst das Ausgabeformat. Danach, welche Details erhalten bleiben sollen. Der Stil kommt erst danach.
