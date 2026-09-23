import React from "react";
import { PageHeader, StatCard, Card } from "../../components/common";
import { Utensils, HeartHandshake, Building2, ShieldCheck } from "lucide-react";

const ImpactPage = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <PageHeader
        title="RePlate Environmental & Social Impact"
        subtitle="Tracking metrics across Noida & Delhi NCR food recovery operations."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Plates Saved"
          value="18,920"
          change="+24% YoY"
          icon={Utensils}
        />
        <StatCard
          title="CO2 Emissions Saved"
          value="11.2 Tons"
          change="Verified"
          icon={HeartHandshake}
        />
        <StatCard
          title="Commercial Donors"
          value="134"
          change="+8 this mo"
          icon={Building2}
        />
        <StatCard
          title="NGO Beneficiaries"
          value="52"
          change="Verified"
          icon={ShieldCheck}
        />
      </div>

      <Card variant="default">
        <Card.Title>Regional Recovery Leaderboard</Card.Title>
        <Card.Description>
          Top contributing food partners in Noida/NCR
        </Card.Description>
        <div className="mt-4 space-y-3">
          {[
            {
              name: "Radisson Hotel Sector 55",
              location: "Noida",
              meals: "3,450 plates",
            },
            {
              name: "Crowne Plaza Greater Noida",
              location: "Greater Noida",
              meals: "2,890 plates",
            },
            {
              name: "The French Loaf Bakery",
              location: "Noida Sector 18",
              meals: "1,240 plates",
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 bg-surface-50 rounded-xl"
            >
              <span className="font-semibold text-charcoal-900">
                {item.name} ({item.location})
              </span>
              <span className="text-sm font-bold text-brand-700">
                {item.meals}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default ImpactPage;
