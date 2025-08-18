import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '../stores/authStore';
import { useEffect } from 'react';
// import { pwaManager } from '../lib/pwa';

import { useColorScheme } from '@/hooks/useColorScheme';
import { logger } from '../lib/logger';


// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { isAuthenticated } = useAuthStore();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // Initialize PWA functionality
  useEffect(() => {
    // PWA manager initializes automatically when singleton is created
    logger.info('PWA Manager initialized', { source: 'RootLayout' });
  }, []);

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          {!isAuthenticated ? (
            <>
              <Stack.Screen name="login" options={{ headerShown: false }} />
              <Stack.Screen name="register" options={{ headerShown: false }} />
            </>
          ) : (
            <>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="+not-found" />
            </>
          )}
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
