const STORAGE_KEY = "karteikarten-trainer-state-v1";
const IMPORT_STORAGE_KEY = "karteikarten-trainer-imports-v1";
const TODAY_KEY = getLocalDateKey(new Date());
const REVIEW_INTERVALS = {
  again: 0,
  hard: 1,
  easy: 3,
};
const LEITNER_STEPS = [0, 1, 3, 7, 14, 30];
const storage = createStorage();

const seedStudyData = Array.isArray(window.studyData)
  ? deepClone(window.studyData)
  : [];
const projectImportIssues = [];
const projectCardImportSources = Array.isArray(window.projectCardImports)
  ? window.projectCardImports
  : [];
const projectStudyData = normalizeProjectImportSources(
  projectCardImportSources,
  seedStudyData,
  projectImportIssues,
);
const baseStudyData = mergeStudyData(seedStudyData, projectStudyData);
let importedStudyData = loadImportedStudyData();
let studyData = mergeStudyData(baseStudyData, importedStudyData);
let cards = flattenStudyData(studyData);
let studySummary = buildStudySummary(studyData, cards);

const state = {
  filters: {
    semesterId: getDefaultSemesterId(),
    moduleId: "all",
    mode: "due",
    scope: "selection",
    categories: new Set(),
  },
  order: cards.map((card) => card.id),
  queue: [],
  currentCardId: null,
  isBackVisible: false,
  importMessage: "",
  scheduleText: "Nach deiner Bewertung siehst du hier, wann die Karte wiederkommt.",
  progress: loadProgress(),
};

const elements = {
  heroTitle: document.querySelector("#hero-title"),
  heroCopy: document.querySelector("#hero-copy"),
  studyCount: document.querySelector("#study-count"),
  studyOverview: document.querySelector("#study-overview"),
  dueCount: document.querySelector("#due-count"),
  reviewedToday: document.querySelector("#reviewed-today"),
  masteredCount: document.querySelector("#mastered-count"),
  confidenceRate: document.querySelector("#confidence-rate"),
  categoryCount: document.querySelector("#category-count"),
  topicInsightCount: document.querySelector("#topic-insight-count"),
  topicInsights: document.querySelector("#topic-insights"),
  modePill: document.querySelector("#mode-pill"),
  sessionScope: document.querySelector("#session-scope"),
  sessionStatusPill: document.querySelector("#session-status-pill"),
  sessionDetail: document.querySelector("#session-detail"),
  sessionQueueCount: document.querySelector("#session-queue-count"),
  sessionTopicCount: document.querySelector("#session-topic-count"),
  sessionDueInline: document.querySelector("#session-due-inline"),
  sessionActionButton: document.querySelector("#session-action-button"),
  progressCopy: document.querySelector("#progress-copy"),
  sessionTitle: document.querySelector("#session-title"),
  cardNumber: document.querySelector("#card-number"),
  cardModule: document.querySelector("#card-module"),
  cardCategory: document.querySelector("#card-category"),
  cardFront: document.querySelector("#card-front"),
  cardBack: document.querySelector("#card-back"),
  flashcard: document.querySelector("#flashcard"),
  flipButton: document.querySelector("#flip-button"),
  ratingControls: document.querySelector("#rating-controls"),
  schedulePreview: document.querySelector("#schedule-preview"),
  categoryFilters: document.querySelector("#category-filters"),
  importButton: document.querySelector("#import-button"),
  importFileInput: document.querySelector("#import-file-input"),
  importStatus: document.querySelector("#import-status"),
  importCount: document.querySelector("#import-count"),
  clearImportsButton: document.querySelector("#clear-imports-button"),
  exportImportsButton: document.querySelector("#export-imports-button"),
  exportProgressButton: document.querySelector("#export-progress-button"),
  modeSelector: document.querySelector("#mode-selector"),
  scopeSelector: document.querySelector("#scope-selector"),
  shuffleButton: document.querySelector("#shuffle-button"),
  resetButton: document.querySelector("#reset-button"),
  skipButton: document.querySelector("#skip-button"),
};

initialize();

function initialize() {
  resetCategoryFiltersToScope();
  renderStudyContext();
  renderCategoryFilters();
  attachEvents();
  rebuildQueue();
  render();
}

function flattenStudyData(semesters) {
  const flattenedCards = [];

  semesters.forEach((semester, semesterIndex) => {
    (semester.modules ?? []).forEach((module) => {
      (module.topics ?? []).forEach((topic) => {
        (topic.cards ?? []).forEach((card) => {
          flattenedCards.push({
            ...card,
            displayNumber: card.legacyId ?? flattenedCards.length + 1,
            semesterId: semester.id,
            semesterIndex,
            semesterLabel: semester.label,
            semesterTitle: semester.title,
            moduleId: module.id,
            moduleTitle: module.title,
            moduleShortTitle: module.shortTitle ?? module.title,
            topicId: topic.id,
            topicTitle: topic.title,
            category: topic.title,
          });
        });
      });
    });
  });

  return flattenedCards;
}

function buildStudySummary(semesters, flatCards) {
  const modules = [];
  const semesterSummaries = semesters.map((semester, index) => {
    let cardCount = 0;
    let topicCount = 0;

    (semester.modules ?? []).forEach((module) => {
      const moduleCards = flatCards.filter(
        (card) => card.semesterId === semester.id && card.moduleId === module.id,
      );
      const moduleTopicCount = new Set(moduleCards.map((card) => card.topicId)).size;

      cardCount += moduleCards.length;
      topicCount += moduleTopicCount;
      modules.push({
        id: module.id,
        title: module.title,
        shortTitle: module.shortTitle ?? module.title,
        semesterId: semester.id,
        semesterLabel: semester.label,
        cardCount: moduleCards.length,
        topicCount: moduleTopicCount,
        status: module.status,
      });
    });

    return {
      id: semester.id,
      index,
      label: semester.label,
      title: semester.title,
      status: semester.status,
      moduleCount: (semester.modules ?? []).length,
      topicCount,
      cardCount,
    };
  });

  return {
    semesters: semesterSummaries,
    modules,
    totalCards: flatCards.length,
  };
}

