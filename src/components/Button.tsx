import React from "react";
import { cn } from "../utils/cn";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
  size?: "sm" | "md" | "lg";
}

export function Button({
  children,
  className,
  variant = "primary",
  size = "md",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "rounded-xl font-medium transition-all duration-200 cyber-border relative overflow-hidden group",
        "before:absolute before:inset-0 before:bg-gradient-to-r before:transition-opacity",

        variant === "primary" && [
          "bg-primary/10 text-primary",
          "before:from-primary/10 before:to-accent-blue/10 before:opacity-0",
          "hover:before:opacity-100",
        ],
        variant === "secondary" && [
          "bg-dark-light text-gray-100",
          "before:from-primary/5 before:to-accent-blue/5 before:opacity-0",
          "hover:before:opacity-100",
        ],
        size === "sm" && "px-3 py-1.5 text-sm",
        size === "md" && "px-4 py-2",
        size === "lg" && "px-6 py-3 text-lg",
        className
      )}
      {...props}
    >
      <span className="relative z-10">{children}</span>
    </button>
  );
}
