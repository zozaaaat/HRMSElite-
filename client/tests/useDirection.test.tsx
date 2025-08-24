import { act, waitFor } from '@testing-library/react';
import { renderWithProviders } from '@/test-utils/renderWithProviders';
import { describe, it, expect } from 'vitest';
import { useDirection } from '@/hooks/useDirection';
import i18n from '@/lib/i18n';

function TestComponent() {
  useDirection();
  return null;
}

describe('useDirection', () => {
  it('updates html dir attribute on language change', async () => {
    renderWithProviders(<TestComponent />);
    expect(document.documentElement.getAttribute('dir')).toBe('ltr');

    await act(async () => {
      await i18n.changeLanguage('ar');
    });
    await waitFor(() =>
      expect(document.documentElement.getAttribute('dir')).toBe('rtl')
    );

    await act(async () => {
      await i18n.changeLanguage('en');
    });
    await waitFor(() =>
      expect(document.documentElement.getAttribute('dir')).toBe('ltr')
    );
  });
});
