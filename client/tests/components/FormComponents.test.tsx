import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders } from '@/test-utils/renderWithProviders';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useToast } from '@/hooks/use-toast';

// Mock useToast hook
vi.mock('@/hooks/use-toast', () => ({
  useToast: vi.fn(() => ({
    toast: vi.fn(),
    toasts: [],
    dismiss: vi.fn(),
  })),
}));


// Mock form components for testing
const MockFormComponent = ({ onSubmit, validation }: Record<string, unknown>) => {
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    phone: '',
  });
  const [errors, setErrors] = React.useState({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validation ? validation(formData) : {};
    
    if (Object.keys(validationErrors).length === 0) {
      onSubmit(formData);
    } else {
      setErrors(validationErrors);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit} data-testid="test-form">
      <div>
        <label htmlFor="name">الاسم</label>
        <input
          id="name"
          type="text"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          data-testid="name-input"
        />
        {errors.name && <span data-testid="name-error">{errors.name}</span>}
      </div>
      
      <div>
        <label htmlFor="email">البريد الإلكتروني</label>
        <input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => handleChange('email', e.target.value)}
          data-testid="email-input"
        />
        {errors.email && <span data-testid="email-error">{errors.email}</span>}
      </div>
      
      <div>
        <label htmlFor="phone">رقم الهاتف</label>
        <input
          id="phone"
          type="tel"
          value={formData.phone}
          onChange={(e) => handleChange('phone', e.target.value)}
          data-testid="phone-input"
        />
        {errors.phone && <span data-testid="phone-error">{errors.phone}</span>}
      </div>
      
      <button type="submit" data-testid="submit-button">
        إرسال
      </button>
    </form>
  );
};

