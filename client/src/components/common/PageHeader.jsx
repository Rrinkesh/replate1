import React from "react";

const PageHeader = ({
  title,
  subtitle,
  badge,
  breadcrumbs,
  actions,
  className = "",
}) => {
  return (
    <div className={`mb-8 pb-6 border-b border-charcoal-100 ${className}`}>
      {breadcrumbs && (
        <div className="mb-3 text-xs text-charcoal-500">{breadcrumbs}</div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900 tracking-tight">
              {title}
            </h1>
            {badge && <div>{badge}</div>}
          </div>

          {subtitle && (
            <p className="mt-1.5 text-sm sm:text-base text-charcoal-500 max-w-2xl">
              {subtitle}
            </p>
          )}
        </div>

        {actions && (
          <div className="flex items-center gap-3 shrink-0 self-start sm:self-auto">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
