import React from "react";
import { Loader2 } from "lucide-react";

const variantClasses = {
  primary:
    "bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white shadow-soft-sm hover:shadow-soft-md focus:ring-brand-500 border border-transparent",
  secondary:
    "bg-charcoal-900 hover:bg-charcoal-800 active:bg-charcoal-950 text-white shadow-soft-sm hover:shadow-soft-md focus:ring-charcoal-900 border border-transparent",
  outline:
    "bg-white hover:bg-charcoal-50 active:bg-charcoal-100 text-charcoal-800 border border-charcoal-200 shadow-soft-xs hover:border-charcoal-300 focus:ring-brand-500",
  ghost:
    "bg-transparent hover:bg-charcoal-100/70 active:bg-charcoal-200/70 text-charcoal-700 hover:text-charcoal-900 focus:ring-brand-500 border border-transparent",
  danger:
    "bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white shadow-soft-sm focus:ring-rose-500 border border-transparent",
};

const sizeClasses = {
  sm: "px-3 py-1.5 min-h-[36px] text-xs font-semibold rounded-lg gap-1.5",
  md: "px-4 py-2.5 min-h-[42px] text-sm font-bold rounded-xl gap-2",
  lg: "px-5 py-3 min-h-[48px] text-base font-bold rounded-xl gap-2.5",
};

const Button = React.forwardRef(
  (
    {
      children,
      variant = "primary",
      size = "md",
      isLoading = false,
      isDisabled = false,
      fullWidth = false,
      iconLeft: IconLeft,
      iconRight: IconRight,
      className = "",
      type = "button",
      onClick,
      ...props
    },
    ref,
  ) => {
    const isButtonDisabled = isDisabled || isLoading;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isButtonDisabled}
        onClick={onClick}
        className={`
        inline-flex items-center justify-center transition-all duration-200 ease-in-out select-none
        focus:outline-none focus:ring-2 focus:ring-offset-2
        active:scale-[0.98]
        ${variantClasses[variant] || variantClasses.primary}
        ${sizeClasses[size] || sizeClasses.md}
        ${fullWidth ? "w-full" : ""}
        ${isButtonDisabled ? "opacity-60 cursor-not-allowed active:scale-100 shadow-none" : ""}
        ${className}
      `}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
        ) : IconLeft ? (
          <IconLeft
            className={`shrink-0 ${size === "sm" ? "w-3.5 h-3.5" : size === "lg" ? "w-5 h-5" : "w-4 h-4"}`}
          />
        ) : null}

        <span>{children}</span>

        {!isLoading && IconRight && (
          <IconRight
            className={`shrink-0 ${size === "sm" ? "w-3.5 h-3.5" : size === "lg" ? "w-5 h-5" : "w-4 h-4"}`}
          />
        )}
      </button>
    );
  },
);

Button.displayName = "Button";

export default Button;
