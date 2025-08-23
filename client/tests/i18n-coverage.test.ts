import i18n from '../src/lib/i18n';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const coverage: Record<string, Record<string, boolean>> = { dashboard: {}, documents: {} };

async function run() {
  const locales: Array<'en' | 'ar'> = ['en', 'ar'];
  for (const locale of locales) {
    await i18n.changeLanguage(locale);
    coverage.dashboard[locale] = i18n.t('dashboard.heading').length > 0;
    coverage.documents[locale] = i18n.t('documents.title').length > 0;
  }
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const artifactDir = path.resolve(__dirname, '../../audit/audit-artifacts');
  fs.mkdirSync(artifactDir, { recursive: true });
  fs.writeFileSync(path.join(artifactDir, 'i18n-coverage.json'), JSON.stringify(coverage, null, 2));
  console.log('i18n coverage:', coverage);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
