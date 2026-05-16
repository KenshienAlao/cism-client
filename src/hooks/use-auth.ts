import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { authService } from "@/service/auth.service";
import { LoginRequest, LoginResponse } from "@/model/auth.model";
import { UpdateUserRequest } from "@/model/user.model";
import { PUBLIC_ROUTES, ROUTES } from "@/config/app.config";
import { notifError, notifSuccess } from "@/lib/toast";

export const authKeys = {
  all: ["auth"] as const,
  profile: () => [...authKeys.all, "profile"] as const,
};

interface UseAuthReturn {
  profile: LoginResponse | null;
  isLoading: boolean;
  isFetching: boolean;
  isLoggingIn: boolean;
  login: (data: LoginRequest) => void;
  register: (data: any) => Promise<any>;
  isRegistering: boolean;
  logout: () => void;
  refreshUser: () => void;
  updateProfile: (data: UpdateUserRequest) => Promise<any>;
  isUpdatingProfile: boolean;
  uploadAvatar: (file: File) => Promise<any>;
  isUploadingAvatar: boolean;
  deleteAccount: () => Promise<any>;
  isDeletingAccount: boolean;
  changeEmail: (data: any) => Promise<any>;
  isChangingEmail: boolean;
  changePassword: (data: any) => Promise<any>;
  isChangingPassword: boolean;
}

export function useAuth(): UseAuthReturn {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();

  const { data: profile = null, isLoading, isFetched, isFetching } = useQuery<LoginResponse | null>({
    queryKey: authKeys.profile(),
    queryFn: async () => {
      const res = await authService.validateCookie();
      return res.success ? res.data : null;
    },
    retry: false,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: true,
    refetchInterval: 1000 * 60 * 15,
  });

  useEffect(() => {
     if (!isFetched) return;

    const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

    if (!profile && !isPublicRoute) {
      router.replace(ROUTES.LOGIN);
    } else if (profile && isPublicRoute) {
      router.replace(ROUTES.HOME);
    }
  }, [isFetched, profile, pathname, router]);

  const loginMutation = useMutation({
    mutationFn: async (data: LoginRequest) => await authService.login(data),
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

  const registerMutation = useMutation({
    mutationFn: async (data: any) => await authService.register(data),
    onSuccess: (res) => {
      if (res.success) {
        notifSuccess("Account created successfully!");
        router.push(ROUTES.LOGIN);
      } else {
        notifError(res.message || "Registration failed");
      }
    },
    onError: (error: any) => {
      notifError(error.message || "An unexpected error occurred");
    }
  });

  const logoutMutation = useMutation({
    mutationFn: async () => await authService.logout(),
    onSettled: () => {
      queryClient.clear();
      router.push(ROUTES.LOGIN);
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: UpdateUserRequest) => await authService.updateProfile(data),
    onMutate: async (newData) => {
      await queryClient.cancelQueries({ queryKey: authKeys.profile() });
      const previous = queryClient.getQueryData<LoginResponse>(authKeys.profile());
      if (previous) {
        queryClient.setQueryData<LoginResponse>(authKeys.profile(), {
          ...previous,
          user: {
            ...previous.user,
            ...newData
          }
        });
      }
      return { previous };
    },
    onSuccess: (res) => {
      if (res.success) {
        notifSuccess("Profile updated successfully!");
      } else {
        notifError(res.message || "Failed to update profile");
      }
    },
    onError: (error: any, __, context) => {
      if (context?.previous) {
        queryClient.setQueryData(authKeys.profile(), context.previous);
      }
      notifError(error.message || "Failed to update profile");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.profile() });
    }
  });

  const uploadAvatarMutation = useMutation({
    mutationFn: async (file: File) => await authService.uploadAvatar(file),
    onMutate: async (file) => {
      await queryClient.cancelQueries({ queryKey: authKeys.profile() });
      const previous = queryClient.getQueryData<LoginResponse>(authKeys.profile());
      const tempUrl = URL.createObjectURL(file);

      if (previous) {
        queryClient.setQueryData<LoginResponse>(authKeys.profile(), {
          ...previous,
          user: {
            ...previous.user,
            avatar: tempUrl
          }
        });
      }
      return { previous, tempUrl };
    },
    onSuccess: (res) => {
      if (res.success) {
        notifSuccess("Avatar updated successfully!");
      } else {
        notifError(res.message || "Failed to upload avatar");
      }
    },
    onError: (error: any, __, context) => {
      if (context?.previous) {
        queryClient.setQueryData(authKeys.profile(), context.previous);
      }
      notifError(error.message || "Failed to upload avatar");
    },
    onSettled: (res, err, vars, context) => {
      // Clean up the temporary URL
      if (context?.tempUrl) {
        URL.revokeObjectURL(context.tempUrl);
      }
      queryClient.invalidateQueries({ queryKey: authKeys.profile() });
    }
  });

  const deleteAccountMutation = useMutation({
    mutationFn: async () => await authService.deleteAccount(),
    onSuccess: (res) => {
      if (res.success) {
        logoutMutation.mutate();
      } else {
        notifError(res.message || "Failed to delete account");
      }
    },
    onError: (error: any) => {
      notifError(error.message || "Failed to delete account");
    }
  });

  const changeEmailMutation = useMutation({
    mutationFn: async (data: any) => await authService.changeEmail(data),
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: authKeys.profile() });
      const previous = queryClient.getQueryData<LoginResponse>(authKeys.profile());
      if (previous) {
        queryClient.setQueryData<LoginResponse>(authKeys.profile(), {
          ...previous,
          user: {
            ...previous.user,
            email: data.newEmail
          }
        });
      }
      return { previous };
    },
    onSuccess: (res) => {
      if (res.success) {
        notifSuccess("Email updated successfully!");
      } else {
        notifError(res.message || "Failed to update email");
      }
    },
    onError: (error: any, __, context) => {
      if (context?.previous) {
        queryClient.setQueryData(authKeys.profile(), context.previous);
      }
      notifError(error.message || "Failed to update email");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.profile() });
    }
  });

  const changePasswordMutation = useMutation({
    mutationFn: async (data: any) => await authService.changePassword(data),
    onSuccess: (res) => {
      if (res.success) {
        notifSuccess("Password updated successfully!");
      } else {
        notifError(res.message || "Failed to update password");
      }
    },
    onError: (error: any) => {
      notifError(error.message || "Failed to update password");
    }
  });

  return {
    profile,
    isLoading,
    isFetching,
    isLoggingIn: loginMutation.isPending,
    login: (data: LoginRequest) => loginMutation.mutate(data),
    register: (data: any) => registerMutation.mutateAsync(data),
    isRegistering: registerMutation.isPending,
    logout: () => logoutMutation.mutate(),
    refreshUser: () => queryClient.invalidateQueries({ queryKey: authKeys.profile() }),
    updateProfile: (data: UpdateUserRequest) => updateProfileMutation.mutateAsync(data),
    isUpdatingProfile: updateProfileMutation.isPending,
    uploadAvatar: (file: File) => uploadAvatarMutation.mutateAsync(file),
    isUploadingAvatar: uploadAvatarMutation.isPending,
    deleteAccount: () => deleteAccountMutation.mutateAsync(),
    isDeletingAccount: deleteAccountMutation.isPending,
    changeEmail: (data: any) => changeEmailMutation.mutateAsync(data),
    isChangingEmail: changeEmailMutation.isPending,
    changePassword: (data: any) => changePasswordMutation.mutateAsync(data),
    isChangingPassword: changePasswordMutation.isPending,
  };
}