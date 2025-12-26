# 📕 Memory Books (Eine SillyTavern-Erweiterung)

Eine SillyTavern-Erweiterung der nächsten Generation für automatische, strukturierte und zuverlässige Erstellung von Erinnerungen. Markiere Szenen im Chat, generiere JSON-basierte Zusammenfassungen mit KI und speichere sie als „[vektorisierte](https://www.google.com/search?q=%23vektorisiert)“ Einträge in deinen Lorebooks. Unterstützt Gruppenchats, erweiterte Profilverwaltung und bietet eine robuste API-/Modell-Handhabung.

### ❓ Vokabular

- Scene (Szene) → Memory (Erinnerung)
- Many Scenes (Viele Szenen) → Arc Summary (Handlungsbogen-Zusammenfassung)
- Always-On → Side Prompt (Tracker)

## ❗ Bitte zuerst lesen!

Starten Sie hier:

- ⚠️‼️ Bitte lesen Sie die [Voraussetzungen](https://www.google.com/search?q=%23-voraussetzungen) für Installationshinweise (besonders wenn Sie eine Text Completion API verwenden).
- ❓ [Häufig gestellte Fragen (FAQ)](https://www.google.com/search?q=%23faq)
- 🛠️ [Fehlerbehebung (Troubleshooting)](https://www.google.com/search?q=%23fehlerbehebung-troubleshooting)

Weitere Links:

- 📘 [Benutzerhandbuch (EN)](https://www.google.com/search?q=USER_GUIDE.md)
- 📋 [Versionsverlauf & Changelog](changelog.md)
- 💡 [Verwendung von 📕 Memory Books mit 📚 Lorebook Ordering](https://github.com/aikohanasaki/SillyTavern-LorebookOrdering/blob/main/guides/STMB%20and%20STLO%20-%20English.md)

---

### 📚 Mehr Power mit Lorebook Ordering (STLO)

Für eine fortgeschrittene Organisation von Erinnerungen und eine tiefere Integration in die Geschichte empfehlen wir dringend, STMB zusammen mit [SillyTavern-LorebookOrdering (STLO)](https://github.com/aikohanasaki/SillyTavern-LorebookOrdering/blob/main/guides/STMB%20and%20STLO%20-%20English.md) zu verwenden. Schauen Sie in die Anleitung für Best Practices, Einrichtungsanweisungen und Tipps!

> Hinweis: Unterstützt verschiedene Sprachen: siehe Ordner [`/locales`](https://www.google.com/search?q=locales) für eine Liste. Internationale/lokalisierte Readmes und Benutzerhandbücher finden Sie im Ordner [`/userguides`](https://www.google.com/search?q=userguides).
> Lorebook-Konverter und die Vorlagenbibliothek für Side Prompts befinden sich im Ordner [`/resources`](https://www.google.com/search?q=resources).

---

## 📋 Voraussetzungen

- **SillyTavern:** 1.14.0+ (aktuellste Version empfohlen)
- **Szenenauswahl:** Start- und Endmarkierungen (Start < Ende) müssen gesetzt sein.
- **Chat Completion Support:** Volle Unterstützung für OpenAI, Claude, Anthropic, OpenRouter oder andere Chat Completion APIs.
- **Text Completion Support:** Text Completion APIs (Kobold, TextGen, etc.) werden unterstützt, wenn sie über einen Chat Completion (OpenAI-kompatiblen) API-Endpunkt verbunden sind. Ich empfehle, eine Chat Completion API-Verbindung gemäß den untenstehenden KoboldCpp-Tipps einzurichten (passen Sie dies bei Bedarf an, falls Sie Ollama oder andere Software nutzen). Richten Sie danach ein STMB-Profil ein und verwenden Sie "Custom" (empfohlen) oder die volle manuelle Konfiguration (nur falls Custom fehlschlägt oder Sie mehr als eine benutzerdefinierte Verbindung haben).
  **HINWEIS**: Bitte beachten Sie, dass Sie bei Verwendung von Text Completion unbedingt

### KoboldCpp-Tipps zur Verwendung von 📕 ST Memory Books

Richten Sie dies in ST ein (Sie können zu Text Completion zurückwechseln, NACHDEM STMB funktioniert):

- Chat Completion API
- Quelle: Custom chat completion source (Benutzerdefiniert)
- Endpunkt: `http://localhost:5001/v1` (Sie können auch `127.0.0.1:5000/v1` verwenden)
- Geben Sie irgendetwas bei "Custom API Key" ein (spielt keine Rolle, aber ST benötigt einen)
- Modell-ID muss `koboldcpp/modelname` sein (setzen Sie kein .gguf in den Modellnamen!)
- Laden Sie ein Chat Completion Preset herunter und importieren Sie es (irgendeines reicht), nur damit Sie ein Chat Completion Preset HABEN. Dies vermeidet Fehler wegen "nicht unterstützt".
- Ändern Sie die maximale Antwortlänge (Response Length) im Chat Completion Preset auf mindestens 2048; 4096 wird empfohlen. (Kleiner bedeutet, dass Sie riskieren, abgeschnitten zu werden.)

### Llama.cpp-Tipps zur Verwendung von 📕 ST Memory Books

Genau wie bei Kobold, richten Sie Folgendes als _Chat Completion API_ in ST ein (Sie können zu Text Completion zurückwechseln, nachdem Sie überprüft haben, dass STMB funktioniert):

- Erstellen Sie ein neues Verbindungsprofil für eine Chat Completion API.
- Completion Source: `Custom (Open-AI Compatible)`
- Endpoint URL: `http://host.docker.internal:8080/v1` falls ST im Docker läuft, sonst `http://localhost:8080/v1`
- Custom API Key: irgendetwas eingeben (ST benötigt einen)
- Model ID: `llama2-7b-chat.gguf` (oder Ihr Modell, egal wenn Sie nicht mehr als eines in llama.cpp laufen lassen)
- Prompt Post-Processing: keines (none)

Zum Starten von Llama.cpp empfehle ich, etwas Ähnliches wie das Folgende in ein Shell-Skript oder eine Bat-Datei zu schreiben, damit der Start einfacher ist:

```sh
llama-server -m <model-path> -c <context-size> --port 8080

```

## 💡 Empfohlene Einstellungen für Globales World Info/Lorebook

- **Match Whole Words:** deaktiviert lassen (false)
- **Scan Depth:** höher ist besser (meines ist auf 8 eingestellt)
- **Max Recursion Steps:** 2 (allgemeine Empfehlung, nicht erforderlich)
- **Context %:** 80% (basierend auf einem Kontextfenster von 100.000 Token) - geht davon aus, dass Sie keinen extrem großen Chatverlauf oder Bots haben.

---

## 🚀 Erste Schritte

### 1. **Installieren & Laden**

- Laden Sie SillyTavern und wählen Sie einen Charakter oder Gruppenchat aus.
- Warten Sie, bis die Chevron-Schaltflächen (► ◄) an den Chat-Nachrichten erscheinen (kann bis zu 10 Sekunden dauern).

### 2. **Eine Szene markieren**

- Klicken Sie auf ► bei der ersten Nachricht Ihrer Szene.
- Klicken Sie auf ◄ bei der letzten Nachricht.

### 3. **Eine Erinnerung erstellen**

- Öffnen Sie das Erweiterungsmenü (der Zauberstab 🪄) und klicken Sie auf "Memory Books", oder verwenden Sie den Slash-Befehl `/creatememory`.
- Bestätigen Sie die Einstellungen (Profil, Kontext, API/Modell), falls Sie dazu aufgefordert werden.
- Warten Sie auf die KI-Generierung und den automatischen Lorebook-Eintrag.

---

## 🆕 Slash-Befehl-Kurzbefehle

- `/creatememory` verwendet existierende Chevron-Start/End-Markierungen, um eine Erinnerung zu erstellen.
- `/scenememory x-y` erstellt eine Erinnerung beginnend bei Nachricht x und endend bei Nachricht y.
- `/nextmemory` erstellt eine Erinnerung mit allen Nachrichten seit der letzten Erinnerung.

## 👥 Gruppenchat-Unterstützung

- Alle Funktionen funktionieren mit Gruppenchats.
- Szenenmarkierungen, Erinnerungserstellung und Lorebook-Integration werden in den Gruppen-Metadaten gespeichert.
- Keine spezielle Einrichtung erforderlich – einfach einen Gruppenchat auswählen und wie gewohnt verwenden.

---

## 🧭 Betriebsmodi

### **Automatischer Modus (Standard)**

- **Wie es funktioniert:** Verwendet automatisch das Lorebook, das an Ihren aktuellen Chat gebunden ist.
- **Am besten für:** Einfachheit und Geschwindigkeit. Die meisten Benutzer sollten hiermit beginnen.
- **Verwendung:** Stellen Sie sicher, dass im Dropdown-Menü "Chat Lorebooks" für Ihren Charakter oder Gruppenchat ein Lorebook ausgewählt ist.

### **Lorebook automatisch erstellen Modus** ⭐ _Neu in v4.2.0_

- **Wie es funktioniert:** Erstellt und bindet automatisch ein neues Lorebook, wenn keines existiert, unter Verwendung Ihrer benutzerdefinierten Namensvorlage.
- **Am besten für:** Neue Benutzer und schnelle Einrichtung. Perfekt für die Lorebook-Erstellung mit einem Klick.
- **Verwendung:**

1. Aktivieren Sie "Auto-create lorebook if none exists" in den Einstellungen der Erweiterung.
2. Konfigurieren Sie Ihre Namensvorlage (Standard: "LTM - {{char}} - {{chat}}").
3. Wenn Sie eine Erinnerung ohne gebundenes Lorebook erstellen, wird automatisch eines erstellt und gebunden.

- **Vorlagen-Platzhalter:** {{char}} (Charaktername), {{user}} (Ihr Name), {{chat}} (Chat-ID)
- **Intelligente Nummerierung:** Fügt automatisch Nummern hinzu (2, 3, 4...), falls doppelte Namen existieren.
- **Hinweis:** Kann nicht gleichzeitig mit dem manuellen Lorebook-Modus verwendet werden.

### **Manueller Lorebook-Modus**

- **Wie es funktioniert:** Ermöglicht Ihnen die Auswahl eines anderen Lorebooks für Erinnerungen auf Chat-Basis, wobei das an den Hauptchat gebundene Lorebook ignoriert wird.
- **Am besten für:** Fortgeschrittene Benutzer, die Erinnerungen in ein spezifisches, separates Lorebook leiten möchten.
- **Verwendung:**

1. Aktivieren Sie "Enable Manual Lorebook Mode" in den Einstellungen der Erweiterung.
2. Wenn Sie das erste Mal eine Erinnerung in einem Chat erstellen, werden Sie aufgefordert, ein Lorebook auszuwählen.
3. Diese Wahl wird für diesen spezifischen Chat gespeichert, bis Sie sie löschen oder zum automatischen Modus zurückkehren.

- **Hinweis:** Kann nicht gleichzeitig mit dem Modus "Lorebook automatisch erstellen" verwendet werden.

---

## 🧩 Erinnerungstypen: Szenen vs. Arcs

📕 Memory Books unterstützt **zwei Ebenen narrativer Erinnerung**, jede für unterschiedliche Arten von Kontinuität entworfen.

### 🎬 Szenen-Erinnerungen (Standard)

Szenen-Erinnerungen erfassen, **was** in einem bestimmten Bereich von Nachrichten passiert ist.

- Basiert auf expliziter Szenenauswahl (► ◄)
- Ideal für den Abruf von Moment-zu-Moment-Ereignissen
- Bewahrt Dialoge, Handlungen und unmittelbare Ergebnisse
- Sollte häufig verwendet werden

Dies ist der Standard- und am häufigsten verwendete Erinnerungstyp.

---

### 🧭 Arc-Zusammenfassungen (Handlungsbögen) _(Beta)_

Arc-Zusammenfassungen erfassen, **was sich im Laufe der Zeit verändert hat**, über mehrere Szenen hinweg.

Anstatt Ereignisse zusammenzufassen, konzentrieren sich Arc-Zusammenfassungen auf:

- Charakterentwicklung und Beziehungsverschiebungen
- Langfristige Ziele, Spannungen und Auflösungen
- Emotionale Entwicklung und narrative Richtung
- Dauerhafte Zustandsänderungen, die stabil bleiben sollten

Arc-Zusammenfassungen sind **Erinnerungen auf höherer Ebene mit niedrigerer Frequenz**, die verhindern sollen, dass Charaktere abdriften und der narrative Faden in lang laufenden Chats verloren geht.

> 💡 Denken Sie bei Arc-Zusammenfassungen an _Staffel-Rückblicke_, nicht an Szenen-Protokolle.

#### Wann man Arc-Zusammenfassungen verwendet

- Nach einer großen Verschiebung in einer Beziehung
- Am Ende eines Story-Kapitels oder Handlungsbogens (Arc)
- Wenn sich Motivationen, Vertrauen oder Machtdynamiken ändern
- Bevor eine neue Phase der Geschichte beginnt

#### Beta-Hinweise

- Arc-Zusammenfassungen sind prompt-sensitiv und bewusst konservativ gestaltet.
- Es wird empfohlen, sie vor dem Speichern im Lorebook zu überprüfen.
- Am besten gepaart mit Lorebook-Einträgen niedrigerer Priorität oder im Meta-Stil.

Arc-Zusammenfassungen werden **aus bestehenden Szenen-Erinnerungen** generiert, nicht direkt aus dem rohen Chat.

Das bietet Ihnen:

- reduzierten Token-Verbrauch
- Die KI hat ein besseres Verständnis für den narrativen Fluss

---

## 📝 Erinnerungs-Generierung

### **Nur JSON-Ausgabe**

Alle Prompts und Presets **müssen** die KI anweisen, nur gültiges JSON zurückzugeben, z.B.:

```json
{
  "title": "Kurzer Szenentitel",
  "content": "Detaillierte Zusammenfassung der Szene...",
  "keywords": ["stichwort1", "stichwort2"]
}
```

**Kein anderer Text ist in der Antwort erlaubt.**

### **Integrierte Vorlagen (Presets)**

1. **Summary:** Detaillierte Zusammenfassungen Schlag auf Schlag (Beat-by-Beat).
2. **Summarize:** Markdown-Überschriften für Zeitlinie, Beats, Interaktionen, Ergebnis.
3. **Synopsis:** Umfassendes, strukturiertes Markdown.
4. **Sum Up:** Prägnante Beat-Zusammenfassung mit Zeitlinie.
5. **Minimal:** 1-2 Sätze Zusammenfassung.

### **Benutzerdefinierte Prompts**

- Erstellen Sie Ihre eigenen, aber sie **müssen** gültiges JSON wie oben zurückgeben.

---

## 📚 Lorebook-Integration

- **Automatische Eintragserstellung:** Neue Erinnerungen werden als Einträge mit allen Metadaten gespeichert.
- **Flag-basierte Erkennung:** Nur Einträge mit dem `stmemorybooks` Flag werden als Erinnerungen erkannt.
- **Automatische Nummerierung:** Sequentielle, mit Nullen aufgefüllte Nummerierung mit mehreren unterstützten Formaten (`[000]`, `(000)`, `{000}`, `#000`).
- **Manuelle/Automatische Reihenfolge:** Einstellungen für die Einfügereihenfolge pro Profil.
- **Editor-Aktualisierung:** Aktualisiert optional den Lorebook-Editor nach dem Hinzufügen einer Erinnerung.

> **Bestehende Erinnerungen müssen konvertiert werden!**
> Verwenden Sie den [Lorebook Converter](https://www.google.com/search?q=/resources/lorebookconverter.html), um das `stmemorybooks` Flag und erforderliche Felder hinzuzufügen.

---

### 🎡 Tracker & Neben-Prompts (Side Prompts)

Side Prompts können wie Tracker verwendet werden und erstellen Einträge in Ihrem Erinnerungs-Lorebook. Side Prompts ermöglichen es Ihnen, **laufende Zustände** zu verfolgen, nicht nur vergangene Ereignisse. Zum Beispiel:

- 💰 Inventar & Ressourcen ("Welche Gegenstände hat der Benutzer?")
- ❤️ Beziehungsstatus ("Was fühlt X für Y?")
- 📊 Charakterwerte ("Aktuelle Gesundheit, Fähigkeiten, Ruf")
- 🎯 Quest-Fortschritt ("Welche Ziele sind aktiv?")
- 🌍 Weltzustand ("Was hat sich im Setting geändert?")

#### **Zugriff:** Klicken Sie in den Memory Books Einstellungen auf „🎡 Side Prompt Manager“.

#### **Funktionen:**

```
- Alle Side Prompts anzeigen.
- Neue Prompts erstellen oder duplizieren, um mit verschiedenen Prompt-Stilen zu experimentieren.
- Jedes Preset bearbeiten oder löschen (einschließlich der integrierten).
- Exportieren und Importieren von Presets als JSON-Dateien für Backup oder Teilen.
- Manuell oder automatisch mit der Erinnerungserstellung ausführen.

```

#### **Nutzungstipps:**

```
- Wenn Sie einen neuen Prompt erstellen, können Sie von den integrierten kopieren, um beste Kompatibilität zu gewährleisten.
- Zusätzliche Side Prompts Vorlagenbibliothek [JSON-Datei](resources/SidePromptTemplateLibrary.json) - einfach importieren und verwenden.

```

---

### 🧠 Regex-Integration für fortgeschrittene Anpassung

- **Volle Kontrolle über Textverarbeitung**: Memory Books integriert sich jetzt mit der **Regex**-Erweiterung von SillyTavern, was leistungsstarke Texttransformationen in zwei Schlüsselphasen ermöglicht:

1. **Prompt-Generierung**: Ändern Sie automatisch die an die KI gesendeten Prompts, indem Sie Regex-Skripte erstellen, die auf die Platzierung **User Input** abzielen.
2. **Antwort-Parsing**: Bereinigen, neu formatieren oder standardisieren Sie die rohe Antwort der KI, bevor sie gespeichert wird, indem Sie auf die Platzierung **AI Output** abzielen.

- **Multi-Select-Unterstützung**: Sie können jetzt mehrere Regex-Skripte auswählen. Alle aktivierten Skripte werden nacheinander in jeder Phase (Prompt-Generierung und Antwort-Parsing) angewendet, was fortgeschrittene und flexible Transformationen ermöglicht.
- **Wie es funktioniert**: Die Integration ist nahtlos. Erstellen und aktivieren (Mehrfachauswahl) Sie einfach Ihre gewünschten Skripte in der Regex-Erweiterung, und Memory Books wendet sie automatisch während der Erstellung von Erinnerungen und Side Prompts an.

---

## 👤 Profilverwaltung

- **Profile:** Jedes Profil enthält Einstellungen für API, Modell, Temperatur, Prompt/Preset, Titelformat und Lorebook.
- **Import/Export:** Profile als JSON teilen.
- **Profil-Erstellung:** Verwenden Sie das Popup für erweiterte Optionen, um neue Profile zu speichern.
- **Pro-Profil-Überschreibungen:** Wechseln Sie vorübergehend API/Modell/Temp für die Erinnerungserstellung und stellen Sie dann Ihre ursprünglichen Einstellungen wieder her.

---

## ⚙️ Einstellungen & Konfiguration

### **Globale Einstellungen**

[Kurzer Videoüberblick auf Youtube](https://youtu.be/mG2eRH_EhHs)

- **Manual Lorebook Mode:** Aktivieren, um Lorebooks pro Chat auszuwählen.
- **Auto-create lorebook if none exists:** ⭐ _Neu in v4.2.0_ - Automatisch Lorebooks unter Verwendung Ihrer Namensvorlage erstellen und binden.
- **Lorebook Name Template:** ⭐ _Neu in v4.2.0_ - Anpassen der automatisch erstellten Lorebook-Namen mit {{char}}, {{user}}, {{chat}} Platzhaltern.
- **Allow Scene Overlap:** Überlappende Erinnerungsbereiche zulassen oder verhindern.
- **Always Use Default Profile:** Bestätigungs-Popups überspringen.
- **Show memory previews:** Vorschau-Popup aktivieren, um Erinnerungen zu überprüfen und zu bearbeiten, bevor sie zum Lorebook hinzugefügt werden.
- **Show Notifications:** Toast-Nachrichten umschalten.
- **Refresh Editor:** Lorebook-Editor nach Erinnerungserstellung automatisch aktualisieren.
- **Token Warning Threshold:** Warnstufe für große Szenen festlegen (Standard: 30.000).
- **Default Previous Memories:** Anzahl der vorherigen Erinnerungen, die als Kontext einbezogen werden sollen (0-7).
- **Auto-create memory summaries:** Automatische Erinnerungserstellung in Intervallen aktivieren.
- **Auto-Summary Interval:** Anzahl der Nachrichten, nach denen automatisch eine Erinnerungszusammenfassung erstellt wird (10-200, Standard: 100).
- **Memory Title Format:** Wählen oder anpassen (siehe unten).

### **Profil-Felder**

- **Name:** Anzeigename.
- **API/Provider:** openai, claude, custom, etc.
- **Model:** Modellname (z.B. gpt-4, claude-3-opus).
- **Temperature:** 0.0–2.0.
- **Prompt or Preset:** Benutzerdefiniert oder eingebaut.
- **Title Format:** Vorlage pro Profil.
- **Activation Mode:** Vectorized, Constant, Normal.
- **Position:** ↑Char, ↓Cha, ↑EM, ↓EM, ↑AN, Outlet (und Feldname).
- **Order Mode:** Auto/Manual.
- **Recursion:** Rekursion verhindern/verzögern.

---

## 🏷️ Titel-Formatierung

Passen Sie die Titel Ihrer Lorebook-Einträge mit einem leistungsstarken Vorlagensystem an.

- **Platzhalter:**
- `{{title}}` - Der von der KI generierte Titel (z.B. "Eine schicksalhafte Begegnung").
- `{{scene}}` - Der Nachrichtenbereich (z.B. "Scene 15-23").
- `{{char}}` - Der Name des Charakters.
- `{{user}}` - Ihr Benutzername.
- `{{messages}}` - Die Anzahl der Nachrichten in der Szene.
- `{{profile}}` - Der Name des für die Generierung verwendeten Profils.
- Aktuelle Datum/Zeit-Platzhalter in verschiedenen Formaten (z.B. `August 13, 2025` für Datum, `11:08 PM` für Zeit).

- **Auto-Nummerierung:** Verwenden Sie `[0]`, `[00]`, `(0)`, `{0}`, `#0`, und jetzt auch die umschlossenen Formen wie `#[000]`, `([000])`, `{[000]}` für sequentielle, mit Nullen aufgefüllte Nummerierung.
- **Benutzerdefinierte Formate:** Sie können Ihre eigenen Formate erstellen. Seit v4.5.1 sind alle druckbaren Unicode-Zeichen (einschließlich Emoji, CJK, akzentuierte Zeichen, Symbole usw.) in Titeln erlaubt; nur Unicode-Steuerzeichen werden blockiert.

---

## 🧵 Kontext-Erinnerungen

- **Bis zu 7 vorherige Erinnerungen einbeziehen** als Kontext für bessere Kontinuität.
- **Token-Schätzung** schließt Kontext-Erinnerungen für Genauigkeit ein.

---

## 🎨 Visuelles Feedback & Barrierefreiheit

- **Schaltflächen-Zustände:**
- Inaktiv, aktiv, gültige Auswahl, in-scene (in der Szene), processing (verarbeitet).

- **Barrierefreiheit:**
- Tastaturnavigation, Fokusindikatoren, ARIA-Attribute, reduzierte Bewegung, mobilfreundlich.

---

# FAQ (Häufig gestellte Fragen)

### Ich kann Memory Books nicht im Erweiterungsmenü finden!

Die Einstellungen befinden sich im Erweiterungsmenü (der Zauberstab 🪄 links neben Ihrem Eingabefeld). Suchen Sie nach "Memory Books".

### Muss ich Vektoren verwenden?

Der 🔗 Eintrag in World Info heißt in der ST-Benutzeroberfläche "vectorized". Deshalb verwende ich das Wort vektorisiert. Wenn Sie die Vektoren-Erweiterung nicht verwenden (ich tue es nicht), funktioniert es über Schlüsselwörter (Keywords). Dies ist alles automatisiert, sodass Sie nicht darüber nachdenken müssen, welche Schlüsselwörter Sie verwenden sollen.

### Sollte ich ein separates Lorebook für Erinnerungen erstellen, oder kann ich dasselbe Lorebook verwenden, das ich bereits für andere Dinge nutze?

Ich empfehle, dass Ihr Erinnerungs-Lorebook ein separates Buch ist. Dies macht es einfacher, Erinnerungen zu organisieren (im Vergleich zu anderen Einträgen). Zum Beispiel, um es zu einem Gruppenchat hinzuzufügen, es in einem anderen Chat zu verwenden oder ein individuelles Lorebook-Budget festzulegen (mit STLO).

### Sollte ich 'Delay until recursion' verwenden, wenn Memory Books das einzige Lorebook ist?

Nein. Wenn es keine anderen World Info-Einträge oder Lorebooks gibt, kann die Auswahl von 'Delay until recursion' verhindern, dass die erste Schleife ausgelöst wird, wodurch nichts aktiviert wird. Wenn Memory Books das einzige Lorebook ist, deaktivieren Sie entweder 'Delay until recursion' oder stellen Sie sicher, dass mindestens eine zusätzliche World Info / ein zusätzliches Lorebook konfiguriert ist.

---

# Fehlerbehebung (Troubleshooting)

- **Kein Lorebook verfügbar oder ausgewählt:**
- Wählen Sie im manuellen Modus ein Lorebook aus, wenn Sie dazu aufgefordert werden.
- Binden Sie im automatischen Modus ein Lorebook an Ihren Chat.
- Oder aktivieren Sie "Auto-create lorebook if none exists" für die automatische Erstellung.

- **Keine Szene ausgewählt:**
- Markieren Sie sowohl Start- (►) als auch Endpunkte (◄).

- **Szene überschneidet sich mit bestehender Erinnerung:**
- Wählen Sie einen anderen Bereich oder aktivieren Sie "Allow scene overlap" in den Einstellungen.

- **KI konnte keine gültige Erinnerung generieren:**
- Verwenden Sie ein Modell, das JSON-Ausgabe unterstützt.
- Überprüfen Sie Ihren Prompt und die Modelleinstellungen.

- **Token-Warnschwelle überschritten:**
- Verwenden Sie eine kleinere Szene oder erhöhen Sie den Schwellenwert.

- **Fehlende Chevron-Schaltflächen:**
- Warten Sie, bis die Erweiterung geladen ist, oder aktualisieren Sie die Seite.

- **Charakterdaten nicht verfügbar:**
- Warten Sie, bis der Chat/die Gruppe vollständig geladen ist.

---

## 📝 Zeichen-Richtlinie (v4.5.1+)

- **In Titeln erlaubt:** Alle druckbaren Unicode-Zeichen sind erlaubt, einschließlich akzentuierter Buchstaben, Emojis, CJK und Symbolen.
- **Blockiert:** Nur Unicode-Steuerzeichen (U+0000–U+001F, U+007F–U+009F) werden blockiert; diese werden automatisch entfernt.

## Siehe [Details zur Zeichen-Richtlinie](https://www.google.com/search?q=charset.md) für Beispiele und Migrationshinweise.

_Entwickelt mit Liebe unter Verwendung von VS Code/Cline, umfangreichen Tests und Community-Feedback._ 🤖💕
