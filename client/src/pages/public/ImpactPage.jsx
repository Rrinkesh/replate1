import React, { useEffect, useState } from "react";
import { PageHeader, StatCard, Card, LoadingSpinner } from "../../components/common";
import { Utensils, HeartHandshake, Building2, ShieldCheck, MapPin } from "lucide-react";
import api from "../../services/api";

const ImpactPage = () => {
  const [impactData, setImpactData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchImpact = async () => {
      try {
        const response = await api.get("/analytics/impact");
        if (response.data && response.data.success) {
          setImpactData(response.data.impact);
        }
      } catch (err) {
        console.error("Failed to fetch public impact metrics:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchImpact();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Fallback to 0 if data isn"t available
  const data = impactData || {
    totalPlatesSaved: 0,
    co2EmissionsSaved: "0 Tons",
    commercialDonors: 0,
    ngoBeneficiaries: 0,
    leaderboard: []
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 page-enter">
      <PageHeader
        title="RePlate Environmental & Social Impact"
        subtitle="Tracking live metrics across food recovery operations."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Plates Saved"
          value={data.totalPlatesSaved.toLocaleString()}
          change="Real-time"
          icon={Utensils}
        />
        <StatCard
          title="CO2 Emissions Saved"
          value={data.co2EmissionsSaved}
          change="Verified"
          icon={HeartHandshake}
        />
        <StatCard
          title="Commercial Donors"
          value={data.commercialDonors.toLocaleString()}
          change="Active Partners"
          icon={Building2}
        />
        <StatCard
          title="NGO Beneficiaries"
          value={data.ngoBeneficiaries.toLocaleString()}
          change="Verified"
          icon={ShieldCheck}
        />
      </div>

      <Card variant="default" className="hover-3d-mild transition-all duration-300">
        <Card.Title>Regional Recovery Leaderboard</Card.Title>
        <Card.Description>
          Top contributing food partners currently rescuing surplus food
        </Card.Description>
        <div className="mt-4 space-y-3">
          {data.leaderboard.length === 0 ? (
            <p className="text-sm text-charcoal-500 py-4 text-center">No active donations yet.</p>
          ) : (
            data.leaderboard.map((donor, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3.5 bg-surface-50 rounded-xl border border-charcoal-100 hover:border-brand-200 hover:shadow-soft-sm transition-all"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-xs shrink-0">
                    #{i + 1}
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-charcoal-900">
                      {donor.name}
                    </h4>
                    <span className="text-xs font-semibold text-charcoal-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-brand-500" />
                      {donor.location}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-black text-brand-600">
                    {donor.meals}
                  </div>
                  <div className="text-[10px] font-bold text-charcoal-400 uppercase tracking-wider">
                    Rescued
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};

export default ImpactPage;
