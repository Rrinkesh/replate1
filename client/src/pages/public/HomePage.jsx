import React from "react";
import { Link } from "react-router-dom";
import {
  Utensils,
  ArrowRight,
  Sparkles,
  Building2,
  HeartHandshake,
  ShieldCheck,
  CheckCircle2,
  Clock,
  MapPin,
  BarChart3,
  DollarSign,
  Leaf,
  Store,
  ChevronRight,
  Bot,
  Zap,
} from "lucide-react";

import { useTranslation } from "react-i18next";
import { Button, Badge, Card, StatCard } from "../../components/common";

// Impact statistics mock dataset
const impactMetrics = [
  {
    value: "12,480+",
    label: "Meals Rescued",
    helper: "Plates served to community",
    icon: Utensils,
  },
  {
    value: "8.7 Tons",
    label: "Food Diverted",
    helper: "Methane emissions offset",
    icon: Leaf,
  },
  {
    value: "₹4.2L",
    label: "Value Recovered",
    helper: "Returned to food businesses",
    icon: DollarSign,
  },
  {
    value: "96",
    label: "Food Partners",
    helper: "Noida & Delhi NCR network",
    icon: Building2,
  },
];

// 4-Step How It Works dataset
const howItWorksSteps = [
  {
    step: "01",
    title: "Businesses List Surplus",
    desc: "Hotels, bakeries, and cloud kitchens post excess prepared food with expiry timing and pickup window.",
    icon: Store,
  },
  {
    step: "02",
    title: "RePlate Finds a Match",
    desc: "Intelligent routing instantly alerts verified recipient NGOs within a 5km radius.",
    icon: Zap,
  },
  {
    step: "03",
    title: "Recipient Reserves Food",
    desc: "Organizations confirm claim requests and schedule rapid, temperature-safe pickup.",
    icon: CheckCircle2,
  },
  {
    step: "04",
    title: "Food Gets a Second Plate",
    desc: "Good food is served directly to community shelters instead of going to landfills.",
    icon: Utensils,
  },
];

// For Business Feature Cards
const businessFeatures = [
  {
    title: "Reduce Waste",
    desc: "Track how much food becomes surplus across daily operations with automated logs.",
    icon: Leaf,
  },
  {
    title: "Recover Revenue",
    desc: "Sell suitable surplus or claim tax benefits instead of throwing away edible value.",
    icon: DollarSign,
  },
  {
    title: "Smart Insights",
    desc: "Prepare for future surplus trends using AI-powered historical prep analysis.",
    icon: Sparkles,
  },
  {
    title: "Sustainability Reports",
    desc: "Generate monthly ESG and carbon reduction reports for corporate compliance.",
    icon: BarChart3,
  },
];

// For Recipient Feature Cards
const recipientFeatures = [
  {
    title: "Affordable Food",
    desc: "Access high-quality surplus meals at zero or minimal recovery cost.",
    icon: Utensils,
  },
  {
    title: "Nearby Availability",
    desc: "Proximity-matched listings in Noida, Greater Noida, and Delhi NCR.",
    icon: MapPin,
  },
  {
    title: "Verified Businesses",
    desc: "Partner only with FSSAI-compliant hotels and commercial kitchens.",
    icon: ShieldCheck,
  },
  {
    title: "Easy Pickup",
    desc: "Seamless QR verification and structured pickup windows.",
    icon: Clock,
  },
  {
    title: "Real-time Listings",
    desc: "Instant live alerts as soon as commercial kitchens post excess food.",
    icon: Zap,
  },
];