function loadImportedStudyData() {
  const raw = storage.getItem(IMPORT_STORAGE_KEY);

  if (!raw) {
    return [];
  }

  try {
    return normalizeImportedPayload(JSON.parse(raw));
  } catch {
    return [];
  }
}

function saveImportedStudyData() {
  storage.setItem(IMPORT_STORAGE_KEY, JSON.stringify(importedStudyData));
}

function normalizeProjectImportSources(sources, baseSemesters, issues = []) {
  let normalizedProjectData = [];

  (sources ?? []).forEach((source, index) => {
    const payload = source?.payload ?? source;
    const sourceLabel = source?.source ?? `Projektdatei ${index + 1}`;

    try {
      const normalizedSourceData = normalizeImportedPayload(payload, {
        baseSemesters: mergeStudyData(baseSemesters, normalizedProjectData),
      });
      normalizedProjectData = mergeStudyData(
        normalizedProjectData,
        normalizedSourceData,
      );
    } catch (error) {
      issues.push(`${sourceLabel}: ${error.message}`);
      console.warn(`Projektkarten konnten nicht geladen werden: ${sourceLabel}`, error);
    }
  });

  return normalizedProjectData;
}

function mergeStudyData(baseSemesters, extraSemesters) {
  const mergedSemesters = deepClone(baseSemesters);

  (extraSemesters ?? []).forEach((semester) => {
    mergeSemesterInto(mergedSemesters, semester);
  });

  return mergedSemesters;
}

function mergeSemesterInto(semesters, incomingSemester) {
  const existingSemester = semesters.find(
    (semester) => semester.id === incomingSemester.id,
  );

  if (!existingSemester) {
    semesters.push(deepClone(incomingSemester));
    return;
  }

  existingSemester.label = incomingSemester.label ?? existingSemester.label;
  existingSemester.title = incomingSemester.title ?? existingSemester.title;
  existingSemester.status = incomingSemester.status ?? existingSemester.status;
  existingSemester.modules = mergeModules(
    existingSemester.modules ?? [],
    incomingSemester.modules ?? [],
  );
}

function mergeModules(existingModules, incomingModules) {
  const mergedModules = deepClone(existingModules);

  incomingModules.forEach((incomingModule) => {
    const existingModule = mergedModules.find(
      (module) => module.id === incomingModule.id,
    );

    if (!existingModule) {
      mergedModules.push(deepClone(incomingModule));
      return;
    }

    existingModule.title = incomingModule.title ?? existingModule.title;
    existingModule.shortTitle =
      incomingModule.shortTitle ?? existingModule.shortTitle;
    existingModule.status = incomingModule.status ?? existingModule.status;
    existingModule.topics = mergeTopics(
      existingModule.topics ?? [],
      incomingModule.topics ?? [],
    );
  });

  return mergedModules;
}

function mergeTopics(existingTopics, incomingTopics) {
  const mergedTopics = deepClone(existingTopics);

  incomingTopics.forEach((incomingTopic) => {
    const existingTopic = mergedTopics.find((topic) => topic.id === incomingTopic.id);

    if (!existingTopic) {
      mergedTopics.push(deepClone(incomingTopic));
      return;
    }

    existingTopic.title = incomingTopic.title ?? existingTopic.title;
    existingTopic.cards = mergeCards(
      existingTopic.cards ?? [],
      incomingTopic.cards ?? [],
    );
  });

  return mergedTopics;
}

function mergeCards(existingCards, incomingCards) {
  const mergedCards = deepClone(existingCards);

  incomingCards.forEach((incomingCard) => {
    const existingIndex = mergedCards.findIndex(
      (card) => card.id === incomingCard.id,
    );

    if (existingIndex >= 0) {
      mergedCards[existingIndex] = deepClone(incomingCard);
      return;
    }

    mergedCards.push(deepClone(incomingCard));
  });

  return mergedCards;
}

function rebuildStudyDataFromImports() {
  const previousOrder = state.order;

  studyData = mergeStudyData(baseStudyData, importedStudyData);
  cards = flattenStudyData(studyData);
  studySummary = buildStudySummary(studyData, cards);
  state.order = buildNextCardOrder(previousOrder);
  state.progress = loadProgress();
  ensureSelectedStudyScopeExists();
  resetCategoryFiltersToScope();
  rebuildQueue();
  render();
}

function buildNextCardOrder(previousOrder) {
  const currentIds = new Set(cards.map((card) => card.id));
  const keptIds = previousOrder.filter((id) => currentIds.has(id));
  const knownIds = new Set(keptIds);
  const newIds = cards
    .map((card) => card.id)
    .filter((id) => !knownIds.has(id));

  return [...keptIds, ...newIds];
}

function ensureSelectedStudyScopeExists() {
  const selectedSemester = studySummary.semesters.find(
    (semester) =>
      semester.id === state.filters.semesterId && semester.cardCount > 0,
  );

  if (!selectedSemester) {
    state.filters.semesterId = getDefaultSemesterId();
    state.filters.moduleId = "all";
    return;
  }

  if (state.filters.moduleId === "all") {
    return;
  }

  const selectedModule = studySummary.modules.find(
    (module) =>
      module.semesterId === state.filters.semesterId &&
      module.id === state.filters.moduleId,
  );

  if (!selectedModule) {
    state.filters.moduleId = "all";
  }
}

function normalizeImportedPayload(payload, options = {}) {
  const rawSemesters = extractImportedSemesters(payload, options);
  const normalizedSemesters = rawSemesters.map((semester, index) =>
    normalizeImportedSemester(semester, index),
  );

  ensureImportedCardsDoNotDuplicateBase(
    normalizedSemesters,
    options.baseSemesters,
  );
  ensureNoDuplicateCardIds(normalizedSemesters);

  return normalizedSemesters;
}

function extractImportedSemesters(payload, options = {}) {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (!payload || typeof payload !== "object") {
    throw new Error("Die Datei muss ein JSON-Objekt enthalten.");
  }

  if (Array.isArray(payload.semesters)) {
    return payload.semesters;
  }

  if (Array.isArray(payload.studyData)) {
    return payload.studyData;
  }

  if (payload.semester && typeof payload.semester === "object") {
    return [payload.semester];
  }

  if (payload.id && Array.isArray(payload.modules)) {
    return [payload];
  }

  if (payload.module || Array.isArray(payload.modules)) {
    return [createSemesterFromModulePayload(payload, options.baseSemesters)];
  }

  throw new Error("Keine Semester oder Module im Import gefunden.");
}

