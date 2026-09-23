import React from "react";
import Card from "../common/Card";
import { Leaf } from "lucide-react";

const WasteReductionChart = ({
  title = "Landfill Waste Reduction",
  valueKg = 18.4,
  targetKg = 25,
  className = "",
}) => {
  const percentage = Math.min(Math.round((valueKg / targetKg) * 100), 100);

  return (
    <Card variant="default" className={`p-5 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-extrabold text-charcoal-900 uppercase tracking-wider">
            {title}
          </h3>
          <p className="text-xs text-charcoal-500">
            Environmental impact target
          </p>
        </div>
        <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
          <Leaf className="w-4 h-4" />
        </div>
      </div>

      <div className="flex items-baseline justify-between mb-2">
        <span className="text-2xl font-black text-charcoal-900 tracking-tight">
          {valueKg} kg
        </span>
        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
          {percentage}% of Daily Goal ({targetKg}kg)
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-3.5 bg-surface-100 rounded-full overflow-hidden p-0.5 border border-charcoal-100 mb-4">
        <div
          className="h-full bg-gradient-to-r from-emerald-500 to-brand-600 rounded-full transition-all duration-500 shadow-soft-xs"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="bg-surface-50 p-3 rounded-xl text-xs text-charcoal-700 space-y-1">
        <p>
          • <strong>Methane Avoided:</strong> ~46 kg CO₂e offset
        </p>
        <p>
          • <strong>Water Saved:</strong> ~1,200 Liters
        </p>
      </div>
    </Card>
  );
};

export default WasteReductionChart;
