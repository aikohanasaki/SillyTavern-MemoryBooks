# 📕 ST Memory Books - Dein KI-Chat-Gedächtnis-Assistent

**Verwandle deine endlosen Chat-Gespräche in organisierte, durchsuchbare Erinnerungen!**

Brauchst du einen Bot, der sich an Dinge erinnert, aber der Chat ist zu lang für den Kontext? Möchtest du wichtige Handlungspunkte automatisch verfolgen, ohne manuell Notizen zu machen? ST Memory Books macht genau das – es beobachtet deine Chats und erstellt intelligente Zusammenfassungen, damit du nie wieder den Faden deiner Geschichte verlierst.

(Suchst du nach technischen Details hinter den Kulissen? Vielleicht möchtest du stattdessen [Wie STMB funktioniert](howSTMBworks-de.md) lesen.)

---

## 📑 Inhaltsverzeichnis

- [Schnellstart](#-schnellstart-5-minuten-bis-zu-deiner-ersten-erinnerung)
- [Was ST Memory Books eigentlich tut](#-was-st-memory-books-eigentlich-tut)
- [Wähle deinen Stil](#-wähle-deinen-stil)
- [In Memory Book clippen](#️-in-memory-book-clippen)
- [Clips vs. Side-Prompts](#️-clips-vs-side-prompts)
- [Token sparen: Nachrichten ausblenden/einblenden](#-token-sparen-ausblenden--einblenden)
- [Kompaktierung vs. Konsolidierung](#-kompaktierung-vs-konsolidierung)
- [Zusammenfassungs-Konsolidierung](#-zusammenfassungs-konsolidierung)
- [Tracker, Side-Prompts & Vorlagen](#-tracker-side-prompts--vorlagen-fortgeschrittene-funktion)
- [Kompaktierung](#-kompaktierung)
- [Einstellungen, die wirklich wichtig sind](#️-einstellungen-die-wirklich-wichtig-sind)
- [Fehlerbehebung](#-fehlerbehebung-wenn-dinge-nicht-funktionieren)
- [Was ST Memory Books nicht tut](#-was-st-memory-books-nicht-tut)
- [Hilfe & Weitere Infos](#-hilfe--weitere-infos)
- [Power-Up mit Lorebook Ordering (STLO)](#-power-up-mit-lorebook-ordering-stlo)

---

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

### 📊 **Side-Prompts & Intelligente Tracker**

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
4. Öffne Memory Books (🪄) und klicke auf "Erinnerung erstellen"

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
* `/sideprompt-on "Name"` oder `/sideprompt-off "Name"` - Schalte einen Side-Prompt manuell ein oder aus
* `/stmb-set-highest <N|none>` - Setze die Auto-Summary-Basis für den aktuellen Chat

**Was du bekommst:**

* Blitzschnelle Erstellung von Erinnerungen
* Batch-Operationen
* Integration in benutzerdefinierte Arbeitsabläufe

</details>

---

## ✂️ In Memory Book clippen

Verwende **In Memory Book clippen**, wenn du eine wichtige Zeile oder einen wichtigen Fakt speichern willst, ohne eine vollständige Szenen-Erinnerung zu erstellen. Markiere Text im Chat, klicke auf den schwebenden Scheren-Button und wähle dann einen bestehenden Clip-Eintrag aus oder erstelle einen neuen.

Nicht sicher, ob es ein Clip oder ein Side-Prompt sein sollte? Siehe [Clips vs. Side-Prompts](#-clips-vs-side-prompts).

### Wann sollte ich Clips verwenden?

Clips sind am besten für kleine Fakten, an die sich die KI erinnern soll, zum Beispiel:

- eine Vorliebe eines Charakters
- ein Versprechen oder Geheimnis
- ein Beziehungsdetail
- ein Haustier, Ort, Gegenstand oder wiederkehrendes Detail
- eine schnelle „Notiz an mich“, die keine vollständige Erinnerung braucht

Für größere Szenen verwende stattdessen die normale Erinnerungserstellung.

### Wie Clippen funktioniert

1. Markiere den Satz oder Ausdruck, den du speichern willst.
2. Klicke auf den schwebenden Scheren-Button.
3. Wähle einen bestehenden Clip-Eintrag oder erstelle einen neuen.
4. Prüfe die Eintragsvorschau.
5. Speichere den Clip.

Clip-Einträge sind normale Lorebook-Einträge, die mit `[STMB Clip]` markiert sind. Beispiel:

```txt
Seraphina Healed Me [STMB Clip]
```

Innerhalb des Eintrags hält STMB den Inhalt in einem sauberen Abschnittsformat:

```md
=== Seraphina Healed Me ===

- Seraphina healed my wounds with magic.

=== END Seraphina Healed Me ===
```

### Clip-Einträge erstellen oder umbenennen

Wenn du einen neuen Clip-Eintrag erstellst, wird der Eintragstitel auch zur Abschnittsüberschrift. Du kannst den Eintrag während des Clippens umbenennen; STMB aktualisiert dann die Abschnittsüberschrift entsprechend.

Neue Clip-Einträge können sein:

- **immer aktiv**, wenn Fakten immer verfügbar sein sollen
- **durch Schlüsselwörter aktiviert**, wenn Fakten nur bei passenden Wörtern erscheinen sollen

Verwende Schlüsselwörter, wenn der Clip nur für ein bestimmtes Thema, einen Charakter, Ort, ein Haustier, einen Gegenstand oder eine Beziehung relevant ist.

### Schwebender Scheren-Button

Der schwebende Scheren-Button erscheint nur, nachdem du Text im Chat markiert hast. Du kannst diesen Button im Haupt-Popup von Memory Books ein- oder ausschalten.

### Lange Clip-Einträge überprüfen

Wenn ein Clip-Eintrag lang wird, kann STMB dich daran erinnern, ihn zu überprüfen. Du kannst ihn selbst bearbeiten oder **Kompaktierung** verwenden, um die KI zu bitten, einen Clip-, Side-Prompt- oder STMB-Erinnerungseintrag token-effizienter zu machen, bevor du entscheidest, ob das Original ersetzt wird.

---

## ✂️ Clips vs. Side-Prompts

Clips und Side-Prompts speichern beide Informationen in deinem Memory Book, aber sie haben nicht dieselbe Aufgabe.

Einfache Regel: **Clips speichern einen bestimmten Fakt. Side-Prompts pflegen einen lebenden Tracker.**

| **Clips** | **Side-Prompts** |
|---|---|
| Speichern ausgewählten Chat-Text in einem Memory-Book-Eintrag. | Bitten die KI, den Chat zu prüfen und einen Tracker-Eintrag zu aktualisieren. |
| Am besten für einen klaren Fakt, eine Zeile, ein Versprechen, eine Vorliebe, einen Gegenstand oder eine Notiz. | Am besten für Informationen, die sich im Lauf der Zeit ändern, etwa Beziehungsstatus, Quest-Fortschritt, Inventar oder ungelöste Handlungsstränge. |
| Du wählst den exakten Text. STMB speichert, was du markiert hast. | Die KI interpretiert den Chat und schreibt oder aktualisiert den Tracker. |
| Verwende Clips, wenn der Fakt bereits offensichtlich ist und keine Analyse braucht. | Verwende Side-Prompts, wenn die KI mehrere Nachrichten vergleichen, zusammenfassen oder den Zustand aktualisieren muss. |
| Wächst normalerweise nur, wenn du manuell einen weiteren Clip hinzufügst. | Kann wiederholt aktualisiert werden, während sich die Geschichte ändert. |
| Denk: „diese Notiz anheften.“ | Denk: „diesen Abschnitt aktuell halten.“ |

Gute Clips:

- `Aiko mag Honigtee.`
- `Andalino versprach, sie nicht wieder anzulügen.`
- `Colt nennt sie Boss.`

Gute Side-Prompts:

- Beziehungsstatus
- aktueller Quest-Fortschritt
- Inventar und Ressourcen
- NPC-Verzeichnis
- ungelöste Handlungsstränge

Wenn du nur ein einzelnes Detail merken willst, verwende einen Clip. Wenn du einen laufenden Tracker brauchst, verwende einen Side-Prompt.

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

## 🧭 Kompaktierung vs. Konsolidierung

Die Namen klingen ähnlich, aber die Funktionen haben verschiedene Aufgaben.

Einfache Regel: **Kompaktierung räumt einen Eintrag auf. Konsolidierung kombiniert mehrere Erinnerungen zu einer höherstufigen Zusammenfassung.**

| **Kompaktierung** | **Konsolidierung** |
|---|---|
| Macht einen bestehenden STMB-verwalteten Eintrag kleiner. | Kombiniert mehrere Erinnerungen oder Zusammenfassungen zu einer höherstufigen Zusammenfassung. |
| Arbeitet jeweils mit einem Clip-, Side-Prompt- oder STMB-Erinnerungseintrag. | Arbeitet mit mehreren ausgewählten Erinnerungs-/Zusammenfassungseinträgen. |
| Am besten, wenn ein Eintrag nützlich ist, aber zu lang, wiederholend oder zu teuer für den Kontext wird. | Am besten, wenn ältere Szenen-Erinnerungen sich stapeln und zu einem Arc, Chapter, Book, Legend, Series oder Epic zusammengefasst werden sollen. |
| Schreibt den ausgewählten Eintrag in einer token-effizienteren Form neu. | Erstellt aus den ausgewählten Quellen einen neuen Zusammenfassungseintrag. |
| Soll vorhandene Fakten bewahren und Ballast entfernen. | Soll den größeren Kontinuitätsbogen bewahren und Szenen-Detail reduzieren. |
| Erstellt keine neue Erinnerung aus rohem Chat. | Kompaktiert nicht von selbst einen einzelnen aufgeblähten Eintrag. |
| Denk: „diesen einen Eintrag kürzen.“ | Denk: „diese Erinnerungen zu einer Zusammenfassung bündeln.“ |

Beide Werkzeuge sind review-first: STMB zeigt dir, was die KI geschrieben hat, bevor etwas gespeichert oder ersetzt wird.

---

## 🌈 Zusammenfassungs-Konsolidierung

Zusammenfassungs-Konsolidierung hilft, lange Geschichten übersichtlich zu halten, indem ältere STMB-Erinnerungen zu höherstufigen Zusammenfassungen verdichtet werden.

### Q: Was ist Zusammenfassungs-Konsolidierung?

**A:** Statt für immer nur Szenen-Erinnerungen zu erstellen, kann STMB bestehende Erinnerungen oder Zusammenfassungen zu einer kompakteren Zusammenfassung verbinden. Die erste Stufe ist **Arc**; für längere Geschichten sind auch höhere Zusammenfassungsstufen verfügbar:

- Arc
- Chapter
- Book
- Legend
- Series
- Epic

### Q: Warum sollte ich sie verwenden?

**A:** Konsolidierung ist nützlich, wenn:

- deine Erinnerungsliste sehr lang wird
- ältere Einträge kein vollständiges Szenen-Detail mehr brauchen
- du Token sparen willst, ohne Kontinuität zu verlieren
- du sauberere, höherstufige narrative Zusammenfassungen möchtest

### Q: Läuft sie automatisch?

**A:** Nein. Konsolidierung braucht weiterhin eine Bestätigung.

- Du kannst **Erinnerungen konsolidieren** jederzeit manuell im Haupt-Popup öffnen
- Du kannst auch **Bei erreichter Ebene zur Konsolidierung auffordern** aktivieren
- Wenn eine ausgewählte Zielstufe ihr gespeichertes Minimum an geeigneten Einträgen erreicht, zeigt STMB eine **Ja/Später**-Bestätigung
- Wenn du **Ja** wählst, öffnet STMB das Konsolidierungs-Popup mit dieser Stufe bereits ausgewählt; es läuft nicht still im Hintergrund

### Q: Wie benutze ich sie?

**A:** Um eine konsolidierte Zusammenfassung zu erstellen:

1. Klicke im Haupt-Popup von STMB auf **Erinnerungen konsolidieren**
2. Wähle die Ziel-Zusammenfassungsstufe
3. Wähle die Quell-Einträge aus, die enthalten sein sollen
4. Deaktiviere optional die Quell-Einträge, nachdem die neue Zusammenfassung erstellt wurde
5. Klicke auf **Run**

Für Vorschauen dieser Einträge aktiviere „Vorschauen anzeigen“ in deinen Präferenzen.

---

## 🎨 Tracker, Side-Prompts & Vorlagen (Fortgeschrittene Funktion)

**Side-Prompts** sind Hintergrund-Tracker, die helfen, laufende Story-Informationen aufrechtzuerhalten. Sie laufen parallel zur Speichererstellung und aktualisieren eigene Side-Prompt-Lorebook-Einträge über die Zeit. Betrachte sie als **Helfer, die deine Geschichte beobachten und bestimmte Details aktuell halten**.

### 🚀 **Schnellstart mit Vorlagen**

1. Öffne die Einstellungen von Memory Books
2. Klicke auf **Side-Prompts**
3. Durchsuche die **Vorlagenbibliothek** und wähle aus, was zu deiner Geschichte passt:
   * **Character Development Tracker** – Verfolgt Persönlichkeitsveränderungen und Wachstum
   * **Relationship Dynamics** – Verfolgt Beziehungen zwischen Charakteren
   * **Plot Thread Tracker** – Verfolgt laufende Handlungsstränge
   * **Mood & Atmosphere** – Verfolgt den emotionalen Ton
   * **World Building Notes** – Verfolgt Details zum Schauplatz und zur Lore
4. Aktiviere die gewünschten Vorlagen (du kannst sie später anpassen)
5. Wenn die Vorlage benutzerdefinierte Laufzeitmakros enthält, wird sie nicht automatisch ausgeführt und muss manuell mit `/sideprompt` gestartet werden

### ⚙️ **Wie Side-Prompts funktionieren**

* **Hintergrund-Tracker**: Sie laufen leise und aktualisieren Informationen im Laufe der Zeit
* **Nicht störend**: Sie ändern nicht deine Haupt-KI-Einstellungen oder Charakter-Prompts
* **Pro-Chat-Kontrolle**: Verschiedene Chats können unterschiedliche Tracker verwenden
* **Vorlagenbasiert**: Verwende eingebaute Vorlagen oder erstelle deine eigenen
* **Automatisch oder Manuell**: Standardvorlagen können automatisch laufen; Vorlagen mit benutzerdefinierten Laufzeitmakros sind nur manuell nutzbar
* **Makro-Unterstützung**: `Prompt`, `Response Format`, `Title` und Keyword-Felder erweitern standardmäßige ST-Makros wie `{{user}}` und `{{char}}`
* **Laufzeitmakros**: Nicht standardmäßige `{{...}}`-Platzhalter werden zu Pflichtangaben wie `{{npc name}}="Jane Doe"`
* **Klartext erlaubt**: Side-Prompts müssen kein JSON zurückgeben
* **Überschreiben statt Anhängen**: Side-Prompts aktualisieren ihren eigenen verfolgten Eintrag, statt bei jedem Lauf eine neue Erinnerung anzulegen
* **Sicherheitsprüfung**: Wenn eine Vorlage benutzerdefinierte Laufzeitmakros enthält, entfernt STMB beim Speichern/Importieren automatische Trigger und zeigt eine Warnung an
* **Optionaler Bereich**: `/sideprompt` kann auch ohne `X-Y` laufen; dann verwendet STMB die Nachrichten seit dem letzten Checkpoint dieses Side-Prompts

### 🛠️ **Side-Prompts verwalten**

* **Side-Prompts-Manager**: Erstelle, bearbeite, dupliziere und organisiere Tracker
* **Aktivieren / Deaktivieren**: Schalte Tracker jederzeit ein oder aus
* **Import / Export**: Teile Vorlagen oder erstelle Backups
* **Statusansicht**: Sieh, welche Tracker im aktuellen Chat aktiv sind und wann sie laufen

### 💡 **Beispiele für Vorlagen**

* Side-Prompt-Vorlagenbibliothek (importiere dieses JSON):
[SidePromptTemplateLibrary.json](../resources/SidePromptTemplateLibrary.json)

Beispielhafte Prompt-Ideen:

* „Verfolge wichtige Dialoge und Charakterinteraktionen“
* „Halte den aktuellen Quest-Status auf dem neuesten Stand“
* „Notiere neue World-Building-Details, wenn sie erscheinen“
* „Verfolge die Beziehung zwischen Charakter A und Charakter B“

### 🔧 **Erstellen eigener Side-Prompts**

1. Öffne den Side-Prompts-Manager
2. Klicke auf **Neu erstellen**
3. Schreibe eine kurze, klare Anweisung
   *(Beispiel: „Notiere immer, wie das Wetter in jeder Szene ist“)*
4. Füge bei Bedarf Standard-ST-Makros wie `{{user}}` oder `{{char}}` hinzu
5. Wenn du benutzerdefinierte Laufzeitmakros wie `{{location name}}` hinzufügst, starte sie manuell mit `/sideprompt "Name" {{location name}}="value"`
6. Speichere und aktiviere sie
7. Der Tracker aktualisiert diese Informationen dann im Laufe der Zeit, wenn automatische Trigger aktiv bleiben; andernfalls starte ihn bei Bedarf manuell

### 💬 **Pro-Tipp**

Side-Prompts funktionieren am besten, wenn sie **klein und fokussiert** sind. Statt „verfolge alles“ versuche „verfolge die romantische Spannung zwischen den Hauptcharakteren“.

### ⌨️ **Manuelle /sideprompt-Syntax**

Verwende:
`/sideprompt "Name" {{macro}}="value" [X-Y]`

Beispiele:
- `/sideprompt "Status" 10-20`
- `/sideprompt "NPC-Verzeichnis" {{npc name}}="Jane Doe" 40-50`
- `/sideprompt "Ortsnotizen" {{place name}}="Black Harbor" 100-120`

Hinweise:

- Der Name des Side-Prompts muss in Anführungszeichen stehen.
- Laufzeitmakro-Werte müssen ebenfalls in Anführungszeichen stehen.
- Die Slash-Befehl-Autovervollständigung schlägt erforderliche Laufzeitmakros vor, nachdem du den Side-Prompt ausgewählt hast.
- Wenn eine Vorlage benutzerdefinierte Laufzeitmakros enthält, bleibt STMB dabei im manuellen Modus und entfernt automatische Trigger.
- `X-Y` ist optional. Wenn du es weglässt, verwendet STMB die Nachrichten seit dem letzten Zeitpunkt, an dem dieser Side-Prompt aktualisiert wurde.
- Wenn du Side-Prompts manuell und getrennt ausführst, denke daran, **Versteckte Nachrichten für die Erstellung von Erinnerungen einblenden (führt /unhide X-Y aus)** zu aktivieren.

---

### 🧠 Erweiterte Textkontrolle mit der Regex-Erweiterung

ST Memory Books kann ausgewählte Regex-Skripte vor der Generierung und vor dem Speichern ausführen.

* Aktiviere in STMB **Regex verwenden (fortgeschritten)**
* Klicke auf **📐 Regex konfigurieren…**
* Wähle getrennt, welche Skripte vor dem Senden an die KI und vor dem Speichern laufen sollen
* Die Auswahl in STMB zählt auch dann, wenn ein Skript in der Regex-Erweiterung selbst deaktiviert ist

---

## 🧹 Kompaktierung

Die **Kompaktierung** hilft, wenn ein von STMB verwalteter Lorebook-Eintrag noch nützlich ist, aber zu lang oder zu wiederholend geworden ist. Statt ihn manuell zu kürzen, kannst du die KI bitten, den Eintrag token-effizienter umzuschreiben.

Dies ist ein Werkzeug mit **Prüfung zuerst**. STMB zeigt **Originalinhalt** und **Kompaktierter Entwurf** an, bevor irgendetwas ersetzt wird.

### Was kann kompaktiert werden?

Die Kompaktierung kann diese Einträge aus einem ausgewählten **Memory Book** anzeigen:

- Clip-Einträge
- Side-Prompt-Tracker-Einträge
- STMB-Erinnerungseinträge

Normale Lorebook-Einträge, die nicht von STMB verwaltet werden, werden nicht angezeigt.

### So verwendest du die Kompaktierung

1. Öffne das Memory-Books-Popup.
2. Klicke auf **📝 Kompaktierung**.
3. Wähle das **Memory Book**, das du prüfen möchtest. Wenn der aktuelle Chat bereits ein Memory Book hat, kann es automatisch ausgewählt sein.
4. Wähle ein **Kompaktierungsprofil**. Damit wählst du, welche KI-Verbindung bzw. welches Modell den Eintrag umschreibt.
5. Optional: Klicke auf **Kompaktierungs-Prompt bearbeiten**, wenn du die Umschreib-Anweisungen ändern möchtest.
6. Suche den Eintrag in der Tabelle und klicke auf **Eintrag kompaktieren**.
7. Prüfe das Ergebnis:
   - **Originalinhalt** zeigt, was aktuell gespeichert ist.
   - **Kompaktierter Entwurf** zeigt die KI-Umschreibung.
   - Beide zeigen **Geschätzte Token**.
8. Bearbeite den kompaktierten Entwurf bei Bedarf.
9. Wähle eine Option:
   - **Durch kompaktierte Version ersetzen**, um den Entwurf über dem ursprünglichen Eintrag zu speichern.
   - **Kompaktierten Entwurf kopieren**, um ihn zu kopieren, ohne zu speichern.
   - **Abbrechen**, um den Eintrag unverändert zu lassen.

STMB sollte den Originaltext nie stillschweigend ersetzen. Wenn du nicht **Durch kompaktierte Version ersetzen** anklickst, bleibt der Lorebook-Eintrag unverändert.

### Den Kompaktierungs-Prompt bearbeiten

Der **Kompaktierungs-Prompt** steuert, wie die KI Einträge umschreibt. Der eingebaute Prompt ist absichtlich konservativ: wichtige Fakten, Namen, Pronomen, Makros, Wrapper-Überschriften und Endmarkierungen erhalten; Wiederholungen und Formulierungen mit geringem Nutzen entfernen; nichts erfinden.

Der Prompt unterstützt diese Platzhalter:

- `{{ENTRY_CONTENT}}` — der aktuelle Inhalt des Eintrags. Dieser Platzhalter ist erforderlich; der Prompt-Editor warnt, wenn er fehlt.
- `{{ENTRY_KIND}}` — die Art des Eintrags, zum Beispiel Clip, Side-Prompt oder Erinnerung.
- `{{ENTRY_TITLE}}` — der Titel des Eintrags.

Verwende **Auf Standard zurücksetzen**, wenn dein eigener Prompt nicht mehr gut funktioniert.

### Gute Einsatzfälle

Verwende die Kompaktierung für:

- lange Clip-Einträge
- Side-Prompt-Tracker, die sich mit der Zeit wiederholen
- Erinnerungseinträge, die korrekt, aber aufgebläht sind
- immer aktive Einträge, die zu viele Token kosten

Verwende die Kompaktierung nicht für:

- eine neue Erinnerung aus dem Chat erstellen
- neue Fakten hinzufügen
- fehlende Kontinuität reparieren, die nie im Eintrag stand
- normale Lorebook-Einträge außerhalb von STMB bearbeiten

Die Kompaktierung ist ein Aufräumwerkzeug, kein Werkzeug zur Erinnerungserstellung.

---

## ⚙️ Einstellungen, die wirklich wichtig sind

Für die vollständige Referenz siehe [readme.md](readme.md).

Wichtige Basiskontrollen:

* **Aktuelle SillyTavern Einstellungen** verwendet deine aktive ST-Verbindung direkt
* **Eigenes STMB-Profil anlegen** ermöglicht dir, STMB anzupassen, zum Beispiel ein anderes/günstigeres Modell für Erinnerungen als für Rollenspiel zu verwenden
* **Automatische Erinnerungs-Zusammenfassungen erstellen** schaltet automatische Erinnerungen ein
* **Intervall für automatische Zusammenfassung** und **Puffer für automatische Zusammenfassung** steuern den Zeitpunkt
* **Ausblenden / Einblenden von Nachrichten** hilft beim Tokensparen
* **Manuellen Lorebook-Modus aktivieren** und **Lorebook automatisch erstellen, falls keines existiert** bestimmen, wohin Erinnerungen geschrieben werden
* **Erinnerungsvorschauen anzeigen** lässt dich KI-Ausgaben vor dem Speichern prüfen oder bearbeiten
* **Side-Prompts** aktiviert Tracker
* **Bei erreichter Ebene zur Konsolidierung auffordern** zeigt Konsolidierung nur als Bestätigung

---

## 🔧 Fehlerbehebung (Wenn Dinge nicht funktionieren)

Für die vollständige Liste siehe [readme.md](readme.md).

Schnelle Checks:

* STMB muss aktiviert sein und der Eintrag **Memory Books** muss im Erweiterungsmenü erscheinen
* Wenn Auto-Summary nicht läuft, brauchst du zuerst eine manuelle Erinnerung als Startpunkt und deine Intervall-/Pufferwerte sollten sinnvoll sein
* Wenn keine Erinnerungen gespeichert werden, muss ein Lorebook gebunden sein oder **Lorebook automatisch erstellen, falls keines existiert** aktiviert sein
* Wenn Erinnerungen nicht ausgelöst werden, muss **Delay until recursion** deaktiviert sein
* Wenn Regex seltsam wirkt, prüfe die Auswahl in **📐 Regex konfigurieren…**
* Wenn Konsolidierung nicht erscheint, prüfe, ob **Bei erreichter Ebene zur Konsolidierung auffordern** aktiviert ist und ob die Zielstufe in **Auto-Konsolidierungsstufen:** enthalten ist

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
