"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/service/auth.service";
import { initRegisterForm, RegisterRequest } from "@/model/auth.model";
import { notifError, notifSuccess } from "@/lib/toast";
import { ROUTES, APP_NAME } from "@/config/app.config";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function RegisterPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [form, setForm] = useState<RegisterRequest>(initRegisterForm);
    const router = useRouter();

    const setField = (field: keyof RegisterRequest) =>
        (e: React.ChangeEvent<HTMLInputElement>) =>
            setForm((prev) => ({ ...prev, [field]: e.target.value }));

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        setIsLoading(true);

        const response = await authService.register(form);

        if (!response.success) {
            notifError(response.message);
        } else {
            notifSuccess("Account created successfully!");
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

                <div className="rounded-xl bg-card p-6 shadow-sm ring-1 ring-neutral-200">
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
                                type="email"
                                id="email"
                                name="email"
                                required
                                autoComplete="email"
                                value={form.email}
                                onChange={setField("email")}
                                placeholder="Email address"
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
