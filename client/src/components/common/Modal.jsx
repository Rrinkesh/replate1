import React, { useEffect } from "react";
import {
  X,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import Button from "./Button";

const sizeClasses = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

const variantIcons = {
  confirmation: HelpCircle,
  success: CheckCircle2,
  warning: AlertTriangle,
  danger: AlertCircle,
  default: null,
};

const variantColors = {
  confirmation: "text-brand-600 bg-brand-50 border-brand-200",
  success: "text-emerald-600 bg-emerald-50 border-emerald-200",
  warning: "text-amber-600 bg-amber-50 border-amber-200",
  danger: "text-rose-600 bg-rose-50 border-rose-200",
  default: "",
};

const Modal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  size = "md",
  variant = "default",
  showCloseButton = true,
  closeOnOverlayClick = true,
  className = "",
}) => {
  // Handle ESC key press for accessibility
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen && onClose) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const IconComponent = variantIcons[variant];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
    >
      {/* Backdrop Overlay with Blur */}
      <div
        className="fixed inset-0 bg-charcoal-950/40 backdrop-blur-sm transition-opacity duration-300"
        onClick={closeOnOverlayClick ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Modal Dialog Container */}
      <div
        className={`
          relative w-full bg-white rounded-3xl shadow-soft-xl border border-charcoal-100
          transform transition-all duration-300 ease-out z-10 overflow-hidden
          ${sizeClasses[size] || sizeClasses.md}
          ${className}
        `}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-start justify-between p-6 pb-4 border-b border-charcoal-100">
            <div className="flex items-center gap-3">
              {IconComponent && (
                <div
                  className={`w-10 h-10 rounded-2xl border flex items-center justify-center shrink-0 ${variantColors[variant]}`}
                >
                  <IconComponent className="w-5 h-5" />
                </div>
              )}
              <div>
                {title && (
                  <h2
                    id="modal-title"
                    className="text-xl font-bold text-charcoal-900 tracking-tight"
                  >
                    {title}
                  </h2>
                )}
                {subtitle && (
                  <p className="text-xs text-charcoal-500 mt-0.5">{subtitle}</p>
                )}
              </div>
            </div>

            {showCloseButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                aria-label="Close modal"
                className="rounded-full p-2 text-charcoal-500 hover:text-charcoal-900 hover:bg-charcoal-100 -mr-2 -mt-1"
              >
                <X className="w-5 h-5" />
              </Button>
            )}
          </div>
        )}

        {/* Content Body */}
        <div className="p-6">{children}</div>

        {/* Footer Actions */}
        {footer && (
          <div className="flex items-center justify-end gap-3 p-6 pt-4 bg-surface-50 border-t border-charcoal-100">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
