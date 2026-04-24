"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthService } from "@/service/auth.service";
import { useAuth } from "@/context/auth.context";
import { initLoginForm, LoginRequest } from "@/model/auth.model";
import { notifError, notifSuccess } from "@/lib/toast";
import { ROUTES, APP_NAME } from "@/config/app.config";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const { profile, refreshUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState<LoginRequest>(initLoginForm);
  const router = useRouter();

  useEffect(() => {
    if (profile) {
      router.push(ROUTES.HOME);
    }
  }, [profile, router]);

  const handleChange = (field: keyof LoginRequest) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const response = await AuthService.login(form);
    if (response.error) {
      notifError(response.error.message);
    } else {
      await refreshUser();
      notifSuccess("Welcome back!");
      router.push(ROUTES.HOME);
    }

    setIsLoading(false);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-50 px-4 py-10">
      <div className="w-full max-w-90">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">{APP_NAME}</h1>
          <p className="mt-1.5 text-sm text-neutral-500">Log in to your account</p>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-neutral-200">
          <form onSubmit={handleSubmit} className="space-y-3">
            <fieldset disabled={isLoading} className="space-y-3">
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

              <Button type="submit" isLoading={isLoading} className="w-full">
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
