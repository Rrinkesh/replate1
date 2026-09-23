import React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import Card from "./Card";

const trendColors = {
  up: "text-emerald-700 bg-emerald-50 border-emerald-200",
  down: "text-rose-700 bg-rose-50 border-rose-200",
  neutral: "text-charcoal-700 bg-charcoal-100 border-charcoal-200",
};

const TrendIcon = ({ direction }) => {
  if (direction === "up")
    return <TrendingUp className="w-3.5 h-3.5 shrink-0" />;
  if (direction === "down")
    return <TrendingDown className="w-3.5 h-3.5 shrink-0" />;
  return <Minus className="w-3.5 h-3.5 shrink-0" />;
};

const StatCard = ({
  title,
  value,
  change,
  changeDirection = "up",
  icon: Icon,
  helperText,
  variant = "default",
  className = "",
}) => {
  return (
    <Card variant={variant} className={`relative overflow-hidden ${className}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase font-bold tracking-wider text-charcoal-500 mb-1">
            {title}
          </p>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900 tracking-tight">
            {value}
          </h3>
        </div>

        {Icon && (
          <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 border border-brand-100 flex items-center justify-center shrink-0 shadow-soft-xs">
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>

      {(change || helperText) && (
        <div className="mt-4 pt-3 border-t border-charcoal-100 flex items-center justify-between text-xs">
          {change && (
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border font-semibold ${
                trendColors[changeDirection] || trendColors.up
              }`}
            >
              <TrendIcon direction={changeDirection} />
              {change}
            </span>
          )}

          {helperText && (
            <span className="text-charcoal-500 font-medium ml-auto">
              {helperText}
            </span>
          )}
        </div>
      )}
    </Card>
  );
};

export default StatCard;