function createSemesterFromModulePayload(payload, baseSemesters = baseStudyData) {
  const semesterId = getStringValue(payload.semesterId) || "sem3";
  const existingSemester = (baseSemesters ?? []).find(
    (semester) => semester.id === semesterId,
  );
  const modules = payload.module ? [payload.module] : payload.modules;

  return {
    id: semesterId,
    label:
      getStringValue(payload.semesterLabel) ??
      existingSemester?.label ??
      "3. Semester",
    title:
      getStringValue(payload.semesterTitle) ??
      existingSemester?.title ??
      "Drittes Semester",
    status:
      getStringValue(payload.semesterStatus) ??
      existingSemester?.status ??
      "current",
    modules,
  };
}

function normalizeImportedSemester(rawSemester, index) {
  if (!rawSemester || typeof rawSemester !== "object") {
    throw new Error(`Semester ${index + 1} ist kein Objekt.`);
  }

  const id = getStringValue(rawSemester.id) ?? `semester-${index + 1}`;
  const label = getStringValue(rawSemester.label) ?? id;
  const title = getStringValue(rawSemester.title) ?? label;
  const modules = Array.isArray(rawSemester.modules) ? rawSemester.modules : [];

  if (!modules.length) {
    throw new Error(`${label} enthaelt keine Module.`);
  }

  return {
    id,
    label,
    title,
    status: getStringValue(rawSemester.status) ?? "planned",
    modules: modules.map((module, moduleIndex) =>
      normalizeImportedModule(module, id, moduleIndex),
    ),
  };
}

function normalizeImportedModule(rawModule, semesterId, index) {
  if (!rawModule || typeof rawModule !== "object") {
    throw new Error(`Modul ${index + 1} in ${semesterId} ist kein Objekt.`);
  }

  const title = getStringValue(rawModule.title) ?? `Modul ${index + 1}`;
  const id =
    getStringValue(rawModule.id) ??
    getStringValue(rawModule.moduleId) ??
    slugify(title);
  const rawTopics = Array.isArray(rawModule.topics)
    ? rawModule.topics
    : Array.isArray(rawModule.cards)
      ? [
          {
            id: "allgemein",
            title: "Allgemein",
            cards: rawModule.cards,
          },
        ]
      : [];

  if (!rawTopics.length) {
    throw new Error(`Modul "${title}" enthaelt keine Themen oder Karten.`);
  }

  return {
    id,
    title,
    shortTitle: getStringValue(rawModule.shortTitle) ?? title,
    status: getStringValue(rawModule.status) ?? "imported",
    topics: rawTopics.map((topic, topicIndex) =>
      normalizeImportedTopic(topic, semesterId, id, topicIndex),
    ),
  };
}

function normalizeImportedTopic(rawTopic, semesterId, moduleId, index) {
  if (!rawTopic || typeof rawTopic !== "object") {
    throw new Error(`Thema ${index + 1} in ${moduleId} ist kein Objekt.`);
  }

  const title = getStringValue(rawTopic.title) ?? `Thema ${index + 1}`;
  const id =
    getStringValue(rawTopic.id) ??
    getStringValue(rawTopic.topicId) ??
    slugify(title);
  const cardsForTopic = Array.isArray(rawTopic.cards) ? rawTopic.cards : [];

  if (!cardsForTopic.length) {
    throw new Error(`Thema "${title}" enthaelt keine Karten.`);
  }

  return {
    id,
    title,
    cards: cardsForTopic.map((card, cardIndex) =>
      normalizeImportedCard(card, semesterId, moduleId, id, cardIndex),
    ),
  };
}

function normalizeImportedCard(rawCard, semesterId, moduleId, topicId, index) {
  if (!rawCard || typeof rawCard !== "object") {
    throw new Error(`Karte ${index + 1} in ${topicId} ist kein Objekt.`);
  }

  const front = getStringValue(rawCard.front);
  const back = Array.isArray(rawCard.back)
    ? rawCard.back.map((item) => getStringValue(item)).filter(Boolean)
    : getStringValue(rawCard.back);

  if (!front || (Array.isArray(back) ? !back.length : !back)) {
    throw new Error(`Karte ${index + 1} in ${topicId} braucht front und back.`);
  }

  const frontSlug = slugify(front) || `karte-${index + 1}`;
  const generatedId = `${semesterId}-${moduleId}-${topicId}-${frontSlug.slice(
    0,
    36,
  )}`;

  return {
    ...rawCard,
    id: getStringValue(rawCard.id) ?? generatedId,
    type: getStringValue(rawCard.type) ?? "import",
    examRelevance: getStringValue(rawCard.examRelevance) ?? "medium",
    front,
    back,
  };
}

function ensureImportedCardsDoNotDuplicateBase(
  importedSemesters,
  baseSemesters = baseStudyData,
) {
  const baseCardIds = new Set(
    flattenStudyData(baseSemesters ?? []).map((card) => card.id),
  );
  const duplicateIds = collectCardIds(importedSemesters).filter((id) =>
    baseCardIds.has(id),
  );

  if (duplicateIds.length) {
    throw new Error(
      `Diese Karten-ID gibt es schon in data.js: ${duplicateIds[0]}`,
    );
  }
}

function ensureNoDuplicateCardIds(importedSemesters) {
  const seenIds = new Set();

  collectCardIds(importedSemesters).forEach((cardId) => {
    if (seenIds.has(cardId)) {
      throw new Error(`Doppelte Karten-ID im Import: ${cardId}`);
    }

    seenIds.add(cardId);
  });
}

function collectCardIds(semesters) {
  return semesters.flatMap((semester) =>
    (semester.modules ?? []).flatMap((module) =>
      (module.topics ?? []).flatMap((topic) =>
        (topic.cards ?? []).map((card) => card.id),
      ),
    ),
  );
}

