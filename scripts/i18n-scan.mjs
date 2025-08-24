import fs from "fs";
import path from "path";
import { parse } from "@babel/parser";
import traverse from "@babel/traverse";

const root = ".";
const outDir = path.join("audit", "i18n");
const hitsFile = path.join(outDir, "hits.json");
const csvFile = path.join(outDir, "suggested-keys.csv");

const reArabic = /[\u0600-\u06FF]/;

const isSource = (f) => /\.(tsx?|jsx?)$/.test(f);
const ignorePath = (p) =>
  /(^|\/)(node_modules|\.git|dist|build|audit|locales|fixtures|coverage|\.backup|backup-console-logs)\//.test(p) ||
  /(test|spec|mock|fixture|stories)\.[tj]sx?$/.test(p);
const files = [];

(function walk(dir) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    const st = fs.statSync(p);
    if (st.isDirectory()) {
      if (!ignorePath(p)) walk(p);
    } else if (isSource(p) && !ignorePath(p)) files.push(p);
  }
})(root);

const hits = [];

function addHit(file, node, text) {
  hits.push({ file, line: node.loc.start.line, text: text.trim().slice(0, 180) });
}

function isLogCall(path) {
  return path.findParent(
    (p) =>
      p.isCallExpression() &&
      p.get("callee").isMemberExpression() &&
      ((p.get("callee.object").isIdentifier({ name: "console" }) &&
        p.get("callee.property").isIdentifier({ name: "log" })) ||
        p.get("callee.object").isIdentifier({ name: "logger" }))
  );
}

for (const file of files) {
  const code = fs.readFileSync(file, "utf8");
  let ast;
  try {
    ast = parse(code, {
      sourceType: "module",
      plugins: ["jsx", "typescript"],
    });
  } catch (e) {
    // Skip files that fail to parse
    continue;
  }

  (traverse.default || traverse)(ast, {
    JSXText(path) {
      const text = path.node.value.trim();
      if (reArabic.test(text)) addHit(file, path.node, text);
    },
    StringLiteral(path) {
      if (isLogCall(path)) return;
      const parent = path.parent;
      if (
        parent.type === "JSXAttribute" ||
        (parent.type === "JSXExpressionContainer" &&
          path.parentPath.parent.type === "JSXElement")
      ) {
        const text = path.node.value;
        if (reArabic.test(text)) addHit(file, path.node, text);
      }
    },
    TemplateLiteral(path) {
      if (isLogCall(path)) return;
      const parent = path.parent;
      if (
        parent.type === "JSXAttribute" ||
        (parent.type === "JSXExpressionContainer" &&
          path.parentPath.parent.type === "JSXElement")
      ) {
        const text = path.node.quasis.map((q) => q.value.cooked).join("${}");
        if (reArabic.test(text)) addHit(file, path.node, text);
      }
    },
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
