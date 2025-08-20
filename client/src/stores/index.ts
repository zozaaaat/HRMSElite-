// Export all stores
export * from './useAppStore';
export * from './useUserStore';

// Re-export commonly used hooks for convenience
export {
  useUserStore,
  useCurrentUserId,
  useCurrentUserRole,
  useCurrentUserCompanyId,
  useIsUserAuthenticated,
  useUserActions,
  useUserStoreComplete
} from './useUserStore';

export {
  useAppStore,
  useUser,
  useCompany,
  useEmployees,
  useIsAuthenticated,
  useUserRole,
  useUserFullName,
  useCompanyName,
  useTotalEmployees,
  useActiveEmployees,
  useIsLoading,
  useError,
  useIsInitialized,
  useHydrationComplete,
  useAuthActions,
  useAppActions,
  useEmployeeActions,
  useCompanyActions
} from './useAppStore';
