import fs from "node:fs/promises";
import path from "node:path";
import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const root = process.cwd();
const imageRoot = path.join(root, "image", "product_Image");
const productPagesRoot = path.join(root, "product_pages");
const natural = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" });
const disclaimer =
  "IMAGE IS JUST FOR REFERENCE KINDLY ENQUIRE US OR VISIT OUR STORE FOR MORE INFO ABOUT THE PRODUCT, AND WE ALSO TAKE CUSTOM ORDER";

const categories = [
  { key: "double-door", name: "Double Door", folder: "double_door", workbook: "product_size/double_door/double_door_sizes.xlsx" },
  { key: "large-safe", name: "Large Safe", folder: "large", workbook: "product_size/large/large_safe_sizes.xlsx" },
  { key: "medium-safe", name: "Medium Safe", folder: "medium", workbook: "product_size/medium/medium_safe_sizes.xlsx" },
  { key: "small-safe", name: "Small Safe", folder: "small", workbook: "product_size/small/small_safe_sizes.xlsx" },
  { key: "counter-locker", name: "Counter Locker", folder: "counter_locker", workbook: "product_size/counter_locker/counter_locker.xlsx" },
  { key: "triple-door", name: "Triple Door", folder: "triple_door", workbook: "product_size/triple_door/triple_door.xlsx" },
  { key: "strong-room-door", name: "Strong Room Door", folder: "strong_room_door", workbook: "product_size/strong_room_door/strongroomdoor.xlsx" },
];

const clean = (value) => (value == null ? "" : String(value).trim().replace(/\s+/g, " "));
const title = (value) => clean(value).toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
const number = (value) => {
  const match = clean(value).replace(/,/g, "").match(/-?\d+(?:\.\d+)?/);
  return match ? Number.parseFloat(match[0]) : 0;
};
const inchNumber = (value) => Number.parseFloat(clean(value)) || 0;

function volumeLitres(depth, width, height) {
  const litres = depth * width * height * 0.0163871;
  return Math.max(0, Math.round(litres / 10) * 10);
}

function normalizeModelType(value) {
  const modelType = clean(value).toUpperCase();
  if (modelType.includes("PRIME")) return "DEFENDER PRIME";
  if (modelType.includes("CLASSIC")) return "CLASSIC DEFENDER PLUS";
  if (modelType.includes("DEFENDER PLUS")) return "DEFENDER PLUS";
  return "OTHERS";
}

async function imagesFor(folder, model) {
  const directory = path.join(imageRoot, folder, model);
  try {
    return (await fs.readdir(directory, { withFileTypes: true }))
      .filter((entry) => entry.isFile() && /\.(png|jpe?g|webp|gif)$/i.test(entry.name))
      .map((entry) => entry.name)
      .sort(natural.compare);
  } catch {
    return [];
  }
}

function readSpec(values) {
  const rows = values.map((row) => ({
    label: clean(row[1]),
    outer: clean(row[3] || row[4]),
    inner: clean(row[5]),
    value: clean(row[3] || row[4]),
  }));
  const dimensions = ["DEPTH", "WIDTH", "HEIGHT"].map((label) => {
    const row = rows.find((item) => item.label.toUpperCase() === label);
    return { label: title(label), outer: row?.outer || "", inner: row?.inner || "" };
  }).filter((row) => row.outer || row.inner);
  const dimensionsByName = Object.fromEntries(dimensions.map((item) => [item.label.toLowerCase(), inchNumber(item.outer)]));
  const calculatedVolume = volumeLitres(dimensionsByName.depth, dimensionsByName.width, dimensionsByName.height);
  const hasVolumeDimensions = Boolean(dimensionsByName.depth && dimensionsByName.width && dimensionsByName.height);
  const outsideIndex = rows.findIndex((row) => row.label.toUpperCase() === "OUTSIDE LOCK TYPES");
  const insideIndex = rows.findIndex((row) => row.label.toUpperCase() === "INSIDE LOCK TYPES");
  const disclaimerIndex = rows.findIndex((row, index) => index > insideIndex && row.label.toUpperCase() === "DISCLAIMER");
  const detailSkipLabels = new Set(["DEPTH", "WIDTH", "HEIGHT", "SPECIFICATIONS", "VOLUME"]);
  const rawDetails = rows
    .slice(0, outsideIndex)
    .filter((row) => row.label && row.value && !detailSkipLabels.has(row.label.toUpperCase()));
  const weightRow = rawDetails.find((row) => row.label.toUpperCase() === "WEIGHT");
  const modelTypeRow = rawDetails.find((row) => row.label.toUpperCase() === "MODEL TYPE");
  const details = [];
  for (const row of rawDetails) {
    details.push({ label: title(row.label), value: row.value });
    if (hasVolumeDimensions && row.label.toUpperCase() === "WEIGHT") {
      details.push({ label: "Volume", value: `~ ${calculatedVolume} Litre` });
    }
  }
  if (hasVolumeDimensions && !details.some((row) => row.label === "Volume")) {
    details.unshift({ label: "Volume", value: `~ ${calculatedVolume} Litre` });
  }
  const outsideEnd = insideIndex > outsideIndex ? insideIndex : rows.length;
  const insideEnd = disclaimerIndex > insideIndex ? disclaimerIndex : rows.length;
  const locks = (from, to) => {
    if (from < 0 || to <= from) return [];
    return rows
      .slice(from + 1, to)
      .filter((row) => row.label && number(row.value) > 0)
      .map((row) => ({ label: title(row.label.replace("AUTOMATIC", "AUTO")), value: row.value }));
  };
  return {
    dimensions,
    details,
    outsideLocks: locks(outsideIndex, outsideEnd),
    insideLocks: locks(insideIndex, insideEnd),
    disclaimer,
    outerDepthInches: dimensionsByName.depth,
    outerWidthInches: dimensionsByName.width,
    outerHeightInches: dimensionsByName.height,
    weightKg: number(weightRow?.value),
    volumeLitres: calculatedVolume,
    modelType: normalizeModelType(modelTypeRow?.value),
  };
}

