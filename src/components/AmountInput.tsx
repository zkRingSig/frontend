import React from "react";
import { cn } from "../utils/cn";

interface AmountInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function AmountInput({ label, className, ...props }: AmountInputProps) {
  return (
    <div className="relative group">
      <input
        // type="number"
        className={cn(
          "w-full bg-dark-lighter px-4 py-2 rounded-xl",
          "border border-primary/20 focus:border-primary/40",
          "text-base text-gray-100 placeholder:text-gray-500",
          "focus:outline-none focus:ring-2 focus:ring-primary/20",
          "transition-all duration-300",
          className
        )}
        {...props}
      />
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/5 to-accent-blue/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </div>
  );
}
