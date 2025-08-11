// Routing verification tests
import { describe, it, expect } from 'vitest';
import { routes, getDashboardRoute, UserRole } from '../src/lib/routes';

describe('Routing Configuration', () => {
  it('should have all required public routes', () => {
    expect(routes.public).toBeDefined();
    expect(routes.public.home).toBeDefined();
    expect(routes.public.login).toBeDefined();
    expect(typeof routes.public.home).toBe('string');
    expect(typeof routes.public.login).toBe('string');
  });

  it('should have all required dashboard routes', () => {
    expect(routes.dashboard).toBeDefined();
    expect(routes.dashboard.super_admin).toBeDefined();
    expect(routes.dashboard.company_manager).toBeDefined();
    expect(routes.dashboard.employee).toBeDefined();
    expect(routes.dashboard.supervisor).toBeDefined();
    expect(routes.dashboard.worker).toBeDefined();
    
    // Verify all dashboard routes are strings
    Object.values(routes.dashboard).forEach(route => {
      expect(typeof route).toBe('string');
    });
  });

  it('should have all required functional routes', () => {
    expect(routes.functional).toBeDefined();
    expect(routes.functional.companies).toBeDefined();
    expect(routes.functional.reports).toBeDefined();
    
    // Verify all functional routes are strings
    Object.values(routes.functional).forEach(route => {
      expect(typeof route).toBe('string');
    });
  });

  it('should return correct dashboard routes for valid roles', () => {
    const roles: UserRole[] = ['super_admin', 'company_manager', 'employee', 'supervisor', 'worker'];
    
    roles.forEach(role => {
      const route = getDashboardRoute(role);
      expect(route).toBeDefined();
      expect(typeof route).toBe('string');
      expect(route.length).toBeGreaterThan(0);
    });
  });

  it('should handle invalid roles gracefully', () => {
    const invalidRoute = getDashboardRoute('invalid_role' as UserRole);
    expect(invalidRoute).toBeDefined();
    // Should return a fallback route or empty string, not throw an error
  });

  it('should build query strings correctly', () => {
    const testParams = { company: '123', name: 'Test Company' };
    const queryString = Object.entries(testParams)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&');
    
    expect(queryString).toBe('company=123&name=Test%20Company');
    
    const builtRoute = routes.functional.companies + '?' + queryString;
    expect(builtRoute).toContain('?');
    expect(builtRoute).toContain('company=123');
    expect(builtRoute).toContain('name=Test%20Company');
  });

  it('should have consistent route structure', () => {
    // Verify route structure is consistent
    expect(routes).toHaveProperty('public');
    expect(routes).toHaveProperty('dashboard');
    expect(routes).toHaveProperty('functional');
    
    // Verify all route categories are objects
    expect(typeof routes.public).toBe('object');
    expect(typeof routes.dashboard).toBe('object');
    expect(typeof routes.functional).toBe('object');
  });
}); 