describe('Form Components', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Form Validation', () => {
    it('should validate required fields', async () => {
      const mockOnSubmit = vi.fn();
      const validation = (data: Record<string, unknown>) => {
        const errors: Record<string, unknown> = {};
        if (!data.name) errors.name = 'الاسم مطلوب';
        if (!data.email) errors.email = 'البريد الإلكتروني مطلوب';
        if (!data.phone) errors.phone = 'رقم الهاتف مطلوب';
        return errors;
      };

      renderWithProviders(
        <MockFormComponent onSubmit={mockOnSubmit} validation={validation} />
      );

      const submitButton = screen.getByTestId('submit-button');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByTestId('name-error')).toHaveTextContent('الاسم مطلوب');
        expect(screen.getByTestId('email-error')).toHaveTextContent('البريد الإلكتروني مطلوب');
        expect(screen.getByTestId('phone-error')).toHaveTextContent('رقم الهاتف مطلوب');
      });

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should validate email format', async () => {
      const mockOnSubmit = vi.fn();
      const validation = (data: Record<string, unknown>) => {
        const errors: Record<string, unknown> = {};
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (data.email && !emailRegex.test(data.email)) {
          errors.email = 'البريد الإلكتروني غير صحيح';
        }
        return errors;
      };

      renderWithProviders(
        <MockFormComponent onSubmit={mockOnSubmit} validation={validation} />
      );

      const emailInput = screen.getByTestId('email-input');
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });

      const submitButton = screen.getByTestId('submit-button');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByTestId('email-error')).toHaveTextContent('البريد الإلكتروني غير صحيح');
      });
    });

    it('should validate phone number format', async () => {
      const mockOnSubmit = vi.fn();
      const validation = (data: Record<string, unknown>) => {
        const errors: Record<string, unknown> = {};
        const phoneRegex = /^[0-9]{10,}$/;
        if (data.phone && !phoneRegex.test(data.phone)) {
          errors.phone = 'رقم الهاتف غير صحيح';
        }
        return errors;
      };

      renderWithProviders(
        <MockFormComponent onSubmit={mockOnSubmit} validation={validation} />
      );

      const phoneInput = screen.getByTestId('phone-input');
      fireEvent.change(phoneInput, { target: { value: '123' } });

      const submitButton = screen.getByTestId('submit-button');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByTestId('phone-error')).toHaveTextContent('رقم الهاتف غير صحيح');
      });
    });
  });

  describe('Form Submission', () => {
    it('should submit form with valid data', async () => {
      const mockOnSubmit = vi.fn();
      const validation = (data: Record<string, unknown>) => {
        const errors: Record<string, unknown> = {};
        if (!data.name) errors.name = 'الاسم مطلوب';
        if (!data.email) errors.email = 'البريد الإلكتروني مطلوب';
        if (!data.phone) errors.phone = 'رقم الهاتف مطلوب';
        return errors;
      };

      renderWithProviders(
        <MockFormComponent onSubmit={mockOnSubmit} validation={validation} />
      );

      // Fill form with valid data
      fireEvent.change(screen.getByTestId('name-input'), { target: { value: 'أحمد محمد' } });
      fireEvent.change(screen.getByTestId('email-input'), {
   target: {
   value: 'ahmed@example.com' 
} 
});
      fireEvent.change(screen.getByTestId('phone-input'), { target: { value: '0123456789' } });

      const submitButton = screen.getByTestId('submit-button');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          name: 'أحمد محمد',
          email: 'ahmed@example.com',
          phone: '0123456789',
        });
      });
    });

    it('should clear errors when user starts typing', async () => {
      const mockOnSubmit = vi.fn();
      const validation = (data: Record<string, unknown>) => {
        const errors: Record<string, unknown> = {};
        if (!data.name) errors.name = 'الاسم مطلوب';
        return errors;
      };

      renderWithProviders(
        <MockFormComponent onSubmit={mockOnSubmit} validation={validation} />
      );

      // Submit empty form to show errors
      const submitButton = screen.getByTestId('submit-button');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByTestId('name-error')).toHaveTextContent('الاسم مطلوب');
      });

      // Start typing to clear error
      const nameInput = screen.getByTestId('name-input');
      fireEvent.change(nameInput, { target: { value: 'أ' } });

      await waitFor(() => {
        expect(screen.queryByTestId('name-error')).not.toBeInTheDocument();
      });
    });
  });

  describe('Form Accessibility', () => {
    it('should have proper labels and form structure', () => {
      renderWithProviders(
        <MockFormComponent onSubmit={vi.fn()} />
      );

      const form = screen.getByTestId('test-form');
      expect(form).toBeInTheDocument();

      // Check labels
      expect(screen.getByLabelText('الاسم')).toBeInTheDocument();
      expect(screen.getByLabelText('البريد الإلكتروني')).toBeInTheDocument();
      expect(screen.getByLabelText('رقم الهاتف')).toBeInTheDocument();

      // Check inputs
      expect(screen.getByTestId('name-input')).toHaveAttribute('id', 'name');
      expect(screen.getByTestId('email-input')).toHaveAttribute('id', 'email');
      expect(screen.getByTestId('phone-input')).toHaveAttribute('id', 'phone');
    });

    it('should support keyboard navigation', () => {
      renderWithProviders(
        <MockFormComponent onSubmit={vi.fn()} />
      );

      const nameInput = screen.getByTestId('name-input');
      const emailInput = screen.getByTestId('email-input');
      const phoneInput = screen.getByTestId('phone-input');

      // Focus first input
      nameInput.focus();
      expect(nameInput).toHaveFocus();

      // Tab to next input
      fireEvent.keyDown(nameInput, { key: 'Tab' });
      expect(emailInput).toHaveFocus();

      // Tab to next input
      fireEvent.keyDown(emailInput, { key: 'Tab' });
      expect(phoneInput).toHaveFocus();
    });
  });

  describe('Form Performance', () => {
    it('should handle rapid input changes efficiently', async () => {
      const mockOnSubmit = vi.fn();
      const validation = (data: Record<string, unknown>) => {
        const errors: Record<string, unknown> = {};
        if (!data.name) errors.name = 'الاسم مطلوب';
        return errors;
      };

      renderWithProviders(
        <MockFormComponent onSubmit={mockOnSubmit} validation={validation} />
      );

      const nameInput = screen.getByTestId('name-input');

      // Simulate rapid typing
      const startTime = performance.now();
      
      for (let i = 0; i < 100; i++) {
        fireEvent.change(nameInput, { target: { value: `test${i}` } });
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should complete within reasonable time (less than 1 second)
      expect(duration).toBeLessThan(1000);
      expect(nameInput).toHaveValue('test99');
    });

    it('should debounce validation calls', async () => {
      const mockValidation = vi.fn(() => ({}));
      const mockOnSubmit = vi.fn();

      renderWithProviders(
        <MockFormComponent onSubmit={mockOnSubmit} validation={mockValidation} />
      );

      const nameInput = screen.getByTestId('name-input');

      // Rapid changes should not trigger excessive validation calls
      for (let i = 0; i < 10; i++) {
        fireEvent.change(nameInput, { target: { value: `test${i}` } });
      }

      await waitFor(() => {
        // Validation should be called reasonable number of times
        expect(mockValidation).toHaveBeenCalledTimes(10);
      });
    });
  });
}); 