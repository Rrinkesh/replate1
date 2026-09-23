import React from "react";
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  BadgeCheck,
  Sparkles,
} from "lucide-react";

const presetConfig = {
  Available: {
    variant: "success",
    icon: CheckCircle2,
    label: "Available",
  },
  "Expiring Soon": {
    variant: "warning",
    icon: Clock,
    label: "Expiring Soon",
  },
  "Almost Expired": {
    variant: "danger",
    icon: AlertTriangle,
    label: "Almost Expired",
  },
  Verified: {
    variant: "info",
    icon: BadgeCheck,
    label: "Verified",
  },
  "Coming Soon": {
    variant: "neutral",
    icon: Sparkles,
    label: "Coming Soon",
  },
};

const variantStyles = {
  success:
    "bg-status-success-bg text-status-success-text border-status-success-border",
  warning:
    "bg-status-warning-bg text-status-warning-text border-status-warning-border",
  danger:
    "bg-status-danger-bg text-status-danger-text border-status-danger-border",
  info: "bg-status-info-bg text-status-info-text border-status-info-border",
  neutral:
    "bg-status-neutral-bg text-status-neutral-text border-status-neutral-border",
  brand: "bg-brand-50 text-brand-700 border-brand-200",
};

const dotColors = {
  success: "bg-status-success-dot",
  warning: "bg-status-warning-dot",
  danger: "bg-status-danger-dot",
  info: "bg-status-info-dot",
  neutral: "bg-status-neutral-dot",
  brand: "bg-brand-600",
};

const sizeStyles = {
  sm: "px-2 py-0.5 text-xs font-semibold gap-1",
  md: "px-2.5 py-1 text-xs font-semibold gap-1.5",
  lg: "px-3 py-1.5 text-sm font-semibold gap-2",
};

const Badge = ({
  children,
  status,
  variant,
  size = "md",
  showDot = false,
  showIcon = true,
  icon: CustomIcon,
  className = "",
  ...props
}) => {
  const preset = presetConfig[status];
  const finalVariant = variant || (preset ? preset.variant : "neutral");
  const IconComponent = CustomIcon || (preset ? preset.icon : null);
  const displayLabel = children || (preset ? preset.label : status);

  return (
    <span
      className={`
        inline-flex items-center rounded-full border transition-colors duration-150
        ${variantStyles[finalVariant] || variantStyles.neutral}
        ${sizeStyles[size] || sizeStyles.md}
        ${className}
      `}
      {...props}
    >
      {showDot && (
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColors[finalVariant] || dotColors.neutral}`}
          aria-hidden="true"
        />
      )}

      {showIcon && IconComponent && (
        <IconComponent
          className={`shrink-0 ${size === "sm" ? "w-3 h-3" : size === "lg" ? "w-4 h-4" : "w-3.5 h-3.5"}`}
        />
      )}

      <span>{displayLabel}</span>
    </span>
  );
};

export default Badge;
