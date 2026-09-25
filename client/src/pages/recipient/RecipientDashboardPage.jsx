import { ImpactWidget, RewardsPanel } from '../../components/dashboard';
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  HeartHandshake,
  Utensils,
  MapPin,
  Clock,
  CheckCircle2,
  QrCode,
  ArrowRight,
  ShieldCheck,
  Building2,
  RefreshCw,
  FileText,
} from "lucide-react";

import DashboardLayout from "../../components/layout/DashboardLayout";
import {
  StatCard,
  Card,
  Badge,
  Button,
  LoadingSpinner,
  EmptyState,
} from "../../components/common";
import FoodCard from "../../components/food/FoodCard";
import ReservationCard from "../../components/reservation/ReservationCard";
import {
  DailySurplusChart,
  WasteReductionChart,
} from "../../components/dashboard";

import { reservationService } from "../../services/reservationService";
import { foodService } from "../../services/foodService";
import { analyticsService } from "../../services/analyticsService";
import { useAuth } from "../../context/AuthContext";

const RecipientDashboardPage = () => {
  const { currentUser, mongoUser } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [availableFood, setAvailableFood] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Analytics & Timeframe state
  const [timeframe, setTimeframe] = useState("30d");
  const [analytics, setAnalytics] = useState(null);
  const [dailyTrends, setDailyTrends] = useState([]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      try {
        const resData = await reservationService.getMyReservations();
        if (resData && resData.reservations) {
          setReservations(resData.reservations);
        }
      } catch (err) {
        console.warn(
          "API reservations fetch failed, using empty array or fallback:",
          err.message,
        );
      }

      try {
        const foodData = await foodService.getFoods({ status: "AVAILABLE" });
        const items = foodData?.foods || foodData?.food || [];
        setAvailableFood(items.slice(0, 3));
      } catch (err) {
        console.warn("API food fetch failed:", err.message);
        setAvailableFood([]);
      }

      try {
        const analyticsRes =
          await analyticsService.getRecipientAnalytics(timeframe);
        if (analyticsRes && analyticsRes.metrics) {
          setAnalytics(analyticsRes.metrics);
          setDailyTrends(analyticsRes.dailyTrends || []);
        }
      } catch (err) {
        console.warn("Recipient analytics fetch failed:", err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [timeframe]);

  const handleCancelReservation = async (reservationId) => {
    if (
      !window.confirm("Are you sure you want to cancel this food reservation?")
    )
      return;
    setActionLoadingId(reservationId);
    try {
      await reservationService.cancelReservation(reservationId);
      await fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to cancel reservation");
    } finally {
      setActionLoadingId(null);
    }
  };

  const activeClaims = reservations.filter((r) =>
    ["PENDING", "CONFIRMED", "READY_FOR_PICKUP"].includes(
      r.status?.toUpperCase(),
    ),
  );
  const nextPickup = activeClaims[0];

  const totalMealsReceived = reservations
    .filter((r) => r.status?.toUpperCase() === "COMPLETED")
    .reduce((sum, r) => sum + (r.quantity || 1), 0);

  const totalCostSaved = reservations.reduce(
    (sum, r) => sum + (r.totalPrice || 0),
    0,
  );

  return (
    <DashboardLayout title="Recipient NGO Console">
      <div className="space-y-8">
        <ImpactWidget />
        <RewardsPanel userRole="NGO" credits={currentUser?.impactCredits || 0} level={currentUser?.rewardLevel || "NEW"} />
        {/* Header Greeting & Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-charcoal-900 tracking-tight">
              {mongoUser?.organizationName || currentUser?.name || "Verified Recipient Partner"}
            </h2>
            <p className="text-xs text-charcoal-500 mt-0.5">
              Verified Recipient • {mongoUser?.location?.city || "Noida"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              iconLeft={RefreshCw}
              onClick={fetchDashboardData}
              disabled={loading}
            >
              Refresh
            </Button>
            <Link to="/recipient/reservations">
              <Button variant="outline" size="sm" iconLeft={FileText}>
                View My Reservations
              </Button>
            </Link>
            <Link to="/food">
              <Button variant="primary" iconRight={ArrowRight}>
                Browse Marketplace
              </Button>
            </Link>
          </div>
        </div>

        {/* 1. SAVED FOOD METRICS & TIMEFRAME SELECTOR */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-charcoal-500">
              Impact & Claim Overview
            </h3>
            {/* Timeframe Filter Selector */}
            <div className="flex items-center gap-1 bg-surface-100 p-1 rounded-xl border border-charcoal-200 text-xs font-semibold self-start sm:self-auto">
              <span className="text-charcoal-400 text-[10px] uppercase font-extrabold px-2">
                Period:
              </span>
              {[
                { id: "7d", label: "7 Days" },
                { id: "30d", label: "30 Days" },
                { id: "90d", label: "90 Days" },
                { id: "all", label: "All Time" },
              ].map((tf) => (
                <button
                  key={tf.id}
                  onClick={() => setTimeframe(tf.id)}
                  className={`px-2.5 py-1 rounded-lg transition-all text-xs ${
                    timeframe === tf.id
                      ? "bg-brand-600 text-white shadow-soft-xs font-extrabold"
                      : "text-charcoal-600 hover:text-charcoal-900"
                  }`}
                >
                  {tf.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Meals Received"
              value={String(
                analytics?.totalQuantityRescued ?? totalMealsReceived,
              )}
              change={`Timeframe: ${timeframe}`}
              changeDirection="up"
              icon={Utensils}
              helperText="Distributed to community"
            />
            <StatCard
              title="Active Claims"
              value={String(activeClaims.length)}
              change="Scheduled today"
              changeDirection="neutral"
              icon={HeartHandshake}
              helperText="Ready for pickup"
            />
            <StatCard
              title="Food Cost Saved"
              value={`₹${(analytics?.totalValueSaved ?? totalCostSaved).toLocaleString()}`}
              change="Community impact"
              changeDirection="up"
              icon={ShieldCheck}
              helperText="Saved from food budget"
            />
            <StatCard
              title="Completed Pickups"
              value={String(analytics?.completedReservations ?? 0)}
              change="Fulfillments"
              changeDirection="neutral"
              icon={CheckCircle2}
              helperText="Successful distributions"
            />
          </div>
        </div>

        {/* 2. RECIPIENT IMPACT & TREND CHARTS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DailySurplusChart
            title="Meals Rescued Over Time"
            data={
              dailyTrends.length > 0
                ? dailyTrends.map((t) => ({
                    day: t._id ? t._id.slice(5) : "Day",
                    kg: Number((t.meals * 0.4).toFixed(1)),
                    meals: t.meals,
                  }))
                : undefined
            }
          />
          <WasteReductionChart
            title="NGO Environmental Offset"
            valueKg={Number(
              ((analytics?.totalQuantityRescued || 0) * 0.4).toFixed(1),
            )}
          />
        </div>

        {/* 2. PICKUP REMINDERS BANNER */}
        {nextPickup ? (
          <Card variant="default" className="bg-brand-50 border-brand-200 p-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-brand-900 text-sm">
                    Active Pickup Reminder: ({nextPickup.claimCode})
                  </h3>
                  <p className="text-xs text-brand-800 mt-0.5">
                    {nextPickup.foodId?.name || "Surplus Meal Listing"} •{" "}
                    {nextPickup.quantity}{" "}
                    {nextPickup.foodId?.quantityUnit || "servings"} •{" "}
                    {nextPickup.pickupTime || "Today before 8:30 PM"}
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant="primary"
                iconLeft={QrCode}
                onClick={() =>
                  alert(`Verification Claim Code: ${nextPickup.claimCode}`)
                }
              >
                Show Verification Code
              </Button>
            </div>
          </Card>
        ) : (
          <Card
            variant="default"
            className="bg-surface-50 border-charcoal-200 p-4 text-xs text-charcoal-600 flex items-center justify-between"
          >
            <span>
              No active pickups pending right now. Browse marketplace to claim
              surplus food!
            </span>
            <Link to="/food">
              <Button size="sm" variant="outline">
                Find Surplus Food
              </Button>
            </Link>
          </Card>
        )}

        {/* 3. ACTIVE & PAST RESERVATIONS CARDS */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-extrabold text-charcoal-900 tracking-tight">
                My Food Claims & Reservations
              </h3>
              <p className="text-xs text-charcoal-500">
                Live claim records and verification status
              </p>
            </div>
          </div>

          {loading ? (
            <div className="py-12 flex justify-center">
              <LoadingSpinner size="md" text="Loading active claims..." />
            </div>
          ) : reservations.length === 0 ? (
            <EmptyState
              title="No claims yet"
              message="You haven't reserved any surplus food listings yet."
              actionLabel="Browse Surplus Marketplace"
              onAction={() => (window.location.href = "/food")}
            />
          ) : (
            <div className="space-y-4">
              {reservations.map((res) => (
                <ReservationCard
                  key={res._id || res.id}
                  reservation={res}
                  userRole="RECIPIENT"
                  onCancel={handleCancelReservation}
                  isUpdating={actionLoadingId === res._id}
                />
              ))}
            </div>
          )}
        </div>

        {/* 4. AVAILABLE NEARBY FOOD GRID */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-extrabold text-charcoal-900 tracking-tight">
                Available Surplus Nearby
              </h3>
              <p className="text-xs text-charcoal-500">
                Commercial surplus listings available in Noida
              </p>
            </div>
            <Link to="/food">
              <Button size="sm" variant="ghost" iconRight={ArrowRight}>
                View All Marketplace
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {availableFood.map((item) => (
              <FoodCard key={item._id || item.id} food={item} />
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default RecipientDashboardPage;
