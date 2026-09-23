import React from "react";
import { Link } from "react-router-dom";
import { PageHeader, Card, Button } from "../../components/common";
import { HeartHandshake, ShieldCheck, Truck, ArrowRight } from "lucide-react";

const RecipientPage = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <PageHeader
        title="RePlate for Recipient Organizations"
        subtitle="Connecting verified NGOs, community kitchens, and shelters with reliable food surplus."
        actions={
          <Link to="/signup">
            <Button variant="primary" iconRight={ArrowRight}>
              Apply as Recipient
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card variant="default">
          <ShieldCheck className="w-8 h-8 text-brand-600 mb-4" />
          <Card.Title>Verified NGO Network</Card.Title>
          <Card.Description>
            Strict onboarding standards to ensure safe and accountable food
            distribution.
          </Card.Description>
        </Card>

        <Card variant="default">
          <Truck className="w-8 h-8 text-brand-600 mb-4" />
          <Card.Title>Real-Time Proximity Alerts</Card.Title>
          <Card.Description>
            Receive instant SMS & app notifications when food is posted near
            your facility.
          </Card.Description>
        </Card>

        <Card variant="default">
          <HeartHandshake className="w-8 h-8 text-brand-600 mb-4" />
          <Card.Title>Dignified Food Access</Card.Title>
          <Card.Description>
            Fresh, high-quality meals delivered safely to those who need them
            most.
          </Card.Description>
        </Card>
      </div>
    </div>
  );
};

export default RecipientPage;
