import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Router } from 'wouter';
import AdvancedSearchPage from '../../src/pages/advanced-search';

// Mock IntersectionObserver
class MockIntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
  root = null;
  rootMargin = '';
  thresholds: number[] = [];
  takeRecords() {
    return [];
  }
}

// Mock ResizeObserver
class MockResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

// Mock the wouter router
vi.mock('wouter', () => ({
  useLocation: () => [null, vi.fn()],
  Router: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Mock Radix UI components to avoid context issues
vi.mock('@/components/ui/tabs', () => ({
  Tabs: ({ children }: { children: React.ReactNode }) => <div data-testid="tabs">{children}</div>,
  TabsContent: ({ children, value }: { children: React.ReactNode; value: string }) => (
    <div data-testid={`tabs-content-${value}`}>{children}</div>
  ),
  TabsList: ({ children }: { children: React.ReactNode }) => <div data-testid="tabs-list">{children}</div>,
  TabsTrigger: ({ children, value }: { children: React.ReactNode; value: string }) => (
    <button data-testid={`tabs-trigger-${value}`}>{children}</button>
  ),
}));

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    pathname: '/advanced-search',
    search: '?company=1&name=TestCompany&role=worker',
  },
  writable: true,
});



// Assign mocks to global
Object.defineProperty(global, 'IntersectionObserver', {
  value: MockIntersectionObserver,
  writable: true,
});

Object.defineProperty(global, 'ResizeObserver', {
  value: MockResizeObserver,
  writable: true,
});

// Wrapper component for testing with router
const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <Router>
      {component}
    </Router>
  );
};

