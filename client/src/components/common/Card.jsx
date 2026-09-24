import React from "react";

const variantClasses = {
  default:
    "bg-white border border-charcoal-100 shadow-soft-sm hover:shadow-soft-md",
  glass: "glass-card shadow-glass",
  outlined: "bg-white border border-charcoal-200 shadow-none",
  flat: "bg-surface-100 border border-transparent shadow-none",
};

const paddingClasses = {
  none: "p-0",
  sm: "p-4",
  md: "p-5 sm:p-6",
  lg: "p-6 sm:p-8",
};

const Card = ({
  children,
  variant = "default",
  padding = "md",
  hoverable = false,
  className = "",
  ...props
}) => {
  return (
    <div
      className={`
        rounded-2xl sm:rounded-3xl transition-all duration-200 ease-in-out overflow-hidden
        ${variantClasses[variant] || variantClasses.default}
        ${paddingClasses[padding] || paddingClasses.md}
        ${hoverable ? "hover-3d cursor-pointer" : ""}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};

Card.Header = ({ children, className = "", ...props }) => (
  <div className={`mb-4 ${className}`} {...props}>
    {children}
  </div>
);

Card.Title = ({ children, className = "", as: Component = "h3", ...props }) => (
  <Component
    className={`text-base sm:text-lg font-extrabold text-charcoal-900 tracking-tight ${className}`}
    {...props}
  >
    {children}
  </Component>
);

Card.Description = ({ children, className = "", ...props }) => (
  <p
    className={`text-xs sm:text-sm text-charcoal-500 mt-1 leading-relaxed ${className}`}
    {...props}
  >
    {children}
  </p>
);

Card.Content = ({ children, className = "", ...props }) => (
  <div className={`${className}`} {...props}>
    {children}
  </div>
);

Card.Footer = ({ children, className = "", ...props }) => (
  <div
    className={`mt-6 pt-4 border-t border-charcoal-100 flex items-center justify-between gap-3 ${className}`}
    {...props}
  >
    {children}
  </div>
);

export default Card;
