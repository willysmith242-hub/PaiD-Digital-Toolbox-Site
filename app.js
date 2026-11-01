(() => {
  const search = document.getElementById("tool-search");
  const filters = [...document.querySelectorAll(".filter-chip")];
  const empty = document.getElementById("empty-state");
  const trayHost = document.getElementById("tool-trays");
  const trayDefinitions = {
    engineering: { title: "Engineering tray", icon: "⚙", description: "Measurements, calculations, technical references and engineering work." },
    documents: { title: "Documents & PDF tray", icon: "▤", description: "PDF tools, document handling and drawing conversion." },
    design: { title: "CAD & design tray", icon: "▱", description: "2D drawings, 3D design and CAD software." },
    productivity: { title: "Productivity tray", icon: "✳", description: "Everyday calculators, office tools and work helpers." }
  };
  const cards = [...trayHost.querySelectorAll(".tool-card")];
  const trays = new Map();
  for (const [category, definition] of Object.entries(trayDefinitions)) {
    const section = document.createElement("section");
    section.className = "tool-tray";
    section.dataset.tray = category;
    const heading = document.createElement("div");
    heading.className = "tool-tray-heading";
    const title = document.createElement("h3");
    title.textContent = definition.icon + "  " + definition.title;
    const description = document.createElement("p");
    description.textContent = definition.description;
    heading.append(title, description);
    const grid = document.createElement("div");
    grid.className = "tool-tray-grid";
    section.append(heading, grid);
    trayHost.append(section);
    trays.set(category, { section, grid });
  }
  cards.forEach(card => {
    const tray = trays.get(card.dataset.category);
    if (tray) tray.grid.append(card);
  });

  function filterCards() {
    const query = (search.value || "").trim().toLowerCase();
    let visible = 0;
    cards.forEach(card => {
      const haystack = (card.dataset.search + " " + card.textContent).toLowerCase();
      const matches = (activeFilter === "all" || card.dataset.category === activeFilter) && haystack.includes(query);
      card.hidden = !matches;
      if (matches) visible++;
    });
    empty.hidden = visible !== 0;\n    trays.forEach(({ section, grid }) => { section.hidden = ![...grid.querySelectorAll(".tool-card")].some(card => !card.hidden); });
  }
  search.addEventListener("input", filterCards);
  filters.forEach(button => button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;
    filters.forEach(item => {
      const selected = item === button;
      item.classList.toggle("active", selected);
      item.setAttribute("aria-pressed", String(selected));
    });
    filterCards();
  }));
  document.addEventListener("keydown", event => {
    if (event.key === "/" && !["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement.tagName)) {
      event.preventDefault();
      search.focus();
    }
    if (event.key === "Escape" && document.activeElement === search) {
      search.value = "";
      filterCards();
      search.blur();
    }
  });

  const unitLabels = { mm: "mm", cm: "cm", m: "m", km: "km", in: "in", ft: "ft", kg: "kg", lb: "lb", c: "°C", f: "°F" };
  const factors = { mm: ["length", 0.001], cm: ["length", 0.01], m: ["length", 1], km: ["length", 1000], in: ["length", 0.0254], ft: ["length", 0.3048], kg: ["mass", 1], lb: ["mass", 0.45359237] };
  const unitValue = document.getElementById("unit-value");
  const unitFrom = document.getElementById("unit-from");
  const unitTo = document.getElementById("unit-to");
  const unitResult = document.getElementById("unit-result");

  function convert() {
    const value = Number(unitValue.value);
    const from = unitFrom.value;
    const to = unitTo.value;
    if (unitValue.value.trim() === "" || !Number.isFinite(value)) {
      unitResult.textContent = "Enter a valid number";
      return;
    }
    let result;
    if (from === to) result = value;
    else if (from === "c" && to === "f") result = value * 9 / 5 + 32;
    else if (from === "f" && to === "c") result = (value - 32) * 5 / 9;
    else if (factors[from] && factors[to] && factors[from][0] === factors[to][0]) {
      result = value * factors[from][1] / factors[to][1];
    } else {
      unitResult.textContent = "Incompatible units";
      return;
    }
    const formatted = new Intl.NumberFormat(undefined, { maximumFractionDigits: 6 }).format(result);
    unitResult.textContent = formatted + " " + unitLabels[to];
  }
  [unitValue, unitFrom, unitTo].forEach(element => element.addEventListener("input", convert));
  document.getElementById("unit-swap").addEventListener("click", () => {
    const previousFrom = unitFrom.value;
    unitFrom.value = unitTo.value;
    unitTo.value = previousFrom;
    convert();
  });

  const percentRate = document.getElementById("percent-rate");
  const percentBase = document.getElementById("percent-base");
  const percentResult = document.getElementById("percent-result");
  function calculatePercent() {
    if (percentRate.value.trim() === "" || percentBase.value.trim() === "") {
      percentResult.textContent = "Enter both values";
      return;
    }
    const result = Number(percentRate.value) / 100 * Number(percentBase.value);
    percentResult.textContent = Number.isFinite(result)
      ? new Intl.NumberFormat(undefined, { maximumFractionDigits: 6 }).format(result)
      : "Enter valid numbers";
  }
  [percentRate, percentBase].forEach(element => element.addEventListener("input", calculatePercent));
  document.getElementById("unit-form").addEventListener("submit", event => event.preventDefault());
  document.getElementById("percent-form").addEventListener("submit", event => event.preventDefault());
  convert();
  calculatePercent();

  // Register offline caching on HTTPS hosts such as GitHub Pages.
  if ("serviceWorker" in navigator && location.protocol === "https:") {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./service-worker.js").catch(error => {
        console.warn("PaiD offline cache could not be registered:", error);
      });
    });
  }
})();