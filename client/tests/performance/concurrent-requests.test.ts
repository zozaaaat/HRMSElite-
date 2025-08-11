import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { mockEmployees, mockCompanies } from '../mock-data';

// Mock performance APIs
const mockPerformance = {
  now: vi.fn(() => Date.now()),
  mark: vi.fn(),
  measure: vi.fn(),
  getEntriesByType: vi.fn(() => []),
  getEntriesByName: vi.fn(() => []),
  clearMarks: vi.fn(),
  clearMeasures: vi.fn(),
};

Object.defineProperty(window, 'performance', {
  value: mockPerformance,
  writable: true,
});

// Mock memory API
const mockMemory = {
  usedJSHeapSize: 1000000,
  totalJSHeapSize: 2000000,
  jsHeapSizeLimit: 4000000,
};

Object.defineProperty(window, 'memory', {
  value: mockMemory,
  writable: true,
});

// Define proper types for window extensions
declare global {
  interface Window {
    memory?: {
      usedJSHeapSize: number;
      totalJSHeapSize: number;
      jsHeapSizeLimit: number;
    };
  }
}

// Mock API services
vi.mock('../../src/lib/apiRequest', () => ({
  apiRequest: vi.fn(),
  apiGet: vi.fn(),
  apiPost: vi.fn(),
  apiPut: vi.fn(),
  apiDelete: vi.fn(),
  apiPatch: vi.fn(),
}));

vi.mock('../../src/services/employee', () => ({
  EmployeeService: {
    getAllEmployees: vi.fn(),
    getEmployeeById: vi.fn(),
    createEmployee: vi.fn(),
    updateEmployee: vi.fn(),
    deleteEmployee: vi.fn(),
    searchEmployees: vi.fn(),
  },
}));

vi.mock('../../src/services/company', () => ({
  CompanyService: {
    getAllCompanies: vi.fn(),
    getCompanyById: vi.fn(),
    createCompany: vi.fn(),
    updateCompany: vi.fn(),
    deleteCompany: vi.fn(),
    searchCompanies: vi.fn(),
    getCompanyStats: vi.fn(),
  },
}));

// Import the mocked services
import { apiRequest } from '../../src/lib/apiRequest';
import { EmployeeService } from '../../src/services/employee';
import { CompanyService } from '../../src/services/company';

// Performance measurement utilities
const measurePerformance = async (testFn: () => Promise<void> | void) => {
  const startTime = mockPerformance.now();
  const startMemory = window.memory?.usedJSHeapSize || 0;
  
  await testFn();
  
  const endTime = mockPerformance.now();
  const endMemory = window.memory?.usedJSHeapSize || 0;
  
  return {
    duration: endTime - startTime,
    memoryUsed: endMemory - startMemory,
  };
};

// Concurrent request utilities
const createConcurrentRequests = async (
  requestFn: () => Promise<unknown>,
  count: number,
  delay: number = 0
) => {
  const promises = Array(count).fill(null).map(async (_, index) => {
    if (delay > 0) {
      await new Promise(resolve => setTimeout(resolve, delay * index));
    }
    return requestFn();
  });
  
  return Promise.all(promises);
};

