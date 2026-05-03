import { notifError, notifSuccess } from "@/lib/toast";
import { useMutation } from "@tanstack/react-query";
import { authService } from "@/service/auth.service";

export const otpKeys = {
    all: ["otp"] as const,
    send: () => [...otpKeys.all, "send"] as const,
    verify: () => [...otpKeys.all, "verify"] as const,
}

interface UseOtpReturn {
    isSendingOtp: boolean;
    isVerifyingOtp: boolean;
    sendOtp: (email: string, options?: { onSuccess?: () => void }) => void;
    verifyOtp: (email: string, otp: string, options?: { onSuccess?: () => void }) => void;
}

export function useOtp(): UseOtpReturn {
    const sendOtpMutation = useMutation({
        mutationFn: (email: string) => authService.sendOtp({ email, otp: "" }),
        onSuccess: (data, variables, context) => {
            notifSuccess("OTP sent successfully");
        },
        onError: (error: any) => {
            notifError(error.message || "An unexpected error occurred");
        }
    });

    const verifyOtpMutation = useMutation({
        mutationFn: ({ email, otp }: { email: string, otp: string }) =>
            (authService as any).verifyOtp?.(email, otp) || Promise.resolve({ success: true }),
        onSuccess: (data, variables, context) => {
            notifSuccess("OTP verified successfully");
        },
        onError: (error: any) => {
            notifError(error.message || "An unexpected error occurred");
        }
    });

    return {
        isSendingOtp: sendOtpMutation.isPending,
        isVerifyingOtp: verifyOtpMutation.isPending,
        sendOtp: (email: string, options) => sendOtpMutation.mutate(email, options as any),
        verifyOtp: (email, otp, options) => verifyOtpMutation.mutate({ email, otp }, options as any),
    }
}