import React, { useId } from "react";
import { ChevronDown, AlertCircle } from "lucide-react";

const Select = React.forwardRef(
  (
    {
      label,
      options = [],
      error,
      helperText,
      required = false,
      isDisabled = false,
      placeholder = "Select an option",
      className = "",
      containerClassName = "",
      id: customId,
      value,
      onChange,
      children,
      iconLeft: IconLeft,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();
    const selectId = customId || generatedId;
    const helperId = `${selectId}-helper`;
    const errorId = `${selectId}-error`;

    return (
      <div className={`w-full ${containerClassName}`}>
        {label && (
          <label
            htmlFor={selectId}
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

          <select
            ref={ref}
            id={selectId}
            disabled={isDisabled}
            value={value}
            onChange={onChange}
            aria-invalid={Boolean(error)}
            aria-describedby={
              error ? errorId : helperText ? helperId : undefined
            }
            className={`
            w-full rounded-xl border text-sm font-medium transition-all duration-200 appearance-none bg-white min-h-[44px]
            text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-offset-0
            ${IconLeft ? "pl-10" : "pl-3.5"}
            pr-10 py-2.5 sm:py-3
            ${
              error
                ? "border-rose-300 focus:border-rose-500 focus:ring-rose-500/20 text-rose-900 bg-rose-50/20"
                : "border-charcoal-200 focus:border-brand-600 focus:ring-brand-500/20 hover:border-charcoal-300"
            }
            ${isDisabled ? "bg-charcoal-50 text-charcoal-500 cursor-not-allowed border-charcoal-200" : ""}
            ${className}
          `}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}

            {children
              ? children
              : options.map((opt) => (
                  <option
                    key={typeof opt === "object" ? opt.value : opt}
                    value={typeof opt === "object" ? opt.value : opt}
                  >
                    {typeof opt === "object" ? opt.label : opt}
                  </option>
                ))}
          </select>

          <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-charcoal-500">
            <ChevronDown className="w-4 h-4" />
          </div>
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

Select.displayName = "Select";

export default Select;
