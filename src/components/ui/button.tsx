import { ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";

type ButtonVariant = "primary" | "outline" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  isLoading?: boolean;
}

const variantClass: Record<ButtonVariant, string> = {
  primary:
    "bg-orange-500 text-white hover:bg-orange-600 active:bg-orange-700 focus:ring-orange-500 disabled:bg-secondary disabled:text-secondary-foreground/40",
  outline:
    "border border-border bg-background text-foreground hover:bg-secondary active:bg-secondary/80 focus:ring-ring disabled:opacity-50",
  ghost:
    "text-secondary-foreground hover:bg-secondary hover:text-foreground active:bg-secondary/80 focus:ring-ring disabled:opacity-30",
  danger:
    "border border-border bg-card text-destructive hover:bg-destructive/10 active:bg-destructive/20 focus:ring-destructive disabled:opacity-50",
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
      className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors duration-150 focus:outline-none focus:ring-1 disabled:pointer-events-none h-9 px-4 ${variantClass[variant]} ${className}`}
      {...props}
    >
      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : children}
    </button>
  );
}