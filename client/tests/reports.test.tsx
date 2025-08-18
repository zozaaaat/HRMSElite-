import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@testing-library/jest-dom';
import Reports from '../src/pages/reports';

// Preserve original fetch to restore later
const originalFetch = global.fetch;

// Create a test query client
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

// Wrapper component for testing
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = createTestQueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('Reports Page', () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({})
    } as Response);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    global.fetch = originalFetch;
  });

  it('renders AI summary tab by default', () => {
    render(
      <TestWrapper>
        <Reports />
      </TestWrapper>
    );

    expect(screen.getByText('التقارير والمستندات')).toBeInTheDocument();
    expect(screen.getByText('التحليل الذكي')).toBeInTheDocument();
  });

  it('shows loading state for AI summary', async () => {
    (fetch as ReturnType<typeof vi.fn>).mockImplementation(() =>
      new Promise(() => {}) // Never resolves to simulate loading
    );

    render(
      <TestWrapper>
        <Reports />
      </TestWrapper>
    );

    await waitFor(() =>
      expect(fetch).toHaveBeenCalledWith('/api/ai/summary?companyId=company-1')
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

    render(
      <TestWrapper>
        <Reports />
      </TestWrapper>
    );

    await waitFor(() =>
      expect(fetch).toHaveBeenCalledWith('/api/ai/summary?companyId=company-1')
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

    render(
      <TestWrapper>
        <Reports />
      </TestWrapper>
    );

    await waitFor(() =>
      expect(fetch).toHaveBeenCalledWith('/api/ai/summary?companyId=company-1')
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

    render(
      <TestWrapper>
        <Reports />
      </TestWrapper>
    );
    await waitFor(() =>
      expect(fetch).toHaveBeenCalledWith('/api/ai/summary?companyId=company-1')
    );

    // Click on AI Insights tab
    const insightsTab = screen.getByText('الرؤى الذكية');
    insightsTab.click();

    await waitFor(() =>
      expect(fetch).toHaveBeenCalledWith(
        '/api/ai/insights?companyId=company-1&type=employee'
      )
    );

    await waitFor(() => {
      expect(screen.getByText('الرؤى الذكية')).toBeInTheDocument();
    });
  });
});
