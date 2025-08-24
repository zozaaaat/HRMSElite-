import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/test-utils/renderWithProviders';
import { CompanyCard } from '../src/components/company-card';
import { mockCompanyWithStats } from './mock-data';

// Mock the LoginModal component since we don't need to test it in this unit test
vi.mock('../src/components/login-modal', () => ({
  LoginModal: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => 
    isOpen ? <div data-testid="login-modal">Login Modal</div> : null,
}));

describe('CompanyCard', () => {
  const mockCompany = mockCompanyWithStats;

  it('يجب أن يعرض اسم الشركة بشكل صحيح', () => {
    renderWithProviders(<CompanyCard company={mockCompany} />);
    
    // التحقق من أن اسم الشركة يظهر في العنصر
    expect(screen.getByText('شركة النيل الأزرق للمجوهرات')).toBeInTheDocument();
  });

  it('يجب أن يعرض تصنيف الشركة', () => {
    renderWithProviders(<CompanyCard company={mockCompany} />);
    
    expect(screen.getByText('تجارة عامة')).toBeInTheDocument();
  });

  it('يجب أن يعرض عدد العمال', () => {
    renderWithProviders(<CompanyCard company={mockCompany} />);
    
    expect(screen.getByText('25')).toBeInTheDocument();
  });

  it('يجب أن يعرض عدد التراخيص', () => {
    renderWithProviders(<CompanyCard company={mockCompany} />);
    
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('يجب أن يعرض حالة الملف التجاري', () => {
    renderWithProviders(<CompanyCard company={mockCompany} />);
    
    // التحقق من وجود شارة "ساري" عندما تكون الحالة true
    expect(screen.getByText('ساري')).toBeInTheDocument();
  });

  it('يجب أن يعرض شارة "قريب الانتهاء" عندما تكون حالة الملف false', () => {
    const companyWithExpiredStatus = {
      ...mockCompany,
      commercialFileStatus: false,
    };
    
    renderWithProviders(<CompanyCard company={companyWithExpiredStatus} />);
    
    expect(screen.getByText('قريب الانتهاء')).toBeInTheDocument();
  });

  it('يجب أن يعرض الحروف الأولى من اسم الشركة في الشعار', () => {
    renderWithProviders(<CompanyCard company={mockCompany} />);
    
    // الحروف الأولى من "شركة النيل الأزرق للمجوهرات" هي "ش ا"
    expect(screen.getByText('ش ا')).toBeInTheDocument();
  });

  it('يجب أن يعرض زر "دخول إلى النظام"', () => {
    renderWithProviders(<CompanyCard company={mockCompany} />);
    
    expect(screen.getByText('دخول إلى النظام')).toBeInTheDocument();
  });
}); 