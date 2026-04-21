const STORAGE_KEY = "karteikarten-trainer-state-v1";
const TODAY_KEY = getLocalDateKey(new Date());
const REVIEW_INTERVALS = {
  again: 0,
  hard: 1,
  easy: 3,
};
const LEITNER_STEPS = [0, 1, 3, 7, 14, 30];
const storage = createStorage();

const cards = [
  {
    id: 1,
    category: "Grundlagen",
    front: "Was ist Datensicherheit?",
    back:
      "Datensicherheit bezeichnet den technischen und organisatorischen Schutz von Daten und Informationssystemen vor unbefugtem Zugriff, Manipulation, Verlust, Zerstoerung oder Ausfall. Ziel ist die Sicherstellung von Vertraulichkeit, Integritaet und Verfuegbarkeit. Sie ist nicht nur Verschluesselung, sondern ein umfassendes Sicherheitskonzept und wird risikobasiert gedacht.",
  },
  {
    id: 2,
    category: "Grundlagen",
    front: "Was ist Datenschutz?",
    back:
      "Datenschutz bezeichnet den rechtmaessigen, verantwortungsvollen und zweckgebundenen Umgang mit personenbezogenen Daten, um die Rechte und Freiheiten natuerlicher Personen zu schuetzen. Im Zentrum steht also nicht nur technische Sicherheit, sondern auch die Frage, ob und wofuer Daten verarbeitet werden duerfen.",
  },
  {
    id: 3,
    category: "Grundlagen",
    front: "Datensicherheit vs. Datenschutz",
    back: [
      "Datensicherheit schuetzt Daten technisch-organisatorisch.",
      "Datenschutz schuetzt Personen im Umgang mit personenbezogenen Daten.",
      "Datensicherheit unterstuetzt Datenschutz, ersetzt ihn aber nicht.",
    ],
  },
  {
    id: 4,
    category: "Grundlagen",
    front: "Was bedeutet CIA?",
    back: [
      "Confidentiality = Vertraulichkeit",
      "Integrity = Integritaet",
      "Availability = Verfuegbarkeit",
      "Das sind die zentralen Schutzziele der Datensicherheit.",
    ],
  },
  {
    id: 5,
    category: "Data Observability",
    front: "Was ist Data Observability?",
    back:
      "Data Observability ist die systematische Beobachtbarkeit und Analyse von Datenzustaenden und Datenpipelines im Betrieb, um Auffaelligkeiten, Fehler und Ursachen fruehzeitig zu erkennen und einzuordnen. Sie geht ueber blosses Monitoring hinaus.",
  },
  {
    id: 6,
    category: "Data Observability",
    front: "Was sind die 5 Saeulen der Data Observability?",
    back: ["Aktualitaet", "Verteilung", "Menge", "Schema", "Lineage"],
  },
  {
    id: 7,
    category: "Datenqualitaet",
    front: "Was ist Datenqualitaet?",
    back:
      "Datenqualitaet ist die zweckabhaengige fachliche Eignung von Daten fuer eine bestimmte Nutzung. Daten sind also nicht absolut gut oder schlecht, sondern immer bezogen auf einen konkreten Anwendungszweck zu bewerten.",
  },
  {
    id: 8,
    category: "Datenqualitaet",
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
    id: 9,
    category: "Datenqualitaet",
    front: "Data Observability vs. Datenqualitaet",
    back: [
      "Observability = technischer Zugang zu Auffaelligkeiten in Datenzustaenden und Pipelines",
      "Datenqualitaet = fachliche Bewertung, ob Daten fuer einen Zweck geeignet sind",
      "Observability zeigt technische Probleme, ersetzt aber keine Qualitaetsbewertung.",
    ],
  },
  {
    id: 10,
    category: "Data Observability",
    front: "Monitoring vs. Observability",
    back: [
      "Monitoring beobachtet vor allem definierte Kennzahlen und Zustaende.",
      "Observability soll den Systemzustand verstehen und Ursachenanalyse ermoeglichen.",
    ],
  },
  {
    id: 11,
    category: "Cloud & Governance",
    front: "Was ist Shared Responsibility?",
    back:
      "In Cloud-Umgebungen sind Verantwortung und Sicherheit zwischen Anbieter und nutzendem Unternehmen aufgeteilt. Der Anbieter uebernimmt Teile der Infrastrukturabsicherung, das Unternehmen bleibt aber z. B. fuer Konfiguration, Zugriffsrechte und den sicheren Einsatz verantwortlich. Cloud verschiebt Verantwortung, hebt sie aber nicht auf.",
  },
  {
    id: 12,
    category: "Cloud & Governance",
    front: "Warum ist 'In der Cloud macht der Anbieter alles' falsch?",
    back:
      "Weil in der Cloud Shared Responsibility gilt. Der Anbieter uebernimmt nicht die komplette Verantwortung; das nutzende Unternehmen bleibt fuer viele Sicherheits- und Konfigurationsfragen selbst verantwortlich.",
  },
  {
    id: 13,
    category: "Anonymisierung",
    front: "Was ist k-Anonymitaet?",
    back:
      "k-Anonymitaet ist erreicht, wenn jeder Datensatz in Bezug auf Quasi-Identifizierer in einer Gruppe von mindestens k Datensaetzen mit gleicher QI-Kombination aufgeht. Das blosse Entfernen direkter Identifikatoren reicht dafuer nicht aus.",
  },
  {
    id: 14,
    category: "Anonymisierung",
    front: "Warum reicht das Loeschen von Namen fuer Anonymisierung nicht aus?",
    back:
      "Weil Quasi-Identifizierer weiterhin Rueckschluesse auf Personen erlauben koennen. Deshalb ist Anonymisierung schwieriger als nur das Entfernen direkter Identifikatoren.",
  },
  {
    id: 15,
    category: "Cloud & Governance",
    front: "Was ist FinOps?",
    back:
      "FinOps ist ein Governance-orientiertes Vorgehen zur finanziellen Verantwortlichkeit in variablen Cloud-Kostenmodellen. Es geht nicht nur um Reporting, sondern um Transparenz, kostenbewusste Architektur und klare Verantwortlichkeiten.",
  },
  {
    id: 16,
    category: "Cloud & Governance",
    front: "Warum ist 'FinOps = Controlling' falsch?",
    back:
      "Weil FinOps mehr ist als reines Reporting. Es verbindet Kostenverantwortung, Transparenz und Architektur-/Nutzungsentscheidungen in Cloud-Umgebungen.",
  },
  {
    id: 17,
    category: "Datenqualitaet",
    front: "Warum ist Datenqualitaet zweckabhaengig?",
    back:
      "Weil Daten nicht an sich 'gut' oder 'schlecht' sind. Entscheidend ist, ob sie fuer einen konkreten Verwendungszweck fachlich geeignet sind. Derselbe Datensatz kann fuer einen Zweck ausreichen und fuer einen anderen ungeeignet sein.",
  },
  {
    id: 18,
    category: "Datenqualitaet",
    front: "Warum kann ein Datensatz technisch unauffaellig und trotzdem fachlich schlecht sein?",
    back:
      "Weil Daten formal vollstaendig, schema-konform und plausibel sein koennen, aber trotzdem sachlich falsch, veraltet oder fuer den Zweck ungeeignet sein koennen. Genau deshalb ersetzt Observability keine Datenqualitaetsbewertung.",
  },
  {
    id: 19,
    category: "Pruefungsbehauptungen",
    front: "'Datensicherheit ist dasselbe wie Datenschutz.'",
    back:
      "Falsch. Datensicherheit schuetzt Daten, Datenschutz regelt den rechtmaessigen Umgang mit personenbezogenen Daten.",
  },
  {
    id: 20,
    category: "Pruefungsbehauptungen",
    front: "'Data Observability ersetzt Datenqualitaet.'",
    back:
      "Falsch. Observability ueberwacht technisch, Datenqualitaet bewertet fachliche Eignung.",
  },
  {
    id: 21,
    category: "Pruefungsbehauptungen",
    front: "'In der Cloud ist der Anbieter komplett verantwortlich.'",
    back: "Falsch. Es gilt Shared Responsibility.",
  },
  {
    id: 22,
    category: "Pruefungsbehauptungen",
    front: "'Wenn direkte Identifikatoren entfernt sind, sind Daten anonym.'",
    back:
      "Falsch. Quasi-Identifizierer koennen weiterhin Re-Identifikation ermoeglichen.",
  },
  {
    id: 23,
    category: "Pruefungsbehauptungen",
    front: "'FinOps ist nur Kostenreporting.'",
    back:
      "Falsch. FinOps ist finanzielle Verantwortlichkeit in variablen Cloud-Kostenmodellen.",
  },
  {
    id: 24,
    category: "Antwortschema",
    front: "Welches Schema nutze ich bei Bewertungsaufgaben?",
    back: [
      "Definition",
      "Warum wirkt die Aussage plausibel?",
      "Fachliche Relativierung",
      "Schlussurteil",
    ],
  },
  {
    id: 25,
    category: "Antwortschema",
    front: "Formulierung fuer den Einstieg in offene Aufgaben",
    back: '"X bezeichnet ..."',
  },
  {
    id: 26,
    category: "Antwortschema",
    front: "Formulierung fuer den Plausibilitaetsteil",
    back: '"Die Aussage wirkt zunaechst plausibel, weil ..."',
  },
  {
    id: 27,
    category: "Antwortschema",
    front: "Formulierung fuer die Relativierung",
    back: '"Die Aussage greift jedoch zu kurz, weil ..."',
  },
  {
    id: 28,
    category: "Antwortschema",
    front: "Formulierung fuer das Schlussurteil",
    back:
      '"Insgesamt ist die Aussage daher nur teilweise richtig / zu pauschal / fachlich nicht haltbar."',
  },
];

