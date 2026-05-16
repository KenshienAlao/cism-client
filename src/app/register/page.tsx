"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { authService } from "@/service/auth.service";
import { initRegisterForm, RegisterRequest } from "@/model/auth.model";
import { notifError, notifSuccess } from "@/lib/toast";
import { ROUTES, APP_NAME } from "@/config/app.config";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function RegisterPage() {
    const { register, isRegistering } = useAuth();
    const [form, setForm] = useState<RegisterRequest>(initRegisterForm);
    const router = useRouter();

    const setField = (field: keyof RegisterRequest) =>
        (e: React.ChangeEvent<HTMLInputElement>) =>
            setForm((prev) => ({ ...prev, [field]: e.target.value }));

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        await register(form);
    };

    return (
        <main className="fixed inset-0 z-9999 flex overflow-hidden items-center justify-center bg-background text-foreground px-4 py-6 sm:py-12 antialiased selection:bg-orange-500/20">
            <motion.div 
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="w-full max-w-[360px] sm:max-w-[400px]"
            >
                {/* Header Section */}
                <div className="mb-5 text-center">
                    <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground">
                        {APP_NAME}
                    </h1>
                    <p className="mt-1 text-xs sm:text-sm text-foreground/60">
                        Create a new account
                    </p>
                </div>

                {/* Form Card Container */}
                <div className="rounded-lg border border-border bg-card p-4 sm:p-5">
                    <form onSubmit={handleSubmit}>
                        <fieldset disabled={isRegistering} className="flex flex-col gap-3 group">
                            <Input
                                type="text"
                                id="username"
                                name="username"
                                required
                                autoComplete="name"
                                value={form.username}
                                onChange={setField("username")}
                                placeholder="Full name"
                                className="h-9 text-sm bg-input border-border focus-visible:ring-ring focus-visible:border-orange-500/50 rounded-md transition-colors"
                            />

                            <Input
                                type="text"
                                id="studentId"
                                name="studentId"
                                autoComplete="off"
                                value={form.studentId}
                                onChange={setField("studentId")}
                                placeholder="Student ID (optional)"
                                className="h-9 text-sm bg-input border-border focus-visible:ring-ring focus-visible:border-orange-500/50 rounded-md transition-colors"
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
                                className="h-9 text-sm bg-input border-border focus-visible:ring-ring focus-visible:border-orange-500/50 rounded-md transition-colors"
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
                                className="h-9 text-sm bg-input border-border focus-visible:ring-ring focus-visible:border-orange-500/50 rounded-md transition-colors"
                            />

                            <Button 
                                type="submit" 
                                isLoading={isRegistering} 
                                className="w-full h-9 mt-1 text-sm font-medium rounded-md bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white transition-colors duration-150 shadow-none border-none focus-visible:ring-orange-500"
                            >
                                Sign up
                            </Button>
                        </fieldset>
                    </form>
                </div>

                {/* Footer Section */}
                <p className="mt-4 text-center text-xs sm:text-sm text-foreground/60">
                    Already have an account?{" "}
                    <Link 
                        href={ROUTES.LOGIN} 
                        className="font-medium text-orange-500 hover:text-orange-600 transition-colors underline-offset-4 hover:underline"
                    >
                        Log in
                    </Link>
                </p>
            </motion.div>
        </main>
    );
}