function getDefaultSemesterId() {
  return (
    studySummary.semesters.find(
      (semester) =>
        (semester.status === "current" || semester.status === "active") &&
        semester.cardCount > 0,
    )?.id ??
    studySummary.semesters.find((semester) => semester.cardCount > 0)?.id ??
    studySummary.semesters[0]?.id ??
    null
  );
}

function getSelectedSemesterSummary() {
  return (
    studySummary.semesters.find(
      (semester) => semester.id === state.filters.semesterId,
    ) ?? studySummary.semesters[0]
  );
}

function getCurrentSemesterSummary() {
  return (
    studySummary.semesters.find((semester) => semester.status === "current") ??
    studySummary.semesters.find((semester) => semester.status === "active") ??
    studySummary.semesters.find((semester) => semester.cardCount > 0) ??
    studySummary.semesters[0]
  );
}

function getSelectedModuleSummary() {
  if (state.filters.moduleId === "all") {
    return null;
  }

  return studySummary.modules.find(
    (module) =>
      module.semesterId === state.filters.semesterId &&
      module.id === state.filters.moduleId,
  );
}

function getModulesForSelectedSemester() {
  return studySummary.modules.filter(
    (module) =>
      module.semesterId === state.filters.semesterId && module.cardCount > 0,
  );
}

function isGlobalDueScope() {
  return state.filters.scope === "global-due";
}

function isPastSemesterScope() {
  return state.filters.scope === "past-semesters";
}

function isSelectionScope() {
  return state.filters.scope === "selection";
}

function getStudyScopedCards() {
  if (isGlobalDueScope()) {
    return cards.filter((card) => isCardDue(card.id));
  }

  if (isPastSemesterScope()) {
    return cards.filter((card) => isPastSemesterCard(card));
  }

  return cards.filter((card) => {
    const matchesSemester =
      !state.filters.semesterId || card.semesterId === state.filters.semesterId;
    const matchesModule =
      state.filters.moduleId === "all" || card.moduleId === state.filters.moduleId;

    return matchesSemester && matchesModule;
  });
}

function isPastSemesterCard(card) {
  const currentSemester = getCurrentSemesterSummary();

  if (!currentSemester) {
    return false;
  }

  return card.semesterIndex < currentSemester.index;
}

function resetCategoryFiltersToScope() {
  state.filters.categories = new Set(
    getStudyScopedCards().map((card) => card.category),
  );
}

function renderStudyContext() {
  const selectedSemester = getSelectedSemesterSummary();
  const selectedModule = getSelectedModuleSummary();
  const modulesForSelectedSemester = getModulesForSelectedSemester();
  const scopedCards = getStudyScopedCards();
  const moduleScopeTitle =
    selectedModule?.title ??
    (modulesForSelectedSemester.length === 1
      ? modulesForSelectedSemester[0].title
      : selectedSemester?.label);

  elements.studyCount.textContent = pluralize(
    studySummary.semesters.length,
    "Semester",
    "Semester",
  );
  elements.studyOverview.innerHTML = `
    <div class="study-filter-group">
      <p class="filter-label">Semester</p>
      <div class="study-list">
        ${studySummary.semesters
          .map((semester) => renderSemesterButton(semester))
          .join("")}
      </div>
    </div>
    <div class="study-filter-group">
      <p class="filter-label">Module</p>
      ${renderModuleFilters(modulesForSelectedSemester)}
    </div>
  `;

  if (isGlobalDueScope()) {
    elements.heroTitle.textContent = "Faellige Wiederholung";
    elements.heroCopy.textContent = scopedCards.length
      ? `Studium gesamt · ${pluralize(
          scopedCards.length,
          "faellige Karte",
          "faellige Karten",
        )} · ${pluralize(
          new Set(scopedCards.map((card) => card.topicId)).size,
          "Thema",
          "Themen",
        )}. Sammle alles, was heute ueber Semester und Module hinweg offen ist.`
      : "Aktuell ist ueber alle Semester hinweg keine Karte faellig. Fuer freies Lernen kannst du zur Auswahl wechseln.";
    return;
  }

  if (isPastSemesterScope()) {
    const currentSemester = getCurrentSemesterSummary();
    const moduleCount = new Set(scopedCards.map((card) => card.moduleId)).size;

    elements.heroTitle.textContent = "Alte Semester mischen";
    elements.heroCopy.textContent = scopedCards.length
      ? `${currentSemester?.label ?? "Aktuelles Semester"} als aktueller Stand · ${pluralize(
          scopedCards.length,
          "Karte",
          "Karten",
        )} aus frueheren Semestern · ${pluralize(
          moduleCount,
          "Modul",
          "Module",
        )}. Wiederhole alte Inhalte ohne Modulgrenzen.`
      : "Noch sind keine Karten aus alten Semestern hinterlegt. Sobald fruehere Module dazukommen, entsteht hier die gemischte Wiederholung.";
    return;
  }

  if (!scopedCards.length) {
    elements.heroTitle.textContent = "Karteikarten Trainer";
    elements.heroCopy.textContent =
      "Waehle ein Semester mit Modulen oder lege neue Karten im Datenmodell an.";
    return;
  }

  elements.heroTitle.textContent = moduleScopeTitle;
  elements.heroCopy.textContent = `${selectedSemester.label} · ${pluralize(
    scopedCards.length,
    "Karteikarte",
    "Karteikarten",
  )} · ${pluralize(
    new Set(scopedCards.map((card) => card.topicId)).size,
    "Thema",
    "Themen",
  )}. Lerne mit Selbstabfrage, Leitner-Logik und lokal gespeichertem Lernstand.`;
}

