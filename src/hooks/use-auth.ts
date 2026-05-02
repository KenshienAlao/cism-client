import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { authService } from "@/service/auth.service";
import { LoginResponse } from "@/model/auth.model";
import { PUBLIC_ROUTES, ROUTES } from "@/config/app.config";

/**
 * ─── Query Keys ─────────────────────────────────────────────────────────────
 */
export const authKeys = {
  all: ["auth"] as const,
  profile: () => [...authKeys.all, "profile"] as const,
};

/**
 * ─── Hook Return Type ───────────────────────────────────────────────────────
 */
interface UseAuthReturn {
  profile: LoginResponse | null;
  isLoading: boolean;
  logout: () => void;
  refreshUser: () => void;
}

/**
 * ─── useAuth Hook ───────────────────────────────────────────────────────────
 * Manages authentication state, silent token refresh, and route protection.
 */
export function useAuth(): UseAuthReturn {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();

  const { data: profile = null, isLoading } = useQuery<LoginResponse | null>({
    queryKey: authKeys.profile(),
    queryFn: async () => {
      const res = await authService.validateCookie();
      return res.success ? res.data : null;
    },
    retry: false,
    staleTime: 1000 * 60 * 5, // Profile is considered fresh for 5 minutes
  });

  // Automatically redirect unauthenticated users away from protected routes
  useEffect(() => {
    if (!isLoading && !profile && !PUBLIC_ROUTES.includes(pathname)) {
      router.push(ROUTES.LOGIN);
    }
  }, [isLoading, profile, pathname, router]);

  const logoutMutation = useMutation({
    mutationFn: authService.logout,
    onSettled: () => {
      queryClient.clear();
      router.push(ROUTES.LOGIN);
    },
  });

  return {
    profile,
    isLoading,
    logout: () => logoutMutation.mutate(),
    refreshUser: () => queryClient.invalidateQueries({ queryKey: authKeys.profile() }),
  };
}