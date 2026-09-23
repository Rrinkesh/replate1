import React from "react";
import { PageHeader, Card } from "../../components/common";
import { RefreshCw, Clock, CheckCircle2, ShieldCheck } from "lucide-react";

const HowItWorksPage = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <PageHeader
        title="How RePlate Works"
        subtitle="A streamlined 4-step food surplus management system connecting donors and verified recipients in Noida & Delhi NCR."
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          {
            step: "01",
            title: "Food Surplus Logged",
            desc: "Hotels & cloud kitchens post excess prepared food with expiry timing and packaging details.",
            icon: Clock,
          },
          {
            step: "02",
            title: "Instant Matching",
            desc: "Algorithm alerts verified recipient NGOs within proximity for rapid recovery.",
            icon: RefreshCw,
          },
          {
            step: "03",
            title: "Quality Verification",
            desc: "Food safety protocols and temperature checks verified prior to dispatch.",
            icon: ShieldCheck,
          },
          {
            step: "04",
            title: "Safe Redistribution",
            desc: "Plates distributed directly to community centers and shelter networks.",
            icon: CheckCircle2,
          },
        ].map((item, idx) => (
          <Card key={idx} variant="default" className="relative">
            <div className="text-3xl font-black text-brand-600 mb-3">
              {item.step}
            </div>
            <Card.Title>{item.title}</Card.Title>
            <Card.Description className="mt-2 leading-relaxed">
              {item.desc}
            </Card.Description>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default HowItWorksPage;
