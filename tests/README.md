# API Tests

This directory contains API tests for the HRMS Elite application using Vitest and Supertest.

## Structure

```
tests/
├── api/
│   └── employees.test.ts    # Employee API endpoint tests
├── setup.ts                 # Test setup and global mocks
├── vitest.config.ts         # Vitest configuration for API tests
└── README.md               # This file
```

## Running Tests

### Run API tests in watch mode
```bash
npm run test:api
```

### Run API tests once
```bash
npm run test:api:run
```

### Run all tests (client + API)
```bash
npm run test:run && npm run test:api:run
```

## Test Coverage

The API tests cover:

### Employee Endpoints
- `GET /api/employees` - List all employees
- `POST /api/employees` - Create new employee
- `GET /api/employees/:id` - Get specific employee
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee

### Test Scenarios
- ✅ Happy path testing
- ✅ Data validation
- ✅ Error handling
- ✅ Authentication/Authorization
- ✅ Edge cases (large payloads, malformed JSON)
- ✅ Different user roles

## Adding New Tests

1. Create a new test file in the `tests/api/` directory
2. Follow the naming convention: `{endpoint-name}.test.ts`
3. Import the necessary route handlers
4. Use the existing test structure as a template

### Example Test Structure

```typescript
import request from 'supertest';
import express from 'express';
import { registerYourRoutes } from '../../server/routes/your-routes';

const app = express();
app.use(express.json());
registerYourRoutes(app);

describe('Your API Tests', () => {
  describe('GET /api/your-endpoint', () => {
    it('should return expected data', async () => {
      const res = await request(app)
        .get('/api/your-endpoint')
        .set('x-user-role', 'company_manager')
        .set('x-user-id', '1');
      
      expect(res.statusCode).toEqual(200);
      // Add more assertions
    });
  });
});
```

## Dependencies

- **supertest**: HTTP assertion library for testing API endpoints
- **vitest**: Fast unit test framework
- **express**: Web framework (for creating test app instances)

## Notes

- Tests are designed to work with the current mock data implementation
- Authentication is simulated using headers (`x-user-role`, `x-user-id`)
- Some endpoints may not be fully implemented yet - tests use `toBeOneOf()` to handle various possible responses
- Console output is mocked to reduce noise during test runs 