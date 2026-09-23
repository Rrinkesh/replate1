import React from "react";
import { Utensils } from "lucide-react";

const spinnerSizes = {
  sm: "w-5 h-5 border-2",
  md: "w-8 h-8 border-3",
  lg: "w-12 h-12 border-4",
  xl: "w-16 h-16 border-4",
};

const LoadingSpinner = ({
  message = "Loading...",
  size = "md",
  fullScreen = false,
  showIcon = true,
  className = "",
}) => {
  const content = (
    <div
      className={`flex flex-col items-center justify-center p-6 text-center ${className}`}
    >
      <div className="relative flex items-center justify-center">
        {/* Outer Rotating Ring */}
        <div
          className={`
            rounded-full border-solid border-brand-200 border-t-brand-600 animate-spin
            ${spinnerSizes[size] || spinnerSizes.md}
          `}
        />

        {/* Center Pulsing Icon */}
        {showIcon && (size === "lg" || size === "xl") && (
          <div className="absolute text-brand-600 animate-pulse">
            <Utensils className={size === "xl" ? "w-6 h-6" : "w-4 h-4"} />
          </div>
        )}
      </div>

      {message && (
        <p className="mt-4 text-sm font-semibold text-charcoal-700 tracking-wide animate-pulse">
          {message}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-md">
        {content}
      </div>
    );
  }

  return content;
};

export default LoadingSpinner;
