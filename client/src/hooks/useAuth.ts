import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/current-user"],
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchInterval: false,
    enabled: false, // Disable automatic fetching
  });

  return {
    user: null, // Always return null for now to prevent auth loops
    isLoading: false,
    isAuthenticated: false,
  };
}