const state = {
  filters: {
    mode: "due",
    categories: new Set(cards.map((card) => card.category)),
  },
  order: cards.map((card) => card.id),
  queue: [],
  currentCardId: null,
  isBackVisible: false,
  scheduleText: "Nach deiner Bewertung siehst du hier, wann die Karte wiederkommt.",
  progress: loadProgress(),
};

const elements = {
  dueCount: document.querySelector("#due-count"),
  reviewedToday: document.querySelector("#reviewed-today"),
  masteredCount: document.querySelector("#mastered-count"),
  confidenceRate: document.querySelector("#confidence-rate"),
  categoryCount: document.querySelector("#category-count"),
  modePill: document.querySelector("#mode-pill"),
  progressCopy: document.querySelector("#progress-copy"),
  sessionTitle: document.querySelector("#session-title"),
  cardNumber: document.querySelector("#card-number"),
  cardCategory: document.querySelector("#card-category"),
  cardFront: document.querySelector("#card-front"),
  cardBack: document.querySelector("#card-back"),
  flashcard: document.querySelector("#flashcard"),
  flipButton: document.querySelector("#flip-button"),
  ratingControls: document.querySelector("#rating-controls"),
  schedulePreview: document.querySelector("#schedule-preview"),
  categoryFilters: document.querySelector("#category-filters"),
  modeSelector: document.querySelector("#mode-selector"),
  shuffleButton: document.querySelector("#shuffle-button"),
  resetButton: document.querySelector("#reset-button"),
  skipButton: document.querySelector("#skip-button"),
};

