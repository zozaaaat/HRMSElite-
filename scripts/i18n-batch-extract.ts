import { Project, SyntaxKind, JsxAttribute } from 'ts-morph';
import fs from 'fs';
import path from 'path';

const args = process.argv.slice(2);
let limit = Infinity;
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--limit' && args[i + 1]) {
    limit = parseInt(args[i + 1], 10);
  } else if (args[i].startsWith('--limit=')) {
    limit = parseInt(args[i].split('=')[1], 10);
  }
}

const arabicRegex = /[\u0600-\u06FF]/;
const project = new Project({ tsConfigFilePath: path.join(process.cwd(), 'tsconfig.json') });

const arPath = path.join(process.cwd(), 'client', 'src', 'locales', 'ar.json');
const enPath = path.join(process.cwd(), 'client', 'src', 'locales', 'en.json');
const ar = JSON.parse(fs.readFileSync(arPath, 'utf8'));
const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));

function ensureLocale(locale: any, fileBase: string, index: number, value: string) {
  if (!locale.auto) locale.auto = {};
  if (!locale.auto[fileBase]) locale.auto[fileBase] = {};
  locale.auto[fileBase][index] = value;
}

let processed = 0;

for (const sf of project.getSourceFiles('client/src/**/*.{ts,tsx,js,jsx}')) {
  if (processed >= limit) break;
  const filePath = sf.getFilePath();
  if (filePath.includes('/locales/') || filePath.includes('__tests__') || filePath.includes('/mocks/') || filePath.includes('/fixtures/')) continue;
  const fileBase = path.basename(filePath).replace(/\.[^.]+$/, '');
  let index = 1;

  // ensure t import
  const hasT = sf.getDescendantsOfKind(SyntaxKind.BindingElement).some(be => be.getName() === 't');
  if (!hasT) {
    const imp = sf.getImportDeclaration(dec => dec.getModuleSpecifierValue() === 'i18next');
    if (!imp) {
      sf.addImportDeclaration({ moduleSpecifier: 'i18next', namedImports: ['t'] });
    } else if (!imp.getNamedImports().some(n => n.getName() === 't')) {
      imp.addNamedImport('t');
    }
  }

  const jsxTexts = sf.getDescendantsOfKind(SyntaxKind.JsxText);
  for (const node of jsxTexts) {
    if (processed >= limit) break;
    const parent = node.getParentIfKind(SyntaxKind.JsxElement) || node.getParentIfKind(SyntaxKind.JsxFragment);
    if (!parent) continue;
    const text = node.getText();
    if (arabicRegex.test(text)) {
      const key = `auto.${fileBase}.${index}`;
      node.replaceWithText(`{t('${key}')}`);
      ensureLocale(ar, fileBase, index, text.trim());
      ensureLocale(en, fileBase, index, 'TODO(translate)');
      processed++; index++;
    }
  }
  if (processed >= limit) break;

  sf.forEachDescendant(node => {
    if (processed >= limit) return false;
    if (node.getKind() !== SyntaxKind.JsxAttribute) return;
    const attr = node as JsxAttribute;
    const attrParent = attr.getParentIfKind(SyntaxKind.JsxAttributes);
    if (!attrParent) return;
    const init = attr.getInitializer();
    if (!init) return;
    const text = init.getText();
    if (arabicRegex.test(text)) {
      const key = `auto.${fileBase}.${index}`;
      attr.setInitializer(`{t('${key}')}`);
      ensureLocale(ar, fileBase, index, text.replace(/["'{}]/g, ''));
      ensureLocale(en, fileBase, index, 'TODO(translate)');
      processed++; index++;
    }
  });
}

project.saveSync();
fs.writeFileSync(arPath, JSON.stringify(ar, null, 2) + '\n');
fs.writeFileSync(enPath, JSON.stringify(en, null, 2) + '\n');

console.log(`Processed ${processed} strings`);
