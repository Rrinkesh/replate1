import React, { useId } from "react";
import { AlertCircle } from "lucide-react";

const Input = React.forwardRef(
  (
    {
      label,
      error,
      helperText,
      required = false,
      isDisabled = false,
      iconLeft: IconLeft,
      iconRight: IconRight,
      onRightIconClick,
      className = "",
      containerClassName = "",
      id: customId,
      type = "text",
      placeholder,
      value,
      onChange,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();
    const inputId = customId || generatedId;
    const helperId = `${inputId}-helper`;
    const errorId = `${inputId}-error`;

    return (
      <div className={`w-full ${containerClassName}`}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs sm:text-sm font-bold text-charcoal-800 mb-1.5"
          >
            {label}
            {required && (
              <span className="text-rose-500 ml-1" aria-hidden="true">
                *
              </span>
            )}
          </label>
        )}

        <div className="relative rounded-xl shadow-soft-xs">
          {IconLeft && (
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-charcoal-500">
              <IconLeft className="w-4 h-4" />
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            type={type}
            disabled={isDisabled}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            aria-invalid={Boolean(error)}
            aria-describedby={
              error ? errorId : helperText ? helperId : undefined
            }
            className={`
            w-full rounded-xl border text-sm font-medium transition-all duration-200
            placeholder:text-charcoal-400 text-charcoal-900 bg-white min-h-[44px]
            focus:outline-none focus:ring-2 focus:ring-offset-0
            ${IconLeft ? "pl-10" : "pl-3.5"}
            ${IconRight || error ? "pr-10" : "pr-3.5"}
            py-2.5 sm:py-3
            ${
              error
                ? "border-rose-300 focus:border-rose-500 focus:ring-rose-500/20 text-rose-900 bg-rose-50/20"
                : "border-charcoal-200 focus:border-brand-600 focus:ring-brand-500/20 hover:border-charcoal-300"
            }
            ${isDisabled ? "bg-charcoal-50 text-charcoal-500 cursor-not-allowed border-charcoal-200" : ""}
            ${className}
          `}
            {...props}
          />

          {error && !IconRight && (
            <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-rose-500">
              <AlertCircle className="w-4 h-4" />
            </div>
          )}

          {IconRight && (
            <div
              onClick={onRightIconClick}
              className={`absolute inset-y-0 right-0 pr-3.5 flex items-center text-charcoal-500 ${
                onRightIconClick
                  ? "cursor-pointer hover:text-charcoal-800"
                  : "pointer-events-none"
              }`}
            >
              <IconRight className="w-4 h-4" />
            </div>
          )}
        </div>

        {error && (
          <p
            id={errorId}
            className="mt-1.5 text-xs font-semibold text-rose-600 flex items-center gap-1"
          >
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            {error}
          </p>
        )}

        {!error && helperText && (
          <p
            id={helperId}
            className="mt-1.5 text-xs text-charcoal-500 font-medium"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";

export default Input;
