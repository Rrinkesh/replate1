import React from "react";
import Card from "../common/Card";
import { TrendingUp } from "lucide-react";

const defaultRevenueData = [
  { week: "W1", value: 850 },
  { week: "W2", value: 1420 },
  { week: "W3", value: 2100 },
  { week: "W4", value: 3240 },
];

const RevenueRecoveredChart = ({
  data = defaultRevenueData,
  title = "Revenue Recovered (₹)",
  className = "",
}) => {
  const total = data.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <Card variant="default" className={`p-5 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-extrabold text-charcoal-900 uppercase tracking-wider">
            {title}
          </h3>
          <p className="text-xs text-charcoal-500">Monthly recovery value</p>
        </div>
        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
          <TrendingUp className="w-3 h-3" /> +24% MoM
        </span>
      </div>

      <div className="text-2xl font-black text-charcoal-900 tracking-tight mb-4">
        ₹{data[data.length - 1]?.value.toLocaleString()}{" "}
        <span className="text-xs font-semibold text-charcoal-500">
          this month
        </span>
      </div>

      {/* SVG Simulated Sparkline / Area Curve */}
      <div className="h-28 flex items-end justify-between gap-2 pt-2 px-1 border-b border-charcoal-200">
        {data.map((item, idx) => {
          const heightPercent = Math.round((item.value / 3500) * 100);
          return (
            <div
              key={idx}
              className="flex-1 flex flex-col items-center gap-1 justify-end h-full group"
            >
              <span className="text-[10px] font-bold text-charcoal-700 opacity-0 group-hover:opacity-100 transition-opacity">
                ₹{item.value}
              </span>
              <div
                className="w-full bg-emerald-600/80 hover:bg-emerald-600 rounded-t-lg transition-all"
                style={{ height: `${heightPercent}%` }}
              />
              <span className="text-[10px] font-bold text-charcoal-500 mt-1">
                {item.week}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-charcoal-500 font-medium">
        <span>Quarter Total:</span>
        <span className="font-bold text-charcoal-900">
          ₹{total.toLocaleString()}
        </span>
      </div>
    </Card>
  );
};

export default RevenueRecoveredChart;
