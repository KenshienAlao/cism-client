"use client";
import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import Loading from "@/components/ui/loading";
import { initLoginForm, LoginRequest } from "@/model/auth.model";
import { notifError } from "@/lib/toast";
import { ROUTES, APP_NAME } from "@/config/app.config";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LoginSchema } from "@/validation/auth.validation";

export default function LoginPage() {
  const { login, isLoggingIn, isLoading: isAuthLoading } = useAuth();

  const [form, setForm] = useState<LoginRequest>(initLoginForm);

  if (isAuthLoading) return <Loading />;

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
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-90">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">{APP_NAME}</h1>
          <p className="mt-1.5 text-sm text-neutral-500">Log in to your account</p>
        </div>

        <div className="meta-card rounded-[--radius]">
          <form onSubmit={handleSubmit} className="space-y-3">
            <fieldset disabled={isLoggingIn} className="space-y-3">
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

              <div className="text-right">
                <span className="cursor-pointer text-xs text-neutral-500 transition-colors hover:text-neutral-900">
                  Forgot password?
                </span>
              </div>

              <Button type="submit" isLoading={isLoggingIn} className="w-full">
                Log in
              </Button>
            </fieldset>
          </form>
        </div>

        <p className="mt-5 text-center text-sm text-neutral-500">
          Don&apos;t have an account?{" "}
          <Link href={ROUTES.REGISTER} className="font-medium text-neutral-900 underline-offset-4 hover:underline">
            Create account
          </Link>
        </p>
      </div>
    </main>
  );
}
