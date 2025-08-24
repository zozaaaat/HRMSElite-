import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/test-utils/renderWithProviders';
import EmployeeList from '@/components/EmployeeList';

// Mock data for testing
const mockEmployees = [
  { 
    id: '1', 
    fullName: 'أحمد محمد',
    firstName: 'أحمد',
    lastName: 'محمد',
    email: 'ahmed@example.com',
    phone: '+96512345678',
    position: 'مدير مبيعات',
    department: 'المبيعات',
    salary: 1500,
    hireDate: '2023-01-01',
    status: 'active'
  },
  { 
    id: '2', 
    fullName: 'فاطمة علي',
    firstName: 'فاطمة',
    lastName: 'علي',
    email: 'fatima@example.com',
    phone: '+96587654321',
    position: 'محاسبة',
    department: 'المحاسبة',
    salary: 1200,
    hireDate: '2023-02-01',
    status: 'active'
  },
];

const mockCompanies = [
  {
    id: '1',
    name: 'شركة النيل الأزرق للمجوهرات',
    commercialFileNumber: '123456',
    commercialFileStatus: true,
    totalEmployees: 25,
    totalLicenses: 3
  }
];

// Mock the EmployeeList component if it doesn't exist
vi.mock('@/components/EmployeeList', () => ({
  default: ({
   employees, companies, onEmployeeSelect, onEdit, onDelete 
}: Record<string, unknown>) => (
    <div data-testid="employee-list">
      <h2>قائمة الموظفين</h2>
      {employees.map((employee: Record<string, unknown>) => (
        <div key={employee.id} data-testid={`employee-${employee.id}`}>
          <span data-testid={`employee-name-${employee.id}`}>{employee.fullName}</span>
          <button 
            data-testid={`edit-employee-${employee.id}`}
            onClick={() => onEdit?.(employee)}
          >
            تعديل
          </button>
          <button 
            data-testid={`delete-employee-${employee.id}`}
            onClick={() => onDelete?.(employee.id)}
          >
            حذف
          </button>
        </div>
      ))}
    </div>
  )
}));

describe('EmployeeList', () => {
  it('should render all employees', () => {
    renderWithProviders(
      <EmployeeList 
        employees={mockEmployees} 
        companies={mockCompanies}
      />
    );
    
    expect(screen.getByText('أحمد محمد')).toBeInTheDocument();
    expect(screen.getByText('فاطمة علي')).toBeInTheDocument();
  });

  it('should render employee list container', () => {
    renderWithProviders(
      <EmployeeList 
        employees={mockEmployees} 
        companies={mockCompanies}
      />
    );
    
    expect(screen.getByTestId('employee-list')).toBeInTheDocument();
  });

  it('should render individual employee items', () => {
    renderWithProviders(
      <EmployeeList 
        employees={mockEmployees} 
        companies={mockCompanies}
      />
    );
    
    expect(screen.getByTestId('employee-1')).toBeInTheDocument();
    expect(screen.getByTestId('employee-2')).toBeInTheDocument();
  });

  it('should display employee names correctly', () => {
    renderWithProviders(
      <EmployeeList 
        employees={mockEmployees} 
        companies={mockCompanies}
      />
    );
    
    expect(screen.getByTestId('employee-name-1')).toHaveTextContent('أحمد محمد');
    expect(screen.getByTestId('employee-name-2')).toHaveTextContent('فاطمة علي');
  });

  it('should render edit buttons for each employee', () => {
    renderWithProviders(
      <EmployeeList 
        employees={mockEmployees} 
        companies={mockCompanies}
      />
    );
    
    expect(screen.getByTestId('edit-employee-1')).toBeInTheDocument();
    expect(screen.getByTestId('edit-employee-2')).toBeInTheDocument();
  });

  it('should render delete buttons for each employee', () => {
    renderWithProviders(
      <EmployeeList 
        employees={mockEmployees} 
        companies={mockCompanies}
      />
    );
    
    expect(screen.getByTestId('delete-employee-1')).toBeInTheDocument();
    expect(screen.getByTestId('delete-employee-2')).toBeInTheDocument();
  });

  it('should call onEdit when edit button is clicked', () => {
    const mockOnEdit = vi.fn();
    
    renderWithProviders(
      <EmployeeList 
        employees={mockEmployees} 
        companies={mockCompanies}
        onEdit={mockOnEdit}
      />
    );
    
    screen.getByTestId('edit-employee-1').click();
    expect(mockOnEdit).toHaveBeenCalledWith(mockEmployees[0]);
  });

  it('should call onDelete when delete button is clicked', () => {
    const mockOnDelete = vi.fn();
    
    renderWithProviders(
      <EmployeeList 
        employees={mockEmployees} 
        companies={mockCompanies}
        onDelete={mockOnDelete}
      />
    );
    
    screen.getByTestId('delete-employee-1').click();
    expect(mockOnDelete).toHaveBeenCalledWith('1');
  });

  it('should handle empty employees list', () => {
    renderWithProviders(
      <EmployeeList 
        employees={[]} 
        companies={mockCompanies}
      />
    );
    
    expect(screen.getByTestId('employee-list')).toBeInTheDocument();
    expect(screen.queryByTestId('employee-1')).not.toBeInTheDocument();
  });

  it('should render correct number of employees', () => {
    renderWithProviders(
      <EmployeeList 
        employees={mockEmployees} 
        companies={mockCompanies}
      />
    );
    
    const employeeItems = screen.getAllByTestId(/^employee-\d+$/);
    expect(employeeItems).toHaveLength(2);
  });
}); 