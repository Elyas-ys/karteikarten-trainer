# Ausbauplan und Fortschritt

Diese Datei dokumentiert den Weg von der aktuellen kleinen Karteikarten-App zu
einem erweiterbaren Lernsystem fuer mehrere Semester, Module und Themen.

## Aktueller Stand

- Statische Browser-App mit `index.html`, `styles.css` und `app.js`
- Alle sechs Semester sind im Datenmodell angelegt
- 109 feste Karteikarten aus `data.js` und `project-data.js`
- Ein Modul aus dem 1. Semester: KI Basics
- Ein Modul aus dem 2. Semester: Datensicherheit & Data Observability
- Kategorien innerhalb dieses Moduls, z. B. Grundlagen, Datenqualitaet,
  Cloud & Governance und Antwortschema
- Lernmodi: Heute faellig, Unsichere Karten, Alle Karten
- Lokaler Lernstand ueber `localStorage`
- Einfache Leitner-Logik fuer Wiederholungen
- Moduluebersicht mit Kartenanzahl, faelligen Karten, sicheren Karten,
  Trefferquote und Fortschrittsbalken
- Aktuelle Lernsession als eigener Startbereich mit Auswahl, Modus,
  Themenanzahl und Session-Umfang
- Themenstatus mit faelligen, unsicheren und sicheren Karten pro Thema
- Semesteruebersicht mit faelligen, sicheren und kritischen Karten sowie
  Trefferquote
- Importbereich fuer JSON-Dateien
- Projektinhalte koennen aus JSON-Dateien in `Karteikarten JSON/` generiert
  werden und sind dadurch nicht mehr browserabhaengig
- Lokale Importe bleiben als Testweg erhalten und werden mit den Projektkarten
  zusammengefuehrt

## Zielbild

Die App soll nach und nach zu einem persoenlichen Studien-Lernsystem wachsen:

- klare Trennung nach Semestern
- mehrere Module pro Semester
- Themen/Kapitel innerhalb jedes Moduls
- Karteikarten mit stabilen IDs und Metadaten
- Fortschritt pro Karte, Thema, Modul und Semester
- wiederholbare Lern-Sessions ueber einzelne Module oder ganze Semester
- spaeter optional: Pruefungsmodus, Lernkalender, Import/Export und Suche

## Geplantes Datenmodell

Die Inhalte sollen langfristig nicht mehr als flache Kartenliste gepflegt
werden, sondern in einer Struktur wie dieser:

```txt
Semester
  Modul
    Thema / Kapitel
      Karteikarten
```

Eine einzelne Karte koennte spaeter so aussehen:

```js
{
  id: "sem2-datensicherheit-001",
  semesterId: "sem2",
  moduleId: "datensicherheit-data-observability",
  topic: "Grundlagen",
  type: "definition",
  front: "Was ist Datensicherheit?",
  back: "...",
  examRelevance: "high"
}
```

## Ausbauphasen

### Phase 1: Grundlage fuer Wachstum

Status: abgeschlossen

- [x] Datenmodell auf Semester, Module und Themen vorbereiten
- [x] vorhandene 28 Karten in das neue Modell ueberfuehren
- [x] aktuelle Lernlogik beibehalten
- [x] UI so erweitern, dass Semester und Module sichtbar werden
- [x] lokale Fortschrittsdaten kompatibel oder migrierbar halten
- [x] Modul- und Semester-Auswahl als echte Filter einfuehren

### Phase 2: Navigation und Uebersicht

Status: abgeschlossen

- [x] Semester-Auswahl einfuehren
- [x] Modul-Auswahl mit Kartenanzahl einfuehren
- [x] bestehende Kategorien als Themenfilter innerhalb eines Moduls verwenden
- [x] Modul-Uebersicht um Lernfortschritt pro Modul erweitern
- [x] Startpunkt fuer eine Lern-Session klarer machen

### Phase 3: Studienlogik

Status: abgeschlossen

- [x] Lernfortschritt pro Modul und Semester anzeigen
- [x] schwache Themen hervorheben
- [x] Themen direkt aus der Statusuebersicht fokussierbar machen
- [x] faellige Karten ueber mehrere Module hinweg sammeln
- [x] gemischte Wiederholung fuer alte Semester ermoeglichen

### Phase 4: Pruefungsvorbereitung

Status: offen

- Pruefungstermine pro Modul speichern
- Pruefungsmodus mit gemischten Fragen bauen
- relevante Karten markieren
- offene Luecken und sichere Bereiche sichtbar machen

### Phase 5: Pflege und Erweiterung

Status: in Arbeit

- [x] JSON-Import fuer neue Inhalte einbauen
- [x] Importformat dokumentieren und Vorlage anlegen
- [x] Karten aus separaten Daten-Dateien laden
- [x] Export fuer Inhalte und Lernstand pruefen
- [ ] Suche ueber alle Karten ergaenzen
- [ ] optionale Notizen pro Karte ermoeglichen

## Entscheidungen

### 2026-04-25

