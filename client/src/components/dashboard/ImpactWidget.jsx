import React, { useState, useEffect } from "react";
import { Star, ShieldCheck, Trophy, Target, TrendingUp } from "lucide-react";
import { Card, Badge, LoadingSpinner, ErrorState } from "../common";
import impactService from "../../services/impactService";

const RewardLevelBadge = ({ level }) => {
  const levelConfig = {
    REPLATE_CHAMPION: { color: "bg-amber-100 text-amber-700 border-amber-200", icon: Trophy, label: "RePlate Champion" },
    FOOD_RESCUE_PARTNER: { color: "bg-purple-100 text-purple-700 border-purple-200", icon: Star, label: "Food Rescue Partner" },
    COMMUNITY_PARTNER: { color: "bg-blue-100 text-blue-700 border-blue-200", icon: ShieldCheck, label: "Community Partner" },
    NEW: { color: "bg-charcoal-100 text-charcoal-600 border-charcoal-200", icon: Target, label: "New Member" }
  };
  
  const config = levelConfig[level] || levelConfig.NEW;
  const Icon = config.icon;
  
  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold ${config.color}`}>
      <Icon className="w-3.5 h-3.5" />
      {config.label}
    </div>
  );
};

const ImpactWidget = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchImpact = async () => {
      try {
        const res = await impactService.getMyImpact();
        setData(res.stats);
      } catch (err) {
        setError("Failed to load impact stats.");
      } finally {
        setLoading(false);
      }
    };
    fetchImpact();
  }, []);

  if (loading) return <Card className="p-6 flex justify-center"><LoadingSpinner size="sm" /></Card>;
  if (error) return <Card className="p-6"><ErrorState title="Error" message={error} /></Card>;
  if (!data) return null;

  return (
    <Card className="p-5 md:p-6 bg-gradient-to-br from-brand-50 to-white border-brand-100 relative overflow-hidden">
      {/* Decorative background circle */}
      <div className="absolute -top-12 -right-12 w-40 h-40 bg-brand-100/50 rounded-full blur-2xl pointer-events-none" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-black text-charcoal-900 tracking-tight flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-brand-600" />
            Your Impact
          </h2>
          <RewardLevelBadge level={data.rewardLevel} />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-white rounded-2xl border border-charcoal-100 shadow-soft-xs text-center">
            <p className="text-xs text-charcoal-500 font-bold uppercase tracking-wider mb-1">Impact Credits</p>
            <p className="text-2xl font-black text-brand-600">{data.impactCredits}</p>
          </div>
          
          <div className="p-4 bg-white rounded-2xl border border-charcoal-100 shadow-soft-xs text-center">
            <p className="text-xs text-charcoal-500 font-bold uppercase tracking-wider mb-1">Trust Score</p>
            <div className="flex items-center justify-center gap-1.5">
              <ShieldCheck className={`w-5 h-5 ${data.trustScore >= 80 ? 'text-emerald-500' : 'text-amber-500'}`} />
              <p className={`text-2xl font-black ${data.trustScore >= 80 ? 'text-emerald-600' : 'text-amber-600'}`}>
                {data.trustScore}
              </p>
            </div>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-charcoal-100 shadow-soft-xs text-center">
            <p className="text-xs text-charcoal-500 font-bold uppercase tracking-wider mb-1">Food Rescued</p>
            <p className="text-2xl font-black text-charcoal-900">{data.totalFoodRescuedKg} <span className="text-sm font-semibold text-charcoal-500">kg</span></p>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-charcoal-100 shadow-soft-xs text-center">
            <p className="text-xs text-charcoal-500 font-bold uppercase tracking-wider mb-1">Completed</p>
            <p className="text-2xl font-black text-charcoal-900">{data.totalCompletedOrders}</p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ImpactWidget;
