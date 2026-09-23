import React from "react";
import { Link } from "react-router-dom";
import { PageHeader, Card, Button } from "../../components/common";
import { Building2, ArrowRight, Shield, Award } from "lucide-react";

const BusinessPage = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <PageHeader
        title="RePlate for Food Businesses"
        subtitle="Empowering hotels, restaurants, bakeries, and cloud kitchens to turn food surplus into verified community impact."
        actions={
          <Link to="/signup">
            <Button variant="primary" iconRight={ArrowRight}>
              Register Your Business
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card variant="default">
          <Building2 className="w-8 h-8 text-brand-600 mb-4" />
          <Card.Title>Commercial Hotels & Buffets</Card.Title>
          <Card.Description>
            Manage large-scale event surplus efficiently with automated pick-up
            notifications.
          </Card.Description>
        </Card>

        <Card variant="default">
          <Shield className="w-8 h-8 text-brand-600 mb-4" />
          <Card.Title>Tax & CSR Compliance</Card.Title>
          <Card.Description>
            Track carbon offset metrics and receive monthly CSR impact
            statements.
          </Card.Description>
        </Card>

        <Card variant="default">
          <Award className="w-8 h-8 text-brand-600 mb-4" />
          <Card.Title>Zero Waste Certification</Card.Title>
          <Card.Description>
            Earn RePlate Sustainable Partner badges for public brand
            recognition.
          </Card.Description>
        </Card>
      </div>
    </div>
  );
};

export default BusinessPage;