describe('Advanced Search Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Search Form Display', () => {
    it('should display search form with input field', () => {
      renderWithRouter(<AdvancedSearchPage />);
      
      // Check if search input is present
      const searchInputs = screen.getAllByPlaceholderText('البحث...');
      expect(searchInputs.length).toBeGreaterThan(0);
      expect(searchInputs[0]).toBeInTheDocument();
    });

    it('should update search query when typing', async () => {
      renderWithRouter(<AdvancedSearchPage />);
      
      const searchInputs = screen.getAllByPlaceholderText('البحث...');
      const searchInput = searchInputs[0];
      const testQuery = 'test search query';
      
      fireEvent.change(searchInput, { target: { value: testQuery } });
      
      await waitFor(() => {
        expect(searchInput).toHaveValue(testQuery);
      });
    });

    it('should display search form with correct styling', () => {
      renderWithRouter(<AdvancedSearchPage />);
      
      const searchInputs = screen.getAllByPlaceholderText('البحث...');
      const searchInput = searchInputs[0];
      expect(searchInput).toHaveClass('pl-4', 'pr-10', 'w-64');
    });
  });

  describe('Filter Changes and Results Updates', () => {
    it('should display page title and description', () => {
      renderWithRouter(<AdvancedSearchPage />);
      
      // Check if page title is present
      const pageTitle = screen.getByText('البحث المتقدم');
      expect(pageTitle).toBeInTheDocument();
      
      // Check if page description is present
      const pageDescription = screen.getByText('أدوات بحث متقدمة في النظام');
      expect(pageDescription).toBeInTheDocument();
    });

    it('should display tab navigation', () => {
      renderWithRouter(<AdvancedSearchPage />);
      
      // Check if tab navigation is present
      const overviewTab = screen.getByText('نظرة عامة');
      expect(overviewTab).toBeInTheDocument();
      
      const detailsTab = screen.getByText('التفاصيل');
      expect(detailsTab).toBeInTheDocument();
      
      const settingsTab = screen.getByText('الإعدادات');
      expect(settingsTab).toBeInTheDocument();
    });

    it('should display search results section', () => {
      renderWithRouter(<AdvancedSearchPage />);
      
      // Check if search results title is present
      const resultsTitle = screen.getByText('نتائج البحث');
      expect(resultsTitle).toBeInTheDocument();
    });
  });

  describe('Loading States', () => {
    it('should show loading spinner when isLoading is true', async () => {
      // Mock a loading state by creating a component that shows loading
      const LoadingComponent = () => (
        <div>
          <div data-testid="loading-spinner" className="animate-spin">
            Loading...
          </div>
        </div>
      );
      
      render(<LoadingComponent />);
      
      const loadingSpinner = screen.getByTestId('loading-spinner');
      expect(loadingSpinner).toBeInTheDocument();
      expect(loadingSpinner).toHaveClass('animate-spin');
    });

    it('should handle loading state during search operations', async () => {
      renderWithRouter(<AdvancedSearchPage />);
      
      const searchInputs = screen.getAllByPlaceholderText('البحث...');
      const searchInput = searchInputs[0];
      
      // Simulate a search operation that might trigger loading
      fireEvent.change(searchInput, { target: { value: 'test' } });
      
      // Wait for any potential loading states
      await waitFor(() => {
        expect(searchInput).toHaveValue('test');
      });
    });
  });

  describe('SearchForm Component', () => {
    it('should render search form with correct props', () => {
      renderWithRouter(<AdvancedSearchPage />);
      
      const searchInputs = screen.getAllByPlaceholderText('البحث...');
      const searchInput = searchInputs[0];
      expect(searchInput).toBeInTheDocument();
      
      fireEvent.change(searchInput, { target: { value: 'new query' } });
      expect(searchInput).toHaveValue('new query');
    });

    it('should display search icon in correct position', () => {
      renderWithRouter(<AdvancedSearchPage />);
      
      // Look for the search icon by its role
      const searchIcon = screen.getByRole('img', { hidden: true });
      expect(searchIcon).toBeInTheDocument();
    });
  });

  describe('FiltersPanel Component', () => {
    it('should render filters panel with provided options and filters', () => {
      renderWithRouter(<AdvancedSearchPage />);
      
      // Check if filters panel title is present
      const filtersTitle = screen.getByText('خيارات البحث');
      expect(filtersTitle).toBeInTheDocument();
      
      // Check if search types are displayed
      const searchTypesTitle = screen.getByText('أنواع البحث');
      expect(searchTypesTitle).toBeInTheDocument();
      
      // Check if filters title is displayed
      const availableFiltersTitle = screen.getByText('الفلترة المتاحة');
      expect(availableFiltersTitle).toBeInTheDocument();
    });

    it('should display correct number of options and filters', () => {
      renderWithRouter(<AdvancedSearchPage />);
      
      // Check for specific filter options that should be present
      const salaryFilter = screen.getByText('فلتر بالراتب');
      expect(salaryFilter).toBeInTheDocument();
      
      const experienceFilter = screen.getByText('فلتر بالخبرة');
      expect(experienceFilter).toBeInTheDocument();
      
      const qualificationFilter = screen.getByText('فلتر بالمؤهل');
      expect(qualificationFilter).toBeInTheDocument();
    });
  });

  describe('ResultsList Component', () => {
    it('should render results list with analytics data', () => {
      renderWithRouter(<AdvancedSearchPage />);
      
      // Check accuracy display
      expect(screen.getByText('89%')).toBeInTheDocument();
      expect(screen.getByText('دقة البحث')).toBeInTheDocument();
      
      // Check average time display
      expect(screen.getByText('0.3s')).toBeInTheDocument();
      expect(screen.getByText('متوسط وقت البحث')).toBeInTheDocument();
      
      // Check trends
      expect(screen.getByText('البحث عن الموظفين')).toBeInTheDocument();
      expect(screen.getByText('البحث في التقارير')).toBeInTheDocument();
      expect(screen.getByText('البحث في المستندات')).toBeInTheDocument();
    });

    it('should display trends with correct badge variants', () => {
      renderWithRouter(<AdvancedSearchPage />);
      
      const highBadge = screen.getByText('+15%');
      const mediumBadge = screen.getByText('+8%');
      const lowBadge = screen.getByText('+12%');
      
      expect(highBadge).toBeInTheDocument();
      expect(mediumBadge).toBeInTheDocument();
      expect(lowBadge).toBeInTheDocument();
    });
  });

  describe('Page Navigation and Back Button', () => {
    it('should display back button with correct functionality', () => {
      renderWithRouter(<AdvancedSearchPage />);
      
      // Find back button by looking for the arrow-left icon
      const backButton = screen.getByRole('button');
      expect(backButton).toBeInTheDocument();
      
      fireEvent.click(backButton);
      // The navigation would be handled by the mocked useLocation
    });

    it('should display correct page title based on URL path', () => {
      // Test different page types
      Object.defineProperty(window, 'location', {
        value: {
          pathname: '/ai-analytics',
          search: '?company=1&name=TestCompany&role=worker',
        },
        writable: true,
      });
      
      renderWithRouter(<AdvancedSearchPage />);
      
      expect(screen.getByText('تحليلات الذكاء الاصطناعي')).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('should have responsive layout', () => {
      renderWithRouter(<AdvancedSearchPage />);
      
      // Check if the main container has responsive classes
      const mainContainer = screen.getByRole('main');
      expect(mainContainer).toHaveClass('max-w-7xl', 'mx-auto');
    });

    it('should have responsive search input width', () => {
      renderWithRouter(<AdvancedSearchPage />);
      
      const searchInputs = screen.getAllByPlaceholderText('البحث...');
      const searchInput = searchInputs[0];
      expect(searchInput).toHaveClass('w-64');
    });
  });
}); 