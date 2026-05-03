import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { authService } from "@/service/auth.service";
import { LoginRequest, LoginResponse } from "@/model/auth.model";
import { PUBLIC_ROUTES, ROUTES } from "@/config/app.config";
import { notifError } from "@/lib/toast";

export const authKeys = {
  all: ["auth"] as const,
  profile: () => [...authKeys.all, "profile"] as const,
};

interface UseAuthReturn {
  profile: LoginResponse | null;
  isLoading: boolean;
  isLoggingIn: boolean;
  login: (data: LoginRequest) => void;
  logout: () => void;
  refreshUser: () => void;
}

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
    staleTime: 1000 * 60,
  });

  useEffect(() => {
    if (isLoading) return;

    const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

    if (!profile && !isPublicRoute) {
      router.replace(ROUTES.LOGIN);
    } else if (profile && isPublicRoute) {
      router.replace(ROUTES.HOME);
    }
  }, [isLoading, profile, pathname, router]);

  const loginMutation = useMutation({
    mutationFn: (data: LoginRequest) => authService.login(data),
    onSuccess: (res) => {
      if (res.success && res.data) {
        queryClient.setQueryData(authKeys.profile(), res.data);
        router.replace(ROUTES.HOME);
      } else {
        notifError(res.message || "Login failed");
      }
    },
    onError: (error: any) => {
      notifError(error.message || "An unexpected error occurred");
    }
  });

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
    isLoggingIn: loginMutation.isPending,
    login: (data: LoginRequest) => loginMutation.mutate(data),
    logout: () => logoutMutation.mutate(),
    refreshUser: () => queryClient.invalidateQueries({ queryKey: authKeys.profile() }),
  };
}