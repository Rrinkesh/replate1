import React from "react";
import Card from "../common/Card";

const defaultDailyData = [
  { day: "Mon", kg: 14.2, meals: 55 },
  { day: "Tue", kg: 9.8, meals: 38 },
  { day: "Wed", kg: 22.4, meals: 88 },
  { day: "Thu", kg: 12.5, meals: 48 },
  { day: "Fri", kg: 28.0, meals: 110 },
  { day: "Sat", kg: 19.5, meals: 76 },
  { day: "Sun", kg: 18.4, meals: 73 },
];

const DailySurplusChart = ({
  data = defaultDailyData,
  title = "Daily Surplus Volume",
  className = "",
}) => {
  const maxKg = Math.max(...data.map((d) => d.kg), 30);

  return (
    <Card variant="default" className={`p-5 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-extrabold text-charcoal-900 uppercase tracking-wider">
            {title}
          </h3>
          <p className="text-xs text-charcoal-500">
            Recorded surplus (kg) per day
          </p>
        </div>
        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-brand-50 text-brand-700">
          This Week
        </span>
      </div>

      {/* SVG / CSS Bar Chart Visualization */}
      <div className="h-44 flex items-end justify-between gap-3 pt-6 pb-2 px-1 border-b border-charcoal-200">
        {data.map((bar, i) => {
          const heightPercent = Math.round((bar.kg / maxKg) * 100);
          return (
            <div
              key={i}
              className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group"
            >
              <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-extrabold text-brand-800 bg-brand-100 px-1.5 py-0.5 rounded shadow-soft-xs">
                {bar.kg}kg
              </div>
              <div
                className="w-full bg-gradient-to-t from-brand-600 to-brand-500 hover:from-brand-700 hover:to-brand-600 rounded-t-xl transition-all duration-300 shadow-soft-xs"
                style={{ height: `${heightPercent}%` }}
              />
              <span className="text-[11px] font-bold text-charcoal-600 mt-1">
                {bar.day}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-charcoal-500 font-medium">
        <span>Average: 17.5 kg / day</span>
        <span className="text-brand-700 font-bold">Total: 124.4 kg</span>
      </div>
    </Card>
  );
};

export default DailySurplusChart;