- Die App soll inkrementell wachsen, nicht komplett neu gebaut werden.
- Der aktuelle Prototyp bleibt die Basis.
- Der naechste technische Schwerpunkt ist die Trennung von Lernlogik und
  Lerninhalten.
- Diese Datei dient ab jetzt als laufendes Protokoll fuer Weg, Entscheidungen
  und Fortschritt.

## Fortschritt

### 2026-04-25

- Ausbauplan-Datei angelegt.
- Aktuellen Stand, Zielbild und sinnvolle Ausbauphasen dokumentiert.
- Phase 1 gestartet.
- Neue Datei `data.js` angelegt.
- Bestehende Karten in die Struktur `Semester -> Modul -> Thema -> Karte`
  ueberfuehrt.
- Stabile Karten-IDs nach dem Muster `sem2-ddo-001` eingefuehrt.
- Alte numerische IDs als `legacyId` erhalten, damit vorhandener Lernstand aus
  `localStorage` migriert werden kann.
- App-Logik liest Karten jetzt aus dem Studienmodell und leitet daraus die
  bisherige Lernwarteschlange ab.
- Oberflaeche zeigt nun einen Studienbereich mit allen sechs Semestern sowie
  Modul-/Semester-Kontext auf jeder Karte.
- Alle sechs Semester wurden in `data.js` festgehalten.
- Semester ohne Karten bleiben als geplante Bereiche sichtbar.
- Die Studienuebersicht ist jetzt interaktiv: Semester und Module filtern die
  Lernsession wirklich.
- Session-Statistiken, Kategorien und Kartenwarteschlange beziehen sich auf die
  aktuelle Semester-/Modulauswahl.
- Die Moduluebersicht zeigt jetzt Lernfortschritt pro Modul und fuer "Alle
  Module": faellige Karten, sichere Karten, Trefferquote und Fortschrittsbalken.
- Im Arbeitsbereich gibt es jetzt eine "Aktuelle Lernsession"-Box mit
  Semester-/Modulauswahl, Lernmodus, aktiven Themen, Session-Umfang und
  Weiterlernen-Aktion.
- Phase 2 wurde abgeschlossen.
- Phase 3 wurde gestartet.
- Neue Themenstatus-Uebersicht ergaenzt.
- Jedes Thema zeigt Kartenanzahl, faellige Karten, unsichere Karten und
  Sicherheitsquote.
- Schwache Themen werden hervorgehoben.
- Themen koennen direkt aus der Statusuebersicht als Fokus fuer die Session
  ausgewaehlt werden.
- Die Semesterkarten zeigen jetzt Lernfortschritt: faellige Karten, sichere
  Karten, kritische Karten, Trefferquote und Fortschrittsbalken.
- Die Session hat jetzt einen Lernumfang-Schalter: "Auswahl" bleibt beim
  aktuellen Semester/Modul, "Alle faelligen" sammelt faellige Karten aus dem
  gesamten Studienmodell.
- Die globale Wiederholung zeigt eigenen Hero-Text, Session-Kontext,
  Kategorien und Themenstatus nur fuer die aktuell faelligen Karten.
- Das 3. Semester ist im Datenmodell als aktuelles Semester markiert; Karten
  aus Semestern davor bilden die Basis fuer alte Wiederholungen.
- Der neue Lernumfang "Alte Semester" sammelt fruehere Inhalte und mischt sie
  thematisch im Rundlauf, statt sie als starre Modulbloecke abzuspielen.
- Phase 3 ist damit funktional abgeschlossen.
- Phase 5 wurde vorgezogen, weil neue Inhalte per Import schneller in die App
  kommen sollen.
- Ein JSON-Importbereich wurde ergaenzt.
- Importierte Inhalte werden unter eigenem `localStorage`-Key gespeichert und
  beim Start mit den Basisdaten aus `data.js` zusammengefuehrt.
- Das Importformat ist in `IMPORT_FORMAT.md` dokumentiert; `import-vorlage.json`
  dient als Startpunkt fuer neue Module.
- Lokale Importe koennen als JSON exportiert werden.
- Der aktuelle Lernstand kann als eigene JSON-Sicherung exportiert werden.
- Feste Projektkarten werden jetzt aus JSON-Dateien im Ordner
  `Karteikarten JSON/` in `project-data.js` gebuendelt.
- `KI-Basics.json` wurde als dauerhaftes Projektmodul fuer das 1. Semester
  eingebunden.
- Die App zeigt dadurch auch in einem frischen Browserprofil 81 Karten im
  1. Semester und insgesamt 109 Karten.
- Lokale Browser-Importe sind nur noch der schnelle Testweg; stabile Inhalte
  sollen als Projekt-JSON abgelegt und mit `node scripts/build-project-data.mjs`
  gebuendelt werden.

## Naechste konkrete Schritte

1. Naechste echte Module als JSON in `Karteikarten JSON/` ablegen und
   `project-data.js` neu generieren.
2. Danach Suche ueber alle Karten ergaenzen, damit neue Inhalte schnell
   auffindbar werden.
3. Danach Phase 4 starten: Pruefungstermine und Pruefungsmodus planen.