initialize();

function initialize() {
  renderCategoryFilters();
  attachEvents();
  rebuildQueue();
  render();
}

function attachEvents() {
  elements.flipButton.addEventListener("click", flipCurrentCard);
  elements.flashcard.addEventListener("click", () => {
    if (!state.isBackVisible) {
      flipCurrentCard();
    }
  });
  elements.flashcard.addEventListener("keydown", (event) => {
    if ((event.key === "Enter" || event.key === " ") && !state.isBackVisible) {
      event.preventDefault();
      flipCurrentCard();
    }
  });

  elements.modeSelector.addEventListener("click", (event) => {
    const button = event.target.closest("[data-mode]");
    if (!button) {
      return;
    }

    state.filters.mode = button.dataset.mode;
    rebuildQueue();
    render();
  });

  elements.categoryFilters.addEventListener("click", (event) => {
    const button = event.target.closest("[data-category]");
    if (!button) {
      return;
    }

    const category = button.dataset.category;
    const { categories } = state.filters;

    if (categories.has(category) && categories.size > 1) {
      categories.delete(category);
    } else {
      categories.add(category);
    }

    rebuildQueue();
    render();
  });

  elements.ratingControls.addEventListener("click", (event) => {
    const button = event.target.closest("[data-rating]");
    if (!button) {
      return;
    }

    rateCard(button.dataset.rating);
  });

  elements.shuffleButton.addEventListener("click", () => {
    shuffle(state.order);
    rebuildQueue();
    render();
  });

  elements.skipButton.addEventListener("click", () => {
    if (!state.currentCardId) {
      return;
    }

    const skippedId = state.currentCardId;
    state.queue = state.queue.filter((id) => id !== skippedId);
    state.queue.push(skippedId);
    state.currentCardId = state.queue[0] ?? null;
    state.isBackVisible = false;
    state.scheduleText = "Karte uebersprungen. Sie kommt spaeter in dieser Session erneut.";
    render();
  });

  elements.resetButton.addEventListener("click", () => {
    const shouldReset = window.confirm(
      "Willst du den gesamten Lernstand wirklich zuruecksetzen?",
    );

    if (!shouldReset) {
      return;
    }

    storage.removeItem(STORAGE_KEY);
    state.progress = loadProgress();
    state.scheduleText = "Lernstand zurueckgesetzt. Alle Karten sind wieder offen.";
    rebuildQueue();
    render();
  });
}

