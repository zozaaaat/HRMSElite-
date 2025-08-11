# HRMS Elite Mobile App

A modern React Native mobile application for HRMS Elite, built with Expo and TypeScript.

## Features

- **Authentication**: Secure login/logout with JWT tokens
- **Employee Management**: View, add, edit, and delete employees
- **Dashboard**: Overview with key metrics and quick actions
- **Attendance Tracking**: Monitor employee attendance
- **Document Management**: Upload and manage employee documents
- **Profile Management**: User profile and settings
- **Modern UI**: Beautiful, responsive design with iOS-style components

## Tech Stack

- **React Native** with Expo
- **TypeScript** for type safety
- **Zustand** for state management
- **TanStack Query** for data fetching and caching
- **Axios** for API communication
- **Expo Router** for navigation
- **Ionicons** for icons

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (for iOS development)
- Android Studio (for Android development)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd hrms-mobile
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Run on device/simulator**
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app on your phone

## Project Structure

```
hrms-mobile/
├── app/                    # Expo Router app directory
│   ├── (tabs)/            # Tab-based navigation
│   │   ├── index.tsx      # Dashboard screen
│   │   ├── employees.tsx  # Employees list
│   │   ├── attendance.tsx # Attendance management
│   │   ├── documents.tsx  # Document management
│   │   ├── profile.tsx    # User profile
│   │   └── _layout.tsx    # Tab layout
│   ├── login.tsx          # Login screen
│   └── _layout.tsx        # Root layout
├── lib/                   # Utility libraries
│   └── api.ts            # API configuration
├── stores/               # Zustand stores
│   ├── authStore.ts      # Authentication state
│   └── employeeStore.ts  # Employee data state
├── components/           # Reusable components
├── constants/           # App constants
└── hooks/              # Custom hooks
```

## API Configuration

The app is configured to connect to the HRMS Elite backend. Update the API URL in `lib/api.ts`:

```typescript
const API_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:3000';
```

## State Management

The app uses Zustand for state management with the following stores:

### Auth Store (`stores/authStore.ts`)
- User authentication state
- Login/logout functionality
- Token management

### Employee Store (`stores/employeeStore.ts`)
- Employee data management
- CRUD operations for employees
- Loading and error states

## Navigation

The app uses Expo Router for navigation with the following structure:

- **Authentication Flow**: Login → Main App
- **Main App**: Tab-based navigation
  - Dashboard
  - Employees
  - Attendance
  - Documents
  - Profile

## Styling

The app uses React Native StyleSheet with a consistent design system:

- **Colors**: iOS-style color palette
- **Typography**: Consistent font sizes and weights
- **Spacing**: Standardized padding and margins
- **Components**: Reusable UI components

## Development

### Adding New Screens

1. Create a new file in the appropriate directory
2. Export a default React component
3. Add navigation in the layout file if needed

### Adding New API Endpoints

1. Update `lib/api.ts` with new endpoints
2. Create corresponding store methods
3. Use in components with React Query

### Styling Guidelines

- Use the existing color palette
- Follow iOS design patterns
- Maintain consistent spacing
- Use Ionicons for icons

## Building for Production

### iOS

```bash
npx expo build:ios
```

### Android

```bash
npx expo build:android
```

### Web

```bash
npx expo build:web
```

## Testing

```bash
npm test
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact the development team or create an issue in the repository.
