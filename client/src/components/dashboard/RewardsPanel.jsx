import React, { useState } from "react";
import { Gift, Zap, TrendingUp, HandCoins } from "lucide-react";
import { Card, Button, Modal } from "../common";
import impactService from "../../services/impactService";

const RewardsPanel = ({ userRole, credits, level }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [requestType, setRequestType] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const benefits = userRole === "BUSINESS" ? [
    { title: "Community Partner", credits: 100, desc: "Standard listing priority." },
    { title: "Featured Placement", credits: 500, desc: "Get promoted on the main page for 7 days.", code: "FEATURED_PLACEMENT" }
  ] : [
    { title: "Verified NGO", credits: 100, desc: "Priority in auto-escalations." },
    { title: "Fundraising Campaign", credits: 1000, desc: "Start a fundraising campaign on RePlate.", code: "FUNDRAISING_CAMPAIGN" }
  ];

  const handleRequest = async () => {
    setIsSubmitting(true);
    try {
      await impactService.requestReward(requestType, { description: "Requested from dashboard" });
      alert("Request submitted for Admin approval!");
      setIsModalOpen(false);
    } catch (err) {
      alert(err.response?.data?.message || "Request failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-sm font-black text-charcoal-900 mb-4 flex items-center gap-2">
        <Gift className="w-5 h-5 text-brand-600" />
        Available Benefits
      </h3>
      <div className="space-y-3">
        {benefits.map((b, idx) => {
          const unlocked = credits >= b.credits;
          return (
            <div key={idx} className={`p-4 rounded-xl border ${unlocked ? 'border-brand-200 bg-brand-50' : 'border-charcoal-100 bg-charcoal-50 opacity-70'}`}>
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-sm text-charcoal-900">{b.title}</span>
                <span className="text-xs font-bold text-brand-700">{b.credits} Credits</span>
              </div>
              <p className="text-xs text-charcoal-600 mb-3">{b.desc}</p>
              {unlocked && b.code && (
                <Button size="sm" onClick={() => { setRequestType(b.code); setIsModalOpen(true); }}>
                  Request Reward
                </Button>
              )}
            </div>
          );
        })}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Confirm Reward Request">
        <div className="text-sm text-charcoal-700 mb-4">
          Are you sure you want to spend your Impact Credits to request {requestType.replace('_', ' ')}? 
          This requires Admin approval.
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
          <Button onClick={handleRequest} disabled={isSubmitting}>{isSubmitting ? "Requesting..." : "Confirm Request"}</Button>
        </div>
      </Modal>
    </Card>
  );
};

export default RewardsPanel;
