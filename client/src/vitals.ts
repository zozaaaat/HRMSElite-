import { onCLS, onINP, onLCP, Metric } from 'web-vitals';

const token = typeof import.meta !== 'undefined' ? (import.meta as any).env?.VITE_METRICS_TOKEN : undefined;

function sendToServer(metric: Metric) {
  try {
    const body = JSON.stringify({ name: metric.name, value: metric.value });
    fetch('/metrics/vitals', {
      method: 'POST',
      keepalive: true,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body
    }).catch(() => {
      /* Ignore errors */
    });
  } catch {
    /* Ignore errors */
  }
}

export function initWebVitals() {
  onCLS(sendToServer);
  onINP(sendToServer);
  onLCP(sendToServer);
}