function loadProgress() {
  const fallback = Object.fromEntries(
    cards.map((card) => [
      card.id,
      {
        box: 1,
        dueDate: TODAY_KEY,
        reviewedToday: 0,
        lastReviewedDate: null,
        easyCount: 0,
        hardCount: 0,
        againCount: 0,
        lastRating: null,
      },
    ]),
  );

  const raw = storage.getItem(STORAGE_KEY);
  if (!raw) {
    return fallback;
  }

  try {
    const parsed = JSON.parse(raw);
    const merged = {
      ...fallback,
      ...parsed,
    };
    cards.forEach((card) => {
      const entry = {
        ...fallback[card.id],
        ...(merged[card.id] ?? {}),
      };
      if (entry.lastReviewedDate !== TODAY_KEY) {
        entry.reviewedToday = 0;
      }
      merged[card.id] = entry;
    });
    return merged;
  } catch {
    return fallback;
  }
}

function saveProgress() {
  storage.setItem(STORAGE_KEY, JSON.stringify(state.progress));
}

function renderCategoryFilters() {
  const categories = [...new Set(cards.map((card) => card.category))];
  elements.categoryFilters.innerHTML = categories
    .map(
      (category) => `
        <button
          class="tag-button ${state.filters.categories.has(category) ? "active" : ""}"
          data-category="${escapeHtml(category)}"
          type="button"
        >
          ${escapeHtml(category)}
        </button>
      `,
    )
    .join("");
}

