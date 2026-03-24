# 📕 ST Memory Books - Dein KI-Chat-Gedächtnis-Assistent

**Verwandle deine endlosen Chat-Gespräche in organisierte, durchsuchbare Erinnerungen!**

Brauchst du einen Bot, der sich an Dinge erinnert, aber der Chat ist zu lang für den Kontext? Möchtest du wichtige Handlungspunkte automatisch verfolgen, ohne manuell Notizen zu machen? ST Memory Books macht genau das – es beobachtet deine Chats und erstellt intelligente Zusammenfassungen, damit du nie wieder den Faden deiner Geschichte verlierst.

(Suchst du nach technischen Details hinter den Kulissen? Vielleicht möchtest du stattdessen [Wie STMB funktioniert](howSTMBworks-de.md) lesen.)

---

## 📑 Inhaltsverzeichnis

- [Schnellstart](#-schnellstart-5-minuten-bis-zu-deiner-ersten-erinnerung)
- [Was ST Memory Books eigentlich tut](#-was-st-memory-books-eigentlich-tut)
- [Wähle deinen Stil](#-whle-deinen-stil)
- [Token sparen](#-token-sparen-ausblenden--einblenden)
- [Zusammenfassungs-Konsolidierung](#-zusammenfassungs-konsolidierung)
- [Tracker, Side Prompts & Vorlagen](#-tracker-side-prompts--vorlagen-fortgeschrittene-funktion)
- [Wichtige Einstellungen](#-einstellungen-die-wirklich-wichtig-sind)
- [Fehlerbehebung](#-fehlerbehebung-wenn-dinge-nicht-funktionieren)
- [Was ST Memory Books nicht tut](#-was-st-memory-books-nicht-tut)
- [Hilfe & mehr Infos](#-hilfe--mehr-infos)

## 🚀 Schnellstart (5 Minuten bis zu deiner ersten Erinnerung!)

**Neu bei ST Memory Books?** Lass uns dich mit nur wenigen Klicks für deine erste automatische Erinnerung einrichten:

### Schritt 1: Finde die Erweiterung

* Suche nach dem Zauberstab-Symbol (🪄) neben deinem Chat-Eingabefeld
* Klicke darauf und dann auf **"Memory Books"**
* Du siehst nun das Kontrollfeld von ST Memory Books

### Schritt 2: Schalte die Auto-Magie ein

* Finde im Kontrollfeld **"Automatische Erinnerungs-Zusammenfassungen erstellen"**
* Schalte es EIN (ON)
* Stelle **Intervall für automatische Zusammenfassung** auf **20-30 Nachrichten** ein (guter Startpunkt)
* Halte **Puffer für automatische Zusammenfassung** am Anfang niedrig (`0-2` ist meist gut)
* Erstelle zuerst eine manuelle Erinnerung, damit der Chat geprimt ist
* Das war's! 🎉

### Schritt 3: Chatte ganz normal

* Chatte wie gewohnt weiter
* Nach 20-30 neuen Nachrichten wird ST Memory Books automatisch:
* Die neuen Nachrichten seit dem letzten verarbeiteten Punkt verwenden
* Deine KI bitten, eine Zusammenfassung zu schreiben
* Sie in deiner Erinnerungssammlung speichern
* Dir eine Benachrichtigung anzeigen, wenn es fertig ist



**Herzlichen Glückwunsch!** Du hast jetzt ein automatisiertes Gedächtnismanagement. Nie wieder vergessen, was vor Kapiteln passiert ist!

---

## 💡 Was ST Memory Books eigentlich tut

Betrachte ST Memory Books als deinen **persönlichen KI-Bibliothekar** für Chat-Gespräche:

### 🤖 **Automatische Zusammenfassungen**

*"Ich will nicht darüber nachdenken, es soll einfach funktionieren"*

* Beobachtet deinen Chat im Hintergrund
* Erstellt automatisch alle X Nachrichten Erinnerungen
* Perfekt für lange Rollenspiele, kreatives Schreiben oder fortlaufende Geschichten

### ✋ **Manuelle Speichererstellung**

*"Ich möchte die Kontrolle darüber, was gespeichert wird"*

* Markiere wichtige Szenen mit einfachen Pfeiltasten (► ◄)
* Erstelle Erinnerungen auf Abruf für besondere Momente
* Großartig, um wichtige Handlungspunkte oder Charakterentwicklungen festzuhalten

### 📊 **Side Prompts & Intelligente Tracker**

*"Ich möchte Beziehungen, Handlungsstränge oder Statistiken verfolgen"*

* Wiederverwendbare Prompt-Schnipsel, die die Generierung von Erinnerungen verbessern
* Vorlagenbibliothek mit gebrauchsfertigen Trackern
* Benutzerdefinierte KI-Prompts, die alles verfolgen, was du willst
* Aktualisiert automatisch Punktestände, Beziehungsstatus, Handlungszusammenfassungen
* Beispiele: "Wer mag wen?", "Aktueller Quest-Status", "Charakter-Stimmungs-Tracker"

### 📚 **Erinnerungssammlungen (Memory Collections)**

*Wo alle deine Erinnerungen leben*

* Automatisch organisiert und durchsuchbar
* Funktioniert mit dem eingebauten Lorebook-System von SillyTavern
* Deine KI kann in neuen Gesprächen auf vergangene Erinnerungen verweisen

---

## 🎯 Wähle deinen Stil

<details>
<summary><strong>🔄 "Einstellen und Vergessen" (Empfohlen für Anfänger)</strong></summary>

**Perfekt, wenn du willst:** Hands-off-Automatisierung, die einfach funktioniert

**Wie es funktioniert:**

1. Schalte `Automatische Erinnerungs-Zusammenfassungen erstellen` ein
2. Stelle `Intervall für automatische Zusammenfassung` passend zu deinem Chattempo ein
3. Optional: setze einen kleinen `Puffer für automatische Zusammenfassung`, wenn du verspätete Erstellung willst
4. Chatte nach einer ersten manuellen Erinnerung ganz normal weiter

**Was du bekommst:**

* Keine manuelle Arbeit erforderlich
* Konsistente Erstellung von Erinnerungen
* Verpasse nie wichtige Handlungsstränge
* Funktioniert sowohl in Einzel- als auch in Gruppenchats

**Pro-Tipp:** Beginne mit 30 Nachrichten und passe es dann deinem Chat-Stil an. Schnelle Chats brauchen vielleicht 50+, langsamere detaillierte Chats eher 20.

</details>

<details>
<summary><strong>✋ "Manuelle Kontrolle" (Für selektives Erinnern)</strong></summary>

**Perfekt, wenn du willst:** Genau entscheiden, was zu einer Erinnerung wird

**Wie es funktioniert:**

1. Suche nach kleinen Pfeiltasten (► ◄) an deinen Chat-Nachrichten
2. Klicke ► bei der ersten Nachricht einer wichtigen Szene
3. Klicke ◄ bei der letzten Nachricht dieser Szene
4. Öffne Memory Books (🪄) und klicke auf "Create Memory" (Erinnerung erstellen)

**Was du bekommst:**

* Volle Kontrolle über den Inhalt der Erinnerung
* Perfekt zum Festhalten spezifischer Momente
* Großartig für komplexe Szenen, die sorgfältige Abgrenzungen benötigen

**Pro-Tipp:** Die Pfeiltasten erscheinen einige Sekunden nach dem Laden eines Chats. Wenn du sie nicht siehst, warte einen Moment oder lade die Seite neu.

</details>

<details>
<summary><strong>⚡ "Power-User" (Slash-Befehle)</strong></summary>

**Perfekt, wenn du willst:** Tastaturkürzel und erweiterte Funktionen

**Wesentliche Befehle:**

* `/scenememory 10-25` - Erstelle Erinnerung aus den Nachrichten 10 bis 25
* `/creatememory` - Erstelle Erinnerung aus der aktuell markierten Szene
* `/nextmemory` - Fasse alles seit der letzten Erinnerung zusammen
* `/sideprompt "Relationship Tracker" {{macro}}="value" [X-Y]` - Führe einen benutzerdefinierten Tracker aus, optional mit Bereich
* `/sideprompt-on "Name"` oder `/sideprompt-off "Name"` - Schalte einen Side Prompt manuell ein oder aus
* `/stmb-set-highest <N|none>` - Setze die Auto-Summary-Basis für den aktuellen Chat

**Was du bekommst:**

* Blitzschnelle Erstellung von Erinnerungen
* Batch-Operationen
* Integration in benutzerdefinierte Arbeitsabläufe

</details>

---

## 🙈 Token sparen: Ausblenden / Einblenden

Eine der einfachsten Möglichkeiten, in langen Chats Token zu sparen, ist das Ausblenden von Nachrichten, nachdem sie bereits in Erinnerungen gespeichert wurden.

### Was bedeutet „ausblenden“?

Ausblenden löscht **nichts**. Die Nachrichten bleiben im Chat und die Erinnerungen bleiben im Lorebook. Sie werden nur aus der aktiven Ansicht und aus dem direkten KI-Kontext herausgenommen.

### Wann ist das nützlich?

* Dein Chat ist sehr lang geworden
* Du hast die betreffenden Nachrichten bereits in Erinnerungen gespeichert
* Du möchtest den Chat sauberer halten

### Auto-hide nach der Erinnerungserstellung

STMB kann Nachrichten nach dem Erstellen einer Erinnerung automatisch ausblenden:

* **Nicht automatisch verstecken**: nichts wird automatisch ausgeblendet
* **Alle Nachrichten bis zur letzten Erinnerung verstecken**: alles bis zur letzten Erinnerung wird ausgeblendet
* **Nur Nachrichten in der letzten Erinnerung verstecken**: nur der zuletzt verarbeitete Bereich wird ausgeblendet

Mit **Sichtbare Nachrichten beibehalten** bestimmst du, wie viele aktuelle Nachrichten sichtbar bleiben.

### Vor der Erinnerungserstellung einblenden

**Versteckte Nachrichten für die Erstellung von Erinnerungen einblenden (führt /unhide X-Y aus)** lässt STMB vor dem Erzeugen einer Erinnerung kurz `/unhide X-Y` ausführen. Das ist nützlich, wenn du Erinnerungen mit ausgeblendeten Nachrichten neu erstellen möchtest.

### Gute Start-Einstellung

* **Nur Nachrichten in der letzten Erinnerung verstecken**
* **2** Nachrichten sichtbar lassen
* **Versteckte Nachrichten für die Erstellung von Erinnerungen einblenden (führt /unhide X-Y aus)** aktivieren

## 🌈 Zusammenfassungs-Konsolidierung

Zusammenfassungs-Konsolidierung fasst ältere STMB-Erinnerungen zu höheren Zusammenfassungen zusammen.

### Was ist das?

STMB kann bestehende Erinnerungen oder Zusammenfassungen zu einer kompakteren Zusammenfassung verbinden. Die erste Stufe ist **Arc**; weitere Stufen sind **Chapter**, **Book**, **Legend**, **Series** und **Epic**.

### Wann ist das nützlich?

* Deine Erinnerungsliste wird sehr lang
* Alte Einträge brauchen kein vollständiges Szenen-Detail mehr
* Du willst Token sparen, ohne den Kontext zu verlieren

### Läuft das automatisch?

Nein. Die Konsolidierung braucht weiterhin eine Bestätigung.

* Du kannst **Erinnerungen zusammenfassen** jederzeit manuell öffnen
* Optional kann STMB bei einer erreichten Mindestanzahl eine Ja/Später-Bestätigung anzeigen
* „Ja“ öffnet nur das Konsolidierungs-Popup, es startet nicht still im Hintergrund

### Was wird konsolidiert?

* Normale STMB-Erinnerungen können konsolidiert werden
* Höhere Zusammenfassungen können später wieder konsolidiert werden
* Side Prompts sind Tracker-Einträge und werden **nicht** in Arc/Chapter-Zusammenfassungen eingerollt

### Wie benutzt man es?

1. Klicke im Haupt-Popup auf **Erinnerungen zusammenfassen**
2. Wähle die Zielstufe
3. Wähle die Quell-Einträge
4. Entscheide, ob die Quellen nach der Konsolidierung deaktiviert werden sollen
5. Klicke auf **Run**

Wenn die KI eine schlechte Konsolidierungs-Antwort liefert, kannst du die Antwort prüfen und korrigieren, bevor du den Commit wiederholst.

---

## 🎨 Tracker, Side Prompts & Vorlagen (Fortgeschrittene Funktion)

**Side Prompts** sind Hintergrund-Tracker, die helfen, laufende Story-Informationen aufrechtzuerhalten.
Sie schreiben separate Side-Prompt-Lorebook-Einträge und laufen parallel zur Speichererstellung. Betrachte sie als **Helfer, die deine Geschichte beobachten und bestimmte Details auf dem neuesten Stand halten**.
Standard-ST-Makros wie `{{user}}` und `{{char}}` werden in `Prompt`, `Response Format`, `Title` und Keyword-Feldern erweitert. Nicht standardmäßige `{{...}}`-Makros werden zu Pflichtangaben für den manuellen Aufruf.

### 🚀 **Schnellstart mit Vorlagen**

1. Öffne die Einstellungen von Memory Books
2. Klicke auf **Side Prompts**
3. Durchsuche die **Vorlagenbibliothek** und wähle aus, was zu deiner Geschichte passt:
* **Character Development Tracker** – Verfolgt Persönlichkeitsveränderungen und Wachstum
* **Relationship Dynamics** – Verfolgt Beziehungen zwischen Charakteren
* **Plot Thread Tracker** – Verfolgt laufende Handlungsstränge
* **Mood & Atmosphere** – Verfolgt den emotionalen Ton
* **World Building Notes** – Verfolgt Details zum Schauplatz und zur Lore


4. Aktiviere die gewünschten Vorlagen (du kannst sie später anpassen)
5. Wenn die Vorlage benutzerdefinierte Laufzeitmakros enthält, wird sie nicht automatisch ausgeführt und muss manuell mit `/sideprompt` gestartet werden

### ⚙️ **Wie Side Prompts funktionieren**

* **Hintergrund-Tracker**: Sie laufen leise und aktualisieren Informationen im Laufe der Zeit
* **Nicht störend**: Sie ändern nicht deine Haupt-KI-Einstellungen oder Charakter-Prompts
* **Pro-Chat-Kontrolle**: Verschiedene Chats können unterschiedliche Tracker verwenden
* **Vorlagenbasiert**: Verwende eingebaute Vorlagen oder erstelle deine eigenen
* **Automatisch oder Manuell**: Standardvorlagen können automatisch laufen; Vorlagen mit benutzerdefinierten Laufzeitmakros sind nur manuell nutzbar
* **Makro-Unterstützung**: `Prompt`, `Response Format`, `Title` und Keyword-Felder erweitern standardmäßige ST-Makros wie `{{user}}` und `{{char}}`
* **Sicherheitsprüfung**: Wenn eine Vorlage benutzerdefinierte Laufzeitmakros enthält, entfernt STMB beim Speichern/Importieren `onInterval` und `onAfterMemory` und zeigt eine Warnung an
* **Optionaler Bereich**: `/sideprompt` kann auch ohne `X-Y` laufen; dann verwendet STMB die Nachrichten seit dem letzten Checkpoint dieses Side Prompts

Dies macht das Auslöseverhalten ohne Fachbegriffe verständlich.

### 🛠️ **Side Prompts verwalten**

* **Side Prompts Manager**: Erstelle, bearbeite, dupliziere und organisiere Tracker
* **Aktivieren / Deaktivieren**: Schalte Tracker jederzeit ein oder aus
* **Import / Export**: Teile Vorlagen oder erstelle Backups
* **Statusansicht**: Sieh, welche Tracker im aktuellen Chat aktiv sind

### 💡 **Beispiele für Vorlagen**

* Side Prompt Vorlagenbibliothek (importiere dieses JSON):
[SidePromptTemplateLibrary.json](../resources/SidePromptTemplateLibrary.json)

Beispielhafte Prompt-Ideen:

* „Verfolge wichtige Dialoge und Charakterinteraktionen“
* „Halte den aktuellen Quest-Status auf dem neuesten Stand“
* „Notiere neue World-Building-Details, wenn sie erscheinen“
* „Verfolge die Beziehung zwischen Charakter A und Charakter B“

### 🔧 **Erstellen eigener Side Prompts**

1. Öffne den Side Prompts Manager
2. Klicke auf **Create New** (Neu erstellen)
3. Schreibe eine kurze, klare Anweisung
   *(Beispiel: „Notiere immer, wie das Wetter in jeder Szene ist“)*
4. Füge bei Bedarf Standard-ST-Makros oder Laufzeitmakros im Format `{{macro}}="value"` hinzu
5. Speichere und aktiviere sie
6. Der Tracker wird diese Informationen nun im Laufe der Zeit aktualisieren, wenn automatische Trigger aktiv bleiben

### 💬 **Pro-Tipp**

Side Prompts funktionieren am besten, wenn sie **klein und fokussiert** sind.
Statt „verfolge alles“, versuche „verfolge die romantische Spannung zwischen den Hauptcharakteren“.

---

### 🧠 Erweiterte Textkontrolle mit der Regex-Erweiterung

ST Memory Books kann ausgewählte Regex-Skripte vor der Generierung und vor dem Speichern ausführen.

* Aktiviere in STMB **Regex verwenden (fortgeschritten)**
* Klicke auf **📐 Regex konfigurieren…**
* Wähle getrennt, welche Skripte vor dem Senden an die KI und vor dem Speichern laufen sollen
* Die Auswahl in STMB zählt auch dann, wenn ein Skript in der Regex-Erweiterung selbst deaktiviert ist

---

## ⚙️ Einstellungen, die wirklich wichtig sind

Für die vollständige Referenz siehe [readme.md](readme.md).

Wichtige Basiskontrollen:

* **Aktuelle SillyTavern Einstellungen** verwendet deine aktuelle ST-Verbindung direkt
* **Automatische Erinnerungs-Zusammenfassungen erstellen** schaltet automatische Erinnerungen ein
* **Intervall für automatische Zusammenfassung** und **Puffer für automatische Zusammenfassung** steuern den Zeitpunkt
* **Auto-hide/unhide memories** hilft beim Tokensparen
* **Manuellen Lorebook-Modus aktivieren** und **Lorebook automatisch erstellen, falls keines existiert** bestimmen, wohin Erinnerungen geschrieben werden
* **Bei erreichter Ebene zur Konsolidierung auffordern** zeigt Konsolidierung nur als Bestätigung

---

## 🔧 Fehlerbehebung (Wenn Dinge nicht funktionieren)

Für die vollständige Liste siehe [readme.md](readme.md).

Schnelle Checks:

* STMB muss aktiviert sein und der Eintrag **Memory Books** muss im Erweiterungsmenü erscheinen
* Wenn Auto-Summary nicht läuft, brauchst du zuerst eine manuelle Erinnerung als Startpunkt
* Wenn keine Erinnerungen gespeichert werden, muss ein Lorebook gebunden sein oder Auto-create aktiviert sein
* Wenn Regex seltsam wirkt, prüfe die Auswahl in **📐 Regex konfigurieren…**
* Wenn Konsolidierung nicht erscheint, prüfe die Zielstufe und die Option für die Konsolidierungs-Bestätigung

---

## 🚫 Was ST Memory Books nicht tut

* **Kein allgemeiner Lorebook-Editor:** Dieser Leitfaden konzentriert sich auf Einträge, die von STMB erstellt wurden. Für allgemeines Lorebook-Bearbeiten verwende den eingebauten Lorebook-Editor von SillyTavern.

---

## 💡 Hilfe & Weitere Infos

* **Detailliertere Infos:** [readme.md](readme.md)
* **Neueste Updates:** [changelog.md](changelog.md)
* **Alte Lorebooks konvertieren:** [lorebookconverter.html](../resources/lorebookconverter.html)
* **Community-Support:** Tritt der SillyTavern-Community auf Discord bei! (Suche nach dem 📕ST Memory Books Thread oder schreibe @tokyoapple eine DM für direkte Hilfe.)
* **Bugs/Features:** Einen Fehler gefunden oder eine tolle Idee? Eröffne ein GitHub-Issue in diesem Repository.

---

### 📚 Power-Up mit Lorebook Ordering (STLO)

Für eine fortschrittliche Gedächtnisorganisation und tiefere Story-Integration empfehlen wir dringend, STMB zusammen mit [SillyTavern-LorebookOrdering (STLO)](https://github.com/aikohanasaki/SillyTavern-LorebookOrdering/blob/main/guides/STMB%20and%20STLO%20-%20English.md) zu verwenden. Sieh dir den Leitfaden für Best Practices, Einrichtungsanweisungen und Tipps an!
