import React from "react";
import { CheckCircle2, ArrowRight } from "lucide-react";
import Button from "./Button";

const SuccessState = ({
  title = "Food successfully listed on RePlate.",
  message = "Your surplus posting is now live. Verified recipient NGOs near you are being notified.",
  actionLabel,
  onAction,
  actionButton,
  className = "",
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 sm:p-12 bg-white rounded-3xl border border-brand-100 shadow-soft-sm ${className}`}
    >
      <div className="w-16 h-16 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mb-4 shadow-soft-xs border border-brand-200/60 animate-bounce">
        <CheckCircle2 className="w-8 h-8 shrink-0" />
      </div>

      <h3 className="text-xl font-bold text-charcoal-900 tracking-tight mb-2">
        {title}
      </h3>

      <p className="text-sm text-charcoal-500 max-w-sm mb-6 leading-relaxed">
        {message}
      </p>

      {actionButton ? (
        actionButton
      ) : actionLabel && onAction ? (
        <Button variant="primary" iconRight={ArrowRight} onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
};

export default SuccessState;
