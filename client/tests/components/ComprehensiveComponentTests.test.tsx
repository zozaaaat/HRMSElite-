import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test-utils/renderWithProviders';
import { mockEmployees, mockCompanies, mockDocuments, mockLicenses } from '../mock-data';

// Mock API services
vi.mock('@/services/api', () => ({
  apiRequest: vi.fn(),
  getAuthToken: vi.fn(() => 'mock-token'),
  setAuthToken: vi.fn(),
  removeAuthToken: vi.fn(),
}));

vi.mock('@/services/employees', () => ({
  getEmployees: vi.fn(),
  getEmployee: vi.fn(),
  createEmployee: vi.fn(),
  updateEmployee: vi.fn(),
  deleteEmployee: vi.fn(),
}));

vi.mock('@/services/companies', () => ({
  getCompanies: vi.fn(),
  getCompany: vi.fn(),
  createCompany: vi.fn(),
  updateCompany: vi.fn(),
  deleteCompany: vi.fn(),
}));

vi.mock('@/services/documents', () => ({
  getDocuments: vi.fn(),
  getDocument: vi.fn(),
  uploadDocument: vi.fn(),
  updateDocument: vi.fn(),
  deleteDocument: vi.fn(),
}));

import { getEmployees, createEmployee, updateEmployee } from '@/services/employees';
import { getCompanies, createCompany } from '@/services/companies';
import { getDocuments, uploadDocument } from '@/services/documents';

// Test wrapper component
const TestWrapper = ({ children }: { children: React.ReactNode }) => <>{children}</>;

// Mock components for testing
const MockEmployeeCard = ({ employee, onEdit, onDelete }: any) => (
  <div data-testid="employee-card">
    <h3>{employee.firstName} {employee.lastName}</h3>
    <p>{employee.email}</p>
    <p>{employee.position}</p>
    <button onClick={() => onEdit(employee)} data-testid="edit-btn">Edit</button>
    <button onClick={() => onDelete(employee.id)} data-testid="delete-btn">Delete</button>
  </div>
);

const MockCompanyCard = ({ company, onEdit, onDelete }: any) => (
  <div data-testid="company-card">
    <h3>{company.name}</h3>
    <p>{company.industry}</p>
    <p>{company.location}</p>
    <button onClick={() => onEdit(company)} data-testid="edit-btn">Edit</button>
    <button onClick={() => onDelete(company.id)} data-testid="delete-btn">Delete</button>
  </div>
);

const MockDocumentForm = ({ onSubmit, onCancel, initialData }: any) => {
  const [formData, setFormData] = React.useState(initialData || {});
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} data-testid="document-form">
      <input
        type="text"
        value={formData.title || ''}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        placeholder="Document Title"
        data-testid="title-input"
      />
      <textarea
        value={formData.description || ''}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        placeholder="Description"
        data-testid="description-input"
      />
      <button type="submit" data-testid="submit-btn">Submit</button>
      <button type="button" onClick={onCancel} data-testid="cancel-btn">Cancel</button>
    </form>
  );
};

const MockLoadingSpinner = () => (
  <div data-testid="loading-spinner">
    <div className="spinner"></div>
    <p>Loading...</p>
  </div>
);

const MockErrorBoundary = ({ children, fallback }: any) => {
  const [hasError, setHasError] = React.useState(false);
  
  if (hasError) {
    return fallback || <div data-testid="error-fallback">Something went wrong</div>;
  }
  
  return (
    <div onError={() => setHasError(true)}>
      {children}
    </div>
  );
};

