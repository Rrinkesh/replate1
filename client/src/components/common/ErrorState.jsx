import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import Button from "./Button";

const ErrorState = ({
  title = "Something went wrong. Please try again.",
  message = "An unexpected error occurred while processing your request. Please verify your connection.",
  onRetry,
  retryLabel = "Try Again",
  actionButton,
  className = "",
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 sm:p-12 bg-white rounded-3xl border border-rose-100 shadow-soft-sm ${className}`}
    >
      <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4 shadow-soft-xs border border-rose-200/60">
        <AlertCircle className="w-8 h-8 shrink-0" />
      </div>

      <h3 className="text-xl font-bold text-charcoal-900 tracking-tight mb-2">
        {title}
      </h3>

      <p className="text-sm text-charcoal-500 max-w-sm mb-6 leading-relaxed">
        {message}
      </p>

      {actionButton ? (
        actionButton
      ) : onRetry ? (
        <Button variant="danger" iconLeft={RefreshCw} onClick={onRetry}>
          {retryLabel}
        </Button>
      ) : null}
    </div>
  );
};

export default ErrorState;
