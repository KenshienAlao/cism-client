"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthService } from "@/service/auth.service";
import { initOtpForm, initRegisterForm, OtpRequest, RegisterRequest } from "@/model/auth.model";
import { notifError, notifSuccess } from "@/lib/toast";
import { OTP, ROUTES, APP_NAME } from "@/config/app.config";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

// ─── OTP Persistence Helpers ────────────────────────────────────────────────

function saveOtpExpiry(seconds: number) {
    const expiry = Date.now() + seconds * 1000;
    localStorage.setItem(OTP.STORAGE_KEYS.EXPIRY, expiry.toString());
    localStorage.setItem(OTP.STORAGE_KEYS.IS_SENT, "true");
}

function clearOtpStorage() {
    localStorage.removeItem(OTP.STORAGE_KEYS.IS_SENT);
    localStorage.removeItem(OTP.STORAGE_KEYS.EXPIRY);
}

function getRemainingSeconds(): number {
    const expiry = localStorage.getItem(OTP.STORAGE_KEYS.EXPIRY);
    if (!expiry) return 0;
    return Math.max(0, Math.round((parseInt(expiry) - Date.now()) / 1000));
}

function formatCountdown(secs: number): string {
    return `${Math.floor(secs / 60)}:${(secs % 60).toString().padStart(2, "0")}`;
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function RegisterPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingOtp, setIsLoadingOtp] = useState(false);
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [form, setForm] = useState<RegisterRequest>(initRegisterForm);
    const [otpData, setOtpData] = useState<OtpRequest>(initOtpForm);
    const [countdown, setCountdown] = useState(0);
    const router = useRouter();

    const setField = (field: keyof RegisterRequest) =>
        (e: React.ChangeEvent<HTMLInputElement>) =>
            setForm((prev) => ({ ...prev, [field]: e.target.value }));
    useEffect(() => {
        const wasSent = localStorage.getItem(OTP.STORAGE_KEYS.IS_SENT) === "true";
        const remaining = getRemainingSeconds();

        if (wasSent) setIsOtpSent(true);
        if (remaining > 0) {
            setCountdown(remaining);
            setIsOtpSent(true);
        }
    }, []);
    useEffect(() => {
        if (countdown <= 0) return;
        const timer = setInterval(() => {
            setCountdown((prev) => {
                const next = prev - 1;
                if (next <= 0) {
                    localStorage.removeItem(OTP.STORAGE_KEYS.EXPIRY);
                    return 0;
                }
                return next;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [countdown]);

    const handleSendOtp = async () => {
        if (!form.email) {
            notifError("Please enter your email address.");
            return;
        }
        setIsLoadingOtp(true);
        setIsLoading(true);

        const data = { ...otpData, email: form.email };
        setOtpData(data);

        const response = await AuthService.validateEmailAddress(data);

        if (response.error) {
            notifError(response.error.message || "Failed to send code. Please try again.");
            const retrySecs = response.error.data?.retryAfterSeconds;
            if (retrySecs) {
                saveOtpExpiry(retrySecs);
                setCountdown(retrySecs);
            }
        } else {
            notifSuccess("Confirmation code sent to your email.");
            saveOtpExpiry(OTP.EXPIRY_SECONDS);
            setCountdown(OTP.EXPIRY_SECONDS);
        }

        setIsOtpSent(true);
        setIsLoadingOtp(false);
        setIsLoading(false);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!isOtpSent) {
            notifError("Please verify your email address first.");
            return;
        }

        setIsLoading(true);

        const response = await AuthService.register(form);

        if (response.error) {
            notifError(response.error.message);
        } else {
            notifSuccess("Account created successfully!");
            clearOtpStorage();
            router.push(ROUTES.LOGIN);
        }

        setIsLoading(false);
    };

    return (
        <main className="flex min-h-screen items-center justify-center bg-neutral-50 px-4 py-10">
            <div className="w-full max-w-90">
                <div className="mb-8 text-center">
                    <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">{APP_NAME}</h1>
                    <p className="mt-1.5 text-sm text-neutral-500">Create a new account</p>
                </div>

                <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-neutral-200">
                    <form onSubmit={handleSubmit} className="space-y-3">
                        <fieldset disabled={isLoading} className="space-y-3">
                            <Input
                                type="text"
                                id="username"
                                name="username"
                                required
                                autoComplete="name"
                                value={form.username}
                                onChange={setField("username")}
                                placeholder="Full name"
                            />

                            <Input
                                type="text"
                                id="studentId"
                                name="studentId"
                                autoComplete="off"
                                value={form.studentId}
                                onChange={setField("studentId")}
                                placeholder="Student ID (optional)"
                            />

                            <Input
                                type="password"
                                id="password"
                                name="password"
                                required
                                autoComplete="new-password"
                                value={form.password}
                                onChange={setField("password")}
                                placeholder="New password"
                            />

                            {/* Email + Send Code */}
                            <div className="flex items-center gap-2">
                                <Input
                                    type="email"
                                    id="email"
                                    name="email"
                                    required
                                    autoComplete="email"
                                    value={form.email}
                                    onChange={setField("email")}
                                    placeholder="Email address"
                                    className="flex-1"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleSendOtp}
                                    disabled={isLoadingOtp || (isOtpSent && countdown > 0)}
                                    className="shrink-0 min-w-16 px-3"
                                >
                                    {isLoadingOtp ? (
                                        <Loader2 className="h-4 w-4 animate-spin text-neutral-500" />
                                    ) : countdown > 0 ? (
                                        formatCountdown(countdown)
                                    ) : isOtpSent ? (
                                        "Resend"
                                    ) : (
                                        "Send code"
                                    )}
                                </Button>
                            </div>

                            {/* OTP Field */}
                            {isOtpSent && (
                                <div className="animate-in fade-in slide-in-from-top-1 duration-300">
                                    <Input
                                        type="text"
                                        id="otp"
                                        name="otp"
                                        required
                                        autoComplete="one-time-code"
                                        inputMode="numeric"
                                        value={form.otp}
                                        onChange={setField("otp")}
                                        placeholder="Enter 6-digit code"
                                        className="text-center font-mono"
                                    />
                                    <p className="mt-1.5 px-1 text-[11px] text-neutral-500">
                                        Check your email for a confirmation code.
                                    </p>
                                </div>
                            )}

                            <Button type="submit" isLoading={isLoading} className="w-full">
                                Sign up
                            </Button>
                        </fieldset>
                    </form>
                </div>

                <p className="mt-5 text-center text-sm text-neutral-500">
                    Already have an account?{" "}
                    <Link href={ROUTES.LOGIN} className="font-medium text-neutral-900 underline-offset-4 hover:underline">
                        Log in
                    </Link>
                </p>
            </div>
        </main>
    );
}
