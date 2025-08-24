import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders } from '@/test-utils/renderWithProviders';
import { Router } from 'wouter';
import React from 'react';
import LicensesPage from '@/pages/licenses';
import DocumentsPage from '@/pages/documents';

// Mock the hooks and services
vi.mock('@/hooks/use-toast', () => ({
  useToast: vi.fn(() => ({
    toast: vi.fn(),
    toasts: [],
    dismiss: vi.fn(),
  })),
}));
vi.mock('@/services/api');

// Mock wouter
vi.mock('wouter', () => ({
  Router: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('Licenses and Documents Display', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Licenses Page', () => {
    it('should render licenses page with all components', () => {
      renderWithProviders(
        <Router>
          <LicensesPage />
        </Router>
      );

      expect(screen.getByText(/التراخيص/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/البحث في التراخيص/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /إضافة ترخيص جديد/i })).toBeInTheDocument();
    });

    it('should display license cards with correct information', () => {
      renderWithProviders(
        <Router>
          <LicensesPage />
        </Router>
      );

      // Check for license information
      expect(screen.getByText(/ترخيص النيل الأزرق للمجوهرات/i)).toBeInTheDocument();
      expect(screen.getByText(/LIC-2023-001/i)).toBeInTheDocument();
      expect(screen.getByText(/مباركية/i)).toBeInTheDocument();
    });

    it('should filter licenses by company', async () => {
      renderWithProviders(
        <Router>
          <LicensesPage />
        </Router>
      );

      const companyFilter = screen.getByLabelText(/الشركة/i);
      fireEvent.change(companyFilter, { target: { value: 'company-1' } });

      await waitFor(() => {
        expect(screen.getByText(/ترخيص النيل الأزرق للمجوهرات/i)).toBeInTheDocument();
        expect(screen.queryByText(/ترخيص الاتحاد الخليجي/i)).not.toBeInTheDocument();
      });
    });

    it('should filter licenses by status', async () => {
      renderWithProviders(
        <Router>
          <LicensesPage />
        </Router>
      );

      const statusFilter = screen.getByLabelText(/الحالة/i);
      fireEvent.change(statusFilter, { target: { value: 'active' } });

      await waitFor(() => {
        expect(screen.getByText(/ترخيص النيل الأزرق للمجوهرات/i)).toBeInTheDocument();
        expect(screen.queryByText(/ترخيص الاتحاد الخليجي/i)).not.toBeInTheDocument();
      });
    });

    it('should search licenses by name or number', async () => {
      renderWithProviders(
        <Router>
          <LicensesPage />
        </Router>
      );

      const searchInput = screen.getByPlaceholderText(/البحث في التراخيص/i);
      fireEvent.change(searchInput, { target: { value: 'النيل الأزرق' } });

      await waitFor(() => {
        expect(screen.getByText(/ترخيص النيل الأزرق للمجوهرات/i)).toBeInTheDocument();
        expect(screen.queryByText(/ترخيص الاتحاد الخليجي/i)).not.toBeInTheDocument();
      });
    });

    it('should show license details when view button is clicked', async () => {
      renderWithProviders(
        <Router>
          <LicensesPage />
        </Router>
      );

      const viewButtons = screen.getAllByText(/عرض/i);
      fireEvent.click(viewButtons[0]);

      await waitFor(() => {
        expect(screen.getByText(/تفاصيل الترخيص/i)).toBeInTheDocument();
      });
    });

    it('should show edit license form when edit button is clicked', async () => {
      renderWithProviders(
        <Router>
          <LicensesPage />
        </Router>
      );

      const editButtons = screen.getAllByText(/تعديل/i);
      fireEvent.click(editButtons[0]);

      await waitFor(() => {
        expect(screen.getByText(/تعديل الترخيص/i)).toBeInTheDocument();
      });
    });

    it('should show document form when documents button is clicked', async () => {
      renderWithProviders(
        <Router>
          <LicensesPage />
        </Router>
      );

      const documentButtons = screen.getAllByText(/مستندات/i);
      fireEvent.click(documentButtons[0]);

      await waitFor(() => {
        expect(screen.getByText(/إضافة مستند للترخيص/i)).toBeInTheDocument();
      });
    });

    it('should handle license deletion', async () => {
      const mockToast = vi.fn();
      (useToast as any).mockReturnValue({
        toast: mockToast,
      });

      renderWithProviders(
        <Router>
          <LicensesPage />
        </Router>
      );

      const deleteButtons = screen.getAllByText(/حذف/i);
      fireEvent.click(deleteButtons[0]);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'تم حذف الترخيص بنجاح',
          })
        );
      });
    });
  });

  describe('Documents Page', () => {
    it('should render documents page with all components', () => {
      renderWithProviders(
        <Router>
          <DocumentsPage />
        </Router>
      );

      expect(screen.getByText(/المستندات/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/البحث في المستندات/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /إضافة مستند جديد/i })).toBeInTheDocument();
    });

    it('should display document cards with correct information', () => {
      renderWithProviders(
        <Router>
          <DocumentsPage />
        </Router>
      );

      // Check for document information
      expect(screen.getByText(/عقد العمل/i)).toBeInTheDocument();
      expect(screen.getByText(/DOC-2023-001/i)).toBeInTheDocument();
      expect(screen.getByText(/موظف/i)).toBeInTheDocument();
    });

    it('should filter documents by type', async () => {
      renderWithProviders(
        <Router>
          <DocumentsPage />
        </Router>
      );

      const typeFilter = screen.getByLabelText(/النوع/i);
      fireEvent.change(typeFilter, { target: { value: 'contract' } });

      await waitFor(() => {
        expect(screen.getByText(/عقد العمل/i)).toBeInTheDocument();
        expect(screen.queryByText(/رخصة القوى العاملة/i)).not.toBeInTheDocument();
      });
    });

    it('should filter documents by entity', async () => {
      renderWithProviders(
        <Router>
          <DocumentsPage />
        </Router>
      );

      const entityFilter = screen.getByLabelText(/الكيان/i);
      fireEvent.change(entityFilter, { target: { value: 'employee' } });

      await waitFor(() => {
        expect(screen.getByText(/عقد العمل/i)).toBeInTheDocument();
        expect(screen.queryByText(/رخصة الشركة/i)).not.toBeInTheDocument();
      });
    });

    it('should search documents by name or description', async () => {
      renderWithProviders(
        <Router>
          <DocumentsPage />
        </Router>
      );

      const searchInput = screen.getByPlaceholderText(/البحث في المستندات/i);
      fireEvent.change(searchInput, { target: { value: 'عقد العمل' } });

      await waitFor(() => {
        expect(screen.getByText(/عقد العمل/i)).toBeInTheDocument();
        expect(screen.queryByText(/رخصة القوى العاملة/i)).not.toBeInTheDocument();
      });
    });

    it('should show document details when view button is clicked', async () => {
      renderWithProviders(
        <Router>
          <DocumentsPage />
        </Router>
      );

      const viewButtons = screen.getAllByText(/عرض/i);
      fireEvent.click(viewButtons[0]);

      await waitFor(() => {
        expect(screen.getByText(/تفاصيل المستند/i)).toBeInTheDocument();
      });
    });

    it('should show edit document form when edit button is clicked', async () => {
      renderWithProviders(
        <Router>
          <DocumentsPage />
        </Router>
      );

      const editButtons = screen.getAllByText(/تعديل/i);
      fireEvent.click(editButtons[0]);

      await waitFor(() => {
        expect(screen.getByText(/تعديل المستند/i)).toBeInTheDocument();
      });
    });

    it('should handle document download', async () => {
      const mockDownload = vi.fn();
      global.URL.createObjectURL = vi.fn(() => 'mock-url');
      global.URL.revokeObjectURL = vi.fn();

      renderWithProviders(
        <Router>
          <DocumentsPage />
        </Router>
      );

      const downloadButtons = screen.getAllByText(/تحميل/i);
      fireEvent.click(downloadButtons[0]);

      await waitFor(() => {
        expect(global.URL.createObjectURL).toHaveBeenCalled();
      });
    });

    it('should handle document deletion', async () => {
      const mockToast = vi.fn();
      (useToast as any).mockReturnValue({
        toast: mockToast,
      });

      renderWithProviders(
        <Router>
          <DocumentsPage />
        </Router>
      );

      const deleteButtons = screen.getAllByText(/حذف/i);
      fireEvent.click(deleteButtons[0]);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'تم حذف المستند بنجاح',
          })
        );
      });
    });
  });

  describe('Document Form', () => {
    it('should render document form with all fields', () => {
      renderWithProviders(
        <Router>
          <DocumentsPage />
        </Router>
      );

      // Open document form
      const addButton = screen.getByRole('button', { name: /إضافة مستند جديد/i });
      fireEvent.click(addButton);

      expect(screen.getByLabelText(/اسم المستند/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/الوصف/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/النوع/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/الكيان/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/الملف/i)).toBeInTheDocument();
    });

    it('should validate required fields', async () => {
      renderWithProviders(
        <Router>
          <DocumentsPage />
        </Router>
      );

      // Open document form
      const addButton = screen.getByRole('button', { name: /إضافة مستند جديد/i });
      fireEvent.click(addButton);

      // Try to save without filling required fields
      const saveButton = screen.getByRole('button', { name: /حفظ/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText(/يرجى إدخال اسم المستند/i)).toBeInTheDocument();
        expect(screen.getByText(/يرجى اختيار نوع المستند/i)).toBeInTheDocument();
        expect(screen.getByText(/يرجى اختيار الكيان/i)).toBeInTheDocument();
      });
    });

    it('should handle file upload', async () => {
      renderWithProviders(
        <Router>
          <DocumentsPage />
        </Router>
      );

      // Open document form
      const addButton = screen.getByRole('button', { name: /إضافة مستند جديد/i });
      fireEvent.click(addButton);

      const fileInput = screen.getByLabelText(/الملف/i);
      const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
      
      fireEvent.change(fileInput, { target: { files: [file] } });

      await waitFor(() => {
        expect(screen.getByText(/test.pdf/i)).toBeInTheDocument();
      });
    });

    it('should save document successfully', async () => {
      const mockToast = vi.fn();
      (useToast as any).mockReturnValue({
        toast: mockToast,
      });

      renderWithProviders(
        <Router>
          <DocumentsPage />
        </Router>
      );

      // Open document form
      const addButton = screen.getByRole('button', { name: /إضافة مستند جديد/i });
      fireEvent.click(addButton);

      // Fill form
      const nameInput = screen.getByLabelText(/اسم المستند/i);
      const descriptionInput = screen.getByLabelText(/الوصف/i);
      const typeSelect = screen.getByLabelText(/النوع/i);
      const entitySelect = screen.getByLabelText(/الكيان/i);

      fireEvent.change(nameInput, { target: { value: 'مستند جديد' } });
      fireEvent.change(descriptionInput, { target: { value: 'وصف المستند' } });
      fireEvent.change(typeSelect, { target: { value: 'contract' } });
      fireEvent.change(entitySelect, { target: { value: 'employee' } });

      // Save document
      const saveButton = screen.getByRole('button', { name: /حفظ/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'تم حفظ المستند بنجاح',
          })
        );
      });
    });
  });

  describe('License Form', () => {
    it('should render license form with all fields', () => {
      renderWithProviders(
        <Router>
          <LicensesPage />
        </Router>
      );

      // Open license form
      const addButton = screen.getByRole('button', { name: /إضافة ترخيص جديد/i });
      fireEvent.click(addButton);

      expect(screen.getByLabelText(/اسم الترخيص/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/رقم الترخيص/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/نوع الترخيص/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/الشركة/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/تاريخ الإصدار/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/تاريخ الانتهاء/i)).toBeInTheDocument();
    });

    it('should validate license form fields', async () => {
      renderWithProviders(
        <Router>
          <LicensesPage />
        </Router>
      );

      // Open license form
      const addButton = screen.getByRole('button', { name: /إضافة ترخيص جديد/i });
      fireEvent.click(addButton);

      // Try to save without filling required fields
      const saveButton = screen.getByRole('button', { name: /حفظ/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText(/يرجى إدخال اسم الترخيص/i)).toBeInTheDocument();
        expect(screen.getByText(/يرجى إدخال رقم الترخيص/i)).toBeInTheDocument();
        expect(screen.getByText(/يرجى اختيار الشركة/i)).toBeInTheDocument();
      });
    });

    it('should save license successfully', async () => {
      const mockToast = vi.fn();
      (useToast as any).mockReturnValue({
        toast: mockToast,
      });

      renderWithProviders(
        <Router>
          <LicensesPage />
        </Router>
      );

      // Open license form
      const addButton = screen.getByRole('button', { name: /إضافة ترخيص جديد/i });
      fireEvent.click(addButton);

      // Fill form
      const nameInput = screen.getByLabelText(/اسم الترخيص/i);
      const numberInput = screen.getByLabelText(/رقم الترخيص/i);
      const companySelect = screen.getByLabelText(/الشركة/i);

      fireEvent.change(nameInput, { target: { value: 'ترخيص جديد' } });
      fireEvent.change(numberInput, { target: { value: 'LIC-2024-001' } });
      fireEvent.change(companySelect, { target: { value: 'company-1' } });

      // Save license
      const saveButton = screen.getByRole('button', { name: /حفظ/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'تم حفظ الترخيص بنجاح',
          })
        );
      });
    });
  });
}); 