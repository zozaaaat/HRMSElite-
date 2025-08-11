import {useEffect, useState} from 'react';
import {
  useAppStore, useIsInitialized, useHydrationComplete, useAuthActions
} from '../stores/useAppStore';

export const useAppInitialization = () => {

  const isInitialized = useIsInitialized();
  const hydrationComplete = useHydrationComplete();
  const {initializeApp, validateStoredData} = useAuthActions();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {

    const initialize = async () => {

      if (!isInitialized && hydrationComplete) {

        await initializeApp();

      }

    };

    initialize();

  }, [isInitialized, hydrationComplete, initializeApp]);

  useEffect(() => {

    if (isInitialized && hydrationComplete) {

      setIsReady(true);

    }

  }, [isInitialized, hydrationComplete]);

  const validateData = () => {

    return validateStoredData();

  };

  return {
    isReady,
    isInitialized,
    hydrationComplete,
    validateData
  };

};

// Hook for components that need to wait for app initialization
export const useAppReady = () => {

  const {isReady} = useAppInitialization();
  return isReady;

};

// Hook for authentication state with initialization check
export const useAuthWithInitialization = () => {

  const {isReady} = useAppInitialization();
  const user = useAppStore((state) => state.user);
  const company = useAppStore((state) => state.company);
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);

  return {
    isReady,
    user,
    company,
    isAuthenticated,
    'canAccess': isReady && isAuthenticated
  };

};
