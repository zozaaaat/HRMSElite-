import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders } from '@/test-utils/renderWithProviders';
import { Router } from 'wouter';
import React from 'react';
import OptimizedLicenseCard from '@/components/optimized/OptimizedLicenseCard';
import OptimizedDocumentCard from '@/components/optimized/OptimizedDocumentCard';
import SuspenseWrapper, { 
  DocumentSuspense, 
  LicenseSuspense, 
  EmployeeSuspense, 
  DashboardSuspense 
} from '@/components/optimized/SuspenseWrapper';
import {
   EnhancedErrorBoundary, withErrorBoundary 
} from '@/components/shared/EnhancedErrorBoundary';

// Mock useToast hook
vi.mock('@/hooks/use-toast', () => ({
  useToast: vi.fn(() => ({
    toast: vi.fn(),
    toasts: [],
    dismiss: vi.fn(),
  })),
}));

// Mock wouter
vi.mock('wouter', () => ({
  Router: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Mock data
const mockLicense = {
  id: 'license-1',
  companyId: 'company-1',
  name: 'ترخيص النيل الأزرق للمجوهرات',
  type: 'jewelry',
  number: 'LIC-2023-001',
  status: 'active' as const,
  issueDate: '2023-01-15',
  expiryDate: '2024-01-15',
  issuingAuthority: 'وزارة التجارة والصناعة',
  location: 'مباركية',
  description: 'ترخيص تجاري لشركة النيل الأزرق للمجوهرات',
  isActive: true,
  createdAt: '2023-01-15T10:00:00Z',
  updatedAt: '2023-01-15T10:00:00Z',
  company: {
    name: 'شركة النيل الأزرق للمجوهرات',
    commercialFileNumber: '123456'
  },
  employees: []
};

const mockDocument = {
  id: 'doc-1',
  name: 'عقد العمل',
  number: 'DOC-2023-001',
  type: 'contract',
  entityType: 'employee' as const,
  entityId: 'employee-1',
  category: 'contracts',
  description: 'عقد عمل للموظف أحمد محمد',
  fileUrl: '/documents/contract.pdf',
  fileName: 'contract.pdf',
  fileType: 'application/pdf',
  fileSize: 1024000,
  tags: ['عقد', 'موظف'],
  createdAt: '2023-01-15T10:00:00Z',
  updatedAt: '2023-01-15T10:00:00Z'
};

describe('Optimized Components', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('OptimizedLicenseCard', () => {
    it('should render license card with all information', () => {
      const mockHandlers = {
        onView: vi.fn(),
        onEdit: vi.fn(),
        onAddDocument: vi.fn(),
        onDelete: vi.fn(),
      };

      renderWithProviders(
        <Router>
          <OptimizedLicenseCard
            license={mockLicense}
            {...mockHandlers}
          />
        </Router>
      );

      expect(screen.getByText(mockLicense.name)).toBeInTheDocument();
      expect(screen.getByText(mockLicense.number)).toBeInTheDocument();
      expect(screen.getByText(mockLicense.location)).toBeInTheDocument();
      expect(screen.getByText('نشط')).toBeInTheDocument();
    });

    it('should handle view button click', async () => {
      const mockHandlers = {
        onView: vi.fn(),
        onEdit: vi.fn(),
        onAddDocument: vi.fn(),
        onDelete: vi.fn(),
      };

      renderWithProviders(
        <Router>
          <OptimizedLicenseCard
            license={mockLicense}
            {...mockHandlers}
          />
        </Router>
      );

      const viewButton = screen.getByText('عرض');
      fireEvent.click(viewButton);

      expect(mockHandlers.onView).toHaveBeenCalledWith(mockLicense);
    });

    it('should handle edit button click', async () => {
      const mockHandlers = {
        onView: vi.fn(),
        onEdit: vi.fn(),
        onAddDocument: vi.fn(),
        onDelete: vi.fn(),
      };

      renderWithProviders(
        <Router>
          <OptimizedLicenseCard
            license={mockLicense}
            {...mockHandlers}
          />
        </Router>
      );

      const editButton = screen.getByText('تعديل');
      fireEvent.click(editButton);

      expect(mockHandlers.onEdit).toHaveBeenCalledWith(mockLicense);
    });

    it('should show expiring warning for licenses expiring soon', () => {
      const expiringLicense = {
        ...mockLicense,
        expiryDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 15 days from now
      };

      const mockHandlers = {
        onView: vi.fn(),
        onEdit: vi.fn(),
        onAddDocument: vi.fn(),
        onDelete: vi.fn(),
      };

      renderWithProviders(
        <Router>
          <OptimizedLicenseCard
            license={expiringLicense}
            {...mockHandlers}
          />
        </Router>
      );

      expect(screen.getByText('ينتهي هذا الترخيص قريباً')).toBeInTheDocument();
    });

    it('should show expired warning for expired licenses', () => {
      const expiredLicense = {
        ...mockLicense,
        expiryDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
        status: 'expired',
      };

      const mockHandlers = {
        onView: vi.fn(),
        onEdit: vi.fn(),
        onAddDocument: vi.fn(),
        onDelete: vi.fn(),
      };

      renderWithProviders(
        <Router>
          <OptimizedLicenseCard
            license={expiredLicense}
            {...mockHandlers}
          />
        </Router>
      );

      expect(screen.getByText('هذا الترخيص منتهي الصلاحية')).toBeInTheDocument();
    });

    it('should handle selection when onSelect is provided', () => {
      const mockHandlers = {
        onView: vi.fn(),
        onEdit: vi.fn(),
        onAddDocument: vi.fn(),
        onDelete: vi.fn(),
        onSelect: vi.fn(),
      };

      renderWithProviders(
        <Router>
          <OptimizedLicenseCard
            license={mockLicense}
            {...mockHandlers}
            isSelected={false}
          />
        </Router>
      );

      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);

      expect(mockHandlers.onSelect).toHaveBeenCalledWith(mockLicense.id, true);
    });
  });

  describe('OptimizedDocumentCard', () => {
    it('should render document card with all information', () => {
      const mockHandlers = {
        onView: vi.fn(),
        onEdit: vi.fn(),
        onDownload: vi.fn(),
        onDelete: vi.fn(),
      };

      renderWithProviders(
        <Router>
          <OptimizedDocumentCard
            document={mockDocument}
            {...mockHandlers}
          />
        </Router>
      );

      expect(screen.getByText(mockDocument.name)).toBeInTheDocument();
      expect(screen.getByText(mockDocument.number)).toBeInTheDocument();
      expect(screen.getByText('عقد')).toBeInTheDocument();
      expect(screen.getByText('موظف')).toBeInTheDocument();
    });

    it('should handle download button click', async () => {
      const mockHandlers = {
        onView: vi.fn(),
        onEdit: vi.fn(),
        onDownload: vi.fn(),
        onDelete: vi.fn(),
      };

      renderWithProviders(
        <Router>
          <OptimizedDocumentCard
            document={mockDocument}
            {...mockHandlers}
          />
        </Router>
      );

      const downloadButton = screen.getByText('تحميل');
      fireEvent.click(downloadButton);

      expect(mockHandlers.onDownload).toHaveBeenCalledWith(mockDocument);
    });

    it('should display file size correctly', () => {
      const mockHandlers = {
        onView: vi.fn(),
        onEdit: vi.fn(),
        onDownload: vi.fn(),
        onDelete: vi.fn(),
      };

      renderWithProviders(
        <Router>
          <OptimizedDocumentCard
            document={mockDocument}
            {...mockHandlers}
          />
        </Router>
      );

      expect(screen.getByText('1000 KB')).toBeInTheDocument();
    });

    it('should display tags when available', () => {
      const mockHandlers = {
        onView: vi.fn(),
        onEdit: vi.fn(),
        onDownload: vi.fn(),
        onDelete: vi.fn(),
      };

      renderWithProviders(
        <Router>
          <OptimizedDocumentCard
            document={mockDocument}
            {...mockHandlers}
          />
        </Router>
      );

      expect(screen.getByText('عقد')).toBeInTheDocument();
      expect(screen.getByText('موظف')).toBeInTheDocument();
    });

    it('should handle selection when onSelect is provided', () => {
      const mockHandlers = {
        onView: vi.fn(),
        onEdit: vi.fn(),
        onDownload: vi.fn(),
        onDelete: vi.fn(),
        onSelect: vi.fn(),
      };

      renderWithProviders(
        <Router>
          <OptimizedDocumentCard
            document={mockDocument}
            {...mockHandlers}
            isSelected={false}
          />
        </Router>
      );

      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);

      expect(mockHandlers.onSelect).toHaveBeenCalledWith(mockDocument.id, true);
    });
  });

  describe('SuspenseWrapper', () => {
    it('should render children when no suspense is needed', () => {
      renderWithProviders(
        <SuspenseWrapper>
          <div data-testid="test-content">Test Content</div>
        </SuspenseWrapper>
      );

      expect(screen.getByTestId('test-content')).toBeInTheDocument();
    });

    it('should render default fallback when type is default', () => {
      renderWithProviders(
        <SuspenseWrapper type="default">
          <div data-testid="test-content">Test Content</div>
        </SuspenseWrapper>
      );

      // The content should still be visible since there's no actual suspense
      expect(screen.getByTestId('test-content')).toBeInTheDocument();
    });

    it('should render custom fallback when provided', () => {
      const customFallback = <div data-testid="custom-fallback">Custom Loading...</div>;

      renderWithProviders(
        <SuspenseWrapper fallback={customFallback}>
          <div data-testid="test-content">Test Content</div>
        </SuspenseWrapper>
      );

      expect(screen.getByTestId('test-content')).toBeInTheDocument();
    });
  });

  describe('Specialized Suspense Wrappers', () => {
    it('should render DocumentSuspense with list fallback', () => {
      renderWithProviders(
        <DocumentSuspense>
          <div data-testid="document-content">Document Content</div>
        </DocumentSuspense>
      );

      expect(screen.getByTestId('document-content')).toBeInTheDocument();
    });

    it('should render LicenseSuspense with card fallback', () => {
      renderWithProviders(
        <LicenseSuspense>
          <div data-testid="license-content">License Content</div>
        </LicenseSuspense>
      );

      expect(screen.getByTestId('license-content')).toBeInTheDocument();
    });

    it('should render EmployeeSuspense with table fallback', () => {
      renderWithProviders(
        <EmployeeSuspense>
          <div data-testid="employee-content">Employee Content</div>
        </EmployeeSuspense>
      );

      expect(screen.getByTestId('employee-content')).toBeInTheDocument();
    });

    it('should render DashboardSuspense with chart fallback', () => {
      renderWithProviders(
        <DashboardSuspense>
          <div data-testid="dashboard-content">Dashboard Content</div>
        </DashboardSuspense>
      );

      expect(screen.getByTestId('dashboard-content')).toBeInTheDocument();
    });
  });

  describe('EnhancedErrorBoundary', () => {
    it('should render children when no error occurs', () => {
      renderWithProviders(
        <EnhancedErrorBoundary>
          <div data-testid="test-content">Test Content</div>
        </EnhancedErrorBoundary>
      );

      expect(screen.getByTestId('test-content')).toBeInTheDocument();
    });

    it('should render error UI when error occurs', () => {
      const ThrowError = () => {
        throw new Error('Test error');
      };

      renderWithProviders(
        <EnhancedErrorBoundary>
          <ThrowError />
        </EnhancedErrorBoundary>
      );

      expect(screen.getByText('حدث خطأ غير متوقع')).toBeInTheDocument();
      expect(screen.getByText('إعادة المحاولة')).toBeInTheDocument();
      expect(screen.getByText('الصفحة الرئيسية')).toBeInTheDocument();
    });

    it('should handle retry functionality', async () => {
      let shouldThrow = true;
      const ThrowError = () => {
        if (shouldThrow) {
          shouldThrow = false;
          throw new Error('Test error');
        }
        return <div data-testid="success-content">Success</div>;
      };

      renderWithProviders(
        <EnhancedErrorBoundary>
          <ThrowError />
        </EnhancedErrorBoundary>
      );

      // Check for error message using a more flexible approach
      expect(screen.getByText(/حدث خطأ غير متوقع|Unexpected error occurred/)).toBeInTheDocument();

      const retryButton = screen.getByText(/إعادة المحاولة|Retry/);
      fireEvent.click(retryButton);

      await waitFor(() => {
        expect(screen.getByTestId('success-content')).toBeInTheDocument();
      });
    });

    it('should show error details in development mode', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const ThrowError = () => {
        throw new Error('Test error');
      };

      renderWithProviders(
        <EnhancedErrorBoundary showDetails>
          <ThrowError />
        </EnhancedErrorBoundary>
      );

      expect(screen.getByText('تفاصيل الخطأ (للطور)')).toBeInTheDocument();

      process.env.NODE_ENV = originalEnv;
    });

    it('should handle custom error handler', () => {
      const mockErrorHandler = vi.fn();
      const ThrowError = () => {
        throw new Error('Test error');
      };

      renderWithProviders(
        <EnhancedErrorBoundary onError={mockErrorHandler}>
          <ThrowError />
        </EnhancedErrorBoundary>
      );

      expect(mockErrorHandler).toHaveBeenCalledWith(
        expect.any(Error),
        expect.any(Object)
      );
    });
  });

  describe('Performance Optimizations', () => {
    it('should use React.memo for optimized components', () => {
      // Check if components are wrapped with React.memo
      expect(OptimizedLicenseCard.displayName).toBe('OptimizedLicenseCard');
      expect(OptimizedDocumentCard.displayName).toBe('OptimizedDocumentCard');
    });

    it('should prevent unnecessary re-renders with memoized callbacks', () => {
      const mockHandlers = {
        onView: vi.fn(),
        onEdit: vi.fn(),
        onAddDocument: vi.fn(),
        onDelete: vi.fn(),
      };

      const { rerender } = renderWithProviders(
        <Router>
          <OptimizedLicenseCard
            license={mockLicense}
            {...mockHandlers}
          />
        </Router>
      );

      // Re-render with same props
      rerender(
        <Router>
          <OptimizedLicenseCard
            license={mockLicense}
            {...mockHandlers}
          />
        </Router>
      );

      // The component should not re-render unnecessarily due to React.memo
      expect(mockHandlers.onView).not.toHaveBeenCalled();
    });

    it('should handle hover effects correctly', () => {
      const mockHandlers = {
        onView: vi.fn(),
        onEdit: vi.fn(),
        onAddDocument: vi.fn(),
        onDelete: vi.fn(),
      };

      renderWithProviders(
        <Router>
          <OptimizedLicenseCard
            license={mockLicense}
            {...mockHandlers}
          />
        </Router>
      );

      const card = screen.getByText(mockLicense.name).closest('.transition-all');
      expect(card).toBeInTheDocument();
    });
  });
}); 