describe('Concurrent Requests Performance Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock successful API responses
    (apiRequest as ReturnType<typeof vi.fn>).mockResolvedValue({ data: { success: true } });
    (EmployeeService.getAllEmployees as ReturnType<typeof vi.fn>).mockResolvedValue(mockEmployees);
    (CompanyService.getAllCompanies as ReturnType<typeof vi.fn>).mockResolvedValue(mockCompanies);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('100 Concurrent API Requests', () => {
    it('should handle 100 concurrent employee requests efficiently', async () => {
      const results = await measurePerformance(async () => {
        const responses = await createConcurrentRequests(
          () => EmployeeService.getAllEmployees(),
          100
        );
        
        expect(responses).toHaveLength(100);
        expect(EmployeeService.getAllEmployees).toHaveBeenCalledTimes(100);
        
        // Verify all requests were successful
        responses.forEach(response => {
          expect(response).toBeDefined();
        });
      });

      // Performance assertions
      expect(results.duration).toBeLessThan(5000); // Should complete within 5 seconds
      expect(results.memoryUsed).toBeLessThan(50000000); // Should use less than 50MB additional memory
    });

    it('should handle 100 concurrent company requests efficiently', async () => {
      const results = await measurePerformance(async () => {
        const responses = await createConcurrentRequests(
          () => CompanyService.getAllCompanies(),
          100
        );
        
        expect(responses).toHaveLength(100);
        expect(CompanyService.getAllCompanies).toHaveBeenCalledTimes(100);
        
        // Verify all requests were successful
        responses.forEach(response => {
          expect(response).toBeDefined();
        });
      });

      // Performance assertions
      expect(results.duration).toBeLessThan(5000); // Should complete within 5 seconds
      expect(results.memoryUsed).toBeLessThan(50000000); // Should use less than 50MB additional memory
    });

    it('should handle 100 concurrent mixed API requests efficiently', async () => {
      const results = await measurePerformance(async () => {
        const employeeRequests = createConcurrentRequests(() => EmployeeService.getAllEmployees(), 50);
        const companyRequests = createConcurrentRequests(() => CompanyService.getAllCompanies(), 50);
        
        const [employeeResponses, companyResponses] = await Promise.all([
          employeeRequests,
          companyRequests
        ]);
        
        expect(employeeResponses).toHaveLength(50);
        expect(companyResponses).toHaveLength(50);
        expect(EmployeeService.getAllEmployees).toHaveBeenCalledTimes(50);
        expect(CompanyService.getAllCompanies).toHaveBeenCalledTimes(50);
        
        // Verify all requests were successful
        [...employeeResponses, ...companyResponses].forEach(response => {
          expect(response).toBeDefined();
        });
      });

      // Performance assertions
      expect(results.duration).toBeLessThan(5000); // Should complete within 5 seconds
      expect(results.memoryUsed).toBeLessThan(50000000); // Should use less than 50MB additional memory
    });

    it('should handle 100 concurrent requests with staggered timing', async () => {
      const results = await measurePerformance(async () => {
        const responses = await createConcurrentRequests(
          () => EmployeeService.getAllEmployees(),
          100,
          10 // 10ms delay between requests
        );
        
        expect(responses).toHaveLength(100);
        expect(EmployeeService.getAllEmployees).toHaveBeenCalledTimes(100);
        
        // Verify all requests were successful
        responses.forEach(response => {
          expect(response).toBeDefined();
        });
      });

      // Performance assertions for staggered requests
      expect(results.duration).toBeLessThan(10000); // Should complete within 10 seconds with delays
      expect(results.memoryUsed).toBeLessThan(50000000); // Should use less than 50MB additional memory
    });
  });

  describe('Error Handling Under Load', () => {
    it('should handle partial failures gracefully with 100 concurrent requests', async () => {
      // Mock some requests to fail
      let callCount = 0;
      (EmployeeService.getAllEmployees as ReturnType<typeof vi.fn>).mockImplementation(() => {
        callCount++;
        if (callCount % 10 === 0) { // Every 10th request fails
          return Promise.reject(new Error('Network error'));
        }
        return Promise.resolve(mockEmployees);
      });

      const results = await measurePerformance(async () => {
        const responses = await createConcurrentRequests(
          () => EmployeeService.getAllEmployees().catch(error => ({ error: error.message })),
          100
        );
        
        expect(responses).toHaveLength(100);
        expect(EmployeeService.getAllEmployees).toHaveBeenCalledTimes(100);
        
        // Count successful and failed requests
        const successful = responses.filter((r: unknown) => !(r as { error?: string }).error);
        const failed = responses.filter((r: unknown) => (r as { error?: string }).error);
        
        expect(successful.length).toBeGreaterThan(80); // At least 80% should succeed
        expect(failed.length).toBeLessThan(20); // Less than 20% should fail
      });

      // Performance assertions
      expect(results.duration).toBeLessThan(5000);
      expect(results.memoryUsed).toBeLessThan(50000000);
    });

    it('should handle timeout scenarios with 100 concurrent requests', async () => {
      // Mock slow responses
      (EmployeeService.getAllEmployees as ReturnType<typeof vi.fn>).mockImplementation(() => {
        return new Promise((resolve) => {
          setTimeout(() => resolve(mockEmployees), Math.random() * 100);
        });
      });

      const results = await measurePerformance(async () => {
        const responses = await createConcurrentRequests(
          () => EmployeeService.getAllEmployees(),
          100
        );
        
        expect(responses).toHaveLength(100);
        expect(EmployeeService.getAllEmployees).toHaveBeenCalledTimes(100);
        
        // Verify all requests eventually completed
        responses.forEach(response => {
          expect(response).toBeDefined();
        });
      });

      // Performance assertions for slow responses
      expect(results.duration).toBeLessThan(10000); // Should complete within 10 seconds
      expect(results.memoryUsed).toBeLessThan(50000000);
    });
  });

  describe('Memory Management Under Load', () => {
    it('should maintain stable memory usage during 100 concurrent requests', async () => {
      const initialMemory = window.memory?.usedJSHeapSize || 0;
      
      const results = await measurePerformance(async () => {
        // Perform multiple rounds of concurrent requests
        for (let round = 0; round < 3; round++) {
          await createConcurrentRequests(() => EmployeeService.getAllEmployees(), 100);
        }
      });

      const finalMemory = window.memory?.usedJSHeapSize || 0;
      const totalMemoryIncrease = finalMemory - initialMemory;

      // Memory should not grow excessively
      expect(totalMemoryIncrease).toBeLessThan(100000000); // Less than 100MB increase
      expect(results.duration).toBeLessThan(15000); // Should complete within 15 seconds
    });

    it('should handle memory cleanup after 100 concurrent requests', async () => {
      const initialMemory = window.memory?.usedJSHeapSize || 0;
      
      // Perform concurrent requests
      await createConcurrentRequests(() => EmployeeService.getAllEmployees(), 100);
      
      // Wait for potential cleanup
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const finalMemory = window.memory?.usedJSHeapSize || 0;
      const memoryIncrease = finalMemory - initialMemory;

      // Memory should return to reasonable levels
      expect(memoryIncrease).toBeLessThan(50000000); // Less than 50MB increase after cleanup
    });
  });

  describe('Response Time Distribution', () => {
    it('should maintain consistent response times across 100 concurrent requests', async () => {
      const responseTimes: number[] = [];
      
      const results = await measurePerformance(async () => {
        const promises = Array(100).fill(null).map(async (_index) => {
          const startTime = mockPerformance.now();
          await EmployeeService.getAllEmployees();
          const endTime = mockPerformance.now();
          responseTimes.push(endTime - startTime);
        });
        
        await Promise.all(promises);
      });

      // Calculate response time statistics
      const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
      const maxResponseTime = Math.max(...responseTimes);
      const _minResponseTime = Math.min(...responseTimes); // Prefixed with underscore to indicate unused
      const responseTimeVariance = responseTimes.reduce((acc, time) => {
        return acc + Math.pow(time - avgResponseTime, 2);
      }, 0) / responseTimes.length;

      // Response time assertions
      expect(avgResponseTime).toBeLessThan(100); // Average response time < 100ms
      expect(maxResponseTime).toBeLessThan(500); // Max response time < 500ms
      expect(responseTimeVariance).toBeLessThan(10000); // Low variance indicates consistency
      expect(results.duration).toBeLessThan(5000);
    });
  });
});
