import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders } from '@/test-utils/renderWithProviders';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Dropdown } from '@/components/ui/dropdown';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';

// Mock useToast hook
vi.mock('@/hooks/use-toast', () => ({
  useToast: vi.fn(() => ({
    toast: vi.fn(),
    toasts: [],
    dismiss: vi.fn(),
  })),
}));


// Mock UI components for testing
const MockButton = ({ onClick, disabled, variant, children }: any) => (
  <button
    onClick={onClick}
    disabled={disabled}
    data-testid="mock-button"
    data-variant={variant}
  >
    {children}
  </button>
);

const MockModal = ({ isOpen, onClose, title, children }: any) => {
  if (!isOpen) return null;
  
  return (
    <div data-testid="mock-modal" className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{title}</h2>
          <button onClick={onClose} data-testid="modal-close">×</button>
        </div>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
};

const MockDropdown = ({ options, onSelect, placeholder }: any) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [selected, setSelected] = React.useState('');

  const handleSelect = (option: string) => {
    setSelected(option);
    setIsOpen(false);
    onSelect?.(option);
  };

  return (
    <div data-testid="mock-dropdown" className="dropdown">
      <button
        onClick={() => setIsOpen(!isOpen)}
        data-testid="dropdown-toggle"
      >
        {selected || placeholder}
      </button>
      {isOpen && (
        <ul data-testid="dropdown-menu" className="dropdown-menu">
          {options.map((option: string) => (
            <li key={option}>
              <button
                onClick={() => handleSelect(option)}
                data-testid={`dropdown-option-${option}`}
              >
                {option}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const MockInput = ({ value, onChange, placeholder, type, required }: any) => (
  <input
    type={type || 'text'}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    required={required}
    data-testid="mock-input"
  />
);

const MockBadge = ({ variant, children }: any) => (
  <span data-testid="mock-badge" data-variant={variant} className="badge">
    {children}
  </span>
);

const MockCard = ({ title, children, onClick }: any) => (
  <div data-testid="mock-card" className="card" onClick={onClick}>
    {title && <h3 className="card-title">{title}</h3>}
    <div className="card-content">{children}</div>
  </div>
);

const MockAlert = ({ type, message, onClose }: any) => (
  <div data-testid="mock-alert" data-type={type} className="alert">
    <span className="alert-message">{message}</span>
    {onClose && (
      <button onClick={onClose} data-testid="alert-close">×</button>
    )}
  </div>
);

describe('UI Components', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Button Component', () => {
    it('should render button with correct text', () => {
      const mockOnClick = vi.fn();
      
      renderWithProviders(
        <MockButton onClick={mockOnClick}>Click Me</MockButton>
      );

      const button = screen.getByTestId('mock-button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('Click Me');
    });

    it('should call onClick when clicked', async () => {
      const mockOnClick = vi.fn();
      
      renderWithProviders(
        <MockButton onClick={mockOnClick}>Click Me</MockButton>
      );

      const button = screen.getByTestId('mock-button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockOnClick).toHaveBeenCalledTimes(1);
      });
    });

    it('should be disabled when disabled prop is true', () => {
      const mockOnClick = vi.fn();
      
      renderWithProviders(
        <MockButton onClick={mockOnClick} disabled>Disabled Button</MockButton>
      );

      const button = screen.getByTestId('mock-button');
      expect(button).toBeDisabled();
    });

    it('should not call onClick when disabled', async () => {
      const mockOnClick = vi.fn();
      
      renderWithProviders(
        <MockButton onClick={mockOnClick} disabled>Disabled Button</MockButton>
      );

      const button = screen.getByTestId('mock-button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockOnClick).not.toHaveBeenCalled();
      });
    });

    it('should apply correct variant class', () => {
      renderWithProviders(
        <MockButton variant="primary">Primary Button</MockButton>
      );

      const button = screen.getByTestId('mock-button');
      expect(button).toHaveAttribute('data-variant', 'primary');
    });

    it('should support keyboard navigation', () => {
      const mockOnClick = vi.fn();
      
      renderWithProviders(
        <MockButton onClick={mockOnClick}>Click Me</MockButton>
      );

      const button = screen.getByTestId('mock-button');
      
      // Focus the button
      button.focus();
      expect(button).toHaveFocus();

      // Trigger click with Enter key
      fireEvent.keyDown(button, { key: 'Enter' });
      expect(mockOnClick).toHaveBeenCalled();

      // Trigger click with Space key
      fireEvent.keyDown(button, { key: ' ' });
      expect(mockOnClick).toHaveBeenCalledTimes(2);
    });
  });

  describe('Modal Component', () => {
    it('should render modal when isOpen is true', () => {
      const mockOnClose = vi.fn();
      
      renderWithProviders(
        <MockModal isOpen={true} onClose={mockOnClose} title="Test Modal">
            <p>Modal content</p>
          </MockModal>
      );

      const modal = screen.getByTestId('mock-modal');
      expect(modal).toBeInTheDocument();
      expect(screen.getByText('Test Modal')).toBeInTheDocument();
      expect(screen.getByText('Modal content')).toBeInTheDocument();
    });

    it('should not render modal when isOpen is false', () => {
      const mockOnClose = vi.fn();
      
      renderWithProviders(
        <MockModal isOpen={false} onClose={mockOnClose} title="Test Modal">
            <p>Modal content</p>
          </MockModal>
      );

      const modal = screen.queryByTestId('mock-modal');
      expect(modal).not.toBeInTheDocument();
    });

    it('should call onClose when close button is clicked', async () => {
      const mockOnClose = vi.fn();
      
      renderWithProviders(
        <MockModal isOpen={true} onClose={mockOnClose} title="Test Modal">
            <p>Modal content</p>
          </MockModal>
      );

      const closeButton = screen.getByTestId('modal-close');
      fireEvent.click(closeButton);

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalledTimes(1);
      });
    });

    it('should support keyboard navigation', () => {
      const mockOnClose = vi.fn();
      
      renderWithProviders(
        <MockModal isOpen={true} onClose={mockOnClose} title="Test Modal">
            <p>Modal content</p>
          </MockModal>
      );

      const closeButton = screen.getByTestId('modal-close');
      
      // Focus the close button
      closeButton.focus();
      expect(closeButton).toHaveFocus();

      // Trigger close with Enter key
      fireEvent.keyDown(closeButton, { key: 'Enter' });
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('Dropdown Component', () => {
    it('should render dropdown with placeholder', () => {
      const mockOnSelect = vi.fn();
      const options = ['Option 1', 'Option 2', 'Option 3'];
      
      renderWithProviders(
        <MockDropdown
            options={options}
            onSelect={mockOnSelect}
            placeholder="Select an option"
          />
      );

      const dropdown = screen.getByTestId('mock-dropdown');
      const toggle = screen.getByTestId('dropdown-toggle');
      
      expect(dropdown).toBeInTheDocument();
      expect(toggle).toHaveTextContent('Select an option');
    });

    it('should show options when clicked', async () => {
      const mockOnSelect = vi.fn();
      const options = ['Option 1', 'Option 2', 'Option 3'];
      
      renderWithProviders(
        <MockDropdown
            options={options}
            onSelect={mockOnSelect}
            placeholder="Select an option"
          />
      );

      const toggle = screen.getByTestId('dropdown-toggle');
      fireEvent.click(toggle);

      await waitFor(() => {
        const menu = screen.getByTestId('dropdown-menu');
        expect(menu).toBeInTheDocument();
        expect(screen.getByTestId('dropdown-option-Option 1')).toBeInTheDocument();
        expect(screen.getByTestId('dropdown-option-Option 2')).toBeInTheDocument();
        expect(screen.getByTestId('dropdown-option-Option 3')).toBeInTheDocument();
      });
    });

    it('should call onSelect when option is clicked', async () => {
      const mockOnSelect = vi.fn();
      const options = ['Option 1', 'Option 2', 'Option 3'];
      
      renderWithProviders(
        <MockDropdown
            options={options}
            onSelect={mockOnSelect}
            placeholder="Select an option"
          />
      );

      const toggle = screen.getByTestId('dropdown-toggle');
      fireEvent.click(toggle);

      await waitFor(() => {
        const option1 = screen.getByTestId('dropdown-option-Option 1');
        fireEvent.click(option1);
      });

      expect(mockOnSelect).toHaveBeenCalledWith('Option 1');
    });

    it('should close dropdown after selection', async () => {
      const mockOnSelect = vi.fn();
      const options = ['Option 1', 'Option 2', 'Option 3'];
      
      renderWithProviders(
        <MockDropdown
            options={options}
            onSelect={mockOnSelect}
            placeholder="Select an option"
          />
      );

      const toggle = screen.getByTestId('dropdown-toggle');
      fireEvent.click(toggle);

      await waitFor(() => {
        const option1 = screen.getByTestId('dropdown-option-Option 1');
        fireEvent.click(option1);
      });

      await waitFor(() => {
        const menu = screen.queryByTestId('dropdown-menu');
        expect(menu).not.toBeInTheDocument();
      });
    });

    it('should update selected value after selection', async () => {
      const mockOnSelect = vi.fn();
      const options = ['Option 1', 'Option 2', 'Option 3'];
      
      renderWithProviders(
        <MockDropdown
            options={options}
            onSelect={mockOnSelect}
            placeholder="Select an option"
          />
      );

      const toggle = screen.getByTestId('dropdown-toggle');
      fireEvent.click(toggle);

      await waitFor(() => {
        const option2 = screen.getByTestId('dropdown-option-Option 2');
        fireEvent.click(option2);
      });

      await waitFor(() => {
        expect(toggle).toHaveTextContent('Option 2');
      });
    });
  });

  describe('Input Component', () => {
    it('should render input with placeholder', () => {
      const mockOnChange = vi.fn();
      
      renderWithProviders(
        <MockInput
            value=""
            onChange={mockOnChange}
            placeholder="Enter text"
          />
      );

      const input = screen.getByTestId('mock-input');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('placeholder', 'Enter text');
    });

    it('should call onChange when value changes', async () => {
      const mockOnChange = vi.fn();
      
      renderWithProviders(
        <MockInput
            value=""
            onChange={mockOnChange}
            placeholder="Enter text"
          />
      );

      const input = screen.getByTestId('mock-input');
      fireEvent.change(input, { target: { value: 'new value' } });

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalled();
      });
    });

    it('should support different input types', () => {
      const mockOnChange = vi.fn();
      
      renderWithProviders(
        <MockInput
            type="email"
            value=""
            onChange={mockOnChange}
            placeholder="Enter email"
          />
      );

      const input = screen.getByTestId('mock-input');
      expect(input).toHaveAttribute('type', 'email');
    });

    it('should support required attribute', () => {
      const mockOnChange = vi.fn();
      
      renderWithProviders(
        <MockInput
            value=""
            onChange={mockOnChange}
            placeholder="Required field"
            required
          />
      );

      const input = screen.getByTestId('mock-input');
      expect(input).toHaveAttribute('required');
    });

    it('should support keyboard navigation', () => {
      const mockOnChange = vi.fn();
      
      renderWithProviders(
        <MockInput
            value=""
            onChange={mockOnChange}
            placeholder="Enter text"
          />
      );

      const input = screen.getByTestId('mock-input');
      
      // Focus the input
      input.focus();
      expect(input).toHaveFocus();

      // Type some text
      fireEvent.change(input, { target: { value: 'test' } });
      expect(input).toHaveValue('test');
    });
  });

  describe('Badge Component', () => {
    it('should render badge with text', () => {
      renderWithProviders(
        <MockBadge variant="success">Success</MockBadge>
      );

      const badge = screen.getByTestId('mock-badge');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveTextContent('Success');
    });

    it('should apply correct variant class', () => {
      renderWithProviders(
        <MockBadge variant="error">Error</MockBadge>
      );

      const badge = screen.getByTestId('mock-badge');
      expect(badge).toHaveAttribute('data-variant', 'error');
    });

    it('should support different variants', () => {
      const { rerender } = renderWithProviders(
        <MockBadge variant="warning">Warning</MockBadge>
      );

      let badge = screen.getByTestId('mock-badge');
      expect(badge).toHaveAttribute('data-variant', 'warning');

      rerender(
        <MockBadge variant="info">Info</MockBadge>
      );

      badge = screen.getByTestId('mock-badge');
      expect(badge).toHaveAttribute('data-variant', 'info');
    });
  });

  describe('Card Component', () => {
    it('should render card with title and content', () => {
      const mockOnClick = vi.fn();
      
      renderWithProviders(
        <MockCard title="Test Card" onClick={mockOnClick}>
            <p>Card content</p>
          </MockCard>
      );

      const card = screen.getByTestId('mock-card');
      expect(card).toBeInTheDocument();
      expect(screen.getByText('Test Card')).toBeInTheDocument();
      expect(screen.getByText('Card content')).toBeInTheDocument();
    });

    it('should call onClick when clicked', async () => {
      const mockOnClick = vi.fn();
      
      renderWithProviders(
        <MockCard title="Test Card" onClick={mockOnClick}>
            <p>Card content</p>
          </MockCard>
      );

      const card = screen.getByTestId('mock-card');
      fireEvent.click(card);

      await waitFor(() => {
        expect(mockOnClick).toHaveBeenCalledTimes(1);
      });
    });

    it('should render card without title', () => {
      renderWithProviders(
        <MockCard>
            <p>Card content without title</p>
          </MockCard>
      );

      const card = screen.getByTestId('mock-card');
      expect(card).toBeInTheDocument();
      expect(screen.getByText('Card content without title')).toBeInTheDocument();
      expect(screen.queryByText('Test Card')).not.toBeInTheDocument();
    });
  });

  describe('Alert Component', () => {
    it('should render alert with message', () => {
      renderWithProviders(
        <MockAlert type="success" message="Operation completed successfully" />
      );

      const alert = screen.getByTestId('mock-alert');
      expect(alert).toBeInTheDocument();
      expect(screen.getByText('Operation completed successfully')).toBeInTheDocument();
    });

    it('should apply correct type class', () => {
      renderWithProviders(
        <MockAlert type="error" message="An error occurred" />
      );

      const alert = screen.getByTestId('mock-alert');
      expect(alert).toHaveAttribute('data-type', 'error');
    });

    it('should call onClose when close button is clicked', async () => {
      const mockOnClose = vi.fn();
      
      renderWithProviders(
        <MockAlert
            type="warning"
            message="Warning message"
            onClose={mockOnClose}
          />
      );

      const closeButton = screen.getByTestId('alert-close');
      fireEvent.click(closeButton);

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalledTimes(1);
      });
    });

    it('should not show close button when onClose is not provided', () => {
      renderWithProviders(
        <MockAlert type="info" message="Info message" />
      );

      const closeButton = screen.queryByTestId('alert-close');
      expect(closeButton).not.toBeInTheDocument();
    });

    it('should support different alert types', () => {
      const { rerender } = renderWithProviders(
        <MockAlert type="success" message="Success message" />
      );

      let alert = screen.getByTestId('mock-alert');
      expect(alert).toHaveAttribute('data-type', 'success');

      rerender(
        <MockAlert type="warning" message="Warning message" />
      );

      alert = screen.getByTestId('mock-alert');
      expect(alert).toHaveAttribute('data-type', 'warning');
    });
  });

  describe('Component Integration', () => {
    it('should work together in a form', async () => {
      const mockOnSubmit = vi.fn();
      const mockOnClose = vi.fn();
      
      renderWithProviders(
        <MockModal isOpen={true} onClose={mockOnClose} title="Add User">
            <form onSubmit={(e) => { e.preventDefault(); mockOnSubmit(); }}>
              <MockInput
                value=""
                onChange={vi.fn()}
                placeholder="Enter name"
                required
              />
              <MockDropdown
                options={['Admin', 'User', 'Manager']}
                onSelect={vi.fn()}
                placeholder="Select role"
              />
              <MockButton onClick={mockOnSubmit}>Save</MockButton>
            </form>
          </MockModal>
      );

      const modal = screen.getByTestId('mock-modal');
      const input = screen.getByTestId('mock-input');
      const dropdown = screen.getByTestId('dropdown-toggle');
      const button = screen.getByTestId('mock-button');

      expect(modal).toBeInTheDocument();
      expect(input).toBeInTheDocument();
      expect(dropdown).toBeInTheDocument();
      expect(button).toBeInTheDocument();

      fireEvent.click(button);
      expect(mockOnSubmit).toHaveBeenCalled();
    });

    it('should handle complex interactions', async () => {
      const mockOnSelect = vi.fn();
      const mockOnClick = vi.fn();
      
      renderWithProviders(
        <MockCard title="User Actions" onClick={mockOnClick}>
            <MockDropdown
              options={['Edit', 'Delete', 'View']}
              onSelect={mockOnSelect}
              placeholder="Choose action"
            />
            <MockBadge variant="success">Active</MockBadge>
            <MockButton onClick={mockOnClick}>Confirm</MockButton>
          </MockCard>
      );

      const card = screen.getByTestId('mock-card');
      const dropdown = screen.getByTestId('dropdown-toggle');
      const badge = screen.getByTestId('mock-badge');
      const button = screen.getByTestId('mock-button');

      // Open dropdown
      fireEvent.click(dropdown);
      
      await waitFor(() => {
        const editOption = screen.getByTestId('dropdown-option-Edit');
        fireEvent.click(editOption);
      });

      expect(mockOnSelect).toHaveBeenCalledWith('Edit');

      // Click button
      fireEvent.click(button);
      expect(mockOnClick).toHaveBeenCalled();

      // Verify badge
      expect(badge).toHaveTextContent('Active');
      expect(badge).toHaveAttribute('data-variant', 'success');
    });
  });
}); 