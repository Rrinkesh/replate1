import React from "react";
import { PackageOpen } from "lucide-react";
import Button from "./Button";

const EmptyState = ({
  icon: Icon = PackageOpen,
  title = "No items found",
  description = "There are no active records available to display at this time.",
  actionLabel,
  onAction,
  actionButton,
  className = "",
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 sm:p-12 bg-white rounded-3xl border border-charcoal-100 shadow-soft-sm ${className}`}
    >
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-50 to-brand-100 text-brand-600 flex items-center justify-center mb-4 shadow-soft-xs border border-brand-200/50">
        <Icon className="w-8 h-8 shrink-0" />
      </div>

      <h3 className="text-xl font-bold text-charcoal-900 tracking-tight mb-2">
        {title}
      </h3>

      <p className="text-sm text-charcoal-500 max-w-sm mb-6 leading-relaxed">
        {description}
      </p>

      {actionButton ? (
        actionButton
      ) : actionLabel && onAction ? (
        <Button variant="primary" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
};

export default EmptyState;
