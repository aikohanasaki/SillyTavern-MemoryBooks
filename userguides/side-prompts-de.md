# 🎡 Side Prompts

Side Prompts sind zusätzliche STMB-Prompt-Durchläufe für die Chat-Wartung. Sie können unterstützende Notizen analysieren, verfolgen, zusammenfassen, bereinigen oder aktualisieren, ohne dass die normale Charakterantwort diese ganze Arbeit übernehmen muss.

Nutze sie, wenn ein Chat einen laufenden Tracker, Beziehungsbericht, eine Plotliste, ein Erfindungsprotokoll, NPC-Statusblatt, eine Zeitleiste oder ein ähnliches Unterstützungsdokument braucht. Der Charakter kann weiter Rollenspiel machen. Der Side Prompt erledigt den Papierkram. ❤️

## Inhaltsverzeichnis

- [Was Side Prompts sind](#was-side-prompts-sind)
- [Wann du sie verwenden solltest](#wann-du-sie-verwenden-solltest)
- [Kurzanleitung zur Einrichtung](#kurzanleitung-zur-einrichtung)
- [Wie Durchläufe funktionieren](#wie-durchläufe-funktionieren)
- [Manuelle Durchläufe](#manuelle-durchläufe)
- [Automatische Durchläufe nach Memory](#automatische-durchläufe-nach-memory)
- [Side Prompt Sets](#side-prompt-sets)
- [Makros](#makros)
- [Nachrichtenbereiche](#nachrichtenbereiche)
- [Gute Side Prompts schreiben](#gute-side-prompts-schreiben)
- [Beispiele](#beispiele)
- [Fehlerbehebung](#fehlerbehebung)
- [Wichtige Punkte](#wichtige-punkte)

---

## Was Side Prompts sind

Ein Side Prompt ist ein benannter Prompt, der getrennt von der normalen Charakterantwort ausgeführt wird.

Er kann Folgendes erstellen oder aktualisieren:

- Plot-Tracker
- Beziehungs-Tracker
- NPC- oder Fraktionsnotizen
- Inventar- oder Ressourcenlisten
- Zeitleisten
- Mystery- oder Hinweisboards
- Erfindungs- oder Projekt-Tracker
- Kontinuitätsberichte
- Bereinigungsnotizen
- Lorebook-artige Unterstützungseinträge

Side Prompts unterscheiden sich von normalen Memories. Memories speichern normalerweise Szenenzusammenfassungen in Reihenfolge. Side Prompts pflegen eher ein laufendes Statusdokument, das aktualisiert oder überschrieben wird.

Sie müssen außerdem **kein** JSON zurückgeben. Klartext und Markdown sind in Ordnung, sofern dein konkreter Prompt oder Speicherziel nichts Strengeres verlangt.

---

## Wann du sie verwenden solltest

Verwende Side Prompts für strukturierte Unterstützungsarbeit.

Gute Anwendungsfälle:

- **Plotpunkte:** aktive Handlungsfäden, gelöste Fäden, offene Enden
- **Beziehungen:** Vertrauen, Spannung, Anziehung, Grenzen, Ziele
- **NPCs:** was jeder NPC weiß, will, kürzlich getan hat oder als Nächstes braucht
- **Zeitleiste:** Daten, Reisen, Verletzungen, Fristen, Countdowns
- **Weltstatus:** geänderte Orte, Objekte, Fraktionen, Ressourcen
- **Mysteries:** Hinweise, Verdächtige, Widersprüche, offene Fragen
- **Projekte:** Erfindungen, Forschung, Blocker, Scope Drift, nächste Schritte
- **Kontinuität:** wahrscheinliche Halluzinationsrisiken oder fehlender Kontext

Schlechte Anwendungsfälle:

- alles, was in der nächsten Charakterantwort erscheinen muss
- vage „mach die Geschichte besser“-Prompts
- riesige Analyse-Prompts, die bei jedem Durchlauf Essays erzeugen
- doppelte Memory-Zusammenfassungen ohne eigene Aufgabe

Side Prompts sind keine Magie. Ein vager Side Prompt ist nur organisierte Vagheit.

---

## Kurzanleitung zur Einrichtung

Brauchst du die Klick-für-Klick-Version? Nutze die [Scribe-Anleitung zum Aktivieren von Side Prompts](https://scribehow.com/viewer/How_to_Enable_Side_Prompts_in_Memory_Books__fif494uSSjCmxE2ZCmRGxQ).

Der kurze Weg ist: Öffne **Extensions**, öffne **Memory Books**, klicke auf **Side Prompts**, wähle den gewünschten Prompt aus, aktiviere ihn, schalte optional **Run automatically after memory** ein und klicke dann auf **Save** und **Close**.

---

## Wie Durchläufe funktionieren

Ein normaler Side-Prompt-Durchlauf folgt diesem Grundablauf:

1. STMB wählt die Nachrichten aus, die geprüft werden sollen.
2. Der Side Prompt wird vorbereitet.
3. Benötigte Makros werden ausgefüllt.
4. Das Modell erzeugt die Side-Prompt-Ausgabe.
5. STMB prüft die Ausgabe.
6. Das Ergebnis wird je nach Side-Prompt-Einstellungen als Vorschau angezeigt, gespeichert, aktualisiert oder übersprungen.

Manuelle Side Prompts, Side Prompts nach Memory und Zeilen in Side Prompt Sets sollten sich wie dasselbe System anfühlen. Sie teilen dasselbe allgemeine Ausführungsverhalten für Vorschauen, Batching, Prüfungen auf leere Antworten, Speichern, Stopp-Verhalten und Benachrichtigungen.

---

## Manuelle Durchläufe

Nutze `/sideprompt`, um einen einzelnen Side Prompt manuell auszuführen.

Grundform:

```txt
/sideprompt "Prompt Name"
```

Mit Nachrichtenbereich:

```txt
/sideprompt "Prompt Name" 10-20
```

Mit Runtime-Makro:

```txt
/sideprompt "Relationship Tracker" {{npc name}}="Alice" 10-20
```

Setze Prompt-Namen mit Leerzeichen in Anführungszeichen.

Manuelle Durchläufe eignen sich am besten für einmalige Prüfungen, gezielte Aktualisierungen und Prompts, die eigene Makrowerte brauchen.

---

## Automatische Durchläufe nach Memory

Einige Side Prompts können automatisch ausgeführt werden, nachdem eine Memory erstellt wurde.

Das ist nützlich, wenn ein Tracker mit der Chat-Entwicklung aktuell bleiben soll. Ein Beziehungs-Tracker oder Plot-Tracker kann sich zum Beispiel nach jeder Memory aktualisieren.

Es gibt zwei After-Memory-Modi:

- **Use individually-enabled side prompts** — altes Verhalten; jeder Side Prompt mit aktivierter Option **Run automatically after memory** kann laufen.
- **Use a named Side Prompt Set** — stattdessen wird das ausgewählte Set ausgeführt.

Ein ausgewähltes Side Prompt Set ersetzt einzeln aktivierte After-Memory-Side-Prompts. Es wird **nicht** zusätzlich zu ihnen ausgeführt. Das verhindert doppelte Durchläufe durch alte Checkboxen, die Benutzer vergessen haben.

---

## Side Prompt Sets

Side Prompt Sets gruppieren mehrere Side Prompts zu einem geordneten Workflow.

Ein Set ist eine geordnete Ausführungsliste, nicht nur ein Ordner. Derselbe Side Prompt kann mehrmals mit unterschiedlichen Makrowerten vorkommen.

Beispiel-Set:

1. Relationship Tracker mit `{{npc name}} = Alice`
2. Relationship Tracker mit `{{npc name}} = Bob`
3. Plot Points Tracker
4. Scene Cleanup Notes

Dadurch kann eine Prompt-Vorlage getrennte Einträge für verschiedene NPCs, Fraktionen, Orte oder Projekte pflegen.

### Sets verwalten

Öffne **🎡 Trackers & Side Prompts**, um Sets zu erstellen, zu bearbeiten, zu duplizieren, zu löschen oder neu zu ordnen.

Jede Zeile kann enthalten:

- einen Side Prompt
- ein optionales Zeilenlabel
- gespeicherte Makrowerte
- Steuerelemente zum Duplizieren/Löschen
- Steuerelemente zum Verschieben nach oben/unten

Zeilen laufen von oben nach unten. Setze grundlegende Tracker zuerst und Bereinigungs- oder Berichtsprompts später.

### Ein Set manuell ausführen

Führe ein Set mit gespeicherten Werten aus:

```txt
/sideprompt-set "Set Name"
```

Mit Bereich:

```txt
/sideprompt-set "Set Name" 10-20
```

Führe ein wiederverwendbares Set mit Makrowerten aus:

```txt
/sideprompt-macroset "Relationship Pass" {{npc_1}}="Alice" {{npc_2}}="Bob" 10-20
```

Nutze `/sideprompt-macroset`, wenn das Set wiederverwendbare Tokens enthält, die noch Werte brauchen.

### Fehlende Sets oder Zeilen

Side Prompt Sets sind absichtlich streng:

- Wenn kein Set ausgewählt ist, wird das Verhalten für einzeln aktivierte After-Memory-Prompts verwendet.
- Wenn ein Set ausgewählt ist, werden einzeln aktivierte After-Memory-Prompts ignoriert.
- Wenn das ausgewählte Set gelöscht wurde, läuft nichts und STMB warnt dich.
- Wenn eine Zeile auf einen gelöschten Prompt zeigt, wird diese Zeile übersprungen und STMB warnt dich.
- Wenn eine Zeile noch einen Makrowert braucht, wird diese Zeile übersprungen und STMB warnt dich.

Stiller Fallback wäre schlechter. Wenn ein ausgewählter Workflow kaputt ist, solltest du es wissen.

---

## Makros

Side Prompts können normale SillyTavern-Makros wie `{{user}}` und `{{char}}` verwenden.

Sie können außerdem Runtime-Makros verwenden. Das sind Platzhalter, die beim Ausführen des Side Prompts ausgefüllt werden.

Beispiel für ein Runtime-Makro:

```txt
{{npc name}}
```

Manueller Durchlauf:

```txt
/sideprompt "Relationship Tracker" {{npc name}}="Alice"
```

Gespeicherter Set-Wert:

```txt
{{npc name}} = Alice
```

Wiederverwendbarer Set-Level-Wert:

```txt
{{npc name}} = {{npc_1}}
```

Dann ausführen:

```txt
/sideprompt-macroset "Relationship Pass" {{npc_1}}="Alice"
```

### Makro-Tipps

Nutze langweilige Namen:

```txt
{{npc name}}
{{npc_1}}
{{faction}}
{{project_name}}
```

Vermeide Namen wie:

```txt
{{the guy we mean}}
{{stuff}}
{{important person}}
```

Leerzeichen sind in der UI lesbar. Unterstriche sind in Slash-Commands meistens weniger nervig.

Ein Side Prompt mit eigenen Runtime-Makros sollte nicht einzeln automatisiert werden, außer die benötigten Werte sind irgendwo gespeichert, zum Beispiel in einer Zeile eines Side Prompt Sets. Automatische Durchläufe können nicht anhalten und fragen, wer mit `{{npc name}}` gemeint ist.

---

## Nachrichtenbereiche

Side Prompts können für einen bestimmten Nachrichtenbereich ausgeführt werden.

```txt
/sideprompt "Plot Points" 50-80
```

Wenn du einen Bereich angibst, verwendet STMB diesen Bereich.

Wenn du keinen Bereich angibst, verwendet STMB das normale Since-Last-Verhalten mit vorhandener Cap-/Checkpoint-Logik.

Für Routine-Tracking ist Since-Last-Verhalten einfacher. Für Debugging oder gezielte Bereinigung sind explizite Bereiche klarer.

Das Zusammenstellen von Side-Prompt-Bereichen sollte dieselbe Präferenz für versteckte Nachrichten verwenden wie Memory, einschließlich der globalen Unhide-Before-Memory-Einstellung.

---

## Gute Side Prompts schreiben

Ein guter Side Prompt hat eine Aufgabe. Ein schlechter Side Prompt hat Vibes.

Sei klar darüber:

- was geprüft werden soll
- was aktualisiert werden soll
- was ignoriert werden soll
- welches Format ausgegeben werden soll
- wie lang die Ausgabe sein soll
- ob er ersetzen, überarbeiten oder anhängen soll

### Ausgabe absichtlich kurz halten

Tracker blähen sich auf, wenn man ihnen nicht sagt, dass sie es lassen sollen.

Schwach:

```txt
Update the relationship tracker.
```

Besser:

```txt
Update the relationship tracker. Preserve useful facts, remove resolved or obsolete details, and keep each entry to 1-3 concise bullets. Output only the updated tracker.
```

Nützliche Leitplanken:

```txt
Do not append a new section unless there is genuinely new information. Merge updates into existing entries when possible.
```

```txt
Remove resolved threads. Do not preserve stale speculation just because it appeared in the old tracker.
```

```txt
Output only the updated report. No commentary, no explanation, no preface.
```

### Stabile Überschriften verwenden

Stabile Überschriften machen wiederholte Aktualisierungen sauberer.

Gut:

```md
# Relationship Tracker

## Current Status

## Recent Changes

## Open Tensions

## Next Likely Developments
```

Schlecht:

```md
# Here is my extensive and emotionally intelligent breakdown of everything that might be happening
```

### Nicht nach allem fragen

Ein Side Prompt, der nach jedem Detail fragt, wird meistens jedes Detail ausgeben.

Wähle, was zählt. Ein Plot-Tracker braucht normalerweise den ungelösten Hook, was sich geändert hat, wer es weiß und was nachverfolgt werden muss. Er braucht nicht jeden Gesichtsausdruck in der Szene.

### Makronutzung offensichtlich machen

Gute Namen:

```txt
Relationship Tracker - {{npc name}}
NPC Status - {{npc name}}
Faction Tracker - {{faction}}
```

Weniger nützliche Namen:

```txt
Tracker 3
Update thing
Misc relationship prompt
```

Benutzer sollten nicht den ganzen Prompt-Text öffnen müssen, um zu verstehen, warum er nach einem Wert fragt.

---

## Beispiele

### Plot Points Tracker

Nutze dies, wenn ein Chat mehrere aktive Handlungsstränge hat.

```txt
Update the plot points tracker based on the selected messages. Keep only active or recently resolved threads. Group by storyline. Output only the updated tracker.
```

Vorgeschlagene Form:

```md
# Plot Points

## Active Threads

1. **Missing artifact** — Current status and latest clue.
2. **Rival faction** — What they want and what changed.

## Recently Resolved

1. **Old misunderstanding** — Resolved when Alice told Bob the truth.

## Needs Follow-Up

1. Who has the key?
2. Why did the guard lie?
```

### Relationship Tracker mit Makro

Prompt benötigt:

```txt
{{npc name}}
```

Manueller Durchlauf:

```txt
/sideprompt "Relationship Tracker" {{npc name}}="Alice" 10-40
```

Set-Zeilen:

| Zeile | Side Prompt | Gespeichertes Makro |
|---|---|---|
| 1 | Relationship Tracker | `{{npc name}} = Alice` |
| 2 | Relationship Tracker | `{{npc name}} = Bob` |

So musst du keine getrennten Prompt-Definitionen für jeden NPC erstellen.

### Erfindungs- oder Projekt-Tracker

Nutze dies, wenn ein Benutzer über längere Zeit etwas erfindet, erforscht, baut oder verändert.

```txt
Update the project tracker. Track only meaningful changes in goal, progress, blockers, scope, dependencies, or story relevance. Keep entries concise and ordered by first introduction.
```

Das ist meist sauberer als zehn Memory-Einträge zu speichern, die alle sagen, dass das Projekt existiert.

### Wiederverwendbarer Cast Pass

Erstelle ein Set mit Set-Level-Runtime-Tokens:

```txt
{{npc_1}}
{{npc_2}}
```

Führe es aus:

```txt
/sideprompt-macroset "Cast Pass" {{npc_1}}="Alice" {{npc_2}}="Bob"
```

Später wiederverwenden:

```txt
/sideprompt-macroset "Cast Pass" {{npc_1}}="Mira" {{npc_2}}="Jonas"
```

Dasselbe Set. Andere Besetzung. 💡

---

## Fehlerbehebung

### Mein Side Prompt wurde nach Memory nicht ausgeführt.

Prüfe:

- Ist Memory tatsächlich gelaufen?
- Ist der Side Prompt für After-Memory-Durchläufe aktiviert?
- Verwendet der Chat **Use individually-enabled side prompts**?
- Verwendet der Chat stattdessen ein Side Prompt Set?
- Braucht der Prompt einen Makrowert, der nicht angegeben wurde?
- Wurde der Prompt gelöscht, umbenannt oder verschoben?

Wenn der Chat ein Side Prompt Set verwendet, werden einzeln aktivierte After-Memory-Checkboxen für diesen Chat ignoriert.

### Mein Side Prompt Set wurde nicht ausgeführt.

Prüfe:

- Ist das Set für diesen Chat ausgewählt?
- Existiert das Set noch?
- Zeigen alle Zeilen auf vorhandene Side Prompts?
- Haben alle erforderlichen Makros gespeicherte oder angegebene Werte?

Automatische Durchläufe können nicht nach fehlenden Werten fragen. Speichere Makrowerte im Set oder führe es manuell mit `/sideprompt-macroset` aus.

### Eine Zeile wurde übersprungen.

Wahrscheinliche Ursachen:

- der referenzierte Side Prompt wurde gelöscht
- der referenzierte Side Prompt wurde umbenannt
- die Zeile hat nicht aufgelöste Makros
- das Modell hat eine leere oder ungültige Antwort zurückgegeben

STMB sollte warnen, statt so zu tun, als hätte alles funktioniert.

### Die Ausgabe ist zu lang.

Füge harte Grenzen hinzu:

```txt
Keep the full output under 300 words.
```

```txt
Use no more than 5 active items.
```

```txt
Merge related details. Remove stale, resolved, or redundant details.
```

Modelle wissen nicht von selbst, wann ein Tracker nutzlos groß geworden ist. Sag es ihnen.

### Es wurde zweimal ausgeführt.

Prüfe auf:

- manuellen Durchlauf plus automatischen Durchlauf
- doppelte Zeilen innerhalb eines Sets
- wiederholte Kopien desselben Side Prompts
- mehrere Chats oder Tabs, die kurz nacheinander Arbeit auslösen

Ein ausgewähltes Side Prompt Set sollte einzeln aktivierte After-Memory-Prompts ersetzen. Das verhindert ein häufiges Problem mit doppelten Durchläufen.

### Die falschen Nachrichten wurden analysiert.

Nutze einen expliziten Bereich:

```txt
/sideprompt "Plot Points" 50-80
```

Since-Last-Verhalten ist bequem. Explizite Bereiche sind besser fürs Debugging.

### Der Tracker behält veraltete Informationen.

Sag dem Side Prompt, dass er veraltete Informationen entfernen soll.

```txt
Update the tracker. Remove obsolete speculation, resolved conflicts, and details contradicted by the selected messages.
```

Tracker bleiben nicht zufällig sauber.

---

## Wichtige Punkte

### Für Benutzer

Nutze Side Prompts, wenn du strukturierte Hilfe beim Pflegen eines langen Chats möchtest.

Manuelle Durchläufe eignen sich am besten für einmalige Analysen. After-Memory-Durchläufe oder Side Prompt Sets eignen sich am besten für Tracker, die aktuell bleiben sollen.

### Für Botmaker

Baue Side Prompts wie Wartungswerkzeuge, nicht wie Rollenspielprosa.

Nutze stabile Überschriften, strikte Ausgaberegeln und klares Aktualisierungsverhalten. Nutze Makros, wenn ein Prompt für mehrere NPCs, Fraktionen, Orte oder Projekte funktionieren soll.

### Für Admins

Side Prompts bedeuten mehr generierte Arbeit.

Deshalb sollten sie vorhersehbar, überprüfbar und im besten Sinne langweilig sein. Sets helfen, weil sie den beabsichtigten Workflow explizit machen, statt ihn in Checkbox-Suppe zu verstecken.