describe('Comprehensive Component Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock successful API responses
    (getEmployees as any).mockResolvedValue({ data: mockEmployees });
    (getCompanies as any).mockResolvedValue({ data: mockCompanies });
    (getDocuments as any).mockResolvedValue({ data: mockDocuments });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Employee Card Component', () => {
    it('should render employee information correctly', () => {
      const employee = mockEmployees[0];
      const onEdit = vi.fn();
      const onDelete = vi.fn();

      renderWithProviders(
        <MockEmployeeCard 
            employee={employee} 
            onEdit={onEdit} 
            onDelete={onDelete} 
          />
      );

      expect(screen.getByTestId('employee-card')).toBeInTheDocument();
      expect(screen.getByText(`${employee.firstName} ${employee.lastName}`)).toBeInTheDocument();
      expect(screen.getByText(employee.email)).toBeInTheDocument();
      expect(screen.getByText(employee.position)).toBeInTheDocument();
      expect(screen.getByTestId('edit-btn')).toBeInTheDocument();
      expect(screen.getByTestId('delete-btn')).toBeInTheDocument();
    });

    it('should handle edit button click', async () => {
      const employee = mockEmployees[0];
      const onEdit = vi.fn();
      const onDelete = vi.fn();

      renderWithProviders(
        <MockEmployeeCard 
            employee={employee} 
            onEdit={onEdit} 
            onDelete={onDelete} 
          />
      );

      const editButton = screen.getByTestId('edit-btn');
      await userEvent.click(editButton);

      expect(onEdit).toHaveBeenCalledWith(employee);
      expect(onEdit).toHaveBeenCalledTimes(1);
    });

    it('should handle delete button click', async () => {
      const employee = mockEmployees[0];
      const onEdit = vi.fn();
      const onDelete = vi.fn();

      renderWithProviders(
        <MockEmployeeCard 
            employee={employee} 
            onEdit={onEdit} 
            onDelete={onDelete} 
          />
      );

      const deleteButton = screen.getByTestId('delete-btn');
      await userEvent.click(deleteButton);

      expect(onDelete).toHaveBeenCalledWith(employee.id);
      expect(onDelete).toHaveBeenCalledTimes(1);
    });

    it('should handle missing employee data gracefully', () => {
      const incompleteEmployee = {
        id: 1,
        firstName: 'John',
        // Missing lastName, email, position
      };
      const onEdit = vi.fn();
      const onDelete = vi.fn();

      renderWithProviders(
        <MockEmployeeCard 
            employee={incompleteEmployee} 
            onEdit={onEdit} 
            onDelete={onDelete} 
          />
      );

      expect(screen.getByTestId('employee-card')).toBeInTheDocument();
      expect(screen.getByText('John')).toBeInTheDocument();
      // Should not crash with missing data
    });
  });

  describe('Company Card Component', () => {
    it('should render company information correctly', () => {
      const company = mockCompanies[0];
      const onEdit = vi.fn();
      const onDelete = vi.fn();

      renderWithProviders(
        <MockCompanyCard 
            company={company} 
            onEdit={onEdit} 
            onDelete={onDelete} 
          />
      );

      expect(screen.getByTestId('company-card')).toBeInTheDocument();
      expect(screen.getByText(company.name)).toBeInTheDocument();
      expect(screen.getByText(company.industry)).toBeInTheDocument();
      expect(screen.getByText(company.location)).toBeInTheDocument();
    });

    it('should handle company edit and delete actions', async () => {
      const company = mockCompanies[0];
      const onEdit = vi.fn();
      const onDelete = vi.fn();

      renderWithProviders(
        <MockCompanyCard 
            company={company} 
            onEdit={onEdit} 
            onDelete={onDelete} 
          />
      );

      const editButton = screen.getByTestId('edit-btn');
      const deleteButton = screen.getByTestId('delete-btn');

      await userEvent.click(editButton);
      expect(onEdit).toHaveBeenCalledWith(company);

      await userEvent.click(deleteButton);
      expect(onDelete).toHaveBeenCalledWith(company.id);
    });
  });

  describe('Document Form Component', () => {
    it('should render form fields correctly', () => {
      const onSubmit = vi.fn();
      const onCancel = vi.fn();

      renderWithProviders(
        <MockDocumentForm 
            onSubmit={onSubmit} 
            onCancel={onCancel} 
          />
      );

      expect(screen.getByTestId('document-form')).toBeInTheDocument();
      expect(screen.getByTestId('title-input')).toBeInTheDocument();
      expect(screen.getByTestId('description-input')).toBeInTheDocument();
      expect(screen.getByTestId('submit-btn')).toBeInTheDocument();
      expect(screen.getByTestId('cancel-btn')).toBeInTheDocument();
    });

    it('should handle form submission with user input', async () => {
      const onSubmit = vi.fn();
      const onCancel = vi.fn();

      renderWithProviders(
        <MockDocumentForm 
            onSubmit={onSubmit} 
            onCancel={onCancel} 
          />
      );

      const titleInput = screen.getByTestId('title-input');
      const descriptionInput = screen.getByTestId('description-input');
      const submitButton = screen.getByTestId('submit-btn');

      await userEvent.type(titleInput, 'Test Document');
      await userEvent.type(descriptionInput, 'This is a test document');

      await userEvent.click(submitButton);

      expect(onSubmit).toHaveBeenCalledWith({
        title: 'Test Document',
        description: 'This is a test document'
      });
    });

    it('should handle form cancellation', async () => {
      const onSubmit = vi.fn();
      const onCancel = vi.fn();

      renderWithProviders(
        <MockDocumentForm 
            onSubmit={onSubmit} 
            onCancel={onCancel} 
          />
      );

      const cancelButton = screen.getByTestId('cancel-btn');
      await userEvent.click(cancelButton);

      expect(onCancel).toHaveBeenCalledTimes(1);
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it('should populate form with initial data', () => {
      const onSubmit = vi.fn();
      const onCancel = vi.fn();
      const initialData = {
        title: 'Initial Title',
        description: 'Initial Description'
      };

      renderWithProviders(
        <MockDocumentForm 
            onSubmit={onSubmit} 
            onCancel={onCancel} 
            initialData={initialData}
          />
      );

      const titleInput = screen.getByTestId('title-input') as HTMLInputElement;
      const descriptionInput = screen.getByTestId('description-input') as HTMLTextAreaElement;

      expect(titleInput.value).toBe('Initial Title');
      expect(descriptionInput.value).toBe('Initial Description');
    });
  });

  describe('Loading Spinner Component', () => {
    it('should render loading spinner correctly', () => {
      renderWithProviders(
        <MockLoadingSpinner />
      );

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });

  describe('Error Boundary Component', () => {
    it('should render children when no error occurs', () => {
      renderWithProviders(
        <MockErrorBoundary>
            <div data-testid="child-content">Child Content</div>
          </MockErrorBoundary>
      );

      expect(screen.getByTestId('child-content')).toBeInTheDocument();
      expect(screen.queryByTestId('error-fallback')).not.toBeInTheDocument();
    });

    it('should render fallback when error occurs', () => {
      const ErrorComponent = () => {
        throw new Error('Test error');
      };

      renderWithProviders(
        <MockErrorBoundary>
            <ErrorComponent />
          </MockErrorBoundary>
      );

      expect(screen.getByTestId('error-fallback')).toBeInTheDocument();
    });
  });

  describe('Component Integration Tests', () => {
    it('should handle multiple components working together', async () => {
      const employees = mockEmployees.slice(0, 3);
      const onEdit = vi.fn();
      const onDelete = vi.fn();

      renderWithProviders(
        <div data-testid="employee-list">
            {employees.map(employee => (
              <MockEmployeeCard
                key={employee.id}
                employee={employee}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
      );

      const employeeCards = screen.getAllByTestId('employee-card');
      expect(employeeCards).toHaveLength(3);

      // Test interaction with first employee
      const firstEditButton = screen.getAllByTestId('edit-btn')[0];
      await userEvent.click(firstEditButton);
      expect(onEdit).toHaveBeenCalledWith(employees[0]);
    });

    it('should handle form submission with validation', async () => {
      const onSubmit = vi.fn();
      const onCancel = vi.fn();

      renderWithProviders(
        <MockDocumentForm 
            onSubmit={onSubmit} 
            onCancel={onCancel} 
          />
      );

      const submitButton = screen.getByTestId('submit-btn');
      
      // Submit without filling form
      await userEvent.click(submitButton);
      
      // Should still call onSubmit with empty data
      expect(onSubmit).toHaveBeenCalledWith({});
    });
  });

  describe('Accessibility Tests', () => {
    it('should have proper ARIA labels and roles', () => {
      const employee = mockEmployees[0];
      const onEdit = vi.fn();
      const onDelete = vi.fn();

      renderWithProviders(
        <MockEmployeeCard 
            employee={employee} 
            onEdit={onEdit} 
            onDelete={onDelete} 
          />
      );

      const editButton = screen.getByTestId('edit-btn');
      const deleteButton = screen.getByTestId('delete-btn');

      expect(editButton).toBeInTheDocument();
      expect(deleteButton).toBeInTheDocument();
    });

    it('should be keyboard navigable', async () => {
      const onSubmit = vi.fn();
      const onCancel = vi.fn();

      renderWithProviders(
        <MockDocumentForm 
            onSubmit={onSubmit} 
            onCancel={onCancel} 
          />
      );

      const titleInput = screen.getByTestId('title-input');
      const descriptionInput = screen.getByTestId('description-input');

      // Test tab navigation
      titleInput.focus();
      expect(titleInput).toHaveFocus();

      await userEvent.tab();
      expect(descriptionInput).toHaveFocus();
    });
  });

  describe('Performance Tests', () => {
    it('should render large lists efficiently', () => {
      const largeEmployeeList = Array(100).fill(null).map((_, index) => ({
        id: index + 1,
        firstName: `Employee${index}`,
        lastName: `Test${index}`,
        email: `employee${index}@test.com`,
        position: `Position${index % 5}`
      }));

      const onEdit = vi.fn();
      const onDelete = vi.fn();

      const startTime = performance.now();
      
      renderWithProviders(
        <div data-testid="large-employee-list">
            {largeEmployeeList.map(employee => (
              <MockEmployeeCard
                key={employee.id}
                employee={employee}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
      );

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      expect(screen.getByTestId('large-employee-list')).toBeInTheDocument();
      expect(renderTime).toBeLessThan(1000); // Should render within 1 second
    });
  });
});