function readStrongRoomDoorSpec(values) {
  const rows = values.map((row) => ({
    label: clean(row[1]),
    value: clean(row[3] || row[4]),
  }));
  const rowValue = (label) => rows.find((row) => row.label.toUpperCase() === label)?.value || "";
  const labels = ["HEIGHT", "WIDTH", "DOOR THICKNESS", "WEIGHT", "MODEL TYPE"];
  const specificationRows = labels
    .map((label) => ({ label: title(label), value: rowValue(label) }))
    .filter((row) => row.value);
  const outsideIndex = rows.findIndex((row) => row.label.toUpperCase() === "OUTSIDE LOCK TYPES");
  const disclaimerIndex = rows.findIndex((row) => row.label.toUpperCase() === "DISCLAIMER");
  const outsideEnd = disclaimerIndex > outsideIndex ? disclaimerIndex : rows.length;
  const outsideLocks =
    outsideIndex < 0
      ? []
      : rows
          .slice(outsideIndex + 1, outsideEnd)
          .filter((row) => row.label && number(row.value) > 0)
          .map((row) => ({ label: title(row.label.replace("AUTOMATIC", "AUTO")), value: row.value }));
  const disclaimerRow = disclaimerIndex >= 0 ? rows.slice(disclaimerIndex + 1).find((row) => row.label || row.value) : null;
  return {
    specificationRows,
    dimensions: [
      { label: "Height", outer: rowValue("HEIGHT"), inner: "" },
      { label: "Width", outer: rowValue("WIDTH"), inner: "" },
    ].filter((row) => row.outer),
    details: [],
    outsideLocks,
    insideLocks: [],
    disclaimer: disclaimerRow?.label || disclaimer,
    outerHeightInches: inchNumber(rowValue("HEIGHT")),
    outerWidthInches: inchNumber(rowValue("WIDTH")),
    outerDepthInches: null,
    weightKg: number(rowValue("WEIGHT")),
    volumeLitres: null,
    modelType: normalizeModelType(rowValue("MODEL TYPE")),
  };
}

const products = [];
for (const category of categories) {
  const workbookPath = path.join(root, category.workbook);
  const workbook = await SpreadsheetFile.importXlsx(await FileBlob.load(workbookPath));
  for (let index = 0; ; index += 1) {
    let worksheet;
    try {
      worksheet = workbook.worksheets.getItemAt(index);
    } catch {
      break;
    }
    if (!worksheet) break;
    const model = clean(worksheet.name).toUpperCase();
    const imageFiles = await imagesFor(category.folder, model);
    const spec = category.key === "strong-room-door" ? readStrongRoomDoorSpec(worksheet.getRange("A1:H30").values) : readSpec(worksheet.getRange("A1:H30").values);
    products.push({
      model,
      category: category.key,
      categoryName: category.name,
      folder: category.folder,
      image: imageFiles[0] ? `image/product_Image/${category.folder}/${model}/${imageFiles[0]}` : "",
      page: `product_pages/${category.folder}/${model}/${model}.html`,
      outerHeightInches: spec.outerHeightInches,
      outerWidthInches: spec.outerWidthInches,
      outerDepthInches: spec.outerDepthInches,
      weightKg: spec.weightKg,
      volumeLitres: spec.volumeLitres,
      modelType: spec.modelType,
      images: imageFiles,
      spec,
    });
  }
}

products.sort(
  (a, b) =>
    categories.findIndex((category) => category.key === a.category) -
      categories.findIndex((category) => category.key === b.category) || natural.compare(a.model, b.model),
);

const catalogue = products.map(({ images, spec, folder, ...product }) => product);
await fs.writeFile(path.join(root, "product_catalog.js"), `window.eagleSafeProducts = ${JSON.stringify(catalogue, null, 2)};\n`, "utf8");

function productHtml(product) {
  const pageImages = product.images.map((file) => `../../../image/product_Image/${product.folder}/${product.model}/${file}`);
  const data = {
    model: product.model,
    category: `${product.categoryName} Locker`,
    images: pageImages,
    spec: product.spec,
  };
  const productData = JSON.stringify(data, null, 2)
    .split("\n")
    .map((line, index) => (index === 0 ? line : "      " + line))
    .join("\n");

  // Product pages are static HTML files. Keep this template readable so it is easy to adjust from GitHub.
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${product.model} | EAGLE SAFE</title>
    <meta name="description" content="${product.model} ${product.categoryName} safe locker by EAGLE SAFE." />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;800&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="../../model_page.css" />
  </head>
  <body>
    <div id="root"></div>

    <!-- Product data for this model. The shared renderer below builds the gallery and specification tables. -->
    <script src="../../../product_catalog.js"><\/script>
    <script>
      window.productModel = ${productData};
    <\/script>
    <script src="../../model_page.js"><\/script>
  </body>
</html>
`;
}

for (const product of products) {
  const directory = path.join(productPagesRoot, product.folder, product.model);
  await fs.mkdir(directory, { recursive: true });
  const html = productHtml(product);
  await fs.writeFile(path.join(directory, `${product.model}.html`), html, "utf8");
  await fs.writeFile(path.join(directory, "index.html"), html, "utf8");
}

console.log(`Built catalogue and ${products.length} model pages.`);
