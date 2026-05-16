"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import Loading from "@/components/ui/loading";
import { initLoginForm, LoginRequest } from "@/model/auth.model";
import { notifError } from "@/lib/toast";
import { ROUTES, APP_NAME } from "@/config/app.config";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LoginSchema } from "@/validation/auth.validation";

export default function LoginPage() {
  const { login, isLoggingIn, isLoading: isAuthLoading, profile } = useAuth();
  const [form, setForm] = useState<LoginRequest>(initLoginForm);

  if (isAuthLoading || profile) return <Loading />;

  const handleChange = (field: keyof LoginRequest) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const valid = LoginSchema.safeParse(form);
    if (!valid.success) {
      notifError(valid.error.issues[0].message);
      return;
    }

    login(form);
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
            Log in to your account
          </p>
        </div>

        {/* Form Card Container */}
        <div className="rounded-lg border border-border bg-card p-4 sm:p-5">
          <form onSubmit={handleSubmit}>
            <fieldset disabled={isLoggingIn} className="flex flex-col gap-3">
              <Input
                type="email"
                id="email"
                name="email"
                required
                autoComplete="email"
                value={form.email}
                onChange={handleChange("email")}
                placeholder="Email address"
              />

              <Input
                type="password"
                id="password"
                name="password"
                required
                autoComplete="current-password"
                value={form.password}
                onChange={handleChange("password")}
                placeholder="Password"
              />

              <div className="flex justify-end mt-0.5">
                <span className="cursor-pointer text-xs text-foreground/60 transition-colors hover:text-orange-500">
                  Forgot password?
                </span>
              </div>

              <Button 
                type="submit" 
                isLoading={isLoggingIn} 
                className="w-full mt-1"
              >
                Log in
              </Button>
            </fieldset>
          </form>
        </div>

        {/* Footer Section */}
        <p className="mt-4 text-center text-xs sm:text-sm text-foreground/60">
          Don&apos;t have an account?{" "}
          <Link 
            href={ROUTES.REGISTER} 
            className="font-medium text-orange-500 hover:text-orange-600 transition-colors underline-offset-4 hover:underline"
          >
            Create account
          </Link>
        </p>
      </motion.div>
    </main>
  );
}