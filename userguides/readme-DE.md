# 📕 Memory Books (Eine SillyTavern-Erweiterung)

Eine SillyTavern-Erweiterung der nächsten Generation für automatische, strukturierte und zuverlässige Speichererstellung. Markieren Sie Szenen im Chat, generieren Sie JSON-basierte Zusammenfassungen mit KI und speichern Sie diese als „[vektorisierte](#vectorized)“ Einträge in Ihren Lorebooks. Unterstützt Gruppenchats, erweiterte Profilverwaltung und bietet eine robuste API/Modell-Handhabung.

Hier starten:
* ⚠️‼️Bitte lesen Sie die [Voraussetzungen](#-voraussetzungen) für Installationshinweise (besonders wenn Sie die Text Completion API verwenden)
* ❓ [Häufig gestellte Fragen (FAQ)](#faq)
* 🛠️ [Fehlerbehebung (Troubleshooting)](#fehlerbehebung)

Weitere Links:
* 📘 [Benutzerhandbuch (EN)](USER_GUIDE.md)
* 📋 [Versionsverlauf & Änderungsprotokoll](changelog.md)
* 💡 [Verwendung von 📕 Memory Books mit 📚 Lorebook Ordering](https://github.com/aikohanasaki/SillyTavern-LorebookOrdering/blob/main/guides/STMB%20and%20STLO%20-%20English.md)

---

### 📚 Verbessern Sie Ihre Erfahrung mit Lorebook Ordering (STLO)

Für eine fortgeschrittene Organisation von Erinnerungen und eine tiefere Integration in die Geschichte empfehlen wir dringend, STMB zusammen mit [SillyTavern-LorebookOrdering (STLO)](https://github.com/aikohanasaki/SillyTavern-LorebookOrdering/blob/main/guides/STMB%20and%20STLO%20-%20English.md) zu verwenden. Sehen Sie sich den Leitfaden für Best Practices, Einrichtungsanweisungen und Tipps an!

> Hinweis: Unterstützt verschiedene Sprachen: siehe Ordner [`/locales`](locales) für eine Liste. Internationale/übersetzte Readmes und Benutzerhandbücher finden Sie im Ordner [`/userguides`](userguides).
> Lorebook-Konverter und Vorlagenbibliothek für Side Prompts befinden sich im Ordner [`/resources`](resources).

---

## 📋 Voraussetzungen

- **SillyTavern:** 1.13.5+ (neueste Version empfohlen)
- ⚠️‼️**FÜR ALLE BENUTZER INSTALLIEREN:**‼️⚠️ Da STMB viele Funktionen aus dem ST-Basiscode wiederverwendet, stellen Sie bitte sicher, dass die Erweiterung für alle Benutzer installiert ist, sodass der Pfad `/public/scripts/extensions/third-party/SillyTavern-MemoryBooks` lautet. Andernfalls schlagen Funktionsimporte fehl.
- **Szenenauswahl:** Start- und Endmarkierungen (Start < Ende) müssen gesetzt sein.
- **Unterstützung für Chat Completion:** Volle Unterstützung für OpenAI, Claude, Anthropic, OpenRouter oder andere Chat Completion APIs.
- **Unterstützung für Text Completion:** Text Completion APIs (Kobold, TextGen usw.) werden unterstützt, wenn sie über einen Chat Completion (OpenAI-kompatiblen) API-Endpunkt verbunden sind. Ich empfehle, eine Chat Completion API-Verbindung gemäß den untenstehenden KoboldCpp-Tipps einzurichten (passen Sie dies an, wenn Sie Ollama oder andere Software verwenden). Richten Sie danach ein STMB-Profil ein und verwenden Sie Custom (empfohlen) oder die vollständige manuelle Konfiguration (nur wenn Custom fehlschlägt oder Sie mehr als eine benutzerdefinierte Verbindung haben).

### KoboldCpp-Tipps zur Verwendung von 📕 ST Memory Books
Richten Sie dies in ST ein (Sie können zu Text Completion zurückkehren, NACHDEM Sie STMB zum Laufen gebracht haben):
- Chat Completion API
- Quelle: Custom (OpenAI-compatible)
- `http://localhost:5001/v1` Endpunkt (Sie können auch `127.0.0.1:5000/v1` verwenden)
- Geben Sie irgendetwas in "Custom API Key" ein (spielt keine Rolle, aber ST benötigt einen)
- Die Model-ID muss `koboldcpp/modelname` sein (kein .gguf im Modellnamen!)
- Laden Sie ein Chat Completion Preset herunter und importieren Sie es (irgendeines reicht), nur damit Sie ein Chat Completion Preset HABEN. Dies vermeidet Fehler wegen "nicht unterstützt".

## 💡 Empfohlene Globale World Info/Lorebook Aktivierungseinstellungen

- **Match Whole Words:** deaktiviert lassen (false)
- **Scan Depth:** höher ist besser (meins ist auf 8 eingestellt)
- **Max Recursion Steps:** 2 (allgemeine Empfehlung, nicht erforderlich)
- **Context %:** 80% (basierend auf einem Kontextfenster von 100.000 Token) - setzt voraus, dass Sie keinen extrem umfangreichen Chatverlauf oder Bots haben.

---

## 🚀 Erste Schritte

### 1. **Installieren & Laden**
- Laden Sie SillyTavern und wählen Sie einen Charakter oder Gruppenchat aus.
- Warten Sie, bis die Chevron-Schaltflächen (► ◄) an den Chat-Nachrichten erscheinen (kann bis zu 10 Sekunden dauern).

![Warten Sie auf diese Schaltflächen](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/startup.png)

### 2. **Eine Szene markieren**
- Klicken Sie auf ► bei der ersten Nachricht Ihrer Szene.
- Klicken Sie auf ◄ bei der letzten Nachricht.

![Visuelles Feedback, das die Szenenauswahl zeigt](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/button-start.png)

### 3. **Eine Erinnerung erstellen**
- Öffnen Sie das Erweiterungsmenü (der Zauberstab 🪄) und klicken Sie auf „Memory Books“ oder verwenden Sie den Befehl `/creatememory`.
- Bestätigen Sie die Einstellungen (Profil, Kontext, API/Modell), falls Sie dazu aufgefordert werden.
- Warten Sie auf die KI-Generierung und den automatischen Lorebook-Eintrag.

---

## 🆕 Befehlskürzel (Slash Commands)

- `/creatememory` verwendet vorhandene Chevron-Start/End-Markierungen, um eine Erinnerung zu erstellen.
- `/scenememory x-y` erstellt eine Erinnerung, die mit Nachricht x beginnt und mit Nachricht y endet.
- `/nextmemory` erstellt eine Erinnerung mit allen Nachrichten seit der letzten Erinnerung.

## 👥 Gruppenchat-Unterstützung

- Alle Funktionen funktionieren mit Gruppenchats.
- Szenenmarkierungen, Speichererstellung und Lorebook-Integration werden in den Gruppen-Metadaten gespeichert.
- Keine spezielle Einrichtung erforderlich – einfach einen Gruppenchat auswählen und wie gewohnt verwenden.

---

## 🧭 Betriebsmodi

### **Automatischer Modus (Standard)**
- **Wie es funktioniert:** Verwendet automatisch das Lorebook, das an Ihren aktuellen Chat gebunden ist.
- **Am besten für:** Einfachheit und Geschwindigkeit. Die meisten Benutzer sollten hiermit beginnen.
- **Verwendung:** Stellen Sie sicher, dass im Dropdown-Menü „Chat Lorebooks“ für Ihren Charakter oder Gruppenchat ein Lorebook ausgewählt ist.

![Beispiel für Chat-Lorebook-Bindung](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/chatlorebook.png)

### **Modus zum automatischen Erstellen von Lorebooks** ⭐ *Neu in v4.2.0*
- **Wie es funktioniert:** Erstellt und bindet automatisch ein neues Lorebook, wenn keines existiert, unter Verwendung Ihrer benutzerdefinierten Namensvorlage.
- **Am besten für:** Neue Benutzer und schnelle Einrichtung. Perfekt für die Erstellung von Lorebooks mit einem Klick.
- **Verwendung:**
  1. Aktivieren Sie „Auto-create lorebook if none exists“ in den Einstellungen der Erweiterung.
  2. Konfigurieren Sie Ihre Namensvorlage (Standard: „LTM - {{char}} - {{chat}}“).
  3. Wenn Sie eine Erinnerung ohne gebundenes Lorebook erstellen, wird automatisch eines erstellt und gebunden.
- **Vorlagen-Platzhalter:** {{char}} (Charaktername), {{user}} (Ihr Name), {{chat}} (Chat-ID)
- **Intelligente Nummerierung:** Fügt automatisch Nummern hinzu (2, 3, 4...), falls doppelte Namen existieren.
- **Hinweis:** Kann nicht gleichzeitig mit dem manuellen Lorebook-Modus verwendet werden.

### **Manueller Lorebook-Modus**
- **Wie es funktioniert:** Ermöglicht es Ihnen, ein anderes Lorebook für Erinnerungen auf Chat-Basis auszuwählen und das an den Haupt-Chat gebundene Lorebook zu ignorieren.
- **Am besten für:** Fortgeschrittene Benutzer, die Erinnerungen in ein bestimmtes, separates Lorebook leiten möchten.
- **Verwendung:**
  1. Aktivieren Sie „Enable Manual Lorebook Mode“ in den Einstellungen der Erweiterung.
  2. Wenn Sie das erste Mal eine Erinnerung in einem Chat erstellen, werden Sie aufgefordert, ein Lorebook auszuwählen.
  3. Diese Wahl wird für diesen spezifischen Chat gespeichert, bis Sie sie löschen oder zum automatischen Modus zurückkehren.
- **Hinweis:** Kann nicht gleichzeitig mit dem Modus zum automatischen Erstellen von Lorebooks verwendet werden.

---

## 📝 Generierung von Erinnerungen

### **Nur JSON-Ausgabe**
Alle Prompts und Presets **müssen** die KI anweisen, nur valides JSON zurückzugeben, z. B.:

```json
{
  "title": "Kurzer Szenentitel",
  "content": "Detaillierte Zusammenfassung der Szene...",
  "keywords": ["stichwort1", "stichwort2"]
}

```

**Kein anderer Text ist in der Antwort erlaubt.**

### **Eingebaute Presets**

1. **Summary:** Detaillierte Zusammenfassungen Schlag auf Schlag.
2. **Summarize:** Markdown-Überschriften für Zeitlinie, Handlungsschritte, Interaktionen, Ergebnis.
3. **Synopsis:** Umfassendes, strukturiertes Markdown.
4. **Sum Up:** Prägnante Zusammenfassung mit Zeitlinie.
5. **Minimal:** Zusammenfassung in 1-2 Sätzen.

### **Benutzerdefinierte Prompts**

* Erstellen Sie Ihre eigenen, aber sie **müssen** valides JSON wie oben zurückgeben.

---

## 📚 Lorebook Integration

* **Automatische Eintragserstellung:** Neue Erinnerungen werden als Einträge mit allen Metadaten gespeichert.
* **Flag-basierte Erkennung:** Nur Einträge mit dem `stmemorybooks`-Flag werden als Erinnerungen erkannt.
* **Automatische Nummerierung:** Sequentielle, mit Nullen aufgefüllte Nummerierung mit mehreren unterstützten Formaten (`[000]`, `(000)`, `{000}`, `#000`).
* **Manuelle/Automatische Reihenfolge:** Einstellungen für die Einfügereihenfolge pro Profil.
* **Editor-Aktualisierung:** Aktualisiert optional den Lorebook-Editor nach dem Hinzufügen einer Erinnerung.

> **Vorhandene Erinnerungen müssen konvertiert werden!**
> Verwenden Sie den [Lorebook Converter](https://www.google.com/search?q=/resources/lorebookconverter.html), um das `stmemorybooks`-Flag und die erforderlichen Felder hinzuzufügen.

---

### 🎡 Side Prompts

Side Prompts können wie Tracker verwendet werden und erstellen Einträge in Ihrem Speicher-Lorebook.

* **Zugriff:** Klicken Sie in den Memory Books-Einstellungen auf „🎡 Side Prompt Manager“.
* **Funktionen:**
* Alle Side Prompts anzeigen.
* Neue Prompts erstellen oder duplizieren, um mit verschiedenen Prompt-Stilen zu experimentieren.
* Bearbeiten oder löschen Sie jedes Preset (einschließlich der eingebauten).
* Exportieren und importieren Sie Presets als JSON-Dateien zur Sicherung oder Weitergabe.
* Führen Sie sie manuell oder automatisch mit der Speichererstellung aus.


* **Tipps zur Verwendung:**
* Wenn Sie einen neuen Prompt erstellen, können Sie von den eingebauten kopieren, um die beste Kompatibilität zu gewährleisten.
* Zusätzliche Side Prompts Vorlagenbibliothek [JSON-Datei](https://www.google.com/search?q=resources/SidePromptTemplateLibrary.json) - einfach importieren, um sie zu verwenden.



---

### 🧠 Regex-Integration für erweiterte Anpassung

* **Volle Kontrolle über die Textverarbeitung**: Memory Books integriert sich jetzt in die **Regex**-Erweiterung von SillyTavern und ermöglicht es Ihnen, leistungsstarke Texttransformationen in zwei Schlüsselphasen anzuwenden:
1. **Prompt-Generierung**: Ändern Sie automatisch die an die KI gesendeten Prompts, indem Sie Regex-Skripte erstellen, die auf die Platzierung **User Input** abzielen.
2. **Antwort-Parsing**: Bereinigen, neu formatieren oder standardisieren Sie die Rohantwort der KI, bevor sie gespeichert wird, indem Sie auf die Platzierung **AI Output** abzielen.


* **Mehrfachauswahl-Unterstützung**: Sie können jetzt mehrere Regex-Skripte auswählen. Alle aktivierten Skripte werden nacheinander in jeder Phase (Prompt-Generierung und Antwort-Parsing) angewendet, was fortgeschrittene und flexible Transformationen ermöglicht.
* **Wie es funktioniert**: Die Integration ist nahtlos. Erstellen und aktivieren (Mehrfachauswahl) Sie einfach Ihre gewünschten Skripte in der Regex-Erweiterung, und Memory Books wendet sie automatisch während der Erstellung von Erinnerungen und Side Prompts an.

---

## 👤 Profilverwaltung

* **Profile:** Jedes Profil enthält API, Modell, Temperatur, Prompt/Preset, Titelformat und Lorebook-Einstellungen.
* **Importieren/Exportieren:** Profile als JSON teilen.
* **Profil erstellen:** Verwenden Sie das Popup für erweiterte Optionen, um neue Profile zu speichern.
* **Überschreibungen pro Profil:** Wechseln Sie vorübergehend API/Modell/Temp für die Speichererstellung und stellen Sie dann Ihre ursprünglichen Einstellungen wieder her.

---

## ⚙️ Einstellungen & Konfiguration

### **Globale Einstellungen**

[Kurzes Video-Overview auf Youtube](https://youtu.be/mG2eRH_EhHs)

* **Manual Lorebook Mode:** Aktivieren, um Lorebooks pro Chat auszuwählen.
* **Auto-create lorebook if none exists:** ⭐ *Neu in v4.2.0* - Lorebooks automatisch mit Ihrer Namensvorlage erstellen und binden.
* **Lorebook Name Template:** ⭐ *Neu in v4.2.0* - Passen Sie automatisch erstellte Lorebook-Namen mit {{char}}, {{user}}, {{chat}} Platzhaltern an.
* **Allow Scene Overlap:** Überlappende Speicherbereiche zulassen oder verhindern.
* **Always Use Default Profile:** Bestätigungs-Popups überspringen.
* **Show memory previews:** Vorschau-Popup aktivieren, um Erinnerungen vor dem Hinzufügen zum Lorebook zu überprüfen und zu bearbeiten.
* **Show Notifications:** Toast-Benachrichtigungen umschalten.
* **Refresh Editor:** Lorebook-Editor nach Speichererstellung automatisch aktualisieren.
* **Token Warning Threshold:** Warnstufe für große Szenen festlegen (Standard: 30.000).
* **Default Previous Memories:** Anzahl der vorherigen Erinnerungen, die als Kontext einbezogen werden sollen (0-7).
* **Auto-create memory summaries:** Automatische Speichererstellung in Intervallen aktivieren.
* **Auto-Summary Interval:** Anzahl der Nachrichten, nach denen automatisch eine Speicherzusammenfassung erstellt werden soll (10-200, Standard: 100).
* **Memory Title Format:** Wählen oder anpassen (siehe unten).

### **Profil-Felder**

* **Name:** Anzeigename.
* **API/Provider:** openai, claude, custom, usw.
* **Model:** Modellname (z. B. gpt-4, claude-3-opus).
* **Temperature:** 0.0–2.0.
* **Prompt or Preset:** Benutzerdefiniert oder eingebaut.
* **Title Format:** Vorlage pro Profil.
* **Activation Mode:** Vectorized, Constant, Normal.
* **Position:** ↑Char, ↓Cha, ↑EM, ↓EM, ↑AN, Outlet (und Feldname).
* **Order Mode:** Auto/Manuell.
* **Recursion:** Rekursion verhindern/verzögern.

---

## 🏷️ Titel-Formatierung

Passen Sie die Titel Ihrer Lorebook-Einträge mit einem leistungsstarken Vorlagensystem an.

* **Platzhalter:**
* `{{title}}` - Der von der KI generierte Titel (z. B. „Eine schicksalhafte Begegnung“).
* `{{scene}}` - Der Nachrichtenbereich (z. B. „Szene 15-23“).
* `{{char}}` - Der Name des Charakters.
* `{{user}}` - Ihr Benutzername.
* `{{messages}}` - Die Anzahl der Nachrichten in der Szene.
* `{{profile}}` - Der Name des für die Generierung verwendeten Profils.
* Aktuelle Datums-/Zeit-Platzhalter in verschiedenen Formaten (z. B. `August 13, 2025` für Datum, `11:08 PM` für Zeit).


* **Automatische Nummerierung:** Verwenden Sie `[0]`, `[00]`, `(0)`, `{0}`, `#0` und jetzt auch die umschlossenen Formen wie `#[000]`, `([000])`, `{[000]}` für sequentielle, mit Nullen aufgefüllte Nummerierung.
* **Benutzerdefinierte Formate:** Sie können Ihre eigenen Formate erstellen. Ab v4.5.1 sind alle druckbaren Unicode-Zeichen (einschließlich Emoji, CJK, Akzente, Symbole usw.) in Titeln erlaubt; nur Unicode-Steuerzeichen werden blockiert.

---

## 🧵 Kontext-Erinnerungen

* **Bis zu 7 vorherige Erinnerungen einbeziehen** als Kontext für bessere Kontinuität.
* **Token-Schätzung** schließt Kontext-Erinnerungen für Genauigkeit ein.

---

## 🎨 Visuelles Feedback & Barrierefreiheit

* **Schaltflächen-Zustände:**
* Inaktiv, aktiv, gültige Auswahl, in-szene, verarbeitung.


* **Barrierefreiheit:**
* Tastaturnavigation, Fokusindikatoren, ARIA-Attribute, reduzierte Bewegung, mobilfreundlich.



---

# FAQ

### Ich kann Memory Books nicht im Erweiterungsmenü finden!

Die Einstellungen befinden sich im Erweiterungsmenü (der Zauberstab 🪄 links von Ihrem Eingabefeld). Suchen Sie nach „Memory Books“.

### Muss ich Vektoren verwenden?

Der 🔗-Eintrag in World Info heißt in der ST-Benutzeroberfläche „vektorisiert“. Deshalb verwende ich das Wort vektorisiert. Wenn Sie die Vektor-Erweiterung nicht verwenden (ich tue es nicht), funktioniert es über Schlüsselwörter (Keywords). Das ist alles automatisiert, sodass Sie nicht darüber nachdenken müssen, welche Schlüsselwörter Sie verwenden sollen.

### Sollte ich ein separates Lorebook für Erinnerungen erstellen, oder kann ich dasselbe Lorebook verwenden, das ich bereits für andere Dinge benutze?

Ich empfehle, dass Ihr Speicher-Lorebook ein separates Buch ist. Das macht es einfacher, Erinnerungen zu organisieren (im Vergleich zu anderen Einträgen). Zum Beispiel, um es einem Gruppenchat hinzuzufügen, es in einem anderen Chat zu verwenden oder ein individuelles Lorebook-Budget festzulegen (mit STLO).

### Sollte ich 'Delay until recursion' verwenden, wenn Memory Books das einzige Lorebook ist?

Nein. Wenn es keine anderen World Info oder Lorebooks gibt, kann die Auswahl von 'Delay until recursion' verhindern, dass die erste Schleife ausgelöst wird, was dazu führt, dass nichts aktiviert wird. Wenn Memory Books das einzige Lorebook ist, deaktivieren Sie entweder 'Delay until recursion' oder stellen Sie sicher, dass mindestens eine zusätzliche World Info/Lorebook konfiguriert ist.

---

# Fehlerbehebung (Troubleshooting)

* **Kein Lorebook verfügbar oder ausgewählt:**
* Wählen Sie im manuellen Modus ein Lorebook aus, wenn Sie dazu aufgefordert werden.
* Binden Sie im automatischen Modus ein Lorebook an Ihren Chat.
* Oder aktivieren Sie „Auto-create lorebook if none exists“ für die automatische Erstellung.


* **Keine Szene ausgewählt:**
* Markieren Sie sowohl Start- (►) als auch Endpunkte (◄).


* **Szene überlappt mit vorhandener Erinnerung:**
* Wählen Sie einen anderen Bereich oder aktivieren Sie „Allow scene overlap“ in den Einstellungen.


* **KI konnte keine gültige Erinnerung generieren:**
* Verwenden Sie ein Modell, das JSON-Ausgabe unterstützt.
* Überprüfen Sie Ihre Prompt- und Modelleinstellungen.


* **Token-Warnschwelle überschritten:**
* Verwenden Sie eine kleinere Szene oder erhöhen Sie den Schwellenwert.


* **Fehlende Chevron-Schaltflächen:**
* Warten Sie, bis die Erweiterung geladen ist, oder aktualisieren Sie die Seite.


* **Charakterdaten nicht verfügbar:**
* Warten Sie, bis der Chat/die Gruppe vollständig geladen ist.



---

## 📝 Zeichenrichtlinie (v4.5.1+)

* **In Titeln erlaubt:** Alle druckbaren Unicode-Zeichen sind erlaubt, einschließlich akzentuierter Buchstaben, Emoji, CJK und Symbole.
* **Blockiert:** Nur Unicode-Steuerzeichen (U+0000–U+001F, U+007F–U+009F) werden blockiert; diese werden automatisch entfernt.

## Siehe [Details zur Zeichenrichtlinie](https://www.google.com/search?q=charset.md) für Beispiele und Migrationshinweise.

*Entwickelt mit Liebe unter Verwendung von VS Code/Cline, umfangreichen Tests und Community-Feedback.* 🤖💕
