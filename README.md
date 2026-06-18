# Karteikarten Trainer

Eine kleine, statische Lern-App fuer Browser und GitHub Pages.

## Funktionen

- 603 Karteikarten aus festen Projektdateien und Basisdaten
- KI Basics als Modul aus dem 1. Semester
- Datensicherheit & Data Observability als Modul aus dem 2. Semester
- Quantitative Methoden der Informatik / Quantitative Datenanalyse als Modul aus dem 2. Semester
- Fortgeschrittenes Maschinelles Lernen (FML) als Modul aus dem 3. Semester
- FML-Karten nach Vorlesung 4 und Vorlesung 5 strukturiert
- Karten aufdecken und selbst bewerten
- Einfache Leitner-Logik fuer Wiederholungen
- Kategorienfilter und Lernmodi
- Lokaler Lernstand im Browser
- Inhalte strukturiert nach Semester, Modul und Thema
- sechs Semester als Grundstruktur mit Semester- und Modulfiltern
- Moduluebersicht mit faelligen Karten, sicheren Karten und Trefferquote
- klarer Startbereich fuer die aktuelle Lernsession
- Themenstatus mit Schwachstellen und direktem Themenfokus
- Semesteruebersicht mit Lernfortschritt
- globale Wiederholung fuer alle faelligen Karten im Studium
- gemischte Wiederholung fuer Inhalte aus alten Semestern
- JSON-Projektdateien fuer dauerhafte Inhalte
- JSON-Import fuer schnelle lokale Tests neuer Semester, Module, Themen und Karten
- JSON-Export fuer lokale Importe und Lernstand

## Import

Neue Inhalte koennen als JSON importiert oder als Projektinhalt eingebunden
werden. Das Format ist in
[`IMPORT_FORMAT.md`](./IMPORT_FORMAT.md) beschrieben; eine Vorlage liegt in
[`import-vorlage.json`](./import-vorlage.json).

Feste Projektinhalte liegen als JSON im Ordner `Karteikarten JSON/`. Nach neuen
oder geaenderten JSON-Dateien wird die Browser-unabhaengige Datenquelle mit
diesem Befehl neu gebaut:

```sh
node scripts/build-project-data.mjs
```

Importierte Inhalte und der aktuelle Lernstand koennen in der App als JSON
exportiert werden.

## Ausbau

Der weitere Weg, Entscheidungen und Fortschritt werden in
[`AUSBAU_PLAN.md`](./AUSBAU_PLAN.md) dokumentiert.

## Lokal oeffnen

`index.html` im Browser oeffnen.

## GitHub Pages

Das Projekt ist als statische Website aufgebaut und kann direkt ueber GitHub Pages veroeffentlicht werden.
