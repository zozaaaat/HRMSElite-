# User Store Documentation

## Overview

The `useUserStore` is a Zustand store designed to manage the current user's authentication state and basic information. It provides a centralized way to handle user authentication, token management, and user role information.

## Features

- **Persistent Storage**: Data is automatically saved to localStorage
- **Type Safety**: Full TypeScript support with proper type validation
- **Validation**: Built-in validation for user data and tokens
- **Convenience Hooks**: Easy-to-use hooks for accessing specific parts of the store
- **Error Handling**: Comprehensive error handling with console logging

## Store Structure

### State Properties

```typescript
interface CurrentUserState {
  id: string | null;           // User ID
  role: UserRole | null;       // User role (super_admin, company_manager, employee, etc.)
  companyId: string | null;    // Associated company ID
  token: string | null;        // Authentication token
  isAuthenticated: boolean;    // Authentication status
}
```

### Actions

- `setUser(user)`: Set complete user data
- `setToken(token)`: Set authentication token
- `updateUser(updates)`: Update specific user properties
- `logout()`: Clear all user data
- `clearUser()`: Clear all user data (alias for logout)

## Usage Examples

### Basic Usage

```typescript
import { useUserStore, useUserActions } from '../stores';

function LoginComponent() {
  const { setUser } = useUserActions();
  
  const handleLogin = (userData) => {
    setUser({
      id: userData.id,
      role: userData.role,
      companyId: userData.companyId,
      token: userData.token,
    });
  };
}
```

### Using Convenience Hooks

```typescript
import { 
  useCurrentUserId, 
  useCurrentUserRole, 
  useIsUserAuthenticated 
} from '../stores';

function UserProfile() {
  const userId = useCurrentUserId();
  const userRole = useCurrentUserRole();
  const isAuthenticated = useIsUserAuthenticated();
  
  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }
  
  return (
    <div>
      <p>User ID: {userId}</p>
      <p>Role: {userRole}</p>
    </div>
  );
}
```

### Complete Store Access

```typescript
import { useUserStoreComplete } from '../stores';

function AuthComponent() {
  const { 
    id, 
    role, 
    companyId, 
    token, 
    isAuthenticated,
    setUser, 
    logout 
  } = useUserStoreComplete();
  
  const handleLogout = () => {
    logout();
  };
  
  return (
    <div>
      {isAuthenticated ? (
        <button onClick={handleLogout}>Logout</button>
      ) : (
        <LoginForm onLogin={setUser} />
      )}
    </div>
  );
}
```

### Token Management

```typescript
import { useUserActions, useCurrentUserToken } from '../stores';

function TokenManager() {
  const { setToken } = useUserActions();
  const currentToken = useCurrentUserToken();
  
  const refreshToken = async () => {
    const newToken = await api.refreshToken();
    setToken(newToken);
  };
  
  return (
    <div>
      <p>Current Token: {currentToken ? 'Valid' : 'None'}</p>
      <button onClick={refreshToken}>Refresh Token</button>
    </div>
  );
}
```

## Validation

The store includes built-in validation for:

- **User Data**: Ensures all required fields are present and valid
- **Token**: Validates token format and non-empty strings
- **Storage**: Validates stored data on rehydration

### Validation Errors

The store logs validation errors to the console:

```typescript
// Invalid user data
setUser({}); // Logs: "Invalid user data provided to setUser"

// Invalid token
setToken(''); // Logs: "Invalid token provided to setToken"

// Invalid updates
updateUser({ id: '' }); // Logs: "Invalid user data in updateUser"
```

## Persistence

The store automatically persists data to localStorage with the key `'user-store'`. On page reload, the data is automatically restored and validated.

### Storage Structure

```json
{
  "id": "user123",
  "role": "company_manager",
  "companyId": "company456",
  "token": "jwt-token-123",
  "isAuthenticated": true
}
```

## Integration with Existing App Store

The user store is designed to work alongside the existing `useAppStore`. You can use both stores together:

```typescript
import { useUserStore, useAppStore } from '../stores';

function AppComponent() {
  const { isAuthenticated } = useUserStore();
  const { user, company } = useAppStore();
  
  // Use both stores as needed
  return (
    <div>
      {isAuthenticated && user && company && (
        <Dashboard user={user} company={company} />
      )}
    </div>
  );
}
```

## Testing

The store includes comprehensive tests in `useUserStore.test.ts` covering:

- Initial state validation
- Action functionality
- Error handling
- Persistence
- Convenience hooks

Run tests with:

```bash
npm run test useUserStore.test.ts
```

## Best Practices

1. **Use Convenience Hooks**: Prefer specific hooks over accessing the full store when possible
2. **Handle Errors**: Always handle potential validation errors in your components
3. **Validate Data**: Ensure data is valid before setting it in the store
4. **Clear on Logout**: Always call `logout()` or `clearUser()` when user logs out
5. **Type Safety**: Use TypeScript interfaces when working with user data

## Migration from App Store

If you're migrating from the existing app store, you can gradually replace user-related functionality:

```typescript
// Old way (app store)
const { user, isAuthenticated } = useAppStore();

// New way (user store)
const { id, role, companyId, token, isAuthenticated } = useUserStore();
```

The user store provides a more focused and type-safe approach to user authentication management. 