(function () {
  const current = window.productModel;
  const root = document.getElementById("root");
  let imageIndex = 0;
  let unit = "inch";

  const savedTheme = localStorage.getItem("eagleSafeTheme");
  if (savedTheme === "night") document.body.classList.add("night-theme");

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"]/g, (match) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[match]));
  }

  function inchToFt(value) {
    return String(value).replace(/(\d+(?:\.\d+)?)\s*Inch/gi, (_, number) => (Number(number) / 12).toFixed(1) + " Ft");
  }

  function displayValue(value) {
    return unit === "ft" ? inchToFt(value) : value;
  }

  function tableMarkup(title, headers, rows) {
    if (!rows || !rows.length) return "";
    return (
      '<div class="spec-table-block"><h3 class="spec-table-title">' +
      escapeHtml(title) +
      '</h3><table class="spec-table"><thead><tr>' +
      headers.map((header) => "<th>" + escapeHtml(header) + "</th>").join("") +
      "</tr></thead><tbody>" +
      rows.map((row) => "<tr>" + row.map((cell) => "<td>" + escapeHtml(displayValue(cell || "")) + "</td>").join("") + "</tr>").join("") +
      "</tbody></table></div>"
    );
  }

  function dimensionRows() {
    const rows = (current.spec.dimensions || []).map((item) => [item.label, item.outer, item.inner]);
    const hasInner = rows.some((row) => String(row[2] || "").trim());
    return { headers: hasInner ? ["Specification", "Outer", "Inner"] : ["Specification", "Outer"], rows: hasInner ? rows : rows.map((row) => [row[0], row[1]]) };
  }

  function randomSuggestions() {
    const catalogue = (window.eagleSafeProducts || []).filter((product) => product.model !== current.model);
    for (let index = catalogue.length - 1; index > 0; index -= 1) {
      const next = Math.floor(Math.random() * (index + 1));
      [catalogue[index], catalogue[next]] = [catalogue[next], catalogue[index]];
    }
    return catalogue.slice(0, Math.min(12, catalogue.length));
  }

  function suggestionMarkup() {
    const suggestions = randomSuggestions();
    if (!suggestions.length) return "";
    return (
      '<section class="suggestions" aria-labelledby="suggestions-title"><div class="suggestions-header"><h2 id="suggestions-title">You May Also Like</h2><div class="suggestion-controls"><button class="suggestion-button suggestion-left" type="button" aria-label="Previous suggestions">&lt;</button><button class="suggestion-button suggestion-right" type="button" aria-label="Next suggestions">&gt;</button></div></div><div class="suggestion-row">' +
      suggestions
        .map(
          (product) =>
            '<a class="suggestion-card" href="../../../' +
            escapeHtml(product.page) +
            '"><div class="suggestion-image-wrap"><img class="suggestion-image" src="../../../' +
            escapeHtml(product.image) +
            '" alt="' +
            escapeHtml(product.model) +
            ' safe locker"></div><p>' +
            escapeHtml(product.model) +
            "</p></a>",
        )
        .join("") +
      "</div></section>"
    );
  }

  function draw() {
    const dimensions = dimensionRows();
    document.title = current.model + " Safe Locker | EAGLE SAFE";
    root.innerHTML =
      '<header class="page-header"><a class="brand-link" href="../../../index.html">EAGLE SAFE</a><a class="back-link" href="../../../product.html">Back to Products</a></header><main class="model-page"><h1 class="model-title">' +
      escapeHtml(current.model) +
      '</h1><div class="model-layout"><section class="gallery"><div class="gallery-frame"><div class="gallery-track" style="transform:translateX(-' +
      imageIndex * 100 +
      '%)">' +
      current.images
        .map((image, index) => '<div class="gallery-slide"><img class="gallery-image" src="' + escapeHtml(image) + '" alt="' + escapeHtml(current.model) + " product view " + (index + 1) + '"></div>')
        .join("") +
      '</div><button class="zoom-button" type="button">Zoom</button><button class="gallery-button previous" type="button">&lt;</button><button class="gallery-button next" type="button">&gt;</button></div><div class="gallery-dots">' +
      current.images.map((image, index) => '<button class="gallery-dot ' + (imageIndex === index ? "active" : "") + '" type="button" data-index="' + index + '"></button>').join("") +
      '</div></section><section class="details-panel"><div class="details-header"><h2 class="details-title">Specification</h2><button class="unit-toggle" type="button">' +
      (unit === "inch" ? "Convert Inch to Ft" : "Show Inches") +
      "</button></div>" +
      tableMarkup("Dimensions", dimensions.headers, dimensions.rows) +
      tableMarkup("Details", ["Specification", "Value"], (current.spec.details || []).map((item) => [item.label, item.value])) +
      tableMarkup("Outside Lock Types", ["Lock Type", "Qty"], (current.spec.outsideLocks || []).map((item) => [item.label, item.value])) +
      tableMarkup("Inside Lock Types", ["Lock Type", "Qty"], (current.spec.insideLocks || []).map((item) => [item.label, item.value])) +
      '<p class="disclaimer">' +
      escapeHtml(current.spec.disclaimer || "") +
      '</p><h3 class="enquiry-title">For Book or Enquiry</h3><div class="action-buttons"><a class="action-button call-button" href="tel:+919057077915">Call +91 9057077915</a><a class="action-button whatsapp-button" href="https://wa.me/919057077915?text=' +
      encodeURIComponent("I Want to Know More About Model " + current.model) +
      '" target="_blank" rel="noreferrer">Whatsapp 9057077915</a></div></section></div>' +
      suggestionMarkup() +
      '</main><div class="zoom-overlay" hidden><button class="zoom-close" type="button">x</button><img class="zoom-image" src="' +
      escapeHtml(current.images[imageIndex]) +
      '" alt="Large ' +
      escapeHtml(current.model) +
      ' product view"></div><button class="theme-toggle" type="button" aria-label="Toggle day or night theme">Night Mode</button>';
    bindEvents();
  }

  function bindEvents() {
    const themeToggle = root.querySelector(".theme-toggle");
    function updateThemeButton() {
      themeToggle.textContent = document.body.classList.contains("night-theme") ? "Day Mode" : "Night Mode";
    }
    themeToggle?.addEventListener("click", () => {
      document.body.classList.toggle("night-theme");
      localStorage.setItem("eagleSafeTheme", document.body.classList.contains("night-theme") ? "night" : "day");
      updateThemeButton();
    });
    updateThemeButton();
    root.querySelector(".previous").onclick = () => {
      imageIndex = imageIndex === 0 ? current.images.length - 1 : imageIndex - 1;
      draw();
    };
    root.querySelector(".next").onclick = () => {
      imageIndex = (imageIndex + 1) % current.images.length;
      draw();
    };
    root.querySelectorAll(".gallery-dot").forEach((dot) => {
      dot.onclick = () => {
        imageIndex = Number(dot.dataset.index);
        draw();
      };
    });
    root.querySelector(".unit-toggle").onclick = () => {
      unit = unit === "inch" ? "ft" : "inch";
      draw();
    };
    root.querySelector(".zoom-button").onclick = () => {
      root.querySelector(".zoom-overlay").hidden = false;
    };
    root.querySelector(".zoom-close").onclick = () => {
      root.querySelector(".zoom-overlay").hidden = true;
    };
    const suggestionRow = root.querySelector(".suggestion-row");
    root.querySelector(".suggestion-left")?.addEventListener("click", () => suggestionRow.scrollBy({ left: -520, behavior: "smooth" }));
    root.querySelector(".suggestion-right")?.addEventListener("click", () => suggestionRow.scrollBy({ left: 520, behavior: "smooth" }));
  }

  draw();
})();
