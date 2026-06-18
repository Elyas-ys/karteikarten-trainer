# Importformat

Die App kann JSON-Dateien auf zwei Arten nutzen:

- als feste Projektinhalte aus `Karteikarten JSON/`
- als schnelle lokale Browser-Importe zum Testen

Feste Projektinhalte werden in `project-data.js` gebuendelt und beim Start mit
`data.js` zusammengefuehrt. Dadurch sind diese Karten nicht vom Browserprofil
oder `localStorage` abhaengig. Lokale Importe bleiben bewusst browserlokal und
eignen sich vor allem als Teststufe.

## Kurzformat fuer ein Modul

```json
{
  "semesterId": "sem3",
  "semesterLabel": "3. Semester",
  "semesterTitle": "Drittes Semester",
  "semesterStatus": "current",
  "module": {
    "id": "wirtschaftsinformatik",
    "title": "Wirtschaftsinformatik",
    "shortTitle": "Winfo",
    "status": "imported",
    "topics": [
      {
        "id": "grundlagen",
        "title": "Grundlagen",
        "cards": [
          {
            "id": "sem3-winfo-001",
            "type": "definition",
            "examRelevance": "high",
            "front": "Was ist Wirtschaftsinformatik?",
            "back": "..."
          }
        ]
      }
    ]
  }
}
```

## Regeln

- `front` und `back` sind pro Karte Pflicht.
- `back` darf ein Text oder eine Liste von Texten sein.
- Karten-IDs muessen stabil und eindeutig sein.
- Karten-IDs aus `data.js` oder `project-data.js` duerfen nicht erneut
  importiert werden.
- Wenn eine importierte Karten-ID erneut importiert wird, ersetzt sie die lokal
  importierte Version.

Eine startbare Vorlage liegt in [`import-vorlage.json`](./import-vorlage.json).

## Projektdateien einbinden

1. Neue JSON-Datei in `Karteikarten JSON/` ablegen.
2. Datenquelle neu erzeugen:

```sh
node scripts/build-project-data.mjs
```

3. `index.html` neu laden.

Die generierte Datei `project-data.js` wird von `index.html` vor `app.js`
geladen. Sie wird nicht von Hand editiert.

## Export

Die App erzeugt zwei JSON-Exporte:

- `karteikarten-importe-YYYY-MM-DD.json` enthaelt nur lokal importierte
  Inhalte. Diese Datei kann spaeter wieder als Importbasis dienen.
- `karteikarten-lernstand-YYYY-MM-DD.json` enthaelt den Lernstand pro Karte.
  Dieser Export ist zunaechst als Sicherung und Diagnose gedacht.

Die festen Projektkarten aus `data.js` und `project-data.js` werden beim
Import-Export nicht mit ausgegeben.