function renderSemesterButton(semester) {
  const semesterCards = cards.filter((card) => card.semesterId === semester.id);
  const stats = getProgressStatsForCards(semesterCards);
  const detail = semester.moduleCount
    ? `${pluralize(semester.moduleCount, "Modul", "Module")} · ${pluralize(
        semester.topicCount,
        "Thema",
        "Themen",
      )}`
    : "Noch keine Module eingetragen";
  const cardCopy = getSemesterPillLabel(semester);
  const isSelected = isSelectionScope() && semester.id === state.filters.semesterId;
  const isDisabled = semester.cardCount === 0;
  const progressMarkup = semester.cardCount
    ? `
      <span class="study-progress-track" aria-hidden="true">
        <span style="width: ${stats.masteredRate}%;"></span>
      </span>
      <span class="study-metrics">
        <span>${stats.dueCount} faellig</span>
        <span>${stats.masteredCount} sicher</span>
        <span>${stats.weakCount} kritisch</span>
        <span>${stats.confidenceRate}% Quote</span>
      </span>
    `
    : "";

  return `
    <button
      class="study-item ${semester.cardCount ? "has-progress" : ""} ${
        isSelected ? "selected" : ""
      }"
      data-semester-id="${escapeHtml(semester.id)}"
      type="button"
      ${isDisabled ? "disabled" : ""}
    >
      <span class="study-item-top">
        <span>
          <strong>${escapeHtml(semester.label)}</strong>
          <span>${escapeHtml(detail)}</span>
        </span>
        <span class="pill">${escapeHtml(cardCopy)}</span>
      </span>
      ${progressMarkup}
    </button>
  `;
}

function renderModuleFilters(modules) {
  if (!modules.length) {
    return '<p class="empty-copy">Noch keine Module fuer dieses Semester.</p>';
  }

  const selectedSemester = getSelectedSemesterSummary();
  const semesterCards = cards.filter(
    (card) => card.semesterId === selectedSemester?.id,
  );
  const allModules = {
    id: "all",
    title: "Alle Module",
    shortTitle: "Alle Module",
    cardCount: semesterCards.length,
    topicCount: new Set(semesterCards.map((card) => card.topicId)).size,
  };
  const allButton = renderModuleFilterButton(allModules, semesterCards);
  const moduleButtons = modules
    .map((module) =>
      renderModuleFilterButton(
        module,
        cards.filter(
          (card) =>
            card.semesterId === module.semesterId && card.moduleId === module.id,
        ),
      ),
    )
    .join("");

  return `<div class="module-list">${allButton}${moduleButtons}</div>`;
}

function renderModuleFilterButton(module, moduleCards) {
  const stats = getProgressStatsForCards(moduleCards);
  const isSelected = isSelectionScope() && state.filters.moduleId === module.id;

  return `
    <button
      class="module-card ${isSelected ? "selected" : ""}"
      data-module-id="${escapeHtml(module.id)}"
      type="button"
    >
      <span class="module-card-top">
        <span>
          <strong>${escapeHtml(module.shortTitle)}</strong>
          <span class="module-detail">${pluralize(
            module.cardCount,
            "Karte",
            "Karten",
          )} · ${pluralize(module.topicCount, "Thema", "Themen")}</span>
        </span>
        <span class="pill">${stats.masteredRate}% sicher</span>
      </span>
      <span class="module-progress-track" aria-hidden="true">
        <span style="width: ${stats.masteredRate}%;"></span>
      </span>
      <span class="module-metrics">
        <span>${stats.dueCount} faellig</span>
        <span>${stats.masteredCount} sicher</span>
        <span>${stats.confidenceRate}% Quote</span>
      </span>
    </button>
  `;
}

function getSemesterPillLabel(semester) {
  if (semester.cardCount) {
    return `${semester.cardCount} Karten`;
  }

  if (semester.status === "current") {
    return "aktuell";
  }

  return "geplant";
}

function getProgressStatsForCards(scopeCards) {
  const totalCards = scopeCards.length;
  const dueCount = scopeCards.filter((card) => isCardDue(card.id)).length;
  const weakCount = scopeCards.filter((card) => isWeakCard(card.id)).length;
  const masteredCount = scopeCards.filter(
    (card) => state.progress[card.id].box >= 4,
  ).length;
  const successfulReviews = scopeCards.reduce(
    (sum, card) => sum + state.progress[card.id].easyCount,
    0,
  );
  const totalReviews = scopeCards.reduce((sum, card) => {
    const progress = state.progress[card.id];
    return sum + progress.easyCount + progress.hardCount + progress.againCount;
  }, 0);

  return {
    dueCount,
    weakCount,
    masteredCount,
    masteredRate: totalCards ? Math.round((masteredCount / totalCards) * 100) : 0,
    confidenceRate: totalReviews
      ? Math.round((successfulReviews / totalReviews) * 100)
      : 0,
    totalReviews,
  };
}

