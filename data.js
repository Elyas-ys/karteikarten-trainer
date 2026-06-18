window.studyData = [
  {
    id: "sem1",
    label: "1. Semester",
    title: "Erstes Semester",
    status: "planned",
    modules: [],
  },
  {
    id: "sem2",
    label: "2. Semester",
    title: "Zweites Semester",
    status: "completed",
    modules: [
      {
        id: "datensicherheit-data-observability",
        title: "Datensicherheit & Data Observability",
        shortTitle: "Datensicherheit",
        status: "active",
        topics: [
          {
            id: "grundlagen",
            title: "Grundlagen",
            cards: [
              {
                id: "sem2-ddo-001",
                legacyId: 1,
                type: "definition",
                examRelevance: "high",
                front: "Was ist Datensicherheit?",
                back:
                  "Datensicherheit bezeichnet den technischen und organisatorischen Schutz von Daten und Informationssystemen vor unbefugtem Zugriff, Manipulation, Verlust, Zerstoerung oder Ausfall. Ziel ist die Sicherstellung von Vertraulichkeit, Integritaet und Verfuegbarkeit. Sie ist nicht nur Verschluesselung, sondern ein umfassendes Sicherheitskonzept und wird risikobasiert gedacht.",
              },
              {
                id: "sem2-ddo-002",
                legacyId: 2,
                type: "definition",
                examRelevance: "high",
                front: "Was ist Datenschutz?",
                back:
                  "Datenschutz bezeichnet den rechtmaessigen, verantwortungsvollen und zweckgebundenen Umgang mit personenbezogenen Daten, um die Rechte und Freiheiten natuerlicher Personen zu schuetzen. Im Zentrum steht also nicht nur technische Sicherheit, sondern auch die Frage, ob und wofuer Daten verarbeitet werden duerfen.",
              },
              {
                id: "sem2-ddo-003",
                legacyId: 3,
                type: "comparison",
                examRelevance: "high",
                front: "Datensicherheit vs. Datenschutz",
                back: [
                  "Datensicherheit schuetzt Daten technisch-organisatorisch.",
                  "Datenschutz schuetzt Personen im Umgang mit personenbezogenen Daten.",
                  "Datensicherheit unterstuetzt Datenschutz, ersetzt ihn aber nicht.",
                ],
              },
              {
                id: "sem2-ddo-004",
                legacyId: 4,
                type: "concept",
                examRelevance: "high",
                front: "Was bedeutet CIA?",
                back: [
                  "Confidentiality = Vertraulichkeit",
                  "Integrity = Integritaet",
                  "Availability = Verfuegbarkeit",
                  "Das sind die zentralen Schutzziele der Datensicherheit.",
                ],
              },
            ],
          },
          {
            id: "data-observability",
            title: "Data Observability",
            cards: [
              {
                id: "sem2-ddo-005",
                legacyId: 5,
                type: "definition",
                examRelevance: "high",
                front: "Was ist Data Observability?",
                back:
                  "Data Observability ist die systematische Beobachtbarkeit und Analyse von Datenzustaenden und Datenpipelines im Betrieb, um Auffaelligkeiten, Fehler und Ursachen fruehzeitig zu erkennen und einzuordnen. Sie geht ueber blosses Monitoring hinaus.",
              },
              {
                id: "sem2-ddo-006",
                legacyId: 6,
                type: "list",
                examRelevance: "high",
                front: "Was sind die 5 Saeulen der Data Observability?",
                back: ["Aktualitaet", "Verteilung", "Menge", "Schema", "Lineage"],
              },
              {
                id: "sem2-ddo-010",
                legacyId: 10,
                type: "comparison",
                examRelevance: "medium",
                front: "Monitoring vs. Observability",
                back: [
                  "Monitoring beobachtet vor allem definierte Kennzahlen und Zustaende.",
                  "Observability soll den Systemzustand verstehen und Ursachenanalyse ermoeglichen.",
                ],
              },
            ],
          },
          {
            id: "datenqualitaet",
            title: "Datenqualitaet",
            cards: [
              {
                id: "sem2-ddo-007",
                legacyId: 7,
                type: "definition",
                examRelevance: "high",
                front: "Was ist Datenqualitaet?",
                back:
                  "Datenqualitaet ist die zweckabhaengige fachliche Eignung von Daten fuer eine bestimmte Nutzung. Daten sind also nicht absolut gut oder schlecht, sondern immer bezogen auf einen konkreten Anwendungszweck zu bewerten.",
              },
              {
                id: "sem2-ddo-008",
                legacyId: 8,
                type: "list",
                examRelevance: "high",
                front: "Welche zentralen Qualitaetsdimensionen solltest du nennen koennen?",
                back: [
                  "Vollstaendigkeit",
                  "Korrektheit",
                  "Konsistenz",
                  "Gueltigkeit",
                  "Aktualitaet",
                  "Eindeutigkeit",
                ],
              },
              {
                id: "sem2-ddo-009",
                legacyId: 9,
                type: "comparison",
                examRelevance: "high",
                front: "Data Observability vs. Datenqualitaet",
                back: [
                  "Observability = technischer Zugang zu Auffaelligkeiten in Datenzustaenden und Pipelines",
                  "Datenqualitaet = fachliche Bewertung, ob Daten fuer einen Zweck geeignet sind",
                  "Observability zeigt technische Probleme, ersetzt aber keine Qualitaetsbewertung.",
                ],
              },
              {
                id: "sem2-ddo-017",
                legacyId: 17,
                type: "reasoning",
                examRelevance: "medium",
                front: "Warum ist Datenqualitaet zweckabhaengig?",
                back:
                  "Weil Daten nicht an sich 'gut' oder 'schlecht' sind. Entscheidend ist, ob sie fuer einen konkreten Verwendungszweck fachlich geeignet sind. Derselbe Datensatz kann fuer einen Zweck ausreichen und fuer einen anderen ungeeignet sein.",
              },
              {
                id: "sem2-ddo-018",
                legacyId: 18,
                type: "reasoning",
                examRelevance: "medium",
                front: "Warum kann ein Datensatz technisch unauffaellig und trotzdem fachlich schlecht sein?",
                back:
                  "Weil Daten formal vollstaendig, schema-konform und plausibel sein koennen, aber trotzdem sachlich falsch, veraltet oder fuer den Zweck ungeeignet sein koennen. Genau deshalb ersetzt Observability keine Datenqualitaetsbewertung.",
              },
            ],
          },
          {
            id: "cloud-governance",
            title: "Cloud & Governance",
            cards: [
              {
                id: "sem2-ddo-011",
                legacyId: 11,
                type: "concept",
                examRelevance: "high",
                front: "Was ist Shared Responsibility?",
                back:
                  "In Cloud-Umgebungen sind Verantwortung und Sicherheit zwischen Anbieter und nutzendem Unternehmen aufgeteilt. Der Anbieter uebernimmt Teile der Infrastrukturabsicherung, das Unternehmen bleibt aber z. B. fuer Konfiguration, Zugriffsrechte und den sicheren Einsatz verantwortlich. Cloud verschiebt Verantwortung, hebt sie aber nicht auf.",
              },
              {
                id: "sem2-ddo-012",
                legacyId: 12,
                type: "reasoning",
                examRelevance: "high",
                front: "Warum ist 'In der Cloud macht der Anbieter alles' falsch?",
                back:
                  "Weil in der Cloud Shared Responsibility gilt. Der Anbieter uebernimmt nicht die komplette Verantwortung; das nutzende Unternehmen bleibt fuer viele Sicherheits- und Konfigurationsfragen selbst verantwortlich.",
              },
              {
                id: "sem2-ddo-015",
                legacyId: 15,
                type: "definition",
                examRelevance: "medium",
                front: "Was ist FinOps?",
                back:
                  "FinOps ist ein Governance-orientiertes Vorgehen zur finanziellen Verantwortlichkeit in variablen Cloud-Kostenmodellen. Es geht nicht nur um Reporting, sondern um Transparenz, kostenbewusste Architektur und klare Verantwortlichkeiten.",
              },
              {
                id: "sem2-ddo-016",
                legacyId: 16,
                type: "reasoning",
                examRelevance: "medium",
                front: "Warum ist 'FinOps = Controlling' falsch?",
                back:
                  "Weil FinOps mehr ist als reines Reporting. Es verbindet Kostenverantwortung, Transparenz und Architektur-/Nutzungsentscheidungen in Cloud-Umgebungen.",
              },
            ],
          },
          {
            id: "anonymisierung",
            title: "Anonymisierung",
            cards: [
              {
                id: "sem2-ddo-013",
                legacyId: 13,
                type: "definition",
                examRelevance: "high",
                front: "Was ist k-Anonymitaet?",
                back:
                  "k-Anonymitaet ist erreicht, wenn jeder Datensatz in Bezug auf Quasi-Identifizierer in einer Gruppe von mindestens k Datensaetzen mit gleicher QI-Kombination aufgeht. Das blosse Entfernen direkter Identifikatoren reicht dafuer nicht aus.",
              },
              {
                id: "sem2-ddo-014",
                legacyId: 14,
                type: "reasoning",
                examRelevance: "high",
                front: "Warum reicht das Loeschen von Namen fuer Anonymisierung nicht aus?",
                back:
                  "Weil Quasi-Identifizierer weiterhin Rueckschluesse auf Personen erlauben koennen. Deshalb ist Anonymisierung schwieriger als nur das Entfernen direkter Identifikatoren.",
              },
            ],
          },
          {
            id: "pruefungsbehauptungen",
            title: "Pruefungsbehauptungen",
            cards: [
              {
                id: "sem2-ddo-019",
                legacyId: 19,
                type: "assertion",
                examRelevance: "high",
                front: "'Datensicherheit ist dasselbe wie Datenschutz.'",
                back:
                  "Falsch. Datensicherheit schuetzt Daten, Datenschutz regelt den rechtmaessigen Umgang mit personenbezogenen Daten.",
              },
              {
                id: "sem2-ddo-020",
                legacyId: 20,
                type: "assertion",
                examRelevance: "high",
                front: "'Data Observability ersetzt Datenqualitaet.'",
                back:
                  "Falsch. Observability ueberwacht technisch, Datenqualitaet bewertet fachliche Eignung.",
              },
              {
                id: "sem2-ddo-021",
                legacyId: 21,
                type: "assertion",
                examRelevance: "high",
                front: "'In der Cloud ist der Anbieter komplett verantwortlich.'",
                back: "Falsch. Es gilt Shared Responsibility.",
              },
              {
                id: "sem2-ddo-022",
                legacyId: 22,
                type: "assertion",
                examRelevance: "high",
                front: "'Wenn direkte Identifikatoren entfernt sind, sind Daten anonym.'",
                back:
                  "Falsch. Quasi-Identifizierer koennen weiterhin Re-Identifikation ermoeglichen.",
              },
              {
                id: "sem2-ddo-023",
                legacyId: 23,
                type: "assertion",
                examRelevance: "medium",
                front: "'FinOps ist nur Kostenreporting.'",
                back:
                  "Falsch. FinOps ist finanzielle Verantwortlichkeit in variablen Cloud-Kostenmodellen.",
              },
            ],
          },
          {
            id: "antwortschema",
            title: "Antwortschema",
            cards: [
              {
                id: "sem2-ddo-024",
                legacyId: 24,
                type: "schema",
                examRelevance: "high",
                front: "Welches Schema nutze ich bei Bewertungsaufgaben?",
                back: [
                  "Definition",
                  "Warum wirkt die Aussage plausibel?",
                  "Fachliche Relativierung",
                  "Schlussurteil",
                ],
              },
              {
                id: "sem2-ddo-025",
                legacyId: 25,
                type: "formulation",
                examRelevance: "medium",
                front: "Formulierung fuer den Einstieg in offene Aufgaben",
                back: '"X bezeichnet ..."',
              },
              {
                id: "sem2-ddo-026",
                legacyId: 26,
                type: "formulation",
                examRelevance: "medium",
                front: "Formulierung fuer den Plausibilitaetsteil",
                back: '"Die Aussage wirkt zunaechst plausibel, weil ..."',
              },
              {
                id: "sem2-ddo-027",
                legacyId: 27,
                type: "formulation",
                examRelevance: "medium",
                front: "Formulierung fuer die Relativierung",
                back: '"Die Aussage greift jedoch zu kurz, weil ..."',
              },
              {
                id: "sem2-ddo-028",
                legacyId: 28,
                type: "formulation",
                examRelevance: "medium",
                front: "Formulierung fuer das Schlussurteil",
                back:
                  '"Insgesamt ist die Aussage daher nur teilweise richtig / zu pauschal / fachlich nicht haltbar."',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "sem3",
    label: "3. Semester",
    title: "Drittes Semester",
    status: "current",
    modules: [],
  },
  {
    id: "sem4",
    label: "4. Semester",
    title: "Viertes Semester",
    status: "planned",
    modules: [],
  },
  {
    id: "sem5",
    label: "5. Semester",
    title: "Fuenftes Semester",
    status: "planned",
    modules: [],
  },
  {
    id: "sem6",
    label: "6. Semester",
    title: "Sechstes Semester",
    status: "planned",
    modules: [],
  },
];
