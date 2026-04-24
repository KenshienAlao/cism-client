"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
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

  const [prevPath, setPrevPath] = useState(pathname);
  if (pathname !== prevPath) {
    setPrevPath(pathname);
    setIsLoading(true);
  }

  const refreshUser = async () => {
    setIsLoading(true);
    try {
      const response = await AuthService.validateCookie();
      if (!response.error) {
        setProfile(response.data);
      } else {
        setProfile(null);
        if (!PUBLIC_ROUTES.includes(pathname)) {
          router.push(ROUTES.LOGIN);
        }
      }
    } catch {
      setProfile(null);
      if (!PUBLIC_ROUTES.includes(pathname)) {
        router.push(ROUTES.LOGIN);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await AuthService.logout();
    setProfile(null);
    router.push(ROUTES.LOGIN);
  };

  useEffect(() => {
    refreshUser();
  }, [pathname]);

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