function attachEvents() {
  elements.studyOverview.addEventListener("click", (event) => {
    const semesterButton = event.target.closest("[data-semester-id]");
    if (semesterButton) {
      state.filters.semesterId = semesterButton.dataset.semesterId;
      state.filters.moduleId = "all";
      state.filters.scope = "selection";
      resetCategoryFiltersToScope();
      rebuildQueue();
      render();
      return;
    }

    const moduleButton = event.target.closest("[data-module-id]");
    if (!moduleButton) {
      return;
    }

    state.filters.moduleId = moduleButton.dataset.moduleId;
    state.filters.scope = "selection";
    resetCategoryFiltersToScope();
    rebuildQueue();
    render();
  });

  elements.sessionActionButton.addEventListener("click", () => {
    if (!state.currentCardId) {
      return;
    }

    elements.flashcard.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
    elements.flashcard.focus();
  });

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

    const wasSelectionScope = isSelectionScope();
    state.filters.scope = "selection";
    state.filters.mode = button.dataset.mode;
    if (!wasSelectionScope) {
      resetCategoryFiltersToScope();
    }
    rebuildQueue();
    render();
  });

  elements.scopeSelector.addEventListener("click", (event) => {
    const button = event.target.closest("[data-scope]");
    if (!button) {
      return;
    }

    state.filters.scope = button.dataset.scope;
    if (isGlobalDueScope()) {
      state.filters.mode = "due";
    } else if (isPastSemesterScope()) {
      state.filters.mode = "all";
    }
    resetCategoryFiltersToScope();
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

  elements.importButton.addEventListener("click", () => {
    elements.importFileInput.click();
  });

  elements.importFileInput.addEventListener("change", () => {
    handleImportFile(elements.importFileInput.files?.[0]);
  });

  elements.clearImportsButton.addEventListener("click", () => {
    const importCardCount = flattenStudyData(importedStudyData).length;
    if (!importCardCount) {
      return;
    }

    const shouldClear = window.confirm(
      "Willst du alle lokal importierten Karteikarten entfernen?",
    );

    if (!shouldClear) {
      return;
    }

    importedStudyData = [];
    storage.removeItem(IMPORT_STORAGE_KEY);
    state.importMessage = "Lokale Importe entfernt.";
    rebuildStudyDataFromImports();
  });

  elements.exportImportsButton.addEventListener("click", exportImportedContent);
  elements.exportProgressButton.addEventListener("click", exportLearningProgress);

  elements.topicInsights.addEventListener("click", (event) => {
    const allTopicsButton = event.target.closest("[data-topic-filter='all']");
    if (allTopicsButton) {
      resetCategoryFiltersToScope();
      rebuildQueue();
      render();
      return;
    }

    const topicButton = event.target.closest("[data-topic-category]");
    if (!topicButton) {
      return;
    }

    state.filters.categories = new Set([topicButton.dataset.topicCategory]);
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
    const migrated = { ...fallback };
    cards.forEach((card) => {
      const legacyEntry =
        card.legacyId === undefined ? undefined : parsed[String(card.legacyId)];
      const savedEntry = parsed[card.id] ?? legacyEntry;
      const entry = {
        ...fallback[card.id],
        ...(savedEntry ?? {}),
      };
      if (entry.lastReviewedDate !== TODAY_KEY) {
        entry.reviewedToday = 0;
      }
      migrated[card.id] = entry;
    });
    return migrated;
  } catch {
    return fallback;
  }
}

function saveProgress() {
  storage.setItem(STORAGE_KEY, JSON.stringify(state.progress));
}

function handleImportFile(file) {
  if (!file) {
    return;
  }

  const reader = new FileReader();

  reader.addEventListener("load", () => {
    try {
      const importedSemesters = normalizeImportedPayload(
        JSON.parse(String(reader.result)),
      );
      const importedCardCount = flattenStudyData(importedSemesters).length;

      importedStudyData = mergeStudyData(importedStudyData, importedSemesters);
      saveImportedStudyData();
      state.importMessage = `${pluralize(
        importedCardCount,
        "Karte",
        "Karten",
      )} aus ${file.name} verarbeitet.`;
      rebuildStudyDataFromImports();
    } catch (error) {
      state.importMessage = `Import nicht moeglich: ${error.message}`;
      renderImportStatus();
    } finally {
      elements.importFileInput.value = "";
    }
  });

  reader.addEventListener("error", () => {
    state.importMessage = "Import nicht moeglich: Datei konnte nicht gelesen werden.";
    renderImportStatus();
    elements.importFileInput.value = "";
  });

  reader.readAsText(file);
}

function exportImportedContent() {
  const importCardCount = flattenStudyData(importedStudyData).length;

  if (!importCardCount) {
    state.importMessage = "Keine lokalen Importe zum Exportieren.";
    renderImportStatus();
    return;
  }

  downloadJson(
    {
      type: "karteikarten-importe",
      version: 1,
      exportedAt: new Date().toISOString(),
      cardCount: importCardCount,
      semesters: importedStudyData,
    },
    buildExportFileName("karteikarten-importe"),
  );
  state.importMessage = `${pluralize(
    importCardCount,
    "importierte Karte",
    "importierte Karten",
  )} als JSON vorbereitet.`;
  renderImportStatus();
}

function exportLearningProgress() {
  const progressSnapshot = Object.fromEntries(
    cards.map((card) => [card.id, state.progress[card.id]]),
  );

  downloadJson(
    {
      type: "karteikarten-lernstand",
      version: 1,
      exportedAt: new Date().toISOString(),
      cardCount: cards.length,
      progress: progressSnapshot,
    },
    buildExportFileName("karteikarten-lernstand"),
  );
  state.importMessage = `Lernstand fuer ${pluralize(
    cards.length,
    "Karte",
    "Karten",
  )} als JSON vorbereitet.`;
  renderImportStatus();
}

function downloadJson(payload, fileName) {
  const blob = new Blob([`${JSON.stringify(payload, null, 2)}\n`], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = fileName;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function buildExportFileName(prefix) {
  return `${prefix}-${getLocalDateKey(new Date())}.json`;
}

function renderImportStatus() {
  const importCardCount = flattenStudyData(importedStudyData).length;
  const projectCardCount = flattenStudyData(projectStudyData).length;
  const projectStatus = projectImportIssues.length
    ? `Projektkarten teilweise geladen: ${projectImportIssues[0]}`
    : projectCardCount
      ? `${pluralize(
          projectCardCount,
          "Projektkarte",
          "Projektkarten",
        )} aus JSON-Dateien geladen.`
      : "Keine Projektkarten geladen.";

  elements.importCount.textContent = importCardCount
    ? pluralize(importCardCount, "Karte", "Karten")
    : projectCardCount
      ? `${projectCardCount} Projekt`
    : "0 Karten";
  elements.importStatus.textContent =
    state.importMessage ||
    [
      projectStatus,
      importCardCount
        ? `${pluralize(importCardCount, "Karte", "Karten")} lokal importiert.`
        : "Keine lokalen Importe.",
    ].join(" ");
  elements.clearImportsButton.disabled = importCardCount === 0;
  elements.exportImportsButton.disabled = importCardCount === 0;
  elements.exportProgressButton.disabled = cards.length === 0;
}

function renderCategoryFilters() {
  const categories = [...new Set(getStudyScopedCards().map((card) => card.category))];

  if (!categories.length) {
    elements.categoryFilters.innerHTML =
      '<p class="empty-copy">Noch keine Themen fuer diese Auswahl.</p>';
    return;
  }

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

function renderTopicInsights(scopedCards) {
  const topicInsights = getTopicInsights(scopedCards);
  const weakTopicCount = topicInsights.filter(
    (topic) => topic.status.key === "weak",
  ).length;
  const allTopicsActive = topicInsights.every((topic) =>
    state.filters.categories.has(topic.category),
  );

  elements.topicInsightCount.textContent = `${weakTopicCount} kritisch`;

  if (!topicInsights.length) {
    elements.topicInsights.innerHTML =
      '<p class="empty-copy">Noch keine Themen fuer diese Auswahl.</p>';
    return;
  }

  elements.topicInsights.innerHTML = `
    <button
      class="topic-reset ${allTopicsActive ? "selected" : ""}"
      data-topic-filter="all"
      type="button"
    >
      Alle Themen
    </button>
    ${topicInsights.map((topic) => renderTopicInsight(topic)).join("")}
  `;
}

function getTopicInsights(scopeCards) {
  const topics = new Map();

  scopeCards.forEach((card) => {
    if (!topics.has(card.topicId)) {
      topics.set(card.topicId, {
        id: card.topicId,
        title: card.topicTitle,
        category: card.category,
        cards: [],
      });
    }

    topics.get(card.topicId).cards.push(card);
  });

  return [...topics.values()]
    .map((topic) => {
      const stats = getProgressStatsForCards(topic.cards);
      return {
        ...topic,
        stats,
        status: getTopicStatus(stats),
        isSelected: state.filters.categories.has(topic.category),
      };
    })
    .sort((left, right) => {
      if (left.status.rank !== right.status.rank) {
        return left.status.rank - right.status.rank;
      }

      if (left.stats.dueCount !== right.stats.dueCount) {
        return right.stats.dueCount - left.stats.dueCount;
      }

      return left.title.localeCompare(right.title, "de");
    });
}

function getTopicStatus(stats) {
  if (stats.weakCount > 0) {
    return { key: "weak", label: "unsicher", rank: 1 };
  }

  if (stats.dueCount > 0) {
    return { key: "due", label: "faellig", rank: 2 };
  }

  if (stats.masteredRate >= 80) {
    return { key: "stable", label: "stabil", rank: 4 };
  }

  return { key: "open", label: "offen", rank: 3 };
}

function renderTopicInsight(topic) {
  const { stats, status } = topic;

  return `
    <button
      class="topic-card ${topic.isSelected ? "selected" : ""} ${status.key}"
      data-topic-category="${escapeHtml(topic.category)}"
      type="button"
    >
      <span class="topic-card-top">
        <strong>${escapeHtml(topic.title)}</strong>
        <span class="pill">${escapeHtml(status.label)}</span>
      </span>
      <span class="module-progress-track" aria-hidden="true">
        <span style="width: ${stats.masteredRate}%;"></span>
      </span>
      <span class="topic-metrics">
        <span>${topic.cards.length} Karten</span>
        <span>${stats.dueCount} faellig</span>
        <span>${stats.weakCount} unsicher</span>
        <span>${stats.masteredRate}% sicher</span>
      </span>
    </button>
  `;
}

function rebuildQueue() {
  const availableCards = cards.filter((card) => isCardVisible(card));
  const dueCards = availableCards.filter((card) => isCardDue(card.id));
  const weakCards = availableCards.filter((card) => isWeakCard(card.id));

  let nextQueue;

  if (isGlobalDueScope()) {
    nextQueue = dueCards;
  } else if (isPastSemesterScope()) {
    nextQueue = availableCards;
  } else if (state.filters.mode === "due") {
    nextQueue = dueCards.length ? dueCards : availableCards;
  } else if (state.filters.mode === "weak") {
    nextQueue = weakCards.length ? weakCards : availableCards;
  } else {
    nextQueue = availableCards;
  }

  state.queue = isPastSemesterScope()
    ? buildMixedQueueIds(nextQueue)
    : nextQueue
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

function buildMixedQueueIds(scopeCards) {
  const cardsByTopic = new Map();
  const sortedCards = scopeCards
    .slice()
    .sort((left, right) => state.order.indexOf(left.id) - state.order.indexOf(right.id));

  sortedCards.forEach((card) => {
    const key = `${card.semesterId}:${card.moduleId}:${card.topicId}`;

    if (!cardsByTopic.has(key)) {
      cardsByTopic.set(key, []);
    }

    cardsByTopic.get(key).push(card);
  });

  const topicQueues = [...cardsByTopic.values()];
  const mixedIds = [];
  let hasMoreCards = true;

  while (hasMoreCards) {
    hasMoreCards = false;

    topicQueues.forEach((topicQueue) => {
      const nextCard = topicQueue.shift();

      if (nextCard) {
        mixedIds.push(nextCard.id);
        hasMoreCards = true;
      }
    });
  }

  return mixedIds;
}

function render() {
  renderStudyContext();
  const currentCard = cards.find((card) => card.id === state.currentCardId);
  const scopedCards = getStudyScopedCards();
  const sessionCards = scopedCards.filter((card) =>
    state.filters.categories.has(card.category),
  );
  const dueCount = sessionCards.filter((card) => isCardDue(card.id)).length;
  const reviewedToday = sessionCards.reduce(
    (sum, card) => sum + state.progress[card.id].reviewedToday,
    0,
  );
  const masteredCount = sessionCards.filter((card) => state.progress[card.id].box >= 4)
    .length;
  const successfulReviews = sessionCards.reduce(
    (sum, card) => sum + state.progress[card.id].easyCount,
    0,
  );
  const totalReviews = sessionCards.reduce((sum, card) => {
    const progress = state.progress[card.id];
    return sum + progress.easyCount + progress.hardCount + progress.againCount;
  }, 0);
  const activeCategories = state.filters.categories.size;
  const activeTopicCount = new Set(sessionCards.map((card) => card.topicId)).size;

  elements.dueCount.textContent = dueCount;
  elements.reviewedToday.textContent = reviewedToday;
  elements.masteredCount.textContent = masteredCount;
  elements.confidenceRate.textContent = totalReviews
    ? `${Math.round((successfulReviews / totalReviews) * 100)}%`
    : "0%";
  elements.categoryCount.textContent = `${activeCategories} aktiv`;
  elements.modePill.textContent = getScopeModePillLabel();
  elements.schedulePreview.textContent = state.scheduleText;
  renderSessionStart({
    activeCategories,
    activeTopicCount,
    currentCard,
    dueCount,
    scopedCards,
    sessionCards,
  });
  renderTopicInsights(scopedCards);
  renderImportStatus();

  [...elements.modeSelector.querySelectorAll("[data-mode]")].forEach((button) => {
    button.classList.toggle("active", button.dataset.mode === state.filters.mode);
  });
  [...elements.scopeSelector.querySelectorAll("[data-scope]")].forEach((button) => {
    button.classList.toggle("active", button.dataset.scope === state.filters.scope);
  });

  if (!currentCard) {
    elements.progressCopy.textContent = getEmptySessionProgressCopy();
    elements.sessionTitle.textContent = "Session geschafft";
    elements.cardNumber.textContent = "Keine Karte";
    elements.cardModule.textContent = "Kein Modul";
    elements.cardCategory.textContent = "Pause";
    elements.cardFront.textContent = getEmptySessionFrontCopy();
    elements.cardBack.innerHTML = `<p>${escapeHtml(getEmptySessionBackCopy())}</p>`;
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
  elements.cardNumber.textContent = `Karte ${currentCard.displayNumber}`;
  elements.cardModule.textContent = `${currentCard.semesterLabel} · ${currentCard.moduleShortTitle}`;
  elements.cardCategory.textContent = currentCard.topicTitle;
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

function renderSessionStart({
  activeCategories,
  activeTopicCount,
  currentCard,
  dueCount,
  scopedCards,
  sessionCards,
}) {
  const selectedSemester = getSelectedSemesterSummary();
  const selectedModule = getSelectedModuleSummary();
  const moduleLabel = selectedModule?.shortTitle ?? "Alle Module";
  const sessionCount = state.queue.length;
  const scopeLabel = getSessionScopeLabel(selectedSemester, moduleLabel);
  const modeLabel = getSessionModeLabel();
  const totalTopicCount = new Set(scopedCards.map((card) => card.topicId)).size;
  const categoryCopy = !totalTopicCount
    ? "keine Themen"
    : activeCategories === totalTopicCount
      ? "alle Themen"
      : pluralize(activeCategories, "Thema", "Themen");

  elements.sessionScope.textContent = scopeLabel;
  elements.sessionStatusPill.textContent = sessionCount
    ? pluralize(sessionCount, "Karte", "Karten")
    : "Keine Karten";
  elements.sessionDetail.textContent = `${modeLabel} · ${categoryCopy} · ${pluralize(
    sessionCards.length,
    "Karte im Filter",
    "Karten im Filter",
  )}`;
  elements.sessionQueueCount.textContent = sessionCount;
  elements.sessionTopicCount.textContent = activeTopicCount;
  elements.sessionDueInline.textContent = dueCount;
  elements.sessionActionButton.disabled = !currentCard;
  elements.sessionActionButton.textContent = currentCard
    ? "Weiterlernen"
    : "Keine Karte offen";
}

function getScopeModePillLabel() {
  if (isGlobalDueScope()) {
    return "Alle faelligen";
  }

  if (isPastSemesterScope()) {
    return "Alte Semester";
  }

  return getModeLabel(state.filters.mode);
}

function getSessionScopeLabel(selectedSemester, moduleLabel) {
  if (isGlobalDueScope()) {
    return "Alle faelligen Karten";
  }

  if (isPastSemesterScope()) {
    return "Alte Semester";
  }

  return `${selectedSemester?.label ?? "Semester"} · ${moduleLabel}`;
}

function getSessionModeLabel() {
  if (isGlobalDueScope()) {
    return "Studium gesamt";
  }

  if (isPastSemesterScope()) {
    return "Gemischte Wiederholung";
  }

  return getModeLabel(state.filters.mode);
}

function getEmptySessionProgressCopy() {
  if (isGlobalDueScope()) {
    return "Aktuell ist ueber alle Semester hinweg keine Karte faellig.";
  }

  if (isPastSemesterScope()) {
    return "Noch gibt es keine Karten aus alten Semestern fuer diese Wiederholung.";
  }

  return "Alle Karten fuer diese Auswahl sind erledigt. Du kannst den Stapel mischen oder den Filter wechseln.";
}

function getEmptySessionFrontCopy() {
  if (isGlobalDueScope()) {
    return "Heute ist keine globale Wiederholung offen.";
  }

  if (isPastSemesterScope()) {
    return "Noch keine alte Wiederholung offen.";
  }

  return "Sehr gut. Fuer diesen Filter bist du fertig.";
}

function getEmptySessionBackCopy() {
  if (isGlobalDueScope()) {
    return "Wechsle zur Auswahl, wenn du trotzdem frei lernen moechtest.";
  }

  if (isPastSemesterScope()) {
    return "Sobald fruehere Semester Karten enthalten, mischt die App sie hier thematisch durch.";
  }

  return "Wechsle den Modus, aktiviere weitere Kategorien oder setze den Lernstand zurueck.";
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
  const matchesSemester =
    !state.filters.semesterId || card.semesterId === state.filters.semesterId;
  const matchesModule =
    state.filters.moduleId === "all" || card.moduleId === state.filters.moduleId;
  const matchesStudyScope = isGlobalDueScope()
    ? isCardDue(card.id)
    : isPastSemesterScope()
      ? isPastSemesterCard(card)
    : matchesSemester && matchesModule;
  const matchesCategory = state.filters.categories.has(card.category);

  return matchesStudyScope && matchesCategory;
}

function isCardDue(cardId) {
  return state.progress[cardId].dueDate <= TODAY_KEY;
}

function isWeakCard(cardId) {
  const progress = state.progress[cardId];
  return progress.againCount > 0 || progress.hardCount > progress.easyCount;
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

function pluralize(count, singular, plural) {
  return `${count} ${count === 1 ? singular : plural}`;
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

function getStringValue(value) {
  if (value === undefined || value === null) {
    return null;
  }

  const stringValue = String(value).trim();

  return stringValue || null;
}

function slugify(value) {
  const fallback = getStringValue(value) ?? "";

  return fallback
    .toLowerCase()
    .replaceAll("ä", "ae")
    .replaceAll("ö", "oe")
    .replaceAll("ü", "ue")
    .replaceAll("ß", "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
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
