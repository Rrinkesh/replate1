import React from "react";
import Card from "./Card";
import LoadingSpinner from "./LoadingSpinner";

const DashboardCard = ({
  title,
  subtitle,
  action,
  children,
  footer,
  isLoading = false,
  variant = "default",
  className = "",
}) => {
  return (
    <Card variant={variant} className={`flex flex-col h-full ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-charcoal-100">
          <div>
            {title && (
              <h3 className="text-base font-bold text-charcoal-900 tracking-tight">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs text-charcoal-500 mt-0.5">{subtitle}</p>
            )}
          </div>

          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}

      <div className="flex-1">
        {isLoading ? (
          <div className="py-12">
            <LoadingSpinner
              size="md"
              message="Loading dashboard data..."
              showIcon={false}
            />
          </div>
        ) : (
          children
        )}
      </div>

      {footer && (
        <div className="mt-4 pt-3 border-t border-charcoal-100">{footer}</div>
      )}
    </Card>
  );
};

export default DashboardCard;
