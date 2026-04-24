import { ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";

type ButtonVariant = "primary" | "outline" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  isLoading?: boolean;
}

const variantClass: Record<ButtonVariant, string> = {
  primary:
    "bg-neutral-900 text-white hover:bg-black disabled:opacity-50",
  outline:
    "border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 disabled:text-neutral-400",
  ghost:
    "text-neutral-500 hover:text-neutral-900 disabled:text-neutral-300",
  danger:
    "border border-neutral-100 text-neutral-400 hover:border-red-100 hover:text-red-500 disabled:opacity-50",
};

export function Button({
  variant = "primary",
  isLoading = false,
  children,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center rounded-lg px-4 py-3 text-sm font-medium transition-all active:scale-[0.99] ${variantClass[variant]} ${className}`}
      {...props}
    >
      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : children}
    </button>
  );
}
