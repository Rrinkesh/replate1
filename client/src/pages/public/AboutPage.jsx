import React from "react";
import { PageHeader, Card } from "../../components/common";

const AboutPage = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <PageHeader
        title="About RePlate"
        subtitle="Good food deserves another plate."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card variant="default">
          <Card.Title>Our Mission</Card.Title>
          <Card.Content className="mt-3 text-sm text-charcoal-700 leading-relaxed">
            RePlate is dedicated to building an intelligent, technology-driven
            food surplus recovery network across Noida and Delhi NCR. We bridge
            the gap between commercial food preparation and local food
            insecurity.
          </Card.Content>
        </Card>

        <Card variant="default">
          <Card.Title>Our Vision</Card.Title>
          <Card.Content className="mt-3 text-sm text-charcoal-700 leading-relaxed">
            A zero-food-waste future where every edible excess portion is
            seamlessly, safely, and transparently redirected to verified human
            plates.
          </Card.Content>
        </Card>
      </div>
    </div>
  );
};

export default AboutPage;
