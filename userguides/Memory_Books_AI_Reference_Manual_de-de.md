<!--
Copyright (C) 2024–2026 Aiko Hanasaki
SPDX-License-Identifier: AGPL-3.0-only
-->

# Memory Books: Vollständiges KI-Referenzhandbuch

**Produkt:** SillyTavern Memory Books (STMB)  
**Referenzversion:** v8.5.0, 1. August 2026  
**Zweck:** Eine einzige, kompakte und umfassende Wissensquelle für einen KI-Assistenten, der Memory Books erklärt, vermittelt und bei der Fehlerbehebung hilft.

---

## Inhaltsverzeichnis

- [1. Wie ein KI-Assistent dieses Handbuch verwenden soll](#1-wie-ein-ki-assistent-dieses-handbuch-verwenden-soll)
- [2. Produktdefinition und mentales Modell](#2-produktdefinition-und-mentales-modell)
- [3. Grundbegriffe und Funktionsauswahl](#3-grundbegriffe-und-funktionsauswahl)
- [4. Voraussetzungen, Installation und erste Prüfung](#4-voraussetzungen-installation-und-erste-prüfung)
- [5. Memory Books öffnen und das Hauptfenster verstehen](#5-memory-books-öffnen-und-das-hauptfenster-verstehen)
- [6. Memory-Book-Speichermodi](#6-memory-book-speichermodi)
- [7. Profile, Verbindungen und Generierungsrouting](#7-profile-verbindungen-und-generierungsrouting)
- [8. Szenen, manuelle Memories, automatische Memories und Catch-up](#8-szenen-manuelle-memories-automatische-memories-und-catch-up)
- [9. Token-Einsparung, ausgeblendete Nachrichten und Memory-Grenze](#9-token-einsparung-ausgeblendete-nachrichten-und-memory-grenze)
- [10. Lorebook-Aktivierung und Abruf](#10-lorebook-aktivierung-und-abruf)
- [11. Echter Group Chat Mode](#11-echter-group-chat-mode)
- [12. Narrator Mode](#12-narrator-mode)
- [13. Chat-Branches](#13-chat-branches)
- [14. Clips](#14-clips)
- [15. Topical Clips](#15-topical-clips)
- [16. Side Prompts](#16-side-prompts)
- [17. Consolidation](#17-consolidation)
- [18. Compaction](#18-compaction)
- [19. Regeneration](#19-regeneration)
- [20. Kontext für die Generierung](#20-kontext-für-die-generierung)
- [21. Prompt-Architektur, integrierte Summary Prompts und Autorenregeln](#21-prompt-architektur-integrierte-summary-prompts-und-autorenregeln)
- [22. Summary Prompt Manager und Consolidation Prompt Manager](#22-summary-prompt-manager-und-consolidation-prompt-manager)
- [23. Regex-Integration](#23-regex-integration)
- [24. Lorebook-Eintragstitel und Zeichenrichtlinie](#24-lorebook-eintragstitel-und-zeichenrichtlinie)
- [25. Job Queue und Retry-Steuerung](#25-job-queue-und-retry-steuerung)
- [26. Visuelles Feedback und Barrierefreiheit](#26-visuelles-feedback-und-barrierefreiheit)
- [27. Einstellungsübersicht und aktuelle Einstellungsreferenz](#27-einstellungsübersicht-und-aktuelle-einstellungsreferenz)
- [28. Slash-Command-Referenz](#28-slash-command-referenz)
- [29. Fehlerbehebung nach Verarbeitungsstufe](#29-fehlerbehebung-nach-verarbeitungsstufe)
- [30. FAQ](#30-faq)
- [31. Kompatibilität, Migration und aktuelle historische Hinweise](#31-kompatibilität-migration-und-aktuelle-historische-hinweise)
- [32. Entwickler- und Lizenzhinweise](#32-entwickler--und-lizenzhinweise)
- [33. Kompakter Diagnose-Entscheidungsbaum](#33-kompakter-diagnose-entscheidungsbaum)
- [34. Empfohlene minimale Lernreihenfolge](#34-empfohlene-minimale-lernreihenfolge)
- [35. Abschließende Konzeptübersicht](#35-abschließende-konzeptübersicht)

---

## 1. Wie ein KI-Assistent dieses Handbuch verwenden soll

Behandeln Sie dieses Dokument als die aktuelle Betriebsreferenz für Memory Books. Es ersetzt die Notwendigkeit, den separaten Start-Here-Guide, README, User Guide, Side-Prompts-Guide, How-STMB-Works-Guide und den historischen Changelog als einzelne Wissensdateien zu laden.

Begriffe:

- STMB = SillyTavern=MemoryBooks (diese Erweiterung)
- ST = SillyTavern (der Basiscodes, den STMB erweitert)

Wenn Sie Nutzerfragen beantworten:

1. Bewahren Sie die Memory-Books-Terminologie exakt. Ein **Memory Book** ist ein von STMB verwendetes SillyTavern-Lorebook; es ist kein eigenes Datenbankformat.
2. Unterscheiden Sie aktuelles von historischem Verhalten. Lehren Sie keinen entfernten oder ersetzten Ablauf nur deshalb, weil er in einem alten Changelog vorkam.
3. Unterscheiden Sie **Group Chat Mode** und **Narrator Mode**. Sie lösen unterschiedliche Probleme.
4. Unterscheiden Sie Memory-**Generierung**, Lorebook-**Speicherung/Konfiguration** und späteren **Abruf durch SillyTavern**. Aktivierung und Abruf gehören zum ST-Basiscode.
5. Erfinden Sie keine Bedienelemente, Menübezeichnungen, Provider-Verhaltensweisen oder Einstellungen, die hier nicht beschrieben sind.
6. Wenn ein Screenshot vorliegt, identifizieren Sie nur sichtbare Bedienelemente. Nennen Sie die unmittelbar nächste Aktion, statt ein nicht sichtbares Element anzunehmen.
7. Suchen Sie bei der Fehlerbehebung die erste fehlerhafte Stufe und testen Sie diese, bevor Sie Prompt-Umschreibungen empfehlen.
8. Bevorzugen Sie zunächst eine einfache funktionierende Konfiguration, bevor Sie erweitertes Routing, mehrere Books, benutzerdefinierte Prompts, Regex oder Side-Prompt-Automatisierung einführen.
9. Erklären Sie, dass Character-Filter und getrennte Memory Books Routing und Relevanz verbessern; sie sind keine Sicherheitsgrenze.
10. Weisen Sie auf Unsicherheit hin, wenn installierte Version, SillyTavern-Version, Provider oder benutzerdefinierter Prompt abweichen könnten.

### Hinweise zum aktuellen Dokument

Narrator Mode ist in v8.5.0 implementiert.

Mehrere ältere Einsteigertexte sagten, dass technisch eine manuelle Memory erforderlich sei, bevor automatische Memories beginnen können. Aktuelles STMB kann die erste automatische Memory ab Nachricht 0 erzeugen, wenn noch keine Baseline für verarbeitete Nachrichten existiert. Eine erste manuelle Memory wird trotzdem empfohlen, weil sie Verbindung, Memory Book, Ausgabeformat und gewünschte Startgrenze überprüft, bevor der Automatisierung vertraut wird.

---

## 2. Produktdefinition und mentales Modell

Memory Books ist eine SillyTavern-Erweiterung, die ausgewählte oder automatisch bestimmte Chatbereiche in strukturierte Memory-Einträge umwandelt und in SillyTavern-Lorebooks speichert.

Grundablauf:

```text
Chat-Nachrichten
    ↓
STMB wählt oder erhält einen Nachrichtenbereich
    ↓
STMB baut eine KI-Anfrage zusammen
    ↓
Das Modell liefert eine strukturierte Memory
    ↓
STMB speichert einen Lorebook-Eintrag
    ↓
Alte verarbeitete Chat-Nachrichten können aus dem aktiven Kontext ausgeblendet werden
    ↓
SillyTavern aktiviert später relevante Lorebook-Einträge
    ↓
Das Chat-Modell erhält diese Einträge als Kontext
```

STMB gibt einem Modell kein permanentes internes Gedächtnis. Es verwaltet ein externes Referenzsystem aus Lorebook-Einträgen. Das Chat-Modell „erinnert“ sich, wenn SillyTavern relevante Lorebook-Einträge in die Anfrage an die KI einfügt.

### Drei getrennte Stufen

1. **Generierungsqualität** — Hat das Memory-Generierungsmodell eine korrekte, nützliche Ausgabe erzeugt?
2. **Speicherung und Konfiguration** — Wurde sie im vorgesehenen Memory Book mit geeigneten Aktivierungseinstellungen gespeichert?
3. **Abruf und Modellnutzung** — Hat SillyTavern den Eintrag aktiviert und gesendet, und hat das Chat-Modell ihn korrekt genutzt?

Beheben Sie Probleme in diesen Stufen getrennt.

### Lorebooks und Memory Books

Ein **Lorebook**, in Teilen von SillyTavern auch **World Info** genannt, ist eine Sammlung von Einträgen, die SillyTavern bedingt einer Modellanfrage hinzufügen kann. Ein Lorebook-Eintrag hat normalerweise:

- Titel/Kommentar;
- Inhalt;
- Aktivierungs-Keywords oder einen anderen Aktivierungsmodus;
- Einfügeposition und Reihenfolge;
- Rekursions- und Budgetsteuerung;
- optional Character-Filter und weitere Metadaten.

Ein **Memory Book** ist ein gewöhnliches SillyTavern-Lorebook, das STMB verwendet. Es kann mit normalen Lorebook-Werkzeugen geöffnet, bearbeitet, sortiert, exportiert, importiert oder gelöscht werden. Abhängig von den verwendeten Funktionen kann es enthalten:

- Scene Memories;
- Arc-, Chapter-, Book-, Legend-, Series- oder Epic-Zusammenfassungen;
- Clip- und Topical-Clip-Einträge;
- Side-Prompt-Tracker-Einträge;
- weitere von STMB verwaltete Einträge.

### Memory-Einträge sind komprimierter Kontext

Eine Scene Memory ist nicht das Originaltranskript. Sie ist eine komprimierte Darstellung, die kontinuitätsrelevante Informationen bewahren soll, etwa:

- Ereignisse und Folgen;
- Entscheidungen und Pläne;
- Entdeckungen und Enthüllungen;
- Beziehungs- oder Gefühlsveränderungen;
- individuelles Wissen, Überzeugungen oder Missverständnisse;
- wichtige Objekte, Orte, Identitäten, Versprechen und Einschränkungen.

Das Ausblenden verarbeiteter Nachrichten löscht sie nicht. Sie werden lediglich nicht mehr an die KI gesendet und verbrauchen daher keinen aktiven Chat-History-Kontext.

---

## 3. Grundbegriffe und Funktionsauswahl

| Bedarf | Funktion | Bedeutung |
|---|---|---|
| Einen ausgewählten oder automatischen Chatbereich zusammenfassen | **Memory** | „Merke dir, was in dieser Szene passiert ist.“ |
| Ausgewählten Wortlaut oder eine einzelne Tatsache speichern | **Clip** | „Speichere diese Notiz.“ |
| Fakten zu einem Thema aus gespeicherten Memories sammeln | **Topical Clip** | „Sammle alles, was meine Memories hierzu sagen.“ |
| Sich verändernde Informationen über mehrere Läufe pflegen | **Side Prompt** | „Halte diesen Tracker aktuell.“ |
| Mehrere niedrigere Memories/Zusammenfassungen verbinden | **Consolidation** | „Rolle diese Einträge in eine höherstufige Zusammenfassung auf.“ |
| Einen vorhandenen STMB-Eintrag kürzen | **Compaction** | „Kürze diesen Eintrag, ohne Fakten zu verlieren.“ |
| Einen Eintrag anhand seiner ursprünglichen Quellen ersetzen | **Regeneration** | „Baue diesen Eintrag neu und prüfe den Ersatz.“ |

### Häufig verwechselte Unterschiede

- **Clip vs. Topical Clip:** Ein Clip beginnt mit markiertem Text im aktuellen Chat. Ein Topical Clip beginnt mit bereits bestätigten STMB Memories.
- **Topical Clip vs. Side Prompt:** Ein Topical Clip wird manuell ausgeführt, um ein Thema zu sammeln. Ein Side Prompt kann einen veränderlichen Tracker wiederholt pflegen.
- **Compaction vs. Consolidation:** Compaction schreibt einen Eintrag neu. Consolidation erzeugt aus mehreren Einträgen eine neue höherstufige Zusammenfassung.
- **Memory vs. Side Prompt:** Memories sind normalerweise sequenzielle Szenenaufzeichnungen. Side Prompts aktualisieren oder überschreiben meist ein fortlaufendes Hilfsdokument.
- **Generierung vs. Abruf:** Ein erzeugter Eintrag wird nicht automatisch garantiert später von SillyTavern aktiviert.

---

## 4. Voraussetzungen, Installation und erste Prüfung

### Voraussetzungen

- SillyTavern 1.18.0 oder neuer; die neueste kompatible Version wird empfohlen.
- Eine funktionierende KI-Verbindung.
- Ein Modell, das Anweisungen befolgen und für Memory-/Consolidation-Abläufe gültiges JSON liefern kann.
- Berechtigung zur Installation von Drittanbieter-Erweiterungen in SillyTavern.
- Ein in SillyTavern verfügbarer Chat-Completion-Preset, wenn ein lokales oder Text-Completion-Backend über einen OpenAI-kompatiblen Chat-Completion-Endpunkt verwendet wird.

### Normale Chat-Completion-Nutzer

OpenAI, Anthropic/Claude, OpenRouter, Gemini/Google und andere Chat-Completion-Verbindungen können normalerweise das integrierte Profil **Current SillyTavern Settings** verwenden.

### Lokale und Text-Completion-Nutzer

KoboldCpp, llama.cpp, TextGen, Ollama und ähnliche Backends funktionieren meist am zuverlässigsten über einen OpenAI-kompatiblen Chat-Completion-Endpunkt. Selbst wenn normales Rollenspiel Text Completion verwendet, muss SillyTavern für STMB einen Chat-Completion-Preset haben.

Typische KoboldCpp-Einrichtung:

- API-Typ: Chat Completion;
- Quelle: Custom OpenAI-compatible;
- Endpoint z. B. `http://localhost:5001/v1` oder `http://127.0.0.1:5000/v1`;
- ein beliebiger nicht leerer Custom-API-Key, falls SillyTavern einen verlangt;
- Model-ID im vom Endpoint erwarteten Format, oft `koboldcpp/modelname`, ohne unnötige `.gguf`-Endung;
- Chat-Completion-Preset importiert;
- Antwortlänge mindestens 2048 Tokens, 4096 ist häufig sicherer.

Typische llama.cpp-Einrichtung:

- API-Typ: Chat Completion;
- Quelle: Custom OpenAI-compatible;
- Endpoint `http://localhost:8080/v1` oder `http://host.docker.internal:8080/v1`, wenn SillyTavern in Docker läuft;
- beliebiger nicht leerer API-Key, falls erforderlich;
- die ausgelieferte Model-ID;
- kein Prompt-Post-Processing, außer der Endpoint verlangt es.

Beispiel für den Serverbefehl:

```sh
llama-server -m <model-path> -c <context-size> --port 8080
```

### Optional: Chat Top Bar

STMB funktioniert ohne Chat Top Bar / Chat Top Info Bar. Mit dieser Erweiterung wird die **Memory Books Jobs**-Queue für aktive, abgeschlossene, fehlgeschlagene, abgebrochene, blockierte oder prüfungsbedürftige Arbeit verfügbar.

### Installation

1. Öffnen Sie SillyTavern.
2. Öffnen Sie das Hauptfenster **Extensions**.
3. Wählen Sie **Install Extension**.
4. Installieren Sie das offizielle Memory-Books-Repository.
5. Laden Sie SillyTavern neu, falls dazu aufgefordert.
6. Öffnen Sie einen Character- oder Group-Chat.
7. Warten Sie einige Sekunden, bis die STMB-Bedienelemente initialisiert sind.

SillyTavern Extras ist nicht erforderlich.

### Prüfen, ob STMB geladen wurde

Mindestens eines davon sollte sichtbar sein:

- **Memory Books** im Zauberstab-Extensions-Menü neben dem Chat-Eingabefeld;
- die Szenen-Chevrons **►** und **◄** in den erweiterten Nachrichtenaktionen.

Falls keines sichtbar ist:

1. bis zu zehn Sekunden warten;
2. Seite aktualisieren;
3. prüfen, ob die Erweiterung installiert und aktiviert ist;
4. Character- oder Group-Chat erneut öffnen;
5. Browserkonsole erst prüfen, nachdem die Grundchecks fehlgeschlagen sind.

---

## 5. Memory Books öffnen und das Hauptfenster verstehen

Öffnen Sie das Zauberstab-Extensions-Menü neben der Chat-Eingabe und wählen Sie **Memory Books**.

Das Fenster kann enthalten:

- Current Scene;
- Memory Status / höchste verarbeitete Nachricht;
- Current Lorebook Configuration;
- Memory Profiles;
- Profile Actions;
- Extra Function Buttons;
- Prompt Managers;
- General Settings;
- Automatic Memories;
- Token Saving;
- Group-Character- oder Narrator-Bedienelemente, wenn relevant.

Für die erste Memory sind nur drei Entscheidungen nötig:

1. Welches Memory Book erhält den Eintrag?
2. Welches Profil/welche Verbindung erzeugt ihn?
3. Welche Chat-Nachrichten bilden die Szene?

---

## 6. Memory-Book-Speichermodi

### 6.1 Automatic Mode: chatgebundenes Memory Book

Automatic Mode ist der normale Standard. STMB verwendet das über SillyTavern an den aktuellen Chat gebundene Lorebook.

Verwenden Sie ihn, wenn:

- ein Chat ein primäres Memory Book hat;
- minimale Konfiguration gewünscht ist;
- Group-Characters keine getrennten Memory Books benötigen.

Wenn kein Lorebook gebunden ist, binden Sie eines in SillyTavern oder verwenden Sie Auto-Create.

### 6.2 Auto-Create Lorebook Mode

Aktivieren Sie **Auto-create lorebook if none exists**, damit STMB beim ersten Speichern einer Memory ein Lorebook erzeugt und bindet.

Das Standard-Namensschema kann verwenden:

- `{{char}}` — Character- oder Gruppenname;
- `{{user}}` — Nutzername;
- `{{chat}}` — Chat-ID/-Name.

STMB fügt bei Bedarf numerische Suffixe hinzu, um doppelte Namen zu vermeiden.

Auto-Create und Manual Lorebook Mode schließen sich gegenseitig aus.

### 6.3 Manual Lorebook Mode

Aktivieren Sie **Manual Lorebook Mode**, um ein Memory Book unabhängig vom chatgebundenen Lorebook auszuwählen.

Verwenden Sie ihn, wenn:

- Memories in einem dedizierten Lorebook liegen sollen;
- mehrere Chats absichtlich ein Memory Book teilen;
- Gruppenmitglieder getrennte Books benötigen;
- Narrator Mode verwendet wird;
- der Nutzer den daraus entstehenden Aktivierungsplan versteht.

Die Hauptauswahl des manuellen Memory Books wird pro Chat gespeichert, außer ein persistenter Character-Lock überschreibt sie in einem kompatiblen Solochat.

### 6.4 Getrennte Memory Books sind meist übersichtlicher

Ein eigenes Memory Book erleichtert:

- Trennung von Memories, Character-Definitionen und Setting-Lore;
- eigenes Lorebook-Budget und eigene Reihenfolge;
- Wiederverwendung oder Export der Memory-Historie;
- Prüfung STMB-verwalteter Einträge ohne fremdes Lore;
- Diagnose der Aktivierung.

Dies ist eine Empfehlung, keine Pflicht.

### 6.5 Character Memory Book Locks

Ein Character Memory Book Lock ist eine persistente Manual-Mode-Zuordnung zu einer Character Card.

Im Solochat:

- ein nicht gesperrtes manuelles Book gehört zum aktuellen Chat;
- ein gesperrtes Book folgt der Character Card in kompatible Manual-Mode-Chats;
- das manuelle Book kann erst nach Entsperren geändert werden.

Im echten Group Chat:

- eine ungesperrte Zuordnung pro Character gehört zum aktuellen Group Chat;
- eine gesperrte Zuordnung folgt dieser Character Card in kompatible Manual-Mode-Gruppen;
- ein fehlendes gesperrtes Book führt zu einem Broken-Lock-Zustand, der entsperrt oder repariert werden muss.

Verwenden Sie Locks nur, wenn derselbe Character absichtlich ein fortlaufendes Memory Book über mehrere Geschichten teilen soll. Für Alternate Universes oder unabhängige Timelines sind sie riskant.

### 6.6 Empfohlene Ausgangskonfiguration

- Solochat: ein chatgebundenes oder automatisch erstelltes Memory Book.
- Echter Group Chat: ein Group Memory Book.
- Narrator-Chat: ein omniscient Memory Book plus ein eindeutiges Book pro deklariertem Character, wie Narrator Mode es verlangt.

---

## 7. Profile, Verbindungen und Generierungsrouting

Ein Memory-Books-Profil steuert sowohl die Generierung als auch die Einstellungen des resultierenden Lorebook-Eintrags.

### 7.1 Empfohlenes erstes Profil

Verwenden Sie zunächst **Current SillyTavern Settings**. Es nutzt den aktuell in SillyTavern aktiven Provider, das Modell und die Temperatur.

Beginnen Sie nicht mit Prompt-Umschreibungen oder Full-Manual-Endpoints. Beweisen Sie zuerst, dass eine Memory generiert und gespeichert werden kann.

### 7.2 Warum ein gespeichertes STMB-Profil anlegen?

Legen Sie ein separates Profil an, wenn Sie:

- ein günstigeres oder zuverlässigeres Modell für Memories verwenden möchten;
- einen anderen Provider als für das Rollenspiel verwenden möchten;
- eine benannte Custom-Verbindung binden möchten;
- einen eigenen Summary Prompt wählen möchten;
- andere Temperatur-/Ausgabeeinstellungen brauchen;
- Titelformat ändern möchten;
- Aktivierung, Einfügeposition, Reihenfolge oder Rekursion ändern möchten;
- getrennte Group-/Omniscient- und Character-Prompts verwenden möchten.

### 7.3 Profilfelder

Ein Profil kann enthalten:

- Anzeigename;
- API/Provider;
- Model-ID;
- Temperatur;
- Summary-Prompt-Preset;
- optionale getrennte Multi-Character-Prompts;
- Structured-Output-Verhalten;
- optionales SillyTavern-ChatCompletionService-Routing;
- optionaler Chat-Completion-Preset;
- Reverse-Proxy-Verhalten;
- Titelformat;
- Aktivierungsmodus: Normal, Constant oder Vectorized;
- Einfügeposition, einschließlich Character, Example Message, Author’s Note und Outlet;
- Outlet-Name, falls relevant;
- automatische oder manuelle Reihenfolge;
- Prevent Recursion;
- Delay Until Recursion.

### 7.4 Benannte Custom OpenAI-compatible-Verbindungen

Ein Custom-OpenAI-compatible-Profil kann:

- die aktuell aktive SillyTavern-Custom-Verbindung verwenden; oder
- eine benannte Custom-Verbindung aus SillyTaverns Connection Manager binden.

Die benannte Verbindung liefert ihre gespeicherte URL und ihr Secret. Das Model-Feld im STMB-Profil bleibt der Modell-Override. Wird die benannte Verbindung gelöscht oder ist keine Custom-Chat-Completion-Verbindung mehr, blockiert STMB die Anfrage, statt stillschweigend anders zu routen.

### 7.5 Structured-Output-Fallback

**Skip structured output and use plain-text completion** verhindert, dass STMB Providern, die dies ablehnen, ein Structured-Output-Schema sendet. Das Modell muss trotzdem das gültige JSON zurückgeben, das der gewählte Memory- oder Consolidation-Prompt verlangt.

### 7.6 ChatCompletionService

**Use ST’s ChatCompletionService** routet unterstützte Profilanfragen durch SillyTaverns Request-Helper und kann einen gewählten SillyTavern-Chat-Completion-Preset anwenden. OpenRouter-Anfragen übernehmen außerdem Provider-Reihenfolge, Quantisierungsfilter, Fallback-Steuerung und Middle-Out-Routing von SillyTavern. Diese OpenRouter-Einstellungen bleiben aktiv, falls ChatCompletionService scheitert und STMB über seinen Fallback-Anfragepfad erneut versucht. Scheitert auch dieser, behält und meldet STMB sowohl den ursprünglichen ChatCompletionService-Fehler als auch die Fallback-Provider-Antwort. Full-Manual-Profile nutzen diesen Weg nicht.

### 7.7 Reverse Proxy und Full Manual Configuration

**Use reverse proxy** leitet die in SillyTavern konfigurierten Reverse-Proxy-Daten für unterstützte Provider weiter.

**Full Manual Configuration** speichert einen separaten Endpoint und Key im STMB-Profil. Das ist ein Ausnahmeweg. Bevorzugen Sie nach Möglichkeit einen in SillyTavern konfigurierten und getesteten Provider oder eine Custom-Verbindung.

### 7.8 Ausgabelänge

Die globale STMB-Einstellung für maximale Antwort-Tokens kann die normale Chat-Completion-Ausgabelänge für Memory-Books-Arbeit überschreiben. Abgeschnittenes JSON ist eine häufige Fehlerursache. Erhöhen Sie zuerst die Ausgabelänge, bevor Sie Schema oder Prompt abschwächen.

---

## 8. Szenen, manuelle Memories, automatische Memories und Catch-up

### 8.1 Was ist eine Szene?

Eine **Szene** ist der inklusive Chat-Nachrichtenbereich, den STMB zu einer Memory verarbeitet.

Nützliche Grenzen umfassen normalerweise eine zusammenhängende Einheit:

- Ereignis;
- Gespräch;
- Untersuchungsschritt;
- emotionale oder Beziehungsentwicklung;
- Orts- oder Zielwechsel;
- zusammenhängende Aktionsfolge.

Sehr kleine triviale Bereiche können wenig Nutzen bieten. Sehr große Bereiche kosten mehr, sind schwieriger zusammenzufassen, können den Kontext überschreiten und vermischen oft unabhängige Ereignisse.

### 8.2 Szene manuell markieren

1. Öffnen Sie die Nachrichtenaktionen, meist über drei Punkte oder ein ähnliches Bedienelement.
2. Klicken Sie **►** bei der ersten einzuschließenden Nachricht.
3. Klicken Sie **◄** bei der letzten einzuschließenden Nachricht.
4. Öffnen Sie Memory Books und prüfen Sie Start, Ende, Sprecher, Nachrichtenanzahl und Token-Schätzung.

Beide Grenznachrichten sind enthalten.

Verwenden Sie **Clear Scene**, um die Auswahl zu entfernen, oder setzen Sie einen anderen Start-/Endmarker, um eine Grenze zu ersetzen.

### 8.3 Manuelle Memory erstellen

1. Prüfen Sie die Szene.
2. Prüfen Sie das effektive Memory Book.
3. Prüfen Sie das ausgewählte Profil.
4. Klicken Sie **Create Memory** oder verwenden Sie `/creatememory`.
5. Prüfen Sie gegebenenfalls Bestätigung, Token-Warnung, Participant Confirmation oder Preview.
6. Genehmigen Sie das Ergebnis.
7. Prüfen Sie, dass ein neuer Lorebook-Eintrag existiert und Memory Status bis zum Szenenende fortgeschritten ist.

Ein gültiges Memory-Ergebnis enthält normalerweise:

- Titel;
- Inhalt;
- Keywords;
- STMB-Metadaten einschließlich Quellbereich und Chat-Identität.

### 8.4 Memory Previews

Wenn **Show memory previews** aktiviert ist, prüfen und bearbeiten Sie bei Bedarf:

- Titel;
- Memory-Inhalt;
- Keywords.

Prüfen Sie Namen, Zuordnungen, Fakten, ausgelassene Konsequenzen und irrelevante Kommentare. Ohne Preview wird ein gültiges Ergebnis automatisch gespeichert.

### 8.5 Automatic Memories

Aktivieren Sie **Auto-create memory summaries** und konfigurieren Sie:

- **Auto-Summary Interval** — Anzahl neuer Nachrichten pro automatischer Memory;
- **Auto-Summary Buffer** — Anzahl neuester Nachrichten, die ausgelassen werden, damit eine noch laufende Szene nicht zu früh zusammengefasst wird.

Beispiel:

```text
Interval: 30
Buffer: 2
```

STMB wartet, bis mindestens 32 Nachrichten über die verarbeitete Grenze hinaus vorhanden sind, und erzeugt dann eine Memory, die zwei Nachrichten vor der neuesten endet.

Existiert noch keine verarbeitete Baseline, behandelt aktuelles STMB sie als `-1` und kann bei Nachricht 0 beginnen. Eine erste manuelle Memory bleibt empfohlen, um Setup und bewusste Startgrenze zu prüfen.

Kleinere Intervalle erzeugen fokussiertere Memories und mehr Anfragen. Größere Intervalle erzeugen weniger, größere Memories und erhöhen das Risiko, unzusammenhängende Inhalte zu verbinden. Als praktische Ausgangswerte eignen sich etwa 20–40 Nachrichten für detailliertes Rollenspiel und 40–60 für kürzere, schnellere Austausche.

Automatische Generierung kann verschoben werden, wenn ein erforderliches Memory Book noch nicht zugeordnet ist.

### 8.6 Baseline verarbeiteter Nachrichten

STMB speichert die höchste verarbeitete Nachricht pro Chat. Sie bestimmt:

- wo `/nextmemory` beginnt;
- wo automatische Memories beginnen;
- die Memory-Boundary-Anzeige;
- welche Nachrichten als bereits verarbeitet gelten.

Verwenden Sie:

- `/stmb-highest` zum Anzeigen;
- `/stmb-set-highest <N>` zum manuellen Setzen;
- `/stmb-set-highest none` zum Löschen.

Manuelle Änderungen müssen bewusst erfolgen, da sie zu ausgelassenen oder doppelten Bereichen führen können.

### 8.7 Catch-up für bestehenden langen Chat

Verwenden Sie:

```text
/stmb-catchup interval=<chunk size> start=<first message id> end=<last message id>
```

Beispiel:

```text
/stmb-catchup interval=40 start=0 end=245
```

Der Bereich ist inklusiv. Chunks werden nacheinander verarbeitet; der letzte darf kleiner sein.

Catch-up ist absichtlich nicht interaktiv. Vor dem Start:

- gewünschtes Profil auswählen und testen;
- **Always use default profile** aktivieren;
- **Show memory previews** deaktivieren;
- sicherstellen, dass das effektive Memory Book existiert, oder Auto-Create in Automatic Mode erlauben;
- alle erforderlichen Multi-Character-Book-Zuordnungen reparieren;
- eine Chunk-Größe unterhalb der Token-Warnschwelle wählen.

STMB prüft alle Chunks vorab, verarbeitet sie der Reihe nach und stoppt beim ersten Fehler oder `/stmb-stop`. Bereits abgeschlossene Chunks bleiben gespeichert. Setzen Sie beim ersten unvollständigen Message-ID fort, statt alles zu wiederholen.

Catch-up eignet sich zur breiten Konvertierung. Manuelle Szenengrenzen bleiben besser, wenn literarische oder Ereignisgrenzen wichtig sind.

---

## 9. Token-Einsparung, ausgeblendete Nachrichten und Memory-Grenze

### 9.1 Ausblenden ist nicht Löschen

Ausgeblendete Nachrichten bleiben in der Chatdatei. Sie werden aus dem aktiven Chat-Kontext weggelassen, bis sie wieder eingeblendet werden.

### 9.2 Auto-Hide-Modi

**Auto-hide messages after adding memory** kann sein:

- Do not auto-hide;
- Auto-hide all messages up to the last Memory;
- Auto-hide only messages in the last Memory.

**Messages to leave unhidden** lässt eine kleine aktuelle Überlappung nahe der Grenze sichtbar.

### 9.3 Vor der Generierung einblenden

**Unhide hidden messages for memory generation** zeigt einen ausgewählten Bereich wieder an, bevor STMB ihn kompiliert. Verwenden Sie dies beim Regenerieren oder erneuten Verarbeiten zuvor ausgeblendeter Bereiche. Der gewählte Auto-Hide-Modus bestimmt, was nach erfolgreichem Speichern wieder ausgeblendet wird.

### 9.4 Memory-Boundary-Anzeige

Die Anzeige nutzt die höchste verarbeitete Nachricht, um die Grenze zwischen verarbeiteter Historie und unverarbeitetem Chat zu zeigen.

Modi:

- Off;
- Memory-Boundary-Trennlinie;
- verschiebbarer Jump-Button;
- Trennlinie plus Jump-Button.

Der Jump-Button scrollt zur ersten unverarbeiteten Nachricht und merkt sich seine verschobene Position.

### 9.5 Gute Lernkonfiguration

Praktischer Start:

- Boundary-Trennlinie und Jump-Button anzeigen;
- zwei Nachrichten sichtbar lassen;
- temporäres Unhide für Generierung aktivieren;
- Auto-Hide zunächst deaktivieren, bis der Nutzer bestätigt hat, dass eine Memory korrekt gespeichert wurde;
- anschließend alle verarbeiteten Nachrichten ausblenden, um den Hauptvorteil bei Tokens zu erhalten.

---

## 10. Lorebook-Aktivierung und Abruf

### 10.1 Keywords

Normale Memories werden häufig per Keyword aktiviert. Gute Keywords sind konkret und unterscheidbar:

- Character-Namen und Aliasse;
- benannte Orte oder Organisationen;
- wichtige Gegenstände;
- Ereignisnamen;
- Identifikatoren;
- konkrete Entdeckungen oder Handlungen.

Schwache Keywords wie `important event`, `conversation` oder `secret` sind zu allgemein.

Der Memory-Inhalt bestimmt, was das Modell erfährt. Keywords helfen festzulegen, wann SillyTavern sie abruft.

### 10.2 Aktivierungsmodi

- **Normal:** keyword-/regelbasierte Aktivierung.
- **Constant:** immer aktiv, vorbehaltlich Budget- und Entry-Kontrollen.
- **Vectorized:** nutzt vektorbezogenen Abruf, wenn die Nutzerkonfiguration dies unterstützt.

Vectors sind optional. STMB funktioniert über Keywords ohne Vectors-Erweiterung.

### 10.3 Empfohlene globale World-Info-Einstellungen

Übliche Startempfehlungen:

- Match Whole Words: off;
- Scan Depth: relativ hoch, etwa 8;
- Max Recursion Steps: ungefähr 2;
- Context percentage: passend zum gesamten Kontext und konkurrierendem Prompt-Material.

Dies sind Empfehlungen, keine harten Anforderungen.

### 10.4 Delay Until Recursion

Wenn das Memory Book die einzige aktive Lorebook-/World-Info-Quelle ist, lassen Sie **Delay Until Recursion** deaktiviert. Andernfalls kann kein Eintrag den ersten Rekursionszyklus starten und die Memory wird möglicherweise nie aktiv.

### 10.5 Abruf diagnostizieren

Wenn eine KI „sich nicht erinnert“:

1. Prüfen, ob der Eintrag existiert.
2. Prüfen, ob das richtige Memory Book für den Chat aktiv ist.
3. Prüfen, ob der Eintrag aktiviert ist.
4. Prüfen, ob Keywords/Aktivierungsmodus zur aktuellen Unterhaltung passen.
5. Lorebook-Budget prüfen.
6. Rekursionseinstellungen prüfen.
7. Mit World-Info-Inspektion oder Request-Log verifizieren, ob der Eintrag tatsächlich gesendet wurde.
8. Wurde er gesendet, aber ignoriert, liegt das verbleibende Problem bei Modellverhalten oder konkurrierendem Kontext, nicht bei STMB-Speicherung.

---

## 11. Echter Group Chat Mode

### 11.1 Definition

Group Chat Mode gilt für eine echte SillyTavern-Gruppe mit mindestens zwei getrennten Character Cards.

```text
SillyTavern Group
├── Alice character card
├── Bob character card
└── Clara character card
```

SillyTavern speichert, welche Card jede Nachricht verfasst hat. Dadurch kann STMB Sprecherzuordnung bewahren und teilnehmende Gruppenmitglieder erkennen.

Es gibt keinen separaten Group-Chat-Mode-Schalter. Öffnen Sie einen Group Chat und verwenden Sie STMB normal.

### 11.2 Participant Detection

Ein erkannter Teilnehmer ist normalerweise eine Character Card, die mindestens eine Nachricht in der ausgewählten Szene verfasst hat.

STMB erschließt nicht aus der Prosa jede physisch anwesende Person. Daher:

- ein stiller Beobachter wird eventuell nicht erkannt;
- ein nur erwähnter Character ist kein Teilnehmer;
- ein abwesender Character, über den gesprochen wird, wird nicht ausgewählt;
- der Nutzer wird nicht als separates Group-Character-Memory-Book-Ziel behandelt;
- doppelte oder ungewöhnliche Sprecheridentitäten können Korrektur benötigen.

Findet die automatische Erkennung keine Group Characters, öffnet STMB die Participant Confirmation auch dann, wenn automatische Annahme aktiviert ist. Die Warnung erklärt den Erkennungsfehler und verlangt eine Prüfung der anwesenden Group Characters.

Die Teilnehmerfrage bedeutet: **Welchen Group Characters soll diese Memory zugeordnet werden?** Sie beweist nicht, wer jede Tatsache wusste oder physisch anwesend war.

### 11.3 Ein Group Memory Book

Das ist die empfohlene Startkonfiguration.

Verwenden Sie Automatic Mode, Auto-Create oder ein Hauptbook in Manual Mode. Jede Szene erzeugt einen kanonischen Eintrag im Group Memory Book. Sind Participant-Namen bekannt, kann der Eintrag einen inklusiven SillyTavern-Character-Filter erhalten.

Ein inklusiver Filter für Alice und Bob bedeutet, dass der Eintrag aktiv werden kann, wenn Alice **oder** Bob aktiv ist. Es entsteht kein synthetischer „Alice und Bob“-Character und kein separates Subset-Book.

Ein Group Book ist ideal, wenn:

- die Besetzung weitgehend dieselbe Geschichte teilt;
- eine omnisciente/gruppenorientierte Zusammenfassung genügt;
- minimale Einrichtung und weniger Duplikate gewünscht sind;
- STLO nicht benötigt wird.

Eine einzelne Group Memory kann asymmetrisches Wissen bewahren:

> Alice fand den Sender und versteckte ihn. Bob glaubte, der Raum sei leer.

### 11.4 Ein Group Book plus Character Books

Die erweiterte Real-Group-Konfiguration verwendet:

- ein kanonisches Group Memory Book;
- ein zugeordnetes Character Memory Book für jedes Gruppenmitglied.

Anforderungen:

- Manual Lorebook Mode;
- SillyTavern-LorebookOrdering (STLO) installiert und aktiviert;
- gültige Zuordnung für jedes erforderliche Mitglied.

Das kanonische Group Book darf nicht zugleich Character Book sein. Mehrere Characters dürfen dasselbe Character Book teilen; STMB schreibt dann eine gemeinsame Kopie statt Duplikaten.

Beim Speichern einer Memory:

1. kanonische Version ins Group Book;
2. Participant Selection bestätigen, außer automatische Annahme ist aktiv;
3. verknüpfte Kopien in die Books ausgewählter Teilnehmer;
4. bei einem erforderlichen Speicherfehler rollt STMB partielle Schreibvorgänge nach Möglichkeit zurück.

Wenn in der Real-Group-Participant-Confirmation niemand ausgewählt ist, gilt die Memory für alle aktuellen Gruppenmitglieder.

### 11.5 Getrennte Group- und Character-Prompts

Standardmäßig wird dieselbe gruppenorientierte Memory in die Participant Books kopiert.

Ein Profil kann **Use separate group and character prompts in group chats** aktivieren. Dann:

- Group Summary Prompt schreibt die kanonische Group-Version;
- Character Summary Prompt schreibt eine individualisierte Version für jedes Single-Character-Zielbook.

Character-fokussierte Versionen können bewahren:

- privates Wissen;
- falsche Überzeugungen;
- persönliche emotionale Reaktionen;
- beziehungsspezifische Prioritäten;
- was für einen bestimmten Teilnehmer wichtig war.

Dies benötigt zusätzliche KI-Anfragen. Ein geteiltes Character Book erhält eine gemeinsame Kopie, nicht eine pro zugeordnetem Character.

### 11.6 STLO-Verantwortlichkeiten

Memory Books entscheidet:

- Szenenbereich;
- Teilnehmer;
- Summary-Inhalt;
- welche Books Kopien erhalten;
- ob individualisierte Prompts verwendet werden.

STLO entscheidet:

- wann ein Lorebook aktiv ist;
- welcher Character es aktivieren darf;
- Priorität, Position, Budget und Reihenfolge.

Wenn STMB ein Character Book zuordnet, fügt es den Avatar-Basename des Characters zu `stlo.characterOverrides` hinzu und aktiviert `stlo.onlyWhenSpeaking`, wobei bestehende STLO-Prioritäten, Budgets und Overrides erhalten bleiben.

STMB arbeitet nur zusammenführend. Löschen oder Ändern einer Zuordnung entfernt den alten STLO-Character-Override nicht automatisch. Entfernen Sie überflüssige Overrides manuell in STLO.

### 11.7 Filter und Books sind keine Privatsphäre-Kontrollen

Getrennte Books und Filter verbessern Relevanz. Sie garantieren nicht, dass:

- ein Character nie Informationen eines anderen erhält;
- das Modell nie die kanonische Group-Version sieht;
- Previous-Memory-Kontext perfekt nach Wissen aufgeteilt ist;
- ein Character Book nur bewusstes Wissen enthält.

Behandeln Sie sie als Kontext-Routing-Werkzeuge, nicht als Sicherheitsgrenzen.

### 11.8 Verknüpfte Kopien sind nicht live synchronisiert

Verknüpfte Einträge teilen Metadaten, durch die STMB dasselbe Ursprungsereignis erkennt; spätere Änderungen sind jedoch unabhängig.

Bearbeiten, Löschen oder Compaction einer Kopie ändert die anderen nicht automatisch. Die Regeneration einer Character Copy ändert ebenfalls nur diese. Beim Regenerieren des kanonischen Group Entry fragt STMB jedoch, ob nur dieser oder auch alle verknüpften Character Entries regeneriert werden sollen. Jeder ausgewählte Eintrag erhält seine eigene Generierung und Freigabeprüfung, sodass Character-Prompts character-fokussiert bleiben.

### 11.9 Gruppenmitglieder hinzufügen, entfernen oder neu zuordnen

Character hinzufügen:

- vor der nächsten verteilten Memory ein gültiges Book zuordnen;
- alte Memories werden nicht rückwirkend kopiert;
- alte Filter werden nicht neu geschrieben;
- historischen Kontext bei Bedarf manuell bereitstellen.

Character entfernen:

- vorhandene Einträge bleiben;
- alte Filter und STLO-Overrides bleiben;
- verknüpfte Kopien werden nicht automatisch gelöscht.

Character Book ändern:

- ändert zukünftiges Routing;
- entfernt den Character nicht zwingend aus STLO-Overrides des alten Books.

### 11.10 Group Consolidation

Das kanonische Group Book verwendet den automatischen Group-Chat-Consolidation-Analyseprompt, der eine omnisciente Chronologie erzeugen soll und objektive Ereignisse von individuellem Wissen unterscheidet.

Character Books nutzen den im Popup gewählten Consolidation-Preset. Books können unterschiedlich viele geeignete Quellen enthalten. Ein Book mit zu wenig Material kann mit Warnung übersprungen werden, während bereite Books fortfahren.

Eine fehlende Szene in einem Character Book ist eine Chronologielücke. Sie beweist weder Abwesenheit noch Unwissenheit noch Bewusstlosigkeit. Ein geteiltes Character Book erhält einen konsolidierten Eintrag.

---

## 12. Narrator Mode

### 12.1 Definition

Narrator Mode ist für einen normalen 1:1-SillyTavern-Chat gedacht, in dem eine Narrator-Character-Card mehrere fiktionale Characters schreibt.

```text
Normal SillyTavern Chat
└── Narrator card
    ├── writes Alice
    ├── writes Bob
    └── writes Clara
```

Ohne Narrator Mode sieht SillyTavern alle KI-Antworten als vom Narrator verfasst. Narrator Mode liefert ein manuelles Cast-Modell, sodass STMB Szenen und Memory Books mit fiktionalen Characters innerhalb der Narrator-Prosa verknüpfen kann.

Narrator Mode ist nicht in einem echten SillyTavern Group Chat verfügbar.

### 12.2 Erforderliche Speicherstruktur

Narrator Mode benötigt:

- Manual Lorebook Mode;
- ein ausgewähltes **omniscient/canonical Memory Book**;
- ein eindeutiges Memory Book für jedes deklarierte Cast-Mitglied.

Regeln:

- ein Cast-Mitglied darf nicht das omnisciente Book verwenden;
- zwei Mitglieder dürfen nicht dasselbe Book teilen;
- jedes deklarierte Mitglied braucht ein verfügbares Book;
- retired Mitglieder behalten Identität und reservierte Book-Zuordnung, bis sie wiederhergestellt oder anderweitig entfernt werden;
- Auto-Create ist inkompatibel, da Narrator Mode von Manual Lorebook Mode abhängt.

Anders als die erweiterte Real-Group-Struktur benötigt Narrator Mode kein STLO für Active-Character-Abruf. STMB injiziert die Books des aktiven Casts während der Generierung in den aktiven Lorebook-Kontext.

### 12.3 Einrichtung

1. Öffnen Sie den normalen Chat der Narrator Card.
2. Aktivieren Sie Manual Lorebook Mode.
3. Wählen Sie das Haupt-Manual-Book; es wird das omnisciente Memory Book.
4. Aktivieren Sie **Narrator Mode**.
5. Öffnen Sie **Manage Narrator Cast**.
6. Fügen Sie jeden fiktionalen Character mit Namen hinzu und ordnen Sie ein eindeutiges Memory Book zu.
7. Wählen Sie im schwebenden **Active Cast**-Drawer die Characters des nächsten Austauschs.

Narrator Mode muss deaktiviert werden, bevor Manual Lorebook Mode deaktiviert werden kann.

### 12.4 Active-Cast-Drawer und Timeline-Metadaten

Der schwebende Active-Cast-Drawer kann geöffnet, geschlossen, verschoben und zur Auswahl aktueller Cast-Mitglieder verwendet werden.

Bei der Generierung nimmt STMB einen Snapshot des aktiven Casts und speichert ihn in Message-Metadaten:

- User Message erhält den Active-Cast-Snapshot;
- Narrator Response erhält den Generation-Snapshot;
- eine Continuation verbindet ihren Cast mit bestehenden Cast-Metadaten;
- Swipe-Metadaten werden je Swipe getrennt gespeichert;
- Auswahl eines Swipe kann Active Cast aus diesem Timeline-Punkt wiederherstellen;
- Löschen neuer Nachrichten kann Cast State aus der letzten verbleibenden markierten Narrator Message wiederherstellen.

Der Cast-Marker speichert Zuordnung, keine semantische Analyse der Prosa.

### 12.5 Abruf bei normaler Narrator-Generierung

Wenn eine Narrator-Generierung beginnt, lädt STMB die Memory Books des aktiven Casts und führt ihre Einträge in die für diese Anfrage verwendete Character-Lore-Sammlung ein; doppelte World-/UID-Paare werden vermieden.

Folgen:

- nur Active-Cast-Books werden durch diesen Narrator-Workflow hinzugefügt;
- das omnisciente Book folgt weiterhin seiner normalen Manual-Mode-Aktivierung/Konfiguration;
- Character-spezifische STLO-Filter sind für Narrator Mode nicht erforderlich;
- die Cast-Auswahl muss vor Generierung stimmen, wenn die korrekten Character Books im Kontext erwartet werden.

### 12.6 Szenen-Participant-Detection

Für eine ausgewählte Szene sind markierte Narrator Responses maßgeblich. STMB kombiniert die Cast-IDs, die auf Narrator-authored Messages gespeichert sind.

Enthält die Szene unmarkierte Legacy-Narrator-Messages, greift STMB auf Kontinuitätsinformationen aus allen Messages zurück und fragt nach Bestätigung des Scene Cast. Aktuell aktive Cast-Mitglieder sind vorausgewählt. Eine leere Auswahl bedeutet, dass keine individuellen Cast-Mitglieder anwesend waren.

Diese Bestätigung gilt speziell für Legacy-/unvollständige Cast-Metadaten; vollständig markierte Szenen benötigen sie nicht.

### 12.7 Memory-Verteilung

Eine Narrator Scene Memory wird gespeichert als:

- ein kanonischer omniscient Entry im Haupt-Memory-Book;
- eine verknüpfte Kopie im eindeutigen Memory Book jedes ausgewählten Teilnehmers.

Narrator-Kopien nutzen keine nativen SillyTavern-Character-Filter. Stattdessen speichert STMB Narrator-Participant- und Owner-IDs in Entry-Metadaten.

Sind getrennte Multi-Character-Prompts deaktiviert, erhalten Participant Books Kopien der omniscienten Summary. Sind sie aktiviert, kann jedes Single-Character-Book eine character-fokussierte Generierung erhalten.

### 12.8 Narrator Consolidation und Regeneration

Narrator Ownership- und Participant-Metadaten werden in Consolidation Sources weitergetragen. So können höherstufige Einträge behalten, welches Character Book eine Kopie besitzt und welche Cast-Mitglieder am zugrunde liegenden Material beteiligt waren.

Regeneration nutzt diese Metadaten, um zu bestimmen, ob das Replacement-Prompt-Target omniscient/group-orientiert oder character-fokussiert ist.

Wie bei Real-Group-Copies sind verknüpfte Narrator Entries nach Erstellung nicht live synchronisiert.

### 12.9 Cast-Mitglieder retiren

Der Cast Manager kann ein Mitglied als retired markieren und später wiederherstellen. Retired Members:

- verschwinden aus Active-Cast-Auswahl;
- werden aus der Active-Cast-ID-Menge entfernt;
- behalten stabile Identitäts-/History-Metadaten;
- behalten ihre Book-Reservierung, um versehentliche Wiederverwendung und Identitätsvermischung zu verhindern.

Verwenden Sie Retirement, wenn ein Character den aktiven Cast verlässt, seine historische Memory-Identität aber erhalten bleiben muss.

---

## 13. Chat-Branches

Native SillyTavern-Branches können unterschiedliche Kontinuitäten entwickeln. Schreiben Branch und Parent in dieselben ungesperrten Memory Books, können widersprüchliche Timelines vermischt werden.

**Copy Memory Books when branching** ist standardmäßig aktiviert.

### 13.1 Was kopiert wird

Wenn STMB einen neu erstellten nativen Branch erkennt:

- Automatic Mode kopiert das aktive chatgebundene Memory Book;
- Manual Mode kopiert das Haupt-Manual-Memory-Book;
- eine Real Group in Manual Mode kopiert jedes eindeutige ungesperrte Character Memory Book;
- Narrator Mode kopiert das omnisciente Book und jedes deklarierte Character Book;
- persistente Real-Character-Locks bleiben bestehen statt kopiert zu werden, denn ein Lock bedeutet „dieses gleiche Book weiterverwenden“.

Alle Books einer Branch-Operation erhalten dieselbe verfügbare Lineage-Nummer:

```text
Group Memories Branch 1
Alice Memories Branch 1
Bob Memories Branch 1
```

Branching von einem bestehenden Branch bewahrt die ursprüngliche Lineage Root und erzeugt keine Namen wie `Branch 1 Branch 1`.

### 13.2 Umgeschriebene Metadaten

In den Kopien:

- ersetzt STMB passende Parent-Chat-IDs durch die neue Branch-Chat-ID;
- leitet kanonische Group-/Character-Links um, wenn beide verknüpften Books kopiert wurden;
- aktualisiert die Bindings des neuen Branches auf die Kopien.

Bestehende Inhalte werden geklont; Memories werden nicht regeneriert.

### 13.3 Fehlersicherheit

Wechseln Sie nicht den Chat, während Branch-Books kopiert werden.

Scheitert das Kopieren, entfernt STMB die geerbten schreibbaren Bindings des neuen Branches und protokolliert den Fehler, damit der Branch nicht stillschweigend in die Originale des Parents schreibt.

### 13.4 Branch-Kopien deaktivieren

Deaktivieren Sie diese Einstellung nur, wenn der Branch absichtlich dieselben Memory Books und dieselbe fortlaufende Historie wie der Parent teilen soll.

---

## 14. Clips

Ein Clip speichert ausgewählten Chattext direkt in einem `[STMB Clip]`-Lorebook-Eintrag. Er ruft kein KI-Modell auf.

### 14.1 Clips eignen sich für

- Vorliebe;
- Versprechen oder Geheimnis;
- Namen oder Alias;
- Gegenstand oder Haustier;
- kurze Beziehungsfakten;
- eine Zeile, die exakt oder fast exakt erhalten bleiben soll;
- eine schnelle „Notiz an mich“, für die keine Scene Memory nötig ist.

### 14.2 Ablauf

1. Markieren Sie Text in einer Chat-Nachricht.
2. Klicken Sie den schwebenden Scheren-Button.
3. Wählen Sie einen vorhandenen Clip-Eintrag oder erstellen Sie einen neuen.
4. Wählen Sie bei einem neuen Eintrag Always Active oder Keyword-Aktivierung.
5. Prüfen Sie aktuellen Eintrag und aktualisierte Vorschau.
6. Benennen Sie bei Bedarf um.
7. Speichern.

Der schwebende Scheren-Button erscheint nur nach Auswahl von Chattext und kann im Hauptfenster deaktiviert werden.

### 14.3 Entry-Format

Titel:

```text
Seraphina Healed Me [STMB Clip]
```

Inhalt:

```markdown
=== Seraphina Healed Me ===

- Seraphina heilte die Wunden des Nutzers mit Magie.

=== END Seraphina Healed Me ===
```

Ein Clip-Eintrag hat einen Abschnitt. Fokussierte Titel unterstützen fokussierte Aktivierungs-Keywords.

### 14.4 Vorhandene Einträge

Ein bestehender Eintrag kann als Clip behandelt werden, indem `[STMB Clip]` an seinen Titel angehängt wird. Lange Clip-Einträge können manuell bearbeitet oder compacted werden.

Clips speichern nur den gewählten Text. Source Attribution wird nicht automatisch hinzugefügt.

---

## 15. Topical Clips

Ein Topical Clip liest bestätigte STMB-Memory-Einträge, einen expliziten Nachrichtenbereich des aktuellen Chats oder beides und bittet eine KI, einen fokussierten „Über dieses Thema“-Eintrag zu erzeugen. Geeignete Memory-Quellen können Scene Memories und konsolidierte Summaries umfassen; Clip- und Side-Prompt-Einträge sind als Quellen ausgeschlossen.

### 15.1 Topical Clip verwenden, wenn

Informationen zu einem Thema über mehrere Memories verteilt sind, z. B.:

- wiederkehrender NPC;
- Beziehungshistorie;
- Ort oder Fraktion;
- Untersuchung oder Rätsel;
- Kräfte, Verletzungen, Versprechen, Vorlieben oder Geheimnisse;
- wichtiger Gegenstand;
- ungelöster Plot-Thread.

Topical Clip organisiert nach Thema, nicht nach Chronologie aller Source Memories.

### 15.2 Quellenbeschränkungen

Topical Clip verwendet:

- bestätigte STMB-Memory-Einträge aus dem gewählten Source Book, einschließlich geeigneter Consolidated Summaries;
- sichtbare Nachrichten aus einem explizit gewählten inklusiven `X-Y`-Bereich des aktuellen Chats.

**Include saved Memories** und **Include chat messages** können separat oder gemeinsam verwendet werden. Message Ranges folgen der globalen Unhide-before-memory-Einstellung und stellen zuvor ausgeblendete Nachrichten nach Kompilierung wieder her.

Nicht verwendet werden:

- Chat-Nachrichten außerhalb des Bereichs;
- normale Clip-Einträge;
- Side-Prompt-Einträge;
- andere gewöhnliche Lorebook-Einträge.

### 15.3 Topical Clip erstellen

1. Öffnen Sie Memory Books.
2. Klicken Sie **Topical Clip**.
3. Wählen Sie das Source Memory Book.
4. Geben Sie das Thema ein.
5. Geben Sie Activation Keywords ein oder lassen Sie sie leer, um das Thema zu verwenden.
6. Wählen Sie neuen Eintrag oder vorhandenes `[STMB Clip]`-Update-Target.
7. Wählen Sie gespeicherte Memories, Chat Messages oder beides als Quellen.
8. Optional nur bestimmte Source Memories und/oder exakten Message Range auswählen.
9. Generation Profile wählen.
10. Draft generieren.
11. Prüfen und bearbeiten.
12. Erst speichern, wenn korrekt.

Der generierte Draft wird nie automatisch gespeichert.

### 15.4 Bestehenden Topical Clip aktualisieren

Nach erfolgreichem Lauf speichert STMB die verwendeten Source Memories und gegebenenfalls Source Chat, Message Range, Message IDs und Hashes. Ein späteres Memory-basiertes Update sendet normalerweise nur neue/geänderte Source Memories zusammen mit dem bestehenden Clip Content. Message Ranges werden immer explizit gewählt.

Verwenden Sie **Rebuild from all source memories**, wenn:

- der aktuelle Eintrag unvollständig oder unorganisiert ist;
- der Prompt geändert wurde;
- ältere Memories stark bearbeitet wurden;
- das gesamte Thema neu bewertet werden soll.

### 15.5 Manuelle Source Selection und Token-Warnungen

Verwenden Sie **Use only selected memories**, wenn das Book groß ist, das Thema auf eine Story-Periode begrenzt ist, Namen kollidieren oder strikte Evidenzkontrolle erforderlich ist.

STMB schätzt die Request-Größe und warnt beim Überschreiten des eingestellten Token Threshold. Reduzieren Sie Quellen, erhöhen Sie bewusst den Grenzwert oder führen Sie den Lauf einmal trotzdem aus.

### 15.6 Review-Standard

Prüfen Sie, dass der Draft:

- beim Thema bleibt;
- Namen und Beziehungen bewahrt;
- wichtige relevante Fakten enthält;
- Widersprüche nennt, statt stillschweigend eine Version zu wählen;
- keine durch Source Memories unbelegten Erklärungen erfindet;
- Updates ohne unnötige Duplikate zusammenführt.

### 15.7 Prompt-Placeholders

Ein Custom-Topical-Clip-Prompt muss `{{SOURCE_MEMORIES}}` enthalten, wenn gespeicherte Memories ausgewählt sind, und `{{SOURCE_MESSAGES}}`, wenn Chat Messages ausgewählt sind.

Source Placeholders:

```text
{{SOURCE_MEMORIES}}
{{SOURCE_MESSAGES}}
```

Unterstützte Placeholders:

```text
{{MODE}}
{{TOPIC}}
{{KEYWORDS}}
{{EXISTING_CLIP}}
{{EXISTING_ENTRY_CONTENT}}
{{SOURCE_MEMORIES}}
{{SOURCE_MESSAGES}}
```

Verwenden Sie Reset to Default, wenn ein Custom Prompt keine nützliche Ausgabe mehr erzeugt.

---

## 16. Side Prompts

Ein Side Prompt ist ein benannter STMB-Prompt, der getrennt von der normalen Character Response läuft. Er erzeugt oder aktualisiert gewöhnlich einen fortlaufenden Support Entry statt einer weiteren sequenziellen Scene Memory.

In der Liste **Trackers & Side Prompts** ändert das Power-Symbol sofort das promptweite **Enabled**-Flag: grün bedeutet aktiviert, gedimmt deaktiviert. Dieser Schalter fügt keine konfigurierten Trigger hinzu, entfernt oder verändert sie nicht.

### 16.1 Geeignete Einsatzzwecke

- Plot- und Unresolved-Thread-Tracker;
- Relationship State;
- NPC-/Faction-Status;
- Inventar und Ressourcen;
- Verletzungen, Werte oder Reputation;
- Timelines, Daten, Deadlines und Reise;
- Mystery-Clues, Verdächtige und Widersprüche;
- Erfindungen, Forschung und Projekte;
- Continuity-Risk-Reports;
- World-State-Summaries.

Vermeiden Sie vage „track everything“-Prompts, doppelte Scene Summaries oder Aufgaben, die in der nächsten Roleplay Response erscheinen müssen.

### 16.2 Ausgabeformat

Side Prompts erwarten normalerweise finalen Plain Text oder Markdown, der direkt gespeichert werden kann. Memory-JSON ist nicht nötig. JSON sollte nur verwendet werden, wenn der Nutzer absichtlich JSON als Tracker-Text speichern möchte.

### 16.3 Run Sequence

Ein typischer Run baut zusammen:

1. Side-Prompt-Instruktionen;
2. vorherigen gespeicherten Tracker Entry, falls vorhanden;
3. optional Previous Memories;
4. optional Additional Context;
5. ausgewählten oder Since-Last-Scene-Text;
6. optional Response-Format-Instruktionen.

Der vorherige Eintrag ist vorhandener Zustand zur Überarbeitung, kein Beweis, dass jede alte Aussage bleiben muss. Prompts sollten veraltete, gelöste, widersprochene oder doppelte Informationen explizit entfernen.

### 16.4 Manuelle Runs

```text
/sideprompt "Prompt Name"
/sideprompt "Prompt Name" 10-20
/sideprompt "Relationship Tracker" {{npc name}}="Alice" 10-20
```

Namen mit Leerzeichen gehören in Anführungszeichen. Ein angegebener Bereich ist inklusiv.

Manuelle Runs eignen sich für gezielte Analysen und Prompts mit Runtime-Macro-Werten.

### 16.5 Automatische After-Memory-Runs

Ein Side Prompt kann **Run automatically after memory** aktivieren.

Der Chat verwendet dann einen von zwei automatischen Auswahlmodi:

- einzeln aktivierte Side Prompts;
- einen ausgewählten Side Prompt Set.

Ein ausgewählter Set ersetzt einzeln aktivierte automatische Prompts für diesen Chat. Er ergänzt sie nicht.

#### Memory Assistance Side Prompt

**Memory Assistance** ist ein reservierter Side Prompt mit vier unabhängigen Modi. Er läuft nach erfolgreich gespeicherten Memories unabhängig von gewöhnlicher Side-Prompt-Aktivierung oder ausgewähltem Side Prompt Set. Während Memory Regeneration läuft er nicht.

Memory Assistance vergleicht die rohe verarbeitete Szene mit normalen und Topical Clips in jedem Memory Book, das die Memory erhalten hat. An die KI werden für jeden geprüften Clip Titel/Thema, Keywords, aktueller Inhalt, stabile ID und Typ gesendet.

Wenn die Job Queue verfügbar ist, erhält jedes Ziel-Memory-Book nach dem Speichern der Memory einen separaten **Memory Assistance**-Job. Fehler bei Anfrage, Response Validation, Report Save oder Automatic Application markieren diesen Job als **Failed** und zeigen den Fehler in der Queue. Die gespeicherte Memory bleibt **Completed**, und ein Retry von Memory Assistance regeneriert die Memory nicht.

- **Off** deaktiviert Memory Assistance.
- **Update** prüft fünf oder weniger Clips direkt; bei mehr als fünf erscheint eine Auswahlliste. Vorschläge warten auf manuelle Freigabe.
- **Update and Suggest** führt zuerst eine Topic-Discovery-Anfrage aus und danach denselben Existing-Clip-Review-Workflow wie Update.
- **Automatic** prüft alle Clips in tokenbasierten Batches ohne Auswahlfrage. Gültige Ergänzungen zu normalen Clips werden direkt angewendet; Topical-Clip-Replacements bleiben in **Memory Assistance Suggestions** zur Freigabe.

- In Update und Update and Suggest bietet die größere Auswahlliste **Query Selected** und **Query All**.
- Query All und Automatic verwenden tokenbasierte Batches statt alle Clips in eine übergroße Anfrage zu zwingen.
- Jeder normale Clip erhält höchstens einen exakten Message Excerpt als vorgeschlagene Ergänzung.
- Topical Clips erhalten vollständige Replacement Drafts.
- Die KI-Antwort ist ein einfaches JSON-Objekt, das jede betroffene Clip UID direkt auf vorgeschlagenen Auszug oder Replacement mappt. Ein leeres Objekt bedeutet keine nötigen Updates.
- Update-Ergebnisse werden in `Memory Assistance (STMB SidePrompt)` gespeichert und erst nach Freigabe über **Memory Assistance Suggestions** angewendet.
- Automatic-Ergebnisse speichern, wie viele normale Clip-Ergänzungen angewendet wurden, und halten Topical-Clip-Replacements sowie Application Failures für manuelle Prüfung zurück.
- Abbrechen der Auswahl löscht ältere Suggestions, damit sie nicht mit Ergebnissen der neuesten Szene verwechselt werden.

Update and Suggest verwendet vor den Existing-Clip-Review-Batches einen separaten Suggestion-only-Prompt. Die Anfrage enthält die verarbeitete Szene und eine leichte Liste bestehender Topical-Clip-Titel, Themen und Keywords. Während Discovery werden keine normalen Clips oder Existing-Clip-Bodies gesendet. Die KI liefert null bis fünf neue Themen als JSON-Objekte mit Topic und Activation Keywords; `{"topics":[]}` ist gültig.

Suggested Topics werden im Memory-Assistance-Report gespeichert. Wählen Sie unter **Memory Assistance Suggestions** **Review Topics**, um sie als aktivierte editierbare Zeilen zu sehen. Sie können unerwünschte Themen abwählen, Topic Names/Keywords ändern oder weitere Themen ergänzen. Bestätigte Topics öffnen nacheinander den normalen Topical-Clip-Draft-Workflow. Ein Pending Topic wird erst entfernt, wenn sein Topical Clip gespeichert wurde; Schließen des Drafts lässt es unter **Memory Assistance Suggestions** verfügbar.

Wenn prüfbare Suggestions bereitstehen, öffnet STMB ein Completion Popup für das aktualisierte Memory Book. **Dismiss** schließt den Hinweis, **Go to Suggestions** öffnet **Memory Assistance Suggestions** mit diesem Memory Book vorausgewählt. Öffnen über das Extension-Menü wählt zuerst das effektive Memory Book des aktuellen Chats (chatgebunden in Automatic Mode oder aufgelöstes manuelles Book in Manual Mode).

Update- und Topic-Suggestions-Prompts sowie Connection-Profile-Override können unabhängig bearbeitet werden, aber beide Structured-Response-Contracts sind fest. Memory Assistance kann nicht gelöscht, dupliziert, in einen Side Prompt Set gelegt oder manuell ausgeführt werden.

### 16.6 Automatische Visible-Message-Intervalle

Ein Side Prompt kann **Run on visible message interval** aktivieren und eine Anzahl sichtbarer Nachrichten seit seinem Checkpoint festlegen.

Hidden und System Messages zählen nicht.

Ist ein Set aktiv, sind nur dessen Zeilen Kandidaten, deren referenzierter Prompt den passenden Interval Trigger besitzt.

### 16.7 Side Prompt Sets

Ein Side Prompt Set ist eine geordnete Run-Liste, nicht bloß ein Ordner. Derselbe Template kann mehrfach mit verschiedenen Macro Values vorkommen.

Beispiel:

1. Relationship Tracker — Alice
2. Relationship Tracker — Bob
3. Plot Tracker
4. Cleanup Report

Zeilen können speichern:

- Prompt-Referenz;
- optionales Label;
- Runtime-Macro-Werte;
- Reihenfolge;
- Duplicate-/Delete-Actions.

Zeilen laufen von oben nach unten.

Manuelle Set Commands:

```text
/sideprompt-set "Set Name"
/sideprompt-set "Set Name" 10-20
/sideprompt-macroset "Relationship Pass" {{npc_1}}="Alice" {{npc_2}}="Bob" 10-20
```

### 16.8 Default Sets und Auswahl pro Chat

General Settings kann definieren:

- Default Set für Solochats;
- Default Set für Group Chats.

Jeder Chat kann:

1. passenden Default übernehmen;
2. ausdrücklich individually enabled prompts verwenden;
3. einen named set auswählen.

Ein leerer Global Default bedeutet Individual Mode.

Wird ein ausgewählter Set gelöscht, warnt STMB, statt stillschweigend einen anderen Workflow zu verwenden. Ein fehlender Row Prompt oder ungelöstes Macro überspringt diese Zeile mit Warnung.

Der Set bestimmt Candidate Rows. Jeder referenzierte Side Prompt braucht weiterhin den relevanten Automatic Trigger für After-Memory oder Interval Execution. Manuelle Set Commands benötigen diese Trigger-Checkboxes nicht.

### 16.9 Macros

Side Prompts können normale SillyTavern-Macros verwenden, z. B.:

```text
{{user}}
{{char}}
```

Nicht standardmäßige `{{...}}`-Placeholders sind Runtime Macros. Sie müssen manuell bereitgestellt oder in einer Set Row gespeichert werden.

Beispiele:

```text
{{npc name}}
{{faction}}
{{project_name}}
```

Ein Prompt mit ungelösten Runtime Macros kann nicht automatisch laufen. Automatic Runs können nicht pausieren, um Werte abzufragen.

### 16.10 Memory-Count-Macros

STMB registriert Integer-Macros für das effektive Haupt-Memory-Book:

| Macro | Anzahl |
|---|---|
| `{{memtier0}}` | Scene Memories |
| `{{memtier1}}` | Arcs |
| `{{memtier2}}` | Chapters |
| `{{memtier3}}` | Books |
| `{{memtier4}}` | Legends |
| `{{memtier5}}` | Series |
| `{{memtier6}}` | Epics |
| `{{memclips}}` | Clip-Einträge |
| `{{memside}}` | Side-Prompt-Einträge |

Effektives Main Book ist das chatgebundene Memory Book in Automatic Mode oder das aufgelöste Main Manual Book in Manual Mode. In Multi-Book-Group-/Narrator-Setups werden Character Books nicht addiert.

Ein Count Macro liefert nur eine Zahl, nicht den Inhalt der Einträge.

### 16.11 Message Ranges

Ein expliziter Range verwendet exakt diesen inklusiven Bereich. Ohne Range nutzt STMB das Since-Last-Checkpoint-/Cap-Verhalten des Side Prompts.

Nutzen Sie explizite Bereiche für Debugging, gezielte Cleanup-Läufe oder das Wiederholen eines bekannten Abschnitts.

### 16.12 Additional Context und Previous Memories

Ein Side Prompt kann bis zu sieben vorherige Scene Memories einbeziehen.

Seine Additional-Context-Quelle kann sein:

- none;
- **Follow chat**, mit dem Context Setting des Chats;
- ein festes benanntes Context Setting.

Dies sind Referenzmaterialien. Der Prompt soll sie nicht blind in den Tracker kopieren.

### 16.13 Lorebook Targets

Ein Side Prompt speichert normalerweise ins effektive Memory Book. Alternativ kann er verwenden:

1. per-chat Target Override;
2. Template-Level Target;
3. effektives Memory Book als Fallback.

Ein gültiger Per-Chat-Override gewinnt.

Alternative Targets eignen sich für bewusst geteilte Campaign Books oder dedizierte Tracker Books. Verteilen Sie Tracker nicht ohne Abrufplan.

### 16.14 Side-Prompt-Entry-Steuerung

Ein Template kann konfigurieren:

- Title Override;
- Keywords;
- Normal-, Constant- oder Vectorized-Aktivierung;
- Insertion Position und Outlet Name;
- Order Mode/Value;
- Prevent Recursion;
- Delay Until Recursion;
- Ignore Budget.

Title- und Keyword-Felder können passende Macros expandieren. **Ignore Budget** sparsam einsetzen: mehrere Always-Included-Tracker können sehr viel Kontext verbrauchen.

### 16.15 Connection Profile Override

Ein Side Prompt kann normale Memory-Books-Verbindungsauflösung erben oder ein bestimmtes STMB-Profil binden. Ein Override eignet sich für ein günstigeres oder für strukturierte Wartung besseres Modell. Zu viele Profilkombinationen erschweren die Fehlerbehebung.

### 16.16 Side Prompt Regeneration

Kompatible Saves speichern einen kompakten Snapshot mit:

- Side-Prompt-Template-Key;
- vorherigem Entry Content;
- Source Chat und inklusivem Range;
- Runtime-Macro-Werten.

Öffnen Sie zum Regenerieren den Lorebook Editor und klicken Sie **Regenerate side prompt**. Der Ersatz verwendet den gespeicherten Snapshot zusammen mit aktuellem Template und aktuellen Profile-/Context-Settings.

Regeneration kann nicht abgeschlossen werden, wenn Template gelöscht wurde, Source Chat/Range fehlt oder Target/Source während der Generierung geändert wurde. Nur der Inhalt wird ersetzt; Titel, Keywords und Entry Settings bleiben bestehen.

### 16.17 Gute Side Prompts schreiben

Ein guter Side Prompt definiert:

- genaue Wartungsaufgabe;
- zu prüfendes Source Material;
- ob revidiert, ersetzt, zusammengeführt oder angehängt wird;
- zu entfernende veraltete Informationen;
- stabile Output Headings und Reihenfolge;
- strikte Längenbegrenzung;
- Final-Output-Only-Verhalten.

Beispiel:

```text
Aktualisieren Sie den Relationship Tracker anhand der bereitgestellten Szene. Bewahren Sie aktuelle Fakten, integrieren Sie neue Entwicklungen in die bestehenden Abschnitte und entfernen Sie gelöste, widersprochene, veraltete oder doppelte Details. Begrenzen Sie jede Beziehung auf 1–3 knappe Stichpunkte. Geben Sie nur den aktualisierten Tracker aus.
```

Nützliche Guards:

```text
Fügen Sie keinen neuen Abschnitt hinzu, außer es gibt tatsächlich neue Informationen.
Entfernen Sie gelöste Threads und veraltete Spekulationen.
Geben Sie nur den aktualisierten Report aus; keine Einleitung oder Erklärung.
Halten Sie die gesamte Ausgabe unter 300 Wörtern.
```

Stabile Überschriften reduzieren Drift bei wiederholten Updates.

### 16.18 Side-Prompt-Fehlerbehebung

Wenn ein Prompt nicht lief:

- prüfen, ob Memory-/Interval-Event wirklich stattfand;
- Chat Individual-/Set-Auswahl prüfen;
- prüfen, ob referenzierter Prompt noch existiert;
- relevanten Automatic Trigger prüfen;
- alle Runtime Macros auf Werte prüfen;
- prüfen, ob `/stmb-stop` oder fehlgeschlagener Job abbrach.

Wenn er doppelt lief:

- Manual + Automatic Invocation;
- doppelte Set Rows;
- doppelte Prompt Copies;
- mehrere Tabs/Chats mit Triggern.

Bei falschem Target Book sowohl Per-Chat- als auch Template-Level-Target prüfen.

Wächst die Ausgabe unbegrenzt, explizite Replace-, Pruning-, Item-Count- und Word-Count-Regeln ergänzen.

---

## 17. Consolidation

Consolidation verbindet niedrigere STMB Memories oder Summaries zu höherstufigen chronologischen Rückblicken.

### 17.1 Tiers

```text
Scene Memory → Arc → Chapter → Book → Legend → Series → Epic
```

Consolidation arbeitet mit bestehenden STMB Entries, nicht direkt mit Raw Chat.

### 17.2 Zweck

Verwenden Sie sie, wenn:

- Scene Memories sich ansammeln;
- ältere Inhalte nicht mehr vollen Szenendetailgrad benötigen;
- eine große Beziehungs-, Plot- oder Campaign-Phase abgeschlossen ist;
- Token-Verbrauch sinken soll, ohne Kontinuität zu verlieren;
- eine sauberere übergeordnete Chronologie gewünscht ist.

Consolidated Entries sollten dauerhafte Veränderungen, Wendepunkte, Ziele, Konsequenzen, Relationship Shifts, ungelöste Threads und stabilen Zustand betonen.

### 17.3 Manueller Ablauf

1. **Consolidate Memories** öffnen.
2. Target Tier wählen.
3. geeignete Source Entries wählen.
4. Consolidation-Prompt-/Profile-Settings wählen.
5. entscheiden, ob Source Entries nach Erfolg deaktiviert werden.
6. ausführen und Candidates prüfen.
7. gewünschte Summaries genehmigen.

### 17.4 Readiness Prompts sind keine automatische Consolidation

**Prompt for consolidation when a tier is ready** überwacht ausgewählte Target Tiers. Ist das gespeicherte Mindestmaß geeigneter Entries erreicht, zeigt STMB eine yes/later-Abfrage. Yes öffnet die Consolidation-Oberfläche. Es konsolidiert nicht stillschweigend.

### 17.5 Consolidation Output Schema

Ordinary Consolidation erwartet striktes JSON:

```json
{
  "summaries": [
    {
      "title": "Short higher-tier title",
      "summary": "Consolidated chronological recap",
      "keywords": ["keyword1", "keyword2"],
      "member_ids": ["001", "002"]
    }
  ],
  "unassigned_items": [
    {
      "id": "003",
      "reason": "Why this source did not fit"
    }
  ]
}
```

Das Modell darf eine oder mehrere Summaries liefern. `member_ids` ordnet jede Quelle einer Summary zu. Ausreißer gehören in `unassigned_items`, statt in einen unpassenden Rückblick gezwungen zu werden.

### 17.6 Previous Higher-Tier Summary

Eine frühere Summary des Ziel-Tiers kann als Canon Context geliefert werden. Sie ist kein Source Material zum Umschreiben. Consolidation Prompts müssen sie von den verarbeiteten Lower-Tier Entries unterscheiden.

### 17.7 Previews und fehlgeschlagene Antworten

Consolidation Previews können Bearbeiten, Akzeptieren, Regenerieren eines Kandidaten aus denselben Sources oder eines Pending Batch erlauben.

Malformed/Failed AI Responses können geprüft und, sofern unterstützt, vor Commit manuell korrigiert werden.

### 17.8 Source Disabling

Wenn aktiviert, deaktiviert STMB Source Entries nach erfolgreicher Consolidation, damit die Higher-Tier Summary den Abruf übernehmen kann. Dies ist über Lorebook Editing rückgängig zu machen.

### 17.9 Gute Consolidation Prompts

Sie sollten definieren:

- Compression Target;
- ob eine Summary oder die kleinste kohärente Anzahl erzeugt wird;
- Chronologie-/Grouping-Logik;
- zwingend zu bewahrende Details;
- explizite Behandlung von Ausreißern;
- exakte JSON-Struktur.

Sie sollten Major Beats, Konsequenzen, Versprechen, Relationship Changes, Identifiers, ungelöste Threads und abrufgeeignete Keywords bewahren und wiederholte Szenendetails entfernen.

---

## 18. Compaction

Compaction bittet eine KI, einen bestehenden STMB-verwalteten Eintrag zu kürzen, und zeigt Original und Draft vor dem Ersatz.

### 18.1 Geeignete Einträge

- `[STMB Clip]`-Einträge;
- Side-Prompt-Einträge;
- STMB-Memory-Einträge.

Normale nicht-STMB-Lorebook-Einträge werden nicht gelistet.

### 18.2 Ablauf

1. **Compaction** öffnen.
2. Memory Book wählen.
3. Compaction Profile wählen.
4. optional Compaction Prompt bearbeiten.
5. einen Entry wählen.
6. Original und compacted Token Estimates/Content vergleichen.
7. Draft bei Bedarf bearbeiten.
8. ersetzen, Draft kopieren oder abbrechen.

Das Original ändert sich erst nach Auswahl von **Replace with Compacted Version**.

### 18.3 Gute Einsatzfälle

- lange Clip-Sammlungen;
- wiederholte/veraltete Tracker-Inhalte;
- wortreiche Scene Memories;
- Always-Active Entries mit zu hohem Kontextverbrauch.

Compaction ist nicht zum Hinzufügen von Fakten, Zusammenfassen von Raw Chat, Erstellen einer neuen Memory oder Bearbeiten gewöhnlicher Lorebook Entries gedacht.

### 18.4 Prompt-Placeholders

```text
{{ENTRY_CONTENT}}  required current content
{{ENTRY_KIND}}     Clip, SidePrompt, or Memory
{{ENTRY_TITLE}}    entry title
```

Der Prompt soll Fakten, Namen, Pronomen, Macros, Wrapper Headings und Endmarker bewahren und Redundanz sowie wenig wertvolle Formulierungen entfernen.

---

## 19. Regeneration

Regeneration erstellt einen prüfbaren Ersatz für einen bestehenden Eintrag. Sie erzeugt keinen zweiten nummerierten Eintrag und überschreibt nie ohne Freigabe.

### 19.1 Scene-Memory-Regeneration

- Source Chat öffnen;
- Memory Book im Lorebook Editor öffnen;
- **Regenerate memory** klicken;
- bei kanonischem Group Entry mit verknüpften Character Entries wählen, ob nur der angeklickte oder alle verknüpften Einträge regeneriert werden;
- aktuelles Profil, Prompt, Previous-Memory-Anzahl und Additional Context wählen;
- Titel, Inhalt und Keywords jedes ausgewählten Eintrags prüfen.

Originaler Scene Range und Sequence Number bleiben erhalten. Verknüpfte Einträge verwenden dieselben gewählten Regeneration Settings, werden aber mit ihrem eigenen Memory-Book-Kontext und passenden Group-/Character-Prompt-Target generiert. STMB sammelt alle Freigaben, bevor direkte Regenerations gespeichert werden. Sind alle Source Messages ausgeblendet, blenden Sie sie ein oder aktivieren Sie unhide-before-generation.

### 19.2 Consolidation Regeneration

Eine Higher-Tier Summary wird anhand ihrer exakt verknüpften Lower-Tier Sources mit dem dedizierten **Regenerate Consolidation**-Preset regeneriert.

Das vollständige Source Set muss weiterhin im richtigen Tier existieren. Eine Lower-Tier Source kann nicht regeneriert werden, solange eine aktive Parent Summary davon abhängt; löschen Sie zuerst den Parent, wenn Sie den Lower Tier bewusst neu aufbauen.

### 19.3 Side-Prompt-Regeneration

Siehe Snapshot-Regeln in Abschnitt 16.16.

### 19.4 Sicherheitsprüfungen

Unmittelbar vor dem Ersatz prüft STMB:

- Target Entry unverändert;
- Source Chat Range unverändert;
- erforderliche Consolidation Sources unverändert und verfügbar;
- Entry weiterhin geeignet.

Scheitert eine Prüfung, wird nichts überschrieben.

Verknüpfte Group-, Character- und Narrator-Copies bleiben unabhängig.

---

## 20. Kontext für die Generierung

Mehrere Kontextquellen können in einer STMB-Anfrage vorkommen. Sie sind nicht austauschbar.

### 20.1 Current Scene

Der Nachrichtenbereich, der gerade verarbeitet wird. Er ist das Target Material einer normalen Scene Memory.

### 20.2 Previous Memories

Frühere Scene Memories aus dem effektiven Memory Book, als Read-Only-Continuity-Context einbezogen. Normalerweise können 0–7 verwendet werden.

Sie dürfen nicht erneut zusammengefasst werden, nur weil sie vor der aktuellen Szene stehen.

### 20.3 Additional Context

Ausgewählte Lorebook Entries als stabile Referenz, zum Beispiel:

- Character-/Setting-Regeln;
- kanonische Namen und Terminologie;
- Campaign Constraints;
- verbindliche Timeline;
- Ortsreferenzen;
- angenommene, aber in der Szene nicht wiederholte Fakten.

Additional Context steht vor Previous Memories und Scene Transcript. Es ist Referenzmaterial, keine weitere Szene.

### 20.4 Context Settings

Ein Context Setting ist eine wiederverwendbare geordnete Sammlung von Additional-Context-Einträgen.

Ablauf:

1. **Context Settings** öffnen;
2. benannten Setting erstellen;
3. Lorebook Entries auswählen;
4. ordnen;
5. Setting für den aktuellen Chat auswählen oder ausdrücklich No Context wählen.

Die Auswahl wird pro Chat gespeichert und funktioniert sowohl mit Current SillyTavern Settings als auch gespeicherten Profilen.

Fehlt ein referenziertes Book oder Entry, warnt STMB, überspringt die veraltete Referenz und fährt fort. Wird das gesamte Context Setting gelöscht, laufen darauf verweisende Chats ohne Additional Context weiter, bis eine andere Auswahl getroffen wird.

Context Settings können dupliziert sowie als `stmb-context-settings.json` importiert/exportiert werden.

### 20.5 Previous Side-Prompt Entry

Aktueller Tracker-Text zur Überarbeitung. Er ist State, kein Beweis dafür, dass alle alten Aussagen gültig bleiben.

### 20.6 Consolidation Sources

Lower-Tier Entries, die das eigentliche Material zum Gruppieren und Komprimieren bilden.

### 20.7 Previous Higher-Tier Summary

Canon Context, der bei Consolidation mitgeführt wird. Er ist keine umzuschreibende Source.

### 20.8 Richtige Reihenfolge nach Workflow

Ordinary Memory:

```text
Memory prompt
Additional Context
Previous Memories
Current scene transcript
```

Side Prompt:

```text
Side Prompt instructions
Prior entry
Previous Memories
Additional Context
Scene text
Response Format
```

Consolidation:

```text
Consolidation prompt
Previous higher-tier summary
Selected lower-tier source entries
```

Prompts sollen Target Material und Reference-Only Material klar kennzeichnen.

---

## 21. Prompt-Architektur, integrierte Summary Prompts und Autorenregeln

STMB besitzt drei hauptsächliche Structured-Generation-Systeme plus mehrere fokussierte Hilfsworkflows.

### 21.1 Ordinary Memory Generation

STMB erwartet ein JSON-Objekt:

```json
{
  "title": "Short scene title",
  "content": "The memory text",
  "keywords": ["keyword1", "keyword2"]
}
```

Regeln:

- nur das JSON-Objekt zurückgeben;
- exakt die Keys `title`, `content`, `keywords` verwenden;
- `keywords` muss ein JSON-Array aus Strings sein;
- Titel kurz und lesbar;
- konkrete Retrieval Terms;
- gewünschtes Markdown innerhalb des `content`-Strings;
- Anführungszeichen korrekt escapen.

STMB kann einige Fences, Trailing Commas, Think Tags, Wrapper oder kleinere Malformations reparieren, aber Prompts dürfen sich nie darauf verlassen.

Ein starker Memory Prompt nennt:

1. gewünschten Memory-Stil und Compression Level;
2. zu bewahrende Continuity Information;
3. auszulassende Filler-, OOC- oder ungestützte Inhalte;
4. exaktes JSON Schema.

Schwache Prompts definieren Stil ohne Struktur, verlangen Analyse statt Final Object, vermischen Previous Context mit Current Scene oder verwenden abstrakte Keywords.

### 21.2 Built-in Summary Prompts auswählen

Diese Presets sind ausschließlich für Ordinary Memory Generation. Sie steuern nicht Consolidation, Side Prompts, Topical Clips oder Compaction. Ein Profil wählt einen unter **Memory Creation Method**. **Summary** ist der normale Fallback/Default, wenn kein anderer Preset angegeben wird. Built-in bedeutet von STMB mitgeliefert, nicht dass alle gleichzeitig laufen oder gleich geeignet sind.

Es gibt keinen universell besten Prompt, da Detail, Lesbarkeit, Retrieval Quality und Token Cost gegeneinander arbeiten. Praktisch:

- **Bester Start für die meisten: Summary.** Ausgewogen und allgemein.
- **Für continuity-lastiges Langzeit-Rollenspiel: Comprehensive.** Stärkste Regeln zu Filterung, Kausalität, Kontinuität und Keywords, aber anspruchsvoller und größer.
- **Wenn Context Tokens am wichtigsten sind: Minimal.** Absichtlich kurz, mit Nuancenverlust.
- **Für getrennte Real-Group-/Narrator-Character-Books: Group und Character.** Zusammen über getrennte Group-/Character-Prompt-Option; Targeting Prompts, keine konkurrierenden General Styles.

| Built-in Prompt | Geeignet für | Trade-off |
|---|---|---|
| **Summary** | Die meisten Solochats und Erstinstallation. Detaillierte chronologische Prosa mit wichtigen Events, Interactions, Developments, Revelations, Outcomes und konkreten Keywords. | Mehr Detail als nötig für strikte Token-Sparer, aber einfacher als hochstrukturierte Presets. |
| **Comprehensive** | Lange continuity-kritische Stories mit Kausalketten, Character Dynamics, etablierten Fakten, wichtigen Exchanges, Unresolved Threads und disziplinierten Keywords. | Längste/anspruchsvollste Anweisungen. Fähiges Modell und ausreichend Response Tokens nötig. |
| **Summarize** | Nutzer, die einen sehr scannable Markdown Record mit Timeline, Story Beats, Key Interactions, Notable Details und Outcome wollen. | Bullet-lastig und kann Fakten zwischen Headings wiederholen. |
| **Synopsis** | Szenen, in denen fast jeder relevante Beat, jede Interaction, Detail und Outcome wichtiger als Kompaktheit ist. | Absichtlich lang; schlecht bei knappem Lorebook-/Context-Budget. |
| **Sum Up** | Chronologischer Narrative-Beat-Record mit sichtbarer Scene Heading und Timeline, aber weniger Section Overhead. | Weniger explizite Trennung von Events, Character Dynamics, Facts und Continuity State. |
| **Minimal** | High-Volume-Chats, billige Archivierung oder sehr kleine Memory-Kontextbudgets. Zwei bis fünf Sätze. | Motive, Emotionen, Kausalität und kleinere Kontinuitätsdetails können verloren gehen. |
| **Northgate** | Creative Writing mit kohärentem Third-Person-Past-Tense-Record, Actions, Emotional Shifts, Entwicklung und wichtiger Dialogue. Community Style von Northgate im SillyTavern Discord. | Lesbarkeit statt maximaler Compression; built-in Text schließt OOC nicht ausdrücklich aus. |
| **Aelemar** | Große Plot-/Emotional Scenes, die als Standalone Record verständlich bleiben sollen. Community Style von Aelemar im SillyTavern Discord. | Mindestens 300 Wörter und bewusst detailliert; ungeeignet für aggressive Token-Einsparung; OOC nicht ausdrücklich ausgeschlossen. |
| **Group** | Shared/Omniscient Memory Book einer Real Group oder Omniscient Target in Multi-Book Workflow. Bewahrt Group Decisions/State mit korrekter Attribution. | Nicht als individuelle Character Memory verwenden; fokussiert gemeinsame Kontinuität. |
| **Character** | Character-focused Memory Book in Real-Group-/Multi-Character-Workflow. Erfasst, was der Character tat, wusste, fühlte, lernte, verbarg, missverstand oder erlitt. | Lässt irrelevantes Szenenmaterial weg und beschränkt ungestütztes Private Knowledge. |

Bei neuer Installation **Summary** verwenden, bis Generation und Retrieval zuverlässig funktionieren. Dann nur den Prompt ändern und mehrere ähnliche Szenen vergleichen. **Comprehensive** wählen, wenn Kausalität/Continuity/Keywords fehlen; **Minimal**, wenn Memory Size das Problem ist. Promptwechsel kompensieren weder schwaches Modell noch abgeschnittene Ausgabe, schlechte Szenengrenzen oder falsche Retrieval Settings.

Der exakte Built-in-Text kann für die aktuelle SillyTavern-Locale neu erzeugt werden. Recreating Built-ins entfernt lokale Änderungen an diesen Built-ins, sollte aber keine unabhängigen Custom Presets löschen. Vorher duplizieren/exportieren.

### 21.3 Multi-Character Prompt Targeting

Bei getrennten Group-/Character-Prompts markiert STMB Request Target als:

- `group` für kanonische Real-Group-/Omniscient-Narrator-Memory;
- `character` für eine individuelle Character-Book-Version.

Der Prompt soll ausdrücklich die Target Perspective nutzen, ohne Wissen zu erfinden, das Szene und Context nicht stützen.

### 21.4 Side-Prompt-Authoring

Side Prompts geben normalerweise Plain Text oder Markdown zurück. Schreiben Sie sie als Maintenance Instructions, nicht als Memory Prompts.

Ein guter Side Prompt:

- eine enge Aufgabe;
- erklärt Nutzung des Previous Tracker;
- entfernt Stale State;
- stabile Headings und Längenlimit;
- nur Final Tracker.

### 21.5 Consolidation-Authoring

Ordinary Consolidation verlangt Schema aus 17.5. Ein guter Prompt:

- Chronologie bewahren;
- kleinste kohärente Zahl Summaries;
- jede verwendete Source über `member_ids` zuordnen;
- Reste über `unassigned_items` nennen;
- wichtige Änderungen/Unresolved Continuity bewahren;
- konkrete Keywords verwenden.

**Regenerate Consolidation** ist für eine Replacement Summary und nicht als normaler Default auswählbar.

### 21.6 Topical-Clip-Authoring

Prompt muss `{{SOURCE_MEMORIES}}` enthalten, beim Topic bleiben, Source Evidence von Inference unterscheiden, neues Material in Existing Clip Content integrieren und Contradictions sichtbar machen.

### 21.7 Compaction-Authoring

Prompt muss `{{ENTRY_CONTENT}}` enthalten und kürzen, ohne ungestützte Fakten hinzuzufügen. Notwendige Structure Wrappers und Macros bewahren.

### 21.8 Prompt-Writing-Checkliste

Vor Abschluss:

1. Was ist Analysis Target?
2. Was ist Reference-Only?
3. Erwartet dieser Weg Strict JSON oder Final Plain Text?
4. Welche Informationen müssen für späteren Abruf überleben?
5. Was soll ausgelassen, zusammengeführt, weitergetragen oder unassigned bleiben?

Return-Format-Korrektheit geht vor Stil.

---

## 22. Summary Prompt Manager und Consolidation Prompt Manager

### Summary Prompt Manager

Kann Ordinary-Memory-Prompt-Presets erstellen, bearbeiten, duplizieren, löschen, importieren und exportieren. Zuordnung erfolgt über ein Memory-Books-Profil.

Alle Ordinary-Memory-Presets müssen das erforderliche Memory-JSON-Schema bewahren.

Siehe 21.2 für Auswahlhilfe.

### Consolidation Prompt Manager

Steuert Prompts zum Gruppieren von Lower-Tier Entries in Higher-Tier Summaries und den normalen Default Consolidation Prompt.

Der Regeneration-only-Preset kann nicht für normale Consolidation verwendet werden.

### Import und Localization

Built-in Prompts können in der aktuellen App-Locale neu erstellt werden. Sichern Sie lokal angepasste Built-ins vorher.

---

## 23. Regex-Integration

STMB integriert SillyTaverns Regex-Erweiterung in zwei Stufen:

1. **Outgoing/User Input:** zusammengesetzten Prompt vor dem Senden transformieren.
2. **Incoming/AI Output:** Raw Response vor Parsing/Saving bereinigen/standardisieren.

Aktivieren Sie **Use regex (advanced)**, öffnen Sie **Configure regex** und wählen Sie Scripts pro Richtung.

Wichtig: STMBs eigene Auswahl steuert die Ausführung. Ein von STMB ausgewähltes Script kann laufen, auch wenn es in der normalen Regex-Oberfläche deaktiviert ist.

Regex nur bei verstandener Transformation verwenden. Schlechte Outgoing Rule kann Schema Instructions zerstören; schlechte Incoming Rule gültiges JSON beschädigen.

---

## 24. Lorebook-Eintragstitel und Zeichenrichtlinie

### 24.1 Title Placeholders

Profile Title Formats können verwenden:

- `{{title}}` — AI-generated title;
- `{{scene}}` — Source Range;
- `{{char}}` — Character-/Group-Name;
- `{{user}}` — Nutzername;
- `{{messages}}` — Scene Message Count;
- `{{profile}}` — Profilname;
- unterstützte Date-/Time-Placeholders.

### 24.2 Auto-Numbering

Unterstützte Numbering Tokens umfassen:

```text
[0] [00] (0) {0} #0
#[000] ([000]) {[000]}
```

STMB vergibt fortlaufende, zero-padded Nummern entsprechend dem Format.

### 24.3 Printable Unicode

Alle druckbaren Unicode-Zeichen sind in Titles erlaubt, einschließlich Emoji, Akzente, CJK und Symbole. Unicode-Control-Characters U+0000–U+001F und U+007F–U+009F werden entfernt.

Auto-Create-Lorebook-Filenames werden separat für filesystem-reservierte Zeichen und Länge bereinigt.

---

## 25. Job Queue und Retry-Steuerung

Die optionale Queue benötigt Chat Top Bar / Chat Top Info Bar. Ist sie verfügbar, erzeugt Regeneration einer Memory, Consolidation oder eines Side Prompts einen Regeneration Job; der Ersatz bleibt bis Freigabe im Review.

Der **Memory Books Jobs**-Drawer kann zeigen:

- queued;
- active;
- completed;
- failed;
- canceled;
- blocked;
- Needs Review.

Jobs mit Chat Range zeigen Start-/End-Message-Nummern. Der Drawer kann aktive Arbeit abbrechen, Review Jobs wieder öffnen, Fehler prüfen, Retry ausführen und Terminal-History-Rows schließen.

Retry Scopes:

- **Retry:** einen Non-Memory Job erneut ausführen, z. B. Side Prompt/Consolidation.
- **Retry All:** Memory plus zugehörige After-Memory-Side-Prompt-Arbeit neu ausführen/fortsetzen. Ist die Memory gespeichert, kann STMB von diesem Result fortsetzen statt zu duplizieren.
- **Retry Memory:** nur Memory neu ausführen/fortsetzen und After-Memory-Side-Prompts absichtlich überspringen.

Retry All stellt Combined Workflow wieder her; Retry Memory, wenn Tracker Work nicht laufen soll.

Ohne Chat Top Bar laufen normale Workflows weiter, nur ohne Queue UI.

---

## 26. Visuelles Feedback und Barrierefreiheit

STMB hat visuelle Zustände für Scene Controls, darunter inactive, selected, valid range, in-scene und processing. Exakte Farben hängen vom SillyTavern-Theme ab.

Barrierefreiheit umfasst:

- Keyboard Navigation;
- Focus Indicators;
- ARIA Attributes;
- Reduced-Motion-Verhalten;
- mobile-friendly Controls.

Bei Screenshot-Erklärungen sichtbare Icons/Labels beschreiben, nicht eine bestimmte Farbe voraussetzen.

---

## 27. Einstellungsübersicht und aktuelle Einstellungsreferenz

Dieser Abschnitt zeigt, wo nutzerseitige STMB-Einstellungen liegen und was sie steuern. Er enthält auch wichtige gespeicherte und One-Run-Controls spezieller Oberflächen. Einmalige Content Fields für Clip/Topical Clip/Compaction/Preview stehen in den jeweiligen Workflow-Abschnitten.

Normaler Einstieg:

**Zauberstab-Extensions-Menü neben Chat Input → Memory Books**

Alle Pfade beginnen im **Memory Books**-Hauptfenster, außer ausdrücklich **SillyTavern**. Controls können verborgen/deaktiviert sein, wenn sie für aktuellen Chat, Provider, Profil oder Storage Mode nicht gelten.

Scopes:

- **Global:** gilt STMB-weit, außer engerer Override.
- **Per chat:** für aktuellen Chat/Group gespeichert.
- **Per character:** folgt Character Card über kompatible Chats.
- **Per profile/template/setting:** im wiederverwendbaren Objekt.
- **Per run:** nur für vorbereitete Operation.

### 27.1 Hauptfenster: Storage, Chat Mode und Active Profile

| Einstellung | Ort | Scope | Wirkung |
|---|---|---|---|
| **Enable Manual Lorebook Mode** | **Current Lorebook Configuration** | Globaler Mode; Book Choice per chat | Nutzt nicht mehr das normale chatgebundene Lorebook als automatisches STMB-Target und verlangt ein Memory Book. Inkompatibel mit Auto-Create. |
| **Selected manual Memory Book** | Manual-Lorebook-Controls in Current Lorebook Configuration | Per chat | Haupt-Memory-Book dieses Chats; in Narrator Mode das Omniscient Book. |
| **Group-character Memory Book assignments** | Group-character rows in Manual Mode | Per chat | Separates Memory Book pro Real-Group-Member. STLO nötig. |
| **Character Memory Book lock** | Lock Icon neben Character Assignment | Per character | Behält dieselbe Book-Zuordnung über kompatible Manual-Mode-Chats. Vor Änderung entsperren. |
| **Narrator Mode** | Current Lorebook Configuration; nur Non-Group Chats | Per chat | Verwendet Selected Manual Book als Omniscient Book und erlaubt deklarierte fiktionale Characters mit eigenen Books. |
| **Manage Narrator Cast** | Unter Narrator Mode / Active Cast Drawer | Per chat | Characters hinzufügen, retiren, wiederherstellen und eindeutige Books zuordnen. |
| **Auto-create lorebook if none exists** | Current Lorebook Configuration | Global | Erzeugt/bindet in Automatic Mode ein Lorebook, wenn keines existiert. Inkompatibel mit Manual Mode. |
| **Lorebook Name Template** | unter Auto-create | Global | Benennt auto-created Books; `{{char}}`, `{{user}}`, `{{chat}}`. |
| **Memory profile selection** | Memory Profiles | Per run | Profil für nächste Memory und Profile Actions. Ändert nicht allein den gespeicherten Default. |
| **Set as Default** | Profile Actions | Global default | Macht Selected Profile zum Default für Automatic Memories und andere Workflows, sofern nichts überschreibt. |
| **Memory Title Format** | Memory Profiles / Edit Profile | Per profile | Formatiert neue Memory-Titel und Numbering. |

### 27.2 General Settings

**Settings → General Settings**

| Einstellung | Scope | Wirkung |
|---|---|---|
| **Always use default profile (no confirmation prompt)** | Global | Überspringt normale Pre-Generation Confirmation; nötig für non-interactive Catch-up. Andere Warnungen/Previews bleiben möglich. |
| **Automatically accept detected participants in future** | Global | Akzeptiert künftig erkannte Real-Group-Participants ohne Nachfrage. |
| **Show memory previews** | Global | Editierbares Review vor Save. |
| **Show consolidation previews** | Global | Review von Consolidation Candidates. |
| **Show notifications** | Global | STMB Toasts. |
| **Show floating Clip button when text is highlighted** | Global | Scheren-Button bei Chat-Textauswahl. |
| **Memory boundary indicator** | Global | Boundary Divider, Jump Button, beide oder keines. |
| **Allow scene overlap** | Global | Erlaubt Überschneidung mit Message IDs bestehender Memories. |
| **Refresh lorebook editor after adding memories** | Global | Aktualisiert offenen Lorebook Editor nach Writes. |
| **Copy Memory Books when branching** | Global | Branch erhält unabhängige Kopien aktiver ungesperrter Books; Character-Locked Books bleiben geteilt. |
| **Default for solo chats** | Global | Side Prompt Set für Solochats; leer = individually enabled. |
| **Default for group chats** | Global | Side Prompt Set für Group Chats; leer = individually enabled. |
| **Max Response Tokens** | Global | Überschreibt STMB-Max-Ausgabe; bei abgeschnittenem JSON erhöhen; `0` lässt Provider/ST-Fallback. |
| **Token Warning Threshold** | Global | Bestätigungswarnung bei geschätzter Input-Größe; ändert Modell-Context-Limit nicht. |
| **Default Previous Memories Count** | Global | Standard 0–7 Previous Memories für neue Memory; per run überschreibbar. |
| **Use regex (advanced)** | Global | Aktiviert STMB-eigene Regex-Auswahl. |
| **Configure regex… → Outgoing scripts** | Global | Scripts vor Provider-Send. |
| **Configure regex… → Incoming scripts** | Global | Scripts vor Parsing/Saving. |

#### Token Saving in General Settings

| Einstellung | Scope | Wirkung |
|---|---|---|
| **Auto-hide messages after adding memory** | Global | Kein Auto-Hide, alle bis letzte Memory oder nur Last-Memory-Range. Reversibel, keine Löschung. |
| **Messages to leave unhidden** | Global | Lässt n aktuelle Messages sichtbar; `0` blendet bis zum relevanten Scene End aus. |
| **Unhide hidden messages for memory generation** | Global | Entspricht `/unhide X-Y` vor Compilation; Auto-Hide bestimmt erneutes Ausblenden nach Save. |

### 27.3 Automatic Memories und Consolidation Reminders

**Settings → Automatic Memories**

| Einstellung | Scope | Wirkung |
|---|---|---|
| **Auto-create memory summaries** | Global | Automatic `/nextmemory`-ähnliche Generierung. Ohne Baseline kann bei Message 0 begonnen werden. |
| **Auto-Summary Interval** | Global | Message Count der automatischen Cadence. |
| **Auto-Summary Buffer** | Global | Lässt neueste Messages aus, damit Generierung hinter Live Chat bleibt. |
| **Prompt for consolidation when a tier is ready** | Global | Yes/Later-Prompt bei ausreichenden Sources; konsolidiert nie stillschweigend. |
| **Auto-Consolidation Tiers** | Global | Überwachte Target Tiers. Mindestwert pro Tier in Consolidate Memories. |

### 27.4 Profile Editor

**Memory Profiles → Profile Actions → Edit Profile**. Per profile, sofern nicht anders angegeben. Built-in **Current SillyTavern Settings** sperrt ST-gesteuerte Felder.

| Einstellung | Wirkung |
|---|---|
| **Profile Name** | Name des wiederverwendbaren STMB-Profils. |
| **API/Provider** | Current ST, unterstützter Provider, Custom OpenAI-compatible oder Full Manual. |
| **Use this connection profile** | Nutzt aktive oder benannte ST-Custom-Verbindung; STMB Model bleibt Override. |
| **Skip structured output and use plain-text completion** | Sendet kein Schema, Modell muss trotzdem gültiges STMB-JSON liefern. |
| **Use ST's ChatCompletionService** | Routing über ST Chat Completion Helper; nicht Full Manual. |
| **Chat Completion Preset** | Optionaler ST-Preset via ChatCompletionService. |
| **Model** | Exakte Model ID; Current ST liest Live-Modell. |
| **Temperature** | Profiltemperatur; Current ST liest Live-Temperatur. |
| **Use reverse proxy** | Übergibt ST Reverse-Proxy-Daten; Full Manual bezeichnet Secret als Proxy Password. |
| **API Endpoint URL / API Key** | Separate Direct Endpoint/Credential nur Full Manual. |
| **Memory Creation Method** | Ordinary-Memory Summary-Preset. |
| **Use separate group and character prompts in group chats** | Separate Group-/Character-Presets. |
| **Group Summary Prompt / Character Summary Prompt** | Auswahl dieser zwei Presets. |
| **Memory Title Format** | Titel, Macros, Auto-Numbering. |
| **Activation Mode** | Normal, Constant, Vectorized. |
| **Insertion Position** | Character, Example Messages, Author's Note oder Outlet. |
| **Outlet Name** | Outlet-Ziel bei Outlet-Position. |
| **Insertion Order** | Auto, Manual oder Reverse (Reverse nur Outlets). |
| **Prevent Recursion** | Entry Content triggert keine weiteren Lorebook Entries in Recursive Scan. |
| **Delay Until Recursion** | Kein First-Pass-Activation; auslassen, wenn sonst niemand Rekursion startet. |
| **Also include** | Legacy-Profil-Kompatibilität; aktuelle Konfiguration nutzt per-chat Context Settings. |

Provider, Modell, Temperatur, Connection Preset und Reverse Proxy für Current ST werden in SillyTavern, nicht STMB konfiguriert.

### 27.5 Context Settings

**Settings → Context Settings**

| Einstellung | Scope | Wirkung |
|---|---|---|
| **Additional Context for this chat** | Per chat | Named Context Setting, **No Context** oder unset. |
| **Context Setting Name** | Per setting | Name der wiederverwendbaren Sammlung. |
| **Additional Context entries and order** | Per setting | Lorebook-Referenzen und Reihenfolge; fehlende werden gewarnt/übersprungen. |

**New**, **Duplicate**, **Delete**, **Import JSON**, **Export JSON** verwalten Settings, ohne Generierungsverhalten zu ändern, bis eines gewählt wird.

### 27.6 Trackers & Side Prompts

**Settings → Trackers & Side Prompts**

| Einstellung | Ort/Scope | Wirkung |
|---|---|---|
| **After-memory side prompt mode for this chat** | Main Screen; per chat | Solo/Group Default, individually enabled oder named set. |
| **How many concurrent prompts to run at once** | Main; global | 1–10 parallele Side-Prompt-Jobs. |
| **Side Prompt Set Name** | New/Edit Set | Name einer ordered run list. |
| **Side Prompt / Row Label / Macro Values** | Set Row | Template, optional Label, Macro Values und Run Order. |
| **Enabled** | Prompt Editor | Eligibility für individually enabled After-Memory Mode. |
| **Run on visible message interval / Interval** | Prompt Editor | Trigger nach sichtbaren Messages; nicht bei ungelösten Runtime Macros. |
| **Run automatically after memory** | Prompt Editor | Trigger nach erfolgreicher Memory. |
| **Allow manual run via `/sideprompt`** | Prompt Editor | Manual Invocation. |
| **Prompt / Response Format** | Prompt Editor | Instruktion und optionale Output Structure. |
| **Previous memories for context** | Prompt Editor | 0–7 Previous Memories. |
| **Use additional context / Additional Context Source** | Prompt Editor | Follow Chat oder Fixed Context Setting. |
| **Lorebook Target** | Prompt Editor; template/chat | Default Memory Book oder anderes Lorebook; Scope wird beim Ändern gefragt. |
| **Lorebook Entry Title Override / Keywords** | Prompt Editor | Upsert Title Template und Keywords. |
| **Activation Mode / Insertion Position / Outlet Name** | Prompt Editor | Lorebook Entry Activation/Placement. |
| **Insertion Order / Order Value** | Prompt Editor | Auto Memory-number order oder fixed manual. |
| **Prevent Recursion / Delay Until Recursion / Ignore Budget** | Prompt Editor | ST Lorebook Flags. |
| **Override default memory profile / Connection Profile** | Prompt Editor | Spezifisches STMB-Profil. |
| **Memory Assistance Mode** | Memory Assistance; global | Off, Update, Update and Suggest, Automatic. |
| **Update Prompt / Topic Suggestions Prompt** | Memory Assistance | Zwei AI Tasks, feste Response Contracts. |
| **Use a connection profile override** | Memory Assistance | Spezifisches Profil statt Default. |

### 27.7 Prompt Managers

| Einstellung | Ort | Scope | Wirkung |
|---|---|---|---|
| **Summary Prompt name and prompt text** | Summary Prompt Manager | Per preset | Reusable Ordinary-Memory Prompt; Profil muss darauf zeigen. |
| **Default consolidation prompt** | Consolidation Prompt Manager → Set Default | Global | Preset für Consolidate Memories; Regeneration-/Group-only ausgeschlossen. |
| **Consolidation Prompt name and prompt text** | Consolidation Prompt Manager | Per preset | Reusable Consolidation Instructions. |

### 27.8 Topical Clip und Compaction Defaults

| Einstellung | Ort | Scope | Wirkung |
|---|---|---|---|
| **Generation Profile / Compaction Profile** | Topical Clip bzw. Compaction | Shared global default | Profil für beide Workflows; Auswahl wird geteilt. |
| **Topical Clip Prompt** | Edit Topical Clip Prompt | Global | Custom Prompt; Reset to Default; Source Macros werden validiert. |
| **Compaction Prompt** | Edit Compaction Prompt | Global | Custom Prompt; `{{ENTRY_CONTENT}}` erforderlich. |

Memory Book, Topic, Keywords, Sources, Message Range, Draft und Selected Compaction Entry sind Per-Run-Choices.

### 27.9 Consolidate-Memories-Controls

| Einstellung | Scope | Wirkung |
|---|---|---|
| **Target tier** | Per run | Higher Tier und damit direkt niedriger Source Tier. |
| **Consolidation Prompt** | Per run | Prompt für diesen Run; startet mit Default. |
| **Maximum entries per pass** | Per run | Max Lower-Tier Entries pro Analysis Pass. |
| **Token Budget** | Per run | Approx Input Budget fürs Batching. |
| **Number of automatic summary attempts** | Per run | Wiederholte Analysis Attempts. |
| **Saved minimum eligible entries** | Global per tier | Ready-Schwelle und Auto-Readiness-Prompt. |
| **Activation Mode / Insertion Position / Outlet / Insertion Order / Recursion Settings** | Global Consolidated-Entry Defaults | Speicherung neuer Consolidated Entries. |
| **Disable selected source entries after creating summaries** | Per run | Deaktiviert erfolgreiche Sources, löscht sie nicht. |
| **Selected source entries** | Per run | Welche geeigneten Lower-Tier Entries verarbeitet werden. |

### 27.10 Verwandte SillyTavern-World-Info-Einstellungen

Außerhalb STMB, aber wichtig für Retrieval:

| Einstellung | Wirkung |
|---|---|
| **Match Whole Words** | Keyword-Boundary-Matching; off ist ein häufiger Start. |
| **Scan Depth** | Wie viel Recent Text auf Activation gescannt wird; z. B. 8. |
| **Max Recursion Steps** | Recursive World Info Activation; etwa 2 als Start. |
| **Context percentage / lorebook budget** | Max Context-Anteil für Lorebook Entries. |

Empfehlungen, keine Anforderungen; siehe Abschnitt 10.

---

## 28. Slash-Command-Referenz

### Memory Commands

```text
/creatememory
```

Memory aus aktuell markierter Szene.

```text
/scenememory X-Y
```

Inklusiven Bereich setzen und Memory erstellen, z. B. `/scenememory 10-15`.

```text
/nextmemory
```

Memory ab Nachricht nach höchster verarbeiteter Grenze bis zum aktuellen geeigneten Ende.

```text
/stmb-catchup interval=x start=y end=z
```

Langen bestehenden Chat in Chunks verarbeiten.

### Side-Prompt-Commands

```text
/sideprompt "Name" {{macro}}="value" [X-Y]
/sideprompt-set "Set Name" [X-Y]
/sideprompt-macroset "Set Name" {{macro}}="value" [X-Y]
/sideprompt-on "Name" | all
/sideprompt-off "Name" | all
```

### Processed-Boundary-Commands

```text
/stmb-highest
/stmb-set-highest <N|none>
```

### Emergency Stop

```text
/stmb-stop
```

Stoppt alle laufenden STMB-Generierungen einschließlich Side Prompts. Bereits gespeicherte Arbeit bleibt.

---

## 29. Fehlerbehebung nach Verarbeitungsstufe

### 29.1 Extension/UI nicht geladen

Symptome:

- Memory Books fehlt im Zauberstabmenü;
- Chevrons fehlen;
- kein Floating Clip Button nach Auswahl.

Checks:

1. Extension installiert/aktiviert;
2. Seite neu geladen;
3. Character-/Group-Chat offen;
4. bis zu zehn Sekunden warten;
5. Message Actions erweitern;
6. erst danach Console prüfen.

### 29.2 Keine Szene ausgewählt

**►** und **◄** sind beide erforderlich. Current Scene prüfen.

Bei Overlap mit vorhandener Memory anderen Range wählen oder Allow Scene Overlap aktivieren.

### 29.3 Kein gültiges Memory Book

Automatic Mode:

- Lorebook an Chat binden; oder
- Auto-Create aktivieren.

Manual Mode:

- Main Manual Book wählen;
- gelöschte Selection reparieren;
- Broken Character Lock entsperren.

Real Multi-Book Group:

- STLO verfügbar;
- jedes erforderliche Mitglied gültige Assignment;
- Group Book nicht als Character Book wiederverwenden.

Narrator Mode:

- Manual Mode aktiv;
- Omniscient Book gewählt;
- jedes deklarierte Mitglied eindeutiges Non-Omniscient Book.

### 29.4 KI liefert keine gültige Memory

In dieser Reihenfolge:

1. Provider/Model/Profile gültig;
2. Response nicht abgeschnitten;
3. Max Response Tokens ausreichend;
4. Prompt verlangt exaktes JSON;
5. Regex hat Schema nicht beschädigt;
6. Provider unterstützt Structured Output;
7. Skip Structured Output nur bei Schema-Rejection versuchen;
8. besser instruction-following Model testen, bevor Prompt umgeschrieben wird;
9. **Raw response from AI** im persistenten Error Toast öffnen und ggf. Manual-JSON-Correction verwenden.

Häufig: Code Fences, Commentary, Missing Key, Keywords kein Array, Refusal Text, Cut-off.

### 29.5 Memory gespeichert, Messages „weg“

Vermutlich Auto-Hide. Token-Saving-Einstellungen ändern. Hidden Messages sind nicht gelöscht.

### 29.6 Automatic Memories liefen nicht

Prüfen:

- Auto-create memory summaries an;
- genug Messages jenseits Highest Processed;
- Interval + Buffer erfüllt;
- kein Postpone Checkpoint;
- gültiges Memory Book;
- kein anderer Memory Job blockiert;
- Chat nicht während Arbeit gewechselt;
- Group Generation beendet.

Erste manuelle Memory empfohlen, aber technisch nicht erforderlich.

### 29.7 Memory existiert, aktiviert aber nicht

Prüfen:

- richtiges Book aktiv;
- Entry enabled;
- Keywords;
- Activation Mode;
- Budget;
- Recursion/Delay Until Recursion;
- STLO Routing;
- World Info Inspection/Logs.

Nicht regenerieren, bevor Retrieval geprüft ist.

### 29.8 Entry wurde gesendet, aber ignoriert

Model-Use-Problem. Möglich:

- Memory kürzer/expliziter;
- Insertion Position/Priority verbessern;
- competing context reduzieren;
- OOC Reminder;
- zuverlässigeres Modell.

### 29.9 Side Prompt lief nicht

Siehe 16.18. Insbesondere unterdrückt ein Selected Set individually enabled prompts außerhalb des Sets.

### 29.10 Consolidation promptete nicht

Prüfen:

- Readiness Prompt an;
- Target Tier monitored;
- genug eligible Sources;
- Sources nicht disabled/ineligible;
- Saved Minimum erreicht.

### 29.11 Regeneration Button disabled

Hover/Reason prüfen. Häufig:

- Entry vor Snapshot Metadata;
- Source Chat/Range nicht verfügbar;
- Sources fehlen/falscher Tier;
- Active Parent Consolidation blockiert Lower Source;
- Original Sequence Number unklar;
- Side Prompt Template gelöscht.

### 29.12 Branch kopierte Books nicht

Prüfen:

- Setting vor Branch Creation aktiv;
- Native ST Branch;
- Source Books existieren/laden;
- Chat nicht während Copy gewechselt;
- Branch nicht bereits completed/failed;
- Locked Books wurden absichtlich behalten.

### 29.13 Narrator Cast falsch

Prüfen:

- Active Cast vor Generation;
- Continuation mit Merge;
- Swipe restaurierte alten Cast State;
- Legacy untagged Messages benötigen Confirmation;
- Character retired;
- Character Books existieren.

---

## 30. FAQ

### Brauche ich Vectors?

Nein. Keyword-Aktivierung genügt und wird automatisch generiert. Vectors sind optional.

### Sollten Memories ein getrenntes Lorebook verwenden?

Meist ja für Organisation, Budgeting, Reuse und Diagnose, aber nicht zwingend.

### Löscht STMB Nachrichten?

Nein. Es kann verarbeitete Nachrichten aus dem aktiven Kontext ausblenden.

### Kann STMB komplett manuell verwendet werden?

Ja. Szenen markieren und Memories nur bei Bedarf erzeugen.

### Können Automatic Memories die erste Memory erstellen?

Ja. Ohne Processed Baseline beginnt aktuelles STMB bei Message 0, sobald Interval + Buffer erfüllt sind. Manueller Erstlauf wird trotzdem empfohlen.

### Läuft Consolidation automatisch?

Nein. STMB kann bei Ready Tier prompten, aber Nutzer bestätigt und prüft.

### Kann eine Real Group nur ein Memory Book verwenden?

Ja. Empfohlener Start, ohne STLO.

### Wann sind getrennte Real-Group-Character-Books nützlich?

Wenn individuelle Kontinuität, Wissen, speaker-spezifischer Retrieval oder Character-focused Summaries zusätzlichen Setup-/Request-Aufwand rechtfertigen.

### Ist Narrator Mode dasselbe wie Group Chat Mode?

Nein. Group Chat Mode liest getrennte SillyTavern-Card Authors. Narrator Mode deklariert fiktionale Characters, die eine Narrator Card schreibt.

### Braucht Narrator Mode STLO?

Nicht für Active-Cast-Retrieval. Er benötigt Manual Lorebook Mode, ein Omniscient Book und eindeutige Character Books.

### Sind verknüpfte Copies synchronisiert?

Nein. Sie sind für Origin-/Consolidation-Metadata verknüpft, nicht als Live Mirror.

### Warum sollte Delay Until Recursion meist aus sein?

Wenn kein anderer Lorebook Entry Rekursion startet, kann eine delayed Memory nie aktiv werden.

### Was nach der ersten erfolgreichen Memory?

Retrieval prüfen, dann Automatic Memories, Interval/Buffer, Token Hiding und bei Bedarf Clips oder eng definierten Side Prompt aktivieren. Topical Clip/Consolidation erst nach genug Memories.

---

## 31. Kompatibilität, Migration und aktuelle historische Hinweise

Nur Historie, die aktuelle Nutzung beeinflusst.

### Aktuelle Baseline

- Dokumentierte Release: v8.5.0, 1. August 2026.
- SillyTavern-Anforderung: 1.14.0 oder neuer.
- Narrator Mode: v8.5.0.
- Branch Book Copying, Side Prompt Regeneration und Character Memory Book Locks: v8.4.0.
- Multi-Character-Real-Group-Memory-Distribution: v8.0.0.
- Additional Context wechselte v7.0.0 von Profilen zu reusable per-chat Context Settings; ältere Profile werden migriert.
- Topical Clip: v6.10.0.
- Compaction und Clips: v6.6.0.
- Side Prompt Sets und Per-Prompt Targets: v6.4–v6.5.
- Multi-Tier Arc→Epic Consolidation: v6.0.0; alte Arc Metadata werden migriert.
- Job Queue Integration: v6.8.0, optional.
- Current Profile Defaults haben Delay Until Recursion aus, sofern Nutzer/Profil nichts anderes setzt.

### Existing Memories aus älteren Versionen

Nur Einträge mit `stmemorybooks`-Flag und benötigten Metadaten gelten als STMB Memories. Für ältere Entries den mitgelieferten Lorebook Converter verwenden.

### Entfernte Funktionalität

Die alte Bookmark-Funktion wurde in v4.0.0 aus Memory Books entfernt und vom Core getrennt. Keine aktuellen Memory-Books-Bookmark-Controls lehren.

### Localized Built-ins

Built-in Prompts können gemäß aktiver SillyTavern-Language neu erstellt werden. Angepasste Built-ins vorher sichern.

### Import-Verhalten

Side-Prompt-Import ist additiv. Bestehende Prompts bleiben; Key-Konflikte werden umbenannt statt überschrieben.

---

## 32. Entwickler- und Lizenzhinweise

Memory Books verwendet Bun für Bundling/Minification.

```sh
bun run build
```

Repository-Pre-Commit-Build-Hook installieren:

```sh
bun run install-hooks
```

Der Hook baut vor Commit, staged Build Artifacts und bricht bei Build Failure ab.

Memory Books ist Copyright © 2024–2026 Aiko Hanasaki und unter GNU Affero General Public License v3.0 lizenziert. Geänderte Versionen müssen anwendbare Hinweise bewahren, Änderungen kennzeichnen und AGPL-Anforderungen zur Source-Verfügbarkeit erfüllen.

---

## 33. Kompakter Diagnose-Entscheidungsbaum

```text
Nutzer: „Memory Books funktioniert nicht.“
│
├─ Ist Menü/Control sichtbar?
│  ├─ Nein → Installation/Loading/UI prüfen.
│  └─ Ja
│
├─ Kann eine Szene ausgewählt werden?
│  ├─ Nein → Message Actions öffnen; beide Chevrons setzen; Overlap prüfen.
│  └─ Ja
│
├─ Gibt es ein gültiges effektives Memory Book?
│  ├─ Nein → binden, auto-create, manual auswählen oder Multi-Book-Bindings reparieren.
│  └─ Ja
│
├─ Liefert Generation vollständige gültige Ausgabe?
│  ├─ Nein → Profil, Provider, Output Tokens, JSON Schema, Regex, Modell.
│  └─ Ja
│
├─ Existiert der Entry im vorgesehenen Book?
│  ├─ Nein → Save/Rollback/Permission/Job Failure.
│  └─ Ja
│
├─ Aktiviert und sendet SillyTavern ihn später?
│  ├─ Nein → Keywords, Activation, Book Binding, Budget, Recursion, STLO.
│  └─ Ja
│
└─ Nutzt das Modell den gelieferten Entry?
   ├─ Nein → Model Compliance, Placement, Competing Context, Entry Clarity.
   └─ Ja → Workflow funktioniert.
```

---

## 34. Empfohlene minimale Lernreihenfolge

Für neue Nutzer zuerst nur:

1. Zauberstabmenü öffnen und Memory Books finden.
2. Automatic Mode mit bound Book verwenden oder Auto-Create aktivieren.
3. Current SillyTavern Settings wählen.
4. Message Actions öffnen und kurze vollständige Szene mit **►** und **◄** markieren.
5. Eine Memory erzeugen und Preview prüfen.
6. Memory Book öffnen und gespeicherten Entry prüfen.
7. Prüfen, dass er später aktiv werden kann.
8. Automatic Memories aktivieren und Interval/Buffer wählen.
9. Auto-Hide erst aktivieren, nachdem erklärt wurde, dass Hidden Messages nicht gelöscht sind.
10. Clips, dann Side Prompts, dann Topical Clip/Consolidation nur bei konkretem Bedarf einführen.

Nicht mit Custom Prompts, Full Manual Endpoints, Multi-Character-Books, Regex oder Consolidation beginnen, außer das konkrete Problem verlangt es.

---

## 35. Abschließende Konzeptübersicht

Memory Books ist eine externe Continuity Pipeline auf SillyTavern-Lorebooks:

```text
Chat-Material auswählen oder planen
→ strukturierte Darstellung generieren
→ mit Retrieval-Metadaten speichern
→ optional verarbeitetes Transcript ausblenden
→ SillyTavern später relevante Entries abrufen lassen
```

Das System funktioniert am besten, wenn:

- Szenen kohärent sind;
- Prompts Target und Reference Context klar unterscheiden;
- JSON Workflows exakte Schemas liefern;
- Keywords konkret sind;
- Memory Books bewusst zugeordnet/aktiviert sind;
- langfristige Tracker Stale State bereinigen;
- Consolidation alte Details reduziert, ohne Kontinuität zu löschen;
- Nutzer Retrieval prüfen statt „gespeichert = gesendet“ anzunehmen;
- Advanced Multi-Book Routing nur verwendet wird, wenn die Präzision die Komplexität wert ist.
