import {createRoot} from 'react-dom/client';
import App from './App';
import './index.css';
import './lib/i18n';
import { initWebVitals } from './vitals';

const maybeDocument = (globalThis as { document?: { getElementById?: (id: string) => unknown } }).document;
const rootElement = typeof maybeDocument?.getElementById === 'function' ? maybeDocument.getElementById('root') : null;
if (rootElement) {
  const unsafeCreateRoot = createRoot as unknown as (container: unknown) => { render: (children: unknown) => unknown };
  unsafeCreateRoot(rootElement).render(<App />);
}

  if (typeof window !== 'undefined') {
    initWebVitals();
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        const swUrl = `/sw.js?build=${__BUILD_HASH__}`;
        navigator.serviceWorker.register(swUrl).catch((err) => {
          console.error('Service worker registration failed:', err);
        });
      });
    }
  }