const HomePage = () => {
  const { t } = useTranslation();
  return (
    <div className="space-y-20 sm:space-y-24 pb-20 overflow-x-hidden page-enter">
      {/* 1. HERO SECTION */}
      <section className="relative pt-10 sm:pt-16 pb-8">
        {/* Subtle background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[320px] sm:w-[600px] h-[250px] sm:h-[350px] bg-brand-200/40 blur-[100px] sm:blur-[120px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-800 text-xs font-bold shadow-soft-xs">
                <Sparkles className="w-3.5 h-3.5 text-brand-600 animate-pulse" />
                <span>{t("hero.badge", "Zero Waste Initiative")}</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-charcoal-900 tracking-tight leading-[1.15]">
                {t("hero.title1", "Good food deserves")}{" "}
                <span className="bg-gradient-to-r from-brand-600 via-emerald-600 to-teal-700 bg-clip-text text-transparent">
                  {t("hero.title2", "another plate.")}
                </span>
              </h1>

              <p className="text-sm sm:text-lg text-charcoal-600 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
                {t("hero.subtitle", "Connect surplus food from commercial kitchens with NGOs and individuals in need. Stop waste, start feeding.")}
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
                <Link to="/food" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    variant="primary"
                    iconRight={ArrowRight}
                    fullWidth
                  >
                    {t("hero.ctaPrimary", "Find Food Now")}
                  </Button>
                </Link>
                <Link to="/business" className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" fullWidth>
                    {t("hero.ctaSecondary", "Partner With Us")}
                  </Button>
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="pt-6 border-t border-charcoal-100 flex flex-wrap items-center justify-center lg:justify-start gap-5 text-xs text-charcoal-500">
                <span className="flex items-center gap-1.5 font-bold text-charcoal-700">
                  <ShieldCheck className="w-4 h-4 text-brand-600" /> FSSAI
                  Verified Standards
                </span>
                <span className="flex items-center gap-1.5 font-bold text-charcoal-700">
                  <HeartHandshake className="w-4 h-4 text-brand-600" /> 45+ NGO
                  Partners
                </span>
              </div>
            </div>

            {/* Right-Side SaaS Flow & AI Card Composition */}
            <div className="lg:col-span-6 relative animate-float-slow hover-3d-mild">
              <div className="relative rounded-3xl bg-gradient-to-b from-white to-surface-100 p-5 sm:p-8 border border-charcoal-100 shadow-soft-xl overflow-hidden">
                {/* Visual Pipeline Header */}
                <div className="flex items-center justify-between pb-4 mb-5 border-b border-charcoal-100">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-brand-500 animate-ping" />
                    <span className="text-xs font-extrabold uppercase tracking-wider text-charcoal-800">
                      Live Surplus Pipeline
                    </span>
                  </div>
                  <Badge status="Available" size="sm" showDot />
                </div>

                {/* Pipeline Flow Grid Nodes */}
                <div className="grid grid-cols-4 gap-2 mb-5 items-center text-center">
                  <div className="p-2.5 sm:p-3 bg-white rounded-2xl border border-charcoal-100 shadow-soft-xs">
                    <Store className="w-5 h-5 text-brand-600 mx-auto mb-1" />
                    <p className="text-[10px] sm:text-[11px] font-bold text-charcoal-900">
                      Restaurant
                    </p>
                  </div>

                  <div className="flex flex-col items-center">
                    <span className="text-[10px] text-brand-700 font-bold mb-1">
                      Excess
                    </span>
                    <div className="w-full h-0.5 bg-gradient-to-r from-brand-300 to-brand-600 relative">
                      <ChevronRight className="w-4 h-4 text-brand-600 absolute -top-1.5 right-0" />
                    </div>
                  </div>

                  <div className="p-2.5 sm:p-3 bg-brand-600 text-white rounded-2xl shadow-soft-sm">
                    <Utensils className="w-5 h-5 mx-auto mb-1" />
                    <p className="text-[10px] sm:text-[11px] font-bold">
                      RePlate
                    </p>
                  </div>

                  <div className="p-2.5 sm:p-3 bg-white rounded-2xl border border-charcoal-100 shadow-soft-xs">
                    <HeartHandshake className="w-5 h-5 text-brand-600 mx-auto mb-1" />
                    <p className="text-[10px] sm:text-[11px] font-bold text-charcoal-900">
                      Recipient
                    </p>
                  </div>
                </div>

                {/* Hero Image Mockup Preview */}
                <div className="relative rounded-2xl overflow-hidden shadow-soft-md border border-charcoal-200 h-44 sm:h-56 bg-charcoal-900">
                  <img
                    src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1000&q=80"
                    alt="Fresh surplus food prep"
                    className="w-full h-full object-cover opacity-85"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950/85 via-transparent to-transparent flex items-end p-4">
                    <div className="text-white">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-brand-300">
                        Radisson Hotel Noida
                      </p>
                      <p className="text-xs sm:text-sm font-extrabold">
                        Dinner Buffet Surplus • 45 Servings Saved
                      </p>
                    </div>
                  </div>
                </div>

                {/* Floating AI Surplus Insight UI Mockup Card */}
                <div className="mt-4 p-4 rounded-2xl glass-card border border-brand-200/80 shadow-soft-lg transition-transform hover:scale-[1.01]">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-brand-700 font-extrabold text-xs">
                      <Bot className="w-4 h-4 text-brand-600" />
                      <span>AI Surplus Insight</span>
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-brand-100 text-brand-800">
                      UI Mockup
                    </span>
                  </div>
                  <p className="text-xs text-charcoal-800 leading-relaxed font-semibold">
                    "Based on today's activity, your kitchen may have{" "}
                    <strong className="text-brand-700">18–25 meals</strong> of
                    surplus by 8:00 PM."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. IMPACT STATISTICS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-6 sm:p-12 border border-charcoal-100 shadow-soft-sm">
          <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-brand-600 mb-2">
              Measurable Platform Impact
            </h2>
            <p className="text-xl sm:text-3xl font-extrabold text-charcoal-900 tracking-tight">
              Real results across Noida & Delhi NCR
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {impactMetrics.map((stat, idx) => (
              <StatCard
                key={idx}
                title={stat.label}
                value={stat.value}
                icon={stat.icon}
                helperText={stat.helper}
                className="bg-surface-50 border-charcoal-100 hover:border-brand-200"
              />
            ))}
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS TIMELINE SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
          <Badge status="Verified" className="mb-3">
            Simplicity First
          </Badge>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-charcoal-900 tracking-tight">
            How RePlate Recovers Food
          </h2>
          <p className="text-charcoal-600 mt-2 text-xs sm:text-base">
            From surplus identification to recipient distribution in 4 seamless
            steps.
          </p>
        </div>

        {/* Desktop Horizontal Timeline */}
        <div className="hidden lg:grid grid-cols-4 gap-6 relative">
          <div className="absolute top-10 left-12 right-12 h-0.5 bg-charcoal-200 -z-10" />

          {howItWorksSteps.map((item, idx) => (
            <Card
              key={idx}
              variant="default"
              className="relative flex flex-col h-full hover:border-brand-300"
            >
              <div className="w-12 h-12 rounded-2xl bg-brand-600 text-white font-black text-lg flex items-center justify-center mb-4 shadow-soft-xs">
                {item.step}
              </div>
              <Card.Title className="text-base">{item.title}</Card.Title>
              <Card.Description className="mt-2 text-xs leading-relaxed">
                {item.desc}
              </Card.Description>
            </Card>
          ))}
        </div>

        {/* Mobile Vertical Timeline */}
        <div className="lg:hidden space-y-4">
          {howItWorksSteps.map((item, idx) => (
            <div
              key={idx}
              className="flex gap-4 p-5 bg-white rounded-2xl border border-charcoal-100 shadow-soft-xs"
            >
              <div className="w-10 h-10 rounded-xl bg-brand-600 text-white font-bold text-sm flex items-center justify-center shrink-0">
                {item.step}
              </div>
              <div>
                <h3 className="font-bold text-charcoal-900 text-sm">
                  {item.title}
                </h3>
                <p className="text-xs text-charcoal-600 mt-1 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. FOR BUSINESS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-charcoal-950 via-charcoal-900 to-charcoal-950 rounded-3xl p-6 sm:p-14 text-white">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            <div className="lg:col-span-5 space-y-5 text-center lg:text-left">
              <span className="text-xs font-extrabold uppercase tracking-widest text-brand-400">
                Commercial Partners
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
                Your surplus shouldn't become your loss.
              </h2>
              <p className="text-charcoal-300 text-xs sm:text-sm leading-relaxed max-w-lg mx-auto lg:mx-0">
                Empower your culinary and operations team with software tools
                that streamline food recovery, optimize prep forecasts, and
                reduce waste disposal costs.
              </p>
              <Link to="/signup" className="inline-block pt-2">
                <Button variant="primary" size="lg" iconRight={ArrowRight}>
                  Start Saving Food
                </Button>
              </Link>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {businessFeatures.map((feat, idx) => (
                <div
                  key={idx}
                  className="p-5 sm:p-6 rounded-2xl bg-charcoal-900/80 border border-charcoal-800 hover:border-brand-500/50 transition-colors"
                >
                  <feat.icon className="w-7 h-7 sm:w-8 sm:h-8 text-brand-400 mb-3" />
                  <h3 className="font-bold text-sm sm:text-base text-white mb-1">
                    {feat.title}
                  </h3>
                  <p className="text-xs text-charcoal-400 leading-relaxed">
                    {feat.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 5. FOR RECIPIENTS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
          <Badge status="Verified" className="mb-3">
            Verified Recipient Network
          </Badge>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-charcoal-900 tracking-tight">
            Reliable Surplus Access for NGOs
          </h2>
          <p className="text-charcoal-600 mt-2 text-xs sm:text-base">
            Connecting community kitchens, shelters, and distribution networks
            with surplus meals.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
          {recipientFeatures.map((item, idx) => (
            <Card
              key={idx}
              variant="default"
              className="hover:border-brand-200"
            >
              <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-3">
                <item.icon className="w-5 h-5" />
              </div>
              <Card.Title className="text-base">{item.title}</Card.Title>
              <Card.Description className="mt-1 text-xs leading-relaxed">
                {item.desc}
              </Card.Description>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Link to="/food">
            <Button size="lg" variant="primary" iconRight={ArrowRight}>
              Find Surplus Food
            </Button>
          </Link>
        </div>
      </section>

      {/* 6. AI FORECAST PREVIEW SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-surface-100 rounded-3xl p-6 sm:p-12 border border-charcoal-200">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 items-center">
            <div className="lg:col-span-6 space-y-4 text-center lg:text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-100 text-brand-800 text-xs font-bold">
                <Bot className="w-4 h-4 text-brand-600" />
                <span>Predictive Surplus Analytics</span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-extrabold text-charcoal-900 tracking-tight">
                RePlate learns before food becomes waste.
              </h2>

              <p className="text-charcoal-600 text-xs sm:text-sm leading-relaxed max-w-lg mx-auto lg:mx-0">
                Our machine learning models analyze historical prep logs,
                occupancy, weather patterns, and event schedules to help
                kitchens adjust prep volumes before food is cooked.
              </p>

              <div className="pt-2">
                <span className="inline-block px-3 py-1.5 rounded-xl bg-charcoal-900 text-white text-xs font-semibold">
                  AI-powered forecasting — Coming Soon
                </span>
              </div>
            </div>

            {/* Tomorrow's Forecast UI Dashboard Mockup */}
            <div className="lg:col-span-6 hover-3d-mild">
              <Card
                variant="glass"
                className="border-brand-200 shadow-soft-xl p-5 sm:p-6"
              >
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-charcoal-100">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-brand-600" />
                    <h3 className="font-bold text-charcoal-900 text-sm">
                      Tomorrow's Forecast
                    </h3>
                  </div>
                  <span className="text-[10px] sm:text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-brand-100 text-brand-800">
                    Confidence: 87%
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between items-center p-3 bg-white rounded-xl border border-charcoal-100">
                    <span className="text-charcoal-600 font-medium">
                      Expected Surplus:
                    </span>
                    <span className="font-extrabold text-charcoal-900 text-sm">
                      24–31 meals
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-white rounded-xl border border-charcoal-100">
                    <span className="text-charcoal-600 font-medium">
                      Likely Surplus Category:
                    </span>
                    <span className="font-bold text-brand-700">
                      Prepared meals (Buffet)
                    </span>
                  </div>

                  <div className="p-4 bg-brand-50 border border-brand-200 rounded-xl">
                    <p className="font-bold text-brand-900 mb-1">
                      Recommended Action:
                    </p>
                    <p className="text-brand-800 font-medium leading-relaxed">
                      Reduce preparation volume by <strong>12%</strong> for
                      lunch buffet service to optimize food yield.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FINAL CALL TO ACTION BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-brand-700 via-brand-600 to-emerald-700 rounded-3xl p-8 sm:p-16 text-white text-center shadow-soft-xl">
          <h2 className="text-2xl sm:text-5xl font-black tracking-tight mb-4">
            Ready to give good food another plate?
          </h2>
          <p className="text-brand-100 max-w-xl mx-auto text-xs sm:text-lg mb-8 font-medium">
            Join leading hotels, restaurants, bakeries, and NGOs in Noida /
            Delhi NCR building a zero-food-waste ecosystem.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/signup" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="secondary"
                iconRight={ArrowRight}
                fullWidth
              >
                Register Your Organization
              </Button>
            </Link>
            <Link to="/food" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                fullWidth
                className="bg-white/10 text-white border-white/30 hover:bg-white/20"
              >
                Browse Surplus Listings
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
