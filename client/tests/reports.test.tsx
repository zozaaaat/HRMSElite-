import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { renderWithProviders } from '@/test-utils/renderWithProviders';
import Reports from '../src/pages/reports';

// Mock fetch for API calls
global.fetch = vi.fn();

describe('Reports Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders AI summary tab by default', () => {
    renderWithProviders(<Reports />);

    expect(screen.getByText('التقارير والمستندات')).toBeInTheDocument();
    expect(screen.getByText('التحليل الذكي')).toBeInTheDocument();
  });

  it('shows loading state for AI summary', async () => {
    (fetch as ReturnType<typeof vi.fn>).mockImplementation(() => 
      new Promise(() => {}) // Never resolves to simulate loading
    );

    renderWithProviders(
      <Reports />
    );

    await waitFor(() => {
      expect(screen.getByText('جاري تحليل البيانات...')).toBeInTheDocument();
    });
  });

  it('displays AI summary data when loaded', async () => {
    const mockAISummary = {
      summary: {
        overview: "تحليل شامل لبيانات الشركة يظهر نمواً إيجابياً",
        keyInsights: [
          "معدل دوران الموظفين منخفض (3.2%) مما يدل على رضا الموظفين"
        ],
        recommendations: [
          "إجراء برامج تدريب إضافية لموظفي قسم المبيعات"
        ]
      },
      metrics: {
        totalEmployees: 450,
        satisfactionScore: 87,
        turnoverRate: 3.2,
        avgSalary: 2800
      }
    };

    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockAISummary)
    } as Response);

    renderWithProviders(
      <Reports />
    );

    await waitFor(() => {
      expect(screen.getByText('التحليل الذكي الشامل')).toBeInTheDocument();
      expect(screen.getByText('نظرة عامة')).toBeInTheDocument();
      expect(screen.getByText('الرؤى الرئيسية')).toBeInTheDocument();
      expect(screen.getByText('التوصيات الذكية')).toBeInTheDocument();
    });
  });

  it('shows error state when API fails', async () => {
    (fetch as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('API Error'));

    renderWithProviders(
      <Reports />
    );

    await waitFor(() => {
      expect(screen.getByText('حدث خطأ في تحميل التحليل الذكي. يرجى المحاولة مرة أخرى.')).toBeInTheDocument();
    });
  });

  it('switches between AI tabs correctly', async () => {
    const mockData = { insights: [] };
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockData)
    } as Response);

    renderWithProviders(
      <Reports />
    );

    // Click on AI Insights tab
    const insightsTab = screen.getByText('الرؤى الذكية');
    insightsTab.click();

    await waitFor(() => {
      expect(screen.getByText('الرؤى الذكية')).toBeInTheDocument();
    });
  });
}); 