function rebuildQueue() {
  const availableCards = cards.filter((card) => isCardVisible(card));
  const dueCards = availableCards.filter((card) => isCardDue(card.id));
  const weakCards = availableCards.filter((card) => {
    const progress = state.progress[card.id];
    return progress.againCount > 0 || progress.hardCount > progress.easyCount;
  });

  let nextQueue;

  if (state.filters.mode === "due") {
    nextQueue = dueCards.length ? dueCards : availableCards;
  } else if (state.filters.mode === "weak") {
    nextQueue = weakCards.length ? weakCards : availableCards;
  } else {
    nextQueue = availableCards;
  }

  state.queue = nextQueue
    .map((card) => card.id)
    .sort((leftId, rightId) => {
      const leftIndex = state.order.indexOf(leftId);
      const rightIndex = state.order.indexOf(rightId);
      return leftIndex - rightIndex;
    });

  state.currentCardId = state.queue[0] ?? null;
  state.isBackVisible = false;
  renderCategoryFilters();
}

function render() {
  const currentCard = cards.find((card) => card.id === state.currentCardId);
  const dueCount = cards.filter((card) => isCardDue(card.id)).length;
  const reviewedToday = cards.reduce(
    (sum, card) => sum + state.progress[card.id].reviewedToday,
    0,
  );
  const masteredCount = cards.filter((card) => state.progress[card.id].box >= 4)
    .length;
  const successfulReviews = cards.reduce(
    (sum, card) => sum + state.progress[card.id].easyCount,
    0,
  );
  const totalReviews = cards.reduce((sum, card) => {
    const progress = state.progress[card.id];
    return sum + progress.easyCount + progress.hardCount + progress.againCount;
  }, 0);
  const activeCategories = state.filters.categories.size;

  elements.dueCount.textContent = dueCount;
  elements.reviewedToday.textContent = reviewedToday;
  elements.masteredCount.textContent = masteredCount;
  elements.confidenceRate.textContent = totalReviews
    ? `${Math.round((successfulReviews / totalReviews) * 100)}%`
    : "0%";
  elements.categoryCount.textContent = `${activeCategories} aktiv`;
  elements.modePill.textContent = getModeLabel(state.filters.mode);
  elements.schedulePreview.textContent = state.scheduleText;

  [...elements.modeSelector.querySelectorAll("[data-mode]")].forEach((button) => {
    button.classList.toggle("active", button.dataset.mode === state.filters.mode);
  });

  if (!currentCard) {
    elements.progressCopy.textContent =
      "Alle ausgewaehlten Karten sind erledigt. Du kannst den Stapel mischen oder auf 'Alle Karten' wechseln.";
    elements.sessionTitle.textContent = "Session geschafft";
    elements.cardNumber.textContent = "Keine Karte";
    elements.cardCategory.textContent = "Pause";
    elements.cardFront.textContent = "Sehr gut. Fuer diesen Filter bist du fertig.";
    elements.cardBack.innerHTML =
      "<p>Wechsle den Modus, aktiviere weitere Kategorien oder setze den Lernstand zurueck.</p>";
    elements.flashcard.classList.remove("is-back");
    elements.flashcard.classList.add("is-front");
    elements.flipButton.disabled = true;
    elements.flipButton.textContent = "Keine offene Karte";
    elements.ratingControls.classList.add("hidden");
    return;
  }

  const currentIndex = state.queue.indexOf(currentCard.id) + 1;

  elements.progressCopy.textContent = `${currentIndex} von ${state.queue.length} Karten in dieser Session`;
  elements.sessionTitle.textContent = "Aktive Karteikarte";
  elements.cardNumber.textContent = `Karte ${currentCard.id}`;
  elements.cardCategory.textContent = currentCard.category;
  elements.cardFront.textContent = currentCard.front;
  elements.cardBack.innerHTML = formatAnswer(currentCard.back);
  elements.flipButton.disabled = false;
  elements.flipButton.textContent = state.isBackVisible
    ? "Antwort ansehen und bewerten"
    : "Karte aufdecken";
  elements.ratingControls.classList.toggle("hidden", !state.isBackVisible);
  elements.flashcard.classList.toggle("is-back", state.isBackVisible);
  elements.flashcard.classList.toggle("is-front", !state.isBackVisible);
}

function flipCurrentCard() {
  if (!state.currentCardId) {
    return;
  }

  state.isBackVisible = true;
  state.scheduleText =
    "Bewerte jetzt ehrlich, wie sicher du die Antwort selbst geben konntest.";
  render();
}

