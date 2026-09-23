import React from "react";
import Card from "../common/Card";

const defaultCategoryData = [
  { category: "Prepared Meals", percentage: 52, color: "bg-brand-600" },
  { category: "Bakery & Pastries", percentage: 28, color: "bg-amber-500" },
  { category: "Catering Surplus", percentage: 14, color: "bg-emerald-500" },
  { category: "Groceries & Produce", percentage: 6, color: "bg-sky-500" },
];

const FoodRescuedChart = ({
  data = defaultCategoryData,
  title = "Food Rescued Distribution",
  className = "",
}) => {
  return (
    <Card variant="default" className={`p-5 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-extrabold text-charcoal-900 uppercase tracking-wider">
            {title}
          </h3>
          <p className="text-xs text-charcoal-500">Breakdown by food type</p>
        </div>
        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
          100% Verified
        </span>
      </div>

      {/* Multi-segment Progress Bar */}
      <div className="w-full h-4 rounded-full bg-surface-100 flex overflow-hidden my-4 p-0.5 border border-charcoal-100">
        {data.map((item, idx) => (
          <div
            key={idx}
            className={`h-full ${item.color} first:rounded-l-full last:rounded-r-full transition-all duration-300`}
            style={{ width: `${item.percentage}%` }}
            title={`${item.category}: ${item.percentage}%`}
          />
        ))}
      </div>

      {/* Category Legend List */}
      <div className="space-y-2.5 pt-2">
        {data.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${item.color} shrink-0`} />
              <span className="font-semibold text-charcoal-800">
                {item.category}
              </span>
            </div>
            <span className="font-extrabold text-charcoal-900">
              {item.percentage}%
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default FoodRescuedChart;
