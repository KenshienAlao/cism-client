"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { AuthService } from "@/service/auth.service";
import { LoginResponse } from "@/model/auth.model";
import { PUBLIC_ROUTES, ROUTES } from "@/config/app.config";

interface AuthContextType {
  profile: LoginResponse | null;
  isLoading: boolean;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<LoginResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();


  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshUser = useCallback(async () => {
    if (isRefreshing) return;
    setIsLoading(true);
    setIsRefreshing(true);
    try {
      const response: any = await AuthService.validateCookie();

      const isSuccess = !response.error && response.data;
      const isAuthError = response.code === "UNAUTHENTICATED" || response.status === 401;

      if (isSuccess) {
        setProfile(response.data);
      } else {
        if (isAuthError) {
          const refreshRes = await AuthService.refresh();
          if (!refreshRes.error && refreshRes.data) {
            setProfile(refreshRes.data);
            setIsLoading(false);
            setIsRefreshing(false);
            return;
          }
        }

        setProfile(null);
        if (!PUBLIC_ROUTES.includes(pathname)) {
          router.push(ROUTES.LOGIN);
        }
      }
    } catch (error) {
      setProfile(null);
      if (!PUBLIC_ROUTES.includes(pathname)) {
        router.push(ROUTES.LOGIN);
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [pathname, router]);

  const logout = async () => {
    try {
      await AuthService.logout();
    } finally {
      setProfile(null);
      setIsLoading(false);
      router.push(ROUTES.LOGIN);
    }
  };

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  return (
    <AuthContext.Provider value={{ profile, isLoading, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