function rateCard(rating) {
  const currentCardId = state.currentCardId;
  if (!currentCardId) {
    return;
  }

  const progress = state.progress[currentCardId];
  if (progress.lastReviewedDate !== TODAY_KEY) {
    progress.reviewedToday = 0;
  }
  progress.reviewedToday += 1;
  progress.lastReviewedDate = TODAY_KEY;
  progress.lastRating = rating;
  progress[`${rating}Count`] += 1;

  if (rating === "again") {
    progress.box = 1;
  } else if (rating === "hard") {
    progress.box = Math.max(1, progress.box);
  } else {
    progress.box = Math.min(5, progress.box + 1);
  }

  const nextDueDate = calculateNextDueDate(progress.box, rating);
  progress.dueDate = nextDueDate;
  saveProgress();

  state.queue = state.queue.filter((id) => id !== currentCardId);
  if (rating === "again") {
    insertLaterInQueue(currentCardId, 2);
  } else if (rating === "hard") {
    insertLaterInQueue(currentCardId, 4);
  }

  state.currentCardId = state.queue[0] ?? null;
  state.isBackVisible = false;
  state.scheduleText = buildScheduleCopy(rating, nextDueDate);
  render();
}

function insertLaterInQueue(cardId, offset) {
  const insertAt = Math.min(offset, state.queue.length);
  state.queue.splice(insertAt, 0, cardId);
}

function calculateNextDueDate(box, rating) {
  if (rating === "again") {
    return TODAY_KEY;
  }

  const extraDays = rating === "hard" ? REVIEW_INTERVALS.hard : REVIEW_INTERVALS.easy;
  const leitnerDays = LEITNER_STEPS[box] ?? LEITNER_STEPS[LEITNER_STEPS.length - 1];
  const target = new Date();
  target.setDate(target.getDate() + Math.max(extraDays, leitnerDays));
  return getLocalDateKey(target);
}

function buildScheduleCopy(rating, dueDate) {
  if (rating === "again") {
    return "Diese Karte kommt gleich nochmal in derselben Session. Sie bleibt ausserdem weiterhin heute faellig.";
  }

  if (rating === "hard") {
    return `Leicht verschoben: Die Karte taucht spaeter in der Session noch einmal auf und ist spaetestens am ${formatDate(dueDate)} wieder faellig.`;
  }

  return `Gut gewusst. Die Karte wird als naechstes am ${formatDate(dueDate)} wieder eingeplant.`;
}

function isCardVisible(card) {
  return state.filters.categories.has(card.category);
}

function isCardDue(cardId) {
  return state.progress[cardId].dueDate <= TODAY_KEY;
}

function getModeLabel(mode) {
  if (mode === "weak") {
    return "Unsichere Karten";
  }

  if (mode === "all") {
    return "Alle Karten";
  }

  return "Heute faellig";
}

function formatAnswer(back) {
  if (Array.isArray(back)) {
    return `<ul>${back
      .map((item) => `<li>${escapeHtml(item)}</li>`)
      .join("")}</ul>`;
  }

  return `<p>${escapeHtml(back)}</p>`;
}

function formatDate(dateString) {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(year, month - 1, day));
}

function shuffle(array) {
  for (let index = array.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [array[index], array[swapIndex]] = [array[swapIndex], array[index]];
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function getLocalDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function createStorage() {
  const memoryStorage = (() => {
    const store = new Map();
    return {
      getItem(key) {
        return store.has(key) ? store.get(key) : null;
      },
      setItem(key, value) {
        store.set(key, value);
      },
      removeItem(key) {
        store.delete(key);
      },
    };
  })();

  try {
    const testKey = "__karteikarten_test__";
    window.localStorage.setItem(testKey, "1");
    window.localStorage.removeItem(testKey);
    return window.localStorage;
  } catch {
    return memoryStorage;
  }
}
