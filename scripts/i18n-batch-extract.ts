import { Project, SyntaxKind, Node, SourceFile, FunctionLikeDeclaration } from 'ts-morph';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface RecordEntry { file: string; original: string }

const LIMIT_ARG = process.argv.find(a => a.startsWith('--limit'));
const LIMIT = LIMIT_ARG ? parseInt(LIMIT_ARG.split('=')[1], 10) : Infinity;

const project = new Project({ tsConfigFilePath: path.join(__dirname, '../client/tsconfig.json') });
const sourceFiles = project.addSourceFilesAtPaths('client/src/**/*.tsx');

const arPath = path.join(__dirname, '../client/src/locales/ar.json');
const enPath = path.join(__dirname, '../client/src/locales/en.json');
const csvPath = path.join(__dirname, '../audit/i18n/suggested-keys.csv');

function setNested(obj: any, keys: string[], value: string) {
  let cur = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    const k = keys[i];
    if (!cur[k]) cur[k] = {};
    cur = cur[k];
  }
  cur[keys[keys.length - 1]] = value;
}

function ensureImport(sourceFile: SourceFile) {
  const existing = sourceFile.getImportDeclaration('react-i18next');
  if (!existing) {
    sourceFile.addImportDeclaration({ moduleSpecifier: 'react-i18next', namedImports: ['useTranslation'] });
    return;
  }
  const hasUse = existing.getNamedImports().some(n => n.getName() === 'useTranslation');
  if (!hasUse) existing.addNamedImport('useTranslation');
}

function getTopFunction(node: Node): FunctionLikeDeclaration | undefined {
  let func = node.getFirstAncestor(f => Node.isFunctionDeclaration(f) || Node.isArrowFunction(f) || Node.isFunctionExpression(f)) as FunctionLikeDeclaration | undefined;
  if (!func) return undefined;
  while (true) {
    const parent = func.getFirstAncestor(f => Node.isFunctionDeclaration(f) || Node.isArrowFunction(f) || Node.isFunctionExpression(f)) as FunctionLikeDeclaration | undefined;
    if (!parent) break;
    func = parent;
  }
  return func;
}

function ensureT(sourceFile: SourceFile, node: Node): boolean {
  const func = getTopFunction(node);
  if (!func) return false;
  const body = func.getBody();
  if (!body || !Node.isBlock(body)) return false;
  if (processedFuncs.has(func)) return true;
  const hasT = func.getDescendantsOfKind(SyntaxKind.VariableDeclaration).some(v => {
    return v.getName() === 't' && v.getInitializer()?.getText().includes('useTranslation');
  });
  if (!hasT) {
    body.insertStatements(0, 'const { t } = useTranslation();');
    ensureImport(sourceFile);
  }
  processedFuncs.add(func);
  return true;
}

const ar = JSON.parse(fs.readFileSync(arPath, 'utf8'));
const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const records: RecordEntry[] = [];
const fileCounters = new Map<string, number>();
let processed = 0;
const processedFuncs = new Set<FunctionLikeDeclaration>();

for (const file of sourceFiles) {
  if (processed >= LIMIT) break;
  const rel = path.relative(path.join(__dirname, '../client/src'), file.getFilePath()).replace(/\\/g, '/');
  const fileBase = path.basename(file.getFilePath(), '.tsx').toLowerCase();
  let counter = fileCounters.get(fileBase) || 1;
  let modified = false;

  const jsxTexts = file.getDescendantsOfKind(SyntaxKind.JsxText);
  for (const jt of jsxTexts) {
    if (processed >= LIMIT) break;
    const text = jt.getText().trim();
    if (!/[\u0600-\u06FF]/.test(text)) continue;
    if (!ensureT(file, jt)) continue;
    const key = `auto.${fileBase}.${counter}`;
    jt.replaceWithText(`{t('${key}')}`);
    setNested(ar, ['auto', fileBase, String(counter)], text);
    setNested(en, ['auto', fileBase, String(counter)], 'TODO(translate)');
    records.push({ file: rel, original: text });
    counter++;
    processed++;
    modified = true;
  }

  function isInJsx(node: Node) {
    if (node.getFirstAncestorByKind(SyntaxKind.JsxAttribute)) return true;
    const expr = node.getFirstAncestorByKind(SyntaxKind.JsxExpression);
    if (!expr) return false;
    const parent = expr.getParent();
    return Node.isJsxElement(parent) || Node.isJsxFragment(parent);
  }

  const literals = file.getDescendants().filter(n =>
    (Node.isStringLiteral(n) || Node.isNoSubstitutionTemplateLiteral(n)) && isInJsx(n)
  ) as Array<Node & { getLiteralText(): string }>;

  for (const lit of literals) {
    if (processed >= LIMIT) break;
    if (lit.wasForgotten?.()) continue;
    const text = ((lit as any).getLiteralText?.() ?? lit.getText()).trim();
    if (!/[\u0600-\u06FF]/.test(text)) continue;
    if (!ensureT(file, lit)) continue;
    const key = `auto.${fileBase}.${counter}`;
    const attr = lit.getFirstAncestorByKind(SyntaxKind.JsxAttribute);
    if (attr) {
      attr.setInitializer(`{t('${key}')}`);
    } else {
      lit.replaceWithText(`t('${key}')`);
    }
    setNested(ar, ['auto', fileBase, String(counter)], text);
    setNested(en, ['auto', fileBase, String(counter)], 'TODO(translate)');
    records.push({ file: rel, original: text });
    counter++;
    processed++;
    modified = true;
  }

  if (modified) {
    fileCounters.set(fileBase, counter);
  }
}

project.saveSync();
fs.writeFileSync(arPath, JSON.stringify(ar, null, 2) + '\n');
fs.writeFileSync(enPath, JSON.stringify(en, null, 2) + '\n');

if (fs.existsSync(csvPath)) {
  const lines = fs.readFileSync(csvPath, 'utf8').split(/\r?\n/);
  const header = lines.shift();
  const filtered = lines.filter(line => {
    return !records.some(r => line.includes(`"${r.file}"`) && line.includes(`"${r.original.replace(/"/g, '""')}"`));
  });
  fs.writeFileSync(csvPath, [header, ...filtered].join('\n'));
}

console.log(`Processed ${processed} strings`);
