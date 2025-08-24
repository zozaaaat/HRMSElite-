import fs from "fs";
import path from "path";

const root = ".";
const outDir = path.join("audit", "i18n");
const hitsFile = path.join(outDir, "hits.json");
const csvFile = path.join(outDir, "suggested-keys.csv");

const isTS = (f) => /\.(tsx?|jsx?)$/.test(f);
const ignore = (p) =>
  /(^|\/)(node_modules|\.git|dist|build|audit|locales|fixtures)\//.test(p);
const files = [];

(function walk(dir) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    const st = fs.statSync(p);
    if (st.isDirectory()) {
      if (!ignore(p)) walk(p);
    } else if (isTS(p) && !ignore(p)) files.push(p);
  }
})(root);

const reArabic = /[\u0600-\u06FF]/;
const hits = [];

for (const file of files) {
  const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);
  lines.forEach((line, i) => {
    if (reArabic.test(line))
      hits.push({ file, line: i + 1, text: line.trim().slice(0, 180) });
  });
}

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(hitsFile, JSON.stringify(hits, null, 2));

const csvLines = ["key,file,line,original"];
for (const h of hits) {
  const rel = path.relative(root, h.file).replace(/\\/g, "/");
  const keyBase = rel
    .replace(/\.[jt]sx?$/, "")
    .split(/[\\/]+/)
    .join(".")
    .replace(/[^a-zA-Z0-9.]/g, "_");
  const key = `${keyBase}.${h.line}`;
  const escaped = h.text.replace(/"/g, '""');
  csvLines.push(`"${key}","${rel}",${h.line},"${escaped}"`);
}
fs.writeFileSync(csvFile, csvLines.join("\n"));

if (hits.length) {
  console.log("Arabic literals found:\n");
  for (const h of hits)
    console.log(`${h.file}:${h.line} -> ${JSON.stringify(h.text)}`);
  process.exit(1);
} else {
  console.log("No Arabic literals found.");
}
