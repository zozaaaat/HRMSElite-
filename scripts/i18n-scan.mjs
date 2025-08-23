import fs from "fs";
import path from "path";

const root = "client/src";
const isTS = (f) => /\.(tsx?|jsx?)$/.test(f);
const ignore = (p) => /(^|\/)(locales|__tests__|__mocks__|fixtures)\//.test(p);
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
      hits.push({ file, line: i + 1, snippet: line.trim().slice(0, 180) });
  });
}

if (hits.length) {
  console.log("Arabic literals found:\n");
  for (const h of hits)
    console.log(`${h.file}:${h.line} -> ${JSON.stringify(h.snippet)}`);
  process.exit(1);
} else {
  console.log("No Arabic literals found.